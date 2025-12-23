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

  // Validate each file individually
  for (const file of files) {
    try {
      // Load the DCF document
      const document = await loadDCFDocument(file);
      
      // Override the document's profile with the effective profile from context
      if (document.profile !== context.profile) {
        document.profile = context.profile;
      }
      
      // Perform validation
      const result = await validateDCF(document, {
        strictWarnings: false // We'll handle strict warnings at the aggregate level
      });
      
      // Add file path to each error and warning for proper attribution
      result.errors = result.errors.map(error => ({
        ...error,
        path: `${file}:${error.path || ''}`
      }));
      
      result.warnings = result.warnings.map(warning => ({
        ...warning,
        path: `${file}:${warning.path || ''}`
      }));
      
      results.push({ file, result });
      
      allErrors.push(...result.errors);
      allWarnings.push(...result.warnings);
    } catch (error) {
      // Handle tool errors for individual files
      allErrors.push({
        code: 'E_TOOL',
        message: `Failed to load or validate file ${file}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        path: file
      });
    }
  }

  // Determine overall success
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