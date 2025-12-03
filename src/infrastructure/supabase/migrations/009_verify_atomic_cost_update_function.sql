-- ============================================================================
-- Migration 009 Verification: Verify atomic cost update function
-- Description: Verify that update_monthly_cost_field function exists and works correctly
-- Date: 2025-01-27
-- Ticket: FBC-33
-- ============================================================================

-- Verify function exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND p.proname = 'update_monthly_cost_field'
    ) THEN
        RAISE EXCEPTION 'Function update_monthly_cost_field does not exist';
    END IF;
END $$;

-- Verify function signature
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        JOIN pg_type t1 ON p.proargtypes[0] = t1.oid
        JOIN pg_type t2 ON p.proargtypes[1] = t2.oid
        JOIN pg_type t3 ON p.proargtypes[2] = t3.oid
        WHERE n.nspname = 'public'
        AND p.proname = 'update_monthly_cost_field'
        AND t1.typname = 'text'  -- p_month
        AND t2.typname = 'text'  -- p_field_name
        AND t3.typname = 'numeric'  -- p_value
    ) THEN
        RAISE EXCEPTION 'Function update_monthly_cost_field has incorrect signature';
    END IF;
END $$;

-- Verify function returns TABLE
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND p.proname = 'update_monthly_cost_field'
        AND p.prorettype = 'pg_catalog.record'::regtype
    ) THEN
        RAISE EXCEPTION 'Function update_monthly_cost_field does not return TABLE';
    END IF;
END $$;

-- Verify function comment exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        JOIN pg_description d ON p.oid = d.objoid
        WHERE n.nspname = 'public'
        AND p.proname = 'update_monthly_cost_field'
        AND d.description IS NOT NULL
        AND d.description != ''
    ) THEN
        RAISE EXCEPTION 'Function update_monthly_cost_field is missing documentation comment';
    END IF;
END $$;

-- Test function with valid inputs (will be rolled back)
DO $$
DECLARE
    v_result RECORD;
BEGIN
    -- Test: Create new record with shipping cost
    SELECT * INTO v_result
    FROM update_monthly_cost_field('2099-12', 'shipping', 100.50);
    
    IF v_result IS NULL THEN
        RAISE EXCEPTION 'Function update_monthly_cost_field returned NULL';
    END IF;
    
    IF v_result.month != '2099-12' THEN
        RAISE EXCEPTION 'Function returned incorrect month: %', v_result.month;
    END IF;
    
    IF v_result.shipping_cost != 100.50 THEN
        RAISE EXCEPTION 'Function returned incorrect shipping_cost: %', v_result.shipping_cost;
    END IF;
    
    IF v_result.marketing_cost != 0 THEN
        RAISE EXCEPTION 'Function returned incorrect marketing_cost: %', v_result.marketing_cost;
    END IF;
    
    IF v_result.overhead_cost != 0 THEN
        RAISE EXCEPTION 'Function returned incorrect overhead_cost: %', v_result.overhead_cost;
    END IF;
    
    -- Clean up test data
    DELETE FROM monthly_costs WHERE month = '2099-12';
    
    RAISE NOTICE 'Function update_monthly_cost_field verified successfully';
END $$;

-- Verify function handles invalid field name
DO $$
BEGIN
    BEGIN
        PERFORM update_monthly_cost_field('2099-11', 'invalid_field', 100.50);
        RAISE EXCEPTION 'Function should have raised an error for invalid field name';
    EXCEPTION
        WHEN OTHERS THEN
            IF SQLERRM NOT LIKE '%Invalid field name%' THEN
                RAISE EXCEPTION 'Function raised unexpected error: %', SQLERRM;
            END IF;
    END;
END $$;

-- Verify function handles negative value
DO $$
BEGIN
    BEGIN
        PERFORM update_monthly_cost_field('2099-11', 'shipping', -10.00);
        RAISE EXCEPTION 'Function should have raised an error for negative value';
    EXCEPTION
        WHEN OTHERS THEN
            IF SQLERRM NOT LIKE '%must be >= 0%' THEN
                RAISE EXCEPTION 'Function raised unexpected error: %', SQLERRM;
            END IF;
    END;
END $$;

-- Verify function handles invalid month format
DO $$
BEGIN
    BEGIN
        PERFORM update_monthly_cost_field('invalid-month', 'shipping', 100.50);
        RAISE EXCEPTION 'Function should have raised an error for invalid month format';
    EXCEPTION
        WHEN OTHERS THEN
            IF SQLERRM NOT LIKE '%Invalid month format%' THEN
                RAISE EXCEPTION 'Function raised unexpected error: %', SQLERRM;
            END IF;
    END;
END $$;

SELECT 'Migration 009 verification completed successfully' AS status;

