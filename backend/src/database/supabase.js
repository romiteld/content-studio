const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');

// Load environment variables from backend directory
const envPath = path.join(__dirname, '..', '..', '.env.local');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
} else {
  require('dotenv').config();
}

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service key for server-side operations

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  console.error('SUPABASE_URL:', !!supabaseUrl);
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  throw new Error('Supabase configuration is missing');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Database helper functions
const db = {
  // Content operations
  async getAllContent() {
    const { data, error } = await supabase
      .from('content')
      .select('*')
      .order('display_order', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async getContentById(id) {
    const { data, error } = await supabase
      .from('content')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async createContent(content) {
    const { data, error } = await supabase
      .from('content')
      .insert([content])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateContent(id, updates) {
    const { data, error } = await supabase
      .from('content')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteContent(id) {
    const { error } = await supabase
      .from('content')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { success: true };
  },

  async searchContent(query) {
    const { data, error } = await supabase
      .from('content')
      .select('*')
      .or(`title.ilike.%${query}%,content_data->text.ilike.%${query}%`)
      .order('display_order', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  // Templates operations
  async getAllTemplates() {
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .order('id', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  // Partners operations
  async getAllPartners() {
    const { data, error } = await supabase
      .from('partners')
      .select('*')
      .order('id', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async getActivePartners() {
    const { data, error } = await supabase
      .from('partners')
      .select('*')
      .or('status.eq.active,status.is.null')  // Include null status as active by default
      .order('company_name', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async createPartner(partner) {
    const { data, error } = await supabase
      .from('partners')
      .insert([partner])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Marketing campaigns
  async createCampaign(campaign) {
    const { data, error } = await supabase
      .from('marketing_campaigns')
      .insert([campaign])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getCampaigns() {
    const { data, error } = await supabase
      .from('marketing_campaigns')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (error) throw error;
    return data;
  },

  // AI Agents History
  async logAgentActivity(activity) {
    const { data, error } = await supabase
      .from('ai_agents_history')
      .insert([activity])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Upload history
  async logUpload(upload) {
    const { data, error } = await supabase
      .from('upload_history')
      .insert([upload])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Generated documents
  async logGeneratedDocument(doc) {
    const { data, error } = await supabase
      .from('generated_documents')
      .insert([doc])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Brand protection log
  async logBrandProtection(log) {
    const { data, error } = await supabase
      .from('brand_protection_log')
      .insert([log])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

module.exports = { supabase, db };