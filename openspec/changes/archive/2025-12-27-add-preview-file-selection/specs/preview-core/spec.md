## ADDED Requirements

### Requirement: File Selection Panel

The system SHALL display a left panel showing all loaded DCF files with selection controls in the preview UI.

#### Scenario: File list display
- **WHEN** the preview loads DCF files from a directory or glob pattern
- **THEN** the left panel displays a list of all discovered files
- **AND** each file shows its relative path
- **AND** each file shows its detected DCF kind (tokens, component, layout, screen, navigation, flow, theme, i18n, rules)
- **AND** each file shows its name property if present

#### Scenario: Single file selection
- **WHEN** user clicks on a file in the file list
- **THEN** that file becomes the only selected file
- **AND** the preview updates to show only elements from that file
- **AND** the file is visually highlighted as selected

#### Scenario: Multi-file selection with modifier key
- **WHEN** user Ctrl+clicks (or Cmd+click on macOS) on a file
- **THEN** that file is added to or removed from the current selection
- **AND** the preview updates to show elements from all selected files
- **AND** all selected files are visually highlighted

#### Scenario: Multi-file selection with shift key
- **WHEN** user Shift+clicks on a file
- **THEN** all files between the last selected file and the clicked file are selected
- **AND** the preview updates to show elements from all selected files

#### Scenario: Select all files
- **WHEN** user clicks a "Select All" button or uses Ctrl+A
- **THEN** all files become selected
- **AND** the preview shows elements from all files

#### Scenario: Deselect all files
- **WHEN** user clicks a "Deselect All" button
- **THEN** no files are selected
- **AND** the preview shows an empty state message

### Requirement: Selective Preview Rendering

The system SHALL render only elements from selected files while resolving all cross-file references.

#### Scenario: Token resolution with partial selection
- **WHEN** user selects a component file that references tokens
- **AND** the tokens file is not selected
- **THEN** the component renders with token values resolved from the unselected tokens file
- **AND** the tokens themselves are not displayed in the preview

#### Scenario: Component rendering from selected files
- **WHEN** user selects multiple component files
- **THEN** only components defined in those files are rendered
- **AND** components from unselected files are not rendered
- **AND** styles and layouts are applied correctly

#### Scenario: Screen rendering with component references
- **WHEN** user selects a screen file that references components
- **AND** the component file is not selected
- **THEN** the screen renders with components resolved from the unselected file
- **AND** the standalone component definitions are not rendered separately

#### Scenario: Empty selection state
- **WHEN** no files are selected
- **THEN** the preview displays a message indicating no files are selected
- **AND** suggests selecting files from the left panel

### Requirement: File Metadata API

The system SHALL expose file metadata through the `/api/dcf` endpoint.

#### Scenario: File list in API response
- **WHEN** client fetches `/api/dcf`
- **THEN** the response includes a `files` array
- **AND** each file entry contains `path`, `relativePath`, `kind`, `name`, and `elements` properties
- **AND** file paths are absolute
- **AND** relative paths are relative to the working directory

#### Scenario: Element mapping in file metadata
- **WHEN** a DCF file contains named elements (components, screens, layouts, etc.)
- **THEN** the file entry's `elements` array lists all element keys from that file
- **AND** element keys are in dot-notation format (e.g., "components.Button", "screens.Login")

### Requirement: Panel Layout

The system SHALL display the preview UI in a two-panel resizable layout.

#### Scenario: Default panel layout
- **WHEN** the preview UI loads
- **THEN** the left panel displays at 250px width
- **AND** the right panel fills the remaining width
- **AND** panels are separated by a visible divider

#### Scenario: Panel resizing
- **WHEN** user drags the divider between panels
- **THEN** the left panel width adjusts to the new position
- **AND** the right panel width adjusts accordingly
- **AND** minimum panel widths are enforced (left: 150px, right: 300px)

#### Scenario: Panel collapse
- **WHEN** user clicks a collapse button on the left panel
- **THEN** the left panel collapses to show only the collapse/expand button
- **AND** the right panel expands to fill the available width
- **AND** clicking the button again restores the left panel

### Requirement: Selection Persistence During Session

The system SHALL maintain file selection state during the preview session.

#### Scenario: Selection persists on file reload
- **WHEN** a file changes and triggers a reload
- **THEN** the current file selection is preserved
- **AND** the preview updates with the new content for selected files

#### Scenario: Selection adapts to file changes
- **WHEN** a selected file is deleted from disk
- **THEN** it is removed from the file list and selection
- **AND** the preview updates to reflect remaining selected files

#### Scenario: New file selection
- **WHEN** a new file is added to the watched directory
- **THEN** it appears in the file list
- **AND** it is not automatically selected
- **AND** existing selection is preserved
