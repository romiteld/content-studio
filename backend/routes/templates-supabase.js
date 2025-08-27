const express = require('express');
const router = express.Router();
const { db } = require('../database/supabase-client');

// Get all templates
router.get('/', async (req, res) => {
  try {
    const data = await db.all('templates');
    res.json(data);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

// Get single template
router.get('/:id', async (req, res) => {
  try {
    const data = await db.get('templates', { id: req.params.id });
    if (!data) {
      return res.status(404).json({ error: 'Template not found' });
    }
    res.json(data);
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({ error: 'Failed to fetch template' });
  }
});

// Validate style override attempt
router.post('/validate-style', async (req, res) => {
  const { style, element } = req.body;
  
  // Check for protected brand elements
  const protectedElements = ['.brand-header', '.brand-logo', '.brand-footer', '.brand-color'];
  const isProtected = protectedElements.some(el => element?.includes(el));
  
  if (isProtected) {
    // Log the attempt
    try {
      await db.insert('brand_protection_log', {
        event_type: 'style_override_attempt',
        attempted_action: `Modify ${element} with style: ${style}`,
        blocked: true,
        user_ip: req.ip,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error logging brand protection:', error);
    }
    
    return res.status(403).json({ 
      error: 'Brand style modification blocked',
      message: 'This element is protected by brand lock'
    });
  }
  
  res.json({ valid: true });
});

module.exports = router;