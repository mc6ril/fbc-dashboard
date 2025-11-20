-- ============================================================================
-- Migration: 002_create_product_reference_tables.sql
-- Description: Create product reference tables for type-model-coloris validation
--              Creates tables: product_models, product_coloris
--              Modifies table: products (adds model_id, coloris_id foreign keys)
-- Date: 2025-01-27
-- Ticket: FBC-30, Sub-Ticket 30.1
-- ============================================================================
--
-- This migration implements reference tables for product models and coloris
-- to enforce valid type → model → coloris combinations at the database level.
-- This prevents naming errors and enables fast filtering for cascading
-- dropdowns in forms.
--
-- Business rules:
-- - Type determines available models (e.g., POCHETTE_VOLANTS → "Charlie")
-- - Type + Model determines available coloris (e.g., POCHETTE_VOLANTS + "Charlie" → "Rose Marsala")
-- - Database-level validation prevents invalid combinations
--
-- Migration strategy:
-- 1. Create reference tables (product_models, product_coloris)
-- 2. Extract unique (type, name) combinations from existing products → populate product_models
-- 3. Extract unique (model_id, coloris) combinations from existing products → populate product_coloris
-- 4. Add model_id and coloris_id columns to products table (nullable initially)
-- 5. Update existing products with model_id and coloris_id based on matching
--
-- All tables align with domain models defined in:
-- - src/core/domain/product.ts (ProductModel, ProductColoris types)
--
-- Naming conventions:
-- - Column names use snake_case (PostgreSQL convention)
-- - Enum values stored as TEXT with CHECK constraints
-- - Foreign keys use ON DELETE CASCADE where appropriate
-- - Unique constraints prevent duplicate entries
--
-- ============================================================================

-- ============================================================================
-- Step 1: Create product_models reference table
-- ============================================================================

CREATE TABLE IF NOT EXISTS product_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN (
        'SAC_BANANE',
        'POCHETTE_ORDINATEUR',
        'TROUSSE_TOILETTE',
        'POCHETTE_VOLANTS',
        'TROUSSE_ZIPPEE',
        'ACCESSOIRES_DIVERS'
    )),
    name TEXT NOT NULL,
    UNIQUE(type, name)
);

COMMENT ON TABLE product_models IS 'Reference table for valid product model names per type. Enforces that only valid type-model combinations can be created. Example: POCHETTE_VOLANTS can have model "Charlie", but SAC_BANANE cannot.';
COMMENT ON COLUMN product_models.id IS 'Unique identifier for the product model (UUID format)';
COMMENT ON COLUMN product_models.type IS 'Product type classification. Must be one of: SAC_BANANE, POCHETTE_ORDINATEUR, TROUSSE_TOILETTE, POCHETTE_VOLANTS, TROUSSE_ZIPPEE, ACCESSOIRES_DIVERS';
COMMENT ON COLUMN product_models.name IS 'Product model name (e.g., "Charlie", "assumée", "espiègle"). Each (type, name) combination must be unique.';

-- Index on type for fast filtering (cascading dropdowns in forms)
CREATE INDEX IF NOT EXISTS idx_product_models_type ON product_models(type);
COMMENT ON INDEX idx_product_models_type IS 'Index for efficient filtering of models by type (e.g., all models for POCHETTE_VOLANTS type)';

-- ============================================================================
-- Step 2: Create product_coloris reference table
-- ============================================================================

CREATE TABLE IF NOT EXISTS product_coloris (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id UUID NOT NULL REFERENCES product_models(id) ON DELETE CASCADE,
    coloris TEXT NOT NULL,
    UNIQUE(model_id, coloris)
);

COMMENT ON TABLE product_coloris IS 'Reference table for valid product coloris per model. Enforces that only valid model-coloris combinations can be created. Example: Model "Charlie" can have coloris "Rose Marsala", but model "assumée" cannot.';
COMMENT ON COLUMN product_coloris.id IS 'Unique identifier for the product coloris (UUID format)';
COMMENT ON COLUMN product_coloris.model_id IS 'Foreign key to product_models table. References the model this coloris belongs to. Deleted when model is deleted (CASCADE).';
COMMENT ON COLUMN product_coloris.coloris IS 'Color variation name (e.g., "Rose Marsala", "Rose pâle à motifs", "Prune", "Rouge"). Each (model_id, coloris) combination must be unique.';

-- Index on model_id for fast filtering (cascading dropdowns in forms)
CREATE INDEX IF NOT EXISTS idx_product_coloris_model_id ON product_coloris(model_id);
COMMENT ON INDEX idx_product_coloris_model_id IS 'Index for efficient filtering of coloris by model (e.g., all coloris for "Charlie" model)';

-- ============================================================================
-- Step 3: Add foreign key columns to products table
-- ============================================================================

-- Add model_id column (nullable initially for migration)
ALTER TABLE products ADD COLUMN IF NOT EXISTS model_id UUID REFERENCES product_models(id);
COMMENT ON COLUMN products.model_id IS 'Foreign key to product_models table. References the model of this product. Nullable during migration period, will be NOT NULL after migration is complete.';

-- Add coloris_id column (nullable initially for migration)
ALTER TABLE products ADD COLUMN IF NOT EXISTS coloris_id UUID REFERENCES product_coloris(id);
COMMENT ON COLUMN products.coloris_id IS 'Foreign key to product_coloris table. References the coloris of this product. Nullable during migration period, will be NOT NULL after migration is complete.';

-- Note: Existing name, type, coloris columns are kept for backward compatibility
-- They will be removed in a follow-up migration after verifying all products
-- use reference tables.

-- ============================================================================
-- Step 4: Data migration - Populate product_models from existing products
-- ============================================================================

-- Insert unique (type, name) combinations from existing products into product_models
-- Only insert combinations that don't already exist (idempotency)
-- Note: Cast p.type to TEXT to handle case where products.type is an enum type
INSERT INTO product_models (type, name)
SELECT DISTINCT
    p.type::TEXT,
    p.name
FROM products p
WHERE NOT EXISTS (
    SELECT 1
    FROM product_models pm
    WHERE pm.type = p.type::TEXT AND pm.name = p.name
)
AND p.type IS NOT NULL
AND p.name IS NOT NULL
AND TRIM(p.name) != '';

-- ============================================================================
-- Step 5: Update products with model_id based on matching (type, name)
-- ============================================================================

-- Update products table to set model_id based on matching type and name
-- Note: Cast p.type to TEXT to handle case where products.type is an enum type
UPDATE products p
SET model_id = pm.id
FROM product_models pm
WHERE p.model_id IS NULL
    AND p.type::TEXT = pm.type
    AND p.name = pm.name
    AND p.type IS NOT NULL
    AND p.name IS NOT NULL
    AND TRIM(p.name) != '';

-- ============================================================================
-- Step 6: Data migration - Populate product_coloris from existing products
-- ============================================================================

-- Insert unique (model_id, coloris) combinations from existing products into product_coloris
-- Only insert combinations that don't already exist (idempotency)
-- Only for products that have a valid model_id (migrated successfully)
INSERT INTO product_coloris (model_id, coloris)
SELECT DISTINCT
    p.model_id,
    p.coloris
FROM products p
WHERE p.model_id IS NOT NULL
    AND p.coloris IS NOT NULL
    AND TRIM(p.coloris) != ''
    AND NOT EXISTS (
        SELECT 1
        FROM product_coloris pc
        WHERE pc.model_id = p.model_id AND pc.coloris = p.coloris
    );

-- ============================================================================
-- Step 7: Update products with coloris_id based on matching (model_id, coloris)
-- ============================================================================

-- Update products table to set coloris_id based on matching model_id and coloris
UPDATE products p
SET coloris_id = pc.id
FROM product_coloris pc
WHERE p.coloris_id IS NULL
    AND p.model_id IS NOT NULL
    AND p.model_id = pc.model_id
    AND p.coloris = pc.coloris
    AND p.coloris IS NOT NULL
    AND TRIM(p.coloris) != '';

-- ============================================================================
-- Migration Summary
-- ============================================================================
--
-- After this migration:
-- - product_models table contains all unique (type, name) combinations from existing products
-- - product_coloris table contains all unique (model_id, coloris) combinations from existing products
-- - products table has model_id and coloris_id columns populated for all products with valid data
-- - Products with invalid or missing data will have NULL model_id/coloris_id (requires manual cleanup)
--
-- Next steps (follow-up migration):
-- 1. Verify all products have model_id and coloris_id (no NULLs)
-- 2. Make model_id and coloris_id NOT NULL
-- 3. Optionally remove old name and coloris columns (or mark as deprecated)
--
-- ============================================================================

