-- ============================================================================
-- Verification Script: 008_verify_monthly_costs_table.sql
-- Description: Verify that migration 008_create_monthly_costs_table.sql was applied correctly
-- Date: 2025-01-27
-- Ticket: FBC-33, Sub-Ticket 33.1
-- ============================================================================
--
-- This script verifies that the monthly_costs table, constraints, and indices
-- were created correctly after applying the migration.
--
-- Run this script AFTER applying 008_create_monthly_costs_table.sql to verify
-- the schema matches the expected structure.
--
-- ============================================================================

-- ============================================================================
-- 1. Verify Table Exists
-- ============================================================================

-- Check if monthly_costs table exists
SELECT 
    table_name,
    CASE 
        WHEN table_name = 'monthly_costs' 
        THEN '✓ Table exists'
        ELSE '✗ Table missing'
    END as status
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_name = 'monthly_costs';

-- ============================================================================
-- 2. Verify Table Structure
-- ============================================================================

-- Check monthly_costs table columns
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'monthly_costs'
ORDER BY ordinal_position;

-- Expected columns:
-- id (uuid, NOT NULL, default: gen_random_uuid())
-- month (text, NOT NULL, UNIQUE)
-- shipping_cost (numeric(10,2), NOT NULL, default: 0)
-- marketing_cost (numeric(10,2), NOT NULL, default: 0)
-- overhead_cost (numeric(10,2), NOT NULL, default: 0)
-- created_at (timestamp with time zone, NOT NULL, default: NOW())
-- updated_at (timestamp with time zone, NOT NULL, default: NOW())

-- ============================================================================
-- 3. Verify Constraints
-- ============================================================================

-- Check UNIQUE constraint on month column
SELECT 
    constraint_name,
    constraint_type,
    CASE 
        WHEN constraint_type = 'UNIQUE' 
        THEN '✓ UNIQUE constraint exists'
        ELSE '✗ UNIQUE constraint missing'
    END as status
FROM information_schema.table_constraints
WHERE table_schema = 'public'
    AND table_name = 'monthly_costs'
    AND constraint_type = 'UNIQUE';

-- Check CHECK constraints
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    cc.check_clause
FROM information_schema.table_constraints AS tc
JOIN information_schema.check_constraints AS cc
    ON tc.constraint_name = cc.constraint_name
WHERE tc.constraint_type = 'CHECK'
    AND tc.table_schema = 'public'
    AND tc.table_name = 'monthly_costs'
ORDER BY tc.constraint_name;

-- Expected CHECK constraints:
-- - month format: month ~ '^\d{4}-\d{2}$' (YYYY-MM format)
-- - shipping_cost >= 0
-- - marketing_cost >= 0
-- - overhead_cost >= 0

-- ============================================================================
-- 4. Verify Indexes
-- ============================================================================

-- Check index on month column
SELECT 
    indexname,
    indexdef,
    CASE 
        WHEN indexname = 'idx_monthly_costs_month' 
        THEN '✓ Index exists'
        ELSE '✗ Index missing'
    END as status
FROM pg_indexes
WHERE schemaname = 'public'
    AND tablename = 'monthly_costs'
    AND indexname = 'idx_monthly_costs_month';

-- ============================================================================
-- 5. Test Constraints
-- ============================================================================

-- Test: Insert valid record (should succeed)
-- Note: This will create a test record that should be cleaned up
DO $$
BEGIN
    -- Insert a test record with valid data
    INSERT INTO monthly_costs (month, shipping_cost, marketing_cost, overhead_cost)
    VALUES ('2025-01', 100.50, 50.25, 75.00)
    ON CONFLICT (month) DO NOTHING;
    
    RAISE NOTICE '✓ Test insert succeeded';
    
    -- Clean up test record
    DELETE FROM monthly_costs WHERE month = '2025-01';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '✗ Test insert failed: %', SQLERRM;
END $$;

-- Test: Insert invalid month format (should fail)
DO $$
BEGIN
    INSERT INTO monthly_costs (month, shipping_cost, marketing_cost, overhead_cost)
    VALUES ('invalid-format', 100.50, 50.25, 75.00);
    
    RAISE NOTICE '✗ Invalid month format test failed (should have raised error)';
    
EXCEPTION
    WHEN check_violation THEN
        RAISE NOTICE '✓ Invalid month format correctly rejected';
    WHEN OTHERS THEN
        RAISE NOTICE '✗ Unexpected error: %', SQLERRM;
END $$;

-- Test: Insert negative cost (should fail)
DO $$
BEGIN
    INSERT INTO monthly_costs (month, shipping_cost, marketing_cost, overhead_cost)
    VALUES ('2025-02', -100.50, 50.25, 75.00);
    
    RAISE NOTICE '✗ Negative cost test failed (should have raised error)';
    
EXCEPTION
    WHEN check_violation THEN
        RAISE NOTICE '✓ Negative cost correctly rejected';
    WHEN OTHERS THEN
        RAISE NOTICE '✗ Unexpected error: %', SQLERRM;
END $$;

-- Test: Insert duplicate month (should fail)
DO $$
BEGIN
    -- Insert first record
    INSERT INTO monthly_costs (month, shipping_cost, marketing_cost, overhead_cost)
    VALUES ('2025-03', 100.50, 50.25, 75.00)
    ON CONFLICT (month) DO NOTHING;
    
    -- Try to insert duplicate month
    INSERT INTO monthly_costs (month, shipping_cost, marketing_cost, overhead_cost)
    VALUES ('2025-03', 200.00, 100.00, 150.00);
    
    RAISE NOTICE '✗ Duplicate month test failed (should have raised error)';
    
    -- Clean up
    DELETE FROM monthly_costs WHERE month = '2025-03';
    
EXCEPTION
    WHEN unique_violation THEN
        RAISE NOTICE '✓ Duplicate month correctly rejected';
        -- Clean up
        DELETE FROM monthly_costs WHERE month = '2025-03';
    WHEN OTHERS THEN
        RAISE NOTICE '✗ Unexpected error: %', SQLERRM;
        -- Clean up
        DELETE FROM monthly_costs WHERE month = '2025-03';
END $$;

-- ============================================================================
-- 6. Summary
-- ============================================================================

-- Display summary of verification
SELECT 
    'Verification Summary' as summary,
    (SELECT COUNT(*) FROM information_schema.tables 
     WHERE table_schema = 'public' AND table_name = 'monthly_costs') as table_exists,
    (SELECT COUNT(*) FROM information_schema.columns 
     WHERE table_schema = 'public' AND table_name = 'monthly_costs') as column_count,
    (SELECT COUNT(*) FROM pg_indexes 
     WHERE schemaname = 'public' AND tablename = 'monthly_costs') as index_count;

