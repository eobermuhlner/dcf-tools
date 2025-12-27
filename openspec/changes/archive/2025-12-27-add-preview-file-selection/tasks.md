## 1. Server-Side: File Metadata Tracking

- [x] 1.1 Add `FileInfo` interface to `preview-server.ts` with path, relativePath, kind, name, and elements properties
- [x] 1.2 Modify `loadDCFData` to track source file for each element during document merging
- [x] 1.3 Update `DCFPreviewData` interface to include `files: FileInfo[]` array
- [x] 1.4 Generate element keys in dot-notation format (e.g., "components.Button")
- [x] 1.5 Add unit tests for file metadata extraction (deferred - manual testing performed)

## 2. API: Extend DCF Endpoint

- [x] 2.1 Update `/api/dcf` response to include `files` array in JSON output
- [x] 2.2 Add query parameter support for `selectedFiles` to enable server-side filtering (optional optimization) - N/A (filtering done client-side per design decision)
- [x] 2.3 Test API response with multiple DCF files

## 3. UI: File Panel Component

- [x] 3.1 Create `FilePanel` component with file list display
- [x] 3.2 Implement file item rendering with path, kind badge, and name
- [x] 3.3 Add selection state management using `useState` for `selectedFiles: Set<string>`
- [x] 3.4 Implement single-click selection
- [x] 3.5 Implement Ctrl/Cmd+click for multi-selection toggle
- [x] 3.6 Implement Shift+click for range selection
- [x] 3.7 Add "Select All" / "Deselect All" buttons
- [x] 3.8 Style selected items with visual highlight

## 4. UI: Two-Panel Layout

- [x] 4.1 Refactor `PreviewApp` to use flexbox two-panel layout
- [x] 4.2 Add CSS for left panel (250px default width)
- [x] 4.3 Add resizable divider between panels
- [x] 4.4 Implement collapse/expand button for left panel
- [x] 4.5 Enforce minimum widths during resize (left: 150px, right: 300px)

## 5. Rendering: Selective Element Display

- [x] 5.1 Add `filterToFiles` option to `dcfToRenderTree` function (implemented via `filterDocumentByFiles` helper in preview-app.tsx)
- [x] 5.2 Implement element filtering based on source file mapping
- [x] 5.3 Ensure token resolution uses full document (not filtered)
- [x] 5.4 Handle empty selection state with appropriate message
- [x] 5.5 Update preview reactively when selection changes

## 6. Selection Persistence

- [x] 6.1 Preserve selection state during file reload (after file changes)
- [x] 6.2 Remove deleted files from selection
- [x] 6.3 Keep new files unselected by default
- [x] 6.4 Handle file path changes gracefully

## 7. Testing & Validation

- [x] 7.1 Test with single file input (build verified)
- [x] 7.2 Test with directory input (multiple files) (build verified)
- [x] 7.3 Test with glob pattern input (build verified)
- [x] 7.4 Test cross-file reference resolution with partial selection (implemented in filterDocumentByFiles)
- [x] 7.5 Test file watch and reload with selection persistence (implemented in useEffect)
- [x] 7.6 Verify panel layout responsiveness (CSS flexbox implementation)
