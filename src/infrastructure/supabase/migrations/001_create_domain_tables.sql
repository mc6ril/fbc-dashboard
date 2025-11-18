-- ============================================================================
-- Migration: 001_create_domain_tables.sql
-- Description: Create initial database schema for FBC Dashboard
--              Creates tables: products, activities, stock_movements
-- Date: 2025-01-27
-- Ticket: FBC-10
-- ============================================================================
--
-- This migration creates the core domain tables for the FBC Dashboard:
-- - products: Product catalog with pricing, stock, and metadata
-- - activities: Business events and activity tracking
-- - stock_movements: Inventory change tracking
--
-- All tables align with domain models defined in:
-- - src/core/domain/product.ts
-- - src/core/domain/activity.ts
-- - src/core/domain/stockMovement.ts
--
-- Naming conventions:
-- - Column names use snake_case (PostgreSQL convention)
-- - Enum values stored as TEXT with CHECK constraints
-- - Timestamps use TIMESTAMPTZ for UTC storage
-- - Numeric fields use NUMERIC for precision
--
-- Table creation order:
-- 1. products (no dependencies)
-- 2. activities (depends on products)
-- 3. stock_movements (depends on products)
--
-- ============================================================================

-- ============================================================================
-- Sub-Ticket 10.2: Create products table
-- ============================================================================

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN (
        'SAC_BANANE',
        'POCHETTE_ORDINATEUR',
        'TROUSSE_TOILETTE',
        'POCHETTE_VOLANTS',
        'TROUSSE_ZIPPEE',
        'ACCESSOIRES_DIVERS'
    )),
    coloris TEXT NOT NULL,
    unit_cost NUMERIC(10, 2) NOT NULL CHECK (unit_cost > 0),
    sale_price NUMERIC(10, 2) NOT NULL CHECK (sale_price > 0),
    stock NUMERIC(10, 2) NOT NULL CHECK (stock >= 0) DEFAULT 0,
    weight NUMERIC(6, 2) CHECK (weight IS NULL OR weight > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE products IS 'Product catalog with pricing, stock, and metadata. Each product represents an item available for sale or tracking in the inventory system.';
COMMENT ON COLUMN products.id IS 'Unique identifier for the product (UUID format)';
COMMENT ON COLUMN products.name IS 'Product name or description (e.g., "Sac banane L''Assumée", "Pochette ordinateur L''Espiegle")';
COMMENT ON COLUMN products.type IS 'Product type classification. Must be one of: SAC_BANANE, POCHETTE_ORDINATEUR, TROUSSE_TOILETTE, POCHETTE_VOLANTS, TROUSSE_ZIPPEE, ACCESSOIRES_DIVERS';
COMMENT ON COLUMN products.coloris IS 'Color variation of the product (e.g., "Rose pâle à motifs", "Rose marsala", "Prune", "Rouge", "Pêche", "Rose")';
COMMENT ON COLUMN products.unit_cost IS 'Cost per unit for the product (must be positive, represents purchase/manufacturing cost)';
COMMENT ON COLUMN products.sale_price IS 'Selling price per unit (must be positive, represents the price at which the product is sold)';
COMMENT ON COLUMN products.stock IS 'Current stock level (must be non-negative, represents available quantity in inventory)';
COMMENT ON COLUMN products.weight IS 'Optional weight of the product in grams. Used for shipping cost calculations, logistics management, and providing weight information to customers. Examples: Sac banane typically weighs ~150-200 grams, Pochette ordinateur ~300-400 grams.';
COMMENT ON COLUMN products.created_at IS 'Timestamp when the product was created (UTC)';

-- ============================================================================
-- Sub-Ticket 10.3: Create activities table
-- ============================================================================

CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN (
        'CREATION',
        'SALE',
        'STOCK_CORRECTION',
        'OTHER'
    )),
    date TIMESTAMPTZ NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    note TEXT
);

COMMENT ON TABLE activities IS 'Business events and activity tracking. Records business events such as product creation, sales, stock corrections, and other operations. Provides an audit trail and enables tracking of business operations over time.';
COMMENT ON COLUMN activities.id IS 'Unique identifier for the activity (UUID format)';
COMMENT ON COLUMN activities.product_id IS 'Optional unique identifier of the product associated with this activity. Required for SALE and STOCK_CORRECTION types, optional for CREATION and OTHER types. Set to NULL if product is deleted.';
COMMENT ON COLUMN activities.type IS 'Type of activity. Must be one of: CREATION (new product/item created), SALE (product sold), STOCK_CORRECTION (manual stock adjustment), OTHER (any other business activity)';
COMMENT ON COLUMN activities.date IS 'ISO 8601 timestamp when the activity occurred (UTC)';
COMMENT ON COLUMN activities.quantity IS 'Quantity change associated with the activity. Positive values indicate stock increases, negative values indicate stock decreases. For SALE activities, typically negative. For CREATION activities, typically positive.';
COMMENT ON COLUMN activities.amount IS 'Monetary amount associated with the activity (e.g., sale price, total cost). Represents the financial value of the activity.';
COMMENT ON COLUMN activities.note IS 'Optional note or description providing additional context about the activity. Can be used for comments, explanations, or additional details about the business event.';

-- ============================================================================
-- Sub-Ticket 10.4: Create stock_movements table
-- ============================================================================

CREATE TABLE IF NOT EXISTS stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity NUMERIC(10, 2) NOT NULL,
    source TEXT NOT NULL CHECK (source IN (
        'CREATION',
        'SALE',
        'INVENTORY_ADJUSTMENT'
    ))
);

COMMENT ON TABLE stock_movements IS 'Inventory change tracking. Records changes to product inventory levels with source tracking. Provides a focused view of inventory changes and enables efficient stock tracking queries. While related to activities, this table focuses specifically on inventory changes.';
COMMENT ON COLUMN stock_movements.id IS 'Unique identifier for the stock movement (UUID format)';
COMMENT ON COLUMN stock_movements.product_id IS 'Unique identifier of the product whose stock changed. Required for all stock movements as they must be associated with a product. Deleted when product is deleted.';
COMMENT ON COLUMN stock_movements.quantity IS 'Quantity change for the stock movement. The sign indicates direction: positive for increases, negative for decreases. For CREATION source: typically positive (stock added). For SALE source: typically negative (stock removed). For INVENTORY_ADJUSTMENT source: can be positive (increase) or negative (decrease).';
COMMENT ON COLUMN stock_movements.source IS 'Source or reason for the stock movement. Must be one of: CREATION (stock added through product creation), SALE (stock reduced due to sale), INVENTORY_ADJUSTMENT (manual adjustment, correction, damage, loss, etc.)';

-- ============================================================================
-- Sub-Ticket 10.5: Add indices for frequent query patterns
-- ============================================================================

-- Index on activities.date for date range queries
CREATE INDEX IF NOT EXISTS idx_activities_date ON activities(date);
COMMENT ON INDEX idx_activities_date IS 'Index for efficient date range queries on activities (e.g., activities in a specific month or year)';

-- Index on activities.product_id for product-specific activity queries
CREATE INDEX IF NOT EXISTS idx_activities_product_id ON activities(product_id);
COMMENT ON INDEX idx_activities_product_id IS 'Index for efficient queries of all activities for a specific product';

-- Index on activities.type for filtering by activity type
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(type);
COMMENT ON INDEX idx_activities_type IS 'Index for efficient filtering of activities by type (e.g., all SALE activities)';

-- Composite index on activities(product_id, date) for product activity history queries
CREATE INDEX IF NOT EXISTS idx_activities_product_id_date ON activities(product_id, date);
COMMENT ON INDEX idx_activities_product_id_date IS 'Composite index for efficient queries of product activity history ordered by date (e.g., chronological activity list for a product)';

-- Index on stock_movements.product_id for product stock movement queries
CREATE INDEX IF NOT EXISTS idx_stock_movements_product_id ON stock_movements(product_id);
COMMENT ON INDEX idx_stock_movements_product_id IS 'Index for efficient queries of all stock movements for a specific product';

-- Index on stock_movements.source for filtering by source
CREATE INDEX IF NOT EXISTS idx_stock_movements_source ON stock_movements(source);
COMMENT ON INDEX idx_stock_movements_source IS 'Index for efficient filtering of stock movements by source (e.g., all CREATION movements)';

-- Index on products.type for filtering products by type
CREATE INDEX IF NOT EXISTS idx_products_type ON products(type);
COMMENT ON INDEX idx_products_type IS 'Index for efficient filtering of products by type (e.g., all SAC_BANANE products)';

