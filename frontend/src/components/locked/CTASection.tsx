import React from 'react';

interface CTASectionProps {
  title: string;
  description: string;
  buttonText?: string;
  onButtonClick?: () => void;
}

const CTASection: React.FC<CTASectionProps> = ({ 
  title, 
  description, 
  buttonText, 
  onButtonClick 
}) => {
  return (
    <div className="cta-section">
      <h2 className="cta-title">{title}</h2>
      <p className="cta-text">{description}</p>
      {buttonText && (
        <button 
          className="cta-button" 
          onClick={onButtonClick}
          type="button"
        >
          {buttonText}
        </button>
      )}
    </div>
  );
};

export default CTASection;