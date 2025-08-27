const { GoogleGenerativeAI } = require('@google/generative-ai');
const https = require('https');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || 'AIzaSyAbvYr4ApxLvamjKLP_BzXaTg0Hs177wIY');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  try {
    const { prompt, model = 'dalle-3', aspectRatio = '1:1', style = 'vivid' } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    // First, use Gemini to enhance the prompt
    const geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    
    const enhancePrompt = `
    Enhance this image generation prompt to be more detailed and specific for DALL-E or similar image generation:
    Original prompt: ${prompt}
    
    Add details about:
    - Visual style and artistic medium
    - Lighting and atmosphere
    - Colors and composition
    - Specific details that would make the image more vivid
    
    Keep it under 200 words and make it descriptive.
    `;
    
    const result = await geminiModel.generateContent(enhancePrompt);
    const response = await result.response;
    const enhancedPrompt = response.text();
    
    // For now, we'll return the enhanced prompt with a placeholder image
    // In production, you would call the actual image generation API here
    // Options: OpenAI DALL-E, Stability AI, Midjourney API, or Google's Imagen
    
    return res.status(200).json({ 
      success: true,
      images: [
        {
          url: `https://via.placeholder.com/1024x1024.png?text=${encodeURIComponent(prompt.substring(0, 30))}`,
          prompt: prompt,
          enhancedPrompt: enhancedPrompt,
          model: model,
          aspectRatio: aspectRatio,
          style: style
        }
      ],
      message: 'Image generation prompt enhanced. Connect to DALL-E or Stability AI for actual generation.',
      enhancedPrompt: enhancedPrompt
    });
    
  } catch (error) {
    console.error('Image generation error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate image',
      details: error.message 
    });
  }
};