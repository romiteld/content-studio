const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const supabase = require('../database/supabase');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'demo-key');

// System prompt for the AI assistant
const SYSTEM_PROMPT = `You are an AI assistant for a wealth management content platform. 
You help users with:
- Creating marketing content and campaigns
- Generating social media posts
- Writing talent market updates
- Optimizing messaging for different platforms
- Answering questions about the application features
- Searching and analyzing content in the database
- Providing strategic marketing advice

You have access to:
- The content database with training materials
- Campaign history and performance data
- Social media optimization guidelines
- Marketing best practices

Be helpful, professional, and provide actionable advice. Keep responses concise but comprehensive.`;

// Store conversation context (in production, use Redis or similar)
const conversationHistory = new Map();

router.post('/chat', async (req, res) => {
  try {
    const { message, sessionId = 'default' } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get or create conversation history
    if (!conversationHistory.has(sessionId)) {
      conversationHistory.set(sessionId, []);
    }
    const history = conversationHistory.get(sessionId);

    // Check if the message contains a search query
    let contextData = '';
    if (message.toLowerCase().includes('search') || message.toLowerCase().includes('find') || message.toLowerCase().includes('show')) {
      // Search content database
      const searchTerm = message.replace(/search|find|show|for|me|please/gi, '').trim();
      
      try {
        const { data: contents } = await supabase
          .from('content')
          .select('*')
          .ilike('title', `%${searchTerm}%`)
          .limit(5);
        
        if (contents && contents.length > 0) {
          contextData = `\n\nRelevant content from database:\n${contents.map(c => `- ${c.title}: ${c.section_type}`).join('\n')}`;
        }
      } catch (error) {
        console.error('Database search error:', error);
      }
    }

    // Check for specific feature questions
    if (message.toLowerCase().includes('how') || message.toLowerCase().includes('what') || message.toLowerCase().includes('can')) {
      contextData += `\n\nAvailable features:
- Content Editor: Create and edit training materials
- Upload Manager: Import Word, PDF, and other documents
- Generate Panel: Create PDFs and PowerPoints
- Research Panel: Web scraping and competitor analysis
- Social Media Optimizer: Platform-specific content optimization
- Marketing Dashboard: Campaign management and analytics
- AI Agents: Automated content generation`;
    }

    // Build the prompt with context
    const fullPrompt = `${SYSTEM_PROMPT}

Previous conversation:
${history.slice(-5).map(h => `${h.role}: ${h.content}`).join('\n')}

${contextData}

User: ${message}
Assistant: Please provide your response.`;

    try {
      // Generate response using Gemini 2.5 Flash
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
      const result = await model.generateContent(fullPrompt);
      const response = result.response.text();

      // Store conversation history
      history.push({ role: 'user', content: message });
      history.push({ role: 'assistant', content: response });

      // Keep only last 10 messages
      if (history.length > 10) {
        history.splice(0, history.length - 10);
      }

      res.json({ message: response });
    } catch (aiError) {
      console.error('AI generation error:', aiError);
      
      // Fallback to a helpful response if AI fails
      const fallbackResponse = `I can help you with:
• Creating marketing campaigns
• Generating social media content
• Writing talent updates
• Optimizing your messaging
• Searching content in the database
• Explaining platform features

What specific task would you like assistance with?`;
      
      res.json({ message: fallbackResponse });
    }
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

// Clear conversation history endpoint
router.post('/chat/clear', (req, res) => {
  const { sessionId = 'default' } = req.body;
  conversationHistory.delete(sessionId);
  res.json({ success: true, message: 'Conversation cleared' });
});

// Search content endpoint
router.post('/chat/search', async (req, res) => {
  try {
    const { query } = req.body;
    
    const { data: contents, error } = await supabase
      .from('content')
      .select('*')
      .or(`title.ilike.%${query}%,section_type.ilike.%${query}%`)
      .limit(10);
    
    if (error) throw error;
    
    res.json({ results: contents || [] });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

module.exports = router;