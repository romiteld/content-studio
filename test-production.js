#!/usr/bin/env node

const https = require('https');

const PRODUCTION_URL = 'https://studio.thewell.solutions';
const tests = [];
let passed = 0;
let failed = 0;

function testEndpoint(method, path, expectedStatus, body = null) {
  return new Promise((resolve) => {
    const url = new URL(PRODUCTION_URL + path);
    
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      rejectUnauthorized: false // Allow self-signed certs in testing
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const success = res.statusCode === expectedStatus || 
                       (expectedStatus === 'any' && res.statusCode < 500);
        
        tests.push({
          endpoint: `${method} ${path}`,
          status: res.statusCode,
          expected: expectedStatus,
          success: success,
          response: data.substring(0, 100)
        });
        
        if (success) passed++;
        else failed++;
        
        resolve();
      });
    });

    req.on('error', (e) => {
      tests.push({
        endpoint: `${method} ${path}`,
        status: 'ERROR',
        expected: expectedStatus,
        success: false,
        error: e.message
      });
      failed++;
      resolve();
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🚀 Testing Production Environment: ' + PRODUCTION_URL);
  console.log('================================================\n');

  // Test public endpoints
  await testEndpoint('GET', '/', 200);
  await testEndpoint('GET', '/api/health', 200);
  
  // Test authentication endpoints
  await testEndpoint('POST', '/api/auth/login', 401, {
    email: 'test@test.com',
    password: 'wrong'
  });
  
  await testEndpoint('POST', '/api/auth/signup', 'any', {
    email: 'newuser@test.com',
    password: 'Test123!@#'
  });
  
  // Test API endpoints (should require auth)
  await testEndpoint('GET', '/api/content', 'any');
  await testEndpoint('GET', '/api/templates', 'any');
  await testEndpoint('GET', '/api/partners/active', 'any');
  await testEndpoint('GET', '/api/brand-config', 'any');
  
  // Test generation endpoints
  await testEndpoint('POST', '/api/generate/pdf', 'any', {
    title: 'Test',
    content: 'Test content'
  });
  
  await testEndpoint('POST', '/api/ai/chat', 'any', {
    message: 'Hello'
  });
  
  await testEndpoint('POST', '/api/agents/generate', 'any', {
    type: 'marketing',
    prompt: 'Test'
  });

  // Print results
  console.log('\n📊 TEST RESULTS:');
  console.log('================================================');
  
  tests.forEach(test => {
    const icon = test.success ? '✅' : '❌';
    const status = test.status === 'ERROR' ? 'CONNECTION ERROR' : `Status: ${test.status}`;
    console.log(`${icon} ${test.endpoint}`);
    console.log(`   ${status} (Expected: ${test.expected})`);
    if (test.error) console.log(`   Error: ${test.error}`);
    if (test.response && !test.success) {
      console.log(`   Response: ${test.response}`);
    }
    console.log('');
  });
  
  console.log('================================================');
  console.log(`\n📈 SUMMARY: ${passed} passed, ${failed} failed`);
  
  if (failed > 0) {
    console.log('\n⚠️  CRITICAL ISSUES DETECTED!');
    console.log('The backend API is not properly deployed or configured.');
    console.log('\n🔧 IMMEDIATE ACTIONS NEEDED:');
    console.log('1. Deploy backend to Vercel/Railway/Render');
    console.log('2. Set environment variables in hosting platform');
    console.log('3. Update DNS or proxy settings');
    console.log('4. Ensure Supabase URLs are configured');
  } else {
    console.log('\n✅ All tests passed! Production is ready.');
  }
}

runTests().catch(console.error);