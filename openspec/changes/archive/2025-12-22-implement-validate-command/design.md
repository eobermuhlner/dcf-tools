## Context

The `dcf validate` command is the first command to be implemented in the DCF tooling ecosystem. It needs to validate DCF documents against the official JSON Schema and perform semantic validation of references. The command should be able to handle both single-file DCF documents and multi-file projects with overlays.

**Stakeholders:**
- DCF document authors using the CLI directly
- CI systems running validation
- Downstream tools (dcf-agent, dcf-mcp) that may consume validation results

**Constraints:**
- Must support Node.js 20+
- Deterministic output is mandatory
- JSON is canonical output format
- Exit codes must follow convention (0=success, 1=validation error, 2=tool error)

## Goals / Non-Goals

**Goals:**
- Validate DCF documents against the appropriate JSON Schema based on `dcf_version`
- Validate internal references (tokens, components, layouts, screens, routes)
- Support multi-file projects with `dcf.project.yaml` manifests
- Provide clear, actionable error messages
- Output stable JSON format for automation

**Non-Goals:**
- Perform semantic linting (reserved for `dcf lint` command)
- Transform or normalize documents (reserved for `dcf normalize` command)
- Implement complex error recovery strategies

## Decisions

### Decision 1: Use Ajv for JSON Schema validation
- **Why:** Mature, fast, supports remote schema resolution and custom formats
- **Alternatives considered:**
  - tv4: Older, less performant
  - joi: More complex API, primarily for validation during development
  - Custom validation: Unnecessary complexity

### Decision 2: Remote schema fetching strategy
- **Why:** Fetch schemas from dcf-spec GitHub Pages based on `dcf_version` field
- **Implementation:** Use stable URLs like `https://eobermuhlner.github.io/dcf-spec/schema/v1.0.0/dcf.schema.json`
- **Fallback:** Cache schemas locally or provide offline mode in future iteration
- **Alternatives considered:**
  - Bundling schemas: Would require tool updates for new schema versions
  - Requiring local schema path: More complex for users

### Decision 3: Reference validation approach
- **Why:** Implement custom reference validation after schema validation
- **Process:**
  1. Parse and normalize DCF document to canonical JSON
  2. Extract all defined tokens/components/layouts/screens/routes
  3. Validate all references point to existing definitions
- **Alternatives considered:**
  - Extending JSON Schema: Complex and less maintainable
  - Separate validation tool: Would duplicate work

### Decision 4: Command structure and options
```
dcf validate [options]
--project <path>          Project root directory (default: current directory)
--manifest <path>         Path to dcf.project.yaml (default: <project>/dcf.project.yaml)
--target <projectName>    Specific project name if manifest has multiple projects
--format json|text        Output format (default: text unless CI=true)
--strict-warnings         Treat warnings as errors (exit code 1)
```

- **Why:** Follows common CLI patterns and matches requirements from multi-repo instructions
- **Alternatives considered:** Different flag names, but these match the spec

### Decision 5: Output format structure
```json
{
  "ok": false,
  "dcf_version": "1.0.0",
  "profile": "standard", 
  "errors": [{"code":"E_SCHEMA","message":"...","path":"screens.users"}],
  "warnings": []
}
```

- **Why:** Stable, machine-readable format that supports both automation and human consumption
- **Includes:** Success status, document metadata, structured error/warning lists
- **Alternatives considered:** Different field names, but these match the spec

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Remote schema fetching fails | Implement caching, offline mode in future |
| Validation performance | Optimize with efficient data structures, streaming if needed |
| Complex error messages | Focus on clarity and actionable feedback |
| Schema evolution | Follow versioning rules: accept patch/minor within same major |

## Migration Plan

Not applicable - greenfield implementation.

## Open Questions

1. Should we implement local schema caching for offline use? (Deferred to implementation)
2. How to handle authentication for private schema repositories? (Not applicable for public dcf-spec)