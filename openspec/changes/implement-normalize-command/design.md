## Context

The `dcf normalize` command needs to transform DCF documents into canonical JSON format with stable key ordering. This serves downstream tools and automation that require deterministic, machine-readable output. The command should handle both single-file DCF documents and multi-file projects with overlays.

**Stakeholders:**
- Downstream tools (dcf-agent, dcf-mcp) that consume normalized output
- AI/automation systems that process DCF documents
- Developers who need to compare or analyze DCF structures

**Constraints:**
- Must support Node.js 20+
- Deterministic output is mandatory (same input → same output including ordering)
- JSON is canonical output format
- All outputs intended for automation must support `--format json`

## Goals / Non-Goals

**Goals:**
- Transform DCF documents to canonical JSON with stable key ordering
- Support multi-file projects with `dcf.project.yaml` manifests
- Provide both JSON and YAML output formats
- Include provenance information in meta section
- Support pretty-printed output for readability
- Handle project targeting for multi-project manifests

**Non-Goals:**
- Perform validation (reserved for `dcf validate` command)
- Perform semantic analysis (reserved for `dcf lint` command)
- Provide interactive features

## Decisions

### Decision 1: Canonical output structure
- **Why:** Output should follow stable structure with predictable key ordering
- **Implementation:**
  - Sort object keys alphabetically for deterministic output
  - Preserve array order but ensure consistent processing
  - Include `meta` section with provenance information
- **Meta section includes:**
  - layer list (for multi-file projects)
  - resolved dcf_version and profile
  - optional timestamps (disabled by default for determinism)

### Decision 2: Output formatting approach
- **Why:** Support both JSON and YAML formats as specified
- **Implementation:**
  - JSON as default format
  - YAML support using js-yaml library
  - Pretty-printing option for human-readable output
- **Alternatives considered:**
  - Only JSON support: Would limit usability for human editing

### Decision 3: Multi-file project support
- **Why:** Must handle layering and composition as per DCF architecture
- **Process:**
  1. Load project manifest if specified
  2. Load and merge layers according to merge rules
  3. Normalize the merged result
- **Merge rules:**
  - Objects: deep-merge
  - Arrays: replace (not merge)
  - Other values: replace

### Decision 4: Command structure and options
```
dcf normalize [options] [file|project]
--out <file>            Output file (default: stdout)
--format json|yaml      Output format (default: json)
--pretty                Pretty-print output for readability
--target <projectName>  Target project name for multi-project manifests
```

- **Why:** Follows requirements from multi-repo instructions
- **Alternatives considered:** Different flag names, but these match the spec

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Non-deterministic output | Implement strict key ordering rules, avoid object iteration order dependencies |
| Large file performance | Use streaming or chunked processing if needed in future |
| Memory usage for large projects | Process in memory for now; optimize if needed |

## Migration Plan

Not applicable - greenfield implementation.

## Open Questions

1. Should we include timestamps in meta section by default? (Answer: No, to preserve determinism)
2. How to handle validation during normalization? (Answer: Minimal validation only, full validation in separate command)