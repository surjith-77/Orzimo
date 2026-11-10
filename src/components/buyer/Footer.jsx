import { 
  ShieldCheck, 
  Truck, 
  Clock, 
  Sparkles, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Share2, 
  MessageCircle, 
  Send 
} from 'lucide-react';

export default function Footer({ onSelectCategory, onOpenSellerModal }) {
  return (
    <footer className="site-footer" id="support">
      {/* Footer Top Trust Strip */}
      <div className="footer-top-strip">
        <div className="container">
          <div className="footer-trust-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '24px',
            padding: '24px 0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div className="footer-trust-icon">
                <Clock size={20} />
              </div>
              <div>
                <div className="footer-trust-title">Guaranteed Slot Delivery</div>
                <div className="footer-trust-desc">Reserve exact date & time for fresh delivery</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div className="footer-trust-icon">
                <Sparkles size={20} />
              </div>
              <div>
                <div className="footer-trust-title">100% Verified Creators</div>
                <div className="footer-trust-desc">Vetted local home bakers and artisan makers</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div className="footer-trust-icon">
                <Truck size={20} />
              </div>
              <div>
                <div className="footer-trust-title">Direct Local Pickup & Delivery</div>
                <div className="footer-trust-desc">Support neighborhood craftspeople directly</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div className="footer-trust-icon">
                <ShieldCheck size={20} />
              </div>
              <div>
                <div className="footer-trust-title">Buyer Protection Guaranteed</div>
                <div className="footer-trust-desc">100% secure escrow checkout & UPI</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Columns */}
      <div className="container">
        <div className="footer-columns-grid">
          {/* Brand Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div className="brand-logo-mark" style={{ width: '40px', height: '40px' }}>
                <img 
                  src="/brand-logo.png" 
                  alt="ORZIMO Logo" 
                  className="brand-logo-img"
                />
              </div>
              <div>
                <div className="brand-name" style={{ fontSize: '1.4rem' }}>ORZIMO</div>
                <div className="brand-tagline" style={{ fontSize: '0.62rem' }}>CREATOR MARKETPLACE</div>
              </div>
            </div>
            <p className="footer-about-text">
              India's premier pre-booking marketplace connecting passionate home bakers, handcrafted artisans, and custom creators directly with buyers across the country.
            </p>
            <div className="footer-contact-item">
              <Mail size={16} color="var(--color-yellow)" />
              <span>support@orzimo.in</span>
            </div>
            <div className="footer-contact-item">
              <Phone size={16} color="var(--color-yellow)" />
              <span>+91 80 4719 3200</span>
            </div>
            <div className="footer-contact-item">
              <MapPin size={16} color="var(--color-yellow)" />
              <span>Bengaluru, Karnataka, India</span>
            </div>
          </div>

          {/* Popular Categories */}
          <div>
            <h4 className="footer-col-title">Popular Categories</h4>
            <ul className="footer-links-list">
              <li className="footer-link-item" onClick={() => onSelectCategory('cakes-bakery')}>Custom Truffle Cakes</li>
              <li className="footer-link-item" onClick={() => onSelectCategory('handmade-gifts')}>Handmade Photo Frames</li>
              <li className="footer-link-item" onClick={() => onSelectCategory('scented-candles')}>Soy Aromatherapy Candles</li>
              <li className="footer-link-item" onClick={() => onSelectCategory('handmade-jewellery')}>Terracotta & Resin Jewellery</li>
              <li className="footer-link-item" onClick={() => onSelectCategory('traditional-sweets')}>Festive Sweet Hampers</li>
              <li className="footer-link-item" onClick={() => onSelectCategory('artisan-crafts')}>Hand-poured Resin Trays</li>
            </ul>
          </div>

          {/* For Creators */}
          <div>
            <h4 className="footer-col-title">For Creators & Sellers</h4>
            <ul className="footer-links-list">
              <li className="footer-link-item" onClick={onOpenSellerModal}>Sell on Orzimo</li>
              <li className="footer-link-item" onClick={onOpenSellerModal}>Creator Onboarding Guide</li>
              <li className="footer-link-item" onClick={onOpenSellerModal}>Pre-Booking Calendar Tool</li>
              <li className="footer-link-item" onClick={onOpenSellerModal}>Zero Commission Offers</li>
              <li className="footer-link-item" onClick={onOpenSellerModal}>Packaging & Delivery Tips</li>
              <li className="footer-link-item" onClick={onOpenSellerModal}>Seller Success Stories</li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="footer-col-title">Customer Support</h4>
            <ul className="footer-links-list">
              <li className="footer-link-item">Track Your Pre-Order</li>
              <li className="footer-link-item">Cancellation & Refund Policy</li>
              <li className="footer-link-item">Delivery Slot Timings</li>
              <li className="footer-link-item">Payment Methods & UPI</li>
              <li className="footer-link-item">Safety & Food Standards</li>
              <li className="footer-link-item">Help Center & FAQ</li>
            </ul>
          </div>

          {/* Legal & App */}
          <div>
            <h4 className="footer-col-title">Stay Connected</h4>
            <p style={{ fontSize: '0.85rem', color: '#F1F3F6', marginBottom: '14px', lineHeight: 1.5, opacity: 0.9 }}>
              Follow our community of 1,200+ local home creators sharing behind-the-scenes stories.
            </p>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <a href="#instagram" className="btn btn-outline" style={{ padding: '8px', borderRadius: '50%' }} aria-label="Website">
                <Globe size={16} />
              </a>
              <a href="#facebook" className="btn btn-outline" style={{ padding: '8px', borderRadius: '50%' }} aria-label="Share">
                <Share2 size={16} />
              </a>
              <a href="#community" className="btn btn-outline" style={{ padding: '8px', borderRadius: '50%' }} aria-label="Chat">
                <MessageCircle size={16} />
              </a>
              <a href="#telegram" className="btn btn-outline" style={{ padding: '8px', borderRadius: '50%' }} aria-label="Newsletter">
                <Send size={16} />
              </a>
            </div>
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.1)', 
              border: '1px solid rgba(255, 255, 255, 0.2)', 
              padding: '10px 14px', 
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.75rem',
              color: '#FFFFFF'
            }}>
              Official Portal: <strong style={{ color: 'var(--color-yellow)' }}>orzimo.in</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom Strip */}
      <div className="footer-bottom-strip">
        <div className="container">
          <div className="footer-bottom-content">
            <p style={{ margin: 0 }}>
              &copy; {new Date().getFullYear()} ORZIMO Technologies Private Limited. All rights reserved.
            </p>
            <div style={{ display: 'flex', gap: '18px', fontSize: '0.8rem' }}>
              <a href="#terms" style={{ color: 'var(--gray-400)' }}>Terms of Service</a>
              <a href="#privacy" style={{ color: 'var(--gray-400)' }}>Privacy Policy</a>
              <a href="#security" style={{ color: 'var(--gray-400)' }}>Trust & Safety</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
