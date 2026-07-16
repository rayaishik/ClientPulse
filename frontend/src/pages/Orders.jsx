import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Orders({ user }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Form inputs
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [orderItems, setOrderItems] = useState([{ PID: '', Qty: 1 }]);
  const [payMethod, setPayMethod] = useState(''); // UPI, Card, Cash, or empty for Unpaid
  const [errorMsg, setErrorMsg] = useState('');

  const navigate = useNavigate();

  const fetchOrders = () => {
    setLoading(true);
    fetch('/api/orders')
      .then((res) => res.json())
      .then((data) => {
        setOrders(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleOpenCreateModal = async () => {
    setErrorMsg('');
    setSelectedCustomerId('');
    setOrderItems([{ PID: '', Qty: 1 }]);
    setPayMethod('');
    
    // Fetch customers and products for selection dropdowns
    try {
      const resCust = await fetch('/api/customers');
      const dataCust = await resCust.json();
      setCustomers(dataCust);

      const resProd = await fetch('/api/products');
      const dataProd = await resProd.json();
      setProducts(dataProd);

      setModalOpen(true);
    } catch (err) {
      console.error('Error fetching customers/products for modal:', err);
    }
  };

  const handleAddItemRow = () => {
    setOrderItems([...orderItems, { PID: '', Qty: 1 }]);
  };

  const handleRemoveItemRow = (idx) => {
    const nextItems = orderItems.filter((_, i) => i !== idx);
    setOrderItems(nextItems.length > 0 ? nextItems : [{ PID: '', Qty: 1 }]);
  };

  const handleItemChange = (idx, field, val) => {
    const nextItems = [...orderItems];
    nextItems[idx][field] = val;
    setOrderItems(nextItems);
  };

  const calculateTotal = () => {
    let total = 0;
    orderItems.forEach((item) => {
      const prod = products.find((p) => p.PID === item.PID);
      if (prod) {
        total += prod.Price * parseInt(item.Qty || 0, 10);
      }
    });
    return total;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Validations
    if (!selectedCustomerId) {
      setErrorMsg('Please select a customer.');
      return;
    }

    const invalidItem = orderItems.find(item => !item.PID || item.Qty <= 0);
    if (invalidItem) {
      setErrorMsg('Please select a valid product and positive quantity for all items.');
      return;
    }

    // Stock checks
    for (const item of orderItems) {
      const prod = products.find(p => p.PID === item.PID);
      if (prod && prod.Stock < item.Qty) {
        setErrorMsg(`Product ${prod.PName} only has ${prod.Stock} items in stock.`);
        return;
      }
    }

    const payload = {
      CID: selectedCustomerId,
      items: orderItems.map(item => ({ PID: item.PID, Qty: parseInt(item.Qty, 10) })),
      PayMethod: payMethod || null
    };

    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to create order');
        return data;
      })
      .then(() => {
        setModalOpen(false);
        fetchOrders();
      })
      .catch((err) => {
        setErrorMsg(err.message);
      });
  };

  return (
    <div className="flex flex-col gap-lg pb-10">
      {/* Action Bar */}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-body-sm text-on-surface-variant">List of all customer invoices and transaction records.</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-[#00a896] hover:from-[#45e0c8] hover:to-[#008f7f] text-[#003731] font-label-md text-label-md px-6 py-2.5 rounded-lg shadow-[0_4px_14px_rgba(87,241,219,0.25)] hover:shadow-[0_6px_20px_rgba(87,241,219,0.4)] transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer border-none"
        >
          <span className="material-symbols-outlined text-sm font-bold">add</span>
          Create Order
        </button>
      </div>

      {/* Orders Table Panel */}
      <div className="glass-panel rounded-xl overflow-hidden flex flex-col flex-1 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-b border-white/10 bg-surface-container-high/30">
                <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">OID</th>
                <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Customer Name</th>
                <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Order Date</th>
                <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Total Amount</th>
                <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="font-body-sm text-body-sm text-on-surface divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-8">
                    <span className="w-6 h-6 inline-block border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-on-surface-variant">
                    No orders recorded in database.
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr
                    key={o.OID}
                    onClick={() => navigate(`/orders/${o.OID}`)}
                    className="glass-table-row group cursor-pointer"
                  >
                    <td className="px-6 py-4 font-mono text-primary font-bold">{o.OID}</td>
                    <td className="px-6 py-4 font-medium text-on-surface">{o.CustomerName}</td>
                    <td className="px-6 py-4 text-on-surface-variant">{o.ODt}</td>
                    <td className="px-6 py-4 font-semibold text-tertiary">₹{o.TotalAmt.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        o.Status === 'Completed'
                          ? 'bg-primary/20 text-primary border border-primary/30'
                          : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      }`}>
                        {o.Status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-primary hover:underline text-xs inline-flex items-center gap-1 font-semibold">
                        View Details
                        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Order Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-panel-elevated rounded-2xl w-full max-w-2xl p-lg flex flex-col gap-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
                Create New Order
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface cursor-pointer border-none bg-transparent"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-error/20 border border-error/50 rounded-lg text-error text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-md">
              {/* Select Customer */}
              <div className="flex flex-col gap-xs">
                <label className="font-label-sm text-label-sm text-on-surface-variant">Select Customer</label>
                <select
                  required
                  className="input-glass rounded-lg px-3 py-2 text-body-sm text-on-surface bg-[#0d1c2d] border border-white/10 w-full"
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                >
                  <option value="">-- Choose Customer --</option>
                  {customers.map((c) => (
                    <option key={c.CID} value={c.CID}>
                      {c.Name} ({c.CID} - {c.CustomerType})
                    </option>
                  ))}
                </select>
              </div>

              {/* Items List */}
              <div className="flex flex-col gap-sm">
                <div className="flex justify-between items-center">
                  <label className="font-label-sm text-label-sm text-on-surface-variant">Order Items</label>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="text-xs text-primary hover:underline flex items-center gap-1 cursor-pointer bg-transparent border-none"
                  >
                    <span className="material-symbols-outlined text-xs">add</span> Add Item Row
                  </button>
                </div>

                {orderItems.map((item, idx) => {
                  const prodSelected = products.find(p => p.PID === item.PID);

                  return (
                    <div key={idx} className="flex gap-sm items-end bg-white/5 p-3 rounded-lg border border-white/5">
                      {/* Product Selector */}
                      <div className="flex-1 flex flex-col gap-xs">
                        <label className="text-[10px] text-on-surface-variant font-label-sm uppercase">Product</label>
                        <select
                          required
                          className="input-glass rounded-lg px-3 py-1.5 text-body-sm text-on-surface bg-[#0d1c2d] border border-white/10 w-full"
                          value={item.PID}
                          onChange={(e) => handleItemChange(idx, 'PID', e.target.value)}
                        >
                          <option value="">-- Choose Product --</option>
                          {products.map((p) => (
                            <option key={p.PID} value={p.PID}>
                              {p.PName} (₹{p.Price.toLocaleString()} | Stock: {p.Stock})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Qty Input */}
                      <div className="w-24 flex flex-col gap-xs">
                        <label className="text-[10px] text-on-surface-variant font-label-sm uppercase">Qty</label>
                        <input
                          type="number"
                          min="1"
                          required
                          className="input-glass rounded-lg px-3 py-1 text-body-sm text-on-surface"
                          value={item.Qty}
                          onChange={(e) => handleItemChange(idx, 'Qty', parseInt(e.target.value, 10))}
                        />
                      </div>

                      {/* Subtotal preview */}
                      <div className="w-24 text-right pr-2">
                        <span className="text-[10px] text-on-surface-variant block uppercase font-label-sm">Subtotal</span>
                        <span className="text-body-sm font-semibold text-primary">
                          ₹{prodSelected ? (prodSelected.Price * (item.Qty || 0)).toLocaleString() : '0'}
                        </span>
                      </div>

                      {/* Delete item row */}
                      <button
                        type="button"
                        onClick={() => handleRemoveItemRow(idx)}
                        className="text-on-surface-variant hover:text-error hover:bg-error/10 p-1.5 rounded transition-colors cursor-pointer border-none bg-transparent"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Record Payment Options */}
              <div className="flex flex-col gap-xs mt-sm">
                <label className="font-label-sm text-label-sm text-on-surface-variant">Payment Status / Method</label>
                <select
                  className="input-glass rounded-lg px-3 py-2 text-body-sm text-on-surface bg-[#0d1c2d] border border-white/10 w-full"
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                >
                  <option value="">Leave Unpaid (Creates Pending Order)</option>
                  <option value="UPI">Pay Immediately - UPI (Creates Completed Order)</option>
                  <option value="Card">Pay Immediately - Credit/Debit Card (Creates Completed Order)</option>
                  <option value="Cash">Pay Immediately - Cash (Creates Completed Order)</option>
                </select>
              </div>

              {/* Order summary */}
              <div className="border-t border-white/10 pt-lg mt-md flex justify-between items-center">
                <div>
                  <span className="text-xs text-on-surface-variant uppercase font-label-sm">Grand Total Amount</span>
                  <p className="text-2xl font-bold text-primary">₹{calculateTotal().toLocaleString()}</p>
                </div>
                <div className="flex gap-sm">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 border border-white/10 rounded-lg text-body-sm text-on-surface-variant hover:text-on-surface hover:bg-white/5 cursor-pointer bg-transparent"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary px-6 py-2 rounded-lg text-body-sm font-label-sm cursor-pointer border-none"
                  >
                    Save & Place Order
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
