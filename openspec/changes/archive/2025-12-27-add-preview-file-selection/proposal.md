# Change: Add File Selection Panel to Preview Command

## Why

The current `dcf preview` command loads multiple DCF files and merges them into a single document, but users cannot see which files were loaded or selectively preview specific files. This makes it difficult to:
- Understand which files contribute to the preview
- Focus on specific components, screens, or layouts without seeing everything
- Debug issues with individual files

Adding a file selection panel will give users control over what they see in the preview while still resolving all cross-file references.

## What Changes

- **Left Panel**: Display a tree/list of all loaded DCF files with checkboxes for selection
  - Support single-selection mode (click to select one file)
  - Support multi-selection mode (Ctrl/Cmd+click or checkboxes to select multiple files)
  - Show file path and detected DCF kind (tokens, component, layout, screen, etc.)
- **Right Panel**: Show visual preview of only the selected files' elements
  - Resolve all token/component references against the full loaded document set
  - Render only elements defined in the selected files
  - Update preview reactively when selection changes
- **API Changes**: Extend `/api/dcf` endpoint to include file metadata
  - Return list of loaded files with paths and kinds
  - Support query parameter for filtering by selected files

## Impact

- Affected specs: `preview-core`
- Affected code:
  - `src/lib/preview/preview-app.tsx` - UI changes for file panel and selection
  - `src/lib/preview/preview-server.ts` - API extension for file metadata
  - `src/render/dcfToRenderTree.ts` - Support for selective rendering
