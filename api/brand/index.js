module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  
  if (req.method === 'GET') {
    return res.status(200).json({ brand: { name: 'Default', colors: ['#000000'] } });
  }
  
  if (req.method === 'POST') {
    const { name, colors } = req.body;
    return res.status(200).json({ 
      success: true, 
      brand: { name, colors },
      message: 'Brand updated successfully' 
    });
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
};
