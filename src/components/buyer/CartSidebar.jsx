import React from 'react';
import {
  ShoppingBag,
  MapPin,
  AlertCircle,
  Truck,
  Calendar,
  Trash2,
  ArrowRight
} from 'lucide-react';
import SidebarDrawer from '../common/SidebarDrawer';

export default function CartSidebar({
  isOpen,
  onClose,
  cart,
  cartItemCount,
  cartTotal,
  shipmentGroups,
  shipmentEstimates,
  deliveryLocation,
  hasUnserviceableItem,
  totalShippingFee,
  onUpdateQty,
  onRemoveFromCart,
  onOpenPincodeModal,
  onConfirmPreOrder
}) {
  // Header Extra: Deliver to PIN bar
  const headerExtra = (
    <div className="cart-delivery-destination-bar">
      <div className="cart-delivery-loc-info">
        <MapPin size={16} color="var(--color-primary)" />
        <div className="cart-delivery-loc-text">
          <span className="cart-delivery-label">Deliver to: </span>
          <strong className="cart-delivery-value">
            {deliveryLocation?.locality || deliveryLocation?.district || 'Bengaluru'} — {deliveryLocation?.pincode || '560001'}
          </strong>
        </div>
      </div>
      <button
        type="button"
        onClick={onOpenPincodeModal}
        className="cart-change-pin-btn"
      >
        Change PIN
      </button>
    </div>
  );

  // Footer: Price summary & checkout button
  const footer = cart.length > 0 ? (
    <div className="cart-sidebar-footer-content">
      <div className="cart-summary-row">
        <span>Subtotal</span>
        <span>₹{cartTotal.toLocaleString('en-IN')}</span>
      </div>
      <div className="cart-summary-row">
        <span>Creator Handling & Packaging</span>
        <span style={{ color: '#059669', fontWeight: 600 }}>FREE</span>
      </div>
      <div className="cart-summary-row">
        <span>Courier & Delivery Fees</span>
        <span style={{ color: totalShippingFee === 0 ? '#059669' : 'var(--color-navy)', fontWeight: 600 }}>
          {totalShippingFee === 0 ? 'FREE' : `₹${totalShippingFee}`}
        </span>
      </div>
      <div className="cart-total-row">
        <span>Total Amount</span>
        <span style={{ color: 'var(--color-primary)' }}>
          ₹{(cartTotal + totalShippingFee).toLocaleString('en-IN')}
        </span>
      </div>
      <button
        className="btn btn-primary"
        style={{
          width: '100%',
          padding: '14px',
          fontSize: '1rem',
          opacity: hasUnserviceableItem ? 0.6 : 1,
          cursor: hasUnserviceableItem ? 'not-allowed' : 'pointer'
        }}
        disabled={hasUnserviceableItem}
        onClick={onConfirmPreOrder}
      >
        {hasUnserviceableItem ? 'Resolve Unserviceable Items' : 'Confirm & Reserve Slot'}
        <ArrowRight size={18} />
      </button>
      <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '10px' }}>
        100% Encrypted UPI / Card Checkout via Razorpay
      </div>
    </div>
  ) : null;

  return (
    <SidebarDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Your Pre-Order Cart"
      subtitle={cartItemCount > 0 ? `${cartItemCount} item${cartItemCount === 1 ? '' : 's'} selected` : 'Review your order items'}
      icon={<ShoppingBag size={20} color="var(--color-yellow)" />}
      badge={cartItemCount > 0 ? `(${cartItemCount})` : null}
      headerExtra={headerExtra}
      footer={footer}
      ariaLabel="Pre-Order Cart Sidebar"
    >
      {cart.length === 0 ? (
        <div style={{ padding: '60px 24px', textAlign: 'center' }}>
          <ShoppingBag size={48} color="var(--gray-300)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Your cart is empty</h3>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginBottom: '20px' }}>
            Explore bespoke creations, freshly baked cakes, and artisan gifts.
          </p>
          <button
            className="btn btn-primary"
            onClick={onClose}
          >
            Start Exploring
          </button>
        </div>
      ) : (
        <div className="cart-items-list" style={{ padding: '4px 0 16px' }}>
          {hasUnserviceableItem && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              padding: '12px 14px',
              margin: '0 0 12px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px'
            }}>
              <AlertCircle size={18} color="#EF4444" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontSize: '0.825rem', fontWeight: 800, color: '#B91C1C' }}>
                  Delivery Unserviceable for PIN {deliveryLocation?.pincode}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: 2, lineHeight: 1.4 }}>
                  Fresh cakes and bakes require local courier delivery within the creator's district. Please remove unserviceable items or update your delivery PIN.
                </div>
              </div>
            </div>
          )}

          {shipmentGroups.map((group, groupIdx) => (
            <div key={group.sellerKey} style={{
              marginBottom: '12px',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              overflow: 'hidden',
              background: '#FFFFFF'
            }}>
              {/* Shipment Group Header */}
              <div style={{
                background: '#F8FAFC',
                padding: '10px 14px',
                borderBottom: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.78rem'
              }}>
                <div>
                  <div style={{ fontWeight: 800, color: 'var(--color-navy)' }}>
                    Shipment {groupIdx + 1}: {group.sellerName}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748B' }}>
                    Ships from: {group.sellerDispatchCity} ({group.sellerDispatchPin})
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ 
                    fontWeight: 700, 
                    color: group.isFreeShipping ? '#059669' : '#334155' 
                  }}>
                    {group.isFreeShipping ? 'FREE Shipping' : `Shipping: ₹${group.shippingFee}`}
                  </span>
                  <div style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 600 }}>
                    ETD: {group.formattedEstimate}
                  </div>
                </div>
              </div>

              {/* Items in this Shipment */}
              {group.items.map((item) => {
                const itemEst = shipmentEstimates[item.key];
                const isServiceable = itemEst ? itemEst.serviceable : true;

                return (
                  <div key={item.key} className="cart-item-card" style={{ borderBottom: '1px solid #F1F5F9', margin: 0, borderRadius: 0 }}>
                    <img src={item.image} alt={item.name} className="cart-item-img" />
                    <div className="cart-item-details">
                      <div className="cart-item-title">{item.name}</div>
                      
                      {(item.weight || item.flavor) && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-primary)', marginBottom: '4px' }}>
                          {item.weight && <span>{item.weight} </span>}
                          {item.flavor && <span>• {item.flavor}</span>}
                        </div>
                      )}

                      {/* Serviceability & ETA Indicator */}
                      {!isServiceable ? (
                        <div style={{ 
                          fontSize: '0.72rem', 
                          color: '#DC2626', 
                          background: '#FEF2F2', 
                          padding: '2px 6px', 
                          borderRadius: 4, 
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          marginBottom: 6,
                          fontWeight: 700
                        }}>
                          <AlertCircle size={12} /> Unserviceable to PIN {deliveryLocation?.pincode}
                        </div>
                      ) : (
                        <div style={{ 
                          fontSize: '0.72rem', 
                          color: '#059669', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 4, 
                          marginBottom: 6 
                        }}>
                          <Truck size={12} /> {itemEst?.formattedEstimate ? `Arrives by: ${itemEst.formattedEstimate}` : 'Serviceable'}
                        </div>
                      )}

                      {item.slotDate && (
                        <div style={{ fontSize: '0.72rem', color: '#475569', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                          <Calendar size={12} /> Target Slot: {item.slotDate}
                        </div>
                      )}

                      {item.message && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-navy)', background: '#F1F5F9', padding: '4px 8px', borderRadius: 4, marginBottom: 8 }}>
                          Msg: "{item.message}"
                        </div>
                      )}

                      <div className="cart-item-price-row">
                        <span style={{ fontWeight: 800, color: 'var(--color-navy)' }}>
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div className="cart-qty-controls">
                            <button className="qty-btn" onClick={() => onUpdateQty(item.key, -1)}>-</button>
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, padding: '0 6px' }}>{item.quantity}</span>
                            <button className="qty-btn" onClick={() => onUpdateQty(item.key, 1)}>+</button>
                          </div>
                          <button 
                            onClick={() => onRemoveFromCart(item.key)}
                            className="btn-icon"
                            style={{ color: '#EF4444' }}
                            title="Remove item"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </SidebarDrawer>
  );
}

