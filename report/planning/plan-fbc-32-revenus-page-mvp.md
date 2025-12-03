---
Generated: 2025-01-27 21:15:00
Report Type: planning
Command: pm-plan-from-ticket
Ticket: FBC-32
---

# Implementation Plan: FBC-32 - Create Revenus page - MVP with basic revenue table

## Summary

Create a new `/dashboard/revenus` page displaying a financial breakdown table showing revenue (CA from SALE activities), material costs (unitCost \* quantity sold), and gross margin for a selected period. The page includes a period selector (Month/Quarter/Year/Custom) defaulting to current month, with proper currency and percentage formatting.

**Key constraints:**

-   MVP version only (no expandable rows, product breakdown, or period comparison)
-   Default period: current month
-   Material costs calculated from actual sales transactions (unitCost \* abs(quantity))
-   Must follow Clean Architecture: Domain → Usecases → Infrastructure → Presentation
-   Date range filtering already supported in ActivityRepository

## Solution Outline

**Layers impacted:**

-   **Domain Layer** (`core/domain/revenue.ts`): Create `RevenueData` and `RevenuePeriod` types with JSDoc
-   **Usecases Layer** (`core/usecases/revenue.ts`): Create `computeRevenue` function using existing date filtering patterns
-   **Infrastructure Layer**: No changes needed (date filtering already exists)
-   **Presentation Layer**:
    -   `presentation/hooks/useRevenue.ts`: React Query hook for revenue data
    -   `presentation/components/revenueTable/`: PeriodSelector and RevenueTable components
    -   `app/dashboard/revenus/page.tsx`: Main page integration
    -   Navigation and translations updates

**Reusable patterns:**

-   Leverage existing `computeTotalSales` pattern for revenue calculation
-   Use existing `ActivityFilters` date range pattern for PeriodSelector
-   Use existing `formatCurrency` utility for currency formatting
-   Follow existing component structure (Card, Table patterns)

## Sub-Tickets

### 32.1 - Create Revenue Domain Types

-   **AC:**
    -   [x] `RevenueData` type created in `core/domain/revenue.ts` with fields: period, startDate, endDate, totalRevenue, materialCosts, grossMargin, grossMarginRate
    -   [x] `RevenuePeriod` enum created (MONTH, QUARTER, YEAR, CUSTOM)
    -   [x] JSDoc documentation added explaining business meaning
-   **DoD:**
    -   [x] Domain types created with proper TypeScript types
    -   [x] JSDoc documentation complete
    -   [x] No external dependencies imported
-   **Effort:** 1h | **Deps:** none

### 32.2 - Create Revenue Calculation Usecase

-   **AC:**
    -   [x] `computeRevenue` usecase created in `core/usecases/revenue.ts`
    -   [x] Calculates total revenue from SALE activities (sum of `amount` field)
    -   [x] Calculates material costs (sum of `unitCost * abs(quantity)` for all sales)
    -   [x] Calculates gross margin (revenue - material costs)
    -   [x] Calculates gross margin rate (gross margin / revenue \* 100, handle division by zero)
    -   [x] Supports date range filtering (startDate, endDate parameters)
-   **DoD:**
    -   [x] Usecase accepts ActivityRepository and ProductRepository as parameters
    -   [x] Date range filtering implemented using existing patterns
    -   [x] Handles edge cases (no sales, zero revenue, missing products)
    -   [x] Unit tests created in `__tests__/core/usecases/revenue.test.ts`
    -   [x] Tests cover all calculation paths and edge cases
-   **Effort:** 4h | **Deps:** 32.1

### 32.3 - Create Period Selector Component

-   **AC:**
    -   [x] `PeriodSelector` component created in `presentation/components/revenueTable/PeriodSelector.tsx`
    -   [x] Supports 4 period types: Month, Quarter, Year, Custom
    -   [x] Default selection: Current month (first day 00:00:00 to last day 23:59:59)
    -   [x] Custom option shows start date and end date inputs
    -   [x] Date validation (startDate <= endDate)
    -   [x] Emits period change events (startDate, endDate ISO 8601 strings)
-   **DoD:**
    -   [x] Component uses SCSS variables from `styles/variables/*`
    -   [x] Component is accessible (ARIA labels, semantic HTML)
    -   [x] Component uses `DateInput` from UI components
    -   [x] Period calculation utilities created (current month, quarter, year)
    -   [x] SCSS module created with proper styling
-   **Effort:** 3h | **Deps:** 32.1

### 32.4 - Create Revenue Table Component

-   **AC:**
    -   [x] `RevenueTable` component created in `presentation/components/revenueTable/RevenueTable.tsx`
    -   [x] Displays 3 sections: Revenue (Total CA), Costs (Material costs), Gross Margin (amount + rate)
    -   [x] Uses `formatCurrency` for currency formatting (€ symbol, 2 decimals)
    -   [x] Uses percentage formatting for margin rate (1 decimal, % symbol)
    -   [x] Handles loading and error states
    -   [x] Displays empty state when no data
-   **DoD:**
    -   [x] Component uses SCSS variables from `styles/variables/*`
    -   [x] Component is accessible (proper ARIA labels, semantic HTML table structure)
    -   [x] Component uses Card from UI components for layout
    -   [x] SCSS module created with proper styling
    -   [x] Currency and percentage formatting tested
-   **Effort:** 3h | **Deps:** 32.1

### 32.5 - Create React Query Hook for Revenue

-   **AC:**
    -   [x] `useRevenue` hook created in `presentation/hooks/useRevenue.ts`
    -   [x] Hook accepts startDate and endDate parameters
    -   [x] Hook calls `computeRevenue` usecase with repositories
    -   [x] Hook provides `data`, `isLoading`, `error` states
    -   [x] Hook uses stable queryKey: `["revenue", startDate, endDate]`
    -   [x] Hook conditionally fetches (enabled when dates are valid)
-   **DoD:**
    -   [x] Hook follows existing React Query patterns
    -   [x] Hook uses proper TypeScript types
    -   [x] Query invalidation strategy considered
-   **Effort:** 2h | **Deps:** 32.2

### 32.6 - Create Page and Navigation Integration

-   **AC:**
    -   [x] New route `/dashboard/revenus/page.tsx` created
    -   [x] Page integrates PeriodSelector and RevenueTable components
    -   [x] Page uses `useRevenue` hook with period state
    -   [x] Page handles loading and error states
    -   [x] Navigation updated in `DashboardNavbar.tsx` with "Revenus" tab
    -   [x] Translation keys added to `fr.json` under `dashboard.navbar.revenues` and `pages.revenue.*`
-   **DoD:**
    -   [x] Page uses SCSS variables from `styles/variables/*`
    -   [x] Page is accessible (proper ARIA labels, semantic HTML)
    -   [x] Navigation displays correctly with new tab
    -   [x] All translations added and working
    -   [x] Default period (current month) works correctly
    -   [x] Page SCSS module created with proper styling
-   **Effort:** 2h | **Deps:** 32.3, 32.4, 32.5

## Unit Test Spec

**File:** `__tests__/core/usecases/revenue.test.ts`

**Key test names:**

1. `computeRevenue - should calculate revenue from SALE activities for date range`
2. `computeRevenue - should calculate material costs as sum of unitCost * abs(quantity)`
3. `computeRevenue - should calculate gross margin correctly (revenue - costs)`
4. `computeRevenue - should calculate gross margin rate correctly (percentage)`
5. `computeRevenue - should handle zero revenue (avoid division by zero)`
6. `computeRevenue - should handle empty sales (return zero values)`
7. `computeRevenue - should filter activities by date range correctly`
8. `computeRevenue - should handle missing products gracefully (skip sales)`

**Status:** tests: proposed

## Agent Prompts

### Unit Test Coach

Generate unit test spec for `computeRevenue` usecase in `core/usecases/revenue.ts`. Test all calculation paths: revenue sum, material costs calculation, gross margin, margin rate (including division by zero), date filtering, and edge cases (empty sales, missing products).

### Architecture-Aware Dev

Implement FBC-32 following sub-tickets 32.1 → 32.2 → 32.3 → 32.4 → 32.5 → 32.6 in order. Use existing patterns: `computeTotalSales` for revenue calculation, `ActivityFilters` for period selector, `formatCurrency` for formatting. Ensure Clean Architecture compliance and proper error handling.

### UI Designer

Create PeriodSelector and RevenueTable components following existing UI component patterns. Use Card, DateInput, and Table components from `presentation/components/ui/`. Ensure WCAG 2.1 AA accessibility compliance with proper ARIA labels and semantic HTML.

### QA & Test Coach

Create test plan for revenue page MVP. Verify: period selector defaults to current month, custom date range works, calculations are accurate, currency/percentage formatting correct, navigation works, page is accessible with screen reader, keyboard navigation works.

## Open Questions

1. **Period calculation boundaries**: For Quarter/Year periods, should we use calendar boundaries (Jan-Mar for Q1) or rolling periods (last 3/12 months)? **Decision needed:** Use calendar boundaries (consistent with existing statistics patterns).

2. **Empty state messaging**: What message should display when no sales exist for the selected period? **Decision needed:** Show zero values with explanatory text.

3. **Date range validation**: Should we prevent selecting future dates or dates before first activity? **Decision needed:** Allow any date range, validate startDate <= endDate only.

## MVP Cut List

If scope needs to be reduced, the following can be deferred:

-   Custom date range (keep only Month/Quarter/Year presets) → **Keep for MVP** (specified requirement)
-   Material costs breakdown by product → **Defer to FBC-33** (already planned)
-   Period comparison (previous period) → **Defer to FBC-34** (already planned)
-   Export functionality → **Defer** (not in scope)
-   Print-friendly view → **Defer** (not in scope)
