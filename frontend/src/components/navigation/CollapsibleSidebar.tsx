import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FileText,
  Upload,
  FileOutput,
  Search,
  Share2,
  TrendingUp,
  Settings,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Sparkles
} from 'lucide-react';
import { GlassIcons, GlassIconsItem } from '../ui/glass-icons';
import './sidebar.css';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
  group?: string;
  color?: string;
}

interface SidebarProps {
  previewMode: boolean;
  onPreviewToggle: () => void;
}

const navItems: NavItem[] = [
  { id: 'editor', label: 'Content Editor', icon: FileText, path: '/editor', color: 'blue' },
  { id: 'upload', label: 'Upload Materials', icon: Upload, path: '/upload', color: 'green' },
  { id: 'generate', label: 'Generate Documents', icon: FileOutput, path: '/generate', color: 'purple' },
  { id: 'research', label: 'Research', icon: Search, path: '/research', group: 'AI Tools', color: 'indigo' },
  { id: 'social', label: 'Social Media', icon: Share2, path: '/social', group: 'AI Tools', color: 'orange' },
  { id: 'marketing', label: 'AI Marketing Hub', icon: TrendingUp, path: '/marketing', group: 'AI Tools', color: 'red' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings', color: 'gray' }
];

export default function CollapsibleSidebar({ previewMode, onPreviewToggle }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileOpen]);

  const handleNavClick = (item: NavItem) => {
    navigate(item.path);
    setIsMobileOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  const groupedItems = navItems.reduce((acc, item) => {
    const group = item.group || 'Main';
    if (!acc[group]) acc[group] = [];
    acc[group].push(item);
    return acc;
  }, {} as Record<string, NavItem[]>);

  const toggleGroup = (group: string) => {
    setActiveGroup(activeGroup === group ? null : group);
  };

  return (
    <>
      <button
        className="mobile-menu-toggle"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        aria-label="Toggle navigation menu"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div className={`sidebar-overlay ${isMobileOpen ? 'active' : ''}`} onClick={() => setIsMobileOpen(false)} />

      <nav className={`collapsible-sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <button
            className="collapse-toggle"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        <div className="sidebar-content">
          {Object.entries(groupedItems).map(([group, items]) => (
            <div key={group} className="nav-group">
              {group !== 'Main' && (
                <button
                  className={`nav-group-header ${activeGroup === group || !isCollapsed ? 'expanded' : ''}`}
                  onClick={() => toggleGroup(group)}
                  disabled={!isCollapsed}
                >
                  <Sparkles size={16} />
                  {!isCollapsed && <span>{group}</span>}
                  {!isCollapsed && (
                    <ChevronRight className={`group-chevron ${activeGroup === group ? 'rotated' : ''}`} size={16} />
                  )}
                </button>
              )}
              
              <div className={`nav-items ${group !== 'Main' && activeGroup !== group && isCollapsed ? 'collapsed-group' : ''}`}>
                {!isCollapsed && items.length > 1 ? (
                  <div className="glass-nav-items">
                    <GlassIcons
                      items={items.map(item => {
                        const Icon = item.icon;
                        return {
                          icon: <Icon size={24} color="white" />,
                          color: item.color || 'blue',
                          label: item.label,
                          customClass: isActive(item.path) ? 'glass-nav-active' : ''
                        } as GlassIconsItem;
                      })}
                      className="sidebar-glass-icons"
                    />
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="glass-nav-click-area"
                        onClick={() => handleNavClick(item)}
                        aria-label={item.label}
                      />
                    ))}
                  </div>
                ) : (
                  items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    
                    return (
                      <button
                        key={item.id}
                        className={`nav-item ${active ? 'active' : ''}`}
                        onClick={() => handleNavClick(item)}
                        title={isCollapsed ? item.label : undefined}
                        aria-label={item.label}
                        aria-current={active ? 'page' : undefined}
                      >
                        <Icon size={20} className="nav-icon" />
                        <span className="nav-label">{item.label}</span>
                        {isCollapsed && <span className="nav-tooltip">{item.label}</span>}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          ))}

          <div className="sidebar-footer">
            <button
              className={`nav-item preview-toggle ${previewMode ? 'active' : ''}`}
              onClick={onPreviewToggle}
              title={isCollapsed ? (previewMode ? 'Hide Preview' : 'Show Preview') : undefined}
              aria-label={previewMode ? 'Hide Preview' : 'Show Preview'}
            >
              {previewMode ? <EyeOff size={20} className="nav-icon" /> : <Eye size={20} className="nav-icon" />}
              <span className="nav-label">{previewMode ? 'Hide Preview' : 'Show Preview'}</span>
              {isCollapsed && <span className="nav-tooltip">{previewMode ? 'Hide Preview' : 'Show Preview'}</span>}
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}