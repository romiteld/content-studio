import React, { useEffect, useState } from 'react';
import { useToast } from './ui/Toast';
import { useConfirm } from './ui/Confirm';

interface ContentEditorProps {
  contentItems: any[];
  selectedContent: any;
  onSelectContent: (content: any) => void;
  onSaveContent: (content: any) => void;
  onDeleteContent: (id: number) => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

const ContentEditor: React.FC<ContentEditorProps> = ({
  contentItems,
  selectedContent,
  onSelectContent,
  onSaveContent,
  onDeleteContent,
  onRefresh,
  isLoading
}) => {
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [formData, setFormData] = useState({
    section_type: 'role_description',
    title: '',
    content_data: {
      description: '',
      compensation: {
        base: '',
        bonus: '',
        total: ''
      }
    },
    display_order: 0
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (selectedContent) {
      setFormData(selectedContent);
    } else {
      setFormData({
        section_type: 'role_description',
        title: '',
        content_data: {
          description: '',
          compensation: {
            base: '',
            bonus: '',
            total: ''
          }
        },
        display_order: 0
      });
    }
  }, [selectedContent]);

  // Handle save keyboard shortcut
  useEffect(() => {
    const handleSaveShortcut = () => {
      const form = document.querySelector('.editor-form form') as HTMLFormElement;
      if (form) {
        form.requestSubmit();
      }
    };
    
    window.addEventListener('app:save', handleSaveShortcut);
    return () => window.removeEventListener('app:save', handleSaveShortcut);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors['title'] = 'Title is required';
    if (!formData.content_data.description?.trim()) newErrors['description'] = 'Description is required';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      showToast('Please fix form errors', 'error');
      return;
    }
    setIsSaving(true);
    onSaveContent(formData);
    setTimeout(() => setIsSaving(false), 400); // visual feedback
  };

  const handleReset = () => {
    onSelectContent(null);
  };

  return (
    <div className="content-editor">
      <div className="editor-sidebar">
        <h3>Content Sections</h3>
        <button className="btn-refresh" onClick={onRefresh}>Refresh</button>
        <div className="content-list" aria-busy={isLoading} aria-live="polite">
          {isLoading && (
            <>
              <div className="content-item skeleton" />
              <div className="content-item skeleton" />
              <div className="content-item skeleton" />
            </>
          )}
          {!isLoading && contentItems.length === 0 && (
            <div className="content-item empty-state">No content yet. Create your first section →</div>
          )}
          {!isLoading && contentItems.length > 0 && (
            <div
              className="content-draggable-list"
              onDragOver={(e) => e.preventDefault()}
            >
              {contentItems
                .slice()
                .sort((a, b) => a.display_order - b.display_order)
                .map((item) => (
                  <div
                    key={item.id}
                    className={`content-item ${selectedContent?.id === item.id ? 'selected' : ''}`}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('text/plain', String(item.id))}
                    onDrop={(e) => {
                      e.preventDefault();
                      const draggedId = Number(e.dataTransfer.getData('text/plain'));
                      if (!draggedId || draggedId === item.id) return;
                      const dragged = contentItems.find((c) => c.id === draggedId);
                      if (!dragged) return;
                      const newOrder = contentItems.map((c) => {
                        if (c.id === item.id) return { ...c, display_order: dragged.display_order };
                        if (c.id === dragged.id) return { ...c, display_order: item.display_order };
                        return c;
                      });
                      // Optimistic update
                      onSelectContent(null);
                      // Persist order via onSaveContent
                      newOrder.forEach((c) => window.dispatchEvent(new CustomEvent('app:reorder', { detail: c })));
                    }}
                    onClick={() => {
                      onSelectContent(item);
                      window.dispatchEvent(new CustomEvent('app:scrollToPreview', { detail: { id: item.id } }));
                    }}
                  >
                    <span className="content-type">{item.section_type}</span>
                    <span className="content-title">{item.title}</span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      <div className="editor-main">
        <h2>{selectedContent ? 'Edit Content' : 'Create New Content'}</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Section Type (Locked Template)</label>
            <select
              className="form-control"
              value={formData.section_type}
              onChange={(e) => setFormData({ ...formData, section_type: e.target.value })}
              disabled={!!selectedContent}
            >
              <option value="cover">Cover Page</option>
              <option value="executive_summary">Executive Summary</option>
              <option value="role_description">Role Description</option>
              <option value="compensation_analysis">Compensation Analysis</option>
              <option value="market_insights">Market Insights</option>
              <option value="call_to_action">Call to Action</option>
            </select>
          </div>

          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter title..."
              required
            />
            {errors.title && <small className="field-error">{errors.title}</small>}
          </div>

          <div className="form-group">
            <label>Content Description</label>
            <textarea
              value={formData.content_data.description || ''}
              onChange={(e) => setFormData({
                ...formData,
                content_data: { ...formData.content_data, description: e.target.value }
              })}
              rows={8}
              placeholder="Enter content description..."
            />
            {errors.description && <small className="field-error">{errors.description}</small>}
          </div>

          {formData.section_type === 'role_description' && (
            <div className="compensation-fields">
              <h4>Compensation Details</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Base Salary</label>
                  <input
                    type="text"
                    value={formData.content_data.compensation?.base || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      content_data: {
                        ...formData.content_data,
                        compensation: {
                          ...formData.content_data.compensation,
                          base: e.target.value
                        }
                      }
                    })}
                    placeholder="e.g., $150K - $200K"
                  />
                </div>
                <div className="form-group">
                  <label>Bonus</label>
                  <input
                    type="text"
                    value={formData.content_data.compensation?.bonus || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      content_data: {
                        ...formData.content_data,
                        compensation: {
                          ...formData.content_data.compensation,
                          bonus: e.target.value
                        }
                      }
                    })}
                    placeholder="e.g., 30% - 50%"
                  />
                </div>
                <div className="form-group">
                  <label>Total Compensation</label>
                  <input
                    type="text"
                    value={formData.content_data.compensation?.total || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      content_data: {
                        ...formData.content_data,
                        compensation: {
                          ...formData.content_data.compensation,
                          total: e.target.value
                        }
                      }
                    })}
                    placeholder="e.g., $195K - $300K"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Display Order</label>
            <input
              type="number"
              value={formData.display_order}
              onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
              min="0"
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-save" disabled={isSaving} title="Ctrl+S / Cmd+S to save">
              {isSaving ? 'Saving...' : selectedContent ? 'Update' : 'Create'} Content
            </button>
            {selectedContent && (
              <>
                <button type="button" className="btn-cancel" onClick={handleReset}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-delete"
                onClick={async () => {
                  const ok = await confirm({ message: 'Delete this content section?' });
                  if (ok) onDeleteContent(selectedContent.id);
                }}
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </form>

        <div className="style-notice">
          <p>⚠️ Core branding is locked (colors, logos, fonts).</p>
          <p>You can modify styles while maintaining brand integrity.</p>
        </div>
      </div>
    </div>
  );
};

export default ContentEditor;