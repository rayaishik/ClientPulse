import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Feedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cidFilter, setCidFilter] = useState('');
  const [oidFilter, setOidFilter] = useState('');

  const fetchFeedback = () => {
    setLoading(true);
    let queryParams = [];
    if (cidFilter.trim()) {
      queryParams.push(`customerId=${encodeURIComponent(cidFilter.trim())}`);
    } else if (oidFilter.trim()) {
      queryParams.push(`orderId=${encodeURIComponent(oidFilter.trim())}`);
    }

    let url = '/api/feedback';
    if (queryParams.length > 0) {
      url += `?${queryParams.join('&')}`;
    }

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setFeedbacks(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchFeedback();
  }, [cidFilter, oidFilter]);

  return (
    <div className="flex flex-col gap-lg pb-10">
      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-sm">
        <div className="flex flex-col gap-xs w-full sm:w-48">
          <label className="text-[10px] text-on-surface-variant font-label-sm uppercase">Filter by Customer ID</label>
          <input
            type="text"
            className="input-glass rounded-lg px-3 py-1.5 text-body-sm text-on-surface"
            placeholder="e.g. C001"
            value={cidFilter}
            onChange={(e) => {
              setCidFilter(e.target.value);
              setOidFilter(''); // Clear other filter
            }}
          />
        </div>
        
        <div className="flex flex-col gap-xs w-full sm:w-48">
          <label className="text-[10px] text-on-surface-variant font-label-sm uppercase">Filter by Order ID</label>
          <input
            type="text"
            className="input-glass rounded-lg px-3 py-1.5 text-body-sm text-on-surface"
            placeholder="e.g. O001"
            value={oidFilter}
            onChange={(e) => {
              setOidFilter(e.target.value);
              setCidFilter(''); // Clear other filter
            }}
          />
        </div>

        {(cidFilter || oidFilter) && (
          <button
            onClick={() => {
              setCidFilter('');
              setOidFilter('');
            }}
            className="mt-4 text-xs text-primary hover:underline border-none bg-transparent cursor-pointer"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Feedback Reviews List */}
      <div className="glass-panel rounded-xl border border-white/10 shadow-lg p-6 flex flex-col gap-md">
        {loading ? (
          <div className="flex justify-center py-8">
            <span className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
          </div>
        ) : feedbacks.length === 0 ? (
          <p className="text-center py-8 text-on-surface-variant text-body-sm">
            No feedback reviews found in the database.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            {feedbacks.map((f) => (
              <div key={f.FID} className="p-5 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-3 justify-between">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-yellow-400 flex items-center font-bold text-sm">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <span key={idx} className="material-symbols-outlined text-sm font-fill-1" style={{ fontVariationSettings: `'FILL' ${idx < Math.round(f.Rating) ? 1 : 0}` }}>
                          star
                        </span>
                      ))}
                      <span className="font-semibold text-on-surface text-body-sm ml-2">({f.Rating} / 5)</span>
                    </span>
                    <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-mono">
                      {f.FID}
                    </span>
                  </div>
                  <p className="text-on-surface text-body-sm font-medium italic mt-2">&ldquo;{f.Comments}&rdquo;</p>
                </div>

                <div className="border-t border-white/5 pt-3 mt-3 flex justify-between items-center text-xs text-on-surface-variant">
                  <div>
                    <span className="block">
                      Customer:{' '}
                      <Link to={`/customers/${f.CID}`} className="text-primary hover:underline font-semibold">
                        {f.CustomerName} ({f.CID})
                      </Link>
                    </span>
                    <span className="block mt-0.5">
                      Order:{' '}
                      <Link to={`/orders/${f.OID}`} className="text-tertiary hover:underline font-semibold">
                        {f.OID}
                      </Link>
                    </span>
                  </div>
                  <span className="text-[10px] text-on-surface-variant/60">Reviewed on {f.FbDt}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
