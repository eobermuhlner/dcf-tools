/**
 * DCF Tools Library
 *
 * This is the programmatic API for DCF document processing.
 * Functions exported here can be imported by other tools like dcf-agent and dcf-mcp.
 */

import { validateDCF, ValidationError, ValidationResult as LibValidationResult } from './validation';

export interface DCFDocument {
  dcf_version: string;
  profile: string;
  [key: string]: any;
}

// Updated exports with actual implementation
export const validate = async (
  document: string | DCFDocument,
  options: {
    project?: string;
    manifest?: string;
    target?: string;
    strictWarnings?: boolean;
  } = {}
): Promise<{ valid: boolean; errors?: string[] }> => {
  const result = await validateDCF(document, options);
  return {
    valid: result.ok,
    errors: result.errors.length > 0 ? result.errors.map(e => `${e.path}: ${e.message}`) : undefined
  };
};

export { validateDCF as validateFull };

export const normalize = async (document: unknown): Promise<unknown> => {
  console.warn('Normalization logic not yet implemented');
  return document;
};

export const inspect = async (document: unknown): Promise<unknown> => {
  console.warn('Inspection logic not yet implemented');
  return {};
};

export const lint = async (document: unknown): Promise<unknown> => {
  console.warn('Linting logic not yet implemented');
  return [];
};