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
  return obj.style || obj.styles || obj.props?.style;
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
  
  return current !== undefined ? current : value;
}

function resolveStyleTokens(style: any, tokens: any): any {
  if (!style || typeof style !== 'object') {
    return style;
  }
  
  const resolvedStyle: any = {};
  
  for (const [key, value] of Object.entries(style)) {
    if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
      resolvedStyle[key] = resolveTokenReference(value, tokens);
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

  const tokens = dcfDocument.tokens || {};
  
  // Create a root frame that contains components and layouts
  const rootChildren: RenderNode[] = [];

  // Process components
  if (dcfDocument.components && typeof dcfDocument.components === 'object') {
    for (const [name, component] of Object.entries(dcfDocument.components)) {
      if (component && typeof component === 'object') {
        const componentObj = { ...component, name, type: (component as any).type || name };
        const componentNode = createRenderNode(
          componentObj,
          ['root', 'components', name],
          tokens
        );
        rootChildren.push(componentNode);
      }
    }
  }

  // Process layouts
  if (dcfDocument.layouts && typeof dcfDocument.layouts === 'object') {
    for (const [name, layout] of Object.entries(dcfDocument.layouts)) {
      if (layout && typeof layout === 'object') {
        const layoutObj = { ...layout, name, type: (layout as any).type || name };
        const layoutNode = createRenderNode(
          layoutObj,
          ['root', 'layouts', name],
          tokens
        );
        rootChildren.push(layoutNode);
      }
    }
  }

  // Return a root frame containing all components and layouts
  return {
    kind: "frame",
    id: "node-root",
    layout: { type: "flex", direction: "column", gap: 16 }, // Default layout for root
    style: { padding: 16, width: "auto" as const, minHeight: 400 },
    children: rootChildren,
    label: "DCF Document Root"
  };
}