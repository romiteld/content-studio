const express = require('express');
const router = express.Router();
const { db } = require('../database/supabase');

// Get all content
router.get('/', async (req, res) => {
  try {
    const content = await db.getAllContent();
    res.json(content);
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({ error: error.message });
  }
});

// Search content - MUST be before /:id route
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Search query required' });
    }
    
    const results = await db.searchContent(q);
    res.json(results);
  } catch (error) {
    console.error('Error searching content:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get content by ID
router.get('/:id', async (req, res) => {
  try {
    const content = await db.getContentById(req.params.id);
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }
    res.json(content);
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new content
router.post('/', async (req, res) => {
  try {
    // Ensure content_data is properly formatted with defaults
    let contentData;
    if (req.body.content_data) {
      contentData = typeof req.body.content_data === 'string' 
        ? JSON.parse(req.body.content_data) 
        : req.body.content_data;
    } else if (req.body.content) {
      // Support legacy content field
      contentData = { text: req.body.content };
    } else {
      // Default empty content
      contentData = { text: '' };
    }

    const newContent = {
      section_type: req.body.section_type || req.body.type || 'content', // Support different field names with default
      title: req.body.title || 'Untitled',
      content_data: contentData,
      chart_data: req.body.chart_data || null,
      display_order: req.body.display_order || 999
    };

    const content = await db.createContent(newContent);
    
    // Log to AI agents history
    await db.logAgentActivity({
      agent_type: 'content_creation',
      action: 'create_content',
      input_data: req.body,
      output_data: content,
      status: 'success'
    });

    res.json(content);
  } catch (error) {
    console.error('Error creating content:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update content
router.put('/:id', async (req, res) => {
  try {
    const updates = {};
    
    if (req.body.section_type !== undefined) updates.section_type = req.body.section_type;
    if (req.body.title !== undefined) updates.title = req.body.title;
    if (req.body.display_order !== undefined) updates.display_order = req.body.display_order;
    
    if (req.body.content_data !== undefined) {
      updates.content_data = typeof req.body.content_data === 'string' 
        ? JSON.parse(req.body.content_data) 
        : req.body.content_data;
    }
    
    if (req.body.chart_data !== undefined) {
      updates.chart_data = typeof req.body.chart_data === 'string' 
        ? JSON.parse(req.body.chart_data) 
        : req.body.chart_data;
    }

    const content = await db.updateContent(req.params.id, updates);
    res.json(content);
  } catch (error) {
    console.error('Error updating content:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete content
router.delete('/:id', async (req, res) => {
  try {
    await db.deleteContent(req.params.id);
    res.json({ success: true, message: 'Content deleted successfully' });
  } catch (error) {
    console.error('Error deleting content:', error);
    res.status(500).json({ error: error.message });
  }
});

// Reorder content
router.post('/reorder', async (req, res) => {
  try {
    const { items } = req.body;
    
    // Update display order for each item
    const updates = items.map(item => 
      db.updateContent(item.id, { display_order: item.order })
    );
    
    await Promise.all(updates);
    res.json({ success: true, message: 'Content reordered successfully' });
  } catch (error) {
    console.error('Error reordering content:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;