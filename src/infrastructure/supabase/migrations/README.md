# Supabase Migrations

This directory contains SQL migration scripts for the FBC Dashboard database schema.

## Overview

Migrations are SQL scripts that define the database schema and are applied to Supabase projects. All migrations follow a naming convention and are designed to be idempotent (safe to run multiple times using `IF NOT EXISTS` clauses).

## Migration Files

### Naming Convention

Migration files follow the pattern: `{number}_{description}.sql`

- `{number}`: Sequential number (001, 002, 003, etc.)
- `{description}`: Brief description in snake_case

Example: `001_create_domain_tables.sql`

### Current Migrations

- **001_create_domain_tables.sql**: Creates initial database schema with `products`, `activities`, and `stock_movements` tables, including constraints, foreign keys, and indices.
- **001_verify_schema.sql**: Verification script to check that the migration was applied correctly (run after applying the migration).

## How to Apply Migrations

### Using Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**
   - Navigate to your Supabase project
   - Go to **SQL Editor** in the left sidebar

2. **Open Migration File**
   - Open the migration file you want to apply (e.g., `001_create_domain_tables.sql`)
   - Copy the entire contents of the file

3. **Run Migration**
   - Paste the SQL into the SQL Editor
   - Click **Run** or press `Ctrl+Enter` (Windows/Linux) or `Cmd+Enter` (Mac)
   - Wait for the migration to complete

4. **Verify Migration**
   - Check the **Table Editor** to verify tables were created
   - Check the **Database** → **Indexes** section to verify indices were created
   - Review any error messages if the migration failed

### Table Creation Order

Migrations must be applied in order due to foreign key dependencies:

1. **products** (no dependencies)
2. **activities** (depends on products)
3. **stock_movements** (depends on products)

The migration file `001_create_domain_tables.sql` already follows this order, so you can apply it as-is.

## Verification Steps

After applying a migration, verify the schema was created correctly:

### Quick Verification

Run the verification script `001_verify_schema.sql` in the Supabase SQL Editor to automatically check:
- All tables exist
- All columns are present with correct types
- Foreign keys are configured correctly
- CHECK constraints are in place
- All indices are created

### Manual Verification

### 1. Check Tables

In Supabase Dashboard → **Table Editor**, verify these tables exist:
- `products`
- `activities`
- `stock_movements`

### 2. Check Constraints

Test constraints to ensure they work correctly:

**Enum Constraints:**
```sql
-- This should fail (invalid ProductType)
INSERT INTO products (name, type, coloris, unit_cost, sale_price, stock)
VALUES ('Test', 'INVALID_TYPE', 'Red', 10.00, 20.00, 0);
```

**Numeric Constraints:**
```sql
-- This should fail (negative cost)
INSERT INTO products (name, type, coloris, unit_cost, sale_price, stock)
VALUES ('Test', 'SAC_BANANE', 'Red', -10.00, 20.00, 0);
```

**Foreign Key Constraints:**
```sql
-- This should fail (non-existent product_id)
INSERT INTO activities (product_id, type, date, quantity, amount)
VALUES ('00000000-0000-0000-0000-000000000000', 'SALE', NOW(), -1, 50.00);
```

### 3. Check Indices

In Supabase Dashboard → **Database** → **Indexes**, verify these indices exist:
- `idx_activities_date`
- `idx_activities_product_id`
- `idx_activities_type`
- `idx_activities_product_id_date`
- `idx_stock_movements_product_id`
- `idx_stock_movements_source`
- `idx_products_type`

### 4. Check Schema Alignment

Verify the schema matches domain models:

**Products Table:**
- Columns: `id`, `name`, `type`, `coloris`, `unit_cost`, `sale_price`, `stock`, `weight`, `created_at`
- Types: UUID, TEXT, NUMERIC, TIMESTAMPTZ

**Activities Table:**
- Columns: `id`, `product_id`, `type`, `date`, `quantity`, `amount`, `note`
- Types: UUID, TIMESTAMPTZ, NUMERIC, TEXT

**Stock Movements Table:**
- Columns: `id`, `product_id`, `quantity`, `source`
- Types: UUID, NUMERIC, TEXT

## Enum Alignment with Domain Models

The database schema uses TEXT columns with CHECK constraints to store enum values. These must match the domain enum values exactly:

### ProductType Enum

Domain: `src/core/domain/product.ts`

Database values:
- `SAC_BANANE`
- `POCHETTE_ORDINATEUR`
- `TROUSSE_TOILETTE`
- `POCHETTE_VOLANTS`
- `TROUSSE_ZIPPEE`
- `ACCESSOIRES_DIVERS`

### ActivityType Enum

Domain: `src/core/domain/activity.ts`

Database values:
- `CREATION`
- `SALE`
- `STOCK_CORRECTION`
- `OTHER`

### StockMovementSource Enum

Domain: `src/core/domain/stockMovement.ts`

Database values:
- `CREATION`
- `SALE`
- `INVENTORY_ADJUSTMENT`

**Important:** If domain enum values change, the database CHECK constraints must be updated to match.

## Troubleshooting

### Migration Fails with "relation already exists"

The migration uses `IF NOT EXISTS` clauses, so this error should not occur. If it does:
- Check if tables were partially created
- Drop existing tables manually if needed: `DROP TABLE IF EXISTS stock_movements CASCADE;`
- Re-run the migration

### Foreign Key Constraint Violations

If you see foreign key errors:
- Ensure `products` table exists before creating `activities` or `stock_movements`
- Check that referenced `product_id` values exist in the `products` table
- Verify foreign key constraints are defined correctly

### Enum Constraint Violations

If you see enum constraint errors:
- Verify the enum value matches exactly (case-sensitive)
- Check the domain enum definition in `src/core/domain/`
- Ensure the CHECK constraint includes all valid enum values

### Index Creation Fails

If index creation fails:
- Check if the table exists
- Verify column names are correct
- Check for duplicate index names

### Migration Applied Multiple Times

Migrations use `IF NOT EXISTS` clauses, so they are safe to run multiple times. However:
- Avoid running migrations unnecessarily
- Check if tables/indices already exist before re-running
- Use version control to track which migrations have been applied

## Best Practices

1. **Always test migrations** in a development environment before applying to production
2. **Backup your database** before applying migrations (especially in production)
3. **Review migration files** before applying to understand what changes will be made
4. **Verify constraints** after applying migrations to ensure they work correctly
5. **Document any issues** encountered during migration application
6. **Keep migrations in version control** to track schema changes over time

## Related Documentation

- Domain Models: `src/core/domain/`
- Repository Implementations: `src/infrastructure/supabase/`
- Planning Document: `report/planning/plan-fbc-10-create-supabase-tables.md`

## Support

If you encounter issues with migrations:
1. Check this README for troubleshooting steps
2. Review the migration file comments for details
3. Verify domain model alignment
4. Check Supabase documentation for PostgreSQL-specific issues

