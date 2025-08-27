const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || 'AIzaSyAbvYr4ApxLvamjKLP_BzXaTg0Hs177wIY');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  try {
    const { imageUrl, imageBase64, prompt = "Describe what you see in this image in detail" } = req.body;
    
    if (!imageUrl && !imageBase64) {
      return res.status(400).json({ error: 'Either imageUrl or imageBase64 is required' });
    }
    
    // Use Gemini Pro Vision model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    let imageData;
    if (imageBase64) {
      // Remove data URL prefix if present
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      imageData = {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Data
        }
      };
    } else {
      // For URL, we'll analyze it with text description
      const result = await model.generateContent([
        prompt + " Image URL: " + imageUrl,
        "Analyze this image and provide detailed insights about: objects detected, text found, colors, composition, and any notable features."
      ]);
      
      const response = await result.response;
      const analysis = response.text();
      
      return res.status(200).json({ 
        success: true,
        analysis: {
          description: analysis,
          imageUrl: imageUrl,
          model: 'gemini-1.5-flash'
        },
        message: 'Vision analysis complete'
      });
    }
    
    // Generate content with image
    const result = await model.generateContent([prompt, imageData]);
    const response = await result.response;
    const analysis = response.text();
    
    return res.status(200).json({ 
      success: true,
      analysis: {
        description: analysis,
        model: 'gemini-1.5-flash'
      },
      message: 'Vision analysis complete'
    });
    
  } catch (error) {
    console.error('Vision analysis error:', error);
    return res.status(500).json({ 
      error: 'Failed to analyze image',
      details: error.message 
    });
  }
};