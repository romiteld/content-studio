const express = require('express');
const router = express.Router();
const {
  supabase,
  authenticateToken,
  requireAdmin,
  validateInviteCode,
  useInviteCode,
  createInviteCode
} = require('../middleware/supabase-auth');

/**
 * Register with invite code
 */
router.post('/register', async (req, res) => {
  const { email, password, fullName, inviteCode, organization } = req.body;

  if (!email || !password || !fullName || !inviteCode) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Validate invite code
    const inviteValidation = await validateInviteCode(inviteCode, email);
    
    if (!inviteValidation.valid) {
      return res.status(400).json({ error: inviteValidation.error });
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          organization: organization || inviteValidation.organization
        }
      }
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    // Create user profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: authData.user.id,
        email,
        full_name: fullName,
        company_name: organization || inviteValidation.organization,
        role: inviteValidation.metadata?.role || 'user',
        invite_code_used: inviteCode
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Don't fail registration if profile creation fails
    }

    // Use the invite code
    await useInviteCode(inviteCode);

    res.json({
      success: true,
      user: authData.user,
      session: authData.session,
      message: 'Registration successful. Please check your email to verify your account.'
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

/**
 * Login endpoint
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await supabase
      .from('user_profiles')
      .update({ last_login: new Date().toISOString() })
      .eq('id', data.user.id);

    // Get user profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    res.json({
      success: true,
      user: data.user,
      profile,
      session: data.session
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

/**
 * Logout endpoint
 */
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

/**
 * Validate session
 */
router.get('/validate', authenticateToken, async (req, res) => {
  res.json({
    valid: true,
    user: req.user,
    profile: req.user.profile
  });
});

/**
 * Check invite code validity (public)
 */
router.get('/check-invite/:code', async (req, res) => {
  const { code } = req.params;
  
  try {
    const validation = await validateInviteCode(code);
    
    if (!validation.valid) {
      return res.status(404).json(validation);
    }

    res.json(validation);
  } catch (error) {
    console.error('Invite check error:', error);
    res.status(500).json({ valid: false, error: 'Failed to validate invite code' });
  }
});

/**
 * Create invite code (admin only)
 */
router.post('/create-invite', authenticateToken, requireAdmin, async (req, res) => {
  const { email, maxUses = 1, expiresInDays = 30, organization } = req.body;
  
  try {
    const inviteCode = await createInviteCode(
      email,
      maxUses,
      expiresInDays,
      organization,
      req.user.id
    );

    if (!inviteCode) {
      return res.status(500).json({ error: 'Failed to create invite code' });
    }

    res.json({
      success: true,
      inviteCode: inviteCode.code,
      expiresAt: inviteCode.expires_at
    });

  } catch (error) {
    console.error('Create invite error:', error);
    res.status(500).json({ error: 'Failed to create invite code' });
  }
});

/**
 * List invite codes (admin only)
 */
router.get('/invites', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('invite_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    console.error('List invites error:', error);
    res.status(500).json({ error: 'Failed to fetch invite codes' });
  }
});

/**
 * Get user profile
 */
router.get('/profile', authenticateToken, async (req, res) => {
  res.json({
    user: req.user,
    profile: req.user.profile
  });
});

/**
 * Update user profile
 */
router.put('/profile', authenticateToken, async (req, res) => {
  const { fullName, companyName } = req.body;
  
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        full_name: fullName,
        company_name: companyName,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({
      success: true,
      profile: data
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;