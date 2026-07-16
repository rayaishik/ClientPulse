import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function OrderDetails() {
  const { id } = useParams();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add Feedback state
  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState('');
  const [fbError, setFbError] = useState('');

  const fetchOrderDetails = () => {
    setLoading(true);
    fetch(`/api/orders/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Order details not found');
        return res.json();
      })
      .then((data) => {
        setOrderData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    setFbError('');

    if (!comments.trim()) {
      setFbError('Please enter some comments.');
      return;
    }

    const payload = {
      Rating: parseFloat(rating),
      Comments: comments,
      CID: orderData.order.CID,
      OID: orderData.order.OID
    };

    fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to submit feedback');
        return data;
      })
      .then(() => {
        setComments('');
        fetchOrderDetails();
      })
      .catch((err) => {
        setFbError(err.message);
      });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <span className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-error/20 border border-error/50 rounded-lg text-error">
        Error: {error}
        <div className="mt-2">
          <Link to="/orders" className="text-xs text-primary hover:underline">
            &larr; Back to Orders Directory
          </Link>
        </div>
      </div>
    );
  }

  const { order, items, payments, feedback } = orderData;

  const totalPaid = payments.reduce((acc, p) => acc + p.Amt, 0);
  const remainingBal = order.TotalAmt - totalPaid;

  return (
    <div className="flex flex-col gap-lg pb-10">
      {/* Back Link */}
      <div>
        <Link to="/orders" className="inline-flex items-center gap-1 text-sm text-on-surface-variant hover:text-primary transition-colors">
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          <span>Back to Orders Directory</span>
        </Link>
      </div>

      {/* Invoice header info */}
      <div className="glass-panel rounded-xl p-6 border border-white/10 shadow-lg flex flex-col sm:flex-row justify-between gap-md relative overflow-hidden">
        <div className="flex flex-col gap-sm">
          <span className="text-xs text-primary uppercase font-mono tracking-widest">Customer Invoice</span>
          <h2 className="text-2xl font-bold text-on-surface">Order {order.OID}</h2>
          <div className="text-body-sm text-on-surface-variant flex flex-col gap-xs mt-1">
            <p><strong className="text-on-surface">Date:</strong> {order.ODt}</p>
            <p>
              <strong className="text-on-surface">Customer:</strong>{' '}
              <Link to={`/customers/${order.CID}`} className="text-primary hover:underline font-medium">
                {order.CustomerName} ({order.CID})
              </Link>
            </p>
            <p><strong className="text-on-surface">Email:</strong> {order.CustomerEmail}</p>
            <p><strong className="text-on-surface">Phone:</strong> {order.CustomerPhone}</p>
            <p><strong className="text-on-surface">Billing Address:</strong> {order.CustomerAddress}</p>
          </div>
        </div>

        <div className="flex flex-col sm:items-end justify-between text-left sm:text-right gap-sm">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border h-fit w-fit ${
            order.Status === 'Completed'
              ? 'bg-primary/20 text-primary border-primary/30'
              : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
          }`}>
            {order.Status}
          </span>

          <div className="flex flex-col gap-xs">
            <span className="text-xs text-on-surface-variant uppercase font-label-sm">Order Total Amount</span>
            <p className="text-3xl font-bold text-primary">₹{order.TotalAmt.toLocaleString()}</p>
            {remainingBal > 0 ? (
              <span className="text-xs text-yellow-400 font-medium">
                Unpaid Balance: ₹{remainingBal.toLocaleString()}
              </span>
            ) : (
              <span className="text-xs text-primary font-medium flex items-center gap-1 sm:justify-end">
                <span className="material-symbols-outlined text-xs">verified</span> Paid in Full
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Ordered Products (Table) */}
      <div className="glass-panel rounded-xl overflow-hidden border border-white/10 shadow-lg">
        <h3 className="px-6 py-4 border-b border-white/10 font-headline-md text-body-lg font-bold text-on-surface bg-surface-container-high/20">
          Line Items
        </h3>
        <table className="w-full text-left border-collapse whitespace-nowrap text-body-sm">
          <thead>
            <tr className="border-b border-white/10 bg-surface-container-high/30 text-on-surface-variant font-label-md text-xs uppercase">
              <th className="px-6 py-4">PID</th>
              <th className="px-6 py-4">Product Name</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4 text-right">Unit Price</th>
              <th className="px-6 py-4 text-center">Qty</th>
              <th className="px-6 py-4 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-on-surface">
            {items.map((item) => (
              <tr key={item.ODID} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 font-mono text-tertiary">{item.PID}</td>
                <td className="px-6 py-4 font-medium">{item.PName}</td>
                <td className="px-6 py-4 text-on-surface-variant">{item.Category}</td>
                <td className="px-6 py-4 text-right">₹{item.Price.toLocaleString()}</td>
                <td className="px-6 py-4 text-center font-bold">{item.Qty}</td>
                <td className="px-6 py-4 text-right font-semibold text-primary">
                  ₹{(item.Price * item.Qty).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
        {/* Payments List */}
        <div className="glass-panel rounded-xl p-6 border border-white/10 shadow-lg flex flex-col gap-sm">
          <h3 className="font-headline-md text-body-lg font-bold text-on-surface mb-2">Payment History</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap text-body-sm">
              <thead>
                <tr className="border-b border-white/10 text-on-surface-variant font-label-sm text-[12px] uppercase">
                  <th className="py-2 pb-3">PayID</th>
                  <th className="py-2 pb-3">Payment Date</th>
                  <th className="py-2 pb-3">Method</th>
                  <th className="py-2 pb-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {payments.map((p) => (
                  <tr key={p.PayID}>
                    <td className="py-3 font-mono text-tertiary">{p.PayID}</td>
                    <td className="py-3 text-on-surface-variant">{p.PayDt}</td>
                    <td className="py-3 font-medium">{p.PayMethod}</td>
                    <td className="py-3 font-semibold text-right text-primary">₹{p.Amt.toLocaleString()}</td>
                  </tr>
                ))}
                {payments.length === 0 && (
                  <tr>
                    <td colSpan="4" className="py-4 text-center text-on-surface-variant">No payments recorded yet for this invoice.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Feedback reviews */}
        <div className="glass-panel rounded-xl p-6 border border-white/10 shadow-lg flex flex-col gap-sm">
          <h3 className="font-headline-md text-body-lg font-bold text-on-surface mb-2">Feedback Linked to this Order</h3>
          
          {feedback ? (
            <div className="flex flex-col gap-3 p-4 bg-white/5 rounded-xl border border-white/5">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400 flex items-center font-bold text-sm">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <span key={idx} className="material-symbols-outlined text-sm font-fill-1" style={{ fontVariationSettings: `'FILL' ${idx < Math.round(feedback.Rating) ? 1 : 0}` }}>
                        star
                      </span>
                    ))}
                  </span>
                  <span className="font-semibold text-on-surface text-body-sm">({feedback.Rating} / 5)</span>
                </div>
                <span className="text-[10px] text-on-surface-variant/70 font-mono">ID: {feedback.FID}</span>
              </div>
              <p className="text-on-surface-variant text-body-sm italic">&ldquo;{feedback.Comments}&rdquo;</p>
              <p className="text-[10px] text-on-surface-variant/70 self-end">Submitted on {feedback.FbDt}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-sm">
              <p className="text-on-surface-variant text-body-sm mb-2">No feedback has been recorded yet for this specific transaction.</p>
              
              {/* Form to add feedback */}
              <form onSubmit={handleFeedbackSubmit} className="flex flex-col gap-sm border-t border-white/5 pt-4">
                <h4 className="font-label-md text-label-md text-on-surface">Record Feedback on behalf of Customer</h4>
                {fbError && (
                  <div className="p-2 bg-error/20 border border-error/50 rounded-lg text-error text-xs">
                    {fbError}
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-sm items-center">
                  <div className="flex flex-col gap-xs">
                    <label className="text-[10px] text-on-surface-variant font-label-sm uppercase">Rating Score</label>
                    <select
                      className="input-glass rounded-lg px-3 py-1.5 text-body-sm text-on-surface bg-[#0d1c2d] border border-white/10"
                      value={rating}
                      onChange={(e) => setRating(e.target.value)}
                    >
                      <option value="5">5.0 - Excellent</option>
                      <option value="4.5">4.5 - Very Good</option>
                      <option value="4">4.0 - Good</option>
                      <option value="3.5">3.5 - Satisfactory</option>
                      <option value="3">3.0 - Average</option>
                      <option value="2">2.0 - Poor</option>
                      <option value="1">1.0 - Terrible</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-xs">
                  <label className="text-[10px] text-on-surface-variant font-label-sm uppercase">Comments</label>
                  <input
                    type="text"
                    required
                    maxLength="50"
                    className="input-glass rounded-lg px-3 py-2 text-body-sm text-on-surface"
                    placeholder="e.g. Excellent service, prompt delivery"
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary w-fit self-end px-5 py-2 rounded-lg text-body-sm font-label-sm cursor-pointer border-none"
                >
                  Save Feedback
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
