import { google } from '@ai-sdk/google';
import { generateText, streamText } from 'ai';

export const config = {
  runtime: 'edge',
  maxDuration: 30,
};

export default async function handler(req) {
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
    const { action, params = {} } = await req.json();
    
    switch(action) {
      case 'calendar': {
        const startDate = params.startDate || new Date().toISOString();
        const theme = params.theme || 'General wealth management trends';
        
        const prompt = `Create a weekly content calendar for wealth management recruitment starting ${startDate}.
        Theme: ${theme}
        
        Return a JSON object with this structure:
        {
          "week": "${startDate}",
          "theme": "${theme}",
          "days": {
            "monday": {
              "type": "content type",
              "title": "content title",
              "message": "key message",
              "time": "posting time",
              "hashtags": ["hashtag1", "hashtag2"],
              "cta": "call to action"
            },
            "tuesday": { ... },
            "wednesday": { ... },
            "thursday": { ... },
            "friday": { ... }
          }
        }`;

        const result = await generateText({
          model: google('gemini-2.0-flash-exp'),
          prompt,
          temperature: 0.7,
          maxTokens: 2000,
        });

        let calendar;
        try {
          const jsonMatch = result.text.match(/```json\n?([\s\S]*?)\n?```/);
          const jsonText = jsonMatch ? jsonMatch[1] : result.text;
          calendar = JSON.parse(jsonText);
        } catch (parseError) {
          calendar = {
            week: startDate,
            theme: theme,
            calendar: result.text
          };
        }

        return new Response(JSON.stringify({ 
          success: true, 
          data: calendar,
          timestamp: new Date().toISOString()
        }), {
          status: 200,
          headers: { ...headers, 'Content-Type': 'application/json' },
        });
      }
      
      case 'batch': {
        if (!params.topics || !Array.isArray(params.topics)) {
          return new Response(JSON.stringify({ error: 'Topics array is required for batch generation' }), {
            status: 400,
            headers: { ...headers, 'Content-Type': 'application/json' },
          });
        }

        const results = [];
        
        for (const topic of params.topics) {
          const prompt = `Create a short, engaging LinkedIn post about: ${topic}
          For wealth management professionals and firms.
          Include relevant hashtags and a call to action.
          Keep it concise and professional.`;
          
          const result = await generateText({
            model: google('gemini-2.0-flash-exp'),
            prompt,
            temperature: 0.7,
            maxTokens: 500,
          });
          
          results.push({
            topic,
            content: result.text,
            generated: new Date().toISOString()
          });
        }

        return new Response(JSON.stringify({ 
          success: true, 
          data: results,
          timestamp: new Date().toISOString()
        }), {
          status: 200,
          headers: { ...headers, 'Content-Type': 'application/json' },
        });
      }
      
      case 'stream': {
        const topic = params.topic || 'wealth management trends';
        const prompt = `Generate a comprehensive weekly content plan for: ${topic}
        Include diverse content types, engagement strategies, and measurement metrics.`;

        const result = await streamText({
          model: google('gemini-2.0-flash-exp'),
          prompt,
          temperature: 0.7,
          maxTokens: 3000,
        });

        return new Response(result.toDataStreamResponse().body, {
          headers: {
            ...headers,
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        });
      }
      
      default:
        return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
          status: 400,
          headers: { ...headers, 'Content-Type': 'application/json' },
        });
    }
    
  } catch (error) {
    console.error('Weekly content generation error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }
}