# Tasks: Enhance `dcf validate` Command Implementation

## Overview
Implementation tasks for enhancing the `dcf validate` command to match the specification in `claude-code-dcf-validate.md`.

## Tasks

### 1. Enhanced File Discovery and Loading
- [x] Implement directory scanning (recursive) for DCF files
- [x] Add glob pattern support for file matching
- [x] Update file loading to handle multiple files/directories
- [x] Add file type detection (JSON/YAML) with proper extensions
- [x] Create file discovery utility function
- [x] Add unit tests for file discovery logic

### 2. Command-Line Interface Enhancement
- [x] Add support for multiple `<path...>` arguments
- [x] Implement `--profile` option with validation
- [x] Add `--config` option to specify root configuration file
- [x] Implement `--capabilities` option with comma-separated values
- [x] Add `--schemas` option for custom schema bundles
- [x] Implement `--fail-on` option (warn|error)
- [x] Add `--quiet` option to suppress non-error output
- [x] Implement `--no-cross` option to disable cross-file validation
- [x] Update help text to reflect new options
- [x] Add validation for option combinations

### 3. Configuration Management
- [x] Implement configuration file loading (`dcf-root.yaml`)
- [x] Add configuration merging logic (defaults override)
- [x] Support profile inheritance from config file
- [x] Support capabilities inheritance from config file
- [x] Add configuration validation

### 4. Enhanced Validation Orchestration
- [x] Update validation API to support multiple files
- [x] Implement validation context with shared state
- [x] Add profile override capability
- [x] Implement capabilities-based validation filtering
- [x] Add schema override support
- [x] Create validation result aggregation

### 5. Cross-File Validation
- [x] Implement cross-file validation logic
- [x] Add dependency tracking between files
- [x] Create capability-based validation rules
- [x] Add reference validation across files
- [x] Implement set validation for multi-file projects
- [x] Add performance optimizations for large projects

### 6. Output and Reporting Enhancement
- [x] Update output format to include file paths for each validation result
- [x] Add quiet mode implementation
- [x] Update JSON output format for multiple files
- [x] Add progress reporting for large validation sets
- [x] Implement fail-on behavior (warn vs error)

### 7. Testing
- [x] Add unit tests for new file discovery functionality
- [x] Create integration tests for directory validation
- [x] Add tests for configuration file loading
- [x] Implement tests for cross-file validation
- [x] Add tests for all new command-line options
- [x] Create golden tests for multi-file validation scenarios

### 8. Documentation and Examples
- [x] Update README with new command examples
- [x] Add examples for directory validation
- [x] Document configuration file format
- [x] Add examples for capabilities-based validation
- [x] Update CLI help text with comprehensive examples

## Dependencies
- Task 1 must be completed before Tasks 4 and 5 (validation orchestration and cross-file validation)
- Task 2 (CLI enhancement) can be done in parallel with other tasks
- Task 3 (configuration management) should be done before Task 4 (validation orchestration)

## Parallelizable Work
- Tasks 2, 3, and 6 can be worked on in parallel after Task 1
- Tasks 7 and 8 can be done throughout the implementation process