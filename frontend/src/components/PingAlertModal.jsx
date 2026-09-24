import React from 'react';
import { AlertTriangle, CheckCircle, X, MapPin } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';

export default function PingAlertModal({ ping, onClose, onAccepted }) {
  if (!ping) return null;

  const handleAccept = async () => {
    try {
      await api.acceptTransfer(ping.id);
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.8 } });
      if (onAccepted) onAccepted();
      onClose();
    } catch (err) {
      alert(`Transfer failed: ${err.message}`);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        maxWidth: '420px',
        width: '100%',
        zIndex: 9999,
        animation: 'slide-in-right 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      <div
        className="glass-panel"
        style={{
          background: 'rgba(15, 23, 42, 0.95)',
          border: '2px solid #f43f5e',
          boxShadow: '0 0 35px rgba(244, 63, 94, 0.4)',
          padding: '20px',
          borderRadius: '16px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(244, 63, 94, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={18} color="#f43f5e" />
            </div>
            <div>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#f43f5e', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                10km Geospatial Alert
              </span>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
                Emergency Restock Ping
              </h4>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.4, marginBottom: '14px' }}>
          <strong style={{ color: '#ffffff' }}>{ping.to_store?.name}</strong> has experienced a critical stock depletion and requests:
          <div style={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', padding: '8px 12px', marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, color: '#38bdf8' }}>{ping.ingredient?.name}</span>
            <span style={{ fontWeight: 800, color: '#fb7185', fontSize: '1rem' }}>
              {ping.quantity} {ping.ingredient?.unit}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px', fontSize: '0.75rem', color: '#94a3b8' }}>
            <MapPin size={12} color="#06b6d4" />
            <span>Store Distance: <strong style={{ color: '#22d3ee' }}>{ping.distance_km || 2.5} km</strong> (Within 10km geofence)</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleAccept}
            className="btn-success"
            style={{ flex: 1, justifyContent: 'center', padding: '10px', fontSize: '0.85rem' }}
          >
            <CheckCircle size={16} />
            <span>Accept & Transfer Stock</span>
          </button>

          <button
            onClick={onClose}
            className="btn-outline"
            style={{ padding: '10px 14px', fontSize: '0.85rem', color: '#94a3b8' }}
          >
            Ignore
          </button>
        </div>
      </div>
    </div>
  );
}
