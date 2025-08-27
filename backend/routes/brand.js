const express = require('express');
const router = express.Router();
const db = require('../database/db');

// Get brand protection log
router.get('/protection-log', (req, res) => {
  try {
    const logs = db.prepare(`
      SELECT * FROM brand_protection_log 
      ORDER BY timestamp DESC 
      LIMIT 100
    `).all();
    res.json(logs);
  } catch (error) {
    console.error('Error fetching protection log:', error);
    res.status(500).json({ error: 'Failed to fetch protection log' });
  }
});

// Validate style compliance
router.post('/validate-style', (req, res) => {
  const { styles } = req.body;
  const violations = [];
  
  // Check for prohibited style overrides
  const prohibitedStyles = ['font-family', 'color', 'background-color'];
  for (const style of prohibitedStyles) {
    if (styles[style]) {
      violations.push({
        property: style,
        value: styles[style],
        reason: 'Brand-locked property cannot be modified'
      });
    }
  }
  
  // Log violations
  if (violations.length > 0) {
    const stmt = db.prepare(`
      INSERT INTO brand_protection_log (component, violation, blocked, timestamp)
      VALUES (?, ?, 1, CURRENT_TIMESTAMP)
    `);
    
    violations.forEach(v => {
      stmt.run('Style Validation', JSON.stringify(v));
    });
  }
  
  res.json({ 
    compliant: violations.length === 0, 
    violations 
  });
});

module.exports = router;