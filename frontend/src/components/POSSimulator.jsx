import React, { useState, useMemo } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, ArrowRight, AlertTriangle, Check, Layers } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';

export default function POSSimulator({ menuItems, recipes, inventory, activeStore, onOrderSuccess }) {
  const [cart, setCart] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [orderReceipt, setOrderReceipt] = useState(null);

  const categories = useMemo(() => {
    const set = new Set(['All']);
    menuItems.forEach(item => {
      if (item.category) set.add(item.category);
    });
    return Array.from(set);
  }, [menuItems]);

  const filteredMenuItems = useMemo(() => {
    if (selectedCategory === 'All') return menuItems;
    return menuItems.filter(item => item.category === selectedCategory);
  }, [menuItems, selectedCategory]);

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

  const cartItemsArray = useMemo(() => {
    return Object.entries(cart).map(([itemId, qty]) => {
      const item = menuItems.find(m => m.id === itemId);
      return { item, qty, subtotal: (item?.price || 0) * qty };
    }).filter(entry => entry.item);
  }, [cart, menuItems]);

  const cartTotal = useMemo(() => {
    return cartItemsArray.reduce((sum, entry) => sum + entry.subtotal, 0);
  }, [cartItemsArray]);

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

  const handlePlaceOrder = async () => {
    if (cartItemsArray.length === 0 || !activeStore) return;

    setLoading(true);
    try {
      const itemsPayload = cartItemsArray.map(({ item, qty }) => ({
        menu_item_id: item.id,
        quantity: qty
      }));

      const res = await api.placeOrder(activeStore.id, itemsPayload);

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
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
    <div className="responsive-page-container pos-layout-grid">
      
      {/* Left Column: Menu Items & Recipe BOM */}
      <div>
        
        {/* Terminal Header Card */}
        <div className="card-bone banner-flex" style={{ padding: '16px 20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge-mono" style={{ fontSize: '10px' }}>TERMINAL PERSPECTIVE</span>
              <span className="badge-optimal">ONLINE</span>
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 500, color: 'var(--color-ink)', marginTop: '4px' }}>
              {activeStore?.name}
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--color-driftwood)', marginTop: '2px' }}>
              {activeStore?.address}
            </p>
          </div>

          <div style={{ textAlign: 'left' }}>
            <span style={{ fontSize: '11px', color: 'var(--color-ash)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Coordinates</span>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--color-ink)', marginTop: '2px' }}>
              {activeStore?.lat?.toFixed(4)}°N, {activeStore?.log?.toFixed(4)}°E
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '2px', WebkitOverflowScrolling: 'touch' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '5px 12px',
                borderRadius: 'var(--radius-md)',
                fontSize: '12px',
                fontWeight: selectedCategory === cat ? 500 : 400,
                cursor: 'pointer',
                border: '1px solid var(--color-stone)',
                background: selectedCategory === cat ? 'var(--color-ink)' : 'var(--color-bone)',
                color: selectedCategory === cat ? 'var(--color-parchment)' : 'var(--color-driftwood)',
                transition: 'all 150ms',
                whiteSpace: 'nowrap'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu Cards Grid */}
        <div className="menu-cards-grid">
          {filteredMenuItems.map(item => {
            const itemRecipes = recipes.filter(r => r.menu_item_id === item.id);
            const inCartQty = cart[item.id] || 0;

            return (
              <div key={item.id} className="card-bone card-bone-hover" style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-ash)', textTransform: 'uppercase' }}>
                      {item.category || 'Menu'}
                    </span>
                    <span style={{ fontSize: '15px', fontWeight: 500, color: 'var(--color-ink)', fontFamily: 'var(--font-mono)' }}>
                      ₹{item.price}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '15px', fontWeight: 500, color: 'var(--color-ink)', marginBottom: '8px', lineHeight: 1.3 }}>
                    {item.name}
                  </h3>

                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--color-ash)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Layers size={11} />
                      <span>BOM Requirements:</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {itemRecipes.map((r, idx) => (
                        <span key={idx} className="badge-mono" style={{ fontSize: '10px' }}>
                          {r.ingredients?.name}: {r.quantity_required}{r.ingredients?.unit}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {inCartQty > 0 ? (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'var(--color-linen)',
                    borderRadius: 'var(--radius-md)',
                    padding: '4px 8px',
                    border: '1px solid var(--color-stone)'
                  }}>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      style={{ background: 'none', border: 'none', color: 'var(--color-ink)', cursor: 'pointer', padding: '2px 6px', display: 'flex', alignItems: 'center' }}
                    >
                      <Minus size={13} />
                    </button>
                    <span style={{ fontSize: '12px', fontWeight: 500, fontFamily: 'var(--font-mono)', color: 'var(--color-ink)' }}>
                      {inCartQty} in cart
                    </span>
                    <button
                      onClick={() => addToCart(item)}
                      style={{ background: 'none', border: 'none', color: 'var(--color-ink)', cursor: 'pointer', padding: '2px 6px', display: 'flex', alignItems: 'center' }}
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => addToCart(item)}
                    className="btn-primary"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <Plus size={13} />
                    <span>Add to Order</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Customer Cart & Live Micro-Deduction Engine */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Cart Panel */}
        <div className="card-bone" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShoppingCart size={15} color="var(--color-ink)" />
              <h3 style={{ fontSize: '15px', fontWeight: 500, color: 'var(--color-ink)' }}>
                Customer Cart
              </h3>
            </div>
            {cartItemsArray.length > 0 && (
              <button
                onClick={clearCart}
                className="btn-ghost"
                style={{ padding: '2px 6px', fontSize: '11px' }}
              >
                <Trash2 size={12} /> Clear
              </button>
            )}
          </div>

          {cartItemsArray.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 12px', color: 'var(--color-ash)' }}>
              <p style={{ fontSize: '13px' }}>Cart is empty</p>
              <p style={{ fontSize: '12px', color: 'var(--color-mist)', marginTop: '4px' }}>
                Add dishes from the menu to simulate order intake.
              </p>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto', marginBottom: '12px' }}>
                {cartItemsArray.map(({ item, qty, subtotal }) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px', background: 'var(--color-linen)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-ink)' }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-driftwood)', fontFamily: 'var(--font-mono)' }}>
                        ₹{item.price} &times; {qty}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 500, fontFamily: 'var(--font-mono)', color: 'var(--color-ink)' }}>
                        ₹{subtotal}
                      </span>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        <button onClick={() => removeFromCart(item.id)} style={{ background: 'var(--color-bone)', border: '1px solid var(--color-stone)', color: 'var(--color-ink)', borderRadius: 'var(--radius-sm)', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>-</button>
                        <button onClick={() => addToCart(item)} style={{ background: 'var(--color-bone)', border: '1px solid var(--color-stone)', color: 'var(--color-ink)', borderRadius: 'var(--radius-sm)', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>+</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '1px solid var(--color-stone)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ color: 'var(--color-driftwood)', fontSize: '13px' }}>Subtotal</span>
                <span style={{ fontSize: '18px', fontWeight: 500, color: 'var(--color-ink)', fontFamily: 'var(--font-mono)' }}>
                  ₹{cartTotal}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Live Micro-Deduction Engine Panel */}
        {cartItemsArray.length > 0 && (
          <div className="card-bone" style={{ padding: '16px', border: willTriggerPings ? '1px solid var(--color-crimson)' : '1px solid var(--color-stone)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: willTriggerPings ? 'var(--color-crimson)' : 'var(--color-amber)', fontSize: '12px' }}>⚡</span>
                <h4 style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-ink)' }}>
                  Micro-Deduction Engine
                </h4>
              </div>
              <span className="badge-mono" style={{ fontSize: '10px' }}>LIVE PREVIEW</span>
            </div>

            {willTriggerPings && (
              <div style={{ background: 'rgba(207, 45, 86, 0.08)', border: '1px solid rgba(207, 45, 86, 0.3)', borderRadius: 'var(--radius-md)', padding: '8px 10px', marginBottom: '10px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <AlertTriangle size={14} color="var(--color-crimson)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '12px', color: 'var(--color-crimson)', lineHeight: 1.35 }}>
                  <strong>Threshold Alert:</strong> Deductions will push stock below threshold. 10km FEFO redistribution ping will trigger automatically.
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
              {predictedDeductions.map(d => (
                <div key={d.ingredient_id} style={{ fontSize: '12px', padding: '6px 8px', background: d.willBeCritical ? 'rgba(207, 45, 86, 0.06)' : 'var(--color-linen)', borderRadius: 'var(--radius-md)', border: `1px solid ${d.willBeCritical ? 'rgba(207, 45, 86, 0.25)' : 'var(--color-stone)'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <span style={{ fontWeight: 500, color: 'var(--color-ink)' }}>{d.name}</span>
                    <span style={{ color: d.willBeCritical ? 'var(--color-crimson)' : 'var(--color-driftwood)', fontFamily: 'var(--font-mono)' }}>
                      -{d.required} {d.unit}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-ash)', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                    <span>Current: {d.currentStock} {d.unit}</span>
                    <span>Remaining: {d.remainingPredicted} {d.unit}</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', marginTop: '12px', justifyContent: 'center', padding: '10px 14px' }}
            >
              <span>{loading ? 'Executing Deductions...' : 'Place Order & Deduct Inventory'}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )}

      </div>

      {/* Order Success Receipt Modal */}
      {orderReceipt && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(38, 37, 30, 0.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div className="card-bone" style={{ maxWidth: '440px', width: '100%', padding: '20px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)', border: '1px solid var(--color-stone)' }}>
            <div style={{ textAlign: 'center', marginBottom: '14px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', background: 'var(--color-forest)', color: 'var(--color-parchment)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                <Check size={18} />
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 500, color: 'var(--color-ink)' }}>
                Order Processed Atomically
              </h3>
              <p style={{ fontSize: '11px', color: 'var(--color-driftwood)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                Receipt: {orderReceipt.order_id} &bull; {orderReceipt.store?.name}
              </p>
            </div>

            {orderReceipt.triggered_pings && orderReceipt.triggered_pings.length > 0 && (
              <div style={{ background: 'rgba(207, 45, 86, 0.08)', border: '1px solid rgba(207, 45, 86, 0.3)', borderRadius: 'var(--radius-md)', padding: '10px 12px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-crimson)', fontWeight: 500, fontSize: '12px', marginBottom: '4px' }}>
                  <AlertTriangle size={13} />
                  <span>10km FEFO Redistribution Ping Initiated</span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--color-crimson)', lineHeight: 1.4 }}>
                  {orderReceipt.triggered_pings.map((p, idx) => (
                    <div key={idx} style={{ marginTop: '2px' }}>
                      &bull; Restock requested: <strong>{p.quantity}{p.ingredient?.unit} of {p.ingredient?.name}</strong> from <strong>{p.from_store?.name}</strong> ({p.distance_km} km away).
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ background: 'var(--color-linen)', borderRadius: 'var(--radius-md)', padding: '10px 12px', marginBottom: '14px' }}>
              <div style={{ fontSize: '11px', fontWeight: 500, color: 'var(--color-ash)', textTransform: 'uppercase', marginBottom: '6px' }}>
                Deducted Raw Materials
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '120px', overflowY: 'auto' }}>
                {orderReceipt.deductions?.map((d, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: 'var(--color-ink)' }}>{d.name}</span>
                    <span style={{ color: 'var(--color-driftwood)', fontFamily: 'var(--font-mono)' }}>
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
              Return to Terminal
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
