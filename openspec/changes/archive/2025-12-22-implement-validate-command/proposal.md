# Change: Implement dcf validate command

## Why

The `dcf validate` command is the first CLI command to implement in the DCF tooling ecosystem as specified in the multi-repo instructions. This command is essential for validating DCF documents against the official JSON Schema and performing reference validation to ensure all tokens, components, layouts, screens, and routes are properly defined.

According to the project architecture, validation is the foundation for all other commands and must be implemented first to enable deterministic validation of DCF documents.

## What Changes

- Implement the `dcf validate` command with full functionality
- Add schema validation against the official DCF JSON Schema for the declared `dcf_version`
- Add reference validation to check that all referenced tokens/components/layouts/screens/routes exist
- Support multi-file DCF projects with layering and overlays via `dcf.project.yaml`
- Implement proper error/warning reporting with stable JSON output format
- Add command-line options for project path, manifest, target, and output format

## Impact

- Affected specs: `cli-core` (adds detailed validation requirements)
- Affected code: New validation logic, schema fetching, reference resolution
- Dependencies: JSON Schema validator, remote schema fetching capability

## Out of Scope

- Linting logic (will be implemented in a separate `dcf lint` command)
- Normalization logic (will be implemented in `dcf normalize` command)
- Output formatting beyond validation results
- Advanced error recovery beyond basic validation

These will be implemented in subsequent proposals.