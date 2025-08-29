import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  FileText, 
  Upload, 
  FileOutput, 
  Share2, 
  TrendingUp, 
  Settings,
  Command,
  X,
  ArrowRight
} from 'lucide-react';
import { useKeyboardNavigation } from '../contexts/KeyboardNavigationContext';
import './command-palette.css';

interface Command {
  id: string;
  label: string;
  description?: string;
  icon?: React.ElementType;
  action: () => void;
  category: string;
  keywords?: string[];
}

export default function CommandPalette() {
  const { isCommandPaletteOpen, toggleCommandPalette, shortcuts } = useKeyboardNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filteredCommands, setFilteredCommands] = useState<Command[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const commands: Command[] = [
    {
      id: 'nav-editor',
      label: 'Content Editor',
      description: 'Edit and manage content',
      icon: FileText,
      action: () => {
        navigate('/editor');
        toggleCommandPalette();
      },
      category: 'Navigation',
      keywords: ['edit', 'content', 'write']
    },
    {
      id: 'nav-upload',
      label: 'Upload Materials',
      description: 'Upload documents and files',
      icon: Upload,
      action: () => {
        navigate('/upload');
        toggleCommandPalette();
      },
      category: 'Navigation',
      keywords: ['upload', 'file', 'document']
    },
    {
      id: 'nav-generate',
      label: 'Generate Documents',
      description: 'AI-powered document generation',
      icon: FileOutput,
      action: () => {
        navigate('/generate');
        toggleCommandPalette();
      },
      category: 'Navigation',
      keywords: ['generate', 'ai', 'create']
    },
    {
      id: 'nav-research',
      label: 'Research',
      description: 'Research and gather information',
      icon: Search,
      action: () => {
        navigate('/research');
        toggleCommandPalette();
      },
      category: 'Navigation',
      keywords: ['research', 'search', 'find']
    },
    {
      id: 'nav-social',
      label: 'Social Media',
      description: 'Optimize social media content',
      icon: Share2,
      action: () => {
        navigate('/social');
        toggleCommandPalette();
      },
      category: 'Navigation',
      keywords: ['social', 'media', 'share']
    },
    {
      id: 'nav-marketing',
      label: 'AI Marketing Hub',
      description: 'Marketing campaigns and analytics',
      icon: TrendingUp,
      action: () => {
        navigate('/marketing');
        toggleCommandPalette();
      },
      category: 'Navigation',
      keywords: ['marketing', 'campaign', 'analytics']
    },
    {
      id: 'nav-settings',
      label: 'Settings',
      description: 'Configure application settings',
      icon: Settings,
      action: () => {
        navigate('/settings');
        toggleCommandPalette();
      },
      category: 'Navigation',
      keywords: ['settings', 'preferences', 'config']
    },
    ...shortcuts.map((shortcut, index) => ({
      id: `shortcut-${index}`,
      label: shortcut.description,
      description: `Shortcut: ${shortcut.ctrl ? 'Ctrl+' : ''}${shortcut.shift ? 'Shift+' : ''}${shortcut.alt ? 'Alt+' : ''}${shortcut.key}`,
      icon: Command,
      action: () => {
        shortcut.handler();
        toggleCommandPalette();
      },
      category: shortcut.category || 'Shortcuts',
      keywords: [shortcut.key, shortcut.description.toLowerCase()]
    }))
  ];

  useEffect(() => {
    if (isCommandPaletteOpen) {
      searchInputRef.current?.focus();
      setSearchQuery('');
      setSelectedIndex(0);
    }
  }, [isCommandPaletteOpen]);

  useEffect(() => {
    const filtered = commands.filter(command => {
      const query = searchQuery.toLowerCase();
      return (
        command.label.toLowerCase().includes(query) ||
        command.description?.toLowerCase().includes(query) ||
        command.keywords?.some(keyword => keyword.includes(query)) ||
        command.category.toLowerCase().includes(query)
      );
    });
    setFilteredCommands(filtered);
    setSelectedIndex(0);
  }, [searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
        }
        break;
      case 'Escape':
        e.preventDefault();
        toggleCommandPalette();
        break;
    }
  };

  if (!isCommandPaletteOpen) return null;

  const groupedCommands = filteredCommands.reduce((acc, command) => {
    if (!acc[command.category]) {
      acc[command.category] = [];
    }
    acc[command.category].push(command);
    return acc;
  }, {} as Record<string, Command[]>);

  let currentIndex = 0;

  return (
    <>
      <div className="command-palette-overlay" onClick={toggleCommandPalette} />
      <div className="command-palette" role="dialog" aria-modal="true" aria-label="Command Palette">
        <div className="command-palette-header">
          <Search size={20} className="command-palette-search-icon" />
          <input
            ref={searchInputRef}
            type="text"
            className="command-palette-input"
            placeholder="Type a command or search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Search commands"
          />
          <button
            className="command-palette-close"
            onClick={toggleCommandPalette}
            aria-label="Close command palette"
          >
            <X size={20} />
          </button>
        </div>

        <div className="command-palette-content">
          {Object.entries(groupedCommands).map(([category, commands]) => (
            <div key={category} className="command-palette-category">
              <div className="command-palette-category-title">{category}</div>
              <div className="command-palette-commands">
                {commands.map((command) => {
                  const Icon = command.icon;
                  const isSelected = currentIndex === selectedIndex;
                  const commandIndex = currentIndex++;
                  
                  return (
                    <button
                      key={command.id}
                      className={`command-palette-command ${isSelected ? 'selected' : ''}`}
                      onClick={command.action}
                      onMouseEnter={() => setSelectedIndex(commandIndex)}
                      aria-selected={isSelected}
                    >
                      {Icon && <Icon size={18} className="command-palette-command-icon" />}
                      <div className="command-palette-command-content">
                        <div className="command-palette-command-label">{command.label}</div>
                        {command.description && (
                          <div className="command-palette-command-description">
                            {command.description}
                          </div>
                        )}
                      </div>
                      <ArrowRight size={16} className="command-palette-command-arrow" />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {filteredCommands.length === 0 && (
            <div className="command-palette-empty">
              No commands found for "{searchQuery}"
            </div>
          )}
        </div>

        <div className="command-palette-footer">
          <div className="command-palette-hint">
            <kbd>↑↓</kbd> Navigate
          </div>
          <div className="command-palette-hint">
            <kbd>↵</kbd> Select
          </div>
          <div className="command-palette-hint">
            <kbd>ESC</kbd> Close
          </div>
        </div>
      </div>
    </>
  );
}