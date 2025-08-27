// Vercel Serverless Function for Compliance Validation
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

// Compliance Validation Agent
class ComplianceAgent {
  constructor() {
    this.model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
  }

  async validateCompliance(content, contentType) {
    const prompt = `As a compliance expert for wealth management content, validate the following ${contentType} content:

    "${content}"

    Check for:
    1. Regulatory compliance (FINRA, SEC standards)
    2. Prohibited terms or guarantees
    3. Misleading claims
    4. Required disclaimers
    5. Brand compliance (The Well standards)

    Provide:
    - Compliance status (Approved/Needs Corrections/Rejected)
    - Specific issues found
    - Required corrections
    - Suggested improvements`;

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

  const { content, type = 'marketing' } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'Content is required for validation' });
  }

  const agent = new ComplianceAgent();

  try {
    const validation = await agent.validateCompliance(content, type);
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