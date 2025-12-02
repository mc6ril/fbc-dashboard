-- ============================================================================
-- Migration 004: Remove stock_movements table
-- ============================================================================
-- 
-- This migration removes the stock_movements table as it was redundant with
-- the activities table. Stock is now tracked directly in products.stock and
-- updated automatically when activities are created or modified.
--
-- Rationale:
-- - StockMovement duplicated data already present in Activity
-- - Stock is now calculated and stored in products.stock column
-- - Activities contain all necessary information for stock tracking
-- - Simplifies the data model and reduces maintenance overhead
--
-- Dependencies Analysis:
-- - stock_movements.product_id -> products.id (ON DELETE CASCADE)
--   This is a foreign key FROM stock_movements TO products, not the reverse.
--   No other tables reference stock_movements (no incoming foreign keys).
--   Therefore, dropping stock_movements will NOT cascade to other tables.
--
-- CASCADE Behavior:
-- The CASCADE keyword in DROP TABLE will automatically drop:
-- - Any views that depend on stock_movements
-- - Any constraints that reference stock_movements
-- - Any indexes on stock_movements (though we drop them explicitly first)
-- - Any triggers on stock_movements
-- - Any functions that depend on stock_movements
--
-- In this case, CASCADE is used as a safety measure to ensure complete cleanup,
-- even though no other tables depend on stock_movements. This prevents errors
-- if any dependent objects were created outside of migrations.
--
-- ============================================================================

-- Drop indexes first (required before dropping table)
-- Note: Indexes are automatically dropped when the table is dropped, but
-- we drop them explicitly first for clarity and to avoid any potential issues.
DROP INDEX IF EXISTS idx_stock_movements_product_id;
DROP INDEX IF EXISTS idx_stock_movements_source;

-- Drop the stock_movements table
-- CASCADE ensures any dependent objects (views, constraints, triggers, etc.)
-- are also dropped. Since no other tables reference stock_movements, this
-- is safe and will only clean up any dependent objects that might exist.
DROP TABLE IF EXISTS stock_movements CASCADE;

COMMENT ON SCHEMA public IS 'FBC Dashboard database schema. Stock is now tracked directly in products.stock and updated automatically when activities are created or modified.';

