# Change: Create DCF CLI Skeleton Project

## Why

The dcf-tools repository needs an initial project structure to implement the DCF CLI tool. This skeleton provides the foundation for all subsequent features (validate, normalize, inspect, lint, diff, graph) and establishes patterns for the codebase.

## What Changes

- Initialize TypeScript/Node.js project with package.json, tsconfig.json
- Set up build tooling (tsup) and test framework (vitest)
- Create CLI entry point with Commander.js for command routing
- Establish source directory structure for commands, lib, and utils
- Add placeholder commands structure for future implementation
- Configure linting (ESLint) and formatting (Prettier)
- Create basic README with usage instructions

## Impact

- Affected specs: `cli-core` (new capability)
- Affected code: All new files (greenfield project)
- Dependencies: Node.js 20+, TypeScript, tsup, vitest, Commander.js

## Out of Scope

- Actual command implementations (validate, normalize, etc.)
- YAML/JSON parsing logic
- Schema validation logic
- DCF file discovery and loading
- Golden tests (requires working commands)

These will be implemented in subsequent proposals.
