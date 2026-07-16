import React, { useEffect, useState } from 'react';

export default function MyProfile({ user }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/employees/me')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch employee profile');
        return res.json();
      })
      .then((data) => {
        setProfile(data);
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
        Error loading profile: {error}
      </div>
    );
  }

  const avatarUrl = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDFd9L3Hn8Y52p7qJ7S5-21dG1R_T9oKsnJbL-gK4zZgYxV65Pq6zP4b6e5Y=s120';

  return (
    <div className="flex flex-col gap-lg pb-10">
      <div className="max-w-3xl mx-auto w-full">
        {/* Main Card */}
        <div className="glass-panel rounded-2xl p-lg md:p-xl flex flex-col gap-lg relative overflow-hidden">
          {/* Accent glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[60px] pointer-events-none -translate-y-1/2 translate-x-1/3"></div>

          {/* Profile Header */}
          <div className="flex flex-col md:flex-row items-center gap-md border-b border-white/5 pb-md">
            <img
              alt="Employee Profile Avatar"
              className="w-24 h-24 rounded-full border-2 border-primary/20 shadow-md"
              src={avatarUrl}
            />
            <div className="text-center md:text-left flex-1">
              <h2 className="font-display-lg text-display-md text-on-background font-bold">{profile.Name}</h2>
              <p className="font-label-md text-label-md text-primary mt-1">{profile.Designation}</p>
              <div className="flex flex-wrap gap-sm justify-center md:justify-start mt-sm">
                <span className="text-[11px] font-semibold bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">badge</span>
                  {profile.EID}
                </span>
                <span className="text-[11px] font-semibold bg-tertiary-container/10 text-tertiary px-3 py-1 rounded-full border border-tertiary-container/20 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">security</span>
                  {user.role}
                </span>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <div className="flex flex-col gap-xs">
              <span className="text-xs text-on-surface-variant font-label-sm uppercase tracking-wider">Email Address</span>
              <div className="flex items-center gap-2 p-sm bg-white/5 rounded-lg border border-white/5 text-on-surface">
                <span className="material-symbols-outlined text-primary text-md">mail</span>
                <span className="font-body-sm text-body-sm">{profile.Email}</span>
              </div>
            </div>

            <div className="flex flex-col gap-xs">
              <span className="text-xs text-on-surface-variant font-label-sm uppercase tracking-wider">Contact Number</span>
              <div className="flex items-center gap-2 p-sm bg-white/5 rounded-lg border border-white/5 text-on-surface">
                <span className="material-symbols-outlined text-primary text-md">call</span>
                <span className="font-body-sm text-body-sm">{profile.Phone}</span>
              </div>
            </div>

            <div className="flex flex-col gap-xs md:col-span-2">
              <span className="text-xs text-on-surface-variant font-label-sm uppercase tracking-wider">Office Address</span>
              <div className="flex items-center gap-2 p-sm bg-white/5 rounded-lg border border-white/5 text-on-surface">
                <span className="material-symbols-outlined text-primary text-md">location_on</span>
                <span className="font-body-sm text-body-sm">{profile.Address}</span>
              </div>
            </div>
          </div>

          {/* Ticket Statistics */}
          <div className="grid grid-cols-2 gap-sm border-t border-white/5 pt-md mt-sm">
            <div className="glass-panel p-md rounded-xl flex flex-col items-center justify-center text-center gap-1 bg-white/[0.02]">
              <span className="material-symbols-outlined text-yellow-400 text-2xl">pending_actions</span>
              <span className="font-headline-md text-3xl font-bold text-on-background mt-1">{profile.AssignedTickets}</span>
              <span className="text-xs text-on-surface-variant font-label-sm uppercase">Assigned Tickets</span>
            </div>

            <div className="glass-panel p-md rounded-xl flex flex-col items-center justify-center text-center gap-1 bg-white/[0.02]">
              <span className="material-symbols-outlined text-primary text-2xl">task_alt</span>
              <span className="font-headline-md text-3xl font-bold text-on-background mt-1">{profile.ResolvedTickets}</span>
              <span className="text-xs text-on-surface-variant font-label-sm uppercase">Resolved Tickets</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
