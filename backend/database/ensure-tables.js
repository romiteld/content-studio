const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'wealth_training.db');
const db = new Database(dbPath);

// Ensure all required tables exist
const tables = [
  `CREATE TABLE IF NOT EXISTS content (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    section_type TEXT NOT NULL,
    title TEXT NOT NULL,
    content_data TEXT NOT NULL,
    chart_data TEXT,
    display_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
  
  `CREATE TABLE IF NOT EXISTS templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL,
    template_data TEXT NOT NULL,
    is_locked BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
  
  `CREATE TABLE IF NOT EXISTS upload_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    original_filename TEXT NOT NULL,
    processed_filename TEXT,
    file_size INTEGER,
    file_type TEXT,
    processing_status TEXT DEFAULT 'pending',
    error_message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
  
  `CREATE TABLE IF NOT EXISTS brand_protection_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    component TEXT,
    violation TEXT,
    blocked BOOLEAN DEFAULT 1,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
  
  `CREATE TABLE IF NOT EXISTS social_connections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    platform TEXT NOT NULL,
    account_name TEXT,
    access_token TEXT,
    refresh_token TEXT,
    expires_at DATETIME,
    active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
  
  `CREATE TABLE IF NOT EXISTS generated_documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    document_type TEXT NOT NULL,
    file_path TEXT NOT NULL,
    metadata TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
  
  `CREATE TABLE IF NOT EXISTS marketing_campaigns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    campaign_id TEXT UNIQUE,
    name TEXT NOT NULL,
    channels TEXT,
    content TEXT,
    metrics TEXT,
    status TEXT DEFAULT 'draft',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
  
  `CREATE TABLE IF NOT EXISTS ai_agents_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_type TEXT NOT NULL,
    request_data TEXT,
    response_data TEXT,
    success BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`
];

// Create tables
tables.forEach(sql => {
  try {
    db.exec(sql);
    console.log('✓ Table ensured');
  } catch (error) {
    console.error('Error creating table:', error.message);
  }
});

// Create indexes
const indexes = [
  'CREATE INDEX IF NOT EXISTS idx_content_section_type ON content(section_type)',
  'CREATE INDEX IF NOT EXISTS idx_content_display_order ON content(display_order)',
  'CREATE INDEX IF NOT EXISTS idx_upload_history_status ON upload_history(processing_status)',
  'CREATE INDEX IF NOT EXISTS idx_campaigns_status ON marketing_campaigns(status)',
  'CREATE INDEX IF NOT EXISTS idx_agents_type ON ai_agents_history(agent_type)'
];

indexes.forEach(sql => {
  try {
    db.exec(sql);
    console.log('✓ Index ensured');
  } catch (error) {
    console.error('Error creating index:', error.message);
  }
});

// Insert default templates if not exists
const defaultTemplates = [
  {
    name: 'Cover Page',
    type: 'cover',
    template_data: JSON.stringify({
      layout: 'centered',
      elements: ['title', 'subtitle', 'logo', 'date'],
      styles: { background: '#000', color: '#D4AF37' }
    })
  },
  {
    name: 'Executive Summary',
    type: 'executive_summary',
    template_data: JSON.stringify({
      layout: 'two-column',
      elements: ['heading', 'key_points', 'metrics'],
      styles: { background: '#1a1a1a', accent: '#2EA3F2' }
    })
  },
  {
    name: 'Role Description',
    type: 'role_description',
    template_data: JSON.stringify({
      layout: 'structured',
      elements: ['title', 'description', 'requirements', 'compensation'],
      styles: { background: '#000', highlight: '#BE9E44' }
    })
  }
];

const insertTemplate = db.prepare(`
  INSERT OR IGNORE INTO templates (name, type, template_data, is_locked)
  VALUES (?, ?, ?, 1)
`);

defaultTemplates.forEach(template => {
  insertTemplate.run(template.name, template.type, template.template_data);
});

console.log('\n✅ Database initialization complete');

// Show table counts
const tables_to_count = ['content', 'templates', 'partners', 'marketing_campaigns'];
tables_to_count.forEach(table => {
  try {
    const count = db.prepare(`SELECT COUNT(*) as total FROM ${table}`).get();
    console.log(`   ${table}: ${count.total} records`);
  } catch (e) {
    // Table might not exist
  }
});

db.close();