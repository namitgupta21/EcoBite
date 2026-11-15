import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import {
  ShieldCheck
} from 'lucide-react';
import { api } from '../services/api';

const PALETTE = ['#1b4e2b', '#22c55e', '#15803d', '#34d399', '#059669'];

export default function ESGAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = async () => {
    try {
      const res = await api.getAnalytics();
      setData(res);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
    const interval = setInterval(loadAnalytics, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div style={{ maxWidth: 'var(--page-max-width)', margin: '60px auto', textAlign: 'center', color: '#6b8f7e', fontSize: '14px', fontFamily: 'var(--font-mono)' }}>
        Loading franchise operations intelligence...
      </div>
    );
  }

  const { metrics, top_transferred_ingredients, stores_health, recent_pings } = data || {};

  return (
    <div className="responsive-page-container">
      <div className="analytics-layout">
        
        {/* Header Banner */}
        <div className="analytics-header-banner">
          <div>
            <div className="analytics-badges">
              <span className="badge-tag">SUSTAINABILITY & AUDIT TELEMETRY</span>
              <span className="badge-tag badge-tag--green">FEFO ACTIVE</span>
            </div>
            <h2 className="analytics-title">Franchise ESG & Commercial Food Waste Analytics</h2>
            <p className="analytics-sub">
              10km FEFO surplus balancing directly prevents spoilage of expiring micro-ingredients across the cluster.
            </p>
          </div>

          <div className="analytics-badge-pill">
            <ShieldCheck size={16} />
            <span>FEFO Waste Prevention Protocol</span>
          </div>
        </div>

        {/* 4 Top KPI Cards Grid */}
        <div className="analytics-kpi-grid">
          
          {/* KPI 1: Food Waste Prevented */}
          <div className="kpi-card">
            <div className="kpi-card-header">
              <span className="kpi-label">FOOD WASTE PREVENTED</span>
              <span className="kpi-icon kpi-icon--green">🍃</span>
            </div>
            <div className="kpi-value-row">
              <span className="kpi-number">{metrics?.total_waste_prevented_kg || 0}</span>
              <span className="kpi-unit">kg</span>
            </div>
            <p className="kpi-footnote">Rescued via FEFO prior to expiration</p>
          </div>

          {/* KPI 2: Supply Chain Cost Saved */}
          <div className="kpi-card">
            <div className="kpi-card-header">
              <span className="kpi-label">SUPPLY CHAIN COST SAVED</span>
              <span className="kpi-icon kpi-icon--amber">₹</span>
            </div>
            <div className="kpi-value-row">
              <span className="kpi-number">₹{metrics?.total_cost_savings?.toLocaleString() || 0}</span>
            </div>
            <p className="kpi-footnote">Value of salvaged micro-ingredients</p>
          </div>

          {/* KPI 3: Completed Transfers */}
          <div className="kpi-card">
            <div className="kpi-card-header">
              <span className="kpi-label">COMPLETED TRANSFERS</span>
              <span className="kpi-icon kpi-icon--blue">⇄</span>
            </div>
            <div className="kpi-value-row">
              <span className="kpi-number">{metrics?.completed_transfers_count || 0}</span>
              <span className="kpi-unit">/ {metrics?.total_pings_count || 0}</span>
            </div>
            <p className="kpi-footnote">{metrics?.pending_pings_count || 0} currently pending</p>
          </div>

          {/* KPI 4: Active Shortages */}
          <div className="kpi-card">
            <div className="kpi-card-header">
              <span className="kpi-label">ACTIVE SHORTAGES</span>
              <span className="kpi-icon kpi-icon--red">⚠️</span>
            </div>
            <div className="kpi-value-row">
              <span
                className="kpi-number"
                style={{ color: (metrics?.active_shortages_count || 0) > 0 ? '#dc2626' : '#15803d' }}
              >
                {metrics?.active_shortages_count || 0}
              </span>
              <span className="kpi-unit">items</span>
            </div>
            <p className="kpi-footnote text-critical">Stock currently &le; reorder level</p>
          </div>

        </div>

        {/* 2-Column Lower Section: Chart & Cluster Health */}
        <div className="analytics-lower-grid">
          
          {/* Left: Top Transferred Raw Materials Chart */}
          <div className="analytics-chart-card">
            <div className="chart-header">
              <div>
                <h3 className="card-title">Top Transferred Raw Materials</h3>
                <p className="card-sub">Perishable items rebalanced across branches</p>
              </div>
              <span className="chart-stat-tag">Telemetry Log</span>
            </div>

            <div className="chart-canvas-wrapper" style={{ height: '240px' }}>
              {top_transferred_ingredients && top_transferred_ingredients.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={top_transferred_ingredients} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <XAxis dataKey="name" stroke="#6b8f7e" fontSize={11} interval={0} angle={-10} textAnchor="end" />
                    <YAxis stroke="#6b8f7e" fontSize={11} fontFamily="'JetBrains Mono', monospace" />
                    <Tooltip
                      contentStyle={{
                        background: '#ffffff',
                        border: '1px solid #bbf7d0',
                        borderRadius: '10px',
                        color: '#1b4332',
                        fontSize: '12px',
                        fontFamily: "'JetBrains Mono', monospace",
                        boxShadow: '0 4px 12px rgba(27,78,43,0.1)'
                      }}
                    />
                    <Bar dataKey="quantity" radius={[6, 6, 0, 0]}>
                      {top_transferred_ingredients.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b8f7e', fontSize: '12px' }}>
                  No completed transfer history recorded yet.
                </div>
              )}
            </div>
          </div>

          {/* Right: Cluster Network Health */}
          <div className="analytics-health-card">
            <div className="chart-header">
              <div>
                <h3 className="card-title">Cluster Network Health</h3>
                <p className="card-sub">Operational telemetry for {stores_health?.length || 0} branches</p>
              </div>
              <span className="health-pin-icon">📍</span>
            </div>

            <div className="cluster-health-list">
              {stores_health?.map(store => {
                const isCrit = store.status === 'CRITICAL';
                const isWarn = store.status === 'WARNING';
                const badgeClass = isCrit
                  ? 'branch-health-badge--critical'
                  : isWarn
                  ? 'branch-health-badge--surplus'
                  : 'branch-health-badge--optimal';

                return (
                  <div key={store.id} className="cluster-branch-item">
                    <div className="branch-info">
                      <h5>{store.name}</h5>
                      <p>{store.address}</p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '11px', color: '#6b8f7e', fontFamily: 'var(--font-mono)' }}>
                        {isCrit ? `${store.critical_items} shortages` : `${store.total_items} items`}
                      </span>
                      <span className={`branch-health-badge ${badgeClass}`}>
                        {store.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Autonomous Redistribution Audit Ledger Table */}
        <div className="card-bone" style={{ padding: '24px', marginTop: '24px' }}>
          <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '14px' }}>
            Autonomous Redistribution Audit Ledger
          </h3>

          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px' }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid var(--border)', color: '#6b8f7e', fontFamily: 'var(--font-mono)' }}>
                  <th style={{ padding: '10px 12px' }}>TIMESTAMP</th>
                  <th style={{ padding: '10px 12px' }}>DONOR STORE</th>
                  <th style={{ padding: '10px 12px' }}>RECIPIENT STORE</th>
                  <th style={{ padding: '10px 12px' }}>INGREDIENT</th>
                  <th style={{ padding: '10px 12px' }}>QUANTITY</th>
                  <th style={{ padding: '10px 12px' }}>DISTANCE</th>
                  <th style={{ padding: '10px 12px' }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {recent_pings && recent_pings.length > 0 ? (
                  recent_pings.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #f0faf3' }}>
                      <td style={{ padding: '10px 12px', color: '#6b8f7e', fontFamily: 'var(--font-mono)' }}>
                        {new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td style={{ padding: '10px 12px', color: 'var(--text-primary)', fontWeight: 650 }}>
                        {p.from_store?.name || 'Partner Store'}
                      </td>
                      <td style={{ padding: '10px 12px', color: 'var(--text-primary)', fontWeight: 650 }}>
                        {p.to_store?.name || 'Needy Store'}
                      </td>
                      <td style={{ padding: '10px 12px', color: 'var(--text-primary)' }}>
                        {p.ingredient?.name || 'Item'}
                      </td>
                      <td style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                        {p.quantity} {p.ingredient?.unit}
                      </td>
                      <td style={{ padding: '10px 12px', color: '#52796f', fontFamily: 'var(--font-mono)' }}>
                        {p.distance_km ? `${p.distance_km} km` : '< 5 km'}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span
                          className={
                            p.status === 'COMPLETED'
                              ? 'badge-optimal'
                              : p.status === 'PENDING'
                              ? 'matrix-status-pill--optimal'
                              : 'matrix-status-pill--reorder'
                          }
                        >
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '28px', color: '#6b8f7e' }}>
                      No audit records available yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* GreenBasket Inspiration: Trusted Stats Ribbon */}
        <section className="gb-stats-ribbon">
          <div className="gb-stat-item">
            <span className="gb-stat-icon-wrap">👥</span>
            <div className="gb-stat-text">
              <strong>10K+ Orders</strong>
              <p>Fulfilled with Zero Waste</p>
            </div>
          </div>
          <div className="gb-stat-divider"></div>
          <div className="gb-stat-item">
            <span className="gb-stat-icon-wrap">🧺</span>
            <div className="gb-stat-text">
              <strong>500+ Farm Batches</strong>
              <p>100% Organic Produce</p>
            </div>
          </div>
          <div className="gb-stat-divider"></div>
          <div className="gb-stat-item">
            <span className="gb-stat-icon-wrap">👨‍🌾</span>
            <div className="gb-stat-text">
              <strong>50+ Local Farmers</strong>
              <p>Within 10km Cluster</p>
            </div>
          </div>
          <div className="gb-stat-divider"></div>
          <div className="gb-stat-item">
            <span className="gb-stat-icon-wrap">👍</span>
            <div className="gb-stat-text">
              <strong>99.4% Precision</strong>
              <p>Positive Kitchen Feedback</p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
