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
  MapPin,
  Clock
} from 'lucide-react';
import { api } from '../services/api';

const COLORS = ['#06b6d4', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

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
    const interval = setInterval(loadAnalytics, 10000); // 10s auto-refresh
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
        Loading Franchise ESG & Food Waste Analytics...
      </div>
    );
  }

  const { metrics, top_transferred_ingredients, stores_health, recent_pings } = data || {};

  return (
    <div style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* ESG Executive Header Banner */}
      <div className="glass-panel" style={{ padding: '24px', borderLeft: '4px solid #10b981', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Sustainability & Operations Intelligence
            </span>
            <span className="badge-optimal" style={{ padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>
              Live Telemetry
            </span>
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc', marginTop: '4px' }}>
            Franchise ESG & Commercial Food Waste Analytics
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
            FEFO inventory redistribution prevents localized perishable ingredient spoilage across your 10km store cluster.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(16, 185, 129, 0.1)', padding: '8px 16px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
          <ShieldCheck size={20} color="#10b981" />
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#34d399' }}>
            Active FEFO Priority Engine
          </span>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        
        {/* KPI 1: Food Waste Prevented */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>
              Food Waste Prevented
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Leaf size={18} color="#10b981" />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc' }}>
            {metrics?.total_waste_prevented_kg || 0} <span style={{ fontSize: '1rem', color: '#34d399' }}>kg</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
            Rescued via FEFO prior to expiration
          </p>
        </div>

        {/* KPI 2: Cost Savings */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>
              Supply Chain Cost Saved
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={18} color="#06b6d4" />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc' }}>
            ₹{metrics?.total_cost_savings?.toLocaleString() || 0}
          </div>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
            Value of salvaged micro-ingredients
          </p>
        </div>

        {/* KPI 3: Completed Transfers */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>
              Completed Transfers
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowRightLeft size={18} color="#3b82f6" />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc' }}>
            {metrics?.completed_transfers_count || 0} <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>/ {metrics?.total_pings_count || 0} pings</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
            {metrics?.pending_pings_count || 0} pings currently pending
          </p>
        </div>

        {/* KPI 4: Active Shortages */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>
              Active Network Shortages
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(244, 63, 94, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertOctagon size={18} color="#f43f5e" />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: (metrics?.active_shortages_count || 0) > 0 ? '#fb7185' : '#34d399' }}>
            {metrics?.active_shortages_count || 0} <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>items</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
            Stock currently at or below reorder level
          </p>
        </div>

      </div>

      {/* Charts & Store Health Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Top Transferred Raw Materials Chart */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
                Top Transferred Raw Materials
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Ingredients most frequently balanced across stores
              </p>
            </div>
            <TrendingUp size={18} color="#06b6d4" />
          </div>

          <div style={{ height: '260px', width: '100%' }}>
            {top_transferred_ingredients && top_transferred_ingredients.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={top_transferred_ingredients} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} interval={0} angle={-15} textAnchor="end" />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip
                    contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc' }}
                  />
                  <Bar dataKey="quantity" radius={[6, 6, 0, 0]}>
                    {top_transferred_ingredients.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                No completed transfer history recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Store Network Inventory Health Status */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
                Store Cluster Health Matrix
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Real-time status of {stores_health?.length || 0} stores in cluster
              </p>
            </div>
            <MapPin size={18} color="#3b82f6" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', maxHeight: '260px' }}>
            {stores_health?.map(store => {
              const isCrit = store.status === 'CRITICAL';
              const isWarn = store.status === 'WARNING';
              const badgeClass = isCrit ? 'badge-critical' : isWarn ? 'badge-warning' : 'badge-optimal';

              return (
                <div
                  key={store.id}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: `1px solid ${isCrit ? 'rgba(244, 63, 94, 0.3)' : 'var(--border-color)'}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#f8fafc' }}>
                      {store.name}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                      {store.address}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'right' }}>
                      {isCrit ? (
                        <span style={{ color: '#fb7185', fontWeight: 600 }}>{store.critical_items} shortages</span>
                      ) : (
                        <span>{store.total_items} items safe</span>
                      )}
                    </div>
                    <span className={badgeClass} style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
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
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', marginBottom: '14px' }}>
          Autonomous Redistribution Audit Ledger
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: '#94a3b8' }}>
                <th style={{ padding: '10px' }}>Timestamp</th>
                <th style={{ padding: '10px' }}>Donor Store</th>
                <th style={{ padding: '10px' }}>Recipient Store</th>
                <th style={{ padding: '10px' }}>Ingredient</th>
                <th style={{ padding: '10px' }}>Quantity</th>
                <th style={{ padding: '10px' }}>Distance</th>
                <th style={{ padding: '10px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {recent_pings && recent_pings.length > 0 ? (
                recent_pings.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '10px', color: '#94a3b8' }}>
                      {new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td style={{ padding: '10px', color: '#f8fafc', fontWeight: 500 }}>
                      {p.from_store?.name || 'Partner Store'}
                    </td>
                    <td style={{ padding: '10px', color: '#f8fafc', fontWeight: 500 }}>
                      {p.to_store?.name || 'Needy Store'}
                    </td>
                    <td style={{ padding: '10px', color: '#38bdf8' }}>
                      {p.ingredient?.name || 'Item'}
                    </td>
                    <td style={{ padding: '10px', fontWeight: 700, color: '#f8fafc' }}>
                      {p.quantity} {p.ingredient?.unit}
                    </td>
                    <td style={{ padding: '10px', color: '#94a3b8' }}>
                      {p.distance_km ? `${p.distance_km} km` : '< 5 km'}
                    </td>
                    <td style={{ padding: '10px' }}>
                      <span
                        className={
                          p.status === 'COMPLETED'
                            ? 'badge-optimal'
                            : p.status === 'PENDING'
                            ? 'badge-warning'
                            : 'badge-critical'
                        }
                        style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700 }}
                      >
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
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
