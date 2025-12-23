# Proposal: Enhance `dcf validate` Command Implementation

## Summary

This proposal outlines improvements to the existing POC implementation of `dcf validate` to fully align with the specification in `claude-code-dcf-validate.md`. The current implementation provides basic functionality but lacks support for many required features including directory scanning, multiple file validation, profile overrides, custom schemas, and cross-file validation.

## Current State

The current `dcf validate` implementation:
- Supports validating a single file only
- Has basic schema and reference validation
- Provides text and JSON output formats
- Supports `--strict-warnings` flag
- Lacks support for directories, glob patterns, and multiple files
- Missing profile override capability
- No cross-file validation
- No custom schema support
- No capabilities filtering

## Desired State

The enhanced implementation will support:
- Single files, directories (recursive), and glob patterns
- Multiple file validation in a single command
- Profile override via `--profile` flag
- Custom schema bundles via `--schemas` flag
- Cross-file validation with `--no-cross` option to disable
- Capabilities-based validation via `--capabilities` flag
- Configuration file support via `--config` flag
- Improved error reporting with file paths

## Scope of Change

This change will enhance the validation functionality across multiple components:
1. Command-line interface (options and argument parsing)
2. File discovery and loading logic
3. Validation orchestration
4. Cross-file validation capabilities
5. Configuration management

## Success Criteria

- All features specified in `claude-code-dcf-validate.md` are implemented
- Backward compatibility is maintained
- All existing functionality continues to work
- New features are properly tested
- Performance remains acceptable for large projects