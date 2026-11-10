import React from 'react';
import { 
  IndianRupee, 
  ShoppingBag, 
  Calendar, 
  Clock, 
  ArrowRight, 
  Plus, 
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Layers,
  ChefHat,
  Database
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { useAuth } from '../../context/AuthContext';

export default function SellerOverviewTab({ onNavigateTab, onOpenAddProduct, onOpenAddressSetup }) {
  const { orders, products, bookingRequests, isSellerAddressVerified } = useMarketplace();
  const { currentUser } = useAuth();

  // Compute real metrics from actual MarketplaceContext orders
  const totalOrdersCount = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'Pending' || o.status === 'Pending Confirmation');
  const completedOrders = orders.filter(o => o.status === 'Completed');
  const preparingOrders = orders.filter(o => o.status === 'Preparing' || o.status === 'In Preparation' || o.status === 'Accepted');
  const readyOrders = orders.filter(o => o.status === 'Ready' || o.status === 'Ready for Delivery');
  
  const totalRevenue = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);

  const pendingBookingsCount = bookingRequests.filter(b => b.status === 'Pending Review').length;
  const inStockProductsCount = products.filter(p => !p.isOutOfStock).length;

  return (
    <div>
      {/* Address Verification Alert Banner */}
      {!isSellerAddressVerified && (
        <div style={{
          background: 'var(--color-warning-bg)',
          border: '1px solid rgba(180, 83, 9, 0.4)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px 20px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertCircle size={22} color="#B45309" />
            <div>
              <div style={{ color: '#B45309', fontSize: '0.925rem', fontWeight: 800 }}>
                Mandatory Seller Address & PIN Verification Required
              </div>
              <div style={{ color: 'var(--color-text-primary)', fontSize: '0.825rem', marginTop: 2, fontWeight: 500 }}>
                Product publishing and delivery estimations require a verified 6-digit Indian PIN code for your business and dispatch location.
              </div>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-yellow btn-sm"
            onClick={onOpenAddressSetup}
          >
            Verify Address Now
          </button>
        </div>
      )}

      {/* Welcome Banner */}
      <div style={{ 
        background: '#FFFFFF',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px 28px',
        marginBottom: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
      }}>
        <div>
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
            marginBottom: '8px',
            border: '1px solid rgba(40, 116, 240, 0.25)'
          }}>
            Live Creator Studio • {currentUser?.shopName || 'Creator Studio'}
          </span>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--color-text-primary)', margin: 0 }}>
            Welcome back, {currentUser?.name || 'Creator'}!
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginTop: '6px', margin: 0 }}>
            You have <strong style={{ color: 'var(--color-text-primary)' }}>{pendingOrders.length} pending orders</strong> awaiting confirmation{readyOrders.length > 0 ? `, ${readyOrders.length} ready for dispatch,` : ''} and <strong style={{ color: 'var(--color-primary)' }}>{preparingOrders.length} orders in preparation</strong>.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button 
            className="btn btn-primary"
            onClick={onOpenAddProduct}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--color-primary)', color: '#FFFFFF', fontWeight: 700 }}
          >
            <Plus size={18} />
            Add New Creation
          </button>
          <button 
            className="btn btn-outline"
            onClick={() => onNavigateTab('orders')}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            View All Orders
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* =======================================================================
          TASK 3: 4 CORE STATS (Revenue, Total, Pending, Completed)
         ======================================================================= */}
      <div className="seller-stats-grid">
        {/* 1. Revenue */}
        <div className="seller-stat-card">
          <div className="seller-stat-header">
            <span className="seller-stat-title">Total Revenue</span>
            <div className="seller-stat-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981' }}>
              <IndianRupee size={20} />
            </div>
          </div>
          <div className="seller-stat-value">₹{totalRevenue.toLocaleString('en-IN')}</div>
          <div className="seller-stat-sub">
            From <span style={{ color: '#10B981', fontWeight: 700 }}>{totalOrdersCount - orders.filter(o => o.status === 'Cancelled').length}</span> fulfilled & active orders
          </div>
        </div>

        {/* 2. Total Orders */}
        <div className="seller-stat-card">
          <div className="seller-stat-header">
            <span className="seller-stat-title">Total Orders</span>
            <div className="seller-stat-icon-wrap" style={{ background: 'rgba(0, 102, 255, 0.15)', color: '#60A5FA' }}>
              <ShoppingBag size={20} />
            </div>
          </div>
          <div className="seller-stat-value">{totalOrdersCount}</div>
          <div className="seller-stat-sub">
            Pre-orders recorded in studio
          </div>
        </div>

        {/* 3. Pending Orders */}
        <div className="seller-stat-card">
          <div className="seller-stat-header">
            <span className="seller-stat-title">Pending Orders</span>
            <div className="seller-stat-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B' }}>
              <Clock size={20} />
            </div>
          </div>
          <div className="seller-stat-value" style={{ color: pendingOrders.length > 0 ? '#B45309' : 'var(--color-text-primary)' }}>
            {pendingOrders.length}
          </div>
          <div className="seller-stat-sub">
            {pendingOrders.length > 0 ? 'Requires your acceptance' : 'All orders accepted'}
          </div>
        </div>

        {/* 4. Completed Orders */}
        <div className="seller-stat-card">
          <div className="seller-stat-header">
            <span className="seller-stat-title">Completed Orders</span>
            <div className="seller-stat-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981' }}>
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="seller-stat-value">{completedOrders.length}</div>
          <div className="seller-stat-sub">
            Successfully delivered & paid
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts Banner */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px',
        marginBottom: '28px'
      }}>
        <div 
          onClick={() => onNavigateTab('bookings')}
          style={{
            background: '#FFFFFF',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            padding: '16px',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)'
          }}
          className="overview-quick-card"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <Calendar size={20} color="var(--color-primary)" />
            <span style={{ fontSize: '0.72rem', color: 'var(--color-primary)', fontWeight: 800 }}>
              {pendingBookingsCount} INQUIRIES
            </span>
          </div>
          <div style={{ fontWeight: 800, color: 'var(--color-text-primary)', fontSize: '0.95rem' }}>Bookings & Capacity</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: 2 }}>Manage slot dates and custom requests</div>
        </div>

        <div 
          onClick={() => onNavigateTab('inventory')}
          style={{
            background: '#FFFFFF',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            padding: '16px',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)'
          }}
          className="overview-quick-card"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <Layers size={20} color="var(--color-success)" />
            <span style={{ fontSize: '0.72rem', color: 'var(--color-success)', fontWeight: 800 }}>
              {inStockProductsCount} IN STOCK
            </span>
          </div>
          <div style={{ fontWeight: 800, color: 'var(--color-text-primary)', fontSize: '0.95rem' }}>Stock & Availability</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: 2 }}>Update batch limits & pause items</div>
        </div>

        <div 
          onClick={() => onNavigateTab('profile')}
          style={{
            background: '#FFFFFF',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            padding: '16px',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)'
          }}
          className="overview-quick-card"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <ChefHat size={20} color="#F59E0B" />
            <span style={{ fontSize: '0.72rem', color: 'var(--color-success)', fontWeight: 800 }}>
              VERIFIED
            </span>
          </div>
          <div style={{ fontWeight: 800, color: 'var(--color-text-primary)', fontSize: '0.95rem' }}>Business Profile</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: 2 }}>Kitchen address, FSSAI & UPI payouts</div>
        </div>
      </div>

      {/* Recent Orders Overview */}
      <div className="seller-panel" style={{ marginBottom: 24 }}>
        <div className="seller-panel-header">
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-text-primary)', margin: 0 }}>
              Active Pre-Bookings Workflow
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', margin: '2px 0 0' }}>
              Orders currently in confirmation, baking, or ready for dispatch
            </p>
          </div>

          <button 
            className="btn btn-outline btn-sm"
            onClick={() => onNavigateTab('orders')}
          >
            View All ({orders.length})
          </button>
        </div>

        <div style={{ padding: '16px 24px' }}>
          {orders.slice(0, 3).map((ord) => (
            <div key={ord.id} style={{
              background: '#FFFFFF',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              padding: '14px 18px',
              marginBottom: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontWeight: 800, color: 'var(--color-deep-blue)', fontSize: '0.9rem' }}>#{ord.id}</span>
                  <span style={{ fontWeight: 700, color: 'var(--color-text-primary)', fontSize: '0.875rem' }}>{ord.customer?.name}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', background: '#F1F3F6', padding: '2px 8px', borderRadius: 4, border: '1px solid var(--color-border)' }}>
                    {ord.slotDate}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: 4 }}>
                  {ord.items?.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                  {ord.items?.[0]?.message && (
                    <span style={{ color: 'var(--color-primary)', marginLeft: 8 }}>
                      • Inscription: "{ord.items[0].message}"
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontWeight: 800, color: 'var(--color-text-primary)' }}>₹{ord.totalAmount}</span>
                <span className={`status-badge ${
                  ord.status === 'Pending' || ord.status === 'Pending Confirmation' ? 'pending' :
                  ord.status === 'Accepted' ? 'accepted' :
                  ord.status === 'Preparing' || ord.status === 'In Preparation' ? 'baking' :
                  ord.status === 'Ready' || ord.status === 'Ready for Delivery' ? 'ready' : 'completed'
                }`}>
                  {ord.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transparent Storage & Backend Notice */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-sm)',
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        fontSize: '0.8rem',
        color: 'var(--color-text-secondary)'
      }}>
        <Database size={18} color="var(--color-primary)" style={{ flexShrink: 0 }} />
        <span>
          <strong style={{ color: 'var(--color-text-primary)' }}>Storage Status:</strong> All orders, product edits, inventory adjustments, and profile settings are securely persisted in your Supabase database.
        </span>
      </div>
    </div>
  );
}
