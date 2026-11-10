import React, { useState } from 'react';
import { 
  Layers, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Minus, 
  Eye, 
  EyeOff 
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';

export default function SellerInventoryTab() {
  const { products, updateStock, toggleProductAvailability } = useMarketplace();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterState, setFilterState] = useState('all'); // 'all' | 'instock' | 'lowstock' | 'outofstock'
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const showToast = (msg) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(''), 2500);
  };

  const handleAdjustStock = (prod, delta) => {
    const currentQty = prod.stockQuantity !== undefined ? prod.stockQuantity : 10;
    const newQty = Math.max(0, currentQty + delta);
    updateStock(prod.id, newQty);
    showToast(`Updated "${prod.name.slice(0, 20)}..." stock to ${newQty} units`);
  };

  const handleToggle = (prod) => {
    toggleProductAvailability(prod.id);
    showToast(`"${prod.name.slice(0, 20)}..." availability toggled`);
  };

  // Filter products
  const filteredProducts = products.filter((prod) => {
    const qty = prod.stockQuantity !== undefined ? prod.stockQuantity : 10;
    const isOut = prod.isOutOfStock || qty === 0;
    const isLow = !isOut && qty <= 3;

    if (filterState === 'instock' && isOut) return false;
    if (filterState === 'lowstock' && !isLow) return false;
    if (filterState === 'outofstock' && !isOut) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = prod.name.toLowerCase().includes(q);
      const matchCat = prod.categoryName?.toLowerCase().includes(q);
      if (!matchName && !matchCat) return false;
    }

    return true;
  });

  // Calculate stats
  const totalItems = products.length;
  const inStockCount = products.filter(p => !p.isOutOfStock && (p.stockQuantity ?? 10) > 0).length;
  const lowStockCount = products.filter(p => !p.isOutOfStock && (p.stockQuantity ?? 10) <= 3 && (p.stockQuantity ?? 10) > 0).length;
  const outOfStockCount = products.filter(p => p.isOutOfStock || (p.stockQuantity ?? 10) === 0).length;

  return (
    <div className="seller-panel">
      {/* Header */}
      <div className="seller-panel-header">
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--color-text-primary)' }}>
            Stock Inventory & Item Availability
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', margin: '4px 0 0' }}>
            Real-time batch quantities, low stock warning alerts, and instant availability controls
          </p>
        </div>

        {feedbackMsg && (
          <span style={{ color: 'var(--color-success)', fontSize: '0.825rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckCircle2 size={16} /> {feedbackMsg}
          </span>
        )}
      </div>

      {/* Summary KPI Cards */}
      <div style={{
        padding: '20px 24px',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
        borderBottom: '1px solid var(--color-border)',
        background: '#FAFAFA'
      }}>
        <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>Total Items</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--color-text-primary)', marginTop: 4 }}>{totalItems}</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)' }}>Published in catalog</span>
        </div>

        <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(21, 128, 61, 0.25)' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>Active In Stock</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--color-success)', marginTop: 4 }}>{inStockCount}</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-success)' }}>Ready for purchase</span>
        </div>

        <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(180, 83, 9, 0.25)' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>Low Stock Alert</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#B45309', marginTop: 4 }}>{lowStockCount}</div>
          <span style={{ fontSize: '0.75rem', color: '#B45309' }}>≤ 3 units remaining</span>
        </div>

        <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(198, 40, 40, 0.25)' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>Paused / Out of Stock</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--color-danger)', marginTop: 4 }}>{outOfStockCount}</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-danger)' }}>Hidden from cart</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, borderBottom: '1px solid var(--color-border)' }}>
        <div className="seller-filter-tabs">
          <button
            className={`seller-filter-btn ${filterState === 'all' ? 'active' : ''}`}
            onClick={() => setFilterState('all')}
          >
            All Items ({totalItems})
          </button>
          <button
            className={`seller-filter-btn ${filterState === 'instock' ? 'active' : ''}`}
            onClick={() => setFilterState('instock')}
          >
            In Stock ({inStockCount})
          </button>
          <button
            className={`seller-filter-btn ${filterState === 'lowstock' ? 'active' : ''}`}
            onClick={() => setFilterState('lowstock')}
          >
            ⚠️ Low Stock ({lowStockCount})
          </button>
          <button
            className={`seller-filter-btn ${filterState === 'outofstock' ? 'active' : ''}`}
            onClick={() => setFilterState('outofstock')}
          >
            Paused / Out ({outOfStockCount})
          </button>
        </div>

        <div style={{ position: 'relative', width: '240px' }}>
          <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
          <input
            type="text"
            className="seller-form-input"
            style={{ padding: '8px 12px 8px 34px', fontSize: '0.8rem' }}
            placeholder="Search creation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Inventory Items List */}
      <div style={{ padding: '24px' }}>
        {filteredProducts.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            <Layers size={40} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
            <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>No products found in this inventory category.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filteredProducts.map((prod) => {
              const qty = prod.stockQuantity !== undefined ? prod.stockQuantity : 10;
              const isOut = prod.isOutOfStock || qty === 0;
              const isLow = !isOut && qty <= 3;

              return (
                <div key={prod.id} style={{
                  background: '#FFFFFF',
                  border: `1px solid ${isOut ? 'rgba(198, 40, 40, 0.3)' : isLow ? 'rgba(180, 83, 9, 0.3)' : 'var(--color-border)'}`,
                  borderRadius: 'var(--radius-sm)',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 16
                }}>
                  {/* Thumbnail and Title */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <img
                      src={prod.images[0]}
                      alt={prod.name}
                      style={{ width: 54, height: 54, borderRadius: 6, objectFit: 'cover', border: '1px solid var(--color-border)' }}
                    />
                    <div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>{prod.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: 2, display: 'flex', gap: 8 }}>
                        <span>{prod.categoryName}</span>
                        <span>•</span>
                        <span>₹{prod.price}</span>
                        <span>•</span>
                        <span>Daily Limit: {prod.dailyBatchLimit ?? 6} units</span>
                      </div>
                    </div>
                  </div>

                  {/* Stock Status Badge */}
                  <div>
                    {isOut ? (
                      <span style={{
                        background: 'var(--color-danger-bg)',
                        color: 'var(--color-danger)',
                        border: '1px solid rgba(198, 40, 40, 0.3)',
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4
                      }}>
                        <XCircle size={13} /> Out of Stock / Paused
                      </span>
                    ) : isLow ? (
                      <span style={{
                        background: 'var(--color-warning-bg)',
                        color: '#B45309',
                        border: '1px solid rgba(180, 83, 9, 0.3)',
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4
                      }}>
                        <AlertTriangle size={13} /> Low Stock: {qty} units
                      </span>
                    ) : (
                      <span style={{
                        background: 'var(--color-success-bg)',
                        color: 'var(--color-success)',
                        border: '1px solid rgba(21, 128, 61, 0.3)',
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4
                      }}>
                        <CheckCircle2 size={13} /> In Stock ({qty} available)
                      </span>
                    )}
                  </div>

                  {/* Quick Quantity Counter */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', background: '#F1F3F6', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
                      <button
                        type="button"
                        onClick={() => handleAdjustStock(prod, -1)}
                        style={{ padding: '6px 10px', color: 'var(--color-text-primary)', border: 'none', background: 'none', cursor: 'pointer' }}
                        title="Reduce stock by 1"
                      >
                        <Minus size={14} />
                      </button>
                      <span style={{ padding: '0 8px', fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-text-primary)', minWidth: '32px', textAlign: 'center' }}>
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAdjustStock(prod, 1)}
                        style={{ padding: '6px 10px', color: 'var(--color-text-primary)', border: 'none', background: 'none', cursor: 'pointer' }}
                        title="Increase stock by 1"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    {/* 1-Click Toggle Availability */}
                    <button
                      type="button"
                      className="btn"
                      style={{
                        padding: '8px 12px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: isOut ? 'var(--color-success-bg)' : 'var(--color-danger-bg)',
                        color: isOut ? 'var(--color-success)' : 'var(--color-danger)',
                        border: `1px solid ${isOut ? 'rgba(21, 128, 61, 0.4)' : 'rgba(198, 40, 40, 0.35)'}`,
                        borderRadius: 'var(--radius-sm)'
                      }}
                      onClick={() => handleToggle(prod)}
                    >
                      {isOut ? (
                        <>
                          <Eye size={13} style={{ display: 'inline', marginRight: 4 }} />
                          Resume Orders
                        </>
                      ) : (
                        <>
                          <EyeOff size={13} style={{ display: 'inline', marginRight: 4 }} />
                          Pause Item
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

