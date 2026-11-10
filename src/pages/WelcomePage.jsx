import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingCart,
  Store,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Lock,
  Mail,
  User,
  Phone,
  Eye,
  EyeOff,
  AlertCircle,
  Check,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { sendPhoneOtp, verifyPhoneOtp, SUPPORTED_COUNTRY_CODES } from '../services/phoneAuthService';
import '../Welcome.css';

export default function WelcomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, loginWithPhoneVerified, resetPassword, isAuthenticated, currentUser } = useAuth();

  // If already authenticated, redirect to destination dashboard
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      if (currentUser.role === 'seller') {
        navigate('/seller', { replace: true });
      } else {
        navigate('/buyer', { replace: true });
      }
    }
  }, [isAuthenticated, currentUser, navigate]);

  // Read URL query params (?role=buyer | ?role=seller)
  const queryParams = new URLSearchParams(location.search);
  const paramRole = queryParams.get('role');
  const validParamRole = (paramRole === 'seller' || paramRole === 'buyer') ? paramRole : null;

  // View States: 'role-selection' | 'signin' | 'signup' | 'forgot-password'
  const [currentView, setCurrentView] = useState(validParamRole ? 'signin' : 'role-selection');
  
  // Selected role: null by default (do not automatically select a role)
  const [selectedRole, setSelectedRole] = useState(validParamRole);

  // Sign-in Method: 'password' | 'phone_otp'
  const [signInMethod, setSignInMethod] = useState('password');

  // Common Form Fields
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Sign-Up Specific Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [shopName, setShopName] = useState('');
  const [category, setCategory] = useState('cakes-bakery');

  // Phone OTP States
  const [countryCode, setCountryCode] = useState('+91');
  const [rawPhone, setRawPhone] = useState('');
  const [otpToken, setOtpToken] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);

  // Status & Feedback States
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 60-second cooldown timer countdown for OTP
  useEffect(() => {
    if (otpCooldown <= 0) return;
    const timer = setInterval(() => {
      setOtpCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [otpCooldown]);

  // Reset messages on view or role changes
  const clearFeedback = () => {
    setErrorMsg('');
    setSuccessMsg('');
  };

  // --------------------------------------------------------------------------
  // Role Selection Actions
  // --------------------------------------------------------------------------
  const handleRoleCardClick = (role) => {
    setSelectedRole(role);
    clearFeedback();
  };

  const handleContinueFromRoleSelection = () => {
    if (!selectedRole) {
      setErrorMsg('Please select how you want to continue (Buyer or Seller).');
      return;
    }
    clearFeedback();
    setCurrentView('signin');
  };

  const handleBackToRoleSelection = () => {
    clearFeedback();
    setCurrentView('role-selection');
  };

  // --------------------------------------------------------------------------
  // Password Sign-In Submission
  // --------------------------------------------------------------------------
  const handlePasswordSignIn = async (e) => {
    e.preventDefault();
    clearFeedback();

    if (!emailOrPhone.trim()) {
      setErrorMsg('Please enter your email address or phone number.');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await login(emailOrPhone.trim(), password, selectedRole);
      if (!res.success) {
        setErrorMsg(res.error || 'Authentication failed. Please verify credentials.');
        return;
      }

      // Route verified accounts to corresponding dashboard
      if (res.user.role === 'seller') {
        navigate('/seller');
      } else {
        navigate('/buyer');
      }
    } catch (err) {
      setErrorMsg(err.message || 'An unexpected error occurred during sign in.');
    } finally {
      setIsLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // Phone OTP Flow (Actual SMS OTP with Zero Bypass)
  // --------------------------------------------------------------------------
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    clearFeedback();

    if (!rawPhone.trim()) {
      setErrorMsg('Please enter your mobile number.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await sendPhoneOtp(countryCode, rawPhone.trim());
      if (!res.success) {
        setErrorMsg(res.error || 'Failed to dispatch SMS verification code.');
        if (res.remainingCooldown) {
          setOtpCooldown(res.remainingCooldown);
        }
        return;
      }

      setOtpSent(true);
      setOtpCooldown(res.cooldownSeconds || 60);
      setSuccessMsg(res.message || '6-digit verification code has been dispatched via SMS.');
    } catch (err) {
      setErrorMsg(err.message || 'Error communicating with SMS service.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtpAndSignIn = async (e) => {
    e.preventDefault();
    clearFeedback();

    if (!otpToken.trim() || otpToken.trim().length !== 6) {
      setErrorMsg('Please enter the exact 6-digit numeric verification code.');
      return;
    }

    setIsLoading(true);
    try {
      const verifyRes = await verifyPhoneOtp(countryCode, rawPhone.trim(), otpToken.trim());
      if (!verifyRes.success) {
        setErrorMsg(verifyRes.error || 'Invalid or expired verification code.');
        return;
      }

      // Complete login with verified phone
      const loginRes = await loginWithPhoneVerified(verifyRes.fullPhone, selectedRole);
      if (!loginRes.success) {
        setErrorMsg(loginRes.error || 'Phone authentication failed.');
        return;
      }

      // Route verified account to correct dashboard
      if (loginRes.user.role === 'seller') {
        navigate('/seller');
      } else {
        navigate('/buyer');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error verifying phone authentication code.');
    } finally {
      setIsLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // Google OAuth (Only when configured)
  // --------------------------------------------------------------------------
  const handleGoogleSignIn = async () => {
    clearFeedback();
    if (!isSupabaseConfigured || !supabase) {
      setErrorMsg('Google Sign-In is not configured for this project.');
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) {
        setErrorMsg(error.message);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Google sign in failed.');
    }
  };

  // --------------------------------------------------------------------------
  // Registration Submission (Preserving all required fields)
  // --------------------------------------------------------------------------
  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    clearFeedback();

    if (!name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    if (selectedRole === 'seller') {
      if (!shopName.trim()) {
        setErrorMsg('Please enter your Studio, Kitchen, or Brand name.');
        return;
      }
      if (!phone.trim()) {
        setErrorMsg('Please enter your Contact/WhatsApp number.');
        return;
      }
    }

    setIsLoading(true);
    try {
      const res = await register({
        name: name.trim(),
        email: email.trim(),
        password,
        phone: phone.trim(),
        city: city.trim(),
        shopName: selectedRole === 'seller' ? shopName.trim() : undefined,
        category: selectedRole === 'seller' ? category : undefined
      }, selectedRole);

      if (!res.success) {
        setErrorMsg(res.error || 'Registration failed.');
        return;
      }

      // Route newly registered user to their verified portal
      if (selectedRole === 'seller') {
        navigate('/seller');
      } else {
        navigate('/buyer');
      }
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred during account registration.');
    } finally {
      setIsLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // Forgot Password Submission
  // --------------------------------------------------------------------------
  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    clearFeedback();

    if (!emailOrPhone.trim() || !emailOrPhone.includes('@')) {
      setErrorMsg('Please enter the email address registered with your account.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await resetPassword(emailOrPhone.trim());
      if (!res.success) {
        setErrorMsg(res.error || 'Failed to dispatch password reset request.');
        return;
      }
      setSuccessMsg(res.message || 'Password reset link sent to your email.');
    } catch (err) {
      setErrorMsg(err.message || 'Password reset request failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="orz-auth-viewport">
      {/* Top Header */}
      <header className="orz-auth-header">
        <div 
          className="orz-auth-brand" 
          onClick={() => { setCurrentView('role-selection'); setSelectedRole(null); }}
        >
          <div className="orz-auth-logo">
            <img src="/brand-logo.png" alt="Orzimo Logo" />
          </div>
          <div className="orz-auth-brand-text">
            <span className="orz-auth-brand-name">ORZIMO</span>
            <span className="orz-auth-brand-sub">ARTISAN ECOSYSTEM</span>
          </div>
        </div>

        <div className="orz-auth-domain-tag">
          <ShieldCheck size={14} color="#3B82F6" />
          <span>Official Domain: <strong>orzimo.in</strong></span>
        </div>
      </header>

      {/* Main Container */}
      <main className="orz-auth-main">
        {/* ===================================================================
            1. SIMPLIFY ROLE SELECTION VIEW
           =================================================================== */}
        {currentView === 'role-selection' && (
          <div className="orz-auth-card">
            <div className="orz-card-header">
              <div className="orz-center-logo">
                <img src="/brand-logo.png" alt="Orzimo" />
              </div>
              <h1 className="orz-card-title">Get Started</h1>
              <p className="orz-card-subtitle">Choose how you want to continue</p>
            </div>

            {errorMsg && (
              <div className="orz-alert error">
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Exactly two selectable cards: Buyer & Seller */}
            <div className="orz-role-selection-grid">
              {/* Buyer Card */}
              <div
                className={`orz-role-card ${selectedRole === 'buyer' ? 'selected' : ''}`}
                onClick={() => handleRoleCardClick('buyer')}
                role="button"
                tabIndex={0}
                aria-label="Continue as Buyer"
              >
                <div className="orz-role-card-check">
                  <CheckCircle2 size={18} />
                </div>
                <div className="orz-role-icon-box">
                  <ShoppingCart size={28} />
                </div>
                <span className="orz-role-card-name">Buyer</span>
                <span className="orz-role-card-tag">Shop artisan goods</span>
              </div>

              {/* Seller Card */}
              <div
                className={`orz-role-card ${selectedRole === 'seller' ? 'selected' : ''}`}
                onClick={() => handleRoleCardClick('seller')}
                role="button"
                tabIndex={0}
                aria-label="Continue as Seller"
              >
                <div className="orz-role-card-check">
                  <CheckCircle2 size={18} />
                </div>
                <div className="orz-role-icon-box">
                  <Store size={28} />
                </div>
                <span className="orz-role-card-name">Seller</span>
                <span className="orz-role-card-tag">Manage home studio</span>
              </div>
            </div>

            {/* One Continue button below the cards */}
            <button
              type="button"
              className="orz-btn-primary"
              onClick={handleContinueFromRoleSelection}
              disabled={!selectedRole}
            >
              <span>Continue</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* ===================================================================
            2. SIGN-IN PAGE (For Selected Role)
           =================================================================== */}
        {currentView === 'signin' && (
          <div className="orz-auth-card">
            {/* Top Action Bar: Back Button & Selected Role Indicator */}
            <div className="orz-top-action-bar">
              <button
                type="button"
                className="orz-back-btn"
                onClick={handleBackToRoleSelection}
                title="Change Role"
              >
                <ArrowLeft size={14} />
                <span>Change Role</span>
              </button>

              <span className={`orz-role-pill ${selectedRole}`}>
                {selectedRole === 'seller' ? (
                  <>
                    <Store size={12} /> Seller Studio
                  </>
                ) : (
                  <>
                    <ShoppingCart size={12} /> Buyer Portal
                  </>
                )}
              </span>
            </div>

            <div className="orz-card-header">
              <div className="orz-center-logo">
                <img src="/brand-logo.png" alt="Orzimo" />
              </div>
              <h1 className="orz-card-title">Sign In</h1>
              <p className="orz-card-subtitle">
                {selectedRole === 'seller'
                  ? 'Access your kitchen studio, bakes, and incoming orders'
                  : 'Access your account and track your artisan orders'}
              </p>
            </div>

            {errorMsg && (
              <div className="orz-alert error">
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="orz-alert success">
                <Check size={16} />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Mode A: Password Authentication */}
            {signInMethod === 'password' && (
              <form className="orz-form" onSubmit={handlePasswordSignIn}>
                <div className="orz-form-group">
                  <label className="orz-label">Email address or phone number</label>
                  <div className="orz-input-wrapper">
                    <Mail size={16} className="orz-input-icon" />
                    <input
                      type="text"
                      className="orz-input"
                      placeholder={selectedRole === 'seller' ? 'chef@artisanstudio.in' : 'name@example.com'}
                      value={emailOrPhone}
                      onChange={(e) => setEmailOrPhone(e.target.value)}
                      required
                      autoComplete="username"
                    />
                  </div>
                </div>

                <div className="orz-form-group">
                  <div className="orz-label-row">
                    <label className="orz-label">Password</label>
                    <span
                      className="orz-forgot-link"
                      onClick={() => { clearFeedback(); setCurrentView('forgot-password'); }}
                      role="button"
                      tabIndex={0}
                    >
                      Forgot Password?
                    </span>
                  </div>
                  <div className="orz-input-wrapper">
                    <Lock size={16} className="orz-input-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="orz-input"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="orz-input-btn-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="orz-btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span>Signing in...</span>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Mode B: Phone OTP Authentication */}
            {signInMethod === 'phone_otp' && (
              <form
                className="orz-form"
                onSubmit={otpSent ? handleVerifyOtpAndSignIn : handleSendOtp}
              >
                <div className="orz-form-group">
                  <label className="orz-label">Mobile Number</label>
                  <div className="orz-otp-grid">
                    <select
                      className="orz-country-select"
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      disabled={otpSent}
                    >
                      {SUPPORTED_COUNTRY_CODES.map((item) => (
                        <option key={item.code} value={item.code}>
                          {item.flag} {item.code}
                        </option>
                      ))}
                    </select>

                    <div className="orz-input-wrapper" style={{ flex: 1 }}>
                      <Phone size={16} className="orz-input-icon" />
                      <input
                        type="tel"
                        className="orz-input"
                        placeholder="10-digit mobile number"
                        value={rawPhone}
                        onChange={(e) => setRawPhone(e.target.value)}
                        disabled={otpSent}
                        required
                      />
                    </div>
                  </div>
                </div>

                {otpSent && (
                  <div className="orz-form-group">
                    <label className="orz-label">Enter 6-Digit OTP</label>
                    <input
                      type="text"
                      maxLength={6}
                      className="orz-input no-icon orz-otp-digits-input"
                      placeholder="••••••"
                      value={otpToken}
                      onChange={(e) => setOtpToken(e.target.value.replace(/\D/g, ''))}
                      required
                      autoFocus
                    />
                    <div className="orz-resend-row">
                      <span>Didn't receive the SMS code?</span>
                      <button
                        type="button"
                        className="orz-resend-btn"
                        onClick={handleSendOtp}
                        disabled={otpCooldown > 0 || isLoading}
                      >
                        {otpCooldown > 0 ? `Resend OTP in ${otpCooldown}s` : 'Resend OTP'}
                      </button>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="orz-btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span>Verifying...</span>
                  ) : otpSent ? (
                    <>
                      <span>Verify & Sign In</span>
                      <ArrowRight size={18} />
                    </>
                  ) : (
                    <>
                      <span>Send 6-Digit OTP</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Alternates & OTP Toggle */}
            <div className="orz-divider">or</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Phone OTP Toggle Button */}
              {signInMethod === 'password' ? (
                <button
                  type="button"
                  className="orz-btn-secondary"
                  onClick={() => {
                    clearFeedback();
                    setSignInMethod('phone_otp');
                  }}
                >
                  <Phone size={16} />
                  <span>Sign In with Phone OTP</span>
                </button>
              ) : (
                <button
                  type="button"
                  className="orz-btn-secondary"
                  onClick={() => {
                    clearFeedback();
                    setSignInMethod('password');
                  }}
                >
                  <Mail size={16} />
                  <span>Sign In with Password</span>
                </button>
              )}

              {/* Google Sign-In Option (Only if Supabase is configured) */}
              {isSupabaseConfigured && (
                <button
                  type="button"
                  className="orz-google-btn"
                  onClick={handleGoogleSignIn}
                >
                  <svg className="orz-google-icon" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Sign in with Google</span>
                </button>
              )}
            </div>

            {/* Link to Sign Up */}
            <div className="orz-auth-switch">
              <span>Don't have an account?</span>
              <button
                type="button"
                className="orz-switch-btn"
                onClick={() => {
                  clearFeedback();
                  setCurrentView('signup');
                }}
              >
                Sign Up
              </button>
            </div>
          </div>
        )}

        {/* ===================================================================
            3. SIGN-UP PAGE (Matching Registration for Selected Role)
           =================================================================== */}
        {currentView === 'signup' && (
          <div className="orz-auth-card wide-card">
            {/* Top Action Bar */}
            <div className="orz-top-action-bar">
              <button
                type="button"
                className="orz-back-btn"
                onClick={() => { clearFeedback(); setCurrentView('signin'); }}
              >
                <ArrowLeft size={14} />
                <span>Back to Sign In</span>
              </button>

              <span className={`orz-role-pill ${selectedRole}`}>
                {selectedRole === 'seller' ? (
                  <>
                    <Store size={12} /> New Seller Studio
                  </>
                ) : (
                  <>
                    <ShoppingCart size={12} /> New Buyer Account
                  </>
                )}
              </span>
            </div>

            <div className="orz-card-header">
              <div className="orz-center-logo">
                <img src="/brand-logo.png" alt="Orzimo" />
              </div>
              <h1 className="orz-card-title">
                {selectedRole === 'seller' ? 'Create Seller Studio' : 'Create Account'}
              </h1>
              <p className="orz-card-subtitle">
                {selectedRole === 'seller'
                  ? 'Start managing custom bakes, pre-orders, and artisan offerings'
                  : 'Join Orzimo to discover verified bakers and artisan creations'}
              </p>
            </div>

            {errorMsg && (
              <div className="orz-alert error">
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form className="orz-form" onSubmit={handleSignUpSubmit}>
              {/* Full Name */}
              <div className="orz-form-group">
                <label className="orz-label">Full Name</label>
                <div className="orz-input-wrapper">
                  <User size={16} className="orz-input-icon" />
                  <input
                    type="text"
                    className="orz-input"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Seller-Specific: Studio Name & Craft Category */}
              {selectedRole === 'seller' && (
                <>
                  <div className="orz-form-group">
                    <label className="orz-label">Kitchen / Studio / Brand Name</label>
                    <div className="orz-input-wrapper">
                      <Store size={16} className="orz-input-icon" />
                      <input
                        type="text"
                        className="orz-input"
                        placeholder="e.g. Whisk & Frost Bakery"
                        value={shopName}
                        onChange={(e) => setShopName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="orz-form-group">
                    <label className="orz-label">Primary Craft Category</label>
                    <select
                      className="orz-select"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option value="cakes-bakery">Homemade Cakes & Bakery</option>
                      <option value="handmade-gifts">Handmade Gifts & Scrapbooks</option>
                      <option value="personalized-products">Personalized & Resin Art</option>
                      <option value="homemade-foods">Homemade Foods & Organic Pickles</option>
                      <option value="handmade-jewellery">Handmade Jewellery</option>
                      <option value="scented-candles">Aromatic Soy Wax Candles</option>
                    </select>
                  </div>
                </>
              )}

              {/* Email Address */}
              <div className="orz-form-group">
                <label className="orz-label">Email Address</label>
                <div className="orz-input-wrapper">
                  <Mail size={16} className="orz-input-icon" />
                  <input
                    type="email"
                    className="orz-input"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="orz-form-group">
                <label className="orz-label">Create Password (min. 6 characters)</label>
                <div className="orz-input-wrapper">
                  <Lock size={16} className="orz-input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="orz-input"
                    placeholder="Create a secure password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="orz-input-btn-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Phone & City Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="orz-form-group">
                  <label className="orz-label">
                    {selectedRole === 'seller' ? 'Phone / WhatsApp *' : 'Phone Number'}
                  </label>
                  <div className="orz-input-wrapper">
                    <Phone size={16} className="orz-input-icon" />
                    <input
                      type="tel"
                      className="orz-input"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required={selectedRole === 'seller'}
                    />
                  </div>
                </div>

                <div className="orz-form-group">
                  <label className="orz-label">City</label>
                  <input
                    type="text"
                    className="orz-input no-icon"
                    placeholder="e.g. Bengaluru"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="orz-btn-primary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span>Creating Account...</span>
                ) : (
                  <>
                    <span>
                      {selectedRole === 'seller' ? 'Launch Seller Studio' : 'Create Buyer Account'}
                    </span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            {/* Back to Sign In Switch */}
            <div className="orz-auth-switch">
              <span>Already have an account?</span>
              <button
                type="button"
                className="orz-switch-btn"
                onClick={() => {
                  clearFeedback();
                  setCurrentView('signin');
                }}
              >
                Sign In
              </button>
            </div>
          </div>
        )}

        {/* ===================================================================
            4. FORGOT PASSWORD VIEW
           =================================================================== */}
        {currentView === 'forgot-password' && (
          <div className="orz-auth-card">
            <div className="orz-top-action-bar">
              <button
                type="button"
                className="orz-back-btn"
                onClick={() => { clearFeedback(); setCurrentView('signin'); }}
              >
                <ArrowLeft size={14} />
                <span>Back to Sign In</span>
              </button>
            </div>

            <div className="orz-card-header">
              <div className="orz-center-logo">
                <img src="/brand-logo.png" alt="Orzimo" />
              </div>
              <h1 className="orz-card-title">Reset Password</h1>
              <p className="orz-card-subtitle">
                Enter your registered email address and we will dispatch password recovery instructions.
              </p>
            </div>

            {errorMsg && (
              <div className="orz-alert error">
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="orz-alert success">
                <Check size={16} />
                <span>{successMsg}</span>
              </div>
            )}

            <form className="orz-form" onSubmit={handleForgotPasswordSubmit}>
              <div className="orz-form-group">
                <label className="orz-label">Registered Email Address</label>
                <div className="orz-input-wrapper">
                  <Mail size={16} className="orz-input-icon" />
                  <input
                    type="email"
                    className="orz-input"
                    placeholder="name@example.com"
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="orz-btn-primary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span>Sending instructions...</span>
                ) : (
                  <>
                    <span>Send Reset Instructions</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="orz-auth-switch">
              <span>Remembered your password?</span>
              <button
                type="button"
                className="orz-switch-btn"
                onClick={() => {
                  clearFeedback();
                  setCurrentView('signin');
                }}
              >
                Sign In
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
