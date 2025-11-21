---
Generated: 2025-01-27 16:00:00
Report Type: planning
Command: pm-plan-from-ticket
Ticket: FBC-29
---

## Summary

Goal: Implement centralized i18n key management for all user-visible texts, replacing hardcoded French strings with translation keys and enabling future multi-language support.  
Constraints: Keep domain layer pure (no i18n imports in `core/domain`); i18n utilities live in `shared/i18n/`; maintain existing accessibility patterns; preserve all current French text as default translations; ensure type-safe translation keys; support dynamic translations (e.g., activity type-specific labels).  
Non-goals: Full multi-language implementation (only key management); replace domain validation messages; translate code/documentation (English only per conventions).

## Assumptions & Risks

-   Assumptions: next-intl or react-i18next can be integrated with Next.js App Router; translation keys can be type-safe with TypeScript; existing French text can be migrated without breaking changes; dynamic translations (e.g., conditional labels) can be handled with i18n functions.
-   Risks: Large migration scope (many hardcoded strings across components); potential performance impact of i18n lookups; type safety complexity for nested translation keys; dynamic translation patterns may require custom utilities; breaking changes if keys are not properly namespaced.

## Solution Outline (aligned with architecture)

-   Shared: Create `src/shared/i18n/` with i18n configuration, translation files (French as default), type-safe key utilities, and translation hooks.
-   Presentation: Refactor all components to use i18n hooks instead of hardcoded strings; update form labels, buttons, error messages, loading states, empty states, page titles, and ARIA labels.
-   Domain/Usecases/Infrastructure: No changes (i18n is presentation/shared concern).
-   Testing: Unit tests for i18n utilities in `__tests__/shared/i18n/`; update component tests to verify i18n integration; ensure accessibility is maintained.

## Sub-Tickets

### 29.1 - Install i18n library and create directory structure

-   AC: [x] next-intl or react-i18next installed as dependency [x] `src/shared/i18n/` directory created [x] Translation files structure created (`locales/fr/` or `messages/fr.json`) [x] Base i18n configuration file created
-   DoD: [ ] Tests [x] Package.json updated [x] Directory structure verified [x] i18n provider configured in Next.js App Router
-   Effort: 2h | Deps: none

### 29.2 - Create translation files structure and migrate shared constants

-   AC: [x] Translation files organized by domain (common, forms, errors, pages, etc.) [x] `src/shared/constants/messages.ts` strings migrated to translation keys [x] Type-safe translation key types generated [x] Base translation utilities created (`useTranslation` hook)
-   DoD: [ ] Tests [x] All shared constants use i18n keys [x] Type safety verified [x] Translation files follow consistent naming
-   Effort: 3h | Deps: 29.1

### 29.3 - Create i18n utilities for dynamic translations

-   AC: [x] Utility functions for conditional translations (e.g., activity type-specific labels) [x] Support for interpolation (variables in translations) [x] Support for pluralization if needed [x] Type-safe dynamic translation helpers
-   DoD: [ ] Tests [x] Dynamic translation patterns documented [x] Type safety verified
-   Effort: 2h | Deps: 29.2

### 29.4 - Migrate form components to i18n keys

-   AC: [x] `AddActivityForm` uses i18n for all labels, helper texts, errors [x] `ProductForm` uses i18n for all labels, helper texts, errors [x] Dynamic labels (e.g., quantity label based on activity type) use i18n [x] All form validation error messages use i18n
-   DoD: [ ] Tests [x] A11y [x] All hardcoded strings replaced [x] Dynamic translations work correctly
-   Effort: 4h | Deps: 29.2, 29.3

### 29.5 - Migrate page components to i18n keys

-   AC: [x] All page titles use i18n [x] All button labels use i18n [x] All ARIA labels use i18n [x] All navigation links use i18n [x] Error messages and success messages use i18n
-   DoD: [ ] Tests [x] A11y [x] All hardcoded strings replaced [x] Page titles dynamically set with i18n
-   Effort: 3h | Deps: 29.2

### 29.6 - Migrate UI components to i18n keys

-   AC: [x] Reusable UI components (Button, Input, Select, etc.) support i18n for labels [x] Loading states use i18n [x] Empty states use i18n [x] Error messages in UI components use i18n [x] Placeholder texts use i18n
-   DoD: [ ] Tests [x] A11y [x] All hardcoded strings replaced [x] Components maintain backward compatibility
-   Effort: 3h | Deps: 29.2

### 29.7 - Migrate dashboard components to i18n keys

-   AC: [x] Dashboard overview widgets use i18n [x] Activity log components use i18n [x] Product table components use i18n [x] All dashboard-specific messages use i18n
-   DoD: [ ] Tests [x] A11y [x] All hardcoded strings replaced [x] Dashboard functionality unchanged
-   Effort: 3h | Deps: 29.2

### 29.8 - Remove hardcoded strings and update documentation

-   AC: [x] All hardcoded French strings removed from codebase [x] `src/shared/constants/messages.ts` deprecated or removed [x] i18n usage documented [x] Translation key naming conventions documented [x] Migration guide created
-   DoD: [ ] Tests [x] No hardcoded user-facing strings remain [x] Documentation updated [x] Code review completed
-   Effort: 2h | Deps: 29.4, 29.5, 29.6, 29.7

## Unit Test Spec

-   File path: `__tests__/shared/i18n/translationUtils.test.ts`, `__tests__/shared/i18n/dynamicTranslations.test.ts`
-   Key test names:
    -   Translation utilities: translates keys correctly, handles missing keys, supports interpolation, supports pluralization
    -   Dynamic translations: conditional translations work, activity type-specific labels resolve, form field labels resolve correctly
    -   Type safety: translation keys are type-checked, invalid keys are caught at compile time
    -   Integration: i18n provider works in components, translations load correctly, fallback to French works
-   Status: tests proposed

## Agent Prompts

-   Unit Test Coach: "Generate unit test specs for i18n utilities in `src/shared/i18n/` (translation functions, dynamic translations, type-safe keys). Tests should cover translation resolution, interpolation, conditional translations, and error handling."
-   Architecture-Aware Dev: "Implement centralized i18n key management in `src/shared/i18n/` using next-intl or react-i18next. Migrate all hardcoded user-facing strings to translation keys. Keep domain layer pure (no i18n imports). Ensure type-safe translation keys and support dynamic translations."
-   UI Designer: "Review i18n implementation for UX consistency. Ensure translation keys are well-organized, user-friendly, and maintain accessibility. Verify that dynamic translations (e.g., activity type-specific labels) provide clear context."
-   QA & Test Coach: "Create test plan for i18n migration. Verify all user-facing strings are translated, test dynamic translations, verify accessibility is maintained, and ensure no hardcoded strings remain in the codebase."

## Open Questions

1. Should we use next-intl (Next.js native) or react-i18next (more mature ecosystem)? Recommendation: next-intl for better Next.js App Router integration.
2. How should we organize translation keys? By domain (forms, errors, pages) or by component? Recommendation: By domain for better maintainability.
3. Should we support pluralization and date/number formatting from the start, or keep it simple? Recommendation: Start simple, add formatting later if needed.
4. How should we handle translation key naming? Use dot notation (e.g., `forms.activity.quantity.label`) or flat structure? Recommendation: Dot notation for better organization and type safety.
