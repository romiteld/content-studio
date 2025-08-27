import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

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
    const { action, params } = await req.json();
    
    let prompt = '';
    
    switch(action) {
      case 'specs':
        prompt = `Create detailed visual specifications for a ${params.contentType} for wealth management content.
        Context: ${JSON.stringify(params.context || {})}
        
        Brand colors: Black, Gold (#D4AF37), Cyan (#4FC3F7)
        
        Provide response in JSON format:
        {
          "layout": {
            "structure": "description",
            "sections": ["list of sections"],
            "grid": "grid specification"
          },
          "typography": {
            "headings": "heading styles",
            "body": "body text styles",
            "fonts": ["font families"]
          },
          "colors": {
            "primary": "#000000",
            "accent": "#D4AF37",
            "secondary": "#4FC3F7",
            "usage": "color usage guidelines"
          },
          "visualElements": ["list of visual elements"],
          "dimensions": {
            "format": "format specification",
            "sizes": "size specifications"
          },
          "imagePrompt": "AI image generation prompt"
        }`;
        break;
        
      case 'prompt':
        prompt = `Create a detailed image generation prompt for: ${params.description}
        
        Style: ${params.style || 'professional'}
        Context: Wealth management professional content
        Brand colors to incorporate: Black, Gold (#D4AF37), Cyan (#4FC3F7)
        
        Generate a specific, detailed prompt suitable for image AI generation that includes:
        - Exact visual description
        - Style and mood
        - Color palette
        - Composition details
        - Technical specifications`;
        break;
        
      case 'analyze':
        prompt = `Analyze visual content requirements for: ${params.content}
        
        Provide recommendations for:
        1. Visual hierarchy
        2. Information design
        3. Data visualization needs
        4. Supporting graphics
        5. Layout optimization`;
        break;
        
      default:
        return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
          status: 400,
          headers: { ...headers, 'Content-Type': 'application/json' },
        });
    }

    const result = await generateText({
      model: google('gemini-2.0-flash-exp'),
      prompt,
      temperature: 0.6,
      maxTokens: 2000,
    });

    // Parse JSON response if action is 'specs'
    let parsedResult = result.text;
    if (action === 'specs') {
      try {
        const jsonMatch = result.text.match(/```json\n?([\s\S]*?)\n?```/);
        const jsonText = jsonMatch ? jsonMatch[1] : result.text;
        parsedResult = JSON.parse(jsonText);
      } catch (parseError) {
        // Keep as text if JSON parsing fails
        console.log('JSON parsing failed, returning as text');
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      result: parsedResult,
      action,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Visual generation error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }
}