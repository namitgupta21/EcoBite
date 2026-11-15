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
    <div className="emergency-ping-card">
      <div className="ping-card-inner">
        
        <div className="ping-card-header">
          <div className="ping-header-left">
            <span className="ping-siren">🚨</span>
            <div>
              <span className="ping-badge-tag">10KM GEOSPATIAL ALERT</span>
              <h4 className="ping-title">Emergency Restock Ping</h4>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="ping-close-x"
            aria-label="Close alert"
          >
            <X size={13} />
          </button>
        </div>

        <div className="ping-card-body">
          <p className="ping-lead-text">
            <strong>{ping.to_store?.name}</strong> has experienced a critical stock depletion and requests immediate surplus rebalancing:
          </p>

          <div className="ping-ingredient-chip">
            <span className="ping-ing-name">{ping.ingredient?.name}</span>
            <span className="ping-ing-qty">
              {ping.quantity} {ping.ingredient?.unit}
            </span>
          </div>

          <div className="ping-meta-row">
            <MapPin size={12} color="#6b7280" />
            <span>Distance: <strong>{ping.distance_km || 2.5} km</strong> (&lt; 10km geofence)</span>
          </div>
        </div>

        <div className="ping-action-row">
          <button
            type="button"
            onClick={handleAccept}
            className="btn-ping-accept"
          >
            <Check size={13} style={{ display: 'inline', marginRight: '4px' }} />
            <span>Accept & Transfer Stock</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="btn-ping-ignore"
          >
            Ignore
          </button>
        </div>

      </div>
    </div>
  );
}
