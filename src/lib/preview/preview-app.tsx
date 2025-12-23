import React, { useState, useEffect } from 'react';
import { RenderNodeView } from '../../render/RenderNodeView.js';
import { dcfToRenderTree } from '../../render/dcfToRenderTree.js';

interface DCFData {
  document: any;
  normalized: any;
  validation: any;
  error?: string;
}

const PreviewApp: React.FC = () => {
  const [dcfData, setDcfData] = useState<DCFData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showVisual, setShowVisual] = useState(true); // Toggle between visual and JSON view

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/dcf');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setDcfData(data as DCFData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Set up SSE to get updates when the file changes
    const eventSource = new EventSource('/api/dcf-updates');
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setDcfData(data as DCFData);
      } catch (err) {
        console.error('Error parsing SSE data:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('SSE error:', err);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  if (loading) {
    return (
      <div className="preview-container">
        <h1>DCF Preview</h1>
        <p>Loading DCF document...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="preview-container">
        <h1>DCF Preview - Error</h1>
        <div className="error-message">
          <h2>Error Loading DCF Document</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!dcfData) {
    return (
      <div className="preview-container">
        <h1>DCF Preview</h1>
        <p>No DCF data available</p>
      </div>
    );
  }

  // Check if there are validation errors
  if (dcfData.error) {
    return (
      <div className="preview-container">
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
    );
  }

  // Convert DCF document to render tree for visual representation
  let renderTree = null;
  try {
    renderTree = dcfToRenderTree(dcfData.document);
  } catch (err) {
    console.error('Error converting DCF to render tree:', err);
  }

  return (
    <div className="preview-container">
      <div className="header">
        <h1>DCF Preview</h1>
        <div className="view-toggle">
          <button
            onClick={() => setShowVisual(true)}
            className={showVisual ? 'active' : ''}
          >
            Visual View
          </button>
          <button
            onClick={() => setShowVisual(false)}
            className={!showVisual ? 'active' : ''}
          >
            JSON View
          </button>
        </div>
      </div>

      <div className="dcf-info">
        <h2>Document Information</h2>
        <p><strong>Version:</strong> {dcfData.validation.dcf_version || 'Unknown'}</p>
        <p><strong>Profile:</strong> {dcfData.validation.profile || 'Unknown'}</p>
      </div>

      <div className="dcf-content">
        {showVisual && renderTree ? (
          <div className="visual-preview">
            <h2>Visual Preview</h2>
            <div className="visual-container">
              <RenderNodeView node={renderTree} />
            </div>
          </div>
        ) : (
          <>
            {dcfData.document.tokens && (
              <>
                <h2>Tokens</h2>
                <div className="tokens-preview">
                  {Object.entries(dcfData.document.tokens).map(([name, token]: [string, any]) => (
                    <TokenPreview key={name} name={name} token={token} />
                  ))}
                </div>
              </>
            )}

            {dcfData.document.components && (
              <>
                <h2>Components</h2>
                <div className="components-preview">
                  {Object.entries(dcfData.document.components).map(([name, component]: [string, any]) => (
                    <ComponentPreview key={name} name={name} component={component} />
                  ))}
                </div>
              </>
            )}

            {dcfData.document.layouts && (
              <>
                <h2>Layouts</h2>
                <div className="layouts-preview">
                  {Object.entries(dcfData.document.layouts).map(([name, layout]: [string, any]) => (
                    <LayoutPreview key={name} name={name} layout={layout} />
                  ))}
                </div>
              </>
            )}

            {!dcfData.document.tokens && !dcfData.document.components && !dcfData.document.layouts && (
              <p>No tokens, components, or layouts defined in the DCF document</p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Component to render individual tokens
const TokenPreview: React.FC<{ name: string; token: any }> = ({ name, token }) => {
  if (typeof token === 'object' && token !== null && !Array.isArray(token)) {
    return (
      <div className="token-card">
        <h3>{name}</h3>
        <div className="token-children">
          {Object.entries(token).map(([subName, subToken]) => (
            <TokenPreview key={subName} name={`${name}.${subName}`} token={subToken} />
          ))}
        </div>
      </div>
    );
  } else {
    // For primitive tokens, show them with visual indicators where appropriate
    const isColor = typeof token === 'string' && (token.startsWith('#') || token.startsWith('rgb') || token.startsWith('hsl'));

    return (
      <div className="token-card">
        <h4>{name}: <span className="token-value">{token}</span></h4>
        {isColor && (
          <div className="color-preview" style={{ backgroundColor: token, width: '50px', height: '20px', border: '1px solid #ccc' }}></div>
        )}
      </div>
    );
  }
};

// Component to render individual components
const ComponentPreview: React.FC<{ name: string; component: any }> = ({ name, component }) => {
  return (
    <div className="component-card">
      <h3>{name}</h3>
      <div className="component-properties">
        <details>
          <summary>Properties</summary>
          <pre>{JSON.stringify(component, null, 2)}</pre>
        </details>
      </div>
    </div>
  );
};

// Component to render individual layouts
const LayoutPreview: React.FC<{ name: string; layout: any }> = ({ name, layout }) => {
  return (
    <div className="layout-card">
      <h3>{name}</h3>
      <div className="layout-properties">
        <details>
          <summary>Properties</summary>
          <pre>{JSON.stringify(layout, null, 2)}</pre>
        </details>
      </div>
    </div>
  );
};

// Basic CSS styles
const styles = `
  .preview-container {
    font-family: Arial, sans-serif;
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .view-toggle button {
    margin-right: 10px;
    padding: 8px 16px;
    border: 1px solid #ccc;
    background-color: #f0f0f0;
    cursor: pointer;
  }

  .view-toggle button.active {
    background-color: #007acc;
    color: white;
  }

  .visual-container {
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 20px;
    min-height: 200px;
    background-color: #fafafa;
  }

  .error-message {
    background-color: #ffebee;
    border: 1px solid #f44336;
    border-radius: 4px;
    padding: 16px;
    margin: 16px 0;
  }

  .component-card, .token-card, .layout-card {
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 16px;
    margin: 8px 0;
    background-color: #f9f9f9;
  }

  .components-preview, .tokens-preview, .layouts-preview {
    margin: 16px 0;
  }

  .token-children {
    margin-left: 20px;
    padding-left: 10px;
    border-left: 1px solid #eee;
  }

  .color-preview {
    margin-top: 5px;
  }

  .token-value {
    font-family: monospace;
    background-color: #e8f5e9;
    padding: 2px 4px;
    border-radius: 3px;
  }

  details {
    margin: 8px 0;
  }

  summary {
    cursor: pointer;
    padding: 8px;
    background-color: #f0f0f0;
    border-radius: 3px;
    font-weight: bold;
  }

  pre {
    background-color: #f5f5f5;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 12px;
    overflow-x: auto;
    font-size: 12px;
  }
`;

// Export the PreviewApp component for use in the main entry point
export { PreviewApp };