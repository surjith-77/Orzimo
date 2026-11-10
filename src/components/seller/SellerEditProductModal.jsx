import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Save, Upload, AlertCircle } from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { CATEGORIES } from '../../data/categories';
import { validateProductImageFile, fileToBase64, uploadProductImageToStorage } from '../../services/imageVerificationService';

export default function SellerEditProductModal({ product, isOpen, onClose }) {
  const { updateProduct, currentUser } = useMarketplace();

  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('cakes-bakery');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [stockQuantity, setStockQuantity] = useState(10);
  const [leadTime, setLeadTime] = useState('24 hours notice');
  const [preparationDays, setPreparationDays] = useState(1);
  const [isPreBookable, setIsPreBookable] = useState(true);
  const [weightsText, setWeightsText] = useState('');
  const [flavorsText, setFlavorsText] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setCategoryId(product.categoryId || 'cakes-bakery');
      setPrice(product.price ? product.price.toString() : '');
      setOriginalPrice(product.originalPrice ? product.originalPrice.toString() : '');
      setShortDesc(product.shortDesc || '');
      setImageUrl(product.images?.[0] || '');
      setStockQuantity(product.stockQuantity !== undefined ? product.stockQuantity : 10);
      setLeadTime(product.leadTime || '24 hours notice');
      setPreparationDays(product.preparationDays !== undefined ? product.preparationDays : 1);
      setIsPreBookable(product.isPreBookable ?? true);
      setWeightsText(product.customOptions?.weights?.join(', ') || '');
      setFlavorsText(product.customOptions?.flavors?.join(', ') || '');
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const handleFileChange = async (e) => {
    setUploadError('');
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateProductImageFile(file);
    if (!validation.valid) {
      setUploadError(validation.error);
      return;
    }

    setIsUploading(true);
    try {
      const res = await uploadProductImageToStorage(file, currentUser?.id || 'seller');
      setImageUrl(res.url);
    } catch {
      try {
        const b64 = await fileToBase64(file);
        setImageUrl(b64);
      } catch {
        setUploadError('Failed to process image upload.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !price) return;

    const weights = weightsText ? weightsText.split(',').map(s => s.trim()).filter(Boolean) : product.customOptions?.weights;
    const flavors = flavorsText ? flavorsText.split(',').map(s => s.trim()).filter(Boolean) : product.customOptions?.flavors;

    const selectedCategory = CATEGORIES.find(c => c.id === categoryId);

    const numPrice = parseFloat(price);
    const numOriginal = originalPrice ? parseFloat(originalPrice) : numPrice * 1.25;
    const discountStr = (numOriginal > numPrice && numOriginal > 0)
      ? `${Math.round(((numOriginal - numPrice) / numOriginal) * 100)}% OFF`
      : '0% OFF';

    updateProduct(product.id, {
      name: name.trim(),
      categoryId,
      categoryName: selectedCategory ? selectedCategory.name : product.categoryName,
      price: numPrice,
      originalPrice: numOriginal,
      discount: discountStr,
      shortDesc: shortDesc.trim(),
      images: imageUrl ? [imageUrl] : (product.images || []),
      stockQuantity: parseInt(stockQuantity, 10) || 0,
      isOutOfStock: parseInt(stockQuantity, 10) === 0,
      isPreBookable,
      isFresh: categoryId === 'cakes-bakery' || categoryId === 'food-beverages',
      preparationDays: parseInt(preparationDays, 10) || 0,
      leadTime,
      customOptions: {
        ...product.customOptions,
        weights: weights && weights.length ? weights : ['Standard (1 Unit)'],
        flavors: flavors && flavors.length ? flavors : ['Classic']
      }
    });

    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 300 }}>
      <div className="seller-modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px' }}>
        <button
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close dialog"
        >
          <X size={20} />
        </button>

        <div style={{ marginBottom: 20 }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'var(--color-primary-light)',
            color: 'var(--color-primary)',
            padding: '3px 8px',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            border: '1px solid rgba(40, 116, 240, 0.25)'
          }}>
            Edit Product Listing
          </span>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--color-text-primary)', margin: '6px 0 2px' }}>
            Modify Product Details
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', margin: 0 }}>
            Update pricing, available stock inventory, lead times and product specifications
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="seller-form-label">Product Name / Title *</label>
            <input
              required
              className="seller-form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="seller-form-label">Category *</label>
              <select
                className="seller-form-input"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="seller-form-label">Available Inventory Units *</label>
              <input
                type="number"
                min="0"
                className="seller-form-input"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="seller-form-label">Listing Price (₹) *</label>
              <input
                required
                type="number"
                min="1"
                className="seller-form-input"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>

            <div>
              <label className="seller-form-label">Original Price (₹ MRP)</label>
              <input
                type="number"
                min="1"
                className="seller-form-input"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="seller-form-label">Short Description</label>
            <textarea
              rows={2}
              className="seller-form-input"
              value={shortDesc}
              onChange={(e) => setShortDesc(e.target.value)}
            />
          </div>

          {/* Product Image Update */}
          <div>
            <label className="seller-form-label">Product Photo (JPG/JPEG only)</label>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Preview"
                  style={{ width: 56, height: 56, borderRadius: 6, objectFit: 'cover', border: '1px solid var(--color-border)' }}
                />
              ) : (
                <div style={{ width: 56, height: 56, borderRadius: 6, background: '#F1F3F6', border: '1px dashed var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Upload size={18} color="var(--color-text-secondary)" />
                </div>
              )}

              <input 
                type="file"
                ref={fileInputRef}
                accept=".jpg,.jpeg,image/jpeg"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />

              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <Upload size={14} /> {isUploading ? 'Uploading...' : 'Replace Photo (.jpg)'}
              </button>
            </div>

            {uploadError && (
              <div style={{ color: '#F87171', fontSize: '0.78rem', marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertCircle size={14} /> {uploadError}
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="seller-form-label">Preparation Time (Days)</label>
              <input 
                type="number"
                min="0"
                max="30"
                className="seller-form-input" 
                value={preparationDays} 
                onChange={(e) => setPreparationDays(e.target.value)} 
              />
            </div>

            <div>
              <label className="seller-form-label">Notice / Slot Lead Time</label>
              <select 
                className="seller-form-input" 
                value={leadTime} 
                onChange={(e) => setLeadTime(e.target.value)}
              >
                <option value="12 hours notice">12 Hours Notice</option>
                <option value="24 hours notice">24 Hours Notice</option>
                <option value="48 hours notice">48 Hours Notice</option>
                <option value="3 days notice">3 Days Notice</option>
              </select>
            </div>
          </div>

          {/* Sizing & Flavors */}
          <div style={{ background: '#F8FAFC', padding: 14, borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--color-primary)', display: 'block', marginBottom: 10 }}>
              CUSTOM OPTIONS & SPECIFICATIONS
            </span>

            <div style={{ marginBottom: 10 }}>
              <label className="seller-form-label">Sizes / Weight Options (Comma separated)</label>
              <input
                className="seller-form-input"
                value={weightsText}
                onChange={(e) => setWeightsText(e.target.value)}
                placeholder="e.g. 500g, 1kg, 2kg"
              />
            </div>

            <div>
              <label className="seller-form-label">Flavors / Variant Options (Comma separated)</label>
              <input
                className="seller-form-input"
                value={flavorsText}
                onChange={(e) => setFlavorsText(e.target.value)}
                placeholder="e.g. Dark Truffle, French Vanilla"
              />
            </div>

            <div style={{ marginTop: 10 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--color-text-primary)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={isPreBookable}
                  onChange={(e) => setIsPreBookable(e.target.checked)}
                />
                Require advance pre-booking slot
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--color-primary)', color: '#FFFFFF', fontWeight: 700 }}
            >
              <Save size={16} />
              Save Modifications
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
