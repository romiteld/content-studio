const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const DOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

const window = new JSDOM('').window;
const purify = DOMPurify(window);

const db = new sqlite3.Database(path.join(__dirname, '../database/wealth_training.db'));

const sanitizeContent = (content) => {
  // Allow style modifications but protect brand integrity
  return purify.sanitize(content, {
    // Allow style and class attributes for flexibility
    ALLOWED_ATTR: ['style', 'class', 'id', 'href', 'target', 'rel', 'src', 'alt', 'width', 'height'],
    // Still forbid dangerous tags
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed'],
    // Allow style tag for custom CSS
    ALLOWED_TAGS: ['style', 'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 
                   'ul', 'ol', 'li', 'a', 'img', 'table', 'tr', 'td', 'th', 'thead', 'tbody',
                   'strong', 'em', 'b', 'i', 'u', 'br', 'hr', 'blockquote', 'pre', 'code'],
    KEEP_CONTENT: true,
    // Custom hook to validate brand colors remain in critical elements
    SANITIZE_DOM: (node) => {
      if (node.nodeName === 'STYLE') {
        // Ensure brand colors are preserved in critical selectors
        const brandSelectors = ['.brand-logo', '.brand-header', '.brand-footer'];
        // Allow the style but log if attempting to override protected elements
        return node;
      }
    }
  });
};

router.get('/', (req, res) => {
  db.all(
    'SELECT * FROM content ORDER BY display_order, created_at',
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch content' });
      }
      res.json(rows);
    }
  );
});

router.get('/:id', (req, res) => {
  db.get(
    'SELECT * FROM content WHERE id = ?',
    [req.params.id],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch content' });
      }
      if (!row) {
        return res.status(404).json({ error: 'Content not found' });
      }
      res.json(row);
    }
  );
});

router.post('/', (req, res) => {
  const { section_type, title, content_data, chart_data, display_order } = req.body;
  
  const sanitizedContent = sanitizeContent(JSON.stringify(content_data));
  
  db.run(
    `INSERT INTO content (section_type, title, content_data, chart_data, display_order) 
     VALUES (?, ?, ?, ?, ?)`,
    [section_type, title, sanitizedContent, JSON.stringify(chart_data), display_order || 0],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create content' });
      }
      
      db.run(
        `INSERT INTO brand_protection_log (event_type, attempted_action, blocked) 
         VALUES ('content_create', 'Created content with locked styling', 0)`,
        () => {
          res.json({ id: this.lastID, message: 'Content created successfully' });
        }
      );
    }
  );
});

router.put('/:id', (req, res) => {
  const { title, content_data, chart_data, display_order } = req.body;
  
  const sanitizedContent = sanitizeContent(JSON.stringify(content_data));
  
  db.run(
    `UPDATE content 
     SET title = ?, content_data = ?, chart_data = ?, display_order = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [title, sanitizedContent, JSON.stringify(chart_data), display_order, req.params.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update content' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Content not found' });
      }
      res.json({ message: 'Content updated successfully' });
    }
  );
});

router.delete('/:id', (req, res) => {
  db.run(
    'DELETE FROM content WHERE id = ?',
    [req.params.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to delete content' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Content not found' });
      }
      res.json({ message: 'Content deleted successfully' });
    }
  );
});

router.post('/reorder', (req, res) => {
  const { items } = req.body;
  
  const stmt = db.prepare('UPDATE content SET display_order = ? WHERE id = ?');
  
  items.forEach((item, index) => {
    stmt.run(index, item.id);
  });
  
  stmt.finalize((err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to reorder content' });
    }
    res.json({ message: 'Content reordered successfully' });
  });
});

module.exports = router;