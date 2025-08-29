import React, { useState, useEffect, ReactNode } from 'react';
import { ChevronDown, ChevronUp, Settings, Sparkles } from 'lucide-react';
import { useFormDefaults } from '../../hooks/useFormDefaults';
import './progressive-form.css';

interface FormSection {
  id: string;
  title: string;
  isAdvanced?: boolean;
  isVisible?: boolean;
  fields: ReactNode;
}

interface ProgressiveFormProps {
  storageKey: string;
  sections: FormSection[];
  onSubmit: (data: any) => void;
  submitLabel?: string;
  showSmartDefaults?: boolean;
  className?: string;
  children?: (props: {
    renderSection: (section: FormSection) => ReactNode;
    isExpanded: boolean;
    toggleExpanded: () => void;
  }) => ReactNode;
}

export default function ProgressiveForm({
  storageKey,
  sections,
  onSubmit,
  submitLabel = 'Submit',
  showSmartDefaults = true,
  className = '',
  children
}: ProgressiveFormProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(() => {
    const stored = localStorage.getItem(`form_expanded_${storageKey}`);
    if (stored) {
      try {
        return new Set(JSON.parse(stored));
      } catch {}
    }
    return new Set(sections.filter(s => !s.isAdvanced).map(s => s.id));
  });

  const [showAdvanced, setShowAdvanced] = useState(() => {
    const stored = localStorage.getItem(`form_advanced_${storageKey}`);
    return stored === 'true';
  });

  const { getSmartDefaults, saveDefaults, getSuggestions } = useFormDefaults({
    storageKey,
    defaultValues: {}
  });

  useEffect(() => {
    localStorage.setItem(`form_expanded_${storageKey}`, JSON.stringify([...Array.from(expandedSections)]));
  }, [expandedSections, storageKey]);

  useEffect(() => {
    localStorage.setItem(`form_advanced_${storageKey}`, String(showAdvanced));
  }, [showAdvanced, storageKey]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  const toggleAdvanced = () => {
    setShowAdvanced(prev => !prev);
    if (!showAdvanced) {
      // Expand all advanced sections when showing
      const advancedIds = sections.filter(s => s.isAdvanced).map(s => s.id);
      setExpandedSections(prev => new Set([...Array.from(prev), ...advancedIds]));
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: any = {};
    
    formData.forEach((value, key) => {
      if (data[key]) {
        // Handle multiple values with same name (like checkboxes)
        if (!Array.isArray(data[key])) {
          data[key] = [data[key]];
        }
        data[key].push(value);
      } else {
        data[key] = value;
      }
    });

    saveDefaults(data);
    onSubmit(data);
  };

  const renderSection = (section: FormSection) => {
    const isExpanded = expandedSections.has(section.id);
    const shouldShow = !section.isAdvanced || showAdvanced;

    if (!shouldShow) return null;

    return (
      <div key={section.id} className="form-section">
        <button
          type="button"
          className="form-section-header"
          onClick={() => toggleSection(section.id)}
          aria-expanded={isExpanded}
          aria-controls={`section-${section.id}`}
        >
          <span className="form-section-title">
            {section.title}
            {section.isAdvanced && (
              <span className="form-section-badge">Advanced</span>
            )}
          </span>
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>

        <div
          id={`section-${section.id}`}
          className={`form-section-content ${isExpanded ? 'expanded' : 'collapsed'}`}
          aria-hidden={!isExpanded}
        >
          <div className="form-section-fields">
            {section.fields}
          </div>
        </div>
      </div>
    );
  };

  const basicSections = sections.filter(s => !s.isAdvanced);
  const advancedSections = sections.filter(s => s.isAdvanced);

  if (children) {
    return (
      <form onSubmit={handleSubmit} className={`progressive-form ${className}`}>
        {children({
          renderSection,
          isExpanded: showAdvanced,
          toggleExpanded: toggleAdvanced
        })}
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`progressive-form ${className}`}>
      {showSmartDefaults && (
        <div className="form-smart-defaults">
          <Sparkles size={16} />
          <span>Smart defaults enabled - form pre-filled based on your usage patterns</span>
        </div>
      )}

      <div className="form-sections">
        {basicSections.map(renderSection)}
      </div>

      {advancedSections.length > 0 && (
        <>
          <button
            type="button"
            className={`form-advanced-toggle ${showAdvanced ? 'expanded' : ''}`}
            onClick={toggleAdvanced}
            aria-expanded={showAdvanced}
          >
            <Settings size={20} />
            <span>{showAdvanced ? 'Hide' : 'Show'} Advanced Options</span>
            <span className="form-advanced-count">({advancedSections.length})</span>
            {showAdvanced ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>

          {showAdvanced && (
            <div className="form-sections form-sections-advanced">
              {advancedSections.map(renderSection)}
            </div>
          )}
        </>
      )}

      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

interface FormFieldProps {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  suggestions?: string[];
  defaultValue?: any;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  name,
  label,
  type = 'text',
  required = false,
  placeholder = '',
  suggestions = [],
  defaultValue = '',
  className = ''
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [value, setValue] = useState(defaultValue);

  const handleSuggestionClick = (suggestion: string) => {
    setValue(suggestion);
    setShowSuggestions(false);
  };

  return (
    <div className={`form-field ${className}`}>
      <label htmlFor={name} className="form-label">
        {label}
        {required && <span className="form-required">*</span>}
      </label>
      
      <div className="form-input-wrapper">
        {type === 'textarea' ? (
          <textarea
            id={name}
            name={name}
            required={required}
            placeholder={placeholder}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="form-input form-textarea"
          />
        ) : (
          <input
            id={name}
            name={name}
            type={type}
            required={required}
            placeholder={placeholder}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="form-input"
          />
        )}
        
        {suggestions.length > 0 && showSuggestions && (
          <div className="form-suggestions">
            <div className="form-suggestions-title">Recent values:</div>
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                className="form-suggestion"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};