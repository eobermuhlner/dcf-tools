# Complex DCF Example

This example demonstrates a comprehensive DCF structure by splitting a combined file into separate, correctly-structured files.

## Files

### `tokens.json`
- `kind`: "tokens"
- Contains design tokens for colors and spacing
- Uses the proper DCF tokens schema

### Component Files
- `button.component.json` - `kind`: "component"
- `header.component.json` - `kind`: "component" 
- `sidebar.component.json` - `kind`: "component"
- `maincontent.component.json` - `kind`: "component"
- `footer.component.json` - `kind`: "component"
- `card.component.json` - `kind`: "component"
- All use the proper DCF component schema

### `mainlayout.layout.json`
- `kind`: "layout"
- Defines the main application layout with regions
- Uses the proper DCF layout schema

### Screen Files
- `homescreen.screen.json` - `kind`: "screen"
- `aboutscreen.screen.json` - `kind`: "screen"
- Both use the proper DCF screen schema

### `navigation.json`
- `kind`: "navigation"
- Defines application navigation routes
- Uses the proper DCF navigation schema

## Key Differences

The new files follow the DCF specification properly:
- Each file has a specific `kind` field
- Each file is validated against the appropriate schema
- Proper separation of concerns (tokens, components, layouts, screens, navigation)
- Correct schema structure for each file type