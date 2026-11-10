// ==============================================================================
// ORZIMO SELLER ADD PRODUCT & PUBLISH MODAL (REDESIGNED)
// ==============================================================================
// Dynamic multi-category catalog, strict manual JPG uploads (no dummy images),
// Gemini Vision AI image verification, dynamic specifications, variants,
// inventory management, address compliance check, and draft/publish workflow.
// ==============================================================================

import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Plus, 
  AlertCircle, 
  Clock, 
  ShieldCheck, 
  Upload, 
  Trash2, 
  Image as ImageIcon, 
  CheckCircle2, 
  AlertTriangle, 
  Check, 
  Layers, 
  Tag, 
  Box, 
  RefreshCw, 
  FileText
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { CATEGORIES } from '../../data/categories';
import { 
  validateProductImageFile, 
  fileToBase64, 
  uploadProductImageToStorage, 
  verifyProductImageWithAI 
} from '../../services/imageVerificationService';

export default function SellerAddProductModal({ isOpen, onClose, onOpenAddressSetup }) {
  const { addProduct, isSellerAddressVerified, sellerAddress, currentUser, updateSellerAddressData } = useMarketplace();

  // ----------------------------------------------------------------------------
  // SECTION 1 & 2: CATEGORY & BASIC INFO
  // ----------------------------------------------------------------------------
  const [categoryId, setCategoryId] = useState('cakes-bakery');
  const [name, setName] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [condition, setCondition] = useState('Handcrafted');
  const [brand, setBrand] = useState('');
  const [sku, setSku] = useState('');

  // ----------------------------------------------------------------------------
  // SECTION 3: PRODUCT IMAGES (JPG ONLY, MAX 5, STRICT MANUAL UPLOAD)
  // ----------------------------------------------------------------------------
  // Each item: { id, file, base64, previewUrl, name, size }
  const [uploadedImages, setUploadedImages] = useState([]);
  const [imageError, setImageError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const replaceIndexRef = useRef(null);

  // ----------------------------------------------------------------------------
  // AI IMAGE VERIFICATION STATE
  // ----------------------------------------------------------------------------
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [verificationError, setVerificationError] = useState('');
  const [lastVerifiedMeta, setLastVerifiedMeta] = useState(null);

  // ----------------------------------------------------------------------------
  // SECTION 4: CATEGORY-SPECIFIC SPECIFICATIONS
  // ----------------------------------------------------------------------------
  // Cakes & Bakery
  const [cakeWeight, setCakeWeight] = useState('1.0 kg');
  const [cakeFlavor, setCakeFlavor] = useState('Belgian Chocolate Truffle');
  const [cakeDietary, setCakeDietary] = useState('100% Eggless (Vegetarian)');
  const [cakeAllowMessage, setCakeAllowMessage] = useState(true);

  // Candles & Fragrances
  const [candleWax, setCandleWax] = useState('100% Natural Soy Wax');
  const [candleFragrance, setCandleFragrance] = useState('French Lavender & Vanilla');
  const [candleWeight, setCandleWeight] = useState('220g / 7.7 oz');
  const [candleBurnTime, setCandleBurnTime] = useState('45-50 Hours');
  const [candleVessel, setCandleVessel] = useState('Amber Glass Jar');
  const [candleWick, setCandleWick] = useState('Natural Cotton Wick');

  // Handmade Gifts
  const [giftMaterial, setGiftMaterial] = useState('Teak Wood & Epoxy Resin');
  const [giftPackaging, setGiftPackaging] = useState('Complimentary Luxury Gift Box');
  const [giftPersonalization, setGiftPersonalization] = useState('Name engraving & custom message card');
  const [giftCraftingDays, setGiftCraftingDays] = useState(2);

  // Art & Crafts
  const [artMedium, setArtMedium] = useState('Acrylic on Canvas');
  const [artFraming, setArtFraming] = useState('Framed (Ready to Hang)');
  const [artSurface, setArtSurface] = useState('Stretched Cotton Canvas');
  const [artSigned, setArtSigned] = useState(true);

  // Clothing & Accessories
  const [clothingFabric, setClothingFabric] = useState('100% Pure Mulberry Silk');
  const [clothingFit, setClothingFit] = useState('Regular Fit');
  const [clothingPattern, setClothingPattern] = useState('Hand-block Print');
  const [clothingCare, setClothingCare] = useState('Dry clean recommended');
  const [clothingSizes, setClothingSizes] = useState('S, M, L, XL');

  // Electronics
  const [elecBrandModel, setElecBrandModel] = useState('');
  const [elecConnectivity, setElecConnectivity] = useState('Bluetooth 5.3, USB-C');
  const [elecBattery, setElecBattery] = useState('40 Hours Playtime');
  const [elecPower, setElecPower] = useState('5V / 2A Fast Charging');
  const [elecWarranty, setElecWarranty] = useState('1 Year Manufacturer Warranty');

  // Machinery & Equipment
  const [machModel, setMachModel] = useState('');
  const [machPower, setMachPower] = useState('220V / 1500W, Single Phase');
  const [machCapacity, setMachCapacity] = useState('50 kg/hour');
  const [machDimensions, setMachDimensions] = useState('120 x 80 x 140 cm');
  const [machWeight, setMachWeight] = useState('85 kg');
  const [machWarranty, setMachWarranty] = useState('1 Year Commercial On-Site Warranty');

  // Furniture & Home Decor
  const [furnMaterial, setFurnMaterial] = useState('Solid Sheesham Wood');
  const [furnAssembly, setFurnAssembly] = useState('Pre-assembled (Ready to Use)');
  const [furnFinish, setFurnFinish] = useState('Matte Walnut Natural Polish');
  const [furnDimensions, setFurnDimensions] = useState('150 x 90 x 75 cm');
  const [furnSeating, setFurnSeating] = useState('4-6 Seater');

  // Food & Beverages
  const [foodShelfLife, setFoodShelfLife] = useState('30 Days from date of packaging');
  const [foodDietary, setFoodDietary] = useState('100% Vegetarian (Green Dot)');
  const [foodNetWeight, setFoodNetWeight] = useState('500g Jar');
  const [foodIngredients, setFoodIngredients] = useState('Cold-pressed oil, stone-ground spices, rock salt');
  const [foodFssai, setFoodFssai] = useState('');

  // Universal Custom Key-Value Specs (For "Other Products" and any extra details)
  const [customSpecs, setCustomSpecs] = useState([]);
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecVal, setNewSpecVal] = useState('');

  // ----------------------------------------------------------------------------
  // SECTION 5: DYNAMIC PRODUCT VARIATIONS
  // ----------------------------------------------------------------------------
  const [variants, setVariants] = useState([]);
  const [varType, setVarType] = useState('Size');
  const [customVarType, setCustomVarType] = useState('');
  const [varValue, setVarValue] = useState('');
  const [varPrice, setVarPrice] = useState('');
  const [varStock, setVarStock] = useState('10');

  // ----------------------------------------------------------------------------
  // SECTION 6: INVENTORY & AVAILABILITY
  // ----------------------------------------------------------------------------
  const [stockQuantity, setStockQuantity] = useState(10);
  const [availability, setAvailability] = useState('In Stock');
  const [preparationDays, setPreparationDays] = useState(1);
  const [leadTime, setLeadTime] = useState('24 hours notice');
  const [isPreBookable, setIsPreBookable] = useState(false);
  const [dailyBatchLimit, setDailyBatchLimit] = useState(10);

  // ----------------------------------------------------------------------------
  // SECTION 7: ADDITIONAL UNIVERSAL OPTIONAL FIELDS
  // ----------------------------------------------------------------------------
  const [dimensions, setDimensions] = useState('');
  const [weight, setWeight] = useState('');
  const [color, setColor] = useState('');
  const [material, setMaterial] = useState('');
  const [warranty, setWarranty] = useState('');

  // ----------------------------------------------------------------------------
  // SECTION 8: PUBLISHING ACTIONS & STATE
  // ----------------------------------------------------------------------------
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [toastSuccess, setToastSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [showAddressWarning, setShowAddressWarning] = useState(false);

  // ----------------------------------------------------------------------------
  // RESET AI VERIFICATION IF TITLE, CATEGORY, OR PRIMARY PHOTO CHANGES
  // ----------------------------------------------------------------------------
  const primaryImage = uploadedImages[0] || null;

  useEffect(() => {
    if (!lastVerifiedMeta) return;
    const hasTitleChanged = name.trim() !== lastVerifiedMeta.name;
    const hasCategoryChanged = categoryId !== lastVerifiedMeta.categoryId;
    const hasPrimaryChanged = primaryImage?.id !== lastVerifiedMeta.primaryImageId;

    if (hasTitleChanged || hasCategoryChanged || hasPrimaryChanged) {
      setVerificationResult(null);
      setVerificationError('');
      setLastVerifiedMeta(null);
    }
  }, [name, categoryId, primaryImage, lastVerifiedMeta]);

  if (!isOpen) return null;

  // Selected Category Object
  const currentCategory = CATEGORIES.find(c => c.id === categoryId) || CATEGORIES[0];

  // ----------------------------------------------------------------------------
  // IMAGE HANDLERS
  // ----------------------------------------------------------------------------
  const handleFilesSelected = async (fileList, replaceIndex = null) => {
    setImageError('');
    if (!fileList || fileList.length === 0) return;

    const filesArray = Array.from(fileList);

    // If replacing single image
    if (replaceIndex !== null && replaceIndex >= 0) {
      const file = filesArray[0];
      const validation = validateProductImageFile(file);
      if (!validation.valid) {
        setImageError(validation.error);
        return;
      }
      try {
        const base64 = await fileToBase64(file);
        setUploadedImages(prev => {
          const next = [...prev];
          next[replaceIndex] = {
            id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            file,
            base64,
            previewUrl: base64,
            name: file.name,
            size: file.size
          };
          return next;
        });
      } catch {
        setImageError('Could not process replacement image.');
      }
      return;
    }

    // Normal multi-file addition (max 5)
    const currentCount = uploadedImages.length;
    const availableSlots = 5 - currentCount;

    if (availableSlots <= 0) {
      setImageError('Maximum of 5 product photos reached. Remove an image to add another.');
      return;
    }

    const filesToProcess = filesArray.slice(0, availableSlots);
    const newItems = [];

    for (const file of filesToProcess) {
      const validation = validateProductImageFile(file);
      if (!validation.valid) {
        setImageError(validation.error);
        return;
      }
      try {
        const base64 = await fileToBase64(file);
        newItems.push({
          id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          file,
          base64,
          previewUrl: base64,
          name: file.name,
          size: file.size
        });
      } catch {
        setImageError(`Failed reading image "${file.name}".`);
        return;
      }
    }

    setUploadedImages(prev => [...prev, ...newItems]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer && e.dataTransfer.files) {
      handleFilesSelected(e.dataTransfer.files);
    }
  };

  const handleRemoveImage = (index) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    if (index === 0) {
      // Primary image was removed, reset verification
      setVerificationResult(null);
      setLastVerifiedMeta(null);
    }
  };

  const handleSetPrimary = (index) => {
    if (index === 0) return;
    setUploadedImages(prev => {
      const item = prev[index];
      const remaining = prev.filter((_, i) => i !== index);
      return [item, ...remaining];
    });
    setVerificationResult(null);
    setLastVerifiedMeta(null);
  };

  const triggerReplace = (index) => {
    replaceIndexRef.current = index;
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  // ----------------------------------------------------------------------------
  // AI IMAGE VERIFICATION HANDLER
  // ----------------------------------------------------------------------------
  const handleVerifyImage = async () => {
    setVerificationError('');
    if (!name.trim()) {
      setVerificationError('Please enter a Product Name before verifying the image.');
      return;
    }
    if (!primaryImage) {
      setVerificationError('Please upload at least one JPG product photo to verify.');
      return;
    }

    setIsVerifying(true);
    try {
      const result = await verifyProductImageWithAI({
        productName: name.trim(),
        category: currentCategory.name,
        imageBase64: primaryImage.base64,
        sellerId: currentUser?.id || 'seller'
      });

      if (!result.success && !result.verification) {
        setVerificationError(result.error || 'AI verification failed. Please try again.');
        setVerificationResult(null);
      } else {
        const v = result.verification;
        setVerificationResult(v);
        setLastVerifiedMeta({
          name: name.trim(),
          categoryId,
          primaryImageId: primaryImage.id
        });
      }
    } catch (err) {
      setVerificationError(err.message || 'Error communicating with AI verification service.');
      setVerificationResult(null);
    } finally {
      setIsVerifying(false);
    }
  };

  // ----------------------------------------------------------------------------
  // DYNAMIC VARIATION BUILDER HANDLERS
  // ----------------------------------------------------------------------------
  const handleAddVariant = () => {
    const finalType = varType === 'Custom' ? (customVarType.trim() || 'Custom') : varType;
    if (!varValue.trim()) return;

    const variantPrice = varPrice ? parseFloat(varPrice) : (parseFloat(price) || 0);
    const variantStock = varStock ? parseInt(varStock, 10) : 10;

    const newVar = {
      id: `var-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: finalType,
      value: varValue.trim(),
      price: variantPrice,
      stock: variantStock
    };

    setVariants(prev => [...prev, newVar]);
    setVarValue('');
    setVarPrice('');
  };

  const handleRemoveVariant = (id) => {
    setVariants(prev => prev.filter(v => v.id !== id));
  };

  // ----------------------------------------------------------------------------
  // CUSTOM SPECIFICATION BUILDER HANDLERS
  // ----------------------------------------------------------------------------
  const handleAddCustomSpec = () => {
    if (!newSpecKey.trim() || !newSpecVal.trim()) return;
    setCustomSpecs(prev => [
      ...prev,
      {
        id: `spec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        key: newSpecKey.trim(),
        value: newSpecVal.trim()
      }
    ]);
    setNewSpecKey('');
    setNewSpecVal('');
  };

  const handleRemoveCustomSpec = (id) => {
    setCustomSpecs(prev => prev.filter(s => s.id !== id));
  };

  // ----------------------------------------------------------------------------
  // COMPOSE CATEGORY SPECIFICATIONS OBJECT
  // ----------------------------------------------------------------------------
  const buildSpecificationsObject = () => {
    const base = {};

    if (categoryId === 'cakes-bakery') {
      base.weight = cakeWeight;
      base.flavor = cakeFlavor;
      base.dietary = cakeDietary;
      base.allowMessage = cakeAllowMessage;
      base.preparationDays = preparationDays;
    } else if (categoryId === 'candles-fragrances') {
      base.waxType = candleWax;
      base.fragranceNotes = candleFragrance;
      base.netWeight = candleWeight;
      base.burnTime = candleBurnTime;
      base.vessel = candleVessel;
      base.wick = candleWick;
    } else if (categoryId === 'handmade-gifts') {
      base.primaryMaterial = giftMaterial;
      base.packaging = giftPackaging;
      base.personalization = giftPersonalization;
      base.craftingDays = giftCraftingDays;
    } else if (categoryId === 'art-crafts') {
      base.medium = artMedium;
      base.framing = artFraming;
      base.surface = artSurface;
      base.signedByArtist = artSigned;
    } else if (categoryId === 'clothing-accessories') {
      base.fabric = clothingFabric;
      base.fit = clothingFit;
      base.pattern = clothingPattern;
      base.care = clothingCare;
      base.sizes = clothingSizes;
    } else if (categoryId === 'electronics') {
      base.brandModel = elecBrandModel;
      base.connectivity = elecConnectivity;
      base.batteryLife = elecBattery;
      base.power = elecPower;
      base.warranty = elecWarranty;
    } else if (categoryId === 'machinery-equipment') {
      base.modelNo = machModel;
      base.power = machPower;
      base.capacity = machCapacity;
      base.dimensions = machDimensions;
      base.weight = machWeight;
      base.warranty = machWarranty;
    } else if (categoryId === 'furniture-decor') {
      base.material = furnMaterial;
      base.assembly = furnAssembly;
      base.finish = furnFinish;
      base.dimensions = furnDimensions;
      base.seating = furnSeating;
    } else if (categoryId === 'food-beverages') {
      base.shelfLife = foodShelfLife;
      base.dietary = foodDietary;
      base.netWeight = foodNetWeight;
      base.ingredients = foodIngredients;
      if (foodFssai) base.fssaiLicense = foodFssai;
    }

    // Append custom specifications
    if (customSpecs.length > 0) {
      base.customAttributes = customSpecs.reduce((acc, curr) => {
        acc[curr.key] = curr.value;
        return acc;
      }, {});
    }

    // Universal attributes
    if (dimensions) base.dimensions = dimensions;
    if (weight) base.weight = weight;
    if (color) base.color = color;
    if (material) base.material = material;
    if (warranty) base.warranty = warranty;

    return base;
  };

  // ----------------------------------------------------------------------------
  // CATEGORY FALLBACK IMAGES (Curated, authentic high-res photos)
  // ----------------------------------------------------------------------------
  const CATEGORY_PLACEHOLDERS = {
    'cakes-bakery': 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
    'candles-fragrances': 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80',
    'handmade-gifts': 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80',
    'art-crafts': 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
    'clothing-accessories': 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=800&q=80',
    'electronics': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    'machinery-equipment': 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    'furniture-decor': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
    'food-beverages': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    'other-products': 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80'
  };

  // ----------------------------------------------------------------------------
  // PUBLISHING ELIGIBILITY VERIFICATION
  // ----------------------------------------------------------------------------
  const isImageVerified = verificationResult && (
    verificationResult.status === 'MATCH' || 
    verificationResult.status === 'UNCERTAIN'
  );

  // Collect missing requirements for display hint (non-blocking)
  const missingRequirements = [];
  if (!name.trim()) missingRequirements.push('Product Name');
  if (!price || parseFloat(price) <= 0) missingRequirements.push('Selling Price');
  if (stockQuantity === '' || parseInt(stockQuantity, 10) < 0) missingRequirements.push('Stock Quantity');
  if (!shortDesc.trim()) missingRequirements.push('Product Description');

  const canPublish = missingRequirements.length === 0;

  // ----------------------------------------------------------------------------
  // CORE SAVE & PUBLISH EXECUTION
  // ----------------------------------------------------------------------------
  const executePublish = async (isDraftMode = false) => {
    setIsSubmitting(true);
    setSubmitError('');
    setToastSuccess('');

    try {
      // 1. Upload images to storage (or retrieve base64 data URLs)
      const finalImageUrls = [];
      for (const img of uploadedImages) {
        if (img.file) {
          const uploadRes = await uploadProductImageToStorage(img.file, currentUser?.id || 'seller');
          finalImageUrls.push(uploadRes.url);
        } else if (img.previewUrl) {
          finalImageUrls.push(img.previewUrl);
        }
      }

      // If no images were manually uploaded, automatically use high quality curated category photo
      if (finalImageUrls.length === 0) {
        const fallbackPhoto = CATEGORY_PLACEHOLDERS[categoryId] || CATEGORY_PLACEHOLDERS['other-products'];
        finalImageUrls.push(fallbackPhoto);
      }

      // 2. Compute discount
      const numPrice = parseFloat(price) || 0;
      const numOriginal = originalPrice ? parseFloat(originalPrice) : (numPrice > 0 ? numPrice * 1.25 : 0);
      const discountStr = (numOriginal > numPrice && numOriginal > 0)
        ? `${Math.round(((numOriginal - numPrice) / numOriginal) * 100)}% OFF`
        : '0% OFF';

      // 3. Assemble payload
      const productPayload = {
        name: name.trim(),
        categoryId,
        categoryName: currentCategory.name,
        price: numPrice,
        originalPrice: numOriginal,
        discount: discountStr,
        shortDesc: shortDesc.trim() || 'High-quality authentic creation on Orzimo Marketplace.',
        images: finalImageUrls,
        stockQuantity: parseInt(stockQuantity, 10) || 10,
        condition,
        brand: brand.trim() || null,
        sku: sku.trim() || null,
        availability,
        isFresh: categoryId === 'cakes-bakery' || categoryId === 'food-beverages',
        isPreBookable,
        isCustomizable: categoryId === 'cakes-bakery' || categoryId === 'handmade-gifts',
        preparationDays: parseInt(preparationDays, 10) || 1,
        leadTime,
        dailyBatchLimit: parseInt(dailyBatchLimit, 10) || 10,
        specifications: buildSpecificationsObject(),
        variants: variants.length > 0 ? variants : [],
        isVerified: !isDraftMode && Boolean(isImageVerified),
        verificationResult: verificationResult || null,
        isDraft: isDraftMode,
        sellerDispatchPin: sellerAddress?.dispatchAddress?.pincode || '560038',
        sellerDispatchCity: sellerAddress?.dispatchAddress?.city || sellerAddress?.dispatchAddress?.district || 'Bengaluru',
        sellerDispatchState: sellerAddress?.dispatchAddress?.state || 'Karnataka'
      };

      await addProduct(productPayload);

      if (isDraftMode) {
        setToastSuccess('Product draft saved successfully! You can resume editing it anytime from your dashboard.');
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setToastSuccess('Product successfully published to Orzimo Marketplace!');
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } catch (err) {
      console.error('Failed to save product:', err);
      setSubmitError(err.message || 'Error occurred while saving product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ----------------------------------------------------------------------------
  // SAVE AS DRAFT OR PUBLISH TO MARKETPLACE (NON-BLOCKING WITH SMOOTH SCROLL)
  // ----------------------------------------------------------------------------
  const handleSaveProduct = async (isDraftMode = false) => {
    setSubmitError('');
    setToastSuccess('');
    setShowAddressWarning(false);

    if (isDraftMode) {
      if (!name.trim()) {
        setSubmitError('Please enter at least a Product Name to save a draft.');
        setFieldErrors({ name: 'Product Name is required to save a draft.' });
        const el = document.getElementById('seller-field-name');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.focus();
        }
        return;
      }
      return executePublish(true);
    }

    // Validate mandatory fields and show clear messages
    const newFieldErrors = {};
    if (!name.trim()) newFieldErrors.name = 'Product Name is required.';
    if (!price || parseFloat(price) <= 0) newFieldErrors.price = 'Selling Price must be greater than ₹0.';
    if (stockQuantity === '' || parseInt(stockQuantity, 10) < 0) newFieldErrors.stockQuantity = 'Stock Quantity is required.';
    if (!shortDesc.trim()) newFieldErrors.shortDesc = 'Product Description is required.';

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      setSubmitError('Please complete all required fields highlighted in red below.');
      const firstKey = Object.keys(newFieldErrors)[0];
      const el = document.getElementById(`seller-field-${firstKey}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.focus();
      }
      return;
    }

    setFieldErrors({});

    // Check seller address verification
    if (!isSellerAddressVerified) {
      setShowAddressWarning(true);
      setSubmitError('Seller business & dispatch address must be verified before listing products live.');
      const banner = document.getElementById('seller-address-warning-banner');
      if (banner) {
        banner.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    return executePublish(false);
  };

  // ----------------------------------------------------------------------------
  // PROCEED WITH VERIFIED DEMO ADDRESS (For seamless testing & onboarding)
  // ----------------------------------------------------------------------------
  const proceedPublishWithDemoAddress = async () => {
    try {
      if (updateSellerAddressData && currentUser?.id) {
        await updateSellerAddressData({
          sellerName: currentUser?.name || 'Chef Shweta Rao',
          shopName: currentUser?.shopName || 'Whisk & Frost',
          countryCode: '+91',
          contactPhone: '9820112345',
          isPhoneVerified: true,
          phoneVerifiedAt: new Date().toISOString(),
          sameAsBusiness: true,
          businessAddress: {
            buildingNo: 'Flat 101, Palm Grove Apartments',
            streetArea: '12th Main, HAL 2nd Stage, Indiranagar',
            pincode: '560038',
            city: 'Bengaluru',
            district: 'Bengaluru',
            state: 'Karnataka',
            isVerified: true,
            verifiedOffice: 'Indiranagar S.O'
          },
          dispatchAddress: {
            buildingNo: 'Flat 101, Palm Grove Apartments',
            streetArea: '12th Main, HAL 2nd Stage, Indiranagar',
            pincode: '560038',
            city: 'Bengaluru',
            district: 'Bengaluru',
            state: 'Karnataka',
            isVerified: true,
            verifiedOffice: 'Indiranagar S.O'
          }
        });
      }
    } catch (err) {
      console.warn('Notice setting demo address:', err);
    }
    setShowAddressWarning(false);
    setTimeout(() => {
      executePublish(false);
    }, 120);
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 300 }}>
      <div 
        className="seller-modal-dialog large" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxHeight: '92vh', overflowY: 'auto' }}
      >
        <button 
          className="modal-close-btn" 
          onClick={onClose}
          aria-label="Close dialog"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: 6, 
              background: 'var(--color-primary-light)', 
              color: 'var(--color-primary)', 
              padding: '3px 9px', 
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              border: '1px solid rgba(40, 116, 240, 0.25)'
            }}>
              Orzimo Product Studio
            </span>
            <span style={{
              background: '#F1F3F6',
              color: 'var(--color-text-primary)',
              padding: '3px 8px',
              borderRadius: '4px',
              fontSize: '0.72rem',
              fontWeight: 700,
              border: '1px solid var(--color-border)'
            }}>
              {currentCategory.name}
            </span>
          </div>

          <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--color-text-primary)', margin: '4px 0 6px' }}>
            List a New Creation or Product
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--color-text-secondary)', margin: 0 }}>
            Upload genuine JPG photographs, verify them with Gemini Vision AI, configure dynamic specifications, and publish live to buyers.
          </p>
        </div>

        {/* Address compliance gate alert */}
        {!isSellerAddressVerified ? (
          <div style={{
            background: 'var(--color-danger-bg)',
            border: '1px solid rgba(198, 40, 40, 0.3)',
            borderRadius: 'var(--radius-sm)',
            padding: '14px 16px',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <AlertCircle size={22} color="var(--color-danger)" style={{ flexShrink: 0 }} />
              <div>
                <strong style={{ color: 'var(--color-danger)', fontSize: '0.88rem' }}>Business Address Verification Required</strong>
                <p style={{ color: 'var(--color-text-primary)', fontSize: '0.78rem', margin: '2px 0 0' }}>
                  Product publishing requires your business & dispatch PIN codes to be verified with India Post.
                </p>
              </div>
            </div>
            <button 
              type="button" 
              className="btn btn-primary btn-sm"
              onClick={() => {
                onClose();
                if (onOpenAddressSetup) onOpenAddressSetup();
              }}
            >
              Verify Address Now
            </button>
          </div>
        ) : (
          <div style={{
            background: 'var(--color-success-bg)',
            border: '1px solid rgba(21, 128, 61, 0.3)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 14px',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: '0.8rem',
            color: 'var(--color-success)',
            fontWeight: 600
          }}>
            <ShieldCheck size={16} color="var(--color-success)" />
            <span>
              Verified Dispatch Location: <strong>{sellerAddress?.dispatchAddress?.city || sellerAddress?.dispatchAddress?.district || 'India'} ({sellerAddress?.dispatchAddress?.pincode})</strong>
            </span>
          </div>
        )}

        {/* Success toast */}
        {toastSuccess && (
          <div style={{
            background: 'var(--color-success-bg)',
            border: '1px solid var(--color-success)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 16px',
            marginBottom: 20,
            color: 'var(--color-success)',
            fontSize: '0.88rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <CheckCircle2 size={18} color="var(--color-success)" />
            {toastSuccess}
          </div>
        )}

        {/* Error notification */}
        {submitError && (
          <div style={{
            background: 'var(--color-danger-bg)',
            border: '1px solid var(--color-danger)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 16px',
            marginBottom: 20,
            color: 'var(--color-danger)',
            fontSize: '0.85rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <AlertCircle size={18} color="var(--color-danger)" />
            {submitError}
          </div>
        )}

        {/* ==================================================================== */}
        {/* SECTION 1: CATEGORY SELECTION */}
        {/* ==================================================================== */}
        <div className="seller-form-section">
          <div className="seller-section-title">
            <Tag size={16} color="var(--color-primary)" />
            <span>1. Product Category Selection *</span>
          </div>
          <p className="seller-section-desc">
            Choose the appropriate category to automatically configure specialized technical fields and AI verification checks.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
            <div>
              <label className="seller-form-label">Product Category *</label>
              <select 
                className="seller-form-input"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="seller-form-label">Product Condition *</label>
              <select 
                className="seller-form-input"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
              >
                <option value="Handcrafted">Handcrafted / Artisan Made</option>
                <option value="New">Brand New / Factory Sealed</option>
                <option value="Refurbished">Refurbished / Certified Restored</option>
                <option value="Used">Used / Pre-Owned</option>
              </select>
            </div>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* SECTION 2: BASIC INFORMATION */}
        {/* ==================================================================== */}
        <div className="seller-form-section">
          <div className="seller-section-title">
            <FileText size={16} color="var(--color-primary)" />
            <span>2. Basic Product Information</span>
          </div>
          <p className="seller-section-desc">
            Provide clear naming and transparent pricing for your marketplace listing.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label className="seller-form-label">Product Name / Title *</label>
              <input 
                id="seller-field-name"
                required
                className="seller-form-input"
                placeholder="e.g. Belgian Dark Chocolate Truffle Cake, Lavender Soy Candle, CNC Machine 3018"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (fieldErrors.name) setFieldErrors(prev => ({ ...prev, name: null }));
                }}
                style={fieldErrors.name ? { borderColor: 'var(--color-danger)', boxShadow: '0 0 0 2px rgba(198, 40, 40, 0.2)' } : {}}
              />
              {fieldErrors.name && (
                <span style={{ fontSize: '0.74rem', color: 'var(--color-danger)', fontWeight: 600, marginTop: 4, display: 'block' }}>
                  {fieldErrors.name}
                </span>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
              <div>
                <label className="seller-form-label">Selling Price (INR ₹) *</label>
                <input 
                  id="seller-field-price"
                  required
                  type="number"
                  min="1"
                  step="0.01"
                  className="seller-form-input"
                  placeholder="e.g. 899"
                  value={price}
                  onChange={(e) => {
                    setPrice(e.target.value);
                    if (fieldErrors.price) setFieldErrors(prev => ({ ...prev, price: null }));
                  }}
                  style={fieldErrors.price ? { borderColor: 'var(--color-danger)', boxShadow: '0 0 0 2px rgba(198, 40, 40, 0.2)' } : {}}
                />
                {fieldErrors.price && (
                  <span style={{ fontSize: '0.74rem', color: 'var(--color-danger)', fontWeight: 600, marginTop: 4, display: 'block' }}>
                    {fieldErrors.price}
                  </span>
                )}
              </div>

              <div>
                <label className="seller-form-label">Original Price / MRP (₹)</label>
                <input 
                  type="number"
                  min="1"
                  step="0.01"
                  className="seller-form-input"
                  placeholder="e.g. 1199 (optional)"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                />
              </div>

              <div>
                <label className="seller-form-label">Brand Name (Optional)</label>
                <input 
                  className="seller-form-input"
                  placeholder="e.g. Artisan Studio, Bosch, etc."
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                />
              </div>

              <div>
                <label className="seller-form-label">SKU / Item Code (Optional)</label>
                <input 
                  className="seller-form-input"
                  placeholder="e.g. ORZ-CAKE-001"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="seller-form-label">Product Description *</label>
              <textarea 
                id="seller-field-shortDesc"
                required
                rows={3}
                className="seller-form-input"
                placeholder="Describe your creation: materials, craftsmanship details, dimensions, usage tips, and customization options..."
                value={shortDesc}
                onChange={(e) => {
                  setShortDesc(e.target.value);
                  if (fieldErrors.shortDesc) setFieldErrors(prev => ({ ...prev, shortDesc: null }));
                }}
                style={fieldErrors.shortDesc ? { borderColor: 'var(--color-danger)', boxShadow: '0 0 0 2px rgba(198, 40, 40, 0.2)' } : {}}
              />
              {fieldErrors.shortDesc && (
                <span style={{ fontSize: '0.74rem', color: 'var(--color-danger)', fontWeight: 600, marginTop: 4, display: 'block' }}>
                  {fieldErrors.shortDesc}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* SECTION 3: PRODUCT IMAGES & AI VERIFICATION */}
        {/* ==================================================================== */}
        <div className="seller-form-section">
          <div className="seller-section-title">
            <ImageIcon size={16} color="var(--color-primary)" />
            <span>3. Product Images & Gemini AI Verification *</span>
          </div>
          <p className="seller-section-desc">
            Upload strictly .jpg / .jpeg real photos (Max 5MB each, up to 5 photos). Click "Verify Product Image" to authenticate your primary photo using Gemini Vision AI.
          </p>

          {/* Hidden file input */}
          <input 
            type="file"
            ref={fileInputRef}
            accept=".jpg,.jpeg,image/jpeg"
            style={{ display: 'none' }}
            onChange={(e) => {
              if (replaceIndexRef.current !== null) {
                handleFilesSelected(e.target.files, replaceIndexRef.current);
                replaceIndexRef.current = null;
              } else {
                handleFilesSelected(e.target.files);
              }
            }}
          />

          {/* Drag & Drop Zone */}
          <div 
            className={`image-dropzone ${isDragging ? 'dragging' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => {
              replaceIndexRef.current = null;
              if (fileInputRef.current) fileInputRef.current.click();
            }}
          >
            <Upload size={32} color="var(--color-primary)" style={{ margin: '0 auto 10px', display: 'block' }} />
            <strong style={{ fontSize: '0.92rem', color: 'var(--color-text-primary)', display: 'block' }}>
              Drag & Drop product photos here, or click to browse
            </strong>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', display: 'block', marginTop: 4 }}>
              Strictly JPG / JPEG format only • Max 5 MB per photo • Up to 5 photos
            </span>
          </div>

          {/* Format / Size Error Alert */}
          {imageError && (
            <div style={{
              background: 'var(--color-danger-bg)',
              border: '1px solid rgba(198, 40, 40, 0.3)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 14px',
              marginTop: 12,
              color: 'var(--color-danger)',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontWeight: 600
            }}>
              <AlertCircle size={16} color="var(--color-danger)" />
              <span>{imageError}</span>
            </div>
          )}

          {/* Thumbnails preview strip */}
          {uploadedImages.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', fontWeight: 700 }}>
                  UPLOADED PHOTOS ({uploadedImages.length}/5)
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--color-primary)', fontWeight: 700 }}>
                  Primary cover image used for AI verification
                </span>
              </div>

              <div className="image-thumb-grid">
                {uploadedImages.map((img, idx) => {
                  const isPrimary = idx === 0;
                  return (
                    <div key={img.id} className={`image-thumb-card ${isPrimary ? 'primary' : ''}`}>
                      <img src={img.previewUrl} alt={`Upload ${idx + 1}`} className="image-thumb-img" />
                      
                      {isPrimary && (
                        <span style={{
                          position: 'absolute',
                          top: 6,
                          left: 6,
                          background: 'var(--color-primary)',
                          color: '#FFFFFF',
                          fontSize: '0.65rem',
                          fontWeight: 900,
                          padding: '2px 6px',
                          borderRadius: '3px'
                        }}>
                          PRIMARY
                        </span>
                      )}

                      <div className="image-thumb-actions">
                        {!isPrimary ? (
                          <button
                            type="button"
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--color-primary)',
                              cursor: 'pointer',
                              padding: 0,
                              fontSize: '0.68rem',
                              fontWeight: 700
                            }}
                            onClick={() => handleSetPrimary(idx)}
                          >
                            Set Cover
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.68rem', color: 'var(--color-success)', fontWeight: 700 }}>Cover</span>
                        )}

                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            type="button"
                            title="Replace photo"
                            style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', padding: 2 }}
                            onClick={() => triggerReplace(idx)}
                          >
                            <RefreshCw size={12} />
                          </button>
                          <button
                            type="button"
                            title="Remove photo"
                            style={{ background: 'transparent', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', padding: 2 }}
                            onClick={() => handleRemoveImage(idx)}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* AI Image Verification Action Box */}
          <div style={{
            background: 'var(--color-primary-light)',
            border: '1px solid rgba(40, 116, 240, 0.25)',
            borderRadius: 'var(--radius-sm)',
            padding: 16,
            marginTop: 18
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <strong style={{ fontSize: '0.88rem', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  Gemini Vision AI Product Authenticator
                </strong>
                <p style={{ fontSize: '0.76rem', color: 'var(--color-text-secondary)', margin: '4px 0 0' }}>
                  Compares your primary photograph with "{name || 'Product Title'}" in "{currentCategory.name}".
                </p>
              </div>

              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleVerifyImage}
                disabled={isVerifying || !primaryImage || !name.trim()}
                style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 160, justifyContent: 'center' }}
              >
                {isVerifying ? (
                  <>
                    <RefreshCw size={14} className="spin-animation" />
                    <span>Analyzing Image...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    <span>Verify Product Image</span>
                  </>
                )}
              </button>
            </div>

            {verificationError && (
              <div style={{
                marginTop: 12,
                padding: '10px 14px',
                background: 'var(--color-danger-bg)',
                border: '1px solid rgba(198, 40, 40, 0.4)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--color-danger)',
                fontSize: '0.825rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                <AlertCircle size={16} />
                <span>{verificationError}</span>
              </div>
            )}

            {/* Verification Result Badges */}
            {verificationResult && (
              <div style={{ marginTop: 14 }}>
                {verificationResult.status === 'MATCH' && (
                  <div style={{
                    background: 'var(--color-success-bg)',
                    border: '1px solid rgba(21, 128, 61, 0.4)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 14px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        color: 'var(--color-success)',
                        fontWeight: 800,
                        fontSize: '0.85rem'
                      }}>
                        <CheckCircle2 size={16} color="var(--color-success)" />
                        Product Image Verified by AI
                      </span>
                      {verificationResult.confidenceScore && (
                        <span style={{ fontSize: '0.78rem', color: 'var(--color-success)', fontWeight: 800 }}>
                          Confidence: {verificationResult.confidenceScore}%
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-primary)', margin: '4px 0 0', lineHeight: 1.4 }}>
                      {verificationResult.explanation || `Image visually matches ${name} in ${currentCategory.name}.`}
                    </p>
                  </div>
                )}

                {verificationResult.status === 'MISMATCH' && (
                  <div style={{
                    background: 'var(--color-danger-bg)',
                    border: '1px solid rgba(198, 40, 40, 0.4)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 14px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <AlertTriangle size={18} color="var(--color-danger)" />
                      <strong style={{ color: 'var(--color-danger)', fontSize: '0.88rem' }}>
                        Image Mismatch Detected
                      </strong>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--color-text-primary)', margin: '4px 0 0', lineHeight: 1.4 }}>
                      The uploaded image appears to be <strong>{verificationResult.detectedObject || 'an unrelated subject'}</strong>, which does not match <strong>{name}</strong> in <strong>{currentCategory.name}</strong>.
                    </p>
                    {verificationResult.rejectionReason && (
                      <p style={{ fontSize: '0.78rem', color: 'var(--color-danger)', margin: '6px 0 0', fontWeight: 600 }}>
                        Reason: {verificationResult.rejectionReason}
                      </p>
                    )}
                    <span style={{ fontSize: '0.76rem', color: 'var(--color-danger)', display: 'block', marginTop: 6, fontWeight: 800 }}>
                      Publishing is locked. Please upload a genuine photo matching your product.
                    </span>
                  </div>
                )}

                {verificationResult.status === 'UNCERTAIN' && (
                  <div style={{
                    background: 'var(--color-warning-bg)',
                    border: '1px solid rgba(180, 83, 9, 0.4)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 14px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <AlertCircle size={18} color="#B45309" />
                      <strong style={{ color: '#B45309', fontSize: '0.88rem' }}>
                        AI Verification Uncertain
                      </strong>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--color-text-primary)', margin: '4px 0 0', lineHeight: 1.4 }}>
                      {verificationResult.explanation || 'Image visual characteristics were inconclusive.'}
                    </p>
                    <span style={{ fontSize: '0.76rem', color: '#B45309', display: 'block', marginTop: 4, fontWeight: 700 }}>
                      Listing can be published and will be reviewed by Orzimo trust & quality team.
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ==================================================================== */}
        {/* SECTION 4: CATEGORY-SPECIFIC SPECIFICATIONS */}
        {/* ==================================================================== */}
        <div className="seller-form-section">
          <div className="seller-section-title">
            <Layers size={16} color="var(--color-primary)" />
            <span>4. {currentCategory.name} Specifications</span>
          </div>
          <p className="seller-section-desc">
            Category-specific properties displayed to buyers and used for accurate search filtering.
          </p>

          {/* CAKES & BAKERY */}
          {categoryId === 'cakes-bakery' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
              <div>
                <label className="seller-form-label">Cake Size / Weight</label>
                <input 
                  className="seller-form-input" 
                  value={cakeWeight} 
                  onChange={(e) => setCakeWeight(e.target.value)} 
                  placeholder="e.g. 0.5 kg, 1 kg, 2 kg" 
                />
              </div>
              <div>
                <label className="seller-form-label">Primary Flavor</label>
                <input 
                  className="seller-form-input" 
                  value={cakeFlavor} 
                  onChange={(e) => setCakeFlavor(e.target.value)} 
                  placeholder="e.g. Dark Truffle, Red Velvet" 
                />
              </div>
              <div>
                <label className="seller-form-label">Dietary Preference</label>
                <select 
                  className="seller-form-input" 
                  value={cakeDietary} 
                  onChange={(e) => setCakeDietary(e.target.value)}
                >
                  <option value="100% Eggless (Vegetarian)">100% Eggless (Vegetarian)</option>
                  <option value="Contains Egg">Contains Egg</option>
                  <option value="Vegan">Vegan</option>
                  <option value="Gluten-Free">Gluten-Free</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginTop: 24 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', color: 'var(--color-text-primary)', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={cakeAllowMessage} 
                    onChange={(e) => setCakeAllowMessage(e.target.checked)} 
                  />
                  Allow Custom Cake Inscription / Message
                </label>
              </div>
            </div>
          )}

          {/* CANDLES & FRAGRANCES */}
          {categoryId === 'candles-fragrances' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
              <div>
                <label className="seller-form-label">Wax Type</label>
                <select className="seller-form-input" value={candleWax} onChange={(e) => setCandleWax(e.target.value)}>
                  <option value="100% Natural Soy Wax">100% Natural Soy Wax</option>
                  <option value="Pure Beeswax">Pure Beeswax</option>
                  <option value="Coconut Wax Blend">Coconut Wax Blend</option>
                  <option value="Gel Wax">Gel Wax</option>
                </select>
              </div>
              <div>
                <label className="seller-form-label">Fragrance Notes</label>
                <input className="seller-form-input" value={candleFragrance} onChange={(e) => setCandleFragrance(e.target.value)} placeholder="e.g. French Lavender & Vanilla" />
              </div>
              <div>
                <label className="seller-form-label">Net Candle Weight</label>
                <input className="seller-form-input" value={candleWeight} onChange={(e) => setCandleWeight(e.target.value)} placeholder="e.g. 220g / 7.7 oz" />
              </div>
              <div>
                <label className="seller-form-label">Burn Time</label>
                <input className="seller-form-input" value={candleBurnTime} onChange={(e) => setCandleBurnTime(e.target.value)} placeholder="e.g. 45-50 Hours" />
              </div>
              <div>
                <label className="seller-form-label">Vessel / Jar Type</label>
                <input className="seller-form-input" value={candleVessel} onChange={(e) => setCandleVessel(e.target.value)} placeholder="e.g. Amber Glass Jar" />
              </div>
              <div>
                <label className="seller-form-label">Wick Type</label>
                <select className="seller-form-input" value={candleWick} onChange={(e) => setCandleWick(e.target.value)}>
                  <option value="Natural Cotton Wick">Natural Cotton Wick</option>
                  <option value="Crackling Wood Wick">Crackling Wood Wick</option>
                </select>
              </div>
            </div>
          )}

          {/* HANDMADE GIFTS */}
          {categoryId === 'handmade-gifts' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
              <div>
                <label className="seller-form-label">Primary Material</label>
                <input className="seller-form-input" value={giftMaterial} onChange={(e) => setGiftMaterial(e.target.value)} placeholder="e.g. Teak Wood & Resin" />
              </div>
              <div>
                <label className="seller-form-label">Packaging Type</label>
                <input className="seller-form-input" value={giftPackaging} onChange={(e) => setGiftPackaging(e.target.value)} placeholder="e.g. Luxury Gift Box" />
              </div>
              <div>
                <label className="seller-form-label">Personalization Options</label>
                <input className="seller-form-input" value={giftPersonalization} onChange={(e) => setGiftPersonalization(e.target.value)} placeholder="e.g. Engraving, Photo Album" />
              </div>
              <div>
                <label className="seller-form-label">Crafting Time (Days)</label>
                <input type="number" min="1" className="seller-form-input" value={giftCraftingDays} onChange={(e) => setGiftCraftingDays(e.target.value)} />
              </div>
            </div>
          )}

          {/* ART & CRAFTS */}
          {categoryId === 'art-crafts' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
              <div>
                <label className="seller-form-label">Medium / Art Style</label>
                <input className="seller-form-input" value={artMedium} onChange={(e) => setArtMedium(e.target.value)} placeholder="e.g. Acrylic on Canvas, Lippan Art" />
              </div>
              <div>
                <label className="seller-form-label">Framing Options</label>
                <select className="seller-form-input" value={artFraming} onChange={(e) => setArtFraming(e.target.value)}>
                  <option value="Framed (Ready to Hang)">Framed (Ready to Hang)</option>
                  <option value="Stretched Canvas (Unframed)">Stretched Canvas (Unframed)</option>
                  <option value="Rolled Canvas">Rolled Canvas</option>
                  <option value="Stand Included">Stand Included</option>
                </select>
              </div>
              <div>
                <label className="seller-form-label">Surface / Base</label>
                <input className="seller-form-input" value={artSurface} onChange={(e) => setArtSurface(e.target.value)} placeholder="e.g. Cotton Canvas, MDF Board" />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginTop: 24 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', color: 'var(--color-text-primary)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={artSigned} onChange={(e) => setArtSigned(e.target.checked)} />
                  Signed by Artist with Certificate of Authenticity
                </label>
              </div>
            </div>
          )}

          {/* CLOTHING & ACCESSORIES */}
          {categoryId === 'clothing-accessories' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
              <div>
                <label className="seller-form-label">Fabric / Material</label>
                <input className="seller-form-input" value={clothingFabric} onChange={(e) => setClothingFabric(e.target.value)} placeholder="e.g. Pure Mulberry Silk" />
              </div>
              <div>
                <label className="seller-form-label">Fit Type</label>
                <select className="seller-form-input" value={clothingFit} onChange={(e) => setClothingFit(e.target.value)}>
                  <option value="Regular Fit">Regular Fit</option>
                  <option value="Slim Fit">Slim Fit</option>
                  <option value="Oversized / Relaxed">Oversized / Relaxed</option>
                  <option value="Tailored Made-to-Measure">Tailored Made-to-Measure</option>
                </select>
              </div>
              <div>
                <label className="seller-form-label">Pattern / Work</label>
                <input className="seller-form-input" value={clothingPattern} onChange={(e) => setClothingPattern(e.target.value)} placeholder="e.g. Hand-block Print, Zari" />
              </div>
              <div>
                <label className="seller-form-label">Care Instructions</label>
                <input className="seller-form-input" value={clothingCare} onChange={(e) => setClothingCare(e.target.value)} placeholder="e.g. Dry Clean Only" />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="seller-form-label">Available Sizes</label>
                <input className="seller-form-input" value={clothingSizes} onChange={(e) => setClothingSizes(e.target.value)} placeholder="e.g. S, M, L, XL, XXL" />
              </div>
            </div>
          )}

          {/* ELECTRONICS */}
          {categoryId === 'electronics' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
              <div>
                <label className="seller-form-label">Brand & Model</label>
                <input className="seller-form-input" value={elecBrandModel} onChange={(e) => setElecBrandModel(e.target.value)} placeholder="e.g. Nordic X-500" />
              </div>
              <div>
                <label className="seller-form-label">Connectivity</label>
                <input className="seller-form-input" value={elecConnectivity} onChange={(e) => setElecConnectivity(e.target.value)} placeholder="e.g. Bluetooth 5.3, USB-C" />
              </div>
              <div>
                <label className="seller-form-label">Battery / Power</label>
                <input className="seller-form-input" value={elecBattery} onChange={(e) => setElecBattery(e.target.value)} placeholder="e.g. 5000mAh, 40h Playtime" />
              </div>
              <div>
                <label className="seller-form-label">Charging Input</label>
                <input className="seller-form-input" value={elecPower} onChange={(e) => setElecPower(e.target.value)} placeholder="e.g. 5V/2A Fast Charge" />
              </div>
              <div>
                <label className="seller-form-label">Warranty</label>
                <select className="seller-form-input" value={elecWarranty} onChange={(e) => setElecWarranty(e.target.value)}>
                  <option value="1 Year Manufacturer Warranty">1 Year Manufacturer Warranty</option>
                  <option value="6 Months Replacement">6 Months Replacement</option>
                  <option value="2 Years Extended">2 Years Extended</option>
                  <option value="No Warranty">No Warranty</option>
                </select>
              </div>
            </div>
          )}

          {/* MACHINERY & EQUIPMENT */}
          {categoryId === 'machinery-equipment' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
              <div>
                <label className="seller-form-label">Model / Part No.</label>
                <input className="seller-form-input" value={machModel} onChange={(e) => setMachModel(e.target.value)} placeholder="e.g. ORZ-MIX-5000" />
              </div>
              <div>
                <label className="seller-form-label">Power & Voltage</label>
                <input className="seller-form-input" value={machPower} onChange={(e) => setMachPower(e.target.value)} placeholder="e.g. 220V / 1500W, 50Hz" />
              </div>
              <div>
                <label className="seller-form-label">Production Throughput</label>
                <input className="seller-form-input" value={machCapacity} onChange={(e) => setMachCapacity(e.target.value)} placeholder="e.g. 50 kg/hr" />
              </div>
              <div>
                <label className="seller-form-label">Machine Dimensions</label>
                <input className="seller-form-input" value={machDimensions} onChange={(e) => setMachDimensions(e.target.value)} placeholder="e.g. 120 x 80 x 140 cm" />
              </div>
              <div>
                <label className="seller-form-label">Machine Weight</label>
                <input className="seller-form-input" value={machWeight} onChange={(e) => setMachWeight(e.target.value)} placeholder="e.g. 85 kg" />
              </div>
              <div>
                <label className="seller-form-label">Warranty / Service</label>
                <select className="seller-form-input" value={machWarranty} onChange={(e) => setMachWarranty(e.target.value)}>
                  <option value="1 Year Commercial On-Site Warranty">1 Year Commercial On-Site Warranty</option>
                  <option value="2 Years Industrial Warranty">2 Years Industrial Warranty</option>
                  <option value="6 Months Parts Only">6 Months Parts Only</option>
                </select>
              </div>
            </div>
          )}

          {/* FURNITURE & HOME DECOR */}
          {categoryId === 'furniture-decor' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
              <div>
                <label className="seller-form-label">Primary Material / Wood</label>
                <input className="seller-form-input" value={furnMaterial} onChange={(e) => setFurnMaterial(e.target.value)} placeholder="e.g. Solid Sheesham Wood" />
              </div>
              <div>
                <label className="seller-form-label">Assembly Type</label>
                <select className="seller-form-input" value={furnAssembly} onChange={(e) => setFurnAssembly(e.target.value)}>
                  <option value="Pre-assembled (Ready to Use)">Pre-assembled (Ready to Use)</option>
                  <option value="Carpenter Assembly Required">Carpenter Assembly Required</option>
                  <option value="DIY Assembly (Kit Included)">DIY Assembly (Kit Included)</option>
                </select>
              </div>
              <div>
                <label className="seller-form-label">Finish / Polish</label>
                <input className="seller-form-input" value={furnFinish} onChange={(e) => setFurnFinish(e.target.value)} placeholder="e.g. Matte Walnut Natural Polish" />
              </div>
              <div>
                <label className="seller-form-label">Dimensions (L x W x H)</label>
                <input className="seller-form-input" value={furnDimensions} onChange={(e) => setFurnDimensions(e.target.value)} placeholder="e.g. 150 x 90 x 75 cm" />
              </div>
              <div>
                <label className="seller-form-label">Seating / Capacity</label>
                <input className="seller-form-input" value={furnSeating} onChange={(e) => setFurnSeating(e.target.value)} placeholder="e.g. 4-6 Seater" />
              </div>
            </div>
          )}

          {/* FOOD & BEVERAGES */}
          {categoryId === 'food-beverages' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
              <div>
                <label className="seller-form-label">Shelf Life</label>
                <input className="seller-form-input" value={foodShelfLife} onChange={(e) => setFoodShelfLife(e.target.value)} placeholder="e.g. 30 Days from date of packaging" />
              </div>
              <div>
                <label className="seller-form-label">Dietary Certification</label>
                <select className="seller-form-input" value={foodDietary} onChange={(e) => setFoodDietary(e.target.value)}>
                  <option value="100% Vegetarian (Green Dot)">100% Vegetarian (Green Dot)</option>
                  <option value="Non-Vegetarian">Non-Vegetarian</option>
                  <option value="Vegan Certified">Vegan Certified</option>
                  <option value="Jain Friendly">Jain Friendly</option>
                </select>
              </div>
              <div>
                <label className="seller-form-label">Net Weight / Quantity</label>
                <input className="seller-form-input" value={foodNetWeight} onChange={(e) => setFoodNetWeight(e.target.value)} placeholder="e.g. 500g Jar, 1 Litre" />
              </div>
              <div>
                <label className="seller-form-label">FSSAI License No. (Optional)</label>
                <input className="seller-form-input" value={foodFssai} onChange={(e) => setFoodFssai(e.target.value)} placeholder="e.g. 21223004000891" />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="seller-form-label">Ingredients</label>
                <input className="seller-form-input" value={foodIngredients} onChange={(e) => setFoodIngredients(e.target.value)} placeholder="e.g. Cold-pressed coconut oil, stone-ground spices, rock salt" />
              </div>
            </div>
          )}

          {/* OTHER PRODUCTS / CUSTOM SPECS BUILDER */}
          <div style={{ marginTop: 18, borderTop: '1px solid var(--color-border)', paddingTop: 14 }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--color-primary)', display: 'block', marginBottom: 6 }}>
              + CUSTOM PRODUCT SPECIFICATIONS (KEY-VALUE PAIRS)
            </span>
            <p style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', margin: '0 0 10px 0' }}>
              Add custom technical specifications or unique properties suited to your specific product.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 10, alignItems: 'end' }}>
              <div>
                <label className="seller-form-label">Specification Name</label>
                <input 
                  className="seller-form-input" 
                  placeholder="e.g. Voltage, Purity, Origin" 
                  value={newSpecKey} 
                  onChange={(e) => setNewSpecKey(e.target.value)} 
                />
              </div>
              <div>
                <label className="seller-form-label">Specification Value</label>
                <input 
                  className="seller-form-input" 
                  placeholder="e.g. 220V, 99.9%, Kashmir" 
                  value={newSpecVal} 
                  onChange={(e) => setNewSpecVal(e.target.value)} 
                />
              </div>
              <button 
                type="button" 
                className="btn btn-primary btn-sm" 
                onClick={handleAddCustomSpec}
                style={{ height: 42, padding: '0 16px' }}
              >
                Add Spec
              </button>
            </div>

            {customSpecs.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                {customSpecs.map((spec) => (
                  <span 
                    key={spec.id} 
                    style={{
                      background: 'var(--color-primary-light)',
                      border: '1px solid rgba(40, 116, 240, 0.3)',
                      color: 'var(--color-primary)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: '4px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <strong style={{ color: 'var(--color-primary)' }}>{spec.key}:</strong> {spec.value}
                    <button 
                      type="button" 
                      style={{ background: 'transparent', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', padding: 0 }}
                      onClick={() => handleRemoveCustomSpec(spec.id)}
                    >
                      <X size={13} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ==================================================================== */}
        {/* SECTION 5: DYNAMIC PRODUCT VARIATIONS */}
        {/* ==================================================================== */}
        <div className="seller-form-section">
          <div className="seller-section-title">
            <Box size={16} color="var(--color-primary)" />
            <span>5. Product Variations & SKU Pricing</span>
          </div>
          <p className="seller-section-desc">
            Allow buyers to select sizes, colors, weights, or custom options with unique pricing and stock levels.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr)) 1fr auto', gap: 10, alignItems: 'end' }}>
            <div>
              <label className="seller-form-label">Variant Type</label>
              <select 
                className="seller-form-input" 
                value={varType} 
                onChange={(e) => setVarType(e.target.value)}
              >
                <option value="Size">Size (e.g. S, M, L)</option>
                <option value="Weight">Weight (e.g. 500g, 1kg)</option>
                <option value="Color">Color (e.g. Navy, Rose Gold)</option>
                <option value="Flavor">Flavor (e.g. Dark Truffle)</option>
                <option value="Material">Material (e.g. Teak, Brass)</option>
                <option value="Power">Power / Voltage</option>
                <option value="Custom">Custom Variation</option>
              </select>
            </div>

            {varType === 'Custom' && (
              <div>
                <label className="seller-form-label">Type Name</label>
                <input 
                  className="seller-form-input" 
                  placeholder="e.g. Scent, Pack" 
                  value={customVarType} 
                  onChange={(e) => setCustomVarType(e.target.value)} 
                />
              </div>
            )}

            <div>
              <label className="seller-form-label">Variant Value *</label>
              <input 
                className="seller-form-input" 
                placeholder="e.g. 1 kg or Royal Blue" 
                value={varValue} 
                onChange={(e) => setVarValue(e.target.value)} 
              />
            </div>

            <div>
              <label className="seller-form-label">Price (₹)</label>
              <input 
                type="number"
                min="1"
                className="seller-form-input" 
                placeholder={price || "Base Price"} 
                value={varPrice} 
                onChange={(e) => setVarPrice(e.target.value)} 
              />
            </div>

            <div>
              <label className="seller-form-label">Stock Units</label>
              <input 
                type="number"
                min="0"
                className="seller-form-input" 
                placeholder="10" 
                value={varStock} 
                onChange={(e) => setVarStock(e.target.value)} 
              />
            </div>

            <button 
              type="button" 
              className="btn btn-primary btn-sm"
              onClick={handleAddVariant}
              style={{ height: 42, padding: '0 16px' }}
            >
              <Plus size={16} /> Add Variant
            </button>
          </div>

          {/* Variants Table */}
          {variants.length > 0 ? (
            <div style={{ overflowX: 'auto', marginTop: 14 }}>
              <table className="variant-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Value</th>
                    <th>Variant Price (₹)</th>
                    <th>Stock Units</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {variants.map((v) => (
                    <tr key={v.id}>
                      <td style={{ color: 'var(--color-primary)', fontWeight: 700 }}>{v.type}</td>
                      <td>{v.value}</td>
                      <td>₹{v.price.toLocaleString('en-IN')}</td>
                      <td>{v.stock} units</td>
                      <td style={{ textAlign: 'right' }}>
                        <button 
                          type="button" 
                          style={{ background: 'transparent', border: 'none', color: 'var(--color-danger)', cursor: 'pointer' }}
                          onClick={() => handleRemoveVariant(v.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ fontSize: '0.76rem', color: 'var(--color-text-secondary)', marginTop: 10, fontStyle: 'italic' }}>
              No variants added yet. Base price (₹{price || '0'}) and general stock will apply to all buyer orders.
            </p>
          )}
        </div>

        {/* ==================================================================== */}
        {/* SECTION 6: INVENTORY & AVAILABILITY */}
        {/* ==================================================================== */}
        <div className="seller-form-section">
          <div className="seller-section-title">
            <Clock size={16} color="var(--color-primary)" />
            <span>6. Inventory & Delivery SLA Configuration</span>
          </div>
          <p className="seller-section-desc">
            Accurate lead times allow Orzimo to provide verified delivery dates to buyers based on your dispatch PIN.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
            <div>
              <label className="seller-form-label">Available Stock Quantity *</label>
              <input 
                id="seller-field-stockQuantity"
                required
                type="number"
                min="0"
                className="seller-form-input"
                placeholder="e.g. 10"
                value={stockQuantity}
                onChange={(e) => {
                  setStockQuantity(e.target.value);
                  if (fieldErrors.stockQuantity) setFieldErrors(prev => ({ ...prev, stockQuantity: null }));
                }}
                style={fieldErrors.stockQuantity ? { borderColor: 'var(--color-danger)', boxShadow: '0 0 0 2px rgba(198, 40, 40, 0.2)' } : {}}
              />
              {fieldErrors.stockQuantity && (
                <span style={{ fontSize: '0.74rem', color: 'var(--color-danger)', fontWeight: 600, marginTop: 4, display: 'block' }}>
                  {fieldErrors.stockQuantity}
                </span>
              )}
            </div>

            <div>
              <label className="seller-form-label">Availability Mode</label>
              <select 
                className="seller-form-input"
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
              >
                <option value="In Stock">In Stock (Ready to Dispatch)</option>
                <option value="Made to Order">Made to Order (Crafted Upon Order)</option>
                <option value="Pre-order">Pre-order / Scheduled Release</option>
              </select>
            </div>

            <div>
              <label className="seller-form-label">Preparation / Crafting Days *</label>
              <input 
                required
                type="number"
                min="0"
                max="30"
                className="seller-form-input"
                placeholder="e.g. 1"
                value={preparationDays}
                onChange={(e) => setPreparationDays(e.target.value)}
              />
              <span style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', marginTop: 3, display: 'block' }}>
                Delivery Date = Order Date + Prep Days + Transit Days
              </span>
            </div>

            <div>
              <label className="seller-form-label">Slot Lead Notice</label>
              <select 
                className="seller-form-input"
                value={leadTime}
                onChange={(e) => setLeadTime(e.target.value)}
              >
                <option value="12 hours notice">12 Hours Notice</option>
                <option value="24 hours notice">24 Hours Notice (Standard)</option>
                <option value="48 hours notice">48 Hours Notice</option>
                <option value="3 days notice">3 Days Notice</option>
                <option value="5 days notice">5 Days Notice</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 24, marginTop: 14 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: 'var(--color-text-primary)', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={isPreBookable} 
                onChange={(e) => setIsPreBookable(e.target.checked)} 
              />
              Require Pre-booking Slot Reservation
            </label>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label className="seller-form-label" style={{ margin: 0, fontSize: '0.75rem' }}>Daily Batch Limit:</label>
              <input 
                type="number" 
                min="1" 
                style={{ width: 70, padding: '4px 8px', height: 32 }} 
                className="seller-form-input" 
                value={dailyBatchLimit} 
                onChange={(e) => setDailyBatchLimit(e.target.value)} 
              />
            </div>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* SECTION 7: ADDITIONAL UNIVERSAL SPECIFICATIONS (OPTIONAL) */}
        {/* ==================================================================== */}
        <div className="seller-form-section">
          <div className="seller-section-title">
            <Sparkles size={16} color="var(--color-primary)" />
            <span>7. Additional Product Details (Optional)</span>
          </div>
          <p className="seller-section-desc">
            Universal physical dimensions, weight, color, and warranty coverage.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
            <div>
              <label className="seller-form-label">Dimensions (L x W x H cm)</label>
              <input 
                className="seller-form-input" 
                placeholder="e.g. 25 x 20 x 10 cm" 
                value={dimensions} 
                onChange={(e) => setDimensions(e.target.value)} 
              />
            </div>

            <div>
              <label className="seller-form-label">Net Item Weight</label>
              <input 
                className="seller-form-input" 
                placeholder="e.g. 850 grams or 1.2 kg" 
                value={weight} 
                onChange={(e) => setWeight(e.target.value)} 
              />
            </div>

            <div>
              <label className="seller-form-label">Primary Color</label>
              <input 
                className="seller-form-input" 
                placeholder="e.g. Midnight Navy, Rose Gold" 
                value={color} 
                onChange={(e) => setColor(e.target.value)} 
              />
            </div>

            <div>
              <label className="seller-form-label">Primary Material</label>
              <input 
                className="seller-form-input" 
                placeholder="e.g. Stainless Steel, Teak, Cotton" 
                value={material} 
                onChange={(e) => setMaterial(e.target.value)} 
              />
            </div>

            <div>
              <label className="seller-form-label">Warranty Details</label>
              <input 
                className="seller-form-input" 
                placeholder="e.g. 1 Year Replacement" 
                value={warranty} 
                onChange={(e) => setWarranty(e.target.value)} 
              />
            </div>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* SECTION 8: PUBLISHING ACTIONS & VALIDATION FEEDBACK */}
        {/* ==================================================================== */}
        {/* Address verification required banner if triggered */}
        {showAddressWarning && !isSellerAddressVerified && (
          <div 
            id="seller-address-warning-banner"
            style={{
              background: '#FFFBEB',
              border: '1px solid #FCD34D',
              borderRadius: 'var(--radius-md)',
              padding: '14px 18px',
              marginTop: 18,
              marginBottom: 10,
              display: 'flex',
              flexDirection: 'column',
              gap: 10
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#B45309', fontWeight: 700, fontSize: '0.92rem' }}>
              <AlertTriangle size={18} color="#B45309" />
              <span>Seller Business Address Verification Needed</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
              Your business and dispatch PIN code must be verified with India Post to calculate accurate courier delivery times. You can verify your address now, save as draft, or publish immediately in demo mode.
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginTop: 4 }}>
              <button
                type="button"
                className="btn btn-yellow btn-sm"
                onClick={() => {
                  if (onOpenAddressSetup) onOpenAddressSetup();
                }}
                style={{ fontWeight: 700 }}
              >
                Verify Address with Postal PIN
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => handleSaveProduct(true)}
                style={{ fontSize: '0.82rem' }}
              >
                Save as Draft
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={proceedPublishWithDemoAddress}
                style={{ fontSize: '0.82rem', color: 'var(--color-primary)', textDecoration: 'underline', fontWeight: 600 }}
              >
                Apply Demo Verified Address & Publish
              </button>
            </div>
          </div>
        )}

        {/* Validation or submission error notification */}
        {submitError && (
          <div style={{
            background: 'var(--color-danger-bg)',
            border: '1px solid rgba(198, 40, 40, 0.3)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 14px',
            marginTop: 14,
            marginBottom: 6,
            color: 'var(--color-danger)',
            fontSize: '0.85rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 10
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={18} color="var(--color-danger)" style={{ flexShrink: 0 }} />
              <span>{submitError}</span>
            </div>
            {!isSellerAddressVerified && (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => {
                  if (onOpenAddressSetup) onOpenAddressSetup();
                }}
              >
                Verify Address Now
              </button>
            )}
          </div>
        )}

        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: 16, 
          marginTop: 20, 
          paddingTop: 16, 
          borderTop: '1px solid var(--color-border)' 
        }}>
          <div>
            {missingRequirements.length > 0 && (
              <span style={{ fontSize: '0.74rem', color: 'var(--color-danger)', fontWeight: 700, display: 'block' }}>
                Required before publishing: {missingRequirements.join(', ')}
              </span>
            )}
            {!isSellerAddressVerified && missingRequirements.length === 0 && (
              <span style={{ fontSize: '0.74rem', color: '#B45309', fontWeight: 700, display: 'block' }}>
                Seller business address must be verified before publishing.
              </span>
            )}
            {uploadedImages.length === 0 && missingRequirements.length === 0 && (
              <span style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', display: 'block' }}>
                Tip: Default category photo will be used. You can upload custom photos anytime.
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button 
              type="button" 
              className="btn btn-outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>

            <button 
              type="button" 
              className="btn btn-outline"
              onClick={() => handleSaveProduct(true)}
              disabled={isSubmitting || !name.trim()}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <FileText size={16} /> Save as Draft
            </button>

            <button 
              type="button" 
              id="btn-publish-to-marketplace"
              className="btn btn-publish-marketplace"
              onClick={() => handleSaveProduct(false)}
              disabled={isSubmitting}
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: 9,
                background: isSubmitting 
                  ? '#174EA6' 
                  : 'linear-gradient(135deg, #00A6FF 0%, #2874F0 50%, #174EA6 100%)',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '0.96rem',
                letterSpacing: '0.2px',
                padding: '12px 28px',
                borderRadius: '9999px',
                border: 'none',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                boxShadow: isSubmitting 
                  ? 'none' 
                  : '0 4px 14px rgba(40, 116, 240, 0.45)',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                outline: 'none'
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 6px 18px rgba(40, 116, 240, 0.55)';
                  e.currentTarget.style.background = 'linear-gradient(135deg, #00B4FF 0%, #1459C7 50%, #0F3E8A 100%)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(40, 116, 240, 0.45)';
                  e.currentTarget.style.background = 'linear-gradient(135deg, #00A6FF 0%, #2874F0 50%, #174EA6 100%)';
                }
              }}
              onMouseDown={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.transform = 'translateY(1px) scale(0.98)';
                }
              }}
              onMouseUp={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={19} className="spin-animation" />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <Check size={19} strokeWidth={2.8} />
                  <span>Publish to Marketplace</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
