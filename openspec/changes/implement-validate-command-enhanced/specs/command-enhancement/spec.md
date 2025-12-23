# Command Enhancement Specification

## Purpose
Enhance the `dcf validate` command to support the full feature set specified in the DCF validation specification, including directory scanning, multiple files, configuration files, and cross-file validation.

## ADDED Requirements

### Requirement: Multiple Path Validation
The system SHALL support validating multiple paths (files, directories, or glob patterns) in a single command execution.

#### Scenario: Multiple file validation
- **GIVEN** two valid DCF files: `tokens.json` and `components.json`
- **WHEN** user runs `dcf validate tokens.json components.json`
- **THEN** the system validates both files
- **AND** aggregates results from both files
- **AND** exits with code 0 if both files are valid
- **AND** exits with code 1 if either file has validation errors
- **AND** exits with code 2 if there's a tool error loading either file

#### Scenario: Directory validation
- **GIVEN** a directory containing multiple DCF files
- **WHEN** user runs `dcf validate design/`
- **THEN** the system recursively scans the directory for DCF files (`.json`, `.yaml`, `.yml`)
- **AND** validates all found DCF files
- **AND** aggregates results from all files
- **AND** reports which file each error/warning belongs to

#### Scenario: Glob pattern validation
- **GIVEN** multiple DCF files matching a glob pattern
- **WHEN** user runs `dcf validate "design/**/*.yaml"`
- **THEN** the system expands the glob pattern to find matching files
- **AND** validates all matching DCF files
- **AND** aggregates results with proper file attribution

### Requirement: Profile Override Option
The system SHALL support overriding the profile declared in DCF files via the `--profile` command-line option.

#### Scenario: Profile override for single file
- **GIVEN** a DCF file with `profile: "lite"`
- **WHEN** user runs `dcf validate file.json --profile strict`
- **THEN** the system validates the file using the "strict" profile instead of "lite"
- **AND** applies strict validation rules to the file

#### Scenario: Profile override for multiple files
- **GIVEN** multiple DCF files with different declared profiles
- **WHEN** user runs `dcf validate dir/ --profile standard`
- **THEN** the system validates all files using the "standard" profile regardless of their declared profiles

### Requirement: Configuration File Support
The system SHALL support loading default settings from a configuration file specified with the `--config` option.

#### Scenario: Configuration file loading
- **GIVEN** a configuration file `dcf-root.yaml` with profile and capabilities
- **WHEN** user runs `dcf validate dir/ --config dcf-root.yaml`
- **THEN** the system loads settings from the configuration file
- **AND** uses the profile from the config file as default
- **AND** uses the capabilities from the config file for validation

### Requirement: Capabilities-Based Validation
The system SHALL support capabilities-based validation filtering via the `--capabilities` option.

#### Scenario: Capabilities filtering
- **GIVEN** a directory with DCF files for different capabilities (tokens, components, screens)
- **WHEN** user runs `dcf validate dir/ --capabilities tokens,components`
- **THEN** the system only validates files related to tokens and components
- **AND** ignores files for other capabilities (e.g., screens, flows)
- **AND** does not report errors for missing dependencies outside the specified capabilities

### Requirement: Custom Schema Support
The system SHALL support using custom schema bundles specified with the `--schemas` option.

#### Scenario: Custom schema directory
- **GIVEN** a local directory with custom DCF schemas
- **WHEN** user runs `dcf validate file.json --schemas ./custom-schemas/`
- **THEN** the system loads schemas from the specified directory instead of fetching from the default URL
- **AND** validates using the custom schemas

#### Scenario: Custom schema URL
- **GIVEN** a URL pointing to custom DCF schemas
- **WHEN** user runs `dcf validate file.json --schemas https://example.com/schemas/`
- **THEN** the system fetches schemas from the specified URL
- **AND** validates using the fetched schemas

### Requirement: Fail-On Behavior
The system SHALL support different failure thresholds via the `--fail-on` option.

#### Scenario: Fail on warnings
- **GIVEN** a DCF file with validation warnings but no errors
- **WHEN** user runs `dcf validate file.json --fail-on warn`
- **THEN** the system exits with code 1 (failure)
- **AND** reports the warnings as failures

#### Scenario: Fail on errors only (default)
- **GIVEN** a DCF file with validation warnings but no errors
- **WHEN** user runs `dcf validate file.json --fail-on error`
- **THEN** the system exits with code 0 (success)
- **AND** reports the warnings but doesn't fail

### Requirement: Quiet Mode
The system SHALL support suppressing non-error output via the `--quiet` option.

#### Scenario: Quiet mode with errors
- **GIVEN** a DCF file with validation errors
- **WHEN** user runs `dcf validate file.json --quiet`
- **THEN** the system only outputs error information
- **AND** suppresses warnings and informational messages
- **AND** still exits with appropriate error code

#### Scenario: Quiet mode success
- **GIVEN** a valid DCF file
- **WHEN** user runs `dcf validate file.json --quiet`
- **THEN** the system produces no output
- **AND** exits with code 0

### Requirement: Cross-File Validation Control
The system SHALL support disabling cross-file validation via the `--no-cross` option.

#### Scenario: Cross-file validation enabled (default)
- **GIVEN** multiple DCF files with cross-references
- **WHEN** user runs `dcf validate dir/`
- **THEN** the system performs both individual file validation and cross-file validation
- **AND** reports errors for missing cross-references

#### Scenario: Cross-file validation disabled
- **GIVEN** multiple DCF files with cross-references
- **WHEN** user runs `dcf validate dir/ --no-cross`
- **THEN** the system only performs individual file validation
- **AND** does not validate cross-references between files
- **AND** reports only individual file errors

## ADDED Requirements (contd.)

### Requirement: Multi-File Output Format
The system SHALL support output formats that properly attribute validation results to their source files when validating multiple files.

#### Scenario: Multi-file JSON output
- **GIVEN** multiple DCF files being validated
- **WHEN** user runs `dcf validate dir/ --format json`
- **THEN** the system outputs JSON with validation results grouped by file
- **AND** each error/warning includes the source file path

#### Scenario: Multi-file text output
- **GIVEN** multiple DCF files being validated
- **WHEN** user runs `dcf validate dir/ --format text`
- **THEN** the system outputs text with clear file attribution for each error/warning
- **AND** groups results by file for better readability