# Tasks: Enhance `dcf validate` Command Implementation

## Overview
Implementation tasks for enhancing the `dcf validate` command to match the specification in `claude-code-dcf-validate.md`.

## Tasks

### 1. Enhanced File Discovery and Loading
- [ ] Implement directory scanning (recursive) for DCF files
- [ ] Add glob pattern support for file matching
- [ ] Update file loading to handle multiple files/directories
- [ ] Add file type detection (JSON/YAML) with proper extensions
- [ ] Create file discovery utility function
- [ ] Add unit tests for file discovery logic

### 2. Command-Line Interface Enhancement
- [ ] Add support for multiple `<path...>` arguments
- [ ] Implement `--profile` option with validation
- [ ] Add `--config` option to specify root configuration file
- [ ] Implement `--capabilities` option with comma-separated values
- [ ] Add `--schemas` option for custom schema bundles
- [ ] Implement `--fail-on` option (warn|error)
- [ ] Add `--quiet` option to suppress non-error output
- [ ] Implement `--no-cross` option to disable cross-file validation
- [ ] Update help text to reflect new options
- [ ] Add validation for option combinations

### 3. Configuration Management
- [ ] Implement configuration file loading (`dcf-root.yaml`)
- [ ] Add configuration merging logic (defaults override)
- [ ] Support profile inheritance from config file
- [ ] Support capabilities inheritance from config file
- [ ] Add configuration validation

### 4. Enhanced Validation Orchestration
- [ ] Update validation API to support multiple files
- [ ] Implement validation context with shared state
- [ ] Add profile override capability
- [ ] Implement capabilities-based validation filtering
- [ ] Add schema override support
- [ ] Create validation result aggregation

### 5. Cross-File Validation
- [ ] Implement cross-file validation logic
- [ ] Add dependency tracking between files
- [ ] Create capability-based validation rules
- [ ] Add reference validation across files
- [ ] Implement set validation for multi-file projects
- [ ] Add performance optimizations for large projects

### 6. Output and Reporting Enhancement
- [ ] Update output format to include file paths for each validation result
- [ ] Add quiet mode implementation
- [ ] Update JSON output format for multiple files
- [ ] Add progress reporting for large validation sets
- [ ] Implement fail-on behavior (warn vs error)

### 7. Testing
- [ ] Add unit tests for new file discovery functionality
- [ ] Create integration tests for directory validation
- [ ] Add tests for configuration file loading
- [ ] Implement tests for cross-file validation
- [ ] Add tests for all new command-line options
- [ ] Create golden tests for multi-file validation scenarios

### 8. Documentation and Examples
- [ ] Update README with new command examples
- [ ] Add examples for directory validation
- [ ] Document configuration file format
- [ ] Add examples for capabilities-based validation
- [ ] Update CLI help text with comprehensive examples

## Dependencies
- Task 1 must be completed before Tasks 4 and 5 (validation orchestration and cross-file validation)
- Task 2 (CLI enhancement) can be done in parallel with other tasks
- Task 3 (configuration management) should be done before Task 4 (validation orchestration)

## Parallelizable Work
- Tasks 2, 3, and 6 can be worked on in parallel after Task 1
- Tasks 7 and 8 can be done throughout the implementation process