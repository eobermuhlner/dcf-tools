# preview-core Specification

## Purpose
TBD - created by archiving change add-preview-command. Update Purpose after archive.
## Requirements
### Requirement: Preview Command Implementation

The system SHALL provide a `dcf preview <path-to-dcf.json>` command that starts a local web server to visualize DCF documents.

#### Scenario: Preview command execution
- **WHEN** user runs `dcf preview document.json`
- **THEN** the system starts a local web server
- **AND** opens a browser window to the preview URL
- **AND** displays the DCF document visually
- **AND** exits with code 0

#### Scenario: Preview with custom port
- **WHEN** user runs `dcf preview --port 8080 document.json`
- **THEN** the system starts the server on port 8080
- **AND** serves the preview application
- **AND** exits with code 0

#### Scenario: Preview with host option
- **WHEN** user runs `dcf preview --host 0.0.0.0 document.json`
- **THEN** the system binds the server to the specified host
- **AND** serves the preview application
- **AND** exits with code 0

### Requirement: Real-time File Watching

The system SHALL monitor the DCF file for changes and automatically update the preview.

#### Scenario: File change detection
- **WHEN** the DCF file is modified on disk
- **THEN** the system detects the change
- **AND** revalidates and renormalizes the document
- **AND** updates the preview in real-time
- **AND** maintains the same server session

#### Scenario: Multiple file changes
- **WHEN** the DCF file is modified multiple times rapidly
- **THEN** the system handles the changes efficiently
- **AND** applies debouncing to prevent excessive updates
- **AND** eventually reflects the final state in the preview

### Requirement: Validation and Error Display

The system SHALL validate the DCF document and display validation errors in the web UI.

#### Scenario: Valid DCF preview
- **WHEN** user opens the preview for a valid DCF document
- **THEN** the system displays the document visually
- **AND** shows no validation errors
- **AND** renders all components correctly

#### Scenario: Invalid DCF preview
- **WHEN** user opens the preview for an invalid DCF document
- **THEN** the system displays validation errors in the UI
- **AND** shows a visual indication of the problems
- **AND** continues to watch for file changes to update the preview when fixed

### Requirement: Web-based Visualization

The system SHALL render DCF content using web technologies (HTML/CSS/DOM) to provide a visual representation of the UI design that maps DCF elements to visual elements (containers, text, buttons, layout, padding, margin, borders, etc.) according to the design defined in the DCF file.

#### Scenario: Component visualization with visual rendering
- **WHEN** the preview loads a DCF document with components
- **THEN** the system renders the components as actual visual UI elements based on their type and styles
- **AND** applies DCF tokens and styles to create a visual representation of the component
- **AND** displays the component with appropriate visual properties (colors, spacing, typography, etc.)
- **AND** maintains the hierarchical structure of nested components

#### Scenario: Token visualization with visual application
- **WHEN** the preview loads a DCF document with tokens
- **THEN** the system applies tokens to visual elements (e.g., color tokens to background/border colors)
- **AND** resolves token references in component styles (e.g., `{colors.primary}`)
- **AND** shows visual feedback for token usage in the rendered UI
- **AND** updates visual elements when token values change

#### Scenario: Layout visualization with structural rendering
- **WHEN** the preview loads a DCF document with layouts
- **THEN** the system renders the layout structure visually with proper positioning
- **AND** applies layout properties like display, flexbox, grid, or positioning
- **AND** respects spacing, padding, margin, and other layout-related tokens
- **AND** maintains the relationship between parent and child elements

#### Scenario: Style mapping to CSS properties
- **WHEN** the preview processes component styles from DCF
- **THEN** the system maps DCF style properties to equivalent CSS properties
- **AND** applies visual styling including colors, typography, spacing, borders
- **AND** handles token references within style values
- **AND** renders components with visual fidelity to the DCF design intent

### Requirement: Local Development Server

The system SHALL provide a local development server for preview functionality.

#### Scenario: Server startup
- **WHEN** user runs `dcf preview document.json`
- **THEN** the system starts a local HTTP server
- **AND** serves the React-based preview application
- **AND** provides an API endpoint for DCF document access
- **AND** displays the server URL to the user

#### Scenario: Server shutdown
- **WHEN** user terminates the preview command (Ctrl+C)
- **THEN** the system shuts down the local server gracefully
- **AND** releases all allocated resources
- **AND** exits with code 0

### Requirement: Error Handling

The system SHALL handle errors gracefully during preview operations.

#### Scenario: Missing DCF file
- **WHEN** user runs `dcf preview nonexistent.json`
- **THEN** the system reports an error about the missing file
- **AND** exits with code 2

#### Scenario: Invalid DCF format
- **WHEN** user runs `dcf preview invalid-format.json`
- **THEN** the system reports parsing/validation errors
- **AND** displays errors in both CLI and web UI
- **AND** continues to watch for changes to fix the file
- **AND** exits with code 0 when server is terminated normally

### Requirement: Visual Component Rendering

The system SHALL render DCF components as visual UI elements based on their type and properties.

#### Scenario: Button component rendering
- **WHEN** the preview encounters a component with type "button" in the DCF document
- **THEN** the system renders an actual HTML button element
- **AND** applies the component's styles to the button (background color, text color, padding, etc.)
- **AND** renders the button with visual properties matching the DCF definition

#### Scenario: Container component rendering
- **WHEN** the preview encounters a component with type "div" or other container type in the DCF document
- **THEN** the system renders an appropriate HTML container element
- **AND** applies layout and styling properties from the DCF definition
- **AND** handles nested components within the container

### Requirement: Token Resolution System

The system SHALL resolve token references in DCF styles to their actual values during visual rendering.

#### Scenario: Token reference resolution in styles
- **WHEN** the preview encounters a style value like `{colors.primary}` in component styles
- **THEN** the system resolves the token reference to its actual value from the DCF tokens
- **AND** applies the resolved value to the visual element's CSS
- **AND** updates the visual element when token values change

#### Scenario: Nested token resolution
- **WHEN** the preview encounters nested token references like `{spacing.md}` within other styles
- **THEN** the system resolves all token references recursively
- **AND** applies the final resolved values to the visual elements
- **AND** handles circular token references gracefully

### Requirement: Layout Structure Rendering

The system SHALL render DCF layout structures with proper positioning and relationships.

#### Scenario: Layout children rendering
- **WHEN** the preview encounters a layout with children in the DCF document
- **THEN** the system renders the parent layout element with appropriate CSS layout properties
- **AND** renders child elements in their correct positions within the layout
- **AND** maintains the parent-child relationship visually

#### Scenario: Component reference rendering in layouts
- **WHEN** the preview encounters a layout child that references a component (e.g., `"component": "Button"`)
- **THEN** the system renders the referenced component in the layout position
- **AND** applies any layout-specific overrides to the component
- **AND** maintains the component's visual integrity within the layout context

### Requirement: Multi-Path Input Support
The system SHALL support multiple input path types for the `dcf preview` command.

#### Scenario: Directory input
- **WHEN** user runs `dcf preview screens/`
- **THEN** the system recursively scans the directory for previewable DCF files
- **AND** processes all discovered DCF files (`.yaml`, `.yml`, `.json`)
- **AND** starts the preview with all discovered files

#### Scenario: Glob pattern input
- **WHEN** user runs `dcf preview "design/**/*.yaml"`
- **THEN** the system resolves the glob pattern to matching files
- **AND** processes all matching DCF files
- **AND** starts the preview with all matched files

#### Scenario: Multiple path inputs
- **WHEN** user runs `dcf preview component1.yaml component2.json screens/`
- **THEN** the system processes all specified files and directory contents
- **AND** combines all previewable DCF files into a single preview session

### Requirement: Static Export Mode
The system SHALL support static export mode for generating static HTML/CSS/JS previews.

#### Scenario: Static export execution
- **WHEN** user runs `dcf preview screens/ --static ./preview-dist`
- **THEN** the system processes the input files
- **AND** generates static HTML/CSS/JS previews to the specified output directory
- **AND** exits with code 0 after successful export

#### Scenario: Static export with configuration
- **WHEN** user runs `dcf preview screens/ --static ./preview-dist --theme dark --locale en-US`
- **THEN** the system applies the specified theme and locale
- **AND** generates static previews with the applied configuration

### Requirement: Snapshot Mode
The system SHALL support snapshot mode for generating preview snapshots.

#### Scenario: Snapshot generation
- **WHEN** user runs `dcf preview screens/ --snapshot ./snapshots`
- **THEN** the system processes the input files
- **AND** generates preview snapshots to the specified output directory
- **AND** exits with code 0 after successful snapshot generation

### Requirement: Profile Configuration
The system SHALL support profile configuration for validation and normalization strictness.

#### Scenario: Profile selection
- **WHEN** user runs `dcf preview document.json --profile strict`
- **THEN** the system applies strict validation and normalization rules
- **AND** enforces the selected profile during processing

### Requirement: Capabilities Declaration
The system SHALL support explicit capabilities declaration for expected DCF layers.

#### Scenario: Capabilities specification
- **WHEN** user runs `dcf preview document.json --capabilities tokens,theme,components`
- **THEN** the system expects the specified capabilities
- **AND** validates the DCF document against the declared capabilities

### Requirement: Theme Selection
The system SHALL support theme variant selection for preview rendering.

#### Scenario: Theme application
- **WHEN** user runs `dcf preview components/Button.yaml --theme dark`
- **THEN** the system selects the dark theme variant
- **AND** applies the selected theme to preview rendering

### Requirement: Locale Selection
The system SHALL support i18n locale selection for preview rendering.

#### Scenario: Locale application
- **WHEN** user runs `dcf preview screens/Login.yaml --locale fr-FR`
- **THEN** the system selects the French locale
- **AND** applies the selected locale to preview rendering

### Requirement: Renderer Selection
The system SHALL support renderer backend selection.

#### Scenario: Renderer selection
- **WHEN** user runs `dcf preview document.json --renderer web`
- **THEN** the system uses the web renderer backend
- **AND** defaults to web renderer when not specified

### Requirement: Allow Invalid Option
The system SHALL support previewing even with validation errors when enabled.

#### Scenario: Invalid preview allowed
- **WHEN** user runs `dcf preview invalid.json --allow-invalid`
- **THEN** the system attempts preview despite validation errors
- **AND** displays the preview with error indicators

### Requirement: Quiet Mode
The system SHALL support quiet mode to suppress non-error output.

#### Scenario: Quiet execution
- **WHEN** user runs `dcf preview document.json --quiet`
- **THEN** the system suppresses non-error output
- **AND** only displays errors to stderr

### Requirement: Previewable Kinds Filtering
The system SHALL filter previewable kinds and warn for non-previewable kinds.

#### Scenario: Previewable kind processing
- **WHEN** user runs `dcf preview components/` with component, layout, screen, navigation, or flow files
- **THEN** the system processes these previewable kinds
- **AND** renders them in the preview

#### Scenario: Non-previewable kind warning
- **WHEN** user runs `dcf preview non-previewable.yaml` with non-previewable kind directly
- **THEN** the system issues a warning
- **AND** exits unless `--strict` is enabled

### Requirement: Dependency Resolution
The system SHALL resolve supporting layers automatically based on capabilities.

#### Scenario: Automatic dependency loading
- **WHEN** the system processes a previewable DCF file
- **THEN** it automatically loads supporting layers (tokens, theme, theming, i18n, rules)
- **AND** applies them during normalization

