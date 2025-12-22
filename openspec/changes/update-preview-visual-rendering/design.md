## Context
The current `dcf preview` command displays DCF documents as JSON representations with some basic visual elements for tokens (like color swatches). However, it doesn't provide a true visual representation of the UI that the DCF document describes. The goal is to create a visual rendering engine that maps DCF elements to actual UI components that reflect the design intent.

## Goals / Non-Goals
- Goals: 
  - Render DCF components as actual visual UI elements
  - Apply DCF tokens (colors, spacing, typography) to visual elements
  - Implement layout rendering that respects DCF layout definitions
  - Maintain real-time update capabilities when DCF files change
- Non-Goals:
  - Create a full design editor (only a preview)
  - Support every possible CSS property (focus on common ones)
  - Implement advanced animation capabilities

## Decisions
- Decision: Use React components to render DCF elements with dynamic styling
  - Rationale: React provides a good component model that maps well to DCF components
  - Implementation: Create a mapping system that converts DCF component definitions to React elements with applied styles

- Decision: Implement a token resolution system
  - Rationale: DCF tokens like `{colors.primary}` need to be resolved to actual values
  - Implementation: Create a token resolver that processes style values before applying them

- Decision: Use inline styles for initial implementation
  - Rationale: Provides direct mapping from DCF styles to visual output
  - Alternative considered: CSS classes (more complex but potentially better performance)

## Risks / Trade-offs
- Risk: Performance degradation with complex DCF documents → Mitigation: Implement virtualization for large component trees
- Risk: CSS property compatibility → Mitigation: Focus on widely supported CSS properties initially
- Risk: Token reference resolution complexity → Mitigation: Implement recursive token resolution with cycle detection

## Migration Plan
1. Implement token resolution system
2. Create basic component rendering engine
3. Add layout rendering capabilities
4. Enhance with visual debugging features
5. Optimize performance for complex documents

## Open Questions
- How to handle unsupported CSS properties in DCF documents?
- Should we provide a toggle between visual and JSON view?
- How to represent interactive states (hover, active) in the preview?