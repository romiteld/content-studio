/**
 * JWT token generator using proper Supabase format
 * This generates a development JWT token that can be used for authentication
 */

import { generateDevelopmentJWT } from './jwtVerification';

export function generateTestToken(email: string): string {
  // Use the new proper JWT generation
  return generateDevelopmentJWT(email);
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