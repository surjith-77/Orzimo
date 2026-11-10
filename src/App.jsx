import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MarketplaceProvider } from './context/MarketplaceContext';
import BuyerApp from './pages/BuyerApp';
import SellerDashboard from './pages/SellerDashboard';
import WelcomePage from './pages/WelcomePage';
import ProtectedRoute from './components/common/ProtectedRoute';

function RootRoute() {
  const { currentUser, isAuthenticated } = useAuth();

  if (isAuthenticated && currentUser) {
    if (currentUser.role === 'seller') {
      return <Navigate to="/seller" replace />;
    }
    return <Navigate to="/buyer" replace />;
  }

  return <WelcomePage />;
}

export default function App() {
  return (
    <AuthProvider>
      <MarketplaceProvider>
        <BrowserRouter>
          <Routes>
            {/* Root Route: Shows Welcome & Role Selection if unauthenticated, else redirects to user's dashboard */}
            <Route path="/" element={<RootRoute />} />

            {/* Dedicated Welcome & Role Selection / Login Page */}
            <Route path="/welcome" element={<WelcomePage />} />

            {/* Buyer Dashboard (Preserved Approved Design, Protected for Buyers) */}
            <Route 
              path="/buyer" 
              element={
                <ProtectedRoute requiredRole="buyer">
                  <BuyerApp />
                </ProtectedRoute>
              } 
            />

            {/* Seller Creator Studio Dashboard (Protected for Sellers) */}
            <Route 
              path="/seller" 
              element={
                <ProtectedRoute requiredRole="seller">
                  <SellerDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </MarketplaceProvider>
    </AuthProvider>
  );
}
