-- Wealth Management Platform Schema for Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Content table
CREATE TABLE IF NOT EXISTS content (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  section_type VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content_data JSONB,
  chart_data JSONB,
  display_order INTEGER DEFAULT 999,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Templates table
CREATE TABLE IF NOT EXISTS templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  section_type VARCHAR(100) NOT NULL,
  template_data JSONB,
  is_locked BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Partners table
CREATE TABLE IF NOT EXISTS partners (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  firm_name VARCHAR(255) NOT NULL,
  contact_name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  specialization TEXT,
  tier VARCHAR(50),
  status VARCHAR(50) DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Partner firms table
CREATE TABLE IF NOT EXISTS partner_firms (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  specialization TEXT,
  tier VARCHAR(50),
  contact_person VARCHAR(255),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  website VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Marketing campaigns table
CREATE TABLE IF NOT EXISTS marketing_campaigns (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100),
  status VARCHAR(50) DEFAULT 'draft',
  content JSONB,
  visual_specs JSONB,
  metrics JSONB,
  scheduled_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI agents history table
CREATE TABLE IF NOT EXISTS ai_agents_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agent_type VARCHAR(100) NOT NULL,
  action VARCHAR(100) NOT NULL,
  input_data JSONB,
  output_data JSONB,
  status VARCHAR(50),
  error_message TEXT,
  execution_time INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Upload history table
CREATE TABLE IF NOT EXISTS upload_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  file_type VARCHAR(50),
  file_size INTEGER,
  processed BOOLEAN DEFAULT false,
  sections_extracted INTEGER,
  upload_path VARCHAR(500),
  processing_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Generated documents table
CREATE TABLE IF NOT EXISTS generated_documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  document_type VARCHAR(100) NOT NULL,
  filename VARCHAR(255),
  file_path VARCHAR(500),
  file_size INTEGER,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Brand protection log table
CREATE TABLE IF NOT EXISTS brand_protection_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  violation_type VARCHAR(100),
  attempted_style TEXT,
  blocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  component VARCHAR(100),
  user_id VARCHAR(255)
);

-- Social connections table
CREATE TABLE IF NOT EXISTS social_connections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  platform VARCHAR(50) NOT NULL,
  account_name VARCHAR(255),
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Charts table
CREATE TABLE IF NOT EXISTS charts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50),
  data JSONB,
  options JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_content_section_type ON content(section_type);
CREATE INDEX idx_content_display_order ON content(display_order);
CREATE INDEX idx_partners_firm_name ON partners(firm_name);
CREATE INDEX idx_partners_status ON partners(status);
CREATE INDEX idx_campaigns_status ON marketing_campaigns(status);
CREATE INDEX idx_campaigns_scheduled ON marketing_campaigns(scheduled_date);
CREATE INDEX idx_ai_agents_type ON ai_agents_history(agent_type);
CREATE INDEX idx_ai_agents_created ON ai_agents_history(created_at);

-- Row Level Security (RLS)
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_firms ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agents_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE upload_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_protection_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE charts ENABLE ROW LEVEL SECURITY;

-- Create policies for service role (allow all operations)
CREATE POLICY "Service role can do everything" ON content FOR ALL USING (true);
CREATE POLICY "Service role can do everything" ON templates FOR ALL USING (true);
CREATE POLICY "Service role can do everything" ON partners FOR ALL USING (true);
CREATE POLICY "Service role can do everything" ON partner_firms FOR ALL USING (true);
CREATE POLICY "Service role can do everything" ON marketing_campaigns FOR ALL USING (true);
CREATE POLICY "Service role can do everything" ON ai_agents_history FOR ALL USING (true);
CREATE POLICY "Service role can do everything" ON upload_history FOR ALL USING (true);
CREATE POLICY "Service role can do everything" ON generated_documents FOR ALL USING (true);
CREATE POLICY "Service role can do everything" ON brand_protection_log FOR ALL USING (true);
CREATE POLICY "Service role can do everything" ON social_connections FOR ALL USING (true);
CREATE POLICY "Service role can do everything" ON charts FOR ALL USING (true);

-- Create update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update timestamp triggers
CREATE TRIGGER update_content_updated_at BEFORE UPDATE ON content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partners_updated_at BEFORE UPDATE ON partners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partner_firms_updated_at BEFORE UPDATE ON partner_firms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON marketing_campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_updated_at BEFORE UPDATE ON social_connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_charts_updated_at BEFORE UPDATE ON charts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();