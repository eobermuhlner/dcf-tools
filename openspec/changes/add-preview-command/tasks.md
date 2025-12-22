## 1. CLI Integration
- [ ] 1.1 Add `preview` command to CLI entry point using Commander.js
- [ ] 1.2 Implement command options: `--port`, `--host`, `--open` for server configuration
- [ ] 1.3 Add help text and usage examples for the preview command

## 2. Web Server Implementation
- [ ] 2.1 Set up Vite-based development server programmatically
- [ ] 2.2 Create API endpoint to serve current DCF document and validation results
- [ ] 2.3 Implement file watching with chokidar to detect DCF file changes
- [ ] 2.4 Add hot reload functionality to refresh the preview when files change

## 3. Frontend Application
- [ ] 3.1 Create React-based viewer application
- [ ] 3.2 Implement DCF document loading from the API endpoint
- [ ] 3.3 Add validation and normalization within the frontend
- [ ] 3.4 Create visual rendering of DCF components using HTML/CSS
- [ ] 3.5 Display validation/render errors in the UI

## 4. Backend Integration
- [ ] 4.1 Integrate validation-core functionality into preview flow
- [ ] 4.2 Integrate normalize-core functionality for internal model
- [ ] 4.3 Add file loading and parsing for DCF documents
- [ ] 4.4 Implement error handling for invalid DCF files

## 5. Testing
- [ ] 5.1 Add unit tests for CLI command
- [ ] 5.2 Add integration tests for server functionality
- [ ] 5.3 Add tests for file watching and hot reload
- [ ] 5.4 Add tests for validation and normalization in preview context

## 6. Documentation and Examples
- [ ] 6.1 Update README with preview command usage
- [ ] 6.2 Add example DCF files for testing the preview functionality
- [ ] 6.3 Create usage examples and screenshots