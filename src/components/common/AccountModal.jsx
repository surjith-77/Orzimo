import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, User, Phone, MapPin, Mail, LogOut, Store, Package } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AccountModal({ isOpen, onClose, onOpenOrders, onOpenSellerModal }) {
  const navigate = useNavigate();
  const { currentUser, logout, isSeller } = useAuth();

  if (!isOpen || !currentUser) return null;

  const handleLogout = () => {
    logout();
    onClose();
    navigate('/welcome');
  };

  const handleGoToSeller = () => {
    onClose();
    navigate('/seller');
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 300 }}>
      <div className="auth-modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            borderRadius: '50%', 
            margin: '0 auto 12px',
            background: currentUser.role === 'seller' ? 'var(--color-yellow)' : 'var(--color-primary)',
            color: currentUser.role === 'seller' ? '#212121' : '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            fontWeight: 800
          }}>
            {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : <User size={28} />}
          </div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-text-primary)', margin: 0 }}>
            {currentUser.name}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 4 }}>
            <span style={{
              background: 'var(--color-primary-light)',
              color: 'var(--color-primary)',
              fontSize: '0.7rem',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '4px',
              textTransform: 'uppercase',
              border: '1px solid rgba(40, 116, 240, 0.25)'
            }}>
              {currentUser.role === 'seller' ? 'CREATOR STUDIO' : 'ORZIMO BUYER'}
            </span>
            {currentUser.city && (
              <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>
                • {currentUser.city}
              </span>
            )}
          </div>
        </div>

        {/* Profile Info Details */}
        <div style={{ 
          background: 'var(--gray-50)', 
          border: '1px solid var(--gray-200)', 
          borderRadius: 'var(--radius-md)', 
          padding: '16px',
          marginBottom: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.85rem', color: 'var(--gray-700)' }}>
            <Mail size={16} color="var(--color-primary)" />
            <span>{currentUser.email}</span>
          </div>

          {currentUser.phone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.85rem', color: 'var(--gray-700)' }}>
              <Phone size={16} color="var(--color-primary)" />
              <span>{currentUser.phone}</span>
            </div>
          )}

          {currentUser.address && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: '0.85rem', color: 'var(--gray-700)' }}>
              <MapPin size={16} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: 2 }} />
              <span>{currentUser.address}</span>
            </div>
          )}

          {currentUser.role === 'seller' && currentUser.shopName && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.85rem', color: 'var(--color-text-primary)' }}>
              <Store size={16} color="var(--color-primary)" />
              <span>Studio: <strong>{currentUser.shopName}</strong></span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            type="button"
            className="btn btn-outline"
            style={{ width: '100%', justifyContent: 'flex-start', padding: '10px 14px' }}
            onClick={() => {
              onClose();
              if (onOpenOrders) onOpenOrders();
            }}
          >
            <Package size={18} color="var(--color-primary)" />
            <span>My Orders & Bookings</span>
          </button>

          {isSeller ? (
            <button
              type="button"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'flex-start', padding: '10px 14px' }}
              onClick={handleGoToSeller}
            >
              <Store size={18} />
              <span>Open Creator Studio Dashboard</span>
            </button>
          ) : onOpenSellerModal ? (
            <button
              type="button"
              className="btn btn-outline"
              style={{ width: '100%', justifyContent: 'flex-start', padding: '10px 14px', borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
              onClick={() => {
                onClose();
                onOpenSellerModal();
              }}
            >
              <Store size={18} color="var(--color-primary)" />
              <span>Become an Orzimo Creator</span>
            </button>
          ) : null}

          <button
            type="button"
            className="btn"
            style={{ 
              width: '100%', 
              justifyContent: 'center', 
              padding: '10px 14px',
              background: '#FEE2E2',
              color: '#DC2626',
              border: '1px solid #FCA5A5',
              marginTop: '6px'
            }}
            onClick={handleLogout}
          >
            <LogOut size={16} />
            <span>Log Out of ORZIMO</span>
          </button>
        </div>
      </div>
    </div>
  );
}
