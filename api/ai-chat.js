// AI Chat endpoint with Gemini 2.0 Flash
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || 'AIzaSyAbvYr4ApxLvamjKLP_BzXaTg0Hs177wIY');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { message, model = 'gemini-2.0-flash-exp' } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // Get the model
    const geminiModel = genAI.getGenerativeModel({ model });
    
    // Generate response
    const result = await geminiModel.generateContent(message);
    const response = await result.response;
    const text = response.text();
    
    return res.status(200).json({ 
      response: text,
      model: model,
      success: true
    });
    
  } catch (error) {
    console.error('AI Chat Error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate response',
      details: error.message 
    });
  }
};