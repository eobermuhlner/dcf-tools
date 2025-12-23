import { ValidationResult, ValidationError } from '../validation/schema';

export interface CrossFileValidationResult {
  ok: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

/**
 * Performs cross-file validation across multiple DCF files
 * @param filesWithDocs - Array of objects containing file paths and parsed DCF documents
 * @param capabilities - Array of enabled capabilities that determine validation scope
 * @returns CrossFileValidationResult with validation results
 */
export async function validateCrossFileReferences(
  filesWithDocs: Array<{ file: string; document: any }>,
  capabilities: string[] = []
): Promise<CrossFileValidationResult> {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  
  // Build a map of all defined elements across all files
  const allTokens = new Map<string, { file: string; path: string }>();
  const allComponents = new Map<string, { file: string; path: string }>();
  const allLayouts = new Map<string, { file: string; path: string }>();
  const allScreens = new Map<string, { file: string; path: string }>();
  const allThemes = new Map<string, { file: string; path: string }>();

  // Extract all definitions from all documents
  for (const { file, document } of filesWithDocs) {
    // Extract tokens
    if (document.tokens) {
      extractTokens(document.tokens, allTokens, file, '');
    }

    // Extract components
    if (document.components) {
      for (const componentName in document.components) {
        allComponents.set(componentName, { file, path: `components.${componentName}` });
      }
    }

    // Extract layouts
    if (document.layouts) {
      for (const layoutName in document.layouts) {
        allLayouts.set(layoutName, { file, path: `layouts.${layoutName}` });
      }
    }

    // Extract screens
    if (document.screens) {
      for (const screenName in document.screens) {
        allScreens.set(screenName, { file, path: `screens.${screenName}` });
      }
    }

    // Extract themes
    if (document.themes) {
      for (const themeName in document.themes) {
        allThemes.set(themeName, { file, path: `themes.${themeName}` });
      }
    }
  }

  // Validate references in each document
  for (const { file, document } of filesWithDocs) {
    // Validate token references in components
    if (document.components) {
      for (const componentName in document.components) {
        const component = document.components[componentName];
        const componentPath = `components.${componentName}`;
        
        findTokenReferences(component, (tokenPath, refPath) => {
          if (!allTokens.has(tokenPath)) {
            errors.push({
              code: 'E_REFERENCE',
              message: `Token reference '${tokenPath}' not found in any file`,
              path: `${file}:${componentPath}.${refPath}`
            });
          }
        }, componentPath);
      }
    }

    // Validate component references in layouts and screens
    if (document.layouts) {
      for (const layoutName in document.layouts) {
        const layout = document.layouts[layoutName];
        const layoutPath = `layouts.${layoutName}`;
        
        findComponentReferences(layout, (componentName, refPath) => {
          if (!allComponents.has(componentName)) {
            errors.push({
              code: 'E_REFERENCE',
              message: `Component reference '${componentName}' not found in any file`,
              path: `${file}:${layoutPath}.${refPath}`
            });
          }
        }, layoutPath);
      }
    }

    if (document.screens) {
      for (const screenName in document.screens) {
        const screen = document.screens[screenName];
        const screenPath = `screens.${screenName}`;
        
        findComponentReferences(screen, (componentName, refPath) => {
          if (!allComponents.has(componentName)) {
            errors.push({
              code: 'E_REFERENCE',
              message: `Component reference '${componentName}' not found in any file`,
              path: `${file}:${screenPath}.${refPath}`
            });
          }
        }, screenPath);
      }
    }

    // Validate layout references in screens
    if (document.screens) {
      for (const screenName in document.screens) {
        const screen = document.screens[screenName];
        if (screen.layout && !allLayouts.has(screen.layout)) {
          errors.push({
            code: 'E_REFERENCE',
            message: `Layout reference '${screen.layout}' not found in any file`,
            path: `${file}:screens.${screenName}.layout`
          });
        }
      }
    }
  }

  // Apply capability-based filtering if capabilities are specified
  if (capabilities.length > 0) {
    // For now, we'll implement basic capability filtering
    // In a full implementation, this would involve more complex logic
    // to validate only the specified capabilities and their dependencies
    
    // Example: if only 'tokens' capability is specified, we might ignore
    // component/screen reference errors but still validate token consistency
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Extracts tokens recursively from a token object
 */
function extractTokens(
  obj: any, 
  tokens: Map<string, { file: string; path: string }>, 
  file: string, 
  prefix: string = ''
) {
  if (typeof obj !== 'object' || obj === null) {
    return;
  }

  for (const key in obj) {
    const value = obj[key];
    const tokenPath = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'object' && value !== null && !Array.isArray(value) && value.value) {
      // This looks like a token definition with a value property
      tokens.set(tokenPath, { file, path: tokenPath });
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // It's an object, continue nesting
      extractTokens(value, tokens, file, tokenPath);
    } else {
      // It's a leaf value, add to tokens
      tokens.set(tokenPath, { file, path: tokenPath });
    }
  }
}

/**
 * Finds token references in an object structure
 */
function findTokenReferences(
  obj: any, 
  callback: (tokenPath: string, path: string) => void, 
  currentPath: string = ''
) {
  if (typeof obj !== 'object' || obj === null) {
    return;
  }

  for (const key in obj) {
    const value = obj[key];
    const path = currentPath ? `${currentPath}.${key}` : key;

    if (typeof value === 'string') {
      // Check if this looks like a token reference (e.g., { tokens.color.primary })
      const tokenMatch = value.match(/\{([^}]+)\}/);
      if (tokenMatch) {
        const tokenPath = tokenMatch[1].trim();
        callback(tokenPath, path);
      }
    } else if (typeof value === 'object' && !Array.isArray(value)) {
      findTokenReferences(value, callback, path);
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        findTokenReferences(item, callback, `${path}[${index}]`);
      });
    }
  }
}

/**
 * Finds component references in an object structure
 */
function findComponentReferences(
  obj: any, 
  callback: (componentName: string, path: string) => void, 
  currentPath: string = ''
) {
  if (typeof obj !== 'object' || obj === null) {
    return;
  }

  for (const key in obj) {
    const value = obj[key];
    const path = currentPath ? `${currentPath}.${key}` : key;

    if (key === 'component' && typeof value === 'string') {
      // Found a component reference
      callback(value, path);
    } else if (typeof value === 'object' && !Array.isArray(value)) {
      findComponentReferences(value, callback, path);
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        findComponentReferences(item, callback, `${path}[${index}]`);
      });
    }
  }
}