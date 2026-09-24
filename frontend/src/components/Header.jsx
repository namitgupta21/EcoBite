import React from 'react';
import { Store, Wifi, WifiOff, ShoppingCart, Radar, BarChart3, Sparkles } from 'lucide-react';

export default function Header({ stores, activeStore, onSelectStore, activeTab, setActiveTab, socketConnected, pendingPingsCount }) {
  return (
    <header className="glass-panel" style={{ margin: '16px 24px', padding: '14px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Logo & System Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)'
          }}>
            <Sparkles size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#f8fafc' }}>
                Autonomous Kitchen
              </h1>
              <span style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                padding: '2px 8px',
                borderRadius: '6px',
                background: 'rgba(6, 182, 212, 0.15)',
                color: '#22d3ee',
                border: '1px solid rgba(6, 182, 212, 0.3)'
              }}>
                10km Micro-Redistribution
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Real-time Recipe Deduction &bull; FEFO Geospatial Redistribution
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(15, 23, 42, 0.7)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <button
            onClick={() => setActiveTab('pos')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              transition: 'all 0.2s',
              background: activeTab === 'pos' ? 'linear-gradient(135deg, #06b6d4, #3b82f6)' : 'transparent',
              color: activeTab === 'pos' ? '#ffffff' : '#94a3b8'
            }}
          >
            <ShoppingCart size={16} />
            <span>POS Terminal</span>
          </button>

          <button
            onClick={() => setActiveTab('manager')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              transition: 'all 0.2s',
              position: 'relative',
              background: activeTab === 'manager' ? 'linear-gradient(135deg, #06b6d4, #3b82f6)' : 'transparent',
              color: activeTab === 'manager' ? '#ffffff' : '#94a3b8'
            }}
          >
            <Radar size={16} />
            <span>10km Radar & Manager</span>
            {pendingPingsCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: '#f43f5e',
                color: '#ffffff',
                fontSize: '0.65rem',
                fontWeight: 700,
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'pulse-border 1.5s infinite'
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
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              transition: 'all 0.2s',
              background: activeTab === 'analytics' ? 'linear-gradient(135deg, #06b6d4, #3b82f6)' : 'transparent',
              color: activeTab === 'analytics' ? '#ffffff' : '#94a3b8'
            }}
          >
            <BarChart3 size={16} />
            <span>ESG & Analytics</span>
          </button>
        </div>

        {/* Store Selector & Socket Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          
          {/* Active Store Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Store size={18} color="#06b6d4" />
            <select
              value={activeStore?.id || ''}
              onChange={(e) => {
                const found = stores.find(s => s.id === e.target.value);
                if (found) onSelectStore(found);
              }}
              className="glass-input"
              style={{ fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer', minWidth: '220px' }}
            >
              {stores.map(store => (
                <option key={store.id} value={store.id} style={{ background: '#111827', color: '#f8fafc' }}>
                  {store.name}
                </option>
              ))}
            </select>
          </div>

          {/* Real-time Socket Indicator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '20px',
            background: socketConnected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
            border: `1px solid ${socketConnected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`
          }}>
            {socketConnected ? <Wifi size={14} color="#10b981" /> : <WifiOff size={14} color="#f43f5e" />}
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: socketConnected ? '#34d399' : '#fb7185' }}>
              {socketConnected ? 'Live Socket.IO' : 'Disconnected'}
            </span>
          </div>

        </div>

      </div>
    </header>
  );
}
