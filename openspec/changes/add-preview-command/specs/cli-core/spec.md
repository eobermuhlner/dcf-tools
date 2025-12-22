## ADDED Requirements
### Requirement: Preview Subcommand

The system SHALL provide a `preview` subcommand that enables visual preview of DCF documents in a web browser.

#### Scenario: Preview command help
- **WHEN** user runs `dcf preview --help`
- **THEN** the CLI outputs help information for the preview command
- **AND** includes description of the command's purpose
- **AND** lists available options (port, host, open)
- **AND** provides usage examples
- **AND** exits with code 0

#### Scenario: Preview command availability
- **WHEN** user runs `dcf preview <path-to-dcf.json>`
- **THEN** the CLI recognizes the preview command
- **AND** executes the preview functionality
- **AND** does not show "command not recognized" error
- **AND** exits with code 0 on successful termination

### Requirement: Preview Command Options

The system SHALL support command-line options for configuring the preview server.

#### Scenario: Port option
- **WHEN** user runs `dcf preview --port 3000 document.json`
- **THEN** the preview server starts on port 3000
- **AND** serves the preview application on the specified port
- **AND** outputs the server URL with the custom port
- **AND** exits with code 0 on successful termination

#### Scenario: Host option
- **WHEN** user runs `dcf preview --host localhost document.json`
- **THEN** the preview server binds to the specified host
- **AND** serves the preview application from the specified host
- **AND** outputs the server URL with the custom host
- **AND** exits with code 0 on successful termination

#### Scenario: Open browser option
- **WHEN** user runs `dcf preview --open document.json`
- **THEN** the preview server starts and automatically opens the browser
- **AND** navigates to the preview URL
- **AND** displays the DCF document in the browser
- **AND** exits with code 0 on successful termination