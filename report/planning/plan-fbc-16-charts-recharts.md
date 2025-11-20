---
Generated: 2025-01-27 22:00:00
Report Type: planning
Command: pm-plan-from-ticket
Ticket: FBC-16
---

# Implementation Plan: Charts with Recharts (FBC-16)

## Summary

**Goal:** Add visual charts to the statistics page using Recharts to display sales per month, activities over time, revenue & margin trends, and top profitable products, enabling users to quickly grasp business performance patterns and identify which products drive profitability.

**User Value:**

-   Visual representation of business trends makes data easier to understand
-   Quick identification of anomalies and patterns in sales, activities, and profitability
-   Better decision-making through visual analytics

**Constraints:**

-   Must follow Clean Architecture principles (strict layer separation)
-   Data must come from existing hooks/usecases (no business logic in components)
-   Charts must be accessible (WCAG 2.1 AA compliance) with fallback text and descriptions
-   Heavy chart components must be lazy-loaded (dynamic import) for performance
-   Charts must be responsive and avoid layout shifts
-   All styling must use SCSS variables from `styles/variables/*`
-   Accessibility utilities from `shared/a11y/` must be used

**Non-Goals:**

-   Real-time chart updates (5-minute cache is sufficient)
-   Chart export functionality (deferred to future ticket)
-   Advanced chart interactions (zooming, panning, drill-down)
-   Multiple chart types beyond the four specified (sales/month, activities over time, revenue & margin, top products)

## Assumptions & Risks

### Assumptions

1. **Recharts library:** Assumes Recharts is a suitable charting library for React/Next.js
2. **Data availability:** Assumes statistics hooks (`useProfitsByPeriod`, `useProductMargins`) provide sufficient data for charts
3. **Performance:** Assumes lazy-loading chart components prevents initial bundle size issues
4. **Responsiveness:** Assumes Recharts supports responsive sizing via container dimensions

### Risks

1. **Bundle size increase:** Recharts may significantly increase JavaScript bundle size
    - **Mitigation:** Lazy-load chart components with dynamic imports; use code splitting
2. **Accessibility compliance:** Charts may not be fully accessible by default
    - **Mitigation:** Add proper ARIA labels, descriptions, and fallback text; test with screen readers
3. **Layout shifts:** Charts may cause layout shifts during loading
    - **Mitigation:** Set fixed container dimensions; use loading states; reserve space for charts
4. **Data transformation:** Statistics data may need transformation for chart formats
    - **Mitigation:** Transform data in hooks using `select` option or in components (no business logic)

## Solution Outline (Aligned with Architecture)

The solution follows Clean Architecture layers with strict separation:

1. **Infrastructure Layer:**

    - Install `recharts` library as a dependency
    - No new infrastructure code needed (existing statistics hooks provide data)

2. **Presentation Layer:**

    - Create reusable chart wrapper components in `presentation/components/ui/`:
        - `ChartContainer.tsx`: Wrapper with accessibility attributes and loading states
    - Create page-specific chart components in `presentation/components/statsCharts/`:
        - `SalesPerMonthChart.tsx`: Line chart for sales per month
        - `ActivitiesOverTimeChart.tsx`: Line chart for activities over time
        - `MarginPerMonthChart.tsx`: Dual-line chart for revenue & margin per month
        - `TopProfitableProductsChart.tsx`: Horizontal bar chart for top products by profit
    - Update `src/app/dashboard/stats/page.tsx` to display charts with lazy loading
    - Use existing statistics hooks (`useProfitsByPeriod`, `useProductMargins`) for data
    - Transform data in components (presentation logic only, no business logic)

3. **Styling:**

    - Create SCSS module for chart components: `statsCharts/*.module.scss`
    - Use variables from `styles/variables/*` for colors, spacing, sizes
    - Ensure responsive design with proper breakpoints

4. **Accessibility:**
    - Add `aria-label` and `aria-describedby` to chart containers
    - Provide fallback text describing chart data
    - Ensure keyboard navigation support
    - Use `shared/a11y/` utilities for accessibility IDs

**Data Flow:**

```
UI Component (StatsPage)
  ↓ calls
React Query Hooks (useProfitsByPeriod, useProductMargins)
  ↓ calls
Statistics Usecases (computeProfitsByPeriod, computeProductMargins)
  ↓ calls
Repositories (activityRepositorySupabase, productRepositorySupabase)
  ↓ calls
Supabase (activities + products tables)
```

## Sub-Tickets

### Sub-Ticket 16.1

**Title:** Install Recharts library and create chart container component

**Rationale:**
Recharts must be installed as a dependency before chart components can be created. A reusable chart container component provides consistent accessibility attributes, loading states, and styling across all charts.

**Acceptance Criteria:**

-   [x] Install `recharts` package: `yarn add recharts`
-   [x] Install TypeScript types: `yarn add -D @types/recharts` (if available)
-   [x] Create `src/presentation/components/ui/ChartContainer.tsx`:
    -   Accepts `title`, `description`, `children`, `isLoading`, `error` props
    -   Provides `aria-label` and `aria-describedby` attributes
    -   Displays loading state with placeholder
    -   Displays error state with error message
    -   Uses accessibility utilities from `shared/a11y/`
    -   Uses SCSS variables from `styles/variables/*`
-   [x] Create `src/presentation/components/ui/ChartContainer.module.scss`:
    -   Uses variables for colors, spacing, sizes
    -   Responsive container with proper dimensions
    -   Loading/error state styles
-   [x] Component follows arrow function with export default pattern
-   [x] Props typed with `type` (not `interface`)

**Definition of Done:**

-   [x] Recharts installed and TypeScript types available
-   [x] ChartContainer component created with accessibility attributes
-   [x] Loading and error states handled
-   [x] SCSS variables used (no hardcoded values)
-   [x] No TypeScript errors
-   [x] No linting errors

**Estimated Effort:** 2h

**Dependencies:** None

**Owner:** Frontend Developer

**Risk Notes:** Recharts TypeScript types may not be available; may need to create type definitions manually.

---

### Sub-Ticket 16.2

**Title:** Create Sales Per Month chart component

**Rationale:**
Sales per month chart visualizes monthly sales trends, helping users identify seasonal patterns and growth trends. Uses existing `useProfitsByPeriod` hook with MONTHLY period.

**Acceptance Criteria:**

-   [x] Create `src/presentation/components/statsCharts/SalesPerMonthChart/SalesPerMonthChart.tsx`:
    -   Uses `useProfitsByPeriod(StatisticsPeriod.MONTHLY)` hook for data
    -   Transforms `PeriodStatistics[]` to Recharts data format (presentation logic only)
    -   Displays line or bar chart showing `totalSales` per month
    -   Uses `ChartContainer` wrapper for accessibility
    -   Handles loading and error states
    -   Accepts optional `startDate` and `endDate` props for date filtering
-   [x] Create `src/presentation/components/statsCharts/SalesPerMonthChart/SalesPerMonthChart.module.scss`:
    -   Uses SCSS variables for colors, spacing, sizes
    -   Responsive chart container
-   [x] Chart includes:
    -   X-axis: Month labels (YYYY-MM format)
    -   Y-axis: Sales amount (formatted currency)
    -   Tooltip showing month and sales amount
    -   Accessible fallback text: "Sales per month chart showing monthly sales trends"
-   [x] Component follows arrow function with export default pattern
-   [x] Props typed with `type` (not `interface`)

**Definition of Done:**

-   [x] Chart renders with data from `useProfitsByPeriod` hook
-   [x] Chart is accessible (ARIA labels, descriptions)
-   [x] Loading and error states handled
-   [x] SCSS variables used (no hardcoded values)
-   [x] Responsive design (works on mobile and desktop)
-   [x] No TypeScript errors
-   [x] No linting errors

**Estimated Effort:** 3h

**Dependencies:** Sub-Ticket 16.1 (ChartContainer)

**Owner:** Frontend Developer

**Risk Notes:** Data transformation from `PeriodStatistics[]` to Recharts format must be pure presentation logic (no business rules).

---

### Sub-Ticket 16.3

**Title:** Create Activities Over Time chart component

**Rationale:**
Activities over time chart visualizes daily activity counts (creations), helping users understand production volume trends. Uses existing `useProfitsByPeriod` hook with DAILY period.

**Acceptance Criteria:**

-   [x] Create `src/presentation/components/statsCharts/ActivitiesOverTimeChart/ActivitiesOverTimeChart.tsx`:
    -   Uses `useProfitsByPeriod(StatisticsPeriod.DAILY)` hook for data
    -   Transforms `PeriodStatistics[]` to Recharts data format (presentation logic only)
    -   Displays line chart showing `totalCreations` per day
    -   Uses `ChartContainer` wrapper for accessibility
    -   Handles loading and error states
    -   Accepts optional `startDate` and `endDate` props for date filtering
-   [x] Create `src/presentation/components/statsCharts/ActivitiesOverTimeChart/ActivitiesOverTimeChart.module.scss`:
    -   Uses SCSS variables for colors, spacing, sizes
    -   Responsive chart container
-   [x] Chart includes:
    -   X-axis: Date labels (YYYY-MM-DD format)
    -   Y-axis: Activity count (integer)
    -   Tooltip showing date and activity count
    -   Accessible fallback text: "Activities over time chart showing daily creation activity trends"
-   [x] Component follows arrow function with export default pattern
-   [x] Props typed with `type` (not `interface`)

**Definition of Done:**

-   [x] Chart renders with data from `useProfitsByPeriod` hook
-   [x] Chart is accessible (ARIA labels, descriptions)
-   [x] Loading and error states handled
-   [x] SCSS variables used (no hardcoded values)
-   [x] Responsive design (works on mobile and desktop)
-   [x] No TypeScript errors
-   [x] No linting errors

**Estimated Effort:** 3h

**Dependencies:** Sub-Ticket 16.1 (ChartContainer)

**Owner:** Frontend Developer

**Risk Notes:** Daily data may be dense; consider date range limits or aggregation for better visualization.

---

### Sub-Ticket 16.4

**Title:** Create Revenue & Margin per Month chart component

**Rationale:**
Revenue & Margin per Month chart visualizes revenue (CA) and margin trends, helping users identify profitability patterns: high sales with low margin vs low sales with high margin. Uses existing `useProfitsByPeriod` hook with MONTHLY period.

**Acceptance Criteria:**

-   [x] Create `src/presentation/components/statsCharts/MarginPerMonthChart/MarginPerMonthChart.tsx`:
    -   Uses `useProfitsByPeriod(StatisticsPeriod.MONTHLY)` hook for data
    -   Transforms `PeriodStatistics[]` to Recharts format (presentation logic only)
    -   Displays dual-line chart showing `totalSales` (revenue/CA) and `profit` (margin) per month
    -   Uses `ChartContainer` wrapper for accessibility
    -   Handles loading and error states
    -   Accepts optional `startDate` and `endDate` props for date filtering
-   [x] Create `src/presentation/components/statsCharts/MarginPerMonthChart/MarginPerMonthChart.module.scss`:
    -   Uses SCSS variables for colors, spacing, sizes
    -   Responsive chart container
-   [x] Chart includes:
    -   X-axis: Month labels (YYYY-MM format)
    -   Y-axis: Amount (formatted currency)
    -   Two lines: Revenue (CA) and Margin
    -   Tooltip showing month, revenue, and margin values
    -   Legend distinguishing revenue and margin
    -   Accessible fallback text: "Revenue and margin per month chart comparing total sales (CA) and profit (margin) trends"
-   [x] Component follows arrow function with export default pattern
-   [x] Props typed with `type` (not `interface`)

**Definition of Done:**

-   [x] Chart renders with data from `useProfitsByPeriod` hook
-   [x] Chart is accessible (ARIA labels, descriptions)
-   [x] Loading and error states handled
-   [x] SCSS variables used (no hardcoded values)
-   [x] Responsive design (works on mobile and desktop)
-   [x] No TypeScript errors
-   [x] No linting errors

**Estimated Effort:** 3h

**Dependencies:** Sub-Ticket 16.1 (ChartContainer)

**Owner:** Frontend Developer

**Risk Notes:** Chart helps identify profitability patterns: high sales with low margin vs low sales with high margin.

---

### Sub-Ticket 16.5

**Title:** Create Top Products by Profit chart component

**Rationale:**
Top Products by Profit chart visualizes the most profitable products/models, helping users identify which products drive the business. Uses existing `useProductMargins` hook combined with `useProducts` hook to get product names.

**Acceptance Criteria:**

-   [x] Create `src/presentation/components/statsCharts/TopProfitableProductsChart/TopProfitableProductsChart.tsx`:
    -   Uses `useProductMargins()` hook for profit data (already sorted by profit descending)
    -   Uses `useProducts()` hook to get product names and details
    -   Transforms `ProductMargin[]` combined with `Product[]` to Recharts format (presentation logic only)
    -   Displays horizontal bar chart showing top N products (default: top 10) by profit
    -   Uses `ChartContainer` wrapper for accessibility
    -   Handles loading and error states from both hooks
    -   Accepts optional `startDate` and `endDate` props for date filtering
-   [x] Create `src/presentation/components/statsCharts/TopProfitableProductsChart/TopProfitableProductsChart.module.scss`:
    -   Uses SCSS variables for colors, spacing, sizes
    -   Responsive chart container
-   [x] Chart includes:
    -   X-axis: Profit amount (formatted currency)
    -   Y-axis: Product labels (model name - coloris format)
    -   Horizontal bars showing profit per product
    -   Tooltip showing product name and profit value
    -   Accessible fallback text: "Top products by profit chart showing the most profitable products/models"
-   [x] Component follows arrow function with export default pattern
-   [x] Props typed with `type` (not `interface`)

**Definition of Done:**

-   [x] Chart renders with data from `useProductMargins` and `useProducts` hooks
-   [x] Chart is accessible (ARIA labels, descriptions)
-   [x] Loading and error states handled for both hooks
-   [x] SCSS variables used (no hardcoded values)
-   [x] Responsive design (works on mobile and desktop)
-   [x] Product labels formatted correctly (model name - coloris)
-   [x] No TypeScript errors
-   [x] No linting errors

**Estimated Effort:** 3h

**Dependencies:** Sub-Ticket 16.1 (ChartContainer)

**Owner:** Frontend Developer

**Risk Notes:** Requires combining data from two hooks (`useProductMargins` and `useProducts`); product names may be missing for deleted products.

---

### Sub-Ticket 16.6

**Title:** Integrate charts into stats page with lazy loading

**Rationale:**
Stats page must display all four charts with lazy loading to prevent initial bundle size increase. Charts should be loaded on demand using Next.js dynamic imports. Layout displays charts vertically (in column) for better readability.

**Acceptance Criteria:**

-   [x] Update `src/app/dashboard/stats/page.tsx`:
    -   Lazy-load all four chart components using `next/dynamic` with `loading` prop
    -   Display charts in a vertical column layout (one per row)
    -   Handle loading states for each chart independently
    -   Use proper semantic HTML structure (`<main>`, `<section>`)
    -   Add page-level heading and description
-   [x] Update `src/app/dashboard/stats/page.module.scss`:
    -   Uses SCSS variables for colors, spacing, sizes
    -   Vertical column layout (flex column) for charts
    -   Proper spacing between charts
-   [x] Page includes:
    -   Main heading: "Statistics"
    -   Section headings for each chart
    -   Accessible structure with proper landmarks
    -   Loading placeholders for lazy-loaded charts
-   [x] Dynamic imports configured with:
    -   `ssr: false` (charts are client-side only)
    -   `loading` component for better UX
-   [x] No TypeScript errors
-   [x] No linting errors

**Definition of Done:**

-   [x] All four charts displayed on stats page
-   [x] Charts lazy-loaded with dynamic imports
-   [x] Vertical column layout (charts displayed one per row)
-   [x] Loading states handled
-   [x] SCSS variables used (no hardcoded values)
-   [x] Accessible structure (semantic HTML, ARIA)
-   [x] No TypeScript errors
-   [x] No linting errors

**Estimated Effort:** 2h

**Dependencies:** Sub-Tickets 16.2, 16.3, 16.4, 16.5 (all chart components)

**Owner:** Frontend Developer

**Risk Notes:** Lazy loading may cause layout shifts; ensure proper loading placeholders with fixed dimensions. Vertical layout ensures better readability on all screen sizes.

---

## Unit Test Spec

**File Path:** `__tests__/presentation/components/ui/ChartContainer.test.tsx`

**Key Test Names:**

1. `renders chart container with title and description`
2. `displays loading state when isLoading is true`
3. `displays error state when error is provided`
4. `renders children when data is available`
5. `applies accessibility attributes correctly`

**Status:** tests proposed

**Note:** Chart components (SalesPerMonthChart, ActivitiesOverTimeChart, ProfitVsCostChart) are page-specific components and do not require unit tests per testing rules. Only reusable UI components (`ChartContainer`) require tests.

---

## Agent Prompts

### Unit Test Coach

"Generate unit test spec for `ChartContainer` component in `src/presentation/components/ui/ChartContainer.tsx`. Test rendering with title/description, loading state, error state, children rendering, and accessibility attributes. Use React Testing Library. File: `__tests__/presentation/components/ui/ChartContainer.test.tsx`."

### Architecture-Aware Dev

"Implement chart components for FBC-16 following Clean Architecture. Create reusable `ChartContainer` in `presentation/components/ui/`, page-specific chart components in `presentation/components/statsCharts/`, and integrate into stats page with lazy loading. Use existing statistics hooks (`useProfitsByPeriod`, `useProductMargins`). No business logic in components. Follow arrow function with export default pattern. Use SCSS variables from `styles/variables/*`. Ensure accessibility with `shared/a11y/` utilities."

### UI Designer

"Design chart components for statistics page: Sales Per Month (line/bar), Activities Over Time (line), Profit vs Cost (grouped bar). Ensure responsive design, proper spacing, loading states, and accessibility. Use SCSS variables from `styles/variables/*`. Charts must work on mobile and desktop without layout shifts."

### QA & Test Coach

"Create test plan for FBC-16 charts feature. Test chart rendering with real data, loading states, error handling, accessibility (screen reader, keyboard navigation), responsiveness (mobile/desktop), and lazy loading behavior. Verify data comes from hooks/usecases (no business logic in components). Test with empty data, error states, and various date ranges."

---

## Open Questions

1. **Chart layout:** Should charts be displayed horizontally (grid) or vertically (column)? **Decision:** Vertical column layout for better readability and to avoid layout shifts on mobile devices.

2. **Top products limit:** How many top products should be displayed? **Decision:** Top 10 products by default, showing the most profitable products/models.

3. **Date range filtering:** Should charts support date range filtering via UI controls, or use default ranges? **Recommendation:** Start with default ranges (last 12 months for monthly, last 30 days for daily); add filtering UI in future ticket if needed.

---

## MVP Cut List

If time is limited, prioritize:

1. **Must Have:**

    - Sales Per Month chart (most requested feature)
    - ChartContainer component (foundation for all charts)
    - Basic accessibility (ARIA labels, descriptions)

2. **Nice to Have:**

    - Activities Over Time chart
    - Revenue & Margin per Month chart
    - Top Products by Profit chart
    - Advanced accessibility features (keyboard navigation, screen reader optimizations)

3. **Future Enhancements:**
    - Date range filtering UI
    - Chart export functionality
    - Multiple chart type options (line vs bar)
    - Real-time chart updates
    - Chart interactions (zooming, panning)

---

## Implementation Order

1. **Sub-Ticket 16.1** (Install Recharts + ChartContainer) - Foundation for all charts
2. **Sub-Ticket 16.2** (Sales Per Month chart) - Most requested feature
3. **Sub-Ticket 16.3** (Activities Over Time chart) - Can be done in parallel with 16.4
4. **Sub-Ticket 16.4** (Revenue & Margin per Month chart) - Replaces Profit vs Cost chart
5. **Sub-Ticket 16.5** (Top Products by Profit chart) - New chart for product-level insights
6. **Sub-Ticket 16.6** (Integrate into stats page) - Requires all chart components

## Performance Considerations

-   Charts lazy-loaded with dynamic imports to prevent initial bundle size increase
-   Statistics queries use 5-minute stale time (already configured in hooks)
-   Chart data transformation done in components (presentation logic only)
-   Fixed container dimensions prevent layout shifts
-   Responsive design ensures charts work on all screen sizes

## Future Enhancements (Out of Scope)

-   Real-time chart updates (WebSocket/SSE)
-   Chart export functionality (CSV, PNG, PDF)
-   Advanced chart interactions (zooming, panning, drill-down)
-   Multiple chart type options (user-selectable line/bar/pie)
-   Date range filtering UI controls
-   Chart comparison features (year-over-year, period-over-period)
-   Customizable chart colors and themes
