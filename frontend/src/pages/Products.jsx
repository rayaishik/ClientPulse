import React, { useEffect, useState } from 'react';

export default function Products({ user }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [selectedProductId, setSelectedProductId] = useState(null);

  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [newStockVal, setNewStockVal] = useState(0);

  // Form Fields
  const [pname, setPname] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(0);

  const fetchProducts = () => {
    setLoading(true);
    fetch(`/api/products?search=${encodeURIComponent(search)}`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts();
  }, [search]);

  const handleOpenAddModal = () => {
    setModalMode('add');
    setPname('');
    setCategory('Electronics');
    setPrice(0);
    setStock(0);
    setModalOpen(true);
  };

  const handleOpenEditModal = (p) => {
    setModalMode('edit');
    setSelectedProductId(p.PID);
    setPname(p.PName);
    setCategory(p.Category);
    setPrice(p.Price);
    setStock(p.Stock);
    setModalOpen(true);
  };

  const handleOpenStockModal = (p) => {
    setSelectedProductId(p.PID);
    setNewStockVal(p.Stock);
    setStockModalOpen(true);
  };

  const handleDelete = (pid, name) => {
    if (window.confirm(`Are you sure you want to delete product "${name}" (${pid})? This will delete all order histories for this product.`)) {
      fetch(`/api/products/${pid}`, {
        method: 'DELETE',
      })
        .then((res) => res.json())
        .then(() => {
          fetchProducts();
        });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { PName: pname, Category: category, Price: parseFloat(price), Stock: parseInt(stock, 10) };

    if (modalMode === 'add') {
      fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then((res) => res.json())
        .then(() => {
          setModalOpen(false);
          fetchProducts();
        });
    } else {
      fetch(`/api/products/${selectedProductId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then((res) => res.json())
        .then(() => {
          setModalOpen(false);
          fetchProducts();
        });
    }
  };

  const handleStockUpdate = (e) => {
    e.preventDefault();
    fetch(`/api/products/${selectedProductId}/stock`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ Stock: parseInt(newStockVal, 10) }),
    })
      .then((res) => res.json())
      .then(() => {
        setStockModalOpen(false);
        fetchProducts();
      });
  };

  return (
    <div className="flex flex-col gap-lg pb-10">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          {/* Search bar */}
          <div className="relative w-full sm:w-80">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
              search
            </span>
            <input
              className="w-full bg-[#122131]/50 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-on-surface font-body-md focus:outline-none focus:border-primary/50 transition-all placeholder:text-on-surface-variant/50"
              placeholder="Search product name, category..."
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Add Product Button (Admin Only) */}
        {user?.role === 'Admin' && (
          <button
            onClick={handleOpenAddModal}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-[#00a896] hover:from-[#45e0c8] hover:to-[#008f7f] text-[#003731] font-label-md text-label-md px-6 py-2.5 rounded-lg shadow-[0_4px_14px_rgba(87,241,219,0.25)] hover:shadow-[0_6px_20px_rgba(87,241,219,0.4)] transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer border-none"
          >
            <span className="material-symbols-outlined text-sm font-bold">add</span>
            Add Product
          </button>
        )}
      </div>

      {/* Glass Table Container */}
      <div className="glass-panel rounded-xl overflow-hidden flex flex-col flex-1 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-b border-white/10 bg-surface-container-high/30">
                <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">PID</th>
                <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Product Name</th>
                <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Stock</th>
                <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Status</th>
                {user?.role === 'Admin' && (
                  <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="font-body-sm text-body-sm text-on-surface divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={user?.role === 'Admin' ? 7 : 6} className="text-center py-8">
                    <span className="w-6 h-6 inline-block border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={user?.role === 'Admin' ? 7 : 6} className="text-center py-8 text-on-surface-variant">
                    No products found in database.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.PID} className="glass-table-row">
                    <td className="px-6 py-4 font-mono text-[#bcc7de]">{p.PID}</td>
                    <td className="px-6 py-4 font-medium text-on-surface">{p.PName}</td>
                    <td className="px-6 py-4 text-on-surface-variant">{p.Category}</td>
                    <td className="px-6 py-4 font-semibold text-primary">₹{p.Price.toLocaleString()}</td>
                    <td className="px-6 py-4 text-on-surface">{p.Stock} items</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                        p.Stock <= 0
                          ? 'bg-error/20 text-error'
                          : p.Stock < 20
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-primary/20 text-primary'
                      }`}>
                        {p.Stock <= 0 ? 'Out of Stock' : p.Stock < 20 ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                    {user?.role === 'Admin' && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenStockModal(p)}
                            className="p-1.5 text-on-surface-variant hover:text-tertiary hover:bg-tertiary-container/10 rounded-md transition-colors cursor-pointer border-none bg-transparent"
                            title="Adjust Stock"
                          >
                            <span className="material-symbols-outlined text-sm">inventory</span>
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-md transition-colors cursor-pointer border-none bg-transparent"
                            title="Edit"
                          >
                            <span className="material-symbols-outlined text-sm">edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(p.PID, p.PName)}
                            className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-md transition-colors cursor-pointer border-none bg-transparent"
                            title="Delete"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-panel-elevated rounded-2xl w-full max-w-md p-lg flex flex-col gap-md">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
                {modalMode === 'add' ? 'Add New Product' : `Edit Product (${selectedProductId})`}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface cursor-pointer border-none bg-transparent"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-md">
              <div className="flex flex-col gap-xs">
                <label className="font-label-sm text-label-sm text-on-surface-variant">Product Name</label>
                <input
                  type="text"
                  required
                  className="input-glass rounded-lg px-3 py-2 text-body-sm text-on-surface"
                  placeholder="e.g. Printer"
                  value={pname}
                  onChange={(e) => setPname(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-xs">
                <label className="font-label-sm text-label-sm text-on-surface-variant">Category</label>
                <select
                  className="input-glass rounded-lg px-3 py-2 text-body-sm text-on-surface bg-[#0d1c2d] border border-white/10"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Electronics">Electronics</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Office Supplies">Office Supplies</option>
                  <option value="Others">Others</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-sm">
                <div className="flex flex-col gap-xs">
                  <label className="font-label-sm text-label-sm text-on-surface-variant">Price (₹)</label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    required
                    className="input-glass rounded-lg px-3 py-2 text-body-sm text-on-surface"
                    placeholder="e.g. 15000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-xs">
                  <label className="font-label-sm text-label-sm text-on-surface-variant">Initial Stock</label>
                  <input
                    type="number"
                    min="0"
                    required
                    disabled={modalMode === 'edit'}
                    className="input-glass rounded-lg px-3 py-2 text-body-sm text-on-surface disabled:opacity-50"
                    placeholder="e.g. 50"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
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
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {stockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-panel-elevated rounded-2xl w-full max-w-sm p-lg flex flex-col gap-md">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
                Adjust Stock
              </h3>
              <button
                onClick={() => setStockModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface cursor-pointer border-none bg-transparent"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleStockUpdate} className="flex flex-col gap-md">
              <div className="flex flex-col gap-xs">
                <label className="font-label-sm text-label-sm text-on-surface-variant">
                  Update Stock Count for {selectedProductId}
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  className="input-glass rounded-lg px-3 py-2 text-body-sm text-on-surface"
                  value={newStockVal}
                  onChange={(e) => setNewStockVal(e.target.value)}
                />
              </div>

              <div className="flex gap-sm justify-end">
                <button
                  type="button"
                  onClick={() => setStockModalOpen(false)}
                  className="px-4 py-2 border border-white/10 rounded-lg text-body-sm text-on-surface-variant hover:text-on-surface hover:bg-white/5 cursor-pointer bg-transparent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary px-6 py-2 rounded-lg text-body-sm font-label-sm cursor-pointer border-none"
                >
                  Update Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
