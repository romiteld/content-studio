const express = require('express');
const router = express.Router();
const { db } = require('../database/supabase-client');

// Get all partners
router.get('/', async (req, res) => {
  try {
    const partners = await db.query('partners', {
      orderBy: 'company_name'
    });
    res.json(partners);
  } catch (error) {
    console.error('Error fetching partners:', error);
    res.status(500).json({ error: 'Failed to fetch partners' });
  }
});

// Get partner firms
router.get('/firms', async (req, res) => {
  try {
    const firms = await db.query('partner_firms', {
      orderBy: 'firm_name'
    });
    res.json(firms);
  } catch (error) {
    console.error('Error fetching partner firms:', error);
    res.status(500).json({ error: 'Failed to fetch partner firms' });
  }
});

// Create new partner
router.post('/', async (req, res) => {
  const { 
    name, 
    company_name, 
    role, 
    email, 
    phone, 
    location, 
    notes, 
    tags,
    engagement_score 
  } = req.body;

  if (!name || !company_name) {
    return res.status(400).json({ error: 'Name and company name are required' });
  }

  try {
    const partner = await db.insert('partners', {
      name,
      company_name,
      role: role || null,
      email: email || null,
      phone: phone || null,
      location: location || null,
      notes: notes || null,
      tags: tags || null,
      engagement_score: engagement_score || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    res.json({ 
      id: partner.id, 
      message: 'Partner created successfully',
      partner 
    });
  } catch (error) {
    console.error('Error creating partner:', error);
    res.status(500).json({ error: 'Failed to create partner' });
  }
});

// Update partner
router.put('/:id', async (req, res) => {
  const updateData = { ...req.body };
  updateData.updated_at = new Date().toISOString();
  
  // Remove id from update data if present
  delete updateData.id;

  try {
    const partner = await db.update('partners', req.params.id, updateData);
    res.json({ 
      message: 'Partner updated successfully',
      partner 
    });
  } catch (error) {
    console.error('Error updating partner:', error);
    res.status(500).json({ error: 'Failed to update partner' });
  }
});

// Delete partner
router.delete('/:id', async (req, res) => {
  try {
    await db.delete('partners', req.params.id);
    res.json({ message: 'Partner deleted successfully' });
  } catch (error) {
    console.error('Error deleting partner:', error);
    res.status(500).json({ error: 'Failed to delete partner' });
  }
});

// Create partner firm
router.post('/firms', async (req, res) => {
  const {
    firm_name,
    category,
    firm_size,
    hiring_active,
    current_openings,
    culture_notes,
    compensation_range,
    key_requirements,
    website_url,
    linkedin_url
  } = req.body;

  if (!firm_name) {
    return res.status(400).json({ error: 'Firm name is required' });
  }

  try {
    const firm = await db.insert('partner_firms', {
      firm_name,
      category: category || null,
      firm_size: firm_size || null,
      hiring_active: hiring_active !== undefined ? hiring_active : true,
      current_openings: current_openings || 0,
      culture_notes: culture_notes || null,
      compensation_range: compensation_range || null,
      key_requirements: key_requirements || null,
      website_url: website_url || null,
      linkedin_url: linkedin_url || null,
      created_at: new Date().toISOString()
    });

    res.json({ 
      id: firm.id, 
      message: 'Partner firm created successfully',
      firm 
    });
  } catch (error) {
    console.error('Error creating partner firm:', error);
    res.status(500).json({ error: 'Failed to create partner firm' });
  }
});

// Update partner firm
router.put('/firms/:id', async (req, res) => {
  const updateData = { ...req.body };
  
  // Remove id from update data if present
  delete updateData.id;

  try {
    const firm = await db.update('partner_firms', req.params.id, updateData);
    res.json({ 
      message: 'Partner firm updated successfully',
      firm 
    });
  } catch (error) {
    console.error('Error updating partner firm:', error);
    res.status(500).json({ error: 'Failed to update partner firm' });
  }
});

// Delete partner firm
router.delete('/firms/:id', async (req, res) => {
  try {
    await db.delete('partner_firms', req.params.id);
    res.json({ message: 'Partner firm deleted successfully' });
  } catch (error) {
    console.error('Error deleting partner firm:', error);
    res.status(500).json({ error: 'Failed to delete partner firm' });
  }
});

module.exports = router;