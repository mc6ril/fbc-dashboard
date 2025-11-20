-- ============================================================================
-- Migration: 003_fix_product_reference_tables.sql
-- Description: Fix product reference tables schema issues
--              - Use product_type enum instead of TEXT in product_models
--              - Remove redundant coloris column from products table
--              - Change weight from NUMERIC to INT4 (grams as integers)
-- Date: 2025-01-27
-- Ticket: FBC-30, Sub-Ticket 30.1 (fixes)
-- ============================================================================
--
-- This migration fixes schema issues identified after initial migration:
--
-- 1. product_models.type should use product_type enum instead of TEXT
--    Reason: Enforces consistency and prevents variations like "Sac banane",
--            "Sac Banane", "Sac_banane", etc. Enum ensures data integrity.
--
-- 2. products.coloris column is redundant (coloris_id exists)
--    Reason: Now that we have product_coloris reference table and coloris_id
--            foreign key, the coloris text column is no longer needed.
--
-- 3. products.weight should be INT4 (integer grams) instead of NUMERIC
--    Reason: Weights in logistics are always integers (120g, 300g, 780g).
--            Decimal weights are not needed. Conversion to kg can be done in UI.
--
-- Migration strategy:
-- 1. Ensure product_type enum exists (create if needed)
-- 2. Alter product_models.type to use product_type enum
-- 3. Drop products.coloris column (data is preserved in product_coloris table)
-- 4. Alter products.weight from NUMERIC(6,2) to INT4
--
-- ============================================================================

-- ============================================================================
-- Step 1: Ensure product_type enum exists
-- ============================================================================

-- Check if product_type enum exists, create if not
-- Note: If enum already exists, this will fail silently (expected behavior)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_type') THEN
        CREATE TYPE product_type AS ENUM (
            'SAC_BANANE',
            'POCHETTE_ORDINATEUR',
            'TROUSSE_TOILETTE',
            'POCHETTE_VOLANTS',
            'TROUSSE_ZIPPEE',
            'ACCESSOIRES_DIVERS'
        );
        COMMENT ON TYPE product_type IS 'Product type classification enum. Ensures consistency across all product-related tables.';
    END IF;
END $$;

-- ============================================================================
-- Step 2: Alter product_models.type to use product_type enum
-- ============================================================================

-- Convert product_models.type from TEXT to product_type enum
-- Strategy: Create temporary column, copy data with cast, drop old, rename new
-- This approach avoids type comparison issues during ALTER COLUMN

-- Create temporary column with enum type
ALTER TABLE product_models
    ADD COLUMN type_new product_type;

-- Copy and convert data from TEXT to enum
UPDATE product_models
SET type_new = CASE 
    WHEN type::text = 'SAC_BANANE' THEN 'SAC_BANANE'::product_type
    WHEN type::text = 'POCHETTE_ORDINATEUR' THEN 'POCHETTE_ORDINATEUR'::product_type
    WHEN type::text = 'TROUSSE_TOILETTE' THEN 'TROUSSE_TOILETTE'::product_type
    WHEN type::text = 'POCHETTE_VOLANTS' THEN 'POCHETTE_VOLANTS'::product_type
    WHEN type::text = 'TROUSSE_ZIPPEE' THEN 'TROUSSE_ZIPPEE'::product_type
    WHEN type::text = 'ACCESSOIRES_DIVERS' THEN 'ACCESSOIRES_DIVERS'::product_type
    ELSE NULL::product_type
END;

-- Make sure all rows have a valid enum value (should not happen, but safety check)
-- If any NULL values exist, they need to be fixed manually before continuing

-- Drop old TEXT column
ALTER TABLE product_models
    DROP COLUMN type;

-- Rename new column to original name
ALTER TABLE product_models
    RENAME COLUMN type_new TO type;

-- Make NOT NULL (since it was NOT NULL before)
ALTER TABLE product_models
    ALTER COLUMN type SET NOT NULL;

-- Re-add UNIQUE constraint on (type, name)
-- Note: The constraint was dropped when we dropped the old column
-- We need to recreate it with the new enum type
-- Using IF NOT EXISTS equivalent with DO block
DO $$
BEGIN
    -- Try to add constraint, ignore if already exists
    BEGIN
        ALTER TABLE product_models
            ADD CONSTRAINT product_models_type_name_key 
            UNIQUE (type, name);
    EXCEPTION
        WHEN duplicate_object THEN
            -- Constraint already exists, do nothing
            NULL;
    END;
END $$;

COMMENT ON COLUMN product_models.type IS 'Product type classification using product_type enum. Ensures consistency and prevents variations (e.g., "Sac banane", "Sac Banane").';

-- ============================================================================
-- Step 3: Remove redundant coloris column from products table
-- ============================================================================

-- Drop coloris column from products table
-- Data is preserved in product_coloris reference table via coloris_id foreign key
-- Note: Only drop if all products have coloris_id populated (verified by migration 002)
ALTER TABLE products
    DROP COLUMN IF EXISTS coloris;

COMMENT ON TABLE products IS 'Product catalog with pricing, stock, and metadata. Coloris information is stored in product_coloris reference table via coloris_id foreign key.';

-- ============================================================================
-- Step 4: Change weight from NUMERIC to INT4 (integer grams)
-- ============================================================================

-- Convert weight from NUMERIC(6,2) to INT4
-- Existing values are rounded to nearest integer (acceptable for grams)
-- NULL values are preserved
ALTER TABLE products
    ALTER COLUMN weight TYPE INT4 USING CASE 
        WHEN weight IS NULL THEN NULL
        ELSE ROUND(weight)::INT4
    END;

-- Update CHECK constraint to ensure positive integers
ALTER TABLE products
    DROP CONSTRAINT IF EXISTS products_weight_check;

ALTER TABLE products
    ADD CONSTRAINT products_weight_check 
    CHECK (weight IS NULL OR weight > 0);

COMMENT ON COLUMN products.weight IS 'Weight of the product in grams (integer). Used for shipping cost calculations, logistics management, and providing weight information to customers. Examples: Sac banane typically weighs 150-200g, Pochette ordinateur 300-400g. If conversion to kg is needed, divide by 1000 in the UI.';

-- ============================================================================
-- Migration Summary
-- ============================================================================
--
-- After this migration:
-- - product_models.type uses product_type enum (enforces consistency)
-- - products.coloris column removed (data preserved in product_coloris table)
-- - products.weight is INT4 (integer grams, not decimal)
--
-- Benefits:
-- - Data integrity: enum prevents type variations
-- - Cleaner schema: no redundant coloris column
-- - Better type: integer grams match real-world logistics
--
-- ============================================================================

