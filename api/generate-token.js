// Vercel serverless function to generate a test JWT token
// This is for development/testing purposes only

const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, secret } = req.body;

    // Validate secret (simple validation for testing)
    const expectedSecret = process.env.TOKEN_GENERATION_SECRET || 'thewell2025';
    
    if (secret !== expectedSecret) {
      return res.status(401).json({ error: 'Invalid secret' });
    }

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Generate a JWT token
    const jwtSecret = process.env.JWT_SECRET || process.env.SUPABASE_JWT_SECRET || 'your-secret-key-min-32-characters-long-for-security';
    
    const payload = {
      aud: 'authenticated',
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7), // 7 days
      sub: `user-${Date.now()}`, // Simple user ID
      email: email,
      role: 'authenticated',
      app_metadata: {
        provider: 'email',
        providers: ['email']
      },
      user_metadata: {
        email: email,
        email_verified: true,
        sub: `user-${Date.now()}`
      },
      iat: Math.floor(Date.now() / 1000),
      iss: 'https://content-studio-theta.vercel.app'
    };

    const token = jwt.sign(payload, jwtSecret, {
      algorithm: 'HS256'
    });

    // Also generate a simpler access token for API access
    const accessToken = jwt.sign(
      { 
        email, 
        role: 'authenticated',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 hours
      }, 
      jwtSecret,
      { algorithm: 'HS256' }
    );

    res.status(200).json({
      success: true,
      message: 'Token generated successfully',
      token: token,
      access_token: accessToken,
      email: email,
      expires_in: 604800, // 7 days in seconds
      instructions: [
        '1. Copy the access_token value',
        '2. Click "Use Access Token" on the login page',
        '3. Paste the token and click "Authenticate with Token"',
        '4. The token will be stored and used for authentication'
      ]
    });
  } catch (error) {
    console.error('Token generation error:', error);
    res.status(500).json({ 
      error: 'Token generation failed',
      details: error.message 
    });
  }
};