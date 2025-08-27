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
      cb('Error: Invalid file type. Only training materials allowed.');
    }
  }
});

app.get('/api/brand-config', (req, res) => {
  res.json(brandConfig);
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', brand: 'locked' });
});

const contentRoutes = require('./routes/content');
const uploadRoutes = require('./routes/upload');
const generateRoutes = require('./routes/generate');
const templateRoutes = require('./routes/templates');
const researchRoutes = require('./routes/research');
const socialRoutes = require('./routes/social');

// AI Marketing Routes
const geminiMarketing = require('./api/gemini-marketing-ai');

app.use('/api/content', contentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/generate', generateRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/research', researchRoutes);
app.use('/api/social', socialRoutes);

// Gemini AI Marketing Endpoints
app.post('/api/ai/campaign', geminiMarketing.createCampaign);
app.post('/api/ai/quick-generate', geminiMarketing.quickGenerate);
app.post('/api/ai/generate-image', geminiMarketing.generateImage);
app.post('/api/ai/edit-image', geminiMarketing.editImage);
app.post('/api/ai/content-with-visuals', geminiMarketing.generateContentWithVisuals);
app.get('/api/ai/campaign/:campaignId', geminiMarketing.getCampaign);
app.get('/api/ai/campaigns', geminiMarketing.listCampaigns);

// Gemini Vision & Image Generation Endpoints
const geminiVision = require('./api/gemini-vision');
app.post('/api/vision/analyze', upload.single('image'), geminiVision.analyzeMarketingImage);
app.post('/api/vision/generate-specs', geminiVision.generateVisualSpecs);
app.post('/api/vision/content-variations', geminiVision.generateContentVariations);
app.post('/api/vision/campaign-consistency', upload.array('images', 10), geminiVision.analyzeCampaignConsistency);
app.post('/api/vision/generate-prompt', geminiVision.generateImagePrompt);
app.post('/api/vision/edit-instructions', upload.single('image'), geminiVision.generateImageEditInstructions);
app.post('/api/vision/generate-variations', geminiVision.generateImageVariations);
app.post('/api/vision/generate-code', geminiVision.generateCodeFromSpecs);

// AI Agents Endpoints
const aiAgents = require('./api/ai-agents');
app.post('/api/agents/generate', aiAgents.generateContent);
app.post('/api/agents/weekly', aiAgents.generateWeeklyContent);
app.post('/api/agents/visual', aiAgents.generateVisual);
app.post('/api/agents/validate', aiAgents.validateCompliance);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Brand configuration: LOCKED');
  console.log('Style modifications: DISABLED');
});