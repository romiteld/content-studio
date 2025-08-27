import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

export const config = {
  runtime: 'edge',
  maxDuration: 30,
};

export default async function handler(req) {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { type, params } = await req.json();

    let prompt = '';
    
    switch(type) {
      case 'talent_ticker':
        const date = params.date || new Date().toISOString();
        prompt = `Generate a LinkedIn Talent Ticker update for wealth management recruitment trends for ${date}. Include:
        1. 3 trending up metrics with percentages
        2. 2 trending down areas
        3. A partner firm spotlight with specific role
        4. Actionable insights for firms and talent
        
        Format as professional LinkedIn content with emojis and hashtags.`;
        break;
        
      case 'partner_spotlight':
        prompt = `Create a partner firm spotlight for ${params.firmName}. 
        Data: ${JSON.stringify(params.firmData || {})}
        Include their specialization, recent achievements, and why talent should consider them.`;
        break;
        
      case 'career_guide':
        prompt = `Create a comprehensive career guide on "${params.topic}" for ${params.audience} in wealth management.
        Include actionable steps, industry insights, and practical tips.`;
        break;
        
      default:
        return new Response(JSON.stringify({ error: `Unknown content type: ${type}` }), {
          status: 400,
          headers: { ...headers, 'Content-Type': 'application/json' },
        });
    }

    const result = await streamText({
      model: google('gemini-2.0-flash-exp'),
      prompt,
      temperature: 0.7,
      maxTokens: 2000,
    });

    // Return streaming response
    return new Response(result.toDataStreamResponse().body, {
      headers: {
        ...headers,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
    
  } catch (error) {
    console.error('Content generation error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }
}