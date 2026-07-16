import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Dashboard({ user }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/dashboard')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch dashboard data');
        return res.json();
      })
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
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

  if (error) {
    return (
      <div className="p-4 bg-error/20 border border-error/50 rounded-lg text-error">
        Error: {error}
      </div>
    );
  }

  // Employee Specific Rendering
  if (user?.role === 'Employee') {
    const { stats, latestCustomers, recentOrders, myTickets } = data;
    return (
      <div className="flex flex-col gap-lg pb-10">
        {/* Employee Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-md">
          {/* Customers Registered */}
          <div className="glass-panel rounded-xl p-md stat-card-glow flex flex-col gap-2">
            <div className="flex justify-between items-center text-on-surface-variant">
              <span className="font-label-sm text-label-sm uppercase tracking-wider">Total Customers</span>
              <span className="material-symbols-outlined text-tertiary">groups</span>
            </div>
            <p className="text-3xl font-bold text-on-background">{stats.totalCustomers}</p>
            <span className="text-xs text-on-surface-variant mt-auto">Registered Accounts</span>
          </div>

          {/* Orders Created */}
          <div className="glass-panel rounded-xl p-md stat-card-glow flex flex-col gap-2">
            <div className="flex justify-between items-center text-on-surface-variant">
              <span className="font-label-sm text-label-sm uppercase tracking-wider">Total Orders</span>
              <span className="material-symbols-outlined text-secondary">shopping_cart</span>
            </div>
            <p className="text-3xl font-bold text-on-background">{stats.totalOrders}</p>
            <span className="text-xs text-on-surface-variant mt-auto">System Total</span>
          </div>

          {/* Assigned Tickets */}
          <div className="glass-panel rounded-xl p-md stat-card-glow flex flex-col gap-2">
            <div className="flex justify-between items-center text-on-surface-variant">
              <span className="font-label-sm text-label-sm uppercase tracking-wider">Assigned Tickets</span>
              <span className="material-symbols-outlined text-yellow-400">pending_actions</span>
            </div>
            <p className="text-3xl font-bold text-on-background">{stats.assignedTickets}</p>
            <span className="text-xs text-on-surface-variant mt-auto">Assigned to Me</span>
          </div>

          {/* Open Tickets */}
          <div className="glass-panel rounded-xl p-md stat-card-glow flex flex-col gap-2">
            <div className="flex justify-between items-center text-on-surface-variant">
              <span className="font-label-sm text-label-sm uppercase tracking-wider">Open Tickets</span>
              <span className="material-symbols-outlined text-error">support_agent</span>
            </div>
            <p className="text-3xl font-bold text-on-background">{stats.openTickets}</p>
            <span className="text-xs text-error font-medium mt-auto">Needs Action</span>
          </div>

          {/* Resolved Tickets */}
          <div className="glass-panel rounded-xl p-md stat-card-glow flex flex-col gap-2">
            <div className="flex justify-between items-center text-on-surface-variant">
              <span className="font-label-sm text-label-sm uppercase tracking-wider">Resolved Tickets</span>
              <span className="material-symbols-outlined text-primary">task_alt</span>
            </div>
            <p className="text-3xl font-bold text-on-background">{stats.resolvedTickets}</p>
            <span className="text-xs text-primary font-medium mt-auto">Completed Assistance</span>
          </div>
        </div>

        {/* Employee Widgets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
          {/* My Assigned Support Tickets */}
          <div className="glass-panel rounded-xl p-6 flex flex-col gap-sm border border-white/5 shadow-lg lg:col-span-2">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-headline-md text-body-lg font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">support_agent</span>
                My Assigned Support Tickets
              </h3>
              <Link to="/tickets" className="text-xs text-primary hover:underline flex items-center gap-1">
                View All <span className="material-symbols-outlined text-xs">arrow_forward</span>
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="border-b border-white/10 text-on-surface-variant font-label-sm text-[12px] uppercase">
                    <th className="py-2 pb-3">TicketID</th>
                    <th className="py-2 pb-3">Issue Type</th>
                    <th className="py-2 pb-3">Customer</th>
                    <th className="py-2 pb-3">Created Date</th>
                    <th className="py-2 pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="text-body-sm text-on-surface divide-y divide-white/5">
                  {myTickets.map((t) => (
                    <tr key={t.TicketID} className="hover:bg-white/5 transition-colors cursor-pointer" onClick={() => navigate('/tickets')}>
                      <td className="py-3 font-mono text-tertiary">{t.TicketID}</td>
                      <td className="py-3 font-medium">{t.IssueType}</td>
                      <td className="py-3 text-on-surface-variant">{t.CustomerName}</td>
                      <td className="py-3 text-on-surface-variant">{t.CreatedDt}</td>
                      <td className="py-3 text-right">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          t.Status === 'Open' ? 'bg-error/20 text-error' :
                          t.Status === 'In Progress' ? 'bg-yellow-500/20 text-yellow-400' :
                          t.Status === 'Resolved' ? 'bg-primary/20 text-primary' : 'bg-surface-variant text-on-surface-variant'
                        }`}>
                          {t.Status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {myTickets.length === 0 && (
                    <tr>
                      <td colSpan="5" className="py-4 text-center text-on-surface-variant">No support tickets assigned to you</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* New Customer Registrations */}
          <div className="glass-panel rounded-xl p-6 flex flex-col gap-sm border border-white/5 shadow-lg">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-headline-md text-body-lg font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary">groups</span>
                Recent Customer Registrations
              </h3>
              <Link to="/customers" className="text-xs text-primary hover:underline flex items-center gap-1">
                View All <span className="material-symbols-outlined text-xs">arrow_forward</span>
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="border-b border-white/10 text-on-surface-variant font-label-sm text-[12px] uppercase">
                    <th className="py-2 pb-3">CID</th>
                    <th className="py-2 pb-3">Name</th>
                    <th className="py-2 pb-3">Reg Date</th>
                    <th className="py-2 pb-3 text-right">Type</th>
                  </tr>
                </thead>
                <tbody className="text-body-sm text-on-surface divide-y divide-white/5">
                  {latestCustomers.map((c) => (
                    <tr key={c.CID} className="hover:bg-white/5 transition-colors cursor-pointer" onClick={() => navigate(`/customers/${c.CID}`)}>
                      <td className="py-3">
                        <Link to={`/customers/${c.CID}`} className="font-mono text-primary hover:underline">
                          {c.CID}
                        </Link>
                      </td>
                      <td className="py-3 font-medium">{c.Name}</td>
                      <td className="py-3 text-on-surface-variant">{c.RegDt}</td>
                      <td className="py-3 text-right">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          c.CustomerType === 'VIP' ? 'bg-tertiary-container/20 text-tertiary' : 'bg-surface-variant text-on-surface-variant border border-white/10'
                        }`}>
                          {c.CustomerType}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {latestCustomers.length === 0 && (
                    <tr>
                      <td colSpan="4" className="py-4 text-center text-on-surface-variant">No customers registered</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* My Recent Orders */}
          <div className="glass-panel rounded-xl p-6 flex flex-col gap-sm border border-white/5 shadow-lg">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-headline-md text-body-lg font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">shopping_cart</span>
                Recent Orders
              </h3>
              <Link to="/orders" className="text-xs text-primary hover:underline flex items-center gap-1">
                View All <span className="material-symbols-outlined text-xs">arrow_forward</span>
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="border-b border-white/10 text-on-surface-variant font-label-sm text-[12px] uppercase">
                    <th className="py-2 pb-3">OrderID</th>
                    <th className="py-2 pb-3">Customer</th>
                    <th className="py-2 pb-3">Date</th>
                    <th className="py-2 pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="text-body-sm text-on-surface divide-y divide-white/5">
                  {recentOrders.map((o) => (
                    <tr key={o.OID} className="hover:bg-white/5 transition-colors cursor-pointer" onClick={() => navigate(`/orders/${o.OID}`)}>
                      <td className="py-3">
                        <Link to={`/orders/${o.OID}`} className="font-mono text-primary hover:underline">
                          {o.OID}
                        </Link>
                      </td>
                      <td className="py-3 font-medium">{o.CustomerName}</td>
                      <td className="py-3 text-on-surface-variant">{o.ODt}</td>
                      <td className="py-3 text-right">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          o.Status === 'Completed' ? 'bg-primary/20 text-primary' : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {o.Status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {recentOrders.length === 0 && (
                    <tr>
                      <td colSpan="4" className="py-4 text-center text-on-surface-variant">No orders recorded</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Admin Dashboard (default original)
  const { stats, recentOrders, latestCustomers, openTickets, lowStockProducts, recentDeletions } = data;

  return (
    <div className="flex flex-col gap-lg pb-10">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-md">
        {/* Total Revenue */}
        <div className="glass-panel rounded-xl p-md stat-card-glow col-span-1 sm:col-span-2 lg:col-span-2 flex flex-col gap-2">
          <div className="flex justify-between items-center text-on-surface-variant">
            <span className="font-label-sm text-label-sm uppercase tracking-wider">Total Revenue</span>
            <span className="material-symbols-outlined text-primary">payments</span>
          </div>
          <p className="font-display-lg text-display-lg text-on-background font-bold">
            ₹{stats.totalRevenue.toLocaleString()}
          </p>
          <span className="text-xs text-primary font-medium flex items-center gap-1 mt-auto">
            <span className="material-symbols-outlined text-sm">trending_up</span>
            Seeded DBMS Aggregate
          </span>
        </div>

        {/* Active Customers */}
        <div className="glass-panel rounded-xl p-md stat-card-glow flex flex-col gap-2">
          <div className="flex justify-between items-center text-on-surface-variant">
            <span className="font-label-sm text-label-sm uppercase tracking-wider">Customers</span>
            <span className="material-symbols-outlined text-tertiary">groups</span>
          </div>
          <p className="text-3xl font-bold text-on-background">{stats.totalCustomers}</p>
          <span className="text-xs text-on-surface-variant mt-auto">Registered Accounts</span>
        </div>

        {/* Total Orders */}
        <div className="glass-panel rounded-xl p-md stat-card-glow flex flex-col gap-2">
          <div className="flex justify-between items-center text-on-surface-variant">
            <span className="font-label-sm text-label-sm uppercase tracking-wider">Total Orders</span>
            <span className="material-symbols-outlined text-secondary">shopping_cart</span>
          </div>
          <p className="text-3xl font-bold text-on-background">{stats.totalOrders}</p>
          <span className="text-xs text-on-surface-variant mt-auto">Completed & Pending</span>
        </div>

        {/* Pending Tickets */}
        <div className="glass-panel rounded-xl p-md stat-card-glow flex flex-col gap-2">
          <div className="flex justify-between items-center text-on-surface-variant">
            <span className="font-label-sm text-label-sm uppercase tracking-wider">Support</span>
            <span className="material-symbols-outlined text-error">support_agent</span>
          </div>
          <p className="text-3xl font-bold text-on-background">{stats.pendingTickets}</p>
          <span className="text-xs text-error font-medium mt-auto">Pending Assistance</span>
        </div>

        {/* Avg Rating */}
        <div className="glass-panel rounded-xl p-md stat-card-glow flex flex-col gap-2">
          <div className="flex justify-between items-center text-on-surface-variant">
            <span className="font-label-sm text-label-sm uppercase tracking-wider">Satisfaction</span>
            <span className="material-symbols-outlined text-yellow-400">star</span>
          </div>
          <p className="text-3xl font-bold text-on-background">{stats.averageRating} / 5</p>
          <span className="text-xs text-on-surface-variant mt-auto">Feedback Average</span>
        </div>
      </div>

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
        {/* Recent Orders */}
        <div className="glass-panel rounded-xl p-6 flex flex-col gap-sm border border-white/5 shadow-lg">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-headline-md text-body-lg font-bold text-on-surface">Recent Orders</h3>
            <Link to="/orders" className="text-xs text-primary hover:underline flex items-center gap-1">
              View All <span className="material-symbols-outlined text-xs">arrow_forward</span>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="border-b border-white/10 text-on-surface-variant font-label-sm text-[12px] uppercase">
                  <th className="py-2 pb-3">OrderID</th>
                  <th className="py-2 pb-3">Customer</th>
                  <th className="py-2 pb-3">Date</th>
                  <th className="py-2 pb-3">Amount</th>
                  <th className="py-2 pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="text-body-sm text-on-surface divide-y divide-white/5">
                {recentOrders.map((o) => (
                  <tr key={o.OID} className="hover:bg-white/5 transition-colors cursor-pointer" onClick={() => navigate(`/orders/${o.OID}`)}>
                    <td className="py-3">
                      <Link to={`/orders/${o.OID}`} className="font-mono text-primary hover:underline">
                        {o.OID}
                      </Link>
                    </td>
                    <td className="py-3 font-medium">{o.CustomerName}</td>
                    <td className="py-3 text-on-surface-variant">{o.ODt}</td>
                    <td className="py-3 font-semibold">₹{o.TotalAmt.toLocaleString()}</td>
                    <td className="py-3 text-right">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        o.Status === 'Completed' ? 'bg-primary/20 text-primary' : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {o.Status}
                      </span>
                    </td>
                  </tr>
                ))}
                {recentOrders.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-4 text-center text-on-surface-variant">No orders recorded</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Open Support Tickets */}
        <div className="glass-panel rounded-xl p-6 flex flex-col gap-sm border border-white/5 shadow-lg">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-headline-md text-body-lg font-bold text-on-surface">Open & Active Tickets</h3>
            <Link to="/tickets" className="text-xs text-primary hover:underline flex items-center gap-1">
              View All <span className="material-symbols-outlined text-xs">arrow_forward</span>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="border-b border-white/10 text-on-surface-variant font-label-sm text-[12px] uppercase">
                  <th className="py-2 pb-3">TicketID</th>
                  <th className="py-2 pb-3">Type</th>
                  <th className="py-2 pb-3">Customer</th>
                  <th className="py-2 pb-3">Assigned To</th>
                  <th className="py-2 pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="text-body-sm text-on-surface divide-y divide-white/5">
                {openTickets.map((t) => (
                  <tr key={t.TicketID} className="hover:bg-white/5 transition-colors cursor-pointer" onClick={() => navigate('/tickets')}>
                    <td className="py-3 font-mono text-tertiary">{t.TicketID}</td>
                    <td className="py-3 font-medium">{t.IssueType}</td>
                    <td className="py-3 text-on-surface-variant">{t.CustomerName}</td>
                    <td className="py-3 text-on-surface-variant">{t.EmployeeName || 'Unassigned'}</td>
                    <td className="py-3 text-right">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        t.Status === 'Open' ? 'bg-error/20 text-error' : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {t.Status}
                      </span>
                    </td>
                  </tr>
                ))}
                {openTickets.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-4 text-center text-on-surface-variant">No active support tickets</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Latest Customer Registrations */}
        <div className="glass-panel rounded-xl p-6 flex flex-col gap-sm border border-white/5 shadow-lg">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-headline-md text-body-lg font-bold text-on-surface">New Customer Registrations</h3>
            <Link to="/customers" className="text-xs text-primary hover:underline flex items-center gap-1">
              View All <span className="material-symbols-outlined text-xs">arrow_forward</span>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="border-b border-white/10 text-on-surface-variant font-label-sm text-[12px] uppercase">
                  <th className="py-2 pb-3">CID</th>
                  <th className="py-2 pb-3">Name</th>
                  <th className="py-2 pb-3">Reg Date</th>
                  <th className="py-2 pb-3 text-right">Type</th>
                </tr>
              </thead>
              <tbody className="text-body-sm text-on-surface divide-y divide-white/5">
                {latestCustomers.map((c) => (
                  <tr key={c.CID} className="hover:bg-white/5 transition-colors cursor-pointer" onClick={() => navigate(`/customers/${c.CID}`)}>
                    <td className="py-3">
                      <Link to={`/customers/${c.CID}`} className="font-mono text-primary hover:underline">
                        {c.CID}
                      </Link>
                    </td>
                    <td className="py-3 font-medium">{c.Name}</td>
                    <td className="py-3 text-on-surface-variant">{c.RegDt}</td>
                    <td className="py-3 text-right">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        c.CustomerType === 'VIP' ? 'bg-tertiary-container/20 text-tertiary' : 'bg-surface-variant text-on-surface-variant border border-white/10'
                      }`}>
                        {c.CustomerType}
                      </span>
                    </td>
                  </tr>
                ))}
                {latestCustomers.length === 0 && (
                  <tr>
                    <td colSpan="4" className="py-4 text-center text-on-surface-variant">No customers registered</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Products */}
        <div className="glass-panel rounded-xl p-6 flex flex-col gap-sm border border-white/5 shadow-lg">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-headline-md text-body-lg font-bold text-on-surface">Low Stock Inventory</h3>
            <Link to="/products" className="text-xs text-primary hover:underline flex items-center gap-1">
              View All <span className="material-symbols-outlined text-xs">arrow_forward</span>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="border-b border-white/10 text-on-surface-variant font-label-sm text-[12px] uppercase">
                  <th className="py-2 pb-3">PID</th>
                  <th className="py-2 pb-3">Product Name</th>
                  <th className="py-2 pb-3">Category</th>
                  <th className="py-2 pb-3 text-right">Stock</th>
                </tr>
              </thead>
              <tbody className="text-body-sm text-on-surface divide-y divide-white/5">
                {lowStockProducts.map((p) => (
                  <tr key={p.PID} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 font-mono text-tertiary">{p.PID}</td>
                    <td className="py-3 font-medium">{p.PName}</td>
                    <td className="py-3 text-on-surface-variant">{p.Category}</td>
                    <td className="py-3 text-right">
                      <span className={`text-[11px] px-2 py-0.5 rounded font-bold ${
                        p.Stock <= 15 ? 'bg-error/20 text-error' : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {p.Stock} Left
                      </span>
                    </td>
                  </tr>
                ))}
                {lowStockProducts.length === 0 && (
                  <tr>
                    <td colSpan="4" className="py-4 text-center text-on-surface-variant">All products adequately stocked</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Admin Widget: Recent Deletions */}
      {recentDeletions && (
        <div className="glass-panel rounded-xl p-6 flex flex-col gap-sm border border-white/5 shadow-lg w-full mt-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-headline-md text-body-lg font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-error">history</span>
              Audit Log: Recent Customer Deletions
            </h3>
            <Link to="/activity-log" className="text-xs text-primary hover:underline flex items-center gap-1">
              Full Log <span className="material-symbols-outlined text-xs">arrow_forward</span>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="border-b border-white/10 text-on-surface-variant font-label-sm text-[12px] uppercase">
                  <th className="py-2 pb-3">CustomerID</th>
                  <th className="py-2 pb-3">Customer Name</th>
                  <th className="py-2 pb-3 text-right">Deletion Date (Logged via SQL Trigger)</th>
                </tr>
              </thead>
              <tbody className="text-body-sm text-on-surface divide-y divide-white/5">
                {recentDeletions.map((d, index) => (
                  <tr key={index} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 font-mono text-error">{d.CID}</td>
                    <td className="py-3 font-medium text-on-surface">{d.Name}</td>
                    <td className="py-3 text-right text-on-surface-variant">{d.Deleted_Date}</td>
                  </tr>
                ))}
                {recentDeletions.length === 0 && (
                  <tr>
                    <td colSpan="3" className="py-4 text-center text-on-surface-variant">No deletions recorded in Customer_Audit trigger yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
