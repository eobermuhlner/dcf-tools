## 1. Project Initialization

- [ ] 1.1 Create package.json with name "dcf-tools", version "0.1.0"
- [ ] 1.2 Configure TypeScript (tsconfig.json) targeting ES2022, Node16 module resolution
- [ ] 1.3 Add .gitignore for node_modules, dist, coverage, .env

## 2. Build Tooling

- [ ] 2.1 Install and configure tsup for bundling
- [ ] 2.2 Add build script producing ESM output in dist/
- [ ] 2.3 Verify shebang added to CLI entry point

## 3. Test Framework

- [ ] 3.1 Install and configure vitest
- [ ] 3.2 Add test script to package.json
- [ ] 3.3 Create sample test to verify setup works

## 4. Code Quality

- [ ] 4.1 Install and configure ESLint with TypeScript support
- [ ] 4.2 Install and configure Prettier
- [ ] 4.3 Add lint and format scripts to package.json

## 5. CLI Structure

- [ ] 5.1 Create src/cli.ts with Commander.js setup
- [ ] 5.2 Add --version flag reading from package.json
- [ ] 5.3 Add --help with program description
- [ ] 5.4 Register placeholder subcommands (validate, normalize, inspect, lint)

## 6. Source Structure

- [ ] 6.1 Create src/commands/ directory with placeholder modules
- [ ] 6.2 Create src/lib/index.ts as library entry point
- [ ] 6.3 Create src/utils/index.ts for shared utilities

## 7. Package Configuration

- [ ] 7.1 Configure package.json exports for library and CLI
- [ ] 7.2 Set bin field for dcf command
- [ ] 7.3 Set engines field requiring Node 20+

## 8. Documentation

- [ ] 8.1 Create README.md with project overview
- [ ] 8.2 Document installation instructions (npm install, npm link)
- [ ] 8.3 Document available commands (placeholders)

## 9. Validation

- [ ] 9.1 Run `npm install` successfully
- [ ] 9.2 Run `npm run build` successfully
- [ ] 9.3 Run `npm test` successfully
- [ ] 9.4 Verify `dcf --help` outputs expected text
- [ ] 9.5 Verify `dcf --version` outputs 0.1.0
- [ ] 9.6 Verify `dcf validate --help` shows placeholder message
