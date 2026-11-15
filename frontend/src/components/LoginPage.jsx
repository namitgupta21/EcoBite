import React, { useState } from 'react';
import { Lock, User, Mail, Phone, Eye, EyeOff, ArrowRight, ShieldCheck, ShoppingBag, UserPlus } from 'lucide-react';
import { api } from '../services/api';

// Password requirement: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export default function LoginPage({ onLoginSuccess, onBackToLanding }) {
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'

  // Sign In state
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Sign Up state
  const [signupName, setSignupName] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupPhone, setSignupPhone] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  // Filter phone to accept only numeric digits up to 10 chars
  const handlePhoneChange = (e) => {
    const numericOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
    setSignupPhone(numericOnly);
  };

  // Handle Sign In submission
  const handleSignIn = async (e) => {
    if (e) e.preventDefault();
    if (!loginId.trim() || !loginPassword.trim()) {
      setError('Please enter both your Username / Email and Password.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await api.login({ id: loginId, password: loginPassword });
      if (res?.success && res.user) {
        onLoginSuccess(res.user);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Sign Up submission (New recurring customer)
  const handleSignUp = async (e) => {
    if (e) e.preventDefault();
    if (!signupName.trim() || !signupUsername.trim() || !signupPassword.trim()) {
      setError('Please provide your Full Name, Username, and Password.');
      return;
    }

    // Password regex validation
    if (!PASSWORD_REGEX.test(signupPassword)) {
      setError('Password must be at least 8 characters long and contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character (e.g. !@#$).');
      return;
    }

    // Optional phone validation: must be exactly 10 digits if entered
    if (signupPhone.trim().length > 0 && signupPhone.trim().length !== 10) {
      setError('Phone number must be exactly 10 digits (or leave it blank).');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await api.signup({
        name: signupName,
        username: signupUsername,
        email: signupEmail,
        password: signupPassword,
        phone: signupPhone.trim() || null
      });

      if (res?.success && res.user) {
        setSuccessMsg(`Welcome, ${res.user.name}! Your account has been saved.`);
        setTimeout(() => {
          onLoginSuccess(res.user);
        }, 600);
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    const guestUser = api.loginAsGuest();
    onLoginSuccess(guestUser);
  };

  const fillAndLogin = (demoId, demoPass) => {
    setLoginId(demoId);
    setLoginPassword(demoPass);
    setError(null);
    setLoading(true);
    api.login({ id: demoId, password: demoPass })
      .then(res => {
        if (res?.success) onLoginSuccess(res.user);
      })
      .catch(err => {
        setError(err.message);
      })
      .finally(() => setLoading(false));
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-base)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background Ambience / Glow circles */}
      <div
        style={{
          position: 'absolute',
          top: '-120px',
          right: '-100px',
          width: '320px',
          height: '320px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(34, 197, 94, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none'
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-100px',
          left: '-80px',
          width: '280px',
          height: '280px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(27, 78, 43, 0.12) 0%, transparent 70%)',
          pointerEvents: 'none'
        }}
      />

      <div style={{ width: '100%', maxWidth: '440px', position: 'relative', zIndex: 1 }}>
        
        {/* Back to Landing Page Link */}
        {onBackToLanding && (
          <div style={{ marginBottom: '16px' }}>
            <button
              type="button"
              onClick={onBackToLanding}
              style={{
                background: 'none',
                border: 'none',
                color: '#52796f',
                cursor: 'pointer',
                fontSize: '12.5px',
                fontWeight: 650,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 8px',
                borderRadius: '6px',
                transition: 'color 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#1b4332'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#52796f'}
            >
              <span>←</span>
              <span>Back to Landing Page</span>
            </button>
          </div>
        )}

        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          {/* Apple 3D Squircle Logo */}
          <div
            style={{
              width: '46px',
              height: '46px',
              margin: '0 auto 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              filter: 'drop-shadow(0 6px 14px rgba(34, 197, 94, 0.35))'
            }}
          >
            <svg viewBox="0 0 32 32" width="46" height="46" fill="none">
              <defs>
                <linearGradient id="login-logo-bg" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#4ade80" />
                  <stop offset="50%" stopColor="#22c55e" />
                  <stop offset="100%" stopColor="#15803d" />
                </linearGradient>
              </defs>
              <rect x="1" y="1" width="30" height="30" rx="7.5" fill="url(#login-logo-bg)" />
              <rect x="1" y="1" width="30" height="30" rx="7.5" stroke="rgba(255,255,255,0.7)" strokeWidth="1" />
              <path d="M16 23 C16 18 19 12 24 9 C24 16 21 21 16 23 Z" fill="#ffffff" />
              <path d="M16 23 C16 19 13.5 14 8.5 13 C8.5 18 11.5 21.5 16 23 Z" fill="#dcfce7" />
              <circle cx="21" cy="14" r="1.3" fill="#ffffff" />
            </svg>
          </div>

          <div style={{ display: 'inline-block', marginBottom: '4px' }}>
            <span
              style={{
                fontFamily: 'var(--font-script)',
                fontSize: '22px',
                color: '#2d6a4f',
                fontWeight: 700,
                display: 'block',
                lineHeight: 1
              }}
            >
              Fresh Farm-to-Fork
            </span>
          </div>

          <h1
            style={{
              fontSize: '28px',
              fontWeight: 800,
              color: '#1b4332',
              letterSpacing: '-0.03em',
              lineHeight: 1.15
            }}
          >
            {mode === 'signin' ? 'Autonomous Kitchen' : 'Create Customer Account'}
          </h1>
          <p style={{ fontSize: '13px', color: '#52796f', marginTop: '6px' }}>
            {mode === 'signin'
              ? 'Sign in to access your designated kitchen interface.'
              : 'Register once as a recurring diner to save orders and preferences.'}
          </p>
        </div>

        {/* Main Card */}
        <div
          style={{
            background: 'var(--surface)',
            border: '1.2px solid rgba(27, 78, 43, 0.12)',
            borderRadius: '24px',
            padding: '28px 24px',
            boxShadow: '0 16px 40px -8px rgba(27, 78, 43, 0.1), 0 2px 8px rgba(0, 0, 0, 0.02)'
          }}
        >
          {/* Mode Switcher Tabs */}
          <div
            style={{
              display: 'flex',
              background: '#f1f5f9',
              padding: '4px',
              borderRadius: '12px',
              marginBottom: '20px',
              border: '1px solid var(--border)'
            }}
          >
            <button
              type="button"
              onClick={() => { setMode('signin'); setError(null); }}
              style={{
                flex: 1,
                padding: '8px',
                fontSize: '12.5px',
                fontWeight: mode === 'signin' ? 700 : 600,
                border: 'none',
                borderRadius: '9px',
                background: mode === 'signin' ? '#1b4e2b' : 'transparent',
                color: mode === 'signin' ? '#ffffff' : '#64748b',
                boxShadow: mode === 'signin' ? '0 4px 12px rgba(27, 78, 43, 0.25)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(null); }}
              style={{
                flex: 1,
                padding: '8px',
                fontSize: '12.5px',
                fontWeight: mode === 'signup' ? 700 : 600,
                border: 'none',
                borderRadius: '9px',
                background: mode === 'signup' ? '#1b4e2b' : 'transparent',
                color: mode === 'signup' ? '#ffffff' : '#64748b',
                boxShadow: mode === 'signup' ? '0 4px 12px rgba(27, 78, 43, 0.25)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              New Customer Sign-Up
            </button>
          </div>

          {/* Success Notification */}
          {successMsg && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#dcfce7',
                border: '1px solid #86efac',
                borderRadius: '12px',
                padding: '10px 14px',
                marginBottom: '16px',
                color: '#15803d',
                fontSize: '12.5px',
                fontWeight: 600
              }}
            >
              <span>✓</span>
              <span>{successMsg}</span>
            </div>
          )}

          {/* Error Notification */}
          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '12px',
                padding: '10px 14px',
                marginBottom: '16px',
                color: '#dc2626',
                fontSize: '12.5px',
                fontWeight: 500
              }}
            >
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* MODE: SIGN IN */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 650, color: '#1b4332', marginBottom: '6px' }}>
                  Username / Email
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b8f7e', pointerEvents: 'none' }}>
                    <User size={15} />
                  </div>
                  <input
                    type="text"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    placeholder="e.g. customer, manager, or your email"
                    required
                    className="input-parchment"
                    style={{ width: '100%', paddingLeft: '36px', height: '40px', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 650, color: '#1b4332', marginBottom: '6px' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b8f7e', pointerEvents: 'none' }}>
                    <Lock size={15} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                    className="input-parchment"
                    style={{ width: '100%', paddingLeft: '36px', paddingRight: '36px', height: '40px', fontSize: '13px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#6b8f7e', cursor: 'pointer' }}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{ width: '100%', height: '42px', justifyContent: 'center', marginTop: '6px', fontSize: '13.5px' }}
              >
                {loading ? (
                  <div style={{ width: '15px', height: '15px', border: '2px solid #ffffff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '14px 0', color: '#94a3b8', fontSize: '11px', textTransform: 'uppercase' }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                <span>Or</span>
                <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
              </div>

              <button
                type="button"
                onClick={handleGuestLogin}
                disabled={loading}
                className="btn-secondary"
                style={{ width: '100%', height: '40px', justifyContent: 'center', fontSize: '12.5px', gap: '6px' }}
              >
                <ShoppingBag size={14} />
                <span>Continue as Guest Customer</span>
              </button>
            </form>
          )}

          {/* MODE: SIGN UP (NEW RECURRING CUSTOMER) */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 650, color: '#1b4332', marginBottom: '4px' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  required
                  className="input-parchment"
                  style={{ width: '100%', height: '38px', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 650, color: '#1b4332', marginBottom: '4px' }}>
                    Username *
                  </label>
                  <input
                    type="text"
                    value={signupUsername}
                    onChange={(e) => setSignupUsername(e.target.value)}
                    placeholder="e.g. janedoe"
                    required
                    className="input-parchment"
                    style={{ width: '100%', height: '38px', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 650, color: '#1b4332', marginBottom: '4px' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="jane@example.com"
                    className="input-parchment"
                    style={{ width: '100%', height: '38px', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 650, color: '#1b4332', marginBottom: '4px' }}>
                  Password *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="Min 8 chars (upper, lower, digit, special)"
                    required
                    className="input-parchment"
                    style={{ width: '100%', paddingRight: '36px', height: '38px', fontSize: '13px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#6b8f7e', cursor: 'pointer' }}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <div style={{ fontSize: '11px', color: '#6b8f7e', marginTop: '3px' }}>
                  Requirements: 1 uppercase, 1 lowercase, 1 number, 1 special character (min 8 chars)
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 650, color: '#1b4332', marginBottom: '4px' }}>
                  Contact Phone (Optional)
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6b8f7e', pointerEvents: 'none' }}>
                    <Phone size={13} />
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]{10}"
                    maxLength={10}
                    value={signupPhone}
                    onChange={handlePhoneChange}
                    placeholder="10-digit mobile number (digits only)"
                    className="input-parchment"
                    style={{ width: '100%', paddingLeft: '30px', height: '38px', fontSize: '13px' }}
                  />
                </div>
                <div style={{ fontSize: '11px', color: '#6b8f7e', marginTop: '3px' }}>
                  Optional &bull; Numeric only (strictly 10 digits)
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{ width: '100%', height: '42px', justifyContent: 'center', marginTop: '6px', fontSize: '13.5px' }}
              >
                {loading ? (
                  <div style={{ width: '15px', height: '15px', border: '2px solid #ffffff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                ) : (
                  <>
                    <UserPlus size={14} />
                    <span>Save Account & Enter Menu</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Quick Demo Pre-Seeded Accounts (Always visible on sign-in) */}
          {mode === 'signin' && (
            <div
              style={{
                marginTop: '20px',
                paddingTop: '14px',
                borderTop: '1px solid var(--border)'
              }}
            >
              <div style={{ fontSize: '11.5px', color: '#52796f', marginBottom: '8px', fontWeight: 650 }}>
                Pre-Seeded Database Accounts:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => fillAndLogin('customer', 'customer123')}
                  disabled={loading}
                  className="btn-ghost"
                  style={{
                    padding: '8px 12px',
                    borderRadius: '12px',
                    border: '1px solid var(--border)',
                    background: '#f8fafc',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '2px',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', fontWeight: 700, color: '#1b4332' }}>
                    <User size={12} color="#1b4332" />
                    <span>Customer</span>
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                    POS Menu Only
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => fillAndLogin('manager', 'manager123')}
                  disabled={loading}
                  className="btn-ghost"
                  style={{
                    padding: '8px 12px',
                    borderRadius: '12px',
                    border: '1px solid #bbf7d0',
                    background: '#f0fdf4',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '2px',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', fontWeight: 700, color: '#15803d' }}>
                    <ShieldCheck size={12} color="#15803d" />
                    <span>Manager</span>
                  </div>
                  <div style={{ fontSize: '10px', color: '#166534', fontFamily: 'var(--font-mono)' }}>
                    Radar & Analytics
                  </div>
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
