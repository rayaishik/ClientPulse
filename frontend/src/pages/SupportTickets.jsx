import React, { useEffect, useState } from 'react';

export default function SupportTickets({ user }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // Form Fields
  const [customers, setCustomers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [issueType, setIssueType] = useState('Payment');
  const [description, setDescription] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchTickets = () => {
    setLoading(true);
    let url = `/api/tickets?status=${encodeURIComponent(statusFilter)}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setTickets(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTickets();
  }, [statusFilter]);

  const handleOpenCreateModal = async () => {
    setErrorMsg('');
    setSelectedCustomerId('');
    setSelectedEmployeeId('');
    setIssueType('Payment');
    setDescription('');

    try {
      const resCust = await fetch('/api/customers');
      const dataCust = await resCust.json();
      setCustomers(dataCust);

      const resEmp = await fetch('/api/employees');
      const dataEmp = await resEmp.json();
      // Filter for Support Executives or Sales
      setEmployees(dataEmp);

      setModalOpen(true);
    } catch (err) {
      console.error('Error fetching customers/employees for ticket modal:', err);
    }
  };

  const handleStatusChange = (ticketId, nextStatus) => {
    fetch(`/api/tickets/${ticketId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ Status: nextStatus }),
    })
      .then((res) => res.json())
      .then(() => {
        fetchTickets();
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedCustomerId) {
      setErrorMsg('Please select a customer.');
      return;
    }
    if (user?.role !== 'Employee' && !selectedEmployeeId) {
      setErrorMsg('Please assign an employee.');
      return;
    }
    if (!description.trim()) {
      setErrorMsg('Please enter a description.');
      return;
    }

    const payload = {
      CID: selectedCustomerId,
      EID: user?.role === 'Employee' ? null : selectedEmployeeId,
      IssueType: issueType,
      Description: description
    };

    fetch('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to log ticket');
        return res.json();
      })
      .then(() => {
        setModalOpen(false);
        fetchTickets();
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
          {/* Status Filter Dropdown */}
          <div className="relative inline-block text-left glass-panel rounded-lg w-full sm:w-auto z-20">
            <button
              onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
              className="inline-flex justify-between items-center w-full sm:w-48 px-4 py-2.5 text-body-sm font-body-sm text-on-surface hover:text-primary transition-colors focus:outline-none cursor-pointer"
              type="button"
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">filter_list</span>
                <span>{statusFilter === 'All Statuses' ? 'Ticket Status' : statusFilter}</span>
              </div>
              <span className="material-symbols-outlined text-sm">expand_more</span>
            </button>
            
            {filterDropdownOpen && (
              <div className="origin-top-right absolute left-0 mt-2 w-48 rounded-lg shadow-xl glass-panel ring-1 ring-black ring-opacity-5 focus:outline-none z-30">
                <div className="py-1">
                  {['All Statuses', 'Open', 'In Progress', 'Resolved', 'Closed'].map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setStatusFilter(s);
                        setFilterDropdownOpen(false);
                      }}
                      className="w-full text-left text-on-surface block px-4 py-2 text-body-sm hover:bg-white/5 hover:text-primary transition-colors cursor-pointer border-none bg-transparent"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Log Ticket Button */}
        <button
          onClick={handleOpenCreateModal}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-[#00a896] hover:from-[#45e0c8] hover:to-[#008f7f] text-[#003731] font-label-md text-label-md px-6 py-2.5 rounded-lg shadow-[0_4px_14px_rgba(87,241,219,0.25)] hover:shadow-[0_6px_20px_rgba(87,241,219,0.4)] transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer border-none"
        >
          <span className="material-symbols-outlined text-sm font-bold">add</span>
          Log Support Ticket
        </button>
      </div>

      {/* Tickets List Table */}
      <div className="glass-panel rounded-xl overflow-hidden flex flex-col flex-1 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-b border-white/10 bg-surface-container-high/30">
                <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">TicketID</th>
                <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Issue Type</th>
                <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Assigned Agent</th>
                <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Created Date</th>
                <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">Status Workflow</th>
              </tr>
            </thead>
            <tbody className="font-body-sm text-body-sm text-on-surface divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-8">
                    <span className="w-6 h-6 inline-block border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                  </td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-on-surface-variant">
                    No support tickets logged.
                  </td>
                </tr>
              ) : (
                tickets.map((t) => (
                  <tr key={t.TicketID} className="glass-table-row">
                    <td className="px-6 py-4 font-mono text-tertiary">{t.TicketID}</td>
                    <td className="px-6 py-4 font-medium text-on-surface">{t.IssueType}</td>
                    <td className="px-6 py-4 text-on-surface-variant truncate max-w-[200px]" title={t.Description}>
                      {t.Description}
                    </td>
                    <td className="px-6 py-4">
                      <Link to={`/customers/${t.CID}`} className="text-primary hover:underline font-medium">
                        {t.CustomerName}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant">{t.EmployeeName || 'Unassigned'}</td>
                    <td className="px-6 py-4 text-on-surface-variant">{t.CreatedDt}</td>
                    <td className="px-6 py-4 text-right">
                      {/* Dynamic Workflow Status Droplist */}
                      <select
                        className={`rounded-lg px-2.5 py-1 text-xs font-semibold bg-[#0d1c2d] border cursor-pointer focus:outline-none ${
                          t.Status === 'Resolved' || t.Status === 'Closed'
                            ? 'text-primary border-primary/30 bg-primary/5'
                            : t.Status === 'In Progress'
                            ? 'text-yellow-400 border-yellow-500/30 bg-yellow-500/5'
                            : 'text-error border-error/30 bg-error/5'
                        }`}
                        value={t.Status}
                        onChange={(e) => handleStatusChange(t.TicketID, e.target.value)}
                      >
                        {(() => {
                          if (user?.role !== 'Employee') {
                            return ['Open', 'In Progress', 'Resolved', 'Closed'].map((st) => (
                              <option key={st} value={st}>{st}</option>
                            ));
                          }
                          const transitions = {
                            'Open': ['Open', 'In Progress'],
                            'In Progress': ['In Progress', 'Resolved'],
                            'Resolved': ['Resolved', 'Closed'],
                            'Closed': ['Closed']
                          };
                          const allowed = transitions[t.Status] || [t.Status];
                          return allowed.map((st) => (
                            <option key={st} value={st}>{st}</option>
                          ));
                        })()}
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Ticket Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-panel-elevated rounded-2xl w-full max-w-lg p-lg flex flex-col gap-md">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
                Log Customer Support Ticket
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
                      {c.Name} ({c.CID})
                    </option>
                  ))}
                </select>
              </div>

              {/* Assign Agent & Issue Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
                {user?.role === 'Admin' ? (
                  <>
                    <div className="flex flex-col gap-xs">
                      <label className="font-label-sm text-label-sm text-on-surface-variant">Assign Support Agent</label>
                      <select
                        required
                        className="input-glass rounded-lg px-3 py-2 text-body-sm text-on-surface bg-[#0d1c2d] border border-white/10 w-full"
                        value={selectedEmployeeId}
                        onChange={(e) => setSelectedEmployeeId(e.target.value)}
                      >
                        <option value="">-- Choose Employee --</option>
                        {employees.map((e) => (
                          <option key={e.EID} value={e.EID}>
                            {e.Name} ({e.Designation})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-xs">
                      <label className="font-label-sm text-label-sm text-on-surface-variant">Issue Type</label>
                      <select
                        className="input-glass rounded-lg px-3 py-2 text-body-sm text-on-surface bg-[#0d1c2d] border border-white/10 w-full"
                        value={issueType}
                        onChange={(e) => setIssueType(e.target.value)}
                      >
                        <option value="Payment">Payment</option>
                        <option value="Delivery">Delivery</option>
                        <option value="Warranty">Warranty</option>
                        <option value="Refund">Refund</option>
                        <option value="Technical">Technical</option>
                        <option value="Replacement">Replacement</option>
                        <option value="Account">Account</option>
                      </select>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col gap-xs sm:col-span-2">
                    <label className="font-label-sm text-label-sm text-on-surface-variant">Issue Type</label>
                    <select
                      className="input-glass rounded-lg px-3 py-2 text-body-sm text-on-surface bg-[#0d1c2d] border border-white/10 w-full"
                      value={issueType}
                      onChange={(e) => setIssueType(e.target.value)}
                    >
                      <option value="Payment">Payment</option>
                      <option value="Delivery">Delivery</option>
                      <option value="Warranty">Warranty</option>
                      <option value="Refund">Refund</option>
                      <option value="Technical">Technical</option>
                      <option value="Replacement">Replacement</option>
                      <option value="Account">Account</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="flex flex-col gap-xs">
                <label className="font-label-sm text-label-sm text-on-surface-variant">Issue Description (max 50 chars)</label>
                <input
                  type="text"
                  maxLength="50"
                  required
                  className="input-glass rounded-lg px-3 py-2 text-body-sm text-on-surface"
                  placeholder="e.g. Device does not turn on"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="flex gap-sm justify-end mt-sm">
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
                  Log Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
