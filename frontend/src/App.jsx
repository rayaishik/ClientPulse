import React, { useState } from 'react';
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

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('crm_user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('crm_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('crm_user');
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  // Admin page router guard
  const AdminRoute = ({ children }) => {
    return user.role === 'Admin' ? children : <Navigate to="/" replace />;
  };

  return (
    <BrowserRouter>
      <Layout user={user} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Dashboard user={user} />} />
          <Route path="/customers" element={<Customers user={user} />} />
          <Route path="/customers/:id" element={<CustomerProfile />} />
          <Route path="/products" element={<Products user={user} />} />
          <Route path="/orders" element={<Orders user={user} />} />
          <Route path="/orders/:id" element={<OrderDetails />} />
          <Route path="/tickets" element={<SupportTickets user={user} />} />
          <Route path="/feedback" element={<Feedback />} />
          
          <Route path="/payments" element={<Payments user={user} />} />
          <Route path="/profile" element={<MyProfile user={user} />} />
          
          {/* Admin Restricted Routes */}
          <Route
            path="/employees"
            element={
              <AdminRoute>
                <Employees />
              </AdminRoute>
            }
          />
          <Route
            path="/activity-log"
            element={
              <AdminRoute>
                <ActivityLog />
              </AdminRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <AdminRoute>
                <Reports />
              </AdminRoute>
            }
          />

          {/* Catch all redirect to dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
