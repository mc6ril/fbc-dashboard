---
Generated: 2025-01-27 14:30:22
Report Type: planning
Command: pm-plan-from-ticket
Ticket: FBC-8
---

## Summary

**Goal:** Define repository interfaces (ports) in `core/ports/` for Activity, Product, and StockMovement handling. These ports represent stable contracts for data access to be implemented by Supabase infrastructure layer.

**User value:** Clear separation of concerns enabling infrastructure implementations to be swapped without affecting business logic. Usecases can depend on stable contracts rather than concrete implementations.

**Constraints:**

-   Strict Clean Architecture: ports are contracts only, no implementations
-   All methods return domain types (`Activity`, `Product`, `StockMovement`)
-   Explicit error handling via thrown errors (documented in JSDoc)
-   Methods must support upcoming usecases (ticket FBC-9: `addActivity`, `listActivities`, `updateActivity`, `computeStockFromActivities`, `computeProfit`)
-   Keep method signatures minimal and purposeful for MVP (extendable later)
-   Follow existing `AuthRepository` pattern (interface-based, JSDoc contracts)

**Non-goals:**

-   Infrastructure implementations (Supabase repositories) - separate ticket
-   Query filtering beyond basic operations (can be added later)
-   Pagination support (can be added later)
-   Real-time subscriptions (can be added later if needed)

## Assumptions & Risks

**Assumptions:**

-   Domain types (`Activity`, `Product`, `StockMovement`) are already defined and stable
-   Upcoming usecases (FBC-9) will need: list, getById, create, update operations
-   Stock calculations will need querying stock movements by product
-   Error handling follows the pattern: throw errors (not return error objects)
-   Repository methods are async and return Promises
-   All IDs are branded types (`ActivityId`, `ProductId`, `StockMovementId`)

**Risks:**

-   **Risk:** Ticket mentions "Stock" but domain uses "StockMovement" - clarification needed
    -   **Mitigation:** Use `StockMovementRepository` to match domain naming, document the decision
-   **Risk:** Method signatures may be too minimal and need extension later
    -   **Mitigation:** Start with MVP operations, document extensibility in JSDoc
-   **Risk:** Query operations may need filtering (by date, type, productId) not included in MVP
    -   **Mitigation:** Start with basic list operations, add filtering methods later if needed
-   **Risk:** Error types not yet defined for these domains
    -   **Mitigation:** Document expected error behavior in JSDoc, use generic Error or domain-specific errors when available

## Solution Outline (aligned with architecture)

**Ports Layer (`src/core/ports/`):**

-   Create `activityRepository.ts` with `ActivityRepository` interface
-   Create `productRepository.ts` with `ProductRepository` interface
-   Create `stockMovementRepository.ts` with `StockMovementRepository` interface
-   Each interface defines CRUD and query operations needed by usecases
-   All methods return domain types from `core/domain/`
-   Error handling via thrown errors (documented in JSDoc with `@throws` tags)
-   Contract documentation includes invariants and expected errors

**Method Signatures (MVP):**

**ActivityRepository:**

-   `list(): Promise<Activity[]>` - List all activities
-   `getById(id: ActivityId): Promise<Activity | null>` - Get single activity
-   `create(activity: Omit<Activity, 'id'>): Promise<Activity>` - Create new activity
-   `update(id: ActivityId, updates: Partial<Activity>): Promise<Activity>` - Update activity

**ProductRepository:**

-   `list(): Promise<Product[]>` - List all products
-   `getById(id: ProductId): Promise<Product | null>` - Get single product
-   `create(product: Omit<Product, 'id'>): Promise<Product>` - Create new product
-   `update(id: ProductId, updates: Partial<Product>): Promise<Product>` - Update product

**StockMovementRepository:**

-   `list(): Promise<StockMovement[]>` - List all stock movements
-   `getById(id: StockMovementId): Promise<StockMovement | null>` - Get single movement
-   `listByProduct(productId: ProductId): Promise<StockMovement[]>` - Get movements for a product (needed for stock calculations)
-   `create(movement: Omit<StockMovement, 'id'>): Promise<StockMovement>` - Create new movement

**Testing (`__tests__/core/ports/`):**

-   Type-checking tests to ensure interfaces are properly defined
-   Mock implementations can be created for usecase tests

## Sub-Tickets

### Sub-Ticket 8.1

**Title:** Create `ActivityRepository` interface

**Rationale:**
Define the contract for activity data access operations. This port will be used by usecases in FBC-9 (`addActivity`, `listActivities`, `updateActivity`, `computeStockFromActivities`).

**Acceptance Criteria:**

-   [x] `ActivityRepository` interface defined in `src/core/ports/activityRepository.ts`
-   [x] Interface includes methods: `list()`, `getById(id: ActivityId)`, `create(activity: Omit<Activity, 'id'>)`, `update(id: ActivityId, updates: Partial<Activity>)`
-   [x] All methods return domain types (`Activity` or `Activity[]`)
-   [x] All methods are async and return `Promise<T>`
-   [x] JSDoc documentation for each method includes:
    -   Method purpose and behavior
    -   `@throws` tags documenting expected errors
    -   Parameter descriptions
    -   Return type descriptions
-   [x] Interface follows same pattern as `AuthRepository` (interface-based, not type)
-   [x] Imports domain types from `core/domain/activity`

**Definition of Done:**

-   [x] Code added and typed correctly
-   [x] JSDoc documentation complete with contracts and error handling
-   [x] Lint/build passes
-   [x] Interface can be imported and used by usecases
-   [x] Interface can be mocked for unit tests

**Estimated Effort:** 2h

**Dependencies:** None (domain types already exist)

**Owner:** Backend Developer

**Risk Notes:** Ensure method signatures support upcoming usecases; may need to add query methods later.

---

### Sub-Ticket 8.2

**Title:** Create `ProductRepository` interface

**Rationale:**
Define the contract for product data access operations. This port will be used by usecases in FBC-9 (`computeStockFromActivities`, `computeProfit`) and future product management features.

**Acceptance Criteria:**

-   [x] `ProductRepository` interface defined in `src/core/ports/productRepository.ts`
-   [x] Interface includes methods: `list()`, `getById(id: ProductId)`, `create(product: Omit<Product, 'id'>)`, `update(id: ProductId, updates: Partial<Product>)`
-   [x] All methods return domain types (`Product` or `Product[]`)
-   [x] All methods are async and return `Promise<T>`
-   [x] JSDoc documentation for each method includes:
    -   Method purpose and behavior
    -   `@throws` tags documenting expected errors
    -   Parameter descriptions
    -   Return type descriptions
-   [x] Interface follows same pattern as `AuthRepository` (interface-based, not type)
-   [x] Imports domain types from `core/domain/product`

**Definition of Done:**

-   [x] Code added and typed correctly
-   [x] JSDoc documentation complete with contracts and error handling
-   [x] Lint/build passes
-   [x] Interface can be imported and used by usecases
-   [x] Interface can be mocked for unit tests

**Estimated Effort:** 2h

**Dependencies:** None (domain types already exist)

**Owner:** Backend Developer

**Risk Notes:** May need to add query methods (by type, by coloris) later for filtering; keep MVP minimal.

---

### Sub-Ticket 8.3

**Title:** Create `StockMovementRepository` interface

**Rationale:**
Define the contract for stock movement data access operations. This port will be used by usecases in FBC-9 (`computeStockFromActivities`) to calculate current stock levels from movement history.

**Acceptance Criteria:**

-   [x] `StockMovementRepository` interface defined in `src/core/ports/stockMovementRepository.ts`
-   [x] Interface includes methods: `list()`, `getById(id: StockMovementId)`, `listByProduct(productId: ProductId)`, `create(movement: Omit<StockMovement, 'id'>)`
-   [x] All methods return domain types (`StockMovement` or `StockMovement[]`)
-   [x] All methods are async and return `Promise<T>`
-   [x] `listByProduct` method enables querying movements for a specific product (needed for stock calculations)
-   [x] JSDoc documentation for each method includes:
    -   Method purpose and behavior
    -   `@throws` tags documenting expected errors
    -   Parameter descriptions
    -   Return type descriptions
-   [x] Interface follows same pattern as `AuthRepository` (interface-based, not type)
-   [x] Imports domain types from `core/domain/stockMovement`

**Definition of Done:**

-   [x] Code added and typed correctly
-   [x] JSDoc documentation complete with contracts and error handling
-   [x] Lint/build passes
-   [x] Interface can be imported and used by usecases
-   [x] Interface can be mocked for unit tests
-   [x] Note: Ticket mentions "Stock" but domain uses "StockMovement" - decision documented

**Estimated Effort:** 2h

**Dependencies:** None (domain types already exist)

**Owner:** Backend Developer

**Risk Notes:** `listByProduct` is critical for stock calculations; ensure it's included. May need date range filtering later.

---

## Unit Test Spec (Test-First Protocol)

**Status:** tests: proposed

### Test Files & Paths

-   `__tests__/core/ports/activityRepository.test.ts` - Type-checking and contract validation for ActivityRepository
-   `__tests__/core/ports/productRepository.test.ts` - Type-checking and contract validation for ProductRepository
-   `__tests__/core/ports/stockMovementRepository.test.ts` - Type-checking and contract validation for StockMovementRepository

### Test Structure

**Note:** Since ports are TypeScript interfaces (contracts only), tests will focus on:

1. Type-checking that interfaces are properly defined
2. Verifying mock implementations can be created
3. Ensuring method signatures match expected contracts

### Test Cases

#### `activityRepository.test.ts`

```typescript
describe("ActivityRepository", () => {
    describe("Interface contract", () => {
        it("should define list() method returning Promise<Activity[]>", () => {
            // Type-check: ensure method signature exists
        });

        it("should define getById() method with ActivityId parameter", () => {
            // Type-check: ensure method signature exists
        });

        it("should define create() method accepting Omit<Activity, 'id'>", () => {
            // Type-check: ensure method signature exists
        });

        it("should define update() method with id and Partial<Activity>", () => {
            // Type-check: ensure method signature exists
        });

        it("should allow mock implementation for usecase tests", () => {
            // Verify a mock can be created that satisfies the interface
        });
    });
});
```

#### `productRepository.test.ts`

```typescript
describe("ProductRepository", () => {
    describe("Interface contract", () => {
        it("should define list() method returning Promise<Product[]>", () => {
            // Type-check: ensure method signature exists
        });

        it("should define getById() method with ProductId parameter", () => {
            // Type-check: ensure method signature exists
        });

        it("should define create() method accepting Omit<Product, 'id'>", () => {
            // Type-check: ensure method signature exists
        });

        it("should define update() method with id and Partial<Product>", () => {
            // Type-check: ensure method signature exists
        });

        it("should allow mock implementation for usecase tests", () => {
            // Verify a mock can be created that satisfies the interface
        });
    });
});
```

#### `stockMovementRepository.test.ts`

```typescript
describe("StockMovementRepository", () => {
    describe("Interface contract", () => {
        it("should define list() method returning Promise<StockMovement[]>", () => {
            // Type-check: ensure method signature exists
        });

        it("should define getById() method with StockMovementId parameter", () => {
            // Type-check: ensure method signature exists
        });

        it("should define listByProduct() method with ProductId parameter", () => {
            // Type-check: ensure method signature exists
        });

        it("should define create() method accepting Omit<StockMovement, 'id'>", () => {
            // Type-check: ensure method signature exists
        });

        it("should allow mock implementation for usecase tests", () => {
            // Verify a mock can be created that satisfies the interface
        });
    });
});
```

### Mocks/Fixtures

-   Mock implementations will be created in `__mocks__/core/ports/` for usecase tests
-   Use existing domain type fixtures from `__mocks__/core/domain/` if available

### Edge Cases

-   Verify `getById` returns `null` for non-existent IDs (not throws)
-   Verify `create` throws on validation errors
-   Verify `update` throws on non-existent IDs

### Coverage Target

-   Type-checking coverage: 100% of interface methods
-   Mock creation verification: 100%

### Mapping AC → Tests

-   AC: "Ports include methods for CRUD and query operations" → Test all method signatures exist
-   AC: "All methods return domain types" → Type-check return types
-   AC: "Explicit error handling via thrown errors" → Verify JSDoc `@throws` tags
-   AC: "Documentation of contracts" → Verify JSDoc completeness

---

## Agent Prompts

### Unit Test Coach

```
Generate unit tests for repository port interfaces (ActivityRepository, ProductRepository, StockMovementRepository) in `__tests__/core/ports/`.

Requirements:
- Test TypeScript interface contracts (type-checking, method signatures)
- Verify mock implementations can be created for usecase tests
- Follow existing test patterns from `__tests__/core/usecases/auth.test.ts`
- Use Jest with TypeScript
- Ensure all methods are covered (list, getById, create, update, listByProduct for StockMovement)
- Test files: `activityRepository.test.ts`, `productRepository.test.ts`, `stockMovementRepository.test.ts`

Reference:
- Existing port: `src/core/ports/authRepository.ts`
- Domain types: `src/core/domain/activity.ts`, `src/core/domain/product.ts`, `src/core/domain/stockMovement.ts`
- Test location: `__tests__/core/ports/`
```

### Architecture-Aware Dev

```
Implement repository port interfaces (ActivityRepository, ProductRepository, StockMovementRepository) in `src/core/ports/`.

Requirements:
- Follow Clean Architecture: ports are contracts only, no implementations
- Follow existing `AuthRepository` pattern (interface-based, JSDoc documentation)
- All methods return domain types from `core/domain/`
- All methods are async and return `Promise<T>`
- Error handling via thrown errors (documented in JSDoc with `@throws` tags)
- Include JSDoc for each method: purpose, parameters, return type, expected errors
- Method signatures:
  - ActivityRepository: list(), getById(id), create(activity), update(id, updates)
  - ProductRepository: list(), getById(id), create(product), update(id, updates)
  - StockMovementRepository: list(), getById(id), listByProduct(productId), create(movement)
- Use branded types for IDs (ActivityId, ProductId, StockMovementId)
- Keep signatures minimal for MVP (extendable later)

Files to create:
- `src/core/ports/activityRepository.ts`
- `src/core/ports/productRepository.ts`
- `src/core/ports/stockMovementRepository.ts`

Reference:
- Existing port: `src/core/ports/authRepository.ts`
- Domain types: `src/core/domain/activity.ts`, `src/core/domain/product.ts`, `src/core/domain/stockMovement.ts`
```

### UI Designer

```
N/A - This ticket is backend-focused (ports/interfaces only, no UI components).
```

### QA & Test Coach

```
After implementation, verify repository port interfaces meet acceptance criteria:

1. Type-checking: Verify all interfaces are properly typed and can be imported
2. Mock creation: Verify mock implementations can be created for usecase tests
3. Documentation: Verify JSDoc is complete with contracts and error handling
4. Lint/build: Verify no linting or build errors
5. Integration: Verify interfaces can be used by usecases (when implemented in FBC-9)

Test files location: `__tests__/core/ports/`
Reference implementation: `src/core/ports/authRepository.ts`
```

### Architecture Guardian

```
Verify repository port interfaces (ActivityRepository, ProductRepository, StockMovementRepository) comply with Clean Architecture:

1. **Layer Separation:**
   - Ports are in `core/ports/` (correct layer)
   - No implementations in ports (contracts only)
   - No Supabase/React/Next.js imports in ports
   - Only domain type imports from `core/domain/`

2. **Contract Design:**
   - Interfaces (not types) for repositories
   - All methods return domain types
   - Error handling via thrown errors (not return error objects)
   - JSDoc documentation includes contracts and invariants

3. **Dependency Direction:**
   - Ports import from domain only
   - No reverse dependencies (domain → ports is correct)

4. **Type Safety:**
   - Branded types used for IDs (ActivityId, ProductId, StockMovementId)
   - Proper TypeScript typing throughout

5. **Documentation:**
   - JSDoc for all methods
   - `@throws` tags for error handling
   - Contract and invariant documentation

Files to verify:
- `src/core/ports/activityRepository.ts`
- `src/core/ports/productRepository.ts`
- `src/core/ports/stockMovementRepository.ts`

Reference pattern: `src/core/ports/authRepository.ts`
```

---

## Open Questions

1. **Naming Clarification:** Ticket mentions "Stock" but domain uses "StockMovement". Should the repository be named `StockRepository` or `StockMovementRepository`?

    - **Decision:** Use `StockMovementRepository` to match domain naming convention. Document this decision in the implementation.

2. **Error Types:** Should we define domain-specific error types (like `AuthError`) for Activity, Product, and StockMovement, or use generic `Error`?

    - **Assumption:** Start with generic `Error` or domain-specific errors if they exist. Document expected error behavior in JSDoc. Can be refined later.

3. **Query Methods:** Should we include filtering methods (by date, type, productId) in MVP, or add them later?

    - **Decision:** Keep MVP minimal. Add `listByProduct` for StockMovement (needed for stock calculations). Other filtering can be added later.

4. **Update Method Signature:** Should `update` accept `Partial<T>` or require all fields?

    - **Decision:** Use `Partial<T>` for flexibility, following common repository patterns.

5. **Delete Operations:** Should we include `delete` methods in MVP?
    - **Decision:** Not included in MVP based on ticket requirements. Can be added later if needed.

---

## MVP Cut List

If time is constrained, the following can be deferred:

-   **Low Priority:** Delete operations (can be added later if needed)
-   **Low Priority:** Advanced query methods (filtering by date, type, etc.) - basic list operations sufficient for MVP
-   **Low Priority:** Pagination support (can be added later)
-   **Low Priority:** Real-time subscriptions (can be added later if needed)

**Must Have for MVP:**

-   All three repository interfaces defined (`ActivityRepository`, `ProductRepository`, `StockMovementRepository`)
-   Basic CRUD operations (list, getById, create, update)
-   `listByProduct` for StockMovement (needed for stock calculations)
-   Complete JSDoc documentation with contracts and error handling
-   Type-checking tests to verify interfaces

---

## Estimated Total Effort

-   Sub-Ticket 8.1 (ActivityRepository): 2h
-   Sub-Ticket 8.2 (ProductRepository): 2h
-   Sub-Ticket 8.3 (StockMovementRepository): 2h
-   Unit Test Spec (8.1-8.3): 1h (included in sub-tickets)
-   **Total: 6h** (matches ticket estimate of 3 story points)
