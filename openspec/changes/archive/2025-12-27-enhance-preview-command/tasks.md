# Tasks for Enhance Preview Command

## Phase 1: Input Path Support
- [x] Update CLI argument parsing to support multiple paths (files, directories, glob patterns)
- [x] Implement directory scanning with recursive file discovery
- [x] Implement glob pattern matching for file selection
- [x] Add input validation for different path types
- [x] Update help text to reflect new path capabilities

## Phase 2: Output Mode Implementation
- [x] Add --static option for static HTML export functionality
- [x] Add --snapshot option for generating preview snapshots
- [x] Implement static export mode with file output
- [x] Implement snapshot generation functionality
- [x] Ensure interactive server remains default mode

## Phase 3: Configuration Options
- [x] Add --profile option (lite|standard|strict) with validation
- [x] Add --capabilities option for explicit layer declaration
- [x] Add --theme option for theme variant selection
- [x] Add --locale option for i18n locale selection
- [x] Add --renderer option (web|native|custom) with web as default
- [x] Add --allow-invalid option to bypass validation errors
- [x] Add --quiet option to suppress non-error output

## Phase 4: Previewable Kinds and Processing
- [x] Implement previewable kinds filtering (component, layout, screen, navigation, flow)
- [x] Add automatic dependency resolution for supporting layers (tokens, theme, theming, i18n, rules)
- [x] Implement validation that non-previewable kinds trigger warnings unless --strict is enabled
- [x] Create input resolution logic to group files by kind
- [x] Update validation to be implicit with --allow-invalid override

## Phase 5: Processing Pipeline Enhancement
- [x] Implement dependency resolution phase with capability-based loading
- [x] Add override application from CLI flags
- [x] Enhance normalization to resolve tokens, themes, and variants into concrete values
- [x] Implement conditional rule evaluation where possible
- [x] Ensure deterministic rendering behavior

## Phase 6: Error Handling and Validation
- [x] Update error handling to match specification requirements
- [x] Ensure validation errors prevent preview by default
- [x] Implement missing dependency diagnostics with descriptive messages
- [x] Ensure renderer failures are reported with actionable messages
- [x] Maintain deterministic exit codes suitable for CI usage

## Phase 7: Integration and Testing
- [x] Update existing tests to cover new functionality
- [x] Add tests for directory and glob pattern support
- [x] Add tests for static export and snapshot modes
- [x] Add tests for all new configuration options
- [x] Create integration tests for multi-file scenarios
- [x] Update documentation and examples

## Phase 8: Performance and Optimization
- [x] Optimize file watching for multiple files/directories
- [x] Implement efficient change detection across multiple inputs
- [x] Add caching mechanisms where appropriate
- [x] Ensure performance remains acceptable with larger projects