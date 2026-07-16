import React, { useEffect, useState } from 'react';

export default function ActivityLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/activity-log')
      .then((res) => res.json())
      .then((data) => {
        setLogs(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex flex-col gap-lg pb-10">
      <div>
        <p className="text-body-sm text-on-surface-variant">
          This log records deletions from the Customer directory. Updates are logged automatically via database triggers on Customer row deletions.
        </p>
      </div>

      {/* Activity Log Table */}
      <div className="glass-panel rounded-xl overflow-hidden flex flex-col flex-1 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-b border-white/10 bg-surface-container-high/30">
                <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Audit Row</th>
                <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-error">Deleted Customer ID</th>
                <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Deleted Name</th>
                <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">Deletion Date (SQL Trigger Timestamp)</th>
              </tr>
            </thead>
            <tbody className="font-body-sm text-body-sm text-on-surface divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-8">
                    <span className="w-6 h-6 inline-block border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-8 text-on-surface-variant">
                    No customer deletion logs recorded in Customer_Audit table.
                  </td>
                </tr>
              ) : (
                logs.map((log, index) => (
                  <tr key={index} className="glass-table-row">
                    <td className="px-6 py-4 font-mono text-on-surface-variant">#{logs.length - index}</td>
                    <td className="px-6 py-4 font-mono text-error font-bold">{log.CID}</td>
                    <td className="px-6 py-4 font-medium text-on-surface">{log.Name}</td>
                    <td className="px-6 py-4 text-right text-on-surface-variant">{log.Deleted_Date}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
