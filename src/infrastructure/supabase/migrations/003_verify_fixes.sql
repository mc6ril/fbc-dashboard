-- ============================================================================
-- Verification Script: 003_verify_fixes.sql
-- Description: Verify that migration 003_fix_product_reference_tables.sql was applied correctly
-- Date: 2025-01-27
-- Ticket: FBC-30, Sub-Ticket 30.1 (fixes verification)
-- ============================================================================
--
-- This script verifies that all schema fixes were applied correctly:
-- 1. product_models.type uses product_type enum
-- 2. products.coloris column is removed
-- 3. products.weight is INT4 with positive constraint
--
-- Run this script AFTER applying 003_fix_product_reference_tables.sql
--
-- ============================================================================

-- ============================================================================
-- 1. Verify product_type enum exists
-- ============================================================================

SELECT 
    typname as enum_name,
    CASE 
        WHEN typname = 'product_type' THEN '✓ product_type enum exists'
        ELSE '✗ product_type enum missing'
    END as status
FROM pg_type
WHERE typname = 'product_type';

-- List enum values
SELECT 
    enumlabel as value
FROM pg_enum
WHERE enumtypid = (
    SELECT oid FROM pg_type WHERE typname = 'product_type'
)
ORDER BY enumsortorder;

-- Expected values:
-- SAC_BANANE
-- POCHETTE_ORDINATEUR
-- TROUSSE_TOILETTE
-- POCHETTE_VOLANTS
-- TROUSSE_ZIPPEE
-- ACCESSOIRES_DIVERS

-- ============================================================================
-- 2. Verify product_models.type uses product_type enum
-- ============================================================================

-- Check product_models.type column type
SELECT 
    table_name,
    column_name,
    data_type,
    udt_name,
    CASE 
        WHEN udt_name = 'product_type' THEN '✓ Uses product_type enum'
        ELSE '✗ Does not use product_type enum'
    END as status
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'product_models'
    AND column_name = 'type';

-- Expected:
-- data_type: USER-DEFINED
-- udt_name: product_type

-- ============================================================================
-- 3. Verify products.coloris column is removed
-- ============================================================================

-- Check that coloris column does NOT exist in products table
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN '✓ coloris column removed from products'
        ELSE '✗ coloris column still exists in products'
    END as status,
    COUNT(*) as column_count
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'products'
    AND column_name = 'coloris';

-- Expected: column_count = 0

-- Verify coloris_id still exists (should be there)
SELECT 
    column_name,
    data_type,
    is_nullable,
    CASE 
        WHEN column_name = 'coloris_id' THEN '✓ coloris_id exists'
        ELSE '✗ coloris_id missing'
    END as status
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'products'
    AND column_name = 'coloris_id';

-- Expected:
-- column_name: coloris_id
-- data_type: uuid
-- is_nullable: YES (during migration period)

-- ============================================================================
-- 4. Verify products.weight is INT4
-- ============================================================================

-- Check products.weight column type
SELECT 
    table_name,
    column_name,
    data_type,
    CASE 
        WHEN data_type = 'integer' THEN '✓ weight is INT4'
        WHEN data_type = 'numeric' THEN '✗ weight is still NUMERIC (not fixed)'
        ELSE '✗ Unexpected type: ' || data_type
    END as status,
    numeric_precision,
    numeric_scale
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'products'
    AND column_name = 'weight';

-- Expected:
-- data_type: integer
-- numeric_precision: NULL (not NUMERIC anymore)
-- numeric_scale: NULL

-- Verify CHECK constraint on weight
SELECT
    tc.table_name,
    tc.constraint_name,
    cc.check_clause,
    CASE 
        WHEN cc.check_clause LIKE '%weight%' AND cc.check_clause LIKE '%> 0%' THEN '✓ Positive weight constraint exists'
        ELSE '✗ Weight constraint missing or incorrect'
    END as status
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_schema = 'public'
    AND tc.table_name = 'products'
    AND tc.constraint_name = 'products_weight_check';

-- Expected:
-- constraint_name: products_weight_check
-- check_clause: (weight IS NULL OR weight > 0)

-- ============================================================================
-- 5. Test enum constraint enforcement (should FAIL)
-- ============================================================================

-- Test: Try to insert invalid enum value (should fail)
-- Uncomment to test:
-- INSERT INTO product_models (type, name)
-- VALUES ('INVALID_TYPE'::product_type, 'Test Model');

-- Test: Try to insert valid enum value (should succeed)
-- Uncomment to test:
-- INSERT INTO product_models (type, name)
-- VALUES ('SAC_BANANE'::product_type, 'Test Model Valid')
-- ON CONFLICT (type, name) DO NOTHING;

-- ============================================================================
-- 6. Test weight INT4 constraint (should FAIL)
-- ============================================================================

-- Test: Try to insert negative weight (should fail)
-- Uncomment to test:
-- UPDATE products SET weight = -10 WHERE id = (SELECT id FROM products LIMIT 1);

-- Test: Try to insert zero weight (should fail)
-- Uncomment to test:
-- UPDATE products SET weight = 0 WHERE id = (SELECT id FROM products LIMIT 1);

-- Test: Try to insert valid integer weight (should succeed)
-- Uncomment to test:
-- UPDATE products SET weight = 150 WHERE id = (SELECT id FROM products LIMIT 1);

-- ============================================================================
-- 7. Verify no coloris column in products (should fail if trying to access)
-- ============================================================================

-- Test: Try to SELECT coloris column (should fail with "column does not exist")
-- Uncomment to test:
-- SELECT id, coloris FROM products LIMIT 1;

-- Verify we can still access coloris via join
SELECT 
    COUNT(*) as products_with_coloris_via_join,
    CASE 
        WHEN COUNT(*) > 0 THEN '✓ Can access coloris via product_coloris join'
        ELSE '✗ Cannot access coloris (no products or join issue)'
    END as status
FROM products p
JOIN product_coloris pc ON p.coloris_id = pc.id;

-- Expected: products_with_coloris_via_join > 0

-- ============================================================================
-- 8. Summary Query
-- ============================================================================

SELECT 
    'Schema Fixes' as category,
    'Status' as value
UNION ALL

SELECT 
    'product_type enum exists' as category,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_type')
        THEN '✓'
        ELSE '✗'
    END as value
UNION ALL

SELECT 
    'product_models.type uses enum' as category,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public'
                AND table_name = 'product_models'
                AND column_name = 'type'
                AND udt_name = 'product_type'
        )
        THEN '✓'
        ELSE '✗'
    END as value
UNION ALL

SELECT 
    'products.coloris removed' as category,
    CASE 
        WHEN NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public'
                AND table_name = 'products'
                AND column_name = 'coloris'
        )
        THEN '✓'
        ELSE '✗'
    END as value
UNION ALL

SELECT 
    'products.coloris_id exists' as category,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public'
                AND table_name = 'products'
                AND column_name = 'coloris_id'
        )
        THEN '✓'
        ELSE '✗'
    END as value
UNION ALL

SELECT 
    'products.weight is INT4' as category,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public'
                AND table_name = 'products'
                AND column_name = 'weight'
                AND data_type = 'integer'
        )
        THEN '✓'
        ELSE '✗'
    END as value
UNION ALL

SELECT 
    'weight constraint exists' as category,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.table_constraints tc
            WHERE tc.table_schema = 'public'
                AND tc.table_name = 'products'
                AND tc.constraint_name = 'products_weight_check'
        )
        THEN '✓'
        ELSE '✗'
    END as value;

-- Expected results:
-- product_type enum exists: ✓
-- product_models.type uses enum: ✓
-- products.coloris removed: ✓
-- products.coloris_id exists: ✓
-- products.weight is INT4: ✓
-- weight constraint exists: ✓

