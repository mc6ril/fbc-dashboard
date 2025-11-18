---
Generated: 2025-01-27 14:30:00
Report Type: planning
Command: pm-plan-from-ticket
Ticket: FBC-11
---

# Implementation Plan: FBC-11 - Implement Supabase Repositories for Activity and Product

## Summary

### Goal

Implement concrete Supabase repository implementations for `ActivityRepository` and `ProductRepository` ports, enabling usecases to interact with real persisted data in Supabase.

### User Value

-   Developers can use real database operations instead of mocks
-   Usecases can persist and retrieve activities and products from Supabase
-   Foundation for full CRUD operations on domain entities

### Constraints

-   Must conform exactly to port interfaces defined in `core/ports/`
-   Strict mapping from Supabase snake_case columns to domain camelCase fields
-   Errors must be propagated (no silent failures)
-   No UI or React imports in infrastructure layer
-   Use existing Supabase client from `infrastructure/supabase/client.ts`
-   Keep mapping functions small and testable

### Non-Goals

-   Pagination and filtering (basic versions only if needed for MVP)
-   Performance optimization beyond basic query patterns
-   Complex error transformation (basic error propagation is sufficient)
-   RLS (Row Level Security) policies (assumed to be handled separately)

## Assumptions & Risks

### Assumptions

1. **Database Schema**: Tables `products` and `activities` exist in Supabase (created by FBC-10)
2. **Column Mapping**: Supabase columns use snake_case (e.g., `product_id`, `unit_cost`) while domain uses camelCase (e.g., `productId`, `unitCost`)
3. **Type Conversion**:
    - Supabase `NUMERIC` fields map to TypeScript `number`
    - Supabase `TIMESTAMPTZ` maps to ISO 8601 strings in domain
    - Supabase `UUID` maps to branded string types (`ActivityId`, `ProductId`)
4. **Error Handling**: Supabase errors are propagated as generic `Error` objects (no custom error types needed for MVP)
5. **Null Handling**: `product_id` in activities can be `NULL` (maps to optional `productId?` in domain)
6. **Enum Values**: Supabase stores enums as `TEXT` with CHECK constraints, matching domain enum string values

### Risks

1. **Type Mismatches**: Risk of incorrect mapping between Supabase types and domain types
    - **Mitigation**: Comprehensive mapping functions with explicit type conversions and validation
2. **Error Propagation**: Supabase errors may not be user-friendly
    - **Mitigation**: Basic error transformation to preserve error messages, let usecases handle domain-specific errors
3. **Missing Data**: Supabase may return incomplete data
    - **Mitigation**: Validate required fields in mapping functions, throw errors on missing data
4. **Performance**: No pagination may cause issues with large datasets
    - **Mitigation**: Acceptable for MVP, can be added later if needed
5. **Database Constraints**: Supabase constraints may conflict with domain validation
    - **Mitigation**: Document any assumptions, let database constraints serve as additional validation layer

## Solution Outline (Aligned with Architecture)

### Architecture Flow

```
Presentation (Hooks)
    ↓ calls
Usecases (activity.ts, product.ts)
    ↓ calls
Repositories (activityRepositorySupabase, productRepositorySupabase)
    ↓ calls
Supabase Client (infrastructure/supabase/client.ts)
    ↓ calls
Supabase Database
```

### Implementation Strategy

1. **Mapping Functions**: Create pure mapping functions to convert between Supabase rows and domain types

    - `mapSupabaseRowToActivity`: Maps Supabase `activities` row → `Activity` domain type
    - `mapActivityToSupabaseRow`: Maps `Activity` domain type → Supabase insert/update payload
    - `mapSupabaseRowToProduct`: Maps Supabase `products` row → `Product` domain type
    - `mapProductToSupabaseRow`: Maps `Product` domain type → Supabase insert/update payload

2. **Repository Implementation**: Implement port interfaces with Supabase queries

    - Use `supabaseClient.from("activities")` and `supabaseClient.from("products")`
    - Handle Supabase response patterns: `{ data, error }`
    - Propagate errors, return domain types

3. **Error Handling**: Transform Supabase errors to generic `Error` objects

    - Preserve error messages for debugging
    - Let usecases handle domain-specific error transformation

4. **Testing Strategy**: Test through usecases with mocked repositories (as per DoD)
    - Additional integration-style tests for mapping functions (optional but recommended)

### File Structure

```
src/infrastructure/supabase/
├── activityRepositorySupabase.ts  (new)
├── productRepositorySupabase.ts   (new)
└── client.ts                      (existing)
```

## Sub-Tickets

### Sub-Ticket 11.1

**Title:** Unit Test Spec for activityRepositorySupabase

**Rationale:**
Following test-first protocol, we need to define test specifications before implementation. This ensures we understand the expected behavior and edge cases upfront.

**Acceptance Criteria:**

-   [x] Test spec document created in `__tests__/core/infrastructure/supabase/activityRepositorySupabase.test.ts`
-   [x] Test cases defined for all repository methods: `list()`, `getById()`, `create()`, `update()`
-   [x] Test cases cover success paths (empty results, single results, multiple results)
-   [x] Test cases cover error paths (Supabase errors, missing data, invalid mappings)
-   [x] Test cases cover edge cases (null productId, optional fields, type conversions)
-   [x] Mock Supabase client responses defined
-   [x] Mapping function tests defined (if extracted to separate functions)
-   [x] Test spec reviewed and approved

**Definition of Done:**

-   [x] Test spec document complete with all test cases
-   [x] Test cases mapped to repository method contracts
-   [x] Edge cases and error scenarios documented
-   [x] Mock data structures defined
-   [x] Test spec approved by team/reviewer

**Estimated Effort:** 2h

**Dependencies:** None

**Owner:** Unit Test Coach

**Risk Notes:** Risk of missing edge cases in test spec. Mitigation: Review existing usecase tests for similar patterns, check Supabase client documentation for error patterns.

---

### Sub-Ticket 11.2

**Title:** Implement activityRepositorySupabase

**Rationale:**
Implement the concrete Supabase repository for activities, enabling persistence and retrieval of activity data from the database.

**Acceptance Criteria:**

-   [x] File created: `src/infrastructure/supabase/activityRepositorySupabase.ts`
-   [x] Implements `ActivityRepository` interface exactly
-   [x] `list()` method implemented: queries all activities, maps to domain types, returns empty array if none
-   [x] `getById(id)` method implemented: queries by ID, maps to domain type, returns `null` if not found
-   [x] `create(activity)` method implemented: inserts activity, maps domain to Supabase row, returns created activity with generated ID
-   [x] `update(id, updates)` method implemented: updates activity by ID, handles partial updates, returns updated activity
-   [x] Mapping functions implemented: `mapSupabaseRowToActivity`, `mapActivityToSupabaseRow` (or inline if simple)
-   [x] Column mapping documented: snake_case → camelCase (e.g., `product_id` → `productId`, `date` → `date` as ISO string)
-   [x] Error handling: Supabase errors propagated as `Error` objects (no silent failures)
-   [x] Null handling: `product_id` NULL maps to optional `productId?` in domain
-   [x] Type conversions: NUMERIC → number, TIMESTAMPTZ → ISO 8601 string, UUID → ActivityId
-   [x] No UI or React imports
-   [x] Uses existing `supabaseClient` from `infrastructure/supabase/client.ts`

**Definition of Done:**

-   [x] All repository methods implemented and conform to port interface
-   [x] Mapping functions handle all field conversions correctly
-   [x] Error propagation tested (no silent failures)
-   [x] Code follows existing patterns from `authRepositorySupabase.ts`
-   [x] TypeScript strict mode passes
-   [x] Linter passes
-   [x] Code reviewed

**Estimated Effort:** 4h

**Dependencies:** Sub-Ticket 11.1 (test spec approved)

**Owner:** Architecture-Aware Dev

**Risk Notes:** Risk of incorrect type mappings. Mitigation: Reference database schema from FBC-10, test with real Supabase data, validate mapping functions thoroughly.

---

### Sub-Ticket 11.3

**Title:** Unit Test Spec for productRepositorySupabase

**Rationale:**
Following test-first protocol, we need to define test specifications before implementation. This ensures we understand the expected behavior and edge cases upfront.

**Acceptance Criteria:**

-   [x] Test spec document created in `__tests__/core/infrastructure/supabase/productRepositorySupabase.test.ts`
-   [x] Test cases defined for all repository methods: `list()`, `getById()`, `create()`, `update()`
-   [x] Test cases cover success paths (empty results, single results, multiple results)
-   [x] Test cases cover error paths (Supabase errors, missing data, invalid mappings)
-   [x] Test cases cover edge cases (optional weight field, type conversions, numeric precision)
-   [x] Mock Supabase client responses defined
-   [x] Mapping function tests defined (if extracted to separate functions)
-   [x] Test spec reviewed and approved

**Definition of Done:**

-   [x] Test spec document complete with all test cases
-   [x] Test cases mapped to repository method contracts
-   [x] Edge cases and error scenarios documented
-   [x] Mock data structures defined
-   [x] Test spec approved by team/reviewer

**Estimated Effort:** 2h

**Dependencies:** None (can be done in parallel with 11.1)

**Owner:** Unit Test Coach

**Risk Notes:** Risk of missing edge cases in test spec. Mitigation: Review existing usecase tests for similar patterns, check Supabase client documentation for error patterns.

---

### Sub-Ticket 11.4

**Title:** Implement productRepositorySupabase

**Rationale:**
Implement the concrete Supabase repository for products, enabling persistence and retrieval of product data from the database.

**Acceptance Criteria:**

-   [x] File created: `src/infrastructure/supabase/productRepositorySupabase.ts`
-   [x] Implements `ProductRepository` interface exactly
-   [x] `list()` method implemented: queries all products, maps to domain types, returns empty array if none
-   [x] `getById(id)` method implemented: queries by ID, maps to domain type, returns `null` if not found
-   [x] `create(product)` method implemented: inserts product, maps domain to Supabase row, returns created product with generated ID
-   [x] `update(id, updates)` method implemented: updates product by ID, handles partial updates, returns updated product
-   [x] Mapping functions implemented: `mapSupabaseRowToProduct`, `mapProductToSupabaseRow` (or inline if simple)
-   [x] Column mapping documented: snake_case → camelCase (e.g., `unit_cost` → `unitCost`, `sale_price` → `salePrice`, `weight` → `weight?`)
-   [x] Error handling: Supabase errors propagated as `Error` objects (no silent failures)
-   [x] Null handling: `weight` NULL maps to optional `weight?` in domain
-   [x] Type conversions: NUMERIC → number, UUID → ProductId, TEXT enum → ProductType enum
-   [x] No UI or React imports
-   [x] Uses existing `supabaseClient` from `infrastructure/supabase/client.ts`

**Definition of Done:**

-   [x] All repository methods implemented and conform to port interface
-   [x] Mapping functions handle all field conversions correctly
-   [x] Error propagation tested (no silent failures)
-   [x] Code follows existing patterns from `authRepositorySupabase.ts`
-   [x] TypeScript strict mode passes
-   [x] Linter passes
-   [x] Code reviewed

**Estimated Effort:** 4h

**Dependencies:** Sub-Ticket 11.3 (test spec approved)

**Owner:** Architecture-Aware Dev

**Risk Notes:** Risk of incorrect type mappings, especially for NUMERIC precision. Mitigation: Reference database schema from FBC-10, test with real Supabase data, validate numeric conversions.

---

### Sub-Ticket 11.5

**Title:** Manual Smoke Testing of Repository Implementations

**Rationale:**
Verify that repository implementations work correctly with real Supabase database through manual testing. This ensures end-to-end functionality before integration with usecases.

**Acceptance Criteria:**

-   [x] Smoke test script or page created for manual testing
-   [x] Test `list()` for both repositories (empty and populated states)
-   [x] Test `getById()` for both repositories (existing and non-existing IDs)
-   [x] Test `create()` for both repositories (valid data, verify generated IDs)
-   [x] Test `update()` for both repositories (partial updates, full updates)
-   [x] Verify error handling (invalid data, database errors)
-   [x] Verify mapping correctness (check Supabase database directly)
-   [x] Document any issues or discrepancies found

**Definition of Done:**

-   [x] All CRUD operations tested manually
-   [x] No critical issues found
-   [x] Mapping verified against database
-   [x] Error handling verified
-   [x] Smoke test results documented

**Estimated Effort:** 2h

**Dependencies:** Sub-Ticket 11.2, Sub-Ticket 11.4 (both repositories implemented)

**Owner:** Architecture-Aware Dev or QA & Test Coach

**Risk Notes:** Risk of discovering mapping issues late. Mitigation: Test early and often, verify against database schema.

---

## Unit Test Spec (Test-First Protocol)

### Test Files & Paths

#### Activity Repository Tests

-   **File**: `__tests__/core/infrastructure/supabase/activityRepositorySupabase.test.ts`
-   **Mocks**: `__mocks__/infrastructure/supabase/client.ts` (mock Supabase client)
-   **Fixtures**: `__mocks__/core/domain/activity.ts` (existing domain mocks)

#### Product Repository Tests

-   **File**: `__tests__/core/infrastructure/supabase/productRepositorySupabase.test.ts`
-   **Mocks**: `__mocks__/infrastructure/supabase/client.ts` (mock Supabase client)
-   **Fixtures**: `__mocks__/core/domain/product.ts` (existing domain mocks)

### Test Structure

#### Activity Repository Test Cases

**describe("activityRepositorySupabase")**

1.  **describe("list()")**

    -   `it("should return empty array when no activities exist")`
    -   `it("should return all activities mapped to domain types")`
    -   `it("should handle activities with null product_id")`
    -   `it("should handle activities with product_id")`
    -   `it("should propagate Supabase errors")`
    -   `it("should map all fields correctly (id, date, type, productId, quantity, amount, note)")`

2.  **describe("getById(id)")**

    -   `it("should return activity when found")`
    -   `it("should return null when not found")`
    -   `it("should map activity to domain type correctly")`
    -   `it("should handle null product_id")`
    -   `it("should propagate Supabase errors")`

3.  **describe("create(activity)")**

    -   `it("should create activity and return with generated ID")`
    -   `it("should map domain type to Supabase row correctly")`
    -   `it("should handle optional productId (null in database)")`
    -   `it("should handle optional note (null in database)")`
    -   `it("should convert date ISO string to TIMESTAMPTZ")`
    -   `it("should propagate Supabase errors")`
    -   `it("should handle validation errors from database constraints")`

4.  **describe("update(id, updates)")**

    -   `it("should update activity and return updated activity")`
    -   `it("should handle partial updates")`
    -   `it("should map updates to Supabase row correctly")`
    -   `it("should handle setting productId to null")`
    -   `it("should handle removing note (set to null)")`
    -   `it("should throw error when activity not found")`
    -   `it("should propagate Supabase errors")`

5.  **describe("mapping functions")** (if extracted)
    -   `it("mapSupabaseRowToActivity: should map all fields correctly")`
    -   `it("mapSupabaseRowToActivity: should handle null product_id")`
    -   `it("mapSupabaseRowToActivity: should handle null note")`
    -   `it("mapActivityToSupabaseRow: should map all fields correctly")`
    -   `it("mapActivityToSupabaseRow: should handle optional productId")`
    -   `it("mapActivityToSupabaseRow: should handle optional note")`

#### Product Repository Test Cases

**describe("productRepositorySupabase")**

1.  **describe("list()")**

    -   `it("should return empty array when no products exist")`
    -   `it("should return all products mapped to domain types")`
    -   `it("should handle products with null weight")`
    -   `it("should handle products with weight")`
    -   `it("should propagate Supabase errors")`
    -   `it("should map all fields correctly (id, name, type, coloris, unitCost, salePrice, stock, weight)")`

2.  **describe("getById(id)")**

    -   `it("should return product when found")`
    -   `it("should return null when not found")`
    -   `it("should map product to domain type correctly")`
    -   `it("should handle null weight")`
    -   `it("should propagate Supabase errors")`

3.  **describe("create(product)")**

    -   `it("should create product and return with generated ID")`
    -   `it("should map domain type to Supabase row correctly")`
    -   `it("should handle optional weight (null in database)")`
    -   `it("should convert numeric fields correctly (unitCost, salePrice, stock, weight)")`
    -   `it("should convert ProductType enum to TEXT")`
    -   `it("should propagate Supabase errors")`
    -   `it("should handle validation errors from database constraints")`

4.  **describe("update(id, updates)")**

    -   `it("should update product and return updated product")`
    -   `it("should handle partial updates")`
    -   `it("should map updates to Supabase row correctly")`
    -   `it("should handle setting weight to null")`
    -   `it("should handle removing weight (set to null)")`
    -   `it("should throw error when product not found")`
    -   `it("should propagate Supabase errors")`

5.  **describe("mapping functions")** (if extracted)
    -   `it("mapSupabaseRowToProduct: should map all fields correctly")`
    -   `it("mapSupabaseRowToProduct: should handle null weight")`
    -   `it("mapSupabaseRowToProduct: should convert NUMERIC to number")`
    -   `it("mapProductToSupabaseRow: should map all fields correctly")`
    -   `it("mapProductToSupabaseRow: should handle optional weight")`
    -   `it("mapProductToSupabaseRow: should convert number to NUMERIC")`

### Mocks & Fixtures

#### Supabase Client Mock

```typescript
// __mocks__/infrastructure/supabase/client.ts
export const supabaseClient = {
    from: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(),
    })),
};
```

#### Test Data Fixtures

-   Use existing mocks from `__mocks__/core/domain/activity.ts` and `__mocks__/core/domain/product.ts`
-   Create Supabase row fixtures that match database schema (snake_case)

### Edge Cases

1.  **Null Handling**: `product_id` in activities, `weight` in products
2.  **Type Conversions**: NUMERIC → number, TIMESTAMPTZ → ISO string, UUID → branded types
3.  **Enum Conversions**: TEXT → enum values
4.  **Empty Results**: Empty arrays, null results
5.  **Error Scenarios**: Database errors, constraint violations, network errors
6.  **Partial Updates**: Updating only some fields, setting optional fields to null

### Coverage Target

-   **Line Coverage**: ≥ 90%
-   **Branch Coverage**: ≥ 85%
-   **Function Coverage**: 100%

### Mapping AC → Tests

| Acceptance Criteria                     | Test Cases                                                      |
| --------------------------------------- | --------------------------------------------------------------- |
| `list()` returns empty array            | `list(): should return empty array when no activities exist`    |
| `list()` maps to domain types           | `list(): should map all fields correctly`                       |
| `getById()` returns null when not found | `getById(): should return null when not found`                  |
| `getById()` maps to domain type         | `getById(): should map activity to domain type correctly`       |
| `create()` returns with generated ID    | `create(): should create activity and return with generated ID` |
| `create()` maps domain to Supabase      | `create(): should map domain type to Supabase row correctly`    |
| `update()` handles partial updates      | `update(): should handle partial updates`                       |
| Errors propagated                       | All `should propagate Supabase errors` tests                    |

### Status

**Status**: `tests: proposed`

Tests will be approved before implementation begins (Sub-Tickets 11.1 and 11.3).

---

## Agent Prompts

### Unit Test Coach

```
@Unit Test Coach

Generate unit test specifications for Supabase repository implementations following test-first protocol.

**Context:**
- Ticket: FBC-11 - Implement Supabase Repositories for Activity and Product
- Need test specs for: `activityRepositorySupabase` and `productRepositorySupabase`
- Test files: `__tests__/core/infrastructure/supabase/activityRepositorySupabase.test.ts` and `__tests__/core/infrastructure/supabase/productRepositorySupabase.test.ts`

**Requirements:**
1. Test all repository methods: `list()`, `getById()`, `create()`, `update()`
2. Cover success paths, error paths, and edge cases
3. Mock Supabase client responses
4. Test mapping functions (if extracted) or inline mapping logic
5. Follow existing test patterns from `__tests__/core/usecases/activity.test.ts`
6. Use existing domain mocks from `__mocks__/core/domain/`

**Key Test Scenarios:**
- Empty results (empty arrays, null results)
- Type conversions (NUMERIC → number, TIMESTAMPTZ → ISO string, UUID → branded types)
- Null handling (product_id in activities, weight in products)
- Error propagation (Supabase errors, constraint violations)
- Partial updates (updating only some fields)

**Deliverables:**
- Complete test spec documents with all test cases
- Mock structures for Supabase client
- Test data fixtures
- Coverage targets

Reference: Implementation plan in `report/planning/plan-fbc-11-implement-supabase-repositories.md`
```

### Architecture-Aware Dev

```
@Architecture-Aware Dev

Implement Supabase repository for {Activity|Product} following Clean Architecture principles.

**Context:**
- Ticket: FBC-11 - Implement Supabase Repositories for Activity and Product
- Implement: `src/infrastructure/supabase/{activity|product}RepositorySupabase.ts`
- Must implement: `{Activity|Product}Repository` interface from `core/ports/`

**Requirements:**
1. Implement all methods: `list()`, `getById()`, `create()`, `update()`
2. Map between Supabase snake_case columns and domain camelCase fields
3. Handle type conversions: NUMERIC → number, TIMESTAMPTZ → ISO string, UUID → branded types
4. Propagate errors (no silent failures)
5. Use existing `supabaseClient` from `infrastructure/supabase/client.ts`
6. Follow patterns from `infrastructure/supabase/authRepositorySupabase.ts`
7. No UI or React imports

**Database Schema:**
- Activities table: `id`, `product_id`, `type`, `date`, `quantity`, `amount`, `note`
- Products table: `id`, `name`, `type`, `coloris`, `unit_cost`, `sale_price`, `stock`, `weight`, `created_at`

**Column Mappings:**
- Activities: `product_id` → `productId?`, `date` → `date` (ISO string)
- Products: `unit_cost` → `unitCost`, `sale_price` → `salePrice`, `weight` → `weight?`

**Key Implementation Notes:**
- Extract mapping functions if complex, inline if simple
- Handle null values for optional fields (`product_id`, `weight`, `note`)
- Convert Supabase `{ data, error }` responses to domain types or errors
- Document any assumptions in code comments

**Reference:**
- Port interface: `core/ports/{activity|product}Repository.ts`
- Domain types: `core/domain/{activity|product}.ts`
- Database schema: `infrastructure/supabase/migrations/001_create_domain_tables.sql`
- Test spec: `__tests__/core/infrastructure/supabase/{activity|product}RepositorySupabase.test.ts` (if available)
- Implementation plan: `report/planning/plan-fbc-11-implement-supabase-repositories.md`
```

### QA & Test Coach

```
@QA & Test Coach

Create manual smoke test plan for Supabase repository implementations.

**Context:**
- Ticket: FBC-11 - Implement Supabase Repositories for Activity and Product
- Repositories: `activityRepositorySupabase`, `productRepositorySupabase`
- Need: Manual testing strategy to verify end-to-end functionality

**Requirements:**
1. Create smoke test script or test page for manual testing
2. Test all CRUD operations: `list()`, `getById()`, `create()`, `update()`
3. Verify mapping correctness (check Supabase database directly)
4. Test error handling (invalid data, database errors)
5. Document test results and any issues found

**Test Scenarios:**
- Empty database state (no data)
- Populated database state (with data)
- Valid data creation
- Invalid data handling
- Partial updates
- Error propagation

**Deliverables:**
- Smoke test script or test page
- Test execution results
- Issue documentation (if any)

**Reference:**
- Implementation plan: `report/planning/plan-fbc-11-implement-supabase-repositories.md`
- Repository files: `infrastructure/supabase/{activity|product}RepositorySupabase.ts`
```

### Architecture Guardian

```
@Architecture Guardian

Verify architecture compliance for Supabase repository implementations.

**Context:**
- Ticket: FBC-11 - Implement Supabase Repositories for Activity and Product
- Files to review: `src/infrastructure/supabase/activityRepositorySupabase.ts`, `src/infrastructure/supabase/productRepositorySupabase.ts`

**Compliance Checks:**
1. ✅ Layer separation: Infrastructure layer only, no UI/React imports
2. ✅ Port conformance: Implementations match port interfaces exactly
3. ✅ Domain types: Return domain types, not Supabase types
4. ✅ Error handling: Errors propagated (no silent failures)
5. ✅ Mapping: Clear mapping between Supabase and domain types
6. ✅ Dependencies: Only imports from domain, ports, and Supabase client
7. ✅ Code quality: TypeScript strict, no `any`, proper types

**Key Violations to Check:**
- ❌ Importing React, Next.js, or UI components
- ❌ Returning Supabase types instead of domain types
- ❌ Silent error handling (swallowing errors)
- ❌ Business logic in infrastructure (should be in usecases)
- ❌ Direct Supabase calls from usecases (should go through repositories)

**Reference:**
- Port interfaces: `core/ports/{activity|product}Repository.ts`
- Domain types: `core/domain/{activity|product}.ts`
- Implementation plan: `report/planning/plan-fbc-11-implement-supabase-repositories.md`
- Architecture rules: `.cursor/rules/` (Clean Architecture rules)
```

---

## Open Questions

1. **Error Types**: Should we create custom error types for repository errors, or use generic `Error` objects? (Assumption: Generic `Error` for MVP, can be enhanced later)

2. **Pagination**: Do we need pagination for `list()` methods? (Assumption: No for MVP, can be added later if needed)

3. **Filtering**: Do we need filtering parameters for `list()` methods? (Assumption: No for MVP, can be added later if needed)

4. **Transaction Support**: Do we need transaction support for multi-step operations? (Assumption: No for MVP, usecases handle orchestration)

5. **Caching**: Should repositories implement caching, or is React Query sufficient? (Assumption: React Query handles caching, repositories are stateless)

6. **RLS Policies**: Are Row Level Security policies already configured in Supabase? (Assumption: Yes, handled separately, not part of this ticket)

---

## MVP Cut List

If time is limited, the following can be deferred:

1. **Comprehensive Error Transformation**: Basic error propagation is sufficient for MVP
2. **Pagination**: Can be added later when needed
3. **Filtering**: Can be added later when needed
4. **Performance Optimization**: Basic queries are sufficient for MVP
5. **Integration Tests**: Unit tests through usecases are sufficient for MVP

**Core MVP Requirements (Must Have):**

-   ✅ Basic CRUD operations (`list`, `getById`, `create`, `update`)
-   ✅ Correct mapping between Supabase and domain types
-   ✅ Error propagation (no silent failures)
-   ✅ Manual smoke testing

---

## Estimated Total Effort

-   Sub-Ticket 11.1 (Test Spec - Activity): 2h
-   Sub-Ticket 11.2 (Implement - Activity): 4h
-   Sub-Ticket 11.3 (Test Spec - Product): 2h
-   Sub-Ticket 11.4 (Implement - Product): 4h
-   Sub-Ticket 11.5 (Smoke Testing): 2h

**Total: 14 hours (~2 days)**

This aligns with the ticket's Story Points estimate of 5 points.
