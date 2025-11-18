---
Generated: 2025-01-27 16:00:00
Report Type: planning
Command: pm-plan-from-ticket
Ticket: FBC-21
---

# Implementation Plan: Add weight field to Product domain model

## Summary

**Goal:** Add a `weight` (poids) field to the Product domain model to track product weight in grams, enabling shipping cost calculations, logistics management, and complete product information for customers.

**User value:** Users can now track product weight to calculate accurate shipping fees for online sales, optimize package preparation and shipping logistics, provide weight information to customers, and analyze real shipping costs for profitability analysis.

**Constraints:**

-   Follow Clean Architecture: Domain layer must remain pure TypeScript with no external dependencies
-   Field must be optional (`weight?: number`) - allows products without weight initially
-   Field represents weight in grams (NUMERIC(6, 2) in database)
-   Database migration must handle existing data (nullable column, no default needed)
-   All tests must be updated to optionally include weight field
-   Validation function must validate weight if present (must be > 0)
-   JSDoc documentation must be updated

**Non-goals:**

-   Creating UI components for weight input or display
-   Implementing product repository or usecases (infrastructure/presentation layers)
-   Adding weight-based filtering or search functionality
-   Implementing shipping cost calculation logic (future enhancement)
-   Creating weight-based inventory management features (future enhancement)

## Assumptions & Risks

**Assumptions:**

-   Existing Product domain structure (`src/core/domain/product.ts`) follows established patterns
-   Database migration can add nullable column without affecting existing products
-   No existing product data in production (or nullable column is acceptable)
-   Weight field will remain as optional number (not required) to allow gradual data entry
-   All existing tests can be updated with optional weight field in fixtures
-   Validation should ensure weight is positive (> 0) if provided
-   Weight is stored in grams for precision and compatibility with shipping carriers

**Risks:**

-   **Risk:** Existing code creating Product objects may need updates if TypeScript strict mode requires explicit undefined
    -   **Mitigation:** Optional field (`weight?: number`) means existing code continues to work without changes
-   **Risk:** Breaking changes to existing test fixtures if not updated properly
    -   **Mitigation:** Update all test fixtures systematically, ensure all tests pass before merging
-   **Risk:** Validation logic may need to handle edge cases (very large weights, decimal precision)
    -   **Mitigation:** Use NUMERIC(6, 2) in database to limit precision, validate > 0 in domain
-   **Risk:** Future shipping calculations may need weight, but it's optional now
    -   **Mitigation:** Document this as a future enhancement, allow products without weight for now

## Solution Outline (aligned with architecture)

This feature follows Clean Architecture principles:

1. **Domain Layer** (`src/core/domain/product.ts`):

    - Add `weight?: number` field to `Product` type (optional field)
    - Update JSDoc documentation to describe weight field, unit (grams), and business meaning

2. **Domain Validation** (`src/core/domain/validation.ts`):

    - Update `isValidProduct` function to validate weight if present (must be > 0)
    - Weight is optional, so validation only applies when weight is provided

3. **Infrastructure Layer** (`src/infrastructure/supabase/migrations/`):

    - Create migration `003_add_weight_to_products.sql`
    - Add `weight NUMERIC(6, 2) CHECK (weight IS NULL OR weight > 0)` column to `products` table
    - Column is nullable (no NOT NULL constraint) to allow products without weight

4. **Tests** (`__tests__/core/domain/`):
    - Update Product test fixtures to optionally include weight field
    - Add tests for weight validation (positive, optional)
    - Update existing tests to ensure they pass with optional weight field

**Data Flow:**

-   Domain type change → Validation update → Database migration → Test updates
-   No changes to usecases, ports, or presentation layers (not yet implemented)

## Sub-Tickets

### Sub-Ticket 21.1

**Title:** Add weight field to Product domain type

**Rationale:**
The Product domain type needs to include the optional weight field to represent product weight in grams. This is the foundation for all subsequent changes and must be done first to ensure type safety throughout the codebase.

**Acceptance Criteria:**

-   [x] Add `weight?: number` field to `Product` type in `src/core/domain/product.ts`
-   [x] Field is optional (using `?` syntax) to allow products without weight
-   [x] Update JSDoc documentation for Product type to describe weight field
-   [x] JSDoc explains business meaning: weight in grams for shipping calculations
-   [x] JSDoc includes unit information (grams) and examples from real business data (e.g., "Sac banane: ~150-200 grams")
-   [x] JSDoc notes that field is optional
-   [x] TypeScript compilation succeeds with no errors

**Definition of Done:**

-   [x] `Product` type includes `weight?: number` field
-   [x] JSDoc documentation updated with complete description
-   [x] TypeScript compilation passes
-   [x] No linting errors

**Estimated Effort:** 0.5h

**Dependencies:** None

**Owner:** Architecture-Aware Dev

**Risk Notes:** Low risk - optional field means no breaking changes to existing code

---

### Sub-Ticket 21.2

**Title:** Update Product validation to include weight validation

**Rationale:**
The validation function must ensure that if weight is provided, it follows business rules (must be positive). Since weight is optional, validation only applies when weight is present.

**Acceptance Criteria:**

-   [x] Update `isValidProduct` function in `src/core/domain/validation.ts` to validate weight
-   [x] Validation allows products without weight (undefined/null)
-   [x] Validation ensures weight is positive (> 0) if provided
-   [x] Validation rejects products with weight <= 0
-   [x] Update JSDoc for `isValidProduct` to document weight validation rules
-   [x] Update JSDoc examples to show weight validation scenarios

**Definition of Done:**

-   [x] `isValidProduct` validates weight correctly (optional, must be > 0 if present)
-   [x] JSDoc documentation updated
-   [x] TypeScript compilation passes
-   [x] No linting errors

**Estimated Effort:** 0.5h

**Dependencies:** Sub-Ticket 21.1 (Product type must include weight field)

**Owner:** Architecture-Aware Dev

**Risk Notes:** Low risk - validation logic is straightforward

---

### Sub-Ticket 21.3

**Title:** Create database migration to add weight column to products table

**Rationale:**
The database schema must be updated to store product weight. The column is nullable to allow existing products and new products without weight initially.

**Acceptance Criteria:**

-   [x] Create migration file `src/infrastructure/supabase/migrations/003_add_weight_to_products.sql`
-   [x] Migration adds `weight NUMERIC(6, 2)` column to `products` table
-   [x] Column is nullable (no NOT NULL constraint)
-   [x] Migration includes CHECK constraint: `weight IS NULL OR weight > 0`
-   [x] Migration includes COMMENT on column explaining purpose and unit (grams)
-   [x] Migration follows naming conventions and includes proper documentation
-   [x] Migration can be applied to existing database without errors

**Definition of Done:**

-   [x] Migration file created with correct SQL syntax
-   [x] Migration tested on dev database (if possible)
-   [x] Migration documented in `src/infrastructure/supabase/migrations/README.md`
-   [x] No SQL syntax errors

**Estimated Effort:** 0.5h

**Dependencies:** None (can be done in parallel with domain changes)

**Owner:** Architecture-Aware Dev

**Risk Notes:** Low risk - nullable column means no data migration needed

---

### Sub-Ticket 21.4

**Title:** Update Product domain tests to include optional weight field

**Rationale:**
All Product test fixtures must be updated to optionally include weight field. Tests must verify that weight is optional and validate correctly when provided.

**Acceptance Criteria:**

-   [x] Update all Product test fixtures in `__tests__/core/domain/product.test.ts` to optionally include weight
-   [x] Add test cases for weight field:
    -   [x] Product can be created without weight (undefined)
    -   [x] Product can be created with valid weight (> 0)
    -   [x] Product with weight validates correctly
    -   [x] Product without weight validates correctly
-   [x] Update existing tests to ensure they pass with optional weight field
-   [x] All tests pass with new optional field

**Definition of Done:**

-   [x] All Product test fixtures updated
-   [x] New weight validation tests added
-   [x] All existing tests pass
-   [x] Test coverage maintained or improved
-   [x] No linting errors

**Estimated Effort:** 1h

**Dependencies:** Sub-Ticket 21.1 (Product type), Sub-Ticket 21.2 (Validation)

**Owner:** Architecture-Aware Dev

**Risk Notes:** Medium risk - need to ensure all test fixtures are updated correctly

---

### Sub-Ticket 21.5

**Title:** Update Product validation tests to include weight validation

**Rationale:**
Validation tests must verify that weight validation works correctly (optional field, must be > 0 if present).

**Acceptance Criteria:**

-   [ ] Update validation test fixtures in `__tests__/core/domain/validation.test.ts` to optionally include weight
-   [ ] Add test cases for weight validation:
    -   [ ] `isValidProduct` returns true for product without weight
    -   [ ] `isValidProduct` returns true for product with valid weight (> 0)
    -   [ ] `isValidProduct` returns false for product with weight = 0
    -   [ ] `isValidProduct` returns false for product with negative weight
    -   [ ] `isValidProduct` returns false for product with weight = -1
-   [ ] Update existing validation tests to ensure they pass with optional weight field
-   [ ] All validation tests pass

**Definition of Done:**

-   [ ] All validation test fixtures updated
-   [ ] New weight validation tests added
-   [ ] All existing validation tests pass
-   [ ] Test coverage maintained or improved
-   [ ] No linting errors

**Estimated Effort:** 1h

**Dependencies:** Sub-Ticket 21.2 (Validation function)

**Owner:** Architecture-Aware Dev

**Risk Notes:** Low risk - validation tests are straightforward

---

## Unit Test Spec (Test-First Protocol)

### Files & Paths

-   `__tests__/core/domain/product.test.ts` - Product type structure tests
-   `__tests__/core/domain/validation.test.ts` - Product validation tests

### Test Structure

#### Product Type Tests (`__tests__/core/domain/product.test.ts`)

**New test cases to add:**

```typescript
describe("Product weight field", () => {
    it("should allow product without weight (undefined)", () => {
        const product: Product = {
            id: createProductId("123e4567-e89b-4d3a-a456-426614174000"),
            name: "Sac banane L'Assumée",
            type: ProductType.SAC_BANANE,
            coloris: "Prune",
            unitCost: 10.5,
            salePrice: 19.99,
            stock: 100,
            // weight is optional, can be omitted
        };
        expect(product.weight).toBeUndefined();
    });

    it("should allow product with valid weight", () => {
        const product: Product = {
            ...validProduct,
            weight: 150.5, // grams
        };
        expect(product.weight).toBe(150.5);
        expect(typeof product.weight).toBe("number");
    });

    it("should allow weight with decimal precision", () => {
        const product: Product = {
            ...validProduct,
            weight: 123.45,
        };
        expect(product.weight).toBe(123.45);
    });
});
```

#### Validation Tests (`__tests__/core/domain/validation.test.ts`)

**New test cases to add:**

```typescript
describe("isValidProduct - weight validation", () => {
    it("should validate product without weight", () => {
        const product: Product = {
            ...validProduct,
            // weight is optional, can be omitted
        };
        expect(isValidProduct(product)).toBe(true);
    });

    it("should validate product with valid weight", () => {
        const product: Product = {
            ...validProduct,
            weight: 150.5,
        };
        expect(isValidProduct(product)).toBe(true);
    });

    it("should reject product with weight = 0", () => {
        const product: Product = {
            ...validProduct,
            weight: 0,
        };
        expect(isValidProduct(product)).toBe(false);
    });

    it("should reject product with negative weight", () => {
        const product: Product = {
            ...validProduct,
            weight: -10,
        };
        expect(isValidProduct(product)).toBe(false);
    });

    it("should reject product with very small positive weight", () => {
        const product: Product = {
            ...validProduct,
            weight: 0.001,
        };
        // Should be valid (any positive number > 0)
        expect(isValidProduct(product)).toBe(true);
    });
});
```

### Mocks/Fixtures

Update existing `validProduct` fixture to optionally include weight:

```typescript
const validProduct: Product = {
    id: createProductId("123e4567-e89b-4d3a-a456-426614174000"),
    name: "Sac banane L'Assumée",
    type: ProductType.SAC_BANANE,
    coloris: "Prune",
    unitCost: 10.5,
    salePrice: 19.99,
    stock: 100,
    // weight is optional, can be added in specific tests
};
```

### Edge Cases

-   Product without weight (undefined) - should be valid
-   Product with weight = 0 - should be invalid
-   Product with negative weight - should be invalid
-   Product with very small positive weight (0.01) - should be valid
-   Product with very large weight (9999.99) - should be valid (within NUMERIC(6, 2) range)
-   Product with decimal precision (123.45) - should be valid

### Coverage Target

-   100% coverage for weight field validation
-   All existing Product tests continue to pass
-   All edge cases covered

### Mapping AC → Tests

-   AC: "Field is optional" → Test: "should allow product without weight"
-   AC: "Field represents weight in grams" → Test: "should allow product with valid weight"
-   AC: "Validation ensures weight > 0 if present" → Tests: weight = 0, negative weight, positive weight
-   AC: "Update all Product test fixtures" → All fixtures updated to optionally include weight

### Status

**Status:** `tests: proposed`

Tests should be written before implementation (TDD approach) or updated alongside implementation.

---

## Agent Prompts

### Unit Test Coach

```
Generate unit tests for adding optional weight field to Product domain model (FBC-21).

Context:
- Product type will have optional field: `weight?: number` (weight in grams)
- Validation: if weight is provided, it must be > 0
- Weight is optional, so products can exist without weight

Requirements:
1. Update `__tests__/core/domain/product.test.ts`:
   - Add tests for weight field structure (optional, number type)
   - Test products with and without weight
   - Test decimal precision

2. Update `__tests__/core/domain/validation.test.ts`:
   - Add tests for weight validation in `isValidProduct`
   - Test: product without weight (valid)
   - Test: product with weight > 0 (valid)
   - Test: product with weight = 0 (invalid)
   - Test: product with negative weight (invalid)

3. Update all existing test fixtures to optionally include weight field

Follow TDD approach: write tests first, then implementation will follow.
Use existing test patterns from Product and validation tests.
```

### Architecture-Aware Dev

```
Implement Sub-Ticket 21.1, 21.2, 21.3, 21.4, 21.5: Add weight field to Product domain model (FBC-21).

Context:
- Add optional `weight?: number` field to Product type (weight in grams)
- Update validation to ensure weight > 0 if provided
- Create database migration for nullable weight column
- Update all tests

Requirements:
1. Domain Layer (`src/core/domain/product.ts`):
   - Add `weight?: number` to Product type
   - Update JSDoc with business meaning, unit (grams), examples

2. Validation (`src/core/domain/validation.ts`):
   - Update `isValidProduct` to validate weight if present (must be > 0)
   - Update JSDoc examples

3. Database Migration (`src/infrastructure/supabase/migrations/003_add_weight_to_products.sql`):
   - Add `weight NUMERIC(6, 2) CHECK (weight IS NULL OR weight > 0)` column
   - Add COMMENT on column
   - Column is nullable (no NOT NULL)

4. Tests:
   - Update all Product test fixtures to optionally include weight
   - Add weight validation tests
   - Ensure all existing tests pass

Follow Clean Architecture: Domain layer pure TypeScript, no external dependencies.
Follow existing patterns from coloris field implementation (FBC-20).
```

### QA & Test Coach

```
Review and verify weight field implementation for Product domain model (FBC-21).

Verify:
1. Product type includes optional `weight?: number` field
2. Validation correctly handles optional weight (valid if undefined, must be > 0 if present)
3. Database migration adds nullable weight column correctly
4. All tests pass (Product type tests, validation tests)
5. Test coverage maintained or improved
6. No TypeScript errors
7. No linting errors
8. JSDoc documentation complete

Test scenarios:
- Product without weight (should be valid)
- Product with weight > 0 (should be valid)
- Product with weight = 0 (should be invalid)
- Product with negative weight (should be invalid)
- All existing tests still pass

Verify alignment with business domain (Atelier F.B.C textile accessories).
```

### Architecture Guardian

```
Review architecture compliance for weight field addition to Product domain model (FBC-21).

Verify:
1. Domain layer remains pure TypeScript (no external dependencies)
2. Validation logic in domain layer (not in infrastructure or presentation)
3. Database migration follows conventions (snake_case, proper constraints)
4. Tests follow Clean Architecture (domain tests test domain logic only)
5. No business logic in infrastructure or presentation layers
6. Type safety maintained (branded types, optional field syntax)
7. JSDoc documentation complete and accurate

Check for violations:
- Business logic outside domain layer
- External dependencies in domain
- Missing validation
- Type safety issues
- Documentation gaps
```

---

## Open Questions

1. **Weight unit confirmation**: Confirm that grams is the correct unit for all use cases (shipping calculations, customer display). Alternative: kilograms with decimal precision.

2. **Weight precision**: Is NUMERIC(6, 2) sufficient (max 9999.99 grams = ~10 kg)? Or should we use NUMERIC(7, 2) for larger products?

3. **Future shipping integration**: Should we document how weight will be used in future shipping cost calculations? (Not blocking, but good to plan ahead)

4. **Weight data entry**: How will weight be entered initially? Manual entry, import from spreadsheet, or measured and entered later? (Affects UI design in future tickets)

5. **Weight validation range**: Should we add a maximum weight constraint (e.g., < 10000 grams) or allow any positive number? (Current plan allows any positive number within NUMERIC(6, 2) range)

---

## MVP Cut List

If we need to reduce scope, we can cut:

-   **Can cut**: Detailed weight examples in JSDoc (keep basic description)
-   **Can cut**: COMMENT on database column (keep CHECK constraint)
-   **Cannot cut**: Core field addition, validation, migration, tests (all essential)

---

## Estimated Total Effort

-   Sub-Ticket 21.1: 0.5h
-   Sub-Ticket 21.2: 0.5h
-   Sub-Ticket 21.3: 0.5h
-   Sub-Ticket 21.4: 1h
-   Sub-Ticket 21.5: 1h

**Total: 3.5 hours**

This aligns with the ticket's Story Points estimate of 2 (approximately 2-4 hours of work).

---

## Next Steps

1. Review and approve this plan
2. Generate unit tests (Unit Test Coach) - Test-First Protocol
3. Implement Sub-Tickets 21.1-21.5 (Architecture-Aware Dev)
4. Review implementation (QA & Test Coach, Architecture Guardian)
5. Apply database migration to dev environment
6. Verify all tests pass
7. Merge to feature branch
