import { MultiFileValidationResult } from '../validation/validate-project';
import { CrossFileValidationResult } from '../validation/cross-file';

/**
 * Formats validation results as JSON
 */
export function formatJsonOutput(
  multiFileResult: MultiFileValidationResult,
  crossFileResult?: CrossFileValidationResult
): string {
  const output = {
    ok: crossFileResult ? crossFileResult.ok && multiFileResult.ok : multiFileResult.ok,
    filesValidated: multiFileResult.results.length,
    totalErrors: multiFileResult.errors.length + (crossFileResult?.errors.length || 0),
    totalWarnings: multiFileResult.warnings.length + (crossFileResult?.warnings.length || 0),
    multiFileResults: multiFileResult.results,
    crossFileValidation: crossFileResult || undefined,
    errors: [
      ...multiFileResult.errors,
      ...(crossFileResult?.errors || [])
    ],
    warnings: [
      ...multiFileResult.warnings,
      ...(crossFileResult?.warnings || [])
    ]
  };

  return JSON.stringify(output, null, 2);
}

/**
 * Formats validation results as human-readable text
 */
export function formatTextOutput(
  multiFileResult: MultiFileValidationResult,
  crossFileResult?: CrossFileValidationResult,
  quiet: boolean = false
): string {
  let output = '';

  // Group errors and warnings by file
  const errorsByFile: { [file: string]: any[] } = {};
  const warningsByFile: { [file: string]: any[] } = {};
  const schemasByFile: { [file: string]: string } = {};

  for (const result of multiFileResult.results) {
    for (const error of result.result.errors) {
      const file = result.file;
      if (!errorsByFile[file]) errorsByFile[file] = [];
      errorsByFile[file].push(error);
    }

    for (const warning of result.result.warnings) {
      const file = result.file;
      if (!warningsByFile[file]) warningsByFile[file] = [];
      warningsByFile[file].push(warning);
    }

    // Store schema URL for this file if available
    if (result.result.schema_url) {
      schemasByFile[result.file] = result.result.schema_url;
    }
  }

  // Add header information if not in quiet mode
  if (!quiet) {
    output += `DCF Validation Results\n`;
    output += `Files validated: ${multiFileResult.results.length}\n`;
    output += `Status: ${crossFileResult ? (crossFileResult.ok && multiFileResult.ok ? 'VALID' : 'INVALID') : (multiFileResult.ok ? 'VALID' : 'INVALID')}\n\n`;

    // Add schema information for each file
    if (Object.keys(schemasByFile).length > 0) {
      output += `Schema information:\n`;
      for (const file in schemasByFile) {
        output += `  ${file}: ${schemasByFile[file]}\n`;
      }
      output += `\n`;
    }
  }

  // Add cross-file errors and warnings if present
  if (crossFileResult) {
    for (const error of crossFileResult.errors) {
      // Cross-file errors might not have a specific file, or they might span multiple files
      // For now, we'll add them to a "cross-file" category
      if (!errorsByFile['cross-file']) errorsByFile['cross-file'] = [];
      errorsByFile['cross-file'].push(error);
    }
    
    for (const warning of crossFileResult.warnings) {
      if (!warningsByFile['cross-file']) warningsByFile['cross-file'] = [];
      warningsByFile['cross-file'].push(warning);
    }
  }

  // Output errors grouped by file
  if (Object.keys(errorsByFile).length > 0) {
    output += `Errors:\n`;
    
    for (const file in errorsByFile) {
      const errors = errorsByFile[file];
      if (errors.length > 0) {
        output += `  ${file} (${errors.length}):\n`;
        errors.forEach((error, index) => {
          output += `    ${index + 1}. [${error.code}] ${error.message}`;
          if (error.path) {
            output += ` (at ${error.path})`;
          }
          output += '\n';
        });
      }
    }
    output += '\n';
  }

  // Output warnings grouped by file
  if (Object.keys(warningsByFile).length > 0 && !quiet) {
    output += `Warnings:\n`;
    
    for (const file in warningsByFile) {
      const warnings = warningsByFile[file];
      if (warnings.length > 0) {
        output += `  ${file} (${warnings.length}):\n`;
        warnings.forEach((warning, index) => {
          output += `    ${index + 1}. [${warning.code}] ${warning.message}`;
          if (warning.path) {
            output += ` (at ${warning.path})`;
          }
          output += '\n';
        });
      }
    }
    output += '\n';
  }

  // If no errors and not quiet mode, indicate success
  if (Object.keys(errorsByFile).length === 0 && !quiet) {
    output += 'No validation errors found.\n';
  }

  return output;
}

/**
 * Determines exit code based on validation results and fail-on settings
 */
export function getExitCode(
  multiFileResult: MultiFileValidationResult,
  crossFileResult?: CrossFileValidationResult,
  failOn: 'error' | 'warn' = 'error'
): number {
  const hasErrors = (crossFileResult ? crossFileResult.errors.length > 0 : false) || 
                   multiFileResult.errors.length > 0;
  
  const hasWarnings = (crossFileResult ? crossFileResult.warnings.length > 0 : false) || 
                     multiFileResult.warnings.length > 0;

  if (hasErrors) {
    return 1; // Validation error
  }
  
  if (failOn === 'warn' && hasWarnings) {
    return 1; // Fail on warnings
  }
  
  return 0; // Success
}