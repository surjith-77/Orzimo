import React from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SellerAccessGate from '../seller/SellerAccessGate';
import { Store, ArrowRight, LogOut } from 'lucide-react';

export default function ProtectedRoute({ children, requiredRole }) {
  const { currentUser, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // 1. If not authenticated, redirect to Welcome page
  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/welcome" state={{ from: location }} replace />;
  }

  // 2. If buyer tries to access seller dashboard -> display SellerAccessGate
  if (requiredRole === 'seller' && currentUser.role !== 'seller') {
    return <SellerAccessGate />;
  }

  // 3. If seller views buyer storefront -> display top seller preview strip
  if (requiredRole === 'buyer' && currentUser.role === 'seller') {
    return (
      <div>
        <div style={{
          background: 'var(--color-deep-blue)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          color: '#FFFFFF',
          padding: '8px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.825rem',
          position: 'sticky',
          top: 0,
          zIndex: 999
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ 
              background: 'var(--color-yellow)', 
              color: '#212121', 
              fontWeight: 800, 
              fontSize: '0.675rem', 
              padding: '2px 8px', 
              borderRadius: '4px' 
            }}>
              SELLER MODE
            </span>
            <span>
              You are currently viewing the marketplace storefront as: <strong>{currentUser.shopName || currentUser.name}</strong>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => navigate('/seller')}
              style={{
                background: '#FFFFFF',
                color: 'var(--color-primary)',
                border: '1px solid #FFFFFF',
                padding: '4px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.775rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                cursor: 'pointer'
              }}
            >
              <Store size={14} />
              Return to Creator Studio
              <ArrowRight size={13} />
            </button>
            <button
              onClick={() => {
                logout();
                navigate('/welcome');
              }}
              style={{
                color: '#FFFFFF',
                fontSize: '0.775rem',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                cursor: 'pointer',
                background: 'none',
                border: 'none',
                opacity: 0.85
              }}
            >
              <LogOut size={13} />
              Log Out
            </button>
          </div>
        </div>
        {children}
      </div>
    );
  }

  return children;
}

