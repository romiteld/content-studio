// Vercel Serverless Function for Visual Content Generation
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

// Visual Specification Agent
class VisualAgent {
  constructor() {
    this.model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
  }

  async generateVisualSpecs(contentType, context) {
    const prompt = `Create detailed visual specifications for a ${contentType} for wealth management content.
    Context: ${JSON.stringify(context)}
    
    Brand colors: Black, Gold (#D4AF37), Cyan (#4FC3F7)
    
    Provide:
    1. Layout specifications
    2. Typography guidelines
    3. Color usage
    4. Visual elements
    5. Dimensions and formats
    6. Image prompt for AI generation`;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }

  async generateImagePrompt(description, style = 'professional') {
    const prompt = `Create a detailed image generation prompt for: ${description}
    
    Style: ${style}
    Context: Wealth management professional content
    Brand colors to incorporate: Black, Gold (#D4AF37), Cyan (#4FC3F7)
    
    Generate a specific, detailed prompt suitable for image AI generation.`;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    return response.text();
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

  const { action, params } = req.body;
  const agent = new VisualAgent();

  try {
    let result;
    switch(action) {
      case 'specs':
        result = await agent.generateVisualSpecs(params.contentType, params.context);
        break;
      case 'prompt':
        result = await agent.generateImagePrompt(params.description, params.style);
        break;
      default:
        return res.status(400).json({ error: `Unknown action: ${action}` });
    }
    
    res.status(200).json({ 
      success: true, 
      result,
      action,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Visual generation error:', error);
    res.status(500).json({ error: error.message });
  }
};