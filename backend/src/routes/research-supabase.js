const express = require('express');
const router = express.Router();
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Firecrawl API configuration
const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;
const FIRECRAWL_BASE_URL = 'https://api.firecrawl.dev/v0';

// Research endpoint using Firecrawl
router.post('/scrape', async (req, res) => {
  try {
    const { url, topic } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Store research request in database
    const { data: researchData, error: dbError } = await supabase
      .from('content')
      .insert({
        title: `Research: ${topic || url}`,
        content_type: 'research',
        content_data: {
          url,
          topic,
          status: 'pending',
          timestamp: new Date().toISOString()
        },
        display_order: 999
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
    }

    // If Firecrawl API key is available, use it
    if (FIRECRAWL_API_KEY) {
      try {
        const response = await axios.post(
          `${FIRECRAWL_BASE_URL}/scrape`,
          { url },
          {
            headers: {
              'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );

        const scrapedContent = response.data.data;
        
        // Update the database with scraped content
        if (researchData) {
          await supabase
            .from('content')
            .update({
              content_data: {
                ...researchData.content_data,
                status: 'completed',
                content: scrapedContent.markdown || scrapedContent.content,
                metadata: scrapedContent.metadata
              }
            })
            .eq('id', researchData.id);
        }

        res.json({
          success: true,
          content: scrapedContent.markdown || scrapedContent.content,
          metadata: scrapedContent.metadata,
          source: 'firecrawl'
        });
      } catch (firecrawlError) {
        console.error('Firecrawl error:', firecrawlError.response?.data || firecrawlError.message);
        
        // Fallback to basic scraping
        return basicScrape(url, res, researchData);
      }
    } else {
      // No Firecrawl API key, use basic scraping
      return basicScrape(url, res, researchData);
    }
  } catch (error) {
    console.error('Research error:', error);
    res.status(500).json({ error: 'Failed to perform research' });
  }
});

// Basic web scraping fallback
async function basicScrape(url, res, researchData) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    // Simple HTML to text conversion
    const content = response.data
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 5000); // Limit content length

    // Update database with basic content
    if (researchData) {
      await supabase
        .from('content')
        .update({
          content_data: {
            ...researchData.content_data,
            status: 'completed',
            content,
            source: 'basic'
          }
        })
        .eq('id', researchData.id);
    }

    res.json({
      success: true,
      content,
      source: 'basic',
      note: 'Using basic scraping. For better results, configure FIRECRAWL_API_KEY in environment variables.'
    });
  } catch (error) {
    console.error('Basic scraping error:', error);
    res.status(500).json({ 
      error: 'Failed to scrape content',
      message: error.message 
    });
  }
}

// Search endpoint
router.post('/search', async (req, res) => {
  try {
    const { query, limit = 5 } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    if (FIRECRAWL_API_KEY) {
      try {
        const response = await axios.post(
          `${FIRECRAWL_BASE_URL}/search`,
          { query, limit },
          {
            headers: {
              'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );

        res.json({
          success: true,
          results: response.data.data,
          source: 'firecrawl'
        });
      } catch (firecrawlError) {
        console.error('Firecrawl search error:', firecrawlError.response?.data || firecrawlError.message);
        
        // Return mock results as fallback
        res.json({
          success: true,
          results: [],
          source: 'none',
          message: 'Search API not configured. Add FIRECRAWL_API_KEY to enable search.'
        });
      }
    } else {
      res.json({
        success: true,
        results: [],
        source: 'none',
        message: 'Search API not configured. Add FIRECRAWL_API_KEY to enable search.'
      });
    }
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to perform search' });
  }
});

// Get research history
router.get('/history', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('content')
      .select('*')
      .eq('content_type', 'research')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching research history:', error);
    res.status(500).json({ error: 'Failed to fetch research history' });
  }
});

module.exports = router;