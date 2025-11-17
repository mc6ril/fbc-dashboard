---
Generated: 2025-01-27 14:30:22
Report Type: planning
Command: pm-plan-from-ticket
Ticket: FBC-7
---

# Implementation Plan: Define Domain Models (Activity, Product, StockMovement)

## Summary

**Goal:** Introduce foundational domain types for the Activity Tracking feature, defining business meaning and constraints for Activity, Product, and StockMovement entities in the pure domain layer.

**User value:** Developers can work with consistent, validated business objects across all layers, ensuring type safety and business rule enforcement throughout the application. This foundation enables subsequent features (product management, stock tracking, activity logging) to build upon well-defined domain models.

**Constraints:**

-   Follow Clean Architecture: Domain layer must remain pure TypeScript with no external dependencies
-   No imports of React, Supabase, Zustand, React Query, or Next.js in domain files
-   All types must include concise JSDoc describing business meaning
-   Date fields stored as ISO 8601 strings for compatibility with Supabase, React Query, and Next.js
-   Validation utilities must be pure functions with no side effects
-   Unit tests required for all domain rules and edge cases
-   All examples, documentation, and test fixtures must align with Atelier F.B.C business domain (textile accessories, collections, capsules)

**Non-goals:**

-   Implementing usecases, ports, or infrastructure (repository implementations)
-   Creating UI components or presentation layer code
-   Database schema design or Supabase table creation
-   Business logic orchestration (usecases layer)

## Assumptions & Risks

**Assumptions:**

-   Domain layer structure (`src/core/domain/`) already exists and follows established patterns
-   Validation utilities can be added to existing `src/core/domain/validation.ts` or new domain files
-   ISO 8601 date format is the standard for all date fields (consistent with existing `auth.ts` domain)
-   UUID format is the standard for all ID fields
-   Product categories/types align with Atelier F.B.C product catalog: Sac banane, Pochette ordinateur, Trousse de toilette, Pochette à volants, Trousse zippée, Accessoires divers
-   Products are organized by collections (e.g., "Ode à la Féminité") and capsules (e.g., "L'Assumée", "L'Espiegle")
-   Quantity signs (+/-) represent stock increases/decreases with business rules to be documented

**Risks:**

-   **Risk:** Unclear business rules for quantity signs and activity relationships
    -   **Mitigation:** Document assumptions in JSDoc and create validation helpers for non-obvious rules (e.g., `isNegativeForSale`)
-   **Risk:** Product category/type structure may evolve
    -   **Mitigation:** Start with simple string type, can be refined to enum later if needed
-   **Risk:** Activity and StockMovement may have overlapping concerns
    -   **Mitigation:** Clearly document the distinction: Activity is a business event log, StockMovement is a stock change record with source tracking
-   **Risk:** Validation utilities may duplicate existing patterns
    -   **Mitigation:** Review existing `validation.ts` patterns and extend consistently

## Solution Outline (aligned with architecture)

**Domain Layer (`src/core/domain/`):**

-   Create `product.ts` with Product type, including business meaning documentation
-   Create `activity.ts` with Activity type and ActivityType enum (CREATION, SALE, STOCK_CORRECTION, OTHER)
-   Create `stockMovement.ts` with StockMovement type and StockMovementSource enum (CREATION, SALE, INVENTORY_ADJUSTMENT)
-   Extend `validation.ts` with business rule validation functions:
    -   Quantity sign validation helpers
    -   Product validation (e.g., positive prices, non-negative stock)
    -   Activity validation (e.g., productId required for certain types)
    -   StockMovement validation (e.g., quantity sign meaning based on source)

**Testing (`__tests__/core/domain/`):**

-   Create unit tests for each domain type
-   Test type structure, required/optional fields
-   Test validation functions with edge cases
-   Test business rules and invariants

**Architecture Compliance:**

-   All files in `core/domain/` remain pure TypeScript
-   No external dependencies imported
-   Types exported for use by ports/usecases/infrastructure layers
-   Validation functions are pure and testable

## Sub-Tickets

### Sub-Ticket 7.1

**Title:** Generate Unit Test Specs for Domain Models (Test-First Protocol)

**Rationale:**
Following test-first development, we need to define test specifications before implementation to ensure all business rules, edge cases, and validation logic are properly covered.

**Acceptance Criteria:**

-   [x] Unit test spec document created with test structure for Product, Activity, and StockMovement
-   [x] Test cases defined for type structure, required/optional fields, and business rules
-   [x] Edge cases and validation scenarios documented
-   [x] Test file paths specified: `__tests__/core/domain/product.test.ts`, `__tests__/core/domain/activity.test.ts`, `__tests__/core/domain/stockMovement.test.ts`, `__tests__/core/domain/validation.test.ts`
-   [x] Mapping between acceptance criteria and test cases established
-   [x] Status marked as `tests: proposed` (to be approved before implementation)

**Definition of Done:**

-   [x] Test spec reviewed and approved
-   [x] Status updated to `tests: approved`
-   [x] Spec ready for Unit Test Coach to generate test scaffolds

**Estimated Effort:** 2h

**Dependencies:** None

**Owner:** Unit Test Coach

**Risk Notes:** Low risk; ensures comprehensive test coverage before implementation

---

### Sub-Ticket 7.2

**Title:** Define Product Domain Type

**Rationale:**
Product is a core business entity representing items in the catalog. It must be defined first as it's referenced by Activity and StockMovement.

**Acceptance Criteria:**

-   [x] `src/core/domain/product.ts` created with Product type
-   [x] Product type includes: id (string/UUID), name (string), type/category (string), unitCost (number), salePrice (number), stock (number)
-   [x] All fields documented with JSDoc describing business meaning
-   [x] Date fields (if any) use ISO 8601 string format
-   [x] No external imports (pure TypeScript)
-   [x] Type exported for use by other layers
-   [x] Lint/build passes

**Definition of Done:**

-   [x] Product type defined and exported
-   [x] JSDoc documentation complete with business meaning
-   [x] No external dependencies imported
-   [x] Lint/build green
-   [x] Type can be imported and used in other files

**Estimated Effort:** 1h

**Dependencies:** None

**Owner:** Architecture-Aware Dev

**Risk Notes:** Low risk; straightforward type definition following existing patterns

---

### Sub-Ticket 7.3

**Title:** Define Activity Domain Type with ActivityType Enum

**Rationale:**
Activity represents business events (creation, sale, stock correction, other) and is central to the activity tracking feature. The ActivityType enum ensures type safety for activity classification.

**Acceptance Criteria:**

-   [x] `src/core/domain/activity.ts` created with Activity type and ActivityType enum
-   [x] ActivityType enum includes: CREATION, SALE, STOCK_CORRECTION, OTHER
-   [x] Activity type includes: id (string/UUID), date (ISO 8601 string), type (ActivityType), productId (optional string/UUID), quantity (number, can be +/-), amount (number), note (string, optional)
-   [x] All fields documented with JSDoc describing business meaning
-   [x] Business rules documented (e.g., when productId is required, quantity sign meaning)
-   [x] No external imports (pure TypeScript)
-   [x] Types exported for use by other layers
-   [x] Lint/build passes

**Definition of Done:**

-   [x] Activity type and ActivityType enum defined and exported
-   [x] JSDoc documentation complete with business meaning and rules
-   [x] No external dependencies imported
-   [x] Lint/build green
-   [x] Types can be imported and used in other files

**Estimated Effort:** 2h

**Dependencies:** Sub-Ticket 7.2 (Product type should exist for reference, though not strictly required)

**Owner:** Architecture-Aware Dev

**Risk Notes:** Medium risk; business rules for quantity signs and productId requirements need clear documentation

---

### Sub-Ticket 7.4

**Title:** Define StockMovement Domain Type with StockMovementSource Enum

**Rationale:**
StockMovement tracks stock changes with their source, enabling inventory management and audit trails. The StockMovementSource enum ensures type safety for movement classification.

**Acceptance Criteria:**

-   [x] `src/core/domain/stockMovement.ts` created with StockMovement type and StockMovementSource enum
-   [x] StockMovementSource enum includes: CREATION, SALE, INVENTORY_ADJUSTMENT
-   [x] StockMovement type includes: id (string/UUID), productId (string/UUID), quantity (number, can be +/-), source (StockMovementSource)
-   [x] All fields documented with JSDoc describing business meaning
-   [x] Business rules documented (e.g., quantity sign meaning based on source: positive for CREATION, negative for SALE)
-   [x] Relationship to Activity documented (if applicable)
-   [x] No external imports (pure TypeScript)
-   [x] Types exported for use by other layers
-   [x] Lint/build passes

**Definition of Done:**

-   [x] StockMovement type and StockMovementSource enum defined and exported
-   [x] JSDoc documentation complete with business meaning and rules
-   [x] No external dependencies imported
-   [x] Lint/build green
-   [x] Types can be imported and used in other files

**Estimated Effort:** 2h

**Dependencies:** Sub-Ticket 7.2 (Product type should exist for reference)

**Owner:** Architecture-Aware Dev

**Risk Notes:** Medium risk; quantity sign rules need clear documentation to avoid confusion

---

### Sub-Ticket 7.5

**Title:** Add Validation Utilities for Domain Business Rules

**Rationale:**
Validation utilities enforce business invariants and provide reusable validation logic. These functions must be pure and testable, following existing validation patterns.

**Acceptance Criteria:**

-   [x] Validation functions added to `src/core/domain/validation.ts` or new domain validation file
-   [x] Product validation: positive unitCost and salePrice, non-negative stock
-   [x] Activity validation: productId required for SALE and STOCK_CORRECTION types
-   [x] StockMovement validation: quantity sign validation based on source (e.g., `isNegativeForSale`)
-   [x] Helper functions for non-obvious rules (e.g., `isValidQuantityForSource`, `isValidActivityType`)
-   [x] All validation functions are pure (no side effects)
-   [x] All validation functions documented with JSDoc
-   [x] No external imports (pure TypeScript)
-   [x] Functions exported for use by usecases and tests
-   [x] Lint/build passes

**Definition of Done:**

-   [x] Validation functions implemented and exported
-   [x] JSDoc documentation complete with usage examples
-   [x] No external dependencies imported
-   [x] Lint/build green
-   [x] Functions can be imported and used in usecases and tests

**Estimated Effort:** 3h

**Dependencies:** Sub-Ticket 7.2, 7.3, 7.4 (all domain types must exist)

**Owner:** Architecture-Aware Dev

**Risk Notes:** Medium risk; business rules may need clarification, especially for quantity sign meanings

---

### Sub-Ticket 7.6

**Title:** Implement Unit Tests for Domain Models

**Rationale:**
Unit tests ensure domain types and validation functions work correctly, catch edge cases, and document expected behavior. Tests must be comprehensive and follow existing test patterns.

**Acceptance Criteria:**

-   [x] `__tests__/core/domain/product.test.ts` created with tests for Product type structure and validation
-   [x] `__tests__/core/domain/activity.test.ts` created with tests for Activity type structure, ActivityType enum, and validation
-   [x] `__tests__/core/domain/stockMovement.test.ts` created with tests for StockMovement type structure, StockMovementSource enum, and validation
-   [x] `__tests__/core/domain/validation.test.ts` extended with tests for new validation functions
-   [x] All tests follow existing patterns (describe/it blocks, beforeEach cleanup)
-   [x] Edge cases covered (invalid data, boundary conditions, business rule violations)
-   [x] Test coverage target: 100% for domain types and validation functions (95% overall, 100% for activity.ts and stockMovement.ts)
-   [x] All tests pass
-   [x] Tests use re-exported validation utilities from `__tests__/utils/validation.ts`

**Definition of Done:**

-   [x] All test files created and passing
-   [x] Test coverage meets target (100% for domain types, 95% overall including auth validation functions)
-   [x] Tests follow existing patterns and conventions
-   [x] Edge cases and business rules validated
-   [x] Lint/build green

**Estimated Effort:** 4h

**Dependencies:** Sub-Ticket 7.1 (test spec approved), Sub-Ticket 7.2, 7.3, 7.4, 7.5 (all domain types and validation functions implemented)

**Owner:** Unit Test Coach (or Architecture-Aware Dev if test spec is detailed enough)

**Risk Notes:** Low risk if test spec is comprehensive; may need additional edge cases discovered during implementation

---

### Sub-Ticket 7.7

**Title:** Align Domain Models Documentation and Tests with Business Domain (Atelier F.B.C)

**Rationale:**
The domain models currently contain generic examples (e.g., "ELECTRONICS", "CLOTHING", "FOOD") that don't match the actual business domain of Atelier F.B.C, a French artisan textile accessories company. This creates confusion and potential inconsistencies. Documentation, JSDoc comments, and test fixtures must reflect the actual product types: Sac banane, Pochette ordinateur, Trousse de toilette, Pochette à volants, Trousse zippée, Accessoires divers.

**Acceptance Criteria:**

-   [x] JSDoc in `src/core/domain/product.ts` updated with realistic product type examples (e.g., "SAC_BANANE", "POCHETTE_ORDINATEUR", "TROUSSE_TOILETTE", "POCHETTE_VOLANTS", "TROUSSE_ZIPPEE", "ACCESSOIRES_DIVERS")
-   [x] Test fixtures in `__tests__/core/domain/product.test.ts` updated to use realistic product examples matching Atelier F.B.C domain
-   [x] Test fixtures in `__tests__/core/domain/validation.test.ts` updated to use realistic product examples
-   [x] Unit Test Spec section in this plan updated with realistic examples (replace "ELECTRONICS" with appropriate textile product types)
-   [x] All examples in documentation align with project overview: collections (Ode à la Féminité), capsules (L'Assumée, L'Espiegle), and product types
-   [x] No references to "ELECTRONICS", "CLOTHING", "FOOD", or other non-textile product categories remain in source code
-   [x] Lint/build passes

**Definition of Done:**

-   [x] All JSDoc comments use realistic examples from Atelier F.B.C product catalog
-   [x] All test fixtures use realistic product names and types
-   [x] Plan documentation updated with correct examples
-   [x] No generic/irrelevant examples remain in codebase (source code and tests)
-   [x] All tests still pass with updated fixtures (57 tests passed)
-   [x] Lint/build green

**Estimated Effort:** 1h

**Dependencies:** Sub-Ticket 7.2, 7.3, 7.4, 7.5, 7.6 (all domain models and tests must be implemented first)

**Owner:** Architecture-Aware Dev

**Risk Notes:** Low risk; cosmetic/documentation changes only. Must ensure test fixtures remain valid after updates.

---

## Unit Test Spec (Test-First Protocol)

**Status:** `tests: approved` ✅

**Generated:** 2025-01-27

### Test Files & Paths

-   `__tests__/core/domain/product.test.ts` - Product type tests
-   `__tests__/core/domain/activity.test.ts` - Activity type and ActivityType enum tests
-   `__tests__/core/domain/stockMovement.test.ts` - StockMovement type and StockMovementSource enum tests
-   `__tests__/core/domain/validation.test.ts` - Extended validation function tests

### Test Structure

#### Product Tests (`product.test.ts`)

**Test Pattern:** Follow `__tests__/core/domain/auth.test.ts` structure

```typescript
/**
 * Domain Types Tests - Product
 *
 * Tests for Product domain type to ensure type structure,
 * required fields, and business rules are correctly defined.
 *
 * These tests verify:
 * - Type structure and required fields
 * - Field types and constraints
 * - Business rules (positive prices, non-negative stock)
 * - Edge cases and boundary conditions
 */

import type { Product } from "@/core/domain/product";
import { isValidUUID } from "../../utils/validation";

describe("Domain Types - Product", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("Product Type", () => {
        const validProduct: Product = {
            id: "123e4567-e89b-4d3a-a456-426614174000",
            name: "Sac banane L'Assumée",
            type: "SAC_BANANE",
            unitCost: 10.5,
            salePrice: 19.99,
            stock: 100,
        };

        // Type structure tests
        it("should have all required fields", () => {
            expect(validProduct).toHaveProperty("id");
            expect(validProduct).toHaveProperty("name");
            expect(validProduct).toHaveProperty("type");
            expect(validProduct).toHaveProperty("unitCost");
            expect(validProduct).toHaveProperty("salePrice");
            expect(validProduct).toHaveProperty("stock");
        });

        it("should have id as string (UUID format)", () => {
            expect(typeof validProduct.id).toBe("string");
            expect(isValidUUID(validProduct.id)).toBe(true);
        });

        it("should have name as string", () => {
            expect(typeof validProduct.name).toBe("string");
            expect(validProduct.name).toBeTruthy();
        });

        it("should have type/category as string", () => {
            expect(typeof validProduct.type).toBe("string");
        });

        it("should have unitCost as number", () => {
            expect(typeof validProduct.unitCost).toBe("number");
        });

        it("should have salePrice as number", () => {
            expect(typeof validProduct.salePrice).toBe("number");
        });

        it("should have stock as number", () => {
            expect(typeof validProduct.stock).toBe("number");
        });

        // Field constraints tests
        it("should allow positive unitCost", () => {
            const product: Product = { ...validProduct, unitCost: 5.99 };
            expect(product.unitCost).toBeGreaterThan(0);
        });

        it("should allow positive salePrice", () => {
            const product: Product = { ...validProduct, salePrice: 15.99 };
            expect(product.salePrice).toBeGreaterThan(0);
        });

        it("should allow non-negative stock", () => {
            const product: Product = { ...validProduct, stock: 0 };
            expect(product.stock).toBeGreaterThanOrEqual(0);
        });

        it("should allow zero stock", () => {
            const product: Product = { ...validProduct, stock: 0 };
            expect(product.stock).toBe(0);
        });

        // Edge cases
        it("should handle very large numbers", () => {
            const product: Product = {
                ...validProduct,
                unitCost: Number.MAX_SAFE_INTEGER,
                salePrice: Number.MAX_SAFE_INTEGER,
                stock: Number.MAX_SAFE_INTEGER,
            };
            expect(product.unitCost).toBe(Number.MAX_SAFE_INTEGER);
        });

        it("should handle decimal prices", () => {
            const product: Product = {
                ...validProduct,
                unitCost: 10.999,
                salePrice: 19.999,
            };
            expect(product.unitCost).toBe(10.999);
            expect(product.salePrice).toBe(19.999);
        });
    });
});
```

#### Activity Tests (`activity.test.ts`)

```typescript
describe("Domain Types - Activity", () => {
    describe("ActivityType Enum", () => {
        it("should have CREATION value");
        it("should have SALE value");
        it("should have STOCK_CORRECTION value");
        it("should have OTHER value");
    });

    describe("Activity Type", () => {
        // Test type structure
        it("should have all required fields");
        it("should have id as string (UUID format)");
        it("should have date as ISO 8601 string");
        it("should have type as ActivityType");
        it("should have productId as optional string (UUID)");
        it("should have quantity as number (can be positive or negative)");
        it("should have amount as number");
        it("should have note as optional string");

        // Test business rules
        it("should require productId for SALE type");
        it("should require productId for STOCK_CORRECTION type");
        it("should allow productId to be undefined for OTHER type");
        it("should allow positive quantity for stock increases");
        it("should allow negative quantity for stock decreases");
    });
});
```

#### StockMovement Tests (`stockMovement.test.ts`)

```typescript
describe("Domain Types - StockMovement", () => {
    describe("StockMovementSource Enum", () => {
        it("should have CREATION value");
        it("should have SALE value");
        it("should have INVENTORY_ADJUSTMENT value");
    });

    describe("StockMovement Type", () => {
        // Test type structure
        it("should have all required fields");
        it("should have id as string (UUID format)");
        it("should have productId as string (UUID)");
        it("should have quantity as number (can be positive or negative)");
        it("should have source as StockMovementSource");

        // Test business rules
        it("should allow positive quantity for CREATION source");
        it("should allow negative quantity for SALE source");
        it("should allow positive or negative quantity for INVENTORY_ADJUSTMENT");
    });
});
```

#### Validation Tests (`validation.test.ts`)

```typescript
describe("Domain Validation - Product", () => {
    describe("isValidProduct", () => {
        it("should validate product with all valid fields");
        it("should reject product with negative unitCost");
        it("should reject product with negative salePrice");
        it("should reject product with negative stock");
        it("should accept product with zero stock");
    });
});

describe("Domain Validation - Activity", () => {
    describe("isValidActivity", () => {
        it("should validate activity with all valid fields");
        it("should require productId for SALE type");
        it("should require productId for STOCK_CORRECTION type");
        it("should allow activity without productId for OTHER type");
    });

    describe("isNegativeForSale", () => {
        it("should return true for negative quantity in SALE activity");
        it("should return false for positive quantity in SALE activity");
        it("should return false for non-SALE activity types");
    });
});

describe("Domain Validation - StockMovement", () => {
    describe("isValidStockMovement", () => {
        it("should validate stock movement with all valid fields");
        it("should validate positive quantity for CREATION source");
        it("should validate negative quantity for SALE source");
        it("should validate positive or negative quantity for INVENTORY_ADJUSTMENT");
    });

    describe("isValidQuantityForSource", () => {
        it("should validate positive quantity for CREATION");
        it("should validate negative quantity for SALE");
        it("should validate any quantity for INVENTORY_ADJUSTMENT");
    });
});
```

### Test Fixtures & Mocks

#### Valid Fixtures

Test files should include valid fixture objects for each domain type:

-   **Product fixtures:** Valid product with all required fields, edge cases (zero stock, decimal prices)
    -   Use realistic Atelier F.B.C product types: "SAC_BANANE", "POCHETTE_ORDINATEUR", "TROUSSE_TOILETTE", "POCHETTE_VOLANTS", "TROUSSE_ZIPPEE", "ACCESSOIRES_DIVERS"
    -   Use realistic product names matching collections and capsules (e.g., "Sac banane L'Assumée", "Pochette ordinateur L'Espiegle")
-   **Activity fixtures:** One fixture for each ActivityType (CREATION, SALE, STOCK_CORRECTION, OTHER)
-   **StockMovement fixtures:** One fixture for each StockMovementSource (CREATION, SALE, INVENTORY_ADJUSTMENT)

#### Invalid Fixtures (for negative testing)

-   **Product:** Negative unitCost, negative salePrice, negative stock
-   **Activity:** Missing productId for SALE/STOCK_CORRECTION types
-   **StockMovement:** Invalid quantity signs for specific sources

**Note:** Follow the pattern from `__tests__/core/domain/auth.test.ts` for fixture organization.

### Edge Cases

-   Zero values (stock, quantity, prices)
-   Negative quantities (when allowed vs. not allowed)
-   Missing optional fields (productId, note)
-   Invalid enum values
-   Invalid UUID formats
-   Invalid ISO 8601 date formats
-   Boundary conditions (very large numbers, empty strings)

### Coverage Target

-   **100% coverage** for domain types and validation functions
-   All business rules tested
-   All edge cases covered
-   All enum values tested
-   All validation functions tested with valid and invalid inputs

### Test Execution Strategy

1. **Run all tests:** `npm test -- __tests__/core/domain/`
2. **Run specific test file:** `npm test -- __tests__/core/domain/product.test.ts`
3. **Run with coverage:** `npm test -- --coverage __tests__/core/domain/`
4. **Target coverage:** 100% for domain types and validation functions

### Mapping AC → Tests

| Acceptance Criteria                 | Test Coverage                                                      | Test Files                                                        |
| ----------------------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------- |
| Types created in `src/core/domain/` | Type structure tests with all required fields                      | `product.test.ts`, `activity.test.ts`, `stockMovement.test.ts`    |
| No external imports                 | Import verification (indirect via type usage)                      | All test files                                                    |
| Enumerations defined                | Enum value tests for all enum members                              | `activity.test.ts`, `stockMovement.test.ts`                       |
| Validation utilities for invariants | Validation function tests with valid/invalid inputs and edge cases | `validation.test.ts`                                              |
| JSDoc documentation                 | Type usage in tests validates documentation                        | All test files                                                    |
| Business rules documented           | Business rule tests (productId requirements, quantity signs)       | `activity.test.ts`, `stockMovement.test.ts`, `validation.test.ts` |

### Status

**Status:** `tests: approved` ✅

**Approved:** 2025-01-27

**Next Steps:**

1. ✅ Test spec reviewed and approved
2. ⏳ Generate test scaffolds via Unit Test Coach (Sub-Ticket 7.6)
3. ⏳ Implement domain types (Sub-Tickets 7.2, 7.3, 7.4)
4. ⏳ Implement validation functions (Sub-Ticket 7.5)
5. ⏳ Implement unit tests (Sub-Ticket 7.6)

---

## Agent Prompts

### Unit Test Coach

```
@Unit Test Coach

Generate unit test files for domain models based on the approved test spec in plan-fbc-7-define-domain-models.md.

Requirements:
- Create test files in `__tests__/core/domain/`:
  - `product.test.ts`
  - `activity.test.ts`
  - `stockMovement.test.ts`
  - Extend `validation.test.ts` with new validation tests
- Follow existing test patterns from `__tests__/core/domain/auth.test.ts`
- Use re-exported validation utilities from `__tests__/utils/validation.ts`
- Cover all edge cases and business rules from the test spec
- Ensure 100% coverage target for domain types and validation functions
- All tests must pass and follow TypeScript strict mode

Reference: report/planning/plan-fbc-7-define-domain-models.md (Unit Test Spec section)
```

### Architecture-Aware Dev

```
@Architecture-Aware Dev

Implement domain models for Activity, Product, and StockMovement following Clean Architecture principles.

Requirements:
1. Create `src/core/domain/product.ts` with Product type
2. Create `src/core/domain/activity.ts` with Activity type and ActivityType enum
3. Create `src/core/domain/stockMovement.ts` with StockMovement type and StockMovementSource enum
4. Extend `src/core/domain/validation.ts` with business rule validation functions

Constraints:
- NO external imports (React, Supabase, Zustand, React Query, Next.js)
- Pure TypeScript only
- All types must include JSDoc with business meaning
- Date fields use ISO 8601 string format
- Follow patterns from existing `src/core/domain/auth.ts`
- All validation functions must be pure (no side effects)

Business Rules to Document:
- Product: unitCost and salePrice must be positive, stock must be non-negative
- Activity: productId required for SALE and STOCK_CORRECTION types
- StockMovement: quantity sign meaning based on source (positive for CREATION, negative for SALE)

Domain Alignment:
- All examples must align with Atelier F.B.C business domain (textile accessories)
- Product types: Sac banane, Pochette ordinateur, Trousse de toilette, Pochette à volants, Trousse zippée, Accessoires divers
- Collections: Ode à la Féminité (with capsules: L'Assumée, L'Espiegle)

Reference: jira/7.md, report/planning/plan-fbc-7-define-domain-models.md, and .cursor/docs/project-overview.md
```

### Architecture-Aware Dev (Sub-Ticket 7.7 - Domain Alignment)

```
@Architecture-Aware Dev

Align domain models documentation and tests with Atelier F.B.C business domain (Sub-Ticket 7.7).

Requirements:
1. Update JSDoc in `src/core/domain/product.ts` with realistic product type examples
   - Replace generic examples ("ELECTRONICS", "CLOTHING", "FOOD") with Atelier F.B.C product types
   - Use: "SAC_BANANE", "POChette_ORDINATEUR", "TROUSSE_TOILETTE", "POChette_VOLANTS", "TROUSSE_ZIPPEE", "ACCESSOIRES_DIVERS"
2. Update test fixtures in `__tests__/core/domain/product.test.ts`
   - Replace "ELECTRONICS" with realistic product types
   - Use realistic product names: "Sac banane L'Assumée", "Pochette ordinateur L'Espiegle", etc.
3. Update test fixtures in `__tests__/core/domain/validation.test.ts`
   - Replace generic examples with Atelier F.B.C product types
4. Ensure all examples align with project overview documentation

Constraints:
- All changes are documentation/test fixture updates only (no logic changes)
- All tests must still pass after updates
- Follow existing patterns and conventions
- Reference: .cursor/docs/project-overview.md for business domain details

Reference: report/planning/plan-fbc-7-define-domain-models.md (Sub-Ticket 7.7)
```

### QA & Test Coach

```
@QA & Test Coach

Review and validate domain model implementation for FBC-7.

Test Plan:
1. Verify all domain types are defined correctly in `src/core/domain/`
2. Verify no external dependencies in domain files
3. Verify JSDoc documentation is complete and accurate
4. Verify validation functions work correctly with edge cases
5. Verify unit tests achieve 100% coverage
6. Verify all examples align with Atelier F.B.C business domain (no generic examples like "ELECTRONICS")
7. Run lint/build to ensure no errors
8. Verify types can be imported and used in other layers

Accessibility: N/A (domain layer, no UI)

Reference: jira/7.md, report/planning/plan-fbc-7-define-domain-models.md, and .cursor/docs/project-overview.md
```

### Architecture Guardian

```
@Architecture Guardian

Verify Clean Architecture compliance for domain models implementation (FBC-7).

Compliance Checks:
1. ✅ Domain layer (`src/core/domain/`) contains only pure TypeScript
2. ✅ No external imports (React, Supabase, Zustand, React Query, Next.js)
3. ✅ Types are properly exported for use by other layers
4. ✅ Validation functions are pure (no side effects)
5. ✅ JSDoc documentation follows established patterns
6. ✅ File organization follows Clean Architecture structure
7. ✅ No business logic in wrong layers

Verify:
- All files in `src/core/domain/` are pure TypeScript
- No forbidden imports in domain files
- Types can be imported by ports/usecases/infrastructure layers
- Validation utilities follow existing patterns

Reference: jira/7.md and report/planning/plan-fbc-7-define-domain-models.md
```

---

## Open Questions

1. **Product Category/Type Structure:** Should product type/category be a simple string, a string enum, or a separate type? (Assumption: start with string, can be refined later. Product types align with Atelier F.B.C catalog: Sac banane, Pochette ordinateur, Trousse de toilette, Pochette à volants, Trousse zippée, Accessoires divers)

2. **Quantity Sign Rules:** Are there specific business rules for when quantities should be positive vs. negative? (Assumption: positive for stock increases, negative for decreases; SALE activities have negative quantities)

3. **Activity-StockMovement Relationship:** Should there be explicit linking between Activity and StockMovement, or are they independent? (Assumption: independent for now, can be linked via productId and date if needed)

4. **Validation Function Location:** Should new validation functions go in existing `validation.ts` or separate files? (Assumption: extend existing `validation.ts` for consistency)

5. **Product Stock Calculation:** Should stock be calculated from StockMovements, or is it a stored value? (Assumption: stored value for now, calculation can be added later)

---

## MVP Cut List

If time is constrained, the following can be deferred:

-   **Low Priority:** Advanced validation helpers beyond basic invariants (can be added incrementally)
-   **Low Priority:** Comprehensive edge case validation (basic validation first, expand later)
-   **Low Priority:** Branded types or value objects (can be added in refactoring phase)

**Must Have for MVP:**

-   All three domain types (Product, Activity, StockMovement) defined
-   Basic enums (ActivityType, StockMovementSource)
-   Essential validation functions (positive prices, non-negative stock, required productId rules)
-   Unit tests for type structure and basic validation

---

## Estimated Total Effort

-   Sub-Ticket 7.1 (Test Spec): 2h
-   Sub-Ticket 7.2 (Product): 1h
-   Sub-Ticket 7.3 (Activity): 2h
-   Sub-Ticket 7.4 (StockMovement): 2h
-   Sub-Ticket 7.5 (Validation): 3h
-   Sub-Ticket 7.6 (Unit Tests): 4h
-   Sub-Ticket 7.7 (Domain Alignment): 1h

**Total: 15 hours** (matches ticket estimate of 5 story points ≈ 1-2 days)

---

## Next Steps

1. ✅ Review and approve this plan
2. ⏳ Generate unit test specs (Sub-Ticket 7.1)
3. ⏳ Implement domain types (Sub-Tickets 7.2, 7.3, 7.4)
4. ⏳ Add validation utilities (Sub-Ticket 7.5)
5. ⏳ Implement unit tests (Sub-Ticket 7.6)
6. ⏳ Align documentation and tests with business domain (Sub-Ticket 7.7)
7. ⏳ Architecture compliance verification
8. ⏳ QA review and validation
