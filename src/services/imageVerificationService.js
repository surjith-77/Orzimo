// ==============================================================================
// ORZIMO IMAGE UPLOAD & AI VERIFICATION CLIENT SERVICE
// ==============================================================================
// Handles file validation (strict JPG/JPEG, 5MB limit), conversion to base64,
// Supabase Storage upload, and calling the secure backend AI verification API.
// ==============================================================================

import { supabase, isSupabaseConfigured } from '../lib/supabase.js';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Validates a single image file for strict JPG/JPEG format and size limit.
 */
export function validateProductImageFile(file) {
  if (!file) {
    return { valid: false, error: 'No file selected.' };
  }

  // Strict JPG/JPEG check
  const isJpgMime = file.type === 'image/jpeg' || file.type === 'image/jpg';
  const isJpgExt = /\.(jpe?g)$/i.test(file.name);

  if (!isJpgMime && !isJpgExt) {
    return {
      valid: false,
      error: `Unsupported file format (${file.name}). Orzimo accepts only .jpg and .jpeg photograph files.`
    };
  }

  // Size limit check (max 5 MB)
  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `File "${file.name}" is ${sizeMb} MB. Maximum allowed photo size is 5 MB.`
    };
  }

  return { valid: true };
}

/**
 * Reads a File as Base64 Data URL.
 */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads a validated product image file to Supabase Storage.
 * Falls back to base64 data URL if Supabase storage is offline or unconfigured.
 */
export async function uploadProductImageToStorage(file, sellerId = 'seller') {
  const base64Data = await fileToBase64(file);

  if (!isSupabaseConfigured || !supabase) {
    // Return base64 for persistent preview and local storage
    return {
      url: base64Data,
      storageType: 'local_base64',
      fileName: file.name
    };
  }

  try {
    const safeSellerId = String(sellerId || 'seller').replace(/[^a-zA-Z0-9_-]/g, '_');
    const randomSuffix = Math.random().toString(36).substring(2, 9);
    const storagePath = `${safeSellerId}/${Date.now()}_${randomSuffix}.jpg`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(storagePath, file, {
        contentType: 'image/jpeg',
        upsert: false
      });

    if (uploadError) {
      console.warn('Supabase storage upload notice, using persistent base64:', uploadError);
      return {
        url: base64Data,
        storageType: 'fallback_base64',
        fileName: file.name
      };
    }

    const { data: publicUrlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(storagePath);

    return {
      url: publicUrlData.publicUrl,
      storageType: 'supabase_storage',
      storagePath,
      fileName: file.name
    };
  } catch (err) {
    console.warn('Storage upload exception, using fallback:', err);
    return {
      url: base64Data,
      storageType: 'fallback_base64',
      fileName: file.name
    };
  }
}

/**
 * Calls backend AI verification service to check image vs product name & category.
 */
export async function verifyProductImageWithAI({ productName, category, imageBase64, sellerId }) {
  if (!productName || !productName.trim()) {
    return {
      success: false,
      error: 'Please enter a product name before verifying the image.'
    };
  }

  if (!imageBase64) {
    return {
      success: false,
      error: 'Please upload a product photo before requesting AI verification.'
    };
  }

  try {
    const res = await fetch('/api/verify-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        productName: productName.trim(),
        category: category || 'General Merchandise',
        imageBase64,
        sellerId
      })
    });

    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Failed to contact /api/verify-image:', err);
    return {
      success: false,
      error: err.message || 'Network error while contacting AI verification service.'
    };
  }
}

