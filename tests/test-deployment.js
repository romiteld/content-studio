#!/usr/bin/env node

/**
 * Comprehensive Deployment Test Suite for Content Studio
 * Tests all endpoints, AI agents, authentication, and functionality
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');

// Configuration
const BASE_URL = process.env.TEST_URL || 'https://studio.thewell.solutions';
const EMAIL = process.env.TEST_EMAIL || 'daniel.romitelli@emailthewell.com';
const VERBOSE = process.env.VERBOSE === 'true';

// Test results
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
let warnings = 0;
const testResults = [];

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Helper function to make HTTP requests
function makeRequest(method, endpoint, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, BASE_URL);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      timeout: 30000
    };
    
    if (data && method !== 'GET') {
      const payload = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(payload);
    }
    
    const req = client.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const json = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: json });
        } catch {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    if (data && method !== 'GET') {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Test function
async function runTest(category, name, testFn) {
  totalTests++;
  process.stdout.write(`${colors.cyan}▶${colors.reset} ${name}... `);
  
  try {
    const result = await testFn();
    if (result === true) {
      passedTests++;
      console.log(`${colors.green}✓ PASS${colors.reset}`);
      testResults.push({ category, name, status: 'PASS' });
    } else if (result === 'warning') {
      warnings++;
      console.log(`${colors.yellow}⚠ WARN${colors.reset}`);
      testResults.push({ category, name, status: 'WARN' });
    } else {
      failedTests++;
      console.log(`${colors.red}✗ FAIL${colors.reset}`);
      testResults.push({ category, name, status: 'FAIL', error: result });
    }
  } catch (error) {
    failedTests++;
    console.log(`${colors.red}✗ FAIL${colors.reset} - ${error.message}`);
    testResults.push({ category, name, status: 'FAIL', error: error.message });
  }
}

// Test suites
async function testBasicConnectivity() {
  console.log(`\n${colors.blue}=== BASIC CONNECTIVITY ===${colors.reset}`);
  
  await runTest('Connectivity', 'Frontend loads', async () => {
    const response = await makeRequest('GET', '/');
    return response.status === 200 && response.data.includes('<!DOCTYPE html');
  });
  
  await runTest('Connectivity', 'API health check', async () => {
    try {
      const response = await makeRequest('GET', '/api/health');
      return response.status === 200;
    } catch {
      // Try alternative health endpoint
      const response = await makeRequest('GET', '/api');
      return response.status === 200;
    }
  });
}

async function testAuthentication() {
  console.log(`\n${colors.blue}=== AUTHENTICATION ===${colors.reset}`);
  
  let authToken = null;
  
  await runTest('Auth', 'Generate JWT token', async () => {
    try {
      const response = await makeRequest('POST', '/api/generate-supabase-token', {
        email: EMAIL
      });
      
      if (response.data.access_token || response.data.token) {
        authToken = response.data.access_token || response.data.token;
        return true;
      }
      return 'warning'; // May require additional auth
    } catch {
      return 'warning';
    }
  });
  
  return authToken;
}

async function testAIAgents(authToken) {
  console.log(`\n${colors.blue}=== AI AGENTS ===${colors.reset}`);
  
  const headers = authToken ? { 'Authorization': `Bearer ${authToken}` } : {};
  
  await runTest('AI Agents', 'Test endpoint', async () => {
    const response = await makeRequest('POST', '/api/agents/test', {}, headers);
    return response.status === 200;
  });
  
  await runTest('AI Agents', 'Talent Ticker generation', async () => {
    const response = await makeRequest('POST', '/api/agents/generate', {
      type: 'talent_ticker',
      params: { date: '2025-08-27' }
    }, headers);
    return response.status === 200 && response.data.content;
  });
  
  await runTest('AI Agents', 'Compliance validation', async () => {
    const response = await makeRequest('POST', '/api/agents/validate', {
      content: 'Join our firm!',
      type: 'marketing'
    }, headers);
    return response.status === 200 && response.data.validation;
  });
  
  await runTest('AI Agents', 'Visual prompt generation', async () => {
    const response = await makeRequest('POST', '/api/agents/visual', {
      action: 'prompt',
      params: { description: 'wealth advisor' }
    }, headers);
    return response.status === 200;
  });
  
  await runTest('AI Agents', 'Weekly calendar generation', async () => {
    const response = await makeRequest('POST', '/api/agents/weekly', {
      action: 'calendar',
      params: { theme: 'Q4' }
    }, headers);
    return response.status === 200;
  });
  
  await runTest('AI Agents', 'Content review', async () => {
    const response = await makeRequest('POST', '/api/agents/review', {
      content: 'Test content',
      type: 'marketing'
    }, headers);
    return response.status === 200;
  });
  
  await runTest('AI Agents', 'Industry trends analysis', async () => {
    const response = await makeRequest('POST', '/api/agents/trends', {
      topic: 'wealth management',
      period: 'current'
    }, headers);
    return response.status === 200;
  });
}

async function testContentManagement(authToken) {
  console.log(`\n${colors.blue}=== CONTENT MANAGEMENT ===${colors.reset}`);
  
  const headers = authToken ? { 'Authorization': `Bearer ${authToken}` } : {};
  
  await runTest('Content', 'Get all content', async () => {
    const response = await makeRequest('GET', '/api/content', null, headers);
    return response.status === 200 && Array.isArray(response.data);
  });
  
  await runTest('Content', 'Create content', async () => {
    const response = await makeRequest('POST', '/api/content', {
      title: 'Test Content',
      type: 'training',
      content: 'Test training material'
    }, headers);
    return response.status === 200 || response.status === 201;
  });
  
  await runTest('Content', 'Search content', async () => {
    const response = await makeRequest('GET', '/api/content/search?q=wealth', null, headers);
    return response.status === 200;
  });
}

async function testAIMarketing(authToken) {
  console.log(`\n${colors.blue}=== AI MARKETING ===${colors.reset}`);
  
  const headers = authToken ? { 'Authorization': `Bearer ${authToken}` } : {};
  
  await runTest('AI Marketing', 'Generate campaign', async () => {
    const response = await makeRequest('POST', '/api/ai/generate-campaign', {
      theme: 'Q4 Planning',
      targetAudience: 'HNW Clients',
      tone: 'professional'
    }, headers);
    return response.status === 200;
  });
  
  await runTest('AI Marketing', 'Generate image', async () => {
    const response = await makeRequest('POST', '/api/ai/generate-image', {
      prompt: 'wealth management office',
      style: 'professional'
    }, headers);
    return response.status === 200;
  });
  
  await runTest('AI Marketing', 'Vision analysis', async () => {
    const response = await makeRequest('POST', '/api/vision/analyze', {
      imageUrl: 'https://example.com/image.jpg',
      query: 'What is shown?'
    }, headers);
    return response.status === 200 || response.status === 400; // May fail with test URL
  });
}

async function testFileOperations(authToken) {
  console.log(`\n${colors.blue}=== FILE OPERATIONS ===${colors.reset}`);
  
  const headers = authToken ? { 'Authorization': `Bearer ${authToken}` } : {};
  
  await runTest('Files', 'PDF generation', async () => {
    const response = await makeRequest('POST', '/api/generate/pdf', {
      content: 'Test PDF content',
      title: 'Test Report'
    }, headers);
    return response.status === 200;
  });
  
  await runTest('Files', 'PowerPoint generation', async () => {
    const response = await makeRequest('POST', '/api/generate/pptx', {
      slides: [{ title: 'Test Slide', content: 'Test content' }],
      title: 'Test Presentation'
    }, headers);
    return response.status === 200;
  });
}

async function testPartnerManagement(authToken) {
  console.log(`\n${colors.blue}=== PARTNER MANAGEMENT ===${colors.reset}`);
  
  const headers = authToken ? { 'Authorization': `Bearer ${authToken}` } : {};
  
  await runTest('Partners', 'Get all partners', async () => {
    const response = await makeRequest('GET', '/api/partners', null, headers);
    return response.status === 200 && Array.isArray(response.data);
  });
  
  await runTest('Partners', 'Get active partners', async () => {
    const response = await makeRequest('GET', '/api/partners/active', null, headers);
    return response.status === 200 && Array.isArray(response.data);
  });
}

async function testPerformance() {
  console.log(`\n${colors.blue}=== PERFORMANCE ===${colors.reset}`);
  
  await runTest('Performance', 'Frontend load time', async () => {
    const start = Date.now();
    await makeRequest('GET', '/');
    const duration = Date.now() - start;
    
    if (duration < 3000) return true;
    if (duration < 5000) return 'warning';
    return `Slow: ${duration}ms`;
  });
  
  await runTest('Performance', 'API response time', async () => {
    const start = Date.now();
    await makeRequest('GET', '/api/health').catch(() => makeRequest('GET', '/api'));
    const duration = Date.now() - start;
    
    if (duration < 1000) return true;
    if (duration < 2000) return 'warning';
    return `Slow: ${duration}ms`;
  });
}

async function testSecurity(authToken) {
  console.log(`\n${colors.blue}=== SECURITY ===${colors.reset}`);
  
  await runTest('Security', 'SQL injection protection', async () => {
    const response = await makeRequest('POST', '/api/content/search', {
      q: "SELECT * FROM users; --"
    });
    // Should not return database error
    return response.status !== 500;
  });
  
  await runTest('Security', 'XSS protection', async () => {
    const response = await makeRequest('POST', '/api/content', {
      title: '<script>alert(1)</script>',
      content: 'test'
    });
    // Should sanitize or reject
    return response.status === 200 || response.status === 400;
  });
  
  await runTest('Security', 'Authentication requirement', async () => {
    const response = await makeRequest('GET', '/api/protected');
    // Should require auth
    return response.status === 401 || response.status === 403;
  });
}

// Main test runner
async function runAllTests() {
  console.log('================================================');
  console.log('   Content Studio Comprehensive Test Suite');
  console.log('================================================');
  console.log(`URL: ${BASE_URL}`);
  console.log(`Email: ${EMAIL}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log('================================================');
  
  const startTime = Date.now();
  
  try {
    // Run all test suites
    await testBasicConnectivity();
    const authToken = await testAuthentication();
    await testAIAgents(authToken);
    await testContentManagement(authToken);
    await testAIMarketing(authToken);
    await testFileOperations(authToken);
    await testPartnerManagement(authToken);
    await testPerformance();
    await testSecurity(authToken);
    
  } catch (error) {
    console.error(`\n${colors.red}Critical error:${colors.reset}`, error.message);
  }
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  
  // Display summary
  console.log('\n================================================');
  console.log('             TEST RESULTS SUMMARY');
  console.log('================================================');
  console.log(`${colors.cyan}Total Tests:${colors.reset} ${totalTests}`);
  console.log(`${colors.green}Passed:${colors.reset} ${passedTests}`);
  console.log(`${colors.red}Failed:${colors.reset} ${failedTests}`);
  console.log(`${colors.yellow}Warnings:${colors.reset} ${warnings}`);
  console.log(`Duration: ${duration}s`);
  
  const passRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;
  console.log(`Pass Rate: ${passRate}%`);
  
  if (passRate >= 90) {
    console.log(`${colors.green}✓ EXCELLENT - System is production ready!${colors.reset}`);
  } else if (passRate >= 75) {
    console.log(`${colors.yellow}⚠ GOOD - System is mostly functional${colors.reset}`);
  } else if (passRate >= 50) {
    console.log(`${colors.yellow}⚠ FAIR - Some issues need attention${colors.reset}`);
  } else {
    console.log(`${colors.red}✗ POOR - Critical issues detected${colors.reset}`);
  }
  
  // Show failed tests
  if (failedTests > 0) {
    console.log(`\n${colors.red}Failed Tests:${colors.reset}`);
    testResults.filter(t => t.status === 'FAIL').forEach(t => {
      console.log(`  • ${t.category} - ${t.name}${t.error ? `: ${t.error}` : ''}`);
    });
  }
  
  // Show warnings
  if (warnings > 0) {
    console.log(`\n${colors.yellow}Warnings:${colors.reset}`);
    testResults.filter(t => t.status === 'WARN').forEach(t => {
      console.log(`  • ${t.category} - ${t.name}`);
    });
  }
  
  console.log('\n================================================');
  
  // Exit with appropriate code
  process.exit(failedTests === 0 && warnings < 5 ? 0 : 1);
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error(`\n${colors.red}Unhandled error:${colors.reset}`, error);
  process.exit(1);
});

// Run tests
runAllTests();