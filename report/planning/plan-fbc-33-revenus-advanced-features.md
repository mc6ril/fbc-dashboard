---
Generated: 2025-01-27 21:30:00
Report Type: planning
Command: pm-plan-from-ticket
Ticket: FBC-33
---

# Implementation Plan: FBC-33 - Enhance Revenus page - Expandable rows, shipping costs, and indirect costs

## Summary

Enhance the Revenus page with expandable revenue breakdowns (by product type and individual products), monthly shipping cost tracking, editable indirect costs (2-3 predefined lines), and net result calculation. All features must follow Clean Architecture: Domain → Usecases → Infrastructure → Presentation. Shipping costs are entered monthly (not per sale). Cost data stored per month (YYYY-MM format).

**Key constraints:**

-   Requires FBC-32 (Revenus MVP) completed
-   Monthly costs stored per month (YYYY-MM), not per sale
-   Expandable rows lazy-load data on expansion
-   All calculations must be accurate and handle edge cases (zero revenue, missing data)
-   WCAG 2.1 AA accessibility compliance required

## Solution Outline

**Domain Layer:**

-   Create `MonthlyCost` type in `core/domain/cost.ts`
-   Add `RevenueByProductType` and `RevenueByProduct` types to `core/domain/revenue.ts`
-   Update `RevenueData` to include `costs.shipping`, `indirectCosts`, `netResult`, `netMarginRate`

**Ports Layer:**

-   Create `CostRepository` interface in `core/ports/costRepository.ts` with `getMonthlyCost`, `createOrUpdateMonthlyCost`

**Infrastructure Layer:**

-   Migration `008_create_monthly_costs_table.sql` (id, month UNIQUE, shipping_cost, marketing_cost, overhead_cost, timestamps)
-   Implement `costRepositorySupabase` in `infrastructure/supabase/`

**Usecases Layer:**

-   Create `computeRevenueByProductType` and `computeRevenueByProduct` in `core/usecases/revenue.ts`
-   Create cost management usecases in `core/usecases/cost.ts` (`getMonthlyCost`, `createOrUpdateMonthlyCost`)
-   Update `computeRevenue` to include shipping and indirect costs in calculation

**Presentation Layer:**

-   Hooks: `useRevenueByProductType`, `useRevenueByProduct`, `useMonthlyCost`, `useUpdateMonthlyCost` mutation
-   Components: `ExpandableRevenueRow`, `CostInput` (reusable for shipping and indirect costs)
-   Update `RevenueTable` to integrate expandable rows and cost inputs

## Sub-Tickets

### 33.1 - Database migration: monthly_costs table

-   AC: [x] Migration `008_create_monthly_costs_table.sql` created with id, month (TEXT UNIQUE, YYYY-MM), shipping_cost, marketing_cost, overhead_cost (NUMERIC 10,2), timestamps [x] Index on month column [ ] Migration applies successfully
-   DoD: [x] Migration file created [ ] Migration tested [ ] Schema verified
-   Effort: 1h | Deps: none

### 33.2 - Domain types: MonthlyCost and revenue breakdown types

-   AC: [x] `MonthlyCost` type created in `core/domain/cost.ts` (id, month, shippingCost, marketingCost, overheadCost) [x] `RevenueByProductType` and `RevenueByProduct` types added to `core/domain/revenue.ts` [x] `RevenueData` updated with `costs.shipping`, `indirectCosts`, `netResult`, `netMarginRate`
-   DoD: [x] Types exported and documented [x] No external dependencies in domain [ ] Tests: approved
-   Effort: 2h | Deps: none

### 33.3 - Cost repository: port and Supabase implementation

-   AC: [x] `CostRepository` interface created in `core/ports/costRepository.ts` with `getMonthlyCost(month: string)`, `createOrUpdateMonthlyCost(cost: MonthlyCost)` [x] `costRepositorySupabase` implemented in `infrastructure/supabase/` [x] Handles upsert logic (create if not exists, update if exists)
-   DoD: [x] Repository implements port interface [x] No UI dependencies [ ] Tests: approved
-   Effort: 3h | Deps: 33.1, 33.2

### 33.4 - Cost management usecases

-   AC: [x] `getMonthlyCost` usecase created in `core/usecases/cost.ts` [x] `createOrUpdateMonthlyCost` usecase created with validation [x] Usecases accept `CostRepository` as parameter [x] Error handling for invalid months
-   DoD: [x] Usecases return domain types only [x] No Supabase imports [ ] Tests: approved
-   Effort: 2h | Deps: 33.2, 33.3

### 33.5 - Revenue breakdown usecases: by product type and by product

-   AC: [x] `computeRevenueByProductType` created in `core/usecases/revenue.ts` (groups sales by ProductType, returns array of {type, revenue, count}) [x] `computeRevenueByProduct` created (groups by product model+coloris, returns array of {productId, productName, coloris, revenue, count}) [x] Both usecases accept ActivityRepository and ProductRepository [x] Handle empty sales gracefully
-   DoD: [x] Usecases return domain types [x] No Supabase imports [ ] Tests: approved
-   Effort: 4h | Deps: 33.2

### 33.6 - Update computeRevenue to include shipping and indirect costs

-   AC: [x] `computeRevenue` updated to accept `CostRepository` parameter [x] Fetches monthly costs for period [x] Calculates net result = grossMargin - totalIndirectCosts [x] Calculates net margin rate = (netResult / totalRevenue) \* 100 [x] Handles missing cost data (defaults to 0)
-   DoD: [x] Calculation logic tested [x] Edge cases handled (zero revenue, missing costs) [ ] Tests: approved
-   Effort: 3h | Deps: 33.2, 33.3, 33.4

### 33.7 - Cost hooks: useMonthlyCost and mutation

-   AC: [x] `useMonthlyCost(month: string)` hook created in `presentation/hooks/useCost.ts` [x] `useUpdateMonthlyCost` mutation hook created [x] Hooks call usecases (not infrastructure directly) [x] Proper query keys and cache invalidation
-   DoD: [x] Hooks return data/isLoading/error [x] React Query configured correctly [ ] Tests: approved
-   Effort: 2h | Deps: 33.4

### 33.8 - Revenue breakdown hooks: useRevenueByProductType and useRevenueByProduct

-   AC: [x] `useRevenueByProductType(period, startDate, endDate)` hook created in `presentation/hooks/useRevenue.ts` [x] `useRevenueByProduct(period, startDate, endDate)` hook created [x] Hooks use `enabled` option for lazy loading [x] Stable query keys for caching
-   DoD: [x] Hooks call usecases [x] Lazy loading works correctly [ ] Tests: approved
-   Effort: 2h | Deps: 33.5

### 33.9 - ExpandableRevenueRow component

-   AC: [x] `ExpandableRevenueRow` component created in `presentation/components/revenueTable/ExpandableRevenueRow/` [x] Manages expansion state (open/closed) [x] Lazy loads data when expanded (uses `enabled` in hooks) [x] Displays chevron icon (down/up) [x] Smooth expand/collapse animation [x] ARIA attributes (`aria-expanded`, `aria-controls`) [x] Loading state during data fetch
-   DoD: [x] Component in own folder [x] SCSS uses variables [x] A11y compliant [ ] Tests: approved
-   Effort: 4h | Deps: 33.8

### 33.10 - CostInput component (reusable for shipping and indirect costs)

-   AC: [x] `CostInput` component created in `presentation/components/revenueTable/CostInput/` [x] Controlled input with validation (numeric, >= 0) [x] Save on blur or explicit save button [x] Loading state during save [x] Success/error feedback [x] Accessible (label, aria-describedby for errors) [x] Reusable for shipping and indirect costs (via props)
-   DoD: [x] Component in own folder [x] SCSS uses variables [x] A11y compliant [ ] Tests: approved
-   Effort: 3h | Deps: 33.7

### 33.11 - Integrate expandable rows and costs into RevenueTable

-   AC: [x] Add "CA par type de produit" expandable row to RevenueTable [x] Add "CA par produit" expandable row to RevenueTable [x] Add "Coût d'expédition" row with CostInput [x] Add "Coûts indirects" section with 2-3 CostInput components (Marketing, Frais généraux) [x] Add "Résultat net" row (grossMargin - totalIndirectCosts) with net margin rate [x] Update table data transformation to include new rows [x] Handle loading/error states for cost inputs
-   DoD: [x] All rows display correctly [x] Calculations accurate [x] Cost inputs save successfully [x] SCSS uses variables [x] A11y compliant
-   Effort: 5h | Deps: 33.6, 33.9, 33.10

## Unit Test Spec

**File:** `__tests__/core/usecases/cost.test.ts`

-   Key tests: `getMonthlyCost returns cost for existing month`, `getMonthlyCost returns null for missing month`, `createOrUpdateMonthlyCost creates new cost`, `createOrUpdateMonthlyCost updates existing cost`, `createOrUpdateMonthlyCost validates month format`
-   Status: tests proposed

**File:** `__tests__/core/usecases/revenue.test.ts` (update existing)

-   Key tests: `computeRevenueByProductType groups sales by ProductType correctly`, `computeRevenueByProductType handles empty sales`, `computeRevenueByProduct groups by product model+coloris`, `computeRevenue includes shipping and indirect costs in net result`, `computeRevenue calculates net margin rate correctly`, `computeRevenue handles missing cost data (defaults to 0)`
-   Status: tests proposed

**File:** `__tests__/core/domain/cost.test.ts`

-   Key tests: `MonthlyCost type structure validation`, `MonthlyCost month format validation (YYYY-MM)`
-   Status: tests proposed

## Agent Prompts

**Unit Test Coach:** Generate unit test specs for cost usecases (`getMonthlyCost`, `createOrUpdateMonthlyCost`) and revenue breakdown usecases (`computeRevenueByProductType`, `computeRevenueByProduct`). Include edge cases: missing data, zero values, invalid month formats. Test file: `__tests__/core/usecases/cost.test.ts` and update `__tests__/core/usecases/revenue.test.ts`.

**Architecture-Aware Dev:** Implement FBC-33 sub-ticket {N} following Clean Architecture. Domain types in `core/domain/`, usecases in `core/usecases/`, repository in `infrastructure/supabase/`, hooks in `presentation/hooks/`. No Supabase calls from UI. Use React Query for server state. SCSS variables from `styles/variables/*`. A11y compliance required.

**UI Designer:** Design expandable revenue rows and cost input components for FBC-33. Expandable rows: chevron icon, smooth animation, loading states. CostInput: numeric validation, save on blur, success/error feedback. Both components must be WCAG 2.1 AA compliant. Use SCSS variables from `styles/variables/*`. Components in `presentation/components/revenueTable/{ComponentName}/`.

**QA & Test Coach:** Create test plan for FBC-33 revenue page enhancements. Test expandable rows (expansion/collapse, lazy loading, data accuracy), cost inputs (validation, save functionality, error handling), net result calculation (accuracy, edge cases), accessibility (keyboard navigation, screen reader support). Verify all calculations match expected formulas.

## Open Questions

1. **Indirect cost lines:** Should the 2-3 predefined indirect cost lines be configurable (admin setting) or hardcoded? Currently planned as hardcoded (Marketing, Frais généraux) - confirm with product owner.

2. **Cost input UX:** Should cost inputs save automatically on blur, or require explicit "Save" button? Currently planned as "save on blur OR explicit save button" - confirm preference.

3. **Period aggregation for costs:** For QUARTER/YEAR periods, should shipping/indirect costs be summed across months, or entered once per period? Currently planned as monthly entry (sum for display) - confirm approach.

## MVP Cut List

If time-constrained, prioritize:

-   **Must have:** Shipping costs (33.1-33.4, 33.7, 33.10, 33.11 partial) - enables basic cost tracking
-   **Should have:** Net result calculation (33.6, 33.11 partial) - completes financial picture
-   **Nice to have:** Expandable rows (33.5, 33.8, 33.9, 33.11 partial) - detailed breakdowns
-   **Defer:** Indirect costs beyond shipping (can be added later as separate ticket)
