const https = require('https');
const fs = require('fs');

const BASE_URL = 'https://studio.thewell.solutions';

// Color codes for output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m'
};

// Test endpoints configuration
const endpoints = [
  // Frontend
  { method: 'GET', path: '/', name: 'Frontend Home' },
  
  // Health checks
  { method: 'GET', path: '/api/health', name: 'API Health' },
  
  // AI Chat
  { method: 'POST', path: '/api/ai-chat', name: 'AI Chat', 
    body: { message: 'Hello test', model: 'gemini-2.0-flash-exp' } },
  
  // Authentication
  { method: 'POST', path: '/api/auth/register', name: 'Auth Register',
    body: { email: 'test@example.com', password: 'Test123!', username: 'testuser' } },
  { method: 'POST', path: '/api/auth/login', name: 'Auth Login',
    body: { email: 'test@example.com', password: 'Test123!' } },
  { method: 'POST', path: '/api/auth/logout', name: 'Auth Logout' },
  { method: 'GET', path: '/api/auth/session', name: 'Auth Session' },
  
  // Content Management
  { method: 'GET', path: '/api/content', name: 'Get Content' },
  { method: 'POST', path: '/api/content', name: 'Create Content',
    body: { title: 'Test', content: 'Test content', type: 'article' } },
  
  // Templates
  { method: 'GET', path: '/api/templates', name: 'Get Templates' },
  { method: 'POST', path: '/api/templates', name: 'Create Template',
    body: { name: 'Test Template', content: 'Template content' } },
  
  // AI Image Generation  
  { method: 'POST', path: '/api/ai-image', name: 'AI Image Generation',
    body: { prompt: 'A beautiful sunset' } },
  
  // PDF Generation
  { method: 'POST', path: '/api/generate-pdf', name: 'PDF Generation',
    body: { content: 'Test PDF content', title: 'Test Document' } },
  
  // Marketing AI
  { method: 'POST', path: '/api/ai-marketing/analyze', name: 'Marketing Analysis',
    body: { content: 'Analyze this marketing content' } },
  
  // Brand Management
  { method: 'GET', path: '/api/brand', name: 'Get Brand Settings' },
  { method: 'POST', path: '/api/brand', name: 'Update Brand',
    body: { name: 'Test Brand', colors: ['#000000'] } },
  
  // Research
  { method: 'POST', path: '/api/research/search', name: 'Research Search',
    body: { query: 'test search' } },
  
  // Social Media
  { method: 'POST', path: '/api/social/optimize', name: 'Social Optimize',
    body: { content: 'Test social content', platform: 'twitter' } },
  
  // Vision API
  { method: 'POST', path: '/api/vision/analyze', name: 'Vision Analysis',
    body: { imageUrl: 'https://example.com/image.jpg' } }
];

// Function to test a single endpoint
function testEndpoint(endpoint) {
  return new Promise((resolve) => {
    const url = new URL(BASE_URL + endpoint.path);
    const options = {
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 10000
    };

    const startTime = Date.now();
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const duration = Date.now() - startTime;
        const result = {
          name: endpoint.name,
          path: endpoint.path,
          method: endpoint.method,
          status: res.statusCode,
          success: res.statusCode >= 200 && res.statusCode < 400,
          duration: duration,
          response: data.substring(0, 100)
        };
        resolve(result);
      });
    });

    req.on('error', (error) => {
      resolve({
        name: endpoint.name,
        path: endpoint.path,
        method: endpoint.method,
        status: 0,
        success: false,
        error: error.message,
        duration: Date.now() - startTime
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        name: endpoint.name,
        path: endpoint.path,
        method: endpoint.method,
        status: 0,
        success: false,
        error: 'Request timeout',
        duration: 10000
      });
    });

    if (endpoint.body) {
      req.write(JSON.stringify(endpoint.body));
    }
    req.end();
  });
}

// Run all tests in parallel
async function runAllTests() {
  console.log('\\n🚀 Starting Comprehensive Endpoint Testing\\n');
  console.log('Testing URL:', BASE_URL);
  console.log('Total endpoints:', endpoints.length);
  console.log('\\n' + '='.repeat(80) + '\\n');

  // Run all tests in parallel
  const results = await Promise.all(endpoints.map(testEndpoint));
  
  // Categorize results
  const working = results.filter(r => r.success);
  const broken = results.filter(r => !r.success);
  const broken405 = broken.filter(r => r.status === 405);
  const broken500 = broken.filter(r => r.status >= 500);
  const brokenOther = broken.filter(r => r.status !== 405 && r.status < 500);
  
  // Display results
  console.log('\\n📊 TEST RESULTS SUMMARY\\n');
  console.log(`✅ Working: ${colors.green}${working.length}/${endpoints.length}${colors.reset}`);
  console.log(`❌ Broken: ${colors.red}${broken.length}/${endpoints.length}${colors.reset}`);
  
  if (broken405.length > 0) {
    console.log(`   - 405 Method Not Allowed: ${colors.yellow}${broken405.length}${colors.reset}`);
  }
  if (broken500.length > 0) {
    console.log(`   - 500 Server Errors: ${colors.yellow}${broken500.length}${colors.reset}`);
  }
  if (brokenOther.length > 0) {
    console.log(`   - Other Errors: ${colors.yellow}${brokenOther.length}${colors.reset}`);
  }
  
  // Detailed breakdown
  console.log('\\n' + '='.repeat(80));
  console.log('\\n✅ WORKING ENDPOINTS:\\n');
  working.forEach(r => {
    console.log(`  ${colors.green}✓${colors.reset} ${r.method} ${r.path} - ${r.name} (${r.duration}ms)`);
  });
  
  if (broken.length > 0) {
    console.log('\\n❌ BROKEN ENDPOINTS:\\n');
    broken.forEach(r => {
      const errorMsg = r.error || `HTTP ${r.status}`;
      console.log(`  ${colors.red}✗${colors.reset} ${r.method} ${r.path} - ${r.name}`);
      console.log(`    Error: ${errorMsg}`);
      if (r.response) {
        console.log(`    Response: ${r.response}`);
      }
    });
  }
  
  // Action items
  if (broken.length > 0) {
    console.log('\\n🔧 REQUIRED FIXES:\\n');
    
    if (broken405.length > 0) {
      console.log(`${colors.yellow}1. Fix 405 Errors (${broken405.length} endpoints):${colors.reset}`);
      console.log('   - Create individual API handler files in /api directory');
      console.log('   - Ensure each handler exports a function that handles req/res');
      console.log('   - Check CORS headers are properly set\\n');
    }
    
    if (broken500.length > 0) {
      console.log(`${colors.yellow}2. Fix Server Errors (${broken500.length} endpoints):${colors.reset}`);
      console.log('   - Check environment variables are set in Vercel');
      console.log('   - Verify database connections');
      console.log('   - Check for missing dependencies\\n');
    }
    
    if (brokenOther.length > 0) {
      console.log(`${colors.yellow}3. Fix Other Issues (${brokenOther.length} endpoints):${colors.reset}`);
      brokenOther.forEach(r => {
        console.log(`   - ${r.name}: ${r.error || `HTTP ${r.status}`}`);
      });
    }
  } else {
    console.log('\\n🎉 ALL ENDPOINTS ARE WORKING! 🎉\\n');
  }
  
  console.log('\\n' + '='.repeat(80) + '\\n');
  
  // Save results to file
  const report = {
    timestamp: new Date().toISOString(),
    url: BASE_URL,
    summary: {
      total: endpoints.length,
      working: working.length,
      broken: broken.length,
      success_rate: `${((working.length / endpoints.length) * 100).toFixed(1)}%`
    },
    working_endpoints: working.map(r => ({ 
      name: r.name, 
      path: r.path, 
      method: r.method,
      duration: r.duration 
    })),
    broken_endpoints: broken.map(r => ({ 
      name: r.name, 
      path: r.path, 
      method: r.method,
      status: r.status,
      error: r.error || r.response 
    }))
  };
  
  fs.writeFileSync('test-results.json', JSON.stringify(report, null, 2));
  console.log('📄 Full report saved to test-results.json\\n');
  
  process.exit(broken.length > 0 ? 1 : 0);
}

// Run the tests
runAllTests().catch(console.error);