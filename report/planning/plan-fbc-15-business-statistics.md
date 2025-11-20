---
Generated: 2025-01-27 21:45:00
Report Type: planning
Command: pm-plan-from-ticket
Ticket: FBC-15
---

# Implementation Plan: Business Analytics Statistics (FBC-15)

## Summary

**Goal:** Provide usecases and hooks to compute business statistics (profits by period, total creations, total sales, margins by product) with proper caching and type safety.

**User Value:**

-   Enables business owners to understand performance over time
-   Provides key metrics for decision-making (profits, sales, creations)
-   Shows product-level profitability analysis (margins)
-   Supports different time periods (daily, monthly, yearly)

**Constraints:**

-   Must follow Clean Architecture principles (strict layer separation)
-   Usecases must compute stats from activities/products without UI logic
-   Hooks must expose data with proper caching (`staleTime`) and `select`
-   Types must be explicitly defined; no `any`
-   Period filters and aggregation must be efficient
-   Avoid recomputation via memoization and stable keys

**Non-Goals:**

-   UI components for displaying statistics (deferred to future ticket)
-   Real-time statistics updates (batch computation is sufficient)
-   Export functionality for statistics data
-   Advanced analytics (charts, trends, forecasting)

## Assumptions & Risks

### Assumptions

1. **Data availability:** Assumes activities and products data are available and properly structured
2. **Performance:** Assumes in-memory aggregation is sufficient for current dataset size (< 10,000 activities)
3. **Date formats:** Assumes all activity dates are in ISO 8601 format
4. **Product integrity:** Assumes products referenced in activities exist (or can be filtered out)

### Risks

1. **Performance degradation:** Aggregating large datasets in memory may be slow
    - **Mitigation:** Optimize aggregation logic; consider database-level aggregation if needed
2. **Invalid date ranges:** Users may provide invalid or mismatched date ranges
    - **Mitigation:** Validate date inputs in usecases; provide clear error messages
3. **Missing products:** Activities may reference deleted products
    - **Mitigation:** Filter out activities with missing products gracefully
4. **Cache invalidation:** Statistics may become stale when activities/products change
    - **Mitigation:** Use appropriate `staleTime`; invalidate cache on mutations

## Solution Outline (Aligned with Architecture)

The solution follows Clean Architecture layers with strict separation:

1. **Domain Layer:**

    - Create `StatisticsPeriod` enum (DAILY, MONTHLY, YEARLY)
    - Create `PeriodStatistics` type for period-grouped stats
    - Create `ProductMargin` type for product-level margin analysis
    - Create `BusinessStatistics` type for comprehensive statistics

2. **Usecases Layer:**

    - `computeProfitsByPeriod`: Calculate profits grouped by period (daily/monthly/yearly)
    - `computeTotalCreations`: Count CREATION activities for a date range
    - `computeTotalSales`: Reuse existing `computeTotalSales` from activity usecases
    - `computeProductMargins`: Calculate profit margins by product
    - `computeBusinessStatistics`: Comprehensive statistics aggregator

3. **Presentation Layer:**

    - Create React Query hooks in `presentation/hooks/useStatistics.ts`
    - Add query keys to `presentation/hooks/queryKeys.ts`
    - Configure appropriate `staleTime` for caching (5-10 minutes)
    - Use `select` option to transform data only when needed

4. **Testing:**
    - Unit tests for aggregation logic in `__tests__/core/usecases/statistics.test.ts`
    - Test edge cases (empty data, invalid dates, missing products)

**Data Flow:**

```
UI Component
  ↓
useStatistics hooks
  ↓
computeStatistics usecases
  ↓
ActivityRepository + ProductRepository
  ↓
Supabase (activities + products tables)
```

## Sub-Tickets

### Sub-Ticket 15.1

**Title:** Create domain types for statistics

**Rationale:**
Domain types must be defined first to establish the data structures for statistics computation. These types are used throughout all layers to maintain type safety.

**Acceptance Criteria:**

-   [x] Create `src/core/domain/statistics.ts` with:
    -   `StatisticsPeriod` enum: DAILY, MONTHLY, YEARLY
    -   `PeriodStatistics` type: `{ period: string; profit: number; totalSales: number; totalCreations: number }`
    -   `ProductMargin` type: `{ productId: ProductId; salesCount: number; totalRevenue: number; totalCost: number; profit: number; marginPercentage: number }`
    -   `BusinessStatistics` type: `{ startDate?: string; endDate?: string; totalProfit: number; totalSales: number; totalCreations: number; productMargins: ProductMargin[] }`
-   [x] All types use domain types (`ProductId` from `product.ts`)
-   [x] JSDoc documentation for all types explaining business meaning
-   [x] No external dependencies (pure TypeScript)

**Definition of Done:**

-   [x] Types defined with proper JSDoc
-   [x] No TypeScript errors
-   [x] Types exported and importable from domain layer
-   [x] No linting errors

**Estimated Effort:** 1h

**Dependencies:** None

**Owner:** Backend Developer

**Risk Notes:** Type design must support all required statistics; margin calculation formula must be correct.

---

### Sub-Ticket 15.2

**Title:** Create usecases for computing statistics

**Rationale:**
Usecases orchestrate business logic for statistics computation. They aggregate data from activities and products without UI logic, following Clean Architecture principles.

**Acceptance Criteria:**

-   [x] Create `src/core/usecases/statistics.ts` with:
    -   `computeProfitsByPeriod`: Groups profits by period (DAILY/MONTHLY/YEARLY) with date range filtering
    -   `computeTotalCreations`: Counts CREATION activities for a date range
    -   `computeProductMargins`: Calculates profit margins by product (sales count, revenue, cost, profit, margin percentage)
    -   `computeBusinessStatistics`: Comprehensive aggregator combining all statistics
-   [x] All usecases accept repositories as parameters (dependency injection)
-   [x] Date range validation using `isValidISO8601` from `validation.ts`
-   [x] Handle edge cases: empty data, missing products, invalid dates
-   [x] Profit calculation: `(salePrice - unitCost) * quantitySold`
-   [x] Margin calculation: `(profit / totalRevenue) * 100` with zero-division protection
-   [x] Period grouping: DAILY (YYYY-MM-DD), MONTHLY (YYYY-MM), YEARLY (YYYY)
-   [x] Results sorted appropriately (period ascending, profit descending for margins)

**Definition of Done:**

-   [x] All usecases implemented with JSDoc
-   [x] No TypeScript errors
-   [x] No linting errors
-   [x] Error handling for invalid inputs
-   [x] Edge cases handled gracefully

**Estimated Effort:** 4h

**Dependencies:** Sub-Ticket 15.1 (domain types)

**Owner:** Backend Developer

**Risk Notes:** Aggregation logic must be efficient; date parsing must handle ISO 8601 correctly; product lookup must be optimized.

---

### Sub-Ticket 15.3

**Title:** Create React Query hooks with proper caching

**Rationale:**
Hooks expose statistics data to UI components with proper caching and memoization. React Query handles refetching and cache invalidation automatically.

**Acceptance Criteria:**

-   [x] Create `src/presentation/hooks/useStatistics.ts` with:
    -   `useProfitsByPeriod(period, startDate?, endDate?)`: Hook for period-grouped profits
    -   `useTotalCreations(startDate?, endDate?)`: Hook for total creations count
    -   `useProductMargins(startDate?, endDate?)`: Hook for product margins
    -   `useBusinessStatistics(startDate?, endDate?)`: Hook for comprehensive statistics
-   [x] Add statistics query keys to `src/presentation/hooks/queryKeys.ts`:
    -   `statistics.profitsByPeriod(period, startDate?, endDate?)`
    -   `statistics.totalCreations(startDate?, endDate?)`
    -   `statistics.productMargins(startDate?, endDate?)`
    -   `statistics.businessStatistics(startDate?, endDate?)`
-   [x] Configure `staleTime: 5 * 60 * 1000` (5 minutes) for all statistics queries
-   [x] Use `select` option to transform data only when needed
-   [x] Use `useMemo` for stable query keys and query functions
-   [x] Hooks return: `{ data, isLoading, error }` from React Query
-   [x] Hooks call usecases (not repositories directly)

**Definition of Done:**

-   [x] All hooks implemented with proper caching
-   [x] Query keys stable and memoized
-   [x] No TypeScript errors
-   [x] No linting errors
-   [x] Hooks follow existing hook patterns from `useActivities.ts`

**Estimated Effort:** 2h

**Dependencies:** Sub-Ticket 15.2 (usecases)

**Owner:** Frontend Developer

**Risk Notes:** Cache invalidation must be handled on activity mutations; query keys must be stable to prevent unnecessary refetches.

---

### Sub-Ticket 15.4

**Title:** Write unit tests for aggregation logic with edge cases

**Rationale:**
Unit tests ensure statistics computation is correct and handles edge cases properly. Tests cover aggregation logic, date filtering, period grouping, and error handling.

**Acceptance Criteria:**

-   [x] Create `__tests__/core/usecases/statistics.test.ts` with:
    -   Tests for `computeProfitsByPeriod`:
        -   Daily/monthly/yearly grouping
        -   Date range filtering
        -   Empty results
        -   Missing products (filtered out gracefully)
    -   Tests for `computeTotalCreations`:
        -   Counts CREATION activities correctly
        -   Date range filtering
        -   Empty results
    -   Tests for `computeProductMargins`:
        -   Margin calculation correct
        -   Zero-division protection (when revenue is 0)
        -   Sorting by profit descending
        -   Multiple products
    -   Tests for `computeBusinessStatistics`:
        -   Comprehensive statistics aggregation
        -   All fields populated correctly
        -   Product margins sorted correctly
-   [x] Mock `ActivityRepository` and `ProductRepository` using Jest mocks
-   [x] Test edge cases:
    -   Empty activity list
    -   Empty product list
    -   Invalid date ranges
    -   Activities with missing products
    -   Products with zero revenue (margin calculation)
-   [x] Use existing mock structure from `__mocks__/core/ports/*`

**Definition of Done:**

-   [x] All usecases have unit tests
-   [x] Edge cases covered
-   [x] Tests pass
-   [x] Test coverage > 80% for statistics usecases (90.9% statements, 82.14% branches, 95.45% functions)
-   [x] No linting errors

**Estimated Effort:** 3h

**Dependencies:** Sub-Ticket 15.2 (usecases)

**Owner:** Backend Developer

**Risk Notes:** Mock setup must match repository interfaces; edge cases must be realistic.

---

## Implementation Order

1. **Sub-Ticket 15.1** (Domain types) - Foundation for all other work
2. **Sub-Ticket 15.2** (Usecases) - Core business logic
3. **Sub-Ticket 15.3** (Hooks) - Presentation layer integration
4. **Sub-Ticket 15.4** (Tests) - Can be done in parallel with 15.3, but requires 15.2

## Testing Strategy

-   **Unit tests:** Usecases layer with mocked repositories
-   **Integration tests:** Not required for this ticket (infrastructure layer already tested)
-   **UI tests:** Not required for this ticket (hooks tested via usecases)

## Performance Considerations

-   Statistics queries use 5-minute stale time to reduce recomputation
-   Aggregation done in-memory (assumes < 10,000 activities)
-   Product lookup uses Map for O(1) access
-   Query keys memoized to prevent unnecessary refetches
-   Consider database-level aggregation if performance becomes an issue

## Future Enhancements (Out of Scope)

-   Real-time statistics updates (WebSocket/SSE)
-   Cached statistics in database (materialized views)
-   Advanced analytics (trends, forecasting, comparisons)
-   Export functionality (CSV, PDF)
-   UI components for displaying statistics (charts, tables)
