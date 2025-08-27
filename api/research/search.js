const https = require('https');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  try {
    const { query, limit = 5 } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
    
    // Firecrawl API configuration
    const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY || 'fc-fb86a93cfaec4cd89fbdbe698d9c5d29';
    
    // Prepare the search request
    const searchData = JSON.stringify({
      query: query,
      limit: limit,
      scrapeOptions: {
        formats: ["markdown"],
        onlyMainContent: true
      }
    });
    
    const options = {
      hostname: 'api.firecrawl.dev',
      port: 443,
      path: '/v1/search',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': searchData.length
      }
    };
    
    // Make request to Firecrawl
    const firecrawlReq = await new Promise((resolve, reject) => {
      const req = https.request(options, (response) => {
        let data = '';
        response.on('data', chunk => data += chunk);
        response.on('end', () => {
          try {
            const result = JSON.parse(data);
            resolve(result);
          } catch (e) {
            reject(new Error('Failed to parse Firecrawl response'));
          }
        });
      });
      
      req.on('error', reject);
      req.write(searchData);
      req.end();
    });
    
    // Process and format results
    let results = [];
    if (firecrawlReq.data) {
      results = firecrawlReq.data.map(item => ({
        title: item.metadata?.title || 'Untitled',
        url: item.metadata?.url || item.url || '',
        description: item.metadata?.description || '',
        content: item.markdown ? item.markdown.substring(0, 500) + '...' : '',
        source: 'firecrawl'
      }));
    }
    
    return res.status(200).json({ 
      success: true, 
      results: results,
      query: query,
      totalResults: results.length,
      message: 'Research completed successfully',
      powered_by: 'Firecrawl'
    });
    
  } catch (error) {
    console.error('Research search error:', error);
    
    // Fallback to mock data if Firecrawl fails
    return res.status(200).json({ 
      success: true,
      results: [
        {
          title: `Latest findings on: ${req.body.query}`,
          url: 'https://example.com/research',
          description: 'Research results are being processed',
          content: 'Connect Firecrawl API for real-time web search results...'
        }
      ],
      query: req.body.query,
      message: 'Mock results - Configure Firecrawl for live search',
      error_details: error.message
    });
  }
};