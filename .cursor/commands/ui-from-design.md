---
name: "UI from Design"
description: "Create UI from design image using UI Designer"
agent: "UI Designer"
tags: ["ui", "design-system", "figma", "screenshot", "image"]
---

# UI from Design

## Overview

Create a new UI screen or component from a design image (Figma frame, screenshot, or mockup) using the **UI Designer** agent. The UI will be built using only `@perifit/app-design-system` components with full accessibility and responsive layout.

## Agent

**Use**: @UI Designer

The UI Designer:

- Analyzes design images (Figma, screenshots, mockups)
- Generates code using only `@perifit/app-design-system` components
- Ensures full accessibility (WCAG 2.1 AA)
- Creates responsive layouts
- Uses Resx for all user-facing text

## Steps

1. **Analyze Design Image**

   - Visually analyze layout, hierarchy, and intent
   - Identify reusable Design System components
   - Map design elements to DS components (Button, IconButton, TextField, Toggle, Slider, Badge, ProgressBar, Loader, Toast, BottomSheet, Tabs, ListItem, etc.)

2. **Scaffold File Structure**

   - Create `screens/<feature>/` directory
   - Create `index.tsx` (main component)
   - Create `styles.ts` (styling with DS tokens)
   - Create `types.ts` (TypeScript types)
   - Create `components/` subdirectory for local components if needed

3. **Generate Code**

   - Use Design System components only (no native React Native components)
   - Use semantic typography variants (h1-h5, body, caption)
   - Use DS tokens for all styling (spacing, colors, radius, typography)
   - Build layout and styling in `styles.ts` using `createStyles(themeColors, typography, insets)`

4. **Internationalization (i18n)**

   - **ALWAYS use Resx for all user-facing text** (import from "modules/localisation")
   - If translation keys are missing, directly add them to `src/modules/localisation/lokalise/en.json`
   - Use camelCase, descriptive key names (e.g. `connectDeviceError`, `languageInfoText`)
   - Group related keys with common prefixes

5. **Accessibility**

   - Add `accessibilityRole`, `accessibilityLabel`, `accessibilityHint` props
   - Use `CommonHelper.getAccessibilityId()` for accessibility IDs
   - Add `accessibilityLiveRegion` for dynamic content
   - Hide decorative elements from screen readers

6. **Responsive Design**

   - Use `IsTablet()` function for device detection
   - Use `normalize()` for responsive font sizing
   - Provide different spacing/sizing for tablet vs mobile

7. **UI States**
   - Add loading states (Loader component)
   - Add empty states
   - Add error states
   - Add disabled states when applicable

## UI from Design Checklist

### Design Analysis

- [ ] Design image analyzed (layout, hierarchy, components)
- [ ] Design System components identified for each element
- [ ] File structure planned (index.tsx, styles.ts, types.ts, components/)

### Code Generation

- [ ] Design System components used (no native React Native components)
- [ ] Semantic typography variants used (h1-h5, body, caption)
- [ ] DS tokens used for all styling (spacing, colors, radius, typography)
- [ ] Styles in `styles.ts` file (no inline styles)
- [ ] Theme colors from `useTheme()` hook

### Internationalization

- [ ] All user-facing text uses Resx (no hardcoded strings)
- [ ] Missing translation keys added to `en.json` with descriptive camelCase names
- [ ] Dynamic content handled separately (interpolation)

### Accessibility

- [ ] All interactive elements have accessibility IDs
- [ ] Appropriate `accessibilityRole` set
- [ ] Descriptive `accessibilityLabel` provided
- [ ] `accessibilityHint` included for actions
- [ ] Live regions for dynamic content
- [ ] Decorative elements hidden from screen readers

### Responsive Design

- [ ] `IsTablet()` function used for device detection
- [ ] `normalize()` used for responsive font sizing
- [ ] Different spacing/sizing for tablet vs mobile

### UI States

- [ ] Loading states implemented
- [ ] Empty states implemented
- [ ] Error states implemented
- [ ] Disabled states implemented when applicable

## Important Notes

- **Design System only**: Never create custom UI components that duplicate design system functionality
- **Resx for all text**: Always use Resx for user-facing text, add missing keys to `en.json` directly
- **Accessibility first**: All components must be fully accessible (WCAG 2.1 AA)
- **Responsive**: Support both mobile and tablet layouts
- **Coordinate with Dev**: UI Designer creates presentation layer, Architecture-Aware Dev handles business logic and Redux connections

## Example Workflow

1. Attach design image (Figma frame, screenshot, or mockup)
2. UI Designer analyzes design and identifies components
3. UI Designer generates code with Design System components
4. UI Designer adds Resx keys to `en.json`
5. UI Designer ensures accessibility and responsive design
6. Architecture-Aware Dev integrates with Redux and business logic
