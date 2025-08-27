// Vercel serverless function wrapper for backend API
const express = require('express');
const cors = require('cors');

// Import backend routes
const aiChatRoutes = require('../backend/src/routes/ai-chat');
const aiImageRoutes = require('../backend/src/routes/ai-image');
const aiMarketingRoutes = require('../backend/src/routes/ai-marketing');
const authSupabaseRoutes = require('../backend/src/routes/auth-supabase');
const brandSupabaseRoutes = require('../backend/src/routes/brand-supabase');
const contentSupabaseRoutes = require('../backend/src/routes/content-supabase');
const generateSupabaseRoutes = require('../backend/src/routes/generate-supabase');
const researchSupabaseRoutes = require('../backend/src/routes/research-supabase');
const socialRoutes = require('../backend/src/routes/social');
const templatesSupabaseRoutes = require('../backend/src/routes/templates-supabase');
const uploadSupabaseRoutes = require('../backend/src/routes/upload-supabase');
const visionRoutes = require('../backend/src/routes/vision');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Mount routes
app.use('/api/ai-chat', aiChatRoutes);
app.use('/api/ai-image', aiImageRoutes);
app.use('/api/ai-marketing', aiMarketingRoutes);
app.use('/api/auth', authSupabaseRoutes);
app.use('/api/brand', brandSupabaseRoutes);
app.use('/api/content', contentSupabaseRoutes);
app.use('/api/generate', generateSupabaseRoutes);
app.use('/api/research', researchSupabaseRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/templates', templatesSupabaseRoutes);
app.use('/api/upload', uploadSupabaseRoutes);
app.use('/api/vision', visionRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Export for Vercel
module.exports = app;