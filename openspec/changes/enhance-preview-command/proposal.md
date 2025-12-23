# Enhance Preview Command

## Summary

This proposal enhances the existing `dcf preview` command to support the full feature set defined in the reference specification. The current implementation only supports single file preview with basic options, but the reference specification defines a more comprehensive preview command that supports multiple input paths, different output modes (interactive, static, snapshot), various configuration options, and previewable kinds.

## Problem Statement

The current `dcf preview` implementation has significant limitations compared to the reference specification:

- Only supports single file preview
- Lacks support for directories and glob patterns
- Missing advanced configuration options (--profile, --capabilities, --theme, --locale, etc.)
- No static export or snapshot functionality
- No support for previewable kinds filtering
- Missing validation and normalization processing model

## Solution Overview

Enhance the `dcf preview` command to implement all features specified in the reference specification, including:

1. Support for multiple input types: single files, directories, and glob patterns
2. Multiple output modes: interactive server (default), static export, and snapshot
3. Comprehensive configuration options for profile, capabilities, theme, locale, renderer, etc.
4. Proper validation and normalization processing pipeline
5. Support for previewable kinds with automatic dependency resolution

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