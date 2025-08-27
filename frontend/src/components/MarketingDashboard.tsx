import React, { useState } from 'react';
import { 
  Layout, 
  MessageSquare, 
  Mail, 
  Youtube, 
  FileText, 
  Calendar, 
  TrendingUp,
  Image,
  Mic,
  Video,
  Globe,
  DollarSign,
  Users,
  Sparkles,
  Layers,
  Wand2,
  Bot,
  Rocket,
  Target,
  BrainCircuit
} from 'lucide-react';
import TemplateGallery from './TemplateGallery';
import ImageGenerationStudio from './ImageGenerationStudio';
import AIAgentsPanel from './AIAgentsPanel';
import WealthIntegrationsOrbit from './ui/wealth-integrations-orbit';
import '../styles/MarketingDashboard.css';

// Marketing Channel Components
interface MarketingChannel {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  description: string;
  metrics?: {
    reach: number;
    engagement: number;
    conversions: number;
  };
}

const MARKETING_CHANNELS: MarketingChannel[] = [
  { 
    id: 'linkedin', 
    name: 'LinkedIn', 
    icon: MessageSquare, 
    color: '#0077B5',
    description: 'Professional networking & thought leadership'
  },
  { 
    id: 'email', 
    name: 'Email Campaigns', 
    icon: Mail, 
    color: '#EA4335',
    description: 'Nurture sequences & newsletters'
  },
  { 
    id: 'youtube', 
    name: 'YouTube', 
    icon: Youtube, 
    color: '#FF0000',
    description: 'Video content & webinars'
  },
  { 
    id: 'blog', 
    name: 'Blog & SEO', 
    icon: FileText, 
    color: '#4285F4',
    description: 'Long-form content & organic search'
  },
  { 
    id: 'tiktok', 
    name: 'TikTok', 
    icon: Video, 
    color: '#000000',
    description: 'Short-form viral content'
  },
  { 
    id: 'podcast', 
    name: 'Podcast', 
    icon: Mic, 
    color: '#8B5CF6',
    description: 'Audio content & interviews'
  },
  { 
    id: 'webinar', 
    name: 'Webinars', 
    icon: Globe, 
    color: '#10B981',
    description: 'Live events & education'
  },
  { 
    id: 'paid_ads', 
    name: 'Paid Advertising', 
    icon: DollarSign, 
    color: '#F59E0B',
    description: 'PPC & social ads'
  }
];

interface CampaignBrief {
  name: string;
  objective: string;
  target_audience: string;
  channels: string[];
  duration: number;
  budget?: number;
  key_messages: string[];
  kpis: string[];
}

interface MarketingDashboardProps {
  previewMode?: boolean;
}

export default function MarketingDashboard({ previewMode = false }: MarketingDashboardProps) {
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [campaignBrief, setCampaignBrief] = useState<CampaignBrief>({
    name: '',
    objective: '',
    target_audience: '',
    channels: [],
    duration: 1,
    key_messages: [],
    kpis: []
  });
  const [generatedContent, setGeneratedContent] = useState<any>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeView, setActiveView] = useState<'dashboard' | 'campaign' | 'content' | 'calendar' | 'templates' | 'studio' | 'agents'>('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [completion, setCompletion] = useState<string | null>(null);


  const handleChannelToggle = (channelId: string) => {
    setSelectedChannels(prev => 
      prev.includes(channelId) 
        ? prev.filter(id => id !== channelId)
        : [...prev, channelId]
    );
  };

  const generateCampaign = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('http://localhost:3001/api/ai/campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...campaignBrief,
          channels: selectedChannels
        })
      });
      const data = await response.json();
      setGeneratedContent(data.campaign);
    } catch (error) {
      console.error('Campaign generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const complete = async (prompt: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/ai/quick-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: 'social_graphic',
          topic: prompt 
        })
      });
      const data = await response.json();
      setCompletion(data.content);
    } catch (error) {
      console.error('Completion failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateQuickContent = async (channel: string, contentType: string) => {
    await complete(`Generate ${contentType} for ${channel} targeting wealth management professionals`);
  };

  return (
    <div className="marketing-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">
            <Target className="icon-sparkle" />
            AI Marketing Command Center
          </h1>
        </div>
        
        <nav className={`dashboard-nav ${previewMode ? 'preview-active' : ''}`}>
          <button 
            className={`nav-button ${activeView === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveView('dashboard')}
            data-label="Dashboard"
          >
            <Layout /> <span className="nav-button-text">Dashboard</span>
          </button>
          <button 
            className={`nav-button ${activeView === 'campaign' ? 'active' : ''}`}
            onClick={() => setActiveView('campaign')}
            data-label="Campaigns"
          >
            <TrendingUp /> <span className="nav-button-text">Campaigns</span>
          </button>
          <button 
            className={`nav-button ${activeView === 'content' ? 'active' : ''}`}
            onClick={() => setActiveView('content')}
            data-label="Content"
          >
            <FileText /> <span className="nav-button-text">Content</span>
          </button>
          <button 
            className={`nav-button ${activeView === 'templates' ? 'active' : ''}`}
            onClick={() => setActiveView('templates')}
            data-label="Templates"
          >
            <Layers /> <span className="nav-button-text">Templates</span>
          </button>
          <button 
            className={`nav-button ${activeView === 'studio' ? 'active' : ''}`}
            onClick={() => setActiveView('studio')}
            data-label="Studio"
          >
            <Wand2 /> <span className="nav-button-text">Studio</span>
          </button>
          <button 
            className={`nav-button ${activeView === 'agents' ? 'active' : ''}`}
            onClick={() => setActiveView('agents')}
            data-label="AI Agents"
          >
            <Bot /> <span className="nav-button-text">AI Agents</span>
          </button>
          <button 
            className={`nav-button ${activeView === 'calendar' ? 'active' : ''}`}
            onClick={() => setActiveView('calendar')}
            data-label="Calendar"
          >
            <Calendar /> <span className="nav-button-text">Calendar</span>
          </button>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="dashboard-main">
        {activeView === 'dashboard' && (
          <div className="dashboard-grid">
            {/* Metrics Overview */}
            <section className="metrics-section">
              <h2>Performance Metrics</h2>
              <div className="metrics-grid">
                <div className="metric-card">
                  <Users className="metric-icon" />
                  <div className="metric-value">45.2K</div>
                  <div className="metric-label">Total Reach</div>
                  <div className="metric-change positive">+12.3%</div>
                </div>
                <div className="metric-card">
                  <MessageSquare className="metric-icon" />
                  <div className="metric-value">3.8K</div>
                  <div className="metric-label">Engagements</div>
                  <div className="metric-change positive">+8.7%</div>
                </div>
                <div className="metric-card">
                  <TrendingUp className="metric-icon" />
                  <div className="metric-value">287</div>
                  <div className="metric-label">Qualified Leads</div>
                  <div className="metric-change positive">+15.2%</div>
                </div>
                <div className="metric-card">
                  <DollarSign className="metric-icon" />
                  <div className="metric-value">$4.2K</div>
                  <div className="metric-label">Cost per Lead</div>
                  <div className="metric-change negative">-5.3%</div>
                </div>
              </div>
            </section>

            {/* Channel Status */}
            <section className="channels-section">
              <h2>Marketing Channels</h2>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                <WealthIntegrationsOrbit />
              </div>
              <div className="channels-grid">
                {MARKETING_CHANNELS.map(channel => (
                  <div 
                    key={channel.id} 
                    className={`channel-card ${selectedChannels.includes(channel.id) ? 'selected' : ''}`}
                    onClick={() => handleChannelToggle(channel.id)}
                  >
                    <div className="channel-header" style={{ borderColor: channel.color }}>
                      <channel.icon className="channel-icon" style={{ color: channel.color }} />
                      <h3>{channel.name}</h3>
                    </div>
                    <p className="channel-description">{channel.description}</p>
                    <div className="channel-actions">
                      <button 
                        className="quick-generate-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          generateQuickContent(channel.id, 'post');
                        }}
                      >
                        Quick Generate
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Recent Campaigns */}
            <section className="campaigns-section">
              <h2>Recent Campaigns</h2>
              <div className="campaigns-list">
                <div className="campaign-item">
                  <div className="campaign-status active"></div>
                  <div className="campaign-info">
                    <h4>Q1 Talent Acquisition Drive</h4>
                    <p>Multi-channel • 8 weeks • 5 channels</p>
                  </div>
                  <div className="campaign-metrics">
                    <span>ROI: 312%</span>
                  </div>
                </div>
                <div className="campaign-item">
                  <div className="campaign-status scheduled"></div>
                  <div className="campaign-info">
                    <h4>Partner Firm Spotlight Series</h4>
                    <p>LinkedIn & Email • 4 weeks • Starting Feb 1</p>
                  </div>
                  <div className="campaign-metrics">
                    <span>Scheduled</span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeView === 'campaign' && (
          <div className="campaign-creator">
            <h2>Create Integrated Campaign</h2>
            
            <div className="campaign-form">
              <div className="form-section">
                <label>Campaign Name</label>
                <input 
                  type="text"
                  value={campaignBrief.name}
                  onChange={(e) => setCampaignBrief({...campaignBrief, name: e.target.value})}
                  placeholder="e.g., Spring 2025 Talent Acquisition"
                />
              </div>

              <div className="form-section">
                <label>Objective</label>
                <select 
                  className="form-control"
                  value={campaignBrief.objective}
                  onChange={(e) => setCampaignBrief({...campaignBrief, objective: e.target.value})}
                >
                  <option value="">Select objective</option>
                  <option value="awareness">Brand Awareness</option>
                  <option value="lead_generation">Lead Generation</option>
                  <option value="nurture">Lead Nurturing</option>
                  <option value="conversion">Conversion</option>
                  <option value="retention">Client Retention</option>
                </select>
              </div>

              <div className="form-section">
                <label>Target Audience</label>
                <select 
                  className="form-control"
                  value={campaignBrief.target_audience}
                  onChange={(e) => setCampaignBrief({...campaignBrief, target_audience: e.target.value})}
                >
                  <option value="">Select audience</option>
                  <option value="wealth_management_firms">Wealth Management Firms</option>
                  <option value="financial_advisors">Financial Advisors</option>
                  <option value="c_suite_executives">C-Suite Executives</option>
                  <option value="hr_directors">HR Directors</option>
                  <option value="job_seekers">Job Seekers</option>
                </select>
              </div>

              <div className="form-section">
                <label>Campaign Duration (months)</label>
                <input 
                  type="number"
                  min="1"
                  max="12"
                  value={campaignBrief.duration}
                  onChange={(e) => setCampaignBrief({...campaignBrief, duration: parseInt(e.target.value)})}
                />
              </div>

              <div className="form-section">
                <label>Select Channels</label>
                <div className="channel-selector">
                  {MARKETING_CHANNELS.map(channel => (
                    <label key={channel.id} className="channel-checkbox">
                      <input 
                        type="checkbox"
                        checked={selectedChannels.includes(channel.id)}
                        onChange={() => handleChannelToggle(channel.id)}
                      />
                      <span>{channel.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-section">
                <label>Key Messages</label>
                <textarea 
                  placeholder="Enter key messages, one per line"
                  onChange={(e) => setCampaignBrief({
                    ...campaignBrief, 
                    key_messages: e.target.value.split('\n').filter(m => m.trim())
                  })}
                />
              </div>

              <button 
                className="generate-campaign-btn"
                onClick={generateCampaign}
                disabled={isGenerating || selectedChannels.length === 0}
              >
                {isGenerating ? (
                  <>
                    <div className="spinner"></div>
                    Generating Campaign...
                  </>
                ) : (
                  <>
                    <Sparkles />
                    Generate Full Campaign
                  </>
                )}
              </button>
            </div>

            {generatedContent.content && (
              <div className="generated-results">
                <h3>Generated Campaign Content</h3>
                <div className="content-preview">
                  {Object.entries(generatedContent.content).map(([channel, content]) => (
                    <div key={channel} className="channel-content">
                      <h4>{channel}</h4>
                      <pre>{JSON.stringify(content, null, 2)}</pre>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeView === 'content' && (
          <div className="content-library">
            <h2>Content Library</h2>
            <div className="content-filters">
              <button className="filter-btn active">All</button>
              <button className="filter-btn">LinkedIn</button>
              <button className="filter-btn">Email</button>
              <button className="filter-btn">Blog</button>
              <button className="filter-btn">Video</button>
            </div>
            
            <div className="content-grid">
              {/* Generated content items would be displayed here */}
              <div className="content-item">
                <Image className="content-type-icon" />
                <h4>Talent Market Update - January 2025</h4>
                <p>LinkedIn Post • Published 2 hours ago</p>
                <div className="content-stats">
                  <span>👁 1.2K views</span>
                  <span>💬 45 comments</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView === 'templates' && (
          <TemplateGallery />
        )}

        {activeView === 'studio' && (
          <ImageGenerationStudio />
        )}

        {activeView === 'agents' && (
          <AIAgentsPanel />
        )}

        {activeView === 'calendar' && (
          <div className="content-calendar">
            <h2>Content Calendar</h2>
            <div className="calendar-view">
              {/* Calendar implementation would go here */}
              <div className="calendar-header">
                <button>← Previous</button>
                <h3>January 2025</h3>
                <button>Next →</button>
              </div>
              <div className="calendar-grid">
                {/* Calendar days with scheduled content */}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* AI Assistant Panel */}
      <aside className="ai-assistant">
        <div className="assistant-header" style={{ display: 'none' }}>
          <Sparkles />
          <h3>AI Marketing Assistant</h3>
        </div>
        <div className="assistant-content">
          {isLoading ? (
            <div className="assistant-thinking">
              <div className="thinking-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <p>Generating content...</p>
            </div>
          ) : completion ? (
            <div className="assistant-response">
              <p>{completion}</p>
            </div>
          ) : (
            <div className="assistant-suggestions">
              <h4>Quick Actions</h4>
              <button onClick={() => generateQuickContent('linkedin', 'talent ticker')}>
                Generate Today's Talent Ticker
              </button>
              <button onClick={() => generateQuickContent('email', 'newsletter')}>
                Create Weekly Newsletter
              </button>
              <button onClick={() => generateQuickContent('blog', 'seo article')}>
                Write SEO Blog Post
              </button>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}