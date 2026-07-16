import React, { useState } from 'react';

export default function Login({ onLogin }) {
  const [role, setRole] = useState('Admin'); // 'Admin' or 'Employee'
  const [email, setEmail] = useState('admin@retailcrm.com');
  const [password, setPassword] = useState('admin123');

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    if (newRole === 'Admin') {
      setEmail('admin@retailcrm.com');
      setPassword('admin123');
    } else {
      setEmail('employee@retailcrm.com');
      setPassword('emp123');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (role === 'Admin') {
      onLogin({
        name: 'Ananya Bose',
        email: 'ananya.bose@retailcrm.com',
        role: 'Admin',
        eid: 'E001'
      });
    } else {
      onLogin({
        name: 'Souvik Dey',
        email: 'souvik.dey@retailcrm.com',
        role: 'Employee',
        eid: 'E002'
      });
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-md md:p-container-margin relative overflow-hidden bg-[#051424]">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-tertiary-container/5 blur-[150px]"></div>
      </div>

      {/* Login Container */}
      <main className="w-full max-w-md relative z-10">
        <div className="glass-panel rounded-2xl p-lg md:p-xl flex flex-col gap-lg w-full">
          {/* Header */}
          <div className="text-center flex flex-col items-center gap-sm">
            <div className="w-16 h-16 rounded-xl bg-surface-container flex items-center justify-center border border-white/10 mb-2">
              <span className="material-symbols-outlined text-[32px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                dashboard
              </span>
            </div>
            <h1 className="font-display-lg text-display-lg text-on-background">RetailCRM</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">Sign in to your enterprise hub</p>
          </div>

          {/* Role Selector */}
          <div className="grid grid-cols-2 gap-sm mt-sm">
            <button
              className={`role-card rounded-lg p-sm flex flex-col items-center justify-center gap-xs cursor-pointer focus:outline-none ${
                role === 'Admin' ? 'active' : ''
              }`}
              onClick={() => handleRoleChange('Admin')}
              type="button"
            >
              <span className={`material-symbols-outlined text-xl ${role === 'Admin' ? 'text-primary' : 'text-on-surface-variant'}`} style={{ fontVariationSettings: `'FILL' ${role === 'Admin' ? 1 : 0}` }}>
                admin_panel_settings
              </span>
              <span className={`font-label-md text-label-md ${role === 'Admin' ? 'text-on-surface' : 'text-on-surface-variant'}`}>Admin</span>
            </button>
            <button
              className={`role-card rounded-lg p-sm flex flex-col items-center justify-center gap-xs cursor-pointer focus:outline-none ${
                role === 'Employee' ? 'active' : ''
              }`}
              onClick={() => handleRoleChange('Employee')}
              type="button"
            >
              <span className={`material-symbols-outlined text-xl ${role === 'Employee' ? 'text-primary' : 'text-on-surface-variant'}`} style={{ fontVariationSettings: `'FILL' ${role === 'Employee' ? 1 : 0}` }}>
                badge
              </span>
              <span className={`font-label-md text-label-md ${role === 'Employee' ? 'text-on-surface' : 'text-on-surface-variant'}`}>Employee</span>
            </button>
          </div>

          {/* Form */}
          <form className="flex flex-col gap-md" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-xs">
              <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="email">Email Address</label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-sm text-on-surface-variant text-[20px] pointer-events-none">
                  mail
                </span>
                <input
                  className="input-glass w-full rounded-lg h-11 pl-[40px] pr-sm font-body-sm text-body-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none"
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={role === 'Admin' ? 'admin@retailcrm.com' : 'employee@retailcrm.com'}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-xs">
              <div className="flex justify-between items-center">
                <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="password">Password</label>
              </div>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-sm text-on-surface-variant text-[20px] pointer-events-none">
                  lock
                </span>
                <input
                  className="input-glass w-full rounded-lg h-11 pl-[40px] pr-sm font-body-sm text-body-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none"
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              className="btn-primary w-full h-11 rounded-lg font-label-md text-label-md flex items-center justify-center gap-sm mt-md cursor-pointer border-none"
              type="submit"
            >
              <span>Sign In to Dashboard</span>
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
