import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

export default function CustomerProfile() {
  const { id } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'payments' | 'tickets' | 'feedback'
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    fetch(`/api/customers/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Customer profile not found');
        return res.json();
      })
      .then((data) => {
        setProfileData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

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
          <Link to="/customers" className="text-xs text-primary hover:underline">
            &larr; Back to Customers Directory
          </Link>
        </div>
      </div>
    );
  }

  const { customer, orders, payments, tickets, feedback } = profileData;

  const getInitials = (fullName) => {
    if (!fullName) return '';
    return fullName.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="flex flex-col gap-lg pb-10">
      {/* Back to Directory Link */}
      <div>
        <Link to="/customers" className="inline-flex items-center gap-1 text-sm text-on-surface-variant hover:text-primary transition-colors">
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          <span>Back to Customers Directory</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        {/* Left Side: Customer Info Card */}
        <div className="glass-panel rounded-xl p-6 border border-white/10 shadow-lg h-fit flex flex-col gap-md">
          {/* Avatar and Name */}
          <div className="flex flex-col items-center gap-sm text-center border-b border-white/5 pb-lg">
            <div className="w-20 h-20 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-3xl border border-primary/30 shadow-lg">
              {getInitials(customer.Name)}
            </div>
            <div>
              <h3 className="font-headline-md text-headline-md font-bold text-on-surface">{customer.Name}</h3>
              <p className="font-mono text-xs text-primary mt-1">{customer.CID}</p>
            </div>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
              customer.CustomerType === 'VIP'
                ? 'bg-tertiary-container/20 text-tertiary border-tertiary-container/30'
                : customer.CustomerType === 'Corporate'
                ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                : 'bg-surface-variant text-on-surface-variant border-white/10'
            }`}>
              {customer.CustomerType}
            </span>
          </div>

          {/* Details list */}
          <div className="flex flex-col gap-sm text-body-sm">
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-on-surface-variant">Email</span>
              <span className="text-on-surface select-all">{customer.Email}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-on-surface-variant">Phone</span>
              <span className="text-on-surface select-all">{customer.Phone}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-on-surface-variant">Gender</span>
              <span className="text-on-surface">{customer.Gender}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-on-surface-variant">Location</span>
              <span className="text-on-surface">{customer.Address}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-on-surface-variant">Registered On</span>
              <span className="text-on-surface">{customer.RegDt}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Details Tables and Tabs */}
        <div className="lg:col-span-2 flex flex-col gap-md">
          {/* Tabs header */}
          <div className="flex border-b border-white/10 gap-sm overflow-x-auto">
            {[
              { id: 'orders', label: 'Orders', icon: 'shopping_cart', count: orders.length },
              { id: 'payments', label: 'Payments', icon: 'payments', count: payments.length },
              { id: 'tickets', label: 'Support Tickets', icon: 'support_agent', count: tickets.length },
              { id: 'feedback', label: 'Feedback & Reviews', icon: 'rate_review', count: feedback.length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 font-label-md text-label-md transition-all whitespace-nowrap cursor-pointer bg-transparent border-none ${
                  activeTab === tab.id
                    ? 'border-primary text-primary font-bold'
                    : 'border-transparent text-on-surface-variant hover:text-on-surface hover:border-white/10'
                }`}
              >
                <span className="material-symbols-outlined text-sm">{tab.icon}</span>
                <span>{tab.label}</span>
                <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded font-mono">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Tab Contents */}
          <div className="glass-panel rounded-xl overflow-hidden border border-white/10 shadow-lg min-h-[300px]">
            {activeTab === 'orders' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap text-body-sm">
                  <thead>
                    <tr className="border-b border-white/10 bg-surface-container-high/30 text-on-surface-variant font-label-md text-xs uppercase">
                      <th className="px-6 py-4">OrderID</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Total Amount</th>
                      <th className="px-6 py-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-on-surface">
                    {orders.map((o) => (
                      <tr
                        key={o.OID}
                        onClick={() => navigate(`/orders/${o.OID}`)}
                        className="hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        <td className="px-6 py-4 font-mono text-primary font-medium">{o.OID}</td>
                        <td className="px-6 py-4">{o.ODt}</td>
                        <td className="px-6 py-4 font-semibold">₹{o.TotalAmt.toLocaleString()}</td>
                        <td className="px-6 py-4 text-right">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            o.Status === 'Completed' ? 'bg-primary/20 text-primary' : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {o.Status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr>
                        <td colSpan="4" className="px-6 py-8 text-center text-on-surface-variant">
                          No orders placed by this customer.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'payments' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap text-body-sm">
                  <thead>
                    <tr className="border-b border-white/10 bg-surface-container-high/30 text-on-surface-variant font-label-md text-xs uppercase">
                      <th className="px-6 py-4">PayID</th>
                      <th className="px-6 py-4">OrderID</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Payment Method</th>
                      <th className="px-6 py-4 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-on-surface">
                    {payments.map((p) => (
                      <tr key={p.PayID} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 font-mono text-tertiary">{p.PayID}</td>
                        <td className="px-6 py-4 font-mono text-primary">{p.OID}</td>
                        <td className="px-6 py-4">{p.PayDt}</td>
                        <td className="px-6 py-4">
                          <span className="bg-surface-variant border border-white/10 text-on-surface-variant px-2.5 py-0.5 rounded text-xs">
                            {p.PayMethod}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-right text-primary">
                          ₹{p.Amt.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    {payments.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-on-surface-variant">
                          No payments recorded for this customer.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'tickets' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap text-body-sm">
                  <thead>
                    <tr className="border-b border-white/10 bg-surface-container-high/30 text-on-surface-variant font-label-md text-xs uppercase">
                      <th className="px-6 py-4">TicketID</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">Description</th>
                      <th className="px-6 py-4">Assigned Agent</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-on-surface">
                    {tickets.map((t) => (
                      <tr key={t.TicketID} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 font-mono text-tertiary">{t.TicketID}</td>
                        <td className="px-6 py-4 font-medium">{t.IssueType}</td>
                        <td className="px-6 py-4 text-on-surface-variant truncate max-w-[200px]" title={t.Description}>
                          {t.Description}
                        </td>
                        <td className="px-6 py-4 text-on-surface-variant">{t.EmployeeName || 'Unassigned'}</td>
                        <td className="px-6 py-4 text-on-surface-variant">{t.CreatedDt}</td>
                        <td className="px-6 py-4 text-right">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            t.Status === 'Resolved' || t.Status === 'Closed'
                              ? 'bg-primary/20 text-primary'
                              : t.Status === 'In Progress'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-error/20 text-error'
                          }`}>
                            {t.Status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {tickets.length === 0 && (
                      <tr>
                        <td colSpan="6" className="px-6 py-8 text-center text-on-surface-variant">
                          No support tickets logged for this customer.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'feedback' && (
              <div className="flex flex-col divide-y divide-white/5 p-4">
                {feedback.map((f) => (
                  <div key={f.FID} className="py-4 first:pt-0 last:pb-0 flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-400 flex items-center font-bold text-sm">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <span key={idx} className="material-symbols-outlined text-sm font-fill-1" style={{ fontVariationSettings: `'FILL' ${idx < Math.round(f.Rating) ? 1 : 0}` }}>
                              star
                            </span>
                          ))}
                        </span>
                        <span className="font-semibold text-on-surface text-body-sm">({f.Rating} / 5)</span>
                      </div>
                      <span className="text-xs text-on-surface-variant font-mono">
                        Order OID: <Link to={`/orders/${f.OID}`} className="text-primary hover:underline">{f.OID}</Link>
                      </span>
                    </div>
                    <p className="text-on-surface-variant text-body-sm italic">&ldquo;{f.Comments}&rdquo;</p>
                    <p className="text-[10px] text-on-surface-variant/70 self-end">Submitted on {f.FbDt}</p>
                  </div>
                ))}
                {feedback.length === 0 && (
                  <p className="text-center py-8 text-on-surface-variant text-body-sm">No feedback reviews recorded from this customer.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
