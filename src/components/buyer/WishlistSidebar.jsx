import React, { useState } from 'react';
import {
  Heart,
  ShoppingBag,
  Trash2,
  Store,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  Loader2
} from 'lucide-react';
import SidebarDrawer from '../common/SidebarDrawer';
import { useMarketplace } from '../../context/MarketplaceContext';

export default function WishlistSidebar({
  isOpen,
  onClose,
  onAddToCart,
  onProductClick
}) {
  const { wishlist, isWishlistLoading, removeFromWishlist } = useMarketplace();
  const [removingId, setRemovingId] = useState(null);
  const [addedIds, setAddedIds] = useState({});

  const handleRemove = async (productId) => {
    try {
      setRemovingId(productId);
      await removeFromWishlist(productId);
    } finally {
      setRemovingId(null);
    }
  };

  const handleAddToCart = (product) => {
    if (onAddToCart) {
      onAddToCart(product);
      setAddedIds(prev => ({ ...prev, [product.id]: true }));
      setTimeout(() => {
        setAddedIds(prev => ({ ...prev, [product.id]: false }));
      }, 2000);
    }
  };

  const wishlistCount = wishlist?.length || 0;

  return (
    <SidebarDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="My Wishlist"
      subtitle="Products you've saved for later"
      icon={<Heart size={20} color="var(--color-yellow)" fill="var(--color-yellow)" />}
      badge={wishlistCount > 0 ? `(${wishlistCount})` : null}
      ariaLabel="My Wishlist Sidebar"
    >
      {isWishlistLoading ? (
        <div className="wishlist-loading-state">
          <Loader2 size={36} className="spinner" color="var(--color-primary)" />
          <p>Loading your saved creations...</p>
        </div>
      ) : wishlistCount === 0 ? (
        <div className="wishlist-empty-state">
          <div className="wishlist-empty-icon-box">
            <Heart size={52} strokeWidth={1.5} color="var(--gray-400)" />
          </div>
          <h3 className="wishlist-empty-title">Your wishlist is empty</h3>
          <p className="wishlist-empty-desc">
            Save products you love to find them here.
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
        <div className="wishlist-items-list">
          {wishlist.map((product) => {
            const isOutOfStock = Boolean(product.isOutOfStock || product.stockQuantity === 0);
            const isPreBookable = Boolean(product.isPreBookable);
            const sellerName = product.seller?.name || product.sellerName || 'Verified Artisan';
            const productImage = product.images?.[0] || product.image || '';
            const isRemoving = removingId === product.id;
            const isRecentlyAdded = Boolean(addedIds[product.id]);

            return (
              <div
                key={product.id}
                className={`wishlist-item-card ${isRemoving ? 'is-removing' : ''}`}
              >
                {/* Product Thumbnail */}
                <div
                  className="wishlist-item-image-wrap"
                  onClick={() => onProductClick && onProductClick(product)}
                  style={{ cursor: onProductClick ? 'pointer' : 'default' }}
                >
                  {productImage ? (
                    <img
                      src={productImage}
                      alt={product.name}
                      className="wishlist-item-img"
                    />
                  ) : (
                    <div className="wishlist-item-placeholder">
                      <ShoppingBag size={24} color="var(--gray-400)" />
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="wishlist-item-details">
                  <div className="wishlist-item-header">
                    <h4
                      className="wishlist-item-name"
                      title={product.name}
                      onClick={() => onProductClick && onProductClick(product)}
                      style={{ cursor: onProductClick ? 'pointer' : 'default' }}
                    >
                      {product.name}
                    </h4>

                    {/* Remove Icon Button */}
                    <button
                      type="button"
                      className="wishlist-remove-btn"
                      onClick={() => handleRemove(product.id)}
                      disabled={isRemoving}
                      title="Remove from wishlist"
                      aria-label={`Remove ${product.name} from wishlist`}
                    >
                      {isRemoving ? (
                        <Loader2 size={15} className="spinner" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>

                  {/* Seller Attribution */}
                  <div className="wishlist-seller-row">
                    <Store size={12} color="var(--gray-500)" />
                    <span className="wishlist-seller-name">{sellerName}</span>
                  </div>

                  {/* Pricing and Availability */}
                  <div className="wishlist-pricing-status-row">
                    <div className="wishlist-price-group">
                      <span className="wishlist-current-price">
                        ₹{(product.price || 0).toLocaleString('en-IN')}
                      </span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="wishlist-original-price">
                          ₹{product.originalPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>

                    {/* Availability Status Badge */}
                    <div className="wishlist-status-badge-container">
                      {isOutOfStock ? (
                        <span className="wishlist-status-pill out-of-stock">
                          <AlertCircle size={11} />
                          Out of Stock
                        </span>
                      ) : isPreBookable ? (
                        <span className="wishlist-status-pill pre-order">
                          <Clock size={11} />
                          Pre-Order
                        </span>
                      ) : (
                        <span className="wishlist-status-pill in-stock">
                          <CheckCircle2 size={11} />
                          In Stock
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bottom Action Row: Add to Cart */}
                  <div className="wishlist-card-bottom-actions">
                    <button
                      type="button"
                      className={`btn btn-sm ${isRecentlyAdded ? 'btn-success' : 'btn-primary'} wishlist-add-cart-btn`}
                      onClick={() => handleAddToCart(product)}
                      disabled={isOutOfStock || isRemoving}
                    >
                      {isRecentlyAdded ? (
                        <>
                          <CheckCircle2 size={14} />
                          Added to Cart
                        </>
                      ) : isOutOfStock ? (
                        'Currently Unavailable'
                      ) : (
                        <>
                          <ShoppingBag size={14} />
                          Add to Cart
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </SidebarDrawer>
  );
}

