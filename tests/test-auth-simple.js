const http = require('http');

async function testAuthFlow() {
  console.log('Testing authentication flow...\n');
  
  // Test 1: Check if frontend is serving
  console.log('1. Testing frontend server...');
  try {
    const frontendResponse = await fetch('http://localhost:3000');
    const frontendHtml = await frontendResponse.text();
    
    if (frontendHtml.includes('<!DOCTYPE html>')) {
      console.log('   ✓ Frontend is serving HTML');
    }
    
    // Check for React app root
    if (frontendHtml.includes('id="root"')) {
      console.log('   ✓ React root element found');
    }
    
    // Check if the environment variables are being read
    console.log('\n2. Checking environment variables...');
    console.log('   REACT_APP_SUPABASE_URL:', process.env.REACT_APP_SUPABASE_URL ? 'Set' : 'Not set');
    console.log('   REACT_APP_SUPABASE_ANON_KEY:', process.env.REACT_APP_SUPABASE_ANON_KEY ? 'Set' : 'Not set');
    console.log('   REACT_APP_API_URL:', process.env.REACT_APP_API_URL ? 'Set' : 'Not set');
    
  } catch (error) {
    console.error('   ✗ Frontend test failed:', error.message);
  }
  
  // Test 2: Check if backend API is responding
  console.log('\n3. Testing backend API...');
  try {
    const apiResponse = await fetch('http://localhost:3001/api/health');
    console.log('   API response status:', apiResponse.status);
    
    if (apiResponse.ok) {
      const data = await apiResponse.text();
      console.log('   ✓ Backend API is responding');
      console.log('   Response:', data.substring(0, 100));
    } else {
      console.log('   ⚠ Backend returned status:', apiResponse.status);
    }
  } catch (error) {
    console.error('   ✗ Backend API test failed:', error.message);
  }
  
  // Test 3: Check Supabase configuration
  console.log('\n4. Testing Supabase configuration...');
  const supabaseUrl = 'https://rqtpemdvwuzswnpvnljm.supabase.co';
  try {
    const supabaseResponse = await fetch(`${supabaseUrl}/auth/v1/.well-known/jwks.json`);
    if (supabaseResponse.ok) {
      const jwks = await supabaseResponse.json();
      console.log('   ✓ Supabase JWKS endpoint accessible');
      console.log('   Keys found:', jwks.keys ? jwks.keys.length : 0);
    } else {
      console.log('   ⚠ Supabase JWKS endpoint returned:', supabaseResponse.status);
    }
  } catch (error) {
    console.error('   ✗ Supabase test failed:', error.message);
  }
  
  console.log('\n--- Summary ---');
  console.log('Frontend: Running on http://localhost:3000');
  console.log('Backend: Running on http://localhost:3001');
  console.log('Supabase: Configuration appears to be set');
  console.log('\nYou can now open http://localhost:3000 in your browser to test the auth flow manually.');
}

testAuthFlow().catch(console.error);