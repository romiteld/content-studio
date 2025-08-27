import React, { useState } from 'react';
import { useToast } from './ui/Toast';
import { apiFetch, API_BASE_URL } from '../config/api';

interface UploadManagerProps {
  onUploadComplete: () => void;
}

const UploadManager: React.FC<UploadManagerProps> = ({ onUploadComplete }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<any[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  const [isHovering, setIsHovering] = useState(false);
  const { showToast } = useToast();

  const convertToContent = async (uploadResult: any) => {
    try {
      // Create a new content section from the upload
      const contentData = {
        section_type: 'executive_summary',
        title: uploadResult.originalName || 'Imported Content',
        content_data: {
          description: uploadResult.processedContent || 'Imported content from file upload',
          content: uploadResult.processedContent || 'Content has been imported and formatted with brand styling.'
        },
        display_order: 0
      };
      
      await apiFetch({ path: '/api/content', method: 'POST', body: JSON.stringify(contentData) });
      showToast('Content section created', 'success');
      onUploadComplete();
    } catch (error) {
      console.error('Failed to convert to content:', error);
      showToast('Error converting to content', 'error');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    
    if (files.length === 1) {
      formData.append('file', files[0]);
      
      try {
        // xhr to track progress
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${API_BASE_URL}/api/upload/single`);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            setProgressMap((m) => ({ ...m, [files[0].name]: percent }));
          }
        };
        xhr.onload = () => {
          try {
            const result = JSON.parse(xhr.responseText);
            setUploadResults([result]);
            onUploadComplete();
          } catch (e) {
            setUploadResults([{ error: 'Upload parse error' }]);
          }
        };
        xhr.onerror = () => setUploadResults([{ error: 'Upload failed' }]);
        xhr.send(formData);
      } catch (error) {
        console.error('Upload failed:', error);
        setUploadResults([{ error: 'Upload failed' }]);
        showToast('Upload failed', 'error');
      }
    } else {
      files.forEach(file => {
        formData.append('files', file);
      });
      
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${API_BASE_URL}/api/upload/batch`);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            // Aggregate batch progress
            setProgressMap((m) => ({ ...m, __batch__: percent }));
          }
        };
        xhr.onload = () => {
          try {
            const result = JSON.parse(xhr.responseText);
            setUploadResults(result.results);
            onUploadComplete();
          } catch (e) {
            setUploadResults([{ error: 'Upload parse error' }]);
          }
        };
        xhr.onerror = () => setUploadResults([{ error: 'Batch upload failed' }]);
        xhr.send(formData);
      } catch (error) {
        console.error('Batch upload failed:', error);
        setUploadResults([{ error: 'Batch upload failed' }]);
        showToast('Batch upload failed', 'error');
      }
    }
    
    setUploading(false);
    setFiles([]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(droppedFiles);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="upload-manager">
      <h2>Upload Content</h2>
      
      <div 
        className="upload-zone"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => document.getElementById('file-input')?.click()}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        style={{
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          paddingTop: '50px',
          minHeight: '280px',
          transition: 'all 0.3s ease',
          position: 'relative'
        }}
      >
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: '25px',
          width: '100%'
        }}>
          <div className="upload-icon" style={{
            fontSize: '90px',
            transition: 'transform 0.3s ease',
            transform: isHovering ? 'scale(1.15)' : 'scale(1)',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>📁</div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: '0 0 10px 0', fontSize: '17px', color: '#E6E6E6' }}>
              Drag & drop files here or click to browse
            </p>
            <small style={{ color: '#BFBFBF', fontSize: '14px' }}>
              Supported: Word, PDF, Text, Markdown, CSV
            </small>
          </div>
        </div>
        <input
          id="file-input"
          type="file"
          multiple
          accept=".docx,.doc,.pdf,.txt,.md,.csv"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </div>

      {files.length > 0 && (
        <div className="selected-files">
          <h3>Selected Files:</h3>
          <ul>
            {files.map((file, index) => (
              <li key={index}>
                {file.name} ({(file.size / 1024).toFixed(2)} KB)
                {progressMap[file.name] != null && (
                  <span> — {progressMap[file.name]}%</span>
                )}
              </li>
            ))}
          </ul>
          <button 
            className="btn-upload"
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Upload Files'}
          </button>
        </div>
      )}

      {uploadResults.length > 0 && (
        <div className="upload-results">
          <h3>Upload Results:</h3>
          {uploadResults.map((result, index) => (
            <div key={index} className={`result-item ${result.error ? 'error' : 'success'}`}>
              {result.filename || result.originalName}: {result.message || result.status || result.error}
              {result.processedContent && (
                <div className="content-preview">
                  <small>{result.processedContent}</small>
                </div>
              )}
              {result.id && (
                <button 
                  className="btn-convert"
                  onClick={() => convertToContent(result)}
                >
                  Convert to Content Section
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="format-notice">
        <h3>Auto-Formatting Notice</h3>
        <p>✅ All uploaded content is automatically formatted to match the brand design</p>
        <p>✅ Style attributes are stripped and replaced with locked templates</p>
        <p>✅ Only text and data are extracted - all formatting is standardized</p>
      </div>
    </div>
  );
};

export default UploadManager;