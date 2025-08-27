/**
 * Simple JWT token generator for testing
 * This generates a local JWT token that can be used for authentication
 */

export function generateTestToken(email: string): string {
  // Create a simple JWT-like token structure
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  const payload = {
    aud: 'authenticated',
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7), // 7 days
    sub: `user-${Date.now()}`,
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

  // Base64 encode the header and payload
  const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '');
  const encodedPayload = btoa(JSON.stringify(payload)).replace(/=/g, '');
  
  // Create a mock signature (for testing only)
  const signature = btoa('test-signature-' + Date.now()).replace(/=/g, '');

  // Combine to create JWT format
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Generate a simple access token for a given email
 * You can call this from the browser console:
 * generateAccessToken('your-email@emailthewell.com')
 */
export function generateAccessToken(email: string): { token: string; instructions: string[] } {
  const token = generateTestToken(email);
  
  const instructions = [
    '1. Copy the token below',
    '2. On the login page, click "Use Access Token"',
    '3. Paste the token in the input field',
    '4. Click "Authenticate with Token"',
    '5. You will be logged in as: ' + email
  ];

  console.log('='.repeat(60));
  console.log('ACCESS TOKEN GENERATED');
  console.log('='.repeat(60));
  console.log('Token:', token);
  console.log('-'.repeat(60));
  instructions.forEach((inst, i) => console.log(inst));
  console.log('='.repeat(60));

  return { token, instructions };
}

// Make it available globally in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).generateAccessToken = generateAccessToken;
}