# `dcf validate` Command Specification

This document defines the `dcf validate` command used to validate Design Concept Format (DCF) files against the official DCF schemas and validation rules.

---

## Command Syntax

```bash
dcf validate <path...> [options]
```

### `<path...>`

One or more paths identifying what to validate. Each path may be:

* A **single DCF file** (`.yaml`, `.yml`, or `.json`)
* A **directory**, which will be scanned recursively for DCF files
* A **glob pattern** (shell-expanded), such as `design/**/*.yaml`

---

## Validation Behavior

For each DCF file, validation proceeds in the following order:

1. **DCF Version Check**

    * The file must declare `dcf_version`.
    * Version must follow semantic versioning: `MAJOR.MINOR.PATCH`.

2. **Kind-Based Schema Resolution**

    * The `kind` field is read.
    * The corresponding schema is selected automatically.

   Supported kinds include:

    * `tokens`
    * `theme`
    * `theming`
    * `component`
    * `layout`
    * `screen`
    * `navigation`
    * `flow`
    * `rules`
    * `i18n`

3. **Schema Validation**

    * The file is validated against its resolved JSON Schema.
    * Required fields, types, enums, and constraints are enforced.

4. **Profile-Based Strictness**

    * Validation rules are applied according to the effective `profile`.
    * Default profile is `standard`.

5. **Cross-File Validation (Set Validation)**

    * When validating directories or multiple files, optional cross-file checks are performed.
    * These checks are guided by declared or inferred `capabilities`.
    * Example: validating `screens` implies required `components`, `tokens`, and `themes`.

---

## Profiles

Profiles control validation strictness:

* **lite**

    * Minimal required fields
    * Warnings preferred over errors
    * Suitable for early exploration

* **standard** (default)

    * Enforces all required schema fields
    * Balanced strictness

* **strict**

    * No unknown fields
    * Strong cross-file enforcement
    * Intended for CI and production use

CLI flags may override file-declared profiles.

---

## Options

```bash
dcf validate <path...> \
  [--profile lite|standard|strict] \
  [--config <dcf-root.yaml>] \
  [--capabilities <list>] \
  [--schemas <dir-or-url>] \
  [--format text|json] \
  [--fail-on warn|error] \
  [--quiet] \
  [--no-cross]
```

### Option Details

* `--profile lite|standard|strict`

    * Overrides the effective profile for all validated files.

* `--config <dcf-root.yaml>`

    * Root configuration file providing defaults for:

        * `dcf_version`
        * `profile`
        * `capabilities`

* `--capabilities <list>`

    * Comma-separated list of enabled layers (e.g. `tokens,components,screens`).
    * Missing layers outside this list do not produce errors.

* `--schemas <dir-or-url>`

    * Use a custom schema bundle instead of the built-in one.
    * Enables deterministic and pinned CI validation.

* `--format text|json`

    * Output diagnostics in human-readable text or machine-readable JSON.

* `--fail-on warn|error`

    * `error` (default): exit non-zero only on errors
    * `warn`: exit non-zero on warnings or errors

* `--quiet`

    * Suppress non-error output.

* `--no-cross`

    * Disable cross-file and capability-based validation.
    * Each file is validated independently.

---

## Examples

Validate a single file:

```bash
dcf validate components/Button.yaml
```

Validate a directory using strict rules:

```bash
dcf validate design/ --profile strict
```

Validate only screen-related layers:

```bash
dcf validate screens/ --capabilities screens
```

CI-friendly validation with JSON output:

```bash
dcf validate design/ --format json --fail-on warn
```

---

## Design Principles

The `dcf validate` command is designed to be:

* **Deterministic** — schema selection is driven by `kind`
* **Composable** — supports partial adoption via `capabilities`
* **CI-safe** — strict mode, pinned schemas, and JSON output
* **Forward-compatible** — versioned via `dcf_version`

This makes validation predictable, automatable, and aligned with the DCF philosophy.
