const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const {
  generateInviteCode,
  hashPassword,
  verifyPassword,
  createSession,
  validateSession,
  logAccess,
  authenticateToken
} = require('../middleware/auth');

const dbPath = path.join(__dirname, '..', 'database', 'wealth_training.db');

// Admin endpoint to create invite codes (protected)
router.post('/create-invite', authenticateToken, async (req, res) => {
  const { email, maxUses = 1, expiresInDays = 30, organization } = req.body;
  const db = new sqlite3.Database(dbPath);
  
  try {
    const user = await validateSession(db, req.headers.authorization.split(' ')[1]);
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const code = generateInviteCode();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);
    
    db.run(
      `INSERT INTO invite_codes (code, email, max_uses, expires_at, created_by, organization) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [code, email, maxUses, expiresAt.toISOString(), user.email, organization],
      function(err) {
        if (err) {
          res.status(500).json({ error: 'Failed to create invite code' });
        } else {
          logAccess(db, user.id, 'CREATE_INVITE', code, req);
          res.json({ 
            success: true, 
            inviteCode: code,
            expiresAt: expiresAt.toISOString() 
          });
        }
        db.close();
      }
    );
  } catch (error) {
    db.close();
    res.status(500).json({ error: error.message });
  }
});

// Register with invite code
router.post('/register', async (req, res) => {
  const { email, password, name, inviteCode, organization } = req.body;
  const db = new sqlite3.Database(dbPath);
  
  if (!inviteCode || !email || !password || !name) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  
  try {
    // Validate invite code
    db.get(
      `SELECT * FROM invite_codes 
       WHERE code = ? AND is_active = 1 
       AND (expires_at IS NULL OR expires_at > datetime('now'))
       AND (email IS NULL OR email = ?)`,
      [inviteCode, email],
      async (err, invite) => {
        if (err || !invite) {
          db.close();
          return res.status(400).json({ error: 'Invalid or expired invite code' });
        }
        
        if (invite.used_count >= invite.max_uses) {
          db.close();
          return res.status(400).json({ error: 'Invite code has reached maximum uses' });
        }
        
        // Check if user already exists
        db.get('SELECT id FROM users WHERE email = ?', [email], async (err, existingUser) => {
          if (existingUser) {
            db.close();
            return res.status(400).json({ error: 'User already exists' });
          }
          
          const passwordHash = await hashPassword(password);
          
          // Create user
          db.run(
            `INSERT INTO users (email, name, password_hash, invite_code_used, organization, role) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [email, name, passwordHash, inviteCode, organization || invite.organization, 'user'],
            async function(userErr) {
              if (userErr) {
                db.close();
                return res.status(500).json({ error: 'Failed to create user' });
              }
              
              const userId = this.lastID;
              
              // Update invite code usage
              db.run(
                'UPDATE invite_codes SET used_count = used_count + 1 WHERE code = ?',
                [inviteCode],
                async (updateErr) => {
                  if (updateErr) {
                    db.close();
                    return res.status(500).json({ error: 'Failed to update invite code' });
                  }
                  
                  // Create session
                  const session = await createSession(db, userId);
                  await logAccess(db, userId, 'REGISTER', null, req);
                  
                  db.close();
                  res.json({
                    success: true,
                    sessionToken: session.sessionToken,
                    user: {
                      id: userId,
                      email,
                      name,
                      organization: organization || invite.organization,
                      role: 'user'
                    }
                  });
                }
              );
            }
          );
        });
      }
    );
  } catch (error) {
    db.close();
    res.status(500).json({ error: error.message });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const db = new sqlite3.Database(dbPath);
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  
  try {
    db.get(
      'SELECT * FROM users WHERE email = ? AND is_active = 1',
      [email],
      async (err, user) => {
        if (err || !user) {
          db.close();
          return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const passwordValid = await verifyPassword(password, user.password_hash);
        if (!passwordValid) {
          db.close();
          return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // Update last login
        db.run(
          'UPDATE users SET last_login = datetime("now") WHERE id = ?',
          [user.id]
        );
        
        // Create session
        const session = await createSession(db, user.id);
        await logAccess(db, user.id, 'LOGIN', null, req);
        
        db.close();
        res.json({
          success: true,
          sessionToken: session.sessionToken,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            organization: user.organization,
            role: user.role
          }
        });
      }
    );
  } catch (error) {
    db.close();
    res.status(500).json({ error: error.message });
  }
});

// Validate session endpoint
router.get('/validate', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ valid: false });
  }
  
  const db = new sqlite3.Database(dbPath);
  
  try {
    const session = await validateSession(db, token);
    if (!session) {
      db.close();
      return res.status(401).json({ valid: false });
    }
    
    db.close();
    res.json({
      valid: true,
      user: {
        id: session.user_id,
        email: session.email,
        name: session.name,
        organization: session.organization,
        role: session.role
      }
    });
  } catch (error) {
    db.close();
    res.status(500).json({ valid: false, error: error.message });
  }
});

// Logout endpoint
router.post('/logout', authenticateToken, async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  const db = new sqlite3.Database(dbPath);
  
  try {
    const session = await validateSession(db, token);
    if (session) {
      db.run('DELETE FROM sessions WHERE session_token = ?', [token]);
      await logAccess(db, session.user_id, 'LOGOUT', null, req);
    }
    
    db.close();
    res.json({ success: true });
  } catch (error) {
    db.close();
    res.status(500).json({ error: error.message });
  }
});

// Check invite code validity (public)
router.get('/check-invite/:code', (req, res) => {
  const { code } = req.params;
  const db = new sqlite3.Database(dbPath);
  
  db.get(
    `SELECT code, organization, expires_at, max_uses, used_count 
     FROM invite_codes 
     WHERE code = ? AND is_active = 1 
     AND (expires_at IS NULL OR expires_at > datetime('now'))`,
    [code],
    (err, invite) => {
      db.close();
      
      if (err || !invite) {
        return res.status(404).json({ valid: false, error: 'Invalid invite code' });
      }
      
      if (invite.used_count >= invite.max_uses) {
        return res.status(400).json({ valid: false, error: 'Invite code has reached maximum uses' });
      }
      
      res.json({
        valid: true,
        organization: invite.organization,
        remainingUses: invite.max_uses - invite.used_count
      });
    }
  );
});

// List all invite codes (admin only)
router.get('/invites', authenticateToken, async (req, res) => {
  const db = new sqlite3.Database(dbPath);
  
  try {
    const user = await validateSession(db, req.headers.authorization.split(' ')[1]);
    if (user.role !== 'admin') {
      db.close();
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    db.all(
      `SELECT * FROM invite_codes ORDER BY created_at DESC`,
      [],
      (err, invites) => {
        db.close();
        if (err) {
          res.status(500).json({ error: 'Failed to fetch invite codes' });
        } else {
          res.json(invites);
        }
      }
    );
  } catch (error) {
    db.close();
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;