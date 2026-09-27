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
  Leaf,
  DollarSign,
  ArrowRightLeft,
  AlertOctagon,
  ShieldCheck,
  TrendingUp,
  MapPin
} from 'lucide-react';
import { api } from '../services/api';

const PALETTE = ['#26251e', '#c08532', '#34785c', '#84847e', '#f54e00'];

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
      <div style={{ maxWidth: 'var(--page-max-width)', margin: '48px auto', textAlign: 'center', color: 'var(--color-ash)', fontSize: '13px' }}>
        Loading operations intelligence...
      </div>
    );
  }

  const { metrics, top_transferred_ingredients, stores_health, recent_pings } = data || {};

  return (
    <div className="responsive-page-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header Banner */}
      <div className="card-bone banner-flex" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge-mono" style={{ fontSize: '10px' }}>SUSTAINABILITY & AUDIT TELEMETRY</span>
            <span className="badge-optimal">FEFO ACTIVE</span>
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 500, color: 'var(--color-ink)', marginTop: '4px' }}>
            Franchise ESG & Commercial Food Waste Analytics
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--color-driftwood)', marginTop: '2px' }}>
            10km FEFO surplus balancing directly prevents spoilage of expiring micro-ingredients across the cluster.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--color-linen)', padding: '6px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-stone)' }}>
          <ShieldCheck size={15} color="var(--color-forest)" />
          <span style={{ fontSize: '11px', color: 'var(--color-ink)', fontFamily: 'var(--font-mono)' }}>
            FEFO Waste Prevention Protocol
          </span>
        </div>
      </div>

      {/* 4 Executive KPI Cards */}
      <div className="kpi-grid">
        
        {/* KPI 1 */}
        <div className="card-bone" style={{ padding: '16px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '11px', color: 'var(--color-ash)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Food Waste Prevented
            </span>
            <Leaf size={14} color="var(--color-forest)" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 500, color: 'var(--color-ink)', fontFamily: 'var(--font-mono)', letterSpacing: '-0.02em' }}>
            {metrics?.total_waste_prevented_kg || 0} <span style={{ fontSize: '13px', color: 'var(--color-forest)' }}>kg</span>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--color-driftwood)', marginTop: '2px' }}>
            Rescued via FEFO prior to expiration
          </p>
        </div>

        {/* KPI 2 */}
        <div className="card-bone" style={{ padding: '16px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '11px', color: 'var(--color-ash)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Supply Chain Cost Saved
            </span>
            <DollarSign size={14} color="var(--color-amber)" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 500, color: 'var(--color-ink)', fontFamily: 'var(--font-mono)', letterSpacing: '-0.02em' }}>
            ₹{metrics?.total_cost_savings?.toLocaleString() || 0}
          </div>
          <p style={{ fontSize: '11px', color: 'var(--color-driftwood)', marginTop: '2px' }}>
            Value of salvaged micro-ingredients
          </p>
        </div>

        {/* KPI 3 */}
        <div className="card-bone" style={{ padding: '16px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '11px', color: 'var(--color-ash)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Completed Transfers
            </span>
            <ArrowRightLeft size={14} color="var(--color-ink)" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 500, color: 'var(--color-ink)', fontFamily: 'var(--font-mono)', letterSpacing: '-0.02em' }}>
            {metrics?.completed_transfers_count || 0} <span style={{ fontSize: '12px', color: 'var(--color-ash)' }}>/ {metrics?.total_pings_count || 0}</span>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--color-driftwood)', marginTop: '2px' }}>
            {metrics?.pending_pings_count || 0} currently pending
          </p>
        </div>

        {/* KPI 4 */}
        <div className="card-bone" style={{ padding: '16px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '11px', color: 'var(--color-ash)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Active Shortages
            </span>
            <AlertOctagon size={14} color="var(--color-crimson)" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 500, color: (metrics?.active_shortages_count || 0) > 0 ? 'var(--color-crimson)' : 'var(--color-forest)', fontFamily: 'var(--font-mono)', letterSpacing: '-0.02em' }}>
            {metrics?.active_shortages_count || 0} <span style={{ fontSize: '12px', color: 'var(--color-ash)' }}>items</span>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--color-driftwood)', marginTop: '2px' }}>
            Stock currently &le; reorder level
          </p>
        </div>

      </div>

      {/* Charts & Cluster Health Matrix */}
      <div className="analytics-layout-grid">
        
        {/* Top Transferred Materials Chart */}
        <div className="card-bone" style={{ padding: '18px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '12px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 500, color: 'var(--color-ink)' }}>
                Top Transferred Raw Materials
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--color-ash)', marginTop: '2px' }}>
                Perishable items rebalanced across branches
              </p>
            </div>
            <TrendingUp size={14} color="var(--color-ash)" />
          </div>

          <div style={{ height: '230px', width: '100%' }}>
            {top_transferred_ingredients && top_transferred_ingredients.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={top_transferred_ingredients} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis dataKey="name" stroke="#84847e" fontSize={11} interval={0} angle={-10} textAnchor="end" />
                  <YAxis stroke="#84847e" fontSize={11} fontFamily="'JetBrains Mono', monospace" />
                  <Tooltip
                    contentStyle={{ background: '#f2f1ed', border: '1px solid #cdcdc9', borderRadius: '4px', color: '#26251e', fontSize: '12px', fontFamily: "'JetBrains Mono', monospace" }}
                  />
                  <Bar dataKey="quantity" radius={[2, 2, 0, 0]}>
                    {top_transferred_ingredients.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-ash)', fontSize: '12px' }}>
                No completed transfer history recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Cluster Branch Health Overview */}
        <div className="card-bone" style={{ padding: '18px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '12px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 500, color: 'var(--color-ink)' }}>
                Cluster Network Health
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--color-ash)', marginTop: '2px' }}>
                Operational telemetry for {stores_health?.length || 0} branches
              </p>
            </div>
            <MapPin size={14} color="var(--color-ash)" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', maxHeight: '230px' }}>
            {stores_health?.map(store => {
              const isCrit = store.status === 'CRITICAL';
              const isWarn = store.status === 'WARNING';
              const badgeClass = isCrit ? 'badge-critical' : isWarn ? 'badge-warning' : 'badge-optimal';

              return (
                <div
                  key={store.id}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--color-parchment)',
                    border: `1px solid ${isCrit ? 'rgba(207, 45, 86, 0.3)' : 'var(--color-stone)'}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-ink)' }}>
                      {store.name}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--color-driftwood)' }}>
                      {store.address}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--color-ash)', fontFamily: 'var(--font-mono)' }}>
                      {isCrit ? `${store.critical_items} shortages` : `${store.total_items} items`}
                    </span>
                    <span className={badgeClass}>
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
      <div className="card-bone" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 500, color: 'var(--color-ink)', marginBottom: '12px' }}>
          Autonomous Redistribution Audit Ledger
        </h3>

        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-stone)', color: 'var(--color-ash)', fontFamily: 'var(--font-mono)' }}>
                <th style={{ padding: '8px 10px' }}>TIMESTAMP</th>
                <th style={{ padding: '8px 10px' }}>DONOR STORE</th>
                <th style={{ padding: '8px 10px' }}>RECIPIENT STORE</th>
                <th style={{ padding: '8px 10px' }}>INGREDIENT</th>
                <th style={{ padding: '8px 10px' }}>QUANTITY</th>
                <th style={{ padding: '8px 10px' }}>DISTANCE</th>
                <th style={{ padding: '8px 10px' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {recent_pings && recent_pings.length > 0 ? (
                recent_pings.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--color-linen)' }}>
                    <td style={{ padding: '8px 10px', color: 'var(--color-ash)', fontFamily: 'var(--font-mono)' }}>
                      {new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td style={{ padding: '8px 10px', color: 'var(--color-ink)', fontWeight: 500 }}>
                      {p.from_store?.name || 'Partner Store'}
                    </td>
                    <td style={{ padding: '8px 10px', color: 'var(--color-ink)', fontWeight: 500 }}>
                      {p.to_store?.name || 'Needy Store'}
                    </td>
                    <td style={{ padding: '8px 10px', color: 'var(--color-ink)' }}>
                      {p.ingredient?.name || 'Item'}
                    </td>
                    <td style={{ padding: '8px 10px', fontWeight: 500, color: 'var(--color-ink)', fontFamily: 'var(--font-mono)' }}>
                      {p.quantity} {p.ingredient?.unit}
                    </td>
                    <td style={{ padding: '8px 10px', color: 'var(--color-driftwood)', fontFamily: 'var(--font-mono)' }}>
                      {p.distance_km ? `${p.distance_km} km` : '< 5 km'}
                    </td>
                    <td style={{ padding: '8px 10px' }}>
                      <span
                        className={
                          p.status === 'COMPLETED'
                            ? 'badge-optimal'
                            : p.status === 'PENDING'
                            ? 'badge-warning'
                            : 'badge-critical'
                        }
                      >
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: 'var(--color-ash)' }}>
                    No audit records available yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
