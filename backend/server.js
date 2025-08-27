const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const brandConfig = require('./config/brandLock');
const fs = require('fs');

// Load .env.local if it exists
if (fs.existsSync(path.join(__dirname, '.env.local'))) {
  require('dotenv').config({ path: path.join(__dirname, '.env.local') });
} else {
  require('dotenv').config();
}

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend/build')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/brand-assets', express.static(path.join(__dirname, '../brand-assets/protected')));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
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
  res.json({ status: 'OK', brand: 'locked' });
});

// Routes
app.use('/api/content', require('./routes/content'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/generate', require('./routes/generate'));
app.use('/api/templates', require('./routes/templates'));
app.use('/api/research', require('./routes/research'));
app.use('/api/social', require('./routes/social'));
app.use('/api/ai', require('./routes/ai-marketing'));
app.use('/api/vision', require('./routes/vision'));
app.use('/api/brand', require('./routes/brand'));

// AI Agents Endpoints
const aiAgents = require('./api/ai-agents');
app.post('/api/agents/generate', aiAgents.generateContent);
app.post('/api/agents/weekly', aiAgents.generateWeeklyContent);
app.post('/api/agents/visual', aiAgents.generateVisual);
app.post('/api/agents/validate', aiAgents.validateCompliance);

// Partners API
app.use('/api/partners', require('./api/partners'));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Brand configuration: LOCKED');
  console.log('Style modifications: DISABLED');
});