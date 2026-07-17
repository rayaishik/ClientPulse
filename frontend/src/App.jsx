import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import CustomerProfile from './pages/CustomerProfile';
import Products from './pages/Products';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';
import Payments from './pages/Payments';
import SupportTickets from './pages/SupportTickets';
import Feedback from './pages/Feedback';
import Employees from './pages/Employees';
import ActivityLog from './pages/ActivityLog';
import Reports from './pages/Reports';
import MyProfile from './pages/MyProfile';

// Layout Component
import Layout from './components/Layout';

const IDLE_TIMEOUT_MS = 15 * 60 * 1000;  // 15 minutes
const WARN_BEFORE_MS  = 60 * 1000;        // show warning 1 min before logout

export default function App() {
  // ── Auth state (sessionStorage → clears on tab/browser close) ──────────
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem('crm_user');
    return saved ? JSON.parse(saved) : null;
  });

  // ── Inactivity-warning state ────────────────────────────────────────────
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown]     = useState(60);

  const idleTimer    = useRef(null);
  const warnTimer    = useRef(null);
  const countdownRef = useRef(null);

  // ── Login / Logout ──────────────────────────────────────────────────────
  const handleLogin = (userData) => {
    setUser(userData);
    sessionStorage.setItem('crm_user', JSON.stringify(userData));
  };

  const handleLogout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem('crm_user');
    setShowWarning(false);
    clearTimeout(idleTimer.current);
    clearTimeout(warnTimer.current);
    clearInterval(countdownRef.current);
  }, []);

  // ── Reset idle timer on activity ────────────────────────────────────────
  const resetIdleTimer = useCallback(() => {
    if (!user) return;

    // Dismiss warning if user acts during the warning window
    setShowWarning(false);
    setCountdown(60);
    clearInterval(countdownRef.current);
    clearTimeout(idleTimer.current);
    clearTimeout(warnTimer.current);

    // Schedule warning
    warnTimer.current = setTimeout(() => {
      setShowWarning(true);
      setCountdown(60);

      // Countdown tick
      countdownRef.current = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            clearInterval(countdownRef.current);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    }, IDLE_TIMEOUT_MS - WARN_BEFORE_MS);

    // Schedule actual logout
    idleTimer.current = setTimeout(() => {
      handleLogout();
    }, IDLE_TIMEOUT_MS);
  }, [user, handleLogout]);

  // ── Attach / detach activity listeners ─────────────────────────────────
  useEffect(() => {
    if (!user) return;

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    events.forEach((e) => window.addEventListener(e, resetIdleTimer, { passive: true }));
    resetIdleTimer(); // start the timer immediately on login

    return () => {
      events.forEach((e) => window.removeEventListener(e, resetIdleTimer));
      clearTimeout(idleTimer.current);
      clearTimeout(warnTimer.current);
      clearInterval(countdownRef.current);
    };
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Render ──────────────────────────────────────────────────────────────
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const AdminRoute = ({ children }) =>
    user.role === 'Admin' ? children : <Navigate to="/" replace />;

  return (
    <BrowserRouter>
      <Layout user={user} onLogout={handleLogout}>
        <Routes>
          <Route path="/"              element={<Dashboard user={user} />} />
          <Route path="/customers"     element={<Customers user={user} />} />
          <Route path="/customers/:id" element={<CustomerProfile />} />
          <Route path="/products"      element={<Products user={user} />} />
          <Route path="/orders"        element={<Orders user={user} />} />
          <Route path="/orders/:id"    element={<OrderDetails />} />
          <Route path="/tickets"       element={<SupportTickets user={user} />} />
          <Route path="/feedback"      element={<Feedback />} />
          <Route path="/payments"      element={<Payments user={user} />} />
          <Route path="/profile"       element={<MyProfile user={user} />} />

          {/* Admin-only routes */}
          <Route path="/employees"     element={<AdminRoute><Employees /></AdminRoute>} />
          <Route path="/activity-log"  element={<AdminRoute><ActivityLog /></AdminRoute>} />
          <Route path="/reports"       element={<AdminRoute><Reports /></AdminRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>

      {/* ── Inactivity Warning Modal ──────────────────────────────────── */}
      {showWarning && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-container border border-outline-variant rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl text-center">
            {/* Icon */}
            <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-error" style={{ fontSize: 32 }}>
                timer
              </span>
            </div>

            <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-2">
              Still there?
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mb-1">
              You'll be logged out due to inactivity in
            </p>

            {/* Countdown */}
            <p className="font-display-sm text-display-sm font-bold text-error my-4">
              {countdown}s
            </p>

            <p className="font-body-sm text-body-sm text-on-surface-variant mb-6">
              Move your mouse or click anywhere to stay logged in.
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleLogout}
                className="flex-1 py-2.5 rounded-xl border border-outline text-on-surface font-label-lg text-label-lg hover:bg-surface-container-high transition-colors"
              >
                Log Out
              </button>
              <button
                onClick={resetIdleTimer}
                className="flex-1 py-2.5 rounded-xl bg-primary text-on-primary font-label-lg text-label-lg hover:opacity-90 transition-opacity"
              >
                Stay Logged In
              </button>
            </div>
          </div>
        </div>
      )}
    </BrowserRouter>
  );
}
