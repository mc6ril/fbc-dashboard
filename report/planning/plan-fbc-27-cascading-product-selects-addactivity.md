---
Generated: 2025-01-27 22:00:00
Report Type: planning
Command: pm-plan-from-ticket
Ticket: FBC-27
---

# Implementation Plan: Cascading Product Selects in AddActivityForm (FBC-27)

## Summary

**Goal:** Implement cascading product selection (Type → Model → Coloris) in AddActivityForm component to improve UX and provide consistency with ProductForm.

**User Value:**

-   Faster product selection through progressive filtering
-   Consistent UX across ProductForm and AddActivityForm
-   Better scalability as product catalog grows
-   Reduced cognitive load with hierarchical selection

**Constraints:**

-   Must use existing infrastructure from FBC-26 (hooks, usecases, repository methods)
-   Must maintain existing AddActivityForm functionality (activity creation)
-   Must follow Clean Architecture principles (presentation layer only)
-   Must comply with accessibility requirements (WCAG 2.1 AA)
-   Must use SCSS variables (no hardcoded values)

**Non-Goals:**

-   Backend changes (all infrastructure exists from FBC-26)
-   Changes to ProductForm (already implemented)
-   Changes to activity domain or usecases
-   New hooks or repository methods

## Assumptions & Risks

### Assumptions

1. **Infrastructure available:** FBC-26 hooks (`useProductModelsByType`, `useProductColorisByModel`) are working correctly
2. **Product data structure:** Products have `modelId` and `colorisId` fields (from FBC-26)
3. **Reference implementation:** ProductForm implementation can be used as reference
4. **Form context:** AddActivityForm is used in a page context where activity creation is the primary action

### Risks

1. **Product identification complexity:** Finding `productId` from `modelId` + `colorisId` may require querying all products
    - **Mitigation:** Use `useProducts()` hook and filter in-memory (acceptable for small-medium catalogs)
2. **State management:** Cascading reset logic must handle rapid user changes correctly
    - **Mitigation:** Use refs to track previous values and avoid clearing on initial mount (pattern from ProductForm)
3. **Loading states:** Multiple async fetches (models, coloris, products) may cause UI flicker
    - **Mitigation:** Show loading indicators and disable form during fetches
4. **Validation complexity:** Form validation must check all three fields when product is required
    - **Mitigation:** Update validation logic to check type, modelId, and colorisId

## Solution Outline (Aligned with Architecture)

The solution follows Clean Architecture principles with presentation layer only:

1. **State Management:**

    - Add state: `selectedProductType`, `selectedModelId`, `selectedColorisId`
    - Use refs to track previous values for cascading reset logic
    - Clear dependent fields when parent selection changes

2. **Data Fetching:**

    - Use `useProductModelsByType(type)` hook (conditional fetch when type selected)
    - Use `useProductColorisByModel(modelId)` hook (conditional fetch when model selected)
    - Use `useProducts()` hook to find `productId` from `modelId` + `colorisId`

3. **UI Components:**

    - Replace single Product Select with three Select components
    - Implement cascading disable logic (model disabled until type selected, coloris disabled until model selected)
    - Show loading states during data fetches
    - Auto-select coloris if only one available

4. **Form Validation:**

    - Update validation to check all three fields (type, modelId, colorisId) when product is required
    - Show appropriate error messages for each field

5. **Product Identification:**
    - Use `useMemo` to find `productId` from `modelId` + `colorisId` combination
    - Filter products in-memory using `useProducts()` hook

**Data Flow:**

```
User selects Product Type
  ↓
useProductModelsByType(type) → fetches models
  ↓
User selects Model
  ↓
useProductColorisByModel(modelId) → fetches coloris
  ↓
User selects Coloris (or auto-selected if only one)
  ↓
useMemo finds productId from products.filter(p => p.modelId === modelId && p.colorisId === colorisId)
  ↓
Form submission with productId
```

## Sub-Tickets

### Sub-Ticket 27.1

**Title:** Update AddActivityForm with cascading product selects

**Rationale:**
This is the main implementation ticket that updates AddActivityForm component to use cascading dropdowns instead of a single product select. The implementation follows the same pattern as ProductForm, ensuring consistency across the application.

**Acceptance Criteria:**

-   [x] Replace single "Product" select with three Select components: Product Type, Product Model, Coloris
-   [x] Product Type select shows all available product types from `ProductType` enum
    -   Uses `formatProductType` helper function (or similar) for display labels
    -   Options generated from `Object.values(ProductType)`
-   [x] Product Model select uses `useProductModelsByType` hook
    -   Fetches models when type is selected (conditional fetch with `enabled` option)
    -   Disabled when no type is selected
    -   Reset to null when type changes
    -   Shows loading state while fetching (`isLoading` from hook)
    -   Displays error state if fetch fails
-   [x] Coloris select uses `useProductColorisByModel` hook
    -   Fetches coloris when model is selected (conditional fetch with `enabled` option)
    -   Disabled when no type or model is selected
    -   Reset to null when type or model changes
    -   Shows loading state while fetching (`isLoading` from hook)
    -   Displays error state if fetch fails
-   [x] Auto-select coloris if only one is available for the selected model
    -   Uses `useEffect` to detect when `colorisOptions.length === 1`
    -   Only auto-selects if `selectedColorisId` is null (not already selected)
-   [x] Product identification logic finds `productId` from `modelId` + `colorisId`
    -   Uses `useProducts()` hook to get all products
    -   Uses `useMemo` to find product matching `modelId` and `colorisId`
    -   Returns `undefined` if no match found
-   [x] Cascading reset logic implemented correctly
    -   Type change → clears `modelId` and `colorisId` (uses ref to avoid clearing on initial mount)
    -   Model change → clears `colorisId` (uses ref to avoid clearing on initial mount)
    -   Uses `prevTypeRef` and `prevModelIdRef` to track previous values
-   [x] Form validation updated for three-field product selection
    -   Validates `selectedProductType` when product is required
    -   Validates `selectedModelId` when product is required
    -   Validates `selectedColorisId` when product is required
    -   Validates that `productId` is found (not undefined) when product is required
    -   Shows appropriate error messages for each field
-   [x] Form submission uses `productId` (derived from `modelId` + `colorisId`)
    -   Form data includes `productId` field
    -   `productId` is `undefined` if not all three fields are selected
-   [x] All three selects are properly labeled and accessible (WCAG 2.1 AA)
    -   Proper `id` and `label` attributes
    -   `aria-describedby` for error messages
    -   `aria-disabled` for disabled state
    -   `aria-busy` during loading states
    -   Keyboard navigation support
-   [x] Component uses SCSS variables for all styling (no hardcoded values)
-   [x] Component is memoized appropriately (`React.memo`, `useCallback` for handlers, `useMemo` for derived values)
-   [x] Component has proper TypeScript types
    -   State types: `ProductType | null`, `ProductModelId | null`, `ProductColorisId | null`
    -   Proper type casting for Select values

**Definition of Done:**

-   [x] All acceptance criteria met
-   [x] Component follows same patterns as ProductForm (reference implementation)
-   [x] Cascading filters work correctly (Type → Model → Coloris)
-   [x] Auto-selection works when only one coloris is available
-   [x] Form validation prevents submission without required selections
-   [x] Loading states shown during data fetching
-   [x] Error states handled gracefully
-   [x] Accessibility requirements met (WCAG 2.1 AA)
-   [x] SCSS variables used (no hardcoded values)
-   [x] TypeScript strict mode passes
-   [x] Component documented with JSDoc
-   [x] Lint/build passes

**Estimated Effort:** 4h

**Dependencies:**

-   ✅ FBC-26 (Product Reference Tables) - Already implemented (provides hooks and infrastructure)
-   Ticket #14 (Add Activity page) - Must be completed first

**Owner:** Presentation

**Risk Notes:**

-   Cascading reset logic must handle rapid type/model changes correctly
-   Product identification may be slow with large product catalogs (mitigate with useMemo and consider optimization later)
-   Loading states must prevent form submission during data fetch

---

### Sub-Ticket 27.2

**Title:** Update AddActivityForm unit tests

**Rationale:**
Unit tests must be updated to reflect the new cascading dropdown structure. Tests should verify cascading behavior, auto-selection, product identification, and form validation.

**Acceptance Criteria:**

-   [x] Update existing tests in `__tests__/presentation/components/addActivity/AddActivityForm.test.tsx`
-   [x] Test cascading dropdown behavior:
    -   Type selection enables model dropdown
    -   Model selection enables coloris dropdown
    -   Type change clears model and coloris selections
    -   Model change clears coloris selection
-   [x] Test auto-selection of coloris when only one available
-   [x] Test product identification logic:
    -   Finds correct `productId` from `modelId` + `colorisId`
    -   Returns `undefined` when no match found
    -   Returns `undefined` when selections incomplete
-   [x] Test form validation:
    -   Validates all three fields when product is required
    -   Shows error messages for missing fields
    -   Prevents submission without required selections
-   [x] Test loading states:
    -   Shows loading indicators during data fetch
    -   Disables form during data fetch
-   [x] Test error states:
    -   Displays errors from hooks
    -   Handles empty states gracefully
-   [x] Mock hooks: `useProductModelsByType`, `useProductColorisByModel`, `useProducts`
-   [x] All tests pass
-   [x] Test coverage maintained or improved

**Definition of Done:**

-   [x] All acceptance criteria met
-   [x] Tests follow existing patterns (React Testing Library, describe/it blocks)
-   [x] Hooks are properly mocked
-   [x] Edge cases covered (empty data, errors, rapid changes)
-   [x] All tests pass
-   [x] Test coverage ≥ 80% for AddActivityForm component

**Estimated Effort:** 2h

**Dependencies:**

-   Sub-Ticket 27.1 (component implementation)

**Owner:** Testing

**Risk Notes:**

-   Mocking multiple hooks may be complex
-   Cascading behavior tests must cover edge cases (rapid changes, empty data)

---

## Unit Test Spec (Test-First Protocol)

### Test Files Structure

```
__tests__/
└── presentation/
    └── components/
        └── addActivity/
            └── AddActivityForm.test.tsx (UPDATE - add new tests for cascading dropdowns)
```

### Test Coverage Map

**AddActivityForm Tests (`__tests__/presentation/components/addActivity/AddActivityForm.test.tsx`):**

```typescript
describe("AddActivityForm - Cascading Product Selection", () => {
    describe("Product Type selection", () => {
        it("should enable model dropdown when type is selected", () => {});
        it("should fetch models when type is selected", () => {});
        it("should disable model dropdown when no type selected", () => {});
        it("should show loading state while fetching models", () => {});
        it("should display error if models fetch fails", () => {});
    });

    describe("Product Model selection", () => {
        it("should enable coloris dropdown when model is selected", () => {});
        it("should fetch coloris when model is selected", () => {});
        it("should disable coloris dropdown when no model selected", () => {});
        it("should show loading state while fetching coloris", () => {});
        it("should display error if coloris fetch fails", () => {});
    });

    describe("Cascading reset logic", () => {
        it("should clear model and coloris when type changes", () => {});
        it("should clear coloris when model changes", () => {});
        it("should not clear on initial mount", () => {});
        it("should handle rapid type/model changes correctly", () => {});
    });

    describe("Auto-selection of coloris", () => {
        it("should auto-select coloris if only one available", () => {});
        it("should not auto-select if coloris already selected", () => {});
        it("should not auto-select if multiple coloris available", () => {});
    });

    describe("Product identification", () => {
        it("should find productId from modelId + colorisId", () => {});
        it("should return undefined if no product matches", () => {});
        it("should return undefined if selections incomplete", () => {});
        it("should update productId when selections change", () => {});
    });

    describe("Form validation", () => {
        it("should validate all three fields when product is required", () => {});
        it("should show error for missing type", () => {});
        it("should show error for missing model", () => {});
        it("should show error for missing coloris", () => {});
        it("should show error if productId not found", () => {});
        it("should prevent submission without required selections", () => {});
    });

    describe("Form submission", () => {
        it("should submit with productId when all fields selected", () => {});
        it("should submit with undefined productId when product not required", () => {});
        it("should not submit if productId not found when required", () => {});
    });
});
```

### Mocks/Fixtures

**Mocks:**

-   Mock `useProductModelsByType` hook (returns `{ data, isLoading, error }`)
-   Mock `useProductColorisByModel` hook (returns `{ data, isLoading, error }`)
-   Mock `useProducts` hook (returns `{ data: products, isLoading }`)
-   Mock `useAddActivity` hook (returns mutation object)

**Fixtures:**

-   Create test fixtures for `ProductModel[]` and `ProductColoris[]`
-   Create test fixtures for `Product[]` with `modelId` and `colorisId`
-   Use existing product fixtures as base

### Edge Cases

-   Empty models/coloris arrays
-   Rapid type/model changes
-   Network errors during data fetch
-   Products without matching `modelId` + `colorisId`
-   Multiple products with same `modelId` + `colorisId` (should not happen, but test edge case)
-   Initial mount with no selections
-   Form reset after submission

### Coverage Target

-   **AddActivityForm component:** ≥ 80%
-   **Cascading logic:** ≥ 90%
-   **Product identification:** ≥ 90%
-   **Form validation:** ≥ 85%

### Mapping AC → Tests

| AC                     | Test File                  | Test Name                   |
| ---------------------- | -------------------------- | --------------------------- |
| Product Type select    | `AddActivityForm.test.tsx` | `Product Type selection`    |
| Product Model select   | `AddActivityForm.test.tsx` | `Product Model selection`   |
| Coloris select         | `AddActivityForm.test.tsx` | `Product Model selection`   |
| Cascading reset logic  | `AddActivityForm.test.tsx` | `Cascading reset logic`     |
| Auto-select coloris    | `AddActivityForm.test.tsx` | `Auto-selection of coloris` |
| Product identification | `AddActivityForm.test.tsx` | `Product identification`    |
| Form validation        | `AddActivityForm.test.tsx` | `Form validation`           |
| Form submission        | `AddActivityForm.test.tsx` | `Form submission`           |

### Status

**Status:** tests: approved

Tests should be written **before** implementation (TDD approach). Test specs are ready for Unit Test Coach to generate scaffold code.

---

## Agent Prompts

### Unit Test Coach

```
@Unit Test Coach

Generate unit test specs and scaffolds for FBC-27 (Cascading Product Selects in AddActivityForm).

Focus on:
1. Cascading dropdown behavior tests in `__tests__/presentation/components/addActivity/AddActivityForm.test.tsx`:
   - Product Type selection (enables model, fetches data, loading states)
   - Product Model selection (enables coloris, fetches data, loading states)
   - Cascading reset logic (clears dependent fields on parent change)
   - Auto-selection of coloris when only one available

2. Product identification tests:
   - Finding productId from modelId + colorisId
   - Handling undefined when no match or incomplete selections

3. Form validation tests:
   - Validating all three fields when product required
   - Error messages for missing fields
   - Preventing submission without required selections

4. Form submission tests:
   - Submitting with productId when all fields selected
   - Handling undefined productId when product not required

Requirements:
- Follow existing test patterns (React Testing Library, describe/it blocks)
- Mock hooks: useProductModelsByType, useProductColorisByModel, useProducts, useAddActivity
- Test edge cases (empty data, errors, rapid changes, network failures)
- Test accessibility (disabled states, loading states, error states)
- Achieve ≥80% coverage for AddActivityForm component
- Use TypeScript strict mode
- Place tests in `__tests__/` directory (not `src/`)

Reference:
- Existing tests: `__tests__/presentation/components/addActivity/AddActivityForm.test.tsx`
- Component: `src/presentation/components/addActivity/AddActivityForm/AddActivityForm.tsx`
- Reference implementation: `src/presentation/components/catalog/ProductForm/ProductForm.tsx`
- Hooks: `src/presentation/hooks/useProducts.ts`

Generate test scaffolds following TDD approach (before implementation).
```

### Architecture-Aware Dev

```
@Architecture-Aware Dev

Implement FBC-27 (Cascading Product Selects in AddActivityForm) following Clean Architecture principles.

Sub-ticket to implement: 27.1

Critical rules:
1. **Layer separation:** Presentation layer only - no business logic in component
2. **Use existing hooks:** useProductModelsByType, useProductColorisByModel, useProducts (from FBC-26)
3. **No direct Supabase calls:** All data fetching via hooks/usecases
4. **Reference implementation:** Follow same patterns as ProductForm component
5. **State management:** Use React hooks (useState, useMemo, useCallback, useEffect)
6. **Cascading reset:** Use refs to track previous values and avoid clearing on initial mount

Reference:
- Planning doc: `report/planning/plan-fbc-27-cascading-product-selects-addactivity.md`
- Ticket: `jira/27.md`
- Reference implementation: `src/presentation/components/catalog/ProductForm/ProductForm.tsx`
- Component to update: `src/presentation/components/addActivity/AddActivityForm/AddActivityForm.tsx`
- Hooks: `src/presentation/hooks/useProducts.ts`

Implementation checklist:
- Replace single Product Select with three Select components (Type, Model, Coloris)
- Use useProductModelsByType hook (conditional fetch when type selected)
- Use useProductColorisByModel hook (conditional fetch when model selected)
- Use useProducts hook to find productId from modelId + colorisId
- Implement cascading reset logic (type change → clear model/coloris, model change → clear coloris)
- Auto-select coloris if only one available
- Update form validation to check all three fields
- Show loading states during data fetch
- Handle error states gracefully
- Ensure accessibility (WCAG 2.1 AA): proper labels, ARIA attributes, keyboard navigation
- Use SCSS variables from `styles/variables/*` (no hardcoded values)
- Use accessibility utilities from `shared/a11y/`
- Component memoized appropriately (React.memo, useCallback, useMemo)
- TypeScript strict mode
- Proper JSDoc documentation

Start with Sub-Ticket 27.1. Follow ProductForm patterns closely for consistency.
```

### UI Designer

```
@UI Designer

Update AddActivityForm component for FBC-27 (Cascading Product Selects) with three cascading Select dropdowns.

Requirements:
1. **Replace single Product Select with three Selects:**
   - Product Type Select (shows all ProductType enum values)
   - Product Model Select (filtered by type, disabled until type selected)
   - Coloris Select (filtered by model, disabled until model selected)

2. **Cascading filter logic:**
   - Type selection → fetches models → clears model/coloris selections
   - Model selection → fetches coloris → clears coloris selection
   - Disable model dropdown until type selected
   - Disable coloris dropdown until model selected

3. **Loading states:**
   - Show loading indicator when fetching models/coloris
   - Disable form during data fetch
   - Use Select component's loading prop if available

4. **Error handling:**
   - Display errors from hooks
   - Handle empty states gracefully
   - Show error messages for each field

5. **Auto-selection:**
   - Auto-select coloris if only one available
   - Only auto-select if not already selected

6. **Accessibility (WCAG 2.1 AA):**
   - Proper ARIA labels for all Select dropdowns
   - Error messages linked with `aria-describedby`
   - Disabled state communicated to screen readers
   - Loading state communicated (`aria-busy`)
   - Keyboard navigation support

7. **Styling:**
   - Use SCSS variables from `styles/variables/*` (no hardcoded values)
   - Follow existing component patterns
   - Ensure visual consistency with ProductForm

Reference:
- Component: `src/presentation/components/addActivity/AddActivityForm/AddActivityForm.tsx`
- Reference implementation: `src/presentation/components/catalog/ProductForm/ProductForm.tsx`
- Select component: `src/presentation/components/ui/Select.tsx`
- Hooks: `src/presentation/hooks/useProducts.ts` (useProductModelsByType, useProductColorisByModel)
- Styles: `src/presentation/components/addActivity/AddActivityForm/AddActivityForm.module.scss`
- Accessibility: `src/shared/a11y/`

Ensure component follows patterns (arrow function, React.memo, useCallback for handlers, useMemo for derived values).
```

### QA & Test Coach

```
@QA & Test Coach

Create test plan for FBC-27 (Cascading Product Selects in AddActivityForm) after implementation.

Test plan should cover:

1. **Functional Testing:**
   - Cascading filters work (Type → Model → Coloris)
   - Type selection enables model dropdown and fetches models
   - Model selection enables coloris dropdown and fetches coloris
   - Cascading reset works (type change clears model/coloris, model change clears coloris)
   - Auto-selection works when only one coloris available
   - Product identification finds correct productId from modelId + colorisId
   - Form submission with valid productId
   - Form validation prevents submission without required selections

2. **Integration Testing:**
   - Hooks fetch data correctly (useProductModelsByType, useProductColorisByModel, useProducts)
   - Product identification works with real data
   - Form submission creates activity with correct productId

3. **Accessibility Testing (WCAG 2.1 AA):**
   - Screen reader navigation through form
   - Error messages announced correctly
   - Disabled states communicated
   - Loading states communicated
   - Keyboard navigation works
   - Focus management in cascading selects

4. **Edge Cases:**
   - Empty models/coloris arrays
   - Rapid type/model changes
   - Network errors during data fetch
   - Products without matching modelId + colorisId
   - Form reset after submission
   - Initial mount with no selections

5. **Performance:**
   - Form loads quickly
   - Data fetching doesn't block UI
   - Caching works correctly (React Query)
   - No unnecessary re-renders

6. **Cross-browser Testing:**
   - Chrome, Firefox, Safari, Edge
   - Mobile browsers (iOS Safari, Chrome Mobile)

Reference:
- Planning doc: `report/planning/plan-fbc-27-cascading-product-selects-addactivity.md`
- Ticket: `jira/27.md`
- Component: `src/presentation/components/addActivity/AddActivityForm/AddActivityForm.tsx`
- Reference implementation: `src/presentation/components/catalog/ProductForm/ProductForm.tsx`

Create comprehensive test plan with scenarios and expected results.
```

### Architecture Guardian

```
@Architecture Guardian

Verify FBC-27 (Cascading Product Selects in AddActivityForm) implementation complies with Clean Architecture and code conventions.

Check:

1. **Layer Separation:**
   - Presentation layer only (no business logic in component)
   - Uses hooks for data fetching (no direct Supabase calls)
   - No business logic in component (filtering done via hooks/usecases)

2. **Code Conventions:**
   - TypeScript strict mode
   - SCSS variables used (no hardcoded values)
   - Absolute imports with `@/` prefix
   - Arrow functions for components (not `export function`)
   - Proper JSDoc documentation
   - Component memoized appropriately (React.memo, useCallback, useMemo)

3. **Accessibility:**
   - ARIA attributes on all interactive elements
   - Error messages announced
   - Keyboard navigation works
   - Accessibility utilities from `shared/a11y/` used

4. **State Management:**
   - React hooks used correctly (useState, useMemo, useCallback, useEffect)
   - Refs used for tracking previous values (cascading reset logic)
   - No unnecessary re-renders

5. **Data Fetching:**
   - Uses existing hooks from FBC-26 (useProductModelsByType, useProductColorisByModel)
   - Conditional fetching with `enabled` option
   - Loading states handled correctly
   - Error states handled gracefully

6. **File Organization:**
   - Component in correct directory (`presentation/components/addActivity/`)
   - SCSS module in component folder
   - Tests in `__tests__/` directory

Reference:
- Architecture rules: `.cursor/rules/architecture/`
- Code conventions: `.cursor/rules/code-conventions.mdc`
- Planning doc: `report/planning/plan-fbc-27-cascading-product-selects-addactivity.md`
- Implementation: Review all code changes for FBC-27

Generate architecture compliance report with violations (if any) and recommendations.
```

---

## Open Questions

1. **Product identification performance:** Should we create a new hook `useProductByModelAndColoris(modelId, colorisId)` for better performance, or is filtering in-memory acceptable?

    - **Recommendation:** Start with in-memory filtering using `useProducts()`. If performance becomes an issue with large catalogs (>1000 products), create optimized hook later.

2. **Format helper function:** Should we reuse `formatProductType` from ProductForm or create a shared utility?

    - **Recommendation:** Extract `formatProductType` to `shared/utils/` if not already shared, or import from ProductForm if it's exported.

3. **Error handling:** How should we handle the case where `productId` is not found (no product matches `modelId` + `colorisId`)?

    - **Recommendation:** Show validation error and prevent form submission. This should not happen in normal flow, but handle edge case gracefully.

4. **Loading states:** Should we disable the entire form during data fetch, or only the dependent selects?
    - **Recommendation:** Disable dependent selects only (model disabled during models fetch, coloris disabled during coloris fetch). Keep other form fields enabled.

---

## MVP Cut List

If time/budget is constrained, prioritize in this order:

### Must Have (Core Functionality)

-   ✅ Sub-Ticket 27.1: Update AddActivityForm with cascading selects (required for feature)
-   ✅ Sub-Ticket 27.2: Update unit tests (required for quality)

### Should Have (Important but Can Defer)

-   ⚠️ Performance optimization (useProductByModelAndColoris hook) - can defer if catalog remains small
-   ⚠️ Advanced error handling - basic error handling is sufficient for MVP

### Nice to Have (Can Defer)

-   📋 E2E tests (can add incrementally)
-   📋 Performance monitoring (can add after MVP)

**Recommendation:** Implement both sub-tickets (27.1 and 27.2) for production-ready feature. This is a relatively simple UI update that leverages existing infrastructure.

---

## Implementation Order

Recommended sequence:

1. **27.2** → Unit tests (TDD approach - write tests first)
2. **27.1** → Component implementation (implement to pass tests)

**Parallel work:** Tests can be written in parallel with implementation if not following strict TDD.

---

## Notes

-   This is a UI-only ticket - all backend infrastructure exists from FBC-26
-   Reference implementation (ProductForm) provides clear patterns to follow
-   Cascading reset logic must be carefully implemented to avoid clearing on initial mount
-   Product identification may need optimization for large catalogs (defer to future ticket if needed)
-   Ensure consistency with ProductForm for better UX
