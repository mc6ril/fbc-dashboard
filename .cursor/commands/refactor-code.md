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
- **DI via Providers**: Never instantiate services directly
- **Services vs Helpers**: Helpers are stateless (no I/O), Services own side-effects
- **BLE Pipeline**: BLE → handlers → EventService → helpers → redux → UI
- **Redux**: Single source of truth, no local state for global concerns
- **Navigation**: Use NavigationHelper, never direct `useNavigation()`
- **Design System**: Use `@perifit/app-design-system` only, no inline styles
- **Settings**: Use centralized settings module, never direct AsyncStorage

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
- [ ] Extracted reusable functions or components
- [ ] Eliminated code duplication
- [ ] Improved variable and function naming
- [ ] Simplified complex logic and reduced nesting
- [ ] Made code more readable and self-documenting
- [ ] Followed SOLID principles and design patterns
- [ ] Improved error handling and edge case coverage

### Performance
- [ ] Identified and fixed performance bottlenecks
- [ ] Optimized algorithms and data structures
- [ ] Applied React Native optimizations (memoization, BLE listeners cleanup)

### Architecture Compliance
- [ ] Services accessed via Providers (no direct instantiation)
- [ ] Helpers are stateless (no I/O)
- [ ] BLE data flows through event system
- [ ] Redux used for global state (no local state for global concerns)
- [ ] Navigation via NavigationHelper
- [ ] Design System components used (no inline styles)
- [ ] Settings via centralized module (no direct AsyncStorage)
