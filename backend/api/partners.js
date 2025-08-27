const express = require('express');
const router = express.Router();
const db = require('../database/db');

// Get all partners with optional filtering
router.get('/', (req, res) => {
  try {
    const { category, search, limit = 50, offset = 0 } = req.query;
    
    let query = 'SELECT * FROM partners WHERE 1=1';
    const params = [];
    
    if (category) {
      query += ' AND LOWER(category) LIKE LOWER(?)';
      params.push(`%${category}%`);
    }
    
    if (search) {
      query += ' AND (LOWER(company_name) LIKE LOWER(?) OR LOWER(keywords) LIKE LOWER(?))';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    query += ' ORDER BY company_name';
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const partners = db.prepare(query).all(...params);
    
    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM partners WHERE 1=1';
    const countParams = [];
    
    if (category) {
      countQuery += ' AND LOWER(category) LIKE LOWER(?)';
      countParams.push(`%${category}%`);
    }
    
    if (search) {
      countQuery += ' AND (LOWER(company_name) LIKE LOWER(?) OR LOWER(keywords) LIKE LOWER(?))';
      countParams.push(`%${search}%`, `%${search}%`);
    }
    
    const { total } = db.prepare(countQuery).get(...countParams);
    
    res.json({
      partners,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: (parseInt(offset) + partners.length) < total
      }
    });
  } catch (error) {
    console.error('Error fetching partners:', error);
    res.status(500).json({ error: 'Failed to fetch partners' });
  }
});

// Get partner by ID
router.get('/:id', (req, res) => {
  try {
    const partner = db.prepare('SELECT * FROM partners WHERE id = ?').get(req.params.id);
    
    if (!partner) {
      return res.status(404).json({ error: 'Partner not found' });
    }
    
    res.json(partner);
  } catch (error) {
    console.error('Error fetching partner:', error);
    res.status(500).json({ error: 'Failed to fetch partner' });
  }
});

// Add new partner
router.post('/', (req, res) => {
  try {
    const { company_name, category, keywords, description, website, contact_email, contact_phone } = req.body;
    
    if (!company_name) {
      return res.status(400).json({ error: 'Company name is required' });
    }
    
    const stmt = db.prepare(`
      INSERT INTO partners (company_name, category, keywords, description, website, contact_email, contact_phone)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      company_name,
      category || '',
      keywords || '',
      description || '',
      website || '',
      contact_email || '',
      contact_phone || ''
    );
    
    const newPartner = db.prepare('SELECT * FROM partners WHERE id = ?').get(result.lastInsertRowid);
    
    res.status(201).json(newPartner);
  } catch (error) {
    console.error('Error adding partner:', error);
    res.status(500).json({ error: 'Failed to add partner' });
  }
});

// Update partner
router.put('/:id', (req, res) => {
  try {
    const { company_name, category, keywords, description, website, contact_email, contact_phone } = req.body;
    
    const existingPartner = db.prepare('SELECT * FROM partners WHERE id = ?').get(req.params.id);
    
    if (!existingPartner) {
      return res.status(404).json({ error: 'Partner not found' });
    }
    
    const stmt = db.prepare(`
      UPDATE partners 
      SET company_name = ?, category = ?, keywords = ?, description = ?, 
          website = ?, contact_email = ?, contact_phone = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    stmt.run(
      company_name || existingPartner.company_name,
      category || existingPartner.category,
      keywords || existingPartner.keywords,
      description || existingPartner.description,
      website || existingPartner.website,
      contact_email || existingPartner.contact_email,
      contact_phone || existingPartner.contact_phone,
      req.params.id
    );
    
    const updatedPartner = db.prepare('SELECT * FROM partners WHERE id = ?').get(req.params.id);
    
    res.json(updatedPartner);
  } catch (error) {
    console.error('Error updating partner:', error);
    res.status(500).json({ error: 'Failed to update partner' });
  }
});

// Delete partner
router.delete('/:id', (req, res) => {
  try {
    const existingPartner = db.prepare('SELECT * FROM partners WHERE id = ?').get(req.params.id);
    
    if (!existingPartner) {
      return res.status(404).json({ error: 'Partner not found' });
    }
    
    db.prepare('DELETE FROM partners WHERE id = ?').run(req.params.id);
    
    res.json({ message: 'Partner deleted successfully' });
  } catch (error) {
    console.error('Error deleting partner:', error);
    res.status(500).json({ error: 'Failed to delete partner' });
  }
});

// Get partner categories (unique)
router.get('/meta/categories', (req, res) => {
  try {
    const categories = db.prepare(`
      SELECT DISTINCT category 
      FROM partners 
      WHERE category IS NOT NULL AND category != ''
      ORDER BY category
    `).all();
    
    res.json(categories.map(c => c.category));
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Import partners from CSV data
router.post('/import', (req, res) => {
  try {
    const { partners } = req.body;
    
    if (!partners || !Array.isArray(partners)) {
      return res.status(400).json({ error: 'Invalid partners data' });
    }
    
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO partners (company_name, category, keywords)
      VALUES (?, ?, ?)
    `);
    
    let imported = 0;
    let failed = 0;
    
    for (const partner of partners) {
      try {
        if (partner.company_name) {
          stmt.run(
            partner.company_name,
            partner.category || '',
            partner.keywords || partner.category || ''
          );
          imported++;
        }
      } catch (err) {
        console.error(`Failed to import partner: ${partner.company_name}`, err);
        failed++;
      }
    }
    
    res.json({ 
      message: `Import completed: ${imported} imported, ${failed} failed`,
      imported,
      failed
    });
  } catch (error) {
    console.error('Error importing partners:', error);
    res.status(500).json({ error: 'Failed to import partners' });
  }
});

module.exports = router;