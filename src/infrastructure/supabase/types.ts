/**
 * Supabase Type Definitions
 *
 * Type definitions for Supabase database rows and responses.
 * These types represent the structure of data as it comes from Supabase,
 * with snake_case column names matching the database schema.
 */

/**
 * Supabase row type for products table.
 * Matches the database schema with snake_case column names.
 * After migration (FBC-30), includes foreign keys to reference tables.
 */
export type SupabaseProductRow = {
    id: string;
    model_id: string | null; // FK to product_models, nullable during migration
    coloris_id: string | null; // FK to product_coloris, nullable during migration
    unit_cost: string; // NUMERIC returned as string from Supabase
    sale_price: string; // NUMERIC returned as string from Supabase
    stock: string; // NUMERIC returned as string from Supabase
    weight: number | null; // INT4 in database (after migration 003)
    created_at: string; // Not in domain, but present in DB
    // Joined fields from reference tables (for backward compatibility)
    name?: string; // From product_models join
    type?: string; // From product_models join (product_type enum)
    coloris?: string; // From product_coloris join
};

/**
 * Supabase row type for product_models table.
 * Matches the database schema with snake_case column names.
 */
export type SupabaseProductModelRow = {
    id: string;
    type: string; // product_type enum
    name: string;
    created_at: string;
    updated_at: string;
};

/**
 * Supabase row type for product_coloris table.
 * Matches the database schema with snake_case column names.
 */
export type SupabaseProductColorisRow = {
    id: string;
    model_id: string;
    coloris: string;
    created_at: string;
    updated_at: string;
};

/**
 * Supabase insert/update payload type.
 * Used for creating and updating products.
 * All fields are optional to support partial updates.
 * After migration (FBC-30), uses foreign keys to reference tables.
 */
export type SupabaseProductPayload = {
    model_id?: string | null;
    coloris_id?: string | null;
    unit_cost?: number;
    sale_price?: number;
    stock?: number;
    weight?: number | null;
    // Deprecated fields for backward compatibility during migration
    name?: string;
    type?: string;
    coloris?: string;
};

/**
 * Supabase response type for products with joined relations.
 * Represents the structure returned by Supabase when querying products
 * with joins to product_models and product_coloris tables.
 */
export type SupabaseProductWithJoins = {
    id: string;
    model_id: string | null;
    coloris_id: string | null;
    unit_cost: string;
    sale_price: string;
    stock: string;
    weight: number | null;
    created_at: string;
    product_models?: {
        name: string;
        type: string;
    } | null;
    product_coloris?: {
        coloris: string;
    } | null;
};

/**
 * Supabase row type for activities table.
 * Matches the database schema with snake_case column names.
 */
export type SupabaseActivityRow = {
    id: string;
    product_id: string | null;
    type: string;
    date: string;
    quantity: string; // NUMERIC returned as string from Supabase
    amount: string; // NUMERIC returned as string from Supabase
    note: string | null;
};

/**
 * Supabase insert/update payload type.
 * Used for creating and updating activities.
 * All fields are optional to support partial updates.
 */
export type SupabaseActivityPayload = {
    product_id?: string | null;
    type?: string;
    date?: string;
    quantity?: number;
    amount?: number;
    note?: string | null;
};

/**
 * Supabase insert payload type.
 * Used for creating stock movements.
 * All fields are required for creation.
 */
export type SupabaseStockMovementPayload = {
    product_id: string;
    quantity: number;
    source: string;
};

/**
 * Supabase row type for stock_movements table.
 * Matches the database schema with snake_case column names.
 */
export type SupabaseStockMovementRow = {
    id: string;
    product_id: string;
    quantity: string; // NUMERIC returned as string from Supabase
    source: string;
};

