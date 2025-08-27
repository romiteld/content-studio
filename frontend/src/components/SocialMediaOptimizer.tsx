import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useToast } from './ui/Toast';
import { apiFetch } from '../config/api';
import WealthIntegrationsOrbit from './ui/wealth-integrations-orbit';

interface PlatformResult {
  platform: string;
  optimizedContent: string;
  warnings: string[];
  suggestions: string[];
  metadata: any;
}

interface SocialMediaOptimizerProps {
  contentItems: any[];
}

interface PlatformAuth {
  platform: string;
  isConnected: boolean;
  username?: string;
  expiresAt?: string;
}

const SocialMediaOptimizer: React.FC<SocialMediaOptimizerProps> = ({ contentItems }) => {
  const [selectedContent, setSelectedContent] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('linkedin');
  const [optimizedResults, setOptimizedResults] = useState<PlatformResult | null>(null);
  const [validationResults, setValidationResults] = useState<any>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [activeTab, setActiveTab] = useState<'optimize' | 'validate' | 'schedule'>('optimize');
  // const [contentFromUpload, setContentFromUpload] = useState('');
  const [platformAuths, setPlatformAuths] = useState<PlatformAuth[]>([]);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const { showToast } = useToast();

  const checkPlatformConnections = useCallback(async () => {
    // Check OAuth connections for platforms
    const auths: PlatformAuth[] = [
      { platform: 'linkedin', isConnected: false },
      { platform: 'facebook', isConnected: false },
      { platform: 'twitter', isConnected: false },
      { platform: 'instagram', isConnected: false }
    ];
    setPlatformAuths(auths);
  }, []);

  useEffect(() => {
    checkPlatformConnections();
  }, [checkPlatformConnections]);

  const connectPlatform = useCallback(async (platform: string) => {
    try {
      const data = await apiFetch<{ authUrl?: string }>({ path: `/api/social/auth/${platform}/connect`, method: 'GET' });
      if (data.authUrl) {
        window.open(data.authUrl, '_blank', 'width=600,height=600');
        // Wait for callback and refresh connections
        setTimeout(() => checkPlatformConnections(), 3000);
      }
    } catch (error) {
      console.error(`Failed to connect ${platform}:`, error);
      showToast(`OAuth connection for ${platform} is simulated in this demo.`, 'info');
    }
  }, [checkPlatformConnections, showToast]);

  const platforms = useMemo(() => [
    { id: 'linkedin', name: 'LinkedIn', color: '#0077B5', limit: 3000 },
    { id: 'facebook', name: 'Facebook', color: '#1877F2', limit: 63206 },
    { id: 'twitter', name: 'Twitter/X', color: '#1DA1F2', limit: 280 },
    { id: 'instagram', name: 'Instagram', color: '#E4405F', limit: 2200 }
  ], []);

  const handleContentSelect = (content: any) => {
    const text = content.content_data?.description || content.content_data?.content || '';
    // Always append CTA to thewell.solutions
    const textWithCTA = text + '\n\nLearn more at https://thewell.solutions';
    setSelectedContent(textWithCTA);
    // setContentFromUpload(textWithCTA);
  };

  const handleManualContentChange = (value: string) => {
    // Ensure CTA is always present
    let newContent = value;
    if (!value.includes('thewell.solutions')) {
      newContent = value + (value.trim() ? '\n\n' : '') + 'Learn more at https://thewell.solutions';
    }
    setSelectedContent(newContent);
  };

  const handleOptimize = async () => {
    if (!selectedContent) {
      showToast('Enter content to optimize', 'info');
      return;
    }

    setIsOptimizing(true);
    try {
      const data = await apiFetch<PlatformResult>({
        path: '/api/social/optimize',
        method: 'POST',
        body: JSON.stringify({
          content: selectedContent,
          platform: selectedPlatform,
          contentType: 'post',
        }),
      });
      setOptimizedResults(data);
    } catch (error) {
      console.error('Optimization error:', error);
      showToast('Failed to optimize content', 'error');
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleValidate = async () => {
    if (!selectedContent) {
      showToast('Enter content to validate', 'info');
      return;
    }

    try {
      const data = await apiFetch<any>({
        path: '/api/social/validate',
        method: 'POST',
        body: JSON.stringify({
          content: selectedContent,
          platform: selectedPlatform,
        }),
      });
      setValidationResults(data);
    } catch (error) {
      console.error('Validation error:', error);
    }
  };

  const handleGeneratePackage = async () => {
    if (!selectedContent) {
      showToast('Enter content to generate package', 'info');
      return;
    }

    setIsOptimizing(true);
    try {
      const data = await apiFetch<any>({
        path: '/api/social/package',
        method: 'POST',
        body: JSON.stringify({
          content: selectedContent,
          title: 'Wealth Management Update',
        }),
      });
      
      // Display results for all platforms
      if (data.success && data.package) {
        const allPlatformResults: PlatformResult[] = Object.entries(data.package.platforms).map(([platform, result]: [string, any]) => ({
          platform,
          ...(result as any)
        })) as any;
        (window as any).socialPackageResults = allPlatformResults;
        setOptimizedResults(allPlatformResults[0]);
        showToast('Social media package generated', 'success');
      }
    } catch (error) {
      console.error('Package generation error:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard', 'success');
  };

  return (
    <div className="social-media-optimizer">
      <h2>Social Media Content Optimizer</h2>
      
      <div className="optimizer-tabs">
        <button 
          className={`tab ${activeTab === 'optimize' ? 'active' : ''}`}
          onClick={() => setActiveTab('optimize')}
        >
          ✨ Optimize
        </button>
        <button 
          className={`tab ${activeTab === 'validate' ? 'active' : ''}`}
          onClick={() => setActiveTab('validate')}
        >
          ✅ Validate
        </button>
        <button 
          className={`tab ${activeTab === 'schedule' ? 'active' : ''}`}
          onClick={() => setActiveTab('schedule')}
        >
          📅 Schedule
        </button>
      </div>

      <div className="optimizer-content">
        <div className="content-selection">
          <h3>1. Select Content</h3>
          
          <div className="existing-content">
            <h4>From Existing Content:</h4>
            <div className="content-list-small">
              {contentItems.slice(0, 5).map((item) => (
                <div 
                  key={item.id} 
                  className="content-item-small"
                  onClick={() => handleContentSelect(item)}
                >
                  <span className="content-type-badge">{item.section_type}</span>
                  <span>{item.title}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="manual-content">
            <h4>Or Enter Content:</h4>
            <textarea
              value={selectedContent}
              onChange={(e) => handleManualContentChange(e.target.value)}
              placeholder="Enter your content here for social media optimization. Can be from uploaded documents or created from scratch..."
              rows={6}
            />
            <div className="char-count">
              {selectedContent.length} characters / {platforms.find(p => p.id === selectedPlatform)?.limit}
            </div>
          </div>
        </div>

        <div className="platform-selection">
          <h3>2. Select Platform</h3>
          <div className="platform-grid">
            {platforms.map((platform) => {
              return (
                <button
                  key={platform.id}
                  className={`platform-btn ${selectedPlatform === platform.id ? 'selected' : ''}`}
                  onClick={() => setSelectedPlatform(platform.id)}
                  style={{ borderColor: selectedPlatform === platform.id ? platform.color : 'transparent' }}
                >
                  <span className="platform-name">{platform.name}</span>
                </button>
              );
            })}
          </div>
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
            <WealthIntegrationsOrbit />
          </div>
        </div>

        {activeTab === 'optimize' && (
          <div className="optimization-actions">
            <h3>3. Optimize Content</h3>
            <div className="action-buttons">
              <button 
                className="btn-optimize"
                onClick={handleOptimize}
                disabled={isOptimizing}
              >
                {isOptimizing ? '⏳ Optimizing...' : '🚀 Optimize for Platform'}
              </button>
              <button 
                className="btn-package"
                onClick={handleGeneratePackage}
                disabled={isOptimizing}
              >
                {isOptimizing ? 'Generating...' : '📦 Generate All Platforms'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'validate' && (
          <div className="validation-actions">
            <h3>3. Validate Compliance</h3>
            <div className="action-buttons">
              <button 
                className="btn-validate"
                onClick={handleValidate}
                disabled={!selectedContent}
              >
                🔍 Check Compliance
              </button>
            </div>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="schedule-section">
            <h3>3. Schedule Posts</h3>
            
            <div className="platform-connections">
              <h4>Platform Connections</h4>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <WealthIntegrationsOrbit />
              </div>
              <div className="connection-grid">
                {platforms.map((platform) => {
                  const auth = platformAuths.find(a => a.platform === platform.id);
                  return (
                    <div key={platform.id} className="connection-item">
                      <div className="connection-info">
                        <span className="platform-name">{platform.name}</span>
                      </div>
                      {auth?.isConnected ? (
                        <span className="connected-status">✅ Connected</span>
                      ) : (
                        <button 
                          className="btn-connect"
                          onClick={() => connectPlatform(platform.id)}
                        >
                          Connect
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="schedule-form">
              <h4>Schedule Details</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Date</label>
                  <input 
                    type="date" 
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="form-group">
                  <label>Time</label>
                  <input 
                    type="time" 
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                  />
                </div>
              </div>
              
              <button 
                className="btn-schedule-posts"
                onClick={() => {
                  if (!scheduleDate || !scheduleTime) {
                    alert('Please select date and time');
                    return;
                  }
                  if (!selectedContent) {
                    alert('Please enter content to schedule');
                    return;
                  }
                  alert(`Posts scheduled for ${scheduleDate} at ${scheduleTime}\n\nNote: In production, this would schedule posts through connected platform APIs. Currently showing demo functionality.`);
                }}
                disabled={!selectedContent}
              >
                📅 Schedule Posts
              </button>
            </div>

            <div className="schedule-info">
              <p className="info-text">
                ℹ️ Connect your social media accounts to schedule posts directly. 
                All posts will automatically include a CTA to https://thewell.solutions
              </p>
            </div>
          </div>
        )}

        {optimizedResults && activeTab === 'optimize' && (
          <div className="optimization-results">
            <h3>Optimized Content</h3>
            {(window as any).socialPackageResults && (
              <div className="platform-tabs" style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                {(window as any).socialPackageResults.map((r: PlatformResult) => (
                  <button
                    key={r.platform}
                    className={`platform-btn ${optimizedResults.platform === r.platform ? 'selected' : ''}`}
                    onClick={() => setOptimizedResults(r)}
                    style={{ padding: '6px 10px' }}
                  >
                    {r.platform}
                  </button>
                ))}
              </div>
            )}
            <div style={{ marginBottom: 8, color: 'var(--text-secondary)' }}>Platform: {optimizedResults.platform}</div>
            
            <div className="optimized-content-box">
              <div className="content-header">
                <h4>Optimized Version</h4>
                <button 
                  className="btn-copy"
                  onClick={() => copyToClipboard(optimizedResults.optimizedContent)}
                >
                  📋 Copy
                </button>
              </div>
              <div className="optimized-text">
                {optimizedResults.optimizedContent}
              </div>
              <div className="content-stats">
                <span>📝 {optimizedResults.optimizedContent.length} characters</span>
              </div>
            </div>

            {optimizedResults.warnings && optimizedResults.warnings.length > 0 && (
              <div className="warnings-box">
                <h4>⚠️ Warnings</h4>
                <ul>
                  {optimizedResults.warnings.map((warning, idx) => (
                    <li key={idx}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}

            {optimizedResults.metadata && (
              <div className="metadata-box">
                <h4>📊 Recommendations</h4>
                <div className="cta-notice">
                  ✅ CTA to thewell.solutions automatically included
                </div>
                {optimizedResults.metadata.recommendedHashtags && (
                  <div className="hashtags">
                    <strong>Hashtags:</strong>
                    <div className="hashtag-list">
                      {optimizedResults.metadata.recommendedHashtags.map((tag: string, idx: number) => (
                        <span key={idx} className="hashtag">{tag}</span>
                      ))}
                    </div>
                  </div>
                )}
                {optimizedResults.metadata.bestPostTime && (
                  <div className="timing">
                    <strong>Best Time to Post:</strong> {optimizedResults.metadata.bestPostTime}
                  </div>
                )}
                {optimizedResults.metadata.expectedEngagement && (
                  <div className="engagement">
                    <strong>Expected Engagement:</strong> {optimizedResults.metadata.expectedEngagement}
                  </div>
                )}
              </div>
            )}

            {optimizedResults.suggestions && optimizedResults.suggestions.length > 0 && (
              <div className="suggestions-box">
                <h4>💡 Best Practices</h4>
                <ul>
                  {optimizedResults.suggestions.slice(0, 5).map((suggestion, idx) => (
                    <li key={idx}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {validationResults && activeTab === 'validate' && (
          <div className="validation-results">
            <h3>Compliance Check for {validationResults.platform}</h3>
            
            <div className={`compliance-status ${validationResults.compliant ? 'compliant' : 'non-compliant'}`}>
              {validationResults.compliant ? '✅ Content is Compliant' : '❌ Compliance Issues Found'}
            </div>

            {validationResults.issues && validationResults.issues.length > 0 && (
              <div className="issues-box">
                <h4>🚫 Issues</h4>
                <ul>
                  {validationResults.issues.map((issue: string, idx: number) => (
                    <li key={idx}>{issue}</li>
                  ))}
                </ul>
              </div>
            )}

            {validationResults.warnings && validationResults.warnings.length > 0 && (
              <div className="warnings-box">
                <h4>⚠️ Warnings</h4>
                <ul>
                  {validationResults.warnings.map((warning: string, idx: number) => (
                    <li key={idx}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="platform-guidelines-info">
        <h3>Platform Guidelines</h3>
        <div className="guidelines-grid">
          <div className="guideline-card">
            <h4>💼 LinkedIn</h4>
            <ul>
              <li>3,000 character limit for posts</li>
              <li>Professional tone required</li>
              <li>3-5 hashtags optimal</li>
              <li>Best: Tue-Thu, 8-10 AM</li>
            </ul>
          </div>
          <div className="guideline-card">
            <h4>👥 Facebook</h4>
            <ul>
              <li>63,206 character limit</li>
              <li>40-80 chars for best engagement</li>
              <li>1-2 hashtags maximum</li>
              <li>Best: 7-9 AM, 7-9 PM</li>
            </ul>
          </div>
          <div className="guideline-card">
            <h4>🐦 Twitter/X</h4>
            <ul>
              <li>280 character limit</li>
              <li>Use threads for longer content</li>
              <li>1-2 hashtags optimal</li>
              <li>Best: 9-10 AM, 7-9 PM</li>
            </ul>
          </div>
          <div className="guideline-card">
            <h4>📸 Instagram</h4>
            <ul>
              <li>2,200 character limit</li>
              <li>5-10 hashtags optimal</li>
              <li>Use emojis strategically</li>
              <li>Best: 5 AM, 11 AM-2 PM</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialMediaOptimizer;