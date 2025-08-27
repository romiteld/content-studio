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
    const { content, type = 'marketing' } = await req.json();

    if (!content) {
      return new Response(JSON.stringify({ error: 'Content is required for validation' }), {
        status: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    const prompt = `As a compliance expert for wealth management content, validate the following ${type} content:

"${content}"

Check for:
1. Regulatory compliance (FINRA, SEC standards)
2. Prohibited terms or guarantees
3. Misleading claims
4. Required disclaimers
5. Brand compliance (The Well standards)

Provide response in this JSON format:
{
  "status": "Approved" | "Needs Corrections" | "Rejected",
  "score": 1-10,
  "issues": ["list of specific issues found"],
  "corrections": ["list of required corrections"],
  "improvements": ["list of suggested improvements"],
  "summary": "brief summary of validation"
}`;

    const result = await generateText({
      model: google('gemini-2.0-flash-exp'),
      prompt,
      temperature: 0.2,
      maxTokens: 1500,
    });

    // Parse the response to ensure it's valid JSON
    let validation;
    try {
      const jsonMatch = result.text.match(/```json\n?([\s\S]*?)\n?```/);
      const jsonText = jsonMatch ? jsonMatch[1] : result.text;
      validation = JSON.parse(jsonText);
    } catch (parseError) {
      // Fallback to text response if JSON parsing fails
      validation = {
        status: "Needs Review",
        score: 5,
        issues: [],
        corrections: [],
        improvements: [],
        summary: result.text
      };
    }

    return new Response(JSON.stringify({ 
      success: true, 
      validation,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Compliance validation error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }
}