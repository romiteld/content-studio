-- The Well LinkedIn Content System - Database Extensions
-- This schema extends the existing wealth_training.db for The Well's recruitment content

-- Content Calendar for scheduling LinkedIn posts
CREATE TABLE IF NOT EXISTS content_calendar (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  publish_date DATETIME NOT NULL,
  content_type TEXT CHECK(content_type IN (
    'talent_ticker', 'partner_spotlight', 'market_analysis', 
    'career_guide', 'compensation_report', 'culture_decoder',
    'video', 'carousel', 'poll', 'article', 'infographic'
  )),
  title TEXT NOT NULL,
  content_body TEXT NOT NULL,
  linkedin_optimized BOOLEAN DEFAULT 0,
  hashtags TEXT,
  status TEXT CHECK(status IN ('draft', 'scheduled', 'published', 'archived')) DEFAULT 'draft',
  agent_assigned TEXT,
  performance_score REAL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  published_at TIMESTAMP,
  FOREIGN KEY (content_id) REFERENCES content(id)
);

-- Partner Firms Database
CREATE TABLE IF NOT EXISTS partner_firms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  firm_name TEXT NOT NULL UNIQUE,
  category TEXT CHECK(category IN (
    'retirement', 'wealth_management', 'insurance', 'general_advisory'
  )),
  firm_size TEXT CHECK(firm_size IN ('small', 'medium', 'large', 'enterprise')),
  hiring_active BOOLEAN DEFAULT 1,
  current_openings INTEGER DEFAULT 0,
  last_feature_date DATE,
  culture_notes TEXT,
  compensation_range TEXT,
  key_requirements TEXT,
  website_url TEXT,
  linkedin_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Agent Task Management
CREATE TABLE IF NOT EXISTS agent_tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  agent_id INTEGER NOT NULL,
  agent_name TEXT CHECK(agent_name IN (
    'market_intelligence', 'content_architect', 'creative_producer',
    'compliance_validator', 'social_optimizer', 'engagement_manager', 
    'analytics_navigator'
  )),
  task_type TEXT NOT NULL,
  task_description TEXT,
  priority INTEGER CHECK(priority BETWEEN 1 AND 5) DEFAULT 3,
  status TEXT CHECK(status IN ('pending', 'in_progress', 'completed', 'failed')) DEFAULT 'pending',
  input_data JSON,
  output_data JSON,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Engagement Metrics Tracking
CREATE TABLE IF NOT EXISTS engagement_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content_id INTEGER NOT NULL,
  platform TEXT DEFAULT 'linkedin',
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  click_through_rate REAL,
  engagement_rate REAL,
  qualified_leads INTEGER DEFAULT 0,
  tracked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (content_id) REFERENCES content_calendar(id)
);

-- Talent Market Intelligence
CREATE TABLE IF NOT EXISTS talent_market_data (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  data_date DATE NOT NULL,
  role_category TEXT NOT NULL,
  metric_type TEXT CHECK(metric_type IN (
    'demand_change', 'salary_trend', 'time_to_fill', 
    'turnover_rate', 'skill_demand', 'certification_trend'
  )),
  metric_value REAL,
  metric_direction TEXT CHECK(metric_direction IN ('up', 'down', 'stable')),
  percentage_change REAL,
  notes TEXT,
  source TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Content Templates for Quick Creation
CREATE TABLE IF NOT EXISTS linkedin_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  template_name TEXT NOT NULL UNIQUE,
  template_type TEXT,
  template_structure TEXT NOT NULL,
  variables JSON,
  hashtag_set TEXT,
  compliance_approved BOOLEAN DEFAULT 0,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Campaign Performance Tracking
CREATE TABLE IF NOT EXISTS content_campaigns (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  campaign_name TEXT NOT NULL,
  campaign_type TEXT,
  start_date DATE,
  end_date DATE,
  target_audience TEXT,
  goals JSON,
  total_reach INTEGER DEFAULT 0,
  total_engagement INTEGER DEFAULT 0,
  leads_generated INTEGER DEFAULT 0,
  conversion_rate REAL,
  roi_percentage REAL,
  status TEXT CHECK(status IN ('planning', 'active', 'completed', 'paused')) DEFAULT 'planning',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Compliance Rules and Violations
CREATE TABLE IF NOT EXISTS compliance_rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  rule_name TEXT NOT NULL,
  rule_type TEXT CHECK(rule_type IN ('prohibited_term', 'required_disclaimer', 'character_limit', 'hashtag_limit')),
  rule_pattern TEXT,
  rule_action TEXT CHECK(rule_action IN ('block', 'warn', 'auto_fix')),
  severity TEXT CHECK(severity IN ('critical', 'high', 'medium', 'low')) DEFAULT 'medium',
  active BOOLEAN DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Partner Firm Features Tracking
CREATE TABLE IF NOT EXISTS partner_features (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  partner_firm_id INTEGER NOT NULL,
  content_calendar_id INTEGER,
  feature_type TEXT,
  feature_date DATE,
  engagement_score REAL,
  leads_generated INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (partner_firm_id) REFERENCES partner_firms(id),
  FOREIGN KEY (content_calendar_id) REFERENCES content_calendar(id)
);

-- Create indexes for performance
CREATE INDEX idx_calendar_publish_date ON content_calendar(publish_date);
CREATE INDEX idx_calendar_status ON content_calendar(status);
CREATE INDEX idx_metrics_content_id ON engagement_metrics(content_id);
CREATE INDEX idx_partner_firms_category ON partner_firms(category);
CREATE INDEX idx_partner_firms_hiring ON partner_firms(hiring_active);
CREATE INDEX idx_agent_tasks_status ON agent_tasks(status);
CREATE INDEX idx_agent_tasks_agent ON agent_tasks(agent_name);
CREATE INDEX idx_market_data_date ON talent_market_data(data_date);
CREATE INDEX idx_campaigns_status ON content_campaigns(status);

-- Insert initial compliance rules
INSERT INTO compliance_rules (rule_name, rule_type, rule_pattern, rule_action, severity) VALUES
('No Guarantees', 'prohibited_term', 'guaranteed return|risk-free|no loss', 'block', 'critical'),
('No Direct Advice', 'prohibited_term', 'you should invest|buy now|sell immediately', 'warn', 'high'),
('Disclaimer Required', 'required_disclaimer', 'investment|advice|recommendation', 'auto_fix', 'high'),
('LinkedIn Character Limit', 'character_limit', '3000', 'block', 'medium'),
('LinkedIn Hashtag Limit', 'hashtag_limit', '5', 'warn', 'low');

-- Insert initial LinkedIn templates
INSERT INTO linkedin_templates (template_name, template_type, template_structure, hashtag_set) VALUES
('Talent Ticker Daily', 'talent_ticker', '📊 TALENT MARKET UPDATE | {date}\n\nTRENDING UP ↗️\n{trending_up}\n\nTRENDING DOWN ↘️\n{trending_down}\n\nSPOTLIGHT: {spotlight}\n\nWhat are you seeing in your market?', '#TalentIntelligence #WealthManagement #TheWell'),
('Partner Spotlight', 'partner_spotlight', '🏢 PARTNER SPOTLIGHT: {firm_name}\n\nWhat makes {firm_name} different:\n✓ {unique_value_1}\n✓ {unique_value_2}\n✓ {unique_value_3}\n\nCurrently hiring: {open_positions}\n\nInterested in joining their team? Let''s talk.', '#TheWell #WealthManagementCareers #{firm_name_hashtag}'),
('Career Guide', 'career_guide', '🎯 {title}\n\n{opening_hook}\n\nHere''s what you need to know:\n\n{key_point_1}\n\n{key_point_2}\n\n{key_point_3}\n\n{call_to_action}', '#CareerAdvice #FinancialAdvisors #TheWell');