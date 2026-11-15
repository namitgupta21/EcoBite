import React, { useState, useMemo } from 'react';
import { ShoppingCart, Plus, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';

const DISH_IMAGE_MAP = {
  // ── 1. Canonical Backend Seed Items (seed.js) ──
  'Classic Crispy Veg Burger': {
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80',
    badge: 'Always Fresh 🌱',
    isVeg: true,
    rating: '4.9 (142)'
  },
  'Grilled Chicken Deluxe Burger': {
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
    badge: "Chef's Choice ⭐",
    isVeg: false,
    rating: '4.9 (218)'
  },
  'Golden Salted French Fries': {
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=80',
    badge: 'Farm Potatoes 🥔',
    isVeg: true,
    rating: '4.8 (95)'
  },
  'Cheesy Loaded Fries': {
    image: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?w=600&auto=format&fit=crop&q=80',
    badge: 'Melted Cheddar 🧀',
    isVeg: true,
    rating: '4.9 (180)'
  },
  'Chilled Fountain Cola (500ml)': {
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80',
    badge: 'Ice Chilled ❄️',
    isVeg: true,
    rating: '4.7 (88)'
  },
  'Chef Special Combo Meal': {
    image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=600&auto=format&fit=crop&q=80',
    badge: 'Best Value 🍱',
    isVeg: true,
    rating: '5.0 (310)'
  },

  // ── 2. Aliases & Shorthand Variations ──
  'Classic Veg Burger': {
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80',
    badge: 'Always Fresh 🌱',
    isVeg: true,
    rating: '4.9 (142)'
  },
  'Gourmet Chicken Burger': {
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
    badge: "Chef's Choice ⭐",
    isVeg: false,
    rating: '4.9 (218)'
  },
  'Crispy French Fries': {
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=80',
    badge: 'Farm Potatoes 🥔',
    isVeg: true,
    rating: '4.8 (95)'
  },
  'Loaded Cheesy Fries': {
    image: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?w=600&auto=format&fit=crop&q=80',
    badge: 'Melted Cheddar 🧀',
    isVeg: true,
    rating: '4.9 (180)'
  },
  'Fountain Cola': {
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80',
    badge: 'Ice Chilled ❄️',
    isVeg: true,
    rating: '4.7 (88)'
  },
  'Supreme Combo Meal': {
    image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=600&auto=format&fit=crop&q=80',
    badge: 'Best Value 🍱',
    isVeg: true,
    rating: '5.0 (310)'
  },

  // ── 3. Additional Popular Menu Items (Consistent Warm Cinematic Food Photography) ──
  'Spicy Paneer Tikka Burger': {
    image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=80',
    badge: 'Tandoori Spiced 🌶️',
    isVeg: true,
    rating: '4.8 (112)'
  },
  'Double Patty Smash Burger': {
    image: 'https://images.unsplash.com/photo-1583032015879-a5a544c9b20b?w=600&auto=format&fit=crop&q=80',
    badge: 'Double Stack 🥩',
    isVeg: false,
    rating: '4.9 (245)'
  },
  'Peri Peri Seasoned Fries': {
    image: 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=600&auto=format&fit=crop&q=80',
    badge: 'Fiery Zest 🌶️',
    isVeg: true,
    rating: '4.8 (130)'
  },
  'Crispy Golden Onion Rings': {
    image: 'https://images.unsplash.com/photo-1639024471285-05c285cc1506?w=600&auto=format&fit=crop&q=80',
    badge: 'Golden Crunch 🧅',
    isVeg: true,
    rating: '4.7 (76)'
  },
  'Fresh Lemon Mint Cooler': {
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80',
    badge: 'Cold Pressed 🍋',
    isVeg: true,
    rating: '4.8 (94)'
  },
  'Iced Cold Brew Coffee': {
    image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&auto=format&fit=crop&q=80',
    badge: 'Single Origin ☕',
    isVeg: true,
    rating: '4.9 (160)'
  },
  'Warm Chocolate Brownie Sundae': {
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80',
    badge: 'Artisan Sweet 🍫',
    isVeg: true,
    rating: '4.9 (205)'
  },
  'Farm Fresh Garden Salad': {
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80',
    badge: 'Farm Picked 🥗',
    isVeg: true,
    rating: '4.8 (82)'
  },
  'Crispy Chicken Tenders': {
    image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=600&auto=format&fit=crop&q=80',
    badge: 'Crispy Golden 🍗',
    isVeg: false,
    rating: '4.9 (175)'
  },
  'Artisan Margherita Pizza': {
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80',
    badge: 'Wood Fired 🍕',
    isVeg: true,
    rating: '4.9 (290)'
  }
};

const getDishMeta = (item) => {
  if (!item) {
    return {
      image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80',
      badge: 'Always Fresh 🌱',
      isVeg: true,
      rating: '4.9 (100)'
    };
  }

  // 1. Direct dictionary match
  if (DISH_IMAGE_MAP[item.name]) {
    return DISH_IMAGE_MAP[item.name];
  }

  const nameLower = (item.name || '').toLowerCase();
  const categoryLower = (item.category || '').toLowerCase();

  // Determine veg / non-veg status
  const isNonVeg = nameLower.includes('chicken') || 
                   nameLower.includes('meat') || 
                   nameLower.includes('beef') || 
                   nameLower.includes('bacon') || 
                   nameLower.includes('fish') ||
                   nameLower.includes('smash') ||
                   nameLower.includes('deluxe burger');
  const isVeg = !isNonVeg;

  // 2. Intelligent keyword heuristics
  if (nameLower.includes('paneer')) {
    return {
      image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=80',
      badge: 'Tandoori Spiced 🌶️',
      isVeg: true,
      rating: '4.8 (112)'
    };
  }

  if (nameLower.includes('burger')) {
    if (isNonVeg) {
      return {
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
        badge: "Chef's Choice ⭐",
        isVeg: false,
        rating: '4.9 (218)'
      };
    }
    return {
      image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80',
      badge: 'Always Fresh 🌱',
      isVeg: true,
      rating: '4.9 (142)'
    };
  }

  if (nameLower.includes('cheese') && (nameLower.includes('frie') || nameLower.includes('fry') || nameLower.includes('loaded'))) {
    return {
      image: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?w=600&auto=format&fit=crop&q=80',
      badge: 'Melted Cheddar 🧀',
      isVeg: true,
      rating: '4.9 (180)'
    };
  }

  if (nameLower.includes('peri') && (nameLower.includes('frie') || nameLower.includes('fry'))) {
    return {
      image: 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=600&auto=format&fit=crop&q=80',
      badge: 'Fiery Zest 🌶️',
      isVeg: true,
      rating: '4.8 (130)'
    };
  }

  if (nameLower.includes('frie') || nameLower.includes('fry') || nameLower.includes('potato') || nameLower.includes('wedges')) {
    return {
      image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=80',
      badge: 'Farm Potatoes 🥔',
      isVeg: true,
      rating: '4.8 (95)'
    };
  }

  if (nameLower.includes('onion') && nameLower.includes('ring')) {
    return {
      image: 'https://images.unsplash.com/photo-1639024471285-05c285cc1506?w=600&auto=format&fit=crop&q=80',
      badge: 'Golden Crunch 🧅',
      isVeg: true,
      rating: '4.7 (76)'
    };
  }

  if (nameLower.includes('tender') || nameLower.includes('nugget') || nameLower.includes('wing')) {
    return {
      image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=600&auto=format&fit=crop&q=80',
      badge: 'Crispy Golden 🍗',
      isVeg: false,
      rating: '4.9 (175)'
    };
  }

  if (nameLower.includes('cola') || nameLower.includes('coke') || nameLower.includes('soda') || nameLower.includes('pepsi')) {
    return {
      image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80',
      badge: 'Ice Chilled ❄️',
      isVeg: true,
      rating: '4.7 (88)'
    };
  }

  if (nameLower.includes('coffee') || nameLower.includes('brew') || nameLower.includes('latte')) {
    return {
      image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&auto=format&fit=crop&q=80',
      badge: 'Single Origin ☕',
      isVeg: true,
      rating: '4.9 (160)'
    };
  }

  if (nameLower.includes('lemon') || nameLower.includes('mojito') || nameLower.includes('cooler') || nameLower.includes('juice')) {
    return {
      image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80',
      badge: 'Cold Pressed 🍋',
      isVeg: true,
      rating: '4.8 (94)'
    };
  }

  if (nameLower.includes('combo') || nameLower.includes('meal') || nameLower.includes('thali')) {
    return {
      image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=600&auto=format&fit=crop&q=80',
      badge: 'Best Value 🍱',
      isVeg: !isNonVeg,
      rating: '5.0 (310)'
    };
  }

  if (nameLower.includes('pizza')) {
    return {
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80',
      badge: 'Wood Fired 🍕',
      isVeg: !isNonVeg,
      rating: '4.9 (290)'
    };
  }

  if (nameLower.includes('salad')) {
    return {
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80',
      badge: 'Farm Picked 🥗',
      isVeg: true,
      rating: '4.8 (82)'
    };
  }

  if (nameLower.includes('brownie') || nameLower.includes('cake') || nameLower.includes('sundae') || nameLower.includes('dessert') || nameLower.includes('ice cream')) {
    return {
      image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80',
      badge: 'Artisan Sweet 🍫',
      isVeg: true,
      rating: '4.9 (205)'
    };
  }

  // 3. Category Fallback
  if (categoryLower === 'burgers') {
    return {
      image: isNonVeg
        ? 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80',
      badge: isNonVeg ? "Chef's Choice ⭐" : 'Always Fresh 🌱',
      isVeg: !isNonVeg,
      rating: '4.9 (180)'
    };
  }

  if (categoryLower === 'sides') {
    return {
      image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=80',
      badge: 'Farm Potatoes 🥔',
      isVeg: true,
      rating: '4.8 (95)'
    };
  }

  if (categoryLower === 'beverages' || categoryLower === 'drinks') {
    return {
      image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80',
      badge: 'Ice Chilled ❄️',
      isVeg: true,
      rating: '4.7 (88)'
    };
  }

  if (categoryLower === 'combos') {
    return {
      image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=600&auto=format&fit=crop&q=80',
      badge: 'Best Value 🍱',
      isVeg: !isNonVeg,
      rating: '5.0 (310)'
    };
  }

  // 4. Default Fallback
  return {
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
    badge: isVeg ? 'Plant Fresh 🌿' : 'Signature 🍴',
    isVeg,
    rating: '4.9 (98)'
  };
};

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
    <div className="responsive-page-container">
      <div className="pos-layout">
        
        {/* Left Column: Hero Banner, Category Chips, Dishes Grid */}
        <div className="pos-catalog-section">
          
          {/* GreenBasket Inspiration Hero & Live Redistribution Partner Banner */}
          <div className="gb-pos-hero-banner">
            <div className="gb-hero-main">
              <span className="gb-script-subtitle">Farm Fresh · 10km Redistribution Mesh</span>
              <h2 className="gb-hero-title">Good food, Good life.</h2>
              <p className="gb-hero-desc">
                Operating from <strong>{activeStore?.name || 'Central Hub - Connaught Place'}</strong> ({activeStore?.address || 'Cluster Terminal'}). Real-time BOM micro-deduction with intelligent FEFO surplus balancing.
              </p>
              <div className="gb-usp-row">
                <div className="gb-usp-badge">
                  <span className="gb-usp-icon">🌿</span>
                  <div><strong>100% Organic</strong><p>Certified & Fresh</p></div>
                </div>
                <div className="gb-usp-badge">
                  <span className="gb-usp-icon">⚡</span>
                  <div><strong>Auto Micro-Deduction</strong><p>Real-Time BOM Sync</p></div>
                </div>
                <div className="gb-usp-badge">
                  <span className="gb-usp-icon">🛡️</span>
                  <div><strong>Zero Food Waste</strong><p>FEFO Redistribution</p></div>
                </div>
              </div>
            </div>

            {/* Live Redistribution Transit Partner Widget */}
            <div className="gb-transit-card">
              <div className="gb-transit-header">
                <span className="gb-transit-title">Track Redistribution</span>
                <span className="gb-live-pill"><span className="gb-live-dot"></span> LIVE</span>
              </div>
              <div className="gb-partner-info">
                <img
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80"
                  alt="Rahul Sharma"
                  className="gb-partner-avatar"
                />
                <div className="gb-partner-meta">
                  <h4 className="gb-partner-name">Rahul Sharma</h4>
                  <span className="gb-partner-sub">10km EV Redistribution Courier</span>
                  <span className="gb-partner-rating">⭐ 4.8 · Active Route</span>
                </div>
                <div className="gb-partner-actions">
                  <button type="button" className="gb-action-circle" title="Call Transit Partner">📞</button>
                  <button type="button" className="gb-action-circle" title="Message Transit Partner">💬</button>
                </div>
              </div>
              <div className="gb-transit-progress">
                <div className="gb-progress-info">
                  <span>On the way to Hub</span>
                  <strong className="gb-eta-text">Arriving in 12 min</strong>
                </div>
                <div className="gb-stepper-bar">
                  <div className="gb-step done" title="Order Confirmed"><span>✓</span></div>
                  <div className="gb-step-line done"></div>
                  <div className="gb-step done" title="Kitchen Deducted"><span>✓</span></div>
                  <div className="gb-step-line done"></div>
                  <div className="gb-step active" title="On the Way"><span className="gb-step-pulsing">🛵</span></div>
                  <div className="gb-step-line"></div>
                  <div className="gb-step" title="Delivered & Restocked"><span>🏠</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="pos-category-bar">
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`pos-cat-chip ${selectedCategory === cat ? 'active' : ''}`}
              >
                {cat === 'All' ? '🌿 All Items' : cat === 'Burgers' ? '🍔 Burgers' : cat === 'Sides' ? '🍟 Sides & Fries' : cat === 'Beverages' ? '🥤 Cold Beverages' : cat === 'Combos' ? '🍱 Chef Combos' : `🍽️ ${cat}`}
              </button>
            ))}
          </div>

          {/* Menu Items Grid */}
          <div className="pos-menu-grid">
            {filteredMenuItems.map(item => {
              const meta = getDishMeta(item);
              const itemRecipes = recipes.filter(r => r.menu_item_id === item.id);
              const inCartQty = cart[item.id] || 0;

              return (
                <div key={item.id} className="pos-menu-card gb-dish-card">
                  <div className="gb-card-thumb-wrap">
                    <img
                      src={meta.image}
                      alt={item.name}
                      className="gb-card-img"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';
                      }}
                    />
                    <span className={`gb-badge-veg ${meta.isVeg ? 'veg' : 'non-veg'}`}>
                      <span className="veg-icon-dot"></span> {meta.isVeg ? '100% Veg' : 'Chicken'}
                    </span>
                    <span className="gb-badge-floating">{meta.badge}</span>
                  </div>

                  <div className="gb-card-content">
                    <div>
                      <div className="menu-card-top">
                        <span className="menu-card-category">{item.category || 'Menu'}</span>
                        <span className="gb-card-rating">⭐ {meta.rating || '4.9'}</span>
                      </div>

                      <h3 className="menu-card-title">{item.name}</h3>

                      <div className="menu-card-bom-box">
                        <div className="bom-header-row">
                          <span className="bom-label">🌱 BOM Farm Micro-Deduction:</span>
                        </div>
                        <div className="bom-tags">
                          {itemRecipes.map((r, idx) => (
                            <span key={idx} className="bom-pill">
                              {r.ingredients?.name}: {r.quantity_required}{r.ingredients?.unit}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="gb-card-footer">
                      <div className="gb-price-wrap">
                        <span className="gb-currency">₹</span>
                        <span className="menu-card-price">{item.price}</span>
                      </div>

                      <div className="dish-btn-group">
                        {inCartQty > 0 ? (
                          <div className="dish-card-stepper">
                            <button
                              type="button"
                              onClick={() => removeFromCart(item.id)}
                              className="btn-card-step btn-card-step--minus"
                              aria-label="Decrease quantity"
                            >−</button>
                            <span className="card-step-qty">{inCartQty} in Cart</span>
                            <button
                              type="button"
                              onClick={() => addToCart(item)}
                              className="btn-card-step btn-card-step--plus"
                              aria-label="Increase quantity"
                            >+</button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => addToCart(item)}
                            className="btn-add-dish gb-btn-add"
                          >
                            <Plus size={14} />
                            <span>Add to Cart</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Right Column: Customer Cart & Live Micro-Deduction Engine */}
        <aside className="pos-cart-panel">
          <div className="cart-header">
            <div className="cart-title">
              <ShoppingCart size={18} color="var(--brand-forest)" />
              <span>Customer Cart</span>
            </div>
            {cartItemsArray.length > 0 && (
              <button onClick={clearCart} className="btn-clear-cart">
                Clear
              </button>
            )}
          </div>

          <div className="cart-body">
            {cartItemsArray.length === 0 ? (
              <div className="cart-empty-state">
                <div className="cart-empty-icon">🛒</div>
                <h4>Cart is empty</h4>
                <p>Add dishes from the menu to simulate live order intake & micro-deduction.</p>
              </div>
            ) : (
              <div>
                {cartItemsArray.map(({ item, qty, subtotal }) => {
                  const meta = getDishMeta(item);
                  return (
                    <div key={item.id} className="cart-item-row">
                      <img
                        src={meta.image}
                        alt={item.name}
                        className="cart-item-thumb"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';
                        }}
                      />
                      <div className="cart-item-info" style={{ flex: 1, minWidth: 0, padding: '0 8px' }}>
                        <h5>{item.name}</h5>
                        <div className="cart-item-price">₹{item.price} &times; {qty}</div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
                        <span style={{ fontSize: '13px', fontWeight: 750, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                          ₹{subtotal}
                        </span>
                        <div className="cart-item-stepper">
                          <button onClick={() => removeFromCart(item.id)} className="btn-step">−</button>
                          <span className="step-qty">{qty}</span>
                          <button onClick={() => addToCart(item)} className="btn-step">+</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {cartItemsArray.length > 0 && (
            <div className="cart-footer">
              <div
                className="cart-bom-preview"
                style={willTriggerPings ? { borderColor: 'rgba(239, 68, 68, 0.4)', background: '#fef2f2' } : {}}
              >
                <div className="bom-title" style={willTriggerPings ? { color: '#b91c1c' } : {}}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>⚡ Micro-Deduction Telemetry</span>
                  </div>
                  <span
                    className="bom-status-live"
                    style={willTriggerPings ? { background: '#fee2e2', color: '#b91c1c' } : {}}
                  >
                    {willTriggerPings ? 'ALERT: REBALANCE PING' : 'Auto-Calc'}
                  </span>
                </div>

                {willTriggerPings && (
                  <div style={{ fontSize: '11px', color: '#b91c1c', marginBottom: '8px', lineHeight: 1.35 }}>
                    ⚠️ Order will deplete stock below safety threshold. 10km FEFO redistribution ping will trigger automatically.
                  </div>
                )}

                <ul className="bom-items-summary">
                  {predictedDeductions.map(d => (
                    <li
                      key={d.ingredient_id}
                      style={d.willBeCritical ? { borderColor: '#fca5a5', background: '#fee2e2', color: '#991b1b' } : {}}
                    >
                      {d.name}: -{d.required}{d.unit} (left: {d.remainingPredicted})
                    </li>
                  ))}
                </ul>
              </div>

              <div className="cart-totals">
                <div className="total-row">
                  <span>Subtotal</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>₹{cartTotal}</span>
                </div>
                <div className="total-row">
                  <span>GST (5%)</span>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>₹{Math.round(cartTotal * 0.05)}</span>
                </div>
                <div className="total-row total-row--grand">
                  <span>Total Amount</span>
                  <span>₹{Math.round(cartTotal * 1.05)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={loading}
                className="btn-checkout-order"
                style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
              >
                <span>{loading ? 'Executing Micro-Deductions...' : 'Place Order & Deduct Stock'}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </aside>

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

      {/* Order Success Receipt Modal */}
      {orderReceipt && (
        <div className="receipt-modal-backdrop">
          <div className="receipt-modal-card">
            <div className="receipt-head">
              <div className="receipt-check-circle">✓</div>
              <h3 className="receipt-title">Order Processed Atomically</h3>
              <p className="receipt-id">
                Receipt #{orderReceipt.order_id?.slice(0, 8)} &bull; {orderReceipt.store?.name}
              </p>
            </div>

            {orderReceipt.triggered_pings && orderReceipt.triggered_pings.length > 0 && (
              <div className="receipt-ping-alert">
                <div className="ping-alert-top">⚡ 10km FEFO Redistribution Ping Initiated</div>
                <p>
                  {orderReceipt.triggered_pings.map((p, idx) => (
                    <span key={idx} style={{ display: 'block', marginTop: '2px' }}>
                      &bull; Restock requested: <strong>{p.quantity}{p.ingredient?.unit} of {p.ingredient?.name}</strong> from <strong>{p.from_store?.name}</strong> ({p.distance_km} km away).
                    </span>
                  ))}
                </p>
              </div>
            )}

            <div className="receipt-bom-box">
              <span className="receipt-box-label">DEDUCTED RAW MATERIALS</span>
              <div className="receipt-bom-list">
                {orderReceipt.deductions?.map((d, idx) => (
                  <div key={idx} className="receipt-bom-row">
                    <span className="ing-name">{d.name}</span>
                    <span className="ing-stat">
                      -{d.deducted} {d.unit} (Left: {d.remaining_stock})
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setOrderReceipt(null)}
              className="btn-receipt-return"
            >
              Return to Terminal
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
