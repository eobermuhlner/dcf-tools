## ADDED Requirements
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

The system SHALL render DCF content using web technologies (HTML/CSS/DOM).

#### Scenario: Component visualization
- **WHEN** the preview loads a DCF document with components
- **THEN** the system renders the components visually using HTML/CSS
- **AND** displays component properties and structure
- **AND** provides a user-friendly visual representation

#### Scenario: Token visualization
- **WHEN** the preview loads a DCF document with tokens
- **THEN** the system displays tokens visually (e.g., color swatches for color tokens)
- **AND** shows token relationships and values
- **AND** provides visual feedback for token usage

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