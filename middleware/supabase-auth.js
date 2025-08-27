const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = 'https://rqtpemdvwuzswnpvnljm.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Middleware to verify Supabase JWT tokens
 */
async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    // Verify the JWT token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    req.user = { ...user, profile };
    
    // Log access
    await logAccess(user.id, req.method, req.path, req);
    
    next();
  } catch (err) {
    console.error('Auth error:', err);
    return res.status(403).json({ error: 'Authentication failed' });
  }
}

/**
 * Middleware to check if user is admin
 */
async function requireAdmin(req, res, next) {
  if (!req.user || !req.user.profile || req.user.profile.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

/**
 * Validate invite code
 */
async function validateInviteCode(code, email = null) {
  const { data, error } = await supabase
    .rpc('validate_invite_code', { 
      p_code: code, 
      p_email: email 
    });

  if (error) {
    console.error('Invite validation error:', error);
    return { valid: false, error: error.message };
  }

  return data;
}

/**
 * Use invite code (increment usage count)
 */
async function useInviteCode(code) {
  const { error } = await supabase
    .rpc('use_invite_code', { p_code: code });

  if (error) {
    console.error('Error using invite code:', error);
    return false;
  }

  return true;
}

/**
 * Log user access
 */
async function logAccess(userId, action, resource, req) {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    
    await supabase
      .from('access_logs')
      .insert({
        user_id: userId,
        action: action,
        resource: resource,
        ip_address: ipAddress,
        user_agent: userAgent,
        metadata: {
          method: req.method,
          query: req.query,
          timestamp: new Date().toISOString()
        }
      });
  } catch (err) {
    console.error('Error logging access:', err);
  }
}

/**
 * Create invite code (admin only)
 */
async function createInviteCode(email, maxUses = 1, expiresInDays = 30, organization = null, createdBy = null) {
  const code = 'WEALTH-' + Math.random().toString(36).substring(2, 10).toUpperCase();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);

  const { data, error } = await supabase
    .from('invite_codes')
    .insert({
      code,
      email,
      max_uses: maxUses,
      expires_at: expiresAt.toISOString(),
      organization,
      created_by: createdBy
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating invite code:', error);
    return null;
  }

  return data;
}

module.exports = {
  supabase,
  authenticateToken,
  requireAdmin,
  validateInviteCode,
  useInviteCode,
  createInviteCode,
  logAccess
};