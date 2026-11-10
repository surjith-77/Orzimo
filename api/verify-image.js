import { handleVerifyProductImage } from '../server/verifyImageHandler.js';

export default async function handler(req, res) {
  // CORS Headers for Vercel
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed. Use POST.' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const result = await handleVerifyProductImage(body);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error('API /api/verify-image handler error:', err);
    return res.status(500).json({ 
      success: false, 
      error: err.message || 'Internal server error during image verification.' 
    });
  }
}

