import React, { useState, useRef } from 'react';
import {
  Image,
  Wand2,
  Upload,
  Download,
  RefreshCw,
  Sliders,
  Palette,
  Sparkles,
  Camera,
  Edit3,
  Layers,
  Eye,
  Copy,
  Share2,
  Zap,
  Brain,
  Target,
  Type,
  AlignCenter,
  Shield,
  PaintBucket
} from 'lucide-react';
import '../styles/ImageGenerationStudio.css';

interface GenerationSettings {
  platform: string;
  dimensions: string;
  style: string;
  colorScheme: string;
  mood: string;
  elements: string[];
  textOverlay?: {
    text: string;
    position: 'top' | 'center' | 'bottom';
    style: 'overlay' | 'underlay' | 'watermark';
    fontSize: string;
    color: string;
  };
  branding: {
    addLogo: boolean;
    colorScheme: 'gold' | 'cyan' | 'monochrome';
    watermark: boolean;
  };
}

interface GeneratedImage {
  id: string;
  prompt: string;
  specifications: any;
  timestamp: Date;
  platform: string;
}

const PLATFORMS = [
  { id: 'linkedin', name: 'LinkedIn', dimensions: '1200x627' },
  { id: 'instagram', name: 'Instagram', dimensions: '1080x1080' },
  { id: 'facebook', name: 'Facebook', dimensions: '1200x630' },
  { id: 'twitter', name: 'Twitter', dimensions: '1200x675' },
  { id: 'story', name: 'Story', dimensions: '1080x1920' }
];

const STYLES = [
  'Professional Corporate',
  'Modern Minimalist',
  'Bold Dynamic',
  'Elegant Luxury',
  'Data-Driven',
  'Storytelling'
];

const MOODS = [
  'Trustworthy',
  'Innovative',
  'Exclusive',
  'Energetic',
  'Sophisticated',
  'Inspirational'
];

export default function ImageGenerationStudio() {
  const [activeTab, setActiveTab] = useState<'generate' | 'edit' | 'analyze'>('generate');
  const [concept, setConcept] = useState('');
  const [showTextOptions, setShowTextOptions] = useState(false);
  const [showBrandingOptions, setShowBrandingOptions] = useState(false);
  const [settings, setSettings] = useState<GenerationSettings>({
    platform: 'linkedin',
    dimensions: '1200x627',
    style: 'Professional Corporate',
    colorScheme: 'brand',
    mood: 'Trustworthy',
    elements: [],
    textOverlay: {
      text: '',
      position: 'center',
      style: 'overlay',
      fontSize: '48px',
      color: '#FFFFFF'
    },
    branding: {
      addLogo: true,
      colorScheme: 'gold',
      watermark: false
    }
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerate = async () => {
    if (!concept.trim()) return;

    setIsGenerating(true);
    try {
      // Get auth token
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch('http://localhost:3001/api/ai/generate-image', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          prompt: concept,
          specifications: {
            style: settings.style,
            platform: settings.platform,
            dimensions: settings.dimensions,
            format: settings.platform,
            mood: settings.mood,
            textOverlay: settings.textOverlay?.text ? settings.textOverlay : undefined,
            branding: settings.branding
          }
        })
      });

      const data = await response.json();
      
      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        prompt: data.imagePrompt,
        specifications: data,
        timestamp: new Date(),
        platform: settings.platform
      };

      setGeneratedImages([newImage, ...generatedImages]);
      setSelectedImage(newImage);
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedImage(file);
      setActiveTab('edit');
    }
  };

  const handleAnalyze = async () => {
    if (!uploadedImage) return;

    const formData = new FormData();
    formData.append('image', uploadedImage);
    formData.append('analysisType', 'performance');

    try {
      const response = await fetch('http://localhost:3001/api/vision/analyze', {
        method: 'POST',
        body: formData
      });

      const analysis = await response.json();
      console.log('Analysis:', analysis);
    } catch (error) {
      console.error('Analysis failed:', error);
    }
  };

  const handleVariations = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/vision/generate-variations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variationType: settings.platform,
          count: 3
        })
      });

      const variations = await response.json();
      console.log('Variations:', variations);
    } catch (error) {
      console.error('Variations failed:', error);
    }
  };

  return (
    <div className="image-generation-studio">
      {/* Studio Header */}
      <div className="studio-header">
        <div className="header-left">
          <Sparkles className="studio-icon" />
          <div>
            <h2>Image Generation Studio</h2>
            <p>Powered by Gemini 2.5 Flash Vision</p>
          </div>
        </div>
        
        <div className="header-tabs">
          <button
            className={`tab-btn ${activeTab === 'generate' ? 'active' : ''}`}
            onClick={() => setActiveTab('generate')}
          >
            <Wand2 className="tab-icon" />
            Generate
          </button>
          <button
            className={`tab-btn ${activeTab === 'edit' ? 'active' : ''}`}
            onClick={() => setActiveTab('edit')}
          >
            <Edit3 className="tab-icon" />
            Edit
          </button>
          <button
            className={`tab-btn ${activeTab === 'analyze' ? 'active' : ''}`}
            onClick={() => setActiveTab('analyze')}
          >
            <Eye className="tab-icon" />
            Analyze
          </button>
        </div>
      </div>

      {/* Main Studio Content */}
      <div className="studio-content">
        {/* Generation Panel */}
        {activeTab === 'generate' && (
          <div className="generation-panel">
            <div className="generation-controls">
              {/* Concept Input */}
              <div className="concept-section">
                <label className="section-label">
                  <Brain className="label-icon" />
                  Visual Concept
                </label>
                <textarea
                  className="concept-input"
                  placeholder="Describe your visual concept... e.g., 'Professional team meeting showcasing wealth management expertise with charts and gold accents'"
                  value={concept}
                  onChange={(e) => setConcept(e.target.value)}
                  rows={4}
                />
                
                {/* Quick Prompts */}
                <div className="quick-prompts">
                  <span className="quick-label">Quick ideas:</span>
                  <button className="quick-prompt" onClick={() => setConcept('Wealth advisor analyzing portfolio data with modern charts')}>
                    Portfolio Analysis
                  </button>
                  <button className="quick-prompt" onClick={() => setConcept('Team collaboration in luxury office setting')}>
                    Team Meeting
                  </button>
                  <button className="quick-prompt" onClick={() => setConcept('Financial growth visualization with ascending graphs')}>
                    Growth Charts
                  </button>
                </div>
              </div>

              {/* Platform Selection */}
              <div className="settings-row">
                <div className="setting-group">
                  <label className="setting-label">
                    <Target className="label-icon" />
                    Platform
                  </label>
                  <div className="platform-grid">
                    {PLATFORMS.map(platform => (
                      <button
                        key={platform.id}
                        className={`platform-btn ${settings.platform === platform.id ? 'active' : ''}`}
                        onClick={() => setSettings({
                          ...settings,
                          platform: platform.id,
                          dimensions: platform.dimensions
                        })}
                      >
                        {platform.name}
                        <span className="platform-dims">{platform.dimensions}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Style & Mood */}
              <div className="settings-row">
                <div className="setting-group">
                  <label className="setting-label">
                    <Palette className="label-icon" />
                    Visual Style
                  </label>
                  <select
                    className="form-control style-select"
                    value={settings.style}
                    onChange={(e) => setSettings({ ...settings, style: e.target.value })}
                  >
                    {STYLES.map(style => (
                      <option key={style} value={style}>{style}</option>
                    ))}
                  </select>
                </div>

                <div className="setting-group">
                  <label className="setting-label">
                    <Sparkles className="label-icon" />
                    Mood
                  </label>
                  <select
                    className="form-control mood-select"
                    value={settings.mood}
                    onChange={(e) => setSettings({ ...settings, mood: e.target.value })}
                  >
                    {MOODS.map(mood => (
                      <option key={mood} value={mood}>{mood}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Text Overlay Options */}
              <div className="settings-section">
                <button 
                  className="section-toggle"
                  onClick={() => setShowTextOptions(!showTextOptions)}
                >
                  <Type className="toggle-icon" />
                  Text Overlay Options
                </button>
                
                {showTextOptions && (
                  <div className="overlay-options">
                    <div className="setting-group">
                      <label>Text Content</label>
                      <input
                        type="text"
                        placeholder="Enter text to overlay..."
                        value={settings.textOverlay?.text || ''}
                        onChange={(e) => setSettings({
                          ...settings,
                          textOverlay: { ...settings.textOverlay!, text: e.target.value }
                        })}
                        className="form-control"
                      />
                    </div>
                    
                    <div className="settings-row">
                      <div className="setting-group">
                        <label>Style</label>
                        <select 
                          className="form-control"
                          value={settings.textOverlay?.style}
                          onChange={(e) => setSettings({
                            ...settings,
                            textOverlay: { 
                              ...settings.textOverlay!, 
                              style: e.target.value as 'overlay' | 'underlay' | 'watermark'
                            }
                          })}
                        >
                          <option value="overlay">Text Overlay</option>
                          <option value="underlay">Text Underlay</option>
                          <option value="watermark">Watermark</option>
                        </select>
                      </div>
                      
                      <div className="setting-group">
                        <label>Position</label>
                        <select 
                          className="form-control"
                          value={settings.textOverlay?.position}
                          onChange={(e) => setSettings({
                            ...settings,
                            textOverlay: { 
                              ...settings.textOverlay!, 
                              position: e.target.value as 'top' | 'center' | 'bottom'
                            }
                          })}
                        >
                          <option value="top">Top</option>
                          <option value="center">Center</option>
                          <option value="bottom">Bottom</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Branding Options */}
              <div className="settings-section">
                <button 
                  className="section-toggle"
                  onClick={() => setShowBrandingOptions(!showBrandingOptions)}
                >
                  <Shield className="toggle-icon" />
                  Apply Branding
                </button>
                
                {showBrandingOptions && (
                  <div className="branding-options">
                    <div className="checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={settings.branding.addLogo}
                          onChange={(e) => setSettings({
                            ...settings,
                            branding: { ...settings.branding, addLogo: e.target.checked }
                          })}
                        />
                        Add The Well Logo
                      </label>
                    </div>
                    
                    <div className="setting-group">
                      <label>Brand Color Scheme</label>
                      <select 
                        className="form-control"
                        value={settings.branding.colorScheme}
                        onChange={(e) => setSettings({
                          ...settings,
                          branding: { 
                            ...settings.branding, 
                            colorScheme: e.target.value as 'gold' | 'cyan' | 'monochrome'
                          }
                        })}
                      >
                        <option value="gold">Gold Accent (#D4AF37)</option>
                        <option value="cyan">Cyan Accent (#4FC3F7)</option>
                        <option value="monochrome">Monochrome</option>
                      </select>
                    </div>
                    
                    <div className="checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={settings.branding.watermark}
                          onChange={(e) => setSettings({
                            ...settings,
                            branding: { ...settings.branding, watermark: e.target.checked }
                          })}
                        />
                        Add Watermark
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Advanced Settings */}
              <div className="advanced-settings">
                <button className="advanced-toggle">
                  <Sliders className="toggle-icon" />
                  Advanced Settings
                </button>
              </div>

              {/* Generate Button */}
              <button
                className="generate-btn"
                onClick={handleGenerate}
                disabled={isGenerating || !concept.trim()}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="btn-icon spinning" />
                    Generating Specifications...
                  </>
                ) : (
                  <>
                    <Wand2 className="btn-icon" />
                    Generate Visual Specifications
                  </>
                )}
              </button>
            </div>

            {/* Preview Area */}
            <div className="preview-area">
              {selectedImage ? (
                <div className="generated-preview">
                  <div className="preview-header">
                    <h3>Generated Specifications</h3>
                    <div className="preview-actions">
                      <button className="action-btn">
                        <Copy /> Copy Prompt
                      </button>
                      <button className="action-btn">
                        <Download /> Export
                      </button>
                      <button className="action-btn">
                        <Share2 /> Share
                      </button>
                    </div>
                  </div>
                  
                  <div className="specifications-display">
                    <div className="spec-section">
                      <h4>Visual Prompt</h4>
                      <pre className="spec-content">
                        {typeof selectedImage.prompt === 'object' 
                          ? JSON.stringify(selectedImage.prompt, null, 2)
                          : selectedImage.prompt}
                      </pre>
                    </div>
                  </div>

                  <button className="variations-btn" onClick={handleVariations}>
                    <Layers className="btn-icon" />
                    Generate Variations
                  </button>
                </div>
              ) : (
                <div className="preview-placeholder">
                  <Image className="placeholder-icon" />
                  <p>Your generated specifications will appear here</p>
                  <p className="placeholder-hint">Start by describing your visual concept above</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Edit Panel */}
        {activeTab === 'edit' && (
          <div className="edit-panel">
            <div className="upload-area">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
              
              {uploadedImage ? (
                <div className="uploaded-preview">
                  <img 
                    src={URL.createObjectURL(uploadedImage)} 
                    alt="Uploaded" 
                    className="uploaded-img"
                  />
                  <div className="edit-tools">
                    <button className="edit-tool-btn">
                      <Palette /> Color Correction
                    </button>
                    <button className="edit-tool-btn">
                      <Camera /> Composition
                    </button>
                    <button className="edit-tool-btn">
                      <Sparkles /> Enhance
                    </button>
                    <button className="edit-tool-btn">
                      <Target /> Brand Align
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  className="upload-btn"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="upload-icon" />
                  <span>Upload Image to Edit</span>
                  <span className="upload-hint">Drag & drop or click to browse</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Analyze Panel */}
        {activeTab === 'analyze' && (
          <div className="analyze-panel">
            <div className="analysis-upload">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
                id="analyze-upload"
              />
              
              {uploadedImage ? (
                <div className="analysis-content">
                  <div className="analyzed-image">
                    <img 
                      src={URL.createObjectURL(uploadedImage)} 
                      alt="Analysis" 
                      className="analyze-img"
                    />
                  </div>
                  
                  <div className="analysis-options">
                    <button className="analyze-btn" onClick={handleAnalyze}>
                      <Eye /> Performance Prediction
                    </button>
                    <button className="analyze-btn">
                      <Target /> Brand Consistency
                    </button>
                    <button className="analyze-btn">
                      <Zap /> Competitor Analysis
                    </button>
                    <button className="analyze-btn">
                      <Brain /> Accessibility Check
                    </button>
                  </div>
                </div>
              ) : (
                <label htmlFor="analyze-upload" className="analyze-upload-btn">
                  <Upload className="upload-icon" />
                  <span>Upload Image to Analyze</span>
                </label>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Generation History */}
      <div className="generation-history">
        <h3 className="history-title">Recent Generations</h3>
        <div className="history-grid">
          {generatedImages.slice(0, 4).map(img => (
            <div 
              key={img.id} 
              className="history-item"
              onClick={() => setSelectedImage(img)}
            >
              <div className="history-preview">
                <Image className="history-icon" />
              </div>
              <span className="history-platform">{img.platform}</span>
              <span className="history-time">
                {new Date(img.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}