## Context

This is the initial project setup for dcf-tools. The CLI will serve as the primary interface for DCF document processing and will also expose a library API for downstream tools (dcf-agent, dcf-mcp).

**Stakeholders:**
- Developers using the CLI directly
- dcf-agent and dcf-mcp consuming the library API
- CI systems running validation

**Constraints:**
- Must support Node.js 20+
- Deterministic output is mandatory
- JSON is canonical output format
- Exit codes must follow convention (0=success, 1=validation error, 2=tool error)

## Goals / Non-Goals

**Goals:**
- Establish consistent project structure for future development
- Enable `dcf --help` and `dcf --version` immediately
- Set up build, test, and lint tooling
- Create extensible command architecture

**Non-Goals:**
- Implement any actual DCF processing logic
- Define the library API surface (deferred to command implementation)
- Set up CI/CD pipelines

## Decisions

### Decision 1: Use Commander.js for CLI parsing
- **Why:** Mature, well-documented, supports subcommands, auto-generates help
- **Alternatives considered:**
  - yargs: Also good, but Commander has simpler TypeScript integration
  - oclif: Too heavy for this use case
  - Hand-rolled: Unnecessary complexity

### Decision 2: Use tsup for building
- **Why:** Zero-config bundler, fast, supports multiple output formats (ESM/CJS)
- **Alternatives considered:**
  - esbuild directly: More manual configuration needed
  - tsc only: No bundling, slower
  - Rollup: More complex configuration

### Decision 3: Use vitest for testing
- **Why:** Fast, native TypeScript support, compatible with Jest API
- **Alternatives considered:**
  - Jest: Slower, needs ts-jest configuration
  - Node test runner: Less mature ecosystem

### Decision 4: Source directory structure
```
src/
├── cli.ts              # CLI entry point
├── commands/           # Command implementations
│   ├── index.ts        # Command registry
│   ├── validate.ts     # dcf validate (placeholder)
│   ├── normalize.ts    # dcf normalize (placeholder)
│   ├── inspect.ts      # dcf inspect (placeholder)
│   └── lint.ts         # dcf lint (placeholder)
├── lib/                # Core library (shared logic)
│   └── index.ts        # Library entry point
└── utils/              # Shared utilities
    └── index.ts
```

- **Why:** Separates CLI concerns from library logic, enables clean imports
- Commands are standalone modules that can be tested independently
- lib/ will contain the programmatic API consumed by dcf-agent/dcf-mcp

### Decision 5: Package exports
```json
{
  "exports": {
    ".": "./dist/lib/index.js",
    "./cli": "./dist/cli.js"
  },
  "bin": {
    "dcf": "./dist/cli.js"
  }
}
```

- **Why:** Allows `import { validate } from 'dcf-tools'` for library usage
- CLI is a separate entry point with shebang

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Commander.js may not fit all needs | Well-established, can extend if needed |
| Structure may need refinement | Keep it minimal, refactor as patterns emerge |
| Library API undefined | Defer to implementation phase |

## Migration Plan

Not applicable - greenfield project.

## Open Questions

1. Should we add a `dcf init` command to scaffold DCF projects? (Deferred)
2. Should we support global installation via npm? (Yes, standard practice)
