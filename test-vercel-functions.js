// Direct test for Vercel AI agent functions
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Mock Vercel request/response for local testing
class MockRequest {
  constructor(body, method = 'POST') {
    this.body = body;
    this.method = method;
  }
  
  async json() {
    return this.body;
  }
}

class MockResponse {
  constructor() {
    this.data = null;
    this.statusCode = 200;
    this.headers = {};
  }
  
  setHeader(key, value) {
    this.headers[key] = value;
  }
  
  status(code) {
    this.statusCode = code;
    return this;
  }
  
  json(data) {
    this.data = data;
    return this;
  }
  
  end() {
    return this;
  }
}

async function testAgentFunction(functionPath, payload, description) {
  console.log(`\n🧪 Testing: ${description}`);
  console.log(`Function: ${functionPath}`);
  
  try {
    // Clear module cache to get fresh import
    delete require.cache[require.resolve(functionPath)];
    
    // Import the function
    const handler = require(functionPath);
    
    // Create mock request and response
    const req = new MockRequest(payload);
    const res = new MockResponse();
    
    // Call the handler
    await handler(req, res);
    
    if (res.statusCode === 200) {
      console.log('✅ Success');
      console.log('📝 Response:', JSON.stringify(res.data).substring(0, 200) + '...');
      return true;
    } else {
      console.error(`❌ Failed with status ${res.statusCode}`);
      console.error('Error:', res.data);
      return false;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Testing Vercel AI Agent Functions Locally\n');
  console.log('Using Google AI API Key:', process.env.GOOGLE_AI_API_KEY ? '✅ Set' : '❌ Missing');
  
  if (!process.env.GOOGLE_AI_API_KEY) {
    console.error('\n❌ GOOGLE_AI_API_KEY not found in environment!');
    console.error('Please ensure .env.local file contains GOOGLE_AI_API_KEY');
    return;
  }
  
  const tests = [
    {
      function: './api/agents/generate.js',
      payload: {
        type: 'talent_ticker',
        params: { date: '2025-08-27' }
      },
      description: 'Generate Talent Ticker'
    },
    {
      function: './api/agents/generate.js',
      payload: {
        type: 'partner_spotlight',
        params: { 
          firmName: 'Test Wealth Partners',
          firmData: { location: 'NYC' }
        }
      },
      description: 'Generate Partner Spotlight'
    },
    {
      function: './api/agents/validate.js',
      payload: {
        content: 'Join our firm for guaranteed returns!',
        type: 'marketing'
      },
      description: 'Validate Compliance'
    },
    {
      function: './api/agents/visual.js',
      payload: {
        action: 'prompt',
        params: {
          description: 'Wealth advisor meeting',
          style: 'professional'
        }
      },
      description: 'Generate Visual Prompt'
    },
    {
      function: './api/agents/weekly.js',
      payload: {
        action: 'calendar',
        params: {
          startDate: '2025-08-27',
          theme: 'Q4 Planning'
        }
      },
      description: 'Generate Weekly Calendar'
    }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    const result = await testAgentFunction(test.function, test.payload, test.description);
    if (result) passed++;
    else failed++;
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n📊 Test Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / tests.length) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! The Vercel AI functions are ready.');
    console.log('You can now deploy to Vercel with confidence.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.');
    console.log('The functions may not work correctly when deployed.');
  }
}

// Run tests
runTests().catch(console.error);