module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  
  if (req.method === 'GET') {
    return res.status(200).json({ content: [], total: 0 });
  }
  
  if (req.method === 'POST') {
    const { title, content, type } = req.body;
    return res.status(200).json({ 
      success: true, 
      data: { id: Date.now(), title, content, type },
      message: 'Content created successfully' 
    });
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
};
