# Design: Enhanced `dcf validate` Command Implementation

## Architecture Overview

The enhanced `dcf validate` command will maintain the existing layered architecture while adding new capabilities for multi-file validation, configuration management, and cross-file validation.

## Component Architecture

### 1. CLI Layer (`src/commands/validate.ts`)
- Updated to handle multiple file arguments
- New options for profile override, capabilities, schemas, etc.
- Maintains backward compatibility with existing single-file usage

### 2. Validation Orchestration (`src/validation/validate-project.ts`)
- New module to handle multi-file validation workflows
- Coordinates schema validation, reference validation, and cross-file validation
- Manages validation context and shared state
- Aggregates results from multiple files

### 3. File Discovery (`src/utils/file-discovery.ts`)
- New utility module for finding DCF files in directories and via glob patterns
- Handles recursive directory scanning
- Supports JSON and YAML file detection

### 4. Configuration Management (`src/config/config-loader.ts`)
- New module for loading and merging configuration files
- Handles defaults from config file and CLI overrides
- Supports profile and capabilities inheritance

### 5. Cross-File Validation (`src/validation/cross-file.ts`)
- New module for validating references across multiple files
- Implements capability-based validation rules
- Tracks dependencies between files

## Data Flow

### Single File Validation (Backward Compatible)
```
CLI Args → Validate Single File → Schema Validation → Reference Validation → Output
```

### Multi-File Validation
```
CLI Args → File Discovery → Load Configuration → Validate Files (Parallel) → Cross-File Validation → Aggregate Results → Output
```

### Cross-File Validation Process
1. Load all files and parse DCF documents
2. Build dependency graph based on references
3. Validate individual files (schema + reference)
4. Validate cross-file dependencies and capabilities
5. Aggregate all results with proper file attribution

## Key Design Decisions

### 1. Backward Compatibility
- Maintain existing single-file validation behavior
- All current CLI options continue to work
- Default behavior remains unchanged for single-file usage

### 2. Performance Optimization
- Parallel validation of individual files where possible
- Caching of schema downloads
- Efficient dependency graph building for cross-file validation

### 3. Error Attribution
- Each validation error/warning clearly indicates which file it originated from
- Maintains path information for nested validation issues
- Proper error grouping by file in output

### 4. Configuration Hierarchy
- Default values from config file
- Overridden by CLI options
- Per-file profiles can be overridden by CLI profile option

## Error Handling Strategy

### Tool Errors (Exit Code 2)
- File not found
- Invalid configuration file
- Network errors during schema fetch
- Invalid glob patterns

### Validation Errors (Exit Code 1)
- Schema validation failures
- Reference validation failures
- Cross-file validation failures
- Configuration validation failures

### Success (Exit Code 0)
- All files pass validation
- Or warnings only (depending on --fail-on setting)

## Validation Context

New `ValidationContext` type to manage shared state:

```typescript
interface ValidationContext {
  profile: string;           // Effective profile (from config, CLI, or file)
  capabilities: string[];    // Enabled capabilities
  schemaOverride?: string;   // Custom schema bundle path/URL
  disableCrossValidation: boolean;  // Whether to skip cross-file validation
  files: string[];          // Files to validate
  configFile?: string;      // Path to config file
}
```

## Configuration File Format

Support for `dcf-root.yaml` with structure:

```yaml
dcf_version: "1.0.0"
profile: "standard"
capabilities:
  - "tokens"
  - "components"
  - "screens"
```

## Extensibility Considerations

### Future Capability Support
The architecture allows for easy addition of new validation capabilities by:
- Adding capability identifiers
- Implementing capability-specific validation rules
- Updating the cross-file validation logic

### Schema Evolution
The system handles schema evolution through:
- Version-based schema fetching
- Backward compatibility checks
- Warning for newer minor versions