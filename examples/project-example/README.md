# Project Example DCF

This example demonstrates a project structure with properly formatted DCF files.

## Files

### Token Files
- `tokens/base.tokens.json` - `kind`: "tokens"
  - Contains all design tokens (colors, spacing, typography, etc.)
  - Uses the proper DCF tokens schema

### Component Files
- `components/button.component.json` - `kind`: "component"
  - Defines the Button component with proper structure
  - Uses the proper DCF component schema
- `components/card.component.json` - `kind`: "component" 
  - Defines the Card component with proper structure
  - Uses the proper DCF component schema

### Legacy Files
- `project.dcf.json` - Combined file without proper `kind` fields
- `tokens/base.json` - Token file without proper `kind` field
- `components/base.json` - Component file without proper `kind` field
- These files still work but use generic schema validation

## Key Differences

The new files follow the DCF specification properly:
- Each file has a specific `kind` field
- Each file is validated against the appropriate schema
- Proper separation of concerns (separate tokens and components)
- Correct schema structure for each file type
- All new files pass validation successfully