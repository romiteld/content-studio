import { useState, useEffect, useCallback } from 'react';

interface FormDefaults {
  [key: string]: any;
}

interface UseFormDefaultsOptions {
  storageKey: string;
  defaultValues?: FormDefaults;
  maxHistory?: number;
}

export function useFormDefaults({
  storageKey,
  defaultValues = {},
  maxHistory = 5
}: UseFormDefaultsOptions) {
  const [defaults, setDefaults] = useState<FormDefaults>(() => {
    try {
      const stored = localStorage.getItem(`form_defaults_${storageKey}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...defaultValues, ...parsed.current };
      }
    } catch (error) {
      console.warn('Failed to load form defaults:', error);
    }
    return defaultValues;
  });

  const [history, setHistory] = useState<FormDefaults[]>(() => {
    try {
      const stored = localStorage.getItem(`form_history_${storageKey}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.history || [];
      }
    } catch (error) {
      console.warn('Failed to load form history:', error);
    }
    return [];
  });

  const saveDefaults = useCallback((values: FormDefaults) => {
    setDefaults(values);
    
    setHistory(prev => {
      const newHistory = [values, ...prev.filter(item => 
        JSON.stringify(item) !== JSON.stringify(values)
      )].slice(0, maxHistory);
      
      try {
        localStorage.setItem(`form_defaults_${storageKey}`, JSON.stringify({
          current: values,
          timestamp: Date.now()
        }));
        
        localStorage.setItem(`form_history_${storageKey}`, JSON.stringify({
          history: newHistory,
          timestamp: Date.now()
        }));
      } catch (error) {
        console.warn('Failed to save form defaults:', error);
      }
      
      return newHistory;
    });
  }, [storageKey, maxHistory]);

  const getSmartDefaults = useCallback((currentValues: Partial<FormDefaults> = {}) => {
    const smartDefaults: FormDefaults = { ...defaults };

    // Analyze history for patterns
    if (history.length > 0) {
      const fieldFrequency: { [key: string]: { [value: string]: number } } = {};
      
      history.forEach(entry => {
        Object.entries(entry).forEach(([key, value]) => {
          if (!fieldFrequency[key]) {
            fieldFrequency[key] = {};
          }
          const valueStr = JSON.stringify(value);
          fieldFrequency[key][valueStr] = (fieldFrequency[key][valueStr] || 0) + 1;
        });
      });

      // Use most frequent values as smart defaults
      Object.entries(fieldFrequency).forEach(([key, values]) => {
        const mostFrequent = Object.entries(values).reduce((a, b) => 
          values[a[0]] > values[b[0]] ? a : b
        );
        
        if (mostFrequent[1] > 1) { // Only use if value appears more than once
          try {
            smartDefaults[key] = JSON.parse(mostFrequent[0]);
          } catch {
            smartDefaults[key] = mostFrequent[0];
          }
        }
      });
    }

    // Merge with current values (current values take precedence)
    return { ...smartDefaults, ...currentValues };
  }, [defaults, history]);

  const clearDefaults = useCallback(() => {
    setDefaults(defaultValues);
    setHistory([]);
    try {
      localStorage.removeItem(`form_defaults_${storageKey}`);
      localStorage.removeItem(`form_history_${storageKey}`);
    } catch (error) {
      console.warn('Failed to clear form defaults:', error);
    }
  }, [storageKey, defaultValues]);

  const getSuggestions = useCallback((fieldName: string) => {
    const suggestions = new Set<any>();
    
    history.forEach(entry => {
      if (entry[fieldName] !== undefined && entry[fieldName] !== null && entry[fieldName] !== '') {
        suggestions.add(entry[fieldName]);
      }
    });
    
    return Array.from(suggestions).slice(0, 5); // Return top 5 unique suggestions
  }, [history]);

  return {
    defaults,
    saveDefaults,
    getSmartDefaults,
    clearDefaults,
    getSuggestions,
    history
  };
}