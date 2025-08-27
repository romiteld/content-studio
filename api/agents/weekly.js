// Vercel Serverless Function for Weekly Content Calendar
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

// Weekly Content Calendar Agent
class WeeklyContentAgent {
  constructor() {
    this.model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
  }

  async generateWeeklyCalendar(startDate, theme) {
    const prompt = `Create a weekly content calendar for wealth management recruitment starting ${startDate}.
    Theme: ${theme || 'General wealth management trends'}
    
    For each day (Monday-Friday), provide:
    1. Content type (LinkedIn post, blog, infographic, etc.)
    2. Topic/Title
    3. Key message
    4. Optimal posting time
    5. Hashtags
    6. Call to action
    
    Ensure variety and engagement across the week.`;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    
    return {
      week: startDate,
      theme: theme || 'General wealth management trends',
      calendar: response.text()
    };
  }

  async generateBatchContent(topics) {
    const results = [];
    
    for (const topic of topics) {
      const prompt = `Create a short, engaging LinkedIn post about: ${topic}
      For wealth management professionals and firms.
      Include relevant hashtags and a call to action.`;
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      
      results.push({
        topic,
        content: response.text(),
        generated: new Date().toISOString()
      });
    }
    
    return results;
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

  const { action, params = {} } = req.body;
  const agent = new WeeklyContentAgent();

  try {
    let result;
    switch(action) {
      case 'calendar':
        result = await agent.generateWeeklyCalendar(
          params.startDate || new Date().toISOString(),
          params.theme
        );
        break;
      case 'batch':
        if (!params.topics || !Array.isArray(params.topics)) {
          return res.status(400).json({ error: 'Topics array is required for batch generation' });
        }
        result = await agent.generateBatchContent(params.topics);
        break;
      default:
        return res.status(400).json({ error: `Unknown action: ${action}` });
    }
    
    res.status(200).json({ 
      success: true, 
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Weekly content generation error:', error);
    res.status(500).json({ error: error.message });
  }
};