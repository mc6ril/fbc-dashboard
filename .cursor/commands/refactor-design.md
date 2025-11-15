---
name: "Refactor Design"
description: "Refactor UI to Design System compliance using UI Designer"
agent: "UI Designer"
tags: ["ui", "design-system", "refactor", "a11y"]
---

# Refactor Design

## Overview

Refactor the selected file(s) to improve design system compliance using the **UI Designer** agent. Replace custom components with design system components, and ensure consistent styling patterns while maintaining the same visual appearance and functionality.

## Agent

**Use**: @UI Designer

The UI Designer ensures:
- Use of `@perifit/app-design-system` components only
- Design system tokens (spacing, colors, typography, radius)
- Full accessibility (WCAG 2.1 AA)
- Responsive layouts
- **Resx for all user-facing text** (import from "modules/localisation")

## Steps

1. **Design System Component Replacement**

   - Identify custom UI components that duplicate design system functionality
   - Replace native React Native components (View, Text, TouchableOpacity) with design system components
   - Replace custom buttons, inputs, and form elements with design system equivalents
   - Ensure all components use the correct variants and sizes from the design system

2. **Styling Compliance**

   - Move all inline styles to a separate `styles.ts` file
   - Replace hardcoded spacing values with design system spacing tokens (spacing.s, spacing.md, spacing.lg)
   - Replace hardcoded colors with theme colors from `useTheme()` hook
   - Replace hardcoded border radius values with design system radius tokens (radius.s, radius.md, radius.lg)
   - Ensure all colors use semantic tokens (text.primary, fill.page, border.primary)

3. **Typography Improvements**

   - Replace React Native `Text` components with `Typography` component from design system
   - Use appropriate typography variants (h1, h2, h3, h4, h5, body, caption)
   - Ensure semantic usage of typography variants

4. **Accessibility Enhancements**

   - Ensure all interactive elements have proper accessibility IDs using `CommonHelper.getAccessibilityId()`
   - Add appropriate `accessibilityRole` and `accessibilityLabel` props
   - Verify accessibility compliance for all UI components

5. **Internationalization (i18n)**
   - **ALWAYS use Resx for all user-facing text** (import from "modules/localisation")
   - If translation keys are missing, directly add them to `src/modules/localisation/lokalise/en.json`
   - Use camelCase, descriptive key names (e.g. `connectDeviceError`, `languageInfoText`)
   - Group related keys with common prefixes
   - Never hardcode strings

6. **File Structure**
   - Ensure component files follow the established folder structure
   - Verify `styles.ts` file exists and is properly organized
   - Check that types are defined in separate `types.ts` file when needed

## Refactor Design Checklist

- [ ] Replaced custom UI components with design system components
- [ ] Replaced native React Native components with design system equivalents
- [ ] Moved all inline styles to `styles.ts` file
- [ ] Replaced hardcoded spacing values with design system spacing tokens
- [ ] Replaced hardcoded colors with theme colors from `useTheme()` hook
- [ ] Replaced hardcoded border radius values with design system radius tokens
- [ ] Replaced React Native `Text` components with `Typography` component
- [ ] Used appropriate typography variants (h1, h2, h3, h4, h5, body, caption)
- [ ] Added proper accessibility IDs to all interactive elements
- [ ] Added appropriate `accessibilityRole` and `accessibilityLabel` props
- [ ] Verified file structure follows established patterns
- [ ] Ensured `styles.ts` file is properly organized
- [ ] Verified responsive design with `IsTablet()` function when needed
- [ ] Used design system tokens consistently throughout the file(s)
- [ ] All user-facing text uses Resx (no hardcoded strings)
- [ ] Missing translation keys added to `en.json` with descriptive camelCase names

## Design System Compliance

### Components to Replace

- **Buttons**: Use `Button` component with variants (primary, secondary, inversed, link) and sizes (big, small)
- **Icon Buttons**: Use `IconButton` component with sizes (big, small, verySmall)
- **Text Inputs**: Use `TextField` component for all text inputs
- **Text Areas**: Use `TextArea` component for multi-line text
- **Toggles**: Use `Toggle` component for on/off states
- **Lists**: Use `ListItem` component for list items
- **Modals**: Use `BottomSheet` from `@gorhom/bottom-sheet` for modals
- **Typography**: Use `Typography` component for all text content

### Styling Patterns

- **Colors**: Always use `themeColors` from `useTheme()` hook
- **Spacing**: Always use `spacing` tokens (spacing.s, spacing.md, spacing.lg)
- **Radius**: Always use `radius` tokens (radius.s, radius.md, radius.lg)
- **Files**: Always create `styles.ts` file for component styles
- **Theme**: Always use `useTheme()` hook for theme access

Provide refactored code with explanations of the design system improvements made and ensure visual appearance and functionality remain unchanged.
