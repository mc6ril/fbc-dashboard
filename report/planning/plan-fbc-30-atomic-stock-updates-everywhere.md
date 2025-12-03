---
Generated: 2025-01-27 20:15:00
Report Type: planning
Command: pm-plan-from-ticket
Ticket: FBC-30
---

# Implementation Plan: FBC-30 - Ensure atomic stock updates everywhere

## Summary

Fix race conditions and non-atomic stock update operations by: (1) preventing direct stock updates in `updateProduct`, (2) creating an atomic PostgreSQL RPC function to recalculate stock from activities, and (3) replacing read-modify-write pattern in `updateActivity`. Key constraint: all stock updates must be atomic at database level to prevent data inconsistency under concurrent operations.

## Solution Outline

**Layers impacted:**

-   **Infrastructure**: Create PostgreSQL RPC function `recalculate_and_update_stock` (migration 007)
-   **Ports**: Add `recalculateStockFromActivities` method to `ProductRepository` interface
-   **Infrastructure**: Implement RPC call in `productRepositorySupabase`
-   **Usecases**: Reject `stock` in `updateProduct` updates; replace read-modify-write in `updateActivity` with atomic recalculation

## Sub-Tickets

### 30.1 - Create atomic stock recalculation RPC function

-   **AC**:
    -   [x] Migration `007_add_recalculate_stock_function.sql` creates `recalculate_and_update_stock(product_id UUID)` function
    -   [x] Function calculates stock from activities (CREATION, SALE, STOCK_CORRECTION) atomically
    -   [x] Function updates product stock and returns new value (clamped to 0 minimum)
    -   [x] Function throws error if product not found
-   **DoD**:
    -   [x] Migration file created with proper documentation
    -   [ ] Function tested manually in Supabase SQL Editor
    -   [x] Migration follows existing migration patterns
-   **Effort**: 2h | **Deps**: none

### 30.2 - Add recalculateStockFromActivities to ProductRepository interface

-   **AC**:
    -   [x] `ProductRepository` interface includes `recalculateStockFromActivities(id: ProductId): Promise<number>`
    -   [x] JSDoc documents atomic behavior and source of truth (activities)
    -   [x] Method signature matches RPC function contract
-   **DoD**:
    -   [x] Interface updated with proper TypeScript types
    -   [x] JSDoc includes examples and error cases
    -   [x] No linter errors
-   **Effort**: 0.5h | **Deps**: 30.1

### 30.3 - Implement recalculateStockFromActivities in Supabase repository

-   **AC**:
    -   [x] `productRepositorySupabase` implements `recalculateStockFromActivities` using RPC call
    -   [x] Error handling transforms Supabase errors to domain errors
    -   [x] Returns parsed numeric value (handles NUMERIC string conversion)
-   **DoD**:
    -   [x] Implementation follows existing RPC call patterns (`updateStockAtomically`)
    -   [x] Error messages are descriptive
    -   [x] No linter errors
-   **Effort**: 1h | **Deps**: 30.1, 30.2

### 30.4 - Prevent direct stock updates in updateProduct

-   **AC**:
    -   [x] `updateProduct` validates and rejects updates containing `stock` field
    -   [x] Error message: "Stock cannot be updated directly. Stock is managed automatically through activities. Use activity creation/update to modify stock levels."
    -   [x] JSDoc updated to document stock cannot be updated via this method
-   **DoD**:
    -   [x] Validation added before merging updates
    -   [x] Error thrown with clear message
    -   [x] JSDoc updated
    -   [ ] Tests verify rejection (see Unit Test Spec)
    -   [x] No linter errors
-   **Effort**: 1h | **Deps**: none

### 30.5 - Replace read-modify-write pattern in updateActivity

-   **AC**:
    -   [x] `updateActivity` uses `productRepo.recalculateStockFromActivities(productId)` instead of read-modify-write
    -   [x] Removed `getById` call and delta calculation logic (lines 433-451)
    -   [x] JSDoc updated to document atomic stock recalculation
    -   [ ] Warning logging for negative stock moved to RPC function or kept in usecase (if needed)
-   **DoD**:
    -   [x] Old pattern removed (getById + delta calculation)
    -   [x] New atomic method called for each affected product
    -   [x] JSDoc updated
    -   [ ] Tests verify atomic behavior (see Unit Test Spec)
    -   [x] No linter errors
-   **Effort**: 2h | **Deps**: 30.2, 30.3

## Unit Test Spec

### File: `__tests__/core/usecases/product.test.ts`

**Key tests:**

-   `updateProduct should reject updates containing stock field`
-   `updateProduct should throw descriptive error when stock is in updates`
-   `updateProduct should allow other field updates when stock is not present`

**Status**: tests `proposed`

### File: `__tests__/core/usecases/activity.test.ts`

**Key tests:**

-   `updateActivity should use recalculateStockFromActivities for stock updates`
-   `updateActivity should handle concurrent updates without race conditions`
-   `updateActivity should update stock atomically when productId changes`
-   `updateActivity should update stock atomically when quantity changes`

**Status**: tests `proposed`

### File: `__tests__/infrastructure/supabase/productRepositorySupabase.test.ts` (if exists)

**Key tests:**

-   `recalculateStockFromActivities should call RPC function with correct parameters`
-   `recalculateStockFromActivities should return parsed numeric value`
-   `recalculateStockFromActivities should handle product not found errors`

**Status**: tests `proposed`

## Agent Prompts

### Unit Test Coach

"Generate unit test specs for FBC-30: (1) `updateProduct` rejects stock updates with descriptive error, (2) `updateActivity` uses `recalculateStockFromActivities` atomically, (3) `productRepositorySupabase.recalculateStockFromActivities` calls RPC correctly. Focus on race condition scenarios and error handling. Test files: `__tests__/core/usecases/product.test.ts`, `__tests__/core/usecases/activity.test.ts`."

### Architecture-Aware Dev

"Implement FBC-30 sub-tickets 30.1-30.5: Create PostgreSQL RPC function `recalculate_and_update_stock`, add interface method, implement Supabase repository, prevent stock updates in `updateProduct`, replace read-modify-write in `updateActivity`. Follow Clean Architecture: Domain → Usecases → Infrastructure. Ensure all stock operations are atomic. Files: migrations/007, `core/ports/productRepository.ts`, `infrastructure/supabase/productRepositorySupabase.ts`, `core/usecases/product.ts`, `core/usecases/activity.ts`."

### QA & Test Coach

"Create test plan for FBC-30: Verify (1) `updateProduct` rejects stock updates, (2) `updateActivity` handles concurrent updates atomically, (3) RPC function calculates stock correctly from activities. Include edge cases: product not found, negative stock clamping, concurrent activity updates. Test files: `__tests__/core/usecases/product.test.ts`, `__tests__/core/usecases/activity.test.ts`."

### Architecture Guardian

"Review FBC-30 implementation: Verify no read-modify-write patterns remain for stock, all stock updates use atomic methods (`updateStockAtomically` or `recalculateStockFromActivities`), layer separation maintained (no Supabase in usecases), error handling follows domain patterns. Files: `core/usecases/product.ts`, `core/usecases/activity.ts`, `infrastructure/supabase/productRepositorySupabase.ts`."

## Open Questions

1. **Warning logging for negative stock**: Should the warning for negative stock (currently in `updateActivity` lines 443-446) be moved to the RPC function, or kept in the usecase? **Recommendation**: Keep in usecase for business logic visibility, but ensure RPC function handles clamping.

2. **Performance impact**: The RPC function recalculates stock from all activities. For products with thousands of activities, should we add date-range filtering or pagination? **Recommendation**: Monitor performance; optimize later if needed (current dataset likely small).

3. **Migration order**: Should migration 007 be applied before or after code changes? **Recommendation**: Apply migration first (sub-ticket 30.1), then implement code (sub-tickets 30.2-30.5) to allow testing.

## MVP Cut List

All sub-tickets are essential for data consistency. No cuts recommended.
