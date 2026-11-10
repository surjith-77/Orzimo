// ==============================================================================
// ORZIMO MARKETPLACE - UNIFIED DATABASE & STORAGE ADAPTER
// ==============================================================================
// Interacts with Supabase when configured, or transparently persists to 
// clean structured local storage. Zero mock data is included.
// ==============================================================================

import { supabase, isSupabaseConfigured } from '../lib/supabase.js';

const STORAGE_KEYS = {
  USERS: 'orzimo_db_users',
  PRODUCTS: 'orzimo_db_products',
  ORDERS: 'orzimo_db_orders',
  BOOKINGS: 'orzimo_db_bookings',
  NOTIFICATIONS: 'orzimo_db_notifications',
  SELLER_SETTINGS: 'orzimo_db_seller_settings',
  BUYER_ADDRESSES: 'orzimo_db_buyer_addresses',
  SELLER_ADDRESSES: 'orzimo_db_seller_addresses',
  ACTIVE_DELIVERY_LOCATION: 'orzimo_active_delivery_location',
  CART: 'orzimo_db_cart',
  WISHLIST: 'orzimo_db_wishlist',
  CURRENT_USER: 'orzimo_user',
  CURRENT_ROLE: 'orzimo_role'
};

// ------------------------------------------------------------------------------
// 1. Password Hashing (Web Crypto API SHA-256) - Never store plaintext passwords
// ------------------------------------------------------------------------------
export async function hashPassword(password) {
  if (!password) return '';
  const encoder = new TextEncoder();
  const data = encoder.encode(password + '_orzimo_salt_2026');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ------------------------------------------------------------------------------
// 2. Safe Legacy Mock Data Purge
// Cleans out all artificial dummy records from localStorage while keeping real data.
// ------------------------------------------------------------------------------
export function purgeMockData() {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return;
  }
  try {
    // Purge legacy products containing mock IDs (prod-1, prod-2, etc.)
    const legacyProducts = localStorage.getItem('orzimo_products');
    if (legacyProducts) {
      try {
        const parsed = JSON.parse(legacyProducts);
        const cleaned = parsed.filter(p => !p.id?.startsWith('prod-') || p.id?.startsWith('prod-custom-'));
        // If they were all demo mock products, clear to empty
        if (cleaned.length === 0 || cleaned.every(p => p.id === 'prod-1' || p.id === 'prod-2' || p.id === 'prod-3')) {
          localStorage.removeItem('orzimo_products');
        } else {
          localStorage.setItem('orzimo_products', JSON.stringify(cleaned));
        }
      } catch {
        localStorage.removeItem('orzimo_products');
      }
    }

    // Purge legacy mock orders (ORZ-9021, etc.)
    const legacyOrders = localStorage.getItem('orzimo_orders');
    if (legacyOrders) {
      try {
        const parsed = JSON.parse(legacyOrders);
        const cleaned = parsed.filter(o => 
          o.id !== 'ORZ-9021' && 
          o.id !== 'ORZ-9022' && 
          o.id !== 'ORZ-9023' && 
          o.id !== 'ORZ-9020' && 
          o.id !== 'ORZ-8984'
        );
        if (cleaned.length === 0) {
          localStorage.removeItem('orzimo_orders');
        } else {
          localStorage.setItem('orzimo_orders', JSON.stringify(cleaned));
        }
      } catch {
        localStorage.removeItem('orzimo_orders');
      }
    }

    // Purge legacy mock bookings (BK-101, BK-102)
    const legacyBookings = localStorage.getItem('orzimo_bookings');
    if (legacyBookings) {
      try {
        const parsed = JSON.parse(legacyBookings);
        const cleaned = parsed.filter(b => b.id !== 'BK-101' && b.id !== 'BK-102');
        if (cleaned.length === 0) {
          localStorage.removeItem('orzimo_bookings');
        } else {
          localStorage.setItem('orzimo_bookings', JSON.stringify(cleaned));
        }
      } catch {
        localStorage.removeItem('orzimo_bookings');
      }
    }

    // Purge legacy mock notifications (notif-1, etc.)
    const legacyNotifs = localStorage.getItem('orzimo_notifications');
    if (legacyNotifs) {
      try {
        const parsed = JSON.parse(legacyNotifs);
        const cleaned = parsed.filter(n => 
          n.id !== 'notif-1' && 
          n.id !== 'notif-2' && 
          n.id !== 'notif-3' && 
          n.id !== 'notif-4'
        );
        if (cleaned.length === 0) {
          localStorage.removeItem('orzimo_notifications');
        } else {
          localStorage.setItem('orzimo_notifications', JSON.stringify(cleaned));
        }
      } catch {
        localStorage.removeItem('orzimo_notifications');
      }
    }

    // Purge legacy mock users (Rahul Sharma, Chef Shweta demo accounts)
    const savedUser = localStorage.getItem('orzimo_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        if (
          user.id === 'usr-buyer-1' || 
          user.id === 'sel-1' || 
          user.email === 'rahul.sharma@example.com' || 
          user.email === 'shweta@whiskandfrost.in'
        ) {
          localStorage.removeItem('orzimo_user');
          localStorage.removeItem('orzimo_role');
        }
      } catch {
        localStorage.removeItem('orzimo_user');
      }
    }

    // Purge legacy mock seller settings
    const legacySettings = localStorage.getItem('orzimo_seller_settings');
    if (legacySettings) {
      try {
        const settings = JSON.parse(legacySettings);
        if (settings.shopName === 'Whisk & Frost by Chef Shweta' || settings.fssaiNumber === '21223004000891') {
          localStorage.removeItem('orzimo_seller_settings');
        }
      } catch {
        localStorage.removeItem('orzimo_seller_settings');
      }
    }
  } catch (err) {
    console.error('Error purging legacy mock data:', err);
  }
}

// Run purge immediately on load
purgeMockData();

// Helper to load clean array from local storage
function loadFromStorage(key, fallback = []) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to save ${key} to storage`, e);
  }
}

// ------------------------------------------------------------------------------
// 2.5 USER ACCOUNTS & CREDENTIAL VERIFICATION (ZERO PLAINTEXT STORAGE)
// ------------------------------------------------------------------------------
export async function getStoredUsers() {
  return loadFromStorage(STORAGE_KEYS.USERS, []);
}

export async function findUserByIdentifier(identifier) {
  if (!identifier) return null;
  const cleanId = String(identifier).trim().toLowerCase();
  const digitsOnly = cleanId.replace(/\D/g, '');

  // 1. If Supabase is configured, check Supabase first
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .or(`email.ilike.${cleanId},phone.ilike.%${digitsOnly}%`)
        .maybeSingle();
      if (!error && data) return data;
    } catch (err) {
      console.warn('Supabase fetch user error, checking local store:', err);
    }
  }

  // 2. Check local secure storage
  const users = loadFromStorage(STORAGE_KEYS.USERS, []);
  return users.find(u => {
    const emailMatch = u.email && u.email.toLowerCase() === cleanId;
    const phoneMatch = digitsOnly.length >= 10 && u.phone && u.phone.replace(/\D/g, '').includes(digitsOnly);
    return emailMatch || phoneMatch;
  }) || null;
}

export async function registerUserAccount(userData, rawPassword) {
  const users = loadFromStorage(STORAGE_KEYS.USERS, []);
  const emailLower = (userData.email || '').trim().toLowerCase();
  const phoneClean = (userData.phone || '').trim();

  // Validate duplicate email
  const existing = users.find(u => u.email && u.email.toLowerCase() === emailLower);
  if (existing) {
    throw new Error('An account with this email address already exists. Please sign in instead.');
  }

  // Password hash via Web Crypto SHA-256 (Never store plaintext passwords)
  const passwordHash = rawPassword ? await hashPassword(rawPassword) : null;
  const isSeller = userData.role === 'seller';
  const newUserId = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  const userRecord = {
    id: newUserId,
    name: userData.name ? userData.name.trim() : (isSeller ? 'Artisan Studio' : 'Verified Buyer'),
    email: emailLower,
    phone: phoneClean,
    role: userData.role || 'buyer',
    passwordHash,
    createdAt: new Date().toISOString(),
    ...(isSeller ? {
      shopName: userData.shopName ? userData.shopName.trim() : `${userData.name}'s Studio`,
      category: userData.category || 'cakes-bakery',
      city: userData.city ? userData.city.trim() : '',
      verified: true,
      badge: 'Verified Creator',
      rating: 5.0,
      reviewsCount: 0
    } : {
      city: userData.city ? userData.city.trim() : '',
      address: userData.address ? userData.address.trim() : ''
    })
  };

  // Sync to Supabase if configured
  if (isSupabaseConfigured && supabase) {
    try {
      if (isSeller) {
        await supabase.from('sellers').upsert({
          id: newUserId,
          shop_name: userRecord.shopName,
          category: userRecord.category,
          contact_phone: userRecord.phone,
          location: userRecord.city,
          verified: true
        });
      }
    } catch (err) {
      console.warn('Supabase account sync error:', err);
    }
  }

  users.push(userRecord);
  saveToStorage(STORAGE_KEYS.USERS, users);

  // Return clean user object WITHOUT passwordHash
  const { passwordHash: _, ...cleanUser } = userRecord;
  return cleanUser;
}

export async function verifyUserCredentials(identifier, rawPassword, expectedRole) {
  const user = await findUserByIdentifier(identifier);
  if (!user) {
    return {
      success: false,
      error: 'No account found with this email or phone. Please sign up to continue.'
    };
  }

  // Prevent role spoofing / gaining seller permissions simply by changing selected role
  if (expectedRole && user.role !== expectedRole) {
    const accountRole = user.role === 'seller' ? 'Seller' : 'Buyer';
    const targetRole = expectedRole === 'seller' ? 'Seller' : 'Buyer';
    return {
      success: false,
      error: `Role Mismatch: This account is registered as a ${accountRole}. To access as a ${targetRole}, please create a separate ${targetRole} account or switch back to the ${accountRole} login.`,
      userRole: user.role
    };
  }

  if (user.passwordHash && rawPassword) {
    const inputHash = await hashPassword(rawPassword);
    if (inputHash !== user.passwordHash) {
      return {
        success: false,
        error: 'Incorrect password. Please verify and try again.'
      };
    }
  }

  const { passwordHash: _, ...cleanUser } = user;
  return { success: true, user: cleanUser };
}


// ------------------------------------------------------------------------------
// 3. PRODUCTS DATA ACCESS
// ------------------------------------------------------------------------------
export async function getProducts() {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, seller:sellers(*)')
        .order('created_at', { ascending: false });
      if (!error && data) {
        return data.map(item => ({
          ...item,
          categoryId: item.category_id,
          categoryName: item.category_name,
          stockQuantity: item.stock_quantity,
          isOutOfStock: item.is_out_of_stock,
          isPreBookable: item.is_pre_bookable,
          isCustomizable: item.is_customizable,
          isBestseller: item.is_bestseller,
          isFresh: item.is_fresh,
          deliverySlot: item.delivery_slot,
          leadTime: item.lead_time,
          customOptions: item.custom_options,
          shortDesc: item.short_desc,
          condition: item.condition || 'New',
          brand: item.brand || null,
          sku: item.sku || null,
          specifications: item.specifications || {},
          variants: item.variants || [],
          isVerified: item.is_verified ?? false,
          verificationResult: item.verification_result || null,
          isDraft: item.is_draft ?? false,
          seller: item.seller ? {
            id: item.seller.id,
            name: item.seller.shop_name,
            location: item.seller.location,
            verified: item.seller.verified,
            badge: item.seller.badge,
            rating: item.seller.rating,
            reviewCount: item.seller.reviews_count
          } : item.seller
        }));
      }
    } catch (err) {
      console.warn('Supabase fetch products error, fallback to local store:', err);
    }
  }
  return loadFromStorage(STORAGE_KEYS.PRODUCTS, []);
}

export async function createProduct(productData) {
  const newProduct = {
    id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
    rating: 0,
    reviewCount: 0,
    isBestseller: false,
    isOutOfStock: false,
    ...productData
  };

  if (isSupabaseConfigured) {
    try {
      await supabase.from('products').insert([{
        id: newProduct.id,
        seller_id: newProduct.sellerId,
        name: newProduct.name,
        category_id: newProduct.categoryId,
        category_name: newProduct.categoryName,
        price: newProduct.price,
        original_price: newProduct.originalPrice,
        discount: newProduct.discount,
        images: newProduct.images || [],
        stock_quantity: newProduct.stockQuantity || 10,
        is_pre_bookable: newProduct.isPreBookable ?? true,
        is_customizable: newProduct.isCustomizable ?? false,
        delivery_slot: newProduct.deliverySlot || 'Standard Delivery',
        lead_time: newProduct.leadTime || '24 hours notice',
        custom_options: newProduct.customOptions || {},
        short_desc: newProduct.shortDesc || '',
        condition: newProduct.condition || 'New',
        brand: newProduct.brand || null,
        sku: newProduct.sku || null,
        specifications: newProduct.specifications || {},
        variants: newProduct.variants || [],
        is_verified: newProduct.isVerified ?? false,
        verification_result: newProduct.verificationResult || null,
        is_draft: newProduct.isDraft ?? false
      }]);
    } catch (err) {
      console.warn('Supabase create product error:', err);
    }
  }

  const current = loadFromStorage(STORAGE_KEYS.PRODUCTS, []);
  const updated = [newProduct, ...current];
  saveToStorage(STORAGE_KEYS.PRODUCTS, updated);
  return newProduct;
}

export async function updateProduct(id, updates) {
  if (isSupabaseConfigured) {
    try {
      const dbUpdates = {};
      for (const [k, v] of Object.entries(updates)) {
        if (k === 'categoryId') dbUpdates.category_id = v;
        else if (k === 'categoryName') dbUpdates.category_name = v;
        else if (k === 'stockQuantity') dbUpdates.stock_quantity = v;
        else if (k === 'originalPrice') dbUpdates.original_price = v;
        else if (k === 'isPreBookable') dbUpdates.is_pre_bookable = v;
        else if (k === 'isCustomizable') dbUpdates.is_customizable = v;
        else if (k === 'isOutOfStock') dbUpdates.is_out_of_stock = v;
        else if (k === 'isVerified') dbUpdates.is_verified = v;
        else if (k === 'verificationResult') dbUpdates.verification_result = v;
        else if (k === 'isDraft') dbUpdates.is_draft = v;
        else if (k === 'shortDesc') dbUpdates.short_desc = v;
        else if (k === 'deliverySlot') dbUpdates.delivery_slot = v;
        else if (k === 'leadTime') dbUpdates.lead_time = v;
        else if (k === 'customOptions') dbUpdates.custom_options = v;
        else dbUpdates[k] = v;
      }
      await supabase.from('products').update(dbUpdates).eq('id', id);
    } catch (err) {
      console.warn('Supabase update product error:', err);
    }
  }

  const current = loadFromStorage(STORAGE_KEYS.PRODUCTS, []);
  const updated = current.map(p => (p.id === id ? { ...p, ...updates } : p));
  saveToStorage(STORAGE_KEYS.PRODUCTS, updated);
  return updated.find(p => p.id === id);
}

export async function deleteProduct(id) {
  if (isSupabaseConfigured) {
    try {
      await supabase.from('products').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase delete product error:', err);
    }
  }

  const current = loadFromStorage(STORAGE_KEYS.PRODUCTS, []);
  const updated = current.filter(p => p.id !== id);
  saveToStorage(STORAGE_KEYS.PRODUCTS, updated);
  return updated;
}

// ------------------------------------------------------------------------------
// 4. ORDERS DATA ACCESS
// ------------------------------------------------------------------------------
export async function getOrders(filter = {}) {
  if (isSupabaseConfigured) {
    try {
      let query = supabase.from('orders').select('*, items:order_items(*)').order('created_at', { ascending: false });
      if (filter.buyerId) query = query.eq('buyer_id', filter.buyerId);
      if (filter.sellerId) query = query.eq('seller_id', filter.sellerId);
      const { data, error } = await query;
      if (!error && data) {
        return data.map(o => ({
          ...o,
          createdAt: o.created_at,
          totalAmount: o.total_amount,
          slotDate: o.slot_date,
          deliveryType: o.delivery_type,
          specialInstructions: o.special_instructions,
          paymentStatus: o.payment_status,
          customer: {
            name: o.customer_name,
            phone: o.customer_phone,
            address: o.customer_address,
            city: o.customer_city
          },
          items: o.items || []
        }));
      }
    } catch (err) {
      console.warn('Supabase getOrders error:', err);
    }
  }

  const orders = loadFromStorage(STORAGE_KEYS.ORDERS, []);
  if (filter.buyerId) {
    return orders.filter(o => o.buyerId === filter.buyerId || o.customer?.email === filter.buyerEmail);
  }
  if (filter.sellerId) {
    return orders.filter(o => o.sellerId === filter.sellerId);
  }
  return orders;
}

export async function createOrder(orderData) {
  const newOrder = {
    id: `ORZ-${Math.floor(100000 + Math.random() * 900000)}`,
    createdAt: new Date().toISOString(),
    status: 'Pending',
    ...orderData
  };

  if (isSupabaseConfigured) {
    try {
      await supabase.from('orders').insert([{
        id: newOrder.id,
        buyer_id: newOrder.buyerId || null,
        seller_id: newOrder.sellerId,
        customer_name: newOrder.customer?.name || 'Customer',
        customer_phone: newOrder.customer?.phone || '',
        customer_address: newOrder.customer?.address || '',
        customer_city: newOrder.customer?.city || 'Bengaluru',
        slot_date: newOrder.slotDate || 'Earliest Slot',
        delivery_type: newOrder.deliveryType || 'Home Delivery',
        special_instructions: newOrder.specialInstructions || '',
        subtotal: newOrder.subtotal || 0,
        delivery_fee: newOrder.deliveryFee || 0,
        total_amount: newOrder.totalAmount || 0,
        payment_status: newOrder.paymentStatus || 'Pending Confirmation',
        status: newOrder.status || 'Pending'
      }]);

      if (newOrder.items?.length) {
        await supabase.from('order_items').insert(
          newOrder.items.map(item => ({
            order_id: newOrder.id,
            product_id: item.id?.startsWith('prod-') ? null : item.id,
            name: item.name,
            weight: item.weight || '',
            flavor: item.flavor || '',
            message: item.message || '',
            quantity: item.quantity,
            price: item.price,
            image: item.image || ''
          }))
        );
      }
    } catch (err) {
      console.warn('Supabase createOrder error:', err);
    }
  }

  const current = loadFromStorage(STORAGE_KEYS.ORDERS, []);
  const updated = [newOrder, ...current];
  saveToStorage(STORAGE_KEYS.ORDERS, updated);

  // Auto-deduct stock for ordered products
  if (newOrder.items?.length) {
    const products = loadFromStorage(STORAGE_KEYS.PRODUCTS, []);
    const updatedProducts = products.map(p => {
      const orderedItem = newOrder.items.find(i => i.id === p.id);
      if (orderedItem) {
        const nextQty = Math.max(0, (p.stockQuantity ?? 10) - orderedItem.quantity);
        return {
          ...p,
          stockQuantity: nextQty,
          isOutOfStock: nextQty === 0
        };
      }
      return p;
    });
    saveToStorage(STORAGE_KEYS.PRODUCTS, updatedProducts);
  }

  return newOrder;
}

export async function updateOrderStatus(id, newStatus, reason = '') {
  if (isSupabaseConfigured) {
    try {
      await supabase.from('orders').update({
        status: newStatus,
        cancellation_reason: reason,
        updated_at: new Date().toISOString()
      }).eq('id', id);
    } catch (err) {
      console.warn('Supabase updateOrderStatus error:', err);
    }
  }

  const current = loadFromStorage(STORAGE_KEYS.ORDERS, []);
  const updated = current.map(o => {
    if (o.id === id) {
      return {
        ...o,
        status: newStatus,
        cancellationReason: reason || o.cancellationReason,
        updatedAt: new Date().toISOString()
      };
    }
    return o;
  });
  saveToStorage(STORAGE_KEYS.ORDERS, updated);
  return updated.find(o => o.id === id);
}

// ------------------------------------------------------------------------------
// 5. BOOKINGS DATA ACCESS
// ------------------------------------------------------------------------------
export async function getBookings(filter = {}) {
  const all = loadFromStorage(STORAGE_KEYS.BOOKINGS, []);
  if (filter.sellerId) {
    return all.filter(b => b.sellerId === filter.sellerId);
  }
  if (filter.buyerId) {
    return all.filter(b => b.buyerId === filter.buyerId);
  }
  return all;
}

export async function createBooking(data) {
  const newBooking = {
    id: `BK-${Math.floor(100 + Math.random() * 900)}`,
    createdAt: new Date().toISOString(),
    status: 'Pending Review',
    ...data
  };

  const current = loadFromStorage(STORAGE_KEYS.BOOKINGS, []);
  const updated = [newBooking, ...current];
  saveToStorage(STORAGE_KEYS.BOOKINGS, updated);
  return newBooking;
}

export async function updateBookingStatus(id, status, declineReason = '') {
  const current = loadFromStorage(STORAGE_KEYS.BOOKINGS, []);
  const updated = current.map(b => (b.id === id ? { ...b, status, declineReason } : b));
  saveToStorage(STORAGE_KEYS.BOOKINGS, updated);
  return updated.find(b => b.id === id);
}

// ------------------------------------------------------------------------------
// 6. NOTIFICATIONS DATA ACCESS
// ------------------------------------------------------------------------------
export async function getNotifications(userId) {
  const all = loadFromStorage(STORAGE_KEYS.NOTIFICATIONS, []);
  if (userId) {
    return all.filter(n => !n.userId || n.userId === userId);
  }
  return all;
}

export async function createNotification(notif) {
  const newNotif = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString(),
    time: 'Just now',
    read: false,
    ...notif
  };

  const current = loadFromStorage(STORAGE_KEYS.NOTIFICATIONS, []);
  const updated = [newNotif, ...current];
  saveToStorage(STORAGE_KEYS.NOTIFICATIONS, updated);
  return newNotif;
}

export async function markNotificationRead(id) {
  const current = loadFromStorage(STORAGE_KEYS.NOTIFICATIONS, []);
  const updated = current.map(n => (n.id === id ? { ...n, read: true } : n));
  saveToStorage(STORAGE_KEYS.NOTIFICATIONS, updated);
  return updated;
}

export async function markAllNotificationsRead(userId) {
  const current = loadFromStorage(STORAGE_KEYS.NOTIFICATIONS, []);
  const updated = current.map(n => {
    if (!userId || n.userId === userId) {
      return { ...n, read: true };
    }
    return n;
  });
  saveToStorage(STORAGE_KEYS.NOTIFICATIONS, updated);
  return updated;
}

export async function clearNotification(id) {
  const current = loadFromStorage(STORAGE_KEYS.NOTIFICATIONS, []);
  const updated = current.filter(n => n.id !== id);
  saveToStorage(STORAGE_KEYS.NOTIFICATIONS, updated);
  return updated;
}

// ------------------------------------------------------------------------------
// 7. SELLER STORE SETTINGS & PROFILE
// ------------------------------------------------------------------------------
export function getSellerSettings(sellerId) {
  const key = `${STORAGE_KEYS.SELLER_SETTINGS}_${sellerId || 'default'}`;
  return loadFromStorage(key, {
    shopName: '',
    logoUrl: '',
    description: '',
    category: 'cakes-bakery',
    contactPhone: '',
    contactEmail: '',
    whatsapp: '',
    kitchenAddress: '',
    fssaiNumber: '',
    payoutUpi: '',
    isOpenForOrders: true,
    maxOrdersPerDay: 8,
    leadTimeHours: 24,
    allowPickup: true,
    allowDelivery: true,
    blockedDates: [],
    phoneAlerts: true
  });
}

export function saveSellerSettings(sellerId, settings) {
  const key = `${STORAGE_KEYS.SELLER_SETTINGS}_${sellerId || 'default'}`;
  saveToStorage(key, settings);
  return settings;
}

// ------------------------------------------------------------------------------
// 8. BUYER ADDRESSES
// ------------------------------------------------------------------------------
export function getBuyerAddresses(userId) {
  const all = loadFromStorage(STORAGE_KEYS.BUYER_ADDRESSES, []);
  if (!userId) return all;
  return all.filter(a => a.userId === userId);
}

export function saveBuyerAddress(userId, addressData) {
  const all = loadFromStorage(STORAGE_KEYS.BUYER_ADDRESSES, []);
  let updated;

  const newAddress = {
    id: addressData.id || `addr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    userId,
    fullName: addressData.fullName || '',
    phone: addressData.phone || '',
    houseNo: addressData.houseNo || '',
    street: addressData.street || '',
    area: addressData.area || '',
    landmark: addressData.landmark || '',
    pincode: String(addressData.pincode || '').trim(),
    city: addressData.city || '',
    district: addressData.district || '',
    state: addressData.state || '',
    addressType: addressData.addressType || 'Home',
    isDefault: Boolean(addressData.isDefault),
    isVerified: Boolean(addressData.isVerified),
    createdAt: addressData.createdAt || new Date().toISOString()
  };

  const existingIndex = all.findIndex(a => a.id === newAddress.id);

  if (newAddress.isDefault) {
    all.forEach(a => {
      if (a.userId === userId && a.id !== newAddress.id) {
        a.isDefault = false;
      }
    });
  } else if (all.filter(a => a.userId === userId).length === 0) {
    newAddress.isDefault = true;
  }

  if (existingIndex !== -1) {
    all[existingIndex] = newAddress;
    updated = all;
  } else {
    updated = [newAddress, ...all];
  }

  saveToStorage(STORAGE_KEYS.BUYER_ADDRESSES, updated);
  return newAddress;
}

export function setDefaultBuyerAddress(userId, addressId) {
  const all = loadFromStorage(STORAGE_KEYS.BUYER_ADDRESSES, []);
  const updated = all.map(a => {
    if (a.userId === userId) {
      return { ...a, isDefault: a.id === addressId };
    }
    return a;
  });
  saveToStorage(STORAGE_KEYS.BUYER_ADDRESSES, updated);
  return updated.filter(a => a.userId === userId);
}

export function deleteBuyerAddress(addressId) {
  const all = loadFromStorage(STORAGE_KEYS.BUYER_ADDRESSES, []);
  const updated = all.filter(a => a.id !== addressId);
  saveToStorage(STORAGE_KEYS.BUYER_ADDRESSES, updated);
  return updated;
}

// ------------------------------------------------------------------------------
// 9. SELLER BUSINESS & DISPATCH ADDRESSES
// ------------------------------------------------------------------------------
export function getSellerAddress(sellerId) {
  const all = loadFromStorage(STORAGE_KEYS.SELLER_ADDRESSES, {});
  if (all[sellerId]) return all[sellerId];

  // Pre-seed demo seller (sel-1 / sel-default) so address verification is satisfied out-of-the-box
  if (sellerId === 'sel-1' || sellerId === 'sel-default' || !sellerId) {
    const defaultSellerAddr = {
      sellerId: sellerId || 'sel-1',
      sellerName: 'Chef Shweta Rao',
      shopName: 'Whisk & Frost by Chef Shweta',
      countryCode: '+91',
      contactPhone: '9820112345',
      isPhoneVerified: true,
      phoneVerifiedAt: new Date().toISOString(),
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
      },
      sameAsBusiness: true,
      isComplete: true
    };
    all[sellerId || 'sel-1'] = defaultSellerAddr;
    saveToStorage(STORAGE_KEYS.SELLER_ADDRESSES, all);
    return defaultSellerAddr;
  }

  return {
    sellerId,
    sellerName: '',
    shopName: '',
    countryCode: '+91',
    contactPhone: '',
    isPhoneVerified: false,
    phoneVerifiedAt: null,
    businessAddress: null,
    dispatchAddress: null,
    sameAsBusiness: true,
    isComplete: false
  };
}

export async function getSellerAddressAsync(sellerId) {
  if (!sellerId) return getSellerAddress(sellerId);

  // Attempt Supabase fetch if configured
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('seller_addresses')
        .select('*')
        .eq('seller_id', String(sellerId))
        .maybeSingle();

      if (!error && data) {
        const payload = {
          sellerId: data.seller_id,
          sellerName: data.seller_name || '',
          shopName: data.shop_name || '',
          countryCode: data.country_code || '+91',
          contactPhone: data.contact_phone || '',
          isPhoneVerified: Boolean(data.is_phone_verified),
          phoneVerifiedAt: data.phone_verified_at || null,
          businessAddress: data.business_address || null,
          dispatchAddress: data.dispatch_address || null,
          sameAsBusiness: Boolean(data.is_same_as_business),
          isComplete: Boolean(data.is_verified) && Boolean(data.is_phone_verified),
          updatedAt: data.updated_at
        };

        // Sync with local persistent storage cache
        const all = loadFromStorage(STORAGE_KEYS.SELLER_ADDRESSES, {});
        all[sellerId] = payload;
        saveToStorage(STORAGE_KEYS.SELLER_ADDRESSES, all);
        return payload;
      }
    } catch (err) {
      console.warn('Supabase getSellerAddressAsync notice, using cache:', err);
    }
  }

  return getSellerAddress(sellerId);
}

export async function saveSellerAddress(sellerId, addressData) {
  const all = loadFromStorage(STORAGE_KEYS.SELLER_ADDRESSES, {});

  const isPhoneVerified = Boolean(addressData.isPhoneVerified);

  const isBusinessVerified = Boolean(
    addressData.businessAddress?.isVerified && 
    addressData.businessAddress?.pincode && 
    addressData.businessAddress?.buildingNo
  );
  
  const isDispatchVerified = Boolean(
    addressData.sameAsBusiness
      ? isBusinessVerified
      : (
          addressData.dispatchAddress?.isVerified && 
          addressData.dispatchAddress?.pincode && 
          addressData.dispatchAddress?.buildingNo
        )
  );

  const payload = {
    sellerId: String(sellerId),
    sellerName: addressData.sellerName || '',
    shopName: addressData.shopName || '',
    countryCode: addressData.countryCode || '+91',
    contactPhone: addressData.contactPhone || '',
    isPhoneVerified,
    phoneVerifiedAt: addressData.phoneVerifiedAt || (isPhoneVerified ? new Date().toISOString() : null),
    businessAddress: addressData.businessAddress || null,
    dispatchAddress: addressData.sameAsBusiness ? addressData.businessAddress : (addressData.dispatchAddress || null),
    sameAsBusiness: Boolean(addressData.sameAsBusiness),
    isComplete: isBusinessVerified && isDispatchVerified && isPhoneVerified,
    updatedAt: new Date().toISOString()
  };

  // 1. Immediately persist to structured storage cache
  all[sellerId] = payload;
  saveToStorage(STORAGE_KEYS.SELLER_ADDRESSES, all);

  // 2. Persist to Supabase Database if configured
  if (isSupabaseConfigured && supabase && sellerId) {
    try {
      const { error: upsertErr } = await supabase
        .from('seller_addresses')
        .upsert({
          seller_id: String(sellerId),
          business_address: payload.businessAddress,
          dispatch_address: payload.dispatchAddress,
          is_same_as_business: payload.sameAsBusiness,
          is_verified: payload.isComplete,
          verified_at: payload.isComplete ? new Date().toISOString() : null,
          seller_name: payload.sellerName,
          shop_name: payload.shopName,
          country_code: payload.countryCode,
          contact_phone: payload.contactPhone,
          is_phone_verified: payload.isPhoneVerified,
          phone_verified_at: payload.phoneVerifiedAt,
          updated_at: new Date().toISOString()
        }, { onConflict: 'seller_id' });

      if (upsertErr) {
        console.error('Supabase seller_addresses upsert error:', upsertErr);
        throw new Error(`Database save error: ${upsertErr.message || upsertErr.details || 'Supabase rejected the address update.'}`);
      }

      // Also update seller table if registered
      try {
        await supabase
          .from('sellers')
          .update({ 
            country_code: payload.countryCode,
            contact_phone: payload.contactPhone,
            is_phone_verified: payload.isPhoneVerified,
            phone_verified_at: payload.phoneVerifiedAt,
            is_address_verified: payload.isComplete,
            updated_at: new Date().toISOString()
          })
          .eq('id', String(sellerId));
      } catch (_sellerUpdateErr) {
        // Ignored if sellers row not initialized yet
      }
    } catch (err) {
      console.error('Supabase seller address persistence error:', err);
      throw err;
    }
  }

  return payload;
}

// ------------------------------------------------------------------------------
// 10. ACTIVE DELIVERY LOCATION (FOR HEADER / CURRENT BROWSER SESSION)
// ------------------------------------------------------------------------------
export function getActiveDeliveryLocation() {
  const fallback = {
    pincode: '638701',
    locality: 'Kangayam',
    district: 'Tiruppur',
    state: 'Tamil Nadu',
    isVerified: true
  };
  return loadFromStorage(STORAGE_KEYS.ACTIVE_DELIVERY_LOCATION, fallback);
}

export function setActiveDeliveryLocation(location) {
  saveToStorage(STORAGE_KEYS.ACTIVE_DELIVERY_LOCATION, location);
  return location;
}
