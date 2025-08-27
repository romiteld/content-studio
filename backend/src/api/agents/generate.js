const { google } = require('@ai-sdk/google');
const { generateText } = require('ai');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { type, params } = req.body;

    let prompt = '';
    
    switch(type) {
      case 'talent_ticker':
        const date = params?.date || new Date().toISOString();
        prompt = `Generate a LinkedIn Talent Ticker update for wealth management recruitment trends for ${date}. Include:
        1. 3 trending up metrics with percentages
        2. 2 trending down areas
        3. A partner firm spotlight with specific role
        4. Actionable insights for firms and talent
        
        Format as professional LinkedIn content with emojis and hashtags.`;
        break;
        
      case 'partner_spotlight':
        prompt = `Create a partner firm spotlight for ${params?.firmName}. 
        Data: ${JSON.stringify(params?.firmData || {})}
        Include their specialization, recent achievements, and why talent should consider them.`;
        break;
        
      case 'career_guide':
        prompt = `Create a comprehensive career guide on "${params?.topic}" for ${params?.audience} in wealth management.
        Include actionable steps, industry insights, and practical tips.`;
        break;
        
      default:
        return res.status(400).json({ error: `Unknown content type: ${type}` });
    }

    const result = await generateText({
      model: google('gemini-2.0-flash-exp'),
      prompt,
      temperature: 0.7,
      maxTokens: 2000,
    });

    res.status(200).json({ 
      success: true, 
      content: {
        type,
        text: result.text,
        date: params?.date || new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Content generation error:', error);
    res.status(500).json({ error: error.message });
  }
};