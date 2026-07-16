const assert = require('assert');

async function runRbacTests() {
  console.log('=== Starting Programmatic RBAC & API Verification ===');
  const baseUrl = 'http://localhost:5000/api';

  const employeeHeaders = {
    'Content-Type': 'application/json',
    'x-user-role': 'Employee',
    'x-user-eid': 'E002' // Souvik Dey
  };

  const adminHeaders = {
    'Content-Type': 'application/json',
    'x-user-role': 'Admin',
    'x-user-eid': 'E001' // Ananya Bose
  };

  // 1. Check Employee Profile Endpoint
  console.log('\nTesting Employee Self Profile (GET /api/employees/me)...');
  const profileRes = await fetch(`${baseUrl}/employees/me`, { headers: employeeHeaders });
  assert.strictEqual(profileRes.status, 200);
  const profileData = await profileRes.json();
  console.log('Self Profile:', profileData);
  assert.strictEqual(profileData.EID, 'E002');
  assert.strictEqual(profileData.Name, 'Souvik Dey');
  assert.strictEqual(profileData.Designation, 'Support Executive');
  assert.ok(profileData.AssignedTickets !== undefined);
  assert.ok(profileData.ResolvedTickets !== undefined);
  console.log('✔ Self Profile verified.');

  // 2. Check Employee Access Restrictions (Expect 403 Forbidden)
  const forbiddenRequests = [
    { name: 'Delete Customer', url: `${baseUrl}/customers/C001`, method: 'DELETE' },
    { name: 'Add Product', url: `${baseUrl}/products`, method: 'POST', body: { PName: 'Keyboard Light', Category: 'Accessories', Price: 500, Stock: 10 } },
    { name: 'Update Stock', url: `${baseUrl}/products/P001/stock`, method: 'PATCH', body: { Stock: 50 } },
    { name: 'Delete Product', url: `${baseUrl}/products/P001`, method: 'DELETE' },
    { name: 'List All Employees', url: `${baseUrl}/employees`, method: 'GET' },
    { name: 'Delete Employee', url: `${baseUrl}/employees/E003`, method: 'DELETE' },
    { name: 'Activity Log', url: `${baseUrl}/activity-log`, method: 'GET' },
    { name: 'Reports', url: `${baseUrl}/reports`, method: 'GET' }
  ];

  console.log('\nVerifying 403 Forbidden status for restricted Employee actions...');
  for (const r of forbiddenRequests) {
    const res = await fetch(r.url, {
      method: r.method,
      headers: employeeHeaders,
      body: r.body ? JSON.stringify(r.body) : undefined
    });
    console.log(`Action: ${r.name} -> Status: ${res.status}`);
    assert.strictEqual(res.status, 403, `Expected 403 for ${r.name}`);
  }
  console.log('✔ Restricted actions correctly blocked with 403 Forbidden.');

  // 3. Check Admin Access to Same Restricted Endpoints (Expect Success/200/201)
  console.log('\nVerifying Admin access to list employees, reports, and activity logs...');
  
  const empListRes = await fetch(`${baseUrl}/employees`, { headers: adminHeaders });
  assert.strictEqual(empListRes.status, 200, 'Admin should list employees');
  
  const reportsRes = await fetch(`${baseUrl}/reports`, { headers: adminHeaders });
  assert.strictEqual(reportsRes.status, 200, 'Admin should view reports');
  
  const auditRes = await fetch(`${baseUrl}/activity-log`, { headers: adminHeaders });
  assert.strictEqual(auditRes.status, 200, 'Admin should view activity log');
  
  console.log('✔ Admin permissions verified.');

  // 4. Check Employee-specific Dashboard
  console.log('\nTesting Employee Dashboard (GET /api/dashboard)...');
  const dashRes = await fetch(`${baseUrl}/dashboard`, { headers: employeeHeaders });
  assert.strictEqual(dashRes.status, 200);
  const dashData = await dashRes.json();
  console.log('Employee Dashboard Stats:', dashData.stats);
  assert.strictEqual(dashData.role, 'Employee');
  assert.ok(dashData.stats.totalCustomers !== undefined);
  assert.ok(dashData.stats.totalOrders !== undefined);
  assert.ok(dashData.stats.assignedTickets !== undefined);
  assert.ok(dashData.stats.openTickets !== undefined);
  assert.ok(dashData.stats.resolvedTickets !== undefined);
  assert.ok(dashData.latestCustomers !== undefined);
  assert.ok(dashData.recentOrders !== undefined);
  assert.ok(dashData.myTickets !== undefined);
  assert.ok(dashData.stats.totalRevenue === undefined, 'Revenue should not be visible to employees');
  console.log('✔ Employee Dashboard statistics verified.');

  // 5. Test Support Ticket Assignment Restrictions and Transitions for Employee
  console.log('\nTesting Support Tickets filtering and validations...');
  
  // Verify tickets are filtered
  const ticketsRes = await fetch(`${baseUrl}/tickets`, { headers: employeeHeaders });
  const ticketsData = await ticketsRes.json();
  console.log(`Employee E002 tickets count: ${ticketsData.length}`);
  assert.ok(ticketsData.every(t => t.EID === 'E002'), 'Employee should only see tickets assigned to them');

  // Verify transition flow checks on PUT /api/tickets/:id
  // T002 is assigned to E002 and currently has status 'Open'
  // Employee tries to change status to 'Resolved' directly (should fail 400 because Open can only go to In Progress)
  console.log('Testing invalid ticket status jump (Open -> Resolved)...');
  const invalidStatusRes = await fetch(`${baseUrl}/tickets/T002`, {
    method: 'PUT',
    headers: employeeHeaders,
    body: JSON.stringify({ Status: 'Resolved' })
  });
  console.log(`Transition response status: ${invalidStatusRes.status}`);
  assert.strictEqual(invalidStatusRes.status, 400, 'Status transition jump should be rejected with 400');
  const invalidStatusError = await invalidStatusRes.json();
  console.log('Error message:', invalidStatusError.error);

  // Employee tries to change status to 'In Progress' (should succeed 200)
  console.log('Testing valid ticket status transition (Open -> In Progress)...');
  const validStatusRes = await fetch(`${baseUrl}/tickets/T002`, {
    method: 'PUT',
    headers: employeeHeaders,
    body: JSON.stringify({ Status: 'In Progress' })
  });
  console.log(`Transition response status: ${validStatusRes.status}`);
  assert.strictEqual(validStatusRes.status, 200);
  const updatedTicket = await validStatusRes.json();
  assert.strictEqual(updatedTicket.Status, 'In Progress');

  // Employee tries to change assignee to E003 (should fail 403)
  console.log('Testing assignee modification block...');
  const invalidAssigneeRes = await fetch(`${baseUrl}/tickets/T002`, {
    method: 'PUT',
    headers: employeeHeaders,
    body: JSON.stringify({ EID: 'E003' })
  });
  console.log(`Assignee modification response status: ${invalidAssigneeRes.status}`);
  assert.strictEqual(invalidAssigneeRes.status, 403, 'Assignee edits by Employee should be forbidden with 403');

  console.log('✔ Support ticket validations verified successfully.');

  console.log('\n=== All RBAC & Endpoint Security Checks Passed Successfully! ===');
}

runRbacTests().catch(err => {
  console.error('\n❌ RBAC Test Failure:', err);
  process.exit(1);
});
