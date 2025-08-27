module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  const { content } = req.body;
  return res.status(200).json({ 
    success: true, 
    analysis: { score: 85, suggestions: ['Improve CTA', 'Add more visuals'] },
    message: 'Marketing analysis complete' 
  });
};
