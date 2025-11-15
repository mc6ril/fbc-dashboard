---
name: "Refactor Design"
description: "Refactor UI to SCSS variables and accessibility compliance using UI Designer"
agent: "UI Designer"
tags: ["ui", "scss", "refactor", "a11y"]
---

# Refactor Design

## Overview

Refactor the selected file(s) to improve SCSS variables compliance and accessibility using the **UI Designer** agent. Replace hardcoded values with SCSS variables and ensure full accessibility compliance while maintaining the same visual appearance and functionality.

## Agent

**Use**: @UI Designer

The UI Designer ensures:

-   Use of SCSS variables from `styles/variables/*` only
-   Full accessibility (WCAG 2.1 AA) using shared/a11y/ utilities
-   Responsive layouts
-   No inline styles

## Steps

1. **SCSS Variables Compliance**

    - Replace hardcoded spacing values with SCSS variables from styles/variables/\_spacing.scss
    - Replace hardcoded colors with SCSS variables from styles/variables/\_colors.scss
    - Replace hardcoded typography values with SCSS variables from styles/variables/\_typography.scss
    - If variables are missing, add them to the appropriate file in styles/variables/\*

2. **Styling Improvements**

    - Move all inline styles to SCSS files
    - Use SCSS modules or global SCSS from styles/
    - Ensure consistent styling patterns

3. **Accessibility Enhancements**

    - Use utilities from shared/a11y/ for accessibility IDs
    - Add appropriate `role`, `aria-label`, `aria-labelledby` attributes
    - Use semantic HTML elements
    - Add `aria-live` regions for dynamic content
    - Hide decorative elements from screen readers

4. **Responsive Design**
    - Use CSS media queries for responsive layouts
    - Use SCSS variables for responsive spacing and sizing

## Refactor Design Checklist

-   [ ] Replaced hardcoded spacing values with SCSS variables
-   [ ] Replaced hardcoded colors with SCSS variables
-   [ ] Replaced hardcoded typography values with SCSS variables
-   [ ] Missing variables added to styles/variables/\* if needed
-   [ ] Moved all inline styles to SCSS files
-   [ ] Used SCSS modules or global SCSS from styles/
-   [ ] Added proper accessibility attributes using shared/a11y/ utilities
-   [ ] Used semantic HTML elements
-   [ ] Added live regions for dynamic content
-   [ ] Verified responsive design with CSS media queries

Provide refactored code with explanations of the improvements made and ensure visual appearance and functionality remain unchanged.
