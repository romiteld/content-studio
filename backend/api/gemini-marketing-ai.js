// Complete Marketing AI System using Gemini 2.0 Flash with Native Image Generation
// Full omnichannel marketing automation with built-in image creation

const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs').promises;
const path = require('path');

// Initialize Gemini with native image generation support
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || '';
if (!apiKey) {
  console.warn('Warning: No Gemini/Google AI API key found. Image generation will not work.');
}
const genAI = new GoogleGenerativeAI(apiKey);

// Get both text and image generation models
const textModel = apiKey ? genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' }) : null;
const imageModel = apiKey ? genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' }) : null;

// ============================================
// UNIFIED MARKETING AI AGENT
// ============================================

class UnifiedMarketingAgent {
  constructor() {
    this.model = imageModel;
    this.generatedAssets = [];
  }

  // Generate text content
  async generateText(prompt, context = {}) {
    try {
      const fullPrompt = `
        You are The Well's marketing AI assistant. 
        Context: ${JSON.stringify(context)}
        Task: ${prompt}
        
        Guidelines:
        - Professional yet approachable tone
        - Include relevant data and statistics
        - Optimize for the specific platform
        - Include clear CTAs
        - Ensure financial compliance
      `;

      const result = await this.model.generateContent(fullPrompt);
      return result.response.text();
    } catch (error) {
      console.error('Text generation error:', error);
      throw error;
    }
  }

  // Generate images using native Gemini image generation
  async generateImage(prompt, specifications = {}) {
    try {
      // Enhanced prompt for marketing visuals
      const imagePrompt = `
        ${prompt}
        
        Brand Guidelines for The Well:
        - Primary color: Black (#000000)
        - Accent color: Gold (#D4AF37)
        - Secondary color: Cyan (#4FC3F7)
        - Style: Professional, modern, minimalist corporate design
        - Include subtle "The Well" branding
        
        Technical Requirements:
        ${specifications.dimensions ? `Dimensions: ${specifications.dimensions}` : ''}
        ${specifications.format ? `Format: ${specifications.format}` : ''}
        ${specifications.style ? `Style: ${specifications.style}` : ''}
      `;

      const result = await this.model.generateContent(imagePrompt);
      
      // Extract the generated image from response
      const candidate = result.response.candidates[0];
      let imageData = null;

      for (const part of candidate.content.parts) {
        if (part.inlineData) {
          imageData = part.inlineData.data;
          break;
        }
      }

      if (imageData) {
        // Save image to file
        const timestamp = Date.now();
        const filename = `gemini-generated-${timestamp}.png`;
        const filepath = path.join(__dirname, '../../generated/images', filename);
        
        // Ensure directory exists
        await fs.mkdir(path.dirname(filepath), { recursive: true });
        
        // Save the base64 image data
        const buffer = Buffer.from(imageData, 'base64');
        await fs.writeFile(filepath, buffer);
        
        this.generatedAssets.push({
          type: 'image',
          filename,
          filepath,
          prompt: prompt,
          timestamp
        });

        return {
          success: true,
          filename,
          filepath,
          url: `/generated/images/${filename}`,
          prompt: imagePrompt
        };
      }

      return {
        success: false,
        error: 'No image generated'
      };
    } catch (error) {
      console.error('Image generation error:', error);
      throw error;
    }
  }

  // Generate text and image together (interleaved)
  async generateContentWithVisuals(contentType, topic, specifications = {}) {
    try {
      const prompt = `
        Create a complete ${contentType} about ${topic} for The Well recruitment firm.
        Include both written content and describe ideal accompanying images.
        
        Format:
        1. Main text content
        2. Image description for visual accompaniment
        3. Call to action
      `;

      const textResult = await this.generateText(prompt, { contentType, topic });
      
      // Parse the response to extract image description
      const imageDescMatch = textResult.match(/Image description:(.*?)(?:Call to action:|$)/s);
      const imageDescription = imageDescMatch ? imageDescMatch[1].trim() : 'Professional marketing visual';

      // Generate the accompanying image
      const imageResult = await this.generateImage(
        `Create a ${contentType} visual: ${imageDescription}`,
        specifications
      );

      return {
        text: textResult,
        image: imageResult,
        contentType,
        topic
      };
    } catch (error) {
      console.error('Content with visuals generation error:', error);
      throw error;
    }
  }

  // Edit existing images with text prompts
  async editImage(imagePath, editPrompt) {
    try {
      // Read the existing image
      const imageData = await fs.readFile(imagePath);
      const base64Image = imageData.toString('base64');

      const prompt = [
        { text: editPrompt },
        {
          inlineData: {
            mimeType: 'image/png',
            data: base64Image
          }
        }
      ];

      const result = await this.model.generateContent(prompt);
      
      // Extract edited image
      const candidate = result.response.candidates[0];
      for (const part of candidate.content.parts) {
        if (part.inlineData) {
          const editedImageData = part.inlineData.data;
          const timestamp = Date.now();
          const filename = `edited-${timestamp}.png`;
          const filepath = path.join(__dirname, '../../generated/images', filename);
          
          const buffer = Buffer.from(editedImageData, 'base64');
          await fs.writeFile(filepath, buffer);
          
          return {
            success: true,
            filename,
            filepath,
            url: `/generated/images/${filename}`
          };
        }
      }

      return { success: false, error: 'No edited image generated' };
    } catch (error) {
      console.error('Image editing error:', error);
      throw error;
    }
  }
}

// ============================================
// SPECIALIZED CONTENT GENERATORS
// ============================================

class MarketingContentFactory {
  constructor() {
    this.agent = new UnifiedMarketingAgent();
  }

  // LinkedIn Content Suite
  async generateLinkedInCampaign(brief) {
    const campaign = {
      posts: [],
      articles: [],
      visuals: []
    };

    // Generate Talent Ticker
    const talentTicker = await this.agent.generateContentWithVisuals(
      'LinkedIn Talent Market Update',
      brief.topic || 'Weekly hiring trends in wealth management',
      { dimensions: '1200x627', format: 'landscape' }
    );
    campaign.posts.push(talentTicker);

    // Generate thought leadership article
    const article = await this.agent.generateText(
      `Write a 1500-word LinkedIn article about ${brief.topic} for wealth management professionals`,
      { platform: 'linkedin', type: 'article' }
    );
    campaign.articles.push(article);

    // Generate carousel post
    const carouselPrompt = `
      Create a 10-slide LinkedIn carousel about ${brief.topic}.
      Each slide should have minimal text and high visual impact.
      Use The Well's brand colors: Black, Gold (#D4AF37), Cyan (#4FC3F7).
    `;
    
    const carouselVisual = await this.agent.generateImage(
      carouselPrompt,
      { dimensions: '1080x1080', format: 'square', style: 'modern infographic' }
    );
    campaign.visuals.push(carouselVisual);

    return campaign;
  }

  // Email Marketing Suite
  async generateEmailCampaign(brief) {
    const campaign = {
      welcome_series: [],
      newsletters: [],
      headers: []
    };

    // Generate welcome email series (5 emails)
    for (let i = 1; i <= 5; i++) {
      const email = await this.agent.generateText(
        `Create email ${i} of 5 in a welcome series for ${brief.audience}. 
         Focus on: ${this.getWelcomeEmailTopic(i)}`,
        { email_number: i, total: 5 }
      );
      
      // Generate email header image
      const header = await this.agent.generateImage(
        `Modern email header for wealth management firm, email ${i} of welcome series. 
         Minimalist design with gold accent line.`,
        { dimensions: '600x200', format: 'banner' }
      );
      
      campaign.welcome_series.push({ email, header });
    }

    // Generate monthly newsletter
    const newsletter = await this.agent.generateContentWithVisuals(
      'Monthly Newsletter',
      'Wealth Management Industry Updates',
      { dimensions: '600x400' }
    );
    campaign.newsletters.push(newsletter);

    return campaign;
  }

  // Social Media Visual Suite
  async generateSocialMediaAssets(brief) {
    const assets = {};

    // Platform-specific dimensions
    const platformSpecs = {
      instagram_post: { dimensions: '1080x1080', style: 'vibrant, eye-catching' },
      instagram_story: { dimensions: '1080x1920', style: 'vertical, mobile-first' },
      facebook_post: { dimensions: '1200x630', style: 'engaging, shareable' },
      twitter_post: { dimensions: '1200x675', style: 'concise, impactful' },
      youtube_thumbnail: { dimensions: '1280x720', style: 'clickable, high contrast' },
      tiktok_cover: { dimensions: '1080x1920', style: 'trendy, Gen Z appeal' }
    };

    for (const [platform, specs] of Object.entries(platformSpecs)) {
      const asset = await this.agent.generateImage(
        `Create ${platform.replace('_', ' ')} graphic for The Well recruitment.
         Topic: ${brief.topic}
         Include text overlay: "${brief.headline || 'Join The Well'}"
         Style: ${specs.style}`,
        specs
      );
      assets[platform] = asset;
    }

    return assets;
  }

  // Blog & SEO Content
  async generateBlogPost(topic, keywords = []) {
    // Generate the article
    const article = await this.agent.generateText(
      `Write a 2000-word SEO-optimized blog post about "${topic}".
       Target keywords: ${keywords.join(', ')}
       Include: Introduction, 5 main sections with H2 headings, conclusion, and meta description.
       Tone: Professional but conversational, targeting wealth management firms.`,
      { type: 'blog', seo: true }
    );

    // Generate featured image
    const featuredImage = await this.agent.generateImage(
      `Professional blog header image for article about ${topic}.
       Modern corporate design with abstract geometric elements.
       Include subtle financial/wealth management imagery.`,
      { dimensions: '1200x628', style: 'blog hero image' }
    );

    // Generate inline infographic
    const infographic = await this.agent.generateImage(
      `Clean infographic showing key statistics about ${topic}.
       Use icons and charts, minimal text, brand colors.`,
      { dimensions: '800x1200', style: 'infographic' }
    );

    return {
      article,
      featuredImage,
      infographic,
      seoData: {
        title: `${topic} | The Well`,
        keywords,
        estimatedReadTime: Math.ceil(2000 / 200) // 200 words per minute
      }
    };
  }

  // Video Content Scripts & Thumbnails
  async generateVideoContent(brief) {
    const videoContent = {};

    // Generate script
    const script = await this.agent.generateText(
      `Create a ${brief.duration || '60-second'} video script about ${brief.topic}.
       Format: Hook (5 sec), Problem (15 sec), Solution (30 sec), CTA (10 sec)
       Include: Visual cues, on-screen text suggestions, and voiceover.`,
      { platform: brief.platform || 'youtube', duration: brief.duration }
    );
    videoContent.script = script;

    // Generate thumbnail
    const thumbnail = await this.agent.generateImage(
      `YouTube thumbnail with high click-through potential.
       Topic: ${brief.topic}
       Include: Expressive face or eye-catching visual, bold text overlay,
       contrasting colors, professional but attention-grabbing.`,
      { dimensions: '1280x720', style: 'youtube thumbnail' }
    );
    videoContent.thumbnail = thumbnail;

    // Generate social media teaser
    const teaser = await this.agent.generateImage(
      `Social media teaser graphic for video about ${brief.topic}.
       Include play button overlay, intriguing visual, "New Video" badge.`,
      { dimensions: '1080x1080', style: 'social media teaser' }
    );
    videoContent.teaser = teaser;

    return videoContent;
  }

  // Paid Advertising Assets
  async generateAdCampaign(brief) {
    const adCampaign = {
      google_ads: {},
      linkedin_ads: {},
      facebook_ads: {},
      display_ads: []
    };

    // Google Responsive Search Ads (text only)
    adCampaign.google_ads.headlines = await this.agent.generateText(
      `Generate 15 headlines (max 30 chars each) for Google Ads about ${brief.service}`,
      { platform: 'google_ads', type: 'headlines' }
    );
    
    adCampaign.google_ads.descriptions = await this.agent.generateText(
      `Generate 4 descriptions (max 90 chars each) for Google Ads about ${brief.service}`,
      { platform: 'google_ads', type: 'descriptions' }
    );

    // LinkedIn Sponsored Content
    const linkedInAd = await this.agent.generateContentWithVisuals(
      'LinkedIn Sponsored Content Ad',
      brief.topic,
      { dimensions: '1200x627', style: 'professional, corporate' }
    );
    adCampaign.linkedin_ads = linkedInAd;

    // Facebook/Instagram Ad Sets
    const fbSquare = await this.agent.generateImage(
      `Facebook ad creative for ${brief.service}.
       Eye-catching, includes offer "${brief.offer || 'Free Consultation'}".
       Clear CTA button design.`,
      { dimensions: '1080x1080', style: 'social media ad' }
    );
    adCampaign.facebook_ads.square = fbSquare;

    // Display Banner Ads
    const bannerSizes = [
      { name: 'leaderboard', dimensions: '728x90' },
      { name: 'medium_rectangle', dimensions: '300x250' },
      { name: 'skyscraper', dimensions: '160x600' }
    ];

    for (const size of bannerSizes) {
      const banner = await this.agent.generateImage(
        `Display banner ad for The Well recruitment.
         Size: ${size.name}
         Include: Logo, headline "${brief.headline}", CTA button.
         Clean, professional design with brand colors.`,
        size
      );
      adCampaign.display_ads.push({ ...size, ...banner });
    }

    return adCampaign;
  }

  // Webinar & Presentation Materials
  async generateWebinarAssets(brief) {
    const webinarAssets = {};

    // Registration page hero image
    webinarAssets.hero = await this.agent.generateImage(
      `Webinar registration page hero image.
       Title: "${brief.title}"
       Date/Time overlay, speaker headshots placeholder, professional design.`,
      { dimensions: '1920x1080', style: 'webinar hero' }
    );

    // Slide template
    webinarAssets.slideTemplate = await this.agent.generateImage(
      `PowerPoint slide template for wealth management webinar.
       Clean layout with header, content area, footer with logo.
       Brand colors: Black, Gold, Cyan.`,
      { dimensions: '1920x1080', style: 'presentation slide' }
    );

    // Social media promotional graphics
    webinarAssets.promoGraphics = await this.generateSocialMediaAssets({
      topic: `Webinar: ${brief.title}`,
      headline: 'Register Now'
    });

    // Email invitation header
    webinarAssets.emailHeader = await this.agent.generateImage(
      `Email header for webinar invitation.
       Professional, includes date/time, "You're Invited" text.`,
      { dimensions: '600x200', style: 'email header' }
    );

    return webinarAssets;
  }

  // Helper method for welcome email topics
  getWelcomeEmailTopic(emailNumber) {
    const topics = {
      1: 'Welcome to The Well - Your Partner in Talent Acquisition',
      2: 'Our Proven Process for Finding Perfect Candidates',
      3: 'Success Stories from Our Partner Firms',
      4: 'Industry Insights and Market Trends',
      5: 'Your Next Steps - Schedule a Consultation'
    };
    return topics[emailNumber] || 'Welcome';
  }
}

// ============================================
// CAMPAIGN ORCHESTRATOR
// ============================================

class CampaignOrchestrator {
  constructor() {
    this.contentFactory = new MarketingContentFactory();
    this.campaigns = new Map();
  }

  async createIntegratedCampaign(brief) {
    const campaignId = `campaign_${Date.now()}`;
    const campaign = {
      id: campaignId,
      name: brief.name,
      status: 'generating',
      channels: {},
      assets: [],
      timeline: [],
      metrics: {}
    };

    this.campaigns.set(campaignId, campaign);

    try {
      // Generate content for each selected channel
      if (brief.channels.includes('linkedin')) {
        campaign.channels.linkedin = await this.contentFactory.generateLinkedInCampaign(brief);
      }

      if (brief.channels.includes('email')) {
        campaign.channels.email = await this.contentFactory.generateEmailCampaign(brief);
      }

      if (brief.channels.includes('blog')) {
        campaign.channels.blog = await this.contentFactory.generateBlogPost(
          brief.topic,
          brief.keywords || []
        );
      }

      if (brief.channels.includes('social_media')) {
        campaign.channels.social_media = await this.contentFactory.generateSocialMediaAssets(brief);
      }

      if (brief.channels.includes('video')) {
        campaign.channels.video = await this.contentFactory.generateVideoContent(brief);
      }

      if (brief.channels.includes('paid_ads')) {
        campaign.channels.paid_ads = await this.contentFactory.generateAdCampaign(brief);
      }

      if (brief.channels.includes('webinar')) {
        campaign.channels.webinar = await this.contentFactory.generateWebinarAssets(brief);
      }

      campaign.status = 'completed';
      campaign.generatedAt = new Date();
      
      return campaign;
    } catch (error) {
      campaign.status = 'failed';
      campaign.error = error.message;
      throw error;
    }
  }

  async quickGenerate(type, topic) {
    const agent = new UnifiedMarketingAgent();
    
    switch(type) {
      case 'linkedin_post':
        return await agent.generateText(
          `Create an engaging LinkedIn post about ${topic} for The Well recruitment firm.
           Include hashtags and a clear CTA.`,
          { platform: 'linkedin', type: 'post' }
        );
        
      case 'email_subject':
        return await agent.generateText(
          `Generate 10 email subject lines for ${topic}. 
           Optimize for open rates, keep under 50 characters.`,
          { type: 'email_subjects' }
        );
        
      case 'social_graphic':
        return await agent.generateImage(
          `Create a social media graphic about ${topic}.
           Modern design with The Well branding.`,
          { dimensions: '1080x1080', style: 'social media' }
        );
        
      case 'blog_outline':
        return await agent.generateText(
          `Create a detailed blog post outline about ${topic}.
           Include H2 and H3 headings, key points, and CTA.`,
          { type: 'blog_outline' }
        );
        
      default:
        return await agent.generateText(
          `Create marketing content about ${topic}`,
          { type }
        );
    }
  }

  getCampaign(campaignId) {
    return this.campaigns.get(campaignId);
  }

  getAllCampaigns() {
    return Array.from(this.campaigns.values());
  }
}

// ============================================
// API ENDPOINTS
// ============================================

const orchestrator = new CampaignOrchestrator();

module.exports = {
  // Create full integrated campaign
  async createCampaign(req, res) {
    try {
      const campaign = await orchestrator.createIntegratedCampaign(req.body);
      res.json({ success: true, campaign });
    } catch (error) {
      console.error('Campaign creation error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Generate specific content type
  async quickGenerate(req, res) {
    const { type, topic } = req.body;
    try {
      const content = await orchestrator.quickGenerate(type, topic);
      res.json({ success: true, content });
    } catch (error) {
      console.error('Quick generation error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Generate image with Gemini native
  async generateImage(req, res) {
    const { prompt, specifications } = req.body;
    const agent = new UnifiedMarketingAgent();
    
    try {
      const image = await agent.generateImage(prompt, specifications);
      res.json({ success: true, image });
    } catch (error) {
      console.error('Image generation error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Edit existing image
  async editImage(req, res) {
    const { imagePath, editPrompt } = req.body;
    const agent = new UnifiedMarketingAgent();
    
    try {
      const editedImage = await agent.editImage(imagePath, editPrompt);
      res.json({ success: true, image: editedImage });
    } catch (error) {
      console.error('Image editing error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Generate content with visuals
  async generateContentWithVisuals(req, res) {
    const { contentType, topic, specifications } = req.body;
    const agent = new UnifiedMarketingAgent();
    
    try {
      const content = await agent.generateContentWithVisuals(
        contentType,
        topic,
        specifications
      );
      res.json({ success: true, content });
    } catch (error) {
      console.error('Content generation error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get campaign status
  async getCampaign(req, res) {
    const { campaignId } = req.params;
    const campaign = orchestrator.getCampaign(campaignId);
    
    if (campaign) {
      res.json({ success: true, campaign });
    } else {
      res.status(404).json({ error: 'Campaign not found' });
    }
  },

  // List all campaigns
  async listCampaigns(req, res) {
    const campaigns = orchestrator.getAllCampaigns();
    res.json({ success: true, campaigns });
  }
};