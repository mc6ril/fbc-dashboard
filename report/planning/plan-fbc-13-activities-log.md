---
Generated: 2025-01-27 16:00:00
Report Type: planning
Command: pm-plan-from-ticket
Ticket: FBC-13
---

## Summary

**Goal:** Build an Activities page at `/dashboard/activities` with a filterable, paginated table showing activity history. Users can filter by date range, activity type, and product, and navigate to add new activities.

**User value:** Users can review and filter past activities to analyze operations and find specific events quickly, enabling better business insights and audit trail management.

**Constraints:**

-   Strict Clean Architecture: UI → Hooks → Usecases → Repositories
-   No direct Supabase calls from UI
-   Filters must not cause unnecessary re-renders (stable query keys, `select` option)
-   Performance optimization: memoization, stable query keys, avoid inline functions
-   All styles use SCSS variables from `styles/variables/*`
-   Accessibility compliance (WCAG 2.1 AA): proper table markup, headers, captions, labels
-   TypeScript strict mode
-   Pagination required for large datasets

**Non-goals:**

-   Real-time updates (polling/websockets)
-   Export functionality
-   Bulk operations (delete, edit multiple)
-   Activity detail view/modal
-   Advanced sorting (default: date descending)
-   Activity editing from this page (separate feature)

## Assumptions & Risks

**Assumptions:**

-   Activity repository `list()` method exists and returns all activities (verified: exists in `src/core/ports/activityRepository.ts`)
-   Activities are stored with ISO 8601 date strings
-   Product repository exists for product filter dropdown (verified: exists)
-   Date range filtering can be done in-memory initially (usecase layer) or at repository level
-   Pagination can be done in-memory initially (usecase layer) or at repository level
-   Default page size: 20 items per page
-   Activities are sorted by date descending (most recent first)

**Risks:**

-   Missing filtering usecase (needs to be created)
-   Missing pagination support in repository (may need to extend port and implementation)
-   Performance issues with large activity lists (mitigation: pagination, client-side filtering initially, can be moved to repository level later)
-   Date range picker component doesn't exist (needs to be created or use native HTML5 date inputs)
-   Product select dropdown component doesn't exist (needs to be created)
-   Table component doesn't exist (needs to be created as reusable or page-specific)
-   Filter state management complexity (mitigation: Zustand store for UI state)
-   Query key stability with filters (mitigation: use stable serialization, `select` option)

## Solution Outline (aligned with architecture)

**Domain Layer (`core/domain/`):**

-   No new domain types needed (Activity, ActivityType, ActivityId, ProductId already exist)
-   May need filter type definition for type safety

**Usecases Layer (`core/usecases/`):**

-   `listActivitiesWithFilters`: Filter activities by date range, type, and productId (extends existing `listActivities`)
-   Filtering logic in usecase layer (client-side initially, can be moved to repository later for performance)
-   Pagination logic in usecase layer (client-side initially, can be moved to repository later for performance)

**Ports Layer (`core/ports/`):**

-   ActivityRepository port may need extension for filtering (optional: can filter in usecase initially)
-   Keep existing `list()` method for backward compatibility

**Infrastructure Layer (`infrastructure/supabase/`):**

-   ActivityRepository Supabase implementation may need extension for filtering (optional: can filter in usecase initially)
-   Keep existing `list()` method for backward compatibility

**Presentation Layer:**

-   **Hooks (`presentation/hooks/`):**
    -   `useActivities`: React Query hook with filters and pagination, stable query keys, `select` option
    -   `useProducts`: React Query hook for product filter dropdown (may need to be created)
-   **Stores (`presentation/stores/`):**
    -   `useActivityFiltersStore`: Zustand store for filter UI state (date range, type, productId, page, pageSize)
-   **UI Components (`presentation/components/ui/`):**
    -   `Table.tsx`: Reusable table component with proper accessibility (new)
    -   `Select.tsx`: Reusable select dropdown component (new, if doesn't exist)
    -   `DateInput.tsx`: Reusable date input component (new, if doesn't exist, or use native HTML5)
-   **Page Components (`presentation/components/activities/`):**
    -   `ActivitiesTable.tsx`: Table component for activities list
    -   `ActivityFilters.tsx`: Filter controls component (date range, type, product)
    -   `ActivityPagination.tsx`: Pagination controls component
-   **Page (`app/dashboard/activities/page.tsx`):**
    -   Main page component with filters, table, pagination, and "Add Activity" button

**Shared Layer (`shared/`):**

-   Date utilities already exist (`formatDate` in `shared/utils/date.ts`)
-   Currency utilities already exist (`formatCurrency` in `shared/utils/currency.ts`)

## Sub-Tickets

### Sub-Ticket 13.1

**Title:** Create activity filtering usecase

**Rationale:**
Activities page needs to filter activities by date range, type, and product. This usecase extends the existing `listActivities` to support filtering while maintaining Clean Architecture separation.

**Acceptance Criteria:**

-   [x] New usecase `listActivitiesWithFilters` in `src/core/usecases/activity.ts`
-   [x] Accepts filter parameters: `startDate?`, `endDate?`, `type?`, `productId?`
-   [x] Filters activities in-memory (client-side filtering initially)
-   [x] Returns filtered activities array
-   [x] Validates date parameters are valid ISO 8601 strings
-   [x] Handles empty filters (returns all activities)
-   [x] Maintains backward compatibility with existing `listActivities` usecase

**Definition of Done:**

-   [x] Usecase implemented and tested
-   [x] TypeScript compilation succeeds
-   [x] No linting errors
-   [x] JSDoc documentation added
-   [x] Follows existing usecase patterns

**Estimated Effort:** 2h

**Dependencies:** None

**Owner:** Architecture-Aware Dev

**Risk Notes:** Client-side filtering may be slow for large datasets. Can be optimized later by moving filtering to repository level.

### Sub-Ticket 13.2

**Title:** Create pagination usecase for activities

**Rationale:**
Activities page needs pagination to handle large activity lists efficiently. This usecase adds pagination logic to the filtered activities list.

**Acceptance Criteria:**

-   [x] New usecase `listActivitiesPaginated` in `src/core/usecases/activity.ts` (or extend `listActivitiesWithFilters`)
-   [x] Accepts pagination parameters: `page` (1-based), `pageSize` (default: 20)
-   [x] Returns paginated result object: `{ activities: Activity[], total: number, page: number, pageSize: number, totalPages: number }`
-   [x] Sorts activities by date descending (most recent first)
-   [x] Calculates total count for pagination UI
-   [x] Handles edge cases (empty results, page out of range)

**Definition of Done:**

-   [x] Usecase implemented and tested
-   [x] TypeScript compilation succeeds
-   [x] No linting errors
-   [x] JSDoc documentation added
-   [x] Follows existing usecase patterns

**Estimated Effort:** 2h

**Dependencies:** Sub-Ticket 13.1 (filtering usecase)

**Owner:** Architecture-Aware Dev

**Risk Notes:** Client-side pagination may be slow for large datasets. Can be optimized later by moving pagination to repository level.

### Sub-Ticket 13.3

**Title:** Create Zustand store for activity filters UI state

**Rationale:**
Filter state (date range, type, product, page) needs to be managed in Zustand store to prevent unnecessary re-renders and maintain filter state across navigation.

**Acceptance Criteria:**

-   [x] New store `useActivityFiltersStore` in `src/presentation/stores/useActivityFiltersStore.ts`
-   [x] Store state: `startDate?`, `endDate?`, `type?`, `productId?`, `page` (default: 1), `pageSize` (default: 20)
-   [x] Store actions: `setStartDate`, `setEndDate`, `setType`, `setProductId`, `setPage`, `setPageSize`, `resetFilters`
-   [x] Uses Zustand selectors to prevent unnecessary re-renders
-   [x] No business logic in store (UI state only)

**Definition of Done:**

-   [x] Store implemented
-   [x] TypeScript compilation succeeds
-   [x] No linting errors
-   [x] Follows existing Zustand store patterns (see `useAuthStore.ts`)

**Estimated Effort:** 1h

**Dependencies:** None

**Owner:** Architecture-Aware Dev

**Risk Notes:** None

### Sub-Ticket 13.4

**Title:** Create React Query hook for filtered and paginated activities

**Rationale:**
Activities page needs a React Query hook that fetches filtered and paginated activities with stable query keys and `select` option for performance optimization.

**Acceptance Criteria:**

-   [x] New hook `useActivities` in `src/presentation/hooks/useActivities.ts`
-   [x] Accepts filter and pagination parameters from Zustand store
-   [x] Uses stable query keys from `queryKeys.activities.list(filters, page, pageSize)`
-   [x] Calls `listActivitiesPaginated` usecase
-   [x] Uses `select` option to transform data only when needed
-   [x] Configures appropriate `staleTime` (5 minutes default)
-   [x] Returns: `data`, `isLoading`, `error`
-   [x] Query key includes all filter parameters for proper cache invalidation

**Definition of Done:**

-   [x] Hook implemented
-   [x] Query keys added to `src/presentation/hooks/queryKeys.ts`
-   [x] TypeScript compilation succeeds
-   [x] No linting errors
-   [x] Follows existing React Query hook patterns (see `useDashboard.ts`)

**Estimated Effort:** 2h

**Dependencies:** Sub-Ticket 13.2 (pagination usecase), Sub-Ticket 13.3 (Zustand store)

**Owner:** Architecture-Aware Dev

**Risk Notes:** Query key stability is critical. Must serialize filter objects consistently.

### Sub-Ticket 13.5

**Title:** Create reusable Table component

**Rationale:**
Activities page needs a table component with proper accessibility (WCAG 2.1 AA). This reusable component can be used for other data tables in the application.

**Acceptance Criteria:**

-   [x] New component `Table.tsx` in `src/presentation/components/ui/Table.tsx`
-   [x] Accepts props: `columns`, `data`, `caption?`, `ariaLabel?`
-   [x] Uses semantic HTML: `<table>`, `<thead>`, `<tbody>`, `<th>`, `<td>`
-   [x] Includes `<caption>` element for accessibility
-   [x] Proper `aria-label` or `aria-labelledby` attributes
-   [x] Column headers with `scope="col"`
-   [x] Row headers with `scope="row"` if applicable
-   [x] SCSS in `src/styles/components/_table.scss` using variables only
-   [x] Memoized with `React.memo`
-   [x] TypeScript strict mode

**Definition of Done:**

-   [x] Component implemented
-   [x] SCSS styles using variables only
-   [x] TypeScript compilation succeeds
-   [x] No linting errors
-   [x] Accessibility tested (WCAG 2.1 AA)
-   [x] Follows existing UI component patterns (see `Button.tsx`, `Card.tsx`)

**Estimated Effort:** 3h

**Dependencies:** None

**Owner:** UI Designer

**Risk Notes:** Table accessibility can be complex. Must ensure proper markup and ARIA attributes.

### Sub-Ticket 13.6

**Title:** Create reusable Select component

**Rationale:**
Activities page needs a select dropdown for activity type and product filters. This reusable component can be used for other forms in the application.

**Acceptance Criteria:**

-   [x] New component `Select.tsx` in `src/presentation/components/ui/Select.tsx`
-   [x] Accepts props: `id`, `label`, `options`, `value`, `onChange`, `placeholder?`, `error?`, `required?`, `disabled?`
-   [x] Uses semantic HTML: `<label>`, `<select>`
-   [x] Proper accessibility: `aria-label`, `aria-describedby`, `aria-invalid`, `aria-required`
-   [x] Error message with `role="alert"`
-   [x] SCSS in `src/styles/components/_select.scss` using variables only
-   [x] Memoized with `React.memo`
-   [x] TypeScript strict mode

**Definition of Done:**

-   [x] Component implemented
-   [x] SCSS styles using variables only
-   [x] TypeScript compilation succeeds
-   [x] No linting errors
-   [x] Accessibility tested (WCAG 2.1 AA)
-   [x] Follows existing UI component patterns (see `Input.tsx`)

**Estimated Effort:** 2h

**Dependencies:** None

**Owner:** UI Designer

**Risk Notes:** None

### Sub-Ticket 13.7

**Title:** Create reusable DateInput component (or use native HTML5)

**Rationale:**
Activities page needs date inputs for date range filtering. Can use native HTML5 date inputs or create a reusable component.

**Acceptance Criteria:**

-   [x] Option A: Create `DateInput.tsx` in `src/presentation/components/ui/DateInput.tsx` (reusable component)
-   [] Option B: Use native HTML5 `<input type="date">` with proper styling and accessibility
-   [x] Accepts props: `id`, `label`, `value`, `onChange`, `error?`, `required?`, `disabled?`, `min?`, `max?`
-   [x] Proper accessibility: `aria-label`, `aria-describedby`, `aria-invalid`, `aria-required`
-   [x] Error message with `role="alert"`
-   [x] SCSS using variables only
-   [x] TypeScript strict mode

**Definition of Done:**

-   [x] Component/input implemented
-   [x] SCSS styles using variables only
-   [x] TypeScript compilation succeeds
-   [x] No linting errors
-   [x] Accessibility tested (WCAG 2.1 AA)
-   [x] Follows existing UI component patterns

**Estimated Effort:** 2h (Option A) or 1h (Option B)

**Dependencies:** None

**Owner:** UI Designer

**Risk Notes:** Native HTML5 date inputs have limited browser styling. May need custom component for better UX.

### Sub-Ticket 13.8

**Title:** Create ActivityFilters component

**Rationale:**
Activities page needs a filter controls component that uses the Zustand store and updates filters without causing unnecessary re-renders.

**Acceptance Criteria:**

-   [x] New component `ActivityFilters.tsx` in `src/presentation/components/activities/ActivityFilters.tsx`
-   [x] Uses `useActivityFiltersStore` with selectors to prevent unnecessary re-renders
-   [x] Date range inputs (start date, end date) using DateInput component
-   [x] Activity type select using Select component (options: All, CREATION, SALE, STOCK_CORRECTION, OTHER)
-   [x] Product select using Select component (options from `useProducts` hook)
-   [x] Reset filters button
-   [x] Memoized with `React.memo`
-   [x] Uses `useCallback` for event handlers
-   [x] SCSS module `ActivityFilters.module.scss` using variables only
-   [x] Proper accessibility labels

**Definition of Done:**

-   [x] Component implemented
-   [x] SCSS module using variables only
-   [x] TypeScript compilation succeeds
-   [x] No linting errors
-   [x] Performance optimized (memoization, selectors)
-   [x] Accessibility tested (WCAG 2.1 AA)

**Estimated Effort:** 3h

**Dependencies:** Sub-Ticket 13.3 (Zustand store), Sub-Ticket 13.6 (Select component), Sub-Ticket 13.7 (DateInput component), `useProducts` hook (may need to be created)

**Owner:** Architecture-Aware Dev

**Risk Notes:** Product select needs `useProducts` hook. May need to create it if it doesn't exist.

### Sub-Ticket 13.9

**Title:** Create ActivitiesTable component

**Rationale:**
Activities page needs a table component that displays activities with proper formatting (date, type, product, quantity, amount, note).

**Acceptance Criteria:**

-   [x] New component `ActivitiesTable.tsx` in `src/presentation/components/activities/ActivitiesTable.tsx`
-   [x] Uses Table component from `presentation/components/ui/Table.tsx`
-   [x] Accepts props: `activities: Activity[]`, `isLoading: boolean`, `error: Error | null`
-   [x] Columns: Date, Type, Product, Quantity, Amount, Note
-   [x] Formats date using `formatDate` utility
-   [x] Formats amount using `formatCurrency` utility
-   [x] Formats quantity with sign (+/-) and color coding if needed
-   [x] Displays activity type as readable label
-   [x] Displays product name (fetches product name from productId, may need product lookup)
-   [x] Loading state: shows loading message or skeleton
-   [x] Error state: shows error message
-   [x] Empty state: shows "No activities found" message
-   [x] Memoized with `React.memo`
-   [x] SCSS module `ActivitiesTable.module.scss` using variables only
-   [x] Proper accessibility (table caption, headers)

**Definition of Done:**

-   [x] Component implemented
-   [x] SCSS module using variables only
-   [x] TypeScript compilation succeeds
-   [x] No linting errors
-   [x] Handles loading, error, and empty states
-   [x] Accessibility tested (WCAG 2.1 AA)

**Estimated Effort:** 4h

**Dependencies:** Sub-Ticket 13.5 (Table component), `useProducts` hook (for product name lookup)

**Owner:** Architecture-Aware Dev

**Risk Notes:** Product name lookup may require additional hook or data fetching. Consider caching product names.

### Sub-Ticket 13.10

**Title:** Create ActivityPagination component

**Rationale:**
Activities page needs pagination controls to navigate between pages of activities.

**Acceptance Criteria:**

-   [x] New component `ActivityPagination.tsx` in `src/presentation/components/activities/ActivityPagination.tsx`
-   [x] Accepts props: `currentPage: number`, `totalPages: number`, `onPageChange: (page: number) => void`
-   [x] Displays: "Previous" button, page numbers, "Next" button
-   [x] Disables Previous on first page, Next on last page
-   [x] Shows current page indicator
-   [x] Uses Button component from `presentation/components/ui/Button.tsx`
-   [x] Memoized with `React.memo`
-   [x] Uses `useCallback` for event handlers
-   [x] SCSS module `ActivityPagination.module.scss` using variables only
-   [x] Proper accessibility (aria-labels, keyboard navigation)

**Definition of Done:**

-   [x] Component implemented
-   [x] SCSS module using variables only
-   [x] TypeScript compilation succeeds
-   [x] No linting errors
-   [x] Accessibility tested (WCAG 2.1 AA)

**Estimated Effort:** 2h

**Dependencies:** Sub-Ticket 13.3 (Zustand store for page state)

**Owner:** Architecture-Aware Dev

**Risk Notes:** None

### Sub-Ticket 13.11

**Title:** Create Activities page with filters, table, and pagination

**Rationale:**
Main page component that brings together all components (filters, table, pagination) and provides "Add Activity" button navigation.

**Acceptance Criteria:**

-   [x] Update `src/app/dashboard/activities/page.tsx`
-   [x] Uses `useActivities` hook with filters from Zustand store
-   [x] Renders ActivityFilters component
-   [x] Renders ActivitiesTable component with data from hook
-   [x] Renders ActivityPagination component
-   [x] "Add Activity" button navigates to `/dashboard/activities/new` (or placeholder route)
-   [x] Uses Link component from `presentation/components/ui/Link.tsx` for navigation
-   [x] Handles loading and error states at page level
-   [x] SCSS module `page.module.scss` using variables only
-   [x] Proper page structure (Heading, semantic HTML)
-   [x] Accessibility: page title, skip links if needed

**Definition of Done:**

-   [x] Page implemented
-   [x] SCSS module using variables only
-   [x] TypeScript compilation succeeds
-   [x] No linting errors
-   [x] All components integrated
-   [x] Navigation works correctly
-   [x] Accessibility tested (WCAG 2.1 AA)
-   [x] Performance optimized (no unnecessary re-renders)

**Estimated Effort:** 3h

**Dependencies:** Sub-Ticket 13.4 (useActivities hook), Sub-Ticket 13.8 (ActivityFilters), Sub-Ticket 13.9 (ActivitiesTable), Sub-Ticket 13.10 (ActivityPagination)

**Owner:** Architecture-Aware Dev

**Risk Notes:** Integration complexity. Must ensure all components work together without performance issues.

### Sub-Ticket 13.12

**Title:** Create useProducts hook (if doesn't exist)

**Rationale:**
ActivityFilters component needs to fetch products for the product filter dropdown. This hook may already exist or needs to be created.

**Acceptance Criteria:**

-   [x] Check if `useProducts` hook exists in `src/presentation/hooks/`
-   [x] If exists: verify it works for product filter dropdown
-   [x] If doesn't exist: create `useProducts` hook in `src/presentation/hooks/useProducts.ts`
-   [x] Uses `listProducts` usecase from `core/usecases/product.ts`
-   [x] Uses stable query keys from `queryKeys.products.all()`
-   [x] Returns: `data`, `isLoading`, `error`
-   [x] Follows existing React Query hook patterns

**Definition of Done:**

-   [x] Hook exists and works correctly
-   [x] Query keys added to `src/presentation/hooks/queryKeys.ts` if needed
-   [x] TypeScript compilation succeeds
-   [x] No linting errors

**Estimated Effort:** 1h (if needs to be created) or 0.5h (if exists, just verify)

**Dependencies:** None

**Owner:** Architecture-Aware Dev

**Risk Notes:** None

## Unit Test Spec (Test-First Protocol)

### Domain Tests (`__tests__/core/domain/`)

**File:** `__tests__/core/domain/activity.test.ts` (extend existing)

-   Test activity filtering logic (if moved to domain)
-   Test date validation for filters

### Usecase Tests (`__tests__/core/usecases/`)

**File:** `__tests__/core/usecases/activity.test.ts` (extend existing)

**Test Suite: `listActivitiesWithFilters`**

-   `describe("listActivitiesWithFilters")`
    -   `it("should return all activities when no filters provided")`
    -   `it("should filter activities by startDate")`
    -   `it("should filter activities by endDate")`
    -   `it("should filter activities by date range")`
    -   `it("should filter activities by type")`
    -   `it("should filter activities by productId")`
    -   `it("should filter activities by multiple filters")`
    -   `it("should return empty array when no activities match filters")`
    -   `it("should throw error for invalid startDate format")`
    -   `it("should throw error for invalid endDate format")`

**Test Suite: `listActivitiesPaginated`**

-   `describe("listActivitiesPaginated")`
    -   `it("should return first page of activities")`
    -   `it("should return correct page size")`
    -   `it("should return correct total count")`
    -   `it("should return correct total pages")`
    -   `it("should sort activities by date descending")`
    -   `it("should handle empty activities list")`
    -   `it("should handle page out of range")`
    -   `it("should combine filtering and pagination")`

**Mocks:**

-   Mock `ActivityRepository` with `jest.mock("infrastructure/supabase/activityRepositorySupabase")`
-   Create test fixtures for activities with various dates, types, products

**Coverage Target:** 100% for new usecases

**Status:** tests `proposed`

### Reusable UI Component Tests (`__tests__/presentation/components/ui/`)

**File:** `__tests__/presentation/components/ui/Table.test.tsx`

-   Test table rendering with columns and data
-   Test accessibility attributes (caption, aria-label, headers)
-   Test empty state
-   Test loading state (if applicable)

**File:** `__tests__/presentation/components/ui/Select.test.tsx`

-   Test select rendering with options
-   Test value change
-   Test accessibility attributes
-   Test error state
-   Test disabled state

**File:** `__tests__/presentation/components/ui/DateInput.test.tsx` (if created)

-   Test date input rendering
-   Test value change
-   Test accessibility attributes
-   Test error state
-   Test min/max constraints

**Mocks:**

-   Mock React Query hooks if needed
-   Use React Testing Library for component rendering

**Coverage Target:** 100% for reusable components

**Status:** tests `proposed`

## Agent Prompts

### Unit Test Coach

```
Generate unit test specs for Activities page feature (FBC-13):

1. Extend `__tests__/core/usecases/activity.test.ts`:
   - Test `listActivitiesWithFilters` usecase with various filter combinations
   - Test `listActivitiesPaginated` usecase with pagination logic
   - Test edge cases (empty results, invalid dates, page out of range)

2. Create `__tests__/presentation/components/ui/Table.test.tsx`:
   - Test table rendering, accessibility, empty/loading states

3. Create `__tests__/presentation/components/ui/Select.test.tsx`:
   - Test select rendering, value changes, accessibility, error states

4. Create `__tests__/presentation/components/ui/DateInput.test.tsx` (if component created):
   - Test date input rendering, value changes, accessibility, constraints

Follow TDD approach: write tests first, then implement features.
All tests must be in `__tests__/` directory at project root.
Use TypeScript, Jest, React Testing Library for UI components.
```

### Architecture-Aware Dev

```
Implement Activities page feature (FBC-13) following Clean Architecture:

1. Create filtering usecase in `src/core/usecases/activity.ts`:
   - `listActivitiesWithFilters`: Filter by date range, type, productId
   - Validate date parameters (ISO 8601)
   - Client-side filtering initially

2. Create pagination usecase in `src/core/usecases/activity.ts`:
   - `listActivitiesPaginated`: Paginate filtered activities
   - Sort by date descending
   - Return pagination metadata (total, page, pageSize, totalPages)

3. Create Zustand store in `src/presentation/stores/useActivityFiltersStore.ts`:
   - Filter state: startDate, endDate, type, productId, page, pageSize
   - Actions: setStartDate, setEndDate, setType, setProductId, setPage, setPageSize, resetFilters
   - Use selectors to prevent unnecessary re-renders

4. Create React Query hook in `src/presentation/hooks/useActivities.ts`:
   - Use stable query keys from `queryKeys.activities.list(filters, page, pageSize)`
   - Call `listActivitiesPaginated` usecase
   - Use `select` option for performance
   - Configure staleTime (5 minutes)

5. Create `useProducts` hook in `src/presentation/hooks/useProducts.ts` (if doesn't exist):
   - Call `listProducts` usecase
   - Use stable query keys

6. Create page components in `src/presentation/components/activities/`:
   - `ActivityFilters.tsx`: Filter controls with memoization
   - `ActivitiesTable.tsx`: Table with activity data
   - `ActivityPagination.tsx`: Pagination controls

7. Update `src/app/dashboard/activities/page.tsx`:
   - Integrate all components
   - Add "Add Activity" button navigation

CRITICAL RULES:
- No business logic in components
- No direct Supabase calls from UI
- All styles use SCSS variables
- Memoization for performance
- Accessibility compliance (WCAG 2.1 AA)
- TypeScript strict mode
- Follow existing patterns

Reference: Sub-Tickets 13.1-13.12 in planning document.
```

### UI Designer

```
Design and implement UI components for Activities page (FBC-13):

1. Create `Table.tsx` in `src/presentation/components/ui/Table.tsx`:
   - Reusable table component
   - Props: columns, data, caption?, ariaLabel?
   - Semantic HTML: <table>, <thead>, <tbody>, <th>, <td>
   - Accessibility: caption, aria-label, scope attributes
   - SCSS in `src/styles/components/_table.scss` using variables only
   - Memoized with React.memo

2. Create `Select.tsx` in `src/presentation/components/ui/Select.tsx`:
   - Reusable select dropdown component
   - Props: id, label, options, value, onChange, placeholder?, error?, required?, disabled?
   - Accessibility: aria-label, aria-describedby, aria-invalid, aria-required
   - Error message with role="alert"
   - SCSS in `src/styles/components/_select.scss` using variables only
   - Memoized with React.memo

3. Create `DateInput.tsx` in `src/presentation/components/ui/DateInput.tsx` (or use native HTML5):
   - Reusable date input component
   - Props: id, label, value, onChange, error?, required?, disabled?, min?, max?
   - Accessibility: aria-label, aria-describedby, aria-invalid, aria-required
   - Error message with role="alert"
   - SCSS using variables only
   - Memoized with React.memo

4. Create page components in `src/presentation/components/activities/`:
   - `ActivityFilters.tsx`: Filter controls layout
   - `ActivitiesTable.tsx`: Table styling and formatting
   - `ActivityPagination.tsx`: Pagination controls styling

All components must:
- Use SCSS variables from `styles/variables/*` only
- Be accessible (WCAG 2.1 AA)
- Follow existing UI component patterns (see Button.tsx, Input.tsx, Card.tsx)
- Use arrow function with export default format
- Define props with `type` (not `interface`)
```

### QA & Test Coach

```
Create test plan and QA checklist for Activities page (FBC-13):

1. Functional Testing:
   - Test date range filtering (start date, end date, both)
   - Test activity type filtering (All, CREATION, SALE, STOCK_CORRECTION, OTHER)
   - Test product filtering
   - Test combined filters
   - Test pagination (next, previous, page numbers)
   - Test "Add Activity" button navigation
   - Test reset filters functionality
   - Test empty state (no activities)
   - Test loading state
   - Test error state

2. Performance Testing:
   - Test with large activity lists (1000+ activities)
   - Verify no unnecessary re-renders when filters change
   - Verify stable query keys prevent unnecessary refetches
   - Test pagination performance

3. Accessibility Testing (WCAG 2.1 AA):
   - Test with screen reader (NVDA, JAWS, VoiceOver)
   - Test keyboard navigation (Tab, Enter, Space, Arrow keys)
   - Test table accessibility (headers, captions, scope)
   - Test form accessibility (labels, error messages, aria attributes)
   - Test high contrast mode
   - Test text scaling (up to 200%)
   - Test with browser accessibility tools (axe DevTools, WAVE)

4. Browser Compatibility:
   - Test in Chrome, Firefox, Safari, Edge
   - Test date input compatibility (native HTML5 vs custom)

5. Edge Cases:
   - Test invalid date ranges (end before start)
   - Test page out of range
   - Test network errors
   - Test empty product list in filter

Create test scenarios and acceptance criteria for each test category.
```

### Architecture Guardian

```
Verify Architecture compliance for Activities page (FBC-13):

1. Layer Separation:
   - Verify no Supabase imports in core/domain or core/usecases
   - Verify no React/Next.js imports in core/
   - Verify no business logic in presentation/components
   - Verify hooks call usecases, not repositories directly
   - Verify Zustand store contains only UI state

2. Import Rules:
   - Verify import direction: UI → Hooks → Usecases → Repositories
   - Verify no forbidden cross-layer imports
   - Verify absolute imports with @/ prefix

3. File Organization:
   - Verify files in correct directories (domain, usecases, ports, infrastructure, presentation)
   - Verify reusable components in presentation/components/ui/
   - Verify page-specific components in presentation/components/activities/
   - Verify hooks in presentation/hooks/
   - Verify stores in presentation/stores/

4. Code Conventions:
   - Verify TypeScript strict mode
   - Verify no `any` types
   - Verify arrow function components with export default
   - Verify props use `type` (not `interface`)
   - Verify SCSS variables only (no hardcoded values)
   - Verify accessibility utilities from shared/a11y/

5. Performance:
   - Verify stable query keys
   - Verify `select` option in React Query hooks
   - Verify memoization (React.memo, useMemo, useCallback)
   - Verify Zustand selectors

6. Accessibility:
   - Verify semantic HTML
   - Verify ARIA attributes
   - Verify keyboard navigation
   - Verify screen reader support

Report any violations and provide recommendations for fixes.
```

## Open Questions

1. **Pagination Strategy:** Should pagination be client-side (usecase layer) or server-side (repository level)?

    - **Decision:** Start with client-side for MVP, can be optimized to server-side later if performance issues arise.

2. **Filtering Strategy:** Should filtering be client-side (usecase layer) or server-side (repository level)?

    - **Decision:** Start with client-side for MVP, can be optimized to server-side later if performance issues arise.

3. **Date Input Component:** Use native HTML5 `<input type="date">` or create custom DateInput component?

    - **Decision:** Start with native HTML5 for MVP, can create custom component later if UX issues arise.

4. **Product Name Lookup:** How to display product names in table? Fetch all products and create lookup map, or fetch product names individually?

    - **Decision:** Fetch all products once and create lookup map in component (cached via React Query).

5. **Activity Type Labels:** Should activity types be displayed as enum values (CREATION, SALE) or human-readable labels (Création, Vente)?

    - **Decision:** Use human-readable labels for better UX. Create utility function to map enum to label.

6. **Default Filters:** What should be the default filter state? All activities, current month, or empty?

    - **Decision:** Default to all activities (no filters) for maximum visibility. Users can filter as needed.

7. **Page Size Options:** Should users be able to change page size (10, 20, 50, 100) or fixed at 20?

    - **Decision:** Fixed at 20 for MVP. Can add page size selector later if needed.

8. **Sorting:** Should users be able to sort by other columns (type, amount, quantity) or only date descending?

    - **Decision:** Date descending only for MVP. Can add sorting later if needed.

9. **"Add Activity" Route:** Should `/dashboard/activities/new` be implemented in this ticket or separate ticket?

    - **Decision:** Create placeholder route in this ticket (redirects to dashboard or shows "Coming soon"). Full implementation in separate ticket.

10. **Activity Editing:** Should users be able to edit activities from this page?
    - **Decision:** No, editing is out of scope for this ticket. Separate feature ticket if needed.

## MVP Cut List

If time is limited, the following can be deferred:

1. **Custom DateInput Component:** Use native HTML5 date inputs instead
2. **Product Name Lookup:** Display productId instead of product name initially
3. **Activity Type Labels:** Display enum values instead of human-readable labels
4. **Pagination Controls:** Simple Previous/Next buttons only (no page numbers)
5. **Reset Filters Button:** Users can manually clear filters
6. **Empty State Styling:** Basic "No activities found" message
7. **Loading State Styling:** Basic loading message (no skeleton)
8. **Error State Styling:** Basic error message (no retry button)

**Core MVP must include:**

-   Filtering by date range, type, and product
-   Pagination (at least Previous/Next)
-   Table display with activities
-   "Add Activity" button (can be placeholder route)
-   Basic accessibility compliance
