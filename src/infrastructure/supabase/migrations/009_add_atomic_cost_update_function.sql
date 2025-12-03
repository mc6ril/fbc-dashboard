-- ============================================================================
-- Migration 009: Add atomic monthly cost field update function
-- Description: Add PostgreSQL function to atomically update a specific cost field
-- Date: 2025-01-27
-- Ticket: FBC-33
-- ============================================================================
--
-- This migration adds a PostgreSQL function to atomically update a specific
-- cost field (shipping_cost, marketing_cost, or overhead_cost) for a monthly
-- cost record. This prevents lost updates when multiple users modify different
-- cost fields concurrently for the same month.
--
-- The function:
-- - Updates only the specified field, leaving other fields unchanged
-- - Creates a new record if one doesn't exist for the month
-- - Validates that the value is non-negative (>= 0)
-- - Updates the updated_at timestamp automatically
-- - Returns the updated MonthlyCost record
--
-- Rationale:
-- - Prevents lost updates (race conditions) when multiple users edit different
--   cost fields for the same month simultaneously
-- - Uses database-level atomicity (single UPDATE/INSERT statement)
-- - Ensures data consistency without application-level locking
-- - Follows the same pattern as update_product_stock (migration 005)
--
-- Field names:
-- - 'shipping' → updates shipping_cost
-- - 'marketing' → updates marketing_cost
-- - 'overhead' → updates overhead_cost
--
-- ============================================================================

-- Create function to atomically update a specific monthly cost field
CREATE OR REPLACE FUNCTION update_monthly_cost_field(
    p_month TEXT,
    p_field_name TEXT,
    p_value NUMERIC
)
RETURNS TABLE (
    id UUID,
    month TEXT,
    shipping_cost NUMERIC,
    marketing_cost NUMERIC,
    overhead_cost NUMERIC,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
-- Security Note: SECURITY DEFINER runs the function with the privileges of the function owner
-- (typically a database superuser). This is necessary for atomic operations that need to bypass
-- Row Level Security (RLS) policies. The function validates all inputs (field name, value, month format)
-- to prevent SQL injection and unauthorized field updates. This pattern is consistent with
-- update_product_stock (migration 005) and other atomic update functions in the codebase.
AS $$
DECLARE
    v_result RECORD;
BEGIN
    -- Validate field name
    IF p_field_name NOT IN ('shipping', 'marketing', 'overhead') THEN
        RAISE EXCEPTION 'Invalid field name: %. Must be one of: shipping, marketing, overhead', p_field_name;
    END IF;

    -- Validate value is non-negative
    IF p_value < 0 THEN
        RAISE EXCEPTION 'Cost value must be >= 0, got: %', p_value;
    END IF;

    -- Validate month format (YYYY-MM)
    IF p_month !~ '^\d{4}-\d{2}$' THEN
        RAISE EXCEPTION 'Invalid month format: %. Expected YYYY-MM format (e.g., "2025-01")', p_month;
    END IF;

    -- Try to update existing record (atomic UPDATE)
    -- Use table alias to avoid ambiguity between parameter and column name
    UPDATE monthly_costs mc
    SET 
        shipping_cost = CASE WHEN p_field_name = 'shipping' THEN p_value ELSE mc.shipping_cost END,
        marketing_cost = CASE WHEN p_field_name = 'marketing' THEN p_value ELSE mc.marketing_cost END,
        overhead_cost = CASE WHEN p_field_name = 'overhead' THEN p_value ELSE mc.overhead_cost END,
        updated_at = NOW()
    WHERE mc.month = p_month
    RETURNING * INTO v_result;

    -- If no row was updated, create a new record
    IF NOT FOUND THEN
        INSERT INTO monthly_costs (month, shipping_cost, marketing_cost, overhead_cost)
        VALUES (
            p_month,
            CASE WHEN p_field_name = 'shipping' THEN p_value ELSE 0 END,
            CASE WHEN p_field_name = 'marketing' THEN p_value ELSE 0 END,
            CASE WHEN p_field_name = 'overhead' THEN p_value ELSE 0 END
        )
        RETURNING * INTO v_result;
    END IF;

    -- Return the updated/created record
    RETURN QUERY SELECT 
        v_result.id,
        v_result.month,
        v_result.shipping_cost,
        v_result.marketing_cost,
        v_result.overhead_cost,
        v_result.created_at,
        v_result.updated_at;
END;
$$;

-- Add comment explaining the function
COMMENT ON FUNCTION update_monthly_cost_field(TEXT, TEXT, NUMERIC) IS 
'Atomically updates a specific cost field (shipping, marketing, or overhead) for a monthly cost record. Creates a new record if one doesn''t exist for the month. Updates only the specified field, leaving other fields unchanged. Validates field name, value (>= 0), and month format. Returns the updated/created record. This function prevents lost updates when multiple users modify different cost fields concurrently for the same month.';

