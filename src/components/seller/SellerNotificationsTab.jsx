import React, { useState } from 'react';
import { 
  Bell, 
  ShoppingBag, 
  Calendar, 
  IndianRupee, 
  Star, 
  Clock, 
  Trash2, 
  CheckCheck 
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';

export default function SellerNotificationsTab({ onNavigateTab }) {
  const { notifications, markNotificationRead, markAllNotificationsRead, clearNotification } = useMarketplace();
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'unread'

  const filteredNotifs = notifications.filter(n => {
    if (filterMode === 'unread') return !n.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type) => {
    switch (type) {
      case 'order':
        return <ShoppingBag size={18} color="var(--color-primary)" />;
      case 'booking':
        return <Calendar size={18} color="var(--color-primary)" />;
      case 'payment':
        return <IndianRupee size={18} color="var(--color-success)" />;
      case 'review':
        return <Star size={18} color="#B45309" />;
      default:
        return <Bell size={18} color="var(--color-text-secondary)" />;
    }
  };

  return (
    <div className="seller-panel">
      {/* Header */}
      <div className="seller-panel-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--color-text-primary)' }}>
              Notifications & Order Alerts
            </h2>
            {unreadCount > 0 && (
              <span style={{
                background: 'var(--color-primary)',
                color: '#FFFFFF',
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)'
              }}>
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', margin: '4px 0 0' }}>
            Real-time notifications for incoming orders, booking requests, and payout milestones
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            className="btn btn-outline"
            style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 6 }}
            onClick={markAllNotificationsRead}
          >
            <CheckCheck size={16} />
            Mark All as Read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div style={{ padding: '16px 24px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div className="seller-filter-tabs">
          <button
            className={`seller-filter-btn ${filterMode === 'all' ? 'active' : ''}`}
            onClick={() => setFilterMode('all')}
          >
            All Notifications ({notifications.length})
          </button>
          <button
            className={`seller-filter-btn ${filterMode === 'unread' ? 'active' : ''}`}
            onClick={() => setFilterMode('unread')}
          >
            Unread Alerts ({unreadCount})
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div style={{ padding: '24px' }}>
        {filteredNotifs.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            <Bell size={44} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
            <p style={{ fontSize: '0.95rem', fontWeight: 600 }}>No notifications found in this view.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filteredNotifs.map((notif) => (
              <div
                key={notif.id}
                style={{
                  background: notif.read ? '#FFFFFF' : '#EBF3FF',
                  border: `1px solid ${notif.read ? 'var(--color-border)' : 'var(--color-primary)'}`,
                  borderRadius: 'var(--radius-sm)',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 16,
                  transition: 'all var(--transition-fast)'
                }}
                onClick={() => {
                  if (!notif.read) markNotificationRead(notif.id);
                  if (onNavigateTab) {
                    if (notif.type === 'order') onNavigateTab('orders');
                    else if (notif.type === 'booking') onNavigateTab('bookings');
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: '#FFFFFF',
                    border: '1px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {getIcon(notif.type)}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '0.925rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                        {notif.title}
                      </span>
                      {!notif.read && (
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-primary)' }} />
                      )}
                    </div>
                    <p style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)', margin: '4px 0 6px', lineHeight: 1.5 }}>
                      {notif.message}
                    </p>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={11} /> {notif.time}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {!notif.read && (
                    <button
                      type="button"
                      className="btn btn-outline"
                      style={{ padding: '4px 10px', fontSize: '0.725rem' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        markNotificationRead(notif.id);
                      }}
                    >
                      Mark Read
                    </button>
                  )}

                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', padding: 4 }}
                    title="Dismiss notification"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearNotification(notif.id);
                    }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

