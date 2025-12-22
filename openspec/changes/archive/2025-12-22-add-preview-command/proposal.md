# Change: Add `dcf preview` command

## Why
Users need a visual way to preview DCF (Design Concept Format) documents during development. Currently, DCF documents can only be validated and normalized through CLI commands, but there's no way to see how they would render visually. A preview command would enable developers to see live updates as they edit their DCF files, improving the development experience.

## What Changes
- Add a new `dcf preview <path-to-dcf.json>` CLI command
- Implement a local web server that serves a React-based viewer
- Add file watching functionality to automatically refresh the preview when DCF files change
- Include validation and normalization of DCF documents within the preview flow
- Show validation/render errors directly in the UI
- Use Vite for fast development server with hot reload capabilities

**NOT included**: Editing capabilities - this is read-only preview only

## Impact
- Affected specs: `cli-core`, `validation-core`, `normalize-core` (new command integration)
- New capability: `preview-core` for the preview functionality
- New dependencies: React, Vite, chokidar (for file watching)
- New entry points: web-based viewer application