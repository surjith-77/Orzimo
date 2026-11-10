import React, { useState } from 'react';
import { 
  Search, 
  Calendar, 
  CheckCircle, 
  ChefHat, 
  Truck, 
  Phone, 
  MapPin, 
  FileText,
  XCircle,
  Printer
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';

export default function SellerOrdersTab() {
  const { orders, updateOrderStatus } = useMarketplace();
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [printingOrder, setPrintingOrder] = useState(null);

  // Status mapping helper to normalize statuses
  const normalizeStatus = (status) => {
    if (status === 'Pending Confirmation') return 'Pending';
    if (status === 'In Preparation') return 'Preparing';
    if (status === 'Ready for Delivery') return 'Ready';
    return status;
  };

  const filteredOrders = orders.filter((order) => {
    const currentNorm = normalizeStatus(order.status);
    if (filterStatus !== 'all' && currentNorm !== filterStatus) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = order.id.toLowerCase().includes(q);
      const matchName = order.customer?.name?.toLowerCase().includes(q);
      const matchPhone = order.customer?.phone?.toLowerCase().includes(q);
      const matchItem = order.items?.some(i => i.name.toLowerCase().includes(q));
      if (!matchId && !matchName && !matchPhone && !matchItem) return false;
    }
    return true;
  });

  const getStatusCount = (targetStatus) => {
    return orders.filter(o => normalizeStatus(o.status) === targetStatus).length;
  };

  const STATUS_TABS = [
    { id: 'all', label: `All Orders (${orders.length})` },
    { id: 'Pending', label: `Pending (${getStatusCount('Pending')})` },
    { id: 'Accepted', label: `Accepted (${getStatusCount('Accepted')})` },
    { id: 'Preparing', label: `Preparing (${getStatusCount('Preparing')})` },
    { id: 'Ready', label: `Ready (${getStatusCount('Ready')})` },
    { id: 'Completed', label: `Completed (${getStatusCount('Completed')})` },
    { id: 'Cancelled', label: `Cancelled (${getStatusCount('Cancelled')})` }
  ];

  const handleCancelOrder = (orderId) => {
    const reason = prompt('Please enter the reason for cancellation (e.g. Ingredient out of stock, customer requested):', 'Customer requested reschedule');
    if (reason !== null) {
      updateOrderStatus(orderId, 'Cancelled', reason || 'Seller cancelled');
    }
  };

  return (
    <div className="seller-panel">
      {/* Header with Search and Filter Tabs */}
      <div className="seller-panel-header">
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
            Pre-Booking Orders & Inscriptions
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#94A3B8', margin: '4px 0 0' }}>
            Accept orders, manage preparation workflow (Pending → Accepted → Preparing → Ready → Completed)
          </p>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
          <input 
            type="text" 
            className="seller-form-input" 
            style={{ padding: '10px 14px 10px 38px', fontSize: '0.85rem' }}
            placeholder="Search order ID, buyer, cake..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs */}
      <div style={{ padding: '16px 24px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div className="seller-filter-tabs">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.id}
              className={`seller-filter-btn ${filterStatus === tab.id ? 'active' : ''}`}
              onClick={() => setFilterStatus(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="seller-orders-list">
        {filteredOrders.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748B' }}>
            <FileText size={44} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
            <p style={{ fontSize: '0.95rem', fontWeight: 600 }}>No orders found for this filter tab.</p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const currentStatus = normalizeStatus(order.status);
            return (
              <div key={order.id} className="seller-order-card">
                {/* Order Top Bar */}
                <div className="order-top-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <span className="order-id-tag">#{order.id}</span>
                    <span style={{ fontSize: '0.8rem', color: '#CBD5E1' }}>
                      Created: <strong>{new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</strong>
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className={`status-badge ${
                      currentStatus === 'Pending' ? 'pending' :
                      currentStatus === 'Accepted' ? 'accepted' :
                      currentStatus === 'Preparing' ? 'baking' :
                      currentStatus === 'Ready' ? 'ready' : 
                      currentStatus === 'Cancelled' ? 'cancelled' : 'completed'
                    }`} style={{
                      background: currentStatus === 'Accepted' ? 'rgba(56, 189, 248, 0.2)' : 
                                  currentStatus === 'Cancelled' ? 'rgba(239, 68, 68, 0.2)' : undefined,
                      color: currentStatus === 'Accepted' ? '#38BDF8' : 
                             currentStatus === 'Cancelled' ? '#F87171' : undefined
                    }}>
                      {currentStatus}
                    </span>
                  </div>
                </div>

                {/* Items and Customer Details */}
                <div className="order-body-grid">
                  <div>
                    {order.items.map((item, idx) => (
                      <div key={idx} className="order-item-desc" style={{ marginBottom: idx < order.items.length - 1 ? 12 : 0 }}>
                        <img src={item.image} alt={item.name} className="order-item-thumb" />
                        <div>
                          <div className="order-item-title">{item.name}</div>
                          <div style={{ margin: '4px 0' }}>
                            {item.weight && <span className="order-spec-badge">{item.weight}</span>}
                            {item.flavor && <span className="order-spec-badge">{item.flavor}</span>}
                            <span className="order-spec-badge">Qty: {item.quantity}</span>
                          </div>
                          {item.message && (
                            <div className="order-inscription-highlight">
                              Custom Inscription / Message: <strong>"{item.message}"</strong>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {order.specialInstructions && (
                      <div style={{ marginTop: 10, fontSize: '0.775rem', color: 'var(--color-text-secondary)' }}>
                        <strong>Customer Instructions:</strong> {order.specialInstructions}
                      </div>
                    )}

                    {order.cancellationReason && (
                      <div style={{ marginTop: 10, fontSize: '0.775rem', color: '#F87171', background: 'rgba(239, 68, 68, 0.1)', padding: '6px 10px', borderRadius: 4 }}>
                        <strong>Cancellation Reason:</strong> {order.cancellationReason}
                      </div>
                    )}
                  </div>

                  {/* Delivery and Customer Info */}
                  <div className="order-slot-info">
                    <div style={{ 
                      background: 'var(--color-primary-light)', 
                      padding: '8px 12px', 
                      borderRadius: 'var(--radius-sm)', 
                      border: '1px solid rgba(40, 116, 240, 0.25)',
                      marginBottom: 8 
                    }}>
                      <span className="slot-tag" style={{ fontSize: '0.85rem', color: 'var(--color-deep-blue)' }}>
                        <Calendar size={15} />
                        {order.slotDate}
                      </span>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: 4 }}>
                        Method: <strong style={{ color: 'var(--color-text-primary)' }}>{order.deliveryType}</strong>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text-primary)' }}>
                      <Phone size={14} color="var(--color-primary)" />
                      <span>{order.customer.name} ({order.customer.phone})</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                      <MapPin size={14} style={{ flexShrink: 0, marginTop: 2 }} />
                      <span>{order.customer.address}</span>
                    </div>
                  </div>

                  {/* Amount and Payment Info */}
                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <span style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--color-primary)' }}>
                      ₹{order.totalAmount.toLocaleString('en-IN')}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-success)', fontWeight: 700 }}>
                      {order.paymentStatus}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: 4, fontWeight: 600 }}>
                      Delivery: ₹{order.deliveryFee} included
                    </span>
                  </div>
                </div>

                {/* Status Advancement Actions: Pending -> Accepted -> Preparing -> Ready -> Completed */}
                <div className="order-actions-bar">
                  <button 
                    className="btn btn-outline"
                    style={{ padding: '6px 12px', fontSize: '0.775rem' }}
                    onClick={() => setPrintingOrder(order)}
                  >
                    <FileText size={14} />
                    Print Kitchen Token
                  </button>

                  {/* 1. Pending -> Accept */}
                  {currentStatus === 'Pending' && (
                    <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
                      <button 
                        className="btn btn-primary"
                        style={{ padding: '8px 18px', fontSize: '0.8rem' }}
                        onClick={() => updateOrderStatus(order.id, 'Accepted')}
                      >
                        <CheckCircle size={15} />
                        Accept Order
                      </button>
                      <button 
                        className="btn"
                        style={{ padding: '8px 14px', fontSize: '0.8rem', background: 'var(--color-danger-bg)', color: 'var(--color-danger)', border: '1px solid rgba(198, 40, 40, 0.3)', fontWeight: 700 }}
                        onClick={() => handleCancelOrder(order.id)}
                      >
                        <XCircle size={15} />
                        Decline
                      </button>
                    </div>
                  )}

                  {/* 2. Accepted -> Start Preparing */}
                  {currentStatus === 'Accepted' && (
                    <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
                      <button 
                        className="btn btn-primary"
                        style={{ padding: '8px 18px', fontSize: '0.8rem' }}
                        onClick={() => updateOrderStatus(order.id, 'Preparing')}
                      >
                        <ChefHat size={16} />
                        Start Preparing / Baking
                      </button>
                      <button 
                        className="btn"
                        style={{ padding: '8px 14px', fontSize: '0.8rem', background: 'var(--color-danger-bg)', color: 'var(--color-danger)', border: '1px solid rgba(198, 40, 40, 0.3)', fontWeight: 700 }}
                        onClick={() => handleCancelOrder(order.id)}
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  {/* 3. Preparing -> Ready */}
                  {currentStatus === 'Preparing' && (
                    <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
                      <button 
                        className="btn btn-primary"
                        style={{ padding: '8px 18px', fontSize: '0.8rem' }}
                        onClick={() => updateOrderStatus(order.id, 'Ready')}
                      >
                        <Truck size={16} />
                        Mark Ready for Delivery/Pickup
                      </button>
                      <button 
                        className="btn"
                        style={{ padding: '8px 14px', fontSize: '0.8rem', background: 'var(--color-danger-bg)', color: 'var(--color-danger)', border: '1px solid rgba(198, 40, 40, 0.3)', fontWeight: 700 }}
                        onClick={() => handleCancelOrder(order.id)}
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  {/* 4. Ready -> Complete */}
                  {currentStatus === 'Ready' && (
                    <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
                      <button 
                        className="btn btn-primary"
                        style={{ padding: '8px 18px', fontSize: '0.8rem', background: 'var(--color-success)', borderColor: 'var(--color-success)' }}
                        onClick={() => updateOrderStatus(order.id, 'Completed')}
                      >
                        <CheckCircle size={16} />
                        Mark Handed Over / Completed
                      </button>
                    </div>
                  )}

                  {/* Completed */}
                  {currentStatus === 'Completed' && (
                    <span style={{ color: 'var(--color-success)', fontSize: '0.825rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
                      <CheckCircle size={16} /> Order Fulfilled & Paid
                    </span>
                  )}

                  {/* Cancelled */}
                  {currentStatus === 'Cancelled' && (
                    <span style={{ color: 'var(--color-danger)', fontSize: '0.825rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
                      <XCircle size={16} /> Order Cancelled
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Printable Kitchen Slip Modal */}
      {printingOrder && (
        <div className="modal-backdrop" onClick={() => setPrintingOrder(null)} style={{ zIndex: 400 }}>
          <div className="seller-modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px', background: '#FFFFFF', color: '#0F172A' }}>
            <div style={{ borderBottom: '2px dashed var(--color-border)', paddingBottom: '16px', marginBottom: '16px', textAlign: 'center' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--color-text-primary)', margin: 0 }}>ORZIMO KITCHEN TOKEN</h2>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: 2 }}>Order #{printingOrder.id} • {printingOrder.shopName || 'Creator Studio'}</div>
            </div>

            <div style={{ fontSize: '0.85rem', lineHeight: 1.6, marginBottom: 16, color: 'var(--color-text-primary)' }}>
              <div><strong>Scheduled Slot:</strong> {printingOrder.slotDate}</div>
              <div><strong>Fulfillment:</strong> {printingOrder.deliveryType}</div>
              <div><strong>Customer:</strong> {printingOrder.customer.name} ({printingOrder.customer.phone})</div>
              <div><strong>Address:</strong> {printingOrder.customer.address}</div>
            </div>

            <div style={{ background: '#F8FAFC', padding: 12, borderRadius: 6, marginBottom: 16, border: '1px solid var(--color-border)' }}>
              <div style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: 8, color: 'var(--color-text-primary)' }}>ITEMS TO PREPARE:</div>
              {printingOrder.items.map((item, idx) => (
                <div key={idx} style={{ marginBottom: 6, fontSize: '0.85rem', color: 'var(--color-text-primary)' }}>
                  • <strong>{item.quantity}x {item.name}</strong> ({item.weight || 'Standard'} / {item.flavor || 'Standard'})
                  {item.message && (
                    <div style={{ color: 'var(--color-primary)', fontWeight: 700, paddingLeft: 12, marginTop: 2 }}>
                      Inscription: "{item.message}"
                    </div>
                  )}
                </div>
              ))}
            </div>

            {printingOrder.specialInstructions && (
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: 16, fontStyle: 'italic' }}>
                Note: {printingOrder.specialInstructions}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button 
                className="btn btn-outline" 
                style={{ flex: 1 }}
                onClick={() => setPrintingOrder(null)}
              >
                Close
              </button>
              <button 
                className="btn btn-primary" 
                style={{ flex: 1, gap: 6 }}
                onClick={() => {
                  window.print();
                  setPrintingOrder(null);
                }}
              >
                <Printer size={16} />
                Print Token
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
