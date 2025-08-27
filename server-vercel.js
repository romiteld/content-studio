const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const brandConfig = require('./server-config/brandLock');
const fs = require('fs');

// Load environment variables
if (fs.existsSync(path.join(__dirname, '.env.local'))) {
  require('dotenv').config({ path: path.join(__dirname, '.env.local') });
} else {
  require('dotenv').config();
}

const app = express();

app.use(cors());
app.use(express.json());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '/tmp/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /docx|doc|pptx|ppt|pdf|txt|md|csv/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Invalid file type. Only content files allowed.');
    }
  }
});

app.get('/api/brand-config', (req, res) => {
  res.json(brandConfig);
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', brand: 'locked', vercel: true });
});

// Routes
app.use('/api/content', require('./server-routes/content-supabase'));
app.use('/api/upload', require('./server-routes/upload-supabase'));
app.use('/api/generate', require('./server-routes/generate-supabase'));
app.use('/api/templates', require('./server-routes/templates-supabase'));
app.use('/api/research', require('./server-routes/research-supabase'));
app.use('/api/social', require('./server-routes/social'));
app.use('/api/ai', require('./server-routes/ai-marketing'));
app.use('/api/ai/image', require('./server-routes/ai-image'));
app.use('/api/vision', require('./server-routes/vision'));
app.use('/api/brand', require('./server-routes/brand-supabase'));

// AI Agents Endpoints (These are now handled by Vercel Functions)
// app.use('/api/agents', require('./api/ai-agents'));

// Auth API
app.use('/api/auth', require('./server-routes/auth-supabase'));

// Partners API
app.use('/api/partners', require('./server-api/partners-supabase'));

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!', details: err.message });
});

module.exports = app;