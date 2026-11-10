import React, { useState, useEffect } from 'react';
import { 
  X, 
  Store, 
  MapPin, 
  Truck, 
  ShieldCheck, 
  AlertCircle, 
  Loader2, 
  CheckCircle2,
  Send
} from 'lucide-react';
import { verifyIndianPincode, isValidIndianPincodeFormat } from '../../services/postalService';
import { 
  SUPPORTED_COUNTRY_CODES, 
  validatePhoneNumber, 
  sendPhoneOtp, 
  verifyPhoneOtp 
} from '../../services/phoneAuthService';
import { useMarketplace } from '../../context/MarketplaceContext';
import { useAuth } from '../../context/AuthContext';

export default function SellerAddressSetupModal({
  isOpen,
  onClose,
  currentAddress: propAddress,
  onSaveSellerAddress,
  currentUser: propUser,
  onSuccess
}) {
  const { currentUser: authUser, updateUserProfile } = useAuth();
  const { sellerAddress: contextAddress, updateSellerAddressData } = useMarketplace();

  const currentUser = propUser || authUser;
  const currentAddress = propAddress || contextAddress;

  // 1. Business Identity & Mobile Verification States
  const [sellerName, setSellerName] = useState('');
  const [shopName, setShopName] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [contactPhone, setContactPhone] = useState('');
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [phoneVerifiedAt, setPhoneVerifiedAt] = useState(null);

  // OTP Verification States
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpTimeRemaining, setOtpTimeRemaining] = useState(0);
  const [phoneError, setPhoneError] = useState('');
  const [phoneSuccess, setPhoneSuccess] = useState('');

  // 2. Business Address fields (Initially empty - NO hardcoded Bengaluru/Karnataka)
  const [bBuildingNo, setBBuildingNo] = useState('');
  const [bStreet, setBStreet] = useState('');
  const [bArea, setBArea] = useState('');
  const [bPincode, setBPincode] = useState('');
  const [bCity, setBCity] = useState('');
  const [bDistrict, setBDistrict] = useState('');
  const [bState, setBState] = useState('');
  const [isBVerifying, setIsBVerifying] = useState(false);
  const [isBVerified, setIsBVerified] = useState(false);
  const [bError, setBError] = useState('');
  const [bLocalities, setBLocalities] = useState([]);

  // 3. Dispatch Address fields (Initially empty)
  const [sameAsBusiness, setSameAsBusiness] = useState(true);
  const [dBuildingNo, setDBuildingNo] = useState('');
  const [dStreet, setDStreet] = useState('');
  const [dArea, setDArea] = useState('');
  const [dPincode, setDPincode] = useState('');
  const [dCity, setDCity] = useState('');
  const [dDistrict, setDDistrict] = useState('');
  const [dState, setDState] = useState('');
  const [isDVerifying, setIsDVerifying] = useState(false);
  const [isDVerified, setIsDVerified] = useState(false);
  const [dError, setDError] = useState('');
  const [dLocalities, setDLocalities] = useState([]);

  // 4. Form Submission & Global Feedback States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Cooldown countdown timer for Resend OTP
  useEffect(() => {
    let timer = null;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [resendCooldown]);

  // Expiration timer for active OTP (5 minutes)
  useEffect(() => {
    let timer = null;
    if (otpTimeRemaining > 0) {
      timer = setInterval(() => {
        setOtpTimeRemaining((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [otpTimeRemaining]);

  // Automatically load previously saved address and user profile upon opening
  useEffect(() => {
    if (!isOpen) return;

    setGeneralError('');
    setSuccessMessage('');
    setPhoneError('');
    setPhoneSuccess('');
    setIsSubmitting(false);
    setOtpSent(false);
    setOtpInput('');

    // Business identity
    setSellerName(currentAddress?.sellerName || currentUser?.name || '');
    setShopName(currentAddress?.shopName || currentUser?.shopName || currentUser?.studioName || '');

    // Phone & verification state
    const savedCode = currentAddress?.countryCode || '+91';
    setCountryCode(savedCode);
    const rawPhone = currentAddress?.contactPhone || currentUser?.phone || '';
    setContactPhone(rawPhone.replace(/\D/g, '').slice(0, 10));

    const phoneVerified = Boolean(currentAddress?.isPhoneVerified || currentUser?.isPhoneVerified);
    setIsPhoneVerified(phoneVerified);
    setPhoneVerifiedAt(currentAddress?.phoneVerifiedAt || null);

    // Business address: Clean empty state for new sellers (NO hardcoded Bengaluru)
    if (currentAddress?.businessAddress) {
      const b = currentAddress.businessAddress;
      setBBuildingNo(b.buildingNo || '');
      setBStreet(b.street || '');
      setBArea(b.area || '');
      setBPincode(b.pincode || '');
      setBCity(b.city || '');
      setBDistrict(b.district || '');
      setBState(b.state || '');
      setIsBVerified(Boolean(b.isVerified));
      setBError('');

      if (b.pincode && b.pincode.length === 6) {
        verifyIndianPincode(b.pincode).then((res) => {
          if (res.valid && res.localities?.length) {
            setBLocalities(res.localities);
          }
        }).catch(() => {});
      }
    } else {
      // Clean empty fields for new sellers
      setBBuildingNo('');
      setBStreet('');
      setBArea('');
      setBPincode('');
      setBCity('');
      setBDistrict('');
      setBState('');
      setIsBVerified(false);
      setBError('');
      setBLocalities([]);
    }

    // Same as business
    const isSame = currentAddress?.sameAsBusiness ?? true;
    setSameAsBusiness(isSame);

    // Dispatch address: Clean empty state for new sellers
    if (currentAddress?.dispatchAddress && !isSame) {
      const d = currentAddress.dispatchAddress;
      setDBuildingNo(d.buildingNo || '');
      setDStreet(d.street || '');
      setDArea(d.area || '');
      setDPincode(d.pincode || '');
      setDCity(d.city || '');
      setDDistrict(d.district || '');
      setDState(d.state || '');
      setIsDVerified(Boolean(d.isVerified));
      setDError('');

      if (d.pincode && d.pincode.length === 6) {
        verifyIndianPincode(d.pincode).then((res) => {
          if (res.valid && res.localities?.length) {
            setDLocalities(res.localities);
          }
        }).catch(() => {});
      }
    } else {
      setDBuildingNo('');
      setDStreet('');
      setDArea('');
      setDPincode('');
      setDCity('');
      setDDistrict('');
      setDState('');
      setIsDVerified(false);
      setDError('');
      setDLocalities([]);
    }
  }, [isOpen, currentAddress, currentUser]);

  // Handle mobile number input change (resets verification if modified)
  const handlePhoneChange = (val) => {
    const clean = val.replace(/\D/g, '').slice(0, 10);
    setContactPhone(clean);
    setIsPhoneVerified(false);
    setOtpSent(false);
    setOtpInput('');
    setPhoneError('');
    setPhoneSuccess('');
    setGeneralError('');
  };

  // Handle country code change (resets verification if modified)
  const handleCountryCodeChange = (code) => {
    setCountryCode(code);
    setIsPhoneVerified(false);
    setOtpSent(false);
    setOtpInput('');
    setPhoneError('');
    setPhoneSuccess('');
    setGeneralError('');
  };

  // Send real 6-digit OTP using Supabase Phone Authentication
  const handleSendOtp = async () => {
    setPhoneError('');
    setPhoneSuccess('');
    setGeneralError('');

    const validation = validatePhoneNumber(countryCode, contactPhone);
    if (!validation.valid) {
      setPhoneError(validation.error);
      return;
    }

    setIsSendingOtp(true);
    try {
      const res = await sendPhoneOtp(countryCode, contactPhone);
      if (res.success) {
        setOtpSent(true);
        setPhoneSuccess(res.message);
        setResendCooldown(res.cooldownSeconds || 60);
        setOtpTimeRemaining(300); // 5 minutes
      } else {
        setPhoneError(res.error || 'Failed to dispatch verification OTP.');
        if (res.remainingCooldown) {
          setResendCooldown(res.remainingCooldown);
        }
      }
    } catch (err) {
      setPhoneError(err.message || 'Error communicating with Supabase Phone Auth.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Verify real 6-digit OTP via server-side Supabase verification
  const handleVerifyOtp = async () => {
    setPhoneError('');
    setPhoneSuccess('');
    setGeneralError('');

    if (!otpInput || otpInput.trim().length !== 6) {
      setPhoneError('Please enter the complete 6-digit OTP received on your phone.');
      return;
    }

    if (otpTimeRemaining <= 0 && otpSent) {
      setPhoneError('The OTP code has expired. Please click "Resend OTP" to request a new code.');
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const res = await verifyPhoneOtp(countryCode, contactPhone, otpInput.trim());
      if (res.success) {
        setIsPhoneVerified(true);
        setPhoneVerifiedAt(new Date().toISOString());
        setPhoneSuccess('Mobile Number Verified Successfully');
        setOtpSent(false);
        setOtpInput('');
        setGeneralError('');
      } else {
        setPhoneError(res.error || 'Invalid OTP code. Please check and try again.');
      }
    } catch (err) {
      setPhoneError(err.message || 'Error verifying OTP code.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Handle "Same as business address" toggle
  const handleToggleSameAsBusiness = (checked) => {
    setSameAsBusiness(checked);
    setGeneralError('');
    if (checked) {
      setDBuildingNo(bBuildingNo);
      setDStreet(bStreet);
      setDArea(bArea);
      setDPincode(bPincode);
      setDCity(bCity);
      setDDistrict(bDistrict);
      setDState(bState);
      setIsDVerified(isBVerified);
      setDLocalities(bLocalities);
      setDError('');
    }
  };

  // Business PIN Verification handler (Populates city/state/localities from real postal data)
  const handleBPinChange = async (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setBPincode(val);
    setIsBVerified(false);
    setBError('');
    setGeneralError('');
    setBLocalities([]);

    if (val.length === 6) {
      if (!isValidIndianPincodeFormat(val)) {
        setBError('Invalid Indian PIN code format (cannot start with 0).');
        return;
      }
      setIsBVerifying(true);
      try {
        const res = await verifyIndianPincode(val);
        if (res.valid) {
          setIsBVerified(true);
          setBDistrict(res.district || '');
          setBState(res.state || '');
          // Populate city from verified district if city is empty
          if (!bCity.trim()) {
            setBCity(res.district || '');
          }
          if (res.localities?.length) {
            setBLocalities(res.localities);
            if (!bArea || !res.localities.includes(bArea)) {
              setBArea(res.localities[0]);
            }
          }
          if (sameAsBusiness) {
            setDDistrict(res.district || '');
            setDState(res.state || '');
            setDPincode(val);
            setIsDVerified(true);
            if (!dCity.trim()) setDCity(res.district || '');
          }
        } else {
          setIsBVerified(false);
          setBError(res.error || 'Postal location not found for this PIN code.');
        }
      } catch {
        setIsBVerified(false);
        setBError('Postal verification service unreachable.');
      } finally {
        setIsBVerifying(false);
      }
    }
  };

  // Dispatch PIN Verification handler
  const handleDPinChange = async (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setDPincode(val);
    setIsDVerified(false);
    setDError('');
    setGeneralError('');
    setDLocalities([]);

    if (val.length === 6) {
      if (!isValidIndianPincodeFormat(val)) {
        setDError('Invalid Indian PIN code format (cannot start with 0).');
        return;
      }
      setIsDVerifying(true);
      try {
        const res = await verifyIndianPincode(val);
        if (res.valid) {
          setIsDVerified(true);
          setDDistrict(res.district || '');
          setDState(res.state || '');
          if (!dCity.trim()) {
            setDCity(res.district || '');
          }
          if (res.localities?.length) {
            setDLocalities(res.localities);
            if (!dArea || !res.localities.includes(dArea)) {
              setDArea(res.localities[0]);
            }
          }
        } else {
          setIsDVerified(false);
          setDError(res.error || 'Postal location not found for this PIN code.');
        }
      } catch {
        setIsDVerified(false);
        setDError('Postal verification service unreachable.');
      } finally {
        setIsDVerifying(false);
      }
    }
  };

  // Form Submission & Validation Handler
  const handleSubmit = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    if (isSubmitting) return;

    setGeneralError('');
    setSuccessMessage('');

    // 1. Mandatory Identity Validations
    if (!sellerName.trim()) {
      setGeneralError('Please enter the Seller or Owner full name.');
      return;
    }
    if (!shopName.trim()) {
      setGeneralError('Please enter your Studio or Shop brand name.');
      return;
    }

    // 2. Compulsory Mobile Number Verification Check
    const phoneVal = validatePhoneNumber(countryCode, contactPhone);
    if (!phoneVal.valid) {
      setGeneralError(phoneVal.error);
      return;
    }
    if (!isPhoneVerified) {
      setGeneralError('Mobile number verification is compulsory. Please click "Send OTP" and verify your mobile number before saving.');
      return;
    }

    // 3. Business Address Validation
    if (!bPincode || bPincode.trim().length !== 6) {
      setGeneralError('Please enter a valid 6-digit Indian PIN code for your business.');
      return;
    }
    if (!isValidIndianPincodeFormat(bPincode.trim())) {
      setGeneralError('Invalid business PIN code format (cannot start with 0).');
      return;
    }

    // Ensure business PIN is verified with India Post
    let verifiedB = isBVerified;
    if (!verifiedB) {
      setIsBVerifying(true);
      try {
        const res = await verifyIndianPincode(bPincode.trim());
        if (res.valid) {
          verifiedB = true;
          setIsBVerified(true);
          setBDistrict(res.district || '');
          setBState(res.state || '');
          if (!bCity.trim()) setBCity(res.district || '');
        } else {
          setGeneralError(res.error || 'Business PIN code verification failed with India Post.');
          setIsBVerifying(false);
          return;
        }
      } catch {
        setGeneralError('Postal verification service unreachable. Please try again.');
        setIsBVerifying(false);
        return;
      } finally {
        setIsBVerifying(false);
      }
    }

    if (!bBuildingNo.trim()) {
      setGeneralError('Please enter building or flat number for your business address.');
      return;
    }
    if (!bStreet.trim()) {
      setGeneralError('Please enter street or commercial complex for your business address.');
      return;
    }
    if (!bArea.trim()) {
      setGeneralError('Please enter or select area/locality for your business address.');
      return;
    }
    if (!bCity.trim()) {
      setGeneralError('Please enter city for your business address.');
      return;
    }

    // 4. Dispatch Address Validation
    let verifiedD = isDVerified;
    if (!sameAsBusiness) {
      if (!dPincode || dPincode.trim().length !== 6) {
        setGeneralError('Please enter a valid 6-digit Indian PIN code for your dispatch location.');
        return;
      }
      if (!isValidIndianPincodeFormat(dPincode.trim())) {
        setGeneralError('Invalid dispatch PIN code format (cannot start with 0).');
        return;
      }

      if (!verifiedD) {
        setIsDVerifying(true);
        try {
          const res = await verifyIndianPincode(dPincode.trim());
          if (res.valid) {
            verifiedD = true;
            setIsDVerified(true);
            setDDistrict(res.district || '');
            setDState(res.state || '');
            if (!dCity.trim()) setDCity(res.district || '');
          } else {
            setGeneralError(res.error || 'Dispatch PIN code verification failed with India Post.');
            setIsDVerifying(false);
            return;
          }
        } catch {
          setGeneralError('Postal verification service unreachable. Please try again.');
          setIsDVerifying(false);
          return;
        } finally {
          setIsDVerifying(false);
        }
      }

      if (!dBuildingNo.trim()) {
        setGeneralError('Please enter building or unit number for your dispatch address.');
        return;
      }
      if (!dStreet.trim()) {
        setGeneralError('Please enter street or area for your dispatch address.');
        return;
      }
      if (!dArea.trim()) {
        setGeneralError('Please enter locality for your dispatch address.');
        return;
      }
      if (!dCity.trim()) {
        setGeneralError('Please enter city for your dispatch address.');
        return;
      }
    }

    // 5. Construct Payloads
    const businessPayload = {
      buildingNo: bBuildingNo.trim(),
      street: bStreet.trim(),
      area: bArea.trim(),
      city: bCity.trim(),
      district: bDistrict || bCity.trim(),
      state: bState || '',
      pincode: bPincode.trim(),
      isVerified: true
    };

    const dispatchPayload = sameAsBusiness
      ? { ...businessPayload }
      : {
          buildingNo: dBuildingNo.trim(),
          street: dStreet.trim(),
          area: dArea.trim(),
          city: dCity.trim(),
          district: dDistrict || dCity.trim(),
          state: dState || '',
          pincode: dPincode.trim(),
          isVerified: true
        };

    const fullPayload = {
      sellerName: sellerName.trim(),
      shopName: shopName.trim(),
      countryCode,
      contactPhone: contactPhone.trim(),
      isPhoneVerified: true,
      phoneVerifiedAt: phoneVerifiedAt || new Date().toISOString(),
      businessAddress: businessPayload,
      dispatchAddress: dispatchPayload,
      sameAsBusiness: Boolean(sameAsBusiness),
      isComplete: true
    };

    // 6. Execute Permanent Save to Supabase and structured store
    setIsSubmitting(true);

    try {
      const saveHandler = onSaveSellerAddress || updateSellerAddressData;
      if (typeof saveHandler === 'function') {
        await saveHandler(fullPayload);
      }

      // Update seller profile status in AuthContext
      if (typeof updateUserProfile === 'function') {
        updateUserProfile({
          name: sellerName.trim(),
          shopName: shopName.trim(),
          countryCode,
          phone: `${countryCode} ${contactPhone.trim()}`,
          isPhoneVerified: true,
          isAddressVerified: true,
          location: bState ? `${bCity.trim()}, ${bState}` : bCity.trim()
        });
      }

      // Display required exact confirmation message
      setSuccessMessage('Business & Dispatch Address Saved Successfully!');

      if (typeof onSuccess === 'function') {
        onSuccess(fullPayload);
      }

      // Smoothly close after displaying confirmation
      setTimeout(() => {
        setIsSubmitting(false);
        onClose();
      }, 1200);
    } catch (saveErr) {
      console.error('Failed to save seller address to database:', saveErr);
      setGeneralError('Database saving failed: ' + (saveErr.message || 'Please check your connection and try again.'));
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 400 }}>
      <div 
        className="seller-modal-dialog" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '660px', maxHeight: '92vh', overflowY: 'auto' }}
      >
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        <div style={{ marginBottom: 20 }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'var(--color-primary-light)',
            color: 'var(--color-primary)',
            padding: '3px 10px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.725rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '6px',
            border: '1px solid rgba(40, 116, 240, 0.25)'
          }}>
            <Store size={12} /> Compulsory Seller Compliance
          </span>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--color-text-primary)', margin: 0 }}>
            Business & Dispatch Address Setup
          </h2>
          <p style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)', margin: '4px 0 0' }}>
            Mobile verification via server OTP and postal PIN verification with India Post are mandatory before publishing products or enabling automated courier delivery calculations.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Section 1: Business Identity & Compulsory Mobile Verification */}
          <div style={{
            background: '#F8FAFC',
            border: isPhoneVerified ? '1px solid var(--color-success)' : '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            padding: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--color-text-primary)', margin: 0 }}>
                1. Business Contact & Mobile Verification
              </h3>
              {isPhoneVerified && (
                <span style={{ color: 'var(--color-success)', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <ShieldCheck size={14} /> Phone Verified
                </span>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="seller-form-label">Seller / Owner Name *</label>
                <input 
                  required
                  className="seller-form-input"
                  placeholder="Full legal or commercial name"
                  value={sellerName}
                  onChange={(e) => setSellerName(e.target.value)}
                />
              </div>
              <div>
                <label className="seller-form-label">Studio / Shop Name *</label>
                <input 
                  required
                  className="seller-form-input"
                  placeholder="Brand / Kitchen Studio name"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                />
              </div>
            </div>

            {/* Compulsory Mobile Number with Country Code Dropdown */}
            <div style={{ marginTop: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label className="seller-form-label" style={{ margin: 0 }}>
                  Contact Mobile Number * <span style={{ color: '#F87171', fontSize: '0.75rem' }}>(OTP Verification Compulsory)</span>
                </label>
                {isPhoneVerified && (
                  <span style={{ color: '#10B981', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <CheckCircle2 size={14} /> Mobile Number Verified Successfully
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}>
                {/* Mandatory Country Code Selector */}
                <select
                  className="seller-form-input"
                  style={{ width: '155px', flexShrink: 0, fontWeight: 700 }}
                  value={countryCode}
                  onChange={(e) => handleCountryCodeChange(e.target.value)}
                  disabled={isPhoneVerified}
                >
                  {SUPPORTED_COUNTRY_CODES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.label}
                    </option>
                  ))}
                </select>

                {/* Mobile Input */}
                <div style={{ position: 'relative', flex: 1 }}>
                  <input 
                    required
                    type="tel"
                    className="seller-form-input"
                    style={{ width: '100%' }}
                    placeholder={countryCode === '+91' ? '10-digit mobile (e.g. 9876543210)' : '10-digit phone (e.g. 4155552671)'}
                    maxLength={10}
                    value={contactPhone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    disabled={isPhoneVerified}
                  />
                </div>

                {/* Send OTP / Change Button */}
                {!isPhoneVerified ? (
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    style={{ whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    onClick={handleSendOtp}
                    disabled={isSendingOtp || resendCooldown > 0 || !contactPhone}
                  >
                    {isSendingOtp ? (
                      <>
                        <Loader2 size={14} className="spin" /> Sending...
                      </>
                    ) : (
                      <>
                        <Send size={14} />
                        {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : (otpSent ? 'Resend OTP' : 'Send OTP')}
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    style={{ whiteSpace: 'nowrap', fontSize: '0.75rem' }}
                    onClick={() => {
                      setIsPhoneVerified(false);
                      setOtpSent(false);
                      setPhoneSuccess('');
                    }}
                  >
                    Change
                  </button>
                )}
              </div>

              {/* OTP Input Field & Verification Button */}
              {otpSent && !isPhoneVerified && (
                <div style={{
                  marginTop: 10,
                  background: '#FFFFFF',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-primary)', fontWeight: 700 }}>
                      Enter Real 6-Digit SMS OTP
                    </span>
                    {otpTimeRemaining > 0 ? (
                      <span style={{ fontSize: '0.75rem', color: '#B45309', fontWeight: 600 }}>
                        Expires in {Math.floor(otpTimeRemaining / 60)}:{String(otpTimeRemaining % 60).padStart(2, '0')}
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-danger)', fontWeight: 600 }}>
                        OTP Expired
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <input 
                      type="text"
                      className="seller-form-input"
                      style={{ width: '160px', letterSpacing: '4px', fontWeight: 800, textAlign: 'center', fontSize: '1rem' }}
                      placeholder="••••••"
                      maxLength={6}
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    />
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                      onClick={handleVerifyOtp}
                      disabled={isVerifyingOtp || otpInput.trim().length !== 6}
                    >
                      {isVerifyingOtp ? (
                        <>
                          <Loader2 size={14} className="spin" /> Verifying...
                        </>
                      ) : (
                        <>
                          <ShieldCheck size={14} /> Verify OTP
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Phone Error Feedback */}
              {phoneError && (
                <div style={{ marginTop: 6, color: 'var(--color-danger)', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                  <AlertCircle size={14} /> {phoneError}
                </div>
              )}

              {/* Phone Success Feedback */}
              {phoneSuccess && (
                <div style={{ marginTop: 6, color: 'var(--color-success)', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700 }}>
                  <CheckCircle2 size={14} /> {phoneSuccess}
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Official Business Address (Initially empty - NO hardcoded Bengaluru) */}
          <div style={{
            background: '#F8FAFC',
            border: isBVerified ? '1px solid var(--color-success)' : bError ? '1px solid var(--color-danger)' : '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            padding: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--color-text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                <MapPin size={16} color="var(--color-primary)" /> 2. Official Business Address
              </h3>
              {isBVerified && (
                <span style={{ color: 'var(--color-success)', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <ShieldCheck size={14} /> PIN Code Verified
                </span>
              )}
            </div>

            {/* Business PIN */}
            <div style={{ marginBottom: 12 }}>
              <label className="seller-form-label">Business Postal PIN Code (6 Digits) *</label>
              <div style={{ display: 'flex', gap: 8, maxWidth: '240px' }}>
                <input 
                  required
                  className="seller-form-input"
                  style={{ fontSize: '1rem', fontWeight: 800, letterSpacing: '2px' }}
                  placeholder="6-digit PIN"
                  value={bPincode}
                  maxLength={6}
                  onChange={handleBPinChange}
                />
                {isBVerifying && <Loader2 size={18} className="spin" color="var(--color-primary)" />}
              </div>
              {bError && (
                <div style={{ marginTop: 6, color: 'var(--color-danger)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                  <AlertCircle size={14} /> {bError}
                </div>
              )}
              {isBVerified && (
                <div style={{ marginTop: 6, color: 'var(--color-success)', fontSize: '0.75rem', fontWeight: 600 }}>
                  Postal Region: <strong>{bDistrict}{bState ? `, ${bState}` : ''}</strong>
                </div>
              )}
            </div>

            {/* Locality Selector if multiple matches exist */}
            {bLocalities.length > 0 ? (
              <div style={{ marginBottom: 10 }}>
                <label className="seller-form-label">Locality / Post Office (India Post) *</label>
                <select 
                  className="seller-form-input" 
                  value={bArea} 
                  onChange={(e) => setBArea(e.target.value)}
                >
                  {bLocalities.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div style={{ marginBottom: 10 }}>
                <label className="seller-form-label">Area / Locality *</label>
                <input 
                  required
                  className="seller-form-input"
                  placeholder="Locality, sector, or post office"
                  value={bArea}
                  onChange={(e) => setBArea(e.target.value)}
                />
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10, marginBottom: 10 }}>
              <div>
                <label className="seller-form-label">Building / Flat No *</label>
                <input 
                  required
                  className="seller-form-input"
                  placeholder="No., building, or floor"
                  value={bBuildingNo}
                  onChange={(e) => setBBuildingNo(e.target.value)}
                />
              </div>
              <div>
                <label className="seller-form-label">Street / Commercial Complex *</label>
                <input 
                  required
                  className="seller-form-input"
                  placeholder="Street or complex name"
                  value={bStreet}
                  onChange={(e) => setBStreet(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label className="seller-form-label">City *</label>
                <input 
                  required
                  className="seller-form-input"
                  placeholder="City name"
                  value={bCity}
                  onChange={(e) => setBCity(e.target.value)}
                />
              </div>
              <div>
                <label className="seller-form-label">District / State</label>
                <input 
                  readOnly
                  className="seller-form-input"
                  style={{ background: '#F1F3F6', color: 'var(--color-text-primary)' }}
                  value={bDistrict && bState ? `${bDistrict}, ${bState}` : (bDistrict || bState || 'Auto-filled from PIN')}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Dispatch & Pickup Address */}
          <div style={{
            background: '#F8FAFC',
            border: !sameAsBusiness && isDVerified ? '1px solid var(--color-success)' : !sameAsBusiness && dError ? '1px solid var(--color-danger)' : '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            padding: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--color-text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Truck size={16} color="var(--color-success)" /> 3. Dispatch & Pickup Address
              </h3>
            </div>

            {/* Checkbox for same as business */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: sameAsBusiness ? 0 : 14 }}>
              <input 
                type="checkbox"
                id="sameAsBusinessCheck"
                checked={sameAsBusiness}
                onChange={(e) => handleToggleSameAsBusiness(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: 'var(--color-primary)', cursor: 'pointer' }}
              />
              <label htmlFor="sameAsBusinessCheck" style={{ fontSize: '0.85rem', color: 'var(--color-text-primary)', cursor: 'pointer', fontWeight: 600 }}>
                Same as business address (Kitchen studio & pickup warehouse are at the same location)
              </label>
            </div>

            {/* Separate dispatch address inputs if not same */}
            {!sameAsBusiness && (
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 14 }}>
                <div style={{ marginBottom: 12 }}>
                  <label className="seller-form-label">Dispatch Postal PIN Code (6 Digits) *</label>
                  <div style={{ display: 'flex', gap: 8, maxWidth: '240px' }}>
                    <input 
                      required={!sameAsBusiness}
                      className="seller-form-input"
                      style={{ fontSize: '1rem', fontWeight: 800, letterSpacing: '2px' }}
                      placeholder="6-digit PIN"
                      value={dPincode}
                      maxLength={6}
                      onChange={handleDPinChange}
                    />
                    {isDVerifying && <Loader2 size={18} className="spin" color="var(--color-primary)" />}
                  </div>
                  {dError && (
                    <div style={{ marginTop: 6, color: 'var(--color-danger)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                      <AlertCircle size={14} /> {dError}
                    </div>
                  )}
                  {isDVerified && (
                    <div style={{ marginTop: 6, color: 'var(--color-success)', fontSize: '0.75rem', fontWeight: 600 }}>
                      Dispatch Region: <strong>{dDistrict}{dState ? `, ${dState}` : ''}</strong>
                    </div>
                  )}
                  {dLocalities.length > 1 && (
                    <div style={{ marginTop: 8 }}>
                      <label className="seller-form-label" style={{ fontSize: '0.75rem' }}>Select Dispatch Locality:</label>
                      <select 
                        className="seller-form-input" 
                        value={dArea} 
                        onChange={(e) => setDArea(e.target.value)}
                        style={{ fontSize: '0.8rem', padding: '6px 10px' }}
                      >
                        {dLocalities.map((loc) => (
                          <option key={loc} value={loc}>{loc}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10, marginBottom: 10 }}>
                  <div>
                    <label className="seller-form-label">Building / Unit No *</label>
                    <input 
                      required={!sameAsBusiness}
                      className="seller-form-input"
                      placeholder="Unit or warehouse no."
                      value={dBuildingNo}
                      onChange={(e) => setDBuildingNo(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="seller-form-label">Street / Area *</label>
                    <input 
                      required={!sameAsBusiness}
                      className="seller-form-input"
                      placeholder="Street or industrial estate"
                      value={dStreet}
                      onChange={(e) => setDStreet(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label className="seller-form-label">City *</label>
                    <input 
                      required={!sameAsBusiness}
                      className="seller-form-input"
                      placeholder="Dispatch city"
                      value={dCity}
                      onChange={(e) => setDCity(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="seller-form-label">District / State</label>
                    <input 
                      readOnly
                      className="seller-form-input"
                      style={{ background: '#F1F3F6', color: 'var(--color-text-secondary)' }}
                      value={dDistrict && dState ? `${dDistrict}, ${dState}` : (dDistrict || dState || 'Auto-filled from PIN')}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Error Feedback Banner */}
          {generalError && (
            <div style={{
              background: 'var(--color-danger-bg)',
              border: '1px solid rgba(198, 40, 40, 0.4)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              color: 'var(--color-danger)',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <AlertCircle size={18} color="var(--color-danger)" style={{ flexShrink: 0 }} />
              <span>{generalError}</span>
            </div>
          )}

          {/* Success Feedback Banner */}
          {successMessage && (
            <div style={{
              background: 'var(--color-success-bg)',
              border: '1px solid var(--color-success)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px 16px',
              color: 'var(--color-success)',
              fontSize: '0.85rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <CheckCircle2 size={20} color="var(--color-success)" style={{ flexShrink: 0 }} />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'var(--color-primary)', color: '#FFFFFF', fontWeight: 700 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="spin" />
                  <span>Saving Address...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  <span>Save Verified Business & Dispatch Address</span>
                </>
              )}
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
