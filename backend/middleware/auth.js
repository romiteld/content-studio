const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

function generateInviteCode() {
  return crypto.randomBytes(16).toString('hex').toUpperCase().slice(0, 12);
}

function generateSessionToken() {
  return jwt.sign(
    { id: crypto.randomBytes(16).toString('hex') },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = decoded;
    next();
  });
}

async function validateSession(db, sessionToken) {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT s.*, u.* FROM sessions s 
       JOIN users u ON s.user_id = u.id 
       WHERE s.session_token = ? AND s.expires_at > datetime('now')`,
      [sessionToken],
      (err, row) => {
        if (err) reject(err);
        else resolve(row);
      }
    );
  });
}

async function createSession(db, userId) {
  const sessionToken = generateSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_DURATION).toISOString();
  
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO sessions (session_token, user_id, expires_at) VALUES (?, ?, ?)`,
      [sessionToken, userId, expiresAt],
      function(err) {
        if (err) reject(err);
        else resolve({ sessionToken, expiresAt });
      }
    );
  });
}

async function logAccess(db, userId, action, resource, req) {
  const ipAddress = req.ip || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'];
  
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO access_logs (user_id, action, resource, ip_address, user_agent) 
       VALUES (?, ?, ?, ?, ?)`,
      [userId, action, resource, ipAddress, userAgent],
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });
}

module.exports = {
  generateInviteCode,
  generateSessionToken,
  hashPassword,
  verifyPassword,
  authenticateToken,
  validateSession,
  createSession,
  logAccess,
  JWT_SECRET
};