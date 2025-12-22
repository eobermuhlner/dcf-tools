# cli-core Specification

## Purpose
TBD - created by archiving change create-cli-skeleton. Update Purpose after archive.
## Requirements
### Requirement: CLI Entry Point

The system SHALL provide a command-line interface accessible via the `dcf` command that serves as the entry point for all DCF tooling operations.

#### Scenario: Display version

- **WHEN** user runs `dcf --version` or `dcf -V`
- **THEN** the CLI outputs the current version number (e.g., "0.1.0")
- **AND** exits with code 0

#### Scenario: Display help

- **WHEN** user runs `dcf --help` or `dcf -h`
- **THEN** the CLI outputs a description of available commands and options
- **AND** exits with code 0

#### Scenario: Unknown command

- **WHEN** user runs `dcf unknown-command`
- **THEN** the CLI outputs an error message indicating the command is not recognized
- **AND** exits with code 2

### Requirement: Subcommand Structure

The system SHALL organize functionality into subcommands following a consistent pattern for discoverability and documentation.

#### Scenario: Subcommand help

- **WHEN** user runs `dcf <command> --help` for any registered command
- **THEN** the CLI outputs command-specific help including options and usage examples
- **AND** exits with code 0

#### Scenario: Placeholder commands available

- **WHEN** user runs `dcf validate`, `dcf normalize`, `dcf inspect`, or `dcf lint`
- **THEN** the CLI acknowledges the command exists
- **AND** outputs a message indicating the command is not yet implemented
- **AND** exits with code 2

### Requirement: Exit Code Convention

The system SHALL use consistent exit codes to indicate execution status for automation and scripting.

#### Scenario: Successful execution

- **WHEN** a command completes successfully
- **THEN** the CLI exits with code 0

#### Scenario: Validation or lint errors

- **WHEN** a command detects validation errors or lint violations in user input
- **THEN** the CLI exits with code 1

#### Scenario: Tool failure

- **WHEN** a command fails due to internal errors, missing files, or configuration issues
- **THEN** the CLI exits with code 2

### Requirement: Node.js Version Constraint

The system SHALL require Node.js version 20 or higher and fail gracefully on unsupported versions.

#### Scenario: Supported Node.js version

- **WHEN** the CLI is executed on Node.js 20+
- **THEN** the CLI operates normally

#### Scenario: Unsupported Node.js version

- **WHEN** the CLI is executed on Node.js < 20
- **THEN** npm installation warns about engine incompatibility
- **AND** runtime behavior is undefined (no explicit runtime check required)

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

