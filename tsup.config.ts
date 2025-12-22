import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/cli.ts'],
    outDir: 'dist',
    format: ['cjs'],
    splitting: false,
    sourcemap: true,
    clean: true, // Clean first, then build lib
    dts: false,
    banner: {
      js: '#!/usr/bin/env node',
    },
    outExtension() {
      return { js: '.js' };
    },
    external: ['vite', 'express', 'chokidar', 'open'], // Exclude heavy dependencies from CLI bundle
  },
  {
    entry: ['src/lib/index.ts'],
    outDir: 'dist/lib',
    format: ['esm', 'cjs'],
    splitting: false,
    sourcemap: true,
    clean: false, // Don't clean to preserve cli files
    dts: true,
    outExtension() {
      return { js: '.js' };
    },
    external: ['vite', 'express', 'chokidar', 'open'], // Exclude heavy dependencies from lib bundle
  }
]);