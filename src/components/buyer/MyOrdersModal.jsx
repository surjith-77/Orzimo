import React from 'react';
import {
  X,
  Package,
  Calendar,
  CheckCircle,
  Truck,
  ChefHat,
  ShoppingBag,
  MapPin
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { useAuth } from '../../context/AuthContext';

export default function MyOrdersModal({ isOpen, onClose }) {
  const { orders } = useMarketplace();
  const { currentUser } = useAuth();

  if (!isOpen) return null;

  // Filter orders for current logged-in buyer
  const userOrders = orders.filter(ord => {
    if (!currentUser) return true;
    return ord.buyerId === currentUser.id || ord.customer?.email === currentUser.email;
  });

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 300 }}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{
            background: 'var(--color-primary-light)',
            color: 'var(--color-primary)',
            padding: 8,
            borderRadius: 'var(--radius-md)'
          }}>
            <Package size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: 'var(--color-navy)' }}>
              My Pre-Bookings & Orders
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)', margin: 0 }}>
              Live status tracking and delivery slot confirmation for your creations
            </p>
          </div>
        </div>

        {userOrders.length === 0 ? (
          <div style={{ padding: '48px 20px', textAlign: 'center' }}>
            <ShoppingBag size={48} color="var(--gray-300)" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '1.1rem', marginBottom: 6, fontWeight: 700 }}>No orders placed yet</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginBottom: 20, maxWidth: 360, margin: '0 auto 20px' }}>
              You haven't placed any orders yet. Discover fresh cakes, personalized gifts, or artisan foods on the marketplace.
            </p>
            <button className="btn btn-primary" onClick={onClose}>
              Explore Marketplace
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxHeight: '65vh', overflowY: 'auto', paddingRight: 4 }}>
            {userOrders.map((ord) => {
              const firstItem = ord.items?.[0] || { name: 'Artisan Item', price: ord.totalAmount };
              const isPreparing = ord.status === 'Preparing' || ord.status === 'In Preparation';
              const isReady = ord.status === 'Ready' || ord.status === 'Ready for Delivery';
              const isCompleted = ord.status === 'Completed';

              return (
                <div
                  key={ord.id}
                  style={{
                    border: '1px solid var(--gray-200)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '16px',
                    background: '#FFFFFF',
                    boxShadow: 'var(--shadow-xs)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderBottom: '1px solid var(--gray-100)', paddingBottom: 10 }}>
                    <div>
                      <span style={{ fontWeight: 800, color: 'var(--color-primary)', fontSize: '0.9rem' }}>
                        #{ord.id}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginLeft: 8 }}>
                        {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'Recent'}
                      </span>
                    </div>

                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      padding: '3px 10px',
                      borderRadius: 'var(--radius-full)',
                      background: isCompleted ? '#ECFDF5' : isReady ? '#E0F2FE' : '#FFFBEB',
                      color: isCompleted ? '#059669' : isReady ? '#0284C7' : '#D97706',
                      border: `1px solid ${isCompleted ? '#A7F3D0' : isReady ? '#BAE6FD' : '#FDE68A'}`
                    }}>
                      {ord.status}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: 14 }}>
                    {firstItem.image && (
                      <img
                        src={firstItem.image}
                        alt={firstItem.name}
                        style={{ width: 64, height: 64, borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                      />
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-navy)', marginBottom: 4 }}>
                        {firstItem.name}
                      </div>

                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)', marginBottom: 4 }}>
                        {firstItem.weight && <span>{firstItem.weight} • </span>}
                        {firstItem.flavor && <span>{firstItem.flavor}</span>}
                      </div>

                      {firstItem.message && (
                        <div style={{
                          fontSize: '0.775rem',
                          background: 'var(--gray-50)',
                          borderLeft: '3px solid var(--color-primary)',
                          padding: '4px 8px',
                          borderRadius: '0 4px 4px 0',
                          color: 'var(--gray-700)',
                          margin: '6px 0'
                        }}>
                          Inscription: <strong>"{firstItem.message}"</strong>
                        </div>
                      )}

                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: '#059669', fontWeight: 700, marginTop: 4 }}>
                        <Calendar size={13} />
                        <span>Reserved Slot: {ord.slotDate}</span>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--color-navy)' }}>
                        ₹{(ord.totalAmount || 0).toLocaleString('en-IN')}
                      </div>
                      <span style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 600 }}>
                        {ord.paymentStatus}
                      </span>
                    </div>
                  </div>

                  {/* Delivery Location & Arrival Estimate Snapshot */}
                  {ord.shippingAddress && (
                    <div style={{
                      marginTop: 10,
                      background: 'var(--gray-50)',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.75rem',
                      color: 'var(--gray-600)',
                      flexWrap: 'wrap',
                      gap: 6
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <MapPin size={13} color="var(--color-primary)" />
                        <span>
                          Delivery to: <strong>{ord.shippingAddress.area || ord.shippingAddress.city} — {ord.shippingAddress.pincode}</strong> ({ord.shippingAddress.addressType || 'Home'})
                        </span>
                      </div>
                      {ord.deliveryEstimate?.formattedEstimate && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#059669', fontWeight: 700 }}>
                          <Truck size={13} />
                          <span>Est. Arrival: {ord.deliveryEstimate.formattedEstimate}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Progress tracker */}
                  <div style={{
                    marginTop: 14,
                    paddingTop: 10,
                    borderTop: '1px solid var(--gray-100)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.725rem',
                    color: 'var(--gray-500)'
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#059669', fontWeight: 600 }}>
                      <CheckCircle size={13} /> Order Placed
                    </span>
                    <span>→</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: isPreparing || isReady || isCompleted ? '#059669' : 'inherit', fontWeight: isPreparing ? 700 : 'normal' }}>
                      <ChefHat size={13} /> Preparing
                    </span>
                    <span>→</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: isReady || isCompleted ? '#059669' : 'inherit', fontWeight: isReady ? 700 : 'normal' }}>
                      <Truck size={13} /> Ready / Dispatched
                    </span>
                    <span>→</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: isCompleted ? '#059669' : 'inherit', fontWeight: isCompleted ? 700 : 'normal' }}>
                      <CheckCircle size={13} /> Delivered
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
