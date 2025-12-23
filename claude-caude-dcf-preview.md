# `dcf preview` Command Specification

This document defines the `dcf preview` command, which renders interactive or static previews from Design Concept Format (DCF) files. The command is intended for designers, developers, and reviewers to visually inspect DCF outputs without writing production code.

---

## Command Syntax

```bash
dcf preview <path...> [options]
```

### `<path...>`

One or more paths identifying what to preview. Each path may be:

* A **single DCF file** (`.yaml`, `.yml`, or `.json`)
* A **directory**, scanned recursively for previewable DCF files
* A **glob pattern**, such as `design/screens/*.yaml`

---

## Purpose and Scope

The `dcf preview` command:

* Transforms validated DCF files into **visual previews**
* Resolves design tokens, themes, and component composition
* Provides a fast feedback loop during design and implementation

The preview output is **non-authoritative** and **non-production** by design. It is intended for inspection, review, and collaboration—not as a final runtime artifact.

---

## Previewable Kinds

The following `kind` values are previewable:

* `component`
* `layout`
* `screen`
* `navigation`
* `flow`

Supporting kinds are automatically loaded when referenced:

* `tokens`
* `theme`
* `theming`
* `i18n`
* `rules`

If a non-previewable kind is passed directly, the command exits with a warning unless `--strict` is enabled.

---

## Processing Model

For each preview session:

1. **Input Resolution**

    * Paths are expanded and files are grouped by `kind`.

2. **Validation (Implicit)**

    * Each file is validated using the same rules as `dcf validate`.
    * Validation errors block preview unless `--allow-invalid` is set.

3. **Dependency Resolution**

    * Required supporting layers are resolved based on `capabilities`.
    * Overrides from CLI flags are applied.

4. **Normalization**

    * Tokens, themes, and variants are resolved into concrete values.
    * Conditional rules are evaluated where possible.

5. **Rendering**

    * A preview renderer converts the normalized model into visual output.
    * Renderer behavior is deterministic but implementation-defined.

---

## Output Modes

The preview command supports multiple output modes:

* **Interactive server** (default)

    * Launches a local preview server with hot reload

* **Static export**

    * Generates static HTML/CSS/JS previews

* **Snapshot**

    * Produces image or DOM snapshots for review or CI

---

## Options

```bash
dcf preview <path...> \
  [--profile lite|standard|strict] \
  [--capabilities <list>] \
  [--theme <name>] \
  [--locale <locale>] \
  [--renderer web|native|custom] \
  [--port <number>] \
  [--open] \
  [--static <out-dir>] \
  [--snapshot <out-dir>] \
  [--allow-invalid] \
  [--quiet]
```

### Option Details

* `--profile lite|standard|strict`

    * Controls validation and normalization strictness.

* `--capabilities <list>`

    * Explicitly declares which DCF layers are expected.

* `--theme <name>`

    * Selects a specific theme variant when multiple are defined.

* `--locale <locale>`

    * Chooses an i18n locale for preview rendering.

* `--renderer web|native|custom`

    * Selects the preview renderer backend.
    * `web` is the default and most portable.

* `--port <number>`

    * Port for the local preview server (interactive mode).

* `--open`

    * Automatically opens the preview in a browser.

* `--static <out-dir>`

    * Outputs a static preview bundle instead of starting a server.

* `--snapshot <out-dir>`

    * Generates preview snapshots (implementation-defined format).

* `--allow-invalid`

    * Attempt preview even if validation errors are present.

* `--quiet`

    * Suppress non-error output.

---

## Examples

Preview all screens with default settings:

```bash
dcf preview screens/
```

Preview a single component using a specific theme:

```bash
dcf preview components/Button.yaml --theme dark
```

Run preview server on a custom port and open browser:

```bash
dcf preview design/ --port 4000 --open
```

Export static previews:

```bash
dcf preview screens/ --static ./preview-dist
```

Generate snapshots for review or CI:

```bash
dcf preview screens/ --snapshot ./snapshots
```

---

## Error Handling

* Validation errors prevent preview by default
* Missing dependencies result in descriptive diagnostics
* Renderer failures are reported with actionable messages

Exit codes are deterministic and suitable for CI usage.

---

## Design Principles

The `dcf preview` command is designed to be:

* **Fast** — optimized for iteration and feedback
* **Deterministic** — same inputs produce the same preview
* **Layer-aware** — respects DCF separation of concerns
* **Non-authoritative** — preview output is illustrative, not canonical

This command bridges the gap between abstract design intent and concrete visual understanding within the DCF ecosystem.
