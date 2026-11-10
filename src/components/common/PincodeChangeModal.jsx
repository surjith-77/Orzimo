import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  ShieldCheck, 
  AlertCircle, 
  Loader2, 
  Plus 
} from 'lucide-react';
import { verifyIndianPincode, isValidIndianPincodeFormat } from '../../services/postalService';

export default function PincodeChangeModal({
  isOpen,
  onClose,
  currentLocation,
  onLocationChanged,
  savedAddresses = [],
  onOpenAddAddressModal
}) {
  const [pinInput, setPinInput] = useState(currentLocation?.pincode || '');
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [lookupResult, setLookupResult] = useState(null);

  if (!isOpen) return null;

  const handleVerify = async (e) => {
    e?.preventDefault();
    setErrorMsg('');
    setLookupResult(null);

    const cleanPin = pinInput.trim();
    if (!isValidIndianPincodeFormat(cleanPin)) {
      setErrorMsg('Please enter a valid 6-digit Indian postal PIN code.');
      return;
    }

    setIsVerifying(true);
    try {
      const res = await verifyIndianPincode(cleanPin);
      if (res.valid) {
        setLookupResult(res);
      } else {
        setErrorMsg(res.error || 'Invalid PIN code. No postal region found.');
      }
    } catch {
      setErrorMsg('Could not verify PIN code right now. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleApplyLookup = () => {
    if (!lookupResult) return;
    onLocationChanged({
      pincode: lookupResult.pincode,
      locality: lookupResult.localities?.[0] || lookupResult.district,
      district: lookupResult.district,
      state: lookupResult.state,
      isVerified: true
    });
    onClose();
  };

  const handleSelectSavedAddress = (addr) => {
    onLocationChanged({
      pincode: addr.pincode,
      locality: addr.area || addr.city || addr.district,
      district: addr.district,
      state: addr.state,
      addressId: addr.id,
      isVerified: true
    });
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 400 }}>
      <div 
        className="modal-dialog" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '480px' }}
      >
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
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
              Choose Delivery Location
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)', margin: '2px 0 0' }}>
              Enter your Indian PIN code to check seller serviceability and delivery dates
            </p>
          </div>
        </div>

        {/* Enter new PIN code form */}
        <form onSubmit={handleVerify} style={{ marginBottom: 20 }}>
          <label style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--gray-700)', display: 'block', marginBottom: 6 }}>
            Enter 6-Digit Indian PIN Code
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input 
              type="text"
              className="form-input"
              style={{
                fontSize: '1rem',
                fontWeight: 800,
                letterSpacing: '2px'
              }}
              placeholder="e.g. 638701"
              value={pinInput}
              maxLength={6}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                setPinInput(val);
                setErrorMsg('');
                setLookupResult(null);
              }}
            />
            <button
              type="submit"
              className="btn btn-primary"
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              disabled={isVerifying || pinInput.length !== 6}
            >
              {isVerifying ? <Loader2 size={16} className="spin" /> : 'Verify PIN'}
            </button>
          </div>

          {errorMsg && (
            <div style={{
              marginTop: 8,
              color: '#DC2626',
              fontSize: '0.78rem',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}>
              <AlertCircle size={14} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Verified Result Card */}
          {lookupResult && (
            <div style={{
              marginTop: 12,
              background: '#ECFDF5',
              border: '1px solid #A7F3D0',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#059669', fontWeight: 800, fontSize: '0.85rem' }}>
                  <ShieldCheck size={16} />
                  <span>Verified: {lookupResult.pincode}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#065F46', marginTop: 2 }}>
                  {lookupResult.localities?.[0] || lookupResult.district}, {lookupResult.district}, {lookupResult.state}
                </div>
              </div>
              <button
                type="button"
                className="btn btn-primary"
                style={{ padding: '6px 14px', fontSize: '0.8rem', fontWeight: 700 }}
                onClick={handleApplyLookup}
              >
                Apply Location
              </button>
            </div>
          )}
        </form>

        {/* Saved Addresses Section (if user has any) */}
        {savedAddresses.length > 0 && (
          <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--gray-600)', textTransform: 'uppercase' }}>
                Your Saved Delivery Addresses
              </span>
              {onOpenAddAddressModal && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAddAddressModal();
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-primary)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  <Plus size={14} /> Add New
                </button>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: '200px', overflowY: 'auto' }}>
              {savedAddresses.map((addr) => {
                const isCurrent = currentLocation?.pincode === addr.pincode && 
                  (!currentLocation?.addressId || currentLocation.addressId === addr.id);

                return (
                  <div
                    key={addr.id}
                    onClick={() => handleSelectSavedAddress(addr)}
                    style={{
                      border: isCurrent ? '2px solid var(--color-primary)' : '1px solid var(--gray-200)',
                      background: isCurrent ? 'var(--color-primary-light)' : '#FFFFFF',
                      borderRadius: 'var(--radius-md)',
                      padding: '10px 14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'border var(--transition-fast)'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          padding: '1px 6px',
                          borderRadius: 4,
                          background: addr.addressType === 'Work' ? '#E0F2FE' : '#F1F5F9',
                          color: addr.addressType === 'Work' ? '#0284C7' : 'var(--color-navy)'
                        }}>
                          {addr.addressType}
                        </span>
                        <strong style={{ fontSize: '0.85rem', color: 'var(--color-navy)' }}>
                          {addr.fullName}
                        </strong>
                        {addr.isDefault && (
                          <span style={{ fontSize: '0.675rem', color: '#059669', fontWeight: 700 }}>
                            (Default)
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--gray-600)', marginTop: 2 }}>
                        {addr.houseNo}, {addr.street}, {addr.area}, {addr.city} — <strong>{addr.pincode}</strong>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn btn-outline"
                      style={{ padding: '4px 10px', fontSize: '0.75rem', flexShrink: 0 }}
                    >
                      {isCurrent ? 'Selected' : 'Deliver Here'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

