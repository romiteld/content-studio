// Gemini 2.5 Flash Vision & Image Analysis API
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs').promises;
const path = require('path');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

// Helper function to convert file to base64
async function fileToGenerativePart(filePath, mimeType) {
  const data = await fs.readFile(filePath);
  return {
    inlineData: {
      data: Buffer.from(data).toString('base64'),
      mimeType
    }
  };
}

module.exports = {
  // Analyze uploaded image for marketing insights
  async analyzeMarketingImage(req, res) {
    try {
      const { imagePath, analysisType } = req.body;
      
      if (!imagePath) {
        return res.status(400).json({ error: 'Image path required' });
      }

      const imagePart = await fileToGenerativePart(imagePath, 'image/jpeg');
      
      const prompts = {
        brand: `Analyze this image for brand consistency with The Well's brand (Black, Gold #D4AF37, Cyan #4FC3F7). 
                Provide detailed feedback on: color usage, typography, visual hierarchy, and brand alignment.`,
        competitor: `Analyze this competitor's marketing material. Identify: 
                    key messaging, visual strategies, target audience indicators, and unique value propositions.`,
        performance: `Predict the performance of this visual on LinkedIn. Consider: 
                     engagement potential, visual stopping power, message clarity, and call-to-action effectiveness.`,
        accessibility: `Evaluate accessibility of this image. Check: 
                       color contrast, text readability, visual clarity, and inclusive design elements.`
      };

      const prompt = prompts[analysisType] || prompts.brand;
      const result = await model.generateContent([imagePart, prompt]);
      const analysis = result.response.text();

      res.json({
        success: true,
        analysis,
        type: analysisType
      });
    } catch (error) {
      console.error('Image analysis error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Generate visual design specifications
  async generateVisualSpecs(req, res) {
    try {
      const { 
        contentType, 
        message, 
        targetAudience, 
        platform,
        campaignObjective 
      } = req.body;

      const prompt = `Create detailed visual design specifications for a ${contentType} targeting ${targetAudience} on ${platform}.

      Campaign Message: ${message}
      Objective: ${campaignObjective}
      Brand: The Well (Wealth Management Recruitment)
      Brand Colors: Black primary, Gold (#D4AF37) accent, Cyan (#4FC3F7) secondary
      
      Provide specifications in JSON format including:
      {
        "layout": {
          "format": "square/landscape/portrait/carousel",
          "dimensions": "exact pixel dimensions",
          "grid": "column/row structure",
          "sections": ["header", "body", "cta", etc]
        },
        "typography": {
          "headline": { "font": "", "size": "", "weight": "", "color": "" },
          "body": { "font": "", "size": "", "weight": "", "color": "" },
          "cta": { "font": "", "size": "", "weight": "", "color": "" }
        },
        "colorScheme": {
          "primary": "#hex",
          "secondary": "#hex",
          "accent": "#hex",
          "text": "#hex",
          "background": "#hex"
        },
        "visualElements": {
          "icons": ["icon descriptions"],
          "patterns": "pattern description",
          "images": "image requirements",
          "charts": "data visualization specs"
        },
        "contentBlocks": [
          {
            "type": "headline/body/cta/image/chart",
            "content": "actual text or description",
            "styling": "specific styling notes"
          }
        ],
        "animationSuggestions": ["if applicable for platform"]
      }`;

      const result = await model.generateContent(prompt);
      let specifications = result.response.text();

      // Try to parse as JSON
      try {
        specifications = JSON.parse(specifications.replace(/```json\n?/g, '').replace(/```\n?/g, ''));
      } catch (e) {
        // If not valid JSON, return as is
      }

      res.json({
        success: true,
        specifications,
        contentType,
        platform
      });
    } catch (error) {
      console.error('Visual spec generation error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Generate content variations using vision capabilities
  async generateContentVariations(req, res) {
    try {
      const { baseContent, numberOfVariations = 3, tone, platform } = req.body;

      const prompt = `Generate ${numberOfVariations} variations of this marketing content for ${platform}.
      
      Base Content: ${baseContent}
      Desired Tone: ${tone}
      
      Each variation should:
      - Maintain core message but use different approaches
      - Optimize for ${platform} best practices
      - Include appropriate CTAs
      - Use different hooks and emotional triggers
      
      Format as JSON array with structure:
      [{
        "variation": 1,
        "hook": "attention grabbing opener",
        "body": "main content",
        "cta": "call to action",
        "hashtags": ["relevant", "hashtags"],
        "emotionalTrigger": "psychological approach used",
        "estimatedEngagement": "high/medium/low with reasoning"
      }]`;

      const result = await model.generateContent(prompt);
      let variations = result.response.text();

      try {
        variations = JSON.parse(variations.replace(/```json\n?/g, '').replace(/```\n?/g, ''));
      } catch (e) {
        // Return as text if not valid JSON
      }

      res.json({
        success: true,
        variations,
        platform
      });
    } catch (error) {
      console.error('Content variation error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Analyze multiple images for campaign consistency
  async analyzeCampaignConsistency(req, res) {
    try {
      const { imagePaths } = req.body;

      if (!imagePaths || imagePaths.length === 0) {
        return res.status(400).json({ error: 'Image paths required' });
      }

      const imageParts = await Promise.all(
        imagePaths.map(path => fileToGenerativePart(path, 'image/jpeg'))
      );

      const prompt = `Analyze these ${imagePaths.length} images as part of a marketing campaign.
      
      Evaluate:
      1. Visual consistency across all images
      2. Brand alignment and coherence
      3. Message consistency
      4. Design system adherence
      5. Color palette consistency
      6. Typography harmony
      7. Overall campaign effectiveness
      
      Provide:
      - Consistency score (1-10)
      - Detailed analysis of strengths
      - Specific inconsistencies found
      - Recommendations for improvement
      - Professional assessment`;

      const result = await model.generateContent([...imageParts, prompt]);
      const analysis = result.response.text();

      res.json({
        success: true,
        analysis,
        imageCount: imagePaths.length
      });
    } catch (error) {
      console.error('Campaign consistency analysis error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Generate detailed image creation prompt for external tools
  async generateImagePrompt(req, res) {
    try {
      const { 
        concept,
        style,
        platform,
        dimensions,
        brandGuidelines = true
      } = req.body;

      const prompt = `Create a detailed image generation prompt for: ${concept}
      
      Platform: ${platform}
      Dimensions: ${dimensions}
      Style: ${style}
      Brand: The Well (Wealth Management Recruitment)
      
      ${brandGuidelines ? `
      Brand Requirements:
      - Primary: Black backgrounds with sophisticated feel
      - Accent: Gold (#D4AF37) for key highlights and CTAs
      - Secondary: Cyan (#4FC3F7) for data visualizations
      - Typography: Clean, modern sans-serif
      - Overall: Premium, trustworthy, professional
      ` : ''}
      
      Generate a comprehensive prompt that includes:
      1. Detailed visual composition
      2. Lighting and atmosphere
      3. Color distribution and balance
      4. Specific elements and their positions
      5. Mood and emotional tone
      6. Technical quality requirements
      7. Negative prompts (what to avoid)
      
      Format the output as:
      {
        "mainPrompt": "detailed description for image generation",
        "style": "artistic style modifiers",
        "negativePrompt": "elements to avoid",
        "technicalSpecs": {
          "quality": "ultra high quality, 8k, professional photography",
          "lighting": "specific lighting setup",
          "composition": "rule of thirds, golden ratio, etc"
        }
      }`;

      const result = await model.generateContent(prompt);
      let imagePrompt = result.response.text();

      try {
        imagePrompt = JSON.parse(imagePrompt.replace(/```json\n?/g, '').replace(/```\n?/g, ''));
      } catch (e) {
        // Return as text if not valid JSON
      }

      res.json({
        success: true,
        imagePrompt,
        platform,
        dimensions
      });
    } catch (error) {
      console.error('Image prompt generation error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Edit image with AI guidance
  async generateImageEditInstructions(req, res) {
    try {
      const { imagePath, editRequest, editType } = req.body;

      if (!imagePath) {
        return res.status(400).json({ error: 'Image path required' });
      }

      const imagePart = await fileToGenerativePart(imagePath, 'image/jpeg');

      const editPrompts = {
        colorCorrection: `Analyze this image and provide specific color correction instructions:
          - Identify color balance issues
          - Suggest RGB/HSL adjustments
          - Recommend contrast and brightness changes
          - Specify areas needing selective color adjustment
          - Align with The Well brand colors where appropriate`,
        
        composition: `Analyze composition and suggest improvements:
          - Identify compositional weaknesses
          - Suggest cropping coordinates
          - Recommend element repositioning
          - Advise on visual hierarchy improvements
          - Provide rule of thirds alignment guidance`,
        
        branding: `Provide instructions to align with The Well branding:
          - Where to add gold (#D4AF37) accents
          - Background adjustments for black/dark theme
          - Cyan (#4FC3F7) data highlight placements
          - Logo placement recommendations
          - Typography overlay suggestions`,
        
        enhancement: `Suggest professional enhancements:
          - Sharpening specific areas
          - Noise reduction needs
          - Lighting adjustments
          - Shadow/highlight recovery
          - Professional polish additions`
      };

      const prompt = editRequest || editPrompts[editType] || editPrompts.enhancement;
      
      const result = await model.generateContent([
        imagePart,
        `${prompt}\n\nProvide specific, actionable editing instructions that can be implemented in image editing software.`
      ]);
      
      const instructions = result.response.text();

      res.json({
        success: true,
        editInstructions: instructions,
        editType
      });
    } catch (error) {
      console.error('Image edit instruction error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Generate image variations and A/B test suggestions
  async generateImageVariations(req, res) {
    try {
      const { baseImagePath, variationType, count = 3 } = req.body;

      let prompt;
      if (baseImagePath) {
        const imagePart = await fileToGenerativePart(baseImagePath, 'image/jpeg');
        prompt = [
          imagePart,
          `Based on this image, suggest ${count} variations for A/B testing on LinkedIn.
          
          For each variation, provide:
          1. Specific changes to make
          2. Hypothesis for why this might perform better
          3. Target metric (CTR, engagement, conversions)
          4. Implementation instructions
          5. Expected impact (percentage improvement estimate)`
        ];
      } else {
        prompt = `Generate ${count} image concept variations for ${variationType} on LinkedIn.
        
        Each variation should:
        - Target different psychological triggers
        - Use different visual styles
        - Appeal to various audience segments
        - Include specific visual elements
        - Have unique value propositions
        
        Format as structured JSON with complete specifications.`;
      }

      const result = await model.generateContent(prompt);
      const variations = result.response.text();

      res.json({
        success: true,
        variations,
        count
      });
    } catch (error) {
      console.error('Image variation generation error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Generate HTML/CSS from visual specifications
  async generateCodeFromSpecs(req, res) {
    try {
      const { specifications, framework = 'react' } = req.body;

      const prompt = `Convert these visual design specifications into production-ready ${framework} code:
      
      Specifications: ${JSON.stringify(specifications)}
      
      Generate:
      1. Complete component code with proper structure
      2. Styled-components or CSS modules
      3. Responsive design implementation
      4. Accessibility features (ARIA labels, semantic HTML)
      5. Animation/transition effects if specified
      
      Use The Well's brand colors:
      - Black: #000000
      - Gold: #D4AF37
      - Cyan: #4FC3F7
      
      Ensure the code is:
      - Clean and well-commented
      - Following best practices
      - Optimized for performance
      - Cross-browser compatible`;

      const result = await model.generateContent(prompt);
      const code = result.response.text();

      res.json({
        success: true,
        code,
        framework
      });
    } catch (error) {
      console.error('Code generation error:', error);
      res.status(500).json({ error: error.message });
    }
  }
};