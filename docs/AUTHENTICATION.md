# Authentication Guide - Content Studio

## Overview
The Content Studio uses a dual authentication system:
1. **JWT Token Authentication** - Direct token-based access (works immediately)
2. **Supabase OTP** - Email-based one-time passwords (requires configuration)

## Quick Start - Getting Access

### For Administrators

#### Method 1: Built-in Token Generator (Easiest)
1. Navigate to https://studio.thewell.solutions
2. Click "Use Access Token" button
3. Enter your email in "Quick Test Token" field
4. Click "Generate Test Token" 
5. Click "Authenticate with Token"
6. You're logged in!

#### Method 2: Browser Console
```javascript
// Run this in browser console at the app URL
localStorage.setItem('authToken', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluQHRoZXdlbGwuc29sdXRpb25zIiwiZXhwIjoxNzU3NDg0MDAwLCJzdWIiOiJhZG1pbi11c2VyIiwicm9sZSI6ImF1dGhlbnRpY2F0ZWQifQ.test');
location.reload();
```

### For Regular Users

Once Supabase is configured:
1. Enter email address
2. Click "Send Sign-In Code"
3. Check email for 6-digit code
4. Enter code to sign in

## How Authentication Works

### Token Flow
```
User → Login Page → Generate/Enter Token → Store in Browser → Access Granted
```

1. **Token Generation**: Creates a JWT with user email and expiration
2. **Token Storage**: Saved to localStorage and sessionStorage
3. **Token Validation**: AuthContext checks token on each page load
4. **API Requests**: Token included in Authorization header

### Token Structure
```javascript
{
  "email": "user@thewell.solutions",
  "exp": 1757484000,        // Expiration timestamp
  "sub": "user-id",          // User identifier
  "role": "authenticated",   // User role
  "iat": 1756879200         // Issued at timestamp
}
```

## Security Considerations

### Production Setup
1. **Environment Variables** (Add to Vercel):
   ```
   SUPABASE_URL=https://rqtpemdvwuzswnpvnljm.supabase.co
   SUPABASE_ANON_KEY=[your-anon-key]
   SUPABASE_SERVICE_ROLE_KEY=[your-service-key]
   JWT_SECRET=[minimum-32-character-secret]
   ```

2. **Supabase Configuration**:
   - Go to Supabase Dashboard → Authentication → URL Configuration
   - Add redirect URLs:
     ```
     https://studio.thewell.solutions/**
     https://*.vercel.app/**
     ```

### Token Security
- Test tokens are for development/testing only
- Production should use Supabase OTP or proper JWT signing
- Tokens expire after 7 days by default
- Clear tokens on logout: `localStorage.removeItem('authToken')`

## API Authentication

All API requests include the token:
```javascript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

## Troubleshooting

### Can't Access Application
1. Check if token exists: `localStorage.getItem('authToken')` in console
2. Generate new token using Option 1 above
3. Clear old tokens: `localStorage.clear()` then refresh

### Token Expired
- Generate a new token using any method above
- Tokens last 7 days by default

### Supabase OTP Not Working
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set in Vercel
- Check Supabase email settings are configured
- Ensure redirect URLs are added in Supabase dashboard

## Development vs Production

### Development (Local)
- Use test token generator
- No email verification needed
- Tokens work immediately

### Production (Vercel)
- Supabase OTP recommended for security
- Test tokens available for admin access
- All tokens should use proper JWT secret

## Managing Users

### Add New User
1. User requests access
2. Admin generates token for user's email
3. Share token securely (not via email)
4. User uses "Use Access Token" option

### Remove User Access
Currently manual - implement token blacklist or use Supabase user management

## Next Steps

1. **Immediate**: Use test token generator for access
2. **Soon**: Configure Supabase environment variables
3. **Later**: Implement proper user management dashboard
4. **Future**: Add role-based access control (RBAC)