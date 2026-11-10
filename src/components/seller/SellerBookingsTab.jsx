import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Save, 
  CheckCircle2, 
  User, 
  Phone 
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';

export default function SellerBookingsTab() {
  const { 
    orders, 
    bookingRequests, 
    acceptBookingRequest, 
    declineBookingRequest, 
    sellerSettings, 
    updateSellerSettings 
  } = useMarketplace();

  const [activeSubTab, setActiveSubTab] = useState('timeline'); // 'timeline' | 'requests' | 'capacity'

  // Settings
  const [maxOrders, setMaxOrders] = useState(sellerSettings.maxOrdersPerDay || 8);
  const [leadTime, setLeadTime] = useState(sellerSettings.leadTimeHours || 24);
  const [allowPickup, setAllowPickup] = useState(sellerSettings.allowPickup ?? true);
  const [allowDelivery, setAllowDelivery] = useState(sellerSettings.allowDelivery ?? true);
  const [blockedDate, setBlockedDate] = useState('');
  const [blockedDatesList, setBlockedDatesList] = useState(sellerSettings.blockedDates || ['2026-11-15', '2026-11-16']);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Group orders by slot date
  const todayOrders = orders.filter(o => o.slotDate?.toLowerCase().includes('today') && o.status !== 'Cancelled');
  const tomorrowOrders = orders.filter(o => o.slotDate?.toLowerCase().includes('tomorrow') && o.status !== 'Cancelled');
  const upcomingOrders = orders.filter(o => !o.slotDate?.toLowerCase().includes('today') && !o.slotDate?.toLowerCase().includes('tomorrow') && o.status !== 'Cancelled');

  const pendingRequestsCount = bookingRequests.filter(b => b.status === 'Pending Review').length;

  const handleSaveCapacity = (e) => {
    e.preventDefault();
    updateSellerSettings({
      maxOrdersPerDay: parseInt(maxOrders, 10),
      leadTimeHours: parseInt(leadTime, 10),
      allowPickup,
      allowDelivery,
      blockedDates: blockedDatesList
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const addBlockedDate = () => {
    if (blockedDate && !blockedDatesList.includes(blockedDate)) {
      setBlockedDatesList([...blockedDatesList, blockedDate]);
      setBlockedDate('');
    }
  };

  const removeBlockedDate = (date) => {
    setBlockedDatesList(blockedDatesList.filter(d => d !== date));
  };

  return (
    <div className="seller-panel">
      {/* Panel Header */}
      <div className="seller-panel-header">
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
            Bookings, Custom Orders & Slot Capacity
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#94A3B8', margin: '4px 0 0' }}>
            Schedule deliveries, accept bespoke custom orders, and configure daily kitchen capacity
          </p>
        </div>

        {savedSuccess && (
          <span style={{ color: '#10B981', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckCircle2 size={16} /> Capacity Settings Saved!
          </span>
        )}
      </div>

      {/* Sub Tabs */}
      <div style={{ padding: '16px 24px 0', borderBottom: '1px solid var(--color-border)' }}>
        <div className="seller-filter-tabs">
          <button
            className={`seller-filter-btn ${activeSubTab === 'timeline' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('timeline')}
          >
            Delivery Slot Schedule ({orders.filter(o => o.status !== 'Cancelled').length})
          </button>
          <button
            className={`seller-filter-btn ${activeSubTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('requests')}
          >
            Custom Booking Inquiries ({pendingRequestsCount} Pending)
          </button>
          <button
            className={`seller-filter-btn ${activeSubTab === 'capacity' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('capacity')}
          >
            Daily Slot Limits & Capacity
          </button>
        </div>
      </div>

      {/* 1. TIMELINE VIEW */}
      {activeSubTab === 'timeline' && (
        <div style={{ padding: '24px' }}>
          {/* Capacity meter */}
          <div style={{
            background: '#FFFFFF',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 20px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
          }}>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                Tomorrow's Kitchen Slot Status: <strong>{tomorrowOrders.length} of {maxOrders} Slots Booked</strong>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: 2 }}>
                {maxOrders - tomorrowOrders.length} slots still open for automated customer pre-booking.
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: '140px', height: '10px', background: '#E0E0E0', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{ 
                  width: `${Math.min(100, (tomorrowOrders.length / maxOrders) * 100)}%`, 
                  height: '100%', 
                  background: 'var(--color-primary)',
                  borderRadius: '5px'
                }} />
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                {Math.round((tomorrowOrders.length / maxOrders) * 100)}% Cap
              </span>
            </div>
          </div>

          {/* Group 1: Today */}
          <div style={{ marginBottom: 28 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={16} color="var(--color-primary)" />
              Today's Scheduled Deliveries ({todayOrders.length})
            </h3>

            {todayOrders.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>No orders scheduled for delivery today.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {todayOrders.map((ord) => (
                  <div key={ord.id} style={{
                    background: '#FFFFFF',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 12
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontWeight: 800, color: 'var(--color-deep-blue)', fontSize: '0.9rem' }}>#{ord.id}</span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-primary)', fontWeight: 700 }}>{ord.customer.name}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-success)', background: 'var(--color-success-bg)', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>
                          {ord.slotDate}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: 4 }}>
                        Items: {ord.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontWeight: 800, color: 'var(--color-text-primary)', fontSize: '0.95rem' }}>₹{ord.totalAmount}</span>
                      <span className="status-badge ready">{ord.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Group 2: Tomorrow */}
          <div style={{ marginBottom: 28 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Calendar size={16} color="var(--color-primary)" />
              Tomorrow's Scheduled Slots ({tomorrowOrders.length})
            </h3>

            {tomorrowOrders.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>No slots booked for tomorrow.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {tomorrowOrders.map((ord) => (
                  <div key={ord.id} style={{
                    background: '#FFFFFF',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 12
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontWeight: 800, color: 'var(--color-deep-blue)', fontSize: '0.9rem' }}>#{ord.id}</span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-primary)', fontWeight: 700 }}>{ord.customer.name}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', background: 'var(--color-primary-light)', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>
                          {ord.slotDate}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: 4 }}>
                        Items: {ord.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                        {ord.items[0]?.message && (
                          <span style={{ color: 'var(--color-primary)', marginLeft: 8, fontWeight: 600 }}>
                            • Inscription: "{ord.items[0].message}"
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontWeight: 800, color: 'var(--color-text-primary)', fontSize: '0.95rem' }}>₹{ord.totalAmount}</span>
                      <span className="status-badge baking">{ord.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Group 3: Upcoming */}
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={16} color="var(--color-deep-blue)" />
              Upcoming Future Bookings ({upcomingOrders.length})
            </h3>
            {upcomingOrders.map((ord) => (
              <div key={ord.id} style={{
                background: '#FFFFFF',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                padding: '14px',
                marginBottom: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 12
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 800, color: 'var(--color-deep-blue)' }}>#{ord.id}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{ord.customer.name}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>({ord.slotDate})</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: 2 }}>
                    {ord.items.map(i => i.name).join(', ')}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>₹{ord.totalAmount}</span>
                  <span className="status-badge pending">{ord.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. CUSTOM INQUIRIES VIEW */}
      {activeSubTab === 'requests' && (
        <div style={{ padding: '24px' }}>
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-text-primary)', margin: 0 }}>
              Incoming Custom Order Requests ({bookingRequests.length})
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', margin: '4px 0 0' }}>
              Customers requesting bespoke designs, multi-tier wedding cakes, or curated gift hampers
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {bookingRequests.map((req) => (
              <div key={req.id} style={{
                background: '#FFFFFF',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '20px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)', padding: '2px 8px', borderRadius: 4, fontWeight: 800, fontSize: '0.75rem', border: '1px solid rgba(40, 116, 240, 0.25)' }}>
                      #{req.id}
                    </span>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-text-primary)', margin: 0 }}>
                      {req.occasion}
                    </h4>
                  </div>

                  <span style={{
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    background: req.status === 'Accepted' ? 'var(--color-success-bg)' : 
                                req.status === 'Declined' ? 'var(--color-danger-bg)' : 'var(--color-warning-bg)',
                    color: req.status === 'Accepted' ? 'var(--color-success)' : 
                           req.status === 'Declined' ? 'var(--color-danger)' : '#B45309',
                    border: `1px solid ${req.status === 'Accepted' ? 'rgba(21, 128, 61, 0.3)' : req.status === 'Declined' ? 'rgba(198, 40, 40, 0.3)' : 'rgba(180, 83, 9, 0.3)'}`
                  }}>
                    {req.status}
                  </span>
                </div>

                <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                  <div style={{ fontSize: '0.875rem', color: 'var(--color-text-primary)', lineHeight: 1.5 }}>
                    "{req.itemDescription}"
                  </div>
                  <div style={{ display: 'flex', gap: 16, marginTop: 10, fontSize: '0.78rem', color: 'var(--color-text-secondary)', flexWrap: 'wrap' }}>
                    <span>Target Date: <strong style={{ color: 'var(--color-text-primary)' }}>{req.targetDate} ({req.deliveryTime})</strong></span>
                    <span>Guests: <strong style={{ color: 'var(--color-text-primary)' }}>{req.guestCount} pax</strong></span>
                    <span>Budget: <strong style={{ color: 'var(--color-primary)' }}>{req.estimatedBudget}</strong></span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, borderTop: '1px solid var(--color-border)', paddingTop: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--color-text-primary)', fontWeight: 600 }}>
                      <User size={14} color="var(--color-primary)" />
                      {req.customerName}
                    </span>
                    <a 
                      href={`tel:${req.customerPhone}`} 
                      style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}
                    >
                      <Phone size={14} />
                      {req.customerPhone}
                    </a>
                  </div>

                  {req.status === 'Pending Review' ? (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        className="btn btn-primary"
                        style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                        onClick={() => acceptBookingRequest(req.id)}
                      >
                        <CheckCircle2 size={15} />
                        Accept Custom Booking
                      </button>
                      <button
                        className="btn"
                        style={{ padding: '6px 12px', fontSize: '0.8rem', background: 'var(--color-danger-bg)', color: 'var(--color-danger)', border: '1px solid rgba(198, 40, 40, 0.3)', fontWeight: 700 }}
                        onClick={() => declineBookingRequest(req.id)}
                      >
                        Decline
                      </button>
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                      Request marked as <strong style={{ color: 'var(--color-text-primary)' }}>{req.status}</strong>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. CAPACITY CONTROLS VIEW */}
      {activeSubTab === 'capacity' && (
        <form onSubmit={handleSaveCapacity} style={{ padding: '28px', maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Daily Capacity Slider */}
          <div style={{ background: '#FFFFFF', padding: 20, borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-text-primary)', margin: 0 }}>
                  Maximum Pre-Orders Per Day
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', margin: '4px 0 0' }}>
                  Once this limit is reached for any date, that slot automatically closes for new customer bookings.
                </p>
              </div>
              <span style={{ 
                fontSize: '1.25rem', 
                fontWeight: 900, 
                color: 'var(--color-primary)',
                background: 'var(--color-primary-light)',
                padding: '6px 16px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid rgba(40, 116, 240, 0.3)'
              }}>
                {maxOrders} orders/day
              </span>
            </div>

            <input 
              type="range" 
              min="2" 
              max="25" 
              value={maxOrders} 
              onChange={(e) => setMaxOrders(e.target.value)}
              style={{ width: '100%', accentColor: 'var(--color-primary)', cursor: 'pointer' }}
            />
          </div>

          {/* Lead Time notice */}
          <div style={{ background: '#FFFFFF', padding: 20, borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-text-primary)', margin: 0 }}>
              Minimum Preparation Notice Time
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', margin: '4px 0 12px' }}>
              Customers must book at least this many hours in advance to guarantee fresh craft quality.
            </p>

            <select 
              className="seller-form-input" 
              value={leadTime} 
              onChange={(e) => setLeadTime(e.target.value)}
              style={{ maxWidth: '300px' }}
            >
              <option value="4">4 Hours Notice (Same Day Ready)</option>
              <option value="12">12 Hours Notice (Overnight Prep)</option>
              <option value="24">24 Hours Notice (Recommended for Cakes)</option>
              <option value="48">48 Hours Notice (Artisanal Custom)</option>
            </select>
          </div>

          {/* Fulfillment options */}
          <div style={{ background: '#FFFFFF', padding: 20, borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-text-primary)', margin: '0 0 12px' }}>
              Accepted Delivery & Pickup Channels
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', color: 'var(--color-text-primary)', fontSize: '0.875rem' }}>
                <input 
                  type="checkbox" 
                  checked={allowPickup} 
                  onChange={(e) => setAllowPickup(e.target.checked)}
                  style={{ width: 18, height: 18, accentColor: 'var(--color-primary)' }}
                />
                <span>Allow Customers to Pick Up from Home Studio / Kitchen</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', color: 'var(--color-text-primary)', fontSize: '0.875rem' }}>
                <input 
                  type="checkbox" 
                  checked={allowDelivery} 
                  onChange={(e) => setAllowDelivery(e.target.checked)}
                  style={{ width: 18, height: 18, accentColor: 'var(--color-primary)' }}
                />
                <span>Allow Local Doorstep Delivery (via Porter / Dunzo / Personal Dispatch)</span>
              </label>
            </div>
          </div>

          {/* Block dates calendar tool */}
          <div style={{ background: '#FFFFFF', padding: 20, borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-text-primary)', margin: 0 }}>
              Kitchen Vacation & Blocked Days
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', margin: '4px 0 12px' }}>
              Select holidays or maintenance dates when your studio will not accept orders.
            </p>

            <div style={{ display: 'flex', gap: 10, maxWidth: '420px', marginBottom: 12 }}>
              <input 
                type="date" 
                className="seller-form-input" 
                value={blockedDate} 
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setBlockedDate(e.target.value)}
              />
              <button 
                type="button" 
                className="btn btn-outline"
                onClick={addBlockedDate}
              >
                Block Date
              </button>
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {blockedDatesList.map((dt) => (
                <span 
                  key={dt} 
                  style={{ 
                    background: 'var(--color-danger-bg)', 
                    color: 'var(--color-danger)', 
                    border: '1px solid rgba(198, 40, 40, 0.3)', 
                    padding: '4px 10px', 
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  {dt}
                  <button 
                    type="button" 
                    onClick={() => removeBlockedDate(dt)}
                    style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', fontWeight: 900 }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-lg" 
            style={{ width: 'fit-content', display: 'flex', alignItems: 'center', gap: 8, background: 'var(--color-primary)', color: '#FFFFFF', fontWeight: 700 }}
          >
            <Save size={18} />
            Save Capacity Settings
          </button>
        </form>
      )}
    </div>
  );
}

