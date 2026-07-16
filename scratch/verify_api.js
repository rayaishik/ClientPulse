const assert = require('assert');

async function runTests() {
  console.log('=== Starting Programmatic API Verification ===');
  const baseUrl = 'http://localhost:5000/api';

  // 1. Verify Initial Dashboard Overview Stats
  console.log('\nChecking initial dashboard stats...');
  const dashRes = await fetch(`${baseUrl}/dashboard`);
  assert.strictEqual(dashRes.status, 200, 'Dashboard request failed');
  const dashData = await dashRes.json();
  console.log('Initial stats:', dashData.stats);
  assert.strictEqual(dashData.stats.totalCustomers, 7, 'Expected 7 customers');
  assert.strictEqual(dashData.stats.totalOrders, 7, 'Expected 7 orders');
  assert.strictEqual(dashData.stats.totalRevenue, 99800, 'Expected ₹99,800 revenue');
  assert.strictEqual(dashData.stats.productsAvailable, 7, 'Expected 7 products');
  assert.strictEqual(dashData.stats.pendingTickets, 2, 'Expected 2 pending tickets (T002, T005)');
  console.log('✔ Initial dashboard stats verified successfully.');

  // 2. Verify Universal Search API
  console.log('\nTesting universal search for "Amit"...');
  const searchRes = await fetch(`${baseUrl}/search?q=Amit`);
  assert.strictEqual(searchRes.status, 200);
  const searchData = await searchRes.json();
  console.log('Search matches:', searchData);
  assert.ok(searchData.customers.some(c => c.Name === 'Amit Roy'), 'Amit Roy not found in search results');
  console.log('✔ Universal search verified successfully.');

  // 3. Verify Order Details & Feedback Isolation (F001 for O001, not F002 or F003)
  console.log('\nVerifying order details for O001...');
  const orderRes = await fetch(`${baseUrl}/orders/O001`);
  assert.strictEqual(orderRes.status, 200);
  const orderData = await orderRes.json();
  console.log('Order O001 data:', {
    order: orderData.order,
    items: orderData.items,
    feedback: orderData.feedback
  });
  assert.strictEqual(orderData.order.OID, 'O001');
  assert.strictEqual(orderData.items.length, 1);
  assert.strictEqual(orderData.items[0].PID, 'P001');
  assert.ok(orderData.feedback, 'Feedback not found for O001');
  assert.strictEqual(orderData.feedback.FID, 'F001', 'Feedback for O001 should be F001');
  assert.strictEqual(orderData.feedback.Rating, 5, 'F001 rating should be 5');
  assert.strictEqual(orderData.feedback.Comments, 'Excellent service and product');
  console.log('✔ Order O001 details and isolated feedback verified.');

  // 4. Place a new order for C004 (Sneha Sen) with P002 (Smartphone, price 25,000)
  console.log('\nPlacing a new order on behalf of Sneha Sen (C004)...');
  
  // Verify initial stock of P002
  const pListResBefore = await fetch(`${baseUrl}/products?search=P002`);
  const pListDataBefore = await pListResBefore.json();
  const initialStock = pListDataBefore.find(p => p.PID === 'P002').Stock;
  console.log(`Initial stock of P002: ${initialStock}`);

  const orderPayload = {
    CID: 'C004',
    items: [{ PID: 'P002', Qty: 1 }],
    PayMethod: 'UPI' // Immediate payment -> Completed order
  };

  const createOrderRes = await fetch(`${baseUrl}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderPayload)
  });
  assert.strictEqual(createOrderRes.status, 201, 'Failed to create order');
  const createdOrder = await createOrderRes.json();
  console.log('Created Order:', createdOrder);
  assert.strictEqual(createdOrder.CID, 'C004');
  assert.strictEqual(createdOrder.Status, 'Completed');
  assert.strictEqual(createdOrder.TotalAmt, 25000);

  // Verify stock decremented
  const pListResAfter = await fetch(`${baseUrl}/products?search=P002`);
  const pListDataAfter = await pListResAfter.json();
  const finalStock = pListDataAfter.find(p => p.PID === 'P002').Stock;
  console.log(`Stock of P002 after ordering: ${finalStock}`);
  assert.strictEqual(finalStock, initialStock - 1, 'Stock did not decrement by 1');
  console.log('✔ Stock decrement verified successfully.');

  // 5. Verify updated dashboard overview stats
  console.log('\nChecking dashboard stats after placing order...');
  const dashRes2 = await fetch(`${baseUrl}/dashboard`);
  const dashData2 = await dashRes2.json();
  console.log('Updated stats:', dashData2.stats);
  assert.strictEqual(dashData2.stats.totalOrders, 8, 'Expected 8 total orders');
  assert.strictEqual(dashData2.stats.totalRevenue, 124800, 'Expected ₹124,800 total revenue (99,800 + 25,000)');
  console.log('✔ Updated dashboard stats verified successfully.');

  // 6. Delete customer Vikram Singh (C007) and test trigger + cascade deletion
  console.log('\nDeleting customer Vikram Singh (C007)...');
  
  // Verify C007 has a support ticket T007 initially
  const ticketsResBefore = await fetch(`${baseUrl}/tickets`);
  const ticketsDataBefore = await ticketsResBefore.json();
  const hasTicketBefore = ticketsDataBefore.some(t => t.TicketID === 'T007');
  console.log(`Ticket T007 exists before deletion: ${hasTicketBefore}`);
  assert.ok(hasTicketBefore, 'Ticket T007 should exist before C007 deletion');

  const deleteRes = await fetch(`${baseUrl}/customers/C007`, {
    method: 'DELETE'
  });
  assert.strictEqual(deleteRes.status, 200, 'Failed to delete customer');
  console.log('Customer deletion response:', await deleteRes.json());

  // 7. Verify C007 deletion logged in Customer_Audit table
  console.log('\nChecking activity log for customer deletion...');
  const auditRes = await fetch(`${baseUrl}/activity-log`);
  const auditData = await auditRes.json();
  console.log('Activity log rows:', auditData);
  const deleteLog = auditData.find(log => log.CID === 'C007');
  assert.ok(deleteLog, 'Deletion log for C007 was not found in Customer_Audit');
  assert.strictEqual(deleteLog.Name, 'Vikram Singh', 'Audit log has incorrect name');
  console.log('✔ Deletion log trigger verified successfully.');

  // 8. Verify cascade deletion of support ticket T007
  console.log('\nVerifying cascade delete of support ticket T007...');
  const ticketsResAfter = await fetch(`${baseUrl}/tickets`);
  const ticketsDataAfter = await ticketsResAfter.json();
  const hasTicketAfter = ticketsDataAfter.some(t => t.TicketID === 'T007');
  console.log(`Ticket T007 exists after deletion: ${hasTicketAfter}`);
  assert.ok(!hasTicketAfter, 'Ticket T007 was not cascade deleted');
  console.log('✔ Cascade deletion of support ticket verified successfully.');

  // 9. Verify aggregate Reports API totals
  console.log('\nChecking analytical reports endpoint stats...');
  const reportsRes = await fetch(`${baseUrl}/reports`);
  const reportsData = await reportsRes.json();
  console.log('Reports analytics:', reportsData);
  assert.strictEqual(reportsData.totalRevenue, 124800, 'Expected reports total revenue to be ₹124,800');
  console.log('✔ Analytical reports verified successfully.');

  console.log('\n=== All API Programmatic Checks Passed Successfully! ===');
}

runTests().catch(err => {
  console.error('\n❌ Test Failure:', err);
  process.exit(1);
});
