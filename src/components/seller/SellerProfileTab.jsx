import React, { useState } from 'react';
import { 
  Store, 
  ShieldCheck, 
  Save, 
  CheckCircle2, 
  MapPin, 
  Truck, 
  AlertCircle 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useMarketplace } from '../../context/MarketplaceContext';
import SellerAddressSetupModal from './SellerAddressSetupModal';

export default function SellerProfileTab({ onOpenAddressSetup }) {
  const { currentUser, updateUserProfile } = useAuth();
  const { 
    sellerSettings, 
    updateSellerSettings, 
    sellerAddress, 
    updateSellerAddressData, 
    isSellerAddressVerified 
  } = useMarketplace();

  const [shopName, setShopName] = useState(sellerSettings.shopName || currentUser?.shopName || '');
  const [logoUrl, setLogoUrl] = useState(sellerSettings.logoUrl || currentUser?.avatar || '');
  const [description, setDescription] = useState(sellerSettings.description || currentUser?.description || '');
  const [category, setCategory] = useState(sellerSettings.category || currentUser?.category || 'cakes-bakery');
  const [contactPhone, setContactPhone] = useState(sellerSettings.contactPhone || currentUser?.phone || '');
  const [contactEmail, setContactEmail] = useState(sellerSettings.contactEmail || currentUser?.email || '');
  const [whatsapp, setWhatsapp] = useState(sellerSettings.whatsapp || currentUser?.phone || '');
  const [fssai, setFssai] = useState(sellerSettings.fssaiNumber || '');
  const [payoutUpi, setPayoutUpi] = useState(sellerSettings.payoutUpi || '');
  const [isOpenForOrders, setIsOpenForOrders] = useState(sellerSettings.isOpenForOrders ?? true);

  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleOpenAddress = () => {
    if (onOpenAddressSetup) {
      onOpenAddressSetup();
    } else {
      setIsAddressModalOpen(true);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();

    const updated = {
      shopName,
      logoUrl,
      description,
      category,
      contactPhone,
      contactEmail,
      whatsapp,
      fssaiNumber: fssai,
      payoutUpi,
      isOpenForOrders
    };

    updateSellerSettings(updated);

    if (updateUserProfile) {
      updateUserProfile({
        shopName,
        avatar: logoUrl,
        description,
        category,
        phone: contactPhone,
        email: contactEmail,
        fssaiNumber: fssai,
        upiId: payoutUpi
      });
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="seller-panel">
      {/* Header */}
      <div className="seller-panel-header">
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--color-text-primary)' }}>
            Business Profile & Store Identity
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', margin: '4px 0 0' }}>
            Brand identity, certified business address, courier dispatch location, and payout settings
          </p>
        </div>

        {savedSuccess && (
          <span style={{ color: 'var(--color-success)', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckCircle2 size={16} /> Profile Details Saved!
          </span>
        )}
      </div>

      <form onSubmit={handleSave} style={{ padding: '24px', maxWidth: '820px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Verification Status */}
        <div style={{ 
          background: isSellerAddressVerified ? 'var(--color-success-bg)' : 'var(--color-danger-bg)', 
          border: isSellerAddressVerified ? '1px solid rgba(21, 128, 61, 0.3)' : '1px solid rgba(198, 40, 40, 0.3)', 
          borderRadius: 'var(--radius-sm)',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 14
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {isSellerAddressVerified ? (
              <ShieldCheck size={30} color="var(--color-success)" />
            ) : (
              <AlertCircle size={30} color="var(--color-danger)" />
            )}
            <div>
              <div style={{ fontWeight: 800, color: 'var(--color-text-primary)', fontSize: '0.925rem' }}>
                {isSellerAddressVerified ? 'Postal Address Verified' : 'Mandatory Address Verification Pending'}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: 2 }}>
                {isSellerAddressVerified
                  ? `Dispatch PIN: ${sellerAddress?.dispatchAddress?.pincode} (${sellerAddress?.dispatchAddress?.city || sellerAddress?.dispatchAddress?.district}, ${sellerAddress?.dispatchAddress?.state})`
                  : 'You must provide a verified business and dispatch PIN code before buyers can calculate shipping.'
                }
              </div>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleOpenAddress}
            style={{ fontWeight: 700 }}
          >
            {isSellerAddressVerified ? 'Update Postal Addresses' : 'Verify Address Now'}
          </button>
        </div>

        {/* 1. Brand Identity & Studio Name */}
        <div style={{ background: '#FFFFFF', padding: 20, borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-text-primary)', margin: 0 }}>
            1. Brand Identity
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label className="seller-form-label">Studio / Brand Name *</label>
              <input 
                required
                className="seller-form-input"
                placeholder="e.g. Amber Artisan Bakes"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
              />
            </div>
            <div>
              <label className="seller-form-label">Primary Craft Category</label>
              <select 
                className="seller-form-input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="cakes-bakery">Homemade Cakes & Bakery</option>
                <option value="handmade-gifts">Handmade Custom Gifts</option>
                <option value="personalized-products">Personalized Products</option>
                <option value="homemade-foods">Homemade Foods & Snacks</option>
                <option value="handmade-jewellery">Handmade Jewellery</option>
                <option value="candles-decor">Candles & Home Decor</option>
                <option value="clothing-tailoring">Clothing & Tailoring</option>
                <option value="art-crafts">Art & Crafts</option>
                <option value="party-decorations">Party Decorations</option>
                <option value="workshops-classes">Workshops & Classes</option>
              </select>
            </div>
          </div>

          <div>
            <label className="seller-form-label">Brand Logo / Profile Picture URL</label>
            <input 
              type="url"
              className="seller-form-input"
              placeholder="https://..."
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
            />
          </div>

          <div>
            <label className="seller-form-label">Studio Description & Bio</label>
            <textarea 
              rows={3}
              className="seller-form-input"
              placeholder="Tell buyers about your craft specialties, ingredients, and story..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        {/* 2. Official Business & Dispatch Address */}
        <div style={{ background: '#FFFFFF', padding: 20, borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <MapPin size={18} color="var(--color-primary)" /> 2. Official Business & Dispatch Locations
            </h3>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={handleOpenAddress}
            >
              Edit Address
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {/* Business Address Card */}
            <div style={{
              background: '#F8FAFC',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              padding: '14px'
            }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Store size={14} color="var(--color-primary)" /> Commercial Address
              </div>
              {sellerAddress?.businessAddress ? (
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-primary)', lineHeight: 1.5 }}>
                  <div>{sellerAddress.businessAddress.buildingNo}, {sellerAddress.businessAddress.street}</div>
                  <div>{sellerAddress.businessAddress.area}, {sellerAddress.businessAddress.city}</div>
                  <div>{sellerAddress.businessAddress.district}, {sellerAddress.businessAddress.state} — <strong>{sellerAddress.businessAddress.pincode}</strong></div>
                  <span style={{ color: 'var(--color-success)', fontWeight: 700, fontSize: '0.7rem', display: 'inline-block', marginTop: 4 }}>
                    ✓ India Post PIN Verified
                  </span>
                </div>
              ) : (
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                  Not configured yet.
                </div>
              )}
            </div>

            {/* Dispatch Address Card */}
            <div style={{
              background: '#F8FAFC',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              padding: '14px'
            }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Truck size={14} color="var(--color-success)" /> Courier Dispatch Location
              </div>
              {sellerAddress?.dispatchAddress ? (
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-primary)', lineHeight: 1.5 }}>
                  <div>{sellerAddress.dispatchAddress.buildingNo}, {sellerAddress.dispatchAddress.street}</div>
                  <div>{sellerAddress.dispatchAddress.area}, {sellerAddress.dispatchAddress.city}</div>
                  <div>{sellerAddress.dispatchAddress.district}, {sellerAddress.dispatchAddress.state} — <strong>{sellerAddress.dispatchAddress.pincode}</strong></div>
                  <span style={{ color: 'var(--color-success)', fontWeight: 700, fontSize: '0.7rem', display: 'inline-block', marginTop: 4 }}>
                    ✓ Dispatch PIN Verified
                  </span>
                </div>
              ) : (
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                  Not configured yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3. Direct Contact & Communication */}
        <div style={{ background: '#FFFFFF', padding: 20, borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-text-primary)', margin: 0 }}>
            3. Direct Customer Contact Channels
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label className="seller-form-label">Contact Phone</label>
              <input 
                className="seller-form-input" 
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
              />
            </div>
            <div>
              <label className="seller-form-label">WhatsApp Number</label>
              <input 
                className="seller-form-input" 
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="seller-form-label">Business Email</label>
            <input 
              type="email"
              className="seller-form-input" 
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
            />
          </div>
        </div>

        {/* 4. Licensing & Financial Payouts */}
        <div style={{ background: '#FFFFFF', padding: 20, borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-text-primary)', margin: 0 }}>
            4. Kitchen FSSAI & UPI Payouts
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label className="seller-form-label">14-Digit FSSAI Registration</label>
              <input 
                className="seller-form-input" 
                placeholder="e.g. 21223004000891"
                value={fssai}
                onChange={(e) => setFssai(e.target.value)}
              />
            </div>
            <div>
              <label className="seller-form-label">Daily Payout UPI ID</label>
              <input 
                className="seller-form-input" 
                placeholder="e.g. yourname@okhdfcbank"
                value={payoutUpi}
                onChange={(e) => setPayoutUpi(e.target.value)}
              />
            </div>
          </div>

          <div style={{ marginTop: 4 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'var(--color-text-primary)', fontSize: '0.85rem' }}>
              <input 
                type="checkbox"
                checked={isOpenForOrders}
                onChange={(e) => setIsOpenForOrders(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: 'var(--color-primary)', cursor: 'pointer' }}
              />
              <span>Accepting Pre-Orders Live (uncheck to pause incoming orders)</span>
            </label>
          </div>
        </div>

        {/* Submit */}
        <button type="submit" className="btn btn-primary btn-lg" style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 8, background: 'var(--color-primary)', color: '#FFFFFF', fontWeight: 700 }}>
          <Save size={18} />
          Save Business Profile
        </button>
      </form>

      {/* Address Setup Modal */}
      <SellerAddressSetupModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        sellerId={currentUser?.id}
        currentAddress={sellerAddress}
        onSaveSellerAddress={updateSellerAddressData}
        currentUser={currentUser}
      />
    </div>
  );
}
