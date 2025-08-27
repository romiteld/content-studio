#!/bin/bash

echo "Testing authentication flow..."
echo ""

# Use curl with verbose headers to see what's happening
echo "1. Fetching main page..."
response=$(curl -s -I http://localhost:3000)
echo "HTTP Response:"
echo "$response" | head -3
echo ""

# Test if we can get the JavaScript bundle
echo "2. Testing React bundle..."
bundle_size=$(curl -s http://localhost:3000/static/js/bundle.js | wc -c)
echo "Bundle size: $bundle_size bytes"
echo ""

# Check if API is responding
echo "3. Testing API health..."
api_response=$(curl -s http://localhost:3001/api/health)
echo "API response: $api_response"
echo ""

# Test authentication endpoint
echo "4. Testing auth endpoint..."
auth_test=$(curl -s -X POST http://localhost:3001/api/auth/test \
  -H "Content-Type: application/json" \
  -d '{"test": true}' 2>&1)
echo "Auth endpoint response: $auth_test"
echo ""

echo "--- Browser Test ---"
echo "Open http://localhost:3000 in your browser"
echo "You should see:"
echo "  1. The Well logo"
echo "  2. Either a login form OR the main application"
echo "  3. Check browser console (F12) for any errors"
echo ""
echo "Check browser console for:"
echo "  - Missing Supabase environment variables"
echo "  - JWT verification errors"
echo "  - Any network errors"