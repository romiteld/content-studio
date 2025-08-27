module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', 'https://studio.thewell.solutions');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  res.status(200).json({
    success: true,
    message: 'Test endpoint working',
    method: req.method,
    env: {
      hasGoogleKey: !!process.env.GOOGLE_AI_API_KEY,
      nodeVersion: process.version,
      keys: Object.keys(process.env).filter(k => k.includes('GOOGLE') || k.includes('AI')).map(k => k.substring(0, 10) + '...')
    }
  });
};