---
Generated: 2025-01-27 14:30:22
Report Type: planning
Command: pm-plan-from-ticket
Ticket: FBC-17
---

## Summary

Goal: Introduce Zod schemas for runtime validation of Activity and Product form inputs, replacing manual validation with type-safe, accessible error handling.  
Constraints: Keep domain layer pure (no Zod imports in `core/domain`); schemas live in `shared/validation/`; maintain existing domain validation functions; ensure accessible error messages; handle type-specific Activity validation (CREATION, SALE, STOCK_CORRECTION, OTHER); support cascading Product selects (type → model → coloris).  
Non-goals: Replace domain validation functions; validate at usecase layer; add Zod to domain types.

## Assumptions & Risks

-   Assumptions: Zod can infer types from domain enums; form error state can be mapped from Zod errors; existing domain validation remains as fallback.
-   Risks: Complex type-specific Activity validation may require conditional schemas; cascading Product validation needs careful schema design; error message translation/accessibility mapping complexity; potential duplication between Zod schemas and domain validation.

## Solution Outline (aligned with architecture)

-   Shared: Create `src/shared/validation/` with Zod schemas for Activity and Product inputs; map Zod errors to accessible error messages.
-   Presentation: Refactor `AddActivityForm` and `ProductForm` to use Zod schemas; integrate with React Hook Form or manual form state; ensure error messages are accessible (aria-describedby, role="alert").
-   Domain/Usecases/Infrastructure: No changes (validation schemas are presentation/shared concern).
-   Testing: Unit tests for Zod schemas in `__tests__/shared/validation/`; update form component tests to verify Zod integration.

## Sub-Tickets

### 17.1 - Install Zod and create validation directory structure

-   AC: [ ] Zod installed as dependency [ ] `src/shared/validation/` directory created [ ] Base schema utilities file created
-   DoD: [ ] Tests [ ] Package.json updated [ ] Directory structure verified
-   Effort: 1h | Deps: none

### 17.2 - Create Activity input Zod schema

-   AC: [ ] Schema validates Activity input (date, type, productId, quantity, amount, note) [ ] Type-specific validation (productId required for SALE/STOCK_CORRECTION) [ ] Schema infers TypeScript type from domain enums
-   DoD: [ ] Tests [ ] Schema matches domain validation rules [ ] Type inference verified
-   Effort: 3h | Deps: 17.1

### 17.3 - Create Product input Zod schema

-   AC: [ ] Schema validates Product input (modelId, colorisId, unitCost, salePrice, stock, weight) [ ] Handles optional weight field [ ] Schema infers TypeScript type
-   DoD: [ ] Tests [ ] Schema matches domain validation rules [ ] Type inference verified
-   Effort: 2h | Deps: 17.1

### 17.4 - Create error mapping utilities for accessible messages

-   AC: [ ] Zod errors mapped to accessible error format [ ] Error messages use aria-describedby pattern [ ] Error messages are clear and user-friendly
-   DoD: [ ] Tests [ ] A11y compliance verified [ ] Error format documented
-   Effort: 2h | Deps: 17.2, 17.3

### 17.5 - Integrate Zod validation into AddActivityForm

-   AC: [ ] Form uses Zod schema for validation [ ] Type-specific validation works (CREATION, SALE, STOCK_CORRECTION, OTHER) [ ] Error messages are accessible [ ] STOCK_CORRECTION two-field validation preserved
-   DoD: [ ] Tests [ ] A11y [ ] Form validation matches existing behavior [ ] Manual validation removed
-   Effort: 4h | Deps: 17.2, 17.4

### 17.6 - Integrate Zod validation into ProductForm

-   AC: [ ] Form uses Zod schema for validation [ ] Cascading selects validation preserved [ ] Error messages are accessible [ ] All fields validated correctly
-   DoD: [ ] Tests [ ] A11y [ ] Form validation matches existing behavior [ ] Manual validation removed
-   Effort: 3h | Deps: 17.3, 17.4

## Unit Test Spec

-   File path: `__tests__/shared/validation/activitySchema.test.ts`, `__tests__/shared/validation/productSchema.test.ts`, `__tests__/shared/validation/errorMapping.test.ts`
-   Key test names:
    -   Activity schema: validates required fields, validates type-specific productId requirement, validates date format, validates number fields, rejects invalid types
    -   Product schema: validates required fields, validates optional weight, validates positive numbers, validates non-negative stock, validates modelId/colorisId
    -   Error mapping: maps Zod errors to accessible format, provides clear error messages, handles nested field errors
-   Status: tests proposed

## Agent Prompts

-   Unit Test Coach: "Generate unit test specs for Zod schemas in `src/shared/validation/` (Activity and Product input schemas) and error mapping utilities. Tests should cover all validation rules, type-specific cases, and error message accessibility."
-   Architecture-Aware Dev: "Implement Zod validation schemas in `src/shared/validation/` for Activity and Product inputs. Keep domain layer pure (no Zod imports). Integrate schemas into AddActivityForm and ProductForm with accessible error messages."
-   UI Designer: "Review and improve error message UX for Zod validation in AddActivityForm and ProductForm. Ensure error messages are clear, accessible, and follow WCAG 2.1 AA guidelines."
-   QA & Test Coach: "Create test plan for Zod validation integration. Verify form validation behavior matches existing manual validation, test error message accessibility, and validate type-specific Activity validation scenarios."

## Open Questions

1. Should we use React Hook Form for form state management, or keep manual state with Zod validation?
2. How should we handle error message translation (currently forms use French, but code/documentation is English)?
3. Should Zod schemas replace domain validation functions entirely, or coexist as separate validation layers?
