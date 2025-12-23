# file-discovery Specification

## Purpose
TBD - created by archiving change implement-validate-command-enhanced. Update Purpose after archive.
## Requirements
### Requirement: Directory Scanning
The system SHALL recursively scan directories to find DCF files when a directory path is provided as an argument.

#### Scenario: Directory with nested DCF files
- **GIVEN** a directory structure with DCF files in nested subdirectories
- **WHEN** user runs `dcf validate design/`
- **THEN** the system recursively scans all subdirectories
- **AND** finds all DCF files (`.json`, `.yaml`, `.yml`) in the directory tree
- **AND** validates each found file

#### Scenario: Directory with mixed file types
- **GIVEN** a directory with DCF files and other file types
- **WHEN** user runs `dcf validate mixed-dir/`
- **THEN** the system only processes files with extensions `.json`, `.yaml`, or `.yml`
- **AND** ignores other file types
- **AND** validates only the DCF files

### Requirement: Glob Pattern Support
The system SHALL support shell-expanded glob patterns for file matching.

#### Scenario: Glob pattern matching
- **GIVEN** multiple DCF files in a project
- **WHEN** user runs `dcf validate "design/**/*.yaml"`
- **THEN** the system expands the glob pattern to match all YAML files in the design directory tree
- **AND** validates all matching files

#### Scenario: Multiple glob patterns
- **GIVEN** a command with multiple glob patterns
- **WHEN** user runs `dcf validate "tokens/*.json" "components/**/*.yaml"`
- **THEN** the system expands both glob patterns
- **AND** validates all files matching either pattern
- **AND** deduplicates files if they match multiple patterns

### Requirement: File Type Detection
The system SHALL correctly identify DCF files by their extensions and content.

#### Scenario: JSON file detection
- **GIVEN** a file with `.json` extension
- **WHEN** the system encounters the file during directory scan
- **THEN** the system attempts to parse it as JSON
- **AND** validates it as a DCF document if it has valid DCF structure

#### Scenario: YAML file detection
- **GIVEN** a file with `.yaml` or `.yml` extension
- **WHEN** the system encounters the file during directory scan
- **THEN** the system attempts to parse it as YAML
- **AND** validates it as a DCF document if it has valid DCF structure

### Requirement: File Discovery Error Handling
The system SHALL handle file discovery errors gracefully and continue processing other files.

#### Scenario: Permission denied in subdirectory
- **GIVEN** a directory tree where some subdirectories have restricted permissions
- **WHEN** user runs `dcf validate root/`
- **THEN** the system reports permission errors for inaccessible directories
- **AND** continues scanning accessible directories
- **AND** validates all accessible DCF files
- **AND** exits with code 2 (tool error) due to the permission issue

#### Scenario: Symbolic link handling
- **GIVEN** a directory containing symbolic links
- **WHEN** user runs `dcf validate dir-with-links/`
- **THEN** the system follows symbolic links to files
- **AND** skips symbolic links to directories to avoid infinite loops
- **AND** validates accessible DCF files through links

### Requirement: File Discovery Performance
The system SHALL efficiently discover files without excessive memory usage or processing time.

#### Scenario: Large directory with many files
- **GIVEN** a directory with hundreds of DCF files
- **WHEN** user runs `dcf validate large-dir/`
- **THEN** the system discovers files with reasonable performance
- **AND** does not consume excessive memory during discovery
- **AND** reports progress for very large sets (optional)

### Requirement: Duplicate File Handling
The system SHALL detect and handle duplicate files when multiple paths refer to the same file.

#### Scenario: Duplicate file paths
- **GIVEN** a command with overlapping file paths like `dcf validate dir/ dir/subdir/file.json`
- **WHEN** the system processes the paths
- **THEN** the system detects that `dir/subdir/file.json` is already included in `dir/`
- **AND** validates the file only once
- **AND** does not duplicate validation results

