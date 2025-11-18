---
Generated: 2025-01-27 16:00:00
Report Type: planning
Command: pm-plan-from-ticket
Ticket: FBC-9
---

# Implementation Plan: Implement Core Usecases for Activities and Analytics

## Summary

**Goal:** Create pure usecase functions that orchestrate business logic for activity tracking and analytics, enabling consistent activity operations and accurate derived metrics (stock computation, profit calculation).

**User value:** Product users can trust the dashboard and reports with consistent activity operations and accurate derived metrics. The usecases provide a clean, testable interface for business logic that can be used across the application layers.

**Constraints:**

-   Follow Clean Architecture: Usecases must be pure functions accepting repository ports as parameters
-   No direct Supabase/React imports in usecases
-   All usecases must return domain data or computed results
-   Edge cases must be handled (negative quantities for sales, zero-quantity validations, missing products)
-   Errors must be thrown meaningfully and documented in JSDoc
-   Strict TypeScript typing (no `any`)
-   Unit tests required for each usecase with mocked repositories

**Non-goals:**

-   Implementing repository infrastructure (Supabase implementations)
-   Creating UI components or React Query hooks
-   Database schema changes
-   Real-time updates or subscriptions
-   Complex analytics beyond basic profit calculation

## Assumptions & Risks

**Assumptions:**

-   `ActivityRepository` port interface exists and provides `list()`, `getById()`, `create()`, `update()` methods
-   `ProductRepository` port interface exists and provides `list()`, `getById()` methods (needed for `computeProfit`)
-   Domain types (`Activity`, `Product`, `ActivityType`, `ProductId`) are well-defined
-   Validation functions exist in `src/core/domain/validation.ts` (`isValidActivity`, `isValidISO8601`, etc.)
-   Mock repositories exist in `__mocks__/core/ports/` for testing
-   `computeStockFromActivities` should derive stock per product by summing activity quantities
-   `computeProfit` should calculate profit from SALE activities using `(salePrice - unitCost) * quantity` formula
-   Date filtering for `computeProfit` can be stubbed initially (accept optional date range parameters)

**Risks:**

-   **Risk:** `computeStockFromActivities` may need to handle products that don't exist in activities
    -   **Mitigation:** Return stock map only for products that have activities, or accept optional product list to compute stock for all products
-   **Risk:** `computeProfit` requires product data (unitCost, salePrice) which may not be available for all activities
    -   **Mitigation:** Filter out activities without valid product data, or throw meaningful errors
-   **Risk:** Performance concerns for large activity lists in `computeStockFromActivities` and `computeProfit`
    -   **Mitigation:** Document performance characteristics, consider pagination/filtering in future iterations
-   **Risk:** Date range filtering for `computeProfit` may need timezone handling
    -   **Mitigation:** Use ISO 8601 strings consistently, document timezone assumptions in JSDoc

## Solution Outline (aligned with architecture)

The solution follows Clean Architecture principles:

1. **Usecases Layer (`src/core/usecases/activity.ts`):**

    - `addActivity()`: Validates activity data, enforces business rules (productId required for SALE/STOCK_CORRECTION), delegates to repository
    - `listActivities()`: Simple delegation to repository (no business logic, but kept for consistency)
    - `updateActivity()`: Validates updates, enforces business rules, delegates to repository
    - `computeStockFromActivities()`: Retrieves all activities, groups by productId, sums quantities per product, returns stock map
    - `computeProfit()`: Retrieves activities (optionally filtered by date range), filters SALE activities, retrieves products, calculates profit per sale, sums total profit

2. **Data Flow:**

    ```
    UI/Hooks → Usecases → Repository Ports → Infrastructure (Supabase)
    ```

3. **Error Handling:**

    - Validation errors: Custom error objects with meaningful messages
    - Repository errors: Propagated as-is (repository contract handles errors)
    - Business rule violations: Thrown with descriptive error messages

4. **Testing Strategy:**
    - Unit tests for each usecase with mocked repositories
    - Test success paths, validation failures, edge cases, error propagation
    - Mock data fixtures for activities and products

## Sub-Tickets

### Sub-Ticket 9.1

**Title:** Implement `addActivity` usecase with validation

**Rationale:**
This usecase is the foundation for creating activities. It must validate business rules (productId required for SALE/STOCK_CORRECTION types) and delegate to the repository. This ensures data integrity before persistence.

**Acceptance Criteria:**

-   [x] `addActivity()` function exists in `src/core/usecases/activity.ts`
-   [x] Function accepts `ActivityRepository` and `Omit<Activity, 'id'>` as parameters
-   [x] Validates that `productId` is provided for SALE and STOCK_CORRECTION activity types
-   [x] Validates that date is a valid ISO 8601 string
-   [x] Validates that quantity is a number (not NaN, not Infinity)
-   [x] Validates that amount is a number (not NaN, not Infinity)
-   [x] Throws meaningful validation errors with descriptive messages
-   [x] Delegates to `repository.create()` with validated activity data
-   [x] Returns created activity with generated ID
-   [x] All errors documented in JSDoc with `@throws` tags
-   [x] No direct Supabase/React imports

**Definition of Done:**

-   [x] Unit tests in `__tests__/core/usecases/activity.test.ts` covering:
    -   [x] Success path with valid activity data
    -   [x] Validation error for missing productId on SALE type
    -   [x] Validation error for missing productId on STOCK_CORRECTION type
    -   [x] Validation error for invalid date format
    -   [x] Validation error for invalid quantity (NaN, Infinity)
    -   [x] Validation error for invalid amount (NaN, Infinity)
    -   [x] Repository error propagation
    -   [x] Edge cases (zero quantity, negative amount for corrections)
-   [x] Lint/build passes
-   [x] JSDoc documentation complete with examples

**Estimated Effort:** 3h

**Dependencies:** None

**Owner:** Architecture-Aware Dev

**Risk Notes:** Validation rules must align with domain business rules. Consider using `isValidActivity()` from domain validation if it covers all cases.

### Sub-Ticket 9.2

**Title:** Implement `listActivities` usecase

**Rationale:**
Simple delegation usecase for consistency. While it doesn't add business logic, it maintains the usecase pattern and allows future filtering/ordering logic to be added without changing the interface.

**Acceptance Criteria:**

-   [x] `listActivities()` function exists in `src/core/usecases/activity.ts`
-   [x] Function accepts `ActivityRepository` as parameter
-   [x] Delegates to `repository.list()`
-   [x] Returns array of activities
-   [x] Returns empty array if repository returns empty array
-   [x] Errors propagated from repository
-   [x] JSDoc documentation with `@throws` tags
-   [x] No direct Supabase/React imports

**Definition of Done:**

-   [x] Unit tests in `__tests__/core/usecases/activity.test.ts` covering:
    -   [x] Success path with activities returned
    -   [x] Success path with empty array
    -   [x] Repository error propagation
-   [x] Lint/build passes
-   [x] JSDoc documentation complete

**Estimated Effort:** 1h

**Dependencies:** None

**Owner:** Architecture-Aware Dev

**Risk Notes:** Minimal risk, simple delegation pattern.

### Sub-Ticket 9.3

**Title:** Implement `updateActivity` usecase with validation

**Rationale:**
Enables updating existing activities while maintaining data integrity. Must validate that updates don't violate business rules (e.g., removing productId from SALE activity).

**Acceptance Criteria:**

-   [x] `updateActivity()` function exists in `src/core/usecases/activity.ts`
-   [x] Function accepts `ActivityRepository`, `ActivityId`, and `Partial<Activity>` as parameters
-   [x] Validates that if `type` is updated to SALE or STOCK_CORRECTION, `productId` must be present
-   [x] Validates that if `productId` is removed, activity type must not be SALE or STOCK_CORRECTION
-   [x] Validates that if `date` is updated, it must be a valid ISO 8601 string
-   [x] Validates that if `quantity` is updated, it must be a valid number
-   [x] Validates that if `amount` is updated, it must be a valid number
-   [x] Throws meaningful validation errors
-   [x] Delegates to `repository.update()` with validated updates
-   [x] Returns updated activity
-   [x] All errors documented in JSDoc with `@throws` tags
-   [x] No direct Supabase/React imports

**Definition of Done:**

-   [x] Unit tests in `__tests__/core/usecases/activity.test.ts` covering:
    -   [x] Success path with valid partial updates
    -   [x] Validation error when updating type to SALE without productId
    -   [x] Validation error when removing productId from SALE activity
    -   [x] Validation error for invalid date format in updates
    -   [x] Validation error for invalid quantity/amount in updates
    -   [x] Repository error propagation (activity not found, etc.)
    -   [x] Edge cases (updating only optional fields, empty updates object)
-   [x] Lint/build passes
-   [x] JSDoc documentation complete with examples

**Estimated Effort:** 3h

**Dependencies:** None

**Owner:** Architecture-Aware Dev

**Risk Notes:** Update validation must handle partial updates correctly. Consider fetching existing activity first to validate against current state.

### Sub-Ticket 9.4

**Title:** Implement `computeStockFromActivities` usecase

**Rationale:**
Derives current stock levels per product by summing activity quantities. This is a core analytics function that enables stock tracking without maintaining a separate stock table.

**Acceptance Criteria:**

-   [x] `computeStockFromActivities()` function exists in `src/core/usecases/activity.ts`
-   [x] Function accepts `ActivityRepository` and optional `ProductId` filter parameter
-   [x] Retrieves all activities (or filtered by productId if provided)
-   [x] Groups activities by `productId`
-   [x] Sums `quantity` values per product (handles positive and negative quantities)
-   [x] Returns a map/object of `ProductId -> number` (stock level)
-   [x] Filters out activities without `productId` (CREATION/OTHER types without product)
-   [x] Handles empty activity list (returns empty map)
-   [x] Handles activities with zero quantity correctly
-   [x] Errors propagated from repository
-   [x] JSDoc documentation with examples and performance notes
-   [x] No direct Supabase/React imports

**Definition of Done:**

-   [x] Unit tests in `__tests__/core/usecases/activity.test.ts` covering:
    -   [x] Success path with multiple products and activities
    -   [x] Success path with single product filter
    -   [x] Success path with empty activity list
    -   [x] Correct stock calculation with positive and negative quantities
    -   [x] Activities without productId are filtered out
    -   [x] Activities with zero quantity are included in sum
    -   [x] Multiple activities for same product are summed correctly
    -   [x] Repository error propagation
    -   [x] Edge cases (all positive quantities, all negative quantities, mixed)
-   [x] Lint/build passes
-   [x] JSDoc documentation complete with examples

**Estimated Effort:** 4h

**Dependencies:** None

**Owner:** Architecture-Aware Dev

**Risk Notes:** Performance may degrade with large activity lists. Consider documenting performance characteristics and potential need for pagination/filtering in future. Return type should be a clear map structure (consider `Record<ProductId, number>` or `Map<ProductId, number>`).

### Sub-Ticket 9.5

**Title:** Implement `computeProfit` usecase

**Rationale:**
Calculates total profit from SALE activities by computing `(salePrice - unitCost) * quantity` for each sale. This enables profit analytics and reporting.

**Acceptance Criteria:**

-   [x] `computeProfit()` function exists in `src/core/usecases/activity.ts`
-   [x] Function accepts `ActivityRepository`, `ProductRepository`, and optional date range parameters (`startDate?: string`, `endDate?: string`)
-   [x] Retrieves all activities (or filtered by date range if provided)
-   [x] Filters activities to SALE type only
-   [x] Retrieves products for all SALE activities (batch or individual)
-   [x] Calculates profit per sale: `(product.salePrice - product.unitCost) * Math.abs(activity.quantity)`
-   [x] Sums total profit across all sales
-   [x] Handles missing products gracefully (filters out or throws error - document decision)
-   [x] Handles empty SALE activity list (returns 0)
-   [x] Validates date range parameters (ISO 8601 format if provided)
-   [x] Errors propagated from repositories
-   [x] JSDoc documentation with examples, formula explanation, and date range notes
-   [x] No direct Supabase/React imports

**Definition of Done:**

-   [x] Unit tests in `__tests__/core/usecases/activity.test.ts` covering:
    -   [x] Success path with multiple sales and products
    -   [x] Success path with date range filtering
    -   [x] Success path with empty SALE activity list (returns 0)
    -   [x] Correct profit calculation formula
    -   [x] Handles negative quantity correctly (uses absolute value)
    -   [x] Handles missing products (filters out or throws - based on AC decision)
    -   [x] Date range validation errors
    -   [x] Repository error propagation
    -   [x] Edge cases (zero profit sales, sales with same product multiple times)
-   [x] Lint/build passes
-   [x] JSDoc documentation complete with examples and formula

**Estimated Effort:** 5h

**Dependencies:** None (but uses both ActivityRepository and ProductRepository)

**Owner:** Architecture-Aware Dev

**Risk Notes:** Requires both repositories, which adds complexity. Consider error handling when product is not found for an activity. Date range filtering may need timezone considerations. Performance may be a concern with large datasets (consider batching product lookups).

### Sub-Ticket 9.6

**Title:** Create unit test specifications (Test-First Protocol)

**Rationale:**
Following TDD principles, test specifications must be created before implementation to ensure comprehensive coverage and guide development.

**Acceptance Criteria:**

-   [x] Test file structure defined in `__tests__/core/usecases/activity.test.ts`
-   [x] Test suites (describe blocks) for each usecase function
-   [x] Test cases (it blocks) covering all acceptance criteria from sub-tickets 9.1-9.5
-   [x] Mock repository setup patterns documented
-   [x] Test data fixtures identified (mock activities, products)
-   [x] Edge cases and error scenarios documented
-   [x] Coverage targets defined (aim for >90% coverage)
-   [x] Test mapping: AC → Test cases documented

**Definition of Done:**

-   [x] Test specification document or inline comments in test file
-   [x] All test cases from sub-tickets 9.1-9.5 covered
-   [x] Mock data patterns defined
-   [x] Error scenario tests defined
-   [x] Edge case tests defined
-   [x] Status: `tests: approved` (ready for implementation)

**Estimated Effort:** 2h

**Dependencies:** None (can be done in parallel with implementation planning)

**Owner:** Unit Test Coach

**Risk Notes:** Test specifications should be comprehensive to catch edge cases early. Consider performance test scenarios for `computeStockFromActivities` and `computeProfit` with large datasets.

## Unit Test Spec (Test-First Protocol)

### Files & Paths

-   **Test File:** `__tests__/core/usecases/activity.test.ts`
-   **Mock Repositories:** `__mocks__/core/ports/activityRepository.ts` (exists), `__mocks__/core/ports/productRepository.ts` (may need to verify)
-   **Mock Domain Data:** `__mocks__/core/domain/activity.ts` (may need to create), `__mocks__/core/domain/product.ts` (may need to create)

### Test Structure

```typescript
describe("Activity Usecases", () => {
    let mockActivityRepo: jest.Mocked<ActivityRepository>;
    let mockProductRepo: jest.Mocked<ProductRepository>;

    beforeEach(() => {
        jest.clearAllMocks();
        mockActivityRepo = createMockActivityRepository();
        mockProductRepo = createMockProductRepository(); // Verify exists
    });

    describe("addActivity", () => {
        // Test cases from Sub-Ticket 9.1
    });

    describe("listActivities", () => {
        // Test cases from Sub-Ticket 9.2
    });

    describe("updateActivity", () => {
        // Test cases from Sub-Ticket 9.3
    });

    describe("computeStockFromActivities", () => {
        // Test cases from Sub-Ticket 9.4
    });

    describe("computeProfit", () => {
        // Test cases from Sub-Ticket 9.5
    });
});
```

### Test Cases by Usecase

#### `addActivity` Tests

1. **Success path with valid CREATION activity**

    - Mock: `mockActivityRepo.create.mockResolvedValue(createdActivity)`
    - Assert: Repository called with correct data, returns created activity

2. **Success path with valid SALE activity (with productId)**

    - Mock: Valid SALE activity with productId
    - Assert: Repository called, returns created activity

3. **Validation error: missing productId for SALE type**

    - Input: SALE activity without productId
    - Assert: Throws validation error, repository not called

4. **Validation error: missing productId for STOCK_CORRECTION type**

    - Input: STOCK_CORRECTION activity without productId
    - Assert: Throws validation error, repository not called

5. **Validation error: invalid date format**

    - Input: Activity with invalid date string
    - Assert: Throws validation error, repository not called

6. **Validation error: invalid quantity (NaN)**

    - Input: Activity with NaN quantity
    - Assert: Throws validation error

7. **Validation error: invalid amount (Infinity)**

    - Input: Activity with Infinity amount
    - Assert: Throws validation error

8. **Repository error propagation**

    - Mock: `mockActivityRepo.create.mockRejectedValue(error)`
    - Assert: Error propagated to caller

9. **Edge case: zero quantity (allowed)**

    - Input: Activity with quantity: 0
    - Assert: Success (zero quantity is valid)

10. **Edge case: negative amount for STOCK_CORRECTION (allowed)**
    - Input: STOCK_CORRECTION with negative amount
    - Assert: Success (negative amount may be valid for corrections)

#### `listActivities` Tests

1. **Success path with activities**

    - Mock: `mockActivityRepo.list.mockResolvedValue([activity1, activity2])`
    - Assert: Returns activities array

2. **Success path with empty array**

    - Mock: `mockActivityRepo.list.mockResolvedValue([])`
    - Assert: Returns empty array

3. **Repository error propagation**
    - Mock: `mockActivityRepo.list.mockRejectedValue(error)`
    - Assert: Error propagated

#### `updateActivity` Tests

1. **Success path with valid partial updates**

    - Mock: `mockActivityRepo.update.mockResolvedValue(updatedActivity)`
    - Assert: Repository called with correct updates

2. **Validation error: updating type to SALE without productId**

    - Input: Update with `type: SALE` but no productId
    - Assert: Throws validation error

3. **Validation error: removing productId from SALE activity**

    - Input: Update with `productId: undefined` for existing SALE activity
    - Assert: Throws validation error (may need to fetch existing activity first)

4. **Validation error: invalid date format in updates**

    - Input: Update with invalid date string
    - Assert: Throws validation error

5. **Repository error: activity not found**

    - Mock: `mockActivityRepo.update.mockRejectedValue(notFoundError)`
    - Assert: Error propagated

6. **Edge case: empty updates object**
    - Input: `{}` updates
    - Assert: Success (no-op update)

#### `computeStockFromActivities` Tests

1. **Success path: multiple products with activities**

    - Mock: Activities for product1 (qty: +10, -5) and product2 (qty: +20, -3)
    - Assert: Returns `{ product1: 5, product2: 17 }`

2. **Success path: single product filter**

    - Input: `productId` parameter
    - Mock: Activities filtered by productId
    - Assert: Returns stock only for filtered product

3. **Success path: empty activity list**

    - Mock: `mockActivityRepo.list.mockResolvedValue([])`
    - Assert: Returns empty map `{}`

4. **Activities without productId filtered out**

    - Mock: Activities with and without productId
    - Assert: Only activities with productId included in calculation

5. **Zero quantity handled correctly**

    - Mock: Activity with quantity: 0
    - Assert: Zero included in sum (doesn't break calculation)

6. **Multiple activities for same product summed**

    - Mock: 3 activities for same product (qty: +5, -2, +10)
    - Assert: Stock = 13

7. **Edge case: all positive quantities**

    - Mock: Only positive quantity activities
    - Assert: Stock is sum of all positives

8. **Edge case: all negative quantities**

    - Mock: Only negative quantity activities
    - Assert: Stock is negative sum

9. **Repository error propagation**
    - Mock: `mockActivityRepo.list.mockRejectedValue(error)`
    - Assert: Error propagated

#### `computeProfit` Tests

1. **Success path: multiple sales with products**

    - Mock: 2 SALE activities with products (salePrice: 20, unitCost: 10, qty: -2 each)
    - Assert: Profit = (20-10)*2 + (20-10)*2 = 40

2. **Success path: date range filtering**

    - Input: `startDate` and `endDate` parameters
    - Mock: Activities filtered by date range
    - Assert: Only sales in range included

3. **Success path: empty SALE activity list**

    - Mock: No SALE activities
    - Assert: Returns 0

4. **Correct profit formula: (salePrice - unitCost) \* abs(quantity)**

    - Mock: Sale with salePrice: 25, unitCost: 15, quantity: -3
    - Assert: Profit = (25-15)\*3 = 30

5. **Negative quantity handled (uses absolute value)**

    - Mock: Sale with quantity: -5
    - Assert: Uses 5 in calculation (not -5)

6. **Missing product handling**

    - Mock: SALE activity with productId, but product not found
    - Assert: Filters out or throws error (based on AC decision)

7. **Date range validation error: invalid startDate**

    - Input: Invalid ISO 8601 startDate
    - Assert: Throws validation error

8. **Date range validation error: invalid endDate**

    - Input: Invalid ISO 8601 endDate
    - Assert: Throws validation error

9. **Repository error propagation**

    - Mock: `mockActivityRepo.list.mockRejectedValue(error)`
    - Assert: Error propagated

10. **Edge case: zero profit sale (salePrice = unitCost)**

    - Mock: Sale with salePrice: 10, unitCost: 10
    - Assert: Profit = 0 (included in sum)

11. **Edge case: multiple sales for same product**
    - Mock: 2 sales for same product
    - Assert: Both sales included in profit calculation

### Mocks & Fixtures

**Mock Activities:**

-   `createMockActivity({ type, productId, quantity, amount, date })` - Helper to create test activities
-   Sample activities for each ActivityType (CREATION, SALE, STOCK_CORRECTION, OTHER)

**Mock Products:**

-   `createMockProduct({ id, salePrice, unitCost })` - Helper to create test products
-   Sample products with different price points

**Mock Repositories:**

-   `createMockActivityRepository()` - Already exists
-   `createMockProductRepository()` - Verify exists or create

### Coverage Targets

-   **Line Coverage:** >90%
-   **Branch Coverage:** >85%
-   **Function Coverage:** 100% (all usecases tested)

### Test Mapping: AC → Tests

| Sub-Ticket | AC                                      | Test Case |
| ---------- | --------------------------------------- | --------- |
| 9.1        | Validate productId for SALE             | Test 3    |
| 9.1        | Validate productId for STOCK_CORRECTION | Test 4    |
| 9.1        | Validate date format                    | Test 5    |
| 9.1        | Validate quantity                       | Test 6    |
| 9.1        | Validate amount                         | Test 7    |
| 9.2        | Return activities array                 | Test 1    |
| 9.2        | Return empty array                      | Test 2    |
| 9.3        | Validate updates                        | Tests 2-4 |
| 9.4        | Compute stock per product               | Test 1    |
| 9.4        | Filter by productId                     | Test 2    |
| 9.4        | Handle empty list                       | Test 3    |
| 9.5        | Calculate profit formula                | Test 4    |
| 9.5        | Date range filtering                    | Test 2    |
| 9.5        | Handle missing products                 | Test 6    |

### Status

**Status:** ✅ `tests: approved` - All test cases implemented and passing (56 tests, 96.11% line coverage, 92.3% branch coverage, 100% function coverage)

## Agent Prompts

### Unit Test Coach Prompt

```
@Unit Test Coach

Create comprehensive unit test specifications for activity usecases following TDD principles.

Context:
- Ticket: FBC-9 (Implement core usecases for activities and analytics)
- Usecases to test: addActivity, listActivities, updateActivity, computeStockFromActivities, computeProfit
- Test file: __tests__/core/usecases/activity.test.ts
- Mock repositories: __mocks__/core/ports/activityRepository.ts (exists), verify productRepository mock exists

Requirements:
1. Create test file structure with describe blocks for each usecase
2. Define test cases covering all acceptance criteria from sub-tickets 9.1-9.5
3. Document mock data patterns and fixtures needed
4. Include edge cases and error scenarios
5. Map acceptance criteria to test cases
6. Define coverage targets (>90% line coverage)

Follow existing test patterns from __tests__/core/usecases/auth.test.ts for consistency.

Output: Complete test specification ready for implementation (status: tests: approved).
```

### Architecture-Aware Dev Prompt

```
@Architecture-Aware Dev

Implement activity usecases following Clean Architecture principles.

Context:
- Ticket: FBC-9 (Implement core usecases for activities and analytics)
- File: src/core/usecases/activity.ts
- Dependencies: ActivityRepository port, ProductRepository port (for computeProfit)

Usecases to implement:
1. addActivity(repo: ActivityRepository, activity: Omit<Activity, 'id'>): Promise<Activity>
2. listActivities(repo: ActivityRepository): Promise<Activity[]>
3. updateActivity(repo: ActivityRepository, id: ActivityId, updates: Partial<Activity>): Promise<Activity>
4. computeStockFromActivities(repo: ActivityRepository, productId?: ProductId): Promise<Record<ProductId, number>>
5. computeProfit(activityRepo: ActivityRepository, productRepo: ProductRepository, startDate?: string, endDate?: string): Promise<number>

Critical Rules:
- NO direct Supabase/React imports
- Accept repository ports as parameters
- Validate business rules (productId required for SALE/STOCK_CORRECTION)
- Throw meaningful validation errors
- Document all errors in JSDoc with @throws tags
- Use domain validation functions from src/core/domain/validation.ts
- Follow patterns from src/core/usecases/auth.ts

Test-First: Unit test specifications are approved in plan. Implement tests first, then usecases.

Output: Complete implementation with all usecases, validation, error handling, and JSDoc documentation.
```

### QA & Test Coach Prompt

```
@QA & Test Coach

Create test plan and verify activity usecases implementation.

Context:
- Ticket: FBC-9 (Implement core usecases for activities and analytics)
- Implementation: src/core/usecases/activity.ts
- Tests: __tests__/core/usecases/activity.test.ts

Verification Tasks:
1. Review unit test coverage (target: >90% line coverage)
2. Verify all acceptance criteria from sub-tickets 9.1-9.5 are tested
3. Check error handling scenarios are covered
4. Verify edge cases are tested (zero quantities, missing products, invalid dates)
5. Review test data fixtures and mocks
6. Verify test structure follows existing patterns

Test Scenarios to Verify:
- addActivity: validation errors, success paths, repository errors
- listActivities: empty list, error propagation
- updateActivity: partial updates, validation, business rule enforcement
- computeStockFromActivities: stock calculation, filtering, edge cases
- computeProfit: profit formula, date filtering, missing products

Output: Test verification report with coverage metrics and any gaps identified.
```

### Architecture Guardian Prompt

```
@Architecture Guardian

Verify Clean Architecture compliance for activity usecases implementation.

Context:
- Ticket: FBC-9 (Implement core usecases for activities and analytics)
- Files: src/core/usecases/activity.ts, __tests__/core/usecases/activity.test.ts

Compliance Checks:
1. ✅ No Supabase imports in usecases
2. ✅ No React/Next.js imports in usecases
3. ✅ Repository ports used as parameters (not direct infrastructure)
4. ✅ Domain types used (Activity, ProductId, ActivityType)
5. ✅ Domain validation functions used
6. ✅ Pure functions (no side effects except repository calls)
7. ✅ Errors thrown meaningfully
8. ✅ JSDoc documentation complete
9. ✅ Tests use mocked repositories (no real infrastructure)
10. ✅ Layer separation respected (usecases → ports → infrastructure)

Architecture Violations to Check:
- Direct Supabase client usage
- React hooks or components in usecases
- Business logic in wrong layer
- Missing repository parameter pattern
- Hardcoded infrastructure dependencies

Output: Architecture compliance report with any violations and recommendations.
```

## Open Questions

1. **Missing Product Handling in `computeProfit`:**

    - **Question:** Should `computeProfit` filter out SALE activities with missing products, or throw an error?
    - **Recommendation:** Filter out with a warning log (non-blocking), but document this behavior. Alternative: throw error for data integrity.

2. **Date Range Filtering Implementation:**

    - **Question:** Should date range filtering be done in the usecase (filtering all activities) or in the repository (more efficient)?
    - **Recommendation:** Start with usecase-level filtering for simplicity. Can optimize later with repository-level filtering if performance becomes an issue.

3. **Return Type for `computeStockFromActivities`:**

    - **Question:** Should return type be `Record<ProductId, number>` or `Map<ProductId, number>`?
    - **Recommendation:** Use `Record<ProductId, number>` for JSON serialization compatibility (better for React Query caching).

4. **Performance Considerations:**

    - **Question:** Should we add pagination/filtering parameters to `computeStockFromActivities` and `computeProfit` now, or wait for performance issues?
    - **Recommendation:** Wait for performance issues. Document current approach and add pagination in future iteration if needed.

5. **Product Repository Dependency:**
    - **Question:** For `computeProfit`, should we batch product lookups or fetch individually?
    - **Recommendation:** Start with individual lookups for simplicity. Optimize with batching if performance becomes an issue (can use `ProductRepository.list()` and filter in memory).

## MVP Cut List

If time/budget constraints require cutting scope:

**Must Have (Core Functionality):**

-   ✅ `addActivity` (Sub-Ticket 9.1)
-   ✅ `listActivities` (Sub-Ticket 9.2)
-   ✅ `updateActivity` (Sub-Ticket 9.3)

**Should Have (Analytics):**

-   ⚠️ `computeStockFromActivities` (Sub-Ticket 9.4) - Can be deferred if stock tracking is handled elsewhere
-   ⚠️ `computeProfit` (Sub-Ticket 9.5) - Can be deferred if profit calculation is not immediately needed

**Nice to Have (Optimizations):**

-   Date range filtering in `computeProfit` (can be added later)
-   Batch product lookups in `computeProfit` (performance optimization)

**Recommendation:** Implement all 5 usecases as they are foundational for the activity tracking feature. Analytics usecases (`computeStockFromActivities`, `computeProfit`) are core to the ticket's value proposition.
