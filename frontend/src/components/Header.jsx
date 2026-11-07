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
  onLogout
}) {
  const isManager = currentUser?.role === 'manager';
  const isCustomer = currentUser?.role === 'customer' || currentUser?.isGuest;

  return (
    <header style={{
      borderBottom: '1px solid var(--color-stone)',
      background: 'var(--color-parchment)',
      padding: '12px 16px',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <div className="header-container">
        
        {/* Brand & Editorial Title */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '26px',
              height: '26px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-ink)',
              color: 'var(--color-parchment)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '13px',
              fontWeight: 500,
              flexShrink: 0
            }}>
              ✦
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '15px', fontWeight: 500, color: 'var(--color-ink)', letterSpacing: '-0.015em' }}>
                  Autonomous Kitchen
                </span>
                <span className="badge-mono" style={{ fontSize: '10px' }}>
                  {isManager ? 'MANAGER CONSOLE' : 'CUSTOMER ORDERING'}
                </span>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--color-ash)', margin: 0 }}>
                {isManager
                  ? '10km Radius Surplus Balancing • Micro-Deduction Engine'
                  : 'Fresh Farm-to-Table • Real-Time Inventory Synchronized'}
              </p>
            </div>
          </div>

          {/* Header Controls (Live Status + User Profile + Sign Out) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Socket.IO Real-Time Indicator */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              color: 'var(--color-ash)',
              background: 'var(--color-bone)',
              padding: '3px 8px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-stone)'
            }}>
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: socketConnected ? 'var(--color-verdant)' : 'var(--color-crimson)',
                display: 'inline-block'
              }} />
              <span>{socketConnected ? 'LIVE' : 'OFFLINE'}</span>
            </div>

            {/* Authenticated User Profile Pill */}
            {currentUser && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '11px',
                background: isManager ? 'rgba(31, 138, 101, 0.08)' : 'var(--color-bone)',
                color: isManager ? 'var(--color-verdant)' : 'var(--color-ink)',
                padding: '3px 8px',
                borderRadius: 'var(--radius-md)',
                border: isManager ? '1px solid var(--color-verdant)' : '1px solid var(--color-stone)',
                whiteSpace: 'nowrap'
              }}>
                {isManager ? <ShieldCheck size={12} /> : <User size={12} />}
                <span>{currentUser.name || currentUser.username}</span>
                {currentUser.isGuest && (
                  <span style={{ color: 'var(--color-driftwood)', fontSize: '10px' }}>(Guest)</span>
                )}
              </div>
            )}

            {/* Sign Out Button */}
            <button
              onClick={onLogout}
              className="btn-ghost"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '3px 8px',
                fontSize: '11px',
                color: 'var(--color-crimson)',
                border: '1px solid rgba(207, 45, 86, 0.3)',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-bone)',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
              title="Sign out and return to login page"
            >
              <LogOut size={12} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs - Role-Segregated */}
        <nav className="header-nav">
          {isCustomer ? (
            /* Customer View: ONLY POS Terminal is visible */
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setActiveTab('pos')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  border: 'none',
                  background: 'var(--color-ink)',
                  color: 'var(--color-parchment)',
                  transition: 'all 150ms'
                }}
              >
                <ShoppingCart size={13} />
                <span>POS Ordering Terminal</span>
              </button>
              <span className="badge-mono" style={{ fontSize: '10px', color: 'var(--color-driftwood)' }}>
                CUSTOMER ACCESS
              </span>
            </div>
          ) : (
            /* Manager View: ONLY 10km Radar & ESG Analytics (POS removed per design) */
            <>
              <button
                onClick={() => setActiveTab('manager')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '13px',
                  fontWeight: activeTab === 'manager' ? 500 : 400,
                  cursor: 'pointer',
                  border: 'none',
                  position: 'relative',
                  background: activeTab === 'manager' ? 'var(--color-ink)' : 'transparent',
                  color: activeTab === 'manager' ? 'var(--color-parchment)' : 'var(--color-driftwood)',
                  transition: 'all 150ms'
                }}
              >
                <Radar size={13} />
                <span>10km Radar & Manager</span>
                {pendingPingsCount > 0 && (
                  <span style={{
                    background: 'var(--color-crimson)',
                    color: 'var(--color-parchment)',
                    fontSize: '10px',
                    fontFamily: 'var(--font-mono)',
                    padding: '1px 5px',
                    borderRadius: 'var(--radius-sm)',
                    marginLeft: '3px'
                  }}>
                    {pendingPingsCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('analytics')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '13px',
                  fontWeight: activeTab === 'analytics' ? 500 : 400,
                  cursor: 'pointer',
                  border: 'none',
                  background: activeTab === 'analytics' ? 'var(--color-ink)' : 'transparent',
                  color: activeTab === 'analytics' ? 'var(--color-parchment)' : 'var(--color-driftwood)',
                  transition: 'all 150ms'
                }}
              >
                <BarChart3 size={13} />
                <span>ESG Analytics</span>
              </button>
            </>
          )}
        </nav>

        {/* Store Selector */}
        <div className="header-actions">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '100%' }}>
            <Store size={14} color="var(--color-ash)" style={{ flexShrink: 0 }} />
            <select
              value={activeStore?.id || ''}
              onChange={(e) => {
                const found = stores.find(s => s.id === e.target.value);
                if (found) onSelectStore(found);
              }}
              className="input-parchment"
              style={{ width: '100%', cursor: 'pointer' }}
              title={isManager ? "Franchise branch to manage" : "Store location to order from"}
            >
              {stores.map(store => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </select>
          </div>
        </div>

      </div>
    </header>
  );
}
