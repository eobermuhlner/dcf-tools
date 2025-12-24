import { validateSchema, ValidationResult, ValidationError } from '../validation/schema';
import { validateReferences as validateReferencesImpl } from '../validation/references';
import { loadProjectManifest, getProjectConfig, loadAndMergeProjectLayers, loadDCFDocument } from '../validation/project';

/**
 * Main validation function that combines schema and reference validation
 */
export async function validateDCF(
  input: string | any,
  options: {
    strictWarnings?: boolean;
    schemaOverride?: string;  // Path or URL to custom schema bundle
  } = {}
): Promise<ValidationResult> {
  let dcfDocument: any;
  let validationResult: ValidationResult = {
    ok: true,
    errors: [],
    warnings: []
  };

  try {
    // Load single document
    if (typeof input === 'string') {
      // If input is a file path, load the document
      dcfDocument = await loadDCFDocument(input);
    } else {
      // Input is already a document object
      dcfDocument = input;
    }

    // Store document metadata if available
    if (dcfDocument.dcf_version) {
      validationResult.dcf_version = dcfDocument.dcf_version;
    }
    if (dcfDocument.profile) {
      validationResult.profile = dcfDocument.profile;
    }

    // Perform schema validation
    // If a schema override is provided, we would need to update validateSchema to support it
    // For now, we'll pass the schema override to the validation function
    const schemaResult = await validateSchema(dcfDocument, options.schemaOverride);
    validationResult.errors.push(...schemaResult.errors);
    validationResult.warnings.push(...schemaResult.warnings);
    if (!schemaResult.ok) {
      validationResult.ok = false;
    }

    // Preserve schema URL from schema validation
    if (schemaResult.schema_url) {
      validationResult.schema_url = schemaResult.schema_url;
    }

    // Perform reference validation if schema validation passed
    // (or if we want to continue despite schema errors)
    if (schemaResult.ok || validationResult.errors.length === 0) {
      const referenceResult = await validateReferencesImpl(dcfDocument);
      validationResult.errors.push(...referenceResult.errors);
      validationResult.warnings.push(...referenceResult.warnings);
      if (!referenceResult.ok) {
        validationResult.ok = false;
      }
    }

    // Apply strict warnings option
    if (options.strictWarnings && validationResult.warnings.length > 0) {
      validationResult.ok = false;
      // Move warnings to errors
      validationResult.errors.push(...validationResult.warnings.map(w => ({
        ...w,
        code: w.code.startsWith('W_') ? w.code.replace('W_', 'E_') : `E_${w.code}`
      })));
      validationResult.warnings = [];
    }

  } catch (error) {
    // Handle tool errors (exit code 2)
    validationResult.ok = false;
    validationResult.errors.push({
      code: 'E_TOOL',
      message: error instanceof Error ? error.message : 'Unknown tool error',
      path: ''
    });
  }

  return validationResult;
}

// Export types and other validation functions for library use
export { ValidationError, ValidationResult } from '../validation/schema';
export { validateSchema } from '../validation/schema';
export { validateReferences } from '../validation/references';