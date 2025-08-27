module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  
  if (req.method === 'GET') {
    return res.status(200).json({ templates: [], total: 0 });
  }
  
  if (req.method === 'POST') {
    const { name, content } = req.body;
    return res.status(200).json({ 
      success: true, 
      template: { id: Date.now(), name, content },
      message: 'Template created successfully' 
    });
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
};
