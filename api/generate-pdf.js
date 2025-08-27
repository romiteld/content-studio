// PDF Generation endpoint
const cors = require('cors');

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
    const { content, title = 'Document' } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }
    
    // For now, return a mock response
    // In production, you would generate actual PDF
    return res.status(200).json({ 
      success: true,
      pdfUrl: `https://studio.thewell.solutions/mock-pdf/${Date.now()}.pdf`,
      title: title,
      message: 'PDF generation endpoint is working (mock response)'
    });
    
  } catch (error) {
    console.error('PDF generation error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate PDF',
      details: error.message 
    });
  }
};