const https = require('https');
const fs = require('fs');

const BASE_URL = 'https://studio.thewell.solutions';

// Colors for output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

// Test cases for AI capabilities
const aiTests = [
  {
    name: '🤖 AI Chat - General Conversation',
    endpoint: '/api/ai-chat',
    method: 'POST',
    body: {
      message: "What are the key benefits of using AI in marketing?",
      model: "gemini-2.0-flash-exp"
    }
  },
  {
    name: '🎨 Image Generation - Product Photo',
    endpoint: '/api/ai-image',
    method: 'POST',
    body: {
      prompt: "A sleek modern smartphone on a marble surface with dramatic lighting",
      model: "dalle-3",
      style: "photorealistic"
    }
  },
  {
    name: '📊 Marketing Analysis - Social Media Post',
    endpoint: '/api/ai-marketing/analyze',
    method: 'POST',
    body: {
      content: "🚀 Launching our new AI-powered content studio! Create stunning visuals, analyze your marketing performance, and generate engaging content - all in one platform. Join thousands of creators who are already transforming their content game. Sign up today and get 30% off your first month! #ContentCreation #AI #MarketingTools",
      type: "social_media",
      targetAudience: "Digital marketers and content creators",
      goals: "Drive sign-ups and increase brand awareness"
    }
  },
  {
    name: '👁️ Vision Analysis - Image Description',
    endpoint: '/api/vision/analyze',
    method: 'POST',
    body: {
      imageUrl: "https://images.unsplash.com/photo-1555421689-491a97ff2040?w=800",
      prompt: "Analyze this workspace image and describe what makes it productive"
    }
  },
  {
    name: '📄 PDF Generation - Marketing Report',
    endpoint: '/api/generate-pdf',
    method: 'POST',
    body: {
      title: "Q4 2025 Marketing Performance Report",
      content: "Our marketing efforts this quarter focused on AI-driven content creation and social media engagement. We saw a 45% increase in user engagement and 30% growth in conversions.",
      template: "professional",
      format: "pdf"
    }
  },
  {
    name: '🎯 Marketing Analysis - Email Campaign',
    endpoint: '/api/ai-marketing/analyze',
    method: 'POST',
    body: {
      content: "Subject: Your exclusive invitation to revolutionize your content strategy\n\nDear [Name],\n\nAre you tired of spending hours creating content that doesn't convert? Our AI-powered Content Studio is here to change that. With advanced AI tools, you can create, analyze, and optimize content in minutes, not hours.\n\nClick here to start your free trial and see the difference AI can make.",
      type: "email",
      targetAudience: "B2B SaaS customers",
      goals: "Increase free trial signups"
    }
  },
  {
    name: '🖼️ Image Enhancement Prompt',
    endpoint: '/api/ai-image',
    method: 'POST',
    body: {
      prompt: "A minimalist logo for a tech startup",
      model: "dalle-3",
      aspectRatio: "1:1",
      style: "minimal"
    }
  },
  {
    name: '💬 AI Chat - Technical Question',
    endpoint: '/api/ai-chat',
    method: 'POST',
    body: {
      message: "Explain how to implement real-time collaboration features in a web application",
      model: "gemini-2.0-flash-exp"
    }
  },
  {
    name: '📈 Social Media Optimization',
    endpoint: '/api/social/optimize',
    method: 'POST',
    body: {
      content: "Check out our new AI-powered content creation platform that helps you create amazing content faster than ever before!",
      platform: "twitter"
    }
  },
  {
    name: '🔍 Research Search',
    endpoint: '/api/research/search',
    method: 'POST',
    body: {
      query: "latest trends in AI content generation 2025"
    }
  }
];

// Function to make API request
function testAIEndpoint(test) {
  return new Promise((resolve) => {
    const url = new URL(BASE_URL + test.endpoint);
    const postData = JSON.stringify(test.body);
    
    const options = {
      method: test.method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 30000
    };

    const startTime = Date.now();
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const duration = Date.now() - startTime;
        try {
          const response = JSON.parse(data);
          resolve({
            name: test.name,
            success: res.statusCode >= 200 && res.statusCode < 400,
            status: res.statusCode,
            duration: duration,
            response: response,
            hasAIResponse: !!(response.response || response.analysis || response.enhancedPrompt || response.formattedContent)
          });
        } catch (e) {
          resolve({
            name: test.name,
            success: false,
            status: res.statusCode,
            duration: duration,
            error: 'Invalid JSON response',
            rawResponse: data.substring(0, 200)
          });
        }
      });
    });

    req.on('error', (error) => {
      resolve({
        name: test.name,
        success: false,
        error: error.message,
        duration: Date.now() - startTime
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        name: test.name,
        success: false,
        error: 'Request timeout (30s)',
        duration: 30000
      });
    });

    req.write(postData);
    req.end();
  });
}

// Run all AI tests
async function runAITests() {
  console.log('\n' + colors.cyan + '╔════════════════════════════════════════════════════════════════╗' + colors.reset);
  console.log(colors.cyan + '║          🚀 AI CAPABILITIES COMPREHENSIVE TEST SUITE           ║' + colors.reset);
  console.log(colors.cyan + '╚════════════════════════════════════════════════════════════════╝' + colors.reset);
  console.log('\nTesting URL: ' + colors.blue + BASE_URL + colors.reset);
  console.log('Total AI Tests: ' + colors.yellow + aiTests.length + colors.reset);
  console.log('\n' + '─'.repeat(70) + '\n');

  const results = [];
  
  // Run tests sequentially to see detailed output
  for (const test of aiTests) {
    console.log(colors.cyan + 'Testing: ' + colors.reset + test.name);
    const result = await testAIEndpoint(test);
    results.push(result);
    
    if (result.success) {
      console.log(colors.green + '✅ SUCCESS' + colors.reset + ` (${result.duration}ms)`);
      
      // Show AI response preview
      if (result.hasAIResponse) {
        console.log(colors.magenta + '   AI Response Preview:' + colors.reset);
        if (result.response.response) {
          console.log('   ' + result.response.response.substring(0, 150) + '...');
        } else if (result.response.analysis) {
          const preview = typeof result.response.analysis === 'object' 
            ? JSON.stringify(result.response.analysis).substring(0, 150)
            : result.response.analysis.substring(0, 150);
          console.log('   ' + preview + '...');
        } else if (result.response.enhancedPrompt) {
          console.log('   ' + result.response.enhancedPrompt.substring(0, 150) + '...');
        } else if (result.response.formattedContent) {
          console.log('   ' + result.response.formattedContent.substring(0, 150) + '...');
        }
      }
    } else {
      console.log(colors.red + '❌ FAILED' + colors.reset + ` - ${result.error || 'HTTP ' + result.status}`);
      if (result.rawResponse) {
        console.log('   Response: ' + result.rawResponse);
      }
    }
    console.log('');
  }
  
  // Summary
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  const withAI = results.filter(r => r.hasAIResponse);
  
  console.log('\n' + '═'.repeat(70));
  console.log('\n' + colors.cyan + '📊 TEST RESULTS SUMMARY' + colors.reset);
  console.log('─'.repeat(40));
  
  const successRate = ((successful.length / results.length) * 100).toFixed(1);
  const aiRate = ((withAI.length / results.length) * 100).toFixed(1);
  
  console.log(`✅ Successful API Calls: ${colors.green}${successful.length}/${results.length}${colors.reset} (${successRate}%)`);
  console.log(`🤖 With AI Responses: ${colors.blue}${withAI.length}/${results.length}${colors.reset} (${aiRate}%)`);
  console.log(`❌ Failed: ${colors.red}${failed.length}/${results.length}${colors.reset}`);
  
  // Detailed breakdown
  console.log('\n' + colors.cyan + '✨ AI CAPABILITIES STATUS:' + colors.reset);
  console.log('─'.repeat(40));
  
  const capabilities = {
    'Chat AI (Gemini)': results.filter(r => r.name.includes('AI Chat')),
    'Marketing Analysis': results.filter(r => r.name.includes('Marketing Analysis')),
    'Image Generation': results.filter(r => r.name.includes('Image')),
    'Vision Analysis': results.filter(r => r.name.includes('Vision')),
    'PDF Generation': results.filter(r => r.name.includes('PDF')),
    'Social Optimization': results.filter(r => r.name.includes('Social')),
    'Research': results.filter(r => r.name.includes('Research'))
  };
  
  for (const [capability, tests] of Object.entries(capabilities)) {
    if (tests.length > 0) {
      const working = tests.filter(t => t.success && t.hasAIResponse).length;
      const total = tests.length;
      const status = working === total ? '✅' : working > 0 ? '⚠️' : '❌';
      console.log(`  ${status} ${capability}: ${working}/${total} working`);
    }
  }
  
  // Performance metrics
  const avgResponseTime = Math.round(successful.reduce((sum, r) => sum + r.duration, 0) / successful.length);
  console.log(`\n⚡ Average Response Time: ${colors.yellow}${avgResponseTime}ms${colors.reset}`);
  
  // Save detailed report
  const report = {
    timestamp: new Date().toISOString(),
    url: BASE_URL,
    summary: {
      total_tests: results.length,
      successful: successful.length,
      failed: failed.length,
      with_ai_response: withAI.length,
      success_rate: successRate + '%',
      ai_response_rate: aiRate + '%',
      avg_response_time: avgResponseTime + 'ms'
    },
    capabilities: Object.entries(capabilities).reduce((acc, [name, tests]) => {
      acc[name] = {
        total: tests.length,
        working: tests.filter(t => t.success && t.hasAIResponse).length,
        status: tests.every(t => t.success && t.hasAIResponse) ? 'fully_operational' :
                tests.some(t => t.success && t.hasAIResponse) ? 'partially_operational' : 'not_operational'
      };
      return acc;
    }, {}),
    detailed_results: results.map(r => ({
      name: r.name,
      success: r.success,
      has_ai_response: r.hasAIResponse,
      duration: r.duration,
      status: r.status,
      error: r.error
    }))
  };
  
  fs.writeFileSync('ai-test-results.json', JSON.stringify(report, null, 2));
  console.log('\n📄 Detailed report saved to ' + colors.blue + 'ai-test-results.json' + colors.reset);
  
  console.log('\n' + colors.cyan + '═'.repeat(70) + colors.reset + '\n');
  
  if (failed.length === 0 && withAI.length === results.length) {
    console.log(colors.green + '🎉 ALL AI CAPABILITIES ARE FULLY OPERATIONAL! 🎉' + colors.reset);
  } else if (successful.length > failed.length) {
    console.log(colors.yellow + '⚠️  Most AI capabilities are working, some need attention.' + colors.reset);
  } else {
    console.log(colors.red + '❌ AI capabilities need configuration.' + colors.reset);
  }
  
  console.log('\n');
}

// Run the tests
runAITests().catch(console.error);