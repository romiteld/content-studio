#!/usr/bin/env node
const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:3001';
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'TestPassword123!';

let authToken = null;
let testResults = [];

// Color codes for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

async function testEndpoint(name, method, path, data = null, requiresAuth = true) {
  try {
    const config = {
      method,
      url: `${API_URL}${path}`,
      headers: {}
    };

    if (requiresAuth && authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    console.log(`${colors.green}✓${colors.reset} ${name}: ${response.status}`);
    testResults.push({ name, status: 'PASS', code: response.status });
    return response.data;
  } catch (error) {
    const status = error.response?.status || 'ERROR';
    const message = error.response?.data?.error || error.message;
    console.log(`${colors.red}✗${colors.reset} ${name}: ${status} - ${message}`);
    testResults.push({ name, status: 'FAIL', code: status, error: message });
    return null;
  }
}

async function runTests() {
  console.log(`\n${colors.blue}=== Testing Wealth Management API Endpoints ===${colors.reset}\n`);
  console.log(`API URL: ${API_URL}\n`);

  // 1. Health Check (no auth required)
  console.log(`${colors.yellow}Testing Basic Endpoints:${colors.reset}`);
  await testEndpoint('Health Check', 'GET', '/api/health', null, false);
  await testEndpoint('Brand Config', 'GET', '/api/brand-config', null, false);

  // 2. Authentication
  console.log(`\n${colors.yellow}Testing Authentication:${colors.reset}`);
  const signupData = await testEndpoint('Signup', 'POST', '/api/auth/signup', {
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    full_name: 'Test User'
  }, false);

  if (!signupData) {
    // Try login if signup fails (user might exist)
    const loginData = await testEndpoint('Login', 'POST', '/api/auth/login', {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    }, false);
    
    if (loginData?.access_token) {
      authToken = loginData.access_token;
    }
  } else if (signupData?.access_token) {
    authToken = signupData.access_token;
  }

  if (authToken) {
    console.log(`${colors.green}Authentication successful!${colors.reset}`);
    
    // Test protected endpoints
    await testEndpoint('Get Profile', 'GET', '/api/auth/profile');
    
    // 3. Content Management
    console.log(`\n${colors.yellow}Testing Content Management:${colors.reset}`);
    await testEndpoint('Get All Content', 'GET', '/api/content');
    
    const contentData = await testEndpoint('Create Content', 'POST', '/api/content', {
      title: 'Test Content ' + Date.now(),
      type: 'presentation',
      category: 'wealth-fundamentals',
      content_data: { slides: [] }
    });
    
    if (contentData?.id) {
      await testEndpoint('Get Single Content', 'GET', `/api/content/${contentData.id}`);
      await testEndpoint('Update Content', 'PUT', `/api/content/${contentData.id}`, {
        title: 'Updated Test Content'
      });
      await testEndpoint('Delete Content', 'DELETE', `/api/content/${contentData.id}`);
    }

    // 4. Templates
    console.log(`\n${colors.yellow}Testing Templates:${colors.reset}`);
    await testEndpoint('Get Templates', 'GET', '/api/templates');

    // 5. Partners
    console.log(`\n${colors.yellow}Testing Partners:${colors.reset}`);
    await testEndpoint('Get Partners', 'GET', '/api/partners');
    await testEndpoint('Get Active Partners', 'GET', '/api/partners/active');

    // 6. AI Agents
    console.log(`\n${colors.yellow}Testing AI Agents:${colors.reset}`);
    await testEndpoint('Generate Content Agent', 'POST', '/api/agents/generate', {
      prompt: 'Test prompt',
      category: 'test'
    });
    
    await testEndpoint('Weekly Content Agent', 'POST', '/api/agents/weekly', {
      weekNumber: 1,
      theme: 'test'
    });
    
    await testEndpoint('Validate Compliance', 'POST', '/api/agents/validate', {
      content: 'Test content to validate'
    });

    // 7. Research
    console.log(`\n${colors.yellow}Testing Research:${colors.reset}`);
    await testEndpoint('Search Research', 'POST', '/api/research/search', {
      query: 'wealth management'
    });

    // 8. Social Media
    console.log(`\n${colors.yellow}Testing Social Media:${colors.reset}`);
    await testEndpoint('Optimize for Social', 'POST', '/api/social/optimize', {
      content: 'Test content',
      platform: 'linkedin'
    });

    // 9. Brand Protection
    console.log(`\n${colors.yellow}Testing Brand Protection:${colors.reset}`);
    await testEndpoint('Get Brand Protection Log', 'GET', '/api/brand/protection-log');

  } else {
    console.log(`${colors.red}Authentication failed - skipping protected endpoints${colors.reset}`);
  }

  // Print summary
  console.log(`\n${colors.blue}=== Test Summary ===${colors.reset}`);
  const passed = testResults.filter(r => r.status === 'PASS').length;
  const failed = testResults.filter(r => r.status === 'FAIL').length;
  
  console.log(`Total: ${testResults.length} | ${colors.green}Passed: ${passed}${colors.reset} | ${colors.red}Failed: ${failed}${colors.reset}`);
  
  if (failed > 0) {
    console.log(`\n${colors.red}Failed Tests:${colors.reset}`);
    testResults.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`  - ${r.name}: ${r.code} - ${r.error}`);
    });
  }

  process.exit(failed > 0 ? 1 : 0);
}

// Check if axios is installed
try {
  require.resolve('axios');
  runTests().catch(console.error);
} catch(e) {
  console.log('Installing axios...');
  require('child_process').execSync('npm install axios', { stdio: 'inherit' });
  runTests().catch(console.error);
}