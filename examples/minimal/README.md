# Minimal DCF Example

This example demonstrates the minimal valid DCF structure with proper `kind` field.

## Files

### `tokens.json`
- `kind`: "tokens"
- Contains the minimal required structure for a valid DCF tokens file
- Uses the proper DCF tokens schema

## Key Differences

The new file follows the DCF specification properly:
- Has the required `kind` field
- Is validated against the appropriate schema (`tokens.schema.json`)
- Contains minimal but valid DCF structure
- Passes validation successfully