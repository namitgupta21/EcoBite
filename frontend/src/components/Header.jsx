import React from 'react';
import { Store, ShoppingCart, Radar, BarChart3, LogOut, ShieldCheck, User } from 'lucide-react';

export default function Header({
  stores,
  activeStore,
  onSelectStore,
  activeTab,
  setActiveTab,
  socketConnected,
  pendingPingsCount,
  currentUser,
  onLogout,
  onGoLanding
}) {
  const isManager = currentUser?.role === 'manager';
  const isCustomer = currentUser?.role === 'customer' || currentUser?.isGuest;

  return (
    <header className="app-topbar">
      {/* Topbar Row 1: Brand & User Controls */}
      <div className="topbar-main-bar">
        {/* Brand Block */}
        <div className="topbar-left">
          <div className="topbar-brand">
            <div className="topbar-logo-squircle">
              <svg viewBox="0 0 32 32" width="28" height="28" fill="none">
                <defs>
                  <linearGradient id="app-logo-bg" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#4ade80" />
                    <stop offset="50%" stopColor="#22c55e" />
                    <stop offset="100%" stopColor="#15803d" />
                  </linearGradient>
                </defs>
                <rect x="1" y="1" width="30" height="30" rx="7.5" fill="url(#app-logo-bg)" />
                <rect x="1" y="1" width="30" height="30" rx="7.5" stroke="rgba(255,255,255,0.7)" strokeWidth="1" />
                <path d="M16 23 C16 18 19 12 24 9 C24 16 21 21 16 23 Z" fill="#ffffff" />
                <path d="M16 23 C16 19 13.5 14 8.5 13 C8.5 18 11.5 21.5 16 23 Z" fill="#dcfce7" />
                <circle cx="21" cy="14" r="1.3" fill="#ffffff" />
              </svg>
            </div>
            <div className="topbar-title-block">
              <span className="topbar-title">Autonomous Kitchen</span>
              <span className="topbar-badge">
                {isManager ? 'MANAGER' : 'CUSTOMER'}
              </span>
              <span className="topbar-sub">
                {isManager ? '10km Radius Surplus Balancing · Micro-Deductions' : 'Fresh Farm-to-Table · Real-Time Stock Synced'}
              </span>
            </div>
          </div>
        </div>

        {/* User Actions Group (User pill, Landing button, Sign Out) */}
        <div className="topbar-actions-group">
          {currentUser && (
            <div
              className={`topbar-user-pill ${isManager ? 'topbar-user-pill--manager' : 'topbar-user-pill--customer'}`}
              title={`Signed in as ${currentUser.name || currentUser.username}`}
            >
              {isManager ? <ShieldCheck size={13} color="#15803d" /> : <User size={13} />}
              <span className="user-name-short">
                {isManager ? 'Manager' : (currentUser.name || currentUser.username)}
              </span>
              {currentUser.isGuest && (
                <span className="user-guest-badge">(Guest)</span>
              )}
            </div>
          )}

          {onGoLanding && (
            <button
              type="button"
              onClick={onGoLanding}
              className="btn-topbar-landing"
              title="View Public Landing Page"
            >
              <span>Landing</span>
            </button>
          )}

          <button
            type="button"
            onClick={onLogout}
            className="btn-topbar-signout"
            title="Sign out and return to login page"
          >
            <LogOut size={13} />
            <span className="btn-signout-text">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Topbar Row 2 on Mobile: Store Location Selector & Socket Status */}
      <div className="topbar-context-bar">
        {/* Store Location Selector */}
        <div className="store-selector-wrapper" title={isManager ? "Franchise branch to manage" : "Store location to order from"}>
          <Store size={14} className="store-icon" />
          <select
            value={activeStore?.id || ''}
            onChange={(e) => {
              const found = stores.find(s => s.id === e.target.value);
              if (found) onSelectStore(found);
            }}
            className="store-select"
            aria-label="Select Store"
          >
            {stores.map(store => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>
        </div>

        {/* Real-time Socket Indicator */}
        <div className="live-status-pill" title={socketConnected ? 'Real-Time BOM Socket Online' : 'Socket Offline'}>
          <span
            className="live-dot"
            style={{
              background: socketConnected ? '#10b981' : '#ef4444',
              boxShadow: socketConnected ? '0 0 6px rgba(16, 185, 129, 0.4)' : 'none'
            }}
          />
          <span className="live-status-text">{socketConnected ? 'LIVE' : 'OFFLINE'}</span>
        </div>
      </div>

      {/* Topbar Row 3 on Mobile / Center on Desktop: Navigation Tabs */}
      <nav className="app-nav-tabs">
        {isCustomer ? (
          /* Customer View: ONLY POS Terminal is visible */
          <button
            type="button"
            onClick={() => setActiveTab('pos')}
            className={`app-tab-btn ${activeTab === 'pos' ? 'active' : ''}`}
            title="Customer Ordering Terminal"
          >
            <ShoppingCart size={15} />
            <span>POS Ordering Terminal</span>
          </button>
        ) : (
          /* Manager View: 10km Radar & ESG Analytics */
          <>
            <button
              type="button"
              onClick={() => setActiveTab('manager')}
              className={`app-tab-btn ${activeTab === 'manager' ? 'active' : ''}`}
              title="10km Geospatial Radar & Manager Dashboard"
            >
              <Radar size={15} />
              <span>10km Radar & Manager</span>
              {pendingPingsCount > 0 && (
                <span className="tab-pill-badge">{pendingPingsCount}</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('analytics')}
              className={`app-tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
              title="ESG Sustainability & Cost Savings Analytics"
            >
              <BarChart3 size={15} />
              <span>ESG Analytics</span>
            </button>
          </>
        )}
      </nav>
    </header>
  );
}
