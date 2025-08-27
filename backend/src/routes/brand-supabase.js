const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Get brand protection log
router.get('/protection-log', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('brand_protection_log')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(100);

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching protection log:', error);
    res.status(500).json({ error: 'Failed to fetch protection log' });
  }
});

// Validate style compliance
router.post('/validate-style', async (req, res) => {
  const { styles } = req.body;
  const violations = [];
  
  // Check for prohibited style overrides
  const prohibitedStyles = ['font-family', 'color', 'background-color'];
  for (const style of prohibitedStyles) {
    if (styles[style]) {
      violations.push({
        property: style,
        value: styles[style],
        reason: 'Brand-locked property cannot be modified'
      });
    }
  }
  
  // Log violations to Supabase
  if (violations.length > 0) {
    for (const violation of violations) {
      try {
        await supabase
          .from('brand_protection_log')
          .insert({
            component: 'Style Validation',
            violation: violation,
            blocked: true,
            timestamp: new Date().toISOString()
          });
      } catch (error) {
        console.error('Error logging violation:', error);
      }
    }
  }
  
  res.json({ 
    compliant: violations.length === 0, 
    violations 
  });
});

// Log brand protection event
router.post('/log-protection', async (req, res) => {
  const { component, violation, blocked = true } = req.body;
  
  try {
    const { data, error } = await supabase
      .from('brand_protection_log')
      .insert({
        component,
        violation: typeof violation === 'string' ? violation : JSON.stringify(violation),
        blocked,
        timestamp: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error logging protection event:', error);
    res.status(500).json({ error: 'Failed to log protection event' });
  }
});

// Get brand compliance statistics
router.get('/compliance-stats', async (req, res) => {
  try {
    // Get total violations
    const { count: totalViolations, error: countError } = await supabase
      .from('brand_protection_log')
      .select('*', { count: 'exact', head: true });

    if (countError) throw countError;

    // Get violations by component
    const { data: componentStats, error: componentError } = await supabase
      .from('brand_protection_log')
      .select('component')
      .order('component');

    if (componentError) throw componentError;

    // Group by component
    const componentCounts = {};
    componentStats.forEach(row => {
      componentCounts[row.component] = (componentCounts[row.component] || 0) + 1;
    });

    // Get recent violations
    const { data: recentViolations, error: recentError } = await supabase
      .from('brand_protection_log')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(10);

    if (recentError) throw recentError;

    res.json({
      totalViolations,
      componentCounts,
      recentViolations,
      complianceRate: totalViolations === 0 ? 100 : Math.max(0, 100 - (totalViolations / 100))
    });
  } catch (error) {
    console.error('Error fetching compliance stats:', error);
    res.status(500).json({ error: 'Failed to fetch compliance statistics' });
  }
});

// Clear protection log (admin only)
router.delete('/protection-log', async (req, res) => {
  try {
    const { error } = await supabase
      .from('brand_protection_log')
      .delete()
      .gte('id', 0); // Delete all rows

    if (error) throw error;

    res.json({ success: true, message: 'Protection log cleared' });
  } catch (error) {
    console.error('Error clearing protection log:', error);
    res.status(500).json({ error: 'Failed to clear protection log' });
  }
});

module.exports = router;