/**
 * Normalizes a DCF document to canonical JSON format with stable key ordering.
 *
 * @param dcfDocument - The DCF document to normalize
 * @param sourcePath - Optional path of the source file for provenance
 * @returns The normalized DCF document with provenance metadata
 */
export function normalizeDCF(dcfDocument: any, sourcePath?: string): any {
  // Create a deep copy of the document to avoid modifying the original
  const normalizedDocument = JSON.parse(JSON.stringify(dcfDocument));

  // Ensure profile is set in the document if not present
  if (!normalizedDocument.profile) {
    normalizedDocument.profile = 'standard';
  }

  // Add provenance metadata
  const meta = {
    source: sourcePath || 'unknown',
    dcf_version: normalizedDocument.dcf_version || 'unknown',
    profile: normalizedDocument.profile,
    format: 'canonical-json'
  };

  // Create normalized output with stable key ordering
  const result = {
    ...orderKeys(normalizedDocument),
    meta: orderKeys(meta)
  };

  return result;
}

/**
 * Recursively orders the keys of an object alphabetically to ensure deterministic output.
 * 
 * @param obj - The object to order keys for
 * @returns A new object with keys in alphabetical order
 */
function orderKeys(obj: any): any {
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
    // If it's not an object, return as is
    return obj;
  }
  
  // Create a new object with keys in sorted order
  const sortedKeys = Object.keys(obj).sort();
  const result: any = {};
  
  for (const key of sortedKeys) {
    const value = obj[key];
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Recursively order keys for nested objects
      result[key] = orderKeys(value);
    } else {
      // For non-object values or arrays, just assign directly
      result[key] = value;
    }
  }
  
  return result;
}