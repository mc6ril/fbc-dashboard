---
Generated: 2025-01-27 22:00:00
Report Type: planning
Command: pm-plan-from-ticket
Ticket: FBC-31
---

# Implementation Plan - FBC-31: Rename Stats to Analyses

## Summary

Rename navigation tab "Statistiques" to "Analyses" and migrate route from `/dashboard/stats` to `/dashboard/analyses`. Pure refactoring task to prepare for future navigation reorganization. No business logic changes.

Constraints: Preserve all existing functionality, update navigation and translations, maintain backward compatibility during migration.

## Solution Outline

-   **Domain**: None (no business logic changes)
-   **Usecases**: None
-   **Infrastructure**: None
-   **Presentation**: Route migration, navigation update, translation keys

## Sub-Tickets

### 31.1 - Create new Analyses route and migrate content

-   AC: [x] New route `/dashboard/analyses` created [x] All content copied from stats page [x] Charts load correctly
-   DoD: [ ] Tests [x] SCSS vars (existing) [x] No linter errors
-   Effort: 2h | Deps: none

### 31.2 - Update navigation and translations

-   AC: [x] DashboardNavbar uses new route [x] Translation key `analyses` added [x] Active state works correctly
-   DoD: [ ] Tests [x] A11y (preserved) [x] No linter errors
-   Effort: 1h | Deps: 31.1

### 31.3 - Clean up old route and update tests

-   AC: [x] Old `/dashboard/stats` route deleted [x] Tests updated [x] Navigation tests pass
-   DoD: [x] Tests [x] No broken links
-   Effort: 1h | Deps: 31.2

## Unit Test Spec

-   File: `__tests__/presentation/components/dashboardNavbar/DashboardNavbar.test.tsx`
-   Key tests:
    -   Render analyses link with correct route
    -   Active state detection for `/dashboard/analyses`
    -   All navigation links render correctly
-   Status: tests approved (update existing tests, no new test-first required for refactoring)

## Agent Prompts

-   **Architecture-Aware Dev**: Migrate `/dashboard/stats` route to `/dashboard/analyses`. Copy page files, update DashboardNavbar navigation items (route and labelKey), add `analyses` translation to fr.json, update navigation tests, delete old route after migration. Preserve all functionality.
-   **QA & Test Coach**: Verify navigation works correctly, active states update properly, charts load on new route, no broken links.

## Open Questions

-   Should we add a temporary redirect from `/dashboard/stats` to `/dashboard/analyses` for backward compatibility?
