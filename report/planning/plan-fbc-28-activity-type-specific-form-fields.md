---
Generated: 2025-01-27 21:00:00
Report Type: planning
Command: pm-plan-from-ticket
Ticket: FBC-28
---

# Implementation Plan - FBC-28: Fix add activities form to adapt to activity type

## Summary

### Goal

Adapt the "Add activity" form to display and validate fields dynamically according to the selected activity type, improving UX and reducing input errors.

### User Value

-   **Clarity**: Users see only relevant fields for each activity type
-   **Simplicity**: No need to manually enter negative quantities for sales
-   **Error reduction**: Validation adapted according to the business context of each type

### Constraints

-   ✅ Database already compatible (Sub-Ticket 28.1 completed)
-   ✅ Domain and usecases types already compatible (no modification needed)
-   ✅ Clean Architecture must be strictly respected
-   ✅ WCAG 2.1 AA accessibility mandatory
-   ✅ Unit tests mandatory (Test-First Protocol)

### Non-Goals

-   Database structure modification (already compatible)
-   Domain or usecases types modification (already compatible)
-   Major component refactoring (targeted modifications only)

## Assumptions & Risks

### Assumptions

1. **STOCK_CORRECTION Option**: Option A (two separate fields) will be implemented (recommended for better UX)
2. **Amount**: Sent as `0` for CREATION and STOCK_CORRECTION (compatible with DB `NOT NULL`)
3. **SALE Conversion**: Happens only in presentation layer (not in domain/usecases)
4. **Labels**: Remain in French (no translation needed for MVP)

### Risks

-   **Low risk**: Targeted changes in an existing component
-   **Medium risk**: Existing tests need to be updated (may require refactoring)
-   **Mitigation**: Test-First Protocol to ensure coverage before implementation

## Solution Outline (aligned with architecture)

### Architecture Layers Impact

**Domain Layer (`core/domain/activity.ts`):**

-   ✅ No modification needed
-   `Activity` and `ActivityType` types already compatible

**Usecases Layer (`core/usecases/activity.ts`):**

-   ✅ No modification needed
-   Quantity conversion happens only in presentation

**Infrastructure Layer (`infrastructure/supabase/`):**

-   ✅ No modification needed
-   Database already compatible (Sub-Ticket 28.1)

**Presentation Layer (`presentation/components/addActivity/AddActivityForm/`):**

-   🔧 **Main modifications:**
    1. Conditional rendering of "Amount" field according to type
    2. Type-specific validation for each activity type
    3. Positive → negative quantity conversion for SALE
    4. Two separate fields for STOCK_CORRECTION (Option A)
    5. Dynamic labels and helper texts

### Data Flow

```
User Input (Form)
    ↓
Presentation Layer (AddActivityForm)
    - Validation according to type
    - Quantity conversion for SALE
    - Quantity calculation for STOCK_CORRECTION
    ↓
React Query Hook (useAddActivity)
    ↓
Usecase (createActivity)
    ↓
Repository (activityRepositorySupabase)
    ↓
Supabase (activities table)
```

## Sub-Tickets

### Sub-Ticket 28.1 ✅

**Title:** Verify and adapt Supabase database for form changes

**Status:** ✅ **COMPLETED**

**Rationale:**
Preliminary verification of database compatibility before implementation.

**Acceptance Criteria:**

-   [x] ✅ Database compatible (no modification needed)
-   [x] ✅ TypeScript types compatible
-   [x] ✅ Repository compatible

**Estimated Effort:** 0.5h (already completed)

---

### Sub-Ticket 28.2

**Title:** Create unit tests (Test-First Protocol) for form changes

**Rationale:**
Implement tests before code to ensure coverage and guide implementation. Existing tests must be updated to reflect new behaviors.

**Acceptance Criteria:**

-   [x] ✅ Tests for conditional rendering of "Amount" field:
    -   [x] ✅ Test: "Amount" field hidden for CREATION
    -   [x] ✅ Test: "Amount" field hidden for STOCK_CORRECTION
    -   [x] ✅ Test: "Amount" field displayed for SALE
    -   [x] ✅ Test: "Amount" field displayed for OTHER
-   [x] ✅ Tests for type-specific validation:
    -   [x] ✅ Test: CREATION - quantity > 0 required, amount not validated
    -   [x] ✅ Test: SALE - quantity > 0 required, amount > 0 required
    -   [x] ✅ Test: STOCK_CORRECTION - non-zero quantity required (positive or negative), amount not validated
    -   [x] ✅ Test: OTHER - quantity and amount required (current behavior)
-   [x] ✅ Tests for SALE quantity conversion:
    -   [x] ✅ Test: User enters "2" → system sends "-2"
    -   [x] ✅ Test: User enters "5.5" → system sends "-5.5"
    -   [x] ✅ Test: Validation accepts only positive values for SALE
-   [x] ✅ Tests for STOCK_CORRECTION (Option A - two fields):
    -   [x] ✅ Test: Display of two fields "Add to stock" and "Reduce from stock"
    -   [x] ✅ Test: Only one field can be filled at a time
    -   [x] ✅ Test: Quantity calculation = addition - reduction
    -   [x] ✅ Test: Validation requires at least one field to be filled
    -   [x] ✅ Test: Validation requires that both fields are not filled simultaneously
-   [x] ✅ Tests for dynamic labels:
    -   [x] ✅ Test: "Quantity" label for CREATION
    -   [x] ✅ Test: "Quantity sold" label for SALE
    -   [x] ✅ Test: "Add to stock" and "Reduce from stock" labels for STOCK_CORRECTION
-   [x] ✅ Tests for helper texts:
    -   [x] ✅ Test: Helper text "Quantity added to stock" for CREATION
    -   [x] ✅ Test: Helper text "Enter the number of units sold (will be deducted from stock)" for SALE
-   [x] ✅ Tests for dynamic type change:
    -   [x] ✅ Test: CREATION → SALE change displays amount field
    -   [x] ✅ Test: SALE → CREATION change hides amount field and resets value
    -   [x] ✅ Test: Change to STOCK_CORRECTION hides amount field and displays two quantity fields
-   [x] ✅ Tests for submission with amount = 0:
    -   [x] ✅ Test: CREATION sends amount: 0
    -   [x] ✅ Test: STOCK_CORRECTION sends amount: 0
    -   [x] ✅ Test: SALE sends amount with entered value
-   [x] ✅ Accessibility tests:
    -   [x] ✅ Test: Hidden amount field is not accessible via keyboard (tabindex or aria-hidden)
    -   [x] ✅ Test: Labels and helper texts correctly associated with fields
    -   [x] ✅ Test: Error messages announced via aria-live

**Definition of Done:**

-   [x] ✅ All tests written in `__tests__/presentation/components/addActivity/AddActivityForm/AddActivityForm.test.tsx`
-   [x] ✅ Tests follow existing structure (describe/it)
-   [x] ✅ Tests use existing mocks (useAddActivity, useProducts, etc.)
-   [x] ✅ Tests cover all use cases and edge cases
-   [x] ✅ Tests documented with clear names
-   [x] ✅ Tests compile without error (even if they fail initially)
-   [x] ✅ Status: `tests: approved` before implementation

**Estimated Effort:** 4h

**Dependencies:** Sub-Ticket 28.1 ✅

**Owner:** Unit Test Coach

**Risk Notes:** Medium risk - existing tests need to be updated, which may require refactoring. New tests must be compatible with existing structure.

---

### Sub-Ticket 28.3

**Title:** Implement conditional fields and validation for CREATION and SALE

**Rationale:**
Implement changes for CREATION and SALE types: hide/show amount field, specific validation, and quantity conversion for SALE.

**Acceptance Criteria:**

-   [x] Conditional rendering of "Amount" field:
    -   [x] Field hidden for CREATION (not in DOM or aria-hidden)
    -   [x] Field displayed for SALE
    -   [ ] Field hidden for STOCK_CORRECTION (will be done in 28.4)
    -   [x] Field displayed for OTHER
-   [x] CREATION validation:
    -   [x] Quantity required and > 0
    -   [x] Amount not validated (no check)
    -   [x] Clear error messages
-   [x] SALE validation:
    -   [x] Quantity required and > 0 (user enters positive)
    -   [x] Amount required and > 0
    -   [x] Clear error messages
-   [x] SALE quantity conversion:
    -   [x] User enters positive value (e.g., "2")
    -   [x] System converts to negative on submission (e.g., "-2")
    -   [x] Conversion works with decimals (e.g., "5.5" → "-5.5")
-   [x] Dynamic labels:
    -   [x] "Quantity" for CREATION
    -   [x] "Quantity sold" for SALE
-   [x] Helper texts:
    -   [x] "Quantity added to stock" for CREATION
    -   [x] "Enter the number of units sold (will be deducted from stock)" for SALE
-   [x] Dynamic type change:
    -   [x] CREATION → SALE change displays amount field
    -   [x] SALE → CREATION change hides amount field and resets value
    -   [x] Values are reset if necessary when type changes
-   [x] Submission:
    -   [x] CREATION sends `amount: 0`
    -   [x] SALE sends `amount` with entered value and negative `quantity`

**Definition of Done:**

-   [x] All acceptance criteria are met
-   [x] Code respects Clean Architecture (no business logic in component)
-   [x] Sub-Ticket 28.2 tests pass for CREATION and SALE
-   [x] Accessibility maintained (WCAG 2.1 AA)
-   [x] Component uses SCSS variables (no hardcoded values)
-   [x] JSDoc documentation updated
-   [x] Code reviewed and approved

**Estimated Effort:** 3h

**Dependencies:** Sub-Ticket 28.2 (tests approved)

**Owner:** Architecture-Aware Dev

**Risk Notes:** Low risk - targeted modifications in an existing component. Quantity conversion happens only in presentation.

---

### Sub-Ticket 28.4

**Title:** Implement two separate fields for STOCK_CORRECTION (Option A)

**Rationale:**
Implement recommended Option A for STOCK_CORRECTION: two separate fields "Add to stock" and "Reduce from stock" for better UX. User always enters positive numbers, system calculates the difference.

**Acceptance Criteria:**

-   [x] Display of two separate fields for STOCK_CORRECTION:
    -   [x] "Add to stock" field (type number, always positive)
    -   [x] "Reduce from stock" field (type number, always positive)
    -   [x] Both fields displayed only for STOCK_CORRECTION
-   [x] Exclusive input logic:
    -   [x] Only one of the two fields can be filled at a time
    -   [x] If user fills "Add", "Reduce" is cleared (and vice versa)
    -   [x] Validation requires at least one field to be filled
-   [x] Final quantity calculation:
    -   [x] Quantity = addition - reduction
    -   [x] If addition = 5, reduction = 0 → quantity = 5
    -   [x] If addition = 0, reduction = 3 → quantity = -3
    -   [x] If addition = 5, reduction = 3 → quantity = 2
-   [x] STOCK_CORRECTION validation:
    -   [x] At least one of the two fields must be filled
    -   [x] Values must be valid positive numbers (> 0)
    -   [x] Amount not validated (no check)
    -   [x] Clear error messages
-   [x] Dynamic type change:
    -   [x] Change to STOCK_CORRECTION hides amount field and displays two quantity fields
    -   [x] Change from STOCK_CORRECTION to another type hides both fields and resets values
-   [x] Submission:
    -   [x] STOCK_CORRECTION sends `amount: 0`
    -   [x] STOCK_CORRECTION sends calculated `quantity` (addition - reduction)

**Definition of Done:**

-   [x] All acceptance criteria are met
-   [x] Code respects Clean Architecture
-   [x] Sub-Ticket 28.2 tests pass for STOCK_CORRECTION
-   [x] Accessibility maintained (WCAG 2.1 AA)
-   [x] Component uses SCSS variables (no hardcoded values)
-   [x] JSDoc documentation updated
-   [x] Code reviewed and approved

**Estimated Effort:** 3h

**Dependencies:** Sub-Ticket 28.3 (for code consistency)

**Owner:** Architecture-Aware Dev

**Risk Notes:** Medium risk - implementation of two fields with exclusive input logic. Must be carefully tested to avoid UX bugs.

---

### Sub-Ticket 28.5

**Title:** Verify and maintain OTHER behavior unchanged

**Rationale:**
Ensure that OTHER type maintains its current behavior (amount and quantity displayed, both required, no conversion).

**Acceptance Criteria:**

-   [x] ✅ "Amount" field displayed and required for OTHER
-   [x] ✅ "Quantity" field displayed and required for OTHER
-   [x] ✅ OTHER validation unchanged:
    -   [x] ✅ Quantity required (can be positive or negative)
    -   [x] ✅ Amount required and > 0
-   [x] ✅ No automatic conversion for OTHER
-   [x] ✅ Labels unchanged for OTHER
-   [x] ✅ Existing tests for OTHER still pass

**Definition of Done:**

-   [x] ✅ OTHER behavior verified and unchanged
-   [x] ✅ Existing tests still pass
-   [x] ✅ No regression introduced

**Estimated Effort:** 0.5h

**Dependencies:** Sub-Ticket 28.3

**Owner:** Architecture-Aware Dev

**Risk Notes:** Low risk - simple verification that behavior remains unchanged.

---

### Sub-Ticket 28.6

**Title:** Final tests, validation and documentation

**Rationale:**
Perform complete final verification, ensure all tests pass, validate accessibility, and finalize documentation.

**Acceptance Criteria:**

-   [x] ✅ All unit tests pass (Sub-Ticket 28.2) - 90/90 tests pass for AddActivityForm, 740/740 for entire project
-   [x] ✅ Integration tests verified (if applicable) - N/A (no specific integration tests)
-   [x] ✅ Accessibility verified (WCAG 2.1 AA):
    -   [x] ✅ Keyboard navigation functional
    -   [x] ✅ Screen reader compatible
    -   [x] ✅ Labels and ARIA attributes correct
-   [x] ✅ JSDoc documentation complete and up to date
-   [x] ✅ Code reviewed and approved
-   [x] ✅ No regression introduced - All 740 tests pass
-   [x] ✅ SCSS variables used (no hardcoded values)

**Definition of Done:**

-   [x] ✅ All acceptance criteria are met
-   [x] ✅ All tests pass (740/740)
-   [x] ✅ Accessibility validated (tests pass, ARIA attributes present)
-   [x] ✅ Documentation complete (JSDoc updated)
-   [x] ✅ Code reviewed and approved
-   [x] ✅ Ready for merge

**Estimated Effort:** 2h

**Dependencies:** Sub-Tickets 28.3, 28.4, 28.5

**Owner:** QA & Test Coach + Architecture Guardian

**Risk Notes:** Low risk - final verification and validation.

## Unit Test Spec (Test-First Protocol)

### Files & Paths

**Test File:** `__tests__/presentation/components/addActivity/AddActivityForm/AddActivityForm.test.tsx`

**Component File:** `src/presentation/components/addActivity/AddActivityForm/AddActivityForm.tsx`

### Test Structure (describe/it)

```typescript
describe("AddActivityForm Component - Activity Type Specific Fields", () => {
    describe("Conditional Amount Field Rendering", () => {
        it("should hide amount field for CREATION type", () => {});
        it("should show amount field for SALE type", () => {});
        it("should hide amount field for STOCK_CORRECTION type", () => {});
        it("should show amount field for OTHER type", () => {});
        it("should toggle amount field visibility when activity type changes", () => {});
    });

    describe("CREATION Type Validation", () => {
        it("should require quantity > 0 for CREATION", () => {});
        it("should not validate amount for CREATION", () => {});
        it("should display error when quantity is missing for CREATION", () => {});
        it("should display error when quantity is <= 0 for CREATION", () => {});
        it("should submit CREATION with amount: 0", () => {});
    });

    describe("SALE Type Validation and Conversion", () => {
        it("should require quantity > 0 for SALE", () => {});
        it("should require amount > 0 for SALE", () => {});
        it("should convert positive quantity to negative for SALE (2 → -2)", () => {});
        it("should convert positive decimal quantity to negative for SALE (5.5 → -5.5)", () => {});
        it("should display error when quantity is <= 0 for SALE", () => {});
        it("should submit SALE with negative quantity and positive amount", () => {});
    });

    describe("STOCK_CORRECTION Type - Two Separate Fields (Option A)", () => {
        it("should display two fields: 'Add to stock' and 'Reduce from stock'", () => {});
        it("should allow only one field to be filled at a time", () => {});
        it("should clear 'Reduce' when 'Add' is filled", () => {});
        it("should clear 'Add' when 'Reduce' is filled", () => {});
        it("should calculate quantity as addition - reduction (5 - 0 = 5)", () => {});
        it("should calculate quantity as addition - reduction (0 - 3 = -3)", () => {});
        it("should calculate quantity as addition - reduction (5 - 3 = 2)", () => {});
        it("should require at least one field to be filled", () => {});
        it("should validate that values are positive numbers", () => {});
        it("should submit STOCK_CORRECTION with amount: 0 and calculated quantity", () => {});
    });

    describe("Dynamic Labels and Helper Texts", () => {
        it("should display 'Quantity' label for CREATION", () => {});
        it("should display 'Quantity sold' label for SALE", () => {});
        it("should display helper text 'Quantity added to stock' for CREATION", () => {});
        it("should display helper text 'Enter the number of units sold (will be deducted from stock)' for SALE", () => {});
    });

    describe("Activity Type Change Behavior", () => {
        it("should show amount field when changing from CREATION to SALE", () => {});
        it("should hide amount field when changing from SALE to CREATION", () => {});
        it("should reset amount value when changing from SALE to CREATION", () => {});
        it("should show two quantity fields when changing to STOCK_CORRECTION", () => {});
        it("should hide two quantity fields when changing from STOCK_CORRECTION", () => {});
    });

    describe("OTHER Type - Unchanged Behavior", () => {
        it("should show amount field for OTHER type", () => {});
        it("should show quantity field for OTHER type", () => {});
        it("should require both amount and quantity for OTHER", () => {});
        it("should not convert quantity for OTHER", () => {});
    });

    describe("Accessibility", () => {
        it("should hide amount field from keyboard navigation when hidden", () => {});
        it("should have proper labels for all fields", () => {});
        it("should announce errors via aria-live region", () => {});
        it("should have proper aria-describedby for helper texts", () => {});
    });
});
```

### Mocks/Fixtures

**Mocks (existing, reused):**

-   `useAddActivity` - Mock mutation hook
-   `useProducts` - Mock products list
-   `useProductModelsByType` - Mock models by type
-   `useProductColorisByModel` - Mock coloris by model

**Fixtures (existing, reused):**

-   Product fixtures with `modelId` and `colorisId`
-   Activity fixtures for different types

### Edge Cases

-   Rapid activity type change (race conditions)
-   Decimal values for SALE quantity (correct conversion)
-   Boundary values (0, very large numbers)
-   STOCK_CORRECTION fields: both filled simultaneously (must be prevented)
-   STOCK_CORRECTION fields: none filled (must display error)
-   Amount = 0 for CREATION and STOCK_CORRECTION (must be accepted)

### Coverage Target

-   **AddActivityForm component:** ≥ 85%
-   **Validation logic:** ≥ 90%
-   **Type-specific rendering:** ≥ 90%
-   **Quantity conversion:** ≥ 95%

### Mapping AC → Tests

| AC                                        | Test File                  | Test Name                                                           |
| ----------------------------------------- | -------------------------- | ------------------------------------------------------------------- |
| Amount field hidden CREATION              | `AddActivityForm.test.tsx` | `should hide amount field for CREATION type`                        |
| Amount field displayed SALE               | `AddActivityForm.test.tsx` | `should show amount field for SALE type`                            |
| Quantity validation CREATION > 0          | `AddActivityForm.test.tsx` | `should require quantity > 0 for CREATION`                          |
| Quantity conversion SALE 2 → -2           | `AddActivityForm.test.tsx` | `should convert positive quantity to negative for SALE`             |
| Two fields STOCK_CORRECTION               | `AddActivityForm.test.tsx` | `should display two fields: 'Add to stock' and 'Reduce from stock'` |
| Quantity calculation addition - reduction | `AddActivityForm.test.tsx` | `should calculate quantity as addition - reduction`                 |
| Dynamic labels                            | `AddActivityForm.test.tsx` | `should display 'Quantity sold' label for SALE`                     |
| Dynamic type change                       | `AddActivityForm.test.tsx` | `should show amount field when changing from CREATION to SALE`      |

### Status

**Status:** `tests: approved` ✅ → Tests created and ready for implementation

## Agent Prompts

### Unit Test Coach

```
@Unit Test Coach

I need to create unit tests (Test-First Protocol) for ticket FBC-28: "Fix add activities form to adapt to activity type".

**Context:**
The AddActivityForm must adapt dynamically according to activity type:
- CREATION: Hide amount, quantity > 0
- SALE: Display amount, quantity > 0 (converted to negative on submission)
- STOCK_CORRECTION: Hide amount, two separate fields "Add to stock" and "Reduce from stock"
- OTHER: Unchanged behavior

**Existing test file:**
`__tests__/presentation/components/addActivity/AddActivityForm/AddActivityForm.test.tsx`

**Tasks:**
1. Analyze existing test structure
2. Create new tests according to spec in `plan-fbc-28-activity-type-specific-form-fields.md`
3. Update existing tests if necessary
4. Ensure all use cases and edge cases are covered
5. Use existing mocks (useAddActivity, useProducts, etc.)
6. Follow existing describe/it structure
7. Document tests with clear names

**Criteria:**
- Tests compile without error (even if they fail initially)
- Coverage ≥ 85% for component
- Tests follow project conventions
- Tests are documented

Please create tests according to spec and mark status `tests: approved` once completed.
```

### Architecture-Aware Dev

```
@Architecture-Aware Dev

I need to implement changes for ticket FBC-28: "Fix add activities form to adapt to activity type".

**Context:**
Adapt AddActivityForm to display and validate fields according to activity type.

**File to modify:**
`src/presentation/components/addActivity/AddActivityForm/AddActivityForm.tsx`

**Tasks (Sub-Tickets 28.3, 28.4, 28.5):**

**Sub-Ticket 28.3 - CREATION and SALE:**
1. Implement conditional rendering of "Amount" field (hidden for CREATION, displayed for SALE)
2. Implement specific validation for CREATION (quantity > 0, no amount validation)
3. Implement specific validation for SALE (quantity > 0, amount > 0)
4. Implement positive → negative quantity conversion for SALE on submission
5. Implement dynamic labels and helper texts
6. Implement dynamic type change (hide/show fields, reset values)

**Sub-Ticket 28.4 - STOCK_CORRECTION (Option A):**
1. Implement two separate fields "Add to stock" and "Reduce from stock"
2. Implement exclusive input logic (only one field filled at a time)
3. Implement quantity calculation = addition - reduction
4. Implement validation (at least one field filled, positive values)

**Sub-Ticket 28.5 - OTHER:**
1. Verify that OTHER behavior remains unchanged

**Clean Architecture Rules:**
- ✅ No domain/usecases modification (already compatible)
- ✅ Quantity conversion happens only in presentation
- ✅ Validation in component (UI logic)
- ✅ Use SCSS variables (no hardcoded values)
- ✅ WCAG 2.1 AA accessibility mandatory

**Tests:**
Tests are already created (Sub-Ticket 28.2). Implement to make tests pass.

Please implement according to plan in `plan-fbc-28-activity-type-specific-form-fields.md`.
```

### UI Designer

```
@UI Designer

I need to improve AddActivityForm UX for ticket FBC-28.

**Context:**
Adapt user interface to display fields according to selected activity type.

**Tasks:**
1. Ensure "Amount" field is correctly hidden (not visible, not accessible via keyboard)
2. Ensure STOCK_CORRECTION two fields are well presented (Option A)
3. Verify labels and helper texts are clear and explicit
4. Verify accessibility (WCAG 2.1 AA)
5. Use SCSS variables for all styles

**Files:**
- `src/presentation/components/addActivity/AddActivityForm/AddActivityForm.tsx`
- `src/presentation/components/addActivity/AddActivityForm/AddActivityForm.module.scss`

**Criteria:**
- WCAG 2.1 AA accessibility
- Clear and explicit labels
- Informative helper texts
- Smooth transitions when type changes
- SCSS variables used (no hardcoded values)

Please verify and improve UX as needed.
```

### QA & Test Coach

```
@QA & Test Coach

I need to perform final validation for ticket FBC-28 (Sub-Ticket 28.6).

**Context:**
Complete final validation after implementation of AddActivityForm changes.

**Tasks:**
1. Verify all unit tests pass
2. Perform manual tests for each activity type:
   - CREATION: Hide amount, quantity > 0
   - SALE: Display amount, quantity > 0 (converted to negative)
   - STOCK_CORRECTION: Hide amount, two separate fields
   - OTHER: Unchanged behavior
3. Verify accessibility (WCAG 2.1 AA):
   - Keyboard navigation
   - Screen reader compatibility
   - Labels and ARIA attributes
4. Verify no regression introduced
5. Verify JSDoc documentation

**Criteria:**
- All tests pass
- Accessibility validated
- No regression
- Complete documentation

Please perform final validation and confirm everything is ready for merge.
```

### Architecture Guardian

```
@Architecture Guardian

I need to verify architectural compliance for ticket FBC-28.

**Context:**
Verify that changes respect Clean Architecture and project conventions.

**Points to verify:**
1. ✅ Domain layer: No modification (already compatible)
2. ✅ Usecases layer: No modification (already compatible)
3. ✅ Infrastructure layer: No modification (already compatible)
4. 🔧 Presentation layer: Modifications in AddActivityForm
   - Quantity conversion happens only in presentation (correct)
   - Validation in component (UI logic, correct)
   - No direct Supabase call (uses hooks → usecases → repositories)
5. ✅ Accessibility: Use of `shared/a11y/`
6. ✅ Styles: Use of SCSS variables

**Files to verify:**
- `src/presentation/components/addActivity/AddActivityForm/AddActivityForm.tsx`
- `src/presentation/components/addActivity/AddActivityForm/AddActivityForm.module.scss`

**Criteria:**
- Clean Architecture respected
- No import rule violations
- Accessibility compliant
- Styles with SCSS variables

Please verify architectural compliance and confirm everything is compliant.
```

## Open Questions

1. **STOCK_CORRECTION Option**: Option A (two separate fields) is recommended. Confirm this choice before implementation?
2. **Amount CREATION/STOCK_CORRECTION**: Sending `amount: 0` is compatible with DB. Is there a future business need to record a cost for these types?
3. **Labels/Helper texts**: Stay in French for MVP or plan English translation?
4. **Value reset**: When type changes, should all values be reset or only those that are no longer relevant?

## MVP Cut List

If necessary to reduce scope for MVP:

**Minimal MVP:**

-   ✅ CREATION: Hide amount, quantity > 0
-   ✅ SALE: Display amount, quantity > 0 (converted to negative)
-   ⏸️ STOCK_CORRECTION: Option C (single field with improved label) instead of Option A
-   ✅ OTHER: Unchanged behavior

**Post-MVP:**

-   Option A for STOCK_CORRECTION (two separate fields)
-   Additional UX improvements
-   English translation of labels

## Estimated Total Effort

-   Sub-Ticket 28.1: ✅ 0.5h (completed)
-   Sub-Ticket 28.2: 4h (tests)
-   Sub-Ticket 28.3: 3h (CREATION + SALE)
-   Sub-Ticket 28.4: 3h (STOCK_CORRECTION)
-   Sub-Ticket 28.5: 0.5h (OTHER)
-   Sub-Ticket 28.6: 2h (final validation)

**Total:** ~13h (1.5 days)

## Timeline

1. **Day 1 Morning**: Sub-Ticket 28.2 (tests)
2. **Day 1 Afternoon**: Sub-Ticket 28.3 (CREATION + SALE)
3. **Day 2 Morning**: Sub-Ticket 28.4 (STOCK_CORRECTION)
4. **Day 2 Afternoon**: Sub-Ticket 28.5 (OTHER) + Sub-Ticket 28.6 (validation)

**Total:** 2 days
