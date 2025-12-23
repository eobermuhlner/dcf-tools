import React from 'react';
import { createRoot } from 'react-dom/client';
import { PreviewApp } from './preview-app';

// Create root element and render the app
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<PreviewApp />);
} else {
  console.error('Could not find root element');
}