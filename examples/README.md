# DCF Examples

This directory contains example DCF documents demonstrating different features and use cases.

## Examples

### minimal/
- `minimal.json` - The most basic valid DCF document with only required fields

### basic/
- `basic.json` - A simple DCF document with tokens and components

### complex/
- `complex.json` - A comprehensive DCF document with tokens, components, layouts, screens, and navigation
- `complex.yaml` - The same example in YAML format

### project-example/
- A multi-file DCF project with separate files for tokens and components
- Includes `dcf.project.yaml` manifest file to define the project structure

### invalid/
- `invalid.json` - An intentionally invalid DCF document with reference errors for testing validation

## Usage

You can validate any of these examples using the `dcf validate` command:

```bash
# Validate a single file
dcf validate --file examples/minimal/minimal.json

# Validate a multi-file project
dcf validate --project examples/project-example

# Output in JSON format
dcf validate --file examples/basic/basic.json --format json
```