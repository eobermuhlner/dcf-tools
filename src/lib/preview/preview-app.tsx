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
  const [selectedKind, setSelectedKind] = useState<string | null>(null); // For filtering specific DCF kinds

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

    // Set up polling to check for updates (instead of SSE)
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
    }, 5000); // Poll every 5 seconds instead of constant SSE updates

    return () => {
      isCancelled = true;
      if (pollInterval) {
        clearInterval(pollInterval);
      }
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

  // Get available DCF kinds from the document by checking top-level properties
  const availableKinds = [];
  const tokenEntries = [];
  const componentEntries = [];
  const layoutEntries = [];
  const screenEntries = [];
  const navigationEntries = [];
  const flowEntries = [];
  const themeEntries = [];
  const i18nEntries = [];
  const ruleEntries = [];

  // Check for each kind and collect entries
  if (dcfData.document.tokens && typeof dcfData.document.tokens === 'object') {
    availableKinds.push('tokens');
    Object.entries(dcfData.document.tokens).forEach(([key, value]) => {
      tokenEntries.push([key, value]);
    });
  }
  if (dcfData.document.components && typeof dcfData.document.components === 'object') {
    availableKinds.push('components');
    Object.entries(dcfData.document.components).forEach(([key, value]) => {
      componentEntries.push([key, value]);
    });
  }
  if (dcfData.document.layouts && typeof dcfData.document.layouts === 'object') {
    availableKinds.push('layouts');
    Object.entries(dcfData.document.layouts).forEach(([key, value]) => {
      layoutEntries.push([key, value]);
    });
  }
  if (dcfData.document.screens && typeof dcfData.document.screens === 'object') {
    availableKinds.push('screens');
    Object.entries(dcfData.document.screens).forEach(([key, value]) => {
      screenEntries.push([key, value]);
    });
  }
  if (dcfData.document.navigation && typeof dcfData.document.navigation === 'object') {
    availableKinds.push('navigation');
    Object.entries(dcfData.document.navigation).forEach(([key, value]) => {
      navigationEntries.push([key, value]);
    });
  }
  if (dcfData.document.flows && typeof dcfData.document.flows === 'object') {
    availableKinds.push('flows');
    Object.entries(dcfData.document.flows).forEach(([key, value]) => {
      flowEntries.push([key, value]);
    });
  }
  if (dcfData.document.themes && typeof dcfData.document.themes === 'object') {
    availableKinds.push('themes');
    Object.entries(dcfData.document.themes).forEach(([key, value]) => {
      themeEntries.push([key, value]);
    });
  }
  if (dcfData.document.i18n && typeof dcfData.document.i18n === 'object') {
    availableKinds.push('i18n');
    Object.entries(dcfData.document.i18n).forEach(([key, value]) => {
      i18nEntries.push([key, value]);
    });
  }
  if (dcfData.document.rules && typeof dcfData.document.rules === 'object') {
    availableKinds.push('rules');
    Object.entries(dcfData.document.rules).forEach(([key, value]) => {
      ruleEntries.push([key, value]);
    });
  }

  // Convert DCF document to render tree for visual representation
  // Apply filtering based on selected kind for visual view as well
  let filteredDocument = dcfData.document;
  if (selectedKind) {
    // Create a filtered document containing only the selected kind
    filteredDocument = {};
    // Copy over top-level properties
    if (dcfData.document.dcf_version) filteredDocument.dcf_version = dcfData.document.dcf_version;
    if (dcfData.document.profile) filteredDocument.profile = dcfData.document.profile;
    if (dcfData.document.renderer) filteredDocument.renderer = dcfData.document.renderer;

    // Add only the entries of the selected kind
    switch (selectedKind) {
      case 'tokens':
        if (tokenEntries.length > 0) {
          filteredDocument.tokens = {};
          tokenEntries.forEach(([key, value]) => {
            filteredDocument.tokens[key] = value;
          });
        }
        break;
      case 'components':
        if (componentEntries.length > 0) {
          filteredDocument.components = {};
          componentEntries.forEach(([key, value]) => {
            filteredDocument.components[key] = value;
          });
        }
        break;
      case 'layouts':
        if (layoutEntries.length > 0) {
          filteredDocument.layouts = {};
          layoutEntries.forEach(([key, value]) => {
            filteredDocument.layouts[key] = value;
          });
        }
        break;
      case 'screens':
        if (screenEntries.length > 0) {
          filteredDocument.screens = {};
          screenEntries.forEach(([key, value]) => {
            filteredDocument.screens[key] = value;
          });
        }
        break;
      case 'navigation':
        if (navigationEntries.length > 0) {
          filteredDocument.navigation = {};
          navigationEntries.forEach(([key, value]) => {
            filteredDocument.navigation[key] = value;
          });
        }
        break;
      case 'flows':
        if (flowEntries.length > 0) {
          filteredDocument.flows = {};
          flowEntries.forEach(([key, value]) => {
            filteredDocument.flows[key] = value;
          });
        }
        break;
      case 'themes':
        if (themeEntries.length > 0) {
          filteredDocument.themes = {};
          themeEntries.forEach(([key, value]) => {
            filteredDocument.themes[key] = value;
          });
        }
        break;
      case 'i18n':
        if (i18nEntries.length > 0) {
          filteredDocument.i18n = {};
          i18nEntries.forEach(([key, value]) => {
            filteredDocument.i18n[key] = value;
          });
        }
        break;
      case 'rules':
        if (ruleEntries.length > 0) {
          filteredDocument.rules = {};
          ruleEntries.forEach(([key, value]) => {
            filteredDocument.rules[key] = value;
          });
        }
        break;
    }
  }

  let renderTree = null;
  try {
    renderTree = dcfToRenderTree(filteredDocument);
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

        {/* Navigation for different DCF kinds */}
        {availableKinds.length > 0 && (
          <div className="kind-navigation">
            <h3>Available Kinds:</h3>
            {availableKinds.map(kind => (
              <button
                key={kind}
                className={selectedKind === kind ? 'kind-button active' : 'kind-button'}
                onClick={() => setSelectedKind(selectedKind === kind ? null : kind)}
              >
                {kind.charAt(0).toUpperCase() + kind.slice(1)}
              </button>
            ))}
            {availableKinds.length > 0 && (
              <button
                className={!selectedKind ? 'kind-button active' : 'kind-button'}
                onClick={() => setSelectedKind(null)}
              >
                All
              </button>
            )}
          </div>
        )}
      </div>

      <div className="dcf-content">
        {showVisual ? (
          <div className="visual-preview">
            <h2>
              Visual Preview {selectedKind ? `- ${selectedKind.charAt(0).toUpperCase() + selectedKind.slice(1)}` : ''}
            </h2>
            {/* Show token preview when tokens are selected, regardless of renderTree */}
            {selectedKind === 'tokens' && tokenEntries.length > 0 ? (
              <>
                <h3>Tokens Preview</h3>
                <div className="tokens-preview">
                  {tokenEntries.map(([name, tokenData]: [string, any]) => {
                    // Render the actual tokens from the tokenData.tokens property
                    if (tokenData.tokens && typeof tokenData.tokens === 'object') {
                      return Object.entries(tokenData.tokens).map(([tokenName, tokenValue]: [string, any]) => (
                        <TokenPreview key={`${name}-${tokenName}`} name={`${name}: ${tokenName}`} token={tokenValue} />
                      ));
                    }
                    return null;
                  })}
                </div>
              </>
            ) : selectedKind === 'components' && componentEntries.length > 0 ? (
              <>
                <h3>Components Preview</h3>
                <div className="components-preview">
                  {componentEntries.map(([name, componentData]: [string, any]) => {
                    // Render the actual components from the componentData.components property
                    if (componentData.components && typeof componentData.components === 'object') {
                      return Object.entries(componentData.components).map(([componentName, componentValue]: [string, any]) => (
                        <ComponentPreview key={`${name}-${componentName}`} name={`${name}: ${componentName}`} component={componentValue} />
                      ));
                    }
                    return null;
                  })}
                </div>
              </>
            ) : selectedKind === 'layouts' && layoutEntries.length > 0 ? (
              <>
                <h3>Layouts Preview</h3>
                <div className="layouts-preview">
                  {layoutEntries.map(([name, layoutData]: [string, any]) => {
                    // Render the actual layouts from the layoutData.layouts property
                    if (layoutData.layouts && typeof layoutData.layouts === 'object') {
                      return Object.entries(layoutData.layouts).map(([layoutName, layoutValue]: [string, any]) => (
                        <LayoutPreview key={`${name}-${layoutName}`} name={`${name}: ${layoutName}`} layout={layoutValue} />
                      ));
                    }
                    return null;
                  })}
                </div>
              </>
            ) : renderTree && Object.keys(renderTree).length > 0 ? (
              <div className="visual-container">
                <RenderNodeView node={renderTree} />
              </div>
            ) : (
              // Fallback when no specific kind is selected but there's no render tree
              <div className="no-content">
                <p>No visual representation available. Switch to JSON view to see all content.</p>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Show all DCF kinds based on selection */}
            {(!selectedKind || selectedKind === 'tokens') && tokenEntries.length > 0 && (
              <>
                <h2>Tokens</h2>
                <div className="tokens-preview">
                  {tokenEntries.map(([name, tokenData]: [string, any]) => {
                    // Render the actual tokens from the tokenData.tokens property
                    if (tokenData.tokens && typeof tokenData.tokens === 'object') {
                      return Object.entries(tokenData.tokens).map(([tokenName, tokenValue]: [string, any]) => (
                        <TokenPreview key={`${name}-${tokenName}`} name={`${name}: ${tokenName}`} token={tokenValue} />
                      ));
                    }
                    return null;
                  })}
                </div>
              </>
            )}

            {(!selectedKind || selectedKind === 'components') && componentEntries.length > 0 && (
              <>
                <h2>Components</h2>
                <div className="components-preview">
                  {componentEntries.map(([name, componentData]: [string, any]) => {
                    // Render the actual components from the componentData.components property
                    if (componentData.components && typeof componentData.components === 'object') {
                      return Object.entries(componentData.components).map(([componentName, componentValue]: [string, any]) => (
                        <ComponentPreview key={`${name}-${componentName}`} name={`${name}: ${componentName}`} component={componentValue} />
                      ));
                    }
                    return null;
                  })}
                </div>
              </>
            )}

            {(!selectedKind || selectedKind === 'layouts') && layoutEntries.length > 0 && (
              <>
                <h2>Layouts</h2>
                <div className="layouts-preview">
                  {layoutEntries.map(([name, layoutData]: [string, any]) => {
                    // Render the actual layouts from the layoutData.layouts property
                    if (layoutData.layouts && typeof layoutData.layouts === 'object') {
                      return Object.entries(layoutData.layouts).map(([layoutName, layoutValue]: [string, any]) => (
                        <LayoutPreview key={`${name}-${layoutName}`} name={`${name}: ${layoutName}`} layout={layoutValue} />
                      ));
                    }
                    return null;
                  })}
                </div>
              </>
            )}

            {(!selectedKind || selectedKind === 'screens') && dcfData.document.screens && Object.keys(dcfData.document.screens).length > 0 && (
              <>
                <h2>Screens</h2>
                <div className="screens-preview">
                  {Object.entries(dcfData.document.screens).map(([name, screen]: [string, any]) => (
                    <ScreenPreview key={name} name={name} screen={screen} />
                  ))}
                </div>
              </>
            )}

            {(!selectedKind || selectedKind === 'navigation') && dcfData.document.navigation && Object.keys(dcfData.document.navigation).length > 0 && (
              <>
                <h2>Navigation</h2>
                <div className="navigation-preview">
                  {Object.entries(dcfData.document.navigation).map(([name, nav]: [string, any]) => (
                    <NavigationPreview key={name} name={name} nav={nav} />
                  ))}
                </div>
              </>
            )}

            {(!selectedKind || selectedKind === 'flows') && dcfData.document.flows && Object.keys(dcfData.document.flows).length > 0 && (
              <>
                <h2>Flows</h2>
                <div className="flows-preview">
                  {Object.entries(dcfData.document.flows).map(([name, flow]: [string, any]) => (
                    <FlowPreview key={name} name={name} flow={flow} />
                  ))}
                </div>
              </>
            )}

            {(!selectedKind || selectedKind === 'themes') && dcfData.document.themes && Object.keys(dcfData.document.themes).length > 0 && (
              <>
                <h2>Themes</h2>
                <div className="themes-preview">
                  {Object.entries(dcfData.document.themes).map(([name, theme]: [string, any]) => (
                    <ThemePreview key={name} name={name} theme={theme} />
                  ))}
                </div>
              </>
            )}

            {(!selectedKind || selectedKind === 'i18n') && dcfData.document.i18n && Object.keys(dcfData.document.i18n).length > 0 && (
              <>
                <h2>Internationalization</h2>
                <div className="i18n-preview">
                  {Object.entries(dcfData.document.i18n).map(([name, i18n]: [string, any]) => (
                    <I18nPreview key={name} name={name} i18n={i18n} />
                  ))}
                </div>
              </>
            )}

            {(!selectedKind || selectedKind === 'rules') && dcfData.document.rules && Object.keys(dcfData.document.rules).length > 0 && (
              <>
                <h2>Rules</h2>
                <div className="rules-preview">
                  {Object.entries(dcfData.document.rules).map(([name, rules]: [string, any]) => (
                    <RulesPreview key={name} name={name} rules={rules} />
                  ))}
                </div>
              </>
            )}

            {availableKinds.length === 0 && (
              <p>No DCF content defined in the document</p>
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

// Component to render individual screens
const ScreenPreview: React.FC<{ name: string; screen: any }> = ({ name, screen }) => {
  return (
    <div className="screen-card">
      <h3>{name}</h3>
      <div className="screen-properties">
        <details>
          <summary>Properties</summary>
          <pre>{JSON.stringify(screen, null, 2)}</pre>
        </details>
      </div>
    </div>
  );
};

// Component to render individual navigation structures
const NavigationPreview: React.FC<{ name: string; nav: any }> = ({ name, nav }) => {
  return (
    <div className="navigation-card">
      <h3>{name}</h3>
      <div className="navigation-properties">
        <details>
          <summary>Properties</summary>
          <pre>{JSON.stringify(nav, null, 2)}</pre>
        </details>
      </div>
    </div>
  );
};

// Component to render individual flow definitions
const FlowPreview: React.FC<{ name: string; flow: any }> = ({ name, flow }) => {
  return (
    <div className="flow-card">
      <h3>{name}</h3>
      <div className="flow-properties">
        <details>
          <summary>Properties</summary>
          <pre>{JSON.stringify(flow, null, 2)}</pre>
        </details>
      </div>
    </div>
  );
};

// Component to render individual theme definitions
const ThemePreview: React.FC<{ name: string; theme: any }> = ({ name, theme }) => {
  return (
    <div className="theme-card">
      <h3>{name}</h3>
      <div className="theme-properties">
        <details>
          <summary>Properties</summary>
          <pre>{JSON.stringify(theme, null, 2)}</pre>
        </details>
      </div>
    </div>
  );
};

// Component to render individual i18n definitions
const I18nPreview: React.FC<{ name: string; i18n: any }> = ({ name, i18n }) => {
  return (
    <div className="i18n-card">
      <h3>{name}</h3>
      <div className="i18n-properties">
        <details>
          <summary>Properties</summary>
          <pre>{JSON.stringify(i18n, null, 2)}</pre>
        </details>
      </div>
    </div>
  );
};

// Component to render individual rules definitions
const RulesPreview: React.FC<{ name: string; rules: any }> = ({ name, rules }) => {
  return (
    <div className="rules-card">
      <h3>{name}</h3>
      <div className="rules-properties">
        <details>
          <summary>Properties</summary>
          <pre>{JSON.stringify(rules, null, 2)}</pre>
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

  .kind-navigation {
    margin-top: 10px;
  }

  .kind-navigation h3 {
    margin-bottom: 8px;
  }

  .kind-button {
    margin-right: 8px;
    margin-bottom: 8px;
    padding: 6px 12px;
    border: 1px solid #ccc;
    background-color: #f0f0f0;
    cursor: pointer;
    border-radius: 4px;
  }

  .kind-button.active {
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

  .component-card, .token-card, .layout-card, .screen-card, .navigation-card, .flow-card, .theme-card, .i18n-card, .rules-card {
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 16px;
    margin: 8px 0;
    background-color: #f9f9f9;
  }

  .components-preview, .tokens-preview, .layouts-preview, .screens-preview, .navigation-preview, .flows-preview, .themes-preview, .i18n-preview, .rules-preview {
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

  .no-content {
    padding: 20px;
    text-align: center;
    color: #666;
    font-style: italic;
  }
`;

// Export the PreviewApp component for use in the main entry point
export { PreviewApp };