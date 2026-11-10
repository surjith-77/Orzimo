import React, { useState } from 'react';
import { X, Store, User, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AuthModal({ isOpen, onClose, onLoggedIn, defaultRole = 'buyer' }) {
  const { login, register } = useAuth();
  const [activeRoleTab, setActiveRoleTab] = useState(defaultRole);
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [shopName, setShopName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      if (isRegisterMode) {
        if (!name.trim()) {
          setErrorMsg('Please enter your full name.');
          setIsLoading(false);
          return;
        }
        if (activeRoleTab === 'seller' && !shopName.trim()) {
          setErrorMsg('Please enter your studio or shop name.');
          setIsLoading(false);
          return;
        }

        const res = await register({ 
          name: name.trim(), 
          email: email.trim(), 
          password,
          shopName: shopName.trim() 
        }, activeRoleTab);

        if (!res.success) {
          setErrorMsg(res.error || 'Registration failed.');
          return;
        }
      } else {
        const res = await login(email.trim(), password, activeRoleTab);
        if (!res.success) {
          setErrorMsg(res.error || 'Authentication failed. Please verify credentials.');
          return;
        }
      }

      if (onLoggedIn) onLoggedIn(activeRoleTab);
      onClose();
    } catch (_err) {
      setErrorMsg('An error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 300 }}>
      <div className="auth-modal-dialog" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div className="brand-logo-mark" style={{ width: '46px', height: '46px', margin: '0 auto 10px' }}>
            <img src="/brand-logo.png" alt="Orzimo" className="brand-logo-img" />
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-navy)', margin: 0 }}>
            {isRegisterMode ? 'Join ORZIMO Marketplace' : 'Sign In to ORZIMO'}
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginTop: 4 }}>
            Official Domain: <strong>orzimo.in</strong>
          </p>
        </div>

        {/* Role Tabs: Buyer vs Seller */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab-btn ${activeRoleTab === 'buyer' ? 'active' : ''}`}
            onClick={() => { setActiveRoleTab('buyer'); setErrorMsg(''); }}
          >
            <User size={15} style={{ display: 'inline', marginRight: 4 }} />
            Customer / Buyer
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${activeRoleTab === 'seller' ? 'active' : ''}`}
            onClick={() => { setActiveRoleTab('seller'); setErrorMsg(''); }}
          >
            <Store size={15} style={{ display: 'inline', marginRight: 4 }} />
            Creator / Seller Studio
          </button>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div style={{
            background: '#FEE2E2',
            border: '1px solid #FCA5A5',
            color: '#B91C1C',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.8rem',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Real Authentication Form */}
        <form className="auth-form" onSubmit={handleSubmit}>
          {isRegisterMode && (
            <div className="form-group">
              <label>Full Name</label>
              <input
                required
                className="form-input"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          {isRegisterMode && activeRoleTab === 'seller' && (
            <div className="form-group">
              <label>Kitchen / Studio / Brand Name</label>
              <input
                required
                className="form-input"
                placeholder="e.g. Amber Bakes, Ocean Craft Studio"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
              />
            </div>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <input
              required
              type="email"
              className="form-input"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              required
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-lg" 
            style={{ width: '100%', marginTop: '6px' }}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : (
              isRegisterMode 
                ? (activeRoleTab === 'seller' ? 'Create Creator Studio Account' : 'Create Customer Account')
                : (activeRoleTab === 'seller' ? 'Sign In to Creator Studio' : 'Sign In as Buyer')
            )}
          </button>

          <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--gray-500)', marginTop: '8px' }}>
            {isRegisterMode ? (
              <span>Already have an account? <strong style={{ color: 'var(--color-primary)', cursor: 'pointer' }} onClick={() => { setIsRegisterMode(false); setErrorMsg(''); }}>Sign In</strong></span>
            ) : (
              <span>New to Orzimo? <strong style={{ color: 'var(--color-primary)', cursor: 'pointer' }} onClick={() => { setIsRegisterMode(true); setErrorMsg(''); }}>Create an account</strong></span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
