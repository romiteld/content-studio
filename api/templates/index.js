const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
);

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  
  if (req.method === 'GET') {
    try {
      // Fetch templates from Supabase
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching templates:', error);
        return res.status(500).json({ error: 'Failed to fetch templates' });
      }
      
      return res.status(200).json(data || []);
    } catch (error) {
      console.error('Error in templates API:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  if (req.method === 'POST') {
    try {
      const { name, section_type, html_structure, css_rules, is_locked } = req.body;
      
      const { data, error } = await supabase
        .from('templates')
        .insert({
          name,
          section_type,
          html_structure,
          css_rules,
          is_locked: is_locked !== undefined ? is_locked : true
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating template:', error);
        return res.status(500).json({ error: 'Failed to create template' });
      }
      
      return res.status(200).json({ 
        success: true, 
        template: data,
        message: 'Template created successfully' 
      });
    } catch (error) {
      console.error('Error in templates API:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
};