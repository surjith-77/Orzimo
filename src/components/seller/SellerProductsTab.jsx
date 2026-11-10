import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Star, 
  Calendar, 
  Clock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Layers, 
  Search,
  ShieldAlert
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { useAuth } from '../../context/AuthContext';
import SellerAddProductModal from './SellerAddProductModal';
import SellerEditProductModal from './SellerEditProductModal';
import SellerAddressSetupModal from './SellerAddressSetupModal';

export default function SellerProductsTab({ onOpenAddressSetup }) {
  const { 
    products, 
    deleteProduct, 
    toggleProductAvailability,
    isSellerAddressVerified,
    sellerAddress,
    updateSellerAddressData
  } = useMarketplace();
  const { currentUser } = useAuth();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [internalAddressModalOpen, setInternalAddressModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const openAddressModal = () => {
    if (onOpenAddressSetup) {
      onOpenAddressSetup();
    } else {
      setInternalAddressModalOpen(true);
    }
  };

  // Filter products belonging to current seller
  const sellerProducts = products.filter(p => !p.sellerId || !currentUser?.id || p.sellerId === currentUser.id);

  const filteredProducts = sellerProducts.filter((prod) => {
    // Filter tags
    if (selectedFilter === 'cakes' && prod.categoryId !== 'cakes-bakery') return false;
    if (selectedFilter === 'prebook' && !prod.isPreBookable) return false;
    if (selectedFilter === 'instock' && prod.isOutOfStock) return false;
    if (selectedFilter === 'outofstock' && !prod.isOutOfStock) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = prod.name?.toLowerCase().includes(q);
      const matchCat = prod.categoryName?.toLowerCase().includes(q);
      if (!matchName && !matchCat) return false;
    }

    return true;
  });

  const handleDelete = (prod) => {
    if (window.confirm(`Are you sure you want to remove "${prod.name}" from your active creations?`)) {
      deleteProduct(prod.id);
    }
  };

  return (
    <div className="seller-panel">
      {/* Address Verification Mandatory Notice */}
      {!isSellerAddressVerified ? (
        <div style={{
          background: 'var(--color-danger-bg)',
          borderBottom: '1px solid rgba(198, 40, 40, 0.35)',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <ShieldAlert size={24} color="var(--color-danger)" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ color: 'var(--color-danger)', fontWeight: 800, fontSize: '0.9rem' }}>
                Address Setup Incomplete — Product Publishing Locked
              </div>
              <div style={{ color: 'var(--color-text-primary)', fontSize: '0.825rem', marginTop: 2, fontWeight: 500 }}>
                Please provide and verify your commercial business PIN and dispatch PIN with India Post to enable live customer ordering.
              </div>
            </div>
          </div>
          <button 
            type="button"
            className="btn btn-primary btn-sm"
            onClick={openAddressModal}
            style={{ fontWeight: 800 }}
          >
            Configure Business & Dispatch Address
          </button>
        </div>
      ) : (
        <div style={{
          background: 'var(--color-success-bg)',
          borderBottom: '1px solid rgba(21, 128, 61, 0.3)',
          padding: '10px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.8rem',
          color: 'var(--color-success)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle2 size={16} color="var(--color-success)" />
            <span style={{ color: 'var(--color-text-primary)' }}>
              Verified Dispatch Location: <strong style={{ color: 'var(--color-success)' }}>{sellerAddress?.dispatchAddress?.city || sellerAddress?.dispatchAddress?.district || 'India'} ({sellerAddress?.dispatchAddress?.pincode})</strong>
            </span>
          </div>
          <button 
            type="button" 
            onClick={openAddressModal}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-primary)',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.75rem',
              textDecoration: 'underline'
            }}
          >
            Update Address
          </button>
        </div>
      )}

      {/* Header */}
      <div className="seller-panel-header">
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--color-text-primary)' }}>
            My Active Creations & Menu ({sellerProducts.length})
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', margin: '4px 0 0' }}>
            Add, edit, remove creations and toggle live customer ordering availability
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button 
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus size={18} />
            Add New Creation
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ padding: '16px 24px 0', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          <div className="seller-filter-tabs">
            <button 
              className={`seller-filter-btn ${selectedFilter === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedFilter('all')}
            >
              All Items ({sellerProducts.length})
            </button>
            <button 
              className={`seller-filter-btn ${selectedFilter === 'cakes' ? 'active' : ''}`}
              onClick={() => setSelectedFilter('cakes')}
            >
              Cakes & Bakery
            </button>
            <button 
              className={`seller-filter-btn ${selectedFilter === 'prebook' ? 'active' : ''}`}
              onClick={() => setSelectedFilter('prebook')}
            >
              Pre-Book Slot Required
            </button>
            <button 
              className={`seller-filter-btn ${selectedFilter === 'instock' ? 'active' : ''}`}
              onClick={() => setSelectedFilter('instock')}
            >
              In Stock ({sellerProducts.filter(p => !p.isOutOfStock).length})
            </button>
            <button 
              className={`seller-filter-btn ${selectedFilter === 'outofstock' ? 'active' : ''}`}
              onClick={() => setSelectedFilter('outofstock')}
            >
              Paused / Sold Out ({sellerProducts.filter(p => p.isOutOfStock).length})
            </button>
          </div>

          <div style={{ position: 'relative', width: '240px' }}>
            <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
            <input 
              type="text" 
              className="seller-form-input" 
              style={{ padding: '8px 12px 8px 32px', fontSize: '0.8rem' }}
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Grid of Products or Empty State */}
      <div style={{ padding: '24px' }}>
        {filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-text-secondary)' }}>
            <Layers size={48} color="var(--color-text-secondary)" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ color: 'var(--color-text-primary)', fontSize: '1.1rem', marginBottom: 6 }}>
              {sellerProducts.length === 0 ? 'No creations in your studio yet' : 'No items match your search filter'}
            </h3>
            <p style={{ fontSize: '0.85rem', maxWidth: 400, margin: '0 auto 16px', color: 'var(--color-text-secondary)' }}>
              {sellerProducts.length === 0 
                ? 'Your catalog is clean. Add your first signature homemade creation or bakery special.'
                : 'Try adjusting your search terms or filter.'}
            </p>
            {sellerProducts.length === 0 && (
              <button 
                className="btn btn-primary"
                onClick={() => {
                  if (!isSellerAddressVerified) {
                    openAddressModal();
                  } else {
                    setIsAddModalOpen(true);
                  }
                }}
              >
                <Plus size={16} /> Add Your First Product
              </button>
            )}
          </div>
        ) : (
          <div className="seller-products-grid">
            {filteredProducts.map((prod) => (
              <div key={prod.id} className="seller-product-card">
                <div className="seller-prod-img-wrap">
                  <img src={prod.images?.[0]} alt={prod.name} className="seller-prod-img" />
                  
                  <button 
                    className={`seller-stock-pill ${prod.isOutOfStock ? 'outofstock' : 'instock'}`}
                    onClick={() => toggleProductAvailability(prod.id)}
                    title="Click to toggle availability"
                  >
                    {prod.isOutOfStock ? <EyeOff size={12} /> : <Eye size={12} />}
                    {prod.isOutOfStock ? 'Sold Out / Paused' : 'Active & Ordering Live'}
                  </button>

                  <button 
                    className="seller-delete-btn"
                    onClick={() => handleDelete(prod)}
                    title="Delete creation"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <div className="seller-prod-body">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: '0.725rem', color: 'var(--color-primary)', fontWeight: 800 }}>
                      {prod.categoryName || 'Creation'}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {prod.isVerified && (
                        <span style={{
                          background: 'var(--color-success-bg)',
                          color: 'var(--color-success)',
                          border: '1px solid rgba(21, 128, 61, 0.4)',
                          fontSize: '0.65rem',
                          fontWeight: 800,
                          padding: '1px 6px',
                          borderRadius: '3px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 3
                        }}>
                          <CheckCircle2 size={10} color="var(--color-success)" /> AI Verified
                        </span>
                      )}
                      {prod.isDraft && (
                        <span style={{
                          background: 'var(--color-warning-bg)',
                          color: '#B45309',
                          border: '1px solid rgba(180, 83, 9, 0.4)',
                          fontSize: '0.65rem',
                          fontWeight: 800,
                          padding: '1px 6px',
                          borderRadius: '3px'
                        }}>
                          Draft
                        </span>
                      )}
                      <span style={{ fontSize: '0.725rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                        Stock: {prod.stockQuantity ?? 10}
                      </span>
                    </div>
                  </div>

                  <h3 className="seller-prod-name" title={prod.name} style={{ color: 'var(--color-text-primary)' }}>{prod.name}</h3>

                  <div className="seller-prod-price-row">
                    <span style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--color-text-primary)' }}>
                      ₹{prod.price.toLocaleString('en-IN')}
                    </span>
                    {prod.originalPrice && (
                      <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', textDecoration: 'line-through' }}>
                        ₹{prod.originalPrice.toLocaleString('en-IN')}
                      </span>
                    )}
                    {prod.discount && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-success)', fontWeight: 800 }}>
                        {prod.discount}
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Clock size={13} color="var(--color-primary)" />
                      <span>Prep time: <strong style={{ color: 'var(--color-text-primary)' }}>{prod.preparationDays || 1} day(s)</strong></span>
                    </div>
                    {prod.isPreBookable && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-deep-blue)', fontWeight: 600 }}>
                        <Calendar size={13} />
                        <span>Slot booking required at checkout</span>
                      </div>
                    )}
                  </div>

                  <div className="seller-prod-meta">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: '#B45309' }}>
                      {prod.reviewCount > 0 ? (
                        <>
                          <Star size={13} fill="#B45309" />
                          <span style={{ fontWeight: 700 }}>{prod.rating} ({prod.reviewCount} reviews)</span>
                        </>
                      ) : (
                        <span style={{ color: 'var(--color-primary)', fontSize: '0.72rem', fontWeight: 700 }}>New Creation</span>
                      )}
                    </div>

                    <button 
                      className="btn btn-outline btn-sm"
                      style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                      onClick={() => setEditingProduct(prod)}
                    >
                      Edit Item
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Global Add Modal */}
      <SellerAddProductModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        onOpenAddressSetup={openAddressModal}
      />

      {/* Global Edit Modal */}
      <SellerEditProductModal 
        product={editingProduct}
        isOpen={!!editingProduct} 
        onClose={() => setEditingProduct(null)} 
      />

      {/* Address Setup Modal (fallback if not managed by parent) */}
      <SellerAddressSetupModal
        isOpen={internalAddressModalOpen}
        onClose={() => setInternalAddressModalOpen(false)}
        sellerId={currentUser?.id}
        currentAddress={sellerAddress}
        onSaveSellerAddress={updateSellerAddressData}
        currentUser={currentUser}
      />
    </div>
  );
}
