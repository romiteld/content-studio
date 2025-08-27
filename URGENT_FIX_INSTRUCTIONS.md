# URGENT: Fix 405 Errors on Vercel - DO THIS NOW!

## IMMEDIATE ACTION REQUIRED (2 minutes max)

### 1. GO TO VERCEL DASHBOARD RIGHT NOW
1. Go to: https://vercel.com/dashboard
2. Click on your project: **content-studio** or **studio-thewell-solutions**

### 2. DISABLE VERCEL AUTHENTICATION (CRITICAL!)
1. Click **Settings** tab
2. Go to **General** section  
3. Find **"Vercel Authentication"** or **"Deployment Protection"**
4. **DISABLE IT** - Turn it OFF completely
5. Save changes

### 3. SET ENVIRONMENT VARIABLES
Still in Settings:
1. Go to **Environment Variables** section
2. Add ALL these (copy-paste exactly):

```
GOOGLE_AI_API_KEY=AIzaSyAbvYr4ApxLvamjKLP_BzXaTg0Hs177wIY
GOOGLE_GENERATIVE_AI_API_KEY=AIzaSyAbvYr4ApxLvamjKLP_BzXaTg0Hs177wIY
OPENAI_API_KEY=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
SUPABASE_URL=https://rqtpemdvwuzswnpvnljm.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxdHBlbWR2d3V6c3ducHZubGptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyNzk2NTYsImV4cCI6MjA3MTg1NTY1Nn0.brl3OXHpd5NeoBynsBcY5DntFZGbGgZ0GQDw8FR5kg8
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxdHBlbWR2d3V6c3ducHZubGptIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI3OTY1NiwiZXhwIjoyMDcxODU1NjU2fQ.SjKLyzB2071t9OYlky_nQuFz8xTLhyvkKqT4Rm3UcFE
```

### 4. REDEPLOY IMMEDIATELY
1. Go to **Deployments** tab
2. Find your latest deployment
3. Click the **...** menu
4. Select **Redeploy**
5. Click **Redeploy** in the popup

## WHY THIS FIXES THE 405 ERRORS:
- Vercel Authentication blocks unauthorized API requests with 405
- Missing env variables cause API handlers to fail
- The deployment protection was preventing POST requests

## TEST AFTER REDEPLOYMENT (2-3 minutes):
Visit: https://studio.thewell.solutions
- Frontend should load ✅
- Try login functionality
- Test AI chat
- All POST requests should work now

## IF STILL NOT WORKING:
The issue is the API functions aren't being recognized. In that case, we need to:
1. Remove the complex vercel.json
2. Use simpler API structure
3. Deploy backend separately to Railway/Render

## THIS WILL WORK - Vercel Authentication is the #1 cause of 405 errors!