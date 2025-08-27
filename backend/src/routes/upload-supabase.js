const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const mammoth = require('mammoth');
const pdfParse = require('pdf-parse');
const marked = require('marked');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads-backend');
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Process different file types
const processFile = async (filePath, mimeType) => {
  const fileContent = await fs.readFile(filePath);
  let processedContent = {
    type: 'unknown',
    content: '',
    sections: []
  };

  if (mimeType.includes('word') || filePath.endsWith('.docx')) {
    const result = await mammoth.convertToHtml({ buffer: fileContent });
    processedContent = {
      type: 'word',
      content: result.value,
      sections: extractSections(result.value)
    };
  } else if (mimeType === 'application/pdf' || filePath.endsWith('.pdf')) {
    const pdfData = await pdfParse(fileContent);
    processedContent = {
      type: 'pdf',
      content: pdfData.text,
      sections: extractSections(pdfData.text)
    };
  } else if (mimeType === 'text/markdown' || filePath.endsWith('.md')) {
    const text = fileContent.toString();
    processedContent = {
      type: 'markdown',
      content: marked.parse(text),
      sections: extractSections(text)
    };
  } else if (mimeType === 'text/plain' || filePath.endsWith('.txt')) {
    const text = fileContent.toString();
    processedContent = {
      type: 'text',
      content: text,
      sections: extractSections(text)
    };
  } else if (mimeType === 'text/csv' || filePath.endsWith('.csv')) {
    const text = fileContent.toString();
    processedContent = {
      type: 'csv',
      content: text,
      sections: processCSV(text)
    };
  }

  return processedContent;
};

const extractSections = (content) => {
  const sections = [];
  const lines = content.split(/\n+/);
  let currentSection = { title: 'Introduction', content: [] };

  lines.forEach(line => {
    const headerMatch = line.match(/^#{1,6}\s+(.+)/) || 
                       line.match(/^(.+)\n[=-]+$/) ||
                       (line.length < 100 && line.match(/^[A-Z][A-Za-z\s]+:?\s*$/));
    
    if (headerMatch) {
      if (currentSection.content.length > 0) {
        sections.push({
          ...currentSection,
          content: currentSection.content.join('\n').trim()
        });
      }
      currentSection = { title: headerMatch[1] || line.trim(), content: [] };
    } else if (line.trim()) {
      currentSection.content.push(line);
    }
  });

  if (currentSection.content.length > 0) {
    sections.push({
      ...currentSection,
      content: currentSection.content.join('\n').trim()
    });
  }

  return sections.length > 0 ? sections : [{ title: 'Content', content: content }];
};

const processCSV = (csvText) => {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];
  
  const headers = lines[0].split(',').map(h => h.trim());
  const sections = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    sections.push({
      title: `Row ${i}`,
      content: JSON.stringify(row, null, 2)
    });
  }
  
  return sections;
};

// Upload endpoint
router.post('/file', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const processedContent = await processFile(req.file.path, req.file.mimetype);
    
    // Save to Supabase
    const { data, error } = await supabase
      .from('uploads')
      .insert({
        filename: req.file.filename,
        original_name: req.file.originalname,
        file_type: req.file.mimetype,
        file_path: req.file.path,
        processed_content: processedContent,
        upload_date: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving upload:', error);
      return res.status(500).json({ error: 'Failed to save upload' });
    }

    res.json({
      success: true,
      file: {
        id: data.id,
        filename: req.file.filename,
        originalName: req.file.originalname,
        processedContent: processedContent
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to process upload' });
  }
});

// Get all uploads
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('uploads')
      .select('*')
      .order('upload_date', { ascending: false });

    if (error) {
      console.error('Error fetching uploads:', error);
      return res.status(500).json({ error: 'Failed to fetch uploads' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch uploads' });
  }
});

// Get single upload
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('uploads')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) {
      console.error('Error fetching upload:', error);
      return res.status(404).json({ error: 'Upload not found' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch upload' });
  }
});

// Delete upload
router.delete('/:id', async (req, res) => {
  try {
    // Get file info first
    const { data: upload, error: fetchError } = await supabase
      .from('uploads')
      .select('file_path')
      .eq('id', req.params.id)
      .single();

    if (fetchError) {
      return res.status(404).json({ error: 'Upload not found' });
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('uploads')
      .delete()
      .eq('id', req.params.id);

    if (deleteError) {
      console.error('Error deleting upload:', deleteError);
      return res.status(500).json({ error: 'Failed to delete upload' });
    }

    // Delete physical file
    if (upload.file_path) {
      try {
        await fs.unlink(upload.file_path);
      } catch (err) {
        console.warn('Could not delete file:', err);
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to delete upload' });
  }
});

module.exports = router;