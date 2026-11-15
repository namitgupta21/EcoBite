import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Check,
  Clock,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';

// Create Apple 3D Squircle/Circle Marker Icon
const createStoreIcon = (isCurrent, hasShortage) => {
  let bgColor = '#ffffff';
  let textColor = '#1b4332';
  let borderColor = '#86efac';
  let halo = 'rgba(34, 197, 94, 0.2)';

  if (isCurrent) {
    bgColor = '#1b4e2b';
    textColor = '#ffffff';
    borderColor = '#22c55e';
    halo = 'rgba(27, 78, 43, 0.35)';
  } else if (hasShortage) {
    bgColor = '#ef4444';
    textColor = '#ffffff';
    borderColor = '#fca5a5';
    halo = 'rgba(239, 68, 68, 0.3)';
  }

  return L.divIcon({
    className: 'custom-editorial-marker',
    html: `
      <div style="
        width: 28px;
        height: 28px;
        background: ${bgColor};
        color: ${textColor};
        border: 2px solid ${borderColor};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'JetBrains Mono', monospace;
        font-size: 12px;
        font-weight: 700;
        box-shadow: 0 4px 12px ${halo};
      ">
        ${isCurrent ? '★' : '•'}
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14]
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
    <div className="responsive-page-container">
      <div className="radar-layout">
        
        {/* Header Control Strip */}
        <div className="radar-header-banner">
          <div className="radar-banner-left">
            <div className="radar-badges">
              <span className="badge-tag">STORE MANAGEMENT CONSOLE</span>
              <span className="badge-tag badge-tag--emerald">TELEMETRY ACTIVE</span>
            </div>
            <h2 className="radar-store-name">{activeStore?.name}</h2>
            <p className="radar-store-address">
              {activeStore?.address} &bull; {activeLat.toFixed(4)}°N, {activeLog.toFixed(4)}°E
            </p>
          </div>

          <div className="radar-banner-right">
            <button
              type="button"
              onClick={onRefresh}
              className="btn-radar-refresh"
            >
              <RefreshCw size={15} />
              <span>Refresh</span>
            </button>

            <button
              type="button"
              onClick={handleRunScan}
              disabled={scanLoading}
              className="btn-radar-scan"
            >
              <Sparkles size={15} />
              <span>{scanLoading ? 'Scanning 10km Network...' : 'Run Autonomous 10km Scan'}</span>
            </button>
          </div>
        </div>

        {/* 2-Column Split: Map on Left, Inventory Matrix on Right */}
        <div className="radar-content-split">
          
          {/* Left: 10km Geospatial Leaflet Map */}
          <div className="radar-map-card">
            <div className="map-card-header">
              <div>
                <h3 className="card-title">10km Geospatial Geofence Radar</h3>
                <p className="card-sub">Radius perimeter centered on {activeStore?.name}</p>
              </div>
              <span className="radius-tag">RADIUS: 10.0 KM</span>
            </div>

            <div className="map-container-wrapper">
              <div className="leaflet-map-canvas">
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

                  {/* 10km Geofence Circle */}
                  <Circle
                    center={[activeLat, activeLog]}
                    radius={10000}
                    pathOptions={{
                      color: '#1b4e2b',
                      fillColor: '#22c55e',
                      fillOpacity: 0.05,
                      weight: 1.5,
                      dashArray: '5, 5'
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
                        icon={createStoreIcon(isCurrent, false)}
                      >
                        <Popup>
                          <div style={{ padding: '4px' }}>
                            <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{store.name}</strong>
                            <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '4px 0' }}>{store.address}</p>
                            <div style={{ fontSize: '11px', color: 'var(--brand-emerald)', borderTop: '1px solid var(--border)', paddingTop: '4px', fontFamily: 'var(--font-mono)' }}>
                              {isCurrent ? '★ Current Terminal Node' : 'Cluster Node'}
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
                        color: '#f59e0b',
                        weight: 2.5,
                        dashArray: '6, 6'
                      }}
                    />
                  ))}
                </MapContainer>
              </div>

              {scanLoading && (
                <div className="map-scan-overlay">
                  <div className="scan-status-pill">
                    <span className="scan-spinner"></span>
                    <span>Scanning 10km Network for FEFO Surplus...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Map Legend */}
            <div className="map-legend-bar">
              <div className="legend-item"><span className="legend-dot legend-dot--hub"></span> Central Node</div>
              <div className="legend-item"><span className="legend-dot legend-dot--in"></span> Within 10km Geofence</div>
              <div className="legend-item"><span className="legend-dot legend-dot--out"></span> Active Redistribution Vector</div>
            </div>
          </div>

          {/* Right: Micro-Inventory Matrix */}
          <div className="inventory-matrix-card">
            <div className="matrix-card-header">
              <div>
                <h3 className="card-title">Micro-Inventory Matrix</h3>
                <p className="card-sub">Stock telemetry & FEFO expiry tracking</p>
              </div>
              <span className="matrix-item-count">{inventory.length} ITEMS</span>
            </div>

            <div className="matrix-items-list">
              {inventory.map(item => {
                const qty = Number(item.quantity);
                const reorder = Number(item.reorder_level);
                const isCritical = qty <= reorder;
                const maxExpected = Math.max(reorder * 3, qty * 1.2, 1);
                const progressPct = Math.min(100, Math.round((qty / maxExpected) * 100));

                const expiryDate = item.expiry_date ? new Date(item.expiry_date) : null;
                const daysToExpiry = expiryDate
                  ? Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24))
                  : 10;

                return (
                  <div key={item.id} className="matrix-row">
                    <div className="matrix-row-header">
                      <div className="matrix-item-name">
                        <span>{item.ingredients?.name}</span>
                        <span className={`matrix-status-pill ${isCritical ? 'matrix-status-pill--reorder' : 'matrix-status-pill--optimal'}`}>
                          {isCritical ? 'FEFO Alert' : 'Optimal'}
                        </span>
                      </div>
                      <span className="matrix-qty-val">
                        {qty} {item.ingredients?.unit}
                      </span>
                    </div>

                    <div className="matrix-bar-track">
                      <div
                        className={`matrix-bar-fill ${isCritical ? 'matrix-bar-fill--warning' : ''}`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>

                    <div className="matrix-meta-row">
                      <span>Threshold: {reorder} {item.ingredients?.unit}</span>
                      <span style={daysToExpiry <= 3 ? { color: '#dc2626', fontWeight: 650 } : {}}>
                        FEFO: {daysToExpiry > 0 ? `${daysToExpiry}d remaining` : 'Expired'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Autonomous Redistribution Ping Center */}
        <div className="ping-center-card">
          <div className="ping-center-header">
            <div>
              <h3 className="ping-center-title">Autonomous Redistribution Ping Center</h3>
              <p className="ping-center-sub">Incoming stock fulfillment requests & active transfer tracking</p>
            </div>
            <div className="ping-center-badges">
              <span className="badge-incoming-count">{incomingPings.length} Incoming</span>
              <span className="badge-outgoing-count">{outgoingPings.length} Outgoing</span>
            </div>
          </div>

          <div className="ping-center-grid">
            
            {/* Left: Incoming Fulfillment Requests (Action Required) */}
            <div className="ping-column ping-column--incoming">
              <h4 className="ping-col-title">
                <span className="dot-crimson">•</span>
                Incoming Fulfillment Requests (Action Required)
              </h4>

              {incomingPings.length === 0 ? (
                <div className="ping-empty-state">
                  No active incoming pings. Store is not currently designated as a donor.
                </div>
              ) : (
                <div className="ping-list">
                  {incomingPings.map(ping => (
                    <div key={ping.id} className="ping-item-card ping-item-card--incoming">
                      <div className="ping-item-top">
                        <div>
                          <span className="ping-tag-badge ping-tag-badge--critical">URGENT RESTOCK</span>
                          <h5 className="ping-item-title">To: {ping.to_store?.name}</h5>
                          <span className="ping-item-dist">Distance: {ping.distance_km || 2.5} km (&lt; 10km geofence)</span>
                        </div>
                        <div className="ping-item-qty">
                          <span className="ping-qty-val ping-qty-val--crimson">
                            {ping.quantity} {ping.ingredient?.unit}
                          </span>
                          <span className="ping-qty-name">{ping.ingredient?.name}</span>
                        </div>
                      </div>

                      <div className="ping-item-actions">
                        <button
                          type="button"
                          onClick={() => handleAcceptTransfer(ping.id)}
                          disabled={actionLoadingId === ping.id}
                          className="btn-dispatch-accept"
                        >
                          <Check size={13} style={{ display: 'inline', marginRight: '4px' }} />
                          <span>{actionLoadingId === ping.id ? 'Transferring...' : 'Accept & Dispatch Stock'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRejectTransfer(ping.id)}
                          disabled={actionLoadingId === ping.id}
                          className="btn-ping-ignore"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Outgoing Restock Requests (Awaiting Fulfillment) */}
            <div className="ping-column ping-column--outgoing">
              <h4 className="ping-col-title">
                <span className="dot-amber">•</span>
                Outgoing Restock Requests (Awaiting Fulfillment)
              </h4>

              {outgoingPings.length === 0 ? (
                <div className="ping-empty-state">
                  No active outgoing pings. Store inventory is operating above threshold.
                </div>
              ) : (
                <div className="ping-list">
                  {outgoingPings.map(ping => (
                    <div key={ping.id} className="ping-item-card ping-item-card--outgoing">
                      <div className="ping-item-top">
                        <div>
                          <span className="ping-tag-badge ping-tag-badge--dispatched">REQUESTED</span>
                          <h5 className="ping-item-title">Donor: {ping.from_store?.name}</h5>
                          <span className="ping-item-dist">Distance: {ping.distance_km || 2.0} km</span>
                        </div>
                        <div className="ping-item-qty">
                          <span className="ping-qty-val ping-qty-val--green">
                            +{ping.quantity} {ping.ingredient?.unit}
                          </span>
                          <span className="ping-qty-name">{ping.ingredient?.name}</span>
                        </div>
                      </div>
                      <div className="ping-item-footer">
                        <Clock size={12} />
                        <span>Autonomous courier dispatch queued. Awaiting partner branch dispatch.</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
