import { RenderNode, Layout, Style, TextStyle } from './RenderAst';

// Heuristic helpers
function getElementType(obj: any): string | undefined {
  return obj.type || obj.kind || obj.element || obj.elementType || obj.name;
}

function getChildren(obj: any): any[] | undefined {
  return obj.children || obj.elements || obj.nodes || obj.content?.filter?.((item: any) => typeof item === 'object');
}

function getText(obj: any): string | undefined {
  return obj.text || obj.value || obj.label || (typeof obj.content === 'string' ? obj.content : undefined);
}

function getImageSrc(obj: any): string | undefined {
  return obj.src || obj.url || obj.image || obj.assetUrl;
}

function getStyle(obj: any): any {
  return obj.style || obj.styles || obj.layout || obj.props?.style;
}

function getLayout(obj: any): any {
  return obj.layout || obj.props?.layout || obj.direction || obj.orientation;
}

function generateId(path: string[]): string {
  return `node-${path.join('-')}`;
}

function resolveTokenReference(value: string, tokens: any): string {
  if (typeof value !== 'string' || !value.startsWith('{') || !value.endsWith('}')) {
    return value;
  }

  const tokenPath = value.slice(1, -1); // Remove { and }
  const pathParts = tokenPath.split('.');

  let current: any = tokens;
  for (const part of pathParts) {
    if (current && typeof current === 'object') {
      current = current[part];
    } else {
      return value; // Return original if token not found
    }
  }

  // If the resolved value is an object with a 'value' property, extract it
  // This handles token structures like { value: "#007acc" }
  if (current && typeof current === 'object' && 'value' in current) {
    return current.value;
  }

  return current !== undefined ? current : value;
}

function resolveStyleTokens(style: any, tokens: any): any {
  if (!style || typeof style !== 'object') {
    return style;
  }

  const resolvedStyle: any = {};

  for (const [key, value] of Object.entries(style)) {
    if (typeof value === 'string') {
      // Handle strings that contain token references (one or more)
      // Pattern: {token.path} anywhere in the string
      if (value.includes('{') && value.includes('}')) {
        resolvedStyle[key] = value.replace(/\{([^}]+)\}/g, (match, tokenPath) => {
          const pathParts = tokenPath.split('.');
          let current: any = tokens;

          for (const part of pathParts) {
            if (current && typeof current === 'object') {
              current = current[part];
            } else {
              return match; // Return original if token not found
            }
          }

          // If the resolved value is an object with a 'value' property, extract it
          if (current && typeof current === 'object' && 'value' in current) {
            return current.value;
          }

          return current !== undefined ? current : match;
        });
      } else {
        resolvedStyle[key] = value;
      }
    } else if (typeof value === 'object' && value !== null) {
      resolvedStyle[key] = resolveStyleTokens(value, tokens);
    } else {
      resolvedStyle[key] = value;
    }
  }

  return resolvedStyle;
}

function mapLayout(obj: any): Layout {
  const layoutObj = getLayout(obj);
  if (!layoutObj) {
    // Default: frames with children should be flex column
    if (getChildren(obj)) {
      return { type: "flex", direction: "column" };
    }
    return { type: "none" };
  }

  // Check for direction
  let direction: "row" | "column" = "column";
  if (layoutObj.direction || layoutObj.orientation || layoutObj.axis || layoutObj.layoutDirection) {
    const dirValue = layoutObj.direction || layoutObj.orientation || layoutObj.axis || layoutObj.layoutDirection;
    if (dirValue.toLowerCase().includes('row') || dirValue.toLowerCase() === 'horizontal') {
      direction = "row";
    }
  }

  // Extract other layout properties
  let gap: number | undefined;
  if (layoutObj.gap || layoutObj.spacing || layoutObj.itemSpacing) {
    const gapValue = layoutObj.gap || layoutObj.spacing || layoutObj.itemSpacing;
    gap = typeof gapValue === 'number' ? gapValue : parseInt(gapValue) || undefined;
  }

  let align: "start" | "center" | "end" | "stretch" | undefined;
  if (layoutObj.align || layoutObj.alignItems) {
    const alignValue = layoutObj.align || layoutObj.alignItems;
    if (['start', 'center', 'end', 'stretch'].includes(alignValue)) {
      align = alignValue as any;
    }
  }

  let justify: "start" | "center" | "end" | "space-between" | "space-around" | "space-evenly" | undefined;
  if (layoutObj.justify || layoutObj.justifyContent) {
    const justifyValue = layoutObj.justify || layoutObj.justifyContent;
    if (['start', 'center', 'end', 'space-between', 'space-around', 'space-evenly'].includes(justifyValue)) {
      justify = justifyValue as any;
    }
  }

  let wrap: boolean | undefined;
  if (layoutObj.wrap !== undefined) {
    wrap = Boolean(layoutObj.wrap);
  }

  return {
    type: "flex",
    direction,
    gap,
    align,
    justify,
    wrap
  };
}

function mapStyle(obj: any, tokens: any): Style | TextStyle | undefined {
  const styleObj = getStyle(obj);
  if (!styleObj) {
    return undefined;
  }

  // Resolve tokens in the style object
  const resolvedStyle = resolveStyleTokens(styleObj, tokens);

  const style: Style = {};
  
  // Size properties
  if (typeof resolvedStyle.width === 'number') style.width = resolvedStyle.width;
  if (typeof resolvedStyle.height === 'number') style.height = resolvedStyle.height;
  if (typeof resolvedStyle.minWidth === 'number') style.minWidth = resolvedStyle.minWidth;
  if (typeof resolvedStyle.maxWidth === 'number') style.maxWidth = resolvedStyle.maxWidth;
  if (typeof resolvedStyle.minHeight === 'number') style.minHeight = resolvedStyle.minHeight;
  if (typeof resolvedStyle.maxHeight === 'number') style.maxHeight = resolvedStyle.maxHeight;

  // Spacing properties
  if (resolvedStyle.padding !== undefined) {
    if (typeof resolvedStyle.padding === 'number') {
      style.padding = resolvedStyle.padding;
    } else if (typeof resolvedStyle.padding === 'object') {
      style.padding = resolvedStyle.padding;
    }
  }
  
  if (resolvedStyle.margin !== undefined) {
    if (typeof resolvedStyle.margin === 'number') {
      style.margin = resolvedStyle.margin;
    } else if (typeof resolvedStyle.margin === 'object') {
      style.margin = resolvedStyle.margin;
    }
  }

  // Background and border properties
  if (resolvedStyle.backgroundColor || resolvedStyle.background) {
    style.background = resolvedStyle.backgroundColor || resolvedStyle.background;
  }
  
  if (resolvedStyle.borderColor) style.borderColor = resolvedStyle.borderColor;
  if (typeof resolvedStyle.borderWidth === 'number') style.borderWidth = resolvedStyle.borderWidth;
  if (typeof resolvedStyle.borderRadius === 'number') style.borderRadius = resolvedStyle.borderRadius;
  
  // Opacity and shadow
  if (typeof resolvedStyle.opacity === 'number') style.opacity = resolvedStyle.opacity;
  
  if (resolvedStyle.boxShadow) {
    // Parse boxShadow string - this is a simplified approach
    // Format: "x y blur spread color" (e.g., "2px 2px 5px 0px rgba(0,0,0,0.5)")
    const boxShadow = resolvedStyle.boxShadow;
    if (typeof boxShadow === 'string') {
      const parts = boxShadow.split(' ');
      if (parts.length >= 4) {
        const x = parseInt(parts[0]) || 0;
        const y = parseInt(parts[1]) || 0;
        const blur = parseInt(parts[2]) || 0;
        const spread = parts.length >= 5 ? parseInt(parts[3]) || 0 : 0;
        const color = parts.slice(parts.length >= 5 ? 4 : 3).join(' ');
        
        style.shadow = { x, y, blur, spread, color };
      }
    }
  }

  // Text-specific properties
  const textStyle: TextStyle = { ...style };
  
  if (resolvedStyle.color) textStyle.color = resolvedStyle.color;
  if (typeof resolvedStyle.fontSize === 'number') textStyle.fontSize = resolvedStyle.fontSize;
  if (resolvedStyle.fontWeight) textStyle.fontWeight = resolvedStyle.fontWeight;
  if (resolvedStyle.fontFamily) textStyle.fontFamily = resolvedStyle.fontFamily;
  if (typeof resolvedStyle.lineHeight === 'number') textStyle.lineHeight = resolvedStyle.lineHeight;
  if (resolvedStyle.textAlign) {
    const textAlign = resolvedStyle.textAlign.toLowerCase();
    if (['left', 'center', 'right'].includes(textAlign)) {
      textStyle.textAlign = textAlign as "left" | "center" | "right";
    }
  }

  return textStyle;
}

function createRenderNode(obj: any, path: string[], tokens: any): RenderNode {
  // Generate a stable ID based on the path
  const id = generateId(path);

  // Try to determine the element type
  const type = getElementType(obj);
  const text = getText(obj);
  const imageSrc = getImageSrc(obj);
  const children = getChildren(obj);
  const style = mapStyle(obj, tokens);
  const layout = type ? mapLayout(obj) : undefined;

  // Check if this is a DCF component definition (has kind === 'component' or has props/variants)
  const isDCFComponent = obj.kind === 'component' || obj.props || obj.variants || obj.layout;

  // Apply mapping rules
  if (imageSrc) {
    // Has image source → image
    return {
      kind: "image",
      id,
      src: imageSrc,
      style,
      label: type || 'image'
    };
  } else if (text !== undefined) {
    // Has text → text
    return {
      kind: "text",
      id,
      text: text.toString(),
      style,
      label: type || 'text'
    };
  } else if (children) {
    // Has children → frame
    const childNodes: RenderNode[] = [];

    if (Array.isArray(children)) {
      children.forEach((child, index) => {
        if (child && typeof child === 'object') {
          const childPath = [...path, index.toString()];
          childNodes.push(createRenderNode(child, childPath, tokens));
        }
      });
    }

    return {
      kind: "frame",
      id,
      layout,
      style,
      children: childNodes,
      label: type || 'frame'
    };
  } else if (isDCFComponent) {
    // This is a DCF component definition - create a visual representation
    // Even if it doesn't have explicit content, it likely has layout/styling information
    // Check for 'component' property (used in screen content) as well as 'name'
    const componentName = obj.name || obj.component || (path.length > 0 ? path[path.length - 1] : 'component');

    // Create a frame that represents the component visually
    return {
      kind: "frame",
      id,
      layout: layout || { type: "flex", direction: "column", align: "center", justify: "center" },
      style: {
        ...style,
        // Ensure minimum dimensions so the component is visible
        minWidth: style?.width ? undefined : 100,
        minHeight: style?.height ? undefined : 40,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: style?.border ? undefined : "1px dashed #999",
        backgroundColor: style?.background || style?.backgroundColor ? undefined : "#f9f9f9"
      },
      children: [{
        kind: "text",
        id: `text-${id}`,
        text: componentName,
        style: {
          color: "#666",
          fontSize: 12,
          fontStyle: "italic",
          textAlign: "center"
        }
      }],
      label: `Component: ${componentName}`
    };
  } else {
    // Otherwise → unknown
    return {
      kind: "unknown",
      id,
      label: type || 'unknown',
      rawType: type,
      style,
      children: [],
      raw: obj
    };
  }
}

export function dcfToRenderTree(dcfDocument: any): RenderNode {
  if (!dcfDocument || typeof dcfDocument !== 'object') {
    return {
      kind: "unknown",
      id: "node-root",
      label: "Invalid DCF Document",
      rawType: "invalid",
      raw: dcfDocument
    };
  }

  // Handle both the expected structure and the structure used by the preview server
  // Preview server organizes by kind (component, layout, screen, etc.) as singular keys
  // And may nest tokens under filename keys, so we need to consolidate them
  let tokens = dcfDocument.tokens || dcfDocument.token || {};

  // If tokens is an object with filename keys, consolidate the nested token objects
  if (tokens && typeof tokens === 'object' && !tokens.color && !tokens.space && !tokens.font) {
    // This looks like a nested structure with filename keys
    const consolidatedTokens: any = {};
    for (const [key, value] of Object.entries(tokens)) {
      if (typeof value === 'object' && value.tokens) {
        // This is a token file object, merge its tokens
        for (const [tokenType, tokenValues] of Object.entries(value.tokens)) {
          if (!consolidatedTokens[tokenType]) {
            consolidatedTokens[tokenType] = {};
          }
          Object.assign(consolidatedTokens[tokenType], tokenValues);
        }
      }
    }
    tokens = consolidatedTokens;
  }

  // Also consolidate if the document has tokens nested in the top-level structure
  if (dcfDocument.tokens) {
    const docTokens = dcfDocument.tokens;
    if (typeof docTokens === 'object' && !docTokens.color && !docTokens.space && !docTokens.font) {
      // This means tokens are stored under filename keys, consolidate them
      const consolidated: any = {};
      for (const [key, value] of Object.entries(docTokens)) {
        if (typeof value === 'object' && value.tokens) {
          for (const [tokenType, tokenValues] of Object.entries(value.tokens)) {
            if (!consolidated[tokenType]) {
              consolidated[tokenType] = {};
            }
            Object.assign(consolidated[tokenType], tokenValues);
          }
        }
      }
      tokens = consolidated;
    }
  }

  // First, try to find screens to render (highest priority)
  const screens = dcfDocument.screens || dcfDocument.screen;
  if (screens && typeof screens === 'object') {
    // Process screens - this is the highest level
    const screenEntries = Object.entries(screens);
    if (screenEntries.length > 0) {
      const [firstScreenName, firstScreen] = screenEntries[0]; // Render the first screen
      if (firstScreen && typeof firstScreen === 'object') {
        // Create a render node for the screen
        const screenObj = {
          ...firstScreen,
          name: firstScreenName,
          type: 'screen',
          // If screen has content, use it, otherwise create a default structure
          content: firstScreen.content || []
        };
        return createRenderNode(screenObj, ['root', 'screens', firstScreenName], tokens);
      }
    }
  }

  // If no screens, try to render flows
  const flows = dcfDocument.flows || dcfDocument.flow;
  if (flows && typeof flows === 'object') {
    const flowEntries = Object.entries(flows);
    if (flowEntries.length > 0) {
      const [firstFlowName, firstFlow] = flowEntries[0]; // Render the first flow
      if (firstFlow && typeof firstFlow === 'object') {
        // Create a visualization for the flow
        return createFlowRenderTree(firstFlow, firstFlowName, tokens);
      }
    }
  }

  // If no flows, try to render navigation
  const navigation = dcfDocument.navigation || dcfDocument.nav;
  if (navigation && typeof navigation === 'object') {
    const navEntries = Object.entries(navigation);
    if (navEntries.length > 0) {
      const [firstNavName, firstNav] = navEntries[0]; // Render the first navigation
      if (firstNav && typeof firstNav === 'object') {
        // Create a visualization for the navigation
        return createNavigationRenderTree(firstNav, firstNavName, tokens);
      }
    }
  }

  // If no navigation, try to render layouts
  const layouts = dcfDocument.layouts || dcfDocument.layout;
  if (layouts && typeof layouts === 'object') {
    const layoutEntries = Object.entries(layouts);
    if (layoutEntries.length > 0) {
      const [firstLayoutName, firstLayout] = layoutEntries[0]; // Render the first layout
      if (firstLayout && typeof firstLayout === 'object') {
        const layoutObj = { ...firstLayout, name: firstLayoutName, type: 'layout' };
        return createRenderNode(layoutObj, ['root', 'layouts', firstLayoutName], tokens);
      }
    }
  }

  // If no layouts, render components
  let components = dcfDocument.components || dcfDocument.component;

  if (components && typeof components === 'object') {
    // Handle both object (named) and array (indexed) structures for components
    const componentEntries = Array.isArray(components)
      ? components.map((comp, idx) => [idx.toString(), comp])
      : Object.entries(components);

    if (componentEntries.length > 0) {
      // Create a root frame containing all components for preview
      const componentNodes: RenderNode[] = [];

      for (const [name, component] of componentEntries) {
        if (component && typeof component === 'object') {
          // Create a wrapper frame for each component to show its name and properties
          // Preserve the component's internal name if it exists, otherwise use the key
          const componentObj = {
            ...component,
            name: (component as any).name || name,  // Use internal name if available, otherwise key
            type: (component as any).type || (component as any).name || name,
            content: (component as any).content || [] // Add empty content if not defined
          };

          // Create the component node
          // If the component has no content but has styles, we need to ensure it renders something
          let componentNode = createRenderNode(
            componentObj,
            ['root', 'components', name],
            tokens
          );

          // If the component has styles or layout, render it as a styled visual element
          // This handles components that define visual appearance but no content structure
          const componentStyles = (component as any).styles || (component as any).layout;
          const hasStyles = !!componentStyles;
          const isEmptyFrame = componentNode.kind === 'frame' && componentNode.children.length === 0;
          const isUnknown = componentNode.kind === 'unknown';

          if (hasStyles && (isEmptyFrame || isUnknown)) {
            // Resolve the component's styles/layout with token values
            const resolvedStyles = resolveStyleTokens(componentStyles, tokens);

            // Use the component's internal name if available, otherwise use the key
            const componentName = (component as any).name || name;

            // Create a styled element that visually represents the component
            componentNode = {
              kind: "frame",
              id: componentNode.id,
              layout: { type: "flex", direction: "column", align: "center", justify: "center" },
              style: {
                ...resolvedStyles,
                // Ensure minimum dimensions so the component is visible
                minWidth: 100,
                minHeight: 40,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center"
              },
              children: [{
                kind: "text",
                id: `text-${componentNode.id}`,
                text: componentName,
                style: {
                  color: resolvedStyles.color || "white",
                  fontWeight: resolvedStyles.fontWeight || "bold",
                  fontSize: resolvedStyles.fontSize
                }
              }],
              label: `Styled Component: ${componentName}`
            };
          }

          // Wrap the component in a labeled frame
          const wrapperNode: RenderNode = {
            kind: "frame",
            id: `wrapper-${name}`,
            layout: { type: "flex", direction: "column", gap: 8 },
            style: {
              padding: 12,
              margin: 8,
              border: "1px solid #ccc",
              borderRadius: 4,
              backgroundColor: "#f9f9f9"
            },
            children: [
              {
                kind: "text",
                id: `label-${name}`,
                text: `Component: ${name}`,
                style: { fontWeight: "bold", marginBottom: 8 }
              },
              componentNode
            ],
            label: `Component Wrapper: ${name}`
          };

          componentNodes.push(wrapperNode);
        }
      }

      // Return a root frame containing all component previews
      return {
        kind: "frame",
        id: "node-root",
        layout: { type: "flex", direction: "column", gap: 16 },
        style: { padding: 16, width: "100%", minHeight: 400, backgroundColor: "#fff" },
        children: componentNodes,
        label: "Components Preview"
      };
    }
  }

  // If no components, try to render themes
  const themes = dcfDocument.themes || dcfDocument.theme;
  if (themes && typeof themes === 'object') {
    const themeEntries = Object.entries(themes);
    if (themeEntries.length > 0) {
      const [firstThemeName, firstTheme] = themeEntries[0];
      if (firstTheme && typeof firstTheme === 'object') {
        return createThemeRenderTree(themes, firstThemeName, tokens);
      }
    }
  }

  // If no themes, try to render i18n
  const i18n = dcfDocument.i18n;
  if (i18n && typeof i18n === 'object') {
    const i18nEntries = Object.entries(i18n);
    if (i18nEntries.length > 0) {
      const [firstName, firstI18n] = i18nEntries[0];
      if (firstI18n && typeof firstI18n === 'object') {
        return createI18nRenderTree(firstI18n, firstName, tokens);
      }
    }
  }

  // If no i18n, try to render rules
  const rules = dcfDocument.rules;
  if (rules && typeof rules === 'object') {
    const rulesEntries = Object.entries(rules);
    if (rulesEntries.length > 0) {
      const [firstName, firstRules] = rulesEntries[0];
      if (firstRules && typeof firstRules === 'object') {
        return createRulesRenderTree(firstRules, firstName, tokens);
      }
    }
  }

  // If no rules, try to render tokens visually
  // Use the consolidated tokens (already processed above) for rendering
  if (tokens && typeof tokens === 'object' && Object.keys(tokens).length > 0) {
    return createTokensRenderTree(tokens);
  }

  // If nothing else, return an empty root
  return {
    kind: "frame",
    id: "node-root",
    layout: { type: "flex", direction: "column", gap: 16 },
    style: { padding: 16, width: "auto" as const, minHeight: 400 },
    children: [],
    label: "Empty DCF Document"
  };
}

// Helper function to create a visual representation of tokens
function createTokensRenderTree(tokens: any): RenderNode {
  const tokenNodes: RenderNode[] = [];

  // Process color tokens with visual preview
  if (tokens.color) {
    const colorNodes: RenderNode[] = [];

    for (const [colorName, colorValue] of Object.entries(tokens.color)) {
      const value = typeof colorValue === 'object' && colorValue.value ? colorValue.value : colorValue;
      if (typeof value === 'string' && (value.startsWith('#') || value.startsWith('rgb'))) {
        colorNodes.push({
          kind: "frame",
          id: `color-${colorName}`,
          layout: { type: "flex", direction: "row", gap: 8 },
          style: { alignItems: "center", padding: 8, marginBottom: 4 },
          children: [
            {
              kind: "frame",
              id: `color-box-${colorName}`,
              style: {
                width: 30,
                height: 30,
                backgroundColor: value,
                border: "1px solid #ccc",
                borderRadius: 4
              },
              children: [],
              label: `Color Box: ${value}`
            },
            {
              kind: "text",
              id: `color-label-${colorName}`,
              text: `${colorName}: ${value}`,
              style: { fontSize: 14 }
            }
          ],
          label: `Color Token: ${colorName}`
        });
      }
    }

    if (colorNodes.length > 0) {
      tokenNodes.push({
        kind: "frame",
        id: "colors-section",
        layout: { type: "flex", direction: "column", gap: 4 },
        style: { marginBottom: 20 },
        children: colorNodes,
        label: "Color Tokens"
      });
    }
  }

  // Process space tokens
  if (tokens.space) {
    const spaceNodes: RenderNode[] = [];

    for (const [spaceName, spaceValue] of Object.entries(tokens.space)) {
      const value = typeof spaceValue === 'object' && spaceValue.value ? spaceValue.value : spaceValue;
      spaceNodes.push({
        kind: "frame",
        id: `space-${spaceName}`,
        layout: { type: "flex", direction: "row", gap: 8 },
        style: { alignItems: "center", padding: 8, marginBottom: 4 },
        children: [
          {
            kind: "frame",
            id: `space-box-${spaceName}`,
            style: {
              width: typeof value === 'string' ? parseInt(value) || 0 : value || 0,
              height: 20,
              backgroundColor: "#e0e0e0",
              border: "1px solid #ccc"
            },
            children: [],
            label: `Space Box: ${value}`
          },
          {
            kind: "text",
            id: `space-label-${spaceName}`,
            text: `${spaceName}: ${value}`,
            style: { fontSize: 14 }
          }
        ],
        label: `Space Token: ${spaceName}`
      });
    }

    if (spaceNodes.length > 0) {
      tokenNodes.push({
        kind: "frame",
        id: "spaces-section",
        layout: { type: "flex", direction: "column", gap: 4 },
        style: { marginBottom: 20 },
        children: spaceNodes,
        label: "Space Tokens"
      });
    }
  }

  return {
    kind: "frame",
    id: "node-root",
    layout: { type: "flex", direction: "column", gap: 16 },
    style: { padding: 16, width: "100%", minHeight: 400, backgroundColor: "#fff" },
    children: tokenNodes,
    label: "Tokens Preview"
  };
}

// Helper function to create a visual representation of navigation
function createNavigationRenderTree(navigation: any, name: string, tokens: any): RenderNode {
  const routeNodes: RenderNode[] = [];

  // Process routes if they exist
  if (navigation.routes) {
    for (const [routeName, route] of Object.entries(navigation.routes)) {
      const routeNode: RenderNode = {
        kind: "frame",
        id: `route-${routeName}`,
        layout: { type: "flex", direction: "row", gap: 8 },
        style: {
          alignItems: "center",
          padding: 8,
          marginBottom: 4,
          border: "1px solid #ccc",
          borderRadius: 4,
          backgroundColor: "#f0f8ff"
        },
        children: [
          {
            kind: "text",
            id: `route-name-${routeName}`,
            text: routeName,
            style: { fontWeight: "bold", fontSize: 14 }
          },
          {
            kind: "text",
            id: `route-path-${routeName}`,
            text: `Path: ${(route as any).path || 'N/A'}`,
            style: { fontSize: 12, color: "#666" }
          },
          {
            kind: "text",
            id: `route-screen-${routeName}`,
            text: `Screen: ${(route as any).screen || 'N/A'}`,
            style: { fontSize: 12, color: "#666" }
          }
        ],
        label: `Route: ${routeName}`
      };
      routeNodes.push(routeNode);
    }
  }

  return {
    kind: "frame",
    id: "node-root",
    layout: { type: "flex", direction: "column", gap: 16 },
    style: { padding: 16, width: "100%", minHeight: 400, backgroundColor: "#fff" },
    children: [
      {
        kind: "text",
        id: "nav-title",
        text: `Navigation: ${name}`,
        style: { fontSize: 18, fontWeight: "bold", marginBottom: 16 }
      },
      ...routeNodes
    ],
    label: `Navigation Preview: ${name}`
  };
}

// Helper function to create a visual representation of flows
function createFlowRenderTree(flow: any, name: string, tokens: any): RenderNode {
  const stepNodes: RenderNode[] = [];

  // Process steps if they exist
  if (flow.steps) {
    for (const [index, step] of (flow.steps as any[]).entries()) {
      const stepNode: RenderNode = {
        kind: "frame",
        id: `step-${index}`,
        layout: { type: "flex", direction: "column", gap: 4 },
        style: {
          padding: 8,
          marginBottom: 4,
          border: "1px solid #ccc",
          borderRadius: 4,
          backgroundColor: "#f5f5f5"
        },
        children: [
          {
            kind: "text",
            id: `step-screen-${index}`,
            text: `Step ${index + 1}: Screen - ${(step as any).screen || 'N/A'}`,
            style: { fontWeight: "bold", fontSize: 14 }
          },
          {
            kind: "text",
            id: `step-on-submit-${index}`,
            text: `On Submit: ${(step as any).on_submit?.success || 'N/A'}`,
            style: { fontSize: 12, color: "#666" }
          },
          {
            kind: "text",
            id: `step-on-cancel-${index}`,
            text: `On Cancel: ${(step as any).on_cancel || 'N/A'}`,
            style: { fontSize: 12, color: "#666" }
          }
        ],
        label: `Step: ${index}`
      };
      stepNodes.push(stepNode);
    }
  }

  return {
    kind: "frame",
    id: "node-root",
    layout: { type: "flex", direction: "column", gap: 16 },
    style: { padding: 16, width: "100%", minHeight: 400, backgroundColor: "#fff" },
    children: [
      {
        kind: "text",
        id: "flow-title",
        text: `Flow: ${name}`,
        style: { fontSize: 18, fontWeight: "bold", marginBottom: 16 }
      },
      ...stepNodes
    ],
    label: `Flow Preview: ${name}`
  };
}

// Helper function to create a visual representation of themes
function createThemeRenderTree(themes: any, name: string, tokens: any): RenderNode {
  const themeNodes: RenderNode[] = [];

  // Process each theme variant (light, dark, etc.)
  for (const [themeName, themeData] of Object.entries(themes)) {
    if (typeof themeData !== 'object' || !themeData) continue;

    const colorNodes: RenderNode[] = [];
    const themeObj = themeData as any;

    // Look for color overrides in the theme
    const colors = themeObj.color || themeObj.colors || {};
    for (const [colorName, colorValue] of Object.entries(colors)) {
      const value = typeof colorValue === 'object' && (colorValue as any).value
        ? (colorValue as any).value
        : colorValue;

      if (typeof value === 'string' && (value.startsWith('#') || value.startsWith('rgb'))) {
        colorNodes.push({
          kind: "frame",
          id: `theme-${themeName}-color-${colorName}`,
          layout: { type: "flex", direction: "row", gap: 8 },
          style: { alignItems: "center", padding: 4 },
          children: [
            {
              kind: "frame",
              id: `theme-${themeName}-color-box-${colorName}`,
              style: {
                width: 24,
                height: 24,
                backgroundColor: value,
                border: "1px solid #ccc",
                borderRadius: 4
              },
              children: [],
              label: `Color: ${value}`
            },
            {
              kind: "text",
              id: `theme-${themeName}-color-label-${colorName}`,
              text: `${colorName}: ${value}`,
              style: { fontSize: 12 }
            }
          ],
          label: `Theme Color: ${colorName}`
        });
      }
    }

    themeNodes.push({
      kind: "frame",
      id: `theme-${themeName}`,
      layout: { type: "flex", direction: "column", gap: 4 },
      style: {
        padding: 12,
        marginBottom: 12,
        border: "1px solid #ccc",
        borderRadius: 8,
        backgroundColor: themeName === 'dark' ? '#2d2d2d' : '#f9f9f9'
      },
      children: [
        {
          kind: "text",
          id: `theme-${themeName}-title`,
          text: `Theme: ${themeName}`,
          style: {
            fontWeight: "bold",
            fontSize: 14,
            marginBottom: 8,
            color: themeName === 'dark' ? '#fff' : '#000'
          }
        },
        ...colorNodes
      ],
      label: `Theme: ${themeName}`
    });
  }

  return {
    kind: "frame",
    id: "node-root",
    layout: { type: "flex", direction: "column", gap: 16 },
    style: { padding: 16, width: "100%", minHeight: 400, backgroundColor: "#fff" },
    children: [
      {
        kind: "text",
        id: "theme-title",
        text: `Themes: ${name}`,
        style: { fontSize: 18, fontWeight: "bold", marginBottom: 16 }
      },
      ...themeNodes
    ],
    label: `Theme Preview: ${name}`
  };
}

// Helper function to create a visual representation of i18n
function createI18nRenderTree(i18n: any, name: string, tokens: any): RenderNode {
  const stringNodes: RenderNode[] = [];

  // Get locale and strings
  const locale = i18n.locale || 'unknown';
  const strings = i18n.strings || {};

  // Group strings by prefix (e.g., "nav.", "common.", etc.)
  const groupedStrings: Record<string, Array<[string, string]>> = {};

  for (const [key, value] of Object.entries(strings)) {
    if (typeof value !== 'string') continue;

    const prefix = key.includes('.') ? key.split('.')[0] : 'other';
    if (!groupedStrings[prefix]) {
      groupedStrings[prefix] = [];
    }
    groupedStrings[prefix].push([key, value]);
  }

  // Create nodes for each group
  for (const [group, entries] of Object.entries(groupedStrings)) {
    const entryNodes: RenderNode[] = entries.slice(0, 5).map(([key, value], idx) => ({
      kind: "frame" as const,
      id: `i18n-${group}-${idx}`,
      layout: { type: "flex" as const, direction: "row" as const, gap: 8 },
      style: { padding: 4 },
      children: [
        {
          kind: "text" as const,
          id: `i18n-${group}-key-${idx}`,
          text: key,
          style: { fontSize: 12, fontWeight: "bold", minWidth: 150 }
        },
        {
          kind: "text" as const,
          id: `i18n-${group}-value-${idx}`,
          text: value,
          style: { fontSize: 12, color: "#666" }
        }
      ],
      label: `String: ${key}`
    }));

    // Add "and X more..." if there are more entries
    if (entries.length > 5) {
      entryNodes.push({
        kind: "text",
        id: `i18n-${group}-more`,
        text: `... and ${entries.length - 5} more`,
        style: { fontSize: 11, color: "#999", fontStyle: "italic" }
      });
    }

    stringNodes.push({
      kind: "frame",
      id: `i18n-group-${group}`,
      layout: { type: "flex", direction: "column", gap: 2 },
      style: {
        padding: 8,
        marginBottom: 8,
        border: "1px solid #e0e0e0",
        borderRadius: 4,
        backgroundColor: "#fafafa"
      },
      children: [
        {
          kind: "text",
          id: `i18n-group-${group}-title`,
          text: `${group} (${entries.length} strings)`,
          style: { fontWeight: "bold", fontSize: 13, marginBottom: 4, color: "#333" }
        },
        ...entryNodes
      ],
      label: `i18n Group: ${group}`
    });
  }

  return {
    kind: "frame",
    id: "node-root",
    layout: { type: "flex", direction: "column", gap: 16 },
    style: { padding: 16, width: "100%", minHeight: 400, backgroundColor: "#fff" },
    children: [
      {
        kind: "text",
        id: "i18n-title",
        text: `i18n: ${name}`,
        style: { fontSize: 18, fontWeight: "bold", marginBottom: 8 }
      },
      {
        kind: "text",
        id: "i18n-locale",
        text: `Locale: ${locale}`,
        style: { fontSize: 14, color: "#666", marginBottom: 16 }
      },
      ...stringNodes
    ],
    label: `i18n Preview: ${name}`
  };
}

// Helper function to create a visual representation of rules
function createRulesRenderTree(rulesDoc: any, name: string, tokens: any): RenderNode {
  const ruleNodes: RenderNode[] = [];

  // Get the rules object
  const rules = rulesDoc.rules || rulesDoc;

  for (const [ruleName, ruleData] of Object.entries(rules)) {
    if (typeof ruleData !== 'object' || !ruleData) continue;

    const ruleObj = ruleData as any;
    const description = ruleObj.description || '';
    const constraints = ruleObj.constraints || [];

    const constraintNodes: RenderNode[] = constraints.slice(0, 3).map((constraint: any, idx: number) => ({
      kind: "text" as const,
      id: `rule-${ruleName}-constraint-${idx}`,
      text: `• ${constraint.rule || 'constraint'}: ${constraint.property || constraint.element || constraint.allowedTokens?.join(', ') || ''}`,
      style: { fontSize: 11, color: "#666", marginLeft: 8 }
    }));

    if (constraints.length > 3) {
      constraintNodes.push({
        kind: "text",
        id: `rule-${ruleName}-more`,
        text: `  ... and ${constraints.length - 3} more constraints`,
        style: { fontSize: 10, color: "#999", fontStyle: "italic" }
      });
    }

    ruleNodes.push({
      kind: "frame",
      id: `rule-${ruleName}`,
      layout: { type: "flex", direction: "column", gap: 4 },
      style: {
        padding: 10,
        marginBottom: 8,
        border: "1px solid #d0d0d0",
        borderRadius: 6,
        backgroundColor: "#f5f5f5"
      },
      children: [
        {
          kind: "text",
          id: `rule-${ruleName}-title`,
          text: ruleName,
          style: { fontWeight: "bold", fontSize: 14, color: "#333" }
        },
        {
          kind: "text",
          id: `rule-${ruleName}-desc`,
          text: description,
          style: { fontSize: 12, color: "#666", marginBottom: 4 }
        },
        ...constraintNodes
      ],
      label: `Rule: ${ruleName}`
    });
  }

  return {
    kind: "frame",
    id: "node-root",
    layout: { type: "flex", direction: "column", gap: 16 },
    style: { padding: 16, width: "100%", minHeight: 400, backgroundColor: "#fff" },
    children: [
      {
        kind: "text",
        id: "rules-title",
        text: `Rules: ${name}`,
        style: { fontSize: 18, fontWeight: "bold", marginBottom: 16 }
      },
      ...ruleNodes
    ],
    label: `Rules Preview: ${name}`
  };
}