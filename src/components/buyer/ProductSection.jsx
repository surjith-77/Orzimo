import React, { useState, useMemo } from 'react';
import ProductCard from './ProductCard';
import { SlidersHorizontal, PackageSearch, PlusCircle, Store } from 'lucide-react';

export default function ProductSection({ 
  products, 
  searchQuery, 
  selectedCategory, 
  onQuickView, 
  onAddToCart, 
  wishlist, 
  onToggleWishlist,
  onOpenSellerModal
}) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('featured');

  // Filter & Search Logic
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      // Search matching
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = prod.name?.toLowerCase().includes(query);
        const matchesCategory = prod.categoryName?.toLowerCase().includes(query);
        const matchesSeller = prod.seller?.name?.toLowerCase().includes(query);
        const matchesDesc = prod.shortDesc?.toLowerCase().includes(query);
        if (!matchesName && !matchesCategory && !matchesSeller && !matchesDesc) {
          return false;
        }
      }

      // Category matching
      if (selectedCategory !== 'all' && prod.categoryId !== selectedCategory) {
        return false;
      }

      // Quick Filter Tabs
      if (activeFilter === 'pre-book' && !prod.isPreBookable) return false;
      if (activeFilter === 'bestseller' && !prod.isBestseller) return false;
      if (activeFilter === 'cakes' && prod.categoryId !== 'cakes-bakery') return false;
      if (activeFilter === 'gifts' && prod.categoryId !== 'handmade-gifts' && prod.categoryId !== 'personalized-products') return false;
      if (activeFilter === 'jewellery' && prod.categoryId !== 'handmade-jewellery') return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      return 0; // default
    });
  }, [products, searchQuery, selectedCategory, activeFilter, sortBy]);

  const FILTER_TABS = [
    { id: 'all', label: 'All Creations' },
    { id: 'pre-book', label: 'Pre-Bookables' },
    { id: 'cakes', label: 'Homemade Cakes' },
    { id: 'gifts', label: 'Custom Gifts' },
    { id: 'jewellery', label: 'Handmade Jewellery' },
  ];

  const isDatabaseEmpty = products.length === 0;

  return (
    <section className="container" style={{ paddingTop: 28, paddingBottom: 20 }} id="marketplace-catalog">
      {/* Section Header */}
      <div className="section-header-row">
        <div className="section-title-wrap">
          <h2 className="section-title">
            {searchQuery ? `Search Results for "${searchQuery}"` : "Discover Creator Marketplace Products"}
          </h2>
          <p className="section-subtitle">
            Authentic creations directly from verified home bakers, local crafters, and independent artisans.
          </p>
        </div>

        {/* Sort selector */}
        {!isDatabaseEmpty && (
          <div className="section-actions">
            <SlidersHorizontal size={16} color="var(--gray-500)" />
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--gray-300)',
                fontSize: '0.825rem',
                fontWeight: 600,
                color: 'var(--gray-700)',
                backgroundColor: '#FFFFFF',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="featured">Sort by: Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Customer Rating</option>
            </select>
          </div>
        )}
      </div>

      {/* Filter Tabs Row */}
      {!isDatabaseEmpty && (
        <div className="filter-tabs-row" role="tablist">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`filter-tab-pill ${activeFilter === tab.id ? 'active' : ''}`}
              onClick={() => setActiveFilter(tab.id)}
              role="tab"
              aria-selected={activeFilter === tab.id}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Product Display or Empty States */}
      {isDatabaseEmpty ? (
        <div style={{
          textAlign: 'center',
          padding: '72px 24px',
          background: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--gray-200)',
          margin: '20px 0 40px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'var(--color-primary-light)',
            color: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px'
          }}>
            <Store size={36} />
          </div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-navy)', marginBottom: 10 }}>
            No products available yet
          </h3>
          <p style={{ color: 'var(--gray-600)', fontSize: '0.925rem', maxWidth: 480, margin: '0 auto 24px', lineHeight: 1.6 }}>
            The marketplace is completely fresh! As verified home bakers, crafters, and local artisans publish their creations, they will appear here automatically.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
            <button 
              className="btn btn-primary"
              onClick={onOpenSellerModal}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px' }}
            >
              <PlusCircle size={18} />
              Add Your First Product (Sell on Orzimo)
            </button>
          </div>
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="products-grid">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={onQuickView}
              onAddToCart={onAddToCart}
              isWishlisted={wishlist.some(item => item.id === product.id)}
              onToggleWishlist={onToggleWishlist}
            />
          ))}
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--gray-200)',
          margin: '20px 0 40px'
        }}>
          <PackageSearch size={54} color="var(--gray-400)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: 8 }}>No creations match your search or filter</h3>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem', maxWidth: 450, margin: '0 auto 20px' }}>
            Try adjusting your search terms or clearing the category filter to see all available creator products.
          </p>
          <button 
            className="btn btn-primary"
            onClick={() => setActiveFilter('all')}
          >
            Reset Filters
          </button>
        </div>
      )}
    </section>
  );
}
