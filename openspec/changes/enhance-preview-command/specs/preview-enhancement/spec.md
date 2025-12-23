# Preview Enhancement Specification

## Purpose
This specification defines enhancements to the `dcf preview` command to support the full feature set outlined in the reference specification, including multiple input paths, output modes, and configuration options.

## ADDED Requirements

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

## MODIFIED Requirements

### Requirement: Preview Command Syntax
The system SHALL update the `dcf preview` command syntax to support multiple paths and options.

#### Scenario: Enhanced command execution
- **WHEN** user runs `dcf preview <path...> [options]`
- **THEN** the system supports one or more paths (files, directories, glob patterns)
- **AND** supports all enhanced options (--static, --snapshot, --profile, --theme, etc.)
- **AND** maintains backward compatibility with existing usage