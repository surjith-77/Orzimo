import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/buyer/Header';
import CategoryNav from '../components/buyer/CategoryNav';
import HeroBanners from '../components/buyer/HeroBanners';
import TrustStrip from '../components/buyer/TrustStrip';
import ProductSection from '../components/buyer/ProductSection';
import CreatorBanner from '../components/buyer/CreatorBanner';
import Footer from '../components/buyer/Footer';
import AuthModal from '../components/common/AuthModal';
import AccountModal from '../components/common/AccountModal';
import MyOrdersModal from '../components/buyer/MyOrdersModal';
import PincodeChangeModal from '../components/common/PincodeChangeModal';
import AddressFormModal from '../components/common/AddressFormModal';
import { useAuth } from '../context/AuthContext';
import { useMarketplace } from '../context/MarketplaceContext';
import { calculateDeliveryEstimate } from '../services/deliveryService';
import {
  X,
  ShoppingBag,
  Calendar,
  Trash2,
  CheckCircle2,
  ArrowRight,
  Store,
  ShieldCheck,
  Star,
  Truck,
  MapPin,
  Clock,
  AlertCircle
} from 'lucide-react';
import '../App.css';

export default function BuyerApp() {
  const navigate = useNavigate();
  const { currentUser, switchRole } = useAuth();
  const { 
    products, 
    addOrder,
    deliveryLocation,
    updateDeliveryLocation,
    buyerAddresses,
    addOrUpdateBuyerAddress
  } = useMarketplace();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isMyOrdersOpen, setIsMyOrdersOpen] = useState(false);
  const [isSellerModalOpen, setIsSellerModalOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isPincodeModalOpen, setIsPincodeModalOpen] = useState(false);
  const [isAddressFormModalOpen, setIsAddressFormModalOpen] = useState(false);
  const [quickViewEstimate, setQuickViewEstimate] = useState(null);
  const [shipmentEstimates, setShipmentEstimates] = useState({});

  // Quick View customization states
  const [selectedWeight, setSelectedWeight] = useState('');
  const [selectedFlavor, setSelectedFlavor] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [notification, setNotification] = useState('');

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification('');
    }, 3500);
  };

  const handleOpenQuickView = (product) => {
    setQuickViewProduct(product);
    if (product.customOptions?.weights?.length) {
      setSelectedWeight(product.customOptions.weights[0]);
    }
    if (product.customOptions?.flavors?.length) {
      setSelectedFlavor(product.customOptions.flavors[0]);
    }
    setCustomMessage('');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    setDeliveryDate(tomorrow.toISOString().split('T')[0]);
  };

  const handleCloseQuickView = () => {
    setQuickViewProduct(null);
  };

  // Calculate delivery estimate for quickViewProduct whenever it or deliveryLocation changes
  useEffect(() => {
    if (!quickViewProduct) {
      setQuickViewEstimate(null);
      return;
    }
    let isCurrent = true;

    calculateDeliveryEstimate({
      product: quickViewProduct,
      sellerDispatch: {
        pincode: quickViewProduct.sellerDispatchPin || '560038',
        city: quickViewProduct.sellerDispatchCity || 'Bengaluru',
        district: quickViewProduct.sellerDispatchCity || 'Bengaluru',
        state: quickViewProduct.sellerDispatchState || 'Karnataka'
      },
      buyerDelivery: deliveryLocation
    }).then(est => {
      if (isCurrent) setQuickViewEstimate(est);
    });

    return () => { isCurrent = false; };
  }, [quickViewProduct, deliveryLocation]);

  // Calculate shipment-level estimates for items in cart
  useEffect(() => {
    if (cart.length === 0) {
      setShipmentEstimates({});
      return;
    }
    let isCurrent = true;

    async function computeCartEstimates() {
      const estimates = {};
      for (const item of cart) {
        const est = await calculateDeliveryEstimate({
          product: item,
          sellerDispatch: {
            pincode: item.sellerDispatchPin || '560038',
            city: item.sellerDispatchCity || 'Bengaluru',
            district: item.sellerDispatchCity || 'Bengaluru',
            state: item.sellerDispatchState || 'Karnataka'
          },
          buyerDelivery: deliveryLocation
        });
        estimates[item.key] = est;
      }
      if (isCurrent) {
        setShipmentEstimates(estimates);
      }
    }

    computeCartEstimates();
    return () => { isCurrent = false; };
  }, [cart, deliveryLocation]);

  const handleAddToCart = (product, options = {}) => {
    const itemKey = `${product.id}-${options.weight || 'std'}-${options.flavor || 'std'}`;
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.key === itemKey);
      if (existing) {
        return prevCart.map((item) =>
          item.key === itemKey ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [
          ...prevCart,
          {
            key: itemKey,
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.images?.[0] || '',
            sellerId: product.sellerId || product.seller?.id || 'creator_studio',
            sellerName: product.seller?.name || product.sellerName || 'Artisan Creator',
            sellerDispatchPin: product.sellerDispatchPin || '560038',
            sellerDispatchCity: product.sellerDispatchCity || 'Bengaluru',
            sellerDispatchState: product.sellerDispatchState || 'Karnataka',
            preparationDays: product.preparationDays !== undefined ? product.preparationDays : 1,
            isFresh: Boolean(product.isFresh || product.categoryId === 'cakes-bakery'),
            categoryId: product.categoryId,
            weight: options.weight || '',
            flavor: options.flavor || '',
            message: options.message || '',
            slotDate: options.slotDate || 'Earliest Available',
            isPreBookable: product.isPreBookable,
            quantity: 1
          }
        ];
      }
    });

    showToast(`Added "${product.name.slice(0, 24)}..." to your cart!`);
  };

  const handleUpdateQty = (key, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.key === key) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const handleRemoveFromCart = (key) => {
    setCart((prev) => prev.filter((item) => item.key !== key));
  };

  const handleToggleWishlist = (product) => {
    setWishlist((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        showToast(`Removed from saved items.`);
        return prev.filter((p) => p.id !== product.id);
      } else {
        showToast(`Saved to your wishlist!`);
        return [...prev, product];
      }
    });
  };

  // Group cart items by seller into shipments
  const shipmentGroups = Object.values(
    cart.reduce((groups, item) => {
      const sellerKey = item.sellerId || item.sellerName || 'default_seller';
      if (!groups[sellerKey]) {
        groups[sellerKey] = {
          sellerKey,
          sellerId: item.sellerId,
          sellerName: item.sellerName || 'Artisan Studio',
          sellerDispatchPin: item.sellerDispatchPin || '560038',
          sellerDispatchCity: item.sellerDispatchCity || 'Bengaluru',
          sellerDispatchState: item.sellerDispatchState || 'Karnataka',
          items: []
        };
      }
      groups[sellerKey].items.push(item);
      return groups;
    }, {})
  ).map(group => {
    let maxShipping = 0;
    let isAnyUnserviceable = false;
    let formattedEstimate = '2-4 business days';
    let groupSubtotal = 0;

    group.items.forEach(i => {
      groupSubtotal += i.price * i.quantity;
      const est = shipmentEstimates[i.key];
      if (est) {
        if (!est.serviceable) isAnyUnserviceable = true;
        if (est.shippingCharge > maxShipping) maxShipping = est.shippingCharge;
        if (est.formattedEstimate) formattedEstimate = est.formattedEstimate;
      }
    });

    const isFree = groupSubtotal >= 1200;
    const finalShipping = isFree ? 0 : (maxShipping || 49);

    return {
      ...group,
      subtotal: groupSubtotal,
      shippingFee: finalShipping,
      isFreeShipping: isFree,
      isUnserviceable: isAnyUnserviceable,
      formattedEstimate
    };
  });

  const hasUnserviceableItem = shipmentGroups.some(g => g.isUnserviceable);
  const cartTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalShippingFee = shipmentGroups.reduce((acc, g) => acc + g.shippingFee, 0);

  const handleConfirmPreOrder = () => {
    if (cart.length === 0) return;

    if (hasUnserviceableItem) {
      showToast('Please remove items unserviceable for your delivery PIN before proceeding.');
      return;
    }

    // Determine verified delivery address snapshot
    const activeAddress = buyerAddresses.find(a => a.isDefault) || buyerAddresses[0] || {
      fullName: currentUser?.name || 'Customer',
      phone: currentUser?.phone || '',
      houseNo: '',
      street: '',
      area: deliveryLocation?.locality || '',
      landmark: '',
      pincode: deliveryLocation?.pincode || '560001',
      city: deliveryLocation?.district || 'Bengaluru',
      district: deliveryLocation?.district || 'Bengaluru',
      state: deliveryLocation?.state || 'Karnataka',
      addressType: 'Home'
    };

    const newOrder = addOrder({
      customer: {
        name: activeAddress.fullName || currentUser?.name || 'Customer',
        phone: activeAddress.phone || currentUser?.phone || '',
        address: `${activeAddress.houseNo ? activeAddress.houseNo + ', ' : ''}${activeAddress.street ? activeAddress.street + ', ' : ''}${activeAddress.area ? activeAddress.area + ', ' : ''}${activeAddress.city} - ${activeAddress.pincode}`,
        city: activeAddress.city,
        pincode: activeAddress.pincode
      },
      shippingAddress: activeAddress,
      deliveryEstimate: {
        formattedEstimate: shipmentGroups[0]?.formattedEstimate || '2-4 business days',
        totalShippingFee,
        deliveryPin: deliveryLocation?.pincode
      },
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        weight: item.weight,
        flavor: item.flavor,
        message: item.message,
        quantity: item.quantity,
        price: item.price,
        image: item.image,
        sellerId: item.sellerId,
        sellerName: item.sellerName,
        sellerDispatchPin: item.sellerDispatchPin,
        estimatedDelivery: shipmentEstimates[item.key]?.formattedEstimate || '2-4 business days'
      })),
      slotDate: cart[0]?.slotDate || 'Earliest Available Slot',
      deliveryType: 'Courier / Express Slot Delivery',
      specialInstructions: cart.map(i => i.message ? `Inscription: "${i.message}"` : '').filter(Boolean).join(' • '),
      subtotal: cartTotal,
      deliveryFee: totalShippingFee,
      totalAmount: cartTotal + totalShippingFee,
      paymentStatus: 'Paid (Escrow Secured)',
      status: 'Pending Confirmation'
    });

    setCart([]);
    setIsCartOpen(false);
    showToast(`Order #${newOrder.id} confirmed! Kitchen notified for slot.`);
    setIsMyOrdersOpen(true);
  };

  return (
    <div className="app-wrapper">
      {/* Toast Notification */}
      {notification && (
        <div className="toast-notification">
          <CheckCircle2 size={18} color="var(--color-success)" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Navigation Header with brand logo & role-based controls */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        cartCount={cartItemCount}
        wishlistCount={wishlist.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAuth={(_mode) => {
          if (currentUser) {
            setIsAccountOpen(true);
          } else {
            setIsAuthOpen(true);
          }
        }}
        onOpenSellerModal={() => setIsSellerModalOpen(true)}
        onOpenMyOrders={() => setIsMyOrdersOpen(true)}
        onNavigateSeller={() => {
          if (currentUser?.role === 'seller') {
            navigate('/seller');
          } else {
            // Switch role to seller or open creator studio
            switchRole('seller');
            navigate('/seller');
          }
        }}
        currentUser={currentUser}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      {/* Category Pills Slider */}
      <CategoryNav
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Hero Promotional Banner Showcase */}
      {selectedCategory === 'all' && !searchQuery && (
        <HeroBanners
          onSelectCategory={(catId) => setSelectedCategory(catId)}
          onOpenQuickBooking={() => {
            const firstPrebook = products.find((p) => p.isPreBookable);
            if (firstPrebook) handleOpenQuickView(firstPrebook);
          }}
        />
      )}

      {/* Trust & Guarantee Strip */}
      <TrustStrip />

      {/* Main Product Showcase Section (Preserved & Live Connected) */}
      <ProductSection
        products={products}
        searchQuery={searchQuery}
        selectedCategory={selectedCategory}
        onQuickView={handleOpenQuickView}
        onAddToCart={(prod) => handleAddToCart(prod)}
        wishlist={wishlist}
        onToggleWishlist={handleToggleWishlist}
      />

      {/* Creator Recruitment Strip */}
      <CreatorBanner onOpenSellerModal={() => {
        switchRole('seller');
        navigate('/seller');
      }} />

      {/* Footer with Branding, Guarantees and Navigation */}
      <Footer
        onSelectCategory={setSelectedCategory}
        onOpenSellerModal={() => {
          switchRole('seller');
          navigate('/seller');
        }}
      />

      {/* =========================================================================
          SLIDE-OVER CART DRAWER
         ========================================================================= */}
      {isCartOpen && (
        <div className="cart-drawer-backdrop" onClick={() => setIsCartOpen(false)}>
          <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="cart-drawer-header">
              <div className="cart-drawer-title">
                <ShoppingBag size={20} color="var(--color-yellow)" />
                <span>Your Pre-Order Cart ({cartItemCount})</span>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="btn-icon"
                style={{ color: '#FFFFFF' }}
                aria-label="Close cart"
              >
                <X size={20} />
              </button>
            </div>

            {/* Cart Delivery Destination Bar */}
            <div style={{
              background: '#F1F5F9',
              borderBottom: '1px solid #E2E8F0',
              padding: '10px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={16} color="var(--color-primary)" />
                <div style={{ fontSize: '0.8rem' }}>
                  <span style={{ color: '#64748B' }}>Deliver to: </span>
                  <strong style={{ color: 'var(--color-navy)' }}>
                    {deliveryLocation?.locality || deliveryLocation?.district || 'Bengaluru'} — {deliveryLocation?.pincode || '560001'}
                  </strong>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPincodeModalOpen(true)}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  color: 'var(--color-primary)',
                  fontSize: '0.725rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Change PIN
              </button>
            </div>

            {cart.length === 0 ? (
              <div style={{ padding: '60px 24px', textAlign: 'center' }}>
                <ShoppingBag size={48} color="var(--gray-300)" style={{ margin: '0 auto 16px' }} />
                <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Your cart is empty</h3>
                <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginBottom: '20px' }}>
                  Explore bespoke creations, freshly baked cakes, and artisan gifts.
                </p>
                <button
                  className="btn btn-primary"
                  onClick={() => setIsCartOpen(false)}
                >
                  Start Exploring
                </button>
              </div>
            ) : (
              <>
                <div className="cart-items-list">
                  {hasUnserviceableItem && (
                    <div style={{
                      background: 'rgba(239, 68, 68, 0.08)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '8px',
                      padding: '12px 14px',
                      margin: '12px 18px 0',
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
                      margin: '12px 18px',
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
                                    <button className="qty-btn" onClick={() => handleUpdateQty(item.key, -1)}>-</button>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 700, padding: '0 6px' }}>{item.quantity}</span>
                                    <button className="qty-btn" onClick={() => handleUpdateQty(item.key, 1)}>+</button>
                                  </div>
                                  <button 
                                    onClick={() => handleRemoveFromCart(item.key)}
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

                <div className="cart-drawer-footer">
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
                    onClick={handleConfirmPreOrder}
                  >
                    {hasUnserviceableItem ? 'Resolve Unserviceable Items' : 'Confirm & Reserve Slot'}
                    <ArrowRight size={18} />
                  </button>
                  <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '10px' }}>
                    100% Encrypted UPI / Card Checkout via Razorpay
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          PRODUCT CUSTOMIZATION & PRE-BOOKING MODAL (QUICK VIEW)
         ========================================================================= */}
      {quickViewProduct && (
        <div className="modal-backdrop" onClick={handleCloseQuickView}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close-btn"
              onClick={handleCloseQuickView}
              aria-label="Close dialog"
            >
              <X size={20} />
            </button>

            <div className="quickview-layout">
              {/* Product Gallery */}
              <div className="quickview-gallery">
                <img 
                  src={quickViewProduct.images?.[0] || ''} 
                  alt={quickViewProduct.name} 
                />
                <div style={{
                  marginTop: '16px',
                  padding: '12px',
                  background: 'var(--gray-50)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <ShieldCheck size={20} color="var(--color-primary)" />
                  <span style={{ fontSize: '0.8rem', color: 'var(--gray-700)' }}>
                    Handcrafted freshly upon booking by <strong>{quickViewProduct.seller?.name || quickViewProduct.sellerName || 'Verified Artisan'}</strong>.
                  </span>
                </div>
              </div>

              {/* Product Options */}
              <div className="quickview-details">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--color-primary)',
                    background: 'var(--color-primary-light)',
                    padding: '3px 8px',
                    borderRadius: '4px'
                  }}>
                    {quickViewProduct.categoryName}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', color: '#059669', fontWeight: 700 }}>
                    <Star size={14} fill="#059669" />
                    <span>{quickViewProduct.rating || '5.0'} ({quickViewProduct.reviewCount || 0} reviews)</span>
                  </div>
                </div>

                <h2 className="quickview-title">{quickViewProduct.name}</h2>
                <p style={{ fontSize: '0.9rem', color: 'var(--gray-600)', marginBottom: '14px', lineHeight: 1.5 }}>
                  {quickViewProduct.shortDesc}
                </p>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--color-navy)' }}>
                    ₹{quickViewProduct.price.toLocaleString('en-IN')}
                  </span>
                  {quickViewProduct.originalPrice && (
                    <span style={{ textDecoration: 'line-through', color: 'var(--gray-400)', fontSize: '1.1rem' }}>
                      ₹{quickViewProduct.originalPrice.toLocaleString('en-IN')}
                    </span>
                  )}
                  {quickViewProduct.discount && (
                    <span style={{ color: '#059669', fontWeight: 800, fontSize: '0.85rem' }}>
                      {quickViewProduct.discount}
                    </span>
                  )}
                </div>

                {/* Real-time Delivery Estimation Box */}
                <div style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  marginBottom: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: '#475569' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={14} color="var(--color-primary)" />
                      <span>
                        Ships from: <strong>{quickViewProduct.sellerDispatchCity || 'Bengaluru'}, {quickViewProduct.sellerDispatchState || 'Karnataka'}</strong>
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={14} color="#059669" />
                      <span>Prep time: <strong>{quickViewProduct.preparationDays ?? 1} day(s)</strong></span>
                    </div>
                  </div>

                  {/* Delivery Estimate to Current Location */}
                  <div style={{
                    background: quickViewEstimate?.serviceable ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                    border: quickViewEstimate?.serviceable ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(239, 68, 68, 0.25)',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {quickViewEstimate?.serviceable ? (
                        <Truck size={16} color="#10B981" />
                      ) : (
                        <AlertCircle size={16} color="#EF4444" />
                      )}
                      <div style={{ fontSize: '0.8rem' }}>
                        {quickViewEstimate?.serviceable ? (
                          <div>
                            <span style={{ color: '#065F46', fontWeight: 700 }}>
                              Estimated Delivery: {quickViewEstimate.formattedEstimate}
                            </span>
                            <span style={{ color: '#64748B', marginLeft: '6px', fontSize: '0.75rem' }}>
                              ({quickViewEstimate.zone} • {quickViewEstimate.shippingCharge === 0 ? 'FREE' : `₹${quickViewEstimate.shippingCharge}`})
                            </span>
                          </div>
                        ) : (
                          <span style={{ color: '#991B1B', fontWeight: 600 }}>
                            {quickViewEstimate?.message || 'Delivery estimate unavailable for this PIN'}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsPincodeModalOpen(true)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-primary)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                    >
                      PIN: {deliveryLocation?.pincode || 'Select'}
                    </button>
                  </div>
                </div>

                {/* Custom Options (Weight, Flavor, Inscription) */}
                <div className="quickview-customization-section">
                  {quickViewProduct.customOptions?.weights && (
                    <div style={{ marginBottom: '14px' }}>
                      <label className="custom-option-label">Select Size / Quantity</label>
                      <div className="chip-options-row">
                        {quickViewProduct.customOptions.weights.map((w) => (
                          <button
                            key={w}
                            type="button"
                            className={`chip-option-btn ${selectedWeight === w ? 'selected' : ''}`}
                            onClick={() => setSelectedWeight(w)}
                          >
                            {w}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {quickViewProduct.customOptions?.flavors && (
                    <div style={{ marginBottom: '14px' }}>
                      <label className="custom-option-label">Select Flavor / Variant</label>
                      <div className="chip-options-row">
                        {quickViewProduct.customOptions.flavors.map((f) => (
                          <button
                            key={f}
                            type="button"
                            className={`chip-option-btn ${selectedFlavor === f ? 'selected' : ''}`}
                            onClick={() => setSelectedFlavor(f)}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {quickViewProduct.customOptions?.allowMessage && (
                    <div style={{ marginBottom: '14px' }}>
                      <label className="custom-option-label">Message / Cake Inscription (Optional)</label>
                      <input
                        type="text"
                        className="custom-input-text"
                        placeholder="e.g., Happy 25th Birthday Rhea!"
                        value={customMessage}
                        onChange={(e) => setCustomMessage(e.target.value)}
                      />
                    </div>
                  )}

                  {/* Pre-Booking Delivery Date Picker */}
                  {quickViewProduct.isPreBookable && (
                    <div>
                      <label className="custom-option-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Calendar size={14} color="var(--color-primary)" />
                        Select Desired Delivery / Pickup Date
                      </label>
                      <input
                        type="date"
                        className="custom-input-text"
                        value={deliveryDate}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setDeliveryDate(e.target.value)}
                      />
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
                  <button
                    className="btn btn-primary"
                    style={{ flex: 1, padding: '14px' }}
                    onClick={() => {
                      handleAddToCart(quickViewProduct, {
                        weight: selectedWeight,
                        flavor: selectedFlavor,
                        message: customMessage,
                        slotDate: deliveryDate
                      });
                      handleCloseQuickView();
                    }}
                  >
                    <ShoppingBag size={18} />
                    Add to Cart & Select Slot
                  </button>
                  <button
                    className="btn btn-outline"
                    onClick={() => handleToggleWishlist(quickViewProduct)}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SELLER / CREATOR ONBOARDING MODAL
         ========================================================================= */}
      {isSellerModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsSellerModalOpen(false)}>
          <div className="auth-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close-btn"
              onClick={() => setIsSellerModalOpen(false)}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div className="brand-logo-mark" style={{ width: '54px', height: '54px', margin: '0 auto 12px' }}>
                <img src="/brand-logo.png" alt="Orzimo" className="brand-logo-img" />
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-navy)' }}>
                Become an Orzimo Creator
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginTop: 4 }}>
                Join thousands of local home bakers, crafters & artisans in your city.
              </p>
            </div>

            <form className="auth-form" onSubmit={(e) => {
              e.preventDefault();
              switchRole('seller');
              setIsSellerModalOpen(false);
              navigate('/seller');
            }}>
              <div className="form-group">
                <label>Brand / Bakery / Shop Name</label>
                <input required className="form-input" placeholder="e.g. Maya's Artisan Patisserie" />
              </div>
              <div className="form-group">
                <label>Primary Craft Category</label>
                <select className="form-input" required>
                  <option value="cakes-bakery">Homemade Cakes & Bakery</option>
                  <option value="handmade-gifts">Handmade Custom Gifts</option>
                  <option value="scented-candles">Aromatic Soy Candles</option>
                  <option value="handmade-jewellery">Handcrafted Jewellery</option>
                  <option value="traditional-sweets">Traditional Sweets & Mithai</option>
                  <option value="artisan-crafts">Artisan Home Decor</option>
                </select>
              </div>
              <div className="form-group">
                <label>City & Neighborhood</label>
                <input required className="form-input" placeholder="e.g. Indiranagar, Bengaluru" />
              </div>
              <div className="form-group">
                <label>WhatsApp / Phone Number</label>
                <input required type="tel" className="form-input" placeholder="+91 98765 43210" />
              </div>

              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '8px' }}>
                <Store size={18} />
                Open My Creator Studio
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          BUYER ACCOUNT & LOGOUT MODAL
         ========================================================================= */}
      <AccountModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        onOpenOrders={() => setIsMyOrdersOpen(true)}
        onOpenSellerModal={() => {
          switchRole('seller');
          navigate('/seller');
        }}
      />

      {/* =========================================================================
          ROLE-BASED AUTH MODAL
         ========================================================================= */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoggedIn={(role) => {
          showToast(`Logged in successfully as ${role === 'seller' ? 'Seller' : 'Buyer'}!`);
          if (role === 'seller') {
            navigate('/seller');
          }
        }}
      />

      {/* =========================================================================
          BUYER PRE-ORDER TRACKING MODAL
         ========================================================================= */}
      <MyOrdersModal
        isOpen={isMyOrdersOpen}
        onClose={() => setIsMyOrdersOpen(false)}
      />

      {/* =========================================================================
          PINCODE VERIFICATION & LOCATION CHANGE MODAL
         ========================================================================= */}
      <PincodeChangeModal
        isOpen={isPincodeModalOpen}
        onClose={() => setIsPincodeModalOpen(false)}
        currentLocation={deliveryLocation}
        onLocationChanged={updateDeliveryLocation}
        savedAddresses={buyerAddresses}
        onOpenAddAddressModal={() => setIsAddressFormModalOpen(true)}
      />

      {/* =========================================================================
          ADD/EDIT BUYER DELIVERY ADDRESS MODAL (11 MANDATORY FIELDS)
         ========================================================================= */}
      <AddressFormModal
        isOpen={isAddressFormModalOpen}
        onClose={() => setIsAddressFormModalOpen(false)}
        onSaveAddress={addOrUpdateBuyerAddress}
      />
    </div>
  );
}
