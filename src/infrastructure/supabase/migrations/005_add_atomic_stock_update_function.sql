-- ============================================================================
-- Migration 005: Add atomic stock update function
-- ============================================================================
-- 
-- This migration adds a PostgreSQL function to atomically update product stock
-- by adding a quantity delta. This prevents race conditions when multiple
-- activities are created concurrently for the same product.
--
-- The function uses a single SQL UPDATE statement which is atomic at the
-- database level, ensuring that concurrent updates are properly serialized.
--
-- Rationale:
-- - Prevents race conditions in stock updates
-- - Ensures stock never goes below 0 (clamped to 0 minimum)
-- - Returns the new stock value for verification
-- - Uses database-level atomicity (no application-level locking needed)
--
-- ============================================================================

-- Create function to atomically update product stock
CREATE OR REPLACE FUNCTION update_product_stock(
    p_product_id UUID,
    p_quantity_delta NUMERIC
)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_new_stock NUMERIC;
BEGIN
    -- Atomically update stock: add delta and clamp to 0 minimum
    UPDATE products
    SET stock = GREATEST(0, stock + p_quantity_delta)
    WHERE id = p_product_id
    RETURNING stock INTO v_new_stock;
    
    -- If no row was updated, product doesn't exist
    IF v_new_stock IS NULL THEN
        RAISE EXCEPTION 'Product with id % not found', p_product_id;
    END IF;
    
    RETURN v_new_stock;
END;
$$;

-- Add comment explaining the function
COMMENT ON FUNCTION update_product_stock(UUID, NUMERIC) IS 
'Atomically updates product stock by adding a quantity delta. Returns the new stock value. Stock is clamped to 0 minimum. Throws an error if the product does not exist. This function prevents race conditions when multiple activities update the same product stock concurrently.';

