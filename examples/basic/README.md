# Basic DCF Example

This example demonstrates the proper structure for DCF files by splitting a combined file into separate, correctly-structured files.

## Files

### `tokens.json`
- `kind`: "tokens"
- Contains design tokens for colors, spacing, and typography
- Uses the proper DCF tokens schema

### `button.component.json`
- `kind`: "component"
- Defines the Button component with proper structure
- Uses the proper DCF component schema

### `card.component.json`
- `kind`: "component"
- Defines the Card component with proper structure
- Uses the proper DCF component schema

### `basic.json` (Original)
- This is the original combined file that does not follow proper DCF structure
- It lacks the required `kind` field and combines multiple concerns in one file
- Still validates against the generic schema for backward compatibility

## Key Differences

The new files follow the DCF specification properly:
- Each file has a specific `kind` field
- Each file is validated against the appropriate schema
- Proper separation of concerns (tokens, components)
- Correct schema structure for each file type