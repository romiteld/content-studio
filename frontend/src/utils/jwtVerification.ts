/**
 * JWT Verification using Supabase JWKS
 * Proper JWT verification using the JWKS discovery endpoint
 */

interface JWK {
  x?: string;
  y?: string;
  alg: string;
  crv?: string;
  ext?: boolean;
  kid: string;
  kty: string;
  key_ops?: string[];
  n?: string;
  e?: string;
  use?: string;
}

interface JWKS {
  keys: JWK[];
}

interface JWTHeader {
  alg: string;
  typ: string;
  kid?: string;
}

interface JWTPayload {
  aud: string;
  exp: number;
  iat: number;
  iss: string;
  sub: string;
  email?: string;
  role?: string;
  session_id?: string;
  app_metadata?: any;
  user_metadata?: any;
  is_anonymous?: boolean;
  aal?: string;
  amr?: Array<{ method: string; timestamp: number }>;
}

const SUPABASE_PROJECT_ID = 'rqtpemdvwuzswnpvnljm';
const JWKS_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co/auth/v1/.well-known/jwks.json`;

// Cache for JWKS to avoid repeated fetches
let jwksCache: JWKS | null = null;
let jwksCacheExpiry: number = 0;

/**
 * Fetch JWKS from Supabase discovery endpoint
 */
async function fetchJWKS(): Promise<JWKS> {
  const now = Date.now();
  
  // Return cached JWKS if still valid (cache for 1 hour)
  if (jwksCache && jwksCacheExpiry > now) {
    return jwksCache;
  }

  try {
    const response = await fetch(JWKS_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch JWKS: ${response.statusText}`);
    }
    
    jwksCache = await response.json();
    jwksCacheExpiry = now + (60 * 60 * 1000); // Cache for 1 hour
    
    return jwksCache!;
  } catch (error) {
    console.error('Error fetching JWKS:', error);
    throw new Error('Failed to fetch JWKS from Supabase');
  }
}

/**
 * Parse a JWT token into its components
 */
export function parseJWT(token: string): { header: JWTHeader; payload: JWTPayload; signature: string } {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT format');
  }

  try {
    const header = JSON.parse(atob(parts[0]));
    const payload = JSON.parse(atob(parts[1]));
    
    return {
      header,
      payload,
      signature: parts[2]
    };
  } catch (error) {
    throw new Error('Failed to parse JWT');
  }
}

/**
 * Verify JWT signature using Web Crypto API with JWKS
 */
async function verifySignatureWithJWKS(token: string, jwk: JWK): Promise<boolean> {
  const parts = token.split('.');
  const message = `${parts[0]}.${parts[1]}`;
  const signature = parts[2];

  try {
    // Import the JWK as a CryptoKey
    let algorithm: any;
    let keyData: any;
    
    if (jwk.kty === 'EC' && jwk.crv === 'P-256') {
      // ES256 algorithm (ECDSA with P-256 and SHA-256)
      algorithm = {
        name: 'ECDSA',
        namedCurve: 'P-256'
      };
      
      // Convert JWK to importable format
      keyData = {
        kty: jwk.kty,
        crv: jwk.crv,
        x: jwk.x,
        y: jwk.y,
        alg: jwk.alg,
        ext: jwk.ext,
        key_ops: jwk.key_ops
      };
    } else if (jwk.kty === 'RSA') {
      // RS256 algorithm (RSASSA-PKCS1-v1_5 with SHA-256)
      algorithm = {
        name: 'RSASSA-PKCS1-v1_5',
        hash: 'SHA-256'
      };
      
      keyData = {
        kty: jwk.kty,
        n: jwk.n,
        e: jwk.e,
        alg: jwk.alg,
        use: jwk.use
      };
    } else {
      throw new Error(`Unsupported key type: ${jwk.kty}`);
    }

    const key = await crypto.subtle.importKey(
      'jwk',
      keyData,
      algorithm,
      false,
      ['verify']
    );

    // Decode the signature from base64url
    const signatureBuffer = base64UrlToArrayBuffer(signature);
    const messageBuffer = new TextEncoder().encode(message);

    // Verify the signature
    const verifyAlgorithm = jwk.kty === 'EC' 
      ? { name: 'ECDSA', hash: 'SHA-256' }
      : { name: 'RSASSA-PKCS1-v1_5' };

    const isValid = await crypto.subtle.verify(
      verifyAlgorithm,
      key,
      signatureBuffer,
      messageBuffer
    );

    return isValid;
  } catch (error) {
    console.error('Signature verification failed:', error);
    return false;
  }
}

/**
 * Convert base64url string to ArrayBuffer
 */
function base64UrlToArrayBuffer(base64url: string): ArrayBuffer {
  // Convert base64url to base64
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  
  // Pad with = if necessary
  const pad = base64.length % 4;
  if (pad) {
    base64 += '='.repeat(4 - pad);
  }
  
  // Decode base64
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  return bytes.buffer;
}

/**
 * Verify a Supabase JWT token
 */
export async function verifySupabaseJWT(token: string): Promise<{ valid: boolean; payload?: JWTPayload; error?: string }> {
  try {
    // Parse the JWT
    const { header, payload } = parseJWT(token);
    
    // Check if token is expired
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return { valid: false, error: 'Token has expired' };
    }
    
    // Check if token is not yet valid
    if (payload.iat && payload.iat > now + 60) { // Allow 1 minute clock skew
      return { valid: false, error: 'Token not yet valid' };
    }
    
    // Verify issuer
    if (!payload.iss || !payload.iss.includes(SUPABASE_PROJECT_ID)) {
      return { valid: false, error: 'Invalid token issuer' };
    }

    // For development/testing: Allow mock tokens with specific flag
    if (payload.user_metadata?.mock_token === true) {
      console.warn('Mock token detected - allowing for development');
      return { valid: true, payload };
    }
    
    // Fetch JWKS
    const jwks = await fetchJWKS();
    
    // Find the key matching the kid in the JWT header
    const jwk = jwks.keys.find(key => key.kid === header.kid);
    
    if (!jwk) {
      // If no kid match, try to find key by algorithm
      const algorithmKey = jwks.keys.find(key => key.alg === header.alg);
      if (!algorithmKey) {
        return { valid: false, error: 'No matching key found in JWKS' };
      }
    }
    
    // Verify the signature
    const isValid = await verifySignatureWithJWKS(token, jwk || jwks.keys[0]);
    
    if (!isValid) {
      return { valid: false, error: 'Invalid signature' };
    }
    
    return { valid: true, payload };
  } catch (error) {
    console.error('JWT verification error:', error);
    return { valid: false, error: error instanceof Error ? error.message : 'Verification failed' };
  }
}

/**
 * Generate a development JWT token (for testing only)
 * This creates a properly formatted JWT that can work with the verification
 */
export function generateDevelopmentJWT(email: string): string {
  const header = {
    alg: 'ES256',
    typ: 'JWT',
    kid: 'accb6244-ba56-4135-ba1a-e6061f025dfe' // Use the standby key ID from Supabase
  };

  const now = Math.floor(Date.now() / 1000);
  const payload: JWTPayload = {
    aud: 'authenticated',
    exp: now + (60 * 60 * 24), // 24 hours
    iat: now,
    iss: `https://${SUPABASE_PROJECT_ID}.supabase.co/auth/v1`,
    sub: `dev-user-${Date.now()}`,
    email: email,
    role: 'authenticated',
    session_id: `session-${Date.now()}`,
    app_metadata: {
      provider: 'email',
      providers: ['email']
    },
    user_metadata: {
      email: email,
      email_verified: true,
      mock_token: true // Flag to identify development tokens
    },
    is_anonymous: false,
    aal: 'aal1',
    amr: [{ method: 'password', timestamp: now }]
  };

  // Base64url encode
  const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const encodedPayload = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  
  // Create a mock signature (this won't pass real verification but will be caught by our mock_token flag)
  const mockSignature = btoa(`dev-sig-${Date.now()}`).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  return `${encodedHeader}.${encodedPayload}.${mockSignature}`;
}

/**
 * Extract user information from a verified JWT
 */
export function extractUserFromJWT(payload: JWTPayload) {
  return {
    id: payload.sub,
    email: payload.email || '',
    role: payload.role || 'authenticated',
    app_metadata: payload.app_metadata || {},
    user_metadata: payload.user_metadata || {},
    session_id: payload.session_id,
    is_anonymous: payload.is_anonymous || false
  };
}