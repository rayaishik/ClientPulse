import React, { useEffect, useState } from 'react';

export default function Reports() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/reports')
      .then((res) => res.json())
      .then((data) => {
        setReportData(data);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <span className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></span>
      </div>
    );
  }

  const { totalRevenue, monthlyOrders, mostSoldProduct, averageSatisfaction, openTicketsCount } = reportData;

  return (
    <div className="flex flex-col gap-lg pb-10">
      <div>
        <p className="text-body-sm text-on-surface-variant">
          DBMS analytics and business reports summarizing CRM performance, order volume distribution, support workload, and customer feedback.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
        {/* Total Revenue */}
        <div className="glass-panel rounded-xl p-6 stat-card-glow flex flex-col gap-2 border border-white/5">
          <div className="flex justify-between items-center text-on-surface-variant">
            <span className="font-label-sm text-label-sm uppercase tracking-wider">Gross Revenue</span>
            <span className="material-symbols-outlined text-primary">payments</span>
          </div>
          <p className="text-3xl font-bold text-on-background">₹{totalRevenue.toLocaleString()}</p>
          <span className="text-xs text-primary font-medium flex items-center gap-1 mt-auto">
            Sum of all payment records
          </span>
        </div>

        {/* Satisfaction Rating */}
        <div className="glass-panel rounded-xl p-6 stat-card-glow flex flex-col gap-2 border border-white/5">
          <div className="flex justify-between items-center text-on-surface-variant">
            <span className="font-label-sm text-label-sm uppercase tracking-wider font-medium">Customer CSAT</span>
            <span className="material-symbols-outlined text-yellow-400">star</span>
          </div>
          <p className="text-3xl font-bold text-on-background">{averageSatisfaction} / 5.0</p>
          <span className="text-xs text-on-surface-variant mt-auto">Average rating from Feedback</span>
        </div>

        {/* Open Ticket Queue */}
        <div className="glass-panel rounded-xl p-6 stat-card-glow flex flex-col gap-2 border border-white/5">
          <div className="flex justify-between items-center text-on-surface-variant">
            <span className="font-label-sm text-label-sm uppercase tracking-wider">Support Workload</span>
            <span className="material-symbols-outlined text-error">support_agent</span>
          </div>
          <p className="text-3xl font-bold text-on-background">{openTicketsCount} open</p>
          <span className="text-xs text-error font-medium mt-auto">Pending customer issues</span>
        </div>

        {/* Top Product */}
        <div className="glass-panel rounded-xl p-6 stat-card-glow flex flex-col gap-2 border border-white/5">
          <div className="flex justify-between items-center text-on-surface-variant">
            <span className="font-label-sm text-label-sm uppercase tracking-wider">Top Product</span>
            <span className="material-symbols-outlined text-tertiary">inventory_2</span>
          </div>
          <p className="text-2xl font-bold text-on-background truncate" title={mostSoldProduct.name}>
            {mostSoldProduct.name}
          </p>
          <span className="text-xs text-tertiary font-semibold mt-auto">
            {mostSoldProduct.qty} units sold total
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        {/* Monthly Orders Table */}
        <div className="glass-panel rounded-xl p-6 border border-white/5 shadow-lg lg:col-span-2 flex flex-col gap-sm">
          <h3 className="font-headline-md text-body-lg font-bold text-on-surface mb-2">Monthly Sales Distribution</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap text-body-sm">
              <thead>
                <tr className="border-b border-white/10 text-on-surface-variant font-label-sm text-[12px] uppercase">
                  <th className="py-2 pb-3">Month Calendar</th>
                  <th className="py-2 pb-3">Orders Invoiced</th>
                  <th className="py-2 pb-3 text-right">Trend Indicator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-on-surface">
                {monthlyOrders.map((mo, index) => (
                  <tr key={index} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 font-medium">{mo.Month}</td>
                    <td className="py-3 font-semibold text-primary">{mo.OrderCount} orders</td>
                    <td className="py-3 text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-bold">
                        <span className="material-symbols-outlined text-xs">trending_up</span>
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
                {monthlyOrders.length === 0 && (
                  <tr>
                    <td colSpan="3" className="py-4 text-center text-on-surface-variant">No orders invoiced yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Product Progress Bar Card */}
        <div className="glass-panel rounded-xl p-6 border border-white/5 shadow-lg flex flex-col gap-md">
          <h3 className="font-headline-md text-body-lg font-bold text-on-surface">Best Seller Spotlight</h3>
          <div className="flex flex-col gap-md justify-center items-center h-full">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 mb-2">
              <span className="material-symbols-outlined text-3xl text-primary">emoji_events</span>
            </div>
            <div className="text-center">
              <span className="text-[10px] text-on-surface-variant font-label-sm uppercase tracking-wider block">Most Sold Item</span>
              <p className="text-xl font-bold text-on-surface mt-1">{mostSoldProduct.name}</p>
              <p className="text-sm text-primary font-semibold mt-1">Total Qty: {mostSoldProduct.qty} items</p>
            </div>
            
            <div className="w-full mt-4 flex flex-col gap-xs">
              <div className="flex justify-between text-xs text-on-surface-variant">
                <span>Monthly target progress</span>
                <span>{(mostSoldProduct.qty / 50 * 100).toFixed(0)}%</span>
              </div>
              {/* Progress bar container */}
              <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-primary to-primary-container h-full rounded-full"
                  style={{ width: `${Math.min(100, (mostSoldProduct.qty / 50 * 100))}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
