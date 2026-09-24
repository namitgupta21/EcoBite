import React, { useState, useMemo } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, Zap, AlertTriangle, CheckCircle, Flame, Layers } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';

export default function POSSimulator({ menuItems, recipes, inventory, activeStore, onOrderSuccess }) {
  const [cart, setCart] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [orderReceipt, setOrderReceipt] = useState(null);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set(['All']);
    menuItems.forEach(item => {
      if (item.category) set.add(item.category);
    });
    return Array.from(set);
  }, [menuItems]);

  // Filtered menu items
  const filteredMenuItems = useMemo(() => {
    if (selectedCategory === 'All') return menuItems;
    return menuItems.filter(item => item.category === selectedCategory);
  }, [menuItems, selectedCategory]);

  // Cart operations
  const addToCart = (item) => {
    setCart(prev => ({
      ...prev,
      [item.id]: (prev[item.id] || 0) + 1
    }));
  };

  const removeFromCart = (itemId) => {
    setCart(prev => {
      const updated = { ...prev };
      if (updated[itemId] > 1) {
        updated[itemId] -= 1;
      } else {
        delete updated[itemId];
      }
      return updated;
    });
  };

  const clearCart = () => setCart({});

  // Compute Cart Totals
  const cartItemsArray = useMemo(() => {
    return Object.entries(cart).map(([itemId, qty]) => {
      const item = menuItems.find(m => m.id === itemId);
      return { item, qty, subtotal: (item?.price || 0) * qty };
    }).filter(entry => entry.item);
  }, [cart, menuItems]);

  const cartTotal = useMemo(() => {
    return cartItemsArray.reduce((sum, entry) => sum + entry.subtotal, 0);
  }, [cartItemsArray]);

  // Real-time Micro-Ingredient Deduction Calculation (Live Preview)
  const predictedDeductions = useMemo(() => {
    const deductions = {};
    for (const { item, qty } of cartItemsArray) {
      const itemRecipes = recipes.filter(r => r.menu_item_id === item.id);
      for (const r of itemRecipes) {
        const required = Number(r.quantity_required) * qty;
        if (!deductions[r.ingredient_id]) {
          deductions[r.ingredient_id] = {
            ingredient: r.ingredients,
            totalRequired: 0
          };
        }
        deductions[r.ingredient_id].totalRequired += required;
      }
    }

    // Map to current store inventory
    const inventoryMap = {};
    inventory.forEach(inv => {
      inventoryMap[inv.ingredient_id] = inv;
    });

    return Object.entries(deductions).map(([ingId, data]) => {
      const invRecord = inventoryMap[ingId];
      const currentStock = invRecord ? Number(invRecord.quantity) : 0;
      const reorderLevel = invRecord ? Number(invRecord.reorder_level) : 5;
      const willBeCritical = (currentStock - data.totalRequired) <= reorderLevel;

      return {
        ingredient_id: ingId,
        name: data.ingredient?.name || 'Item',
        unit: data.ingredient?.unit || 'units',
        required: Math.round(data.totalRequired * 100) / 100,
        currentStock,
        reorderLevel,
        remainingPredicted: Math.round((currentStock - data.totalRequired) * 100) / 100,
        willBeCritical
      };
    });
  }, [cartItemsArray, recipes, inventory]);

  const willTriggerPings = useMemo(() => {
    return predictedDeductions.some(d => d.willBeCritical);
  }, [predictedDeductions]);

  // Handle Checkout / Place Order
  const handlePlaceOrder = async () => {
    if (cartItemsArray.length === 0 || !activeStore) return;

    setLoading(true);
    try {
      const itemsPayload = cartItemsArray.map(({ item, qty }) => ({
        menu_item_id: item.id,
        quantity: qty
      }));

      const res = await api.placeOrder(activeStore.id, itemsPayload);

      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      setOrderReceipt(res);
      clearCart();
      if (onOrderSuccess) onOrderSuccess();
    } catch (err) {
      alert(`Order Failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '0 24px 24px', display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px' }}>
      
      {/* Left Column: Menu Items & Recipes */}
      <div>
        {/* Banner with Active Store Location */}
        <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: '4px solid #06b6d4' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Active Ordering Terminal
              </span>
              <span className="badge-optimal" style={{ padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>
                ONLINE
              </span>
            </div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', marginTop: '2px' }}>
              {activeStore?.name}
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
              {activeStore?.address}
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Geospatial Coordinates</span>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem', color: '#38bdf8', fontWeight: 600 }}>
              {activeStore?.lat?.toFixed(4)}° N, {activeStore?.log?.toFixed(4)}° E
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className="btn-outline"
              style={{
                padding: '6px 16px',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: 600,
                background: selectedCategory === cat ? 'linear-gradient(135deg, #06b6d4, #3b82f6)' : 'rgba(255, 255, 255, 0.05)',
                color: selectedCategory === cat ? '#ffffff' : '#94a3b8',
                borderColor: selectedCategory === cat ? 'transparent' : 'var(--border-color)'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
          {filteredMenuItems.map(item => {
            const itemRecipes = recipes.filter(r => r.menu_item_id === item.id);
            const inCartQty = cart[item.id] || 0;

            return (
              <div key={item.id} className="glass-panel glass-panel-hover" style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  {/* Category & Price */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {item.category || 'Menu'}
                    </span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
                      ₹{item.price}
                    </span>
                  </div>

                  {/* Item Name */}
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#f8fafc', marginBottom: '8px' }}>
                    {item.name}
                  </h3>

                  {/* Recipe Bill of Materials (BOM) Tag list */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px' }}>
                      <Layers size={12} color="#06b6d4" />
                      <span>Micro-Ingredients Required:</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {itemRecipes.map((r, idx) => (
                        <span
                          key={idx}
                          style={{
                            fontSize: '0.68rem',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            color: '#cbd5e1',
                            border: '1px solid rgba(255, 255, 255, 0.08)'
                          }}
                        >
                          {r.ingredients?.name}: {r.quantity_required} {r.ingredients?.unit}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Add to Cart / Quantity Selector */}
                {inCartQty > 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(6, 182, 212, 0.15)', borderRadius: '10px', padding: '4px 8px', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      style={{ background: 'none', border: 'none', color: '#f8fafc', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                    >
                      <Minus size={16} />
                    </button>
                    <span style={{ fontWeight: 700, color: '#22d3ee', fontSize: '0.95rem' }}>
                      {inCartQty} in Cart
                    </span>
                    <button
                      onClick={() => addToCart(item)}
                      style={{ background: 'none', border: 'none', color: '#f8fafc', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => addToCart(item)}
                    className="btn-primary"
                    style={{ width: '100%', justifyContent: 'center', padding: '8px 12px', fontSize: '0.85rem' }}
                  >
                    <Plus size={16} />
                    <span>Add to Order</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Order Cart & Live Micro-Deduction Engine */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Cart Panel */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShoppingCart size={20} color="#06b6d4" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
                Customer Cart
              </h3>
            </div>
            {cartItemsArray.length > 0 && (
              <button
                onClick={clearCart}
                style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Trash2 size={12} /> Clear
              </button>
            )}
          </div>

          {cartItemsArray.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 12px', color: '#64748b' }}>
              <ShoppingCart size={36} style={{ margin: '0 auto 10px', opacity: 0.3 }} />
              <p style={{ fontSize: '0.85rem' }}>Cart is currently empty.</p>
              <p style={{ fontSize: '0.75rem', color: '#475569', marginTop: '4px' }}>
                Select items from the menu to simulate order placement.
              </p>
            </div>
          ) : (
            <div>
              {/* Items List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '220px', overflowY: 'auto', paddingRight: '4px', marginBottom: '16px' }}>
                {cartItemsArray.map(({ item, qty, subtotal }) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc' }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        ₹{item.price} &times; {qty}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontWeight: 700, color: '#38bdf8', fontSize: '0.9rem' }}>
                        ₹{subtotal}
                      </span>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button onClick={() => removeFromCart(item.id)} style={{ background: 'rgba(255, 255, 255, 0.1)', border: 'none', color: '#f8fafc', borderRadius: '4px', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>-</button>
                        <button onClick={() => addToCart(item)} style={{ background: 'rgba(255, 255, 255, 0.1)', border: 'none', color: '#f8fafc', borderRadius: '4px', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>+</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Subtotal */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Order Total</span>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc' }}>
                  ₹{cartTotal}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Live Micro-Ingredient Deduction Visualizer */}
        {cartItemsArray.length > 0 && (
          <div className="glass-panel" style={{ padding: '18px', border: willTriggerPings ? '1px solid rgba(244, 63, 94, 0.4)' : '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Flame size={16} color={willTriggerPings ? '#f43f5e' : '#06b6d4'} />
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc' }}>
                  Micro-Deduction Engine
                </h4>
              </div>
              <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.05)', color: '#94a3b8' }}>
                Live Simulation
              </span>
            </div>

            {/* Warning if stock critical */}
            {willTriggerPings && (
              <div style={{ background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: '8px', padding: '8px 10px', marginBottom: '12px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <AlertTriangle size={16} color="#fb7185" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '0.75rem', color: '#fecdd3' }}>
                  <strong>Autonomous Redistribution Alert:</strong> This order will push stock below threshold! A 10km FEFO transfer ping will trigger automatically.
                </div>
              </div>
            )}

            {/* Micro Deductions List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
              {predictedDeductions.map(d => (
                <div key={d.ingredient_id} style={{ fontSize: '0.75rem', padding: '6px 8px', background: d.willBeCritical ? 'rgba(244, 63, 94, 0.1)' : 'rgba(255, 255, 255, 0.02)', borderRadius: '6px', border: `1px solid ${d.willBeCritical ? 'rgba(244, 63, 94, 0.3)' : 'rgba(255, 255, 255, 0.04)'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <span style={{ fontWeight: 600, color: d.willBeCritical ? '#fb7185' : '#f8fafc' }}>
                      {d.name}
                    </span>
                    <span style={{ color: '#fb7185', fontWeight: 600 }}>
                      -{d.required} {d.unit}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.7rem' }}>
                    <span>Current: {d.currentStock} {d.unit}</span>
                    <span>Remaining: {d.remainingPredicted} {d.unit} (Reorder: {d.reorderLevel})</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Place Order CTA */}
            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', marginTop: '16px', justifyContent: 'center', padding: '12px', fontSize: '0.95rem' }}
            >
              <Zap size={18} />
              <span>{loading ? 'Processing Micro-Deductions...' : 'Place Order & Deduct Inventory'}</span>
            </button>
          </div>
        )}

      </div>

      {/* Order Success Receipt Modal */}
      {orderReceipt && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div className="glass-panel" style={{ maxWidth: '480px', width: '100%', padding: '24px', border: '1px solid rgba(6, 182, 212, 0.4)', boxShadow: '0 0 40px rgba(6, 182, 212, 0.2)' }}>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <CheckCircle size={32} color="#10b981" />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>
                Order Processed Atomically!
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
                Receipt: {orderReceipt.order_id} &bull; {orderReceipt.store?.name}
              </p>
            </div>

            {/* Autonomous Redistribution Banner if Pings were initiated */}
            {orderReceipt.triggered_pings && orderReceipt.triggered_pings.length > 0 && (
              <div style={{ background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.4)', borderRadius: '10px', padding: '12px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fb7185', fontWeight: 700, fontSize: '0.85rem', marginBottom: '4px' }}>
                  <AlertTriangle size={16} />
                  <span>10km Autonomous Redistribution Initiated!</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#fecdd3', lineHeight: 1.4 }}>
                  {orderReceipt.triggered_pings.map((p, idx) => (
                    <div key={idx} style={{ marginTop: '4px' }}>
                      &bull; Restock requested: <strong>{p.quantity} {p.ingredient?.unit} of {p.ingredient?.name}</strong> from <strong>{p.from_store?.name}</strong> ({p.distance_km} km away).
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Deductions Summary */}
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', borderRadius: '10px', padding: '12px', marginBottom: '18px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>
                Micro-Ingredients Deducted:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '140px', overflowY: 'auto' }}>
                {orderReceipt.deductions?.map((d, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                    <span style={{ color: '#cbd5e1' }}>{d.name}</span>
                    <span style={{ color: '#38bdf8', fontFamily: 'JetBrains Mono, monospace' }}>
                      -{d.deducted} {d.unit} (Left: {d.remaining_stock})
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setOrderReceipt(null)}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Done / Return to Terminal
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
