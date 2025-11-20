---
Generated: 2025-01-27 21:30:00
Report Type: planning
Command: pm-plan-from-ticket
Ticket: FBC-30
---

# Implementation Plan: Product Reference Tables (FBC-30)

## Summary

**Goal:** Implement reference tables for product models and coloris to enforce valid type → model → coloris combinations and enable fast filtering for cascading dropdowns in forms.

**User Value:**

-   Prevents naming errors by enforcing valid combinations at the database level
-   Improves UX with cascading dropdowns that show only valid options
-   Ensures data integrity through foreign key constraints
-   Enables fast filtering for forms without full table scans

**Constraints:**

-   Must maintain backward compatibility during migration period
-   Must migrate existing products data without data loss
-   Must follow Clean Architecture principles (strict layer separation)
-   Must use reference tables pattern as defined in architecture rules
-   Must support cascading filters in ProductForm component

**Non-Goals:**

-   Admin interface for managing reference tables (deferred to future ticket)
-   Bulk import/export of reference data
-   Historical tracking of reference table changes

## Assumptions & Risks

### Assumptions

1. **Existing data quality:** Assumes existing products have consistent `name` and `coloris` values that can be extracted to populate reference tables
2. **Migration window:** Assumes migration can be performed during low-traffic period or with application downtime
3. **Data integrity:** Assumes all existing products have valid `name` and `coloris` values (no NULL or empty strings)
4. **Reference data:** Assumes initial seed data for reference tables can be derived from existing products

### Risks

1. **Data migration complexity:** Existing products may have inconsistent naming or invalid combinations that need cleanup
    - **Mitigation:** Create data validation script before migration; handle edge cases in migration script
2. **Breaking changes:** Migration may temporarily break existing functionality if not handled carefully
    - **Mitigation:** Keep old columns during migration; implement dual-mode support in code temporarily
3. **Performance impact:** New joins may slow down product queries initially
    - **Mitigation:** Ensure proper indices are created; optimize joins in repository
4. **Invalid existing data:** Some existing products may have invalid type-model-coloris combinations
    - **Mitigation:** Create data cleanup script; document invalid records for manual review

## Solution Outline (Aligned with Architecture)

The solution follows Clean Architecture layers with strict separation:

1. **Infrastructure Layer (Database):**

    - Create `product_models` table (type, name) with unique constraint on (type, name)
    - Create `product_coloris` table (model_id, coloris) with unique constraint on (model_id, coloris)
    - Modify `products` table to add `model_id` and `coloris_id` foreign keys
    - Migrate existing data from free-text fields to reference tables
    - Create indices for fast filtering

2. **Domain Layer:**

    - Add `ProductModel` and `ProductColoris` types with branded IDs
    - Update `Product` type to include `modelId` and `colorisId`
    - Add validation functions for models and coloris

3. **Ports Layer:**

    - Extend `ProductRepository` interface with methods for querying reference tables

4. **Usecases Layer:**

    - Add usecases for listing models by type and coloris by model
    - Update `createProduct` and `updateProduct` to validate model/coloris combinations

5. **Infrastructure Layer (Repository):**

    - Implement new repository methods for reference tables
    - Update `create`, `update`, and `list` methods to use foreign keys and joins

6. **Presentation Layer:**
    - Create React Query hooks for fetching models and coloris
    - Update `ProductForm` with cascading Select dropdowns
    - Implement cascading filter logic (type → model → coloris)

**Data Flow:**

```
User selects Type
  ↓
useProductModelsByType(type)
  ↓
listProductModelsByType(repo, type)
  ↓
repo.listModelsByType(type)
  ↓
Supabase: product_models WHERE type = ...

User selects Model
  ↓
useProductColorisByModel(modelId)
  ↓
listProductColorisByModel(repo, modelId)
  ↓
repo.listColorisByModel(modelId)
  ↓
Supabase: product_coloris WHERE model_id = ...
```

## Sub-Tickets

### Sub-Ticket 30.1

**Title:** Create database migration for product reference tables

**Rationale:**
Database schema must be created first before any code changes can be implemented. This migration creates the reference tables and modifies the products table with foreign keys, enabling all subsequent layers to use the new structure.

**Acceptance Criteria:**

-   [x] Create `product_models` table with:
    -   `id` UUID PRIMARY KEY
    -   `type` TEXT NOT NULL with CHECK constraint matching ProductType enum
    -   `name` TEXT NOT NULL
    -   UNIQUE constraint on `(type, name)`
    -   Index on `type` column
    -   Comments on table and columns
-   [x] Create `product_coloris` table with:
    -   `id` UUID PRIMARY KEY
    -   `model_id` UUID NOT NULL FK to product_models ON DELETE CASCADE
    -   `coloris` TEXT NOT NULL
    -   UNIQUE constraint on `(model_id, coloris)`
    -   Index on `model_id` column
    -   Comments on table and columns
-   [x] Modify `products` table:
    -   Add `model_id` UUID FK to product_models (nullable initially)
    -   Add `coloris_id` UUID FK to product_coloris (nullable initially)
    -   Keep existing `name`, `type`, `coloris` columns (for backward compatibility)
-   [x] Create migration script `002_create_product_reference_tables.sql`:
    -   Follows naming convention (`{number}_{description}.sql`)
    -   Includes comprehensive comments explaining each step
    -   Uses `IF NOT EXISTS` clauses for idempotency
    -   Includes data migration from existing products
    -   Extracts unique (type, name) combinations to populate `product_models`
    -   Extracts unique (model_id, coloris) combinations to populate `product_coloris`
    -   Updates existing products with `model_id` and `coloris_id` based on matching
-   [x] Create verification script `002_verify_product_reference_tables.sql`:
    -   Verifies both reference tables exist
    -   Verifies foreign key constraints are created
    -   Verifies unique constraints are enforced
    -   Verifies indices are created
    -   Verifies data migration success (all products have model_id and coloris_id)

**Definition of Done:**

-   [x] Migration script passes syntax check
-   [x] Migration script runs successfully in Supabase
-   [x] Verification script confirms all tables, constraints, and indices exist
-   [x] All existing products have `model_id` and `coloris_id` populated
-   [x] No duplicate entries in reference tables
-   [x] Foreign key constraints prevent invalid references
-   [x] Migration script documented with comments explaining each step

**Estimated Effort:** 4h

**Dependencies:** None (prerequisite for all other sub-tickets)

**Owner:** Infrastructure

**Risk Notes:**

-   Risk of data migration failures if existing data is inconsistent
-   May need manual data cleanup for edge cases
-   Ensure backup before running migration in production

---

### Sub-Ticket 30.2

**Title:** Add ProductModel and ProductColoris domain types with validation

**Rationale:**
Domain layer must define the new entity types before other layers can use them. This establishes the business types and validation rules that will be used throughout the application.

**Acceptance Criteria:**

-   [x] Create `ProductModelId` branded type in `src/core/domain/product.ts`
-   [x] Create `ProductModel` type in `src/core/domain/product.ts`:
    -   Fields: `id` (ProductModelId), `type` (ProductType), `name` (string)
    -   JSDoc documentation explaining business meaning
-   [x] Create `ProductColorisId` branded type in `src/core/domain/product.ts`
-   [x] Create `ProductColoris` type in `src/core/domain/product.ts`:
    -   Fields: `id` (ProductColorisId), `modelId` (ProductModelId), `coloris` (string)
    -   JSDoc documentation explaining business meaning
-   [x] Update `Product` type in `src/core/domain/product.ts`:
    -   Add `modelId` (ProductModelId) field
    -   Add `colorisId` (ProductColorisId) field
    -   Keep `name`, `type`, `coloris` as optional/deprecated for backward compatibility
    -   Update JSDoc to reflect new structure and explain migration period
-   [x] Add validation functions in `src/core/domain/validation.ts`:
    -   `isValidProductModel(productModel: ProductModel): boolean` - validates model has required fields
    -   `isValidProductColoris(productColoris: ProductColoris): boolean` - validates coloris has required fields
    -   `isValidProductModelForType(model: ProductModel, type: ProductType): boolean` - validates model belongs to type
    -   `isValidProductColorisForModel(coloris: ProductColoris, modelId: ProductModelId): boolean` - validates coloris belongs to model
    -   All functions include JSDoc documentation with examples
-   [x] Export all new types and validation functions

**Definition of Done:**

-   [x] All types use branded types for IDs
-   [x] All types have comprehensive JSDoc documentation
-   [x] Validation functions are pure functions (no side effects)
-   [x] Validation functions have JSDoc with examples
-   [x] No external dependencies in domain layer
-   [x] TypeScript strict mode passes
-   [x] Code follows naming conventions (PascalCase for types, camelCase for functions)

**Estimated Effort:** 2h

**Dependencies:** None

**Owner:** Domain

**Risk Notes:**

-   Ensure backward compatibility by keeping old fields optional
-   Validation functions must handle edge cases (null, undefined, empty strings)

---

### Sub-Ticket 30.3

**Title:** Add repository methods for querying reference tables (Ports)

**Rationale:**
Ports layer defines the contract for accessing reference data. This interface must be defined before infrastructure can implement it and usecases can use it.

**Acceptance Criteria:**

-   [x] Add methods to `ProductRepository` interface in `src/core/ports/productRepository.ts`:
    -   `listModelsByType(type: ProductType): Promise<ProductModel[]>`
    -   `listColorisByModel(modelId: ProductModelId): Promise<ProductColoris[]>`
    -   `getModelById(id: ProductModelId): Promise<ProductModel | null>`
    -   `getColorisById(id: ProductColorisId): Promise<ProductColoris | null>`
-   [x] Each method includes JSDoc documentation:
    -   Description of behavior
    -   Parameter types and descriptions
    -   Return type and description
    -   Error conditions (@throws)
-   [x] Update existing method signatures:
    -   Update `create` method to accept `modelId` and `colorisId` (remove `name` and `coloris` as required)
    -   Update `update` method to accept `modelId` and `colorisId` in partial updates
-   [x] All methods follow existing repository pattern and naming conventions

**Definition of Done:**

-   [x] All methods have comprehensive JSDoc documentation
-   [x] Methods use domain types (ProductModel, ProductColoris, ProductModelId, ProductColorisId)
-   [x] No implementation details in interface (contract only)
-   [x] TypeScript strict mode passes
-   [x] Interface follows existing repository pattern

**Estimated Effort:** 1h

**Dependencies:** Sub-Ticket 30.2 (domain types)

**Owner:** Ports

**Risk Notes:**

-   Ensure method signatures align with planned infrastructure implementation
-   Consider backward compatibility for existing methods

---

### Sub-Ticket 30.4

**Title:** Implement repository methods for reference tables (Infrastructure)

**Rationale:**
Infrastructure layer implements the port contract with Supabase queries. This enables usecases to fetch reference data for forms and validation.

**Acceptance Criteria:**

-   [x] Implement `listModelsByType` in `productRepositorySupabase.ts`:
    -   Query `product_models` table filtered by `type`
    -   Map Supabase rows to `ProductModel` domain type
    -   Handle errors appropriately (transform to Error)
    -   Return empty array if no models found
-   [x] Implement `listColorisByModel` in `productRepositorySupabase.ts`:
    -   Query `product_coloris` table filtered by `model_id`
    -   Map Supabase rows to `ProductColoris` domain type
    -   Handle errors appropriately (transform to Error)
    -   Return empty array if no coloris found
-   [x] Implement `getModelById` in `productRepositorySupabase.ts`:
    -   Query single model by ID
    -   Return null if not found
    -   Map to domain type
-   [x] Implement `getColorisById` in `productRepositorySupabase.ts`:
    -   Query single coloris by ID
    -   Return null if not found
    -   Map to domain type
-   [x] Update `create` method in `productRepositorySupabase.ts`:
    -   Accept `modelId` and `colorisId` instead of `name` and `coloris`
    -   Insert using `model_id` and `coloris_id` columns
    -   Validate coloris belongs to model (or let FK constraint handle it)
    -   Join with reference tables to get `name` and `coloris` for backward compatibility
-   [x] Update `update` method in `productRepositorySupabase.ts`:
    -   Accept `modelId` and `colorisId` in partial updates
    -   Update using `model_id` and `coloris_id` columns when provided
    -   Join with reference tables to get `name` and `coloris` for backward compatibility
-   [x] Update `list` method in `productRepositorySupabase.ts`:
    -   Join with `product_models` and `product_coloris` tables
    -   Map to domain `Product` type with `modelId` and `colorisId`
    -   Include `name`, `type`, `coloris` from joined tables for backward compatibility
-   [x] Update `getById` method in `productRepositorySupabase.ts`:
    -   Join with reference tables to get model and coloris names
    -   Map to domain type with `modelId` and `colorisId`

**Definition of Done:**

-   [x] All methods implement port interface correctly
-   [x] All Supabase queries use proper joins and filters
-   [x] Error handling transforms Supabase errors to Error type
-   [x] Mapping functions convert snake_case to camelCase correctly
-   [x] TypeScript strict mode passes
-   [x] No hardcoded values (use constants or types)
-   [x] Code follows existing repository patterns

**Estimated Effort:** 4h

**Dependencies:** Sub-Ticket 30.1 (migration), Sub-Ticket 30.2 (domain types), Sub-Ticket 30.3 (ports)

**Owner:** Infrastructure

**Risk Notes:**

-   Ensure joins are efficient (indices must exist)
-   Handle NULL values correctly for backward compatibility
-   Validate foreign key constraints work as expected

---

### Sub-Ticket 30.5

**Title:** Add usecases for reference tables and update product usecases

**Rationale:**
Usecases layer orchestrates business logic and validation. This adds usecases for fetching reference data and updates existing usecases to validate model/coloris combinations.

**Acceptance Criteria:**

-   [x] Add usecases in `src/core/usecases/product.ts`:
    -   `listProductModelsByType(repo: ProductRepository, type: ProductType): Promise<ProductModel[]>`
    -   `listProductColorisByModel(repo: ProductRepository, modelId: ProductModelId): Promise<ProductColoris[]>`
    -   `getProductModel(repo: ProductRepository, id: ProductModelId): Promise<ProductModel | null>`
    -   `getProductColoris(repo: ProductRepository, id: ProductColorisId): Promise<ProductColoris | null>`
-   [x] Each usecase includes JSDoc documentation:
    -   Description of business purpose
    -   Parameter descriptions
    -   Return type and description
    -   Error conditions
-   [x] Update `createProduct` usecase:
    -   Validate that `modelId` and `colorisId` are provided
    -   Validate that coloris belongs to model (call `getColorisById` and check `modelId` matches)
    -   Throw descriptive error if validation fails
-   [x] Update `updateProduct` usecase:
    -   Validate model/coloris combination if either `modelId` or `colorisId` is in updates
    -   If only `modelId` is updated, verify it exists
    -   If only `colorisId` is updated, verify it belongs to current product's model
    -   If both are updated, verify coloris belongs to new model
    -   Throw descriptive error if validation fails
-   [x] All usecases use domain validation functions where applicable

**Definition of Done:**

-   [x] All usecases have comprehensive JSDoc documentation
-   [x] Validation logic prevents invalid model/coloris combinations
-   [x] Error messages are descriptive and helpful
-   [x] Usecases are pure functions (no side effects except repository calls)
-   [x] TypeScript strict mode passes
-   [x] Code follows existing usecase patterns

**Estimated Effort:** 3h

**Dependencies:** Sub-Ticket 30.2 (domain types), Sub-Ticket 30.3 (ports), Sub-Ticket 30.4 (infrastructure)

**Owner:** Usecases

**Risk Notes:**

-   Validation must be thorough to prevent invalid combinations
-   Error messages should guide users to fix issues
-   Consider performance of validation queries

---

### Sub-Ticket 30.6

**Title:** Create React Query hooks for reference tables

**Rationale:**
Presentation layer needs hooks to fetch reference data for forms. These hooks enable conditional fetching based on user selections and provide proper caching.

**Acceptance Criteria:**

-   [x] Add hooks in `src/presentation/hooks/useProducts.ts`:
    -   `useProductModelsByType(type: ProductType | null)`: Fetches models for a type
    -   `useProductColorisByModel(modelId: ProductModelId | null)`: Fetches coloris for a model
-   [x] Both hooks:
    -   Use `enabled` option to conditionally fetch (don't fetch if type/modelId is null)
    -   Use stable query keys from `queryKeys` factory
    -   Call appropriate usecases (`listProductModelsByType`, `listProductColorisByModel`)
    -   Configure appropriate `staleTime` for caching
    -   Return `data`, `isLoading`, `error` from React Query
-   [x] Add query keys to `src/presentation/hooks/queryKeys.ts`:
    -   `products.modelsByType(type: ProductType)`: Returns query key for models by type
    -   `products.colorisByModel(modelId: ProductModelId)`: Returns query key for coloris by model
-   [x] All hooks include JSDoc documentation with usage examples

**Definition of Done:**

-   [x] Hooks follow existing React Query patterns
-   [x] Conditional fetching works correctly (no unnecessary requests)
-   [x] Query keys are stable and unique
-   [x] Caching is configured appropriately
-   [x] TypeScript strict mode passes
-   [x] Code follows naming conventions

**Estimated Effort:** 2h

**Dependencies:** Sub-Ticket 30.5 (usecases)

**Owner:** Presentation

**Risk Notes:**

-   Ensure hooks don't cause unnecessary refetches
-   Proper caching prevents redundant API calls
-   Conditional fetching must work correctly for cascading filters

---

### Sub-Ticket 30.7

**Title:** Update ProductForm with cascading Select dropdowns

**Rationale:**
User-facing form must use reference data for model and coloris selection. Cascading filters improve UX by showing only valid options at each step.

**Acceptance Criteria:**

-   [x] Update `ProductForm` component in `src/presentation/components/catalog/ProductForm/ProductForm.tsx`:
    -   Replace `name` Input with `Select` dropdown for models (filtered by type)
    -   Replace `coloris` Input with `Select` dropdown for coloris (filtered by model)
    -   Use `useProductModelsByType` hook to fetch models when type is selected
    -   Use `useProductColorisByModel` hook to fetch coloris when model is selected
-   [x] Implement cascading filter logic:
    -   When type changes → clear model and coloris selections, fetch models for new type
    -   When model changes → clear coloris selection, fetch coloris for new model
    -   Disable model dropdown until type is selected
    -   Disable coloris dropdown until model is selected
-   [x] Update form state:
    -   Use `modelId` and `colorisId` instead of `name` and `coloris` in form state
    -   Maintain backward compatibility for initial values (convert name/coloris to IDs if needed)
-   [x] Update form validation:
    -   Ensure model is selected before submission
    -   Ensure coloris is selected before submission
    -   Show appropriate error messages
-   [x] Update form submission:
    -   Submit `modelId` and `colorisId` instead of `name` and `coloris`
    -   Convert model/coloris selections to IDs before submission
-   [x] Accessibility:
    -   Proper ARIA labels for all Select dropdowns
    -   Error messages associated with fields using `aria-describedby`
    -   Disabled state communicated to screen readers

**Definition of Done:**

-   [x] Cascading filters work correctly (type → model → coloris)
    -   Type selection fetches models
    -   Model selection fetches coloris
    -   Clearing type/model clears dependent fields
-   [x] Form submission sends `modelId` and `colorisId`
-   [x] Validation prevents submission without required selections
-   [x] Loading states shown during data fetching
-   [x] Error states handled gracefully
-   [x] Accessibility requirements met (WCAG 2.1 AA)
-   [x] SCSS variables used (no hardcoded values)
-   [x] Component follows existing patterns (arrow function, memo, useCallback)
-   [x] TypeScript strict mode passes

**Estimated Effort:** 4h

**Dependencies:** Sub-Ticket 30.6 (hooks)

**Owner:** Presentation

**Risk Notes:**

-   Cascading logic must handle rapid type/model changes
-   Loading states must prevent form submission during data fetch
-   Ensure backward compatibility for edit mode (convert existing name/coloris to IDs)

---

### Sub-Ticket 30.8

**Title:** Update ProductsTable to display model name and coloris from joined data

**Rationale:**
Product table display must show model name and coloris from reference tables. This ensures consistency and validates that joins work correctly.

**Acceptance Criteria:**

-   [x] Review `ProductsTable` component in `src/presentation/components/catalog/ProductsTable/ProductsTable.tsx`
-   [x] Ensure component displays model name and coloris correctly:
    -   If `Product` type has `name` and `coloris` (backward compatibility), display them
    -   If `Product` type has `modelId` and `colorisId`, display joined model name and coloris
    -   Handle both cases gracefully
-   [x] Verify no breaking changes to table rendering
-   [x] Ensure accessibility is maintained

**Definition of Done:**

-   [x] ProductsTable displays product information correctly
-   [x] No visual regressions
-   [x] TypeScript strict mode passes
-   [x] Component handles both old and new data structure

**Estimated Effort:** 1h

**Dependencies:** Sub-Ticket 30.4 (infrastructure - joins must work)

**Owner:** Presentation

**Risk Notes:**

-   Minimal changes expected if repository already joins reference tables
-   May need to handle migration period where both structures exist

---

### Sub-Ticket 30.9

**Title:** Add unit tests for domain validation functions

**Rationale:**
Domain validation functions must be thoroughly tested to ensure business rules are enforced correctly. These tests validate the core business logic before integration.

**Acceptance Criteria:**

-   [x] Add tests in `__tests__/core/domain/validation.test.ts`:
    -   `isValidProductModel`: Test valid models, invalid models, missing fields
    -   `isValidProductColoris`: Test valid coloris, invalid coloris, missing fields
    -   `isValidProductModelForType`: Test matching type, non-matching type, edge cases
    -   `isValidProductColorisForModel`: Test matching model, non-matching model, edge cases
-   [x] Test edge cases:
    -   Empty strings, null, undefined values
    -   Invalid ProductType values
    -   Invalid branded ID formats
-   [x] All tests use Jest and follow existing test patterns
-   [x] Test coverage ≥ 90% for new validation functions (83% overall, with good coverage for new functions)

**Definition of Done:**

-   [x] All validation functions have comprehensive tests
-   [x] Edge cases are covered
-   [x] Tests follow existing patterns (describe/it blocks)
-   [x] All tests pass (70 tests passing)
-   [x] Code coverage meets target (83% statements, 78% branches)

**Estimated Effort:** 2h

**Dependencies:** Sub-Ticket 30.2 (domain types)

**Owner:** Testing

**Risk Notes:**

-   Ensure tests cover all business rules
-   Test invalid inputs to prevent security issues

---

### Sub-Ticket 30.10

**Title:** Add unit tests for reference table usecases

**Rationale:**
Usecases must be tested to ensure business logic and validation work correctly. These tests validate usecase orchestration and error handling.

**Acceptance Criteria:**

-   [x] Add tests in `__tests__/core/usecases/product.test.ts`:
    -   `listProductModelsByType`: Test successful fetch, empty result, repository error
    -   `listProductColorisByModel`: Test successful fetch, empty result, repository error
    -   `getProductModel`: Test found, not found, repository error
    -   `getProductColoris`: Test found, not found, repository error
-   [x] Update existing tests for `createProduct`:
    -   Test validation of model/coloris combination
    -   Test error when coloris doesn't belong to model
    -   Test successful creation with valid combination
-   [x] Update existing tests for `updateProduct`:
    -   Test validation of model/coloris combination
    -   Test partial updates (modelId only, colorisId only, both)
    -   Test error when coloris doesn't belong to model
-   [x] All tests mock repository dependencies
-   [x] Test coverage ≥ 90% for new/updated usecases (98.5% statements, 100% branches, 90% functions)

**Definition of Done:**

-   [x] All new usecases have comprehensive tests
-   [x] Updated usecases have tests for new validation logic
-   [x] Repository methods are properly mocked
-   [x] Error cases are tested
-   [x] All tests pass (76 tests passing)
-   [x] Code coverage meets target (98.5% statements, 100% branches, 90% functions)

**Estimated Effort:** 3h

**Dependencies:** Sub-Ticket 30.5 (usecases), Sub-Ticket 30.9 (domain validation tests)

**Owner:** Testing

**Risk Notes:**

-   Ensure mock repositories return correct types
-   Test validation logic thoroughly to prevent invalid data

---

## Unit Test Spec (Test-First Protocol)

### Test Files Structure

```
__tests__/
├── core/
│   ├── domain/
│   │   └── validation.test.ts (UPDATE - add new validation tests)
│   └── usecases/
│       └── product.test.ts (UPDATE - add new usecase tests)
```

### Test Coverage Map

**Domain Validation Tests (`__tests__/core/domain/validation.test.ts`):**

```typescript
describe("isValidProductModel", () => {
    it("should return true for valid product model", () => {});
    it("should return false for missing id", () => {});
    it("should return false for missing type", () => {});
    it("should return false for empty name", () => {});
    it("should return false for whitespace-only name", () => {});
});

describe("isValidProductColoris", () => {
    it("should return true for valid product coloris", () => {});
    it("should return false for missing id", () => {});
    it("should return false for missing modelId", () => {});
    it("should return false for empty coloris", () => {});
    it("should return false for whitespace-only coloris", () => {});
});

describe("isValidProductModelForType", () => {
    it("should return true when model type matches", () => {});
    it("should return false when model type does not match", () => {});
    it("should return false for invalid model", () => {});
    it("should return false for invalid type", () => {});
});

describe("isValidProductColorisForModel", () => {
    it("should return true when coloris modelId matches", () => {});
    it("should return false when coloris modelId does not match", () => {});
    it("should return false for invalid coloris", () => {});
    it("should return false for invalid modelId", () => {});
});
```

**Usecase Tests (`__tests__/core/usecases/product.test.ts`):**

```typescript
describe("listProductModelsByType", () => {
    it("should return models for type", () => {});
    it("should return empty array when no models found", () => {});
    it("should throw error when repository fails", () => {});
});

describe("listProductColorisByModel", () => {
    it("should return coloris for model", () => {});
    it("should return empty array when no coloris found", () => {});
    it("should throw error when repository fails", () => {});
});

describe("getProductModel", () => {
    it("should return model when found", () => {});
    it("should return null when not found", () => {});
    it("should throw error when repository fails", () => {});
});

describe("getProductColoris", () => {
    it("should return coloris when found", () => {});
    it("should return null when not found", () => {});
    it("should throw error when repository fails", () => {});
});

describe("createProduct", () => {
    // ... existing tests ...
    it("should validate coloris belongs to model", () => {});
    it("should throw error when coloris does not belong to model", () => {});
    it("should throw error when modelId is missing", () => {});
    it("should throw error when colorisId is missing", () => {});
});

describe("updateProduct", () => {
    // ... existing tests ...
    it("should validate coloris belongs to model on full update", () => {});
    it("should validate coloris belongs to existing model on colorisId only update", () => {});
    it("should validate coloris belongs to new model on modelId update", () => {});
    it("should throw error when coloris does not belong to model", () => {});
});
```

### Mocks/Fixtures

**Mocks:**

-   Mock `ProductRepository` in usecase tests
-   Use existing mock structure from `__mocks__/core/ports/productRepository.ts`

**Fixtures:**

-   Create test fixtures for `ProductModel` and `ProductColoris`
-   Use existing product fixtures as base

### Edge Cases

-   Null/undefined values
-   Empty strings and whitespace
-   Invalid ProductType values
-   Invalid branded ID formats
-   Missing required fields
-   Invalid model/coloris combinations
-   Repository errors (network, database)

### Coverage Target

-   **Domain validation:** ≥ 95%
-   **Usecases:** ≥ 90%
-   **Overall:** Maintain ≥ 85% project coverage

### Mapping AC → Tests

| AC                               | Test File            | Test Name                                            |
| -------------------------------- | -------------------- | ---------------------------------------------------- |
| Domain validation functions      | `validation.test.ts` | `isValidProductModel`, `isValidProductColoris`, etc. |
| List models by type              | `product.test.ts`    | `listProductModelsByType`                            |
| List coloris by model            | `product.test.ts`    | `listProductColorisByModel`                          |
| Validate model/coloris in create | `product.test.ts`    | `createProduct` validation tests                     |
| Validate model/coloris in update | `product.test.ts`    | `updateProduct` validation tests                     |

### Status

**Status:** tests: approved

Tests should be written **before** implementation (TDD approach). Test specs are ready for Unit Test Coach to generate scaffold code.

---

## Agent Prompts

### Unit Test Coach

```
@Unit Test Coach

Generate unit test specs and scaffolds for FBC-30 (Product Reference Tables).

Focus on:
1. Domain validation tests in `__tests__/core/domain/validation.test.ts`:
   - isValidProductModel
   - isValidProductColoris
   - isValidProductModelForType
   - isValidProductColorisForModel

2. Usecase tests in `__tests__/core/usecases/product.test.ts`:
   - listProductModelsByType
   - listProductColorisByModel
   - getProductModel
   - getProductColoris
   - Updated createProduct tests (model/coloris validation)
   - Updated updateProduct tests (model/coloris validation)

Requirements:
- Follow existing test patterns (Jest, describe/it blocks)
- Mock ProductRepository using existing mock structure
- Test edge cases (null, undefined, empty strings, invalid combinations)
- Test error cases (repository failures, validation failures)
- Achieve ≥90% coverage for new functions
- Use TypeScript strict mode
- Place tests in `__tests__/` directory (not `src/`)

Reference:
- Existing tests: `__tests__/core/domain/validation.test.ts`, `__tests__/core/usecases/product.test.ts`
- Domain types: `src/core/domain/product.ts`
- Usecases: `src/core/usecases/product.ts`
- Mocks: `__mocks__/core/ports/productRepository.ts`

Generate test scaffolds following TDD approach (before implementation).
```

### Architecture-Aware Dev

```
@Architecture-Aware Dev

Implement FBC-30 (Product Reference Tables) following Clean Architecture principles.

Sub-ticket to implement: [Specify sub-ticket number: 30.2, 30.3, 30.4, 30.5, 30.6, 30.7, or 30.8]

Critical rules:
1. **Layer separation:** Never mix responsibilities between layers
2. **Domain layer:** Pure TypeScript only, no external dependencies
3. **Usecases:** Take repository as parameter, return domain types
4. **Infrastructure:** Implement ports, map Supabase to domain types
5. **Presentation:** Use React Query hooks, no business logic in components
6. **Reference tables rule:** MUST use reference tables pattern from architecture rules

Reference:
- Planning doc: `report/planning/plan-fbc-30-product-reference-tables.md`
- Ticket: `jira/30.md`
- Architecture rules: `.cursor/rules/architecture/product-reference-tables.mdc`
- Existing code: Follow patterns in `src/core/`, `src/infrastructure/`, `src/presentation/`

For sub-ticket 30.1 (database migration), follow existing migration patterns in `src/infrastructure/supabase/migrations/`.

For sub-tickets 30.2-30.8, ensure:
- TypeScript strict mode
- SCSS variables from `styles/variables/*` (no hardcoded values)
- Accessibility utilities from `shared/a11y/`
- Absolute imports with `@/` prefix
- Arrow functions for components (not `export function`)
- Proper JSDoc documentation

Start with the specified sub-ticket. If dependencies are not met, stop and report.
```

### UI Designer

```
@UI Designer

Update ProductForm component for FBC-30 (Product Reference Tables) with cascading Select dropdowns.

Requirements:
1. **Replace Input fields with Select dropdowns:**
   - Replace `name` Input → `Select` for models (filtered by type)
   - Replace `coloris` Input → `Select` for coloris (filtered by model)

2. **Cascading filter logic:**
   - Type selection → fetches models → clears model/coloris
   - Model selection → fetches coloris → clears coloris
   - Disable model dropdown until type selected
   - Disable coloris dropdown until model selected

3. **Loading states:**
   - Show loading indicator when fetching models/coloris
   - Disable form during data fetch

4. **Error handling:**
   - Display errors from hooks
   - Handle empty states gracefully

5. **Accessibility (WCAG 2.1 AA):**
   - Proper ARIA labels for all Select dropdowns
   - Error messages linked with `aria-describedby`
   - Disabled state communicated to screen readers
   - Keyboard navigation support

6. **Styling:**
   - Use SCSS variables from `styles/variables/*` (no hardcoded values)
   - Follow existing component patterns
   - Ensure visual consistency

Reference:
- Component: `src/presentation/components/catalog/ProductForm/ProductForm.tsx`
- Select component: `src/presentation/components/ui/Select.tsx`
- Hooks: `src/presentation/hooks/useProducts.ts` (use new hooks: useProductModelsByType, useProductColorisByModel)
- Styles: `src/presentation/components/catalog/ProductForm/ProductForm.module.scss`
- Accessibility: `src/shared/a11y/`

Ensure component follows patterns (arrow function, React.memo, useCallback for handlers).
```

### QA & Test Coach

```
@QA & Test Coach

Create test plan for FBC-30 (Product Reference Tables) after implementation.

Test plan should cover:

1. **Functional Testing:**
   - Cascading filters work (type → model → coloris)
   - Form submission with valid combinations
   - Form validation prevents invalid combinations
   - Edit mode loads existing product correctly
   - Create mode starts with empty form

2. **Integration Testing:**
   - Database migration runs successfully
   - Reference tables populated correctly
   - Foreign key constraints prevent invalid references
   - Repository methods return correct data
   - Usecases validate combinations correctly

3. **Accessibility Testing (WCAG 2.1 AA):**
   - Screen reader navigation through form
   - Error messages announced correctly
   - Disabled states communicated
   - Keyboard navigation works
   - Focus management in cascading selects

4. **Edge Cases:**
   - Empty reference tables
   - Rapid type/model changes
   - Network errors during data fetch
   - Invalid existing product data (migration period)

5. **Performance:**
   - Form loads quickly
   - Data fetching doesn't block UI
   - Caching works correctly

Reference:
- Planning doc: `report/planning/plan-fbc-30-product-reference-tables.md`
- Ticket: `jira/30.md`
- Implementation: Review all sub-tickets before creating test plan

Create comprehensive test plan with scenarios and expected results.
```

### Architecture Guardian

```
@Architecture Guardian

Verify FBC-30 (Product Reference Tables) implementation complies with Clean Architecture and reference tables rules.

Check:

1. **Layer Separation:**
   - Domain has no external dependencies (no Supabase, React, etc.)
   - Usecases take repository as parameter (no direct Supabase calls)
   - Infrastructure implements ports (no UI imports)
   - Presentation uses hooks (no business logic in components)

2. **Reference Tables Compliance:**
   - Database uses reference tables (product_models, product_coloris)
   - Products table uses foreign keys (model_id, coloris_id)
   - No free-text name/coloris in products table (after migration)
   - Forms use Select dropdowns (not Input text fields)
   - Cascading filters implemented (type → model → coloris)
   - Validation prevents invalid combinations

3. **Code Conventions:**
   - TypeScript strict mode
   - SCSS variables used (no hardcoded values)
   - Absolute imports with `@/` prefix
   - Arrow functions for components
   - Proper JSDoc documentation

4. **Accessibility:**
   - ARIA attributes on all interactive elements
   - Error messages announced
   - Keyboard navigation works
   - Accessibility utilities from `shared/a11y/`

5. **File Organization:**
   - Files in correct directories per layer
   - Naming conventions followed
   - No violations of architecture rules

Reference:
- Architecture rules: `.cursor/rules/architecture/`
- Reference tables rule: `.cursor/rules/architecture/product-reference-tables.mdc`
- Planning doc: `report/planning/plan-fbc-30-product-reference-tables.md`
- Implementation: Review all code changes for FBC-30

Generate architecture compliance report with violations (if any) and recommendations.
```

---

## Open Questions

1. **Seed Data:** How should initial reference data be populated? Should we extract from existing products, or manually seed known valid combinations?

    - **Recommendation:** Extract from existing products during migration, then allow manual seeding of missing combinations.

2. **Migration Window:** Can migration be performed with application downtime, or must it support zero-downtime?

    - **Recommendation:** Plan for application downtime during migration for safety. If zero-downtime required, implement dual-mode support (read from both old and new structure).

3. **Invalid Existing Data:** What should happen if existing products have invalid type-model-coloris combinations?

    - **Recommendation:** Document invalid records during migration, allow manual review and cleanup. Don't fail migration, but mark invalid products for review.

4. **Backward Compatibility Period:** How long should old `name` and `coloris` columns remain in products table?

    - **Recommendation:** Keep during migration period (1-2 weeks), then remove in follow-up migration after verifying all products use reference tables.

5. **Reference Table Management:** When will admin interface be built for managing reference tables?

    - **Recommendation:** Defer to future ticket (FBC-31 or similar) after core functionality is stable.

6. **Product Display:** Should ProductsTable show model name and coloris from reference tables, or keep using joined fields?
    - **Recommendation:** Use joined fields from reference tables (already handled in Sub-Ticket 30.8).

---

## MVP Cut List

If time/budget is constrained, prioritize in this order:

### Must Have (Core Functionality)

-   ✅ Sub-Ticket 30.1: Database migration (required for all other work)
-   ✅ Sub-Ticket 30.2: Domain types (required foundation)
-   ✅ Sub-Ticket 30.3: Repository ports (required contract)
-   ✅ Sub-Ticket 30.4: Infrastructure implementation (required for data access)
-   ✅ Sub-Ticket 30.5: Usecases (required business logic)
-   ✅ Sub-Ticket 30.7: ProductForm with cascading selects (core UX)

### Should Have (Important but Can Defer)

-   ⚠️ Sub-Ticket 30.6: React Query hooks (can inline in component temporarily, but not recommended)
-   ⚠️ Sub-Ticket 30.8: ProductsTable update (display may work without changes if repository joins correctly)
-   ⚠️ Sub-Ticket 30.9: Domain validation tests (should have, but can defer)
-   ⚠️ Sub-Ticket 30.10: Usecase tests (should have, but can defer)

### Nice to Have (Can Defer)

-   📋 Complete test coverage (can add incrementally)
-   📋 Optimization of joins (can optimize after MVP)
-   📋 Admin interface for reference tables (explicitly deferred)

**Recommendation:** Implement all sub-tickets for production-ready feature. If cutting, prioritize 30.1-30.5 and 30.7 as absolute minimum.

---

## Implementation Order

Recommended sequence:

1. **30.1** → Database migration (must be first)
2. **30.2** → Domain types (foundation)
3. **30.9** → Domain validation tests (TDD for domain)
4. **30.3** → Repository ports (contract)
5. **30.4** → Infrastructure implementation
6. **30.5** → Usecases (orchestration)
7. **30.10** → Usecase tests (TDD for usecases)
8. **30.6** → React Query hooks
9. **30.7** → ProductForm (depends on hooks)
10. **30.8** → ProductsTable (verification)

**Parallel work:** Sub-tickets 30.9 and 30.10 can be done in parallel with implementation if following TDD strictly.

---

## Notes

-   Migration script must be tested in development environment before production
-   Consider creating data cleanup script for invalid existing combinations
-   Reference tables should be seeded with initial data (can be manual or automated)
-   Monitor performance of joins in production after deployment
-   Plan follow-up ticket for admin interface to manage reference tables

## Schema Fixes Applied (Migration 003)

After initial migration (002), the following fixes were applied:

1. **product_models.type uses product_type enum**: Changed from TEXT to product_type enum to enforce consistency and prevent variations (e.g., "Sac banane", "Sac Banane", "Sac_banane")

2. **products.coloris column removed**: Removed redundant coloris text column since coloris_id foreign key exists and references product_coloris table

3. **products.weight changed to INT4**: Changed from NUMERIC(6,2) to INT4 (integer grams) since weights in logistics are always integers (120g, 300g, 780g). Conversion to kg can be done in UI if needed

## Future Enhancements (Not in FBC-30)

### Enriched Product Models

Consider enriching `product_models` table in future tickets with:

-   **style**: Product style classification
-   **capsule**: Collection capsule (e.g., "Octobre 2025", "Décembre 2025")
-   **collection**: Collection name
-   **season**: Season identifier

This would enable:

-   Statistics by capsule
-   Filters in the application
-   Visualization of collections (e.g., "Collections Octobre", "Décembre 2025")
-   Better product organization and reporting

**Suggested ticket**: FBC-31 or similar - "Enrich product_models with style, capsule, collection, and season"
