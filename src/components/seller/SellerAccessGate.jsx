import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Sparkles, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function SellerAccessGate() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-bg-body)',
      color: 'var(--color-text-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{
        maxWidth: '520px',
        width: '100%',
        background: '#FFFFFF',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: '36px',
        textAlign: 'center',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
        position: 'relative'
      }}>
        {/* Glow */}
        <div style={{
          width: '58px',
          height: '58px',
          borderRadius: '50%',
          background: 'var(--color-danger-bg)',
          border: '1px solid rgba(198, 40, 40, 0.3)',
          color: 'var(--color-danger)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px'
        }}>
          <ShieldAlert size={28} />
        </div>

        <span style={{
          background: 'var(--color-danger-bg)',
          color: 'var(--color-danger)',
          fontSize: '0.725rem',
          fontWeight: 800,
          padding: '3px 10px',
          borderRadius: 'var(--radius-sm)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          display: 'inline-block',
          marginBottom: '10px'
        }}>
          Role Verification Required
        </span>

        <h2 style={{ fontSize: '1.45rem', fontWeight: 900, marginBottom: '10px', color: 'var(--color-text-primary)' }}>
          Seller Studio Access Restricted
        </h2>

        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '20px' }}>
          You are currently signed in as a <strong style={{ color: 'var(--color-primary)' }}>Buyer ({currentUser?.name || 'Customer'})</strong>. The Creator Studio is reserved for verified independent home bakers, craft makers, and artisans to manage orders and inventory.
        </p>

        <div style={{
          background: '#F8FAFC',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-sm)',
          padding: '14px',
          marginBottom: '24px',
          textAlign: 'left',
          fontSize: '0.825rem',
          color: 'var(--color-text-primary)'
        }}>
          <div style={{ fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 4 }}>Current Account Details:</div>
          <div>Name: <strong>{currentUser?.name}</strong></div>
          <div>Role: <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>Buyer</span></div>
          <div>Email: {currentUser?.email}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            className="btn btn-primary btn-lg"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'var(--color-primary)', color: '#FFFFFF', fontWeight: 700 }}
            onClick={() => {
              logout();
              navigate('/welcome?role=seller');
            }}
          >
            Sign In with a Seller Account
          </button>

          <button
            className="btn btn-outline"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            onClick={() => navigate('/buyer')}
          >
            <ArrowLeft size={16} />
            Return to Buyer Marketplace
          </button>

          <button
            style={{ 
              color: 'var(--color-text-secondary)', 
              fontSize: '0.8rem', 
              marginTop: 6, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: 6,
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}
            onClick={() => {
              logout();
              navigate('/welcome');
            }}
          >
            <LogOut size={13} />
            Sign Out of this Account
          </button>
        </div>
      </div>
    </div>
  );
}

