// ==============================================================================
// ORZIMO PHONE AUTHENTICATION & SMS OTP SERVICE
// ==============================================================================
// Interacts with Supabase Phone Authentication (SMS Gateway: Twilio/Messagebird).
// Enforces country code validation (+91 India, +1 USA/Canada), rate limiting,
// 60-second resend cooldown, and 5-minute token expiration.
// Zero plaintext storage of OTPs; zero hardcoded dummy verification codes.
// ==============================================================================

import { supabase, isSupabaseConfigured } from '../lib/supabase.js';

export const SUPPORTED_COUNTRY_CODES = [
  { 
    code: '+91', 
    label: '+91 (India)', 
    country: 'India', 
    flag: '🇮🇳', 
    digits: 10,
    example: '9876543210' 
  },
  { 
    code: '+1', 
    label: '+1 (USA/Canada)', 
    country: 'USA / Canada', 
    flag: '🇺🇸', 
    digits: 10,
    example: '4155552671' 
  }
];

// In-memory rate limiting and request tracking per phone number
// Structure: { [fullPhone]: { requests: [timestamp, ...], lastRequested: timestamp, expiresAt: timestamp } }
const phoneRequestLog = new Map();

const COOLDOWN_SECONDS = 60;
const EXPIRATION_SECONDS = 300; // 5 minutes
const MAX_REQUESTS_IN_WINDOW = 3;
const RATE_LIMIT_WINDOW_SECONDS = 600; // 10 minutes

/**
 * Validate phone number format strictly based on country code.
 */
export function validatePhoneNumber(countryCode, rawNumber) {
  if (!countryCode) {
    return { valid: false, error: 'Country code selection is mandatory (+91 or +1).' };
  }

  const cleanDigits = String(rawNumber || '').replace(/\D/g, '');

  if (countryCode === '+91') {
    if (cleanDigits.length !== 10) {
      return { 
        valid: false, 
        error: `Indian mobile number must be exactly 10 digits. (Got ${cleanDigits.length})` 
      };
    }
    if (!/^[6-9]\d{9}$/.test(cleanDigits)) {
      return { 
        valid: false, 
        error: 'Indian mobile numbers must start with 6, 7, 8, or 9.' 
      };
    }
    return {
      valid: true,
      cleanDigits,
      countryCode: '+91',
      fullPhone: `+91${cleanDigits}`
    };
  }

  if (countryCode === '+1') {
    if (cleanDigits.length !== 10) {
      return { 
        valid: false, 
        error: `North American phone number must be exactly 10 digits. (Got ${cleanDigits.length})` 
      };
    }
    if (!/^[2-9]\d{9}$/.test(cleanDigits)) {
      return { 
        valid: false, 
        error: 'North American phone numbers cannot start with 0 or 1.' 
      };
    }
    return {
      valid: true,
      cleanDigits,
      countryCode: '+1',
      fullPhone: `+1${cleanDigits}`
    };
  }

  return { valid: false, error: 'Unsupported country code. Only +91 (India) and +1 (USA/Canada) are supported.' };
}

/**
 * Check rate limit and cooldown status for a phone number.
 */
export function checkPhoneCooldown(fullPhone) {
  const entry = phoneRequestLog.get(fullPhone);
  if (!entry) return { allowed: true, remainingCooldown: 0 };

  const now = Date.now();
  const timeSinceLast = Math.floor((now - entry.lastRequested) / 1000);

  if (timeSinceLast < COOLDOWN_SECONDS) {
    return { 
      allowed: false, 
      remainingCooldown: COOLDOWN_SECONDS - timeSinceLast,
      error: `Please wait ${COOLDOWN_SECONDS - timeSinceLast} seconds before requesting a new OTP.`
    };
  }

  // Check 10-minute rate limit window
  const recentRequests = entry.requests.filter(t => (now - t) < RATE_LIMIT_WINDOW_SECONDS * 1000);
  if (recentRequests.length >= MAX_REQUESTS_IN_WINDOW) {
    const oldest = recentRequests[0];
    const waitMins = Math.ceil((RATE_LIMIT_WINDOW_SECONDS * 1000 - (now - oldest)) / 60000);
    return {
      allowed: false,
      remainingCooldown: 0,
      error: `Too many OTP requests for this phone number. For security, please wait ${waitMins} minute(s) before trying again.`
    };
  }

  return { allowed: true, remainingCooldown: 0 };
}

/**
 * Send a real 6-digit OTP using Supabase Phone Authentication.
 */
export async function sendPhoneOtp(countryCode, rawNumber) {
  const validation = validatePhoneNumber(countryCode, rawNumber);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  const { fullPhone } = validation;

  // Rate limiting check
  const cooldownCheck = checkPhoneCooldown(fullPhone);
  if (!cooldownCheck.allowed) {
    return { success: false, error: cooldownCheck.error, remainingCooldown: cooldownCheck.remainingCooldown };
  }

  // Check Supabase configuration
  if (!isSupabaseConfigured || !supabase) {
    return {
      success: false,
      error: 'Supabase Phone Authentication is not configured. Please ensure VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, and a supported SMS provider (Twilio/Messagebird) are active in project settings.'
    };
  }

  try {
    const { error } = await supabase.auth.signInWithOtp({
      phone: fullPhone,
      options: {
        channel: 'sms'
      }
    });

    if (error) {
      console.error('Supabase Phone OTP dispatch error:', error);
      let userFriendlyMsg = error.message || 'Failed to dispatch SMS OTP.';
      if (userFriendlyMsg.toLowerCase().includes('provider') || userFriendlyMsg.toLowerCase().includes('disabled')) {
        userFriendlyMsg = 'Supabase SMS provider is not configured. Please enable Twilio or Messagebird in the Supabase Auth -> Providers dashboard.';
      }
      return { success: false, error: userFriendlyMsg };
    }

    // Record request timestamp for rate limiting & cooldown
    const now = Date.now();
    const entry = phoneRequestLog.get(fullPhone) || { requests: [] };
    entry.requests = [...entry.requests.filter(t => (now - t) < RATE_LIMIT_WINDOW_SECONDS * 1000), now];
    entry.lastRequested = now;
    entry.expiresAt = now + (EXPIRATION_SECONDS * 1000);
    phoneRequestLog.set(fullPhone, entry);

    return {
      success: true,
      message: `A real 6-digit OTP has been sent via SMS to ${fullPhone}. Valid for 5 minutes.`,
      fullPhone,
      expiresAt: entry.expiresAt,
      cooldownSeconds: COOLDOWN_SECONDS
    };
  } catch (err) {
    console.error('Phone OTP dispatch exception:', err);
    return {
      success: false,
      error: err.message || 'Unexpected network error while contacting Supabase Phone Auth.'
    };
  }
}

/**
 * Verify the 6-digit OTP with Supabase server-side authentication.
 */
export async function verifyPhoneOtp(countryCode, rawNumber, otpToken) {
  const validation = validatePhoneNumber(countryCode, rawNumber);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  const { fullPhone } = validation;
  const cleanOtp = String(otpToken || '').trim();

  if (!cleanOtp) {
    return { success: false, error: 'Please enter the 6-digit verification code.' };
  }
  if (!/^\d{6}$/.test(cleanOtp)) {
    return { success: false, error: 'OTP code must be exactly 6 numeric digits.' };
  }

  // Check expiration
  const entry = phoneRequestLog.get(fullPhone);
  if (entry && entry.expiresAt && Date.now() > entry.expiresAt) {
    return { 
      success: false, 
      error: 'The OTP code has expired (validity is 5 minutes). Please click "Send OTP" to request a new code.' 
    };
  }

  if (!isSupabaseConfigured || !supabase) {
    return {
      success: false,
      error: 'Supabase Phone Authentication is not configured. Server-side verification cannot proceed without an active Supabase connection.'
    };
  }

  try {
    const { data, error } = await supabase.auth.verifyOtp({
      phone: fullPhone,
      token: cleanOtp,
      type: 'sms'
    });

    if (error) {
      console.warn('Supabase verifyOtp failed:', error);
      return { 
        success: false, 
        error: error.message || 'Invalid or expired verification code. Please check the SMS and try again.' 
      };
    }

    // Clear request log on successful verification
    phoneRequestLog.delete(fullPhone);

    return {
      success: true,
      message: 'Mobile Number Verified Successfully',
      fullPhone,
      user: data?.user || null
    };
  } catch (err) {
    console.error('verifyPhoneOtp exception:', err);
    return {
      success: false,
      error: err.message || 'Server error while verifying mobile OTP.'
    };
  }
}
