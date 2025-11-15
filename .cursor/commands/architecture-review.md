---
name: "Architecture Review"
description: "Review architecture compliance using Architecture Guardian"
agent: "Architecture Guardian"
tags: ["architecture", "review", "compliance", "rules"]
---

# Architecture Review

## Overview

Review code or implementation plans for architecture rule compliance using the **Architecture Guardian** agent. This performs a lightweight compliance check focusing on rule violations and proposes minimal fixes.

## Agent

**Use**: @Architecture Guardian

The Architecture Guardian performs a read-only review checking:

- DI via Providers (no direct service instantiation)
- Services/Helpers boundaries (helpers stateless, services own side-effects)
- BLE pipeline compliance (BLE → handlers → EventService → helpers → redux → UI)
- Redux state management (no local state for global concerns)
- Design System usage (no inline styles, use tokens)
- Navigation (use NavigationHelper, not direct `useNavigation()`)
- Settings module (use centralized module, not direct AsyncStorage)

## Steps

1. **Scan Code/Plan**

   - Review provided files or implementation plan
   - Identify scope of changes

2. **Check Architecture Rules**

   - **DI via Providers**: Verify no direct service instantiation (`new Service()`)
   - **Services/Helpers**: Verify helpers are stateless (no I/O), services own side-effects
   - **BLE Pipeline**: Verify BLE data flows through event system
   - **Redux**: Verify no local state for global concerns
   - **Design System**: Verify no inline styles, use tokens
   - **Navigation**: Verify NavigationHelper usage
   - **Settings**: Verify centralized settings module usage

3. **List Violations**

   - Group violations by category (DI, Services, Redux, BLE, DS, Navigation, Settings)
   - For each violation: file path, line number, rule violated, minimal fix

4. **Propose Fixes**
   - Provide minimal, targeted fixes (diffs only, no full rewrites)
   - Focus on violations, not style preferences
   - If no violations found, confirm compliance briefly

## Architecture Review Checklist

### DI / Providers

- [ ] No direct service instantiation (`new Service()`)
- [ ] Services accessed via `ServiceProvider.get*Service()`
- [ ] Helpers accessed via `HelperProvider.get*Helper()`
- [ ] No custom singletons or module-level mutable state

### Services / Helpers

- [ ] Helpers are stateless (no I/O, no side-effects)
- [ ] Services own side-effects (BLE, network, storage)
- [ ] Inter-service communication via EventService only
- [ ] No direct service-to-service imports (except EventService)

### BLE Pipeline

- [ ] BLE data flows: BLE → handlers → EventService → helpers → redux → UI
- [ ] No BLE data processing directly in components
- [ ] Handlers only parse/validate, emit domain events
- [ ] Helpers process events, update Redux

### Redux / State

- [ ] Redux is single source of truth for global state
- [ ] No local state for global concerns
- [ ] Global modals managed via `modalReducer`
- [ ] Immutable state updates (spread operators, no mutations)

### Design System

- [ ] No inline styles (use `styles.ts` file)
- [ ] Design system tokens used (spacing, colors, radius, typography)
- [ ] `@perifit/app-design-system` components used (no custom UI duplicates)
- [ ] Theme colors from `useTheme()` hook

### Navigation / Settings

- [ ] Navigation via `NavigationHelper` (not direct `useNavigation()`)
- [ ] Settings via centralized module (not direct AsyncStorage)
- [ ] Screen tracking via `SegmentService.trackScreenLoaded()`

## Output Format

The Architecture Guardian outputs:

```
## Architecture Compliance Review

### Status
✅ Compliant | ⚠️ Violations Found

### Violations by Category

**DI / Providers**
- `file:line` - Rule: {rule} - Fix: {minimal_diff}

**Services / Helpers**
- `file:line` - Rule: {rule} - Fix: {minimal_diff}

**Redux / State**
- `file:line` - Rule: {rule} - Fix: {minimal_diff}

**BLE Pipeline**
- `file:line` - Rule: {rule} - Fix: {minimal_diff}

**Design System**
- `file:line` - Rule: {rule} - Fix: {minimal_diff}

**Navigation / Settings**
- `file:line` - Rule: {rule} - Fix: {minimal_diff}

### Summary
{count} violations found. Apply minimal fixes above.
```

## Important Notes

- **Read-only review**: This agent does not modify files, only identifies violations
- **Minimal fixes**: Proposes targeted diffs, not full rewrites
- **Concise output**: Focuses on violations, not explanations
- **Quick checks**: Lightweight compliance verification
- **Can be called by**: PM Agent (plan review), Dev Agent (self-review), or directly
