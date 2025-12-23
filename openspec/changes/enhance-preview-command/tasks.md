# Tasks for Enhance Preview Command

## Phase 1: Input Path Support
- [ ] Update CLI argument parsing to support multiple paths (files, directories, glob patterns)
- [ ] Implement directory scanning with recursive file discovery
- [ ] Implement glob pattern matching for file selection
- [ ] Add input validation for different path types
- [ ] Update help text to reflect new path capabilities

## Phase 2: Output Mode Implementation
- [ ] Add --static option for static HTML export functionality
- [ ] Add --snapshot option for generating preview snapshots
- [ ] Implement static export mode with file output
- [ ] Implement snapshot generation functionality
- [ ] Ensure interactive server remains default mode

## Phase 3: Configuration Options
- [ ] Add --profile option (lite|standard|strict) with validation
- [ ] Add --capabilities option for explicit layer declaration
- [ ] Add --theme option for theme variant selection
- [ ] Add --locale option for i18n locale selection
- [ ] Add --renderer option (web|native|custom) with web as default
- [ ] Add --allow-invalid option to bypass validation errors
- [ ] Add --quiet option to suppress non-error output

## Phase 4: Previewable Kinds and Processing
- [ ] Implement previewable kinds filtering (component, layout, screen, navigation, flow)
- [ ] Add automatic dependency resolution for supporting layers (tokens, theme, theming, i18n, rules)
- [ ] Implement validation that non-previewable kinds trigger warnings unless --strict is enabled
- [ ] Create input resolution logic to group files by kind
- [ ] Update validation to be implicit with --allow-invalid override

## Phase 5: Processing Pipeline Enhancement
- [ ] Implement dependency resolution phase with capability-based loading
- [ ] Add override application from CLI flags
- [ ] Enhance normalization to resolve tokens, themes, and variants into concrete values
- [ ] Implement conditional rule evaluation where possible
- [ ] Ensure deterministic rendering behavior

## Phase 6: Error Handling and Validation
- [ ] Update error handling to match specification requirements
- [ ] Ensure validation errors prevent preview by default
- [ ] Implement missing dependency diagnostics with descriptive messages
- [ ] Ensure renderer failures are reported with actionable messages
- [ ] Maintain deterministic exit codes suitable for CI usage

## Phase 7: Integration and Testing
- [ ] Update existing tests to cover new functionality
- [ ] Add tests for directory and glob pattern support
- [ ] Add tests for static export and snapshot modes
- [ ] Add tests for all new configuration options
- [ ] Create integration tests for multi-file scenarios
- [ ] Update documentation and examples

## Phase 8: Performance and Optimization
- [ ] Optimize file watching for multiple files/directories
- [ ] Implement efficient change detection across multiple inputs
- [ ] Add caching mechanisms where appropriate
- [ ] Ensure performance remains acceptable with larger projects