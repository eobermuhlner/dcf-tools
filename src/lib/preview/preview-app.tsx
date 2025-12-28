import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RenderNodeView } from '../../render/RenderNodeView.js';
import { dcfToRenderTree } from '../../render/dcfToRenderTree.js';

// File metadata interface matching server-side FileInfo
interface FileInfo {
  path: string;
  relativePath: string;
  kind: string | null;
  name: string | null;
  elements: string[];
}

interface DCFData {
  document: any;
  normalized: any;
  validation: any;
  error?: string;
  files: FileInfo[];
}

// Kind badge colors
const KIND_COLORS: Record<string, string> = {
  tokens: '#4CAF50',
  component: '#2196F3',
  layout: '#9C27B0',
  screen: '#FF9800',
  navigation: '#00BCD4',
  flow: '#E91E63',
  theme: '#795548',
  theming: '#607D8B',
  i18n: '#3F51B5',
  rules: '#F44336',
};

// Kind hierarchy order (highest-level concepts first, lowest-level last)
const KIND_HIERARCHY: Record<string, number> = {
  screen: 1,
  flow: 2,
  navigation: 3,
  layout: 4,
  component: 5,
  tokens: 6,
  theme: 7,
  theming: 8,
  i18n: 9,
  rules: 10,
};

// Sort files by kind hierarchy, then by name
function sortFilesByKindHierarchy(files: FileInfo[]): FileInfo[] {
  return [...files].sort((a, b) => {
    const kindA = a.kind || '';
    const kindB = b.kind || '';
    const orderA = KIND_HIERARCHY[kindA] ?? 100;
    const orderB = KIND_HIERARCHY[kindB] ?? 100;

    if (orderA !== orderB) {
      return orderA - orderB;
    }

    // Same kind: sort by name/path
    const nameA = a.name || a.relativePath;
    const nameB = b.name || b.relativePath;
    return nameA.localeCompare(nameB);
  });
}

// File Panel Component
const FilePanel: React.FC<{
  files: FileInfo[];
  selectedFile: string | null;
  onSelectionChange: (file: string | null) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}> = ({ files, selectedFile, onSelectionChange, collapsed, onToggleCollapse }) => {
  // Sort files by kind hierarchy (screens first, tokens last)
  const sortedFiles = sortFilesByKindHierarchy(files);

  const handleFileClick = (file: FileInfo) => {
    onSelectionChange(file.path);
  };

  if (collapsed) {
    return (
      <div className="file-panel collapsed">
        <button className="collapse-button" onClick={onToggleCollapse} title="Expand file panel">
          &raquo;
        </button>
      </div>
    );
  }

  return (
    <div className="file-panel">
      <div className="file-panel-header">
        <h3>Files ({files.length})</h3>
        <button className="collapse-button" onClick={onToggleCollapse} title="Collapse file panel">
          &laquo;
        </button>
      </div>
      <div className="file-list">
        {sortedFiles.map((file) => (
          <div
            key={file.path}
            className={`file-item ${selectedFile === file.path ? 'selected' : ''}`}
            onClick={() => handleFileClick(file)}
          >
            <div className="file-info">
              <span className="file-path" title={file.path}>{file.relativePath}</span>
              {file.name && <span className="file-name">{file.name}</span>}
            </div>
            {file.kind && (
              <span
                className="kind-badge"
                style={{ backgroundColor: KIND_COLORS[file.kind] || '#999' }}
              >
                {file.kind}
              </span>
            )}
          </div>
        ))}
      </div>
      <div className="file-panel-footer">
        <small>1 of {files.length} files</small>
      </div>
    </div>
  );
};

// Resizable divider component
const ResizableDivider: React.FC<{
  onResize: (delta: number) => void;
}> = ({ onResize }) => {
  const isDragging = useRef(false);
  const startX = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    startX.current = e.clientX;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const delta = e.clientX - startX.current;
      startX.current = e.clientX;
      onResize(delta);
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [onResize]);

  return <div className="resizable-divider" onMouseDown={handleMouseDown} />;
};

// Helper function to filter document to only include elements from selected file
function filterDocumentByFile(document: any, files: FileInfo[], selectedFile: string | null): any {
  if (!document || !selectedFile) {
    return null;
  }

  // Find the selected file info
  const fileInfo = files.find(f => f.path === selectedFile);
  if (!fileInfo) {
    return null;
  }

  // Build a set of element keys from the selected file
  const selectedElements = new Set<string>(fileInfo.elements);
  const isTokensFile = fileInfo.kind === 'tokens' || fileInfo.kind === 'token';

  // Create a filtered document with only elements from the selected file
  const filtered: any = {
    dcf_version: document.dcf_version,
    profile: document.profile,
  };

  // Only include tokens if a tokens file is selected
  if (isTokensFile && document.tokens) {
    filtered.tokens = document.tokens;
  }

  const categories = ['components', 'layouts', 'screens', 'navigation', 'flows', 'themes', 'i18n', 'rules'];

  for (const category of categories) {
    if (document[category] && typeof document[category] === 'object') {
      const filteredCategory: any = {};
      for (const [key, value] of Object.entries(document[category])) {
        const elementKey = `${category}.${key}`;
        if (selectedElements.has(elementKey)) {
          filteredCategory[key] = value;
        }
      }
      if (Object.keys(filteredCategory).length > 0) {
        filtered[category] = filteredCategory;
      }
    }
  }

  return filtered;
}

// Tab type for the preview panel
type PreviewTab = 'visual' | 'source';

const PreviewApp: React.FC = () => {
  const [dcfData, setDcfData] = useState<DCFData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [leftPanelWidth, setLeftPanelWidth] = useState(250);
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [previousFilePaths, setPreviousFilePaths] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<PreviewTab>('visual');

  // Initialize selection when data loads
  useEffect(() => {
    if (dcfData?.files && dcfData.files.length > 0) {
      const currentPaths = new Set(dcfData.files.map(f => f.path));

      // Check if this is first load or files changed
      if (previousFilePaths.size === 0) {
        // First load: select the first file (sorted by kind hierarchy)
        const sortedFiles = sortFilesByKindHierarchy(dcfData.files);
        setSelectedFile(sortedFiles[0].path);
      } else {
        // Subsequent load: preserve selection if file still exists
        if (selectedFile && !currentPaths.has(selectedFile)) {
          // Selected file was removed, clear selection
          setSelectedFile(null);
        }
      }

      setPreviousFilePaths(currentPaths);
    }
  }, [dcfData?.files]);

  useEffect(() => {
    let pollInterval: NodeJS.Timeout;
    let isCancelled = false;

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/dcf');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (!isCancelled) {
          setDcfData(data as DCFData);
          setError(null);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : 'An unknown error occurred');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    // Initial fetch
    fetchData();

    // Set up polling to check for updates
    pollInterval = setInterval(async () => {
      try {
        const response = await fetch('/api/dcf');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (!isCancelled) {
          setDcfData(data as DCFData);
        }
      } catch (err) {
        console.error('Error fetching updated data:', err);
      }
    }, 5000);

    return () => {
      isCancelled = true;
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, []);

  const handleResize = useCallback((delta: number) => {
    setLeftPanelWidth(prev => {
      const newWidth = prev + delta;
      // Enforce minimum widths
      return Math.max(150, Math.min(newWidth, window.innerWidth - 300));
    });
  }, []);

  const handleSelectionChange = useCallback((file: string | null) => {
    setSelectedFile(file);
  }, []);

  if (loading) {
    return (
      <div className="preview-app">
        <style>{styles}</style>
        <div className="loading-container">
          <h1>DCF Preview</h1>
          <p>Loading DCF documents...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="preview-app">
        <style>{styles}</style>
        <div className="error-container">
          <h1>DCF Preview - Error</h1>
          <div className="error-message">
            <h2>Error Loading DCF Documents</h2>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!dcfData) {
    return (
      <div className="preview-app">
        <style>{styles}</style>
        <div className="loading-container">
          <h1>DCF Preview</h1>
          <p>No DCF data available</p>
        </div>
      </div>
    );
  }

  // Check if there are validation errors
  if (dcfData.error) {
    return (
      <div className="preview-app">
        <style>{styles}</style>
        <div className="error-container">
          <h1>DCF Preview - Validation Error</h1>
          <div className="error-message">
            <h2>Validation Error</h2>
            <p>{dcfData.error}</p>
            <details>
              <summary>Validation Details</summary>
              <pre>{JSON.stringify(dcfData.validation, null, 2)}</pre>
            </details>
          </div>
        </div>
      </div>
    );
  }

  // Filter document based on selected file
  const filteredDocument = filterDocumentByFile(
    dcfData.document,
    dcfData.files || [],
    selectedFile
  );

  // Generate render tree from filtered document
  let renderTree = null;
  if (filteredDocument && selectedFile) {
    try {
      renderTree = dcfToRenderTree(filteredDocument);
    } catch (err) {
      console.error('Error converting DCF to render tree:', err);
    }
  }

  return (
    <div className="preview-app">
      <style>{styles}</style>

      <div className="preview-header">
        <h1>DCF Preview</h1>
        <div className="header-info">
          <span>Version: {dcfData.validation?.dcf_version || 'Unknown'}</span>
          <span>Profile: {dcfData.validation?.profile || 'Unknown'}</span>
        </div>
      </div>

      <div className="preview-main">
        {/* Left Panel: File Selection */}
        <div
          className="left-panel"
          style={{ width: leftPanelCollapsed ? 40 : leftPanelWidth }}
        >
          <FilePanel
            files={dcfData.files || []}
            selectedFile={selectedFile}
            onSelectionChange={handleSelectionChange}
            collapsed={leftPanelCollapsed}
            onToggleCollapse={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
          />
        </div>

        {/* Resizable Divider */}
        {!leftPanelCollapsed && (
          <ResizableDivider onResize={handleResize} />
        )}

        {/* Right Panel: Preview */}
        <div className="right-panel">
          {/* Tab Bar */}
          <div className="tab-bar">
            <button
              className={`tab-button ${activeTab === 'visual' ? 'active' : ''}`}
              onClick={() => setActiveTab('visual')}
            >
              Visual
            </button>
            <button
              className={`tab-button ${activeTab === 'source' ? 'active' : ''}`}
              onClick={() => setActiveTab('source')}
            >
              Source
            </button>
          </div>

          <div className="preview-content">
            {!selectedFile ? (
              <div className="empty-selection">
                <h2>No File Selected</h2>
                <p>Select a file from the left panel to preview its contents.</p>
              </div>
            ) : activeTab === 'visual' ? (
              renderTree && Object.keys(renderTree).length > 0 ? (
                <div className="visual-preview">
                  <RenderNodeView node={renderTree} />
                </div>
              ) : (
                <div className="no-preview">
                  <h2>No Visual Preview Available</h2>
                  <p>The selected files don't contain previewable content.</p>
                </div>
              )
            ) : (
              <div className="source-view">
                <pre className="source-code">{JSON.stringify(filteredDocument, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// CSS styles for the two-panel layout
const styles = `
  * {
    box-sizing: border-box;
  }

  .preview-app {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    height: 100vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 20px;
    background: #1a1a2e;
    color: white;
    border-bottom: 1px solid #333;
  }

  .preview-header h1 {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
  }

  .header-info {
    display: flex;
    gap: 20px;
    font-size: 13px;
    color: #aaa;
  }

  .preview-main {
    display: flex;
    flex: 1;
    overflow: hidden;
  }

  /* Left Panel */
  .left-panel {
    flex-shrink: 0;
    background: #f5f5f5;
    border-right: 1px solid #ddd;
    overflow: hidden;
    transition: width 0.2s ease;
  }

  .file-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .file-panel.collapsed {
    width: 40px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding-top: 10px;
  }

  .file-panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: #e8e8e8;
    border-bottom: 1px solid #ddd;
  }

  .file-panel-header h3 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
  }

  .collapse-button {
    background: none;
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 4px 8px;
    cursor: pointer;
    font-size: 14px;
    color: #666;
  }

  .collapse-button:hover {
    background: #ddd;
  }

  .file-list {
    flex: 1;
    overflow-y: auto;
    padding: 8px 0;
  }

  .file-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    cursor: pointer;
    border-bottom: 1px solid #eee;
  }

  .file-item:hover {
    background: #e8f4fc;
  }

  .file-item.selected {
    background: #cce5ff;
    border-left: 3px solid #007acc;
  }

  .file-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    overflow: hidden;
    flex: 1;
    min-width: 0;
  }

  .file-path {
    font-size: 13px;
    color: #333;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .file-name {
    font-size: 11px;
    color: #666;
  }

  .kind-badge {
    font-size: 10px;
    color: white;
    padding: 2px 6px;
    border-radius: 3px;
    text-transform: uppercase;
    font-weight: 600;
    flex-shrink: 0;
    margin-left: 8px;
  }

  .file-panel-footer {
    padding: 8px 12px;
    border-top: 1px solid #ddd;
    background: #e8e8e8;
    font-size: 12px;
    color: #666;
  }

  /* Resizable Divider */
  .resizable-divider {
    width: 5px;
    background: #ddd;
    cursor: col-resize;
    flex-shrink: 0;
  }

  .resizable-divider:hover {
    background: #007acc;
  }

  /* Right Panel */
  .right-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: white;
  }

  /* Tab Bar */
  .tab-bar {
    display: flex;
    gap: 0;
    background: #f5f5f5;
    border-bottom: 1px solid #ddd;
    padding: 0 12px;
    flex-shrink: 0;
  }

  .tab-button {
    padding: 10px 20px;
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    color: #666;
    transition: all 0.2s ease;
  }

  .tab-button:hover {
    color: #333;
    background: #e8e8e8;
  }

  .tab-button.active {
    color: #007acc;
    border-bottom-color: #007acc;
    background: white;
  }

  .preview-content {
    padding: 20px;
    flex: 1;
    overflow: auto;
  }

  .visual-preview {
    background: #fafafa;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 20px;
    min-height: 400px;
  }

  .source-view {
    background: #1e1e1e;
    border-radius: 8px;
    overflow: auto;
  }

  .source-code {
    margin: 0;
    padding: 16px;
    background: transparent;
    border: none;
    color: #d4d4d4;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 13px;
    line-height: 1.5;
    white-space: pre;
    overflow: visible;
  }

  .empty-selection, .no-preview {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    text-align: center;
    color: #666;
  }

  .empty-selection h2, .no-preview h2 {
    margin-bottom: 12px;
    color: #333;
  }

  /* Loading and Error states */
  .loading-container, .error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    text-align: center;
  }

  .error-message {
    background-color: #ffebee;
    border: 1px solid #f44336;
    border-radius: 8px;
    padding: 20px;
    margin: 20px;
    max-width: 600px;
  }

  .error-message h2 {
    color: #c62828;
    margin-top: 0;
  }

  details {
    margin-top: 16px;
    text-align: left;
  }

  summary {
    cursor: pointer;
    padding: 8px;
    background-color: #f0f0f0;
    border-radius: 4px;
    font-weight: bold;
  }

  pre {
    background-color: #f5f5f5;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 12px;
    overflow-x: auto;
    font-size: 12px;
    text-align: left;
  }
`;

// Export the PreviewApp component
export { PreviewApp };
