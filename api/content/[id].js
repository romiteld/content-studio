const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
);

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ error: 'Content ID is required' });
  }
  
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('content')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error fetching content:', error);
        return res.status(404).json({ error: 'Content not found' });
      }
      
      return res.status(200).json(data);
    } catch (error) {
      console.error('Error in content API:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  if (req.method === 'PUT') {
    try {
      const { section_type, title, content_data, chart_data, display_order } = req.body;
      
      const { data, error } = await supabase
        .from('content')
        .update({
          section_type,
          title,
          content_data,
          chart_data,
          display_order,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating content:', error);
        return res.status(500).json({ error: 'Failed to update content' });
      }
      
      return res.status(200).json({ 
        success: true, 
        data,
        message: 'Content updated successfully' 
      });
    } catch (error) {
      console.error('Error in content API:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  if (req.method === 'DELETE') {
    try {
      const { error } = await supabase
        .from('content')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting content:', error);
        return res.status(500).json({ error: 'Failed to delete content' });
      }
      
      return res.status(200).json({ 
        success: true,
        message: 'Content deleted successfully' 
      });
    } catch (error) {
      console.error('Error in content API:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
};