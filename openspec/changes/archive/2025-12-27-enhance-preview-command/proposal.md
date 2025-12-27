# Enhance Preview Command

## Why

The current `dcf preview` implementation has significant limitations compared to the reference specification:

- Only supports single file preview
- Lacks support for directories and glob patterns
- Missing advanced configuration options (--profile, --capabilities, --theme, --locale, etc.)
- No static export or snapshot functionality
- No support for previewable kinds filtering
- Missing validation and normalization processing model

These limitations prevent developers from using the preview command effectively for multi-file DCF projects and CI/CD workflows.

## What Changes

This proposal enhances the existing `dcf preview` command to support the full feature set defined in the reference specification:

1. **Multi-Path Input Support**: Single files, directories, and glob patterns
2. **Output Modes**: Interactive server (default), static export, and snapshot generation
3. **Configuration Options**: Profile, capabilities, theme, locale, renderer, allow-invalid, quiet
4. **Processing Pipeline**: Validation, dependency resolution, normalization, and rendering
5. **Previewable Kinds**: Component, layout, screen, navigation, flow with automatic dependency resolution

## Summary

This proposal enhances the existing `dcf preview` command to support the full feature set defined in the reference specification. The current implementation only supports single file preview with basic options, but the reference specification defines a more comprehensive preview command that supports multiple input paths, different output modes (interactive, static, snapshot), various configuration options, and previewable kinds.

## Expected Outcomes

- Full compliance with the `dcf preview` reference specification
- Enhanced developer experience with more flexible preview options
- Improved validation and normalization capabilities
- Better support for multi-file DCF projects
- Consistent behavior with the reference specification

## Non-Goals

- Changing the core validation or normalization logic (these will be reused)
- Implementing new rendering backends beyond the existing web-based renderer
- Modifying the underlying DCF schema or format