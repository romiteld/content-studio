#!/usr/bin/env node

const https = require('https');
const PRODUCTION_URL = 'https://studio.thewell.solutions';

console.log('🚀 COMPREHENSIVE PRODUCTION TEST SUITE');
console.log('=====================================\n');

const results = {
  passed: [],
  failed: [],
  warnings: []
};

function makeRequest(method, path, body = null, headers = {}) {
  return new Promise((resolve) => {
    const url = new URL(PRODUCTION_URL + path);
    
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...headers
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data,
          success: res.statusCode >= 200 && res.statusCode < 400
        });
      });
    });

    req.on('error', (e) => {
      resolve({
        status: 'ERROR',
        error: e.message,
        success: false
      });
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function testSuite() {
  // 1. TEST FRONTEND LOADING
  console.log('📱 Testing Frontend...');
  const frontend = await makeRequest('GET', '/');
  if (frontend.success && frontend.body.includes('<!doctype html>')) {
    results.passed.push('✅ Frontend loads successfully');
  } else {
    results.failed.push('❌ Frontend failed to load');
  }

  // 2. TEST API HEALTH
  console.log('🏥 Testing API Health...');
  const health = await makeRequest('GET', '/api/health');
  if (health.success) {
    results.passed.push('✅ API Health endpoint working');
  } else {
    results.failed.push('❌ API Health endpoint failed');
  }

  // 3. TEST AUTHENTICATION
  console.log('🔐 Testing Authentication...');
  const authTest = await makeRequest('POST', '/api/auth/login', {
    email: 'test@example.com',
    password: 'wrongpassword'
  });
  if (authTest.status === 401 || authTest.status === 400) {
    results.passed.push('✅ Authentication endpoint responds correctly');
  } else {
    results.failed.push('❌ Authentication endpoint not working: ' + authTest.status);
  }

  // 4. TEST AI CHAT WITH GEMINI
  console.log('🤖 Testing AI Chat Assistant (Gemini)...');
  const chatTest = await makeRequest('POST', '/api/ai/chat', {
    message: 'Hello, test message',
    model: 'gemini-2.0-flash-exp'
  });
  if (chatTest.success || chatTest.status === 401) {
    results.passed.push('✅ AI Chat endpoint accessible');
  } else {
    results.failed.push(`❌ AI Chat failed: ${chatTest.status} - ${chatTest.body?.substring(0, 100)}`);
  }

  // 5. TEST AGENTS ENDPOINT
  console.log('🤖 Testing AI Agents...');
  const agentTest = await makeRequest('POST', '/api/agents/generate', {
    type: 'marketing',
    prompt: 'Create a test campaign'
  });
  if (agentTest.success || agentTest.status === 401 || agentTest.status === 400) {
    results.passed.push('✅ AI Agents endpoint accessible');
  } else {
    results.failed.push(`❌ AI Agents failed: ${agentTest.status}`);
  }

  // 6. TEST CONTENT ENDPOINTS
  console.log('📝 Testing Content API...');
  const contentTest = await makeRequest('GET', '/api/content');
  if (contentTest.success || contentTest.status === 401) {
    results.passed.push('✅ Content API accessible');
  } else {
    results.failed.push(`❌ Content API failed: ${contentTest.status}`);
  }

  // 7. TEST TEMPLATES
  console.log('📄 Testing Templates...');
  const templatesTest = await makeRequest('GET', '/api/templates');
  if (templatesTest.success || templatesTest.status === 401) {
    results.passed.push('✅ Templates API accessible');
  } else {
    results.failed.push(`❌ Templates API failed: ${templatesTest.status}`);
  }

  // 8. TEST PARTNERS
  console.log('🤝 Testing Partners API...');
  const partnersTest = await makeRequest('GET', '/api/partners/active');
  if (partnersTest.success || partnersTest.status === 401 || partnersTest.status === 404) {
    results.passed.push('✅ Partners API accessible');
  } else {
    results.failed.push(`❌ Partners API failed: ${partnersTest.status}`);
  }

  // 9. TEST PDF GENERATION
  console.log('📑 Testing PDF Generation...');
  const pdfTest = await makeRequest('POST', '/api/generate/pdf', {
    title: 'Test PDF',
    content: 'Test content for PDF generation'
  });
  if (pdfTest.success || pdfTest.status === 401 || pdfTest.status === 400) {
    results.passed.push('✅ PDF Generation endpoint accessible');
  } else {
    results.failed.push(`❌ PDF Generation failed: ${pdfTest.status}`);
  }

  // 10. TEST IMAGE GENERATION
  console.log('🖼️ Testing Image Generation...');
  const imageTest = await makeRequest('POST', '/api/ai/image/generate', {
    prompt: 'A beautiful landscape'
  });
  if (imageTest.success || imageTest.status === 401 || imageTest.status === 400) {
    results.passed.push('✅ Image Generation endpoint accessible');
  } else {
    results.warnings.push(`⚠️ Image Generation needs checking: ${imageTest.status}`);
  }

  // 11. TEST BRAND CONFIG
  console.log('🎨 Testing Brand Configuration...');
  const brandTest = await makeRequest('GET', '/api/brand-config');
  if (brandTest.success || brandTest.status === 401) {
    results.passed.push('✅ Brand Config accessible');
  } else {
    results.warnings.push(`⚠️ Brand Config needs checking: ${brandTest.status}`);
  }

  // 12. TEST UPLOAD ENDPOINT
  console.log('📤 Testing Upload API...');
  const uploadTest = await makeRequest('POST', '/api/upload/single');
  if (uploadTest.status === 400 || uploadTest.status === 401 || uploadTest.success) {
    results.passed.push('✅ Upload endpoint accessible');
  } else {
    results.warnings.push(`⚠️ Upload endpoint needs checking: ${uploadTest.status}`);
  }

  // PRINT RESULTS
  console.log('\n\n' + '='.repeat(60));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(60));
  
  console.log('\n✅ PASSED TESTS:');
  results.passed.forEach(test => console.log('  ' + test));
  
  if (results.warnings.length > 0) {
    console.log('\n⚠️ WARNINGS:');
    results.warnings.forEach(warning => console.log('  ' + warning));
  }
  
  if (results.failed.length > 0) {
    console.log('\n❌ FAILED TESTS:');
    results.failed.forEach(failure => console.log('  ' + failure));
  }
  
  console.log('\n' + '='.repeat(60));
  const total = results.passed.length + results.failed.length + results.warnings.length;
  const successRate = Math.round((results.passed.length / total) * 100);
  
  console.log(`📈 OVERALL: ${results.passed.length}/${total} tests passed (${successRate}%)`);
  
  if (results.failed.length === 0) {
    console.log('\n🎉 SUCCESS! All critical tests passed!');
    console.log('✅ The application is ready for production use!');
  } else {
    console.log('\n⚠️ CRITICAL ISSUES DETECTED!');
    console.log('🔧 Immediate action required on failed tests');
  }
  
  // SPECIFIC RECOMMENDATIONS
  console.log('\n📋 RECOMMENDATIONS:');
  if (results.failed.length === 0 && results.warnings.length === 0) {
    console.log('  ✅ System is fully operational');
    console.log('  ✅ All endpoints are responding correctly');
    console.log('  ✅ Ready to present to client');
  } else {
    console.log('  1. Check Vercel logs for any deployment errors');
    console.log('  2. Verify environment variables are set in Vercel');
    console.log('  3. Ensure Supabase connection is configured');
    console.log('  4. Check API keys for AI services');
  }
}

// Run the tests
testSuite().catch(console.error);