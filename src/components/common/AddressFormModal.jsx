import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  ShieldCheck, 
  AlertCircle, 
  Loader2, 
  Home, 
  Briefcase, 
  Building,
  CheckCircle2
} from 'lucide-react';
import { verifyIndianPincode, isValidIndianPincodeFormat } from '../../services/postalService';

export default function AddressFormModal({
  isOpen,
  onClose,
  onSaveAddress,
  initialData = null,
  title = "Add Delivery Address"
}) {
  const [fullName, setFullName] = useState(initialData?.fullName || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [houseNo, setHouseNo] = useState(initialData?.houseNo || '');
  const [street, setStreet] = useState(initialData?.street || '');
  const [area, setArea] = useState(initialData?.area || '');
  const [landmark, setLandmark] = useState(initialData?.landmark || '');
  const [pincode, setPincode] = useState(initialData?.pincode || '');
  const [city, setCity] = useState(initialData?.city || '');
  const [district, setDistrict] = useState(initialData?.district || '');
  const [state, setState] = useState(initialData?.state || '');
  const [addressType, setAddressType] = useState(initialData?.addressType || 'Home');
  const [isDefault, setIsDefault] = useState(initialData?.isDefault ?? false);

  // PIN verification state
  const [isVerifyingPin, setIsVerifyingPin] = useState(false);
  const [isPinVerified, setIsPinVerified] = useState(initialData?.isVerified ?? false);
  const [pinError, setPinError] = useState('');
  const [availableLocalities, setAvailableLocalities] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFullName(initialData.fullName || '');
      setPhone(initialData.phone || '');
      setHouseNo(initialData.houseNo || '');
      setStreet(initialData.street || '');
      setArea(initialData.area || '');
      setLandmark(initialData.landmark || '');
      setPincode(initialData.pincode || '');
      setCity(initialData.city || '');
      setDistrict(initialData.district || '');
      setState(initialData.state || '');
      setAddressType(initialData.addressType || 'Home');
      setIsDefault(initialData.isDefault ?? false);
      setIsPinVerified(Boolean(initialData.isVerified));
    }
  }, [initialData]);

  // Handle PIN code change & auto-lookup when 6 digits entered
  const handlePincodeChange = async (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setPincode(val);
    setIsPinVerified(false);
    setPinError('');
    setAvailableLocalities([]);

    if (val.length === 6) {
      if (!isValidIndianPincodeFormat(val)) {
        setPinError('Invalid Indian PIN code format (cannot begin with 0).');
        return;
      }

      setIsVerifyingPin(true);
      try {
        const res = await verifyIndianPincode(val);
        if (res.valid) {
          setIsPinVerified(true);
          setDistrict(res.district || '');
          setState(res.state || '');
          if (!city) setCity(res.district || '');

          if (res.localities && res.localities.length > 0) {
            setAvailableLocalities(res.localities);
            if (!area || !res.localities.includes(area)) {
              setArea(res.localities[0]);
            }
          }
        } else {
          setIsPinVerified(false);
          setPinError(res.error || 'PIN code could not be verified in postal directory.');
        }
      } catch (err) {
        setIsPinVerified(false);
        setPinError('Postal verification failed. Please try again.');
      } finally {
        setIsVerifyingPin(false);
      }
    }
  };

  const handleManualVerify = () => {
    if (pincode.length === 6) {
      handlePincodeChange({ target: { value: pincode } });
    } else {
      setPinError('Please enter a 6-digit Indian PIN code.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!isPinVerified) {
      setPinError('A verified 6-digit PIN code is required to save this address.');
      return;
    }

    if (!fullName.trim() || !phone.trim() || !houseNo.trim() || !street.trim() || !area.trim()) {
      alert('Please fill in all mandatory address fields.');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      ...(initialData?.id ? { id: initialData.id } : {}),
      fullName: fullName.trim(),
      phone: phone.trim(),
      houseNo: houseNo.trim(),
      street: street.trim(),
      area: area.trim(),
      landmark: landmark.trim(),
      pincode: pincode.trim(),
      city: city.trim() || district,
      district,
      state,
      addressType,
      isDefault,
      isVerified: true
    };

    onSaveAddress(payload);
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 400 }}>
      <div 
        className="modal-dialog" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto' }}
      >
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <div style={{
            background: 'var(--color-primary-light)',
            color: 'var(--color-primary)',
            padding: 8,
            borderRadius: 'var(--radius-md)'
          }}>
            <MapPin size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--color-navy)' }}>
              {title}
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)', margin: '2px 0 0' }}>
              India Post PIN code verification required for accurate delivery estimates
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Address Type Selector */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--gray-700)', display: 'block', marginBottom: 6 }}>
              Address Type
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
              {[
                { id: 'Home', icon: Home, label: 'Home' },
                { id: 'Work', icon: Briefcase, label: 'Work / Office' },
                { id: 'Other', icon: Building, label: 'Other' }
              ].map(type => {
                const Icon = type.icon;
                const isSelected = addressType === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setAddressType(type.id)}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--gray-300)',
                      background: isSelected ? 'var(--color-primary-light)' : '#FFFFFF',
                      color: isSelected ? 'var(--color-primary)' : 'var(--gray-600)',
                      cursor: 'pointer'
                    }}
                  >
                    <Icon size={14} />
                    {type.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Contact Details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--gray-700)' }}>
                Full Name *
              </label>
              <input 
                required
                className="form-input"
                style={{ marginTop: 4 }}
                placeholder="Receiver full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--gray-700)' }}>
                10-Digit Mobile Number *
              </label>
              <input 
                required
                type="tel"
                className="form-input"
                style={{ marginTop: 4 }}
                placeholder="e.g. 9845012345"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              />
            </div>
          </div>

          {/* PIN CODE INPUT & REAL VERIFICATION */}
          <div style={{
            background: 'var(--gray-50)',
            border: isPinVerified ? '1px solid #10B981' : pinError ? '1px solid #EF4444' : '1px solid var(--gray-300)',
            borderRadius: 'var(--radius-md)',
            padding: '14px',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label style={{ fontSize: '0.825rem', fontWeight: 800, color: 'var(--color-navy)' }}>
                Six-Digit Postal PIN Code *
              </label>
              {isPinVerified && (
                <span style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: 4, 
                  color: '#059669', 
                  fontSize: '0.75rem', 
                  fontWeight: 800,
                  background: '#ECFDF5',
                  padding: '2px 8px',
                  borderRadius: 4
                }}>
                  <ShieldCheck size={14} /> PIN Code Verified
                </span>
              )}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <input 
                required
                type="text"
                className="form-input"
                style={{
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  letterSpacing: '2px',
                  maxWidth: '180px'
                }}
                placeholder="e.g. 638701"
                value={pincode}
                onChange={handlePincodeChange}
                maxLength={6}
              />
              <button
                type="button"
                className="btn btn-outline"
                style={{ fontSize: '0.8rem', padding: '6px 14px' }}
                onClick={handleManualVerify}
                disabled={isVerifyingPin || pincode.length !== 6}
              >
                {isVerifyingPin ? (
                  <>
                    <Loader2 size={14} className="spin" /> Verifying...
                  </>
                ) : (
                  'Check PIN'
                )}
              </button>
            </div>

            {pinError && (
              <div style={{ 
                marginTop: 8, 
                color: '#DC2626', 
                fontSize: '0.775rem', 
                fontWeight: 600, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 6 
              }}>
                <AlertCircle size={14} />
                <span>{pinError}</span>
              </div>
            )}

            {isPinVerified && (
              <div style={{ marginTop: 8, fontSize: '0.775rem', color: '#047857', display: 'flex', gap: 12 }}>
                <span>District: <strong>{district}</strong></span>
                <span>State: <strong>{state}</strong></span>
              </div>
            )}
          </div>

          {/* Area / Locality Selector */}
          {availableLocalities.length > 0 ? (
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--gray-700)' }}>
                Select Post Office / Locality *
              </label>
              <select
                className="form-input"
                style={{ marginTop: 4, fontWeight: 600 }}
                value={area}
                onChange={(e) => setArea(e.target.value)}
              >
                {availableLocalities.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--gray-700)' }}>
                Area / Locality / Sector *
              </label>
              <input 
                required
                className="form-input"
                style={{ marginTop: 4 }}
                placeholder="e.g. Kangayam Town, Koramangala 4th Block"
                value={area}
                onChange={(e) => setArea(e.target.value)}
              />
            </div>
          )}

          {/* House No & Street */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--gray-700)' }}>
                Flat / House / Door *
              </label>
              <input 
                required
                className="form-input"
                style={{ marginTop: 4 }}
                placeholder="Flat 402, Door 12"
                value={houseNo}
                onChange={(e) => setHouseNo(e.target.value)}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--gray-700)' }}>
                Street / Road / Building *
              </label>
              <input 
                required
                className="form-input"
                style={{ marginTop: 4 }}
                placeholder="e.g. Trichy Main Road, 12th Main"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
              />
            </div>
          </div>

          {/* Landmark & City */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--gray-700)' }}>
                Landmark (Optional)
              </label>
              <input 
                className="form-input"
                style={{ marginTop: 4 }}
                placeholder="Near Government Hospital"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--gray-700)' }}>
                City / Town *
              </label>
              <input 
                required
                className="form-input"
                style={{ marginTop: 4 }}
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
          </div>

          {/* District & State (Read-only or auto-filled) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--gray-700)' }}>
                District
              </label>
              <input 
                readOnly
                className="form-input"
                style={{ marginTop: 4, background: '#F8FAFC', color: '#475569' }}
                value={district}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--gray-700)' }}>
                State
              </label>
              <input 
                readOnly
                className="form-input"
                style={{ marginTop: 4, background: '#F8FAFC', color: '#475569' }}
                value={state}
              />
            </div>
          </div>

          {/* Default Address Checkbox */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <input 
              type="checkbox"
              id="setAsDefault"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              style={{ width: 16, height: 16, accentColor: 'var(--color-primary)' }}
            />
            <label htmlFor="setAsDefault" style={{ fontSize: '0.825rem', color: 'var(--gray-700)', cursor: 'pointer' }}>
              Set as default delivery address for future orders
            </label>
          </div>

          {/* Submit Actions */}
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 1, padding: '12px' }}
              disabled={isSubmitting || !isPinVerified}
            >
              <CheckCircle2 size={16} />
              Save Verified Address
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

