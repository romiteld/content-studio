const express = require('express');
const router = express.Router();
const { optimizeForPlatform, generateSocialMediaPackage, platformGuidelines } = require('../services/platformOptimizer');

// Get platform guidelines
router.get('/guidelines/:platform', (req, res) => {
  const { platform } = req.params;
  const guidelines = platformGuidelines[platform.toLowerCase()];
  
  if (!guidelines) {
    return res.status(404).json({ 
      error: 'Platform not found',
      available: Object.keys(platformGuidelines)
    });
  }
  
  res.json({
    platform: platform,
    guidelines: guidelines,
    brandCompliant: true
  });
});

// Optimize content for specific platform
router.post('/optimize', (req, res) => {
  const { content, platform, contentType } = req.body;
  
  if (!content || !platform) {
    return res.status(400).json({ error: 'Content and platform are required' });
  }
  
  try {
    console.log(`Optimizing content for ${platform}`);
    const optimized = optimizeForPlatform(content, platform, contentType);
    
    res.json({
      success: true,
      ...optimized
    });
  } catch (error) {
    console.error('Optimization error:', error);
    res.status(500).json({ error: 'Failed to optimize content' });
  }
});

// Generate complete social media package
router.post('/package', (req, res) => {
  const { content, title } = req.body;
  
  if (!content) {
    return res.status(400).json({ error: 'Content is required' });
  }
  
  try {
    console.log('Generating social media package');
    const package = generateSocialMediaPackage(
      content, 
      title || 'Wealth Management Insights'
    );
    
    res.json({
      success: true,
      package: package
    });
  } catch (error) {
    console.error('Package generation error:', error);
    res.status(500).json({ error: 'Failed to generate social media package' });
  }
});

// Validate content for compliance
router.post('/validate', (req, res) => {
  const { content, platform } = req.body;
  
  if (!content || !platform) {
    return res.status(400).json({ error: 'Content and platform are required' });
  }
  
  const guidelines = platformGuidelines[platform.toLowerCase()];
  if (!guidelines) {
    return res.status(404).json({ error: 'Platform not found' });
  }
  
  const validation = {
    platform: platform,
    compliant: true,
    issues: [],
    warnings: [],
    suggestions: []
  };
  
  // Check length
  if (content.length > guidelines.postLimit) {
    validation.compliant = false;
    validation.issues.push(`Content exceeds ${platform} limit of ${guidelines.postLimit} characters`);
  }
  
  // Check for forbidden content patterns
  const lowerContent = content.toLowerCase();
  
  if (lowerContent.includes('guaranteed return') || lowerContent.includes('risk-free')) {
    validation.compliant = false;
    validation.issues.push('Contains prohibited financial guarantee claims');
  }
  
  if ((lowerContent.includes('invest now') || lowerContent.includes('buy now')) && 
      !lowerContent.includes('not financial advice')) {
    validation.warnings.push('Direct financial advice should include disclaimer');
  }
  
  // Check hashtag usage
  const hashtags = (content.match(/#\w+/g) || []).length;
  if (hashtags > guidelines.hashtagLimit) {
    validation.warnings.push(`Too many hashtags (${hashtags}). Recommended: ${guidelines.hashtagLimit}`);
  }
  
  // Add platform-specific suggestions
  validation.suggestions = guidelines.bestPractices.slice(0, 3);
  
  res.json(validation);
});

// Get cross-posting schedule
router.post('/schedule', (req, res) => {
  const { content, startDate } = req.body;
  
  if (!content) {
    return res.status(400).json({ error: 'Content is required' });
  }
  
  const schedule = {
    content: content.substring(0, 100) + '...',
    posts: []
  };
  
  const start = startDate ? new Date(startDate) : new Date();
  const platforms = ['linkedin', 'facebook', 'twitter', 'instagram'];
  
  // Generate staggered posting schedule
  platforms.forEach((platform, index) => {
    const postDate = new Date(start);
    postDate.setHours(postDate.getHours() + (index * 3)); // 3 hours apart
    
    // Skip weekends for LinkedIn
    if (platform === 'linkedin' && (postDate.getDay() === 0 || postDate.getDay() === 6)) {
      postDate.setDate(postDate.getDate() + (postDate.getDay() === 0 ? 1 : 2));
    }
    
    schedule.posts.push({
      platform: platform,
      scheduledTime: postDate.toISOString(),
      optimized: optimizeForPlatform(content, platform).optimizedContent.substring(0, 100) + '...',
      status: 'scheduled'
    });
  });
  
  res.json({
    success: true,
    schedule: schedule
  });
});

module.exports = router;