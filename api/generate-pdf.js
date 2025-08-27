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
    const { content, title = 'Document', format = 'pdf', template = 'professional' } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }
    
    // Use Gemini to enhance and format the content
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    
    const prompt = `
    Format and enhance this content for a professional ${format} document:
    
    Title: ${title}
    Template Style: ${template}
    Original Content: ${content}
    
    Please structure it with:
    1. Executive Summary (if applicable)
    2. Clear sections and subsections
    3. Professional formatting
    4. Proper grammar and flow
    5. Conclusion or next steps (if applicable)
    
    Return the formatted content in markdown format.
    `;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const formattedContent = response.text();
    
    // In production, you would use a library like puppeteer, jsPDF, or wkhtmltopdf
    // to generate the actual PDF. For now, we return the formatted content
    
    // Generate a mock PDF URL
    const pdfId = Date.now();
    const pdfUrl = `https://studio.thewell.solutions/api/download/pdf/${pdfId}`;
    
    return res.status(200).json({ 
      success: true,
      pdfUrl: pdfUrl,
      downloadUrl: pdfUrl,
      title: title,
      format: format,
      template: template,
      formattedContent: formattedContent,
      message: 'PDF content formatted successfully. Connect to PDF generation library for actual file creation.',
      metadata: {
        pages: Math.ceil(formattedContent.length / 3000),
        wordCount: formattedContent.split(' ').length,
        generatedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('PDF generation error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate PDF',
      details: error.message 
    });
  }
};