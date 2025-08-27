const http = require('http');

const API_URL = 'http://localhost:3001';

function testRoute(path, method = 'GET') {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log(`[${res.statusCode}] ${method} ${path}: ${res.statusCode < 400 ? '✓' : '✗'}`);
        resolve({ status: res.statusCode, path });
      });
    });

    req.on('error', (error) => {
      console.log(`[ERROR] ${method} ${path}: ${error.message}`);
      resolve({ status: 'ERROR', path, error: error.message });
    });

    req.end();
  });
}

async function runTests() {
  console.log('\n=== Testing Basic Routes ===\n');

  const routes = [
    { path: '/api/health', method: 'GET' },
    { path: '/api/brand-config', method: 'GET' },
    { path: '/api/auth/login', method: 'GET' },
    { path: '/api/auth/validate', method: 'GET' },
    { path: '/api/content', method: 'GET' },
    { path: '/api/templates', method: 'GET' },
    { path: '/api/partners', method: 'GET' },
    { path: '/api/research/search', method: 'GET' },
    { path: '/api/social/optimize', method: 'GET' },
    { path: '/api/agents/generate', method: 'GET' },
    { path: '/api/brand/protection-log', method: 'GET' }
  ];

  const results = [];
  for (const route of routes) {
    const result = await testRoute(route.path, route.method);
    results.push(result);
  }

  console.log('\n=== Summary ===');
  const successful = results.filter(r => r.status && r.status < 400).length;
  const authRequired = results.filter(r => r.status === 401).length;
  const notFound = results.filter(r => r.status === 404).length;
  const errors = results.filter(r => r.status === 'ERROR').length;
  
  console.log(`✓ Successful: ${successful}`);
  console.log(`🔒 Auth Required (401): ${authRequired}`);
  console.log(`❌ Not Found (404): ${notFound}`);
  console.log(`⚠️ Errors: ${errors}`);

  if (authRequired > 0) {
    console.log('\nRoutes requiring authentication:');
    results.filter(r => r.status === 401).forEach(r => {
      console.log(`  - ${r.path}`);
    });
  }

  if (notFound > 0) {
    console.log('\nRoutes not found:');
    results.filter(r => r.status === 404).forEach(r => {
      console.log(`  - ${r.path}`);
    });
  }
}

runTests();