# Change: Update Preview Command for Visual UI Representation

## Why
The current `dcf preview` command renders DCF elements as JSON or simple field information, which doesn't provide designers and developers with a meaningful visual representation of the UI design. The goal is to enhance the preview functionality to map DCF elements to visual elements (containers, text, buttons, layout, padding, margin, borders, etc.) according to the design defined in the DCF file, providing a best effort representation of the UI Design.

## What Changes
- **MODIFIED**: Preview command visual rendering to map DCF elements to actual visual components
- **ADDED**: Component rendering that creates actual UI elements based on DCF definitions
- **ADDED**: Layout rendering that respects positioning, spacing, and structural properties
- **ADDED**: Token application to visual elements (colors, typography, spacing)
- **ADDED**: Style mapping from DCF styles to CSS properties
- **ADDED**: Interactive visual preview with live updates

## Impact
- Affected specs: `preview-core` (enhanced visual rendering)
- Affected code: `src/lib/preview/preview-app.tsx`, `src/lib/preview/preview-server.ts`
- Breaking change: None - this is a visual enhancement that maintains existing functionality
- Performance: May require additional processing for visual rendering