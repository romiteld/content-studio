const express = require('express');
const router = express.Router();

// Get trending topics
router.get('/trending', (req, res) => {
  const trendingTopics = [
    {
      topic: 'AI in Wealth Management',
      category: 'Technology',
      engagement: 'High',
      hashtags: ['#AIWealth', '#WealthTech', '#FinTech2025', '#RoboAdvisor']
    },
    {
      topic: 'ESG Investment Strategies',
      category: 'Sustainability',
      engagement: 'Very High',
      hashtags: ['#ESGInvesting', '#SustainableWealth', '#GreenFinance', '#ImpactInvesting']
    },
    {
      topic: 'Retirement Planning for Millennials',
      category: 'Demographics',
      engagement: 'High',
      hashtags: ['#RetirementPlanning', '#MillennialMoney', '#FutureWealth', '#401k']
    },
    {
      topic: 'Cryptocurrency Portfolio Management',
      category: 'Digital Assets',
      engagement: 'Trending',
      hashtags: ['#CryptoWealth', '#DigitalAssets', '#Bitcoin2025', '#DeFi']
    },
    {
      topic: 'Tax Optimization Strategies 2025',
      category: 'Tax Planning',
      engagement: 'Medium',
      hashtags: ['#TaxPlanning', '#WealthOptimization', '#TaxStrategy', '#TaxSeason']
    },
    {
      topic: 'Alternative Investments',
      category: 'Diversification',
      engagement: 'High',
      hashtags: ['#AlternativeInvestments', '#RealEstate', '#PrivateEquity', '#Commodities']
    },
    {
      topic: 'Gen Z Financial Literacy',
      category: 'Education',
      engagement: 'Very High',
      hashtags: ['#GenZMoney', '#FinancialLiteracy', '#MoneyEducation', '#YoungInvestors']
    },
    {
      topic: 'Family Office Services',
      category: 'UHNW',
      engagement: 'Medium',
      hashtags: ['#FamilyOffice', '#UHNW', '#WealthPreservation', '#LegacyPlanning']
    }
  ];
  
  res.json({
    success: true,
    topics: trendingTopics,
    lastUpdated: new Date().toISOString()
  });
});

// Firecrawl search for training materials
router.post('/search', async (req, res) => {
  const { query, limit = 5 } = req.body;
  
  try {
    console.log('Research search request:', query);
    
    // Use actual Firecrawl API if available
    if (process.env.FIRECRAWL_API_KEY) {
      try {
        const fetch = (await import('node-fetch')).default;
        const response = await fetch('https://api.firecrawl.dev/v0/search', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.FIRECRAWL_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            query: query, // Use the raw query without adding keywords
            pageOptions: {
              maxResults: limit,
              includeHtml: false,
              includeMarkdown: true,
              onlyMainContent: true
            }
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Firecrawl API response received');
          
          // Transform Firecrawl response to our format
          const results = (data.data || []).map(item => ({
            title: item.title || 'Untitled',
            url: item.url || '#',
            content: item.markdown || item.content || 'No content available'
          }));
          
          return res.json({
            success: true,
            results: results
          });
        }
      } catch (apiError) {
        console.error('Firecrawl API error:', apiError);
      }
    }
    
    // Fallback to mock data
    console.log('Using mock data');
    const mockResults = [
      {
        title: "Wealth Management Trends 2025",
        url: "https://example.com/trends",
        content: "Digital transformation is reshaping wealth management with AI-driven advisory services, personalized portfolio management, and enhanced client experiences."
      },
      {
        title: "Compensation Benchmarks in Finance",
        url: "https://example.com/compensation",
        content: "Senior wealth advisors earn $150K-$300K base with 30-50% bonuses. Portfolio managers command $175K-$400K total compensation in major markets."
      },
      {
        title: "ESG Investing Guide",
        url: "https://example.com/esg",
        content: "Environmental, Social, and Governance factors are increasingly important in wealth management, with 75% of clients requesting sustainable investment options."
      }
    ];
    
    res.json({
      success: true,
      results: mockResults
    });
  } catch (error) {
    console.error('Research search error:', error);
    // Return sample data on error
    res.json({
      success: true,
      results: [
        {
          title: "Wealth Management Best Practices",
          url: "https://example.com/best-practices",
          content: "Focus on holistic financial planning, multi-generational wealth transfer, and technology integration for optimal client outcomes."
        },
        {
          title: "Industry Certifications Guide",
          url: "https://example.com/certifications",  
          content: "CFA, CFP, and ChFC certifications are highly valued. Continuous education in tax planning and estate management is essential."
        }
      ]
    });
  }
});

// Convert research to content section
router.post('/convert', async (req, res) => {
  const { title, content, url } = req.body;
  
  try {
    const sqlite3 = require('sqlite3').verbose();
    const path = require('path');
    const db = new sqlite3.Database(path.join(__dirname, '../database/wealth_training.db'));
    
    const contentData = {
      description: content,
      content: content,
      source: url,
      researchDate: new Date().toISOString()
    };
    
    db.run(
      `INSERT INTO content (section_type, title, content_data, display_order) 
       VALUES (?, ?, ?, ?)`,
      ['market_insights', title, JSON.stringify(contentData), 999],
      function(err) {
        if (err) {
          console.error('Error saving research:', err);
          return res.status(500).json({ error: 'Failed to save research' });
        }
        
        res.json({
          success: true,
          id: this.lastID,
          message: 'Research content added successfully'
        });
        
        db.close();
      }
    );
  } catch (error) {
    console.error('Convert research error:', error);
    res.status(500).json({ error: 'Failed to convert research' });
  }
});

module.exports = router;