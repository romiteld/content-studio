import React, { useState } from 'react';
import { useToast } from './ui/Toast';
import { apiFetch, API_BASE_URL } from '../config/api';

interface GeneratePanelProps {
  contentItems: any[];
}

const GeneratePanel: React.FC<GeneratePanelProps> = ({ contentItems }) => {
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [documentTitle, setDocumentTitle] = useState('');
  const [generating, setGenerating] = useState(false);
  const [downloadLink, setDownloadLink] = useState<string | null>(null);
  const [brandingOptions, setBrandingOptions] = useState({
    includeWatermark: true,
    includeLogo: true,
    includeFooter: true
  });
  const { showToast } = useToast();

  const handleItemToggle = (id: number) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedItems(contentItems.map(item => item.id));
  };

  const handleDeselectAll = () => {
    setSelectedItems([]);
  };

  const generateDocument = async (type: 'pdf' | 'slides') => {
    console.log(`Generating ${type} with items:`, selectedItems);
    
    if (selectedItems.length === 0) {
      showToast('Select at least one content section', 'info');
      return;
    }

    setGenerating(true);
    setDownloadLink(null);

    try {
      const path = type === 'pdf' ? '/api/generate/pdf' : '/api/generate/slides';
      const result = await apiFetch<{ path: string }>({
        path,
        method: 'POST',
        body: JSON.stringify({
          title: documentTitle || 'Content Document',
          contentIds: selectedItems,
          branding: brandingOptions
        }),
      });
      setDownloadLink(`${API_BASE_URL}${result.path}`);
      showToast(`${type === 'pdf' ? 'PDF' : 'Slides'} generated`, 'success');
    } catch (error) {
      console.error('Generation error:', error);
      showToast('Failed to generate document', 'error');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="generate-panel">
      <h2>Generate Documents</h2>

      <div className="document-settings">
        <div className="form-group">
          <label>Document Title</label>
          <input
            type="text"
            value={documentTitle}
            onChange={(e) => setDocumentTitle(e.target.value)}
            placeholder="Enter document title..."
          />
        </div>
        
        <div className="branding-options">
          <h3>Branding Options</h3>
          <div className="branding-controls">
            <label className="checkbox-option">
              <input
                type="checkbox"
                checked={brandingOptions.includeWatermark}
                onChange={(e) => setBrandingOptions({
                  ...brandingOptions,
                  includeWatermark: e.target.checked
                })}
              />
              <span>Include Watermark</span>
            </label>
            <label className="checkbox-option">
              <input
                type="checkbox"
                checked={brandingOptions.includeLogo}
                onChange={(e) => setBrandingOptions({
                  ...brandingOptions,
                  includeLogo: e.target.checked
                })}
              />
              <span>Include Logo</span>
            </label>
            <label className="checkbox-option">
              <input
                type="checkbox"
                checked={brandingOptions.includeFooter}
                onChange={(e) => setBrandingOptions({
                  ...brandingOptions,
                  includeFooter: e.target.checked
                })}
              />
              <span>Include Footer</span>
            </label>
          </div>
        </div>
      </div>

      <div className="content-selection">
        <h3>Select Content Sections</h3>
        <div className="selection-controls">
          <button className="btn-select-control" onClick={handleSelectAll}>Select All</button>
          <button className="btn-select-control" onClick={handleDeselectAll}>Deselect All</button>
        </div>
        
        <div className="content-checklist">
          {contentItems.map((item) => (
            <label key={item.id} className="content-checkbox">
              <input
                type="checkbox"
                checked={selectedItems.includes(item.id)}
                onChange={() => handleItemToggle(item.id)}
              />
              <span className="checkbox-label">
                <strong>{item.section_type}:</strong> {item.title}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="generate-actions">
        <button
          className="btn-generate-pdf"
          onClick={() => generateDocument('pdf')}
          disabled={generating || selectedItems.length === 0}
        >
          {generating ? '⏳ Generating...' : '📄 Generate PDF'}
        </button>
        
        <button
          className="btn-generate-slides"
          onClick={() => generateDocument('slides')}
          disabled={generating || selectedItems.length === 0}
        >
          {generating ? '⏳ Generating...' : '📊 Generate Slides'}
        </button>
      </div>

      {downloadLink && (
        <div className="download-section">
          <h3>Document Ready!</h3>
          <a 
            href={downloadLink} 
            download 
            className="download-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            ⬇️ Download Generated Document
          </a>
        </div>
      )}

      <div className="generation-info">
        <h3>Document Features</h3>
        <ul>
          <li>✅ Professional PDF with locked branding</li>
          <li>✅ PowerPoint slides with brand colors</li>
          <li>✅ Automatic page breaks and formatting</li>
          <li>✅ High-quality print output</li>
          <li>✅ Consistent styling across all pages</li>
        </ul>
      </div>
    </div>
  );
};

export default GeneratePanel;