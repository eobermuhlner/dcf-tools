import { validateSchema, fetchSchema } from './schema';
import { validateReferences } from './references';
import { readDCFFile } from '../utils/index';

export { validateSchema, fetchSchema } from './schema';
export { validateReferences } from './references';
export type { ValidationError, ValidationResult } from './schema';

/**
 * Main validation function that combines schema and reference validation
 */
export async function validateDCF(filePath: string, options: { strictWarnings?: boolean } = {}): Promise<any> {
  const { strictWarnings = false } = options;

  try {
    // Read the DCF file
    const document = await readDCFFile(filePath);

    // Run schema validation
    const schemaResult = await validateSchema(document);

    // Run reference validation
    const referenceResult = await validateReferences(document);

    // Combine results
    const combinedResult = {
      ok: schemaResult.ok && referenceResult.ok,
      dcf_version: schemaResult.dcf_version,
      profile: schemaResult.profile,
      errors: [...schemaResult.errors, ...referenceResult.errors],
      warnings: [...schemaResult.warnings, ...referenceResult.warnings]
    };

    // If strict warnings is enabled, treat warnings as errors
    if (strictWarnings && (combinedResult.warnings.length > 0)) {
      combinedResult.ok = false;
    }

    return combinedResult;
  } catch (error) {
    // Return a validation result with tool error
    return {
      ok: false,
      errors: [
        {
          code: 'E_TOOL',
          message: error instanceof Error ? error.message : 'Unknown error during validation',
          path: ''
        }
      ],
      warnings: [],
      dcf_version: undefined,
      profile: undefined
    };
  }
}