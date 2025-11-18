---
Generated: 2025-01-27 14:30:22
Report Type: planning
Command: pm-plan-from-ticket
Ticket: FBC-12
---

## Summary

**Goal:** Create Dashboard Overview page with four MVP widgets displaying key business metrics: total sales for the month, profit for the month, low stock products, and recent activities.

**User value:** Users can quickly assess business performance at a glance without navigating to separate pages.

**Constraints:**

-   Strict Clean Architecture: UI → Hooks → Usecases → Repositories
-   No direct Supabase calls from UI
-   Reusable UI components from design system only
-   All styles use SCSS variables from `styles/variables/*`
-   Accessibility compliance (WCAG 2.1 AA)
-   Performance: memoization, stable query keys, proper React Query configuration
-   TypeScript strict mode

**Non-goals:**

-   Advanced filtering or date range selection (hardcoded to current month)
-   Widget customization or drag-and-drop
-   Real-time updates (polling/websockets)
-   Export functionality
-   Detailed drill-down views

## Assumptions & Risks

**Assumptions:**

-   `computeProfit` usecase exists and supports date range filtering (verified: exists in `src/core/usecases/activity.ts`)
-   Products have a `stock` field that can be compared to a threshold
-   Activities are stored with ISO 8601 date strings
-   Current month calculation uses browser/system timezone
-   Low stock threshold can be hardcoded initially (e.g., stock < 5)

**Risks:**

-   Missing `computeTotalSales` usecase (needs to be created)
-   Missing `listLowStockProducts` usecase (needs to be created)
-   Missing `listRecentActivities` usecase (needs to be created)
-   Card component doesn't exist (needs to be created)
-   Performance issues with large datasets (mitigation: memoization, React Query selectors)
-   Date/timezone handling complexity for "current month" calculation
-   Low stock threshold definition (business rule needed)

## Solution Outline (aligned with architecture)

**Domain Layer (`core/domain/`):**

-   No new domain types needed (Product, Activity already exist)
-   May need to define low stock threshold constant or business rule

**Usecases Layer (`core/usecases/`):**

-   `computeTotalSales`: Calculate total sales amount from SALE activities for a date range
-   `listLowStockProducts`: Filter products with stock below threshold (uses existing `listProducts` + domain rule)
-   `listRecentActivities`: Get recent activities sorted by date (limit to N most recent)
-   `computeProfit`: Already exists, will be reused with date range

**Infrastructure Layer (`infrastructure/supabase/`):**

-   No changes needed (existing repositories sufficient)

**Presentation Layer:**

-   **Hooks (`presentation/hooks/`):**
    -   `useMonthlySales`: React Query hook calling `computeTotalSales` for current month
    -   `useMonthlyProfit`: React Query hook calling `computeProfit` for current month
    -   `useLowStockProducts`: React Query hook calling `listLowStockProducts`
    -   `useRecentActivities`: React Query hook calling `listRecentActivities`
-   **UI Components (`presentation/components/ui/`):**
    -   `Card.tsx`: Reusable card component for widgets (new)
-   **Page Components (`presentation/components/dashboardOverview/`):**
    -   `SalesWidget.tsx`: Widget displaying monthly sales
    -   `ProfitWidget.tsx`: Widget displaying monthly profit
    -   `LowStockWidget.tsx`: Widget displaying low stock products list
    -   `RecentActivitiesWidget.tsx`: Widget displaying recent activities list
-   **Page (`app/dashboard/page.tsx`):**
    -   Update to display four widgets in a grid layout

**Shared Layer (`shared/`):**

-   May need date utility functions for "current month" calculation

## Sub-Tickets

### Sub-Ticket 12.1

**Title:** Create `computeTotalSales` usecase

**Rationale:**
Dashboard needs to display total sales amount for the current month. This usecase calculates the sum of all SALE activity amounts within a date range.

**Acceptance Criteria:**

-   [x] Usecase `computeTotalSales` in `src/core/usecases/activity.ts`
-   [x] Accepts `ActivityRepository`, optional `startDate`, optional `endDate` (ISO 8601 strings)
-   [x] Filters activities to SALE type only
-   [x] Filters by date range if provided
-   [x] Sums `amount` field from all matching SALE activities
-   [x] Returns `Promise<number>` (total sales amount)
-   [x] Validates date parameters (ISO 8601 format)
-   [x] Returns 0 if no SALE activities found
-   [x] JSDoc documentation with examples
-   [x] Unit tests in `__tests__/core/usecases/activity.test.ts`

**Definition of Done:**

-   [x] Usecase implemented and tested
-   [x] All tests passing
-   [x] TypeScript compilation succeeds
-   [x] No linting errors
-   [x] JSDoc documentation complete
-   [x] Follows existing usecase patterns (similar to `computeProfit`)

**Estimated Effort:** 3h

**Dependencies:** None

**Owner:** Backend Developer

**Risk Notes:** Date range validation must match `computeProfit` pattern for consistency.

---

### Sub-Ticket 12.2

**Title:** Create `listLowStockProducts` usecase

**Rationale:**
Dashboard needs to identify products with low stock levels. This usecase filters products based on a stock threshold (business rule).

**Acceptance Criteria:**

-   [x] Usecase `listLowStockProducts` in `src/core/usecases/product.ts` (or new file if needed)
-   [x] Accepts `ProductRepository` and optional `threshold` parameter (default: 5)
-   [x] Retrieves all products via repository
-   [x] Filters products where `stock < threshold`
-   [x] Returns `Promise<Product[]>` (array of low stock products)
-   [x] Returns empty array if no products below threshold
-   [x] JSDoc documentation with examples
-   [x] Unit tests in `__tests__/core/usecases/product.test.ts` (or new test file)

**Definition of Done:**

-   [x] Usecase implemented and tested
-   [x] All tests passing
-   [x] TypeScript compilation succeeds
-   [x] No linting errors
-   [x] JSDoc documentation complete
-   [x] Follows Clean Architecture (no infrastructure dependencies)

**Estimated Effort:** 2h

**Dependencies:** None

**Owner:** Backend Developer

**Risk Notes:** Threshold value is a business rule - may need stakeholder confirmation. Consider making it configurable in future.

---

### Sub-Ticket 12.3

**Title:** Create `listRecentActivities` usecase

**Rationale:**
Dashboard needs to display recent activities for quick visibility. This usecase retrieves the most recent activities sorted by date.

**Acceptance Criteria:**

-   [x] Usecase `listRecentActivities` in `src/core/usecases/activity.ts`
-   [x] Accepts `ActivityRepository` and optional `limit` parameter (default: 10)
-   [x] Retrieves all activities via repository
-   [x] Sorts activities by `date` descending (most recent first)
-   [x] Limits results to `limit` count
-   [x] Returns `Promise<Activity[]>` (array of recent activities)
-   [x] Returns empty array if no activities exist
-   [x] JSDoc documentation with examples
-   [x] Unit tests in `__tests__/core/usecases/activity.test.ts`

**Definition of Done:**

-   [x] Usecase implemented and tested
-   [x] All tests passing
-   [x] TypeScript compilation succeeds
-   [x] No linting errors
-   [x] JSDoc documentation complete
-   [x] Follows existing usecase patterns

**Estimated Effort:** 2h

**Dependencies:** None

**Owner:** Backend Developer

**Risk Notes:** Sorting by ISO 8601 string works lexicographically, but ensure consistent date format.

---

### Sub-Ticket 12.4

**Title:** Create date utility functions for current month calculation

**Rationale:**
Dashboard widgets need to calculate "current month" date range (start and end) for filtering sales and profit data. Centralize this logic in shared utilities.

**Acceptance Criteria:**

-   [x] Utility functions in `src/shared/utils/date.ts` (create file if needed)
-   [x] `getCurrentMonthStart(): string` - Returns ISO 8601 string for first day of current month at 00:00:00
-   [x] `getCurrentMonthEnd(): string` - Returns ISO 8601 string for last day of current month at 23:59:59.999
-   [x] Functions use browser/system timezone
-   [x] Returns ISO 8601 format strings compatible with usecases
-   [x] JSDoc documentation
-   [x] Unit tests in `__tests__/shared/utils/date.test.ts`

**Definition of Done:**

-   [x] Utilities implemented and tested
-   [x] All tests passing
-   [x] TypeScript compilation succeeds
-   [x] No linting errors
-   [x] JSDoc documentation complete
-   [x] Timezone handling verified

**Estimated Effort:** 2h

**Dependencies:** None

**Owner:** Frontend Developer

**Risk Notes:** Timezone handling can be tricky - ensure consistent behavior across environments.

---

### Sub-Ticket 12.5

**Title:** Create `Card` reusable UI component

**Rationale:**
Dashboard widgets need a consistent card container. Create a reusable Card component following design system patterns.

**Acceptance Criteria:**

-   [x] Component `Card.tsx` in `src/presentation/components/ui/`
-   [x] Props: `children`, optional `title` (string), optional `className`
-   [x] Renders semantic container with proper styling
-   [x] SCSS in `src/styles/components/_card.scss`
-   [x] Uses only SCSS variables from `styles/variables/*`
-   [x] Memoized with `React.memo`
-   [x] Accessible structure (semantic HTML, proper heading if title provided)
-   [x] Unit tests in `__tests__/presentation/components/ui/Card.test.tsx`
-   [x] Follows component patterns (arrow function, export default, type for props)

**Definition of Done:**

-   [x] Component implemented and tested
-   [x] All tests passing
-   [x] TypeScript compilation succeeds
-   [x] No linting errors
-   [x] SCSS uses variables only (no hardcoded values)
-   [x] Accessibility verified
-   [x] Memoization applied

**Estimated Effort:** 3h

**Dependencies:** None

**Owner:** UI Developer

**Risk Notes:** Ensure Card styling aligns with design system tokens. May need token additions.

---

### Sub-Ticket 12.6

**Title:** Create React Query hooks for dashboard metrics

**Rationale:**
Dashboard page needs React Query hooks to fetch data via usecases. Hooks must be optimized with memoization, stable query keys, and proper configuration.

**Acceptance Criteria:**

-   [x] Hook `useMonthlySales` in `src/presentation/hooks/useDashboard.ts` (or separate file)
-   [x] Hook `useMonthlyProfit` in `src/presentation/hooks/useDashboard.ts`
-   [x] Hook `useLowStockProducts` in `src/presentation/hooks/useDashboard.ts`
-   [x] Hook `useRecentActivities` in `src/presentation/hooks/useDashboard.ts`
-   [x] All hooks call corresponding usecases (no direct infrastructure calls)
-   [x] All hooks use stable query keys from `queryKeys` factory
-   [x] All hooks configure `staleTime` appropriately (e.g., 5 minutes for metrics)
-   [x] `useMonthlySales` and `useMonthlyProfit` use date utilities for current month range
-   [x] Hooks return standard React Query shape: `{ data, isLoading, error }`
-   [x] Hooks use `select` option for data transformation if needed
-   [x] Query keys added to `src/presentation/hooks/queryKeys.ts`

**Definition of Done:**

-   [x] All hooks implemented
-   [x] TypeScript compilation succeeds
-   [x] No linting errors
-   [x] Query keys centralized and stable
-   [x] Performance optimizations applied (staleTime, select)
-   [x] Follows existing hook patterns (see `useAuth.ts`)

**Estimated Effort:** 4h

**Dependencies:** Sub-Tickets 12.1, 12.2, 12.3, 12.4

**Owner:** Frontend Developer

**Risk Notes:** Ensure query keys are stable to prevent unnecessary refetches. Date range calculation must be consistent.

---

### Sub-Ticket 12.7

**Title:** Create dashboard widget components

**Rationale:**
Dashboard needs four widget components to display metrics. Each widget is page-specific and uses hooks to fetch data.

**Acceptance Criteria:**

-   [x] Component `SalesWidget.tsx` in `src/presentation/components/dashboardOverview/`
-   [x] Component `ProfitWidget.tsx` in `src/presentation/components/dashboardOverview/`
-   [x] Component `LowStockWidget.tsx` in `src/presentation/components/dashboardOverview/`
-   [x] Component `RecentActivitiesWidget.tsx` in `src/presentation/components/dashboardOverview/`
-   [x] All widgets use corresponding React Query hooks
-   [x] All widgets use `Card` component for container
-   [x] All widgets display loading states
-   [x] All widgets display error states (graceful degradation)
-   [x] All widgets use `Heading`, `Text` from design system
-   [x] `LowStockWidget` displays list of products (name, stock level)
-   [x] `RecentActivitiesWidget` displays list of activities (date, type, amount)
-   [x] SCSS modules in component folders (e.g., `SalesWidget.module.scss`)
-   [x] All styles use SCSS variables only
-   [x] Accessible structure (headings, landmarks, ARIA labels)
-   [x] Memoized with `React.memo` where appropriate
-   [x] Follows component patterns (arrow function, export default, type for props)

**Definition of Done:**

-   [x] All widgets implemented
-   [x] TypeScript compilation succeeds
-   [x] No linting errors
-   [x] Loading and error states handled
-   [x] Accessibility verified
-   [x] SCSS uses variables only
-   [x] Memoization applied
-   [x] No business logic in components (only UI rendering)

**Estimated Effort:** 6h

**Dependencies:** Sub-Tickets 12.5, 12.6

**Owner:** Frontend Developer

**Risk Notes:** Widget styling must be consistent. Ensure proper handling of empty states (no data).

---

### Sub-Ticket 12.8

**Title:** Update dashboard page to display widgets

**Rationale:**
Dashboard page needs to render all four widgets in a grid layout. Page orchestrates widgets and provides overall structure.

**Acceptance Criteria:**

-   [x] Update `src/app/dashboard/page.tsx`
-   [x] Import and render all four widget components
-   [x] Create responsive grid layout (2x2 on desktop, 1 column on mobile)
-   [x] Use SCSS module for page styles (`page.module.scss` or update existing)
-   [x] All styles use SCSS variables only
-   [x] Accessible page structure (main landmark, heading hierarchy)
-   [x] Page title: "Dashboard" (h1)
-   [x] Proper semantic HTML structure
-   [x] No business logic in page (only composition)

**Definition of Done:**

-   [x] Page updated and functional
-   [x] TypeScript compilation succeeds
-   [x] No linting errors
-   [x] Responsive layout works (desktop and mobile)
-   [x] Accessibility verified
-   [x] SCSS uses variables only
-   [x] All widgets display correctly

**Estimated Effort:** 3h

**Dependencies:** Sub-Ticket 12.7

**Owner:** Frontend Developer

**Risk Notes:** Grid layout may need CSS Grid or Flexbox. Ensure responsive breakpoints are defined in variables.

---

## Unit Test Spec (Test-First Protocol)

### Domain/Usecases Tests

**Files:**

-   `__tests__/core/usecases/activity.test.ts` (extend existing)
-   `__tests__/core/usecases/product.test.ts` (create or extend)
-   `__tests__/shared/utils/date.test.ts` (create)

**Test Structure:**

#### `computeTotalSales` tests:

```typescript
describe("computeTotalSales", () => {
    it("should return 0 when no SALE activities exist");
    it("should sum amounts from all SALE activities");
    it("should filter by date range when provided");
    it("should exclude non-SALE activities");
    it("should validate date parameters (ISO 8601)");
    it("should handle empty activity list");
    it("should handle activities outside date range");
});
```

#### `listLowStockProducts` tests:

```typescript
describe("listLowStockProducts", () => {
    it("should return empty array when no products below threshold");
    it("should filter products with stock < threshold");
    it("should use default threshold of 5 if not provided");
    it("should use custom threshold when provided");
    it("should return all matching products");
    it("should handle empty product list");
});
```

#### `listRecentActivities` tests:

```typescript
describe("listRecentActivities", () => {
    it("should return empty array when no activities exist");
    it("should sort activities by date descending");
    it("should limit results to specified count");
    it("should use default limit of 10 if not provided");
    it("should return all activities if count exceeds available");
});
```

#### Date utility tests:

```typescript
describe("Date Utilities", () => {
    describe("getCurrentMonthStart", () => {
        it("should return first day of current month at 00:00:00");
        it("should return ISO 8601 format string");
        it("should handle month boundaries correctly");
    });
    describe("getCurrentMonthEnd", () => {
        it("should return last day of current month at 23:59:59.999");
        it("should return ISO 8601 format string");
        it("should handle different month lengths correctly");
    });
});
```

**Mocks:**

-   Use existing mocks from `__mocks__/core/ports/`
-   Mock repositories for usecase tests

**Coverage Target:** 100% for new usecases and utilities

**Status:** tests `proposed`

---

### Presentation Component Tests

**Files:**

-   `__tests__/presentation/components/ui/Card.test.tsx` (create)

**Test Structure:**

#### `Card` component tests:

```typescript
describe("Card", () => {
    it("should render children");
    it("should render title when provided");
    it("should not render title when not provided");
    it("should apply custom className");
    it("should use semantic HTML structure");
    it("should be accessible with proper heading when title provided");
});
```

**Mocks:**

-   No external dependencies to mock (pure UI component)

**Coverage Target:** 100% for Card component

**Status:** tests `proposed`

---

## Agent Prompts

### Unit Test Coach

```
Generate unit test specs for the following usecases and utilities:

1. `computeTotalSales` in `src/core/usecases/activity.ts`
   - Should sum SALE activity amounts
   - Should support date range filtering
   - Should validate ISO 8601 dates

2. `listLowStockProducts` in `src/core/usecases/product.ts`
   - Should filter products by stock threshold
   - Should support custom threshold (default: 5)

3. `listRecentActivities` in `src/core/usecases/activity.ts`
   - Should sort by date descending
   - Should support limit parameter (default: 10)

4. Date utilities in `src/shared/utils/date.ts`
   - `getCurrentMonthStart()` and `getCurrentMonthEnd()`
   - Should return ISO 8601 strings
   - Should handle timezone correctly

5. `Card` component in `src/presentation/components/ui/Card.tsx`
   - Should render children and optional title
   - Should be accessible

Follow existing test patterns in `__tests__/core/usecases/activity.test.ts`.
Use mocks from `__mocks__/core/ports/`.
Target 100% coverage for new code.
```

---

### Architecture-Aware Dev

```
Implement Dashboard Overview feature (FBC-12) following Clean Architecture:

1. Create usecases:
   - `computeTotalSales` in `src/core/usecases/activity.ts` (sum SALE amounts, date range support)
   - `listLowStockProducts` in `src/core/usecases/product.ts` (filter by stock threshold)
   - `listRecentActivities` in `src/core/usecases/activity.ts` (sort by date, limit results)

2. Create date utilities in `src/shared/utils/date.ts`:
   - `getCurrentMonthStart()` and `getCurrentMonthEnd()` (ISO 8601 strings)

3. Create React Query hooks in `src/presentation/hooks/useDashboard.ts`:
   - `useMonthlySales`, `useMonthlyProfit`, `useLowStockProducts`, `useRecentActivities`
   - Use stable query keys, configure staleTime, use select for optimization

4. Create `Card` component in `src/presentation/components/ui/Card.tsx`:
   - Reusable card container with optional title
   - SCSS in `src/styles/components/_card.scss`
   - Use variables only, memoized, accessible

5. Create widget components in `src/presentation/components/dashboardOverview/`:
   - `SalesWidget.tsx`, `ProfitWidget.tsx`, `LowStockWidget.tsx`, `RecentActivitiesWidget.tsx`
   - Each uses corresponding hook, Card component, handles loading/error states
   - SCSS modules, variables only, accessible, memoized

6. Update `src/app/dashboard/page.tsx`:
   - Render all widgets in responsive grid (2x2 desktop, 1 column mobile)
   - Use SCSS module, variables only, accessible structure

CRITICAL RULES:
- No business logic in components
- No direct Supabase calls from UI
- All styles use SCSS variables
- Memoization for performance
- Accessibility compliance (WCAG 2.1 AA)
- TypeScript strict mode
- Follow existing patterns (see `useAuth.ts`, `Button.tsx`)

Reference: Sub-Tickets 12.1-12.8 in planning document.
```

---

### UI Designer

```
Design and implement UI components for Dashboard Overview (FBC-12):

1. Create `Card` component (`src/presentation/components/ui/Card.tsx`):
   - Reusable card container
   - Optional title prop
   - SCSS in `src/styles/components/_card.scss`
   - Use variables from `styles/variables/*` only
   - Accessible structure (semantic HTML, proper headings)

2. Create widget components in `src/presentation/components/dashboardOverview/`:
   - `SalesWidget.tsx`: Display monthly sales amount (currency format)
   - `ProfitWidget.tsx`: Display monthly profit amount (currency format)
   - `LowStockWidget.tsx`: Display list of low stock products (name, stock level)
   - `RecentActivitiesWidget.tsx`: Display list of recent activities (date, type, amount)
   - Each uses Card component, handles loading/error states
   - SCSS modules in component folders
   - Use variables only, no hardcoded values

3. Update dashboard page layout:
   - Responsive grid: 2x2 on desktop, 1 column on mobile
   - Proper spacing using variables
   - Accessible structure

REQUIREMENTS:
- All styles use SCSS variables from `styles/variables/*`
- No inline styles, no hardcoded values
- Accessibility: proper headings, landmarks, ARIA labels
- Memoization: React.memo, useCallback, useMemo where appropriate
- Responsive design (mobile-first)
- Loading and error states styled consistently

Check existing variables in `styles/variables/*` and add missing ones if needed.
```

---

### QA & Test Coach

```
Create test plan for Dashboard Overview feature (FBC-12):

1. Unit Tests:
   - Verify usecases: `computeTotalSales`, `listLowStockProducts`, `listRecentActivities`
   - Verify date utilities: `getCurrentMonthStart`, `getCurrentMonthEnd`
   - Verify Card component rendering and accessibility

2. Integration Tests:
   - Verify hooks fetch data correctly via usecases
   - Verify widgets display data from hooks
   - Verify dashboard page renders all widgets

3. Accessibility Tests:
   - Verify WCAG 2.1 AA compliance
   - Screen reader testing (widgets, page structure)
   - Keyboard navigation
   - Focus management
   - ARIA labels and roles

4. Performance Tests:
   - Verify memoization prevents unnecessary re-renders
   - Verify React Query caching works (staleTime)
   - Verify query keys are stable
   - Verify no memory leaks

5. Visual Tests:
   - Verify responsive layout (desktop 2x2, mobile 1 column)
   - Verify loading states display correctly
   - Verify error states display correctly
   - Verify empty states display correctly

6. Edge Cases:
   - No data scenarios (empty lists, zero values)
   - Network errors
   - Invalid date ranges
   - Large datasets (performance)

Use existing test patterns and tools.
Focus on accessibility and performance.
```

---

### Architecture Guardian

```
Verify Clean Architecture compliance for Dashboard Overview feature (FBC-12):

1. Layer Separation:
   - Verify no Supabase calls in UI components
   - Verify hooks call usecases, not repositories directly
   - Verify usecases use repository ports (interfaces)
   - Verify no business logic in components

2. Import Rules:
   - Verify domain types imported correctly
   - Verify no React/Next.js imports in core/
   - Verify no infrastructure imports in presentation (except via hooks)
   - Verify proper dependency direction

3. File Organization:
   - Verify usecases in `core/usecases/`
   - Verify hooks in `presentation/hooks/`
   - Verify reusable components in `presentation/components/ui/`
   - Verify page-specific components in `presentation/components/dashboardOverview/`

4. Code Conventions:
   - Verify TypeScript strict mode
   - Verify no `any` types
   - Verify SCSS variables used (no hardcoded values)
   - Verify accessibility utilities from `shared/a11y/`
   - Verify component patterns (arrow functions, export default)

5. Performance:
   - Verify memoization applied (React.memo, useCallback, useMemo)
   - Verify React Query optimization (staleTime, select, stable keys)
   - Verify no unnecessary re-renders

6. Testing:
   - Verify unit tests for usecases
   - Verify component tests for reusable UI components
   - Verify no tests for page components (forbidden)

Check against architecture rules in `.cursor/rules/`.
Report any violations.
```

---

## Open Questions

1. **Low Stock Threshold:** What is the business rule for "low stock"? Should it be configurable or hardcoded? (Assumption: default to 5, can be made configurable later)

2. **Date Range:** Should "current month" use browser timezone or UTC? (Assumption: browser timezone for user-friendliness)

3. **Widget Limits:** How many recent activities should be displayed? (Assumption: 10, can be made configurable later)

4. **Currency Formatting:** What currency format should be used for sales and profit? (Assumption: EUR with 2 decimal places, e.g., "€1,234.56")

5. **Empty States:** What should widgets display when there's no data? (Assumption: "No data available" message)

6. **Error Handling:** How should errors be displayed to users? (Assumption: Error message in widget, graceful degradation)

7. **Refresh Strategy:** Should widgets auto-refresh or only on page load? (Assumption: React Query default behavior with staleTime, manual refresh on page navigation)

## MVP Cut List

If time is limited, the following can be deferred:

-   **Widget Customization:** Drag-and-drop, show/hide widgets (not in scope anyway)
-   **Date Range Selection:** Keep hardcoded to current month (can add date picker later)
-   **Export Functionality:** Not in scope for MVP
-   **Real-time Updates:** Polling/websockets (can add later if needed)
-   **Detailed Drill-downs:** Clicking widgets to see details (can add later)
-   **Configurable Thresholds:** Low stock threshold hardcoded initially (can make configurable later)
-   **Advanced Filtering:** Keep simple for MVP (can add filters later)

## Implementation Order

Recommended implementation order for optimal parallelization:

1. **Phase 1 (Backend):** Sub-Tickets 12.1, 12.2, 12.3 (usecases) - can be done in parallel
2. **Phase 2 (Shared):** Sub-Ticket 12.4 (date utilities) - can be done in parallel with Phase 1
3. **Phase 3 (Frontend - UI):** Sub-Ticket 12.5 (Card component) - can be done in parallel with Phase 1-2
4. **Phase 4 (Frontend - Hooks):** Sub-Ticket 12.6 (React Query hooks) - depends on Phase 1-2
5. **Phase 5 (Frontend - Widgets):** Sub-Ticket 12.7 (widget components) - depends on Phase 3-4
6. **Phase 6 (Frontend - Page):** Sub-Ticket 12.8 (dashboard page) - depends on Phase 5

**Total Estimated Effort:** ~25 hours (3+2+2+2+3+4+6+3)
