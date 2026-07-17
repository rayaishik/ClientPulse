import React, { useEffect, useState } from 'react';

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [designation, setDesignation] = useState('Support Executive');
  const [salary, setSalary] = useState(0);

  const fetchEmployees = () => {
    setLoading(true);
    fetch('/api/employees')
      .then((res) => res.json())
      .then((data) => {
        setEmployees(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleOpenAddModal = () => {
    setModalMode('add');
    setName('');
    setEmail('');
    setPhone('');
    setAddress('');
    setDesignation('Support Executive');
    setSalary(0);
    setModalOpen(true);
  };

  const handleOpenEditModal = (e) => {
    setModalMode('edit');
    setSelectedEmployeeId(e.EID);
    setName(e.Name);
    setEmail(e.Email);
    setPhone(e.Phone);
    setAddress(e.Address);
    setDesignation(e.Designation);
    setSalary(e.Salary);
    setModalOpen(true);
  };

  const handleDelete = (eid, name) => {
    if (window.confirm(`Are you sure you want to delete employee "${name}" (${eid})?`)) {
      fetch(`/api/employees/${eid}`, {
        method: 'DELETE',
      })
        .then((res) => res.json())
        .then(() => {
          fetchEmployees();
        });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      Name: name,
      Email: email,
      Phone: phone,
      Address: address,
      Designation: designation,
      Salary: parseFloat(salary)
    };

    if (modalMode === 'add') {
      fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then((res) => res.json())
        .then(() => {
          setModalOpen(false);
          fetchEmployees();
        });
    } else {
      fetch(`/api/employees/${selectedEmployeeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then((res) => res.json())
        .then(() => {
          setModalOpen(false);
          fetchEmployees();
        });
    }
  };

  return (
    <div className="flex flex-col gap-lg pb-10">
      {/* Action Bar */}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-body-sm text-on-surface-variant">List of all active corporate agents, sales executives, and support technicians.</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-[#00a896] hover:from-[#45e0c8] hover:to-[#008f7f] text-[#003731] font-label-md text-label-md px-6 py-2.5 rounded-lg shadow-[0_4px_14px_rgba(87,241,219,0.25)] hover:shadow-[0_6px_20px_rgba(87,241,219,0.4)] transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer border-none"
        >
          <span className="material-symbols-outlined text-sm font-bold">add</span>
          Add Employee
        </button>
      </div>

      {/* Employees Table */}
      <div className="glass-panel rounded-xl overflow-hidden flex flex-col flex-1 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-b border-white/10 bg-surface-container-high/30">
                <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">EID</th>
                <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-medium">Designation</th>
                <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Salary</th>
                <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-center">Assigned Tickets</th>
                <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="font-body-sm text-body-sm text-on-surface divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-8">
                    <span className="w-6 h-6 inline-block border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-on-surface-variant">
                    No employee logs registered.
                  </td>
                </tr>
              ) : (
                employees.map((e) => (
                  <tr key={e.EID} className="glass-table-row">
                    <td className="px-6 py-4 font-mono text-[#bcc7de]">{e.EID}</td>
                    <td className="px-6 py-4 font-medium text-on-surface">{e.Name}</td>
                    <td className="px-6 py-4 text-on-surface-variant">{e.Email}</td>
                    <td className="px-6 py-4 text-on-surface">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                        e.Designation === 'Manager'
                          ? 'bg-primary/20 text-primary border border-primary/20'
                          : e.Designation === 'Sales Executive'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/20'
                          : 'bg-surface-variant text-on-surface-variant border border-white/10'
                      }`}>
                        {e.Designation}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono font-medium text-primary">₹{e.Salary.toLocaleString()}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        e.TicketCount > 0 ? 'bg-error/20 text-error font-bold' : 'bg-white/5 text-on-surface-variant'
                      }`}>
                        {e.TicketCount} active
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(e)}
                          className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-md transition-colors cursor-pointer border-none bg-transparent"
                          title="Edit"
                        >
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(e.EID, e.Name)}
                          className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-md transition-colors cursor-pointer border-none bg-transparent"
                          title="Delete"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Employee Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-panel-elevated rounded-2xl w-full max-w-lg p-lg flex flex-col gap-md">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
                {modalMode === 'add' ? 'Add New Employee' : `Edit Employee (${selectedEmployeeId})`}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface cursor-pointer border-none bg-transparent"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-md">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
                <div className="flex flex-col gap-xs">
                  <label className="font-label-sm text-label-sm text-on-surface-variant">Full Name</label>
                  <input
                    type="text"
                    required
                    className="input-glass rounded-lg px-3 py-2 text-body-sm text-on-surface"
                    placeholder="e.g. Souvik Dey"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-xs">
                  <label className="font-label-sm text-label-sm text-on-surface-variant">Email</label>
                  <input
                    type="email"
                    required
                    className="input-glass rounded-lg px-3 py-2 text-body-sm text-on-surface"
                    placeholder="e.g. souvik@clientpulse.app"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
                <div className="flex flex-col gap-xs">
                  <label className="font-label-sm text-label-sm text-on-surface-variant">Phone (10 digits)</label>
                  <input
                    type="tel"
                    required
                    maxLength="10"
                    pattern="[0-9]{10}"
                    className="input-glass rounded-lg px-3 py-2 text-body-sm text-on-surface"
                    placeholder="e.g. 9876543221"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-xs">
                  <label className="font-label-sm text-label-sm text-on-surface-variant">Address</label>
                  <input
                    type="text"
                    required
                    className="input-glass rounded-lg px-3 py-2 text-body-sm text-on-surface"
                    placeholder="e.g. Durgapur"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
                <div className="flex flex-col gap-xs">
                  <label className="font-label-sm text-label-sm text-on-surface-variant">Designation</label>
                  <select
                    className="input-glass rounded-lg px-3 py-2 text-body-sm text-on-surface bg-[#0d1c2d] border border-white/10"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                  >
                    <option value="Manager">Manager</option>
                    <option value="Support Executive">Support Executive</option>
                    <option value="Sales Executive">Sales Executive</option>
                  </select>
                </div>
                <div className="flex flex-col gap-xs">
                  <label className="font-label-sm text-label-sm text-on-surface-variant">Salary (₹ per month)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    className="input-glass rounded-lg px-3 py-2 text-body-sm text-on-surface"
                    placeholder="e.g. 45000"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                  />
                </div>
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
                  {modalMode === 'add' ? 'Save Employee' : 'Update Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
