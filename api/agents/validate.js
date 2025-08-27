const { google } = require('@ai-sdk/google');
const { generateText } = require('ai');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://studio.thewell.solutions');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { content, type = 'marketing' } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required for validation' });
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

    res.status(200).json({ 
      success: true, 
      validation,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Compliance validation error:', error);
    res.status(500).json({ error: error.message });
  }
};