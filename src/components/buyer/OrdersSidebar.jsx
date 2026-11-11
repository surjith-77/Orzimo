import React, { useState } from 'react';
import {
  Package,
  Calendar,
  CheckCircle,
  Clock,
  Truck,
  ChefHat,
  ChevronDown,
  ChevronUp,
  MapPin,
  AlertCircle,
  XCircle,
  ShoppingBag,
  ArrowRight
} from 'lucide-react';
import SidebarDrawer from '../common/SidebarDrawer';
import { useMarketplace } from '../../context/MarketplaceContext';
import { useAuth } from '../../context/AuthContext';

/**
 * Normalizes and styles existing order statuses:
 * - Pending / Pending Confirmation
 * - Confirmed / Accepted
 * - Processing / Preparing / In Preparation
 * - Shipped / Ready / Ready for Delivery
 * - Delivered / Completed
 * - Cancelled
 */
function getStatusConfig(status = '') {
  const s = status.toLowerCase();
  if (s.includes('cancel')) {
    return {
      label: 'Cancelled',
      className: 'status-pill-cancelled',
      icon: <XCircle size={13} />,
      step: 0
    };
  }
  if (s.includes('complete') || s.includes('deliver')) {
    return {
      label: 'Delivered',
      className: 'status-pill-delivered',
      icon: <CheckCircle size={13} />,
      step: 4
    };
  }
  if (s.includes('ready') || s.includes('ship') || s.includes('dispatch')) {
    return {
      label: 'Shipped',
      className: 'status-pill-shipped',
      icon: <Truck size={13} />,
      step: 3
    };
  }
  if (s.includes('prep') || s.includes('process')) {
    return {
      label: 'Processing',
      className: 'status-pill-processing',
      icon: <ChefHat size={13} />,
      step: 2
    };
  }
  if (s.includes('accept') || s.includes('confirm')) {
    return {
      label: 'Confirmed',
      className: 'status-pill-confirmed',
      icon: <CheckCircle size={13} />,
      step: 1
    };
  }
  // Default to Pending
  return {
    label: 'Pending',
    className: 'status-pill-pending',
    icon: <Clock size={13} />,
    step: 1
  };
}

export default function OrdersSidebar({ isOpen, onClose }) {
  const { orders } = useMarketplace();
  const { currentUser } = useAuth();

  // Active expanded panels for individual orders
  const [expandedDetails, setExpandedDetails] = useState({});
  const [expandedTracking, setExpandedTracking] = useState({});

  const toggleDetails = (orderId) => {
    setExpandedDetails(prev => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  const toggleTracking = (orderId) => {
    setExpandedTracking(prev => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  // Filter orders for authenticated buyer
  const userOrders = (orders || []).filter(ord => {
    if (!currentUser) return true;
    return ord.buyerId === currentUser.id || ord.customer?.email === currentUser.email;
  });

  // Sort orders newest to oldest
  const sortedOrders = [...userOrders].sort((a, b) => {
    const timeA = new Date(a.createdAt || a.created_at || 0).getTime();
    const timeB = new Date(b.createdAt || b.created_at || 0).getTime();
    return timeB - timeA;
  });

  return (
    <SidebarDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="My Orders"
      subtitle="Track and manage your purchases"
      icon={<Package size={20} color="var(--color-yellow)" />}
      badge={sortedOrders.length > 0 ? `(${sortedOrders.length})` : null}
      ariaLabel="My Orders Sidebar"
    >
      {sortedOrders.length === 0 ? (
        <div className="orders-empty-state">
          <div className="orders-empty-icon-box">
            <Package size={52} strokeWidth={1.5} color="var(--gray-400)" />
          </div>
          <h3 className="orders-empty-title">No orders yet</h3>
          <p className="orders-empty-desc">
            Your current and previous orders will appear here.
          </p>
          <button
            type="button"
            className="btn btn-primary btn-continue-shopping"
            onClick={onClose}
          >
            Continue Shopping
            <ArrowRight size={16} />
          </button>
        </div>
      ) : (
        <div className="orders-sidebar-list">
          {sortedOrders.map((ord) => {
            const statusConfig = getStatusConfig(ord.status);
            const items = ord.items && ord.items.length > 0 ? ord.items : [
              {
                name: 'Artisan Custom Order',
                price: ord.totalAmount || 0,
                quantity: 1,
                image: ''
              }
            ];
            const primaryItem = items[0];
            const totalQuantity = items.reduce((sum, i) => sum + (Number(i.quantity) || 1), 0);
            const isDetailsOpen = Boolean(expandedDetails[ord.id]);
            const isTrackingOpen = Boolean(expandedTracking[ord.id]);

            const orderDateStr = ord.createdAt
              ? new Date(ord.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })
              : 'Recent';

            return (
              <div key={ord.id} className="order-sidebar-card">
                {/* Order Top Bar: ID, Date & Status */}
                <div className="order-card-topbar">
                  <div className="order-id-block">
                    <span className="order-ref-number">#{ord.id}</span>
                    <span className="order-date-label">{orderDateStr}</span>
                  </div>

                  <span className={`status-pill ${statusConfig.className}`}>
                    {statusConfig.icon}
                    <span>{statusConfig.label}</span>
                  </span>
                </div>

                {/* Primary Item Preview */}
                <div className="order-primary-item-row">
                  {primaryItem.image ? (
                    <img
                      src={primaryItem.image}
                      alt={primaryItem.name}
                      className="order-item-thumb"
                    />
                  ) : (
                    <div className="order-item-thumb-placeholder">
                      <ShoppingBag size={22} color="var(--color-primary)" />
                    </div>
                  )}

                  <div className="order-item-info">
                    <h4 className="order-item-title" title={primaryItem.name}>
                      {primaryItem.name}
                    </h4>

                    {(primaryItem.weight || primaryItem.flavor) && (
                      <div className="order-item-variants">
                        {primaryItem.weight && <span>{primaryItem.weight}</span>}
                        {primaryItem.weight && primaryItem.flavor && <span> • </span>}
                        {primaryItem.flavor && <span>{primaryItem.flavor}</span>}
                      </div>
                    )}

                    {items.length > 1 && (
                      <div className="order-multiple-items-tag">
                        + {items.length - 1} more item{items.length > 2 ? 's' : ''}
                      </div>
                    )}

                    <div className="order-meta-row">
                      <span className="order-meta-qty">Qty: {totalQuantity}</span>
                      <span className="order-meta-price">
                        ₹{(ord.totalAmount || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Delivery Slot info if present */}
                {ord.slotDate && (
                  <div className="order-slot-badge">
                    <Calendar size={13} color="#059669" />
                    <span>Delivery Slot: <strong>{ord.slotDate}</strong></span>
                  </div>
                )}

                {/* Action Buttons: View Details & Track Order */}
                <div className="order-card-actions-row">
                  <button
                    type="button"
                    className={`btn-order-action ${isDetailsOpen ? 'active' : ''}`}
                    onClick={() => toggleDetails(ord.id)}
                    aria-expanded={isDetailsOpen}
                  >
                    <span>View Details</span>
                    {isDetailsOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>

                  <button
                    type="button"
                    className={`btn-order-action btn-order-track ${isTrackingOpen ? 'active' : ''}`}
                    onClick={() => toggleTracking(ord.id)}
                    aria-expanded={isTrackingOpen}
                  >
                    <Truck size={14} />
                    <span>Track Order</span>
                    {isTrackingOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>

                {/* Expandable Tracking Timeline */}
                {isTrackingOpen && (
                  <div className="order-tracking-panel">
                    <div className="order-tracking-panel-title">
                      Live Order Tracking
                    </div>

                    {statusConfig.label === 'Cancelled' ? (
                      <div className="order-tracking-cancelled-alert">
                        <AlertCircle size={16} color="#DC2626" />
                        <div>
                          <strong>Order Cancelled</strong>
                          {ord.cancellationReason && (
                            <p className="cancellation-reason-text">
                              Reason: {ord.cancellationReason}
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="order-timeline">
                        {/* Step 1: Placed */}
                        <div className={`timeline-step ${statusConfig.step >= 1 ? 'completed' : ''}`}>
                          <div className="step-indicator">
                            <CheckCircle size={13} />
                          </div>
                          <div className="step-content">
                            <div className="step-title">Order Placed & Confirmed</div>
                            <div className="step-time">{orderDateStr}</div>
                          </div>
                        </div>

                        {/* Step 2: Preparing */}
                        <div className={`timeline-step ${statusConfig.step >= 2 ? 'completed' : statusConfig.step === 1 ? 'active' : ''}`}>
                          <div className="step-indicator">
                            <ChefHat size={13} />
                          </div>
                          <div className="step-content">
                            <div className="step-title">In Preparation</div>
                            <div className="step-time">Freshly crafted by artisan</div>
                          </div>
                        </div>

                        {/* Step 3: Shipped / Dispatched */}
                        <div className={`timeline-step ${statusConfig.step >= 3 ? 'completed' : statusConfig.step === 2 ? 'active' : ''}`}>
                          <div className="step-indicator">
                            <Truck size={13} />
                          </div>
                          <div className="step-content">
                            <div className="step-title">Shipped / Out for Delivery</div>
                            <div className="step-time">Courier assigned</div>
                          </div>
                        </div>

                        {/* Step 4: Delivered */}
                        <div className={`timeline-step ${statusConfig.step >= 4 ? 'completed' : ''}`}>
                          <div className="step-indicator">
                            <CheckCircle size={13} />
                          </div>
                          <div className="step-content">
                            <div className="step-title">Delivered</div>
                            <div className="step-time">To your address</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Expandable Order Details Panel */}
                {isDetailsOpen && (
                  <div className="order-details-panel">
                    {/* All Items in Order */}
                    <div className="order-details-items-heading">Itemized Breakdown</div>
                    <div className="order-details-items-list">
                      {items.map((item, idx) => (
                        <div key={item.id || idx} className="order-details-item-row">
                          <div className="order-details-item-main">
                            <div className="order-details-item-name">
                              {item.name} <span className="order-details-qty">×{item.quantity || 1}</span>
                            </div>
                            {(item.weight || item.flavor) && (
                              <div className="order-details-item-sub">
                                {[item.weight, item.flavor].filter(Boolean).join(' • ')}
                              </div>
                            )}
                            {item.message && (
                              <div className="order-details-inscription">
                                Msg: "{item.message}"
                              </div>
                            )}
                          </div>
                          <div className="order-details-item-price">
                            ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Delivery Address */}
                    {(ord.shippingAddress || ord.customer) && (
                      <div className="order-details-shipping-box">
                        <div className="order-details-subheading">
                          <MapPin size={13} color="var(--color-primary)" />
                          <span>Delivery Address</span>
                        </div>
                        <div className="order-details-address-text">
                          <strong>{ord.shippingAddress?.fullName || ord.customer?.name || 'Customer'}</strong>
                          {(ord.shippingAddress?.phone || ord.customer?.phone) && (
                            <span> • {ord.shippingAddress?.phone || ord.customer?.phone}</span>
                          )}
                          <br />
                          {ord.shippingAddress ? (
                            <>
                              {[
                                ord.shippingAddress.houseNo,
                                ord.shippingAddress.street,
                                ord.shippingAddress.area || ord.shippingAddress.city
                              ].filter(Boolean).join(', ')}
                              {ord.shippingAddress.pincode ? ` — ${ord.shippingAddress.pincode}` : ''}
                            </>
                          ) : (
                            ord.customer?.address || ord.customer?.city || 'Address provided at booking'
                          )}
                        </div>
                      </div>
                    )}

                    {/* Cost Breakdown */}
                    <div className="order-details-cost-breakdown">
                      {ord.subtotal !== undefined && (
                        <div className="order-cost-row">
                          <span>Subtotal</span>
                          <span>₹{(ord.subtotal || 0).toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      <div className="order-cost-row">
                        <span>Courier / Delivery Fee</span>
                        <span style={{ color: ord.deliveryFee === 0 ? '#059669' : 'inherit' }}>
                          {ord.deliveryFee === 0 ? 'FREE' : `₹${ord.deliveryFee || 0}`}
                        </span>
                      </div>
                      <div className="order-cost-row order-cost-total">
                        <span>Total Paid</span>
                        <span style={{ color: 'var(--color-primary)' }}>
                          ₹{(ord.totalAmount || 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                      {ord.paymentStatus && (
                        <div className="order-payment-status-tag">
                          Payment: <strong>{ord.paymentStatus}</strong>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </SidebarDrawer>
  );
}

