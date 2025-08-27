# Supabase Authentication Configuration for Production

## Project Details
- **Project ID**: rqtpemdvwuzswnpvnljm
- **Project Name**: content-studio
- **Project URL**: https://rqtpemdvwuzswnpvnljm.supabase.co
- **Production Domain**: https://studio.thewell.solutions

## Required Supabase Dashboard Configuration

### 1. Navigate to your Supabase Dashboard
Go to: https://supabase.com/dashboard/project/rqtpemdvwuzswnpvnljm

### 2. Configure Authentication Settings

#### A. Site URL Configuration
1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL** to: `https://studio.thewell.solutions`
3. This is the base URL where your app is hosted

#### B. Redirect URLs
Add ALL of these URLs to the **Redirect URLs** allowlist:
- `https://studio.thewell.solutions`
- `https://studio.thewell.solutions/*`
- `https://studio.thewell.solutions/auth/callback`
- `https://studio.thewell.solutions/auth/confirm`
- `https://studio.thewell.solutions/login`
- `https://studio.thewell.solutions/dashboard`
- `http://localhost:3000` (for local development)
- `http://localhost:3000/*`
- `http://localhost:3001`
- `http://localhost:3001/*`

#### C. Email Templates (if using email auth)
1. Go to **Authentication** → **Email Templates**
2. Update all email templates to use the production URL
3. Replace any instances of `http://localhost` with `https://studio.thewell.solutions`

### 3. Configure API Settings

#### A. CORS Configuration
1. Go to **Settings** → **API**
2. Add these domains to **Additional allowed origins**:
   - `https://studio.thewell.solutions`
   - `https://thewell.solutions`

### 4. Database Configuration

#### A. Row Level Security (RLS)
Ensure RLS is enabled for all tables that contain user data:
```sql
-- Enable RLS on tables
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
```

#### B. Policies
Create appropriate policies for authenticated users:
```sql
-- Example policy for content table
CREATE POLICY "Users can view all content" ON content
FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create content" ON content
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own content" ON content
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own content" ON content
FOR DELETE USING (auth.uid() = user_id);
```

### 5. Edge Functions Configuration (if applicable)
If using Supabase Edge Functions:
1. Go to **Edge Functions**
2. Set environment variables:
   - `CLIENT_URL`: https://studio.thewell.solutions
   - `API_URL`: https://studio.thewell.solutions

## Frontend Configuration Updates

### Update Supabase Client Initialization
In `frontend/src/config/supabase.ts`:
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://rqtpemdvwuzswnpvnljm.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '<your-anon-key>';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    redirectTo: 'https://studio.thewell.solutions/auth/callback',
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
```

### Update Authentication Functions
```typescript
// Sign In with redirect
const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (!error && data) {
    window.location.href = 'https://studio.thewell.solutions/dashboard';
  }
  
  return { data, error };
};

// Sign Up with email confirmation
const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: 'https://studio.thewell.solutions/auth/confirm',
    }
  });
  
  return { data, error };
};

// OAuth Sign In (Google, GitHub, etc.)
const signInWithProvider = async (provider: 'google' | 'github') => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: 'https://studio.thewell.solutions/auth/callback',
    }
  });
  
  return { data, error };
};
```

## Testing Checklist

### Local Testing
1. [ ] Set up local environment variables
2. [ ] Test sign up flow
3. [ ] Test sign in flow
4. [ ] Test password reset flow
5. [ ] Test OAuth providers (if configured)

### Production Testing
1. [ ] Verify Site URL is set correctly in Supabase
2. [ ] Test authentication from https://studio.thewell.solutions
3. [ ] Verify redirect URLs work correctly
4. [ ] Check browser console for any CORS errors
5. [ ] Test email confirmations arrive with correct links
6. [ ] Verify sessions persist correctly
7. [ ] Test logout functionality

## Common Issues and Solutions

### Issue: "Redirect URL not allowed"
**Solution**: Add the exact URL to the Redirect URLs list in Supabase Dashboard

### Issue: CORS errors on authentication
**Solution**: Add your domain to the allowed origins in API settings

### Issue: Users redirected to wrong URL after authentication
**Solution**: Update the Site URL and ensure redirectTo is set correctly in auth functions

### Issue: Email confirmation links don't work
**Solution**: Update email templates with the correct production URL

### Issue: Sessions not persisting
**Solution**: Check that cookies are enabled and domain is served over HTTPS

## Security Notes

1. **Never expose service role key** in frontend code
2. **Always use HTTPS** in production
3. **Enable RLS** on all tables with user data
4. **Implement proper policies** for data access
5. **Use secure session management** settings
6. **Regular security audits** of authentication flow

## Monitoring

Set up monitoring for:
- Failed authentication attempts
- Successful logins
- Password reset requests
- Session expirations
- OAuth provider failures

## Support Links

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Redirect URLs Guide](https://supabase.com/docs/guides/auth/redirect-urls)
- [Project Dashboard](https://supabase.com/dashboard/project/rqtpemdvwuzswnpvnljm)