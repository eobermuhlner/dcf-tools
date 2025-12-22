# Change: Implement dcf normalize command

## Why

The `dcf normalize` command is the second CLI command to implement in the DCF tooling ecosystem as specified in the multi-repo instructions. This command is essential for producing canonical JSON output that serves as input for downstream tools (dcf-agent, dcf-mcp), AI processing, and automation.

According to the project architecture, normalization creates canonical JSON with stable key ordering rules, which is fundamental for deterministic processing and comparison of DCF documents.

## What Changes

- Implement the `dcf normalize` command with full functionality
- Add canonical JSON output with stable key ordering
- Support multi-file DCF projects with layering and overlays via `dcf.project.yaml`
- Implement proper output formatting (JSON/YAML, pretty printing)
- Add command-line options for output file, format, pretty printing, and target project
- Include meta section with provenance information (layer list, resolved version/profile)

## Impact

- Affected specs: New `normalize-core` spec (adds normalization requirements)
- Affected code: New normalization logic, project loading, canonical output formatting
- Dependencies: YAML parsing/writing libraries for format support

## Out of Scope

- Validation logic (handled by `dcf validate` command)
- Linting logic (handled by `dcf lint` command)
- Inspection queries (handled by `dcf inspect` command)

These will be implemented in subsequent proposals.