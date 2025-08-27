const express = require('express');
const router = express.Router();
const geminiMarketing = require('../api/gemini-marketing-ai');

// Campaign management
router.post('/campaign', geminiMarketing.createCampaign);
router.post('/quick-generate', geminiMarketing.quickGenerate);
router.get('/campaign/:campaignId', geminiMarketing.getCampaign);
router.get('/campaigns', geminiMarketing.listCampaigns);

// Image generation
router.post('/generate-image', geminiMarketing.generateImage);
router.post('/edit-image', geminiMarketing.editImage);
router.post('/content-with-visuals', geminiMarketing.generateContentWithVisuals);

module.exports = router;