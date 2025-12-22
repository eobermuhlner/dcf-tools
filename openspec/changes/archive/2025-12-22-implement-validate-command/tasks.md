## 1. Schema Validation Implementation

- [x] 1.1 Research and select JSON Schema validator library (Ajv recommended)
- [x] 1.2 Implement schema fetching from dcf-spec GitHub Pages
- [x] 1.3 Create function to validate DCF document against appropriate schema based on dcf_version
- [x] 1.4 Handle version compatibility (patch/minor acceptance, major rejection)
- [x] 1.5 Add tests for schema validation with valid and invalid documents

## 2. Reference Validation Implementation

- [x] 2.1 Create function to extract all defined tokens from DCF document
- [x] 2.2 Create function to extract all defined components from DCF document
- [x] 2.3 Create function to extract all defined layouts, screens, and routes
- [x] 2.4 Create function to validate all token references point to existing tokens
- [x] 2.5 Create function to validate all component references point to existing components
- [x] 2.6 Create function to validate all layout/screen/route references
- [x] 2.7 Add tests for reference validation with valid and invalid documents

## 3. Multi-File Project Support

- [x] 3.1 Create function to parse dcf.project.yaml manifest files
- [x] 3.2 Implement layer loading according to manifest specifications
- [x] 3.3 Implement deep-merge logic for objects and replace logic for arrays
- [x] 3.4 Add support for project root directory specification
- [x] 3.5 Add support for target project selection in multi-project manifests
- [x] 3.6 Add tests for multi-file project validation

## 4. Command Implementation

- [x] 4.1 Create src/commands/validate.ts with full implementation
- [x] 4.2 Add --project option for specifying project root
- [x] 4.3 Add --manifest option for specifying manifest file path
- [x] 4.4 Add --target option for selecting specific project in manifest
- [x] 4.5 Add --format option with json/text values
- [x] 4.6 Add --strict-warnings flag to treat warnings as errors
- [x] 4.7 Implement proper error handling and exit codes

## 5. Output Formatting

- [x] 5.1 Create validation result data structure matching spec
- [x] 5.2 Implement JSON output formatter with stable structure
- [x] 5.3 Implement text output formatter with human-readable messages
- [x] 5.4 Add CI environment detection for automatic JSON output
- [x] 5.5 Ensure deterministic output ordering

## 6. Error Reporting

- [x] 6.1 Define error codes (E_SCHEMA, E_REFERENCE, etc.)
- [x] 6.2 Create error message templates with actionable guidance
- [x] 6.3 Include file paths and location information in errors when possible
- [x] 6.4 Implement proper error categorization (errors vs warnings)
- [x] 6.5 Add tests for different error scenarios

## 7. Integration and Testing

- [x] 7.1 Create integration tests for validate command with sample DCF documents
- [x] 7.2 Test with examples from dcf-spec repository
- [x] 7.3 Test multi-file project scenarios
- [x] 7.4 Verify exit codes work correctly in all scenarios
- [x] 7.5 Test command help and option validation

## 8. Documentation and Examples

- [x] 8.1 Update command help text with usage examples
- [x] 8.2 Document all available options and their effects
- [x] 8.3 Create sample validation output examples
- [x] 8.4 Update main README with validate command documentation
- [x] 8.5 Add usage examples for common validation scenarios