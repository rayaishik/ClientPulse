import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Customers({ user }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [gender, setGender] = useState('Male');
  const [customerType, setCustomerType] = useState('Regular');

  const navigate = useNavigate();

  const fetchCustomers = () => {
    setLoading(true);
    let url = `/api/customers?search=${encodeURIComponent(search)}`;
    if (typeFilter !== 'All Types') {
      url += `&type=${encodeURIComponent(typeFilter)}`;
    }
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setCustomers(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCustomers();
  }, [search, typeFilter]);

  const handleOpenAddModal = () => {
    setModalMode('add');
    setName('');
    setEmail('');
    setPhone('');
    setAddress('');
    setGender('Male');
    setCustomerType('Regular');
    setModalOpen(true);
  };

  const handleOpenEditModal = (c, e) => {
    e.stopPropagation(); // Stop navigation to profile
    setModalMode('edit');
    setSelectedCustomerId(c.CID);
    setName(c.Name);
    setEmail(c.Email);
    setPhone(c.Phone);
    setAddress(c.Address);
    setGender(c.Gender);
    setCustomerType(c.CustomerType);
    setModalOpen(true);
  };

  const handleDelete = (cid, name, e) => {
    e.stopPropagation(); // Stop navigation
    if (window.confirm(`Are you sure you want to delete customer ${name} (${cid})? This will delete all their orders, support tickets, and log the deletion in Customer_Audit.`)) {
      fetch(`/api/customers/${cid}`, {
        method: 'DELETE',
      })
        .then((res) => res.json())
        .then(() => {
          fetchCustomers();
        });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { Name: name, Email: email, Phone: phone, Address: address, Gender: gender, CustomerType: customerType };

    if (modalMode === 'add') {
      fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then((res) => res.json())
        .then(() => {
          setModalOpen(false);
          fetchCustomers();
        });
    } else {
      fetch(`/api/customers/${selectedCustomerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then((res) => res.json())
        .then(() => {
          setModalOpen(false);
          fetchCustomers();
        });
    }
  };

  const getInitials = (fullName) => {
    if (!fullName) return '';
    return fullName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className="flex flex-col gap-lg pb-10">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          {/* Search bar (mobile search/filter header block style) */}
          <div className="relative w-full sm:w-80">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
              search
            </span>
            <input
              className="w-full bg-[#122131]/50 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-on-surface font-body-md focus:outline-none focus:border-primary/50 transition-all placeholder:text-on-surface-variant/50"
              placeholder="Search by name, email, phone..."
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Filter Dropdown */}
          <div className="relative inline-block text-left glass-panel rounded-lg w-full sm:w-auto z-20">
            <button
              onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
              className="inline-flex justify-between items-center w-full sm:w-48 px-4 py-2.5 text-body-sm font-body-sm text-on-surface hover:text-primary transition-colors focus:outline-none cursor-pointer"
              type="button"
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">filter_list</span>
                <span>{typeFilter === 'All Types' ? 'Customer Type' : typeFilter}</span>
              </div>
              <span className="material-symbols-outlined text-sm">expand_more</span>
            </button>
            
            {filterDropdownOpen && (
              <div className="origin-top-right absolute left-0 mt-2 w-48 rounded-lg shadow-xl glass-panel ring-1 ring-black ring-opacity-5 focus:outline-none z-30">
                <div className="py-1">
                  {['All Types', 'VIP', 'Regular', 'Corporate'].map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        setTypeFilter(t);
                        setFilterDropdownOpen(false);
                      }}
                      className="w-full text-left text-on-surface block px-4 py-2 text-body-sm hover:bg-white/5 hover:text-primary transition-colors cursor-pointer border-none bg-transparent"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-[#00a896] hover:from-[#45e0c8] hover:to-[#008f7f] text-[#003731] font-label-md text-label-md px-6 py-2.5 rounded-lg shadow-[0_4px_14px_rgba(87,241,219,0.25)] hover:shadow-[0_6px_20px_rgba(87,241,219,0.4)] transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer border-none"
        >
          <span className="material-symbols-outlined text-sm font-bold">add</span>
          Add Customer
        </button>
      </div>

      {/* Glass Table Container */}
      <div className="glass-panel rounded-xl overflow-hidden flex flex-col flex-1 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-b border-white/10 bg-surface-container-high/30">
                <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">CID</th>
                <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Phone</th>
                <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider hidden md:table-cell">Address</th>
                <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Customer Type</th>
                <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider hidden lg:table-cell">Registration Date</th>
                <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="font-body-sm text-body-sm text-on-surface divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8">
                    <span className="w-6 h-6 inline-block border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-on-surface-variant">
                    No customers found matching filters.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr
                    key={c.CID}
                    onClick={() => navigate(`/customers/${c.CID}`)}
                    className="glass-table-row group cursor-pointer"
                  >
                    <td className="px-6 py-4 font-mono text-primary">{c.CID}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs border border-primary/30">
                          {getInitials(c.Name)}
                        </div>
                        <span className="font-medium hover:underline text-on-surface">{c.Name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant">{c.Email}</td>
                    <td className="px-6 py-4 text-on-surface-variant">{c.Phone}</td>
                    <td className="px-6 py-4 text-on-surface-variant hidden md:table-cell truncate max-w-[200px]">
                      {c.Address}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        c.CustomerType === 'VIP'
                          ? 'bg-tertiary-container/20 text-tertiary border-tertiary-container/30'
                          : c.CustomerType === 'Corporate'
                          ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                          : 'bg-surface-variant text-on-surface-variant border-white/10'
                      }`}>
                        {c.CustomerType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant hidden lg:table-cell">{c.RegDt}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={(e) => handleOpenEditModal(c, e)}
                          className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-md transition-colors cursor-pointer border-none bg-transparent"
                          title="Edit"
                        >
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                        {user?.role === 'Admin' && (
                          <button
                            onClick={(e) => handleDelete(c.CID, c.Name, e)}
                            className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-md transition-colors cursor-pointer border-none bg-transparent"
                            title="Delete"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Customer Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-panel-elevated rounded-2xl w-full max-w-lg p-lg flex flex-col gap-md">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
                {modalMode === 'add' ? 'Add New Customer' : `Edit Customer (${selectedCustomerId})`}
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
                    placeholder="e.g. Rahul Sharma"
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
                    placeholder="e.g. rahul@email.com"
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
                    placeholder="e.g. 9876543210"
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
                    placeholder="e.g. Kolkata"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
                <div className="flex flex-col gap-xs">
                  <label className="font-label-sm text-label-sm text-on-surface-variant">Gender</label>
                  <select
                    className="input-glass rounded-lg px-3 py-2 text-body-sm text-on-surface bg-[#0d1c2d] border border-white/10"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="flex flex-col gap-xs">
                  <label className="font-label-sm text-label-sm text-on-surface-variant">Customer Type</label>
                  <select
                    className="input-glass rounded-lg px-3 py-2 text-body-sm text-on-surface bg-[#0d1c2d] border border-white/10"
                    value={customerType}
                    onChange={(e) => setCustomerType(e.target.value)}
                  >
                    <option value="Regular">Regular</option>
                    <option value="VIP">VIP</option>
                    <option value="Corporate">Corporate</option>
                  </select>
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
                  {modalMode === 'add' ? 'Save Customer' : 'Update Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
