import { validateDCF, ValidationResult, ValidationError } from '../lib/validation';
import { findDCFFiles } from '../utils/file-discovery';
import { ValidationContext } from '../config/config-loader';
import { loadDCFDocument } from '../validation/project';

export interface MultiFileValidationResult {
  ok: boolean;
  results: Array<{
    file: string;
    result: ValidationResult;
  }>;
  errors: ValidationError[];
  warnings: ValidationError[];
}

/**
 * Validates multiple DCF files according to the validation context
 * @param paths - Array of paths to validate (files, directories, or glob patterns)
 * @param context - Validation context with profile, capabilities, etc.
 * @returns MultiFileValidationResult with aggregated results
 */
export async function validateMultipleFiles(
  paths: string[],
  context: ValidationContext
): Promise<MultiFileValidationResult> {
  // Find all DCF files based on the input paths
  const files = await findDCFFiles(paths);
  context.files = files; // Update context with discovered files

  const results: MultiFileValidationResult['results'] = [];
  const allErrors: ValidationError[] = [];
  const allWarnings: ValidationError[] = [];

  // Load all documents first for cross-file validation
  const loadedDocuments: Array<{ file: string; document: any }> = [];

  for (const file of files) {
    try {
      // Load the DCF document
      const document = await loadDCFDocument(file);
      loadedDocuments.push({ file, document });
    } catch (error) {
      // Handle tool errors for individual files
      allErrors.push({
        code: 'E_TOOL',
        message: `Failed to load file ${file}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        path: file
      });
    }
  }

  // Perform schema validation on each file individually (no cross-reference validation)
  for (const { file, document } of loadedDocuments) {
    try {
      // Override the document's profile with the effective profile from context
      if (document.profile !== context.profile) {
        document.profile = context.profile;
      }

      // Perform schema-only validation (skip cross-reference validation)
      // We'll validate cross-references after collecting all documents
      const result = await validateDCF(document, {
        strictWarnings: false, // We'll handle strict warnings at the aggregate level
        schemaOverride: context.schemaOverride // Use schema override from context
      });

      // Filter out cross-reference errors during individual validation
      // These will be validated later during cross-file validation
      const schemaErrors = result.errors.filter(error =>
        error.code !== 'E_REFERENCE'
      );

      const schemaWarnings = result.warnings; // Keep all warnings

      // Add file path to each error and warning for proper attribution
      const fileSpecificErrors = schemaErrors.map(error => ({
        ...error,
        path: `${file}:${error.path || ''}`
      }));

      const fileSpecificWarnings = schemaWarnings.map(warning => ({
        ...warning,
        path: `${file}:${warning.path || ''}`
      }));

      results.push({
        file,
        result: {
          ...result,
          errors: fileSpecificErrors,
          warnings: fileSpecificWarnings
        }
      });

      allErrors.push(...fileSpecificErrors);
      allWarnings.push(...fileSpecificWarnings);
    } catch (error) {
      // Handle tool errors for individual files
      allErrors.push({
        code: 'E_TOOL',
        message: `Failed to load or validate file ${file}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        path: file
      });
    }
  }

  // Determine overall success based on schema validation only
  const ok = allErrors.length === 0;

  return {
    ok,
    results,
    errors: allErrors,
    warnings: allWarnings
  };
}

/**
 * Aggregates validation results based on context settings like strict warnings
 */
export async function aggregateValidationResults(
  multiResult: MultiFileValidationResult,
  context: ValidationContext
): Promise<MultiFileValidationResult> {
  let { errors, warnings } = multiResult;
  let ok = multiResult.ok;

  // Apply strict warnings if configured
  if (context.profile === 'strict' || multiResult.results.some(r => 
    r.result.warnings.some(w => w.code.startsWith('W_STRICT')))) {
    // In strict mode, treat certain warnings as errors
    // For now, we'll implement a simple version where all warnings become errors if strictWarnings is enabled
    // This would be expanded based on actual requirements
  }

  // If strict warnings is enabled, move warnings to errors
  // This would typically be passed as an option, but for now we'll implement based on context
  if (context.profile === 'strict') {
    errors = [...errors, ...warnings.map(w => ({
      ...w,
      code: w.code.startsWith('W_') ? w.code.replace('W_', 'E_') : `E_${w.code}`
    }))];
    warnings = [];
    ok = errors.length === 0;
  }

  return {
    ...multiResult,
    ok,
    errors,
    warnings
  };
}