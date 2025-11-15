---
name: "Refactor Code"
description: "Refactor code following architecture rules using Architecture-Aware Dev"
agent: "Architecture-Aware Dev"
tags: ["refactor", "architecture", "code-quality"]
---

# Refactor Code

## Overview

Refactor the selected code to improve its quality while maintaining the same functionality using the **Architecture-Aware Dev** agent. The refactored code must follow all architecture rules and include explanations of the improvements made.

## Agent

**Use**: @Architecture-Aware Dev

The Architecture-Aware Dev ensures refactoring respects:

-   Clean Architecture boundaries (Domain → Usecases → Infrastructure → Presentation)
-   Layer separation (no Supabase in UI, no business logic in UI)
-   React Query + Zustand usage (React Query for server state, Zustand for UI state only)
-   SCSS variables from `styles/variables/*` only, no hardcoded values
-   Accessibility utilities from `shared/a11y/`

## Steps

1. **Code Quality Improvements**
    - Extract reusable functions or components
    - Eliminate code duplication
    - Improve variable and function naming
    - Simplify complex logic and reduce nesting
2. **Performance Optimizations**
    - Identify and fix performance bottlenecks
    - Optimize algorithms and data structures
    - Reduce unnecessary computations
    - Improve memory usage
3. **Maintainability**
    - Make the code more readable and self-documenting
    - Add appropriate comments where needed
    - Follow SOLID principles and design patterns
    - Improve error handling and edge case coverage

## Refactor Code Checklist

### Code Quality

-   [ ] Extracted reusable functions or components
-   [ ] Eliminated code duplication
-   [ ] Improved variable and function naming
-   [ ] Simplified complex logic and reduced nesting
-   [ ] Made code more readable and self-documenting
-   [ ] Followed SOLID principles and design patterns
-   [ ] Improved error handling and edge case coverage

### Performance

-   [ ] Identified and fixed performance bottlenecks
-   [ ] Optimized algorithms and data structures
-   [ ] Applied Next.js optimizations (memoization, React Query, code splitting)

### Architecture Compliance

-   [ ] Clean Architecture boundaries respected
-   [ ] Layer separation maintained (no Supabase in UI, no business logic in UI)
-   [ ] React Query + Zustand usage verified
-   [ ] SCSS variables used (no hardcoded values)
-   [ ] Accessibility utilities from shared/a11y/ used
