const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'wealth_training.db');

// Generate initial admin credentials
const ADMIN_EMAIL = 'daniel.romitelli@emailthewell.com';
const ADMIN_PASSWORD = 'Admin@WealthStudio2025'; // Change this immediately after first login
const ADMIN_INVITE_CODE = 'WEALTH-' + crypto.randomBytes(6).toString('hex').toUpperCase();

async function setupAuth() {
  const db = new sqlite3.Database(dbPath);
  
  console.log('Setting up authentication system...');
  
  // Create auth tables if they don't exist
  const authSchema = `
    -- User authentication table
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      invite_code_used TEXT NOT NULL,
      organization TEXT,
      role TEXT DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_login TIMESTAMP,
      is_active BOOLEAN DEFAULT 1
    );

    -- Invite codes table
    CREATE TABLE IF NOT EXISTS invite_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      email TEXT,
      max_uses INTEGER DEFAULT 1,
      used_count INTEGER DEFAULT 0,
      expires_at TIMESTAMP,
      created_by TEXT,
      organization TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      is_active BOOLEAN DEFAULT 1
    );

    -- User sessions table
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_token TEXT UNIQUE NOT NULL,
      user_id INTEGER NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    -- Access logs table
    CREATE TABLE IF NOT EXISTS access_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      action TEXT NOT NULL,
      resource TEXT,
      ip_address TEXT,
      user_agent TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `;
  
  // Execute schema
  db.exec(authSchema, async (err) => {
    if (err) {
      console.error('Error creating auth tables:', err);
      db.close();
      return;
    }
    
    console.log('✓ Auth tables created');
    
    // Check if admin user already exists
    db.get('SELECT id FROM users WHERE email = ?', [ADMIN_EMAIL], async (err, existingAdmin) => {
      if (existingAdmin) {
        console.log('✓ Admin user already exists');
        
        // Create additional invite code for admin
        const newInviteCode = 'WEALTH-' + crypto.randomBytes(6).toString('hex').toUpperCase();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 90); // 90 days validity
        
        db.run(
          `INSERT INTO invite_codes (code, email, max_uses, expires_at, created_by, organization) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [newInviteCode, ADMIN_EMAIL, 5, expiresAt.toISOString(), 'system', 'Wealth Management Studio'],
          (err) => {
            if (err) {
              console.error('Error creating invite code:', err);
            } else {
              console.log('\n===========================================');
              console.log('NEW INVITE CODE FOR:', ADMIN_EMAIL);
              console.log('INVITE CODE:', newInviteCode);
              console.log('MAX USES: 5');
              console.log('EXPIRES:', expiresAt.toDateString());
              console.log('===========================================\n');
            }
            db.close();
          }
        );
      } else {
        // Create admin invite code first
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 90); // 90 days validity
        
        db.run(
          `INSERT INTO invite_codes (code, email, max_uses, expires_at, created_by, organization) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [ADMIN_INVITE_CODE, ADMIN_EMAIL, 10, expiresAt.toISOString(), 'system', 'Wealth Management Studio'],
          async (err) => {
            if (err) {
              console.error('Error creating admin invite code:', err);
              db.close();
              return;
            }
            
            console.log('✓ Admin invite code created');
            
            // Create admin user
            const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
            
            db.run(
              `INSERT INTO users (email, name, password_hash, invite_code_used, organization, role) 
               VALUES (?, ?, ?, ?, ?, ?)`,
              [ADMIN_EMAIL, 'Daniel Romitelli', passwordHash, ADMIN_INVITE_CODE, 'Wealth Management Studio', 'admin'],
              function(err) {
                if (err) {
                  console.error('Error creating admin user:', err);
                } else {
                  console.log('✓ Admin user created');
                  
                  // Update invite code usage
                  db.run('UPDATE invite_codes SET used_count = 1 WHERE code = ?', [ADMIN_INVITE_CODE]);
                  
                  console.log('\n===========================================');
                  console.log('ADMIN ACCOUNT CREATED SUCCESSFULLY');
                  console.log('===========================================');
                  console.log('Email:', ADMIN_EMAIL);
                  console.log('Initial Password:', ADMIN_PASSWORD);
                  console.log('Invite Code:', ADMIN_INVITE_CODE);
                  console.log('Remaining Uses: 9');
                  console.log('\nIMPORTANT: Change password after first login!');
                  console.log('===========================================\n');
                  
                  // Create additional invite codes for testing
                  const testCodes = [
                    { code: 'WEALTH-DEMO-001', maxUses: 3, org: 'Demo Organization' },
                    { code: 'WEALTH-TEST-002', maxUses: 1, org: 'Test Company' }
                  ];
                  
                  testCodes.forEach(({ code, maxUses, org }) => {
                    const testExpiry = new Date();
                    testExpiry.setDate(testExpiry.getDate() + 30);
                    
                    db.run(
                      `INSERT INTO invite_codes (code, max_uses, expires_at, created_by, organization) 
                       VALUES (?, ?, ?, ?, ?)`,
                      [code, maxUses, testExpiry.toISOString(), ADMIN_EMAIL, org],
                      (err) => {
                        if (!err) {
                          console.log(`✓ Test invite code created: ${code}`);
                        }
                      }
                    );
                  });
                }
                
                setTimeout(() => db.close(), 1000);
              }
            );
          }
        );
      }
    });
  });
}

// Run setup
setupAuth().catch(console.error);