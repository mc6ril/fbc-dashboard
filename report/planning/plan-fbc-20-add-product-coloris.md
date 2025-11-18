---
Generated: 2025-01-27 16:00:00
Report Type: planning
Command: pm-plan-from-ticket
Ticket: FBC-20
---

# Implementation Plan: Add coloris field to Product domain model

## Summary

**Goal:** Add a `coloris` (color) field to the Product domain model to track product color variations, enabling proper inventory and sales management for different color options of the same product model.

**User value:** Users can now track and manage products with multiple color variations (e.g., "Rose pâle à motifs", "Rose marsala", "Prune", "Rouge", "Pêche", "Rose") for the same model and type. This enables accurate inventory tracking and sales reporting for color-specific product variants.

**Constraints:**

-   Follow Clean Architecture: Domain layer must remain pure TypeScript with no external dependencies
-   Field must be required (NOT NULL) - all products must have a coloris
-   Field must be a string (TEXT) to allow flexible color descriptions
-   Database migration must handle existing data (default value strategy)
-   All tests must be updated to include coloris field
-   Validation function must include coloris validation
-   JSDoc documentation must be updated

**Non-goals:**

-   Creating UI components for coloris selection or display
-   Implementing product repository or usecases (infrastructure/presentation layers)
-   Adding coloris filtering or search functionality
-   Creating coloris enum or predefined color list (keeping it flexible as TEXT)

## Assumptions & Risks

**Assumptions:**

-   Existing Product domain structure (`src/core/domain/product.ts`) follows established patterns
-   Database migration can use default value "Non spécifié" for existing products
-   No existing product data in production (or migration strategy is acceptable)
-   Coloris field will remain as TEXT (not enum) to allow flexible color descriptions
-   All existing tests can be updated with coloris field in fixtures
-   Validation should ensure coloris is a non-empty string

**Risks:**

-   **Risk:** Existing products in database may need coloris backfill
    -   **Mitigation:** Migration uses DEFAULT 'Non spécifié' to handle existing rows, can be updated later if needed
-   **Risk:** Breaking changes to existing test fixtures
    -   **Mitigation:** Update all test fixtures systematically, ensure all tests pass before merging
-   **Risk:** TypeScript compilation errors in code that creates Product objects
    -   **Mitigation:** TypeScript will catch all missing coloris fields at compile time, update all occurrences
-   **Risk:** Validation logic may need to be more sophisticated (e.g., trim whitespace)
    -   **Mitigation:** Start with simple non-empty string validation, can enhance later if needed

## Solution Outline (aligned with architecture)

This feature follows Clean Architecture principles:

1. **Domain Layer** (`src/core/domain/product.ts`):

    - Add `coloris: string` field to `Product` type
    - Update JSDoc documentation to describe coloris field and business meaning

2. **Domain Validation** (`src/core/domain/validation.ts`):

    - Update `isValidProduct` function to validate coloris is a non-empty string

3. **Infrastructure Layer** (`src/infrastructure/supabase/migrations/`):

    - Create migration `002_add_coloris_to_products.sql`
    - Add `coloris TEXT NOT NULL DEFAULT 'Non spécifié'` column to `products` table

4. **Tests** (`__tests__/core/domain/`):
    - Update all Product test fixtures to include coloris field
    - Add tests for coloris validation
    - Update existing tests to ensure they pass with new field

**Data Flow:**

-   Domain type change → Validation update → Database migration → Test updates
-   No changes to usecases, ports, or presentation layers (not yet implemented)

## Sub-Tickets

### Sub-Ticket 20.1

**Title:** Add coloris field to Product domain type

**Rationale:**
The Product domain type needs to include the coloris field to represent product color variations. This is the foundation for all subsequent changes and must be done first to ensure type safety throughout the codebase.

**Acceptance Criteria:**

-   [x] Add `coloris: string` field to `Product` type in `src/core/domain/product.ts`
-   [x] Update JSDoc documentation for Product type to describe coloris field
-   [x] JSDoc explains business meaning: color variations for the same product model
-   [x] JSDoc includes examples from real business data (e.g., "Rose pâle à motifs", "Rose marsala")
-   [x] TypeScript compilation succeeds with no errors

**Definition of Done:**

-   [x] Product type includes coloris field
-   [x] JSDoc documentation updated with coloris description and examples
-   [x] All TypeScript type checks pass
-   [x] No linting errors

**Estimated Effort:** 1h

**Dependencies:** None

**Owner:** Architecture-Aware Dev

**Risk Notes:** TypeScript will show compilation errors for all Product objects missing coloris - this is expected and will be fixed in test updates (20.3)

### Sub-Ticket 20.2

**Title:** Create database migration to add coloris column

**Rationale:**
The database schema must be updated to include the coloris column in the products table. The migration must handle existing data gracefully using a default value strategy.

**Acceptance Criteria:**

-   [x] Create migration file `src/infrastructure/supabase/migrations/002_add_coloris_to_products.sql`
-   [x] Migration adds `coloris TEXT NOT NULL` column to `products` table
-   [x] Migration uses `DEFAULT 'Non spécifié'` for existing rows
-   [x] Migration includes comment explaining the default value strategy
-   [x] Migration follows naming convention and structure of existing migrations
-   [x] Migration can be applied to Supabase dev database without errors

**Definition of Done:**

-   [x] Migration file created with correct SQL syntax
-   [x] Migration tested on dev database (or verified syntax)
-   [x] Migration follows project conventions (see `001_create_domain_tables.sql`)
-   [x] No SQL syntax errors

**Estimated Effort:** 1h

**Dependencies:** None (can be done in parallel with 20.1)

**Owner:** Architecture-Aware Dev

**Risk Notes:** Default value "Non spécifié" may need to be updated later if business requires specific coloris values for existing products. Migration is reversible if needed.

### Sub-Ticket 20.3

**Title:** Update Product validation to include coloris

**Rationale:**
The validation function must ensure coloris is a non-empty string to enforce business rules. This ensures data integrity at the domain level.

**Acceptance Criteria:**

-   [x] Update `isValidProduct` function in `src/core/domain/validation.ts`
-   [x] Validation checks that coloris is a non-empty string (after trim)
-   [x] Update JSDoc for `isValidProduct` to document coloris validation rule
-   [x] Validation rejects products with empty or whitespace-only coloris
-   [x] Validation accepts products with valid coloris strings

**Definition of Done:**

-   [x] Validation function updated with coloris check
-   [x] JSDoc updated to document coloris validation
-   [x] TypeScript compilation succeeds
-   [x] No linting errors

**Estimated Effort:** 1h

**Dependencies:** 20.1 (needs Product type with coloris field)

**Owner:** Architecture-Aware Dev

**Risk Notes:** Validation uses trim to handle whitespace-only strings. Consider if more sophisticated validation is needed (e.g., minimum length, allowed characters).

### Sub-Ticket 20.4

**Title:** Update Product tests with coloris field

**Rationale:**
All Product test fixtures and tests must be updated to include the coloris field. This ensures tests pass with the new field and validates the coloris validation logic.

**Acceptance Criteria:**

-   [x] Update all Product test fixtures in `__tests__/core/domain/product.test.ts` to include coloris field
-   [x] Update all Product test fixtures in `__tests__/core/domain/validation.test.ts` to include coloris field
-   [x] Add test case for coloris field presence and type
-   [x] Add test cases for coloris validation (empty string, whitespace-only, valid values)
-   [x] All existing tests pass with updated fixtures
-   [x] New validation tests pass

**Definition of Done:**

-   [x] All test fixtures updated with coloris field
-   [x] New validation tests added for coloris
-   [x] All tests pass (existing + new)
-   [x] Test coverage maintained or improved
-   [x] No linting errors

**Estimated Effort:** 2h

**Dependencies:** 20.1, 20.3 (needs Product type and validation function)

**Owner:** Unit Test Coach (test-first) → Architecture-Aware Dev (implementation)

**Risk Notes:** Many test fixtures need updating. Use find-and-replace carefully to ensure all fixtures are updated. Consider creating a test helper function for creating Product fixtures if not already present.

## Unit Test Spec (Test-First Protocol)

### Files & Paths

-   `__tests__/core/domain/product.test.ts` - Update existing tests, add coloris field tests
-   `__tests__/core/domain/validation.test.ts` - Update existing tests, add coloris validation tests

### Test Structure

#### `__tests__/core/domain/product.test.ts`

**Update existing describe blocks:**

-   Update `validProduct` fixture in "Product Type" describe block to include `coloris: "Rose pâle à motifs"`
-   Update `validProduct` fixture in "Product Validation" describe block to include `coloris: "Rose marsala"`

**New test cases:**

```typescript
describe("Product Type - coloris field", () => {
    it("should have coloris as string", () => {
        expect(typeof validProduct.coloris).toBe("string");
        expect(validProduct.coloris).toBeTruthy();
    });

    it("should allow various color descriptions", () => {
        const product1: Product = { ...validProduct, coloris: "Rose pâle à motifs" };
        const product2: Product = { ...validProduct, coloris: "Prune" };
        const product3: Product = { ...validProduct, coloris: "Rouge" };
        expect(product1.coloris).toBe("Rose pâle à motifs");
        expect(product2.coloris).toBe("Prune");
        expect(product3.coloris).toBe("Rouge");
    });
});
```

#### `__tests__/core/domain/validation.test.ts`

**Update existing fixtures:**

-   Update `validProduct` fixture in "Domain Validation - Product" describe block to include `coloris: "Rose pâle à motifs"`

**New test cases:**

```typescript
describe("isValidProduct - coloris validation", () => {
    it("should validate product with valid coloris", () => {
        const product: Product = { ...validProduct, coloris: "Rose pâle à motifs" };
        expect(isValidProduct(product)).toBe(true);
    });

    it("should reject product with empty coloris", () => {
        const product: Product = { ...validProduct, coloris: "" };
        expect(isValidProduct(product)).toBe(false);
    });

    it("should reject product with whitespace-only coloris", () => {
        const product: Product = { ...validProduct, coloris: "   " };
        expect(isValidProduct(product)).toBe(false);
    });

    it("should accept product with trimmed coloris (whitespace at edges)", () => {
        const product: Product = { ...validProduct, coloris: "  Rose pâle à motifs  " };
        // Note: Validation should trim, so this should be valid
        // Adjust based on actual validation implementation
        expect(isValidProduct(product)).toBe(true);
    });
});
```

### Mocks/Fixtures

-   Update all `validProduct` fixtures to include `coloris: string` field
-   Use realistic coloris values from business examples: "Rose pâle à motifs", "Rose marsala", "Prune", "Rouge", "Pêche", "Rose"

### Edge Cases

-   Empty string coloris
-   Whitespace-only coloris (spaces, tabs)
-   Very long coloris strings
-   Special characters in coloris (accents, hyphens)
-   Coloris with leading/trailing whitespace

### Coverage Target

-   100% coverage for coloris field in Product type tests
-   100% coverage for coloris validation in validation tests
-   All existing test coverage maintained

### Mapping AC → Tests

-   AC: "Field is required (NOT NULL)" → Test: coloris field presence in type
-   AC: "Field is a string (TEXT)" → Test: coloris type check
-   AC: "Update isValidProduct validation" → Test: coloris validation tests
-   AC: "Update all Product test fixtures" → Test: All fixtures updated

### Status

**Status:** tests: proposed

**Test-First Protocol:**

1. Unit Test Coach generates test spec (this document)
2. Architecture-Aware Dev implements domain changes (20.1, 20.3)
3. Architecture-Aware Dev updates tests (20.4) to match implementation
4. All tests pass before merging

## Agent Prompts

### Unit Test Coach

```
@Unit Test Coach

Generate unit test specifications for FBC-20: Add coloris field to Product domain model.

Context:
- Product type in `src/core/domain/product.ts` will have new `coloris: string` field
- Validation function `isValidProduct` in `src/core/domain/validation.ts` will validate coloris is non-empty string
- All existing Product test fixtures need to be updated with coloris field

Requirements:
1. Update test fixtures in `__tests__/core/domain/product.test.ts` and `__tests__/core/domain/validation.test.ts`
2. Add tests for coloris field type and presence
3. Add tests for coloris validation (empty, whitespace-only, valid values)
4. Use realistic coloris values from business examples: "Rose pâle à motifs", "Rose marsala", "Prune", "Rouge", "Pêche", "Rose"

Follow test-first protocol: generate test spec before implementation.
```

### Architecture-Aware Dev

```
@Architecture-Aware Dev

Implement FBC-20: Add coloris field to Product domain model.

Sub-tickets to implement:
1. 20.1: Add coloris field to Product domain type
2. 20.2: Create database migration to add coloris column
3. 20.3: Update Product validation to include coloris
4. 20.4: Update Product tests with coloris field

Architecture constraints:
- Domain layer (`src/core/domain/`) must remain pure TypeScript
- No external dependencies in domain files
- Follow existing patterns in `src/core/domain/product.ts` and `src/core/domain/validation.ts`
- Migration must follow structure of `001_create_domain_tables.sql`
- All tests must pass before merging

Key requirements:
- coloris field: `string` (required, NOT NULL)
- Validation: non-empty string (after trim)
- Migration: `TEXT NOT NULL DEFAULT 'Non spécifié'`
- Update all test fixtures with realistic coloris values

Reference ticket: `jira/20.md`
Reference plan: `report/planning/plan-fbc-20-add-product-coloris.md`
```

### UI Designer

```
@UI Designer

Note: FBC-20 is a domain/model change only. No UI components are required at this stage.

Future work (not in this ticket):
- Product forms may need coloris input field
- Product lists/tables may need coloris column display
- Product filters may need coloris filter option

This ticket focuses on domain layer changes only.
```

### QA & Test Coach

```
@QA & Test Coach

Verify FBC-20 implementation: Add coloris field to Product domain model.

Test plan:
1. Verify Product type includes coloris field
2. Verify database migration adds coloris column successfully
3. Verify validation rejects empty/whitespace coloris
4. Verify all unit tests pass
5. Verify TypeScript compilation succeeds
6. Verify no linting errors

No UI testing required (domain change only).
No E2E testing required (no presentation layer changes).

Focus on:
- Domain type correctness
- Validation logic correctness
- Test coverage completeness
- Migration safety (can be applied/rolled back)
```

### Architecture Guardian

```
@Architecture Guardian

Verify FBC-20 implementation follows Clean Architecture principles.

Checklist:
- ✅ Domain layer (`src/core/domain/product.ts`) has no external dependencies
- ✅ Validation (`src/core/domain/validation.ts`) is pure function with no side effects
- ✅ Migration (`src/infrastructure/supabase/migrations/`) follows infrastructure patterns
- ✅ Tests (`__tests__/core/domain/`) test domain logic only
- ✅ No business logic in infrastructure or presentation layers
- ✅ Type safety maintained throughout (TypeScript compilation succeeds)
- ✅ JSDoc documentation updated for domain types

Verify:
- No imports of React, Supabase, Zustand, React Query, or Next.js in domain files
- Domain types are pure TypeScript
- Validation functions are pure (no side effects)
- Migration follows existing patterns

Reference: `report/planning/plan-fbc-20-add-product-coloris.md`
```

## Open Questions

1. **Default value for existing products:** Is "Non spécifié" acceptable, or should we require manual backfill of coloris values for existing products?

    - **Decision:** Use "Non spécifié" as default, can be updated later if needed

2. **Validation strictness:** Should coloris validation trim whitespace, or reject strings with leading/trailing whitespace?

    - **Decision:** Trim whitespace in validation (more user-friendly)

3. **Coloris format:** Should we enforce any format constraints (e.g., minimum length, maximum length, allowed characters)?

    - **Decision:** Keep flexible (non-empty string after trim) for now, can add constraints later if needed

4. **Migration rollback:** Should we create a rollback migration script?
    - **Decision:** Not required for this ticket, can be added if needed

## MVP Cut List

**Full implementation (no cuts):**

-   All sub-tickets are essential for the feature
-   Domain type change requires validation and tests
-   Database migration is required for data persistence
-   No optional features in this ticket

**Future enhancements (not in this ticket):**

-   UI components for coloris input/display
-   Coloris filtering and search
-   Coloris enum or predefined color list
-   Coloris validation rules (format, length, etc.)
-   Migration rollback script
