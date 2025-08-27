import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from './ui/Toast';
import { apiFetch } from '../config/api';

interface ResearchResult {
  title: string;
  url: string;
  content: string;
  cleanContent?: string;
  source?: string;
  date?: string;
}

interface TrendingTopic {
  topic: string;
  category: string;
  engagement: string;
  hashtags: string[];
}

interface ResearchPanelProps {
  onContentAdded: () => void;
}

const ResearchPanel: React.FC<ResearchPanelProps> = ({ onContentAdded }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<ResearchResult[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [activeTab, setActiveTab] = useState<'search' | 'trending'>('search');
  const { showToast } = useToast();

  useEffect(() => {
    fetchTrendingTopics();
  }, []);

  const fetchTrendingTopics = async () => {
    try {
      const data = await apiFetch<{ topics: TrendingTopic[] }>({ path: '/api/research/trending', method: 'GET' });
      setTrendingTopics(data.topics || []);
    } catch (error) {
      // Fallback trending topics
      setTrendingTopics([
        {
          topic: 'AI in Wealth Management',
          category: 'Technology',
          engagement: 'High',
          hashtags: ['#AIWealth', '#WealthTech', '#FinTech2025']
        },
        {
          topic: 'ESG Investment Strategies',
          category: 'Sustainability',
          engagement: 'Very High',
          hashtags: ['#ESGInvesting', '#SustainableWealth', '#GreenFinance']
        },
        {
          topic: 'Retirement Planning for Millennials',
          category: 'Demographics',
          engagement: 'High',
          hashtags: ['#RetirementPlanning', '#MillennialMoney', '#FutureWealth']
        },
        {
          topic: 'Cryptocurrency Portfolio Management',
          category: 'Digital Assets',
          engagement: 'Trending',
          hashtags: ['#CryptoWealth', '#DigitalAssets', '#Bitcoin2025']
        },
        {
          topic: 'Tax Optimization Strategies 2025',
          category: 'Tax Planning',
          engagement: 'Medium',
          hashtags: ['#TaxPlanning', '#WealthOptimization', '#TaxStrategy']
        }
      ]);
    }
  };

  // Clean HTML/markdown content for display
  const cleanContent = (content: string): string => {
    // Remove HTML tags
    let cleaned = content.replace(/<[^>]*>/g, '');
    // Remove markdown formatting
    cleaned = cleaned.replace(/#{1,6}\s/g, ''); // Headers
    cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1'); // Bold
    cleaned = cleaned.replace(/\*([^*]+)\*/g, '$1'); // Italic
    cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'); // Links
    cleaned = cleaned.replace(/```[^`]*```/g, ''); // Code blocks
    cleaned = cleaned.replace(/`([^`]+)`/g, '$1'); // Inline code
    cleaned = cleaned.replace(/^[-*+]\s/gm, '• '); // Lists
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n'); // Multiple newlines
    cleaned = cleaned.trim();
    
    // Truncate if too long
    if (cleaned.length > 500) {
      cleaned = cleaned.substring(0, 497) + '...';
    }
    
    return cleaned;
  };

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    try {
      const data = await apiFetch<{ results: any[] }>({
        path: '/api/research/search',
        method: 'POST',
        body: JSON.stringify({ query: searchQuery, limit: 5 })
      });
      // Process and clean the results
      const processedResults = (data.results || []).map((result: any) => ({
        ...result,
        cleanContent: cleanContent(result.content || result.description || '')
      }));
      setResults(processedResults);
    } catch (error) {
      console.error('Search failed:', error);
      showToast('Search failed', 'error');
      // Use sample data if API fails
      setResults([
        {
          title: "Wealth Management Trends 2025",
          url: "https://example.com/trends",
          content: "Digital transformation is reshaping wealth management with AI-driven advisory services."
        },
        {
          title: "ESG Investing Guide",
          url: "https://example.com/esg",
          content: "Environmental, Social, and Governance factors are increasingly important in wealth management."
        }
      ]);
    } finally {
      setSearching(false);
    }
  }, [searchQuery, showToast]);

  // Debounce typing to auto-search after pause
  useEffect(() => {
    if (!searchQuery.trim()) return;
    
    const timer = window.setTimeout(() => {
      if (activeTab === 'search') {
        handleSearch();
      }
    }, 500);
    
    return () => window.clearTimeout(timer);
  }, [searchQuery, activeTab, handleSearch]);

  const searchTrendingTopic = (topic: TrendingTopic) => {
    const query = `${topic.topic} wealth management ${topic.hashtags.join(' ')}`;
    setSearchQuery(query);
    setActiveTab('search');
    handleSearch();
  };

  const addToContent = async (result: ResearchResult) => {
    try {
      console.log('Adding research to content:', result);
      
      const requestBody = {
        title: result.title,
        content: result.cleanContent || result.content,
        url: result.url
      };
      
      console.log('Request body:', requestBody);
      const data = await apiFetch<{ success: boolean }>({
        path: '/api/research/convert',
        method: 'POST',
        body: JSON.stringify(requestBody)
      });
      console.log('Response data:', data);
      
      if (data.success) {
        showToast('Research added to content', 'success');
        onContentAdded();
      } else {
        console.error('Failed to add research:', data);
        showToast('Failed to add research', 'error');
      }
    } catch (error) {
      console.error('Failed to add research:', error);
      showToast('Error adding research', 'error');
    }
  };

  return (
    <div className="research-panel">
      <h2>Online Research & Trending Topics</h2>
      
      <div className="research-tabs">
        <button 
          className={`tab ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => setActiveTab('search')}
        >
          🔍 Search
        </button>
        <button 
          className={`tab ${activeTab === 'trending' ? 'active' : ''}`}
          onClick={() => setActiveTab('trending')}
        >
          🔥 Trending Topics
        </button>
      </div>

      {activeTab === 'search' && (
        <>
          <div className="search-section">
            <div className="search-bar">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search web content, articles, industry reports, social media, content resources..."
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button 
                onClick={handleSearch} 
                disabled={searching}
                className="btn-search"
              >
                {searching ? 'Searching...' : '🔍 Search'}
              </button>
            </div>
          </div>

          <div className="research-results">
            {searching && (
              <>
                <div className="research-item skeleton" />
                <div className="research-item skeleton" />
              </>
            )}
            {results.length > 0 && (
              <>
                <h3>Research Results</h3>
                {results.map((result, index) => (
                  <div key={index} className="research-item">
                    <h4>{result.title}</h4>
                    <p className="research-content">{result.cleanContent || cleanContent(result.content)}</p>
                    {result.source && <span className="research-source">Source: {result.source}</span>}
                    <div className="research-actions">
                      <a href={result.url} target="_blank" rel="noopener noreferrer" className="research-link">
                        View Source
                      </a>
                      <button 
                        onClick={() => addToContent(result)}
                        className="btn-add-research"
                      >
                        Add to Content
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </>
      )}

      {activeTab === 'trending' && (
        <div className="trending-section">
          <h3>🔥 Trending Topics in Wealth Management</h3>
          <p className="trending-description">
            Discover what's trending to maximize engagement on social media
          </p>
          <div className="trending-grid">
            {trendingTopics.map((topic, index) => (
              <div key={index} className="trending-card">
                <div className="trending-header">
                  <span className="trending-category">{topic.category}</span>
                  <span className={`trending-engagement engagement-${topic.engagement.toLowerCase().replace(' ', '-')}`}>
                    {topic.engagement}
                  </span>
                </div>
                <h4 className="trending-title">{topic.topic}</h4>
                <div className="trending-hashtags">
                  {topic.hashtags.map((tag, idx) => (
                    <span key={idx} className="hashtag-badge">{tag}</span>
                  ))}
                </div>
                <button 
                  className="btn-use-trending"
                  onClick={() => searchTrendingTopic(topic)}
                >
                  Research This Topic
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="research-info">
        <h3>Research Features</h3>
        <ul>
          <li>✅ Search across the entire web - articles, blogs, reports</li>
          <li>✅ Industry news from financial publications</li>
          <li>✅ Social media content from LinkedIn, Twitter, and more</li>
          <li>✅ Academic papers and research studies</li>
          <li>✅ Auto-format content with brand styling</li>
          <li>✅ Direct integration with content studio</li>
        </ul>
      </div>
    </div>
  );
};

export default ResearchPanel;