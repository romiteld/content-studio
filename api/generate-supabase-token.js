import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, admin_key } = req.body;

    // Validate inputs
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check for admin bypass (for initial setup)
    const ADMIN_EMAILS = [
      'daniel.romitelli@emailthewell.com',
      'admin@emailthewell.com',
      'admin@thewell.com'
    ];
    
    if (!ADMIN_EMAILS.includes(email.toLowerCase())) {
      return res.status(403).json({ error: 'Unauthorized email address' });
    }

    // For production, you would use the actual Supabase service role key
    // This is a development implementation that creates a properly formatted JWT
    const SUPABASE_PROJECT_ID = 'rqtpemdvwuzswnpvnljm';
    const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET || 'development-secret';
    
    // Create JWT payload following Supabase format
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      aud: 'authenticated',
      exp: now + (60 * 60 * 24), // 24 hours
      iat: now,
      iss: `https://${SUPABASE_PROJECT_ID}.supabase.co/auth/v1`,
      sub: `auth-user-${Date.now()}`,
      email: email,
      phone: '',
      role: 'authenticated',
      session_id: `session-${Date.now()}`,
      app_metadata: {
        provider: 'email',
        providers: ['email']
      },
      user_metadata: {
        email: email,
        email_verified: true,
        full_name: email.includes('daniel') ? 'Daniel Romitelli' : 'Admin User',
        company_name: 'The Well'
      },
      is_anonymous: false,
      aal: 'aal1',
      amr: [{ method: 'password', timestamp: now }]
    };

    // In development mode, create a mock JWT
    // In production, you would sign with the actual Supabase JWT secret
    if (process.env.NODE_ENV === 'development' || !process.env.SUPABASE_JWT_SECRET) {
      // Create a development token that our frontend will recognize
      const header = {
        alg: 'ES256',
        typ: 'JWT',
        kid: 'accb6244-ba56-4135-ba1a-e6061f025dfe' // Supabase key ID
      };

      // Add mock_token flag for development
      payload.user_metadata.mock_token = true;

      // Base64url encode
      const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
      const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
      const mockSignature = Buffer.from(`dev-sig-${Date.now()}`).toString('base64url');

      const token = `${encodedHeader}.${encodedPayload}.${mockSignature}`;
      
      return res.status(200).json({
        access_token: token,
        token_type: 'bearer',
        expires_in: 86400,
        expires_at: now + 86400,
        user: {
          id: payload.sub,
          email: payload.email,
          app_metadata: payload.app_metadata,
          user_metadata: payload.user_metadata,
          role: payload.role
        },
        development_mode: true
      });
    } else {
      // Production mode - sign with actual secret
      const token = jwt.sign(payload, SUPABASE_JWT_SECRET, {
        algorithm: 'HS256',
        header: {
          typ: 'JWT',
          kid: process.env.SUPABASE_JWT_KID || 'accb6244-ba56-4135-ba1a-e6061f025dfe'
        }
      });

      return res.status(200).json({
        access_token: token,
        token_type: 'bearer',
        expires_in: 86400,
        expires_at: now + 86400,
        user: {
          id: payload.sub,
          email: payload.email,
          app_metadata: payload.app_metadata,
          user_metadata: payload.user_metadata,
          role: payload.role
        }
      });
    }
  } catch (error) {
    console.error('Token generation error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate token',
      details: error.message
    });
  }
}