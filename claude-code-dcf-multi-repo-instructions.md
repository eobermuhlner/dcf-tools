# Instructions for Claude Code: Build DCF Tooling in a Multi‑Repo Setup

This document is a **build plan + operating contract** for implementing a DCF (Design Concept Format) ecosystem across multiple GitHub repositories:

- **dcf-spec** — the canonical specification, schemas, examples, releases
- **dcf-tools** — CLI + library for validate/normalize/inspect/lint/diff/graph
- **dcf-viewer** — visual viewer/playground for DCF projects (optional early)
- **dcf-agent** — agentic CLI + CI integrations (optional after tools stabilize)
- **dcf-mcp** — MCP server exposing DCF resources/tools (optional after tools stabilize)

The goal is to ship a reliable foundation first (spec + tooling), then add UX (viewer) and agent integrations (agent + MCP).

References for DCF:
- https://eobermuhlner.github.io/dcf-spec/spec/v1.0.0/design-concept-format.md
- https://eobermuhlner.github.io/dcf-spec/schema/v1.0.0/dcf.schema.json

---

## 0) Non‑Negotiables

### Determinism
- Given the same input, tools must produce the same output (including ordering where relevant).
- Canonical output is **JSON**. YAML is accepted as an input format only.
- All outputs intended for automation must support `--format json`.

### Interchangeable YAML/JSON Input
- Support a **JSON-compatible subset of YAML** only.
- **Disallow YAML anchors, merges, and non-JSON types**.
- Treat comments as non-data.

### Strict Boundaries
- `dcf-spec` is the source of truth for the spec text and schemas.
- `dcf-tools` consumes released schemas and implements logic that is not expressible in JSON Schema (semantic validation/lint).
- `dcf-agent` and `dcf-mcp` call into `dcf-tools` (library) rather than re-implementing.

### Versioning
- The document declares `dcf_version` (SemVer string), e.g. `"1.0.0"`.
- Tools must:
  - accept patch/minor upgrades within the same major
  - warn on newer minor (if not explicitly supported)
  - fail on unknown major

---

## 1) Repository Responsibilities

### 1.1 dcf-spec (Specification Repo)
**Purpose:** Publish an auditable, citeable, versioned spec and machine-readable schemas.

**Must contain:**
- `/spec/` — Markdown spec pages (versioned folders recommended)
- `/schema/` — JSON Schemas per `dcf_version` (e.g., `/schema/1.0.0/dcf.schema.json`)
- `/examples/` — example DCF projects:
  - `lite/` (minimal)
  - `guidelines/` (no concrete app)
  - `standard/` (typical app)
  - `strict/` (fully specified)
- `/changelog.md`
- `/decisions/` (ADRs or RFC outcomes)

**Releases**
- Tag: `v1.0.0`, `v1.0.1`, ...
- Publish to GitHub Pages (or similar) with stable URLs:
  - `/spec/v1.0.0/`
  - `/schema/v1.0.0/dcf.schema.json`
  - `/latest/` redirect

**Acceptance criteria**
- Each spec release includes updated schema + examples + changelog.
- Examples validate with `dcf-tools validate`.

---

### 1.2 dcf-tools (CLI + Library Repo)
**Purpose:** Implement the core mechanics.

**CLI commands to implement (in this order):**
1. `dcf validate`
2. `dcf normalize`
3. `dcf inspect`
4. `dcf lint`
5. `dcf diff` (optional v1)
6. `dcf graph` (optional v1)

**Library API**
- Expose a stable programmatic API used by `dcf-agent` and `dcf-mcp`.
- Internal representation should be canonical JSON.

**Key features**
- Load a project root (multi-file DCF)
- Resolve imports/overlays
- Validate schema + references
- Lint semantic rules
- Provide stable JSON output formats

**Recommended language**
- TypeScript (Node 20+) for ecosystem reach, or Go if you want a single static binary.
- If TypeScript: use `tsx`/`tsup` or `esbuild` for build and `vitest` for tests.

---

### 1.3 dcf-viewer (Optional Early)
**Purpose:** Render a DCF project into a browsable UI.

**Depends on**
- `dcf-tools normalize/inspect/graph` output
- Never parses raw DCF directly if it can call `dcf-tools` instead.

---

### 1.4 dcf-agent (Optional After Tools Stabilize)
**Purpose:** Agentic workflows + CI.

**Responsibilities**
- Use `dcf-tools` library to:
  - validate/lint on PRs
  - produce reports in JSON + markdown summaries
  - (later) extract candidate DCF from codebase
  - (later) generate new screens/components constrained by DCF

**CI integration**
- Provide GitHub Action wrapper that runs:
  - `dcf validate`
  - `dcf lint`
  - outputs SARIF (optional) and markdown comment payload

---

### 1.5 dcf-mcp (Optional After Tools Stabilize)
**Purpose:** Provide MCP Resources and Tools for IDE/agent integrations.

**Contract**
- Resources: read spec/schema + read normalized project DCF
- Tools: wrap `validate`, `lint`, `normalize`, and selected `generate` actions

**Transport**
- Start with stdio transport.
- Keep server stateless and workspace-scoped.

---

## 2) DCF Project Model (What the Tools Must Support)

### 2.1 Minimal required fields
A DCF document (single-file or project) must include:
- `dcf_version`
- `profile` (e.g. `lite`, `guidelines`, `standard`, `strict`)
- Optional `capabilities` map (recommended)

### 2.2 Multi-project + overlays
Support monorepos with subprojects like:
- `frontend-creator`
- `frontend-enduser-web`
- `frontend-enduser-mobile`
- `frontend-shared`

**Recommended pattern:** core + app overlays.

Implement a `dcf.project.yaml` manifest format (for tools) to declare composition:

```yaml
dcf_project: 1
name: my-monorepo
projects:
  shared:
    root: frontend-shared/design
    layers:
      - core/tokens.base.json
      - core/themes/light.json
      - core/components/
      - core/rules.yaml

  creator:
    root: frontend-creator/design
    extends: shared
    layers:
      - apps/creator/layouts/
      - apps/creator/navigation.yaml
      - apps/creator/screens/
      - apps/creator/rules.overlay.yaml

  enduser_web:
    root: frontend-enduser-web/design
    extends: shared
    layers:
      - apps/enduser-web/layouts/
      - apps/enduser-web/navigation.yaml
      - apps/enduser-web/screens/

  enduser_mobile:
    root: frontend-enduser-mobile/design
    extends: shared
    layers:
      - apps/enduser-mobile/layouts/
      - apps/enduser-mobile/navigation.yaml
      - apps/enduser-mobile/screens/
      - apps/enduser-mobile/rules.overlay.yaml
```

**Merge rules**
- Layers merge in order. Later layers override earlier values.
- For objects: deep-merge.
- For arrays: default is replace; optionally support `append` with an explicit directive (avoid surprises).

---

## 3) CLI Command Specs

### 3.1 `dcf validate`
**Input**
- `--project <path>` (project root)
- `--manifest <path>` optional
- `--target <projectName>` optional (if manifest has multiple projects)
- `--format json|text`

**Behavior**
- Load DCF layers, normalize to canonical JSON
- Validate against JSON Schema for `dcf_version`
- Validate references (tokens/components/layouts/screens/routes)
- Report:
  - errors (exit code 1)
  - warnings (exit code 0 unless `--strict-warnings`)

**Output JSON shape (stable)**
```json
{
  "ok": false,
  "dcf_version": "1.0.0",
  "profile": "standard",
  "errors": [{"code":"E_SCHEMA","message":"...","path":"screens.users"}],
  "warnings": []
}
```

---

### 3.2 `dcf normalize`
**Purpose:** canonical JSON for downstream tools/AI.

**Flags**
- `--out <file>` (optional; default stdout)
- `--format json|yaml` (default json)
- `--pretty` for human-readable JSON
- `--target <projectName>` (manifest mode)

**Output**
- Canonical JSON with stable key ordering rules.
- Include `meta` section with provenance:
  - layer list
  - resolved version/profile
  - timestamps optional (off by default to preserve determinism)

---

### 3.3 `dcf inspect`
**Purpose:** discoverability.

Examples:
- `dcf inspect components`
- `dcf inspect themes --resolved`
- `dcf inspect tokens --group color`
- `dcf inspect routes`
- `dcf inspect capabilities`

**Output**
- `--format text` for humans
- `--format json` for automation

---

### 3.4 `dcf lint`
**Purpose:** semantic correctness beyond schema.

**Inputs**
- `--ruleset default|mobile|web|<custom path>`
- `--format json|text`
- `--autofix` (optional, v2)

**Lint classes**
- Token scale drift (non-scale spacing/radius values in tokens/themes)
- Missing accessibility requirements in components
- Intent misuse (e.g., edit screen missing form patterns, if intents are declared)
- Navigation constraints (depth, back behavior) if navigation exists
- Platform constraints (touch targets) if platform profile exists

**Output JSON**
```json
{
  "ok": true,
  "violations": [
    {"code":"L_A11Y_FOCUS","severity":"error","message":"...","path":"components.Button"}
  ]
}
```

---

### 3.5 `dcf diff` (optional v1)
**Purpose:** safe evolution.

- Compare two normalized DCF JSON blobs.
- Provide categorized changes:
  - tokens changed
  - themes changed
  - component API changed
  - screens/routes changed

---

### 3.6 `dcf graph` (optional v1)
**Purpose:** visualization support.

- Output GraphViz DOT or JSON graph structures:
  - navigation graph
  - component dependency graph (if declared)
  - screen → layout → regions map

---

## 4) Implementation Plan (Milestones)

### Milestone 1: Spec + Schema + Examples
- Publish `dcf-spec` with v1.0.0:
  - spec markdown
  - JSON schema
  - examples that validate

### Milestone 2: Tools v0.1 (validate + normalize)
- Implement parsing, layering, canonicalization
- Schema validation using schemas pulled from `dcf-spec` release artifacts
- Basic reference checks

### Milestone 3: Tools v0.2 (inspect + lint)
- Add inspect queries
- Add lint engine with a small default ruleset
- Produce stable machine-readable outputs

### Milestone 4: Optional viewer
- Use `dcf-tools normalize/inspect/graph` outputs
- Theme toggles + token inspector + component list

### Milestone 5: Agent + MCP
- `dcf-agent` wraps validate/lint and posts reports
- `dcf-mcp` exposes tools and resources

---

## 5) Testing Strategy

### Golden tests (mandatory)
- Each example in `dcf-spec/examples` produces a canonical normalized JSON output.
- Store golden normalized outputs in `dcf-tools/testdata/golden/`.
- Any changes must be intentional and reviewed.

### Property tests (recommended)
- YAML ↔ JSON round-trip stability (within allowed subset)
- Merge behavior for overlays

### Integration tests
- Manifest multi-project composition
- Validate + lint on each example repo

---

## 6) Docs and UX Expectations

### CLI UX rules
- All commands support `--help`.
- Exit codes:
  - 0 success
  - 1 validation or lint errors
  - 2 internal/tool failure
- Default output should be human-friendly **unless** in CI:
  - Detect CI via env `CI=true` or provide `--format json`.

### Repo READMEs
- `dcf-spec` README: what DCF is + links to latest spec/schema
- `dcf-tools` README: installation + quickstart + command examples
- `dcf-agent` README: CI examples + GitHub Action usage
- `dcf-mcp` README: configuration examples and exposed tools/resources

---

## 7) Security and Safety

- Tools must not execute arbitrary code from DCF.
- When implementing extract/generate features, treat repository content as untrusted input.
- If adding `--write` or codemods, require explicit confirmation flags and provide diffs.

---

## 8) Deliverables Checklist (What to ship)

### dcf-spec v1.0.0
- [ ] Spec text published
- [ ] JSON Schema v1.0.0
- [ ] Examples: lite, guidelines, standard, strict
- [ ] Changelog entry

### dcf-tools v0.2
- [ ] `dcf validate`
- [ ] `dcf normalize`
- [ ] `dcf inspect`
- [ ] `dcf lint`
- [ ] Golden tests for examples

### Optional
- [ ] `dcf graph`
- [ ] `dcf diff`
- [ ] `dcf-viewer` MVP
- [ ] `dcf-agent` CI integration
- [ ] `dcf-mcp` server

---

## 9) Definition of Done (for any PR)

A PR is done only if:
- Tests pass (unit + golden + integration as applicable)
- CLI output remains stable (or golden outputs updated intentionally)
- Schema/spec changes are versioned and documented
- Examples are updated when the schema changes

---

## 10) First Tasks for Claude Code (Start Here)

1. Create `dcf-tools` skeleton:
   - CLI entry
   - config loading (`dcf.project.yaml`)
   - file discovery (tokens/components/layouts/screens/nav/rules)
2. Implement YAML/JSON parsing with YAML-safe subset checks
3. Implement layer merge + canonicalization to JSON
4. Implement schema validation using schema files pulled from `dcf-spec`
5. Implement reference checks (undefined tokens/components/etc.)
6. Create golden tests using example inputs (from `dcf-spec/examples`)
7. Add `inspect` and minimal `lint` ruleset

---

**End of instructions.**
