const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const sqlite3 = require('sqlite3').verbose();
const mammoth = require('mammoth');
const pdfParse = require('pdf-parse');
const marked = require('marked');

const db = new sqlite3.Database(path.join(__dirname, '../database/wealth_training.db'));

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'training-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /\.(docx|doc|pdf|txt|md|csv)$/i;
    const extname = allowedTypes.test(path.extname(file.originalname));
    
    if (extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only content files allowed.'));
    }
  }
});

const processFile = async (file) => {
  const ext = path.extname(file.originalname).toLowerCase();
  let content = '';
  
  try {
    switch (ext) {
      case '.docx':
      case '.doc':
        const docResult = await mammoth.extractRawText({ path: file.path });
        content = docResult.value;
        break;
        
      case '.pdf':
        const pdfBuffer = await fs.readFile(file.path);
        const pdfData = await pdfParse(pdfBuffer);
        content = pdfData.text;
        break;
        
      case '.txt':
        content = await fs.readFile(file.path, 'utf8');
        break;
        
      case '.md':
        const mdContent = await fs.readFile(file.path, 'utf8');
        content = marked.parse(mdContent);
        break;
        
      case '.csv':
        content = await fs.readFile(file.path, 'utf8');
        break;
        
      default:
        content = 'Unsupported file type for content extraction';
    }
  } catch (error) {
    console.error('Error processing file:', error);
    content = 'Error processing file content';
  }
  
  return content;
};

router.post('/single', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  try {
    const processedContent = await processFile(req.file);
    
    db.run(
      `INSERT INTO uploads (filename, original_name, file_type, file_path, processed_content) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        req.file.filename,
        req.file.originalname,
        req.file.mimetype,
        req.file.path,
        JSON.stringify({ content: processedContent })
      ],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to save upload record' });
        }
        
        res.json({
          id: this.lastID,
          filename: req.file.filename,
          originalName: req.file.originalname,
          processedContent: processedContent.substring(0, 500) + '...',
          message: 'File uploaded and processed successfully'
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Failed to process file' });
  }
});

router.post('/batch', upload.array('files', 10), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }
  
  const results = [];
  
  for (const file of req.files) {
    try {
      const processedContent = await processFile(file);
      
      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO uploads (filename, original_name, file_type, file_path, processed_content) 
           VALUES (?, ?, ?, ?, ?)`,
          [
            file.filename,
            file.originalname,
            file.mimetype,
            file.path,
            JSON.stringify({ content: processedContent })
          ],
          function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
          }
        );
      });
      
      results.push({
        filename: file.originalname,
        status: 'success',
        preview: processedContent.substring(0, 200) + '...'
      });
    } catch (error) {
      results.push({
        filename: file.originalname,
        status: 'failed',
        error: error.message
      });
    }
  }
  
  res.json({
    message: 'Batch upload processed',
    results: results
  });
});

router.get('/history', (req, res) => {
  db.all(
    'SELECT id, filename, original_name, file_type, upload_date FROM uploads ORDER BY upload_date DESC LIMIT 50',
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch upload history' });
      }
      res.json(rows);
    }
  );
});

router.delete('/:id', async (req, res) => {
  db.get(
    'SELECT file_path FROM uploads WHERE id = ?',
    [req.params.id],
    async (err, row) => {
      if (err || !row) {
        return res.status(404).json({ error: 'Upload not found' });
      }
      
      try {
        await fs.unlink(row.file_path);
      } catch (error) {
        console.error('Failed to delete file:', error);
      }
      
      db.run(
        'DELETE FROM uploads WHERE id = ?',
        [req.params.id],
        (err) => {
          if (err) {
            return res.status(500).json({ error: 'Failed to delete upload record' });
          }
          res.json({ message: 'Upload deleted successfully' });
        }
      );
    }
  );
});

module.exports = router;