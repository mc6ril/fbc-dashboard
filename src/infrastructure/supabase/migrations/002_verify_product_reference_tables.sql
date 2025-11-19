-- ============================================================================
-- Verification Script: 002_verify_product_reference_tables.sql
-- Description: Verify that migration 002_create_product_reference_tables.sql was applied correctly
-- Date: 2025-01-27
-- Ticket: FBC-30, Sub-Ticket 30.1
-- ============================================================================
--
-- This script verifies that all reference tables, constraints, foreign keys,
-- indices, and data migration were completed correctly after applying the migration.
--
-- Run this script AFTER applying 002_create_product_reference_tables.sql to verify
-- the schema matches the expected structure and data migration was successful.
--
-- ============================================================================

-- ============================================================================
-- 1. Verify Reference Tables Exist
-- ============================================================================

-- Check if both reference tables exist
SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('product_models', 'product_coloris') 
        THEN '✓ Table exists'
        ELSE '✗ Table missing'
    END as status
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_name IN ('product_models', 'product_coloris')
ORDER BY table_name;

-- ============================================================================
-- 2. Verify product_models Table Structure
-- ============================================================================

-- Check product_models table columns
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'product_models'
ORDER BY ordinal_position;

-- Expected columns:
-- id (uuid, NOT NULL, default: gen_random_uuid())
-- type (text, NOT NULL)
-- name (text, NOT NULL)

-- ============================================================================
-- 3. Verify product_coloris Table Structure
-- ============================================================================

-- Check product_coloris table columns
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'product_coloris'
ORDER BY ordinal_position;

-- Expected columns:
-- id (uuid, NOT NULL, default: gen_random_uuid())
-- model_id (uuid, NOT NULL)
-- coloris (text, NOT NULL)

-- ============================================================================
-- 4. Verify products Table New Columns
-- ============================================================================

-- Check that products table has model_id and coloris_id columns
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'products'
    AND column_name IN ('model_id', 'coloris_id')
ORDER BY column_name;

-- Expected columns:
-- model_id (uuid, nullable, FK to product_models.id)
-- coloris_id (uuid, nullable, FK to product_coloris.id)

-- ============================================================================
-- 5. Verify Unique Constraints
-- ============================================================================

-- Check unique constraints on product_models
SELECT
    tc.table_name,
    tc.constraint_name,
    STRING_AGG(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) as columns
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
WHERE tc.constraint_type = 'UNIQUE'
    AND tc.table_schema = 'public'
    AND tc.table_name IN ('product_models', 'product_coloris')
GROUP BY tc.table_name, tc.constraint_name
ORDER BY tc.table_name, tc.constraint_name;

-- Expected unique constraints:
-- product_models: (type, name)
-- product_coloris: (model_id, coloris)

-- ============================================================================
-- 6. Verify Foreign Key Constraints
-- ============================================================================

-- Check foreign keys
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints AS rc
    ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
    AND tc.table_name IN ('product_coloris', 'products')
    AND (
        (tc.table_name = 'product_coloris' AND kcu.column_name = 'model_id')
        OR (tc.table_name = 'products' AND kcu.column_name IN ('model_id', 'coloris_id'))
    )
ORDER BY tc.table_name, kcu.column_name;

-- Expected foreign keys:
-- product_coloris.model_id -> product_models.id (ON DELETE CASCADE)
-- products.model_id -> product_models.id (ON DELETE SET NULL or RESTRICT)
-- products.coloris_id -> product_coloris.id (ON DELETE SET NULL or RESTRICT)

-- ============================================================================
-- 7. Verify CHECK Constraints
-- ============================================================================

-- Check CHECK constraints for ProductType enum in product_models
SELECT
    tc.table_name,
    tc.constraint_name,
    cc.check_clause
FROM information_schema.table_constraints AS tc
JOIN information_schema.check_constraints AS cc
    ON tc.constraint_name = cc.constraint_name
WHERE tc.constraint_type = 'CHECK'
    AND tc.table_schema = 'public'
    AND tc.table_name = 'product_models'
ORDER BY tc.constraint_name;

-- Expected CHECK constraints:
-- product_models.type: IN ('SAC_BANANE', 'POCHETTE_ORDINATEUR', 'TROUSSE_TOILETTE', 'POCHETTE_VOLANTS', 'TROUSSE_ZIPPEE', 'ACCESSOIRES_DIVERS')

-- ============================================================================
-- 8. Verify Indices
-- ============================================================================

-- Check all indices on reference tables
SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
    AND tablename IN ('product_models', 'product_coloris')
ORDER BY tablename, indexname;

-- Expected indices:
-- idx_product_models_type (on product_models.type)
-- idx_product_coloris_model_id (on product_coloris.model_id)
-- Plus primary key indices (product_models_pkey, product_coloris_pkey)

-- ============================================================================
-- 9. Verify Data Migration Success
-- ============================================================================

-- Check if all products have model_id and coloris_id populated
SELECT 
    CASE 
        WHEN COUNT(*) FILTER (WHERE model_id IS NULL) = 0 
            AND COUNT(*) FILTER (WHERE coloris_id IS NULL) = 0
        THEN '✓ All products have model_id and coloris_id'
        ELSE '✗ Some products missing model_id or coloris_id'
    END as migration_status,
    COUNT(*) as total_products,
    COUNT(*) FILTER (WHERE model_id IS NOT NULL) as products_with_model_id,
    COUNT(*) FILTER (WHERE coloris_id IS NOT NULL) as products_with_coloris_id,
    COUNT(*) FILTER (WHERE model_id IS NULL) as products_missing_model_id,
    COUNT(*) FILTER (WHERE coloris_id IS NULL) as products_missing_coloris_id
FROM products;

-- Show products that failed migration (missing model_id or coloris_id)
SELECT 
    id,
    name,
    type,
    coloris,
    model_id,
    coloris_id,
    CASE 
        WHEN model_id IS NULL THEN 'Missing model_id'
        WHEN coloris_id IS NULL THEN 'Missing coloris_id'
        ELSE 'OK'
    END as migration_issue
FROM products
WHERE model_id IS NULL OR coloris_id IS NULL
ORDER BY type, name;

-- ============================================================================
-- 10. Verify No Duplicate Entries in Reference Tables
-- ============================================================================

-- Check for duplicate (type, name) combinations in product_models
SELECT 
    CASE 
        WHEN COUNT(*) = COUNT(DISTINCT (type, name))
        THEN '✓ No duplicates in product_models'
        ELSE '✗ Duplicates found in product_models'
    END as duplicate_check,
    COUNT(*) as total_rows,
    COUNT(DISTINCT (type, name)) as unique_combinations
FROM product_models;

-- Check for duplicate (model_id, coloris) combinations in product_coloris
SELECT 
    CASE 
        WHEN COUNT(*) = COUNT(DISTINCT (model_id, coloris))
        THEN '✓ No duplicates in product_coloris'
        ELSE '✗ Duplicates found in product_coloris'
    END as duplicate_check,
    COUNT(*) as total_rows,
    COUNT(DISTINCT (model_id, coloris)) as unique_combinations
FROM product_coloris;

-- ============================================================================
-- 11. Verify Foreign Key Constraints Work (Test Constraint Enforcement)
-- ============================================================================

-- Test 1: Try to insert invalid model_id in products (should fail)
-- Uncomment to test:
-- INSERT INTO products (name, type, coloris, unit_cost, sale_price, stock, model_id)
-- VALUES ('Test Product', 'SAC_BANANE', 'Red', 10.00, 20.00, 0, '00000000-0000-0000-0000-000000000000');

-- Test 2: Try to insert invalid coloris_id in products (should fail)
-- Uncomment to test:
-- INSERT INTO products (name, type, coloris, unit_cost, sale_price, stock, coloris_id)
-- VALUES ('Test Product', 'SAC_BANANE', 'Red', 10.00, 20.00, 0, '00000000-0000-0000-0000-000000000000');

-- Test 3: Try to insert invalid type in product_models (should fail)
-- Uncomment to test:
-- INSERT INTO product_models (type, name)
-- VALUES ('INVALID_TYPE', 'Test Model');

-- Test 4: Try to insert duplicate (type, name) in product_models (should fail)
-- First get an existing (type, name) combination, then uncomment:
-- INSERT INTO product_models (type, name)
-- SELECT type, name FROM product_models LIMIT 1;

-- Test 5: Try to insert duplicate (model_id, coloris) in product_coloris (should fail)
-- First get an existing (model_id, coloris) combination, then uncomment:
-- INSERT INTO product_coloris (model_id, coloris)
-- SELECT model_id, coloris FROM product_coloris LIMIT 1;

-- Test 6: Verify CASCADE delete works (should delete coloris when model is deleted)
-- Create a test model and coloris, then delete model, verify coloris is deleted
-- Uncomment to test:
-- BEGIN;
-- INSERT INTO product_models (type, name) VALUES ('SAC_BANANE', 'TEST_MODEL_FOR_DELETE') RETURNING id;
-- -- Note the id, then:
-- INSERT INTO product_coloris (model_id, coloris) VALUES ('<model_id_here>', 'TEST_COLORIS');
-- DELETE FROM product_models WHERE id = '<model_id_here>';
-- -- Verify product_coloris was deleted:
-- SELECT * FROM product_coloris WHERE model_id = '<model_id_here>';
-- ROLLBACK;

-- ============================================================================
-- 12. Summary Query
-- ============================================================================

-- Get summary of reference tables, constraints, and indices
SELECT 
    'Reference Tables' as category,
    COUNT(*) as count
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_name IN ('product_models', 'product_coloris')

UNION ALL

SELECT 
    'Foreign Keys' as category,
    COUNT(*) as count
FROM information_schema.table_constraints
WHERE constraint_type = 'FOREIGN KEY'
    AND table_schema = 'public'
    AND table_name IN ('product_coloris', 'products')
    AND constraint_name IN (
        SELECT constraint_name
        FROM information_schema.key_column_usage
        WHERE column_name IN ('model_id', 'coloris_id')
    )

UNION ALL

SELECT 
    'Unique Constraints' as category,
    COUNT(*) as count
FROM information_schema.table_constraints
WHERE constraint_type = 'UNIQUE'
    AND table_schema = 'public'
    AND table_name IN ('product_models', 'product_coloris')
    AND constraint_name NOT LIKE '%_pkey' -- Exclude primary key constraints

UNION ALL

SELECT 
    'Indices' as category,
    COUNT(*) as count
FROM pg_indexes
WHERE schemaname = 'public'
    AND tablename IN ('product_models', 'product_coloris')
    AND indexname NOT LIKE '%_pkey' -- Exclude primary key indices

UNION ALL

SELECT 
    'Product Models' as category,
    COUNT(*) as count
FROM product_models

UNION ALL

SELECT 
    'Product Coloris' as category,
    COUNT(*) as count
FROM product_coloris

UNION ALL

SELECT 
    'Products with model_id' as category,
    COUNT(*) as count
FROM products
WHERE model_id IS NOT NULL

UNION ALL

SELECT 
    'Products with coloris_id' as category,
    COUNT(*) as count
FROM products
WHERE coloris_id IS NOT NULL;

-- Expected results:
-- Reference Tables: 2 (product_models, product_coloris)
-- Foreign Keys: 3 (product_coloris.model_id, products.model_id, products.coloris_id)
-- Unique Constraints: 2 (product_models unique on type+name, product_coloris unique on model_id+coloris)
-- Indices: 2 (idx_product_models_type, idx_product_coloris_model_id)
-- Product Models: >= number of unique (type, name) combinations from existing products
-- Product Coloris: >= number of unique (model_id, coloris) combinations from existing products
-- Products with model_id: Should match total products (if migration successful)
-- Products with coloris_id: Should match total products (if migration successful)

