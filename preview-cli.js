#!/usr/bin/env node

import { startPreviewServer } from './lib/preview/preview-server.js';

// Get command line arguments
const args = process.argv.slice(2);

// Extract file path and options
let filePath = null;
const options = {
  port: 3000,
  host: 'localhost',
  open: false
};

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--port' && args[i + 1]) {
    options.port = parseInt(args[i + 1], 10);
    i++; // Skip next argument
  } else if (args[i] === '--host' && args[i + 1]) {
    options.host = args[i + 1];
    i++; // Skip next argument
  } else if (args[i] === '--open') {
    options.open = true;
  } else if (!filePath && !args[i].startsWith('--')) {
    filePath = args[i];
  }
}

if (!filePath) {
  console.error('Usage: dcf-preview <file> [--port <port>] [--host <host>] [--open]');
  process.exit(2);
}

if (isNaN(options.port) || options.port < 1 || options.port > 65535) {
  console.error('Error: Port must be a valid number between 1 and 65535');
  process.exit(2);
}

// Start the preview server
startPreviewServer(filePath, options).catch(error => {
  console.error('Tool error:', error.message);
  process.exit(2);
});