-- Content storage (no styling information)
CREATE TABLE IF NOT EXISTS content (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  section_type TEXT NOT NULL CHECK(section_type IN (
    'cover', 'executive_summary', 'role_description', 
    'compensation_analysis', 'market_insights', 'call_to_action'
  )),
  title TEXT,
  content_data JSON NOT NULL,
  chart_data JSON,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Immutable templates (read-only in production)
CREATE TABLE IF NOT EXISTS templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  section_type TEXT NOT NULL,
  html_structure TEXT NOT NULL,
  css_rules TEXT NOT NULL,
  is_locked BOOLEAN DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Training materials uploads
CREATE TABLE IF NOT EXISTS uploads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_path TEXT NOT NULL,
  processed_content JSON,
  upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Generated documents
CREATE TABLE IF NOT EXISTS generated_documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  document_type TEXT NOT NULL CHECK(document_type IN ('pdf', 'pptx', 'html')),
  title TEXT NOT NULL,
  content_ids TEXT,
  file_path TEXT,
  generation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chart configurations (data only, styling auto-applied)
CREATE TABLE IF NOT EXISTS charts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chart_type TEXT NOT NULL CHECK(chart_type IN (
    'bar', 'line', 'pie', 'donut', 'radar', 'heatmap', 'sankey', 'treemap'
  )),
  chart_title TEXT,
  data_points JSON NOT NULL,
  labels JSON,
  content_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (content_id) REFERENCES content(id)
);

-- Audit log for brand protection
CREATE TABLE IF NOT EXISTS brand_protection_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT NOT NULL,
  attempted_action TEXT,
  blocked BOOLEAN DEFAULT 0,
  user_ip TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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

-- Insert default locked templates
INSERT INTO templates (name, section_type, html_structure, css_rules, is_locked) VALUES
('Cover Page', 'cover', '<div class="page cover-page"><div class="brand-header">{{logo}}</div><h1>{{title}}</h1></div>', 'LOCKED_CSS', 1),
('Executive Summary', 'executive_summary', '<div class="page"><h2>{{title}}</h2><div class="intro-section">{{content}}</div></div>', 'LOCKED_CSS', 1),
('Role Card', 'role_description', '<div class="role-card"><h3>{{title}}</h3><div class="role-content">{{content}}</div></div>', 'LOCKED_CSS', 1),
('Compensation Grid', 'compensation_analysis', '<div class="compensation-grid">{{data}}</div>', 'LOCKED_CSS', 1),
('CTA Section', 'call_to_action', '<div class="cta-section"><h2>{{title}}</h2><p>{{content}}</p></div>', 'LOCKED_CSS', 1);

-- Create indexes for performance
CREATE INDEX idx_content_section_type ON content(section_type);
CREATE INDEX idx_content_display_order ON content(display_order);
CREATE INDEX idx_charts_content_id ON charts(content_id);
CREATE INDEX idx_generated_documents_type ON generated_documents(document_type);