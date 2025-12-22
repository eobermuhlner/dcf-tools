## Context
The `dcf preview` command will provide a visual preview of DCF documents in a web browser. This requires creating a local development server that watches for file changes and updates the preview in real-time. The system needs to integrate validation and normalization functionality from existing modules while providing a React-based UI for visualization.

## Goals / Non-Goals
- Goals:
  - Provide real-time preview of DCF documents in a web browser
  - Automatically refresh preview when DCF files change
  - Show validation errors directly in the UI
  - Reuse existing validation and normalization logic
  - Fast startup and hot reload capabilities
- Non-Goals:
  - Editing capabilities (read-only preview only)
  - Complex 3D rendering or WebGL features
  - Offline schema validation (will use embedded schemas)
  - Multi-file project composition in preview (focus on single file initially)

## Decisions
- Decision: Use Vite for the development server because it provides fast hot reload capabilities and is well-suited for React applications
  - Rationale: Vite has excellent development experience with fast refresh and is the modern standard for React development
- Decision: Implement file watching with chokidar for cross-platform file system monitoring
  - Rationale: chokidar is the most reliable and cross-platform file watching library for Node.js
- Decision: Create a separate `preview-core` capability to encapsulate preview-specific logic
  - Rationale: Separation of concerns - preview functionality is distinct from validation/normalization
- Decision: Use embedded DCF schemas rather than fetching from remote URLs during preview
  - Rationale: Faster startup and offline capability for the preview feature
- Decision: Render DCF content using DOM elements rather than Canvas/WebGL for MVP
  - Rationale: DOM-based rendering is simpler and sufficient for initial preview requirements

## Risks / Trade-offs
- Risk: Large DCF files might cause performance issues in the browser
  - Mitigation: Implement virtualization for large component lists
- Risk: Complex DCF structures might not render well in simple HTML/CSS
  - Mitigation: Provide fallback rendering and error handling
- Trade-off: Adding web server dependencies increases project complexity
  - Balance: Improved UX justifies the additional complexity for the preview feature

## Architecture Overview
```
CLI Command (dcf preview) 
    ↓
Preview Server (Vite + Express-like API)
    ↓
File Watcher (chokidar)
    ↓
DCF Document Loader → Validation → Normalization → Internal Model
    ↓
API Endpoint (/api/dcf) serves current document + errors
    ↓
React Viewer (fetches from API, renders DCF content)
```

## Dependencies
- Runtime: React, Vite, chokidar, ajv (for validation)
- Will be added to package.json during implementation

## Open Questions
- Should the preview support multi-file DCF projects or just single files initially?
- How should we handle different DCF profiles (lite, guidelines, standard, strict) in the preview?
- What is the expected behavior when the DCF file is temporarily invalid during editing?