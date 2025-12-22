# normalize-core Specification

## Purpose
TBD - created by archiving change implement-normalize-command. Update Purpose after archive.
## Requirements
### Requirement: Canonical JSON Output

The system SHALL transform DCF documents into canonical JSON format with stable, deterministic key ordering.

#### Scenario: Valid DCF document normalization

- **GIVEN** a valid DCF document with `dcf_version: "1.0.0"`
- **WHEN** user runs `dcf normalize document.json`
- **THEN** the system outputs canonical JSON with stable key ordering
- **AND** the output is deterministic (same input produces identical output)
- **AND** exits with code 0

#### Scenario: Deterministic output

- **GIVEN** the same DCF document
- **WHEN** user runs `dcf normalize` multiple times
- **THEN** all outputs are byte-for-byte identical
- **AND** object keys maintain consistent ordering
- **AND** exits with code 0

### Requirement: Output Format Options

The system SHALL support multiple output formats as specified.

#### Scenario: JSON format output

- **WHEN** user runs `dcf normalize --format json document.json`
- **THEN** the system outputs JSON format
- **AND** uses `.json` extension or JSON content type as appropriate
- **AND** exits with code 0

#### Scenario: YAML format output

- **WHEN** user runs `dcf normalize --format yaml document.json`
- **THEN** the system outputs YAML format
- **AND** uses `.yaml` extension or YAML content type as appropriate
- **AND** exits with code 0

#### Scenario: Pretty-printed output

- **WHEN** user runs `dcf normalize --pretty document.json`
- **THEN** the system outputs formatted, human-readable content
- **AND** includes appropriate indentation and spacing
- **AND** exits with code 0

### Requirement: Output Destination

The system SHALL support writing normalized output to specified destinations.

#### Scenario: Output to file

- **WHEN** user runs `dcf normalize --out output.json document.json`
- **THEN** the system writes normalized content to the specified file
- **AND** does not output to stdout
- **AND** exits with code 0

#### Scenario: Output to stdout

- **WHEN** user runs `dcf normalize document.json` (no --out flag)
- **THEN** the system outputs normalized content to stdout
- **AND** exits with code 0

### Requirement: Provenance Metadata

The system SHALL include provenance information in normalized output.

#### Scenario: Provenance in single document

- **GIVEN** a single DCF document
- **WHEN** user runs `dcf normalize document.json`
- **THEN** the system outputs JSON with `meta` section
- **AND** meta section includes `dcf_version` and `profile` from source
- **AND** meta section includes layer information (single file in this case)
- **AND** exits with code 0

### Requirement: Single Document Normalization

The system SHALL support normalization of single DCF documents.

#### Scenario: Valid single document normalization

- **GIVEN** a single DCF document
- **WHEN** user runs `dcf normalize document.json`
- **THEN** the system normalizes the document
- **AND** outputs canonical JSON with stable key ordering
- **AND** exits with code 0

### Requirement: Exit Code Convention for Normalization

The system SHALL use consistent exit codes for normalization results.

#### Scenario: Successful normalization

- **WHEN** a DCF document is successfully normalized
- **THEN** the system exits with code 0

#### Scenario: Tool failure during normalization

- **WHEN** the normalization process fails due to internal errors, missing files, or network issues
- **THEN** the system exits with code 2

