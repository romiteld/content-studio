import { useEffect, useCallback } from 'react';
import { useKeyboardNavigation } from '../contexts/KeyboardNavigationContext';

interface ShortcutOptions {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  preventDefault?: boolean;
  stopPropagation?: boolean;
  enableInInput?: boolean;
  description?: string;
  category?: string;
}

export function useKeyboardShortcuts(
  shortcuts: Record<string, () => void> | Array<ShortcutOptions & { handler: () => void }>,
  deps: any[] = []
) {
  const { registerShortcut, unregisterShortcut } = useKeyboardNavigation();

  const parseShortcut = useCallback((shortcut: string) => {
    const parts = shortcut.toLowerCase().split('+');
    const key = parts[parts.length - 1];
    
    return {
      key,
      ctrl: parts.includes('ctrl') || parts.includes('cmd'),
      shift: parts.includes('shift'),
      alt: parts.includes('alt'),
      meta: parts.includes('meta') || parts.includes('cmd')
    };
  }, []);

  useEffect(() => {
    const shortcutList: Array<ShortcutOptions & { handler: () => void }> = [];

    if (Array.isArray(shortcuts)) {
      shortcutList.push(...shortcuts);
    } else {
      Object.entries(shortcuts).forEach(([shortcutKey, handler]) => {
        const parsed = parseShortcut(shortcutKey);
        shortcutList.push({
          ...parsed,
          handler,
          description: shortcutKey,
          category: 'Custom'
        });
      });
    }

    shortcutList.forEach(shortcut => {
      registerShortcut({
        key: shortcut.key,
        ctrl: shortcut.ctrl,
        shift: shortcut.shift,
        alt: shortcut.alt,
        meta: shortcut.meta,
        handler: shortcut.handler,
        description: shortcut.description || `${shortcut.key} shortcut`,
        category: shortcut.category
      });
    });

    return () => {
      shortcutList.forEach(shortcut => {
        unregisterShortcut(shortcut.key);
      });
    };
  }, [shortcuts, registerShortcut, unregisterShortcut, parseShortcut, ...deps]);
}

// Utility hook for common shortcuts
export function useCommonShortcuts() {
  const handleCopy = useCallback(() => {
    document.execCommand('copy');
  }, []);

  const handlePaste = useCallback(() => {
    document.execCommand('paste');
  }, []);

  const handleCut = useCallback(() => {
    document.execCommand('cut');
  }, []);

  const handleUndo = useCallback(() => {
    document.execCommand('undo');
  }, []);

  const handleRedo = useCallback(() => {
    document.execCommand('redo');
  }, []);

  const handleSelectAll = useCallback(() => {
    document.execCommand('selectAll');
  }, []);

  useKeyboardShortcuts([
    {
      key: 'c',
      ctrl: true,
      handler: handleCopy,
      description: 'Copy',
      category: 'Edit',
      enableInInput: true
    },
    {
      key: 'v',
      ctrl: true,
      handler: handlePaste,
      description: 'Paste',
      category: 'Edit',
      enableInInput: true
    },
    {
      key: 'x',
      ctrl: true,
      handler: handleCut,
      description: 'Cut',
      category: 'Edit',
      enableInInput: true
    },
    {
      key: 'z',
      ctrl: true,
      handler: handleUndo,
      description: 'Undo',
      category: 'Edit',
      enableInInput: true
    },
    {
      key: 'z',
      ctrl: true,
      shift: true,
      handler: handleRedo,
      description: 'Redo',
      category: 'Edit',
      enableInInput: true
    },
    {
      key: 'a',
      ctrl: true,
      handler: handleSelectAll,
      description: 'Select All',
      category: 'Edit',
      enableInInput: true
    }
  ]);

  return {
    handleCopy,
    handlePaste,
    handleCut,
    handleUndo,
    handleRedo,
    handleSelectAll
  };
}

// Hook for navigation shortcuts
export function useNavigationShortcuts(navigateTo: (path: string) => void) {
  useKeyboardShortcuts({
    'alt+h': () => navigateTo('/'),
    'alt+e': () => navigateTo('/editor'),
    'alt+u': () => navigateTo('/upload'),
    'alt+g': () => navigateTo('/generate'),
    'alt+r': () => navigateTo('/research'),
    'alt+s': () => navigateTo('/social'),
    'alt+m': () => navigateTo('/marketing'),
    'alt+,': () => navigateTo('/settings')
  }, [navigateTo]);
}

// Hook for list navigation with arrow keys
export function useListNavigation(
  items: any[],
  onSelect: (item: any, index: number) => void,
  options: {
    vertical?: boolean;
    wrap?: boolean;
    enableTab?: boolean;
  } = {}
) {
  const { vertical = true, wrap = true, enableTab = false } = options;
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const nextKey = vertical ? 'ArrowDown' : 'ArrowRight';
      const prevKey = vertical ? 'ArrowUp' : 'ArrowLeft';

      switch (e.key) {
        case nextKey:
          e.preventDefault();
          setSelectedIndex(prev => {
            const next = prev + 1;
            if (next >= items.length) {
              return wrap ? 0 : prev;
            }
            return next;
          });
          break;
        case prevKey:
          e.preventDefault();
          setSelectedIndex(prev => {
            const next = prev - 1;
            if (next < 0) {
              return wrap ? items.length - 1 : prev;
            }
            return next;
          });
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (items[selectedIndex]) {
            onSelect(items[selectedIndex], selectedIndex);
          }
          break;
        case 'Tab':
          if (enableTab) {
            e.preventDefault();
            const direction = e.shiftKey ? -1 : 1;
            setSelectedIndex(prev => {
              const next = prev + direction;
              if (wrap) {
                return (next + items.length) % items.length;
              }
              return Math.max(0, Math.min(items.length - 1, next));
            });
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [items, selectedIndex, onSelect, vertical, wrap, enableTab]);

  return { selectedIndex, setSelectedIndex };
}

// Hook for modal/dialog keyboard handling
export function useModalKeyboard(
  isOpen: boolean,
  onClose: () => void,
  options: {
    closeOnEscape?: boolean;
    trapFocus?: boolean;
  } = {}
) {
  const { closeOnEscape = true, trapFocus = true } = options;

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape) {
        e.preventDefault();
        onClose();
      }
    };

    if (trapFocus) {
      const focusableElements = document.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      const handleTab = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return;

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
      };

      window.addEventListener('keydown', handleTab);
      firstElement?.focus();

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keydown', handleTab);
      };
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, closeOnEscape, trapFocus]);
}

import { useState } from 'react';