const express = require('express');
const router = express.Router();
const multer = require('multer');
const geminiVision = require('../server-api/gemini-vision');

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Vision analysis endpoints
router.post('/analyze', upload.single('image'), geminiVision.analyzeMarketingImage);
router.post('/generate-specs', geminiVision.generateVisualSpecs);
router.post('/content-variations', geminiVision.generateContentVariations);
router.post('/campaign-consistency', upload.array('images', 10), geminiVision.analyzeCampaignConsistency);
router.post('/generate-prompt', geminiVision.generateImagePrompt);
router.post('/edit-instructions', upload.single('image'), geminiVision.generateImageEditInstructions);
router.post('/generate-variations', geminiVision.generateImageVariations);
router.post('/generate-code', geminiVision.generateCodeFromSpecs);

module.exports = router;