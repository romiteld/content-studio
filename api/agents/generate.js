// Vercel Serverless Function for AI Agents Content Generation
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

// Content Generation Workflow
class ContentGenerationWorkflow {
  constructor() {
    this.model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
  }

  async generateTalentTicker(date) {
    const prompt = `Generate a LinkedIn Talent Ticker update for wealth management recruitment trends for ${date}. Include:
    1. 3 trending up metrics with percentages
    2. 2 trending down areas
    3. A partner firm spotlight with specific role
    4. Actionable insights for firms and talent
    
    Format as professional LinkedIn content with emojis and hashtags.`;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    return { 
      content: response.text(),
      type: 'talent_ticker',
      date: date
    };
  }

  async generatePartnerSpotlight(firmName, firmData) {
    const prompt = `Create a partner firm spotlight for ${firmName}. 
    Data: ${JSON.stringify(firmData)}
    Include their specialization, recent achievements, and why talent should consider them.`;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    return { 
      content: response.text(),
      type: 'partner_spotlight',
      firmName
    };
  }

  async generateCareerGuide(topic, audience) {
    const prompt = `Create a comprehensive career guide on "${topic}" for ${audience} in wealth management.
    Include actionable steps, industry insights, and practical tips.`;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    return { 
      content: response.text(),
      type: 'career_guide',
      topic,
      audience
    };
  }
}

// Vercel Serverless Function Handler
module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type, params } = req.body;
  const workflow = new ContentGenerationWorkflow();

  try {
    let result;
    switch(type) {
      case 'talent_ticker':
        result = await workflow.generateTalentTicker(new Date(params.date || Date.now()));
        break;
      case 'partner_spotlight':
        result = await workflow.generatePartnerSpotlight(params.firmName, params.firmData);
        break;
      case 'career_guide':
        result = await workflow.generateCareerGuide(params.topic, params.audience);
        break;
      default:
        return res.status(400).json({ error: `Unknown content type: ${type}` });
    }
    
    res.status(200).json({ success: true, content: result });
  } catch (error) {
    console.error('Content generation error:', error);
    res.status(500).json({ error: error.message });
  }
};