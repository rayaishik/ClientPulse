import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function UniversalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ customers: [], products: [], orders: [] });
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!query.trim()) {
      setResults({ customers: [], products: [], orders: [] });
      setIsOpen(false);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (response.ok) {
          const data = await response.json();
          setResults(data);
          setIsOpen(true);
        }
      } catch (err) {
        console.error('Error during search:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (path) => {
    setQuery('');
    setIsOpen(false);
    navigate(path);
  };

  const hasResults =
    results.customers.length > 0 ||
    results.products.length > 0 ||
    results.orders.length > 0;

  return (
    <div ref={dropdownRef} className="relative w-full focus-within:ring-2 focus-within:ring-primary/50 rounded-lg group z-50">
      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">
        search
      </span>
      <input
        className="w-full bg-surface-container-high/50 border border-white/10 rounded-lg pl-10 pr-10 py-2 text-on-surface font-body-md focus:outline-none focus:border-primary/50 focus:bg-[#1c2b3c]/80 transition-all placeholder:text-on-surface-variant/50"
        placeholder="Search customers, products, orders, emails..."
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => {
          if (query.trim()) setIsOpen(true);
        }}
      />
      {loading && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
      )}

      {/* Results Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 rounded-xl border border-white/10 bg-[#122131]/95 backdrop-blur-xl shadow-2xl p-4 max-h-[400px] overflow-y-auto z-[999] flex flex-col gap-md">
          {!hasResults ? (
            <p className="text-on-surface-variant text-body-sm text-center py-2">No results found for "{query}"</p>
          ) : (
            <>
              {/* Customers Section */}
              {results.customers.length > 0 && (
                <div>
                  <h4 className="font-label-sm text-label-sm text-primary uppercase tracking-wider mb-2">Customers</h4>
                  <div className="flex flex-col gap-xs">
                    {results.customers.map((c) => (
                      <div
                        key={c.CID}
                        onClick={() => handleSelect(`/customers/${c.CID}`)}
                        className="p-2 rounded-lg hover:bg-white/5 cursor-pointer flex justify-between items-center transition-colors"
                      >
                        <div>
                          <p className="text-body-sm font-medium text-on-surface">{c.Name}</p>
                          <p className="text-xs text-on-surface-variant">{c.Email} | {c.Phone}</p>
                        </div>
                        <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-0.5 rounded">
                          {c.CID}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Products Section */}
              {results.products.length > 0 && (
                <div>
                  <h4 className="font-label-sm text-label-sm text-tertiary uppercase tracking-wider mb-2">Products</h4>
                  <div className="flex flex-col gap-xs">
                    {results.products.map((p) => (
                      <div
                        key={p.PID}
                        onClick={() => handleSelect(`/products`)} // Route to products inventory list
                        className="p-2 rounded-lg hover:bg-white/5 cursor-pointer flex justify-between items-center transition-colors"
                      >
                        <div>
                          <p className="text-body-sm font-medium text-on-surface">{p.PName}</p>
                          <p className="text-xs text-on-surface-variant">{p.Category}</p>
                        </div>
                        <span className="text-xs font-semibold text-primary">
                          ₹{p.Price.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Orders Section */}
              {results.orders.length > 0 && (
                <div>
                  <h4 className="font-label-sm text-label-sm text-secondary uppercase tracking-wider mb-2">Orders</h4>
                  <div className="flex flex-col gap-xs">
                    {results.orders.map((o) => (
                      <div
                        key={o.OID}
                        onClick={() => handleSelect(`/orders/${o.OID}`)}
                        className="p-2 rounded-lg hover:bg-white/5 cursor-pointer flex justify-between items-center transition-colors"
                      >
                        <div>
                          <p className="text-body-sm font-medium text-on-surface">Order {o.OID}</p>
                          <p className="text-xs text-on-surface-variant">Placed on {o.ODt}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-semibold text-on-surface">₹{o.TotalAmt.toLocaleString()}</p>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                            o.Status === 'Completed' ? 'bg-primary/20 text-primary' : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {o.Status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
