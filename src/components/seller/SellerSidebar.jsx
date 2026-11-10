import React from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Cake,
  CalendarClock,
  Store,
  Layers,
  Bell,
  ArrowLeftRight,
  ExternalLink,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useMarketplace } from '../../context/MarketplaceContext';

export default function SellerSidebar({ activeTab, setActiveTab, onSwitchToBuyer, onLogout }) {
  const { currentUser } = useAuth();
  const { orders, products, bookingRequests, notifications } = useMarketplace();

  const activeOrdersCount = orders.filter(o => o.status !== 'Completed' && o.status !== 'Cancelled').length;
  const pendingBookingsCount = bookingRequests.filter(b => b.status === 'Pending Review').length;
  const unreadNotifsCount = notifications.filter(n => !n.read).length;
  const lowStockCount = products.filter(p => !p.isOutOfStock && (p.stockQuantity ?? 10) <= 3).length;

  const NAV_ITEMS = [
    { id: 'overview', label: 'Studio Overview', icon: LayoutDashboard },
    { id: 'orders', label: 'Order Management', icon: ShoppingBag, badge: activeOrdersCount },
    { id: 'products', label: 'My Creations', icon: Cake, badge: products.length },
    { id: 'bookings', label: 'Bookings & Slots', icon: CalendarClock, badge: pendingBookingsCount > 0 ? pendingBookingsCount : undefined },
    { id: 'inventory', label: 'Stock & Inventory', icon: Layers, badge: lowStockCount > 0 ? `${lowStockCount} low` : undefined },
    { id: 'profile', label: 'Business Profile', icon: Store },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotifsCount > 0 ? unreadNotifsCount : undefined },
  ];

  return (
    <aside className="seller-sidebar">
      {/* Brand Header */}
      <div className="seller-brand-header">
        <div className="brand-logo-mark" style={{ width: '38px', height: '38px' }}>
          <img src="/brand-logo.png" alt="Orzimo" className="brand-logo-img" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, letterSpacing: '1px', fontSize: '1.15rem', color: '#FFFFFF' }}>
              ORZIMO
            </span>
            <span style={{
              background: 'var(--color-yellow)',
              color: '#212121',
              fontSize: '0.62rem',
              fontWeight: 800,
              padding: '2px 6px',
              borderRadius: '4px'
            }}>
              STUDIO
            </span>
          </div>
          <div style={{ fontSize: '0.68rem', color: '#FFFFFF', opacity: 0.9, fontWeight: 600, maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {currentUser?.shopName || 'Creator Studio'}
          </div>
        </div>
      </div>

      {/* Nav Menu */}
      <ul className="seller-nav-menu">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <li key={item.id}>
              <button
                className={`seller-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon size={18} color={isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)'} />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="seller-nav-badge" style={{
                    background: item.id === 'notifications' ? 'var(--color-yellow)' :
                      item.id === 'inventory' ? '#B45309' : 'var(--color-primary)',
                    color: item.id === 'notifications' ? '#212121' : '#FFFFFF'
                  }}>
                    {item.badge}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {/* Footer Switcher & Logout */}
      <div className="seller-sidebar-footer" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button
          className="switch-to-buyer-btn"
          onClick={onSwitchToBuyer}
          title="Return to Buyer Storefront"
        >
          <ArrowLeftRight size={15} />
          <span>Buyer Storefront</span>
          <ExternalLink size={13} style={{ opacity: 0.7 }} />
        </button>

        <button
          className="switch-to-buyer-btn"
          style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#F87171', borderColor: 'rgba(239, 68, 68, 0.25)' }}
          onClick={onLogout}
          title="Sign out of Creator Studio"
        >
          <LogOut size={15} />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}
