# DCF Tools

Command-line tools for Data Contract Framework (DCF) documents.

## Overview

DCF Tools provides a comprehensive suite of command-line utilities for working with Data Contract Framework documents. This toolkit enables validation, normalization, inspection, and linting of DCF files.

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

Currently, the following commands are available as placeholders:

- `dcf validate` - Validate DCF documents (implementation pending)
- `dcf normalize` - Normalize DCF documents (implementation pending)
- `dcf inspect` - Inspect DCF documents (implementation pending)
- `dcf lint` - Lint DCF documents (implementation pending)

### Global Options
- `--version` - Show version information
- `--help` - Show help information

## Development

### Scripts

- `npm run build` - Build the project
- `npm run dev` - Build in watch mode
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Lint the code
- `npm run format` - Format the code
- `npm run type-check` - Check TypeScript types

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