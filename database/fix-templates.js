const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'wealth_training.db');
const db = new Database(dbPath);

// Check if templates table exists and its structure
try {
  const tableInfo = db.prepare("PRAGMA table_info(templates)").all();
  console.log('Templates table structure:', tableInfo);
  
  // Check if type column exists
  const hasTypeColumn = tableInfo.some(col => col.name === 'type');
  
  if (!hasTypeColumn) {
    console.log('Adding type column to templates table...');
    db.exec('ALTER TABLE templates ADD COLUMN type TEXT');
    console.log('✓ Added type column');
  }
} catch (error) {
  console.log('Templates table does not exist, creating it...');
  db.exec(`
    CREATE TABLE templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      type TEXT,
      template_data TEXT NOT NULL,
      is_locked BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('✓ Created templates table');
}

db.close();
console.log('✅ Templates table fixed');
