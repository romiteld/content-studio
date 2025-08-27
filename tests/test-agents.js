// Test script for AI agent endpoints
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3000/api/agents';

async function testAgent(endpoint, payload, description) {
  console.log(`\n🧪 Testing: ${description}`);
  console.log(`Endpoint: ${endpoint}`);
  console.log(`Payload:`, JSON.stringify(payload, null, 2));
  
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error(`❌ HTTP ${response.status}: ${error}`);
      return false;
    }
    
    // Check if it's a streaming response
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/event-stream')) {
      console.log('✅ Streaming response received');
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        // Just show first chunk to confirm streaming works
        if (buffer.length > 100) {
          console.log('📝 First chunk:', buffer.substring(0, 100) + '...');
          break;
        }
      }
      return true;
    }
    
    const data = await response.json();
    console.log('✅ Success:', JSON.stringify(data, null, 2).substring(0, 200) + '...');
    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting AI Agent Tests\n');
  console.log('Note: These tests will use the deployed Vercel functions');
  
  const tests = [
    // Generate Agent Tests
    {
      endpoint: '/generate',
      payload: {
        type: 'talent_ticker',
        params: { date: new Date().toISOString() }
      },
      description: 'Generate Talent Ticker (streaming)'
    },
    {
      endpoint: '/generate',
      payload: {
        type: 'partner_spotlight',
        params: { 
          firmName: 'Test Wealth Partners',
          firmData: { location: 'NYC', specialty: 'UHNW' }
        }
      },
      description: 'Generate Partner Spotlight'
    },
    {
      endpoint: '/generate',
      payload: {
        type: 'career_guide',
        params: { 
          topic: 'Transitioning to RIA',
          audience: 'Senior Advisors'
        }
      },
      description: 'Generate Career Guide'
    },
    
    // Validate Agent Tests
    {
      endpoint: '/validate',
      payload: {
        content: 'Join our top-performing wealth management firm with guaranteed 200% returns!',
        type: 'marketing'
      },
      description: 'Validate Compliance (should flag issues)'
    },
    
    // Visual Agent Tests
    {
      endpoint: '/visual',
      payload: {
        action: 'specs',
        params: {
          contentType: 'LinkedIn Carousel',
          context: { topic: 'Q4 Market Trends' }
        }
      },
      description: 'Generate Visual Specifications'
    },
    {
      endpoint: '/visual',
      payload: {
        action: 'prompt',
        params: {
          description: 'Professional wealth advisor consulting with client',
          style: 'modern corporate'
        }
      },
      description: 'Generate Image Prompt'
    },
    
    // Weekly Agent Tests
    {
      endpoint: '/weekly',
      payload: {
        action: 'calendar',
        params: {
          startDate: new Date().toISOString(),
          theme: 'Year-End Planning'
        }
      },
      description: 'Generate Weekly Calendar'
    },
    {
      endpoint: '/weekly',
      payload: {
        action: 'batch',
        params: {
          topics: [
            'Tax-loss harvesting strategies',
            'RIA growth trends 2025',
            'Succession planning tips'
          ]
        }
      },
      description: 'Batch Generate Content'
    },
    {
      endpoint: '/weekly',
      payload: {
        action: 'stream',
        params: {
          topic: 'Digital transformation in wealth management'
        }
      },
      description: 'Stream Weekly Plan'
    }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    const result = await testAgent(test.endpoint, test.payload, test.description);
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
    console.log('\n🎉 All tests passed! The AI agents are working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.');
  }
}

// Run tests
runTests().catch(console.error);