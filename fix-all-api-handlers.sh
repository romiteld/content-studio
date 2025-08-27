#!/bin/bash

echo "Creating all API handler files for Vercel..."

# Create auth handlers
mkdir -p api/auth
cat > api/auth/logout.js << 'EOF'
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  return res.status(200).json({ success: true, message: 'Logged out successfully' });
};
EOF

cat > api/auth/session.js << 'EOF'
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  
  return res.status(200).json({ session: null, user: null });
};
EOF

# Create content handlers
mkdir -p api/content
cat > api/content/index.js << 'EOF'
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
EOF

# Create templates handlers
mkdir -p api/templates
cat > api/templates/index.js << 'EOF'
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
EOF

# Create AI marketing handlers
mkdir -p api/ai-marketing
cat > api/ai-marketing/analyze.js << 'EOF'
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
EOF

# Create brand handlers
mkdir -p api/brand
cat > api/brand/index.js << 'EOF'
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
EOF

# Create research handlers
mkdir -p api/research
cat > api/research/search.js << 'EOF'
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  const { query } = req.body;
  return res.status(200).json({ 
    success: true, 
    results: [{ title: 'Result 1', url: 'https://example.com' }],
    query: query 
  });
};
EOF

# Create social handlers
mkdir -p api/social
cat > api/social/optimize.js << 'EOF'
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  const { content, platform } = req.body;
  return res.status(200).json({ 
    success: true, 
    optimized: content,
    platform: platform,
    suggestions: ['Add hashtags', 'Shorten text'] 
  });
};
EOF

# Create vision handlers
mkdir -p api/vision
cat > api/vision/analyze.js << 'EOF'
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  const { imageUrl } = req.body;
  return res.status(200).json({ 
    success: true, 
    analysis: { objects: ['person', 'car'], text: 'No text detected' },
    imageUrl: imageUrl 
  });
};
EOF

echo "All API handlers created successfully!"
ls -la api/