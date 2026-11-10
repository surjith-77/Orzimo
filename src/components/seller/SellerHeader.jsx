import React from 'react';
import { 
  Bell, 
  Store, 
  Star, 
  CheckCircle, 
  LogOut, 
  ExternalLink, 
  Menu 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useMarketplace } from '../../context/MarketplaceContext';

export default function SellerHeader({ onSwitchToBuyer, onNavigateTab, onToggleMobileNav, onLogout }) {
  const { currentUser, logout } = useAuth();
  const { sellerSettings, updateSellerSettings, notifications } = useMarketplace();

  const unreadCount = notifications.filter(n => !n.read).length;

  const toggleStoreStatus = () => {
    updateSellerSettings({ isOpenForOrders: !sellerSettings.isOpenForOrders });
  };

  return (
    <header className="seller-topbar">
      {/* Left: Mobile Nav Toggle & Store Status Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {onToggleMobileNav && (
          <button 
            type="button"
            className="btn-icon mobile-menu-btn"
            style={{ color: 'var(--color-text-primary)', display: 'none' }}
            onClick={onToggleMobileNav}
            aria-label="Toggle navigation"
          >
            <Menu size={22} />
          </button>
        )}

        <button 
          className={`seller-status-pill ${sellerSettings.isOpenForOrders ? 'open' : 'closed'}`}
          onClick={toggleStoreStatus}
          title="Click to toggle pre-order acceptance"
        >
          <span style={{ 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%', 
            background: sellerSettings.isOpenForOrders ? 'var(--color-success)' : '#B45309',
            boxShadow: sellerSettings.isOpenForOrders ? '0 0 6px var(--color-success)' : 'none'
          }} />
          <span>{sellerSettings.isOpenForOrders ? 'Accepting Pre-Orders' : 'Kitchen Paused'}</span>
        </button>

        <span className="seller-lead-time-tag" style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
          Notice: <strong>{sellerSettings.leadTimeHours || 24}h advance</strong>
        </span>
      </div>

      {/* Right: Actions & Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Notification Bell with Badge */}
        <button
          type="button"
          className="btn-icon"
          style={{ 
            position: 'relative', 
            color: unreadCount > 0 ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            background: '#FFFFFF',
            border: '1px solid var(--color-border)',
            padding: '8px',
            borderRadius: 'var(--radius-sm)'
          }}
          title={`${unreadCount} Unread Notifications`}
          onClick={() => {
            if (onNavigateTab) onNavigateTab('notifications');
          }}
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute',
              top: -4,
              right: -4,
              background: 'var(--color-danger)',
              color: '#FFFFFF',
              fontSize: '0.65rem',
              fontWeight: 800,
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {unreadCount}
            </span>
          )}
        </button>

        {/* Preview Storefront CTA */}
        <button 
          onClick={onSwitchToBuyer}
          className="btn btn-outline"
          style={{ padding: '7px 12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 6 }}
          title="Preview what customers see on Orzimo"
        >
          <Store size={14} color="var(--color-primary)" />
          <span className="hide-mobile">Preview Store</span>
          <ExternalLink size={12} />
        </button>

        {/* Seller Profile Chip */}
        <div className="seller-profile-chip">
          <img 
            src={sellerSettings.logoUrl || currentUser?.avatar || "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=200&q=80"} 
            alt={currentUser?.name}
            className="seller-avatar-img"
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-text-primary)', maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {currentUser?.name || 'Seller'}
              </span>
              <span style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: 2, 
                fontSize: '0.675rem', 
                fontWeight: 700, 
                color: 'var(--color-success)' 
              }}>
                <CheckCircle size={11} /> {currentUser?.badge || 'Verified Creator'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', color: '#B45309' }}>
              <Star size={11} fill="#B45309" />
              <span>{currentUser?.reviewsCount ? `${currentUser.rating || '5.0'} (${currentUser.reviewsCount})` : 'New Creator'}</span>
            </div>
          </div>

          <button 
            onClick={onLogout || logout} 
            className="btn-icon" 
            style={{ color: 'var(--color-text-secondary)', marginLeft: 8 }}
            title="Log Out of Creator Studio"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
