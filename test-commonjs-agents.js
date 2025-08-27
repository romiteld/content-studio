// Test CommonJS agent functions locally
require('dotenv').config({ path: '.env.local' });

async function testAgent(handler, payload, description) {
  console.log(`\n🧪 Testing: ${description}`);
  
  // Mock request and response objects
  const req = {
    method: 'POST',
    body: payload
  };
  
  const res = {
    statusCode: 200,
    headers: {},
    data: null,
    
    setHeader(key, value) {
      this.headers[key] = value;
      return this;
    },
    
    status(code) {
      this.statusCode = code;
      return this;
    },
    
    json(data) {
      this.data = data;
      console.log('✅ Response:', JSON.stringify(data).substring(0, 200) + '...');
      return this;
    },
    
    write(chunk) {
      // Handle streaming
      if (!this.data) this.data = '';
      this.data += chunk;
      return this;
    },
    
    end(data) {
      if (data) this.data = data;
      if (this.statusCode === 200) {
        console.log('✅ Success');
      }
      return this;
    }
  };
  
  try {
    await handler(req, res);
    return res.statusCode === 200;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Testing CommonJS Agent Functions\n');
  console.log('Environment Check:');
  console.log('- GOOGLE_AI_API_KEY:', process.env.GOOGLE_AI_API_KEY ? '✅ Set' : '❌ Missing');
  
  if (!process.env.GOOGLE_AI_API_KEY) {
    console.error('\n⚠️  GOOGLE_AI_API_KEY not found!');
    return;
  }
  
  const tests = [
    {
      handler: require('./api/agents/test.js'),
      payload: {},
      description: 'Test Endpoint'
    },
    {
      handler: require('./api/agents/generate.js'),
      payload: {
        type: 'talent_ticker',
        params: { date: '2025-08-27' }
      },
      description: 'Generate - Talent Ticker'
    },
    {
      handler: require('./api/agents/validate.js'),
      payload: {
        content: 'Join our wealth management firm!',
        type: 'marketing'
      },
      description: 'Validate - Compliance Check'
    },
    {
      handler: require('./api/agents/visual.js'),
      payload: {
        action: 'prompt',
        params: {
          description: 'Wealth advisor meeting',
          style: 'professional'
        }
      },
      description: 'Visual - Image Prompt'
    },
    {
      handler: require('./api/agents/weekly.js'),
      payload: {
        action: 'batch',
        params: {
          topics: ['Tax planning', 'Estate planning']
        }
      },
      description: 'Weekly - Batch Content'
    }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    const result = await testAgent(test.handler, test.payload, test.description);
    if (result) passed++;
    else failed++;
    
    // Small delay
    await new Promise(r => setTimeout(r, 500));
  }
  
  console.log('\n📊 Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / tests.length) * 100).toFixed(1)}%`);
}

runTests().catch(console.error);