import React from 'react';
import { Store, ShoppingCart, Radar, BarChart3 } from 'lucide-react';

export default function Header({ stores, activeStore, onSelectStore, activeTab, setActiveTab, socketConnected, pendingPingsCount }) {
  return (
    <header style={{
      borderBottom: '1px solid var(--color-stone)',
      background: 'var(--color-parchment)',
      padding: '12px 16px',
      position: 'sticky',
      top: 0,
      zIndex: 100
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
                  10KM GEOSPATIAL
                </span>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--color-ash)', margin: 0 }}>
                Micro-Deduction &bull; FEFO Surplus Balancing
              </p>
            </div>
          </div>

          {/* Socket.IO Real-Time Indicator (Top-right on all screens) */}
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
        </div>

        {/* Navigation Tabs - Full width & horizontally scrollable on mobile */}
        <nav className="header-nav">
          <button
            onClick={() => setActiveTab('pos')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: '13px',
              fontWeight: activeTab === 'pos' ? 500 : 400,
              cursor: 'pointer',
              border: 'none',
              background: activeTab === 'pos' ? 'var(--color-ink)' : 'transparent',
              color: activeTab === 'pos' ? 'var(--color-parchment)' : 'var(--color-driftwood)',
              transition: 'all 150ms'
            }}
          >
            <ShoppingCart size={13} />
            <span>POS Terminal</span>
          </button>

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
        </nav>

        {/* Store Selector (Full width on mobile) */}
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
