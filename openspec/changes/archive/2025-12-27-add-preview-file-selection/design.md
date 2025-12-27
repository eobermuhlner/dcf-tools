## Context

The `dcf preview` command currently discovers and loads multiple DCF files, merges them into a combined document, and serves them via an Express server with a React-based preview UI. Users have no visibility into which files were loaded or ability to focus on specific files.

The preview needs to support two-panel layout:
- **Left panel**: File tree showing all loaded DCF files with selection controls
- **Right panel**: Visual preview that shows only elements from selected files

Key constraint: Token resolution and component references must work across all loaded files, even when only a subset of files is selected for preview. This means the full document context must be available during rendering.

## Goals / Non-Goals

### Goals
- Users can see all loaded DCF files in a left panel
- Users can select single or multiple files to preview
- Preview renders only elements from selected files
- Cross-file references (tokens, components) still resolve correctly
- File selection state persists during the session

### Non-Goals
- File editing from the preview UI
- File system operations (create, delete, rename)
- Drag-and-drop reordering
- Persistent selection across sessions
- Grouping files by kind (simple flat list is sufficient for v1)

## Decisions

### Decision: API Structure for File Metadata

The `/api/dcf` endpoint will be extended to include:
```typescript
interface DCFData {
  document: any;           // Existing: combined document
  normalized: any;         // Existing: normalized document
  validation: any;         // Existing: validation results
  error?: string;          // Existing: error message
  files: FileInfo[];       // NEW: list of loaded files
}

interface FileInfo {
  path: string;            // Absolute file path
  relativePath: string;    // Relative to working directory
  kind: string | null;     // Detected DCF kind (tokens, component, etc.)
  name: string | null;     // DCF name property if present
  elements: string[];      // List of element keys in this file
}
```

**Rationale**: Including element keys allows the UI to map which elements belong to which files without parsing the document client-side.

### Decision: Selection State Management

Selection state will be managed client-side in React using `useState`:
- `selectedFiles: Set<string>` - Set of selected file paths
- Default: All files selected on load

**Rationale**: Client-side state is simpler and avoids server roundtrips. Selection is transient and doesn't need persistence.

### Decision: Filtering Strategy

When files are selected:
1. The full document is always loaded (for token/reference resolution)
2. Filtering happens at render time by matching elements to their source files
3. The `dcfToRenderTree` function receives a `filterToFiles` option

**Alternatives considered**:
- Server-side filtering: Rejected - would require re-requesting data on every selection change
- Separate filtered endpoint: Rejected - adds complexity without benefit

### Decision: UI Layout

Two-panel resizable layout using CSS flexbox:
- Left panel: 250px default width, collapsible
- Right panel: Flexible width, contains existing preview
- Simple CSS implementation without external libraries

**Rationale**: Keeps dependencies minimal and maintains simplicity.

## Risks / Trade-offs

### Risk: Performance with Many Files
- **Concern**: If hundreds of files are loaded, the file list could be slow
- **Mitigation**: Use virtualization only if needed (defer until actual performance issues)

### Risk: Complex Element-to-File Mapping
- **Concern**: Determining which file an element came from after merging
- **Mitigation**: Track source file during `loadDCFData` and include in returned structure

## Migration Plan

No migration needed - this is an additive feature. The existing preview UI continues to work; the file panel is added as new functionality.

## Open Questions

None - the scope is clear and the implementation approach is straightforward.
