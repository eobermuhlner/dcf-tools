# Design Document for Enhanced Preview Command

## Architecture Overview

The enhanced preview command will maintain the existing architecture pattern while extending functionality to support multiple input paths, output modes, and configuration options. The core architecture remains:

1. CLI layer: Parses arguments and options
2. Server layer: Manages file watching and API endpoints
3. Processing layer: Handles validation, normalization, and transformation
4. Rendering layer: Visualizes DCF content

## Key Design Decisions

### 1. Multi-Path Input Processing

The system will implement a file discovery service that can handle:
- Single file paths (existing behavior)
- Directory paths (recursive scan)
- Glob patterns (using the glob library)

The discovered files will be processed by kind and validated before being made available to the preview system.

### 2. Output Mode Architecture

Three distinct output modes will be supported:
- Interactive mode (default): Start local server with hot reload
- Static mode: Export static HTML/CSS/JS bundle to specified directory
- Snapshot mode: Generate image/DOM snapshots to specified directory

The rendering engine will be shared across all modes, with mode-specific output handlers.

### 3. Configuration Pipeline

Configuration options will be processed in this order:
1. Default values
2. CLI options
3. DCF document defaults
4. Environment settings

This ensures predictable behavior while allowing for flexible configuration.

### 4. Dependency Resolution

The system will implement a dependency graph resolver that:
- Identifies required supporting layers based on capabilities
- Resolves token references across multiple files
- Handles circular dependency detection
- Provides clear error messages for missing dependencies

### 5. Validation and Normalization Pipeline

The processing pipeline will follow this sequence:
1. Input resolution (expand paths, group by kind)
2. Validation (using existing validation-core)
3. Dependency resolution
4. Override application (from CLI flags)
5. Normalization (resolve tokens, themes, variants)
6. Rendering preparation

## Component Interactions

```
CLI Layer
    ↓ (parsed options and paths)
File Discovery Service
    ↓ (discovered DCF files)
Validation Service
    ↓ (validated files)
Dependency Resolver
    ↓ (resolved dependencies)
Normalization Service
    ↓ (normalized data)
Rendering Engine
    ↓ (rendered output)
Output Handler (interactive/static/snapshot)
```

## Error Handling Strategy

- Input validation errors: Return immediately with descriptive message
- File processing errors: Continue processing other files, aggregate errors
- Server startup errors: Clean up resources and return error code
- Runtime errors: Maintain server operation, report to client
- Rendering errors: Provide fallback rendering with error indication

## Performance Considerations

- File watching: Use efficient file system watchers with debouncing
- Memory usage: Implement streaming for large file sets
- Processing: Parallelize independent operations where possible
- Caching: Cache normalized results where appropriate

## Backward Compatibility

The enhanced implementation will maintain full backward compatibility:
- All existing CLI options continue to work
- Single file preview continues to work as before
- Default behavior remains unchanged
- Existing API endpoints remain available