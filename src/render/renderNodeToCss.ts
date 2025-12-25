import { RenderNode, Style, Spacing, Layout } from './RenderAst';
import React from 'react';

function spacingToCss(spacing: Spacing | undefined): React.CSSProperties {
  if (spacing === undefined) {
    return {};
  }

  if (typeof spacing === 'number') {
    return {
      padding: `${spacing}px`
    };
  }

  // If it's an object with individual sides
  if (typeof spacing === 'object' && spacing !== null) {
    const result: React.CSSProperties = {};
    
    if (spacing.top !== undefined) result.paddingTop = `${spacing.top}px`;
    if (spacing.right !== undefined) result.paddingRight = `${spacing.right}px`;
    if (spacing.bottom !== undefined) result.paddingBottom = `${spacing.bottom}px`;
    if (spacing.left !== undefined) result.paddingLeft = `${spacing.left}px`;
    
    return result;
  }

  return {};
}

function layoutToCss(layout: Layout | undefined): React.CSSProperties {
  if (!layout || layout.type === "none") {
    return {};
  }

  const result: React.CSSProperties = {
    display: 'flex',
    flexDirection: layout.direction,
    boxSizing: 'border-box'
  };

  if (layout.gap !== undefined) {
    result.gap = `${layout.gap}px`;
  }

  if (layout.align) {
    switch (layout.align) {
      case 'start': result.alignItems = 'flex-start'; break;
      case 'center': result.alignItems = 'center'; break;
      case 'end': result.alignItems = 'flex-end'; break;
      case 'stretch': result.alignItems = 'stretch'; break;
    }
  }

  if (layout.justify) {
    switch (layout.justify) {
      case 'start': result.justifyContent = 'flex-start'; break;
      case 'center': result.justifyContent = 'center'; break;
      case 'end': result.justifyContent = 'flex-end'; break;
      case 'space-between': result.justifyContent = 'space-between'; break;
      case 'space-around': result.justifyContent = 'space-around'; break;
      case 'space-evenly': result.justifyContent = 'space-evenly'; break;
    }
  }

  if (layout.wrap) {
    result.flexWrap = 'wrap';
  }

  return result;
}

export function renderNodeToCss(node: RenderNode): React.CSSProperties {
  const baseStyles: React.CSSProperties = {
    boxSizing: 'border-box'
  };

  // Apply layout styles if it's a frame
  if (node.kind === 'frame' && node.layout) {
    Object.assign(baseStyles, layoutToCss(node.layout));
  }

  // Apply general styles
  if (node.style) {
    const style = node.style;

    // Size properties
    if (style.width !== undefined) {
      baseStyles.width = typeof style.width === 'number' ? `${style.width}px` : style.width;
    }
    if (style.height !== undefined) {
      baseStyles.height = typeof style.height === 'number' ? `${style.height}px` : style.height;
    }
    if (style.minWidth !== undefined) baseStyles.minWidth = `${style.minWidth}px`;
    if (style.maxWidth !== undefined) baseStyles.maxWidth = `${style.maxWidth}px`;
    if (style.minHeight !== undefined) baseStyles.minHeight = `${style.minHeight}px`;
    if (style.maxHeight !== undefined) baseStyles.maxHeight = `${style.maxHeight}px`;

    // Apply spacing - handle both structured Spacing objects and raw CSS strings
    if (style.padding !== undefined) {
      if (typeof style.padding === 'string') {
        // If it's already a CSS string (e.g., "1rem 1.5rem"), use it directly
        baseStyles.padding = style.padding;
      } else {
        Object.assign(baseStyles, spacingToCss(style.padding));
      }
    }

    // For margin, we need a different approach since it's not padding
    if (style.margin !== undefined) {
      if (typeof style.margin === 'string') {
        // If it's already a CSS string, use it directly
        baseStyles.margin = style.margin;
      } else if (typeof style.margin === 'number') {
        baseStyles.margin = `${style.margin}px`;
      } else if (typeof style.margin === 'object' && style.margin !== null) {
        if (style.margin.top !== undefined) baseStyles.marginTop = `${style.margin.top}px`;
        if (style.margin.right !== undefined) baseStyles.marginRight = `${style.margin.right}px`;
        if (style.margin.bottom !== undefined) baseStyles.marginBottom = `${style.margin.bottom}px`;
        if (style.margin.left !== undefined) baseStyles.marginLeft = `${style.margin.left}px`;
      }
    }

    // Background and border properties
    // Handle both 'background' and 'backgroundColor' property names
    if (style.background) baseStyles.backgroundColor = style.background;
    if ((style as any).backgroundColor) baseStyles.backgroundColor = (style as any).backgroundColor;
    if (style.borderColor) baseStyles.borderColor = style.borderColor;
    if (style.borderWidth !== undefined) {
      baseStyles.borderWidth = typeof style.borderWidth === 'number' ? `${style.borderWidth}px` : style.borderWidth;
      baseStyles.borderStyle = 'solid';
    }
    if (style.borderRadius !== undefined) {
      // Handle both numeric values and CSS strings like "4px"
      baseStyles.borderRadius = typeof style.borderRadius === 'number' ? `${style.borderRadius}px` : style.borderRadius;
    }
    // Handle border shorthand (e.g., "none", "1px solid black")
    if ((style as any).border !== undefined) {
      baseStyles.border = (style as any).border;
    }
    // Handle cursor
    if ((style as any).cursor !== undefined) {
      baseStyles.cursor = (style as any).cursor;
    }

    // Opacity
    if (style.opacity !== undefined) baseStyles.opacity = style.opacity;

    // Shadow
    if (style.shadow) {
      const { x, y, blur, spread = 0, color } = style.shadow;
      baseStyles.boxShadow = `${x}px ${y}px ${blur}px ${spread}px ${color}`;
    }
  }

  // Apply text-specific styles if it's a text node
  if (node.kind === 'text' && node.style) {
    const textStyle = node.style;

    if (textStyle.color) baseStyles.color = textStyle.color;
    if (textStyle.fontSize !== undefined) {
      // Handle both numeric values and CSS strings like "16px" or "1rem"
      baseStyles.fontSize = typeof textStyle.fontSize === 'number' ? `${textStyle.fontSize}px` : textStyle.fontSize;
    }
    if (textStyle.fontWeight) baseStyles.fontWeight = textStyle.fontWeight;
    if (textStyle.fontFamily) baseStyles.fontFamily = textStyle.fontFamily;
    if (textStyle.lineHeight !== undefined) baseStyles.lineHeight = textStyle.lineHeight;
    if (textStyle.textAlign) baseStyles.textAlign = textStyle.textAlign;
  }

  // Special styling for unknown nodes
  if (node.kind === 'unknown') {
    baseStyles.border = '1px dashed #999';
    baseStyles.backgroundColor = '#f9f9f9';
    baseStyles.padding = '8px';
  }

  // Default styling for different node types
  switch (node.kind) {
    case 'frame':
      // Frame already has flexbox styling from layout
      break;
    case 'text':
      baseStyles.display = 'block';
      break;
    case 'image':
      baseStyles.display = 'block';
      if (!baseStyles.width) baseStyles.width = 'auto';
      if (!baseStyles.height) baseStyles.height = 'auto';
      break;
    case 'unknown':
      // Already handled above
      break;
  }

  return baseStyles;
}