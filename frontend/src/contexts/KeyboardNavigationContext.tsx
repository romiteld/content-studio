import React, { createContext, useContext, useCallback, useEffect, useState, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  handler: () => void;
  description: string;
  category?: string;
}

interface KeyboardNavigationContextType {
  registerShortcut: (shortcut: KeyboardShortcut) => void;
  unregisterShortcut: (key: string) => void;
  shortcuts: KeyboardShortcut[];
  isCommandPaletteOpen: boolean;
  toggleCommandPalette: () => void;
  focusMode: boolean;
  toggleFocusMode: () => void;
}

const KeyboardNavigationContext = createContext<KeyboardNavigationContextType | undefined>(undefined);

export const useKeyboardNavigation = () => {
  const context = useContext(KeyboardNavigationContext);
  if (!context) {
    throw new Error('useKeyboardNavigation must be used within KeyboardNavigationProvider');
  }
  return context;
};

interface KeyboardNavigationProviderProps {
  children: ReactNode;
}

export const KeyboardNavigationProvider: React.FC<KeyboardNavigationProviderProps> = ({ children }) => {
  const [shortcuts, setShortcuts] = useState<KeyboardShortcut[]>([]);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const registerShortcut = useCallback((shortcut: KeyboardShortcut) => {
    setShortcuts(prev => [...prev.filter(s => s.key !== shortcut.key), shortcut]);
  }, []);

  const unregisterShortcut = useCallback((key: string) => {
    setShortcuts(prev => prev.filter(s => s.key !== key));
  }, []);

  const toggleCommandPalette = useCallback(() => {
    setIsCommandPaletteOpen(prev => !prev);
  }, []);

  const toggleFocusMode = useCallback(() => {
    setFocusMode(prev => !prev);
    document.body.classList.toggle('focus-mode');
  }, []);

  // Global keyboard shortcuts
  useEffect(() => {
    const defaultShortcuts: KeyboardShortcut[] = [
      {
        key: '/',
        handler: toggleCommandPalette,
        description: 'Open command palette',
        category: 'Navigation'
      },
      {
        key: 'k',
        ctrl: true,
        handler: toggleCommandPalette,
        description: 'Open command palette',
        category: 'Navigation'
      },
      {
        key: 'Escape',
        handler: () => {
          if (isCommandPaletteOpen) {
            setIsCommandPaletteOpen(false);
          }
          // Close any open modals
          const event = new CustomEvent('app:closeModals');
          window.dispatchEvent(event);
        },
        description: 'Close dialogs',
        category: 'Navigation'
      },
      {
        key: '1',
        handler: () => navigate('/editor'),
        description: 'Go to Content Editor',
        category: 'Quick Navigation'
      },
      {
        key: '2',
        handler: () => navigate('/upload'),
        description: 'Go to Upload Materials',
        category: 'Quick Navigation'
      },
      {
        key: '3',
        handler: () => navigate('/generate'),
        description: 'Go to Generate Documents',
        category: 'Quick Navigation'
      },
      {
        key: '4',
        handler: () => navigate('/research'),
        description: 'Go to Research',
        category: 'Quick Navigation'
      },
      {
        key: '5',
        handler: () => navigate('/social'),
        description: 'Go to Social Media',
        category: 'Quick Navigation'
      },
      {
        key: '6',
        handler: () => navigate('/marketing'),
        description: 'Go to AI Marketing Hub',
        category: 'Quick Navigation'
      },
      {
        key: '7',
        handler: () => navigate('/settings'),
        description: 'Go to Settings',
        category: 'Quick Navigation'
      },
      {
        key: 'f',
        ctrl: true,
        shift: true,
        handler: toggleFocusMode,
        description: 'Toggle focus mode',
        category: 'View'
      },
      {
        key: 'ArrowLeft',
        alt: true,
        handler: () => window.history.back(),
        description: 'Go back',
        category: 'Navigation'
      },
      {
        key: 'ArrowRight',
        alt: true,
        handler: () => window.history.forward(),
        description: 'Go forward',
        category: 'Navigation'
      }
    ];

    defaultShortcuts.forEach(registerShortcut);

    return () => {
      defaultShortcuts.forEach(s => unregisterShortcut(s.key));
    };
  }, [navigate, isCommandPaletteOpen, registerShortcut, unregisterShortcut, toggleCommandPalette, toggleFocusMode]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
      const isContentEditable = target.contentEditable === 'true';

      if (isInput || isContentEditable) {
        // Allow Escape and Ctrl+K even in inputs
        if (!(e.key === 'Escape' || (e.ctrlKey && e.key === 'k'))) {
          return;
        }
      }

      // Special handling for slash key
      if (e.key === '/' && !isInput && !isContentEditable) {
        e.preventDefault();
      }

      const matchingShortcut = shortcuts.find(shortcut => {
        const keyMatch = shortcut.key.toLowerCase() === e.key.toLowerCase();
        const ctrlMatch = shortcut.ctrl ? e.ctrlKey || e.metaKey : !e.ctrlKey && !e.metaKey;
        const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
        const altMatch = shortcut.alt ? e.altKey : !e.altKey;
        
        return keyMatch && ctrlMatch && shiftMatch && altMatch;
      });

      if (matchingShortcut) {
        e.preventDefault();
        matchingShortcut.handler();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);

  // Focus management for accessibility
  useEffect(() => {
    const handleFocusTrap = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && isCommandPaletteOpen) {
        const focusableElements = document.querySelectorAll(
          '.command-palette button, .command-palette input, .command-palette [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    if (isCommandPaletteOpen) {
      window.addEventListener('keydown', handleFocusTrap);
      return () => window.removeEventListener('keydown', handleFocusTrap);
    }
  }, [isCommandPaletteOpen]);

  // Announce navigation changes for screen readers
  useEffect(() => {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = `Navigated to ${location.pathname.replace('/', '') || 'home'}`;
    document.body.appendChild(announcement);

    const timeout = setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);

    return () => {
      clearTimeout(timeout);
      if (document.body.contains(announcement)) {
        document.body.removeChild(announcement);
      }
    };
  }, [location]);

  const value = {
    registerShortcut,
    unregisterShortcut,
    shortcuts,
    isCommandPaletteOpen,
    toggleCommandPalette,
    focusMode,
    toggleFocusMode
  };

  return (
    <KeyboardNavigationContext.Provider value={value}>
      {children}
    </KeyboardNavigationContext.Provider>
  );
};