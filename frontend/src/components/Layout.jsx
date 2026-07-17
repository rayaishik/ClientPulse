import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import UniversalSearch from './UniversalSearch';

export default function Layout({ children, user, onLogout }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLinkClick = () => {
    setMobileNavOpen(false);
  };

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: 'dashboard', roles: ['Admin', 'Employee'] },
    { name: 'Customers', path: '/customers', icon: 'groups', roles: ['Admin', 'Employee'] },
    { name: 'Products', path: '/products', icon: 'inventory_2', roles: ['Admin', 'Employee'] },
    { name: 'Orders', path: '/orders', icon: 'shopping_cart', roles: ['Admin', 'Employee'] },
    { name: 'Payments', path: '/payments', icon: 'payments', roles: ['Admin', 'Employee'] },
    { name: 'Support Tickets', path: '/tickets', icon: 'support_agent', roles: ['Admin', 'Employee'] },
    { name: 'Feedback', path: '/feedback', icon: 'rate_review', roles: ['Admin', 'Employee'] },
    { name: 'Employees', path: '/employees', icon: 'badge', roles: ['Admin'] },
    { name: 'Activity Log', path: '/activity-log', icon: 'list_alt', roles: ['Admin'] },
    { name: 'Reports', path: '/reports', icon: 'analytics', roles: ['Admin'] },
    { name: 'My Profile', path: '/profile', icon: 'account_circle', roles: ['Employee'] },
  ];

  const visibleLinks = navLinks.filter((link) => link.roles.includes(user?.role));

  const pageTitleMap = {
    '/': 'Dashboard',
    '/customers': 'Customer Directory',
    '/products': 'Product Inventory',
    '/orders': 'Orders Directory',
    '/payments': 'Payment History',
    '/tickets': 'Support Tickets',
    '/feedback': 'Customer Feedback',
    '/employees': 'Employee Management',
    '/activity-log': 'Activity Audit Log',
    '/reports': 'Analytics & Reports',
    '/profile': 'My Profile',
  };

  // Match prefixes like /customers/C001 or /orders/O001
  let currentTitle = 'CRM Hub';
  if (location.pathname.startsWith('/customers/')) {
    currentTitle = 'Customer Profile';
  } else if (location.pathname.startsWith('/orders/')) {
    currentTitle = 'Order Details';
  } else {
    currentTitle = pageTitleMap[location.pathname] || 'CRM Hub';
  }

  const avatarUrl = user?.role === 'Admin'
    ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-XcRDhyACv1yA67fvrafZ8ZUnKSSH2ZcGp0WQYlVKNwZysYzFDgwr6JUb1uKBQvDYAZAVi7jmdYKKmtb4EPOdQZuHfJeD20seIjYM44l2X_n1Jn9itT7N8Aw5LH0dPhgozMcEBXQtuZt-lhmUs3vom_jWpYckRY0qsaE4Rs5ZaeCSCj0CQxRruUJkDBy3JbSwTM7On0q4nybU80fL9Ljg0OIWHrit_Ye7FElX5nHm3UtgOVGk33jLDcqPUpWmw57h6WOE3jsOBtc'
    : 'https://lh3.googleusercontent.com/aida-public/AB6AXuDFd9L3Hn8Y52p7qJ7S5-21dG1R_T9oKsnJbL-gK4zZgYxV65Pq6zP4b6e5Y=s120';

  return (
    <div className="flex h-screen w-full bg-[#051424] text-[#d4e4fa] overflow-hidden relative">
      {/* SideNavBar */}
      <nav
        className={`fixed left-0 top-0 h-full w-64 bg-[#051424]/90 backdrop-blur-xl border-r border-white/10 shadow-xl flex flex-col py-lg overflow-y-auto z-50 transition-all duration-300 ${
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
        id="sidenav"
      >
        {/* Header */}
        <div className="px-lg mb-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
            <span className="material-symbols-outlined text-primary font-bold">storefront</span>
          </div>
          <div>
            <h1 className="font-headline-md text-headline-md font-bold text-primary leading-none">ClientPulse</h1>
            <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">CRM Workspace</p>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 px-sm space-y-1">
          {visibleLinks.map((link) => {
            const isActive =
              location.pathname === link.path ||
              (link.path !== '/' && location.pathname.startsWith(link.path));

            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={handleLinkClick}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg scale-95 transition-all duration-200 ${
                  isActive
                    ? 'text-primary bg-primary-container/20 border-r-4 border-primary shadow-[0_0_15px_rgba(87,241,219,0.15)]'
                    : 'text-on-surface-variant hover:bg-white/5 hover:text-primary'
                }`}
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: `'FILL' ${isActive ? 1 : 0}` }}>
                  {link.icon}
                </span>
                <span className="font-label-md text-label-md">{link.name}</span>
              </Link>
            );
          })}
        </div>

        {/* User Info footer */}
        <div className="px-lg pt-md border-t border-white/5 mt-md flex flex-col gap-sm">
          <div className="flex items-center gap-3">
            <img
              alt={`${user?.role} Profile`}
              className="w-10 h-10 rounded-full border border-white/10"
              src={avatarUrl}
            />
            <div className="flex-1 overflow-hidden">
              <p className="font-label-md text-label-md text-on-surface truncate">{user?.name || user?.role}</p>
              <p className="font-label-sm text-label-sm text-on-surface-variant truncate">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2 border border-white/10 hover:border-error/50 hover:bg-error/10 text-on-surface-variant hover:text-error transition-all duration-300 rounded-lg text-body-sm font-label-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            <span>Sign Out</span>
          </button>
        </div>
      </nav>

      {/* Backdrop for mobile navigation */}
      {mobileNavOpen && (
        <div
          onClick={() => setMobileNavOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
        ></div>
      )}

      {/* Content wrapper */}
      <div className="flex-1 flex flex-col md:ml-64 w-full md:w-[calc(100%-16rem)] h-screen overflow-hidden relative">
        {/* Ambient Background Glow */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/3 z-0"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-tertiary-container/5 rounded-full blur-[100px] pointer-events-none translate-y-1/3 -translate-x-1/4 z-0"></div>

        {/* TopNavBar */}
        <header className="bg-transparent docked full-width top-0 sticky z-40 bg-surface/30 backdrop-blur-md border-b border-white/5 shadow-sm flex justify-between items-center px-container-margin py-md w-full relative z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileNavOpen(true)}
              className="md:hidden text-on-surface-variant hover:bg-surface-variant/20 rounded-full p-2 transition-colors"
              id="open-mobile-nav"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div>
              <h2 className="font-headline-md text-headline-md font-semibold text-on-surface">
                {currentTitle}
              </h2>
            </div>
          </div>

          {/* Universal Search (Desktop) */}
          <div className="flex-1 max-w-xl mx-4 hidden md:flex">
            <UniversalSearch />
          </div>

          <div className="flex items-center gap-2">
            <button className="text-on-surface-variant hover:bg-surface-variant/20 rounded-full p-2 transition-colors relative">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full animate-pulse"></span>
            </button>
            <div className="h-6 w-px bg-white/10 mx-2 hidden sm:block"></div>
            <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-full hover:bg-white/5 border border-white/5 transition-colors">
              <img
                alt={`${user?.role} Profile`}
                className="w-8 h-8 rounded-full border border-white/10"
                src={avatarUrl}
              />
              <span className="font-label-md text-label-md text-on-surface">{user?.role}</span>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-container-margin w-full relative z-10">
          <div className="max-w-7xl mx-auto flex flex-col gap-lg h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
