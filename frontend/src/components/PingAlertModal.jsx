import React from 'react';
import { Check, X, MapPin } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';

export default function PingAlertModal({ ping, onClose, onAccepted }) {
  if (!ping) return null;

  const handleAccept = async () => {
    try {
      await api.acceptTransfer(ping.id);
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });
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
        bottom: '16px',
        right: '16px',
        maxWidth: '400px',
        width: 'calc(100% - 32px)',
        zIndex: 9999
      }}
    >
      <div
        className="card-bone"
        style={{
          padding: '16px',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--color-crimson)',
          background: 'var(--color-bone)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: 'var(--color-crimson)', fontSize: '14px' }}>🚨</span>
            <div>
              <span className="badge-mono" style={{ fontSize: '10px', color: 'var(--color-crimson)' }}>
                10KM GEOSPATIAL ALERT
              </span>
              <h4 style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-ink)', marginTop: '2px' }}>
                Emergency Restock Ping
              </h4>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn-ghost"
            style={{ padding: '2px', border: 'none', background: 'transparent' }}
          >
            <X size={14} />
          </button>
        </div>

        <div style={{ fontSize: '12px', color: 'var(--color-driftwood)', lineHeight: 1.4, marginBottom: '10px' }}>
          <strong style={{ color: 'var(--color-ink)' }}>{ping.to_store?.name}</strong> has experienced a critical stock depletion and requests:
          <div style={{ background: 'var(--color-linen)', borderRadius: 'var(--radius-md)', padding: '6px 10px', marginTop: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--color-stone)' }}>
            <span style={{ fontWeight: 500, color: 'var(--color-ink)' }}>{ping.ingredient?.name}</span>
            <span style={{ fontWeight: 500, color: 'var(--color-crimson)', fontSize: '13px', fontFamily: 'var(--font-mono)' }}>
              {ping.quantity} {ping.ingredient?.unit}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', fontSize: '11px', color: 'var(--color-ash)', fontFamily: 'var(--font-mono)' }}>
            <MapPin size={11} color="var(--color-ash)" />
            <span>Distance: <strong>{ping.distance_km || 2.5} km</strong> (&lt; 10km geofence)</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleAccept}
            className="btn-forest"
            style={{ flex: 1, justifyContent: 'center' }}
          >
            <Check size={13} />
            <span>Accept & Transfer Stock</span>
          </button>

          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Ignore
          </button>
        </div>
      </div>
    </div>
  );
}
