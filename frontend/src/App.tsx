import React, { useState, useEffect, useCallback } from 'react';
import { ToastProvider, useToast } from './components/ui/Toast';
import { AuthProvider } from './contexts/AuthContext';
import AuthGuard from './components/auth/AuthGuard';
import { apiFetch } from './config/api';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import './styles/brand.locked.css';
import './styles/components.css';
import './styles/quality-enhanced.css';
import './styles/enhanced-layout.css';
import './styles/global-layout.css';
import './styles/auth.css';
import './styles/settings.css';
import './App.css';
import BrandHeader from './components/locked/BrandHeader';
import ContentEditor from './components/ContentEditor';
import DocumentPreview from './components/DocumentPreview';
import UploadManager from './components/UploadManager';
import GeneratePanel from './components/GeneratePanel';
import ResearchPanel from './components/ResearchPanel';
import SocialMediaOptimizer from './components/SocialMediaOptimizer';
import MarketingDashboard from './components/MarketingDashboard';
import Settings from './components/Settings';

interface ContentItem {
  id: number;
  section_type: string;
  title: string;
  content_data: any;
  chart_data?: any;
  display_order: number;
}

function AppContent() {
  const [activeTab, setActiveTab] = useState<'editor' | 'upload' | 'generate' | 'research' | 'social' | 'marketing' | 'settings'>('editor');
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const fetchContent = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await apiFetch<any[]>({ path: '/api/content', method: 'GET' });
      setContentItems(data.map((item: any) => ({
        ...item,
        content_data: typeof item.content_data === 'string' 
          ? (() => {
              try {
                return JSON.parse(item.content_data);
              } catch {
                return item.content_data; // Return as-is if parsing fails
              }
            })()
          : item.content_data || {} // Already an object or null/undefined
      })));
    } catch (error) {
      console.error('Failed to fetch content:', error);
      showToast('Failed to fetch content', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  const navigate = useNavigate();
  const location = useLocation();

  // Initialize from URL on mount
  useEffect(() => {
    const pathTab = location.pathname.replace('/', '') as any;
    if (['editor', 'upload', 'generate', 'research', 'social', 'marketing', 'settings'].includes(pathTab)) {
      setActiveTab(pathTab);
    } else {
      const savedTab = (localStorage.getItem('activeTab') as any) || 'editor';
      setActiveTab(savedTab);
      navigate(`/${savedTab}`, { replace: true });
    }
    
    const savedPreview = localStorage.getItem('previewMode');
    if (savedPreview) setPreviewMode(savedPreview === 'true');
    fetchContent();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle activeTab changes
  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
    const currentPath = location.pathname.replace('/', '');
    if (currentPath !== activeTab) {
      navigate(`/${activeTab}`, { replace: true });
    }
  }, [activeTab, navigate]);

  // Sync with browser navigation (back/forward)
  useEffect(() => {
    const pathTab = location.pathname.replace('/', '') as any;
    if (['editor', 'upload', 'generate', 'research', 'social', 'marketing', 'settings'].includes(pathTab)) {
      if (pathTab !== activeTab) {
        setActiveTab(pathTab);
      }
    }
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    localStorage.setItem('previewMode', String(previewMode));
  }, [previewMode]);

  

  const handleContentSave = async (content: Partial<ContentItem>) => {
    try {
      const method = content.id ? 'PUT' : 'POST';
      const path = content.id ? `/api/content/${content.id}` : '/api/content';
      await apiFetch({ path, method, body: JSON.stringify(content) });
      fetchContent();
      setSelectedContent(null);
      showToast('Content saved', 'success');
    } catch (error) {
      console.error('Failed to save content:', error);
      showToast('Failed to save content', 'error');
    }
  };

  // Listen to reorder events from ContentEditor and persist immediately
  useEffect(() => {
    const onReorder = (e: any) => {
      const item = e.detail as Partial<ContentItem>;
      if (!item?.id) return;
      apiFetch({ path: `/api/content/${item.id}`, method: 'PUT', body: JSON.stringify(item) })
        .then(() => fetchContent())
        .catch(() => showToast('Failed to reorder content', 'error'));
    };
    window.addEventListener('app:reorder', onReorder as any);
    return () => window.removeEventListener('app:reorder', onReorder as any);
  }, [fetchContent, showToast]);

  const handleContentDelete = async (id: number) => {
    try {
      await apiFetch({ path: `/api/content/${id}` , method: 'DELETE' });
      fetchContent();
      setSelectedContent(null);
      showToast('Content deleted', 'success');
    } catch (error) {
      console.error('Failed to delete content:', error);
      showToast('Failed to delete content', 'error');
    }
  };

  // Keyboard shortcuts: Ctrl/Cmd+S to save, P to toggle preview, 1-5 to switch tabs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes('MAC');
      const saveCombo = (isMac && e.metaKey && e.key.toLowerCase() === 's') || (!isMac && e.ctrlKey && e.key.toLowerCase() === 's');
      if (saveCombo) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('app:save'));
        return;
      }
      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        if (e.key.toLowerCase() === 'p') {
          setPreviewMode((v) => !v);
          return;
        }
        const tabKeys: Record<string, typeof activeTab> = {
          '1': 'editor',
          '2': 'upload',
          '3': 'generate',
          '4': 'research',
          '5': 'social',
          '6': 'marketing',
          '7': 'settings',
        };
        if (tabKeys[e.key]) {
          setActiveTab(tabKeys[e.key]);
          return;
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="app brand-locked-scope hardware-accelerated">
      <header className="app-header">
        <BrandHeader 
          title="Content Studio"
          subtitle="Research • Create • Generate • Optimize"
        />
      </header>

      <nav className="app-nav">
        <div className="app-nav-inner">
          <button 
            className={`nav-tab will-change-transform ${activeTab === 'editor' ? 'active' : ''}`}
            onClick={() => setActiveTab('editor')}
            data-tooltip="Press 1"
          >
            Content Editor
          </button>
          <button 
            className={`nav-tab will-change-transform ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveTab('upload')}
            data-tooltip="Press 2"
          >
            Upload Materials
          </button>
          <button 
            className={`nav-tab will-change-transform ${activeTab === 'generate' ? 'active' : ''}`}
            onClick={() => setActiveTab('generate')}
            data-tooltip="Press 3"
          >
            Generate Documents
          </button>
          <button 
            className={`nav-tab will-change-transform ${activeTab === 'research' ? 'active' : ''}`}
            onClick={() => setActiveTab('research')}
            data-tooltip="Press 4"
          >
            Research
          </button>
          <button 
            className={`nav-tab will-change-transform ${activeTab === 'social' ? 'active' : ''}`}
            onClick={() => setActiveTab('social')}
            data-tooltip="Press 5"
          >
            Social Media
          </button>
          <button 
            className={`nav-tab will-change-transform ${activeTab === 'marketing' ? 'active' : ''}`}
            onClick={() => setActiveTab('marketing')}
            data-tooltip="Press 6"
          >
            AI Marketing Hub
          </button>
          <button 
            className={`nav-tab will-change-transform ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
            data-tooltip="Press 7"
          >
            Settings
          </button>
          <button 
            className={`nav-tab preview-toggle will-change-transform ${previewMode ? 'active' : ''}`}
            onClick={() => setPreviewMode(!previewMode)}
            data-tooltip="Press P"
          >
            {previewMode ? 'Hide Preview' : 'Show Preview'}
          </button>
        </div>
      </nav>

      <main className="app-main">
        <div className="content-area">
          <Routes>
            <Route path="/editor" element={
              <ContentEditor
                contentItems={contentItems}
                selectedContent={selectedContent}
                onSelectContent={setSelectedContent}
                onSaveContent={handleContentSave}
                onDeleteContent={handleContentDelete}
                onRefresh={fetchContent}
                isLoading={isLoading}
              />
            }/>
            <Route path="/upload" element={<UploadManager onUploadComplete={fetchContent} />} />
            <Route path="/generate" element={<GeneratePanel contentItems={contentItems} />} />
            <Route path="/research" element={<ResearchPanel onContentAdded={fetchContent} />} />
            <Route path="/social" element={<SocialMediaOptimizer contentItems={contentItems} />} />
            <Route path="/marketing" element={<MarketingDashboard />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/editor" replace />} />
          </Routes>
        </div>

        {previewMode && (
          <div className="preview-area">
            <DocumentPreview contentItems={contentItems} />
          </div>
        )}
      </main>

      <footer className="app-footer">
        <div className="brand-protection-notice">
          ⚠️ Brand Design System: LOCKED | Style Modifications: DISABLED | © The Well 2025
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AuthGuard>
          <AppContent />
        </AuthGuard>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
