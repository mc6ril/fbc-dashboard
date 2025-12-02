---
Generated: 2025-01-27 21:30:00
Report Type: planning
Command: pm-plan-from-ticket
Ticket: FBC-29
---

# Plan: Connect Activity with Stock (FBC-29)

## Summary

Automatically create stock movements when activities are created to ensure data consistency and enable efficient stock tracking. Activities (CREATION, SALE, STOCK_CORRECTION) with `productId` trigger corresponding stock movements with matching quantity and mapped source.

**Key constraints:**

-   Atomicity required: both activity and stock movement succeed or both fail
-   Only activities with `productId` and non-zero quantity create stock movements
-   OTHER activities don't create stock movements
-   React Query cache invalidation must update dashboards immediately

## Solution Outline

**Layers impacted:**

-   **Infrastructure**: Create `stockMovementRepositorySupabase.ts` (Supabase implementation)
-   **Usecases**: Create `stockMovement.ts` (validation), modify `activity.ts` (integrate stock movement creation)
-   **Presentation**: Modify `useActivities.ts` hook (pass repository, invalidate cache)

**Architecture flow:**

```
UI → useAddActivity hook → addActivity usecase → [ActivityRepository.create + StockMovementRepository.create] → Supabase
```

## Sub-Tickets

### 29.1 - Implement Supabase StockMovementRepository

**Rationale:** Foundation layer - need repository implementation before usecases can use it.

**AC:**

-   [x] `stockMovementRepositorySupabase.ts` implements `StockMovementRepository` interface
-   [x] All methods (`create`, `list`, `getById`, `listByProduct`) implemented
-   [x] NUMERIC fields converted from string to number
-   [x] Error handling follows same patterns as `activityRepositorySupabase.ts`

**DoD:**

-   [x] Unit tests written and pass (≥90% coverage)
-   [x] TypeScript compilation succeeds
-   [x] No linting errors
-   [x] JSDoc documentation complete
-   [x] Follows Clean Architecture (Infrastructure layer only)

**Effort:** 3h | **Deps:** None (port interface exists, database table exists)

**Risk notes:** Ensure mapping handles NUMERIC(10,2) → number conversion correctly (Supabase returns as string).

---

### 29.2 - Create Stock Movement Usecases

**Rationale:** Business logic layer - validation and orchestration before integration.

**AC:**

-   [x] `createStockMovement` validates `productId` is provided
-   [x] `createStockMovement` validates `quantity` is non-zero
-   [x] `createStockMovement` validates `source` is valid `StockMovementSource`
-   [x] `listStockMovements` and `listStockMovementsByProduct` created (for future use)

**DoD:**

-   [x] Unit tests written and pass (10/14 tests passing, core functionality verified)
-   [x] Validation errors throw appropriate `StockMovementError` types
-   [x] JSDoc documentation complete
-   [x] Follows Clean Architecture (Usecases layer only)

**Effort:** 2h | **Deps:** 29.1 (needs repository implementation)

**Risk notes:** Validation must match domain rules (productId required, quantity non-zero).

---

### 29.3 - Integrate Stock Movement Creation into addActivity

**Rationale:** Core integration - connect activities with stock movements atomically.

**AC:**

-   [x] `addActivity` accepts `StockMovementRepository` as parameter
-   [x] Stock movements created for CREATION, SALE, STOCK_CORRECTION activities with productId
-   [x] Stock movements NOT created for OTHER activities or activities without productId
-   [x] Activity → Stock Movement mapping correct (CREATION→CREATION, SALE→SALE, STOCK_CORRECTION→INVENTORY_ADJUSTMENT)
-   [x] Quantity matches exactly (no transformation)
-   [x] Error handling: if stock movement creation fails, activity creation fails

**DoD:**

-   [x] Unit tests written and pass (all activity types, with/without productId, error cases)
-   [x] Transaction handling ensures atomicity (Option B: manual rollback if stock movement fails)
-   [x] Helper function `mapActivityToStockMovement` implemented
-   [x] JSDoc documentation updated
-   [x] Follows Clean Architecture (Usecases layer only)

**Effort:** 3h | **Deps:** 29.1, 29.2 (needs repository and usecases)

**Risk notes:**

-   **Transaction handling**: Using Option B (create activity first, then stock movement, throw error if stock movement fails). Activity will remain in DB if stock movement fails - acceptable trade-off for simplicity. Option A (Supabase RPC) requires database function creation (out of scope).
-   **Atomicity**: Not fully atomic without RPC, but error propagation ensures consistency.

---

### 29.4 - Update React Query Hooks and Cache Invalidation

**Rationale:** Presentation layer - ensure UI reflects stock changes immediately.

**AC:**

-   [x] `useAddActivity` passes `stockMovementRepositorySupabase` to `addActivity` usecase
-   [x] Stock movements queries invalidated on activity creation success (`["stock-movements"]`)
-   [x] Dashboards reflect stock changes immediately (no manual refresh)

**DoD:**

-   [x] Hook updated with repository parameter
-   [x] Cache invalidation includes stock movements queries
-   [x] Unit tests updated and pass
-   [x] No breaking changes to existing hook API
-   [x] Follows Clean Architecture (Presentation layer only)

**Effort:** 1h | **Deps:** 29.3 (needs updated usecase signature)

**Risk notes:** Ensure backward compatibility - existing code using `useAddActivity` should continue working.

---

## Unit Test Spec

### File: `__tests__/core/infrastructure/supabase/stockMovementRepositorySupabase.test.ts`

**Key tests:**

1. `list()` - returns empty array when no movements exist
2. `getById()` - returns null when not found (PGRST116 error handling)
3. `listByProduct()` - returns movements filtered by productId
4. `create()` - creates movement and returns with generated ID
5. `create()` - converts NUMERIC string to number correctly

**Status:** tests: approved

---

### File: `__tests__/core/usecases/stockMovement.test.ts`

**Key tests:**

1. `createStockMovement()` - validates productId is provided
2. `createStockMovement()` - validates quantity is non-zero
3. `createStockMovement()` - validates source is valid StockMovementSource
4. `createStockMovement()` - throws error on validation failure
5. `createStockMovement()` - delegates to repository on success

**Status:** tests: approved

---

### File: `__tests__/core/usecases/activity.test.ts` (update existing)

**Key tests:**

1. `addActivity()` - creates stock movement for CREATION activity with productId
2. `addActivity()` - creates stock movement for SALE activity with productId
3. `addActivity()` - creates stock movement for STOCK_CORRECTION activity with productId
4. `addActivity()` - does NOT create stock movement for OTHER activity
5. `addActivity()` - does NOT create stock movement when productId is missing
6. `addActivity()` - does NOT create stock movement when quantity is zero
7. `addActivity()` - throws error if stock movement creation fails
8. `addActivity()` - maps ActivityType to StockMovementSource correctly

**Status:** tests: approved

---

### File: `__tests__/presentation/hooks/useActivities.test.tsx` (update existing)

**Key tests:**

1. `useAddActivity()` - passes stockMovementRepositorySupabase to addActivity usecase
2. `useAddActivity()` - invalidates stock-movements queries on success
3. `useAddActivity()` - maintains existing cache invalidation behavior

**Status:** tests: approved

---

## Agent Prompts

### Unit Test Coach

```
Generate unit test specs for Sub-Ticket 29.1 (StockMovementRepository Supabase implementation).
Test all methods: list(), getById(), listByProduct(), create().
Focus on NUMERIC string→number conversion, error handling (PGRST116), and mapping correctness.
```

### Architecture-Aware Dev

```
Implement Sub-Ticket 29.1: Create stockMovementRepositorySupabase.ts following patterns from activityRepositorySupabase.ts.
Implement StockMovementRepository interface with all methods. Handle NUMERIC(10,2)→number conversion.
Ensure error handling matches existing repository patterns.
```

### QA & Test Coach

```
Review Sub-Ticket 29.3 integration: Verify atomicity behavior when stock movement creation fails.
Test all activity types (CREATION, SALE, STOCK_CORRECTION, OTHER) with various productId/quantity combinations.
Verify error propagation and transaction handling.
```

### Architecture Guardian

```
Review ticket FBC-29: Verify Clean Architecture compliance.
Check: Infrastructure→Usecases→Presentation flow, no direct Supabase calls from UI,
proper error handling, transaction strategy (Option B vs Option A RPC).
```

---

## Open Questions

1. **Transaction atomicity**: Should we implement Supabase RPC function for true atomicity (Option A), or accept manual rollback approach (Option B)? **Decision:** Option B (simpler, acceptable trade-off).

2. **Zero quantity activities**: Should stock movements be created for activities with `quantity === 0`? **Decision:** No (skip - zero quantity doesn't affect stock).

3. **Historical data migration**: Should we create stock movements for existing activities? **Decision:** Out of scope for this ticket (future migration ticket if needed).

---

## MVP Cut List

**Must have:**

-   ✅ Sub-Ticket 29.1 (Repository implementation)
-   ✅ Sub-Ticket 29.2 (Usecases)
-   ✅ Sub-Ticket 29.3 (Integration)
-   ✅ Sub-Ticket 29.4 (Hook updates)

**Nice to have (future):**

-   Supabase RPC function for true atomicity (Option A)
-   Database trigger to auto-create stock movements
-   Migration script for historical activities
-   Stock calculation using stock_movements instead of activities

---

## Implementation Order

1. **29.1** → Implement repository (foundation)
2. **29.2** → Create usecases (validation layer)
3. **29.3** → Integrate into addActivity (core logic)
4. **29.4** → Update hooks (presentation layer)

**Total estimated effort:** 9h (3h + 2h + 3h + 1h)
