# validation-core Specification

## Purpose
TBD - created by archiving change implement-validate-command. Update Purpose after archive.
## Requirements
### Requirement: Schema Validation

The system SHALL validate DCF documents against the official JSON Schema corresponding to the declared `dcf_version`.

#### Scenario: Valid schema version

- **GIVEN** a DCF document with `dcf_version: "1.0.0"`
- **WHEN** user runs `dcf validate` on the document
- **THEN** the system fetches the schema from `https://eobermuhlner.github.io/dcf-spec/schema/v1.0.0/dcf.schema.json`
- **AND** validates the document against the fetched schema
- **AND** reports no schema validation errors
- **AND** exits with code 0

#### Scenario: Invalid schema version

- **GIVEN** a DCF document with invalid schema content
- **WHEN** user runs `dcf validate` on the document
- **THEN** the system reports schema validation errors
- **AND** includes error code "E_SCHEMA" 
- **AND** exits with code 1

#### Scenario: Unsupported major version

- **GIVEN** a DCF document with `dcf_version: "2.0.0"` (unsupported major version)
- **WHEN** user runs `dcf validate` on the document
- **THEN** the system reports an error about unsupported major version
- **AND** exits with code 2

#### Scenario: Newer minor version

- **GIVEN** a DCF document with `dcf_version: "1.1.0"` (newer than supported)
- **WHEN** user runs `dcf validate` on the document
- **THEN** the system warns about newer minor version
- **AND** attempts validation if possible
- **AND** exits with code 0 if validation succeeds

### Requirement: Reference Validation

The system SHALL validate that all internal references in a DCF document point to existing definitions.

#### Scenario: Valid token reference

- **GIVEN** a DCF document with a defined token `colors.primary`
- **AND** a component that references `colors.primary`
- **WHEN** user runs `dcf validate` on the document
- **THEN** the system reports no reference validation errors
- **AND** exits with code 0

#### Scenario: Invalid token reference

- **GIVEN** a DCF document with a component that references undefined token `colors.nonexistent`
- **WHEN** user runs `dcf validate` on the document
- **THEN** the system reports a reference validation error
- **AND** includes error code "E_REFERENCE"
- **AND** exits with code 1

#### Scenario: Valid component reference

- **GIVEN** a DCF document with a defined component `Button`
- **AND** a layout that references `Button`
- **WHEN** user runs `dcf validate` on the document
- **THEN** the system reports no reference validation errors
- **AND** exits with code 0

#### Scenario: Invalid component reference

- **GIVEN** a DCF document with a layout that references undefined component `NonExistentButton`
- **WHEN** user runs `dcf validate` on the document
- **THEN** the system reports a reference validation error
- **AND** includes error code "E_REFERENCE"
- **AND** exits with code 1

### Requirement: Multi-File Project Validation

The system SHALL support validation of multi-file DCF projects using `dcf.project.yaml` manifests.

#### Scenario: Valid multi-file project

- **GIVEN** a project directory with `dcf.project.yaml` manifest
- **AND** multiple DCF layers defined in the manifest
- **WHEN** user runs `dcf validate --project <path>`
- **THEN** the system loads all layers according to the manifest
- **AND** merges layers according to merge rules (deep-merge for objects, replace for arrays)
- **AND** validates the merged result
- **AND** reports no validation errors if all layers are valid
- **AND** exits with code 0

#### Scenario: Invalid multi-file project

- **GIVEN** a project directory with `dcf.project.yaml` manifest
- **AND** one layer with validation errors
- **WHEN** user runs `dcf validate --project <path>`
- **THEN** the system reports validation errors from the problematic layer
- **AND** exits with code 1

#### Scenario: Target specific project

- **GIVEN** a manifest with multiple projects defined
- **WHEN** user runs `dcf validate --project <path> --target <projectName>`
- **THEN** the system validates only the specified project
- **AND** ignores other projects in the manifest
- **AND** reports validation results for the targeted project only

### Requirement: Validation Output Format

The system SHALL provide validation results in both human-readable and machine-readable formats.

#### Scenario: Text format output

- **WHEN** user runs `dcf validate --format text`
- **THEN** the system outputs human-readable validation errors and warnings
- **AND** uses clear, actionable language
- **AND** includes file paths and line numbers when possible

#### Scenario: JSON format output

- **WHEN** user runs `dcf validate --format json`
- **THEN** the system outputs validation results in stable JSON format
- **AND** includes `ok`, `dcf_version`, `profile`, `errors`, and `warnings` fields
- **AND** maintains consistent structure for automation

#### Scenario: CI environment detection

- **WHEN** user runs `dcf validate` in CI environment (CI=true)
- **THEN** the system automatically uses JSON output format
- **AND** does not require explicit `--format json` flag

### Requirement: Exit Code Convention for Validation

The system SHALL use consistent exit codes for validation results.

#### Scenario: Successful validation

- **WHEN** a DCF document passes all validation checks
- **THEN** the system exits with code 0

#### Scenario: Validation errors present

- **WHEN** a DCF document has schema or reference validation errors
- **THEN** the system exits with code 1

#### Scenario: Tool failure during validation

- **WHEN** the validation process fails due to internal errors, missing files, or network issues
- **THEN** the system exits with code 2

