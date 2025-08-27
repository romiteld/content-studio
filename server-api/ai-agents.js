// AI Agent System using Gemini 2.5 Flash with multimodal capabilities
// Multi-agent architecture for LinkedIn content generation using Vercel AI SDK

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { streamText, generateText } = require('ai');
const { google } = require('@ai-sdk/google');
const fs = require('fs').promises;
const path = require('path');

// Initialize Gemini Flash 2.5
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

// Initialize Google AI provider for Vercel AI SDK
const googleModel = google('gemini-2.5-flash', {
  apiKey: process.env.GOOGLE_AI_API_KEY || ''
});

// Agent configurations
const AGENTS = {
  marketIntelligence: {
    name: 'Market Intelligence Analyst',
    model: 'gemini-2.5-flash',
    systemPrompt: `You are a wealth management market intelligence analyst. Your role:
    - Analyze hiring trends and compensation data
    - Track industry movements and talent demand
    - Generate daily Talent Ticker updates
    - Identify trending topics for content
    Output format: Structured JSON with trend data, insights, and recommendations.`
  },
  
  contentArchitect: {
    name: 'Content Architect',
    model: 'gemini-2.5-flash',
    systemPrompt: `You are a LinkedIn content strategist for The Well recruitment firm. Your role:
    - Structure engaging LinkedIn posts optimized for the algorithm
    - Create content calendars and series
    - Design carousel post layouts
    - Ensure each post has a hook, value, and clear CTA
    Output format: Complete LinkedIn post with formatting, hashtags, and engagement elements.`
  },
  
  visualDesigner: {
    name: 'Visual Designer',
    model: 'gemini-2.5-flash',
    systemPrompt: `You create professional visual content for LinkedIn. Your role:
    - Generate detailed prompts for visual content creation
    - Design carousel slide layouts with consistent branding
    - Create infographic specifications for wealth management data
    - Define social media square designs with The Well's brand colors (Black, Gold #D4AF37, Cyan #4FC3F7)
    - Specify charts and data visualization requirements
    Output: Detailed JSON with image prompt, layout specs, and visual elements.
    Style: Clean, professional, corporate with subtle gold accents.`
  },
  
  complianceValidator: {
    name: 'Compliance Validator',
    model: 'gemini-2.5-flash',
    systemPrompt: `You are a financial services compliance expert. Your role:
    - Check content for regulatory compliance (FINRA, SEC)
    - Ensure no prohibited terms or guarantees
    - Validate all claims and data accuracy
    - Add required disclaimers where needed
    Output: Compliance status with specific issues and corrections.`
  }
};

// Agent class
class ContentAgent {
  constructor(config) {
    this.name = config.name;
    this.model = config.model;
    this.systemPrompt = config.systemPrompt;
    this.genModel = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash' 
    });
  }
  
  async execute(input, context = {}) {
    try {
      // All agents use Gemini 2.5 Flash
      if (this.name === 'Visual Designer' && context.generateImage) {
        return await this.generateVisualWithGemini(input, context);
      } else {
        return await this.generateText(input, context);
      }
    } catch (error) {
      console.error(`Agent ${this.name} error:`, error);
      throw error;
    }
  }
  
  async generateText(input, context) {
    const prompt = `${this.systemPrompt}\n\nContext: ${JSON.stringify(context)}\n\nTask: ${input}`;
    
    try {
      // Use Vercel AI SDK for text generation
      const { text } = await generateText({
        model: googleModel,
        prompt: prompt,
        temperature: 0.7,
        maxTokens: 2000
      });
      
      // Try to parse as JSON if possible
      try {
        return JSON.parse(text);
      } catch {
        return text;
      }
    } catch (error) {
      // Fallback to direct Gemini API if AI SDK fails
      const result = await this.genModel.generateContent(prompt);
      const response = result.response.text();
      
      try {
        return JSON.parse(response);
      } catch {
        return response;
      }
    }
  }
  
  async generateVisualWithGemini(input, context) {
    // Gemini 2.5 Flash can analyze images and generate detailed visual specifications
    const visualPrompt = `Professional LinkedIn visual for wealth management recruitment.
    ${input}
    Brand colors: Black background, Gold (#D4AF37) accents, Cyan (#4FC3F7) highlights.
    Style: Clean, corporate, minimalist with data visualization.
    Include The Well logo subtly.
    ${context.specifications || ''}
    
    Provide detailed specifications for creating this visual, including:
    - Layout structure with precise element positioning
    - Typography choices and hierarchy
    - Color palette application
    - Data visualization approach if applicable
    - Visual metaphors and iconography`;
    
    const result = await this.genModel.generateContent(visualPrompt);
    const response = result.response.text();
    
    return {
      specifications: response,
      prompt: visualPrompt,
      type: 'visual_design',
      model: 'gemini-2.5-flash',
      status: 'specifications_generated'
    };
  }
}

// Multi-agent workflow for content generation
class ContentGenerationWorkflow {
  constructor() {
    this.agents = {};
    Object.entries(AGENTS).forEach(([key, config]) => {
      this.agents[key] = new ContentAgent(config);
    });
  }
  
  async generateTalentTicker(date = new Date()) {
    // Step 1: Market Intelligence
    const marketData = await this.agents.marketIntelligence.execute(
      `Generate Talent Ticker data for ${date.toLocaleDateString()}. Include:
      - 3 trending up metrics with percentages
      - 2 trending down metrics
      - 1 spotlight on a partner firm hiring
      Focus on wealth management, financial advisors, and executive roles.`
    );
    
    // Step 2: Content Architecture
    const content = await this.agents.contentArchitect.execute(
      `Create LinkedIn Talent Ticker post using this data: ${JSON.stringify(marketData)}`,
      { template: 'talent_ticker', date }
    );
    
    // Step 3: Compliance Check
    const validated = await this.agents.complianceValidator.execute(
      `Validate this LinkedIn post for compliance: ${content}`
    );
    
    // Step 4: Visual Generation
    const visual = await this.agents.visualDesigner.execute(
      `Create Talent Ticker infographic with market data`,
      { data: marketData, format: 'square' }
    );
    
    return {
      content,
      marketData,
      compliance: validated,
      visual,
      type: 'talent_ticker',
      date: date.toISOString()
    };
  }
  
  async generatePartnerSpotlight(firmName, firmData) {
    // Step 1: Research firm specifics
    const insights = await this.agents.marketIntelligence.execute(
      `Research ${firmName}: ${JSON.stringify(firmData)}. Provide:
      - 3 unique value propositions
      - Current hiring focus
      - Culture highlights
      - Ideal candidate profile`
    );
    
    // Step 2: Create spotlight content
    const content = await this.agents.contentArchitect.execute(
      `Create Partner Spotlight post for ${firmName} using: ${JSON.stringify(insights)}`,
      { template: 'partner_spotlight' }
    );
    
    // Step 3: Compliance validation
    const validated = await this.agents.complianceValidator.execute(
      `Validate partner spotlight content: ${content}`
    );
    
    // Step 4: Visual carousel
    const carousel = await this.agents.visualDesigner.execute(
      `Design 5-slide carousel for ${firmName} spotlight:
      Slide 1: Firm overview with logo
      Slide 2: Culture & values
      Slide 3: Open positions
      Slide 4: Ideal candidate profile
      Slide 5: Call to action`,
      { firmData, brandColors: true }
    );
    
    return {
      content,
      insights,
      compliance: validated,
      visual: carousel,
      type: 'partner_spotlight',
      firm: firmName
    };
  }
  
  async generateCareerGuide(topic, targetAudience) {
    // Multi-agent collaboration for comprehensive guide
    const research = await this.agents.marketIntelligence.execute(
      `Research career guide topic: ${topic} for ${targetAudience}`
    );
    
    const structure = await this.agents.contentArchitect.execute(
      `Create comprehensive LinkedIn article: ${topic}`,
      { research, format: 'long_form', targetLength: 1500 }
    );
    
    const compliance = await this.agents.complianceValidator.execute(
      `Review career guide for compliance: ${structure}`
    );
    
    const infographic = await this.agents.visualDesigner.execute(
      `Create career progression infographic for ${topic}`,
      { style: 'timeline', data: research }
    );
    
    return {
      content: structure,
      research,
      compliance,
      visual: infographic,
      type: 'career_guide',
      topic
    };
  }
  
  async batchGenerateWeeklyContent() {
    const weekContent = [];
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const contentTypes = [
      { type: 'talent_ticker', generator: this.generateTalentTicker.bind(this) },
      { type: 'partner_spotlight', generator: () => this.generatePartnerSpotlight('Oak Harvest Financial Group', {}) },
      { type: 'career_guide', generator: () => this.generateCareerGuide('CFP vs CFA: Which Path?', 'New Advisors') },
      { type: 'market_analysis', generator: () => this.generateMarketAnalysis() },
      { type: 'success_story', generator: () => this.generateSuccessStory() }
    ];
    
    for (let i = 0; i < days.length; i++) {
      const content = await contentTypes[i].generator();
      weekContent.push({
        day: days[i],
        ...content,
        scheduledTime: this.getOptimalPostTime(days[i])
      });
    }
    
    return weekContent;
  }
  
  async generateMarketAnalysis() {
    const analysis = await this.agents.marketIntelligence.execute(
      'Generate weekly market analysis for wealth management hiring trends'
    );
    
    const post = await this.agents.contentArchitect.execute(
      `Create data-driven LinkedIn post about market trends: ${JSON.stringify(analysis)}`
    );
    
    const visual = await this.agents.visualDesigner.execute(
      'Create market trends chart visualization',
      { data: analysis, type: 'bar_chart' }
    );
    
    return { content: post, visual, type: 'market_analysis' };
  }
  
  async generateSuccessStory() {
    const story = await this.agents.contentArchitect.execute(
      'Create success story post about recent placement at partner firm'
    );
    
    const visual = await this.agents.visualDesigner.execute(
      'Create success metrics infographic',
      { type: 'testimonial' }
    );
    
    return { content: story, visual, type: 'success_story' };
  }
  
  getOptimalPostTime(day) {
    const times = {
      Monday: '07:30',
      Tuesday: '12:30',
      Wednesday: '08:00',
      Thursday: '14:00',
      Friday: '10:00'
    };
    return times[day] || '09:00';
  }
}

// API endpoints
const contentWorkflow = new ContentGenerationWorkflow();

module.exports = {
  // Generate single piece of content
  async generateContent(req, res) {
    const { type, params } = req.body;
    
    try {
      let result;
      switch(type) {
        case 'talent_ticker':
          result = await contentWorkflow.generateTalentTicker(new Date(params.date || Date.now()));
          break;
        case 'partner_spotlight':
          result = await contentWorkflow.generatePartnerSpotlight(params.firmName, params.firmData);
          break;
        case 'career_guide':
          result = await contentWorkflow.generateCareerGuide(params.topic, params.audience);
          break;
        default:
          throw new Error(`Unknown content type: ${type}`);
      }
      
      res.json({ success: true, content: result });
    } catch (error) {
      console.error('Content generation error:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  // Generate week of content
  async generateWeeklyContent(req, res) {
    try {
      const weekContent = await contentWorkflow.batchGenerateWeeklyContent();
      res.json({ success: true, week: weekContent });
    } catch (error) {
      console.error('Weekly generation error:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  // Generate visual with Imagen 4
  async generateVisual(req, res) {
    const { prompt, type, specifications } = req.body;
    
    try {
      const visual = await contentWorkflow.agents.visualDesigner.execute(prompt, { 
        type, 
        specifications 
      });
      res.json({ success: true, visual });
    } catch (error) {
      console.error('Visual generation error:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  // Validate content compliance
  async validateCompliance(req, res) {
    const { content } = req.body;
    
    try {
      const validation = await contentWorkflow.agents.complianceValidator.execute(
        `Validate for compliance: ${content}`
      );
      res.json({ success: true, validation });
    } catch (error) {
      console.error('Compliance validation error:', error);
      res.status(500).json({ error: error.message });
    }
  }
};