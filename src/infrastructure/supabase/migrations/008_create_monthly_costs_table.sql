-- ============================================================================
-- Migration 008: Create monthly_costs table
-- Description: Create table for storing monthly shipping and indirect costs
-- Date: 2025-01-27
-- Ticket: FBC-33
-- ============================================================================
--
-- This migration creates the monthly_costs table for tracking:
-- - Shipping costs per month (entered manually, not per sale)
-- - Indirect costs per month (marketing, overhead, etc.)
--
-- The table stores costs per month in YYYY-MM format for easy querying
-- and aggregation across periods (month, quarter, year).
--
-- Business rules:
-- - Each month (YYYY-MM) can have only one cost record (UNIQUE constraint)
-- - Costs default to 0 if not specified
-- - Month format is YYYY-MM (e.g., "2025-01", "2025-02")
-- - All cost fields use NUMERIC(10, 2) for precision (2 decimal places)
--
-- Table structure:
-- - id: UUID primary key
-- - month: TEXT UNIQUE, format YYYY-MM (e.g., "2025-01")
-- - shipping_cost: NUMERIC(10, 2) DEFAULT 0
-- - marketing_cost: NUMERIC(10, 2) DEFAULT 0
-- - overhead_cost: NUMERIC(10, 2) DEFAULT 0
-- - created_at: TIMESTAMPTZ, auto-set on creation
-- - updated_at: TIMESTAMPTZ, auto-updated on modification
--
-- Indexes:
-- - idx_monthly_costs_month: Index on month column for fast lookups
--
-- This table is used by the revenue calculation usecases to include
-- shipping and indirect costs in net result calculations.
--
-- ============================================================================

-- Create monthly_costs table
CREATE TABLE IF NOT EXISTS monthly_costs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month TEXT NOT NULL UNIQUE CHECK (month ~ '^\d{4}-\d{2}$'), -- Format: YYYY-MM
    shipping_cost NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (shipping_cost >= 0),
    marketing_cost NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (marketing_cost >= 0),
    overhead_cost NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (overhead_cost >= 0),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create index on month column for fast lookups
CREATE INDEX IF NOT EXISTS idx_monthly_costs_month ON monthly_costs(month);

-- Add comments explaining the table and columns
COMMENT ON TABLE monthly_costs IS
'Stores monthly shipping and indirect costs (marketing, overhead) for revenue calculations. Each month (YYYY-MM format) can have one cost record. Costs are entered manually per month, not per sale.';

COMMENT ON COLUMN monthly_costs.id IS
'Unique identifier for the cost record (UUID)';

COMMENT ON COLUMN monthly_costs.month IS
'Month in YYYY-MM format (e.g., "2025-01" for January 2025). Must be unique per month.';

COMMENT ON COLUMN monthly_costs.shipping_cost IS
'Shipping cost for the month in euros (NUMERIC 10,2). Defaults to 0. Must be >= 0.';

COMMENT ON COLUMN monthly_costs.marketing_cost IS
'Marketing cost for the month in euros (NUMERIC 10,2). Defaults to 0. Must be >= 0.';

COMMENT ON COLUMN monthly_costs.overhead_cost IS
'Overhead cost (frais généraux) for the month in euros (NUMERIC 10,2). Defaults to 0. Must be >= 0.';

COMMENT ON COLUMN monthly_costs.created_at IS
'Timestamp when the cost record was created (TIMESTAMPTZ)';

COMMENT ON COLUMN monthly_costs.updated_at IS
'Timestamp when the cost record was last updated (TIMESTAMPTZ)';

