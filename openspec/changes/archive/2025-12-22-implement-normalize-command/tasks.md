## 1. Core Normalization Implementation

- [x] 1.1 Create function to transform DCF document to canonical JSON format
- [x] 1.2 Implement stable key ordering for deterministic output
- [x] 1.3 Add support for provenance metadata in `meta` section
- [x] 1.4 Include resolved dcf_version and profile in output
- [x] 1.5 Add layer information to provenance metadata

## 2. Output Formatting

- [x] 2.1 Implement JSON output formatter with optional pretty printing
- [x] 2.2 Implement YAML output formatter using js-yaml library
- [x] 2.3 Add support for writing to output file or stdout
- [x] 2.4 Ensure deterministic formatting regardless of input format

## 3. Command Implementation

- [x] 3.1 Create src/commands/normalize.ts with full implementation
- [x] 3.2 Add file argument handling
- [x] 3.3 Add --out option for specifying output file
- [x] 3.4 Add --format option with json/yaml values
- [x] 3.5 Add --pretty flag for human-readable output
- [x] 3.6 Implement proper error handling and exit codes

## 4. Integration with Existing Code

- [x] 4.1 Ensure compatibility with existing validation infrastructure
- [x] 4.2 Add normalization function to library API

## 5. Testing

- [x] 5.1 Create unit tests for canonical JSON transformation
- [x] 5.2 Test deterministic output with identical inputs
- [x] 5.3 Test output format options (JSON, YAML, pretty)
- [x] 5.4 Test output destination options (file, stdout)
- [x] 5.5 Test provenance metadata inclusion
- [x] 5.6 Verify exit codes work correctly in all scenarios

## 6. Documentation

- [x] 6.1 Update command help text with usage examples
- [x] 6.2 Document all available options and their effects
- [x] 6.3 Create sample normalization output examples
- [x] 6.4 Update main README with normalize command documentation
- [x] 6.5 Add usage examples for common normalization scenarios