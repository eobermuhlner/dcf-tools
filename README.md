# DCF Tools

Command-line tools for Design Concept Format (DCF) documents.

## Overview

DCF Tools provides a comprehensive suite of command-line utilities for working with Design Concept Format documents. This toolkit enables validation, normalization, inspection, and linting of DCF files.

## Installation

### Prerequisites
- Node.js 20 or higher

### From Source
```bash
# Clone the repository
git clone <repository-url>
cd dcf-tools

# Install dependencies
npm install

# Build the project
npm run build

# Link globally (optional)
npm link
```

## Available Commands

Currently, the following commands are available:

- `dcf validate` - Validate DCF documents against schema and reference rules
- `dcf normalize` - Normalize DCF documents (implementation pending)
- `dcf inspect` - Inspect DCF documents (implementation pending)
- `dcf lint` - Lint DCF documents (implementation pending)

### Global Options
- `--version` - Show version information
- `--help` - Show help information

### Validate Command

The `dcf validate` command validates DCF documents against both the official JSON Schema and performs reference validation.

#### Usage

```bash
# Validate a single DCF document
dcf validate --file path/to/document.json

# Validate a multi-file DCF project
dcf validate --project path/to/project

# Validate a specific project from a manifest with multiple projects
dcf validate --project path/to/project --target web

# Output in JSON format
dcf validate --file document.json --format json

# Treat warnings as errors
dcf validate --file document.json --strict-warnings
```

#### Options

- `--project <path>` - Project root directory (default: current directory)
- `--manifest <path>` - Path to dcf.project.yaml (default: `<project>/dcf.project.yaml`)
- `--target <projectName>` - Specific project name if manifest has multiple projects
- `--file <path>` - Path to single DCF document (alternative to --project)
- `--format <format>` - Output format: json or text (default: text unless CI=true)
- `--strict-warnings` - Treat warnings as errors (exit code 1)

#### Exit Codes

- `0` - Success (document is valid)
- `1` - Validation errors found
- `2` - Tool failure (network issues, file not found, etc.)

## Development

### Scripts

- `npm run build` - Build the project
- `npm run dev` - Build in watch mode
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Lint the code
- `npm run format` - Format the code
- `npm run type-check` - Check TypeScript types

### Examples

The `examples/` directory contains various DCF documents demonstrating different features:

- `minimal/` - Basic valid DCF document
- `basic/` - DCF with tokens and components
- `complex/` - Comprehensive DCF with all features
- `project-example/` - Multi-file DCF project with manifest
- `invalid/` - Intentionally invalid document for testing

You can validate examples using:
```bash
dcf validate --file examples/basic/basic.json
dcf validate --project examples/project-example
```

### Project Structure

```
src/
├── cli.ts              # CLI entry point
├── commands/           # Command implementations
│   ├── validate.ts     # dcf validate command
│   ├── normalize.ts    # dcf normalize command
│   ├── inspect.ts      # dcf inspect command
│   └── lint.ts         # dcf lint command
├── lib/                # Core library
│   └── index.ts        # Library entry point
└── utils/              # Shared utilities
    └── index.ts        # Utility functions
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

MIT