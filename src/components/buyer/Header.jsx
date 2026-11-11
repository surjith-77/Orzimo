import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  ShoppingCart, 
  Heart, 
  User, 
  MapPin, 
  Store, 
  Package, 
  X, 
  Sparkles,
  TrendingUp,
  Clock
} from 'lucide-react';
import { SEARCH_SUGGESTIONS } from '../../data/products';
import { useMarketplace } from '../../context/MarketplaceContext';
import PincodeChangeModal from '../common/PincodeChangeModal';
import AddressFormModal from '../common/AddressFormModal';

export default function Header({ 
  searchQuery, 
  setSearchQuery, 
  cartCount, 
  wishlistCount, 
  onOpenCart, 
  onOpenAuth, 
  onOpenSellerModal,
  onOpenMyOrders,
  onOpenWishlist,
  onNavigateSeller,
  currentUser,
  selectedCategory,
  setSelectedCategory
}) {
  const { 
    deliveryLocation, 
    updateDeliveryLocation, 
    buyerAddresses, 
    addOrUpdateBuyerAddress 
  } = useMarketplace();

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isPincodeModalOpen, setIsPincodeModalOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const searchRef = useRef(null);

  // Close suggestions on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (!recentSearches.includes(searchQuery.trim())) {
        setRecentSearches(prev => [searchQuery.trim(), ...prev.slice(0, 3)]);
      }
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (suggestion) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    if (!recentSearches.includes(suggestion)) {
      setRecentSearches(prev => [suggestion, ...prev.slice(0, 3)]);
    }
  };

  const locationText = deliveryLocation?.locality || deliveryLocation?.district || 'India';
  const pinText = deliveryLocation?.pincode || '638701';

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="top-announcement">
        <div className="container announcement-inner">
          <div className="announcement-left">
            <span className="announcement-tag">NEW</span>
            <span>Pre-book custom cakes, personalized gifts & artisanal foods 24h in advance!</span>
          </div>
          <div className="announcement-links">
            <button onClick={onOpenSellerModal} style={{ color: 'var(--color-yellow)', fontWeight: 600 }}>
              Sell on Orzimo
            </button>
            <span style={{ opacity: 0.4 }}>|</span>
            <a href="#support">Help & Support</a>
            <span style={{ opacity: 0.4 }}>|</span>
            <span>Official Domain: <strong>orzimo.in</strong></span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="site-header">
        <div className="container header-main">
          {/* Brand Logo with circular checkmark */}
          <a href="#" className="brand-link" onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}>
            <div className="brand-logo-mark">
              <img 
                src="/brand-logo.png" 
                alt="ORZIMO" 
                className="brand-logo-img"
              />
            </div>
            <div className="brand-text-block">
              <span className="brand-name">ORZIMO</span>
              <span className="brand-tagline">CREATOR MARKETPLACE</span>
            </div>
          </a>

          {/* Location Picker with Indian PIN code verification */}
          <div 
            className="location-selector" 
            title="Click to check or change your Indian delivery PIN code"
            onClick={() => setIsPincodeModalOpen(true)}
            style={{ cursor: 'pointer' }}
            role="button"
            tabIndex={0}
          >
            <MapPin size={18} color="var(--color-yellow)" />
            <div className="location-text">
              <span className="location-label">Deliver to</span>
              <span className="location-city">
                {locationText} — <strong style={{ color: '#FFFFFF' }}>{pinText}</strong>
                <span style={{ 
                  color: 'var(--color-yellow)', 
                  fontSize: '0.75rem', 
                  marginLeft: 6, 
                  fontWeight: 800,
                  textDecoration: 'underline'
                }}>
                  [Change]
                </span>
              </span>
            </div>
          </div>

          {/* Flipkart-Style Search Bar */}
          <div className="search-container" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="search-box">
              <div className="search-icon-wrapper">
                <Search size={20} />
              </div>
              <input
                type="text"
                className="search-input"
                placeholder="Search for homemade cakes, custom gifts, artisan bakes, pickles..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
              />
              {searchQuery && (
                <button 
                  type="button" 
                  className="search-clear-btn"
                  onClick={() => setSearchQuery('')}
                  title="Clear search"
                >
                  <X size={18} />
                </button>
              )}
              <button type="submit" className="search-submit-btn">
                Search
              </button>
            </form>

            {/* Suggestions Popover */}
            {showSuggestions && (
              <div className="search-suggestions-popover">
                {recentSearches.length > 0 && (
                  <div>
                    <div className="suggestions-header">
                      <span><Clock size={12} style={{ display: 'inline', marginRight: 4 }} /> Recent Searches</span>
                    </div>
                    {recentSearches.map((item, idx) => (
                      <div 
                        key={`recent-${idx}`} 
                        className="suggestion-item"
                        onClick={() => handleSelectSuggestion(item)}
                      >
                        <div className="suggestion-left">
                          <Clock size={14} color="var(--gray-400)" />
                          <span>{item}</span>
                        </div>
                        <span className="suggestion-tag">Recent</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="suggestions-header">
                  <span><TrendingUp size={12} style={{ display: 'inline', marginRight: 4 }} /> Popular on Orzimo</span>
                </div>
                {SEARCH_SUGGESTIONS.slice(0, 5).map((item, idx) => (
                  <div 
                    key={`popular-${idx}`} 
                    className="suggestion-item"
                    onClick={() => handleSelectSuggestion(item)}
                  >
                    <div className="suggestion-left">
                      <Sparkles size={14} color="var(--color-primary)" />
                      <span>{item}</span>
                    </div>
                    <span className="suggestion-tag">Trending</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Header Action Items */}
          <div className="header-actions">
            {/* Become a Seller / Switch to Creator Studio */}
            <button 
              className="seller-onboard-cta" 
              onClick={onNavigateSeller || onOpenSellerModal}
              title={currentUser?.role === 'seller' ? "Go to Creator Studio Dashboard" : "Register as a home baker or artisan"}
            >
              <Store size={18} color="var(--color-yellow)" />
              <span>{currentUser?.role === 'seller' ? 'Creator Studio' : 'Become a Seller'}</span>
            </button>

            {/* Orders Section */}
            <button 
              className="nav-action-btn"
              onClick={onOpenMyOrders || (() => onOpenAuth('orders'))}
              title="Track existing orders and bookings"
            >
              <Package size={22} />
              <span>Orders</span>
            </button>

            {/* Wishlist */}
            <button 
              className="nav-action-btn"
              onClick={onOpenWishlist || (() => onOpenAuth('wishlist'))}
              title="View your saved products"
            >
              <Heart size={22} />
              <span>Wishlist</span>
              {wishlistCount > 0 && (
                <span className="nav-icon-badge">{wishlistCount}</span>
              )}
            </button>

            {/* Shopping Cart */}
            <button 
              className="nav-action-btn"
              onClick={onOpenCart}
              title="View shopping cart"
            >
              <ShoppingCart size={22} />
              <span>Cart</span>
              {cartCount > 0 && (
                <span className="nav-icon-badge">{cartCount}</span>
              )}
            </button>

            {/* Sign In / User Profile */}
            <div className="auth-btn-group">
              {currentUser ? (
                <button 
                  className="login-btn"
                  onClick={() => onOpenAuth('account')}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px' }}
                >
                  <span style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: currentUser.role === 'seller' ? 'var(--color-yellow)' : 'var(--color-primary)',
                    color: currentUser.role === 'seller' ? '#212121' : '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    fontWeight: 800
                  }}>
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                  </span>
                  <span style={{ maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {currentUser.name.split(' ')[0]}
                  </span>
                  <span style={{ 
                    fontSize: '0.65rem', 
                    background: currentUser.role === 'seller' ? 'var(--color-yellow)' : 'var(--color-primary)', 
                    color: currentUser.role === 'seller' ? '#212121' : '#FFFFFF',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontWeight: 800
                  }}>
                    {currentUser.role === 'seller' ? 'SELLER' : 'BUYER'}
                  </span>
                </button>
              ) : (
                <button 
                  className="login-btn"
                  onClick={() => onOpenAuth('login')}
                >
                  <User size={16} style={{ display: 'inline', marginRight: 6 }} />
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* PIN Code Change Modal */}
      <PincodeChangeModal
        isOpen={isPincodeModalOpen}
        onClose={() => setIsPincodeModalOpen(false)}
        currentLocation={deliveryLocation}
        onLocationChanged={updateDeliveryLocation}
        savedAddresses={buyerAddresses}
        onOpenAddAddressModal={() => setIsAddressModalOpen(true)}
      />

      {/* Add New Verified Address Modal */}
      <AddressFormModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onSaveAddress={addOrUpdateBuyerAddress}
        title="Add Verified Delivery Address"
      />
    </>
  );
}
