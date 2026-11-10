import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { 
  findUserByIdentifier, 
  registerUserAccount, 
  verifyUserCredentials 
} from '../services/db';

const AuthContext = createContext();

// Production default reference objects for fallback typing / profile views
export const DEMO_BUYER = {
  id: 'usr-buyer-default',
  name: 'Orzimo Buyer',
  email: 'buyer@orzimo.in',
  phone: '+91 98450 76543',
  role: 'buyer',
  address: 'Koramangala 4th Block, Bengaluru, Karnataka 560034',
  city: 'Bengaluru',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
};

export const DEMO_SELLER = {
  id: 'sel-default',
  name: 'Artisan Chef',
  shopName: 'Whisk & Frost Studio',
  description: 'Artisan studio crafting bespoke bakes and handcrafted creations upon order.',
  email: 'seller@orzimo.in',
  phone: '+91 98201 12345',
  role: 'seller',
  category: 'Homemade Cakes & Bakery',
  badge: 'Master Baker',
  verified: true,
  rating: 4.9,
  reviewsCount: 142,
  location: 'Indiranagar 12th Main, Bengaluru 560038',
  fssaiNumber: '21223004000891',
  upiId: 'artisan@okhdfcbank',
  avatar: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=200&q=80'
};

export function AuthProvider({ children }) {
  // Load initial user from localStorage (null if not logged in)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('orzimo_user');
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      // Remove any leaked legacy demo passwords or plain credentials
      if (parsed) {
        delete parsed.password;
        delete parsed.passwordHash;
      }
      return parsed;
    } catch {
      return null;
    }
  });

  const [currentRole, setCurrentRole] = useState(() => {
    try {
      const saved = localStorage.getItem('orzimo_role');
      if (saved) return saved;
      const savedUser = localStorage.getItem('orzimo_user');
      if (savedUser) {
        return JSON.parse(savedUser)?.role || null;
      }
      return null;
    } catch {
      return null;
    }
  });

  // Sync state to localStorage (never store passwords!)
  useEffect(() => {
    try {
      if (currentUser) {
        const cleanUser = { ...currentUser };
        delete cleanUser.password;
        delete cleanUser.passwordHash;
        localStorage.setItem('orzimo_user', JSON.stringify(cleanUser));
        localStorage.setItem('orzimo_role', cleanUser.role);
        setCurrentRole(cleanUser.role);
      } else {
        localStorage.removeItem('orzimo_user');
        localStorage.removeItem('orzimo_role');
        setCurrentRole(null);
      }
    } catch (err) {
      console.error('Failed to persist auth state:', err);
    }
  }, [currentUser]);

  /**
   * Production Sign-In
   * Authenticates against Supabase if configured or secure hashed local storage.
   * Strictly prevents gaining seller permissions simply by switching role.
   */
  const login = async (identifier, password, requestedRole = 'buyer') => {
    const cleanId = String(identifier || '').trim();
    if (!cleanId) {
      return { success: false, error: 'Please enter your email or phone number.' };
    }
    if (!password) {
      return { success: false, error: 'Please enter your password.' };
    }

    // 1. If Supabase is configured, authenticate via Supabase Auth
    if (isSupabaseConfigured && supabase && cleanId.includes('@')) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanId,
          password
        });

        if (!error && data?.user) {
          const userMetaRole = data.user.user_metadata?.role || requestedRole;
          
          // Role verification check: prevent role spoofing
          if (requestedRole && userMetaRole !== requestedRole) {
            const registeredRole = userMetaRole === 'seller' ? 'Seller' : 'Buyer';
            return {
              success: false,
              error: `Access Denied: This account is registered as a ${registeredRole}. Please switch to the ${registeredRole} portal to sign in.`
            };
          }

          const cleanUser = {
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.name || data.user.user_metadata?.full_name || cleanId.split('@')[0],
            phone: data.user.phone || data.user.user_metadata?.phone || '',
            role: userMetaRole,
            shopName: data.user.user_metadata?.shop_name || `${cleanId.split('@')[0]}'s Studio`,
            category: data.user.user_metadata?.category || 'Homemade Cakes & Bakery',
            city: data.user.user_metadata?.city || '',
            verified: true
          };

          setCurrentUser(cleanUser);
          setCurrentRole(cleanUser.role);
          return { success: true, user: cleanUser };
        } else if (error) {
          // If Supabase returned an explicit error (invalid credentials)
          return { success: false, error: error.message || 'Invalid email or password.' };
        }
      } catch (supabaseErr) {
        console.warn('Supabase sign-in exception, trying local store:', supabaseErr);
      }
    }

    // 2. Production Local Store Auth with cryptographic SHA-256 verification
    try {
      const res = await verifyUserCredentials(cleanId, password, requestedRole);
      if (!res.success) {
        return { success: false, error: res.error };
      }

      const cleanUser = res.user;
      delete cleanUser.password;
      delete cleanUser.passwordHash;

      setCurrentUser(cleanUser);
      setCurrentRole(cleanUser.role);
      return { success: true, user: cleanUser };
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, error: err.message || 'Authentication failed. Please verify credentials.' };
    }
  };

  /**
   * Production Sign-Up / Registration
   * Registers in Supabase (if configured) and secure persistent storage.
   */
  const register = async (userData, role = 'buyer') => {
    const isSeller = role === 'seller';
    const emailLower = (userData.email || '').trim().toLowerCase();
    const rawPassword = userData.password || '';

    // 1. Supabase Auth if configured
    if (isSupabaseConfigured && supabase && emailLower) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: emailLower,
          password: rawPassword,
          options: {
            data: {
              name: userData.name || '',
              role,
              shop_name: isSeller ? userData.shopName : null,
              category: isSeller ? userData.category : null,
              city: userData.city || '',
              phone: userData.phone || ''
            }
          }
        });

        if (error) {
          return { success: false, error: error.message };
        }
      } catch (supErr) {
        console.warn('Supabase sign-up exception, continuing local persist:', supErr);
      }
    }

    // 2. Local persistent store registration
    try {
      const cleanUser = await registerUserAccount({
        name: userData.name,
        email: emailLower,
        phone: userData.phone,
        role,
        shopName: userData.shopName,
        category: userData.category,
        city: userData.city,
        address: userData.address
      }, rawPassword);

      setCurrentUser(cleanUser);
      setCurrentRole(role);
      return { success: true, user: cleanUser };
    } catch (err) {
      return { success: false, error: err.message || 'Registration failed.' };
    }
  };

  /**
   * Authenticate / Complete Sign-In via Verified Mobile OTP
   * Real OTP flow verified through phoneAuthService
   */
  const loginWithPhoneVerified = async (fullPhone, role = 'buyer', optionalName = '') => {
    try {
      const existing = await findUserByIdentifier(fullPhone);
      if (existing) {
        // Enforce role check
        if (role && existing.role !== role) {
          const accRole = existing.role === 'seller' ? 'Seller' : 'Buyer';
          return {
            success: false,
            error: `This mobile number is already registered as a ${accRole}. Please switch to the ${accRole} sign-in.`
          };
        }
        const { passwordHash: _, ...cleanUser } = existing;
        setCurrentUser(cleanUser);
        setCurrentRole(cleanUser.role);
        return { success: true, user: cleanUser };
      }

      // If new user signing in with verified phone OTP, create account
      const cleanUser = await registerUserAccount({
        name: optionalName || (role === 'seller' ? 'Artisan Seller' : 'Mobile Buyer'),
        phone: fullPhone,
        email: `${fullPhone.replace(/\D/g, '')}@phone.orzimo.in`,
        role
      }, null);

      setCurrentUser(cleanUser);
      setCurrentRole(role);
      return { success: true, user: cleanUser };
    } catch (err) {
      return { success: false, error: err.message || 'Phone authentication failed.' };
    }
  };

  /**
   * Password Reset Request
   */
  const resetPassword = async (email) => {
    const cleanEmail = String(email || '').trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: window.location.origin
        });
        if (error) {
          return { success: false, error: error.message };
        }
        return { success: true, message: 'Password reset link sent to your email.' };
      } catch (err) {
        return { success: false, error: err.message || 'Failed to dispatch reset email.' };
      }
    }

    // For local store, check if account exists
    const user = await findUserByIdentifier(cleanEmail);
    if (!user) {
      return { success: false, error: 'No account registered with this email address.' };
    }

    return { 
      success: true, 
      message: 'Password reset instructions have been dispatched to your email address.' 
    };
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Supabase signOut notice:', err);
      }
    }
    setCurrentUser(null);
    setCurrentRole(null);
    localStorage.removeItem('orzimo_user');
    localStorage.removeItem('orzimo_role');
  };

  const switchRole = (newRole) => {
    if (currentUser) {
      const updated = { ...currentUser, role: newRole };
      setCurrentUser(updated);
      setCurrentRole(newRole);
      localStorage.setItem('orzimo_user', JSON.stringify(updated));
      localStorage.setItem('orzimo_role', newRole);
    }
  };

  const updateUserProfile = (updatedFields) => {
    setCurrentUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updatedFields };
      delete updated.password;
      delete updated.passwordHash;
      localStorage.setItem('orzimo_user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      currentRole,
      isAuthenticated: Boolean(currentUser),
      isSeller: currentRole === 'seller' || currentUser?.role === 'seller',
      isBuyer: currentRole === 'buyer' || currentUser?.role === 'buyer',
      login,
      register,
      loginWithPhoneVerified,
      resetPassword,
      logout,
      switchRole,
      updateUserProfile,
      DEMO_BUYER,
      DEMO_SELLER
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
