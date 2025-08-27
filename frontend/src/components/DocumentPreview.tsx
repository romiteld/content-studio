import React, { useEffect, useState } from 'react';
import RoleCard from './locked/RoleCard';
import CTASection from './locked/CTASection';

interface DocumentPreviewProps {
  contentItems: any[];
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({ contentItems }) => {
  const sortedItems = [...contentItems].sort((a, b) => a.display_order - b.display_order);
  const [previewSize, setPreviewSize] = useState<'small' | 'medium' | 'large' | 'full'>('medium');
  
  useEffect(() => {
    const onSelect = (e: any) => {
      const id = e.detail?.id;
      if (!id) return;
      const el = document.querySelector(`[data-preview-id='${id}']`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    window.addEventListener('app:scrollToPreview', onSelect as any);
    return () => window.removeEventListener('app:scrollToPreview', onSelect as any);
  }, []);

  useEffect(() => {
    const previewArea = document.querySelector('.preview-area') as HTMLElement;
    if (previewArea) {
      switch (previewSize) {
        case 'small':
          previewArea.style.width = '400px';
          break;
        case 'medium':
          previewArea.style.width = '550px';
          break;
        case 'large':
          previewArea.style.width = '700px';
          break;
        case 'full':
          previewArea.style.width = '900px';
          break;
      }
    }
  }, [previewSize]);

  return (
    <div className="document-preview" aria-live="polite">
      <div className="preview-controls">
        <h2>Live Preview</h2>
        <div className="preview-size-buttons">
          <button 
            className={`preview-size-btn ${previewSize === 'small' ? 'active' : ''}`}
            onClick={() => setPreviewSize('small')}
            title="Small (400px)"
          >
            S
          </button>
          <button 
            className={`preview-size-btn ${previewSize === 'medium' ? 'active' : ''}`}
            onClick={() => setPreviewSize('medium')}
            title="Medium (550px)"
          >
            M
          </button>
          <button 
            className={`preview-size-btn ${previewSize === 'large' ? 'active' : ''}`}
            onClick={() => setPreviewSize('large')}
            title="Large (700px)"
          >
            L
          </button>
          <button 
            className={`preview-size-btn ${previewSize === 'full' ? 'active' : ''}`}
            onClick={() => setPreviewSize('full')}
            title="Full (900px)"
          >
            XL
          </button>
        </div>
      </div>
      <div className="preview-resize-handle"></div>
      <div className="preview-container">
        {sortedItems.map((item) => {
          switch (item.section_type) {
            case 'cover':
              return (
                <div key={item.id} className="preview-page">
                  <div className="brand-header">
                    <img src="/logo.png" alt="The Well" className="brand-logo" />
                  </div>
                  <h1 className="cover-title">{item.title}</h1>
                </div>
              );
              
            case 'role_description':
              return (
                <RoleCard
                  key={item.id}
                  title={item.title}
                  description={item.content_data.description}
                  compensation={item.content_data.compensation}
                />
              );
              
            case 'call_to_action':
              return (
                <CTASection
                  key={item.id}
                  title={item.title}
                  description={item.content_data.description || item.content_data.content}
                />
              );
              
            case 'executive_summary':
            case 'market_insights':
            case 'compensation_analysis':
            default:
              return (
                <div key={item.id} className="preview-section" data-preview-id={item.id}>
                  <h2>{item.title}</h2>
                  <div className="section-content">
                    {item.content_data.description || item.content_data.content}
                  </div>
                </div>
              );
          }
        })}
      </div>
    </div>
  );
};

export default DocumentPreview;