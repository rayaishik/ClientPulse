import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Intercept fetch to dynamically append user role and EID headers
const originalFetch = window.fetch;
window.fetch = function (url, options = {}) {
  const userStr = localStorage.getItem('crm_user');
  if (userStr) {
    const user = JSON.parse(userStr);
    options.headers = {
      ...options.headers,
      'x-user-role': user.role || '',
      'x-user-eid': user.eid || ''
    };
  }
  return originalFetch(url, options);
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
