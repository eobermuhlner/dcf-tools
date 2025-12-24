import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { promises as fs } from 'fs';
import * as path from 'path';

// Define validation result types
export interface ValidationError {
  code: string;
  message: string;
  path: string;
}

export interface ValidationResult {
  ok: boolean;
  dcf_version?: string;
  profile?: string;
  schema_url?: string;  // Added to track which schema was used
  errors: ValidationError[];
  warnings: ValidationError[];
}

// Supported DCF versions (major versions)
const SUPPORTED_MAJOR_VERSIONS = [1]; // Currently only supporting v1.x.x

/**
 * Fetches the JSON schema for the specified DCF version and kind
 */
export async function fetchSchema(dcfVersion: string, kind?: string, schemaOverride?: string): Promise<{ schema: any, schemaUrl: string }> {
  // If a schema override is provided, use it instead of fetching from the default URL
  if (schemaOverride) {
    const schema = await loadSchemaOverride(schemaOverride, dcfVersion);
    return { schema, schemaUrl: schemaOverride };
  }

  // Parse the version to check major version compatibility
  const versionParts = dcfVersion.split('.').map(Number);
  const [major] = versionParts;

  if (!SUPPORTED_MAJOR_VERSIONS.includes(major)) {
    throw new Error(`Unsupported major version: ${major}. Only major versions ${SUPPORTED_MAJOR_VERSIONS.join(', ')} are supported.`);
  }

  // Construct the schema URL based on the version and kind
  // If no kind is specified, fall back to the generic dcf schema
  let schemaUrl: string;
  if (kind) {
    schemaUrl = `https://eobermuhlner.github.io/dcf-spec/schema/v${dcfVersion}/${kind}.schema.json`;
  } else {
    schemaUrl = `https://eobermuhlner.github.io/dcf-spec/schema/v${dcfVersion}/dcf.schema.json`;
  }

  try {
    // Dynamically import node-fetch to handle CJS/ESM compatibility
    const fetchModule = await import('node-fetch');
    const fetch = fetchModule.default || fetchModule;

    const response = await fetch(schemaUrl);
    if (!response.ok) {
      // If the specific kind schema fails, try the generic schema as fallback
      if (kind) {
        console.warn(`Could not fetch ${kind} schema from ${schemaUrl}, falling back to generic schema`);
        const fallbackSchemaUrl = `https://eobermuhlner.github.io/dcf-spec/schema/v${dcfVersion}/dcf.schema.json`;
        const fallbackResponse = await fetch(fallbackSchemaUrl);
        if (!fallbackResponse.ok) {
          throw new Error(`Failed to fetch both ${kind} schema from ${schemaUrl} and fallback schema from ${fallbackSchemaUrl}: ${response.status} ${response.statusText} and ${fallbackResponse.status} ${fallbackResponse.statusText}`);
        }
        const schema = await fallbackResponse.json();
        return { schema, schemaUrl: fallbackSchemaUrl };
      } else {
        throw new Error(`Failed to fetch schema from ${schemaUrl}: ${response.status} ${response.statusText}`);
      }
    }
    const schema = await response.json();
    return { schema, schemaUrl };
  } catch (error) {
    // Handle the case where network fetch fails
    console.warn(`Could not fetch schema for version ${dcfVersion} and kind ${kind}:`, error);

    // Return a basic schema as fallback to avoid complete failure
    const fallbackSchema = {
      type: "object",
      properties: {
        dcf_version: { type: "string" },
        profile: { type: "string" }
      },
      required: ["dcf_version"]
    };
    return { schema: fallbackSchema, schemaUrl: "fallback" };
  }
}

/**
 * Loads a schema from an override source (local directory or URL)
 */
async function loadSchemaOverride(schemaOverride: string, dcfVersion: string): Promise<any> {
  // Check if schemaOverride is a local directory or file
  if (schemaOverride.startsWith('http://') || schemaOverride.startsWith('https://')) {
    // It's a URL, fetch the schema
    const fetchModule = await import('node-fetch');
    const fetch = fetchModule.default || fetchModule;

    // Construct the schema URL based on the version and override base URL
    let schemaUrl;
    if (schemaOverride.endsWith('/')) {
      schemaUrl = `${schemaOverride}dcf.schema.json`;
    } else {
      schemaUrl = `${schemaOverride}/dcf.schema.json`;
    }

    const response = await fetch(schemaUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch schema from ${schemaUrl}: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } else {
    // It's a local directory or file
    try {
      // Check if it's a directory
      const schemaDirStat = await fs.stat(schemaOverride);
      if (schemaDirStat.isDirectory()) {
        // Load schema from the directory based on version
        const schemaPath = path.join(schemaOverride, `dcf.schema.json`);
        const schemaContent = await fs.readFile(schemaPath, 'utf-8');
        return JSON.parse(schemaContent);
      } else {
        // It's a file, load it directly
        const schemaContent = await fs.readFile(schemaOverride, 'utf-8');
        return JSON.parse(schemaContent);
      }
    } catch (error) {
      throw new Error(`Failed to load schema from ${schemaOverride}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

/**
 * Validates a DCF document against the appropriate JSON schema
 */
export async function validateSchema(dcfDocument: any, schemaOverride?: string): Promise<ValidationResult> {
  const result: ValidationResult = {
    ok: true,
    errors: [],
    warnings: []
  };

  // Check if document has required fields
  if (!dcfDocument.dcf_version) {
    result.ok = false;
    result.errors.push({
      code: 'E_SCHEMA',
      message: 'Missing required field: dcf_version',
      path: ''
    });
    return result;
  }

  // profile is optional, so we don't need to check for it

  // Store document metadata
  result.dcf_version = dcfDocument.dcf_version;
  // Use 'standard' as default if profile is not provided (per schema)
  result.profile = dcfDocument.profile || 'standard';

  try {
    // Extract the kind from the document if available
    const kind = dcfDocument.kind;

    // Fetch the appropriate schema based on the dcf_version, kind, and schema override
    const { schema, schemaUrl } = await fetchSchema(dcfDocument.dcf_version, kind, schemaOverride);

    // Store the schema URL in the result
    result.schema_url = schemaUrl;

    // Parse the version to check compatibility
    const versionParts = dcfDocument.dcf_version.split('.').map(Number);
    const [major, minor] = versionParts;

    if (!SUPPORTED_MAJOR_VERSIONS.includes(major)) {
      result.ok = false;
      result.errors.push({
        code: 'E_SCHEMA',
        message: `Unsupported major version: ${major}. Only major versions ${SUPPORTED_MAJOR_VERSIONS.join(', ')} are supported.`,
        path: 'dcf_version'
      });
      return result;
    }

    // Check if it's a newer minor version (within same major)
    // For now, we'll just issue a warning
    // In a real implementation, we'd need to determine our supported minor version
    if (major === SUPPORTED_MAJOR_VERSIONS[0] && minor > 0) { // Assuming we support up to 1.0.x
      result.warnings.push({
        code: 'W_VERSION',
        message: `Newer minor version ${dcfDocument.dcf_version} detected. Validation may not cover all new features.`,
        path: 'dcf_version'
      });
    }

    // Create Ajv instance with formats
    const ajv = new Ajv({ allErrors: true });
    addFormats(ajv);

    // Compile the schema
    const validate = ajv.compile(schema);

    // Validate the document
    const valid = validate(dcfDocument);

    if (!valid && validate.errors) {
      result.ok = false;
      for (const error of validate.errors) {
        result.errors.push({
          code: 'E_SCHEMA',
          message: error.message || 'Schema validation error',
          path: error.instancePath || error.schemaPath || ''
        });
      }
    }
  } catch (error) {
    result.ok = false;
    result.errors.push({
      code: 'E_SCHEMA',
      message: error instanceof Error ? error.message : 'Unknown schema validation error',
      path: ''
    });
  }

  return result;
}