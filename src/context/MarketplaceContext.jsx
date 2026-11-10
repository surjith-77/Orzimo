import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  getProducts, 
  createProduct, 
  updateProduct as dbUpdateProduct, 
  deleteProduct as dbDeleteProduct,
  getOrders,
  createOrder as dbCreateOrder,
  updateOrderStatus as dbUpdateOrderStatus,
  getBookings,
  createBooking as dbCreateBooking,
  updateBookingStatus as dbUpdateBookingStatus,
  getNotifications,
  createNotification as dbCreateNotification,
  markNotificationRead as dbMarkNotificationRead,
  markAllNotificationsRead as dbMarkAllNotificationsRead,
  clearNotification as dbClearNotification,
  getSellerSettings,
  saveSellerSettings,
  getBuyerAddresses,
  saveBuyerAddress,
  setDefaultBuyerAddress,
  deleteBuyerAddress,
  getSellerAddress,
  getSellerAddressAsync,
  saveSellerAddress,
  getActiveDeliveryLocation,
  setActiveDeliveryLocation
} from '../services/db';
import { useAuth } from './AuthContext';

const MarketplaceContext = createContext();

export function MarketplaceProvider({ children }) {
  const { currentUser } = useAuth();

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [bookingRequests, setBookingRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [sellerSettings, setSellerSettings] = useState(() => getSellerSettings(currentUser?.id));
  const [isLoading, setIsLoading] = useState(true);

  // Delivery Location & Address States
  const [deliveryLocation, setDeliveryLocation] = useState(() => getActiveDeliveryLocation());
  const [buyerAddresses, setBuyerAddresses] = useState([]);
  const [sellerAddress, setSellerAddress] = useState(null);

  // Load all initial authentic data from database
  const refreshData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [fetchedProducts, fetchedOrders, fetchedBookings, fetchedNotifs] = await Promise.all([
        getProducts(),
        getOrders(),
        getBookings(),
        getNotifications(currentUser?.id)
      ]);

      setProducts(fetchedProducts || []);
      setOrders(fetchedOrders || []);
      setBookingRequests(fetchedBookings || []);
      setNotifications(fetchedNotifs || []);

      if (currentUser?.id) {
        const addrs = getBuyerAddresses(currentUser.id);
        setBuyerAddresses(addrs);

        // If user has default address, set delivery location to default address
        const defaultAddr = addrs.find(a => a.isDefault);
        if (defaultAddr && defaultAddr.pincode) {
          const loc = {
            pincode: defaultAddr.pincode,
            locality: defaultAddr.area || defaultAddr.city,
            district: defaultAddr.district,
            state: defaultAddr.state,
            addressId: defaultAddr.id,
            isVerified: true
          };
          setDeliveryLocation(loc);
          setActiveDeliveryLocation(loc);
        }

        const sAddr = await getSellerAddressAsync(currentUser.id);
        setSellerAddress(sAddr);
      }
    } catch (err) {
      console.error('Failed to load marketplace records:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Update seller settings and load address when current user changes
  useEffect(() => {
    if (currentUser?.id) {
      const settings = getSellerSettings(currentUser.id);
      setSellerSettings({
        ...settings,
        shopName: currentUser.shopName || settings.shopName || `${currentUser.name}'s Studio`,
        contactEmail: currentUser.email || settings.contactEmail,
        contactPhone: currentUser.phone || settings.contactPhone,
        kitchenAddress: currentUser.location || currentUser.address || settings.kitchenAddress
      });

      getSellerAddressAsync(currentUser.id).then(sAddr => {
        if (sAddr) setSellerAddress(sAddr);
      });
    }
  }, [currentUser]);

  // ============================================================================
  // DELIVERY LOCATION & BUYER ADDRESSES
  // ============================================================================
  const updateDeliveryLocation = (newLoc) => {
    setDeliveryLocation(newLoc);
    setActiveDeliveryLocation(newLoc);
  };

  const addOrUpdateBuyerAddress = (addrData) => {
    if (!currentUser?.id) return null;
    const saved = saveBuyerAddress(currentUser.id, addrData);
    const updatedList = getBuyerAddresses(currentUser.id);
    setBuyerAddresses(updatedList);

    // Apply as active delivery location if default or first address
    if (saved.isDefault || updatedList.length === 1) {
      updateDeliveryLocation({
        pincode: saved.pincode,
        locality: saved.area || saved.city,
        district: saved.district,
        state: saved.state,
        addressId: saved.id,
        isVerified: true
      });
    }

    return saved;
  };

  const setAsDefaultAddress = (addressId) => {
    if (!currentUser?.id) return;
    const updated = setDefaultBuyerAddress(currentUser.id, addressId);
    setBuyerAddresses(updated);
    const def = updated.find(a => a.id === addressId);
    if (def) {
      updateDeliveryLocation({
        pincode: def.pincode,
        locality: def.area || def.city,
        district: def.district,
        state: def.state,
        addressId: def.id,
        isVerified: true
      });
    }
  };

  const removeBuyerAddress = (addressId) => {
    if (!currentUser?.id) return;
    deleteBuyerAddress(addressId);
    setBuyerAddresses(getBuyerAddresses(currentUser.id));
  };

  // ============================================================================
  // SELLER BUSINESS & DISPATCH ADDRESS
  // ============================================================================
  const updateSellerAddressData = async (addressData) => {
    if (!currentUser?.id) return null;
    const saved = await saveSellerAddress(currentUser.id, addressData);
    setSellerAddress(saved);
    return saved;
  };

  const isSellerAddressVerified = Boolean(sellerAddress?.isComplete);

  // ============================================================================
  // PRODUCT OPERATIONS (Authentic seller creations)
  // ============================================================================
  const addProduct = async (productData) => {
    const sellerId = currentUser?.id || 'sel-default';
    const sellerName = currentUser?.shopName || currentUser?.name || 'Local Artisan';
    const sellerLocation = currentUser?.location || currentUser?.city || 'India';

    // Seller dispatch info
    const currentSAddr = sellerAddress || getSellerAddress(sellerId);
    const dispatchPin = currentSAddr?.dispatchAddress?.pincode || productData.sellerDispatchPin || '';
    const dispatchCity = currentSAddr?.dispatchAddress?.city || currentSAddr?.dispatchAddress?.district || '';
    const dispatchState = currentSAddr?.dispatchAddress?.state || '';

    const newProductPayload = {
      ...productData,
      sellerId,
      seller: {
        id: sellerId,
        name: sellerName,
        location: sellerLocation,
        dispatchPin,
        dispatchCity,
        dispatchState,
        rating: 0,
        reviewCount: 0,
        badge: currentUser?.badge || 'New Creator',
        verified: currentUser?.verified || false
      },
      sellerDispatchPin: dispatchPin,
      sellerDispatchCity: dispatchCity,
      sellerDispatchState: dispatchState,
      preparationDays: productData.preparationDays !== undefined ? parseInt(productData.preparationDays, 10) : 1,
      stockQuantity: productData.stockQuantity !== undefined ? parseInt(productData.stockQuantity, 10) : 10,
      dailyBatchLimit: productData.dailyBatchLimit || 6,
      isOutOfStock: (parseInt(productData.stockQuantity, 10) || 0) === 0
    };

    const savedProduct = await createProduct(newProductPayload);
    setProducts((prev) => [savedProduct, ...prev]);

    // Send real notification to seller
    addNotification({
      type: savedProduct.isDraft ? 'system' : 'order',
      title: savedProduct.isDraft ? 'Product Draft Saved' : 'New Creation Live',
      message: savedProduct.isDraft 
        ? `"${savedProduct.name || 'Draft Product'}" was saved as a draft. You can complete and publish it anytime.`
        : `"${savedProduct.name}" is now published and available on the Orzimo marketplace!`,
      orderId: savedProduct.id,
      userId: sellerId
    });

    return savedProduct;
  };

  const updateProduct = async (productId, updatedFields) => {
    const updated = await dbUpdateProduct(productId, updatedFields);
    setProducts((prev) => 
      prev.map((p) => (p.id === productId ? { ...p, ...updatedFields } : p))
    );
    return updated;
  };

  const deleteProduct = async (productId) => {
    await dbDeleteProduct(productId);
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const toggleProductAvailability = async (productId) => {
    const target = products.find(p => p.id === productId);
    if (!target) return;
    const nextOutOfStock = !target.isOutOfStock;
    const nextStock = nextOutOfStock ? 0 : (target.stockQuantity > 0 ? target.stockQuantity : 10);
    
    await updateProduct(productId, {
      isOutOfStock: nextOutOfStock,
      stockQuantity: nextStock
    });
  };

  const updateStock = async (productId, newQuantity) => {
    const qty = Math.max(0, parseInt(newQuantity, 10) || 0);
    await updateProduct(productId, {
      stockQuantity: qty,
      isOutOfStock: qty === 0
    });
  };

  // ============================================================================
  // ORDER OPERATIONS (Authentic customer orders & status progression)
  // ============================================================================
  const addOrder = async (orderData) => {
    const targetSellerId = orderData.sellerId || (orderData.items?.[0]?.sellerId) || (products.find(p => p.id === orderData.items?.[0]?.id)?.sellerId) || 'seller';

    const payload = {
      buyerId: currentUser?.id || null,
      sellerId: targetSellerId,
      status: 'Pending',
      paymentStatus: 'Pending (Slot Confirmed)',
      ...orderData
    };

    const savedOrder = await dbCreateOrder(payload);
    setOrders((prev) => [savedOrder, ...prev]);

    // Also reload products to reflect updated inventory stock
    const updatedProducts = await getProducts();
    setProducts(updatedProducts);

    // Alert the specific seller
    addNotification({
      type: 'order',
      title: `New Pre-Order #${savedOrder.id}`,
      message: `${savedOrder.customer?.name || 'A buyer'} placed an order for slot ${savedOrder.slotDate || 'upcoming'}.`,
      orderId: savedOrder.id,
      userId: targetSellerId
    });

    return savedOrder;
  };

  const updateOrderStatus = async (orderId, newStatus, reason = '') => {
    const updated = await dbUpdateOrderStatus(orderId, newStatus, reason);
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? {
        ...ord,
        status: newStatus,
        cancellationReason: reason || ord.cancellationReason,
        updatedAt: new Date().toISOString()
      } : ord))
    );

    const targetOrder = orders.find(o => o.id === orderId);
    if (targetOrder?.buyerId) {
      addNotification({
        type: 'order',
        title: `Order #${orderId} Updated`,
        message: `Your order status changed to "${newStatus}"${reason ? ` (${reason})` : ''}.`,
        orderId,
        userId: targetOrder.buyerId
      });
    }

    return updated;
  };

  // ============================================================================
  // BOOKINGS (Bespoke custom inquiries)
  // ============================================================================
  const addBooking = async (bookingData) => {
    const newBooking = await dbCreateBooking({
      buyerId: currentUser?.id || null,
      ...bookingData
    });
    setBookingRequests((prev) => [newBooking, ...prev]);
    return newBooking;
  };

  const acceptBookingRequest = async (bookingId) => {
    await dbUpdateBookingStatus(bookingId, 'Accepted');
    setBookingRequests((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'Accepted' } : b))
    );
  };

  const declineBookingRequest = async (bookingId, reason = 'Studio capacity full for this date') => {
    await dbUpdateBookingStatus(bookingId, 'Declined', reason);
    setBookingRequests((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'Declined', declineReason: reason } : b))
    );
  };

  // ============================================================================
  // NOTIFICATIONS
  // ============================================================================
  const addNotification = async (notif) => {
    const newNotif = await dbCreateNotification(notif);
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const markNotificationRead = async (id) => {
    await dbMarkNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = async () => {
    await dbMarkAllNotificationsRead(currentUser?.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotification = async (id) => {
    await dbClearNotification(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // ============================================================================
  // SELLER STORE SETTINGS
  // ============================================================================
  const updateSellerSettings = (newSettings) => {
    setSellerSettings((prev) => {
      const merged = { ...prev, ...newSettings };
      saveSellerSettings(currentUser?.id, merged);
      return merged;
    });
  };

  return (
    <MarketplaceContext.Provider value={{
      products,
      orders,
      bookingRequests,
      notifications,
      sellerSettings,
      isLoading,
      refreshData,
      deliveryLocation,
      updateDeliveryLocation,
      buyerAddresses,
      addOrUpdateBuyerAddress,
      setAsDefaultAddress,
      removeBuyerAddress,
      sellerAddress,
      updateSellerAddressData,
      isSellerAddressVerified,
      addProduct,
      updateProduct,
      deleteProduct,
      toggleProductAvailability,
      updateStock,
      addOrder,
      updateOrderStatus,
      addBooking,
      acceptBookingRequest,
      declineBookingRequest,
      addNotification,
      markNotificationRead,
      markAllNotificationsRead,
      clearNotification,
      updateSellerSettings
    }}>
      {children}
    </MarketplaceContext.Provider>
  );
}

export function useMarketplace() {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error('useMarketplace must be used within a MarketplaceProvider');
  }
  return context;
}
