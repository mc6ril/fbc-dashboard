---
Generated: 2025-01-27 20:00:00
Report Type: planning
Command: pm-plan-from-ticket
Ticket: FBC-14
---

## Summary

**Goal:** Create an "Add Activity" page at `/dashboard/activities/new` with a dynamic form that adapts to activity type. The form allows users to record new activities (CREATION, SALE, STOCK_CORRECTION, OTHER) with type-specific fields, ensuring stock and analytics remain up to date.

**User value:** Users can quickly record business activities (product creation, sales, stock corrections) through an intuitive, accessible form that guides them through the required fields based on activity type. This enables accurate inventory tracking and business analytics.

**Constraints:**

- Strict Clean Architecture: UI → Hooks → Usecases → Repositories
- No direct Supabase calls from UI
- Form validation must be accessible (WCAG 2.1 AA)
- All styles use SCSS variables from `styles/variables/*`
- No business logic in components; usecases handle orchestration
- React Query mutations for data creation
- TypeScript strict mode
- Centralized accessibility IDs via `shared/a11y/`

**Non-goals:**

- Activity editing (separate feature)
- Bulk activity creation
- Activity deletion
- Real-time stock updates (stock is computed from activities)
- Advanced date/time picker (use native HTML5 inputs)
- Product creation from activity form (separate feature)
- Activity templates or presets

## Assumptions & Risks

**Assumptions:**

- `addActivity` usecase already exists and validates business rules (verified: exists in `src/core/usecases/activity.ts`)
- Activity repository `create()` method exists (verified: exists in `src/core/ports/activityRepository.ts`)
- Products list is available for product selection dropdown (verified: `useProducts` hook exists)
- Date field should default to current date/time (ISO 8601 format)
- Form should redirect to activities list on success
- Error handling should display validation errors accessibly
- Success feedback should be announced via aria-live region

**Risks:**

- Missing Textarea component for note field (needs to be created as reusable UI component)
- Form state management complexity (mitigation: React state with proper validation)
- Date/time input handling (mitigation: use native HTML5 datetime-local input or separate date/time inputs)
- Product select dropdown may need search/filter for large product lists (mitigation: start with simple select, can enhance later)
- Form validation error mapping from usecase errors (mitigation: map ActivityError to field-level errors)
- Query invalidation after mutation (mitigation: invalidate activities list queries)
- Accessibility of dynamic form fields (mitigation: proper ARIA attributes, live regions for errors)

## Solution Outline (aligned with architecture)

**Domain Layer (`core/domain/`):**

- No new domain types needed (Activity, ActivityType, ActivityId, ProductId already exist)
- Activity validation rules already enforced in `addActivity` usecase

**Usecases Layer (`core/usecases/`):**

- `addActivity` usecase already exists and handles validation
- No new usecases needed

**Ports Layer (`core/ports/`):**

- ActivityRepository port already has `create()` method
- ProductRepository port already has `list()` method for product dropdown
- No new ports needed

**Infrastructure Layer (`infrastructure/supabase/`):**

- ActivityRepository Supabase implementation already exists
- ProductRepository Supabase implementation already exists
- No new infrastructure needed

**Presentation Layer:**

- **Hooks (`presentation/hooks/`):**
  - `useAddActivity`: React Query mutation hook that calls `addActivity` usecase, invalidates activities queries on success
  - `useProducts`: Already exists for product dropdown
- **Stores (`presentation/stores/`):**
  - No new stores needed (form state managed locally in component)
- **UI Components (`presentation/components/ui/`):**
  - `Textarea.tsx`: Reusable textarea component for note field (new, follows Input component pattern)
- **Page Components (`presentation/components/addActivity/`):**
  - `AddActivityForm.tsx`: Main form component with dynamic fields based on activity type
  - `AddActivityForm.module.scss`: Form-specific styles
- **Page (`app/dashboard/activities/new/page.tsx`):**
  - Main page component with form, success/error feedback, and navigation

**Shared Layer (`shared/`):**

- Accessibility utilities already exist (`getFormFieldIds` in `shared/a11y/utils.ts`)
- Date utilities already exist (`formatDate` in `shared/utils/date.ts`)
- May need to add accessibility ID constants for form success/error messages

## Sub-Tickets

### Sub-Ticket 14.1

**Title:** Create reusable Textarea component

**Rationale:**
The note field in the activity form requires a textarea input. We need a reusable, accessible Textarea component following the same patterns as the Input component to maintain consistency and accessibility compliance.

**Acceptance Criteria:**

- [] `Textarea.tsx` component exists in `presentation/components/ui/`
- [] Component follows same pattern as `Input.tsx` (label, helper text, error handling)
- [] Component uses `getFormFieldIds` from `shared/a11y/utils.ts` for accessibility IDs
- [] Component supports all standard textarea props (value, onChange, onBlur, placeholder, disabled, required)
- [] Component displays error messages with `role="alert"` and proper ARIA attributes
- [] Component uses SCSS variables from `styles/variables/*` for all styling
- [] Component is memoized with `React.memo`
- [] Component has TypeScript types for all props
- [] Component follows arrow function with export default pattern

**Definition of Done:**

- [] Component created and follows Input component pattern
- [] Component styled using SCSS variables (no hardcoded values)
- [] Component accessible (WCAG 2.1 AA): proper labels, ARIA attributes, error announcements
- [] Component tested (unit tests in `__tests__/presentation/components/ui/Textarea.test.tsx`)
- [] Lint/build passes
- [] Component documented with JSDoc

**Estimated Effort:** 2h

**Dependencies:** None

**Owner:** UI Designer

**Risk Notes:** Low risk - straightforward component following established patterns. Main risk is ensuring accessibility compliance.

### Sub-Ticket 14.2

**Title:** Create React Query mutation hook for adding activities

**Rationale:**
We need a React Query mutation hook that calls the `addActivity` usecase and properly invalidates related queries on success. This hook will be used by the form component to submit activity data.

**Acceptance Criteria:**

- [] `useAddActivity` hook exists in `presentation/hooks/useActivities.ts` (or separate file)
- [] Hook uses `useMutation` from React Query
- [] Hook calls `addActivity` usecase with `activityRepositorySupabase`
- [] Hook invalidates activities list queries on success (using `queryKeys.activities.list()`)
- [] Hook invalidates dashboard recent activities query on success (using `queryKeys.dashboard.recentActivities()`)
- [] Hook returns mutation object with `mutate`, `isPending`, `error`, `isSuccess` properties
- [] Hook properly types mutation input as `Omit<Activity, 'id'>`
- [] Hook properly types mutation result as `Activity`
- [] Hook properly types error as `ActivityError | Error`

**Definition of Done:**

- [] Hook created following React Query mutation patterns
- [] Hook invalidates all related queries on success
- [] Hook properly typed with TypeScript
- [] Hook tested (unit tests in `__tests__/presentation/hooks/useActivities.test.ts` or similar)
- [] Lint/build passes
- [] Hook documented with JSDoc

**Estimated Effort:** 1.5h

**Dependencies:** None (usecase and repository already exist)

**Owner:** Architecture-Aware Dev

**Risk Notes:** Low risk - straightforward mutation hook following established patterns. Main risk is ensuring all related queries are invalidated.

### Sub-Ticket 14.3

**Title:** Create AddActivityForm component with dynamic fields

**Rationale:**
The form component needs to display different fields based on the selected activity type. CREATION requires quantity and product, SALE requires product and amount, STOCK_CORRECTION requires product and quantity, and OTHER is flexible. The form must handle validation, error display, and submission.

**Acceptance Criteria:**

- [] `AddActivityForm.tsx` component exists in `presentation/components/addActivity/`
- [] Component uses activity type select (CREATION, SALE, STOCK_CORRECTION, OTHER)
- [] Component shows/hides fields dynamically based on activity type:
  - [] CREATION: quantity (number, required), product (select, required), note (textarea, optional)
  - [] SALE: product (select, required), quantity (number, required, typically negative), amount (number, required), note (textarea, optional)
  - [] STOCK_CORRECTION: product (select, required), quantity (number, required, can be positive or negative), amount (number, required), note (textarea, optional)
  - [] OTHER: quantity (number, required), amount (number, required), note (textarea, optional), product (select, optional)
- [] Component includes date field (defaults to current date/time, ISO 8601 format)
- [] Component uses `useAddActivity` hook for mutation
- [] Component displays loading state during submission (disabled form, loading button)
- [] Component displays field-level validation errors accessibly
- [] Component displays general error messages accessibly (aria-live region)
- [] Component uses all UI components from design system (Input, Select, Textarea, Button)
- [] Component uses `getFormFieldIds` for accessibility IDs
- [] Component uses SCSS variables for all styling
- [] Component is memoized appropriately
- [] Component has proper TypeScript types

**Definition of Done:**

- [] Component created with dynamic field rendering
- [] Component handles all activity types correctly
- [] Component validates inputs and displays errors accessibly
- [] Component uses design system components
- [] Component styled using SCSS variables (no hardcoded values)
- [] Component accessible (WCAG 2.1 AA): proper labels, ARIA attributes, error announcements, live regions
- [] Component tested (unit tests in `__tests__/presentation/components/addActivity/AddActivityForm.test.tsx`)
- [] Lint/build passes
- [] Component documented with JSDoc

**Estimated Effort:** 4h

**Dependencies:** Sub-Ticket 14.1 (Textarea component), Sub-Ticket 14.2 (useAddActivity hook)

**Owner:** UI Designer

**Risk Notes:** Medium risk - dynamic form logic can be complex. Main risks are: form state management, validation error mapping, accessibility of dynamic fields, date/time input handling.

### Sub-Ticket 14.4

**Title:** Create Add Activity page with form, success feedback, and navigation

**Rationale:**
The page component needs to render the form, handle success/error feedback, and provide navigation back to activities list. Success feedback should be announced accessibly, and the page should redirect on successful submission.

**Acceptance Criteria:**

- [] Page exists at `app/dashboard/activities/new/page.tsx`
- [] Page renders `AddActivityForm` component
- [] Page displays success message accessibly (aria-live region) after successful submission
- [] Page redirects to `/dashboard/activities` after successful submission (with delay for feedback)
- [] Page handles navigation back to activities list (cancel button or link)
- [] Page uses proper semantic HTML structure
- [] Page uses SCSS variables for all styling
- [] Page has proper page title and heading
- [] Page is accessible (WCAG 2.1 AA): proper heading hierarchy, skip links, focus management

**Definition of Done:**

- [] Page created with form and navigation
- [] Page handles success feedback and redirect
- [] Page styled using SCSS variables (no hardcoded values)
- [] Page accessible (WCAG 2.1 AA): proper structure, headings, live regions
- [] Page tested (unit tests in `__tests__/app/dashboard/activities/new/page.test.tsx` - if needed, but page tests are optional per rules)
- [] Lint/build passes
- [] Page documented with JSDoc

**Estimated Effort:** 2h

**Dependencies:** Sub-Ticket 14.3 (AddActivityForm component)

**Owner:** UI Designer

**Risk Notes:** Low risk - straightforward page component. Main risk is ensuring proper accessibility for success feedback and redirect timing.

### Sub-Ticket 14.5

**Title:** Add accessibility ID constants for form success/error messages

**Rationale:**
We need centralized accessibility ID constants for form success and error messages to ensure consistent, accessible feedback across the application. This follows the pattern established in `shared/a11y/ids.ts`.

**Acceptance Criteria:**

- [] Accessibility ID constants added to `shared/a11y/ids.ts`:
  - [] `formSuccess: "form-success"`
  - [] `formError: "form-error"`
- [] Constants exported and typed properly
- [] Constants used in AddActivityForm component
- [] Constants follow existing naming patterns

**Definition of Done:**

- [] Constants added to `shared/a11y/ids.ts`
- [] Constants used in form components
- [] Constants follow existing patterns
- [] Lint/build passes

**Estimated Effort:** 0.5h

**Dependencies:** None

**Owner:** Architecture-Aware Dev

**Risk Notes:** Low risk - simple addition following established patterns.

## Unit Test Spec (Test-First Protocol)

### Test Files & Paths

**Domain & Usecases (already tested):**
- `__tests__/core/usecases/activity.test.ts` - `addActivity` usecase already has comprehensive tests

**Infrastructure (already tested):**
- `__tests__/core/infrastructure/supabase/activityRepositorySupabase.test.ts` - Repository already tested

**Presentation Layer (new tests needed):**

1. **`__tests__/presentation/components/ui/Textarea.test.tsx`**
   - Test component rendering with label
   - Test component rendering without label
   - Test value and onChange handling
   - Test error message display
   - Test helper text display
   - Test required field indicator
   - Test disabled state
   - Test accessibility attributes (aria-invalid, aria-describedby, aria-required)
   - Test error message has role="alert"

2. **`__tests__/presentation/hooks/useActivities.test.ts`** (or new file for mutations)
   - Test `useAddActivity` hook:
     - Test mutation function calls `addActivity` usecase
     - Test mutation invalidates activities list queries on success
     - Test mutation invalidates dashboard recent activities query on success
     - Test mutation returns proper loading state
     - Test mutation returns proper error state
     - Test mutation returns proper success state

3. **`__tests__/presentation/components/addActivity/AddActivityForm.test.tsx`**
   - Test component rendering with all activity types
   - Test dynamic field display based on activity type:
     - Test CREATION shows quantity, product, note fields
     - Test SALE shows product, quantity, amount, note fields
     - Test STOCK_CORRECTION shows product, quantity, amount, note fields
     - Test OTHER shows quantity, amount, note, optional product fields
   - Test form submission with valid data
   - Test form validation errors:
     - Test required field validation
     - Test productId required for SALE/STOCK_CORRECTION
     - Test number field validation
   - Test error message display (field-level and general)
   - Test loading state during submission
   - Test success feedback
   - Test accessibility (labels, ARIA attributes, live regions)

### Test Names (describe/it)

```typescript
// Textarea.test.tsx
describe("Textarea Component", () => {
  describe("Rendering", () => {
    it("should render with label", () => {});
    it("should render without label", () => {});
    it("should render with helper text", () => {});
    it("should render with error message", () => {});
    it("should render required indicator", () => {});
    it("should render disabled state", () => {});
  });
  describe("Interactions", () => {
    it("should call onChange when value changes", () => {});
    it("should call onBlur when field loses focus", () => {});
  });
  describe("Accessibility", () => {
    it("should have proper aria-invalid when error exists", () => {});
    it("should have proper aria-describedby for errors", () => {});
    it("should have proper aria-required for required fields", () => {});
    it("should have error message with role='alert'", () => {});
  });
});

// useAddActivity.test.ts
describe("useAddActivity Hook", () => {
  it("should call addActivity usecase on mutate", () => {});
  it("should invalidate activities list queries on success", () => {});
  it("should invalidate dashboard recent activities query on success", () => {});
  it("should return loading state during mutation", () => {});
  it("should return error state on mutation failure", () => {});
  it("should return success state on mutation success", () => {});
});

// AddActivityForm.test.tsx
describe("AddActivityForm Component", () => {
  describe("Rendering", () => {
    it("should render form with activity type select", () => {});
    it("should render CREATION fields when CREATION type selected", () => {});
    it("should render SALE fields when SALE type selected", () => {});
    it("should render STOCK_CORRECTION fields when STOCK_CORRECTION type selected", () => {});
    it("should render OTHER fields when OTHER type selected", () => {});
  });
  describe("Form Submission", () => {
    it("should submit form with valid CREATION data", () => {});
    it("should submit form with valid SALE data", () => {});
    it("should submit form with valid STOCK_CORRECTION data", () => {});
    it("should submit form with valid OTHER data", () => {});
  });
  describe("Validation", () => {
    it("should display error when required fields are missing", () => {});
    it("should display error when productId missing for SALE type", () => {});
    it("should display error when productId missing for STOCK_CORRECTION type", () => {});
    it("should display error when quantity is invalid", () => {});
    it("should display error when amount is invalid", () => {});
  });
  describe("Accessibility", () => {
    it("should have proper labels for all fields", () => {});
    it("should announce errors via aria-live region", () => {});
    it("should announce success via aria-live region", () => {});
  });
});
```

### Mocks/Fixtures

- Mock `addActivity` usecase
- Mock `activityRepositorySupabase`
- Mock `productRepositorySupabase`
- Mock React Query (`useMutation`, `useQueryClient`)
- Mock products data for product select
- Mock activity data for form submission

### Edge Cases

- Empty products list (product select should handle gracefully)
- Network errors during submission
- Validation errors from usecase (ActivityError)
- Form submission with missing required fields
- Form submission with invalid number formats
- Date field with invalid format
- Product selection when product list is loading
- Form submission while previous submission is pending

### Coverage Target

- **Textarea component**: 100% (reusable UI component)
- **useAddActivity hook**: 100% (critical mutation logic)
- **AddActivityForm component**: 90%+ (complex form logic, focus on critical paths)

### Mapping AC → Tests

- **AC: Form validates inputs** → Validation test suite
- **AC: Form reflects errors accessibly** → Accessibility test suite, error display tests
- **AC: Form calls addActivity usecase** → Form submission tests
- **AC: Success feedback and redirect** → Success handling tests
- **AC: Dynamic fields based on type** → Dynamic field rendering tests

### Status

**Status:** tests: proposed

Tests should be written before implementation (TDD approach) for:
- Textarea component (Sub-Ticket 14.1)
- useAddActivity hook (Sub-Ticket 14.2)
- AddActivityForm component (Sub-Ticket 14.3)

## Agent Prompts

### Unit Test Coach

```
Generate unit tests for the Add Activity feature (FBC-14) following Test-First Protocol.

Focus on:
1. Textarea component tests (__tests__/presentation/components/ui/Textarea.test.tsx)
   - Test rendering, interactions, accessibility
   - Follow patterns from Input.test.tsx
   
2. useAddActivity hook tests (__tests__/presentation/hooks/useActivities.test.ts or new file)
   - Test mutation function, query invalidation, loading/error/success states
   - Mock addActivity usecase and React Query
   
3. AddActivityForm component tests (__tests__/presentation/components/addActivity/AddActivityForm.test.tsx)
   - Test dynamic field rendering based on activity type
   - Test form submission, validation, error handling
   - Test accessibility (labels, ARIA, live regions)

Use existing test patterns from the codebase. Mock all external dependencies.
Ensure 100% coverage for reusable components, 90%+ for form component.
```

### Architecture-Aware Dev

```
Implement the Add Activity feature (FBC-14) following Clean Architecture principles.

Tasks:
1. Create useAddActivity mutation hook (Sub-Ticket 14.2)
   - Use useMutation from React Query
   - Call addActivity usecase with activityRepositorySupabase
   - Invalidate activities list and dashboard recent activities queries on success
   - Follow patterns from useAuth.ts mutations
   
2. Add accessibility ID constants (Sub-Ticket 14.5)
   - Add formSuccess and formError to shared/a11y/ids.ts
   - Follow existing patterns

3. Create AddActivityForm component (Sub-Ticket 14.3)
   - Use activity type select to show/hide fields dynamically
   - Handle CREATION, SALE, STOCK_CORRECTION, OTHER types
   - Use useAddActivity hook for submission
   - Display validation errors accessibly
   - Use all design system components (Input, Select, Textarea, Button)
   - Use getFormFieldIds for accessibility IDs
   - Use SCSS variables for all styling
   
4. Create Add Activity page (Sub-Ticket 14.4)
   - Render AddActivityForm
   - Handle success feedback and redirect
   - Provide navigation back to activities list

CRITICAL RULES:
- NO business logic in components (usecases handle validation)
- NO direct Supabase calls (use hooks → usecases → repositories)
- ALL styles use SCSS variables (no hardcoded values)
- ALL accessibility via shared/a11y/ utilities
- TypeScript strict mode
- Arrow function components with export default
- Props use 'type' not 'interface'
```

### UI Designer

```
Create UI components for the Add Activity feature (FBC-14).

Tasks:
1. Create Textarea component (Sub-Ticket 14.1)
   - Follow Input.tsx component pattern exactly
   - Support label, helper text, error, required, disabled props
   - Use getFormFieldIds for accessibility IDs
   - Use SCSS variables for all styling
   - Memoize with React.memo
   - Create Textarea.module.scss or use global styles
   
2. Create AddActivityForm component (Sub-Ticket 14.3)
   - Dynamic form fields based on activity type
   - Use all design system components
   - Proper form validation and error display
   - Accessible form (WCAG 2.1 AA)
   - Use SCSS variables for all styling
   - Create AddActivityForm.module.scss
   
3. Create Add Activity page (Sub-Ticket 14.4)
   - Page layout with form
   - Success/error feedback
   - Navigation controls
   - Use SCSS variables for all styling
   - Create page.module.scss

CRITICAL RULES:
- ALL styles use SCSS variables from styles/variables/* (NO hardcoded values)
- ALL components accessible (WCAG 2.1 AA): labels, ARIA, live regions
- Arrow function components with export default
- Props use 'type' not 'interface'
- Memoize expensive components
- Use centralized accessibility utilities from shared/a11y/
```

### QA & Test Coach

```
Create test plan and QA checklist for the Add Activity feature (FBC-14).

Focus on:
1. Functional Testing
   - Test all activity types (CREATION, SALE, STOCK_CORRECTION, OTHER)
   - Test dynamic field display
   - Test form validation
   - Test form submission
   - Test success feedback and redirect
   - Test error handling

2. Accessibility Testing (WCAG 2.1 AA)
   - Screen reader testing (NVDA, JAWS, VoiceOver)
   - Keyboard navigation
   - Focus management
   - Error announcements (aria-live)
   - Success announcements (aria-live)
   - Form labels and descriptions
   - High contrast mode
   - Text scaling (up to 200%)

3. Browser Testing
   - Chrome, Firefox, Safari, Edge
   - Mobile browsers (iOS Safari, Chrome Mobile)

4. Integration Testing
   - Form submission creates activity in database
   - Activities list updates after creation
   - Dashboard recent activities updates after creation
   - Stock calculations update correctly

5. Edge Cases
   - Empty products list
   - Network errors
   - Invalid date formats
   - Invalid number formats
   - Concurrent form submissions

Provide test scenarios, expected results, and pass/fail criteria.
```

### Architecture Guardian

```
Verify Clean Architecture compliance for the Add Activity feature (FBC-14).

Check:
1. Layer Separation
   - No Supabase imports in core/ or presentation/
   - No React/Next.js imports in core/
   - No business logic in components
   - Proper flow: UI → Hooks → Usecases → Repositories

2. File Organization
   - Textarea component in presentation/components/ui/
   - AddActivityForm in presentation/components/addActivity/
   - useAddActivity hook in presentation/hooks/
   - Page in app/dashboard/activities/new/

3. Import Rules
   - Absolute imports with @/ prefix
   - No relative imports from src/
   - SCSS imports use @/styles/

4. Code Conventions
   - Arrow function components with export default
   - Props use 'type' not 'interface'
   - SCSS variables used (no hardcoded values)
   - TypeScript strict mode
   - No 'any' types

5. Accessibility
   - Centralized a11y utilities from shared/a11y/
   - Proper ARIA attributes
   - Live regions for feedback
   - Semantic HTML

6. Testing
   - Unit tests for reusable components
   - Unit tests for hooks
   - Tests in __tests__/ directory

Report any violations and provide fixes.
```

## Open Questions

1. **Date/Time Input Format**: Should we use native HTML5 `datetime-local` input, or separate date and time inputs? Native `datetime-local` may have browser compatibility issues. **Recommendation**: Use separate date and time inputs for better compatibility and UX.

2. **Product Select for Large Lists**: If the product list grows large, should we add search/filter to the product select? **Recommendation**: Start with simple select, add search/filter in future iteration if needed.

3. **Quantity Sign Convention**: For SALE activities, should the form automatically make quantity negative, or should users enter negative values? **Recommendation**: Allow users to enter positive values and convert to negative in the form logic for better UX (users think "sold 5 items" not "sold -5 items").

4. **Default Date/Time**: Should the date field default to current date/time, or be empty? **Recommendation**: Default to current date/time (now) for faster data entry.

5. **Success Redirect Timing**: How long should success message be displayed before redirect? **Recommendation**: 2-3 seconds to allow users to see feedback, but ensure it's announced via aria-live immediately.

6. **Form Reset After Success**: Should the form reset after successful submission, or redirect immediately? **Recommendation**: Redirect to activities list after success (per AC), but show success message first.

## MVP Cut List

If time is limited, the following can be deferred:

1. **Textarea Component Enhancement**: Start with basic textarea, add advanced features (character count, auto-resize) later
2. **Product Search/Filter**: Start with simple select, add search later if product list grows
3. **Form Auto-save/Draft**: Save form state to localStorage (future enhancement)
4. **Activity Templates**: Pre-filled forms for common activities (future enhancement)
5. **Bulk Activity Creation**: Create multiple activities at once (future enhancement)
6. **Advanced Date/Time Picker**: Use native inputs initially, add custom picker later if needed
7. **Form Validation on Blur**: Start with validation on submit, add onBlur validation later

**Core MVP (must have):**
- Dynamic form fields based on activity type
- Form validation and error display
- Form submission via useAddActivity hook
- Success feedback and redirect
- Accessibility compliance (WCAG 2.1 AA)

