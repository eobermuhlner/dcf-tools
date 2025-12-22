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
- `dcf normalize` - Transform DCF documents to canonical JSON format
- `dcf inspect` - Inspect DCF documents (implementation pending)
- `dcf lint` - Lint DCF documents (implementation pending)
- `dcf preview` - Start a local web server to preview DCF documents visually

### Global Options
- `--version` - Show version information
- `--help` - Show help information

### Validate Command

The `dcf validate` command validates DCF documents against both the official JSON Schema and performs reference validation.

#### Usage

```bash
# Validate a single DCF document
dcf validate path/to/document.json

# Output in JSON format
dcf validate document.json --format json

# Treat warnings as errors
dcf validate document.json --strict-warnings
```

#### Options

- `[file]` - Path to DCF document to validate (argument, not flag)
- `--format <format>` - Output format: json or text (default: text unless CI=true)
- `--strict-warnings` - Treat warnings as errors (exit code 1)

#### Exit Codes

- `0` - Success (document is valid)
- `1` - Validation errors found
- `2` - Tool failure (network issues, file not found, etc.)

### Normalize Command

The `dcf normalize` command transforms DCF documents to canonical JSON format with stable key ordering.

#### Usage

```bash
# Normalize a DCF document to JSON
dcf normalize path/to/document.json

# Output in YAML format
dcf normalize document.json --format yaml

# Pretty-print output
dcf normalize document.json --pretty

# Write output to file
dcf normalize document.json --out output.json
```

#### Options

- `[file]` - Path to DCF document to normalize (argument, not flag)
- `--out <file>` - Output file (default: stdout)
- `--format <format>` - Output format: json or yaml (default: json)
- `--pretty` - Pretty-print output for readability

#### Exit Codes

- `0` - Success (document normalized)
- `2` - Tool failure (file not found, invalid format, etc.)

### Preview Command

The `dcf preview` command starts a local web server to visually preview DCF documents in a browser with real-time updates.

#### Usage

```bash
# Start preview server for a DCF document
dcf preview path/to/document.json

# Start preview server on a specific port
dcf preview document.json --port 8080

# Start preview server on a specific host
dcf preview document.json --host 0.0.0.0

# Start preview server and automatically open browser
dcf preview document.json --open
```

#### Options

- `<file>` - Path to DCF document to preview (required)
- `--port <port>` - Port to run the preview server on (default: 3000)
- `--host <host>` - Host to bind the server to (default: localhost)
- `--open` - Open the preview in the default browser (default: false)

#### Features

- Real-time preview with hot reload when DCF file changes
- Visual representation of tokens, components, and layouts
- Color previews for color tokens
- Validation error display in the UI
- File change detection and automatic refresh

#### Exit Codes

- `0` - Success (server terminated normally)
- `2` - Tool failure (file not found, invalid format, server error, etc.)

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
dcf validate examples/basic/basic.json
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