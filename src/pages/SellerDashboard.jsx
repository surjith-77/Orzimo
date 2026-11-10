import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SellerSidebar from '../components/seller/SellerSidebar';
import SellerHeader from '../components/seller/SellerHeader';
import SellerOverviewTab from '../components/seller/SellerOverviewTab';
import SellerOrdersTab from '../components/seller/SellerOrdersTab';
import SellerProductsTab from '../components/seller/SellerProductsTab';
import SellerBookingsTab from '../components/seller/SellerBookingsTab';
import SellerInventoryTab from '../components/seller/SellerInventoryTab';
import SellerProfileTab from '../components/seller/SellerProfileTab';
import SellerNotificationsTab from '../components/seller/SellerNotificationsTab';
import SellerAddProductModal from '../components/seller/SellerAddProductModal';
import SellerAddressSetupModal from '../components/seller/SellerAddressSetupModal';
import SellerAccessGate from '../components/seller/SellerAccessGate';
import { useAuth } from '../context/AuthContext';
import { useMarketplace } from '../context/MarketplaceContext';
import '../Seller.css';

export default function SellerDashboard() {
  const navigate = useNavigate();
  const { isSeller, logout, currentUser } = useAuth();
  const { 
    sellerAddress, 
    updateSellerAddressData 
  } = useMarketplace();

  const [activeTab, setActiveTab] = useState('overview');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // If user is not currently in seller mode, provide role gate
  if (!isSeller) {
    return <SellerAccessGate />;
  }

  const handleOpenAddProduct = () => {
    setIsAddModalOpen(true);
  };

  const handleSwitchToBuyer = () => {
    navigate('/buyer');
  };

  const handleLogout = () => {
    logout();
    navigate('/welcome');
  };

  return (
    <div className={`seller-layout ${isMobileNavOpen ? 'mobile-nav-active' : ''}`}>
      {/* Mobile Backdrop */}
      {isMobileNavOpen && (
        <div 
          className="modal-backdrop mobile-nav-backdrop"
          onClick={() => setIsMobileNavOpen(false)}
          style={{ zIndex: 85 }}
        />
      )}

      {/* Sidebar */}
      <SellerSidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setIsMobileNavOpen(false);
        }} 
        onSwitchToBuyer={handleSwitchToBuyer}
        onLogout={handleLogout}
      />

      {/* Main Area */}
      <div className="seller-main">
        <SellerHeader 
          onSwitchToBuyer={handleSwitchToBuyer} 
          onNavigateTab={(tab) => setActiveTab(tab)}
          onToggleMobileNav={() => setIsMobileNavOpen(!isMobileNavOpen)}
          onLogout={handleLogout}
        />

        <main className="seller-content-body">
          {/* 1. Studio Overview */}
          {activeTab === 'overview' && (
            <SellerOverviewTab 
              onNavigateTab={(tab) => setActiveTab(tab)} 
              onOpenAddProduct={handleOpenAddProduct}
              onOpenAddressSetup={() => setIsAddressModalOpen(true)}
            />
          )}

          {/* 2. Order Management */}
          {activeTab === 'orders' && (
            <SellerOrdersTab />
          )}

          {/* 3. My Products */}
          {activeTab === 'products' && (
            <SellerProductsTab 
              onOpenAddressSetup={() => setIsAddressModalOpen(true)}
            />
          )}

          {/* 4. Bookings & Slots */}
          {activeTab === 'bookings' && (
            <SellerBookingsTab />
          )}

          {/* 5. Inventory & Stock */}
          {activeTab === 'inventory' && (
            <SellerInventoryTab />
          )}

          {/* 6. Business Profile */}
          {activeTab === 'profile' && (
            <SellerProfileTab 
              onOpenAddressSetup={() => setIsAddressModalOpen(true)}
            />
          )}

          {/* 7. Notifications */}
          {activeTab === 'notifications' && (
            <SellerNotificationsTab 
              onNavigateTab={(tab) => setActiveTab(tab)} 
            />
          )}
        </main>
      </div>

      {/* Global Add Creation Modal */}
      <SellerAddProductModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onOpenAddressSetup={() => setIsAddressModalOpen(true)}
      />

      {/* Mandatory Seller Address & Verification Modal */}
      <SellerAddressSetupModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        currentAddress={sellerAddress}
        onSaveSellerAddress={updateSellerAddressData}
        currentUser={currentUser}
      />
    </div>
  );
}
