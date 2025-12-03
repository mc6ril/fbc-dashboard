-- ============================================================================
-- Migration 007: Add recalculate_and_update_stock function
-- ============================================================================
--
-- This migration adds a PostgreSQL function to atomically recalculate and update
-- product stock based on all related activities. The function:
-- - Calculates stock as the sum of quantities from activities for a product
--   (CREATION, SALE, STOCK_CORRECTION) while ignoring OTHER types and zero
--   quantities.
-- - Updates the product's stock in a single atomic UPDATE statement.
-- - Clamps the resulting stock to a minimum of 0.
-- - Returns the new stock value for verification.
-- - Throws an error if the product does not exist.
--
-- Rationale:
-- - Prevents race conditions and inconsistencies by using activities as the
--   single source of truth for stock.
-- - Ensures stock is recalculated atomically at the database level.
-- - Provides a reliable way to resynchronize stock after activity updates.
--
-- This function is designed to be called from the application layer via an RPC
-- (remote procedure call) and is complementary to the incremental
-- update_product_stock function added in migration 005.
--
-- ============================================================================

-- Create function to recalculate and atomically update product stock
CREATE OR REPLACE FUNCTION recalculate_and_update_stock(
    p_product_id UUID
)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_calculated_stock NUMERIC;
    v_new_stock NUMERIC;
BEGIN
    -- Calculate stock from all relevant activities for this product.
    -- Only activities that affect inventory are included:
    -- - CREATION: typically positive quantity (stock increase)
    -- - SALE: typically negative quantity (stock decrease)
    -- - STOCK_CORRECTION: positive or negative quantity (manual adjustment)
    --
    -- Activities with quantity = 0 are ignored as they do not impact stock.
    SELECT COALESCE(SUM(quantity), 0)
    INTO v_calculated_stock
    FROM activities
    WHERE product_id = p_product_id
      AND type IN ('CREATION', 'SALE', 'STOCK_CORRECTION')
      AND quantity <> 0;

    -- Atomically update product stock to the recalculated value,
    -- clamping to 0 minimum to prevent negative stock.
    UPDATE products
    SET stock = GREATEST(0, v_calculated_stock)
    WHERE id = p_product_id
    RETURNING stock INTO v_new_stock;

    -- If no row was updated, the product does not exist.
    IF v_new_stock IS NULL THEN
        RAISE EXCEPTION 'Product with id % not found', p_product_id;
    END IF;

    RETURN v_new_stock;
END;
$$;

-- Add comment explaining the function
COMMENT ON FUNCTION recalculate_and_update_stock(UUID) IS
'Recalculates product stock from all related activities (CREATION, SALE, STOCK_CORRECTION), updates the product stock atomically, clamps the result to 0 minimum, and returns the new stock value. Throws an error if the product does not exist.';


