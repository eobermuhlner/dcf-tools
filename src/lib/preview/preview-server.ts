import express from 'express';
import { createServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import chokidar from 'chokidar';

// Dynamic import for CommonJS module
async function openBrowser(url: string) {
  const open = (await import('open')).default;
  return open(url);
}

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

  // Serve the preview app with React integration
  app.get("/", async (req, res, next) => {
    try {
      const template = await vite.transformIndexHtml(req.url, `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
          <title>DCF Visual Preview</title>
        </head>
        <body>
          <div id="root"></div>
          <script type="module" src="/src/lib/preview/index.tsx"></script>
        </body>
        </html>
      `);
      res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    } catch (error) {
      // Fall back to the Vite middleware if transformation fails
      vite.middlewares(req, res, next);
    }
  });

  // Start the server
  const server = app.listen({ port, host }, () => {
    const url = `http://${host}:${port}`;
    console.log(`DCF Preview server running on ${url}`);
    console.log(`Previewing file: ${absoluteDCFPath}`);

    if (shouldOpen) {
      openBrowser(url).catch(err => {
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