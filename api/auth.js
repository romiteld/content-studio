const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://rqtpemdvwuzswnpvnljm.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Initialize public Supabase client for auth operations
const supabaseAuth = createClient(
  process.env.SUPABASE_URL || 'https://rqtpemdvwuzswnpvnljm.supabase.co',
  process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxdHBlbWR2d3V6c3ducHZubGptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyNzk2NTYsImV4cCI6MjA3MTg1NTY1Nn0.brl3OXHpd5NeoBynsBcY5DntFZGbGgZ0GQDw8FR5kg8'
);

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', 'https://studio.thewell.solutions');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'POST') {
      const { action, email, password } = req.body;

      switch (action) {
        case 'signup':
          const { data: signUpData, error: signUpError } = await supabaseAuth.auth.signUp({
            email,
            password,
          });

          if (signUpError) {
            return res.status(400).json({ error: signUpError.message });
          }

          res.json({ 
            user: signUpData.user, 
            message: 'Check your email for verification link' 
          });
          break;

        case 'signin':
          const { data: signInData, error: signInError } = await supabaseAuth.auth.signInWithPassword({
            email,
            password,
          });

          if (signInError) {
            return res.status(400).json({ error: signInError.message });
          }

          res.json({ 
            user: signInData.user, 
            session: signInData.session,
            access_token: signInData.session.access_token 
          });
          break;

        case 'signout':
          const { error: signOutError } = await supabaseAuth.auth.signOut();
          
          if (signOutError) {
            return res.status(400).json({ error: signOutError.message });
          }

          res.json({ message: 'Signed out successfully' });
          break;

        default:
          res.status(400).json({ error: 'Invalid action' });
      }
    } else if (req.method === 'GET') {
      // Verify token endpoint
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const token = authHeader.substring(7);
      
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (error || !user) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      res.json({ user, authenticated: true });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};