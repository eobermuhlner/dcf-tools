import { ValidationError, ValidationResult } from './schema';

/**
 * Validates references within a DCF document
 */
export async function validateReferences(dcfDocument: any): Promise<ValidationResult> {
  const result: ValidationResult = {
    ok: true,
    errors: [],
    warnings: []
  };
  
  // Extract all defined elements from the document
  const { tokens, components, layouts, screens, routes } = extractDefinedElements(dcfDocument);
  
  // Validate token references
  const tokenErrors = validateTokenReferences(dcfDocument, tokens);
  result.errors.push(...tokenErrors);
  
  // Validate component references
  const componentErrors = validateComponentReferences(dcfDocument, components);
  result.errors.push(...componentErrors);
  
  // Validate layout references
  const layoutErrors = validateLayoutReferences(dcfDocument, layouts);
  result.errors.push(...layoutErrors);
  
  // Validate screen references
  const screenErrors = validateScreenReferences(dcfDocument, screens);
  result.errors.push(...screenErrors);
  
  // Validate route references
  const routeErrors = validateRouteReferences(dcfDocument, routes);
  result.errors.push(...routeErrors);
  
  // Update result status based on errors
  if (result.errors.length > 0) {
    result.ok = false;
  }
  
  return result;
}

/**
 * Extracts all defined tokens, components, layouts, screens, and routes from the document
 */
function extractDefinedElements(dcfDocument: any) {
  const tokens: Set<string> = new Set();
  const components: Set<string> = new Set();
  const layouts: Set<string> = new Set();
  const screens: Set<string> = new Set();
  const routes: Set<string> = new Set();
  
  // Extract tokens from the document
  if (dcfDocument.tokens) {
    extractTokens(dcfDocument.tokens, tokens, '');
  }
  
  // Extract components
  if (dcfDocument.components) {
    for (const componentName in dcfDocument.components) {
      components.add(componentName);
    }
  }
  
  // Extract layouts
  if (dcfDocument.layouts) {
    for (const layoutName in dcfDocument.layouts) {
      layouts.add(layoutName);
    }
  }
  
  // Extract screens
  if (dcfDocument.screens) {
    for (const screenName in dcfDocument.screens) {
      screens.add(screenName);
    }
  }
  
  // Extract routes
  if (dcfDocument.navigation?.routes) {
    extractRoutes(dcfDocument.navigation.routes, routes);
  }
  
  return { tokens, components, layouts, screens, routes };
}

/**
 * Recursively extract tokens from nested objects
 */
function extractTokens(obj: any, tokens: Set<string>, prefix: string) {
  if (typeof obj !== 'object' || obj === null) {
    return;
  }
  
  for (const key in obj) {
    const value = obj[key];
    const tokenPath = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // It's an object, continue nesting
      extractTokens(value, tokens, tokenPath);
    } else {
      // It's a leaf value, add to tokens
      tokens.add(tokenPath);
    }
  }
}

/**
 * Extract routes recursively from navigation structure
 */
function extractRoutes(routes: any, routeSet: Set<string>, parentPath: string = '') {
  if (Array.isArray(routes)) {
    routes.forEach((route: any) => {
      if (typeof route === 'object' && route.path) {
        const routePath = parentPath ? `${parentPath}/${route.path}` : route.path;
        routeSet.add(routePath);
        if (route.children) {
          extractRoutes(route.children, routeSet, routePath);
        }
      }
    });
  } else if (typeof routes === 'object') {
    for (const key in routes) {
      const route = routes[key];
      if (typeof route === 'object' && route.path) {
        const routePath = parentPath ? `${parentPath}/${route.path}` : route.path;
        routeSet.add(routePath);
        if (route.children) {
          extractRoutes(route.children, routeSet, routePath);
        }
      }
    }
  }
}

/**
 * Validates token references in the document
 */
function validateTokenReferences(dcfDocument: any, definedTokens: Set<string>): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // Look for token references in components, layouts, etc.
  if (dcfDocument.components) {
    for (const componentName in dcfDocument.components) {
      const component = dcfDocument.components[componentName];
      findTokenReferences(component, (tokenPath, path) => {
        if (!definedTokens.has(tokenPath)) {
          errors.push({
            code: 'E_REFERENCE',
            message: `Token reference '${tokenPath}' not found`,
            path: `${path}`
          });
        }
      }, `components.${componentName}`);
    }
  }
  
  return errors;
}

/**
 * Validates component references in the document
 */
function validateComponentReferences(dcfDocument: any, definedComponents: Set<string>): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // Look for component references in layouts
  if (dcfDocument.layouts) {
    for (const layoutName in dcfDocument.layouts) {
      const layout = dcfDocument.layouts[layoutName];
      findComponentReferences(layout, (componentName, path) => {
        if (!definedComponents.has(componentName)) {
          errors.push({
            code: 'E_REFERENCE',
            message: `Component reference '${componentName}' not found`,
            path: `${path}`
          });
        }
      }, `layouts.${layoutName}`);
    }
  }
  
  // Look for component references in screens
  if (dcfDocument.screens) {
    for (const screenName in dcfDocument.screens) {
      const screen = dcfDocument.screens[screenName];
      findComponentReferences(screen, (componentName, path) => {
        if (!definedComponents.has(componentName)) {
          errors.push({
            code: 'E_REFERENCE',
            message: `Component reference '${componentName}' not found`,
            path: `${path}`
          });
        }
      }, `screens.${screenName}`);
    }
  }
  
  return errors;
}

/**
 * Validates layout references in the document
 */
function validateLayoutReferences(dcfDocument: any, definedLayouts: Set<string>): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // Look for layout references in screens
  if (dcfDocument.screens) {
    for (const screenName in dcfDocument.screens) {
      const screen = dcfDocument.screens[screenName];
      if (screen.layout && !definedLayouts.has(screen.layout)) {
        errors.push({
          code: 'E_REFERENCE',
          message: `Layout reference '${screen.layout}' not found`,
          path: `screens.${screenName}.layout`
        });
      }
    }
  }
  
  return errors;
}

/**
 * Validates screen references in the document
 */
function validateScreenReferences(dcfDocument: any, definedScreens: Set<string>): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // Look for screen references in navigation routes
  if (dcfDocument.navigation?.routes) {
    findScreenReferences(dcfDocument.navigation.routes, (screenName, path) => {
      if (!definedScreens.has(screenName)) {
        errors.push({
          code: 'E_REFERENCE',
          message: `Screen reference '${screenName}' not found`,
          path: `${path}`
        });
      }
    }, 'navigation.routes');
  }
  
  return errors;
}

/**
 * Validates route references in the document
 */
function validateRouteReferences(dcfDocument: any, definedRoutes: Set<string>): ValidationError[] {
  const errors: ValidationError[] = [];
  // Note: Route references are usually internal to the navigation structure
  // This could be expanded based on specific DCF spec requirements
  return errors;
}

/**
 * Helper function to find token references in an object
 */
function findTokenReferences(obj: any, callback: (tokenPath: string, path: string) => void, currentPath: string = '') {
  if (typeof obj !== 'object' || obj === null) {
    return;
  }
  
  for (const key in obj) {
    const value = obj[key];
    const path = currentPath ? `${currentPath}.${key}` : key;
    
    if (typeof value === 'string') {
      // Check if this looks like a token reference (e.g., { colors.primary } or similar pattern)
      // This is a simplified check - in a real implementation, this would follow DCF spec patterns
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
 * Helper function to find component references in an object
 */
function findComponentReferences(obj: any, callback: (componentName: string, path: string) => void, currentPath: string = '') {
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

/**
 * Helper function to find screen references in navigation routes
 */
function findScreenReferences(routes: any, callback: (screenName: string, path: string) => void, currentPath: string = '') {
  if (Array.isArray(routes)) {
    routes.forEach((route: any, index: number) => {
      if (typeof route === 'object') {
        if (route.screen) {
          callback(route.screen, `${currentPath}[${index}].screen`);
        }
        if (route.children) {
          findScreenReferences(route.children, callback, `${currentPath}[${index}].children`);
        }
      }
    });
  } else if (typeof routes === 'object') {
    for (const key in routes) {
      const route = routes[key];
      if (typeof route === 'object') {
        if (route.screen) {
          callback(route.screen, `${currentPath}.${key}.screen`);
        }
        if (route.children) {
          findScreenReferences(route.children, callback, `${currentPath}.${key}.children`);
        }
      }
    }
  }
}