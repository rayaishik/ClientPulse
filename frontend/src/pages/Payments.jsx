import React, { useEffect, useState } from 'react';

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [methodFilter, setMethodFilter] = useState('All Methods');
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [unpaidOrders, setUnpaidOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [amt, setAmt] = useState(0);
  const [payMethod, setPayMethod] = useState('UPI');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchPayments = () => {
    setLoading(true);
    let url = `/api/payments?method=${encodeURIComponent(methodFilter)}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setPayments(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPayments();
  }, [methodFilter]);

  const handleOpenRecordModal = async () => {
    setErrorMsg('');
    setSelectedOrderId('');
    setAmt(0);
    setPayMethod('UPI');

    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      // Filter out completed orders
      const pending = data.filter((o) => o.Status !== 'Completed');
      setUnpaidOrders(pending);
      setModalOpen(true);
    } catch (err) {
      console.error('Error fetching orders for payment modal:', err);
    }
  };

  const handleOrderChange = (oid) => {
    setSelectedOrderId(oid);
    const ord = unpaidOrders.find(o => o.OID === oid);
    if (ord) {
      setAmt(ord.TotalAmt); // Prefill with the order amount
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedOrderId) {
      setErrorMsg('Please select an order.');
      return;
    }
    if (amt <= 0) {
      setErrorMsg('Please enter a positive payment amount.');
      return;
    }

    const payload = {
      OID: selectedOrderId,
      Amt: parseFloat(amt),
      PayMethod: payMethod
    };

    fetch('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to record payment');
        return data;
      })
      .then(() => {
        setModalOpen(false);
        fetchPayments();
      })
      .catch((err) => {
        setErrorMsg(err.message);
      });
  };

  return (
    <div className="flex flex-col gap-lg pb-10">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          {/* Method Filter Dropdown */}
          <div className="relative inline-block text-left glass-panel rounded-lg w-full sm:w-auto z-20">
            <button
              onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
              className="inline-flex justify-between items-center w-full sm:w-48 px-4 py-2.5 text-body-sm font-body-sm text-on-surface hover:text-primary transition-colors focus:outline-none cursor-pointer"
              type="button"
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">filter_alt</span>
                <span>{methodFilter === 'All Methods' ? 'Payment Method' : methodFilter}</span>
              </div>
              <span className="material-symbols-outlined text-sm">expand_more</span>
            </button>
            
            {filterDropdownOpen && (
              <div className="origin-top-right absolute left-0 mt-2 w-48 rounded-lg shadow-xl glass-panel ring-1 ring-black ring-opacity-5 focus:outline-none z-30">
                <div className="py-1">
                  {['All Methods', 'UPI', 'Card', 'Cash'].map((m) => (
                    <button
                      key={m}
                      onClick={() => {
                        setMethodFilter(m);
                        setFilterDropdownOpen(false);
                      }}
                      className="w-full text-left text-on-surface block px-4 py-2 text-body-sm hover:bg-white/5 hover:text-primary transition-colors cursor-pointer border-none bg-transparent"
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Record Payment Button */}
        <button
          onClick={handleOpenRecordModal}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-[#00a896] hover:from-[#45e0c8] hover:to-[#008f7f] text-[#003731] font-label-md text-label-md px-6 py-2.5 rounded-lg shadow-[0_4px_14px_rgba(87,241,219,0.25)] hover:shadow-[0_6px_20px_rgba(87,241,219,0.4)] transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer border-none"
        >
          <span className="material-symbols-outlined text-sm font-bold">add_card</span>
          Record Payment
        </button>
      </div>

      {/* Payments History Table */}
      <div className="glass-panel rounded-xl overflow-hidden flex flex-col flex-1 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-b border-white/10 bg-surface-container-high/30">
                <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">PayID</th>
                <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">OrderID</th>
                <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Customer Name</th>
                <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Payment Date</th>
                <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Payment Method</th>
                <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">Amount Paid</th>
              </tr>
            </thead>
            <tbody className="font-body-sm text-body-sm text-on-surface divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-8">
                    <span className="w-6 h-6 inline-block border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-on-surface-variant">
                    No payment logs recorded.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.PayID} className="glass-table-row">
                    <td className="px-6 py-4 font-mono text-[#bcc7de]">{p.PayID}</td>
                    <td className="px-6 py-4 font-mono text-primary font-medium">{p.OID}</td>
                    <td className="px-6 py-4 font-medium">{p.CustomerName}</td>
                    <td className="px-6 py-4 text-on-surface-variant">{p.PayDt}</td>
                    <td className="px-6 py-4">
                      <span className="bg-surface-variant border border-white/10 text-on-surface-variant px-2.5 py-0.5 rounded text-xs">
                        {p.PayMethod}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-right text-primary">₹{p.Amt.toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-panel-elevated rounded-2xl w-full max-w-md p-lg flex flex-col gap-md">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
                Record Payment
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface cursor-pointer border-none bg-transparent"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {errorMsg && (
              <div className="p-2.5 bg-error/20 border border-error/50 rounded-lg text-error text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-md">
              <div className="flex flex-col gap-xs">
                <label className="font-label-sm text-label-sm text-on-surface-variant">Select Unpaid/Pending Order</label>
                <select
                  required
                  className="input-glass rounded-lg px-3 py-2 text-body-sm text-on-surface bg-[#0d1c2d] border border-white/10 w-full"
                  value={selectedOrderId}
                  onChange={(e) => handleOrderChange(e.target.value)}
                >
                  <option value="">-- Choose Order --</option>
                  {unpaidOrders.map((o) => (
                    <option key={o.OID} value={o.OID}>
                      Order {o.OID} - Customer: {o.CustomerName} (Total: ₹{o.TotalAmt.toLocaleString()})
                    </option>
                  ))}
                </select>
                {unpaidOrders.length === 0 && (
                  <span className="text-xs text-primary mt-1">All orders are fully paid.</span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-sm">
                <div className="flex flex-col gap-xs">
                  <label className="font-label-sm text-label-sm text-on-surface-variant">Amount (₹)</label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    required
                    className="input-glass rounded-lg px-3 py-2 text-body-sm text-on-surface"
                    value={amt}
                    onChange={(e) => setAmt(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-xs">
                  <label className="font-label-sm text-label-sm text-on-surface-variant">Method</label>
                  <select
                    className="input-glass rounded-lg px-3 py-2 text-body-sm text-on-surface bg-[#0d1c2d] border border-white/10"
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value)}
                  >
                    <option value="UPI">UPI</option>
                    <option value="Card">Card</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-sm justify-end">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-white/10 rounded-lg text-body-sm text-on-surface-variant hover:text-on-surface hover:bg-white/5 cursor-pointer bg-transparent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={unpaidOrders.length === 0}
                  className="btn-primary px-6 py-2 rounded-lg text-body-sm font-label-sm cursor-pointer border-none disabled:opacity-50"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
