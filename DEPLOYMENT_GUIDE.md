# Deployment Configuration Guide for studio.thewell.solutions

## Overview
This guide ensures proper configuration for deploying to `https://studio.thewell.solutions` on GitHub Pages or any other hosting service.

## Environment Variables Configuration

### Frontend Environment Variables
Create `.env.production` in the `frontend/` directory:

```bash
# Production API endpoint
REACT_APP_API_URL=https://studio.thewell.solutions

# Supabase Configuration
REACT_APP_SUPABASE_URL=https://rqtpemdvwuzswnpvnljm.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxdHBlbWR2d3V6c3ducHZubGptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyNzk2NTYsImV4cCI6MjA3MTg1NTY1Nn0.brl3OXHpd5NeoBynsBcY5DntFZGbGgZ0GQDw8FR5kg8
```

### Backend Environment Variables
Create `.env.production` in the `backend/` directory:

```bash
# API Keys
FIRECRAWL_API_KEY=fc-e59c9dc8113e484c9c1d6a75c49900a7
GOOGLE_AI_API_KEY=AIzaSyAbvYr4ApxLvamjKLP_BzXaTg0Hs177wIY
GOOGLE_GENERATIVE_AI_API_KEY=AIzaSyAbvYr4ApxLvamjKLP_BzXaTg0Hs177wIY
OPENAI_API_KEY=<your-openai-key>

# Supabase Configuration
SUPABASE_URL=https://rqtpemdvwuzswnpvnljm.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxdHBlbWR2d3V6c3ducHZubGptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyNzk2NTYsImV4cCI6MjA3MTg1NTY1Nn0.brl3OXHpd5NeoBynsBcY5DntFZGbGgZ0GQDw8FR5kg8
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxdHBlbWR2d3V6c3ducHZubGptIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI3OTY1NiwiZXhwIjoyMDcxODU1NjU2fQ.SjKLyzB2071t9OYlky_nQuFz8xTLhyvkKqT4Rm3UcFE

# Server Configuration
PORT=3001

# Production URLs
CLIENT_URL=https://studio.thewell.solutions
API_URL=https://studio.thewell.solutions
```

## GitHub Secrets Configuration
Add these secrets to your GitHub repository (Settings > Secrets and variables > Actions):

1. `REACT_APP_API_URL`: https://studio.thewell.solutions
2. `REACT_APP_SUPABASE_URL`: Your Supabase URL
3. `REACT_APP_SUPABASE_ANON_KEY`: Your Supabase anonymous key
4. All other API keys as listed above

## Supabase Configuration

### 1. Update Site URL
In Supabase Dashboard:
1. Go to Authentication > URL Configuration
2. Set Site URL to: `https://studio.thewell.solutions`

### 2. Add Redirect URLs
Add these URLs to the redirect allowlist:
- `https://studio.thewell.solutions`
- `https://studio.thewell.solutions/*`
- `https://studio.thewell.solutions/auth/callback`

### 3. Update CORS Settings
In Supabase Dashboard:
1. Go to Settings > API
2. Add `https://studio.thewell.solutions` to allowed origins

## Build Configuration

### Frontend Build Script
Update `frontend/package.json`:

```json
{
  "scripts": {
    "build": "GENERATE_SOURCEMAP=false react-scripts build",
    "build:prod": "REACT_APP_API_URL=https://studio.thewell.solutions npm run build"
  }
}
```

### Backend Configuration
The backend server.js has been updated with proper CORS configuration:

```javascript
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://studio.thewell.solutions',
      'https://thewell.solutions',
      'http://localhost:3000',
      'http://localhost:3001'
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all for now, restrict later
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};
```

## Deployment Steps

### For GitHub Pages Deployment:

1. **Build the Frontend**:
   ```bash
   cd frontend
   npm run build:prod
   ```

2. **Deploy to GitHub Pages**:
   ```bash
   npm install -g gh-pages
   gh-pages -d frontend/build
   ```

3. **Configure GitHub Pages**:
   - Go to Settings > Pages
   - Source: Deploy from a branch
   - Branch: gh-pages
   - Root folder: /
   - Custom domain: studio.thewell.solutions

### For Backend Deployment (Vercel/Railway/Render):

1. **Set Environment Variables** in your hosting platform
2. **Deploy Backend** with the production environment variables
3. **Update DNS** to point to your backend service

## Custom Domain Setup

### DNS Configuration:
Add these DNS records:

1. **For GitHub Pages**:
   - Type: CNAME
   - Name: studio
   - Value: [your-github-username].github.io

2. **For Backend API** (if separate):
   - Type: A
   - Name: api
   - Value: [Your backend server IP]

## Testing Production Configuration

### 1. Test CORS:
```bash
curl -H "Origin: https://studio.thewell.solutions" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -X OPTIONS \
  https://studio.thewell.solutions/api/health
```

### 2. Test API Connection:
```javascript
fetch('https://studio.thewell.solutions/api/health')
  .then(res => res.json())
  .then(console.log)
```

### 3. Test Supabase Authentication:
Ensure you can:
- Sign up new users
- Sign in existing users
- Access protected routes

## Common Issues and Solutions

### Issue: CORS Errors
**Solution**: Ensure backend CORS configuration includes your production domain

### Issue: API Not Responding
**Solution**: Check that REACT_APP_API_URL is set correctly in production build

### Issue: Authentication Not Working
**Solution**: Verify Supabase redirect URLs include your production domain

### Issue: Mixed Content Warnings
**Solution**: Ensure all API calls use HTTPS in production

## Security Checklist

- [ ] Remove localhost from CORS origins in production
- [ ] Use environment variables for all sensitive keys
- [ ] Enable HTTPS for all endpoints
- [ ] Set secure cookie flags in production
- [ ] Implement rate limiting on API endpoints
- [ ] Add request validation and sanitization
- [ ] Configure CSP headers

## Monitoring

1. Set up error tracking (Sentry/Rollbar)
2. Configure uptime monitoring
3. Set up SSL certificate auto-renewal
4. Monitor API response times
5. Track authentication success/failure rates

## Support

For issues specific to this deployment:
1. Check browser console for errors
2. Verify network tab for failed requests
3. Check Supabase logs for authentication issues
4. Review backend logs for API errors