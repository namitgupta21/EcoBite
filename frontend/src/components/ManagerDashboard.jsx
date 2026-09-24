import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Radar,
  ArrowRight,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Sparkles,
  Package,
  Layers,
  MapPin,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';

// Create custom futuristic pulsing marker icons for Leaflet
const createStoreIcon = (isCurrent, hasShortage, isDonor) => {
  let bgColor = '#3b82f6';
  let borderColor = '#60a5fa';

  if (isCurrent) {
    bgColor = '#06b6d4';
    borderColor = '#22d3ee';
  } else if (hasShortage) {
    bgColor = '#f43f5e';
    borderColor = '#fb7185';
  } else if (isDonor) {
    bgColor = '#10b981';
    borderColor = '#34d399';
  }

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        position: relative;
        width: 32px;
        height: 32px;
        background: ${bgColor};
        border: 2px solid ${borderColor};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 15px ${borderColor};
      ">
        <div style="width: 10px; height: 10px; background: #ffffff; border-radius: 50%;"></div>
        ${hasShortage ? `<div style="position: absolute; inset: -6px; border: 2px solid #f43f5e; border-radius: 50%; animation: pulse-border 1.5s infinite;"></div>` : ''}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

export default function ManagerDashboard({
  activeStore,
  stores,
  inventory,
  transferPings,
  onRefresh
}) {
  const [scanLoading, setScanLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Filter incoming pings for this store (where this store is the fulfilling donor)
  const incomingPings = transferPings.filter(
    p => p.from_store_id === activeStore?.id && p.status === 'PENDING'
  );

  // Filter outgoing pings for this store (where this store is the needy recipient)
  const outgoingPings = transferPings.filter(
    p => p.to_store_id === activeStore?.id && p.status === 'PENDING'
  );

  // Filter completed/historical pings
  const completedPings = transferPings.filter(
    p => (p.from_store_id === activeStore?.id || p.to_store_id === activeStore?.id) &&
      p.status === 'COMPLETED'
  );

  // Handle Accept Transfer
  const handleAcceptTransfer = async (pingId) => {
    setActionLoadingId(pingId);
    try {
      await api.acceptTransfer(pingId);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(`Transfer failed: ${err.message}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Decline Transfer
  const handleRejectTransfer = async (pingId) => {
    setActionLoadingId(pingId);
    try {
      await api.rejectTransfer(pingId);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(`Decline failed: ${err.message}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Trigger manual network scan
  const handleRunScan = async () => {
    setScanLoading(true);
    try {
      const res = await api.triggerScan();
      alert(res.message);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(`Scan failed: ${err.message}`);
    } finally {
      setScanLoading(false);
    }
  };

  // Prepare active transfer vectors for map visualization
  const activeVectors = transferPings
    .filter(p => p.status === 'PENDING' && p.from_store?.lat && p.to_store?.lat)
    .map(p => ({
      id: p.id,
      from: [Number(p.from_store.lat), Number(p.from_store.log)],
      to: [Number(p.to_store.lat), Number(p.to_store.log)],
      label: `${p.quantity} ${p.ingredient?.unit || ''} ${p.ingredient?.name || ''}`
    }));

  const activeLat = Number(activeStore?.lat) || 28.6315;
  const activeLog = Number(activeStore?.log) || 77.2167;

  return (
    <div style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Banner: Store Status & Network Scan */}
      <div className="glass-panel" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#06b6d4', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Store Management Console
            </span>
            <span className="badge-optimal" style={{ padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>
              Live Telemetry
            </span>
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f8fafc', marginTop: '4px' }}>
            {activeStore?.name}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px', fontSize: '0.85rem', color: '#94a3b8' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={14} color="#06b6d4" /> {activeStore?.address}
            </span>
            <span>&bull;</span>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#38bdf8' }}>
              {activeLat.toFixed(4)}°N, {activeLog.toFixed(4)}°E
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={onRefresh}
            className="btn-outline"
            style={{ padding: '10px 16px', fontSize: '0.85rem' }}
          >
            <RefreshCw size={16} />
            <span>Refresh Telemetry</span>
          </button>

          <button
            onClick={handleRunScan}
            disabled={scanLoading}
            className="btn-primary"
            style={{ padding: '10px 18px', fontSize: '0.85rem' }}
          >
            <Sparkles size={16} />
            <span>{scanLoading ? 'Scanning Network...' : 'Run Autonomous 10km Scan'}</span>
          </button>
        </div>
      </div>

      {/* Grid: 10km Leaflet Map Radar (Left) + Inventory Health Matrix (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
        
        {/* 10km Interactive Leaflet Radar Map */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Radar size={20} color="#06b6d4" />
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
                  10km Geospatial Geofence Radar
                </h3>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  Real-time radius perimeter centered on {activeStore?.name}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#06b6d4', boxShadow: '0 0 8px #06b6d4' }}></span>
              <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>10km Geofence Active</span>
            </div>
          </div>

          {/* Leaflet Map Container */}
          <div style={{ height: '420px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
            <MapContainer
              key={`${activeLat}-${activeLog}`}
              center={[activeLat, activeLog]}
              zoom={12}
              scrollWheelZoom={false}
              style={{ width: '100%', height: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* 10km Geofence Boundary Circle around Active Store */}
              <Circle
                center={[activeLat, activeLog]}
                radius={10000} // 10,000 meters = 10km
                pathOptions={{
                  color: '#06b6d4',
                  fillColor: '#06b6d4',
                  fillOpacity: 0.08,
                  weight: 2,
                  dashArray: '6, 6'
                }}
              />

              {/* Store Markers */}
              {stores.map(store => {
                const isCurrent = store.id === activeStore?.id;
                const lat = Number(store.lat) || 28.63;
                const log = Number(store.log) || 77.21;

                return (
                  <Marker
                    key={store.id}
                    position={[lat, log]}
                    icon={createStoreIcon(isCurrent, false, false)}
                  >
                    <Popup>
                      <div style={{ padding: '4px' }}>
                        <strong style={{ fontSize: '0.9rem', color: '#38bdf8' }}>{store.name}</strong>
                        <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '4px 0' }}>{store.address}</p>
                        <div style={{ fontSize: '0.7rem', color: '#cbd5e1', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '4px', marginTop: '4px' }}>
                          {isCurrent ? '⭐ Active Viewing Store' : 'Nearby Network Node'}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}

              {/* Active Transfer Trajectory Vectors */}
              {activeVectors.map(vec => (
                <Polyline
                  key={vec.id}
                  positions={[vec.from, vec.to]}
                  pathOptions={{
                    color: '#f43f5e',
                    weight: 3,
                    dashArray: '8, 8'
                  }}
                />
              ))}
            </MapContainer>
          </div>

          {/* Map Legend */}
          <div style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '0.75rem', color: '#94a3b8', justifyContent: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#06b6d4' }}></span>
              Current Store
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#3b82f6' }}></span>
              Partner Stores
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '2px', background: '#f43f5e' }}></span>
              Active Redistribution Vector
            </span>
          </div>
        </div>

        {/* Inventory Stock Gauge Matrix */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={20} color="#06b6d4" />
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
                  Micro-Inventory Gauges
                </h3>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  Real-time stock monitoring & FEFO tracking
                </p>
              </div>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              {inventory.length} ingredients tracked
            </span>
          </div>

          {/* List of Ingredients */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', maxHeight: '430px', paddingRight: '4px' }}>
            {inventory.map(item => {
              const qty = Number(item.quantity);
              const reorder = Number(item.reorder_level);
              const isCritical = qty <= reorder;
              const isWarning = qty > reorder && qty <= reorder * 1.5;

              let statusColor = '#10b981';
              let badgeClass = 'badge-optimal';
              let statusLabel = 'Optimal';

              if (isCritical) {
                statusColor = '#f43f5e';
                badgeClass = 'badge-critical';
                statusLabel = 'Critical Shortage';
              } else if (isWarning) {
                statusColor = '#f59e0b';
                badgeClass = 'badge-warning';
                statusLabel = 'Reorder Zone';
              }

              // Compute percentage of safe stock (assuming capacity is 4x reorder level)
              const maxExpected = reorder * 4;
              const progressPct = Math.min(100, Math.round((qty / maxExpected) * 100));

              // Format expiry date
              const expiryDate = item.expiry_date ? new Date(item.expiry_date) : null;
              const daysToExpiry = expiryDate
                ? Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24))
                : 10;

              return (
                <div
                  key={item.id}
                  style={{
                    padding: '12px 14px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: '10px',
                    border: `1px solid ${isCritical ? 'rgba(244, 63, 94, 0.35)' : 'var(--border-color)'}`,
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.88rem' }}>
                        {item.ingredients?.name}
                      </span>
                      <span className={badgeClass} style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                        {statusLabel}
                      </span>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: isCritical ? '#fb7185' : '#f8fafc' }}>
                        {qty} {item.ingredients?.unit}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '3px', overflow: 'hidden', margin: '6px 0' }}>
                    <div
                      style={{
                        width: `${progressPct}%`,
                        height: '100%',
                        background: statusColor,
                        borderRadius: '3px',
                        transition: 'width 0.4s ease'
                      }}
                    ></div>
                  </div>

                  {/* Reorder and Expiry Details */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94a3b8' }}>
                    <span>Threshold: {reorder} {item.ingredients?.unit}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: daysToExpiry <= 3 ? '#fb7185' : '#94a3b8' }}>
                      <Clock size={12} />
                      FEFO Expiry: {daysToExpiry > 0 ? `${daysToExpiry} days` : 'Expired'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Real-Time Redistribution Ping Action Center */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Radar size={20} color="#06b6d4" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc' }}>
                Autonomous Redistribution Ping Center
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                Incoming stock fulfillment requests & active transfer tracking
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <span className="badge-critical" style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
              {incomingPings.length} Incoming Action Pings
            </span>
            <span className="badge-warning" style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
              {outgoingPings.length} Outgoing Requests
            </span>
          </div>
        </div>

        {/* Pings Section Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
          
          {/* Incoming Pings (This store is requested to DONATE stock) */}
          <div style={{ background: 'rgba(15, 23, 42, 0.5)', borderRadius: '12px', padding: '16px', border: '1px solid var(--border-color)' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertTriangle size={16} color="#f43f5e" />
              Incoming Fulfillment Requests (Action Required)
            </h4>

            {incomingPings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '28px', color: '#64748b', fontSize: '0.85rem' }}>
                No active incoming pings. This store is not currently needed as a donor.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {incomingPings.map(ping => (
                  <div
                    key={ping.id}
                    style={{
                      background: 'rgba(244, 63, 94, 0.08)',
                      border: '1px solid rgba(244, 63, 94, 0.3)',
                      borderRadius: '10px',
                      padding: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <span style={{ fontSize: '0.72rem', color: '#f43f5e', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Critical Restock Ping
                        </span>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', marginTop: '2px' }}>
                          {ping.to_store?.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          Distance: <strong style={{ color: '#38bdf8' }}>{ping.distance_km || 2.5} km away</strong> (&lt; 10km radius)
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fb7185' }}>
                          {ping.quantity} {ping.ingredient?.unit}
                        </span>
                        <div style={{ fontSize: '0.75rem', color: '#e2e8f0', fontWeight: 600 }}>
                          {ping.ingredient?.name}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                      <button
                        onClick={() => handleAcceptTransfer(ping.id)}
                        disabled={actionLoadingId === ping.id}
                        className="btn-success"
                        style={{ flex: 1, justifyContent: 'center', padding: '8px 12px', fontSize: '0.8rem' }}
                      >
                        <CheckCircle size={14} />
                        <span>{actionLoadingId === ping.id ? 'Transferring...' : 'Accept & Dispatch Stock'}</span>
                      </button>

                      <button
                        onClick={() => handleRejectTransfer(ping.id)}
                        disabled={actionLoadingId === ping.id}
                        className="btn-outline"
                        style={{ padding: '8px 12px', fontSize: '0.8rem', color: '#94a3b8' }}
                      >
                        <XCircle size={14} />
                        <span>Decline</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Outgoing Pings (This store is WAITING for stock) */}
          <div style={{ background: 'rgba(15, 23, 42, 0.5)', borderRadius: '12px', padding: '16px', border: '1px solid var(--border-color)' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Package size={16} color="#06b6d4" />
              Outgoing Restock Requests (Waiting Fulfillment)
            </h4>

            {outgoingPings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '28px', color: '#64748b', fontSize: '0.85rem' }}>
                No active outgoing pings. Store inventory is operating safely.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {outgoingPings.map(ping => (
                  <div
                    key={ping.id}
                    style={{
                      background: 'rgba(6, 182, 212, 0.08)',
                      border: '1px solid rgba(6, 182, 212, 0.3)',
                      borderRadius: '10px',
                      padding: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase' }}>
                          Dispatched Ping
                        </span>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
                          Donor: {ping.from_store?.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          Distance: {ping.distance_km || 2.0} km away
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '1rem', fontWeight: 700, color: '#22d3ee' }}>
                          +{ping.quantity} {ping.ingredient?.unit}
                        </span>
                        <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                          {ping.ingredient?.name}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#f59e0b', marginTop: '4px' }}>
                      <Clock size={14} />
                      <span>Awaiting donor store manager acceptance...</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
