## 1. Schema Validation Implementation

- [ ] 1.1 Research and select JSON Schema validator library (Ajv recommended)
- [ ] 1.2 Implement schema fetching from dcf-spec GitHub Pages
- [ ] 1.3 Create function to validate DCF document against appropriate schema based on dcf_version
- [ ] 1.4 Handle version compatibility (patch/minor acceptance, major rejection)
- [ ] 1.5 Add tests for schema validation with valid and invalid documents

## 2. Reference Validation Implementation

- [ ] 2.1 Create function to extract all defined tokens from DCF document
- [ ] 2.2 Create function to extract all defined components from DCF document
- [ ] 2.3 Create function to extract all defined layouts, screens, and routes
- [ ] 2.4 Create function to validate all token references point to existing tokens
- [ ] 2.5 Create function to validate all component references point to existing components
- [ ] 2.6 Create function to validate all layout/screen/route references
- [ ] 2.7 Add tests for reference validation with valid and invalid documents

## 3. Multi-File Project Support

- [ ] 3.1 Create function to parse dcf.project.yaml manifest files
- [ ] 3.2 Implement layer loading according to manifest specifications
- [ ] 3.3 Implement deep-merge logic for objects and replace logic for arrays
- [ ] 3.4 Add support for project root directory specification
- [ ] 3.5 Add support for target project selection in multi-project manifests
- [ ] 3.6 Add tests for multi-file project validation

## 4. Command Implementation

- [ ] 4.1 Create src/commands/validate.ts with full implementation
- [ ] 4.2 Add --project option for specifying project root
- [ ] 4.3 Add --manifest option for specifying manifest file path
- [ ] 4.4 Add --target option for selecting specific project in manifest
- [ ] 4.5 Add --format option with json/text values
- [ ] 4.6 Add --strict-warnings flag to treat warnings as errors
- [ ] 4.7 Implement proper error handling and exit codes

## 5. Output Formatting

- [ ] 5.1 Create validation result data structure matching spec
- [ ] 5.2 Implement JSON output formatter with stable structure
- [ ] 5.3 Implement text output formatter with human-readable messages
- [ ] 5.4 Add CI environment detection for automatic JSON output
- [ ] 5.5 Ensure deterministic output ordering

## 6. Error Reporting

- [ ] 6.1 Define error codes (E_SCHEMA, E_REFERENCE, etc.)
- [ ] 6.2 Create error message templates with actionable guidance
- [ ] 6.3 Include file paths and location information in errors when possible
- [ ] 6.4 Implement proper error categorization (errors vs warnings)
- [ ] 6.5 Add tests for different error scenarios

## 7. Integration and Testing

- [ ] 7.1 Create integration tests for validate command with sample DCF documents
- [ ] 7.2 Test with examples from dcf-spec repository
- [ ] 7.3 Test multi-file project scenarios
- [ ] 7.4 Verify exit codes work correctly in all scenarios
- [ ] 7.5 Test command help and option validation

## 8. Documentation and Examples

- [ ] 8.1 Update command help text with usage examples
- [ ] 8.2 Document all available options and their effects
- [ ] 8.3 Create sample validation output examples
- [ ] 8.4 Update main README with validate command documentation
- [ ] 8.5 Add usage examples for common validation scenarios