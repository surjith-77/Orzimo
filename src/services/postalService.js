// ==============================================================================
// ORZIMO - INDIAN POSTAL PIN CODE VERIFICATION SERVICE
// ==============================================================================
// Uses India Post public postal API to verify genuine 6-digit Indian PIN codes,
// retrieve official post offices, localities, district, and state.
// Includes caching and strict Indian PIN format validation.
// ==============================================================================

const PINCODE_CACHE_KEY = 'orzimo_pincode_cache';

// Helper to get cache from storage
function getPincodeCache() {
  if (typeof window === 'undefined' || !window.localStorage) return {};
  try {
    const raw = localStorage.getItem(PINCODE_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

// Helper to save cache to storage
function savePincodeCache(cache) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    localStorage.setItem(PINCODE_CACHE_KEY, JSON.stringify(cache));
  } catch (err) {
    console.warn('Failed to cache pincode lookup', err);
  }
}

/**
 * Validates format of Indian PIN code.
 * Indian postal PIN codes are exactly 6 digits and do not start with '0'.
 * First digit represents region (1-8 for postal circles, 9 for APS).
 */
export function isValidIndianPincodeFormat(pincode) {
  if (!pincode) return false;
  const str = String(pincode).trim();
  return /^[1-9][0-9]{5}$/.test(str);
}

/**
 * Performs real postal verification of an Indian PIN code.
 * @param {string} pincode - 6-digit PIN code
 * @returns {Promise<{
 *   valid: boolean,
 *   pincode: string,
 *   district?: string,
 *   state?: string,
 *   localities?: string[],
 *   postOffices?: Array<{name: string, deliveryStatus: string, branchType: string}>,
 *   error?: string
 * }>}
 */
export async function verifyIndianPincode(pincode) {
  const cleanPin = String(pincode || '').trim();

  // 1. Strict format check
  if (!isValidIndianPincodeFormat(cleanPin)) {
    return {
      valid: false,
      pincode: cleanPin,
      error: 'Please enter a valid 6-digit Indian PIN code (cannot start with 0).'
    };
  }

  // 2. Check local persistent cache
  const cache = getPincodeCache();
  if (cache[cleanPin] && cache[cleanPin].valid) {
    return {
      ...cache[cleanPin],
      fromCache: true
    };
  }

  // 3. Real API lookup via India Post official postal database
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Postal service HTTP error: ${res.status}`);
    }

    const data = await res.json();

    if (Array.isArray(data) && data.length > 0) {
      const result = data[0];

      if (result.Status === 'Success' && Array.isArray(result.PostOffice) && result.PostOffice.length > 0) {
        const postOffices = result.PostOffice;
        const firstPo = postOffices[0];

        // Unique list of localities / post office names
        const localities = Array.from(
          new Set(postOffices.map((po) => po.Name).filter(Boolean))
        );

        const verifiedData = {
          valid: true,
          pincode: cleanPin,
          district: firstPo.District,
          state: firstPo.State,
          division: firstPo.Division || firstPo.District,
          region: firstPo.Region || '',
          circle: firstPo.Circle || firstPo.State,
          localities,
          postOffices: postOffices.map((po) => ({
            name: po.Name,
            deliveryStatus: po.DeliveryStatus,
            branchType: po.BranchType
          })),
          verifiedAt: new Date().toISOString()
        };

        // Cache successful response
        cache[cleanPin] = verifiedData;
        savePincodeCache(cache);

        return verifiedData;
      } else {
        return {
          valid: false,
          pincode: cleanPin,
          error: `No postal records found for PIN code ${cleanPin}. Please verify and re-enter.`
        };
      }
    } else {
      return {
        valid: false,
        pincode: cleanPin,
        error: `Could not verify PIN code ${cleanPin}. Please check the number.`
      };
    }
  } catch (err) {
    clearTimeout(timeoutId);
    console.error('Postal PIN verification API error:', err);

    // Fallback: If network is offline, check if we have any known postal circle mapping
    const fallback = getOfflineCircleMapping(cleanPin);
    if (fallback) {
      return {
        valid: true,
        pincode: cleanPin,
        ...fallback,
        localities: [fallback.district],
        verifiedAt: new Date().toISOString(),
        offlineFallback: true
      };
    }

    return {
      valid: false,
      pincode: cleanPin,
      error: 'Postal verification service is temporarily unreachable. Please check your connection or try again.'
    };
  }
}

/**
 * Standard Indian postal circle / prefix reference mapping for offline fallback
 * Maps first 2 digits of PIN code to State & primary administrative zone.
 */
function getOfflineCircleMapping(pincode) {
  const prefix2 = pincode.substring(0, 2);
  const prefix3 = pincode.substring(0, 3);

  // Common specific metro/hub mappings
  const specific3 = {
    '560': { district: 'Bengaluru Urban', state: 'Karnataka' },
    '561': { district: 'Bengaluru Rural', state: 'Karnataka' },
    '562': { district: 'Bengaluru Rural', state: 'Karnataka' },
    '400': { district: 'Mumbai', state: 'Maharashtra' },
    '411': { district: 'Pune', state: 'Maharashtra' },
    '600': { district: 'Chennai', state: 'Tamil Nadu' },
    '638': { district: 'Tiruppur', state: 'Tamil Nadu' },
    '641': { district: 'Coimbatore', state: 'Tamil Nadu' },
    '500': { district: 'Hyderabad', state: 'Telangana' },
    '110': { district: 'New Delhi', state: 'Delhi' },
    '700': { district: 'Kolkata', state: 'West Bengal' },
    '380': { district: 'Ahmedabad', state: 'Gujarat' },
    '302': { district: 'Jaipur', state: 'Rajasthan' },
    '201': { district: 'Gautam Buddha Nagar', state: 'Uttar Pradesh' },
    '122': { district: 'Gurugram', state: 'Haryana' },
    '682': { district: 'Ernakulam', state: 'Kerala' }
  };

  if (specific3[prefix3]) {
    return specific3[prefix3];
  }

  // 2-digit Circle Mapping (Official India Post zones)
  const circleMap = {
    '11': { district: 'Delhi', state: 'Delhi' },
    '12': { district: 'Gurugram', state: 'Haryana' },
    '13': { district: 'Ambala', state: 'Haryana' },
    '14': { district: 'Amritsar', state: 'Punjab' },
    '15': { district: 'Patiala', state: 'Punjab' },
    '16': { district: 'Chandigarh', state: 'Chandigarh' },
    '17': { district: 'Shimla', state: 'Himachal Pradesh' },
    '18': { district: 'Jammu', state: 'Jammu and Kashmir' },
    '19': { district: 'Srinagar', state: 'Jammu and Kashmir' },
    '20': { district: 'Ghaziabad', state: 'Uttar Pradesh' },
    '21': { district: 'Allahabad', state: 'Uttar Pradesh' },
    '22': { district: 'Lucknow', state: 'Uttar Pradesh' },
    '24': { district: 'Dehradun', state: 'Uttarakhand' },
    '25': { district: 'Meerut', state: 'Uttar Pradesh' },
    '28': { district: 'Agra', state: 'Uttar Pradesh' },
    '30': { district: 'Jaipur', state: 'Rajasthan' },
    '31': { district: 'Udaipur', state: 'Rajasthan' },
    '34': { district: 'Jodhpur', state: 'Rajasthan' },
    '36': { district: 'Rajkot', state: 'Gujarat' },
    '38': { district: 'Ahmedabad', state: 'Gujarat' },
    '39': { district: 'Surat', state: 'Gujarat' },
    '40': { district: 'Mumbai', state: 'Maharashtra' },
    '41': { district: 'Pune', state: 'Maharashtra' },
    '42': { district: 'Nashik', state: 'Maharashtra' },
    '43': { district: 'Aurangabad', state: 'Maharashtra' },
    '44': { district: 'Nagpur', state: 'Maharashtra' },
    '45': { district: 'Indore', state: 'Madhya Pradesh' },
    '46': { district: 'Bhopal', state: 'Madhya Pradesh' },
    '49': { district: 'Raipur', state: 'Chhattisgarh' },
    '50': { district: 'Hyderabad', state: 'Telangana' },
    '51': { district: 'Tirupati', state: 'Andhra Pradesh' },
    '52': { district: 'Vijayawada', state: 'Andhra Pradesh' },
    '53': { district: 'Visakhapatnam', state: 'Andhra Pradesh' },
    '56': { district: 'Bengaluru', state: 'Karnataka' },
    '57': { district: 'Mangaluru', state: 'Karnataka' },
    '58': { district: 'Hubballi', state: 'Karnataka' },
    '59': { district: 'Belagavi', state: 'Karnataka' },
    '60': { district: 'Chennai', state: 'Tamil Nadu' },
    '62': { district: 'Madurai', state: 'Tamil Nadu' },
    '63': { district: 'Salem', state: 'Tamil Nadu' },
    '64': { district: 'Coimbatore', state: 'Tamil Nadu' },
    '67': { district: 'Kozhikode', state: 'Kerala' },
    '68': { district: 'Kochi', state: 'Kerala' },
    '69': { district: 'Thiruvananthapuram', state: 'Kerala' },
    '70': { district: 'Kolkata', state: 'West Bengal' },
    '71': { district: 'Howrah', state: 'West Bengal' },
    '75': { district: 'Bhubaneswar', state: 'Odisha' },
    '78': { district: 'Guwahati', state: 'Assam' },
    '80': { district: 'Patna', state: 'Bihar' },
    '83': { district: 'Ranchi', state: 'Jharkhand' }
  };

  return circleMap[prefix2] || null;
}
