// Test script for local AI agent endpoints
const http = require('http');

const API_BASE = 'http://localhost:3001';

async function testAgent(endpoint, payload, description) {
  console.log(`\n🧪 Testing: ${description}`);
  console.log(`Endpoint: ${endpoint}`);
  
  return new Promise((resolve) => {
    const data = JSON.stringify(payload);
    
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: endpoint,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };
    
    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          console.log('✅ Success: Status', res.statusCode);
          try {
            const parsed = JSON.parse(responseData);
            console.log('📝 Response preview:', JSON.stringify(parsed).substring(0, 150) + '...');
          } catch (e) {
            console.log('📝 Response (non-JSON):', responseData.substring(0, 150) + '...');
          }
          resolve(true);
        } else {
          console.error(`❌ Failed: Status ${res.statusCode}`);
          console.error('Error:', responseData.substring(0, 200));
          resolve(false);
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Request Error:', error.message);
      resolve(false);
    });
    
    req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log('🚀 Starting Local AI Agent Tests\n');
  console.log('Testing against backend server on http://localhost:3001');
  
  const tests = [
    // Test main AI generation endpoint
    {
      endpoint: '/api/ai/generate-campaign',
      payload: {
        industry: 'Wealth Management',
        type: 'social',
        tone: 'professional',
        goal: 'Lead generation'
      },
      description: 'Generate Marketing Campaign'
    },
    
    // Test vision analysis
    {
      endpoint: '/api/vision/analyze',
      payload: {
        imageUrl: 'https://images.unsplash.com/photo-1560520653-9e0e4c89eb11',
        prompt: 'Describe this image for a wealth management context'
      },
      description: 'Vision Analysis'
    },
    
    // Test AI agents through backend proxy
    {
      endpoint: '/api/ai-agents/generate',
      payload: {
        type: 'talent_ticker',
        params: { date: new Date().toISOString() }
      },
      description: 'AI Agent - Generate Talent Ticker'
    },
    
    {
      endpoint: '/api/ai-agents/validate',
      payload: {
        content: 'Join our wealth management firm for guaranteed returns',
        type: 'marketing'
      },
      description: 'AI Agent - Validate Compliance'
    },
    
    {
      endpoint: '/api/ai-agents/visual',
      payload: {
        action: 'prompt',
        params: {
          description: 'Professional wealth advisor meeting',
          style: 'corporate'
        }
      },
      description: 'AI Agent - Visual Generation'
    },
    
    {
      endpoint: '/api/ai-agents/weekly',
      payload: {
        action: 'calendar',
        params: {
          startDate: new Date().toISOString(),
          theme: 'Q4 Planning'
        }
      },
      description: 'AI Agent - Weekly Calendar'
    }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    const result = await testAgent(test.endpoint, test.payload, test.description);
    if (result) passed++;
    else failed++;
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n📊 Test Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / tests.length) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! The AI agents are working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.');
  }
}

// Run tests
runTests().catch(console.error);