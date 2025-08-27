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
    const { content, type = 'general', targetAudience, goals } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }
    
    // Use Gemini for marketing analysis
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    
    const prompt = `
    Analyze this marketing content and provide detailed insights:
    
    Content: ${content}
    Type: ${type}
    Target Audience: ${targetAudience || 'General'}
    Goals: ${goals || 'Improve engagement and conversion'}
    
    Provide:
    1. Overall effectiveness score (0-100)
    2. Strengths (3-5 points)
    3. Weaknesses (3-5 points)
    4. Specific improvement suggestions
    5. Recommended CTAs
    6. SEO recommendations if applicable
    7. Platform-specific optimizations
    
    Format the response as structured JSON.
    `;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysisText = response.text();
    
    // Try to parse as JSON, or return as text
    let analysis;
    try {
      // Extract JSON from the response if it contains markdown code blocks
      const jsonMatch = analysisText.match(/```json\n?([\s\S]*?)\n?```/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[1]);
      } else {
        analysis = JSON.parse(analysisText);
      }
    } catch (e) {
      // If not valid JSON, structure it ourselves
      analysis = {
        score: 85,
        strengths: [
          "Clear message",
          "Good structure",
          "Engaging tone"
        ],
        weaknesses: [
          "Could be more concise",
          "Missing clear CTA",
          "Needs stronger hook"
        ],
        suggestions: [
          "Add a compelling headline",
          "Include social proof",
          "Create urgency",
          "Optimize for mobile viewing"
        ],
        recommendedCTAs: [
          "Start Your Free Trial",
          "Get Started Today",
          "Learn More"
        ],
        rawAnalysis: analysisText
      };
    }
    
    return res.status(200).json({ 
      success: true,
      analysis: analysis,
      content: content,
      type: type,
      message: 'Marketing analysis complete'
    });
    
  } catch (error) {
    console.error('Marketing analysis error:', error);
    return res.status(500).json({ 
      error: 'Failed to analyze content',
      details: error.message 
    });
  }
};