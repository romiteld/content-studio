const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://rqtpemdvwuzswnpvnljm.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxdHBlbWR2d3V6c3ducHZubGptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyNzk2NTYsImV4cCI6MjA3MTg1NTY1Nn0.brl3OXHpd5NeoBynsBcY5DntFZGbGgZ0GQDw8FR5kg8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error('Login error:', error);
      return res.status(401).json({ error: error.message });
    }
    
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();
    
    return res.status(200).json({ 
      success: true,
      user: data.user,
      session: data.session,
      profile: profile || null,
      message: 'Login successful'
    });
    
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      error: 'Failed to login',
      details: error.message 
    });
  }
};