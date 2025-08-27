import React, { useState, useEffect } from 'react';
import { styleManager } from '../utils/styleManager';
import { brandConfig } from '../config/brandConfig';

interface StyleCustomizerProps {
  onClose?: () => void;
}

const StyleCustomizer: React.FC<StyleCustomizerProps> = ({ onClose }) => {
  const [customCSS, setCustomCSS] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [savedStyles, setSavedStyles] = useState<string[]>([]);

  useEffect(() => {
    // Load saved styles from localStorage
    const saved = localStorage.getItem('customStyles');
    if (saved) {
      const styles = JSON.parse(saved);
      setSavedStyles(styles);
      styles.forEach((css: string) => styleManager.importStyles(css));
    }
  }, []);

  const handleApplyStyles = () => {
    try {
      styleManager.importStyles(customCSS);
      const currentStyles = [...savedStyles, customCSS];
      setSavedStyles(currentStyles);
      localStorage.setItem('customStyles', JSON.stringify(currentStyles));
      setCustomCSS('');
      alert('Styles applied successfully!');
    } catch (error) {
      alert('Invalid CSS. Please check your syntax.');
    }
  };

  const handleClearStyles = () => {
    styleManager.clearAllCustomStyles();
    setSavedStyles([]);
    localStorage.removeItem('customStyles');
    setCustomCSS('');
  };

  const handleTogglePreview = () => {
    if (previewMode) {
      styleManager.clearAllCustomStyles();
      savedStyles.forEach(css => styleManager.importStyles(css));
    } else {
      styleManager.importStyles(customCSS);
    }
    setPreviewMode(!previewMode);
  };

  return (
    <div className="style-customizer">
      <div className="customizer-header">
        <h2>Style Customizer</h2>
        {onClose && (
          <button className="close-btn" onClick={onClose}>×</button>
        )}
      </div>

      <div className="brand-info">
        <h3>Protected Brand Elements</h3>
        <p>The following elements maintain brand integrity and cannot be overridden:</p>
        <ul>
          {brandConfig.protectedElements?.map(el => (
            <li key={el}>{el}</li>
          ))}
        </ul>
      </div>

      <div className="css-editor">
        <h3>Custom CSS</h3>
        <textarea
          value={customCSS}
          onChange={(e) => setCustomCSS(e.target.value)}
          placeholder={`/* Enter your custom CSS here */
/* Example: */
.content-section {
  padding: 30px;
  background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
}

.custom-header {
  font-size: 2.5rem;
  color: #333;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
}`}
          rows={15}
          style={{
            width: '100%',
            fontFamily: 'monospace',
            fontSize: '14px',
            padding: '10px',
            backgroundColor: '#1a1a1a',
            color: '#e6e6e6',
            border: `1px solid ${brandConfig.colors.gold}`,
            borderRadius: '5px'
          }}
        />
      </div>

      <div className="customizer-actions">
        <button 
          onClick={handleApplyStyles}
          style={{
            backgroundColor: brandConfig.colors.gold,
            color: brandConfig.colors.primary,
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            fontWeight: 'bold',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Apply Styles
        </button>
        
        <button 
          onClick={handleTogglePreview}
          style={{
            backgroundColor: brandConfig.colors.cyan,
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            fontWeight: 'bold',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          {previewMode ? 'Exit Preview' : 'Preview'}
        </button>
        
        <button 
          onClick={handleClearStyles}
          style={{
            backgroundColor: '#666',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Clear All Styles
        </button>
      </div>

      {savedStyles.length > 0 && (
        <div className="saved-styles">
          <h3>Applied Custom Styles</h3>
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.05)',
            padding: '10px',
            borderRadius: '5px',
            maxHeight: '200px',
            overflow: 'auto'
          }}>
            <pre style={{ color: brandConfig.colors.textSecondary, fontSize: '12px' }}>
              {styleManager.exportStyles()}
            </pre>
          </div>
        </div>
      )}

      <style>{`
        .style-customizer {
          background: linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.98) 100%);
          border: 2px solid ${brandConfig.colors.gold};
          border-radius: 10px;
          padding: 20px;
          color: ${brandConfig.colors.textPrimary};
          max-width: 800px;
          margin: 20px auto;
        }
        
        .customizer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 1px solid ${brandConfig.colors.gold};
        }
        
        .customizer-header h2 {
          color: ${brandConfig.colors.goldLight};
          margin: 0;
        }
        
        .close-btn {
          background: transparent;
          border: none;
          color: ${brandConfig.colors.textPrimary};
          font-size: 24px;
          cursor: pointer;
        }
        
        .brand-info {
          background: rgba(190, 158, 68, 0.1);
          padding: 15px;
          border-radius: 5px;
          margin-bottom: 20px;
        }
        
        .brand-info h3 {
          color: ${brandConfig.colors.goldLight};
          margin-top: 0;
        }
        
        .brand-info ul {
          margin: 10px 0;
          padding-left: 20px;
        }
        
        .brand-info li {
          color: ${brandConfig.colors.textSecondary};
          margin: 5px 0;
        }
        
        .css-editor {
          margin-bottom: 20px;
        }
        
        .css-editor h3 {
          color: ${brandConfig.colors.cyan};
          margin-bottom: 10px;
        }
        
        .customizer-actions {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }
        
        .saved-styles h3 {
          color: ${brandConfig.colors.cyanLight};
          margin-bottom: 10px;
        }
      `}</style>
    </div>
  );
};

export default StyleCustomizer;