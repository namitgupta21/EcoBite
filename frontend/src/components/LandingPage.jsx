import React, { useState, useEffect, useRef } from 'react';
import '../landing.css';

export default function LandingPage({ currentUser, onLaunchApp, onOpenLogin, onLogout }) {
  const [activePosTab, setActivePosTab] = useState(0);
  const [activeRadTab, setActiveRadTab] = useState(0);
  const [activeAnaTab, setActiveAnaTab] = useState(0);
  const [ctaEmail, setCtaEmail] = useState('');
  const [ctaSubmitted, setCtaSubmitted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const posSpecs = [
    { label: 'Live Sync', tag: '0.3s', note: '0.3s latency · Sub-second inventory decrement across all connected stations.' },
    { label: 'Contactless Billing', tag: null, note: 'Instant contactless · Apple Pay, Google Pay, Tap to Pay & Chip cards.' },
    { label: 'Smart Receipts', tag: null, note: 'Digital + Thermal · Auto-SMS, email receipt dispatch and paper print.' }
  ];

  const radSpecs = [
    { label: 'Haversine Mesh', tag: '10km', note: '10km radius · Real-world Haversine distance matrix without straight-line guesses.' },
    { label: 'FEFO Expiry', tag: null, note: 'FEFO priority · Stock closest to expiration moves first to prevent kitchen waste.' },
    { label: 'Transfer Pings', tag: null, note: 'Socket.IO dispatch · Real-time auto-acceptance requests to donor tablet terminals.' }
  ];

  const anaSpecs = [
    { label: '-42% Waste', tag: null, note: '-42% food waste · Real-time predictive ordering eliminates prep waste.' },
    { label: 'Stock Trends', tag: null, note: 'Telemetry trends · Cross-branch consumption curves updated on every sale.' },
    { label: '6 Store Mesh', tag: null, note: 'Unified network · Single dashboard controlling 6 connected store inventories.' }
  ];

  const handleCtaSubmit = (e) => {
    e.preventDefault();
    if (!ctaEmail) return;
    setCtaSubmitted(true);
    setTimeout(() => {
      setCtaEmail('');
    }, 3000);
  };

  return (
    <div className="landing-page-root">
      
      {/* ── TOP NAVIGATION ── */}
      <nav id="navbar" className={scrolled ? 'scrolled' : ''}>
        <div className="nav-inner">
          <ul className="nav-links nav-links--left">
            <li>
              <a href="#features" className="nav-item-link">
                <span className="apple-3d-icon-wrap apple-3d-icon-wrap--features" aria-hidden="true">
                  <svg className="apple-3d-icon" viewBox="0 0 24 24" width="22" height="22" fill="none">
                    <defs>
                      <linearGradient id="nav-feat-bg" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#818cf8"/>
                        <stop offset="45%" stopColor="#6366f1"/>
                        <stop offset="100%" stopColor="#4338ca"/>
                      </linearGradient>
                    </defs>
                    <rect x="1" y="1" width="22" height="22" rx="5.5" fill="url(#nav-feat-bg)"/>
                    <path d="M12 5.2 C12 8 10 10 7.2 10 C10 10 12 12 12 14.8 C12 12 14 10 16.8 10 C14 10 12 8 12 5.2 Z" fill="#ffffff"/>
                  </svg>
                </span>
                <span>Features</span>
              </a>
            </li>
            <li>
              <a href="#pos" className="nav-item-link">
                <span className="apple-3d-icon-wrap apple-3d-icon-wrap--pos" aria-hidden="true">
                  <svg className="apple-3d-icon" viewBox="0 0 24 24" width="22" height="22" fill="none">
                    <defs>
                      <linearGradient id="nav-pos-bg" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#34d399"/>
                        <stop offset="45%" stopColor="#10b981"/>
                        <stop offset="100%" stopColor="#047857"/>
                      </linearGradient>
                    </defs>
                    <rect x="1" y="1" width="22" height="22" rx="5.5" fill="url(#nav-pos-bg)"/>
                    <rect x="7" y="6" width="10" height="12" rx="2" fill="#ffffff"/>
                    <rect x="8.5" y="7.5" width="7" height="4" rx="0.8" fill="#10b981"/>
                  </svg>
                </span>
                <span>POS Terminal</span>
              </a>
            </li>
            <li>
              <a href="#radius" className="nav-item-link">
                <span className="apple-3d-icon-wrap apple-3d-icon-wrap--radius" aria-hidden="true">
                  <svg className="apple-3d-icon" viewBox="0 0 24 24" width="22" height="22" fill="none">
                    <defs>
                      <linearGradient id="nav-rad-bg" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#fb923c"/>
                        <stop offset="45%" stopColor="#f97316"/>
                        <stop offset="100%" stopColor="#c2410c"/>
                      </linearGradient>
                    </defs>
                    <rect x="1" y="1" width="22" height="22" rx="5.5" fill="url(#nav-rad-bg)"/>
                    <path d="M12 7 C10.3 7 9 8.3 9 10 C9 12.5 12 16.5 12 16.5 C12 16.5 15 12.5 15 10 C15 8.3 13.7 7 12 7 Z" fill="#ffffff"/>
                  </svg>
                </span>
                <span>10km Radar</span>
              </a>
            </li>
            <li>
              <a href="#analytics" className="nav-item-link">
                <span className="apple-3d-icon-wrap apple-3d-icon-wrap--analytics" aria-hidden="true">
                  <svg className="apple-3d-icon" viewBox="0 0 24 24" width="22" height="22" fill="none">
                    <defs>
                      <linearGradient id="nav-ana-bg" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#38bdf8"/>
                        <stop offset="45%" stopColor="#0284c7"/>
                        <stop offset="100%" stopColor="#0369a1"/>
                      </linearGradient>
                    </defs>
                    <rect x="1" y="1" width="22" height="22" rx="5.5" fill="url(#nav-ana-bg)"/>
                    <rect x="5.5" y="12.5" width="3" height="5.5" rx="1" fill="#ffffff"/>
                    <rect x="10.5" y="9" width="3" height="9" rx="1" fill="#ffffff"/>
                    <rect x="15.5" y="6" width="3" height="12" rx="1" fill="#ffffff"/>
                  </svg>
                </span>
                <span>Analytics</span>
              </a>
            </li>
          </ul>

          <a href="#" className="nav-logo">
            <span className="apple-3d-logo-wrap" aria-hidden="true">
              <svg className="apple-3d-logo" viewBox="0 0 32 32" width="30" height="30" fill="none">
                <defs>
                  <linearGradient id="logo-bg-nav" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#4ade80"/>
                    <stop offset="45%" stopColor="#22c55e"/>
                    <stop offset="100%" stopColor="#15803d"/>
                  </linearGradient>
                </defs>
                <rect x="1.5" y="1.5" width="29" height="29" rx="7.5" fill="url(#logo-bg-nav)"/>
                <path d="M16 23 C16 18 19 12 24 9 C24 16 21 21 16 23 Z" fill="#ffffff"/>
                <path d="M16 23 C16 19 13.5 14 8.5 13 C8.5 18 11.5 21.5 16 23 Z" fill="#dcfce7"/>
              </svg>
            </span>
            <span className="logo-text">Ecobite</span>
          </a>

          <ul className="nav-links nav-links--right">
            {currentUser ? (
              <>
                <li>
                  <div className="nav-user-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: '#f0fdf4', borderRadius: '50px', border: '1px solid #bbf7d0', fontSize: '12px', fontWeight: 650, color: '#166534' }}>
                    <span>👤</span>
                    <span>{currentUser.name} ({currentUser.role})</span>
                    <button
                      type="button"
                      onClick={onLogout}
                      style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontWeight: 700, padding: '0 2px' }}
                      title="Sign Out"
                    >✕</button>
                  </div>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={onLaunchApp}
                    className="btn-primary"
                    style={{ cursor: 'pointer', border: 'none' }}
                  >
                    Launch Kitchen Console →
                  </button>
                </li>
              </>
            ) : (
              <li>
                <button
                  type="button"
                  onClick={onOpenLogin}
                  className="btn-primary"
                  style={{ cursor: 'pointer', border: 'none' }}
                >
                  Get Started →
                </button>
              </li>
            )}
          </ul>
        </div>
      </nav>

      {/* ── HERO (Mindly Inspired) ── */}
      <section className="hero" id="hero">
        <div className="hero-grid-canvas" aria-hidden="true"></div>
        <div className="hero-glow hero-glow--left" aria-hidden="true"></div>
        <div className="hero-glow hero-glow--right" aria-hidden="true"></div>

        {/* Ambient floating badges */}
        <div className="floating-badge floating-badge--left" aria-hidden="true">
          <div className="floating-badge-ring">
            <div className="floating-badge-core floating-badge-core--amber" style={{ color: '#f59e0b', fontSize: '18px' }}>
              ⚡
            </div>
          </div>
        </div>

        <div className="floating-badge floating-badge--right" aria-hidden="true">
          <div className="floating-badge-ring">
            <div className="floating-badge-core floating-badge-core--purple" style={{ color: '#10b981', fontSize: '18px' }}>
              🌱
            </div>
          </div>
        </div>

        <div className="hero-content">
          <div className="hero-brand-lockup">
            <span className="apple-3d-logo-wrap apple-3d-logo-wrap--hero" aria-hidden="true">
              <svg className="apple-3d-logo" viewBox="0 0 32 32" width="42" height="42" fill="none">
                <defs>
                  <linearGradient id="logo-bg-hero" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#4ade80"/>
                    <stop offset="45%" stopColor="#22c55e"/>
                    <stop offset="100%" stopColor="#15803d"/>
                  </linearGradient>
                </defs>
                <rect x="1.5" y="1.5" width="29" height="29" rx="7.5" fill="url(#logo-bg-hero)"/>
                <path d="M16 23 C16 18 19 12 24 9 C24 16 21 21 16 23 Z" fill="#ffffff"/>
                <path d="M16 23 C16 19 13.5 14 8.5 13 C8.5 18 11.5 21.5 16 23 Z" fill="#dcfce7"/>
              </svg>
            </span>
            <span className="hero-brand-text">Ecobite</span>
          </div>

          <h1 className="hero-title camo-headline">
            Your kitchen deserves<br />
            <span className="text-fade-gradient">a place that feels effortless.</span>
          </h1>

          <p className="hero-sub">
            Track your inventory, understand kitchen prep patterns, and rebalance surplus ingredients within 10km — all in one calm, autonomous space.
          </p>

          <div className="hero-actions camo-actions">
            {currentUser ? (
              <button
                type="button"
                onClick={onLaunchApp}
                className="btn-camo-primary"
                style={{ cursor: 'pointer', border: 'none' }}
              >
                <span>Launch Kitchen Console →</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenLogin}
                className="btn-camo-primary"
                style={{ cursor: 'pointer', border: 'none' }}
              >
                <span>Start Here</span>
              </button>
            )}
            <a href="#features" className="btn-camo-secondary">
              <span>Explore</span>
            </a>
          </div>
        </div>

        {/* Fanned-Out 3-Card Interactive Deck */}
        <div className="hero-deck-container" id="hero-deck">
          <div className="deck-mascot" aria-hidden="true">
            <div className="mascot-body">
              <div className="mascot-sprout">🌱</div>
              <div className="mascot-eyes">
                <span className="mascot-eye"><span className="mascot-pupil"></span></span>
                <span className="mascot-eye"><span className="mascot-pupil"></span></span>
              </div>
              <div className="mascot-cheeks">
                <span className="mascot-blush"></span>
                <span className="mascot-blush"></span>
              </div>
            </div>
          </div>

          <div className="hero-deck">
            {/* Left Card */}
            <div className="deck-card deck-card--left">
              <div className="deck-card-top">
                <div className="deck-card-avatar deck-card-avatar--1">
                  <span>👩‍🍳</span>
                </div>
              </div>
              <h3 className="deck-card-title">Why do I feel exhausted after a full night's manual inventory count?</h3>
              <div className="deck-card-meta">
                <span className="deck-meta-ans">14 answers</span>
                <span className="deck-meta-dot">•</span>
                <span className="deck-meta-views">40k views</span>
              </div>
            </div>

            {/* Center Card */}
            <div className="deck-card deck-card--center">
              <div className="deck-card-top">
                <div className="deck-card-avatar deck-card-avatar--bot">
                  <span>🤖</span>
                </div>
              </div>
              <h3 className="deck-card-title">How do you stop overthinking small prep quantities before the evening rush?</h3>
              <div className="deck-card-meta">
                <span className="deck-meta-ans">16 answers</span>
                <span className="deck-meta-dot">•</span>
                <span className="deck-meta-views">400 views</span>
              </div>
            </div>

            {/* Right Card */}
            <div className="deck-card deck-card--right">
              <div className="deck-card-top">
                <div className="deck-card-avatar deck-card-avatar--2">
                  <span>🧑‍🍳</span>
                </div>
              </div>
              <h3 className="deck-card-title">Is it normal to lose motivation when tracking perishable food waste daily?</h3>
              <div className="deck-card-meta">
                <span className="deck-meta-ans">32 answers</span>
                <span className="deck-meta-dot">•</span>
                <span className="deck-meta-views">1.2k views</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Bento Stats */}
        <div className="hero-bento" id="hero-bento">
          <div className="hb-card hb-card--green">
            <div className="hb-card-label">Real-time Inventory</div>
            <div className="hb-card-stat">2,850<span>SKUs tracked</span></div>
          </div>
          <div className="hb-card hb-card--warm">
            <div className="hb-card-label">Transfers Today</div>
            <div className="hb-card-stat">54<span>auto-redistributed</span></div>
          </div>
          <div className="hb-card hb-card--sage">
            <div className="hb-card-label">Waste Prevented</div>
            <div className="hb-card-stat">92%<span>efficiency rate</span></div>
          </div>
          <div className="hb-card hb-card--stone">
            <div className="hb-card-label">Active Stores</div>
            <div className="hb-card-stat">6<span>connected branches</span></div>
          </div>
        </div>
      </section>

      {/* ── FEATURE INTRO ── */}
      <section className="feature-intro" id="features">
        <p className="section-eyebrow">Three intelligent systems</p>
        <h2 className="section-title">
          Everything your kitchen needs.<br />
          Nothing it doesn't.
        </h2>
      </section>

      {/* ── FEATURE 1: POS TERMINAL ── */}
      <section className="feature-section" id="pos">
        <div className="container">
          <div className="feature-header">
            <div className="feature-number" aria-hidden="true">01</div>
            <div className="feature-header-main">
              <p className="feature-eyebrow">Point of sale</p>
              <h2 className="feature-title">
                Order once. Sync live stock<br />
                <span className="headline-dim text-fade-gradient">at the exact same second.</span>
              </h2>
              <p className="feature-desc">
                One tap, instant reconciliation. Every dish sold on the Ecobite POS terminal deducts raw BOM ingredients from live kitchen inventory without delay. Same counter, same second, zero manual audit.
              </p>

              <div className="feature-segmented-control" role="tablist">
                {posSpecs.map((spec, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActivePosTab(idx)}
                    className={`fsc-btn ${activePosTab === idx ? 'active' : ''}`}
                  >
                    {spec.label} {spec.tag && <span className="fsc-tag">{spec.tag}</span>}
                  </button>
                ))}
              </div>

              <div className="feature-spec-note">
                <span className="spec-mono">{posSpecs[activePosTab].label}</span> &bull; {posSpecs[activePosTab].note}
              </div>
            </div>
          </div>

          <div className="feature-stage-window macos-master-window">
            <div className="macos-window-header">
              <div className="macos-traffic-lights" aria-hidden="true">
                <span className="macos-dot macos-dot--close"></span>
                <span className="macos-dot macos-dot--minimize"></span>
                <span className="macos-dot macos-dot--maximize"></span>
              </div>
              <div className="macos-window-title">
                <span className="macos-status-dot macos-status-dot--green"></span>
                <span className="macos-title-text">Live • Ecobite POS Terminal</span>
              </div>
              <div className="macos-window-actions" aria-hidden="true">
                <span className="macos-action-pill macos-action-pill--emerald">⚡ 0.3s sync</span>
              </div>
            </div>

            <div className="feature-stage-body">
              <div className="feature-bento feature-bento--pos">
                <div className="fb-card fb-card--main fb-card--image">
                  <div className="mockup-wrapper">
                    <img src="/pos_terminal_mockup.jpg" alt="Ecobite POS Terminal" className="feature-img" />
                    <div className="glare-overlay"></div>
                    <div className="float-badge float-badge--top-right float-badge--glass">
                      <span className="badge-live-dot"></span>
                      <span>Live Sync • <strong>0.3s</strong></span>
                    </div>
                    <div className="float-badge float-badge--bottom-left float-badge--dark">
                      <span className="badge-check">✓</span>
                      <span>Order #3481 • <strong>₹450 Paid</strong></span>
                    </div>
                  </div>
                </div>

                <div className="fb-card">
                  <div className="fb-icon-3d fb-icon-3d--order" aria-hidden="true" style={{ fontSize: '28px', marginBottom: '8px' }}>
                    🍔
                  </div>
                  <h3>Live Recipe BOM Sync</h3>
                  <p>Every dish sold deducts buns, patties, sauces, and toppings immediately from kitchen stock.</p>
                </div>

                <div className="fb-card">
                  <div className="fb-icon-3d fb-icon-3d--billing" aria-hidden="true" style={{ fontSize: '28px', marginBottom: '8px' }}>
                    ⚡
                  </div>
                  <h3>Instant Billing</h3>
                  <p>Sub-second checkout flow with automated GST calculation and atomic order receipts.</p>
                </div>

                <div className="fb-card">
                  <div className="fb-icon-3d fb-icon-3d--receipts" aria-hidden="true" style={{ fontSize: '28px', marginBottom: '8px' }}>
                    🧾
                  </div>
                  <h3>Smart Audit Logs</h3>
                  <p>Every micro-deduction is logged permanently in Supabase for transparent auditing.</p>
                </div>

                <div className="fb-card fb-card--highlight">
                  <div className="highlight-stat">0.3s</div>
                  <div className="highlight-label">Average checkout & deduction time</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURE 2: 10KM RADIUS GEOFENCE ── */}
      <section className="feature-section feature-section--alt" id="radius">
        <div className="container">
          <div className="feature-header">
            <div className="feature-number" aria-hidden="true">02</div>
            <div className="feature-header-main">
              <p className="feature-eyebrow">Smart Redistribution</p>
              <h2 className="feature-title">
                Find surplus. Fix shortage.<br />
                <span className="headline-dim text-fade-gradient">within 10km perimeter.</span>
              </h2>
              <p className="feature-desc">
                When a branch runs low on cheese or patties, Ecobite scans all sister kitchens within a 10km radius using the Haversine formula. It locates the closest surplus stock, sorts by FEFO expiry, and alerts donor kitchens automatically.
              </p>

              <div className="feature-segmented-control" role="tablist">
                {radSpecs.map((spec, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveRadTab(idx)}
                    className={`fsc-btn ${activeRadTab === idx ? 'active' : ''}`}
                  >
                    {spec.label} {spec.tag && <span className="fsc-tag">{spec.tag}</span>}
                  </button>
                ))}
              </div>

              <div className="feature-spec-note">
                <span className="spec-mono">{radSpecs[activeRadTab].label}</span> &bull; {radSpecs[activeRadTab].note}
              </div>
            </div>
          </div>

          <div className="feature-stage-window macos-master-window">
            <div className="macos-window-header">
              <div className="macos-traffic-lights" aria-hidden="true">
                <span className="macos-dot macos-dot--close"></span>
                <span className="macos-dot macos-dot--minimize"></span>
                <span className="macos-dot macos-dot--maximize"></span>
              </div>
              <div className="macos-window-title">
                <span className="macos-status-dot macos-status-dot--blue"></span>
                <span className="macos-title-text">Radar Mesh · 10km Radius</span>
              </div>
              <div className="macos-window-actions" aria-hidden="true">
                <span className="macos-action-pill macos-action-pill--emerald">6 Nodes Active</span>
              </div>
            </div>

            <div className="feature-stage-body">
              <div className="feature-bento feature-bento--radius">
                <div className="fb-card fb-card--main fb-card--image">
                  <div className="mockup-wrapper">
                    <img src="/radius_map_mockup.jpg" alt="10km radius map" className="feature-img" />
                    <div className="glare-overlay"></div>
                    <div className="float-badge float-badge--top-left float-badge--glass">
                      <span className="badge-beacon"></span>
                      <span>Scanning 10km Radius</span>
                    </div>
                    <div className="float-badge float-badge--bottom-right float-badge--emerald">
                      <span>✨ Surplus Found: <strong>Express - Paharganj (1.8km)</strong></span>
                    </div>
                  </div>
                </div>

                <div className="fb-card fb-card--highlight fb-card--green">
                  <div className="highlight-stat">10km</div>
                  <div className="highlight-label">Autonomous geofence boundary</div>
                </div>

                <div className="fb-card">
                  <div className="fb-icon-3d fb-icon-3d--geo" aria-hidden="true" style={{ fontSize: '28px', marginBottom: '8px' }}>
                    📍
                  </div>
                  <h3>Haversine Geolocation</h3>
                  <p>Precise real-world distance calculations between Delhi NCR cluster coordinates.</p>
                </div>

                <div className="fb-card">
                  <div className="fb-icon-3d fb-icon-3d--fefo" aria-hidden="true" style={{ fontSize: '28px', marginBottom: '8px' }}>
                    ⏳
                  </div>
                  <h3>FEFO Priority</h3>
                  <p>First Expired, First Out. Batches closest to expiration get rebalanced first.</p>
                </div>

                <div className="fb-card">
                  <div className="fb-icon-3d fb-icon-3d--pings" aria-hidden="true" style={{ fontSize: '28px', marginBottom: '8px' }}>
                    🚨
                  </div>
                  <h3>Socket.IO Pings</h3>
                  <p>Managers receive real-time slide-in emergency pings they can accept or decline with 1 tap.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURE 3: ANALYTICS ── */}
      <section className="feature-section" id="analytics">
        <div className="container">
          <div className="feature-header">
            <div className="feature-number" aria-hidden="true">03</div>
            <div className="feature-header-main">
              <p className="feature-eyebrow">Analytics Engine</p>
              <h2 className="feature-title">
                Every kitchen branch.<br />
                <span className="headline-dim text-fade-gradient">One unified intelligence view.</span>
              </h2>
              <p className="feature-desc">
                Data from every branch lands in one clear audit view. Track total kilograms of food waste prevented, supply chain cost savings, and operational cluster health in real time.
              </p>

              <div className="feature-segmented-control" role="tablist">
                {anaSpecs.map((spec, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveAnaTab(idx)}
                    className={`fsc-btn ${activeAnaTab === idx ? 'active' : ''}`}
                  >
                    {spec.label}
                  </button>
                ))}
              </div>

              <div className="feature-spec-note">
                <span className="spec-mono">{anaSpecs[activeAnaTab].label}</span> &bull; {anaSpecs[activeAnaTab].note}
              </div>
            </div>
          </div>

          <div className="feature-stage-window macos-master-window">
            <div className="macos-window-header">
              <div className="macos-traffic-lights" aria-hidden="true">
                <span className="macos-dot macos-dot--close"></span>
                <span className="macos-dot macos-dot--minimize"></span>
                <span className="macos-dot macos-dot--maximize"></span>
              </div>
              <div className="macos-window-title">
                <span className="macos-status-dot macos-status-dot--purple"></span>
                <span className="macos-title-text">Analytics Engine · Multi-Store</span>
              </div>
              <div className="macos-window-actions" aria-hidden="true">
                <span className="macos-action-pill macos-action-pill--violet">📈 98.2% Accuracy</span>
              </div>
            </div>

            <div className="feature-stage-body">
              <div className="feature-bento feature-bento--analytics">
                <div className="fb-card fb-card--main fb-card--image">
                  <div className="mockup-wrapper">
                    <img src="/analytics_mockup.jpg" alt="Ecobite analytics dashboard" className="feature-img" />
                    <div className="glare-overlay"></div>
                    <div className="float-badge float-badge--top-right float-badge--emerald">
                      <span>📉 <strong>-42%</strong> Food Waste</span>
                    </div>
                    <div className="float-badge float-badge--bottom-left float-badge--glass">
                      <span className="badge-live-dot"></span>
                      <span>Auto-rebalancing <strong>6 Stores</strong></span>
                    </div>
                  </div>
                </div>

                <div className="fb-card">
                  <div className="fb-icon-3d fb-icon-3d--trends" aria-hidden="true" style={{ fontSize: '28px', marginBottom: '8px' }}>
                    📊
                  </div>
                  <h3>Stock Telemetry</h3>
                  <p>Track top transferred ingredients and surplus consumption patterns across the network.</p>
                </div>

                <div className="fb-card fb-card--highlight">
                  <div className="highlight-stat">98.2%</div>
                  <div className="highlight-label">Fulfillment accuracy rate</div>
                </div>

                <div className="fb-card">
                  <div className="fb-icon-3d fb-icon-3d--alerts" aria-hidden="true" style={{ fontSize: '28px', marginBottom: '8px' }}>
                    🌿
                  </div>
                  <h3>ESG Sustainability</h3>
                  <p>Automated telemetry measuring carbon footprint reduction and salvaged ingredients.</p>
                </div>

                <div className="fb-card">
                  <div className="fb-icon-3d fb-icon-3d--visibility" aria-hidden="true" style={{ fontSize: '28px', marginBottom: '8px' }}>
                    🏢
                  </div>
                  <h3>Cluster Health</h3>
                  <p>Real-time status indicators (Optimal, Warning, Critical) across all 6 store nodes.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── EARLY ACCESS WAITLIST CTA ── */}
      <section className="cta-section">
        <div className="cta-inner">
          <p className="cta-eyebrow">Ready to automate your kitchen?</p>
          <h2 className="cta-title">
            Ecobite takes the wheel.<br />
            You focus on the food.
          </h2>
          <p className="cta-sub">
            Join restaurants and cloud kitchens already eliminating food waste on autopilot.
          </p>
          
          {ctaSubmitted ? (
            <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', padding: '14px 24px', borderRadius: '50px', color: '#166534', fontWeight: 700, fontSize: '15px', display: 'inline-flex', alignItems: 'center', gap: '8px', margin: '20px auto' }}>
              <span>✓</span>
              <span>You're on the priority waitlist! We will reach out soon.</span>
            </div>
          ) : (
            <form onSubmit={handleCtaSubmit} className="cta-form">
              <input
                type="email"
                value={ctaEmail}
                onChange={(e) => setCtaEmail(e.target.value)}
                placeholder="chef@restaurant.com"
                required
                className="cta-input"
              />
              <button type="submit" className="cta-submit">
                Get Early Access →
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="footer-brand-title">
              <span className="apple-3d-logo-wrap" aria-hidden="true">
                <svg className="apple-3d-logo" viewBox="0 0 32 32" width="26" height="26" fill="none">
                  <defs>
                    <linearGradient id="logo-bg-ft" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#4ade80"/>
                      <stop offset="45%" stopColor="#22c55e"/>
                      <stop offset="100%" stopColor="#15803d"/>
                    </linearGradient>
                  </defs>
                  <rect x="1.5" y="1.5" width="29" height="29" rx="7.5" fill="url(#logo-bg-ft)"/>
                  <path d="M16 23 C16 18 19 12 24 9 C24 16 21 21 16 23 Z" fill="#ffffff"/>
                </svg>
              </span>
              <span className="logo-text">Ecobite</span>
            </div>
            <p>Autonomous Kitchen Intelligence &bull; Zero-Waste Dining</p>
          </div>
          <div style={{ color: '#86868b', fontSize: '13px' }}>
            &copy; {new Date().getFullYear()} Ecobite Technologies. Delhi NCR Cluster.
          </div>
        </div>
      </footer>

    </div>
  );
}

