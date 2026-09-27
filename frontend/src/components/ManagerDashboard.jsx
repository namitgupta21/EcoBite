import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Radar,
  Check,
  X,
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

// Create clean, crisp editorial marker icon with 4px border-radius
const createStoreIcon = (isCurrent, hasShortage, isDonor) => {
  let bgColor = '#f2f1ed';
  let textColor = '#26251e';
  let borderColor = '#cdcdc9';

  if (isCurrent) {
    bgColor = '#26251e';
    textColor = '#f7f7f4';
    borderColor = '#26251e';
  } else if (hasShortage) {
    bgColor = '#cf2d56';
    textColor = '#f7f7f4';
    borderColor = '#cf2d56';
  } else if (isDonor) {
    bgColor = '#34785c';
    textColor = '#f7f7f4';
    borderColor = '#34785c';
  }

  return L.divIcon({
    className: 'custom-editorial-marker',
    html: `
      <div style="
        width: 24px;
        height: 24px;
        background: ${bgColor};
        color: ${textColor};
        border: 1px solid ${borderColor};
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px;
        font-weight: 500;
        box-shadow: rgba(0, 0, 0, 0.1) 0px 2px 4px;
      ">
        ${isCurrent ? '✦' : '•'}
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
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

  const incomingPings = transferPings.filter(
    p => p.from_store_id === activeStore?.id && p.status === 'PENDING'
  );

  const outgoingPings = transferPings.filter(
    p => p.to_store_id === activeStore?.id && p.status === 'PENDING'
  );

  const handleAcceptTransfer = async (pingId) => {
    setActionLoadingId(pingId);
    try {
      await api.acceptTransfer(pingId);
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(`Transfer failed: ${err.message}`);
    } finally {
      setActionLoadingId(null);
    }
  };

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

  const activeVectors = transferPings
    .filter(p => p.status === 'PENDING' && p.from_store?.lat && p.to_store?.lat)
    .map(p => ({
      id: p.id,
      from: [Number(p.from_store.lat), Number(p.from_store.log)],
      to: [Number(p.to_store.lat), Number(p.to_store.log)],
      label: `${p.quantity}${p.ingredient?.unit || ''} ${p.ingredient?.name || ''}`
    }));

  const activeLat = Number(activeStore?.lat) || 28.6315;
  const activeLog = Number(activeStore?.log) || 77.2167;

  return (
    <div className="responsive-page-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Banner: Store Status & Network Scan */}
      <div className="card-bone banner-flex" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge-mono" style={{ fontSize: '10px' }}>STORE MANAGEMENT CONSOLE</span>
            <span className="badge-optimal">TELEMETRY ACTIVE</span>
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 500, color: 'var(--color-ink)', marginTop: '4px' }}>
            {activeStore?.name}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px', fontSize: '12px', color: 'var(--color-driftwood)', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={13} color="var(--color-ash)" /> {activeStore?.address}
            </span>
            <span>&bull;</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-ink)' }}>
              {activeLat.toFixed(4)}°N, {activeLog.toFixed(4)}°E
            </span>
          </div>
        </div>

        <div className="banner-actions">
          <button
            onClick={onRefresh}
            className="btn-secondary"
          >
            <RefreshCw size={13} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleRunScan}
            disabled={scanLoading}
            className="btn-primary"
          >
            <Sparkles size={13} />
            <span>{scanLoading ? 'Scanning...' : 'Run Autonomous 10km Scan'}</span>
          </button>
        </div>
      </div>

      {/* Grid: 10km Leaflet Radar Map (Left) + Inventory Matrix (Right) */}
      <div className="manager-layout-grid">
        
        {/* 10km Geospatial Leaflet Map */}
        <div className="card-bone" style={{ padding: '18px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '12px', flexWrap: 'wrap', gap: '6px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 500, color: 'var(--color-ink)' }}>
                10km Geospatial Geofence Radar
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--color-ash)', marginTop: '2px' }}>
                Radius perimeter centered on {activeStore?.name}
              </p>
            </div>
            <span className="badge-mono" style={{ fontSize: '11px' }}>
              RADIUS: 10.0 KM
            </span>
          </div>

          {/* Leaflet Map Container */}
          <div className="map-container-box">
            <MapContainer
              key={`${activeLat}-${activeLog}`}
              center={[activeLat, activeLog]}
              zoom={12}
              scrollWheelZoom={false}
              style={{ width: '100%', height: '100%' }}
            >
              {/* OpenStreetMap TileLayer - 100% reliable, zero API key required, styled via CSS */}
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* 10km Geofence Boundary Circle */}
              <Circle
                center={[activeLat, activeLog]}
                radius={10000}
                pathOptions={{
                  color: '#26251e',
                  fillColor: '#26251e',
                  fillOpacity: 0.05,
                  weight: 1.5,
                  dashArray: '4, 4'
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
                      <div style={{ padding: '2px' }}>
                        <strong style={{ fontSize: '13px', color: 'var(--color-ink)' }}>{store.name}</strong>
                        <p style={{ fontSize: '11px', color: 'var(--color-driftwood)', margin: '4px 0' }}>{store.address}</p>
                        <div style={{ fontSize: '11px', color: 'var(--color-ash)', borderTop: '1px solid var(--color-stone)', paddingTop: '4px', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                          {isCurrent ? 'Current Terminal' : 'Cluster Node'}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}

              {/* Active Redistribution Vectors */}
              {activeVectors.map(vec => (
                <Polyline
                  key={vec.id}
                  positions={[vec.from, vec.to]}
                  pathOptions={{
                    color: '#f54e00',
                    weight: 2,
                    dashArray: '5, 5'
                  }}
                />
              ))}
            </MapContainer>
          </div>

          {/* Map Legend */}
          <div style={{ display: 'flex', gap: '14px', marginTop: '10px', fontSize: '11px', color: 'var(--color-ash)', justifyContent: 'center', fontFamily: 'var(--font-mono)', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', background: 'var(--color-ink)', borderRadius: '2px' }}></span>
              Current Store
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', background: 'var(--color-bone)', border: '1px solid var(--color-stone)', borderRadius: '2px' }}></span>
              Cluster Branches
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '12px', height: '2px', background: 'var(--color-ember)' }}></span>
              Active Redistribution Vector
            </span>
          </div>
        </div>

        {/* Inventory Gauges Column */}
        <div className="card-bone" style={{ padding: '18px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '12px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 500, color: 'var(--color-ink)' }}>
                Micro-Inventory Matrix
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--color-ash)', marginTop: '2px' }}>
                Stock telemetry & FEFO expiry tracking
              </p>
            </div>
            <span className="badge-mono" style={{ fontSize: '11px' }}>
              {inventory.length} ITEMS
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', maxHeight: '420px', paddingRight: '2px' }}>
            {inventory.map(item => {
              const qty = Number(item.quantity);
              const reorder = Number(item.reorder_level);
              const isCritical = qty <= reorder;
              const isWarning = qty > reorder && qty <= reorder * 1.5;

              let statusColor = 'var(--color-forest)';
              let badgeClass = 'badge-optimal';
              let statusLabel = 'Optimal';

              if (isCritical) {
                statusColor = 'var(--color-crimson)';
                badgeClass = 'badge-critical';
                statusLabel = 'Critical';
              } else if (isWarning) {
                statusColor = 'var(--color-amber)';
                badgeClass = 'badge-warning';
                statusLabel = 'Reorder Zone';
              }

              const maxExpected = reorder * 4;
              const progressPct = Math.min(100, Math.round((qty / maxExpected) * 100));

              const expiryDate = item.expiry_date ? new Date(item.expiry_date) : null;
              const daysToExpiry = expiryDate
                ? Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24))
                : 10;

              return (
                <div
                  key={item.id}
                  style={{
                    padding: '10px 12px',
                    background: 'var(--color-parchment)',
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid ${isCritical ? 'rgba(207, 45, 86, 0.35)' : 'var(--color-stone)'}`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontWeight: 500, color: 'var(--color-ink)', fontSize: '13px' }}>
                        {item.ingredients?.name}
                      </span>
                      <span className={badgeClass}>
                        {statusLabel}
                      </span>
                    </div>

                    <span style={{ fontWeight: 500, fontSize: '13px', color: isCritical ? 'var(--color-crimson)' : 'var(--color-ink)', fontFamily: 'var(--font-mono)' }}>
                      {qty} {item.ingredients?.unit}
                    </span>
                  </div>

                  <div style={{ width: '100%', height: '4px', background: 'var(--color-linen)', borderRadius: '2px', overflow: 'hidden', margin: '6px 0' }}>
                    <div
                      style={{
                        width: `${progressPct}%`,
                        height: '100%',
                        background: statusColor,
                        borderRadius: '2px',
                        transition: 'width 300ms ease'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-ash)', fontFamily: 'var(--font-mono)' }}>
                    <span>Threshold: {reorder} {item.ingredients?.unit}</span>
                    <span style={{ color: daysToExpiry <= 3 ? 'var(--color-crimson)' : 'var(--color-ash)' }}>
                      FEFO Expiry: {daysToExpiry > 0 ? `${daysToExpiry}d` : 'Expired'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Autonomous Redistribution Ping Center */}
      <div className="card-bone" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: 500, color: 'var(--color-ink)' }}>
              Autonomous Redistribution Ping Center
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--color-driftwood)', marginTop: '2px' }}>
              Incoming stock fulfillment requests & active transfer tracking
            </p>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <span className="badge-critical">
              {incomingPings.length} Incoming
            </span>
            <span className="badge-mono">
              {outgoingPings.length} Outgoing
            </span>
          </div>
        </div>

        <div className="ping-grid">
          
          {/* Incoming Pings (This store is requested to DONATE stock) */}
          <div style={{ background: 'var(--color-parchment)', borderRadius: 'var(--radius-md)', padding: '14px', border: '1px solid var(--color-stone)' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-ink)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: 'var(--color-crimson)' }}>•</span>
              Incoming Fulfillment Requests (Action Required)
            </h4>

            {incomingPings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--color-ash)', fontSize: '12px' }}>
                No active incoming pings. Store is not currently designated as a donor.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {incomingPings.map(ping => (
                  <div
                    key={ping.id}
                    style={{
                      background: 'var(--color-bone)',
                      border: '1px solid rgba(207, 45, 86, 0.3)',
                      borderRadius: 'var(--radius-md)',
                      padding: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <span className="badge-mono" style={{ fontSize: '10px', color: 'var(--color-crimson)' }}>
                          CRITICAL SHORTAGE
                        </span>
                        <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-ink)', marginTop: '2px' }}>
                          {ping.to_store?.name}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--color-ash)', fontFamily: 'var(--font-mono)' }}>
                          Distance: {ping.distance_km || 2.5} km (&lt; 10km geofence)
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-crimson)', fontFamily: 'var(--font-mono)' }}>
                          {ping.quantity} {ping.ingredient?.unit}
                        </span>
                        <div style={{ fontSize: '12px', color: 'var(--color-ink)' }}>
                          {ping.ingredient?.name}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                      <button
                        onClick={() => handleAcceptTransfer(ping.id)}
                        disabled={actionLoadingId === ping.id}
                        className="btn-forest"
                        style={{ flex: 1, justifyContent: 'center' }}
                      >
                        <Check size={13} />
                        <span>{actionLoadingId === ping.id ? 'Transferring...' : 'Accept & Dispatch Stock'}</span>
                      </button>

                      <button
                        onClick={() => handleRejectTransfer(ping.id)}
                        disabled={actionLoadingId === ping.id}
                        className="btn-secondary"
                      >
                        <X size={13} />
                        <span>Decline</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Outgoing Pings (This store is WAITING for stock) */}
          <div style={{ background: 'var(--color-parchment)', borderRadius: 'var(--radius-md)', padding: '14px', border: '1px solid var(--color-stone)' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-ink)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: 'var(--color-amber)' }}>•</span>
              Outgoing Restock Requests (Awaiting Fulfillment)
            </h4>

            {outgoingPings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--color-ash)', fontSize: '12px' }}>
                No active outgoing pings. Store inventory is operating above threshold.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {outgoingPings.map(ping => (
                  <div
                    key={ping.id}
                    style={{
                      background: 'var(--color-bone)',
                      border: '1px solid var(--color-stone)',
                      borderRadius: 'var(--radius-md)',
                      padding: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <span className="badge-mono" style={{ fontSize: '10px' }}>DISPATCHED PING</span>
                        <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-ink)', marginTop: '2px' }}>
                          Donor: {ping.from_store?.name}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--color-ash)', fontFamily: 'var(--font-mono)' }}>
                          Distance: {ping.distance_km || 2.0} km
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-forest)', fontFamily: 'var(--font-mono)' }}>
                          +{ping.quantity} {ping.ingredient?.unit}
                        </span>
                        <div style={{ fontSize: '12px', color: 'var(--color-ink)' }}>
                          {ping.ingredient?.name}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--color-driftwood)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                      <Clock size={11} />
                      <span>Awaiting partner branch dispatch</span>
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
