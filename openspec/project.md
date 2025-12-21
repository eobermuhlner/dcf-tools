# Project Context

## Purpose

**dcf-tools** is the CLI + library component of the DCF (Design Concept Format) ecosystem. It provides tooling for validating, normalizing, inspecting, linting, diffing, and graphing DCF projects.

### Goals
- Implement core mechanics for DCF document processing
- Provide a stable programmatic API for downstream tools (dcf-agent, dcf-mcp)
- Enable deterministic, machine-readable outputs for automation
- Support multi-file DCF projects with overlays and composition

### Part of Multi-Repo Ecosystem
- **dcf-spec** — canonical specification, schemas, examples, releases (source of truth)
- **dcf-tools** — CLI + library (this repo)
- **dcf-viewer** — visual viewer/playground (optional, depends on this)
- **dcf-agent** — agentic CLI + CI integrations (depends on this)
- **dcf-mcp** — MCP server exposing DCF resources/tools (depends on this)

## Tech Stack
- TypeScript (Node 20+)
- tsx/tsup or esbuild for build
- vitest for tests
- JSON Schema for validation

## Project Conventions

### Code Style
- **Determinism is mandatory**: given the same input, tools must produce the same output (including ordering)
- **Canonical output is JSON**: YAML is accepted as input format only
- **JSON-compatible YAML subset only**: disallow YAML anchors, merges, and non-JSON types
- All outputs intended for automation must support `--format json`
- Treat comments in YAML as non-data

### Architecture Patterns
- **CLI Commands** (implementation order):
  1. `dcf validate` — schema + reference validation
  2. `dcf normalize` — canonical JSON output
  3. `dcf inspect` — discoverability queries
  4. `dcf lint` — semantic correctness beyond schema
  5. `dcf diff` — compare normalized DCF blobs (optional v1)
  6. `dcf graph` — visualization support (optional v1)

- **Library API**: stable programmatic interface for dcf-agent and dcf-mcp
- **Internal representation**: canonical JSON
- **Layer merge rules**: deep-merge for objects, replace for arrays (append via explicit directive)

### Testing Strategy
- **Golden tests (mandatory)**: each dcf-spec example produces canonical normalized JSON, stored in `testdata/golden/`
- **Property tests (recommended)**: YAML↔JSON round-trip stability, merge behavior for overlays
- **Integration tests**: manifest multi-project composition, validate + lint on each example repo
- Any changes to golden outputs must be intentional and reviewed

### Git Workflow
- PRs must pass: unit + golden + integration tests
- CLI output stability required (or golden outputs updated intentionally)
- Schema/spec changes must be versioned and documented
- Examples updated when schema changes

## Domain Context

### DCF (Design Concept Format)
DCF is a specification for describing design systems, UI components, themes, layouts, screens, and navigation in a structured, machine-readable format.

**References:**
- Repository: https://github.com/eobermuhlner/dcf-spec
- Spec (latest): https://eobermuhlner.github.io/dcf-spec/latest/
- Spec (v1.0.0): https://eobermuhlner.github.io/dcf-spec/spec/v1.0.0/design-concept-format.md
- Schema (latest): https://eobermuhlner.github.io/dcf-spec/schema/latest/
- Schema (v1.0.0): https://eobermuhlner.github.io/dcf-spec/schema/v1.0.0/dcf.schema.json

### Key Concepts
- **dcf_version**: SemVer string (e.g., `"1.0.0"`) declaring spec version
- **profile**: `lite` | `guidelines` | `standard` | `strict`
- **capabilities**: optional map of feature flags
- **Layers**: multi-file composition where later layers override earlier values
- **dcf.project.yaml**: manifest format for multi-project composition

### Profiles
- `lite` — minimal DCF
- `guidelines` — no concrete app, design guidelines only
- `standard` — typical application
- `strict` — fully specified

## Important Constraints

### Non-Negotiables
- **Determinism**: same input → same output (always)
- **Strict boundaries**: dcf-spec is source of truth; dcf-tools implements logic not expressible in JSON Schema
- **Versioning rules**:
  - Accept patch/minor upgrades within same major
  - Warn on newer minor (if not explicitly supported)
  - Fail on unknown major
- **Security**: tools must not execute arbitrary code from DCF; treat repository content as untrusted input

### CLI UX Rules
- All commands support `--help`
- Exit codes: 0 = success, 1 = validation/lint errors, 2 = internal/tool failure
- Default output is human-friendly unless CI detected (`CI=true` env or `--format json`)

## External Dependencies

### dcf-spec Repository
- **GitHub**: https://github.com/eobermuhlner/dcf-spec
- **GitHub Pages**: https://eobermuhlner.github.io/dcf-spec/
- Provides JSON Schema per dcf_version
- Provides example DCF projects for testing (lite, guidelines, standard, strict)
- Releases tagged as `v1.0.0`, `v1.0.1`, etc.

### Stable URLs
| Resource | URL |
|----------|-----|
| Latest Spec | https://eobermuhlner.github.io/dcf-spec/latest/ |
| Latest Schema | https://eobermuhlner.github.io/dcf-spec/schema/latest/ |
| Spec v1.0.0 | https://eobermuhlner.github.io/dcf-spec/spec/v1.0.0/design-concept-format.md |
| Schema v1.0.0 | https://eobermuhlner.github.io/dcf-spec/schema/v1.0.0/dcf.schema.json |
| Examples | https://eobermuhlner.github.io/dcf-spec/examples/ |
