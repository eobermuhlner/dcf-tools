# PetStore Example

A comprehensive DCF example demonstrating a complete e-commerce pet store application.

## Overview

This example showcases how DCF can describe a full-featured web application including:

- **Design tokens** for consistent styling
- **Theme definitions** with light/dark mode support
- **Internationalization** strings
- **Reusable components** for common UI elements
- **Layout templates** for page structure
- **Screen definitions** for all application pages
- **Navigation structure** with routing
- **User flow** for the purchase journey
- **Design rules** for consistency and accessibility

## Structure

```
project-petstore/
├── tokens.json           # Design tokens (colors, spacing, typography)
├── theme.json            # Light and dark theme definitions
├── i18n.json             # English translations
├── navigation.json       # Routes structure
├── flow.json             # Purchase user flow
├── rules.json            # Design constraints and rules
├── components/           # Reusable UI components
│   ├── header.component.json
│   ├── footer.component.json
│   ├── pet-card.component.json
│   ├── search-bar.component.json
│   ├── cart-item.component.json
│   └── category-card.component.json
├── layouts/              # Page layout templates
│   ├── main.layout.json
│   └── admin.layout.json
└── screens/              # Application screens
    ├── home.screen.json
    ├── pet-list.screen.json
    ├── pet-detail.screen.json
    ├── cart.screen.json
    ├── checkout.screen.json
    └── admin-dashboard.screen.json
```

## Features Demonstrated

### Design Tokens
- Color palette with semantic naming
- Spacing scale (xxs to xxxl)
- Typography system (sizes, weights, line heights)
- Border radius and shadow tokens
- Breakpoints for responsive design

### Components
- **Header**: Navigation bar with user actions
- **Footer**: Site links and copyright
- **PetCard**: Product card with image and details
- **SearchBar**: Input with search functionality
- **CartItem**: Shopping cart line item
- **CategoryCard**: Category showcase

### Layouts
- **MainLayout**: Header, main content, footer regions
- **AdminLayout**: Header, sidebar, main content regions

### Screens
- **Home**: Hero section, categories, featured pets
- **Pet List**: Filterable grid with pagination
- **Pet Detail**: Full product page with related items
- **Cart**: Shopping cart with summary
- **Checkout**: Multi-step checkout process
- **Admin Dashboard**: Stats, orders, alerts

### User Flow
The purchase flow defines the journey from browsing to checkout:
- PetListScreen → PetDetailScreen → CartScreen → CheckoutScreen → OrderConfirmation

### Design Rules
- Token-based styling enforcement
- Accessibility requirements
- Component naming conventions
- Form validation patterns
- Performance guidelines

## Usage

Validate the example:
```bash
dcf validate examples/project-petstore/
```

Preview the example:
```bash
dcf preview examples/project-petstore/
```

## Data References

The example uses DCF's reference syntax:
- `$strings.*` - Internationalized text from i18n.json
- `$data.*` - Runtime data from API or context
- `$params.*` - URL/route parameters
- `{token.*}` - Design token values
