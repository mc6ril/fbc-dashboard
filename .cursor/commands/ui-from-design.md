---
name: "UI from Design"
description: "Create UI from design image using UI Designer"
agent: "UI Designer"
tags: ["ui", "design", "figma", "screenshot", "image"]
---

# UI from Design

## Overview

Create a new UI page or component from a design image (Figma frame, screenshot, or mockup) using the **UI Designer** agent. The UI will be built using Next.js components with SCSS variables from `styles/variables/*` with full accessibility and responsive layout.

## Agent

**Use**: @UI Designer

The UI Designer:

-   Analyzes design images (Figma, screenshots, mockups)
-   Generates code using Next.js components with SCSS variables
-   Ensures full accessibility (WCAG 2.1 AA) using shared/a11y/ utilities
-   Creates responsive layouts
-   Uses SCSS variables from styles/variables/\* for all styling

## Steps

1. **Analyze Design Image**

    - Visually analyze layout, hierarchy, and intent
    - Identify reusable components from presentation/components/ui/
    - Map design elements to components (Button, Input, Card, etc.)

2. **Scaffold File Structure**

    - Create `app/<route>/page.tsx` (Next.js page)
    - Create `presentation/components/<feature>/` directory for local components
    - Create SCSS files using variables from `styles/variables/*`

3. **Generate Code**

    - Use Next.js components and HTML semantic elements
    - Use SCSS variables for all styling (colors, spacing, typography from styles/variables/\*)
    - Build layout and styling using SCSS modules or global SCSS
    - Use TypeScript types for props

4. **Accessibility**

    - Use utilities from `shared/a11y/` for accessibility IDs
    - Add appropriate `role`, `aria-label`, `aria-labelledby` attributes
    - Use semantic HTML elements (`<header>`, `<nav>`, `<main>`, etc.)
    - Add `aria-live` regions for dynamic content
    - Hide decorative elements from screen readers

5. **Responsive Design**

    - Use CSS media queries for responsive layouts
    - Use SCSS variables for responsive spacing and sizing

6. **UI States**
    - Add loading states
    - Add empty states
    - Add error states
    - Add disabled states when applicable

## UI from Design Checklist

### Design Analysis

-   [ ] Design image analyzed (layout, hierarchy, components)
-   [ ] Reusable components identified from presentation/components/ui/
-   [ ] File structure planned (app/<route>/page.tsx, presentation/components/)

### Code Generation

-   [ ] Next.js components used (no inline styles)
-   [ ] SCSS variables used for all styling (colors, spacing, typography from styles/variables/\*)
-   [ ] Styles in SCSS files (no inline styles)
-   [ ] TypeScript types used for props

### Accessibility

-   [ ] All interactive elements use utilities from shared/a11y/
-   [ ] Appropriate `role` or semantic HTML elements used
-   [ ] Descriptive `aria-label` or `aria-labelledby` provided
-   [ ] `aria-describedby` included when needed
-   [ ] Live regions for dynamic content
-   [ ] Decorative elements hidden from screen readers

### Responsive Design

-   [ ] CSS media queries used for responsive layouts
-   [ ] SCSS variables used for responsive spacing and sizing

### UI States

-   [ ] Loading states implemented
-   [ ] Empty states implemented
-   [ ] Error states implemented
-   [ ] Disabled states implemented when applicable

## Important Notes

-   **SCSS variables only**: Always use SCSS variables from styles/variables/\*, add missing variables if needed
-   **Accessibility first**: All components must be fully accessible (WCAG 2.1 AA) using shared/a11y/ utilities
-   **Responsive**: Support responsive layouts using CSS media queries
-   **Coordinate with Dev**: UI Designer creates presentation layer, Architecture-Aware Dev handles business logic and React Query hooks

## Example Workflow

1. Attach design image (Figma frame, screenshot, or mockup)
2. UI Designer analyzes design and identifies components
3. UI Designer generates code with Next.js components and SCSS variables
4. UI Designer ensures accessibility using shared/a11y/ utilities
5. UI Designer ensures responsive design
6. Architecture-Aware Dev integrates with React Query hooks and business logic
