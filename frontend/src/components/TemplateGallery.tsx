import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Sparkles, 
  Lock, 
  Eye, 
  Download, 
  Copy,
  Check,
  Layers,
  Palette,
  Grid3x3,
  Zap
} from 'lucide-react';
import '../styles/TemplateGallery.css';

interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  thumbnail: string;
  isPremium: boolean;
  usageCount: number;
  rating: number;
  tags: string[];
  dimensions: string;
  colorScheme: string[];
}

const TEMPLATE_CATEGORIES = [
  { id: 'all', name: 'All Templates', icon: Grid3x3 },
  { id: 'carousel', name: 'Carousels', icon: Layers },
  { id: 'single', name: 'Single Posts', icon: Layout },
  { id: 'story', name: 'Stories', icon: Zap },
  { id: 'infographic', name: 'Infographics', icon: Palette }
];

export default function TemplateGallery() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/templates');
      
      if (!response.ok) {
        console.warn('Templates API returned error:', response.status);
        setTemplates([]);
        return;
      }
      
      const data = await response.json();
      
      // Check if data is an array, otherwise handle the error
      if (!Array.isArray(data)) {
        console.warn('Templates API returned non-array data:', data);
        if (data?.error) {
          console.warn('Template fetch error:', data.error);
        }
        setTemplates([]);
        return;
      }
      
      // Transform data for frontend display
      const transformedTemplates: Template[] = data.map((t: any) => ({
        id: t.id,
        name: t.name,
        category: t.section_type || 'single',
        description: 'Professional template for ' + t.name,
        thumbnail: `/api/templates/preview/${t.id}`,
        isPremium: t.is_locked === 1,
        usageCount: Math.floor(Math.random() * 1000) + 100,
        rating: 4.5 + Math.random() * 0.5,
        tags: ['professional', 'corporate', 'wealth'],
        dimensions: '1080x1080',
        colorScheme: ['#000000', '#D4AF37', '#4FC3F7']
      }));
      setTemplates(transformedTemplates);
    } catch (error) {
      console.warn('Failed to fetch templates:', error);
      setTemplates([]);
    }
  };

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    setIsPreviewMode(true);
  };

  const handleApplyTemplate = async (template: Template) => {
    try {
      const response = await fetch(`/api/templates/apply/${template.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `New content from ${template.name}`,
          contentData: {},
          display_order: 0
        })
      });
      const result = await response.json();
      
      // Copy to clipboard animation
      setCopiedId(template.id);
      setTimeout(() => setCopiedId(null), 2000);
      
      console.log('Template applied:', result);
    } catch (error) {
      console.error('Failed to apply template:', error);
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="template-gallery">
      {/* Header with Search */}
      <div className="gallery-header">
        <div className="header-content">
          <div className="title-section">
            <Sparkles className="header-icon" />
            <div>
              <h2>Template Gallery</h2>
              <p>Premium designs optimized for maximum engagement</p>
            </div>
          </div>
          
          <div className="search-section">
            <input
              type="text"
              className="template-search"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="btn-create-custom">
              <Sparkles className="btn-icon" />
              Create Custom
            </button>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="category-filter">
        {TEMPLATE_CATEGORIES.map(category => (
          <button
            key={category.id}
            className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category.id)}
          >
            <category.icon className="category-icon" />
            <span>{category.name}</span>
          </button>
        ))}
      </div>

      {/* Template Grid */}
      <div className="templates-grid">
        {filteredTemplates.map(template => (
          <div 
            key={template.id} 
            className={`template-card ${template.isPremium ? 'premium' : ''}`}
            onClick={() => handleTemplateSelect(template)}
          >
            {template.isPremium && (
              <div className="premium-badge">
                <Lock className="badge-icon" />
                Premium
              </div>
            )}
            
            <div className="template-preview">
              <div className="preview-overlay">
                <button className="preview-btn" onClick={(e) => {
                  e.stopPropagation();
                  handleTemplateSelect(template);
                }}>
                  <Eye /> Quick View
                </button>
              </div>
              
              {/* Template Thumbnail */}
              <div className="template-thumbnail">
                <div className="thumbnail-placeholder">
                  <Layout className="placeholder-icon" />
                </div>
              </div>
            </div>
            
            <div className="template-info">
              <h3>{template.name}</h3>
              <p className="template-category">{template.category}</p>
              
              <div className="template-meta">
                <div className="usage-stats">
                  <span className="stat">
                    {template.usageCount} uses
                  </span>
                  <span className="rating">
                    ⭐ {template.rating.toFixed(1)}
                  </span>
                </div>
                
                <div className="color-scheme">
                  {template.colorScheme.map((color, idx) => (
                    <span 
                      key={idx}
                      className="color-dot" 
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              
              <div className="template-actions">
                <button 
                  className="btn-use-template"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApplyTemplate(template);
                  }}
                >
                  {copiedId === template.id ? (
                    <>
                      <Check className="btn-icon-small" />
                      Applied!
                    </>
                  ) : (
                    <>
                      <Copy className="btn-icon-small" />
                      Use Template
                    </>
                  )}
                </button>
                
                <button className="btn-download">
                  <Download className="btn-icon-small" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Template Preview Modal */}
      {isPreviewMode && selectedTemplate && (
        <div className="preview-modal" onClick={() => setIsPreviewMode(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setIsPreviewMode(false)}>
              ×
            </button>
            
            <div className="preview-container">
              <div className="preview-main">
                <div className="preview-canvas">
                  <Layout className="canvas-icon" />
                  <p>Template Preview</p>
                </div>
              </div>
              
              <div className="preview-sidebar">
                <h3>{selectedTemplate.name}</h3>
                <p className="preview-description">{selectedTemplate.description}</p>
                
                <div className="preview-details">
                  <div className="detail-item">
                    <span className="detail-label">Dimensions</span>
                    <span className="detail-value">{selectedTemplate.dimensions}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Category</span>
                    <span className="detail-value">{selectedTemplate.category}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Usage</span>
                    <span className="detail-value">{selectedTemplate.usageCount} times</span>
                  </div>
                </div>
                
                <div className="preview-tags">
                  {selectedTemplate.tags.map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
                
                <div className="preview-actions">
                  <button 
                    className="btn-primary"
                    onClick={() => {
                      handleApplyTemplate(selectedTemplate);
                      setIsPreviewMode(false);
                    }}
                  >
                    <Sparkles className="btn-icon" />
                    Use This Template
                  </button>
                  
                  <button className="btn-secondary">
                    <Download className="btn-icon" />
                    Download
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}