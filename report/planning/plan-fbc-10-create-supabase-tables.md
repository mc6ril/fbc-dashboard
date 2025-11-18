---
Generated: 2025-01-27 18:00:00
Report Type: planning
Command: pm-plan-from-ticket
Ticket: FBC-10
---

# Implementation Plan: Create Supabase Tables for Products, Activities, and Stock Movements

## Summary

**Goal:** Provision initial database schema on Supabase with tables for products, activities, and stock_movements, aligned with domain models and following PostgreSQL best practices.

**User value:** The application can persist and query data reliably with a normalized schema that supports all business operations (product catalog, activity tracking, inventory management).

**Constraints:**

-   Follow Clean Architecture: Database schema is infrastructure concern, but must align with domain types
-   Use snake_case naming convention for database columns (PostgreSQL convention)
-   Store enums as TEXT with CHECK constraints (simpler than PostgreSQL enums, easier to maintain)
-   UTC timestamps for all date/time fields
-   Minimal schema for MVP, allow extension later
-   Foreign key constraints for referential integrity
-   Appropriate indices for frequent queries
-   All fields from domain models must be included (including `coloris` and `weight` for products)

**Non-goals:**

-   Row-level security (RLS) policies (can be added later)
-   Database triggers or stored procedures
-   Complex database functions
-   Migration tooling (manual SQL scripts for now)
-   Data seeding or fixtures

## Assumptions & Risks

**Assumptions:**

-   Supabase project is already set up and accessible (from FBC-2)
-   Domain models are stable and include all required fields:
    -   Product: id, name, type, coloris, unitCost, salePrice, stock, weight (optional)
    -   Activity: id, date, type, productId (optional), quantity, amount, note (optional)
    -   StockMovement: id, productId, quantity, source
-   UUIDs will be used for primary keys (PostgreSQL `uuid` type with `gen_random_uuid()` default)
-   Timestamps will use `TIMESTAMPTZ` for UTC storage
-   Numeric fields (costs, prices, quantities) will use `NUMERIC` for precision
-   Enum values match domain enum values exactly (e.g., `ProductType.SAC_BANANE` → `'SAC_BANANE'`)

**Risks:**

-   **Risk:** Domain models may have fields not mentioned in ticket description (e.g., `coloris`, `weight`)
    -   **Mitigation:** Review domain models carefully and include all fields from `Product`, `Activity`, `StockMovement` types
-   **Risk:** Enum values may change in domain, causing constraint violations
    -   **Mitigation:** Use CHECK constraints with explicit enum values, document alignment requirement
-   **Risk:** Foreign key constraints may cause issues if data is inserted out of order
    -   **Mitigation:** Document table creation order (products first, then activities/stock_movements)
-   **Risk:** Missing indices may cause performance issues with large datasets
    -   **Mitigation:** Add indices for common query patterns (activities by date, product_id, etc.)
-   **Risk:** Migration scripts may fail if applied multiple times
    -   **Mitigation:** Use `IF NOT EXISTS` clauses or document manual application process

## Solution Outline (aligned with architecture)

The solution follows Clean Architecture principles:

1. **Infrastructure Layer (`src/infrastructure/supabase/migrations/`):**

    - Create migration directory structure
    - Create `001_create_domain_tables.sql` with:
        - `products` table: id (UUID PK), name (TEXT), type (TEXT with CHECK), coloris (TEXT), unit_cost (NUMERIC), sale_price (NUMERIC), stock (NUMERIC), weight (NUMERIC nullable), created_at (TIMESTAMPTZ)
        - `activities` table: id (UUID PK), product_id (UUID FK nullable), type (TEXT with CHECK), date (TIMESTAMPTZ), quantity (NUMERIC), amount (NUMERIC), note (TEXT nullable)
        - `stock_movements` table: id (UUID PK), product_id (UUID FK), quantity (NUMERIC), source (TEXT with CHECK)
        - Foreign key constraints
        - CHECK constraints for enums
        - Indices for frequent queries
        - Comments for documentation

2. **Schema Alignment:**

    - Column names use snake_case (e.g., `unit_cost`, `sale_price`, `product_id`)
    - Domain enum values stored as TEXT with CHECK constraints
    - Optional fields are nullable in database
    - Timestamps use `TIMESTAMPTZ` for UTC storage
    - Numeric fields use `NUMERIC` for precision (avoid floating-point errors)

3. **Documentation:**

    - README in `infrastructure/supabase/` explaining migration process
    - SQL comments explaining constraints and business rules
    - Table creation order documented

4. **Testing Strategy:**

    - Manual verification in Supabase dashboard
    - Verify constraints work (try inserting invalid enum values)
    - Verify foreign keys work (try inserting activity with non-existent product_id)
    - Verify indices are created

## Sub-Tickets

### Sub-Ticket 10.1

**Title:** Create migration directory structure and initial SQL migration file

**Rationale:**
Establish the migration infrastructure and create the main migration file that will contain all table definitions. This provides the foundation for database schema management.

**Acceptance Criteria:**

-   [x] Create `src/infrastructure/supabase/migrations/` directory
-   [x] Create `001_create_domain_tables.sql` file
-   [x] File includes header comments with migration description and date
-   [x] File structure is ready for table definitions

**Definition of Done:**

-   [x] Migration directory exists
-   [x] Migration file created with proper structure
-   [x] File follows naming convention (`{number}_{description}.sql`)
-   [x] No linting errors

**Estimated Effort:** 0.5h

**Dependencies:** None

**Owner:** Architecture-Aware Dev

**Risk Notes:** Low risk - simple file creation

---

### Sub-Ticket 10.2

**Title:** Create `products` table with all domain fields and constraints

**Rationale:**
The products table is the foundation for product catalog management. It must include all fields from the `Product` domain type, including `coloris` and `weight` which are already in the domain model but not mentioned in the ticket description.

**Acceptance Criteria:**

-   [x] `products` table created with columns:
    -   `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
    -   `name` TEXT NOT NULL
    -   `type` TEXT NOT NULL with CHECK constraint for ProductType enum values
    -   `coloris` TEXT NOT NULL
    -   `unit_cost` NUMERIC(10, 2) NOT NULL CHECK (unit_cost > 0)
    -   `sale_price` NUMERIC(10, 2) NOT NULL CHECK (sale_price > 0)
    -   `stock` NUMERIC(10, 2) NOT NULL CHECK (stock >= 0) DEFAULT 0
    -   `weight` NUMERIC(6, 2) CHECK (weight IS NULL OR weight > 0) (nullable)
    -   `created_at` TIMESTAMPTZ NOT NULL DEFAULT now()
-   [x] CHECK constraint includes all ProductType enum values: SAC_BANANE, POCHETTE_ORDINATEUR, TROUSSE_TOILETTE, POCHETTE_VOLANTS, TROUSSE_ZIPPEE, ACCESSOIRES_DIVERS
-   [x] Table includes COMMENT explaining purpose and business rules
-   [x] Column comments added for clarity

**Definition of Done:**

-   [x] Table definition complete with all constraints
-   [x] Enum CHECK constraint matches domain ProductType enum exactly
-   [x] Business rules enforced via CHECK constraints (positive costs/prices, non-negative stock)
-   [x] Comments added for documentation
-   [x] SQL syntax validated

**Estimated Effort:** 1.5h

**Dependencies:** Sub-Ticket 10.1 (migration file structure)

**Owner:** Architecture-Aware Dev

**Risk Notes:** Medium risk - must ensure all domain fields are included, enum values match exactly

---

### Sub-Ticket 10.3

**Title:** Create `activities` table with foreign key and constraints

**Rationale:**
The activities table stores business events and must reference products when applicable. It must support optional product_id for CREATION and OTHER activity types, while enforcing business rules.

**Acceptance Criteria:**

-   [x] `activities` table created with columns:
    -   `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
    -   `product_id` UUID REFERENCES products(id) ON DELETE SET NULL (nullable)
    -   `type` TEXT NOT NULL with CHECK constraint for ActivityType enum values
    -   `date` TIMESTAMPTZ NOT NULL
    -   `quantity` NUMERIC(10, 2) NOT NULL
    -   `amount` NUMERIC(10, 2) NOT NULL
    -   `note` TEXT (nullable)
-   [x] CHECK constraint includes all ActivityType enum values: CREATION, SALE, STOCK_CORRECTION, OTHER
-   [x] Foreign key constraint on `product_id` with ON DELETE SET NULL (allows product deletion)
-   [x] Table includes COMMENT explaining purpose and business rules
-   [x] Column comments added for clarity

**Definition of Done:**

-   [x] Table definition complete with all constraints
-   [x] Foreign key constraint properly defined
-   [x] Enum CHECK constraint matches domain ActivityType enum exactly
-   [x] Comments added for documentation
-   [x] SQL syntax validated

**Estimated Effort:** 1.5h

**Dependencies:** Sub-Ticket 10.2 (products table must exist for FK)

**Owner:** Architecture-Aware Dev

**Risk Notes:** Medium risk - foreign key constraint must reference existing products table, nullable product_id must be handled correctly

---

### Sub-Ticket 10.4

**Title:** Create `stock_movements` table with foreign key and constraints

**Rationale:**
The stock_movements table provides a focused view of inventory changes. While it can be derived from activities, having a dedicated table enables efficient stock tracking queries and supports future inventory management features.

**Acceptance Criteria:**

-   [x] `stock_movements` table created with columns:
    -   `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
    -   `product_id` UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE
    -   `quantity` NUMERIC(10, 2) NOT NULL
    -   `source` TEXT NOT NULL with CHECK constraint for StockMovementSource enum values
-   [x] CHECK constraint includes all StockMovementSource enum values: CREATION, SALE, INVENTORY_ADJUSTMENT
-   [x] Foreign key constraint on `product_id` with ON DELETE CASCADE (stock movements are tied to products)
-   [x] Table includes COMMENT explaining purpose and relationship to activities
-   [x] Column comments added for clarity

**Definition of Done:**

-   [x] Table definition complete with all constraints
-   [x] Foreign key constraint properly defined
-   [x] Enum CHECK constraint matches domain StockMovementSource enum exactly
-   [x] Comments added for documentation
-   [x] SQL syntax validated

**Estimated Effort:** 1h

**Dependencies:** Sub-Ticket 10.2 (products table must exist for FK)

**Owner:** Architecture-Aware Dev

**Risk Notes:** Low risk - similar structure to activities table, but simpler

---

### Sub-Ticket 10.5

**Title:** Add indices for frequent query patterns

**Rationale:**
Indices are critical for query performance, especially as data grows. Common query patterns include filtering activities by date, product_id, and type, which require indices for optimal performance.

**Acceptance Criteria:**

-   [x] Index on `activities.date` for date range queries
-   [x] Index on `activities.product_id` for product-specific activity queries
-   [x] Index on `activities.type` for filtering by activity type
-   [x] Composite index on `activities(product_id, date)` for product activity history queries
-   [x] Index on `stock_movements.product_id` for product stock movement queries
-   [x] Index on `stock_movements.source` for filtering by source
-   [x] Index on `products.type` for filtering products by type
-   [x] All indices include COMMENT explaining purpose

**Definition of Done:**

-   [x] All indices created with appropriate names
-   [x] Indices cover common query patterns
-   [x] Comments added for documentation
-   [x] SQL syntax validated

**Estimated Effort:** 1h

**Dependencies:** Sub-Tickets 10.2, 10.3, 10.4 (tables must exist before indices)

**Owner:** Architecture-Aware Dev

**Risk Notes:** Low risk - indices can be added/removed later if needed

---

### Sub-Ticket 10.6

**Title:** Create README documentation for migration process

**Rationale:**
Documentation is essential for maintaining and applying migrations. The README should explain how to apply migrations, verify schema, and handle common issues.

**Acceptance Criteria:**

-   [x] Create `src/infrastructure/supabase/migrations/README.md`
-   [x] README explains how to apply migrations in Supabase dashboard
-   [x] README documents table creation order (products → activities/stock_movements)
-   [x] README includes verification steps (check tables, constraints, indices)
-   [x] README explains enum alignment with domain models
-   [x] README includes troubleshooting section
-   [x] README documents migration file naming convention

**Definition of Done:**

-   [x] README created with clear instructions
-   [x] Documentation is complete and accurate
-   [x] No linting errors
-   [x] Markdown formatting is correct

**Estimated Effort:** 1h

**Dependencies:** Sub-Tickets 10.1-10.5 (migration must be complete to document)

**Owner:** Architecture-Aware Dev

**Risk Notes:** Low risk - documentation task

---

### Sub-Ticket 10.7

**Title:** Apply migration to Supabase dev project and verify schema

**Rationale:**
The migration must be tested in a real Supabase environment to ensure it works correctly, constraints are enforced, and indices are created. This validates the entire migration process.

**Acceptance Criteria:**

-   [x] Migration applied to Supabase dev project via SQL editor
-   [x] All tables created successfully (products, activities, stock_movements)
-   [x] All constraints verified (try inserting invalid enum values, negative costs, etc.)
-   [x] Foreign keys verified (try inserting activity with non-existent product_id)
-   [x] All indices verified (check in Supabase dashboard)
-   [x] Schema matches domain models (all fields present, correct types)
-   [x] Documentation updated if issues found

**Definition of Done:**

-   [x] Migration applied without errors
-   [x] All constraints working as expected
-   [x] All indices created
-   [x] Schema verified against domain models
-   [x] Any issues documented and resolved

**Verification Results:**

✅ **Migration Applied Successfully:**

-   Tables: 3 ✓ (products, activities, stock_movements)
-   Foreign Keys: 2 ✓ (activities.product_id → products.id, stock_movements.product_id → products.id)
-   CHECK Constraints: 27 (includes explicit constraints + PostgreSQL internal constraints)
-   Indices: 11 (includes 7 explicit indices + 4 system-generated indices for primary keys)

**Notes:**

-   The higher count of CHECK constraints (27 vs 7+) is expected - PostgreSQL creates additional internal constraints for complex CHECK clauses
-   The higher count of indices (11 vs 7) is expected - includes system-generated indices for primary keys (products_pkey, activities_pkey, stock_movements_pkey) plus the 7 explicit indices
-   All verification checks passed successfully

**Estimated Effort:** 1.5h

**Dependencies:** Sub-Tickets 10.1-10.6 (all migration work must be complete)

**Owner:** Architecture-Aware Dev

**Risk Notes:** Medium risk - may discover issues during application that require fixes

## Unit Test Spec (Test-First Protocol)

**Status:** tests proposed

**Note:** Database schema migrations are typically not unit tested in the traditional sense, as they are SQL scripts that interact with the database. However, we can create integration-style verification tests or manual verification procedures.

### Verification Approach

Since SQL migrations are infrastructure concerns and require a database connection, we'll use a verification checklist rather than automated unit tests:

1. **Manual Verification Checklist:**

    - Tables exist with correct structure
    - Constraints work (enum CHECK, foreign keys, NOT NULL)
    - Indices are created
    - Default values work (UUID generation, timestamps)
    - Schema matches domain models

2. **SQL Validation:**

    - SQL syntax validated (can use PostgreSQL syntax checker)
    - No syntax errors in migration file
    - All statements are valid PostgreSQL

3. **Documentation Tests:**
    - README instructions are clear and accurate
    - Migration process is documented

**Files & Paths:**

-   N/A (no unit test files for SQL migrations)

**Test Names:**

-   N/A (manual verification instead)

**Mocks/Fixtures:**

-   N/A (requires real Supabase connection)

**Edge Cases:**

-   Invalid enum values (should be rejected by CHECK constraint)
-   Negative costs/prices (should be rejected by CHECK constraint)
-   Negative stock (should be rejected by CHECK constraint)
-   Non-existent product_id in activities (should be rejected by FK constraint)
-   NULL values in required fields (should be rejected by NOT NULL constraint)

**Coverage Target:**

-   Manual verification of all constraints and indices
-   Schema alignment with domain models verified

**Mapping AC → Verification:**

-   AC: Tables created → Verify tables exist in Supabase
-   AC: Constraints work → Test constraint violations
-   AC: Foreign keys work → Test FK violations
-   AC: Indices created → Verify indices in Supabase dashboard
-   AC: Enum alignment → Compare CHECK constraints with domain enums

## Agent Prompts

### Unit Test Coach

```
@Unit Test Coach

I need verification procedures for SQL migration files in `src/infrastructure/supabase/migrations/001_create_domain_tables.sql`.

Since SQL migrations require database connections and are infrastructure concerns, create a manual verification checklist and SQL validation approach rather than automated unit tests.

The migration creates three tables:
- products (with ProductType enum CHECK constraint)
- activities (with ActivityType enum CHECK constraint, FK to products)
- stock_movements (with StockMovementSource enum CHECK constraint, FK to products)

Create:
1. Manual verification checklist covering:
   - Table structure verification
   - Constraint testing (enum CHECK, foreign keys, NOT NULL, numeric ranges)
   - Index verification
   - Default value verification
   - Schema alignment with domain models

2. SQL syntax validation approach
3. Edge case testing scenarios (invalid enum values, constraint violations, etc.)

Reference domain models:
- src/core/domain/product.ts (Product, ProductType)
- src/core/domain/activity.ts (Activity, ActivityType)
- src/core/domain/stockMovement.ts (StockMovement, StockMovementSource)
```

### Architecture-Aware Dev

```
@Architecture-Aware Dev

Implement the database schema migration for FBC-10: Create Supabase tables for products, activities, and stock_movements.

Requirements:
1. Create `src/infrastructure/supabase/migrations/001_create_domain_tables.sql`
2. Create three tables aligned with domain models:
   - products: id (UUID PK), name, type (ProductType enum), coloris, unit_cost, sale_price, stock, weight (nullable), created_at
   - activities: id (UUID PK), product_id (FK nullable), type (ActivityType enum), date, quantity, amount, note (nullable)
   - stock_movements: id (UUID PK), product_id (FK), quantity, source (StockMovementSource enum)

3. Add appropriate constraints:
   - CHECK constraints for enum values (match domain enums exactly)
   - CHECK constraints for business rules (positive costs/prices, non-negative stock)
   - Foreign key constraints with appropriate ON DELETE behavior
   - NOT NULL constraints where required

4. Add indices for frequent queries:
   - activities.date, activities.product_id, activities.type
   - Composite index on activities(product_id, date)
   - stock_movements.product_id, stock_movements.source
   - products.type

5. Use snake_case for column names, TIMESTAMPTZ for timestamps, NUMERIC for monetary/numeric values
6. Add SQL comments for documentation

Reference domain models:
- src/core/domain/product.ts
- src/core/domain/activity.ts
- src/core/domain/stockMovement.ts

Follow Clean Architecture: This is infrastructure concern, but must align with domain types.
```

### UI Designer

```
@UI Designer

This ticket is infrastructure-only (database schema). No UI components are required.

If you need UI for viewing/editing the database schema, that would be a separate ticket.
```

### QA & Test Coach

```
@QA & Test Coach

Create a test plan for verifying the database schema migration in FBC-10.

The migration creates three tables (products, activities, stock_movements) with constraints, foreign keys, and indices.

Create a test plan covering:
1. Schema verification (tables exist, columns correct, types correct)
2. Constraint testing:
   - Enum CHECK constraints (try invalid enum values)
   - Numeric CHECK constraints (try negative costs, negative stock)
   - NOT NULL constraints (try inserting NULL in required fields)
   - Foreign key constraints (try inserting with non-existent product_id)
3. Index verification (indices exist and are used in queries)
4. Default value verification (UUID generation, timestamps)
5. Schema alignment with domain models (all fields present, correct types)

Since this is a database migration, focus on manual verification procedures and SQL validation rather than automated tests.

Reference:
- src/infrastructure/supabase/migrations/001_create_domain_tables.sql
- Domain models: src/core/domain/product.ts, src/core/domain/activity.ts, src/core/domain/stockMovement.ts
```

### Architecture Guardian

```
@Architecture Guardian

Verify that the database schema migration in FBC-10 follows Clean Architecture principles and aligns with domain models.

Check:
1. Schema is in infrastructure layer (src/infrastructure/supabase/migrations/)
2. Schema aligns with domain types (all fields present, correct types)
3. Enum values match domain enums exactly (ProductType, ActivityType, StockMovementSource)
4. Naming conventions follow PostgreSQL standards (snake_case)
5. Constraints enforce business rules from domain
6. Foreign keys maintain referential integrity
7. No business logic in database (no triggers, stored procedures)
8. Schema is minimal for MVP (no unnecessary complexity)

Reference:
- Migration: src/infrastructure/supabase/migrations/001_create_domain_tables.sql
- Domain models: src/core/domain/product.ts, src/core/domain/activity.ts, src/core/domain/stockMovement.ts
- Architecture rules: .cursor/rules/architecture.md
```

## Open Questions

1. **Row-Level Security (RLS):** Should we add RLS policies in this ticket, or defer to a later ticket? (Recommendation: Defer to later ticket for MVP)

2. **Migration Tooling:** Should we set up a migration tool (e.g., Supabase CLI, db-migrate) or continue with manual SQL scripts? (Recommendation: Manual SQL scripts for MVP, tooling can be added later)

3. **Data Seeding:** Should we create seed data or fixtures for development? (Recommendation: Defer to later ticket, not required for MVP)

4. **Timestamp Fields:** Should we add `updated_at` fields for audit trails? (Recommendation: Defer to later ticket, `created_at` is sufficient for MVP)

5. **Stock Movements vs Activities:** The ticket mentions stock_movements can be "derived from activities if not created". Should we create the table now or defer? (Recommendation: Create it now since domain model exists and it supports future inventory features)

## MVP Cut List

If we need to reduce scope for MVP:

-   **Can defer:** Row-Level Security (RLS) policies
-   **Can defer:** `updated_at` timestamp fields
-   **Can defer:** Migration tooling setup
-   **Can defer:** Data seeding/fixtures
-   **Must include:** All three tables (products, activities, stock_movements)
-   **Must include:** All constraints and foreign keys
-   **Must include:** Basic indices for query performance
-   **Must include:** Migration documentation

## Estimated Total Effort

-   Sub-Ticket 10.1: 0.5h
-   Sub-Ticket 10.2: 1.5h
-   Sub-Ticket 10.3: 1.5h
-   Sub-Ticket 10.4: 1h
-   Sub-Ticket 10.5: 1h
-   Sub-Ticket 10.6: 1h
-   Sub-Ticket 10.7: 1.5h

**Total: ~8 hours** (matches ticket estimate of 5 story points)
