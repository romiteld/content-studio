const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://rqtpemdvwuzswnpvnljm.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxdHBlbWR2d3V6c3ducHZubGptIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI3OTY1NiwiZXhwIjoyMDcxODU1NjU2fQ.SjKLyzB2071t9OYlky_nQuFz8xTLhyvkKqT4Rm3UcFE';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
    const { email, password, username } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Create user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { username }
    });
    
    if (authError) {
      console.error('Auth error:', authError);
      return res.status(400).json({ error: authError.message });
    }
    
    // Create user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .insert([{
        id: authData.user.id,
        email,
        username,
        subscription_tier: 'free',
        created_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (profileError) {
      console.error('Profile error:', profileError);
      // Don't fail registration if profile creation fails
    }
    
    return res.status(200).json({ 
      success: true,
      user: authData.user,
      message: 'User registered successfully'
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ 
      error: 'Failed to register user',
      details: error.message 
    });
  }
};