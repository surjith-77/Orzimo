import React, { useState, useEffect } from 'react';
import { 
  Star, 
  Heart, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Sparkles, 
  Truck, 
  MapPin, 
  AlertCircle 
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { calculateDeliveryEstimate } from '../../services/deliveryService';

export default function ProductCard({ 
  product, 
  onQuickView, 
  onAddToCart, 
  isWishlisted, 
  onToggleWishlist 
}) {
  const { deliveryLocation } = useMarketplace();
  const [deliveryInfo, setDeliveryInfo] = useState(null);

  const seller = product.seller || {};
  const hasRating = product.reviewCount > 0;
  const imageSrc = product.images?.[0] || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80';

  const prepDays = product.preparationDays !== undefined ? product.preparationDays : 1;
  const dispatchCity = product.sellerDispatchCity || seller.dispatchCity || seller.location?.split(',')[0] || 'Studio';

  // Recalculate real delivery estimate when deliveryLocation or product changes
  useEffect(() => {
    let isCancelled = false;

    async function checkEstimate() {
      const sellerDispatch = {
        pincode: product.sellerDispatchPin || seller.dispatchPin || '',
        district: seller.dispatchDistrict || seller.location || '',
        state: seller.dispatchState || '',
        city: dispatchCity
      };

      const estimate = await calculateDeliveryEstimate({
        product,
        sellerDispatch,
        buyerDelivery: deliveryLocation
      });

      if (!isCancelled) {
        setDeliveryInfo(estimate);
      }
    }

    checkEstimate();
    return () => { isCancelled = true; };
  }, [product, deliveryLocation, dispatchCity, product.sellerId, product.sellerDispatchPin]);

  return (
    <article className="product-card" id={`product-${product.id}`}>
      {/* Product Image & Badges */}
      <div className="product-image-wrap" onClick={() => onQuickView(product)}>
        <img 
          src={imageSrc} 
          alt={product.name} 
          className="product-image"
          loading="lazy"
        />

        {/* Badges on image */}
        <div className="product-tag-slot">
          {product.isPreBookable && (
            <span className="tag-prebook">
              <Calendar size={11} style={{ display: 'inline', marginRight: 3 }} />
              PRE-BOOK SLOT
            </span>
          )}
          {product.isCustomizable && (
            <span className="tag-custom">
              <Sparkles size={11} style={{ display: 'inline', marginRight: 3 }} />
              CUSTOMIZABLE
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button 
          type="button" 
          className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product);
          }}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart size={18} fill={isWishlisted ? "#EF4444" : "none"} />
        </button>
      </div>

      {/* Card Content */}
      <div className="product-card-body">
        {/* Creator / Studio attribution & Dispatch Location */}
        <div className="creator-info-row">
          <span className="creator-shop-name" title={seller.name || 'Artisan'}>
            {seller.name || 'Local Artisan'}
            {seller.verified && (
              <CheckCircle2 size={13} className="creator-verified-badge" />
            )}
          </span>
          <span className="creator-location" title={`Ships from ${dispatchCity}`}>
            <MapPin size={11} style={{ display: 'inline', marginRight: 2 }} />
            {dispatchCity}
          </span>
        </div>

        {/* Product Title */}
        <h3 
          className="product-title" 
          onClick={() => onQuickView(product)}
          title={product.name}
        >
          {product.name}
        </h3>

        {/* Star Rating & Preparation Time */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div className="product-rating-row" style={{ margin: 0 }}>
            {hasRating ? (
              <>
                <span className="rating-badge">
                  {product.rating} <Star size={11} fill="#FFFFFF" />
                </span>
                <span className="rating-count">({product.reviewCount})</span>
              </>
            ) : (
              <span style={{ 
                fontSize: '0.7rem', 
                color: 'var(--color-primary)', 
                background: 'var(--color-primary-light)', 
                padding: '2px 6px', 
                borderRadius: '4px',
                fontWeight: 700 
              }}>
                Fresh Creation
              </span>
            )}
          </div>

          <span style={{
            fontSize: '0.7rem',
            color: '#475569',
            background: '#F1F5F9',
            padding: '2px 6px',
            borderRadius: 4,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 3
          }} title="Seller preparation & crafting time">
            <Clock size={11} /> Prep: {prepDays}d
          </span>
        </div>

        {/* Price Row */}
        <div className="product-price-row">
          <span className="current-price">₹{Number(product.price).toLocaleString('en-IN')}</span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="original-price">₹{Number(product.originalPrice).toLocaleString('en-IN')}</span>
          )}
          {product.discount && (
            <span className="discount-badge">{product.discount}</span>
          )}
        </div>

        {/* Real-time Delivery Serviceability & Estimated Date */}
        <div style={{
          fontSize: '0.725rem',
          padding: '6px 8px',
          borderRadius: 'var(--radius-sm)',
          margin: '6px 0 10px',
          background: deliveryInfo?.serviceable ? '#F0FDF4' : '#FEF2F2',
          border: deliveryInfo?.serviceable ? '1px solid #BBF7D0' : '1px solid #FECACA',
          color: deliveryInfo?.serviceable ? '#166534' : '#991B1B',
          display: 'flex',
          alignItems: 'center',
          gap: 6
        }}>
          {deliveryInfo?.serviceable ? (
            <>
              <Truck size={14} color="#16A34A" style={{ flexShrink: 0 }} />
              <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                Delivery by <strong>{deliveryInfo.formattedEstimate}</strong>
                {deliveryInfo.shippingCharge === 0 ? (
                  <span style={{ color: '#16A34A', fontWeight: 800, marginLeft: 4 }}>• FREE</span>
                ) : (
                  <span style={{ color: '#475569', marginLeft: 4 }}>• ₹{deliveryInfo.shippingCharge}</span>
                )}
              </div>
            </>
          ) : (
            <>
              <AlertCircle size={14} color="#DC2626" style={{ flexShrink: 0 }} />
              <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {deliveryInfo?.message || 'Unserviceable for PIN'}
              </div>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="card-actions-row">
          <button 
            type="button" 
            className="btn-add-cart"
            onClick={() => onAddToCart(product)}
            disabled={product.isOutOfStock || (deliveryInfo && !deliveryInfo.serviceable)}
            title={deliveryInfo && !deliveryInfo.serviceable ? "Not deliverable to your selected PIN code" : "Add to cart"}
          >
            {product.isOutOfStock 
              ? 'Sold Out' 
              : deliveryInfo && !deliveryInfo.serviceable 
                ? 'Unavailable for PIN' 
                : 'Pre-Book Slot'}
          </button>
          <button 
            type="button" 
            className="btn-quick-view"
            onClick={() => onQuickView(product)}
          >
            Customise
          </button>
        </div>
      </div>
    </article>
  );
}
