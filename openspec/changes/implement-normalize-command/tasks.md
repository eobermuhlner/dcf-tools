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

## 3. Multi-File Project Support

- [ ] 3.1 Reuse project loading functionality from validation command
- [ ] 3.2 Implement layer merging according to DCF merge rules
- [ ] 3.3 Add support for target project selection in multi-project manifests
- [ ] 3.4 Include all source layers in provenance metadata

## 4. Command Implementation

- [ ] 4.1 Create src/commands/normalize.ts with full implementation
- [ ] 4.2 Add file/project argument handling
- [ ] 4.3 Add --out option for specifying output file
- [ ] 4.4 Add --format option with json/yaml values
- [ ] 4.5 Add --pretty flag for human-readable output
- [ ] 4.6 Add --target option for selecting specific project in manifest
- [ ] 4.7 Implement proper error handling and exit codes

## 5. Integration with Existing Code

- [ ] 5.1 Update project loading utilities to support normalization needs
- [ ] 5.2 Ensure compatibility with existing validation infrastructure
- [ ] 5.3 Add normalization function to library API

## 6. Testing

- [ ] 6.1 Create unit tests for canonical JSON transformation
- [ ] 6.2 Test deterministic output with identical inputs
- [ ] 6.3 Test output format options (JSON, YAML, pretty)
- [ ] 6.4 Test output destination options (file, stdout)
- [ ] 6.5 Test multi-file project normalization
- [ ] 6.6 Test target project selection
- [ ] 6.7 Test provenance metadata inclusion
- [ ] 6.8 Verify exit codes work correctly in all scenarios

## 7. Documentation

- [ ] 7.1 Update command help text with usage examples
- [ ] 7.2 Document all available options and their effects
- [ ] 7.3 Create sample normalization output examples
- [ ] 7.4 Update main README with normalize command documentation
- [ ] 7.5 Add usage examples for common normalization scenarios