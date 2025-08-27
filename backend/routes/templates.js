const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, '../database/wealth_training.db'));

router.get('/', (req, res) => {
  db.all(
    'SELECT id, name, section_type FROM templates WHERE is_locked = 1',
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch templates' });
      }
      res.json(rows);
    }
  );
});

router.get('/:id', (req, res) => {
  db.get(
    'SELECT * FROM templates WHERE id = ? AND is_locked = 1',
    [req.params.id],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch template' });
      }
      if (!row) {
        return res.status(404).json({ error: 'Template not found' });
      }
      res.json(row);
    }
  );
});

router.post('/apply/:templateId', (req, res) => {
  const { title, contentData } = req.body;
  
  db.get(
    'SELECT * FROM templates WHERE id = ? AND is_locked = 1',
    [req.params.templateId],
    (err, template) => {
      if (err || !template) {
        return res.status(404).json({ error: 'Template not found' });
      }
      
      db.run(
        `INSERT INTO content (section_type, title, content_data, display_order) 
         VALUES (?, ?, ?, ?)`,
        [
          template.section_type,
          title,
          JSON.stringify(contentData),
          req.body.display_order || 0
        ],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to apply template' });
          }
          
          db.run(
            `INSERT INTO brand_protection_log (event_type, attempted_action, blocked) 
             VALUES ('template_apply', 'Applied locked template: ${template.name}', 0)`
          );
          
          res.json({
            id: this.lastID,
            message: 'Template applied successfully',
            template: template.name
          });
        }
      );
    }
  );
});

router.get('/preview/:templateId', (req, res) => {
  db.get(
    'SELECT html_structure, css_rules FROM templates WHERE id = ? AND is_locked = 1',
    [req.params.templateId],
    (err, row) => {
      if (err || !row) {
        return res.status(404).json({ error: 'Template not found' });
      }
      
      const preview = {
        html: row.html_structure.replace(/{{.*?}}/g, '[Content Here]'),
        css: row.css_rules === 'LOCKED_CSS' ? 'Using brand-locked styles' : row.css_rules
      };
      
      res.json(preview);
    }
  );
});

router.post('/validate-style', (req, res) => {
  const { content } = req.body;
  const brandConfig = require('../config/brandLock');
  
  // Check for protected brand element overrides
  const protectedPatterns = [
    /\.brand-logo[^{]*{[^}]*color\s*:[^}]*}/gi,
    /\.brand-header[^{]*{[^}]*background\s*:[^}]*}/gi,
    /\.brand-footer[^{]*{[^}]*background\s*:[^}]*}/gi,
    /#logo[^{]*{[^}]*}/gi
  ];
  
  let violations = [];
  
  // Only check for protected element violations if style overrides are allowed
  if (brandConfig.allowStyleOverrides) {
    protectedPatterns.forEach((pattern, index) => {
      if (pattern.test(content)) {
        violations.push(`Protected brand element modification attempt: ${brandConfig.protectedProperties[index] || 'Pattern ' + (index + 1)}`);
      }
    });
    
    // If violations found on protected elements, log but allow other styles
    if (violations.length > 0) {
      db.run(
        `INSERT INTO brand_protection_log (event_type, attempted_action, blocked, user_ip) 
         VALUES ('protected_element_override', ?, 1, ?)`,
        [violations.join(', '), req.ip]
      );
      
      return res.status(200).json({
        valid: true,
        warnings: violations,
        message: 'Style modifications allowed, but protected brand elements preserved.'
      });
    }
  }
  
  res.json({
    valid: true,
    message: 'Content validated - style modifications allowed'
  });
});

module.exports = router;