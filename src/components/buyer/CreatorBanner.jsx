import React from 'react';
import { Store, ArrowRight, Sparkles, CheckCircle } from 'lucide-react';

export default function CreatorBanner({ onOpenSellerModal }) {
  return (
    <section className="container" aria-label="Creator Onboarding Callout">
      <div className="creator-banner-strip">
        <div className="creator-banner-content">
          <span style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: 6, 
            background: 'var(--color-yellow)', 
            color: '#212121',
            padding: '4px 12px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.75rem',
            fontWeight: 800,
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            marginBottom: 12
          }}>
            Join 1,200+ Indian Home Makers & Artisans
          </span>
          <h3>Are You a Home Baker, Crafter, or Local Creator?</h3>
          <p>
            Grow your business with Orzimo! Get your own dedicated storefront, manage custom pre-booking delivery slots, receive direct payments, and reach customers looking for unique handmade items in your city.
          </p>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 20 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}>
              <CheckCircle size={16} color="var(--color-yellow)" /> Zero Listing Fees
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}>
              <CheckCircle size={16} color="var(--color-yellow)" /> Dedicated Pre-Booking Calendar
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}>
              <CheckCircle size={16} color="var(--color-yellow)" /> Same-Day Local Pickup & Delivery
            </span>
          </div>
          <button 
            type="button" 
            className="btn btn-yellow btn-lg"
            onClick={onOpenSellerModal}
          >
            <Store size={20} />
            Start Selling on Orzimo
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
