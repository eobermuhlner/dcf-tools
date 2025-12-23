# cross-file-validation Specification

## Purpose
TBD - created by archiving change implement-validate-command-enhanced. Update Purpose after archive.
## Requirements
### Requirement: Cross-File Reference Validation
The system SHALL validate that references between files point to existing definitions when validating multiple files together.

#### Scenario: Valid cross-file component reference
- **GIVEN** a layout file that references a component defined in a separate file
- **AND** both files are being validated together
- **WHEN** user runs `dcf validate layout.yaml component.yaml`
- **THEN** the system validates that the component reference in the layout file exists in the component file
- **AND** reports no cross-file validation errors

#### Scenario: Invalid cross-file component reference
- **GIVEN** a layout file that references a non-existent component
- **AND** both the layout file and other component files are being validated together
- **WHEN** user runs `dcf validate layout.yaml components/*.yaml`
- **THEN** the system detects the missing component reference
- **AND** reports a cross-file validation error
- **AND** includes the source file and target reference in the error message

### Requirement: Capability-Based Validation
The system SHALL support validating based on declared or inferred capabilities that determine which layers are required.

#### Scenario: Screens capability validation
- **GIVEN** a directory with screen files that reference components
- **WHEN** user runs `dcf validate screens/ --capabilities screens`
- **THEN** the system expects to find referenced components in the validated files or available layers
- **AND** reports errors for missing component references if components capability is implied

#### Scenario: Optional capability validation
- **GIVEN** a directory with screen files that reference components
- **WHEN** user runs `dcf validate screens/ --capabilities screens,tokens`
- **THEN** the system validates screens and tokens layers
- **AND** but may not require components if not explicitly included in capabilities
- **AND** reports fewer cross-file validation errors

### Requirement: Dependency Graph Construction
The system SHALL build a dependency graph of references between files to enable efficient cross-file validation.

#### Scenario: Dependency graph for tokens and components
- **GIVEN** multiple files with token references in components
- **WHEN** the system performs cross-file validation
- **THEN** the system constructs a dependency graph showing which components reference which tokens
- **AND** uses this graph to validate all token references exist

#### Scenario: Circular dependency detection
- **GIVEN** files with potential circular references
- **WHEN** the system builds the dependency graph
- **THEN** the system detects circular dependencies
- **AND** reports them as validation errors if they violate DCF specification

### Requirement: Set Validation
The system SHALL perform validation across the entire set of files being validated together.

#### Scenario: Complete design system validation
- **GIVEN** a directory containing tokens, components, layouts, and screens
- **WHEN** user runs `dcf validate design/`
- **THEN** the system validates the complete set as a cohesive design system
- **AND** checks that all references between layers are valid
- **AND** validates capability-specific rules across the entire set

#### Scenario: Partial validation
- **GIVEN** a directory with multiple types of DCF files
- **WHEN** user runs `dcf validate design/ --capabilities tokens,components`
- **THEN** the system validates only the specified capabilities
- **AND** applies appropriate validation rules for the selected capabilities
- **AND** may skip validation of dependencies outside the specified capabilities

### Requirement: Cross-File Validation Performance
The system SHALL perform cross-file validation efficiently without excessive memory usage.

#### Scenario: Large multi-file validation
- **GIVEN** a large project with hundreds of DCF files
- **WHEN** user runs `dcf validate large-project/`
- **THEN** the system performs cross-file validation with reasonable performance
- **AND** uses memory-efficient algorithms for dependency tracking
- **AND** reports progress if validation takes significant time

### Requirement: Selective Cross-File Validation
The system SHALL allow disabling cross-file validation while maintaining individual file validation.

#### Scenario: Individual file validation mode
- **GIVEN** multiple DCF files with cross-references
- **WHEN** user runs `dcf validate dir/ --no-cross`
- **THEN** the system validates each file independently
- **AND** does not check cross-file references
- **AND** reports only individual file schema and reference errors
- **AND** completes validation faster than with cross-validation enabled

### Requirement: Cross-File Error Attribution
The system SHALL clearly attribute cross-file validation errors to the appropriate source and target files.

#### Scenario: Cross-file error reporting
- **GIVEN** a layout file that references a non-existent component in a separate file
- **WHEN** cross-file validation detects the error
- **THEN** the system reports the error with clear attribution
- **AND** indicates which file contains the reference (source)
- **AND** indicates what is being referenced (target)
- **AND** provides the file path and location within the source file

