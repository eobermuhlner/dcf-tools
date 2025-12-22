import express from 'express';
import { createServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import open from 'open';
import chokidar from 'chokidar';

// Define TypeScript types
interface PreviewOptions {
  port: number;
  host: string;
  open: boolean;
}

interface DCFPreviewData {
  document: any;
  normalized: any;
  validation: any;
  error?: string;
}

export async function startPreviewServer(dcfFilePath: string, options: PreviewOptions): Promise<void> {
  const { port, host, open: shouldOpen } = options;

  // Resolve the DCF file path to absolute path
  const absoluteDCFPath = path.resolve(dcfFilePath);

  // Create Express app for API endpoints
  const app = express();

  // Middleware to handle CORS for development
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });

  // Store the current DCF data
  let currentData: DCFPreviewData | null = null;

  // Store connected clients for SSE
  const clients: any[] = [];

  // Function to load and process the DCF file with basic validation
  async function loadDCFData(): Promise<DCFPreviewData> {
    try {
      // Read file directly using Node.js fs module
      const fs = await import('fs');
      const pathModule = await import('path');
      const yaml = (await import('js-yaml')).default;

      const fileContent = fs.readFileSync(absoluteDCFPath, 'utf-8');
      const ext = pathModule.extname(absoluteDCFPath).toLowerCase();

      let content;
      if (ext === '.json') {
        content = JSON.parse(fileContent);
      } else if (ext === '.yaml' || ext === '.yml') {
        content = yaml.load(fileContent);
      } else {
        content = JSON.parse(fileContent); // Default to JSON
      }

      // Basic validation without complex schema validation
      let validation = {
        ok: true,
        dcf_version: content.dcf_version || undefined,
        profile: content.profile || 'standard',
        errors: [],
        warnings: []
      };

      // Check for required fields
      if (!content.dcf_version) {
        validation.ok = false;
        validation.errors.push({
          code: 'E_SCHEMA',
          message: 'Missing required field: dcf_version',
          path: ''
        });
      }

      if (!validation.ok) {
        return {
          document: content,
          normalized: null,
          validation,
          error: `Validation errors: ${validation.errors.map(e => e.message).join('; ')}`
        };
      }

      // For normalization, just return the content for now
      const normalized = content;

      return {
        document: content,
        normalized,
        validation,
        error: undefined
      };
    } catch (error) {
      return {
        document: null,
        normalized: null,
        validation: { ok: false, errors: [], warnings: [] },
        error: error instanceof Error ? error.message : 'Unknown error loading DCF file'
      };
    }
  }

  // Initial load
  currentData = await loadDCFData();

  // Set up file watcher
  const watcher = chokidar.watch(absoluteDCFPath, {
    persistent: true,
    ignoreInitial: true
  });

  watcher.on('change', async (filePath) => {
    console.log(`File changed: ${filePath}`);
    currentData = await loadDCFData();

    // Notify all connected clients
    clients.forEach(client => {
      client.res.write(`data: ${JSON.stringify(currentData)}\n\n`);
    });
  });

  // API endpoint to get current DCF data
  app.get('/api/dcf', (req, res) => {
    res.json(currentData);
  });

  // SSE endpoint for real-time updates
  app.get('/api/dcf-updates', (req, res) => {
    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Add client to the list
    const clientId = Date.now();
    const newClient = {
      id: clientId,
      res
    };
    clients.push(newClient);

    // Send initial data
    res.write(`data: ${JSON.stringify(currentData)}\n\n`);

    // Remove client when connection is closed
    req.on('close', () => {
      console.log(`${clientId} Connection closed`);
      const index = clients.findIndex(client => client.id === clientId);
      if (index > -1) {
        clients.splice(index, 1);
      }
    });
  });

  // Create Vite server in middleware mode
  // Use the project root directory instead of current working directory
  // Find project root by looking for package.json
  let currentDir = process.cwd();
  // Walk up the directory tree to find package.json
  while (currentDir !== path.dirname(currentDir)) {
    if (fs.existsSync(path.join(currentDir, 'package.json'))) {
      break;
    }
    currentDir = path.dirname(currentDir);
  }
  const projectRoot = currentDir;
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
    root: projectRoot,
    resolve: {
      alias: {
        '@': path.resolve(projectRoot, 'src'),
      },
    },
  });

  app.use(vite.middlewares);

  // Serve the preview app
  app.get('/', async (req, res) => {
    try {
      // Render a simple HTML page that fetches and displays DCF data
      const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DCF Preview</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
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
      display: inline-block;
      width: 50px;
      height: 20px;
      border: 1px solid #ccc;
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
  </style>
</head>
<body>
  <h1>DCF Preview</h1>
  <div id="content">Loading DCF document...</div>
  <script>
    // Function to render tokens recursively
    function renderTokens(tokens, parentElement) {
      if (!tokens) return;

      const container = document.createElement('div');
      container.className = 'tokens-preview';

      for (const [name, token] of Object.entries(tokens)) {
        const tokenElement = document.createElement('div');
        tokenElement.className = 'token-card';

        if (typeof token === 'object' && token !== null && !Array.isArray(token)) {
          tokenElement.innerHTML = \`<h3>\${name}</h3>\`;
          const childrenContainer = document.createElement('div');
          childrenContainer.className = 'token-children';
          renderTokens(token, childrenContainer);
          tokenElement.appendChild(childrenContainer);
        } else {
          // For primitive tokens, show them with visual indicators where appropriate
          const isColor = typeof token === 'string' && (token.startsWith('#') || token.startsWith('rgb') || token.startsWith('hsl'));
          tokenElement.innerHTML = \`<h4>\${name}: <span class="token-value">\${token}</span>\${isColor ? '<div class="color-preview" style="background-color: ' + token + ';"></div>' : ''}</h4>\`;
        }

        container.appendChild(tokenElement);
      }

      parentElement.appendChild(container);
    }

    // Function to render components
    function renderComponents(components, parentElement) {
      if (!components) return;

      const container = document.createElement('div');
      container.className = 'components-preview';

      const heading = document.createElement('h2');
      heading.textContent = 'Components';
      container.appendChild(heading);

      for (const [name, component] of Object.entries(components)) {
        const componentElement = document.createElement('div');
        componentElement.className = 'component-card';
        componentElement.innerHTML = \`<h3>\${name}</h3><details><summary>Properties</summary><pre>\${JSON.stringify(component, null, 2)}</pre></details>\`;
        container.appendChild(componentElement);
      }

      parentElement.appendChild(container);
    }

    // Function to render layouts
    function renderLayouts(layouts, parentElement) {
      if (!layouts) return;

      const container = document.createElement('div');
      container.className = 'layouts-preview';

      const heading = document.createElement('h2');
      heading.textContent = 'Layouts';
      container.appendChild(heading);

      for (const [name, layout] of Object.entries(layouts)) {
        const layoutElement = document.createElement('div');
        layoutElement.className = 'layout-card';
        layoutElement.innerHTML = \`<h3>\${name}</h3><details><summary>Properties</summary><pre>\${JSON.stringify(layout, null, 2)}</pre></details>\`;
        container.appendChild(layoutElement);
      }

      parentElement.appendChild(container);
    }

    // Function to render document information
    function renderDocumentInfo(validation, parentElement) {
      if (!validation) return;

      const infoContainer = document.createElement('div');
      infoContainer.className = 'dcf-info';

      const heading = document.createElement('h2');
      heading.textContent = 'Document Information';
      infoContainer.appendChild(heading);

      const versionP = document.createElement('p');
      versionP.innerHTML = '<strong>Version:</strong> ' + (validation.dcf_version || 'Unknown');
      infoContainer.appendChild(versionP);

      const profileP = document.createElement('p');
      profileP.innerHTML = '<strong>Profile:</strong> ' + (validation.profile || 'Unknown');
      infoContainer.appendChild(profileP);

      parentElement.appendChild(infoContainer);
    }

    // Function to render the DCF data
    function renderDCFData(data) {
      const contentDiv = document.getElementById('content');

      if (data.error) {
        contentDiv.innerHTML = '<h1>DCF Preview - Validation Error</h1>' +
          '<div class="error-message">' +
            '<h2>Validation Error</h2>' +
            '<p>' + data.error + '</p>' +
            '<details>' +
              '<summary>Validation Details</summary>' +
              '<pre>' + JSON.stringify(data.validation, null, 2) + '</pre>' +
            '</details>' +
          '</div>';
        return;
      }

      contentDiv.innerHTML = '<h1>DCF Preview</h1>';

      // Render document info
      renderDocumentInfo(data.validation, contentDiv);

      // Render tokens
      if (data.document && data.document.tokens) {
        const tokensHeading = document.createElement('h2');
        tokensHeading.textContent = 'Tokens';
        contentDiv.appendChild(tokensHeading);
        renderTokens(data.document.tokens, contentDiv);
      }

      // Render components
      if (data.document && data.document.components) {
        renderComponents(data.document.components, contentDiv);
      }

      // Render layouts
      if (data.document && data.document.layouts) {
        renderLayouts(data.document.layouts, contentDiv);
      }

      // No content message
      if (!data.document || (!data.document.tokens && !data.document.components && !data.document.layouts)) {
        const noContentP = document.createElement('p');
        noContentP.textContent = 'No tokens, components, or layouts defined in the DCF document';
        contentDiv.appendChild(noContentP);
      }
    }

    // Fetch DCF data and render
    async function loadDCFData() {
      try {
        const response = await fetch('/api/dcf');
        if (!response.ok) {
          throw new Error(\`HTTP error! status: \${response.status}\`);
        }
        const data = await response.json();
        renderDCFData(data);
      } catch (err) {
        const contentDiv = document.getElementById('content');
        contentDiv.innerHTML = '<h1>DCF Preview - Error</h1>' +
          '<div class="error-message">' +
            '<h2>Error Loading DCF Document</h2>' +
            '<p>' + (err.message || 'An unknown error occurred') + '</p>' +
          '</div>';
      }
    }

    // Set up SSE for real-time updates
    function setupSSE() {
      const eventSource = new EventSource('/api/dcf-updates');
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          renderDCFData(data);
        } catch (err) {
          console.error('Error parsing SSE data:', err);
        }
      };

      eventSource.onerror = (err) => {
        console.error('SSE error:', err);
      };
    }

    // Load initial data and set up updates
    loadDCFData().then(() => {
      setupSSE();
    });
  </script>
</body>
</html>
      `;
      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (error) {
      res.status(500).send(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  // Start the server
  const server = app.listen({ port, host }, () => {
    const url = `http://${host}:${port}`;
    console.log(`DCF Preview server running on ${url}`);
    console.log(`Previewing file: ${absoluteDCFPath}`);

    if (shouldOpen) {
      open(url).catch(err => {
        console.error('Failed to open browser:', err);
      });
    }

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\nShutting down preview server...');
      watcher.close();
      server.close(() => {
        console.log('Server closed.');
        process.exit(0);
      });

      // Force exit after 5 seconds if server doesn't close
      setTimeout(() => {
        console.error('Server failed to close in time, forcing exit');
        process.exit(1);
      }, 5000);
    });
  });
}