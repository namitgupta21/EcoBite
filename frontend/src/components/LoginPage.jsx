import React, { useState } from 'react';
import { Lock, User, Mail, Phone, Eye, EyeOff, ArrowRight, ShieldCheck, ShoppingBag, UserPlus } from 'lucide-react';
import { api } from '../services/api';

// Password requirement: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export default function LoginPage({ onLoginSuccess }) {
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
      setError('Please enter both your User ID / Username and Password.');
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
        backgroundColor: 'var(--color-parchment)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px'
      }}
    >
      <div style={{ width: '100%', maxWidth: '440px' }}>
        
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              margin: '0 auto 12px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-ink)',
              color: 'var(--color-parchment)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              fontWeight: 500
            }}
          >
            ✦
          </div>
          <div style={{ display: 'inline-block', marginBottom: '4px' }}>
            <span className="badge-mono" style={{ fontSize: '10px', letterSpacing: '0.06em' }}>
              AUTONOMOUS KITCHEN NETWORK
            </span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 400, color: 'var(--color-ink)', letterSpacing: '-0.02em' }}>
            {mode === 'signin' ? 'Welcome Back' : 'Create Customer Account'}
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--color-driftwood)', marginTop: '4px' }}>
            {mode === 'signin'
              ? 'Sign in to access your designated kitchen interface.'
              : 'Register once as a recurring diner to save orders and preferences.'}
          </p>
        </div>

        {/* Main Card */}
        <div
          className="card-bone"
          style={{
            padding: '24px',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-card)',
            border: '1px solid var(--color-stone)'
          }}
        >
          {/* Mode Switcher Tabs */}
          <div
            style={{
              display: 'flex',
              background: 'var(--color-linen)',
              padding: '3px',
              borderRadius: 'var(--radius-md)',
              marginBottom: '20px',
              border: '1px solid var(--color-stone)'
            }}
          >
            <button
              type="button"
              onClick={() => { setMode('signin'); setError(null); }}
              style={{
                flex: 1,
                padding: '8px',
                fontSize: '12px',
                fontWeight: mode === 'signin' ? 500 : 400,
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                background: mode === 'signin' ? 'var(--color-parchment)' : 'transparent',
                color: mode === 'signin' ? 'var(--color-ink)' : 'var(--color-driftwood)',
                boxShadow: mode === 'signin' ? 'rgba(0,0,0,0.05) 0px 1px 2px' : 'none',
                cursor: 'pointer',
                transition: 'all 120ms'
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
                fontSize: '12px',
                fontWeight: mode === 'signup' ? 500 : 400,
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                background: mode === 'signup' ? 'var(--color-parchment)' : 'transparent',
                color: mode === 'signup' ? 'var(--color-ink)' : 'var(--color-driftwood)',
                boxShadow: mode === 'signup' ? 'rgba(0,0,0,0.05) 0px 1px 2px' : 'none',
                cursor: 'pointer',
                transition: 'all 120ms'
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
                background: 'rgba(31, 138, 101, 0.08)',
                border: '1px solid var(--color-verdant)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 12px',
                marginBottom: '16px',
                color: 'var(--color-verdant)',
                fontSize: '12px'
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
                background: 'rgba(207, 45, 86, 0.08)',
                border: '1px solid var(--color-crimson)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 12px',
                marginBottom: '16px',
                color: 'var(--color-crimson)',
                fontSize: '12px'
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
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--color-ink)', marginBottom: '5px' }}>
                  User ID / Username / Email
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-ash)', pointerEvents: 'none' }}>
                    <User size={15} />
                  </div>
                  <input
                    type="text"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    placeholder="e.g. customer, manager, or your email"
                    required
                    className="input-parchment"
                    style={{ width: '100%', paddingLeft: '36px', height: '38px', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--color-ink)', marginBottom: '5px' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-ash)', pointerEvents: 'none' }}>
                    <Lock size={15} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                    className="input-parchment"
                    style={{ width: '100%', paddingLeft: '36px', paddingRight: '36px', height: '38px', fontSize: '13px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--color-ash)', cursor: 'pointer' }}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{ width: '100%', height: '40px', justifyContent: 'center', marginTop: '6px', fontSize: '13px', fontWeight: 500 }}
              >
                {loading ? (
                  <div style={{ width: '15px', height: '15px', border: '2px solid var(--color-parchment)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '14px 0', color: 'var(--color-ash)', fontSize: '11px', textTransform: 'uppercase' }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--color-stone)' }} />
                <span>Or</span>
                <div style={{ flex: 1, height: '1px', background: 'var(--color-stone)' }} />
              </div>

              <button
                type="button"
                onClick={handleGuestLogin}
                disabled={loading}
                className="btn-secondary"
                style={{ width: '100%', height: '38px', justifyContent: 'center', fontSize: '12px', fontWeight: 500, gap: '6px' }}
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
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--color-ink)', marginBottom: '4px' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  required
                  className="input-parchment"
                  style={{ width: '100%', height: '36px', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--color-ink)', marginBottom: '4px' }}>
                    Username *
                  </label>
                  <input
                    type="text"
                    value={signupUsername}
                    onChange={(e) => setSignupUsername(e.target.value)}
                    placeholder="e.g. janedoe"
                    required
                    className="input-parchment"
                    style={{ width: '100%', height: '36px', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--color-ink)', marginBottom: '4px' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="jane@example.com"
                    className="input-parchment"
                    style={{ width: '100%', height: '36px', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--color-ink)', marginBottom: '4px' }}>
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
                    style={{ width: '100%', paddingRight: '36px', height: '36px', fontSize: '13px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--color-ash)', cursor: 'pointer' }}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--color-ash)', marginTop: '3px' }}>
                  Requirements: 1 uppercase, 1 lowercase, 1 number, 1 special character (min 8 chars)
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--color-ink)', marginBottom: '4px' }}>
                  Contact Phone (Optional)
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-ash)', pointerEvents: 'none' }}>
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
                    style={{ width: '100%', paddingLeft: '30px', height: '36px', fontSize: '13px' }}
                  />
                </div>
                <div style={{ fontSize: '11px', color: 'var(--color-ash)', marginTop: '3px' }}>
                  Optional &bull; Numeric only (strictly 10 digits)
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{ width: '100%', height: '40px', justifyContent: 'center', marginTop: '6px', fontSize: '13px', fontWeight: 500 }}
              >
                {loading ? (
                  <div style={{ width: '15px', height: '15px', border: '2px solid var(--color-parchment)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                ) : (
                  <>
                    <UserPlus size={14} />
                    <span>Save Account & Enter Menu</span>
                  </>
                )}
              </button>

              <div style={{ textAlign: 'center', marginTop: '8px' }}>
                <span style={{ fontSize: '12px', color: 'var(--color-driftwood)' }}>
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('signin'); setError(null); }}
                    style={{ background: 'none', border: 'none', color: 'var(--color-ember)', cursor: 'pointer', textDecoration: 'underline', fontSize: '12px' }}
                  >
                    Sign in here
                  </button>
                </span>
              </div>
            </form>
          )}

          {/* Quick Demo Pre-Seeded Accounts (Always visible on sign-in) */}
          {mode === 'signin' && (
            <div
              style={{
                marginTop: '20px',
                paddingTop: '14px',
                borderTop: '1px solid var(--color-stone)'
              }}
            >
              <div style={{ fontSize: '11px', color: 'var(--color-driftwood)', marginBottom: '8px', fontWeight: 500 }}>
                Pre-Seeded Database Accounts:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => fillAndLogin('customer', 'customer123')}
                  disabled={loading}
                  className="btn-ghost"
                  style={{
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-stone)',
                    background: 'var(--color-parchment)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '2px',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 500, color: 'var(--color-ink)' }}>
                    <User size={11} color="var(--color-ink)" />
                    <span>Customer</span>
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--color-driftwood)', fontFamily: 'var(--font-mono)' }}>
                    POS Menu Only
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => fillAndLogin('manager', 'manager123')}
                  disabled={loading}
                  className="btn-ghost"
                  style={{
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-stone)',
                    background: 'var(--color-parchment)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '2px',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 500, color: 'var(--color-ink)' }}>
                    <ShieldCheck size={11} color="var(--color-forest)" />
                    <span>Manager</span>
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--color-driftwood)', fontFamily: 'var(--font-mono)' }}>
                    Radar & Analytics
                  </div>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Database Persistence Footer Note */}
        <p style={{ textAlign: 'center', fontSize: '11px', color: 'var(--color-ash)', marginTop: '20px' }}>
          Autonomous Kitchen Network &bull; Supabase Database Backed
        </p>

      </div>
    </div>
  );
}
