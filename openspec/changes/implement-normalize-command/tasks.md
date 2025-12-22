## 1. Core Normalization Implementation

- [ ] 1.1 Create function to transform DCF document to canonical JSON format
- [ ] 1.2 Implement stable key ordering for deterministic output
- [ ] 1.3 Add support for provenance metadata in `meta` section
- [ ] 1.4 Include resolved dcf_version and profile in output
- [ ] 1.5 Add layer information to provenance metadata

## 2. Output Formatting

- [ ] 2.1 Implement JSON output formatter with optional pretty printing
- [ ] 2.2 Implement YAML output formatter using js-yaml library
- [ ] 2.3 Add support for writing to output file or stdout
- [ ] 2.4 Ensure deterministic formatting regardless of input format

## 3. Command Implementation

- [ ] 3.1 Create src/commands/normalize.ts with full implementation
- [ ] 3.2 Add file argument handling
- [ ] 3.3 Add --out option for specifying output file
- [ ] 3.4 Add --format option with json/yaml values
- [ ] 3.5 Add --pretty flag for human-readable output
- [ ] 3.6 Implement proper error handling and exit codes

## 4. Integration with Existing Code

- [ ] 4.1 Ensure compatibility with existing validation infrastructure
- [ ] 4.2 Add normalization function to library API

## 5. Testing

- [ ] 5.1 Create unit tests for canonical JSON transformation
- [ ] 5.2 Test deterministic output with identical inputs
- [ ] 5.3 Test output format options (JSON, YAML, pretty)
- [ ] 5.4 Test output destination options (file, stdout)
- [ ] 5.5 Test provenance metadata inclusion
- [ ] 5.6 Verify exit codes work correctly in all scenarios

## 6. Documentation

- [ ] 6.1 Update command help text with usage examples
- [ ] 6.2 Document all available options and their effects
- [ ] 6.3 Create sample normalization output examples
- [ ] 6.4 Update main README with normalize command documentation
- [ ] 6.5 Add usage examples for common normalization scenarios