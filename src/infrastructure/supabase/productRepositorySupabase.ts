/**
 * Supabase implementation of `ProductRepository` (Infrastructure).
 * Maps Supabase types to domain types and propagates errors.
 */

import { supabaseClient } from "./client";
import type { ProductRepository } from "@/core/ports/productRepository";
import type { Product, ProductId } from "@/core/domain/product";
import { ProductType } from "@/core/domain/product";

/**
 * Supabase row type for products table.
 * Matches the database schema with snake_case column names.
 */
type SupabaseProductRow = {
    id: string;
    name: string;
    type: string;
    coloris: string;
    unit_cost: string; // NUMERIC returned as string from Supabase
    sale_price: string; // NUMERIC returned as string from Supabase
    stock: string; // NUMERIC returned as string from Supabase
    weight: string | null; // NUMERIC returned as string from Supabase, nullable
    created_at: string; // Not in domain, but present in DB
};

/**
 * Supabase insert/update payload type.
 * Used for creating and updating products.
 * All fields are optional to support partial updates.
 */
type SupabaseProductPayload = {
    name?: string;
    type?: string;
    coloris?: string;
    unit_cost?: number;
    sale_price?: number;
    stock?: number;
    weight?: number | null;
};

/**
 * Map Supabase row to domain Product.
 *
 * Converts:
 * - snake_case → camelCase (e.g., `unit_cost` → `unitCost`, `sale_price` → `salePrice`)
 * - NUMERIC strings → numbers (e.g., `"10.50"` → `10.50`)
 * - UUID → ProductId (branded type)
 * - TEXT enum → ProductType enum
 * - null weight → undefined weight
 *
 * Note: `created_at` field is ignored as it's not part of the domain model.
 *
 * @param {SupabaseProductRow} row - Supabase row from database
 * @returns {Product} Domain product object
 * @throws {Error} If required fields are missing or invalid
 */
const mapSupabaseRowToProduct = (row: SupabaseProductRow): Product => {
    if (!row.id) {
        throw new Error("Product ID is required");
    }

    if (!row.name) {
        throw new Error("Product name is required");
    }

    if (!row.type) {
        throw new Error("Product type is required");
    }

    if (!row.coloris) {
        throw new Error("Product coloris is required");
    }

    if (row.unit_cost === undefined || row.unit_cost === null) {
        throw new Error("Product unit_cost is required");
    }

    if (row.sale_price === undefined || row.sale_price === null) {
        throw new Error("Product sale_price is required");
    }

    if (row.stock === undefined || row.stock === null) {
        throw new Error("Product stock is required");
    }

    // Convert NUMERIC strings to numbers
    const unitCost = parseFloat(row.unit_cost);
    if (isNaN(unitCost)) {
        throw new Error(`Invalid unit_cost value: ${row.unit_cost}`);
    }

    const salePrice = parseFloat(row.sale_price);
    if (isNaN(salePrice)) {
        throw new Error(`Invalid sale_price value: ${row.sale_price}`);
    }

    const stock = parseFloat(row.stock);
    if (isNaN(stock)) {
        throw new Error(`Invalid stock value: ${row.stock}`);
    }

    // Convert optional weight (null in database → undefined in domain)
    let weight: number | undefined;
    if (row.weight !== null && row.weight !== undefined) {
        const weightValue = parseFloat(row.weight);
        if (isNaN(weightValue)) {
            throw new Error(`Invalid weight value: ${row.weight}`);
        }
        weight = weightValue;
    }

    // Validate ProductType enum
    if (!Object.values(ProductType).includes(row.type as ProductType)) {
        throw new Error(`Invalid product type: ${row.type}`);
    }

    return {
        id: row.id as ProductId,
        name: row.name,
        type: row.type as ProductType,
        coloris: row.coloris,
        unitCost,
        salePrice,
        stock,
        weight,
    };
};

/**
 * Map domain Product to Supabase insert/update payload.
 *
 * Converts:
 * - camelCase → snake_case (e.g., `unitCost` → `unit_cost`, `salePrice` → `sale_price`)
 * - numbers → NUMERIC (Supabase handles conversion)
 * - ProductType enum → TEXT (Supabase handles conversion)
 * - undefined weight → null weight
 *
 * For partial updates (Partial<Product>), only includes fields that are explicitly provided.
 * For create operations (Omit<Product, 'id'>), all required fields must be present.
 *
 * @param {Omit<Product, 'id'> | Partial<Product>} product - Domain product object (without id for create, partial for update)
 * @returns {SupabaseProductPayload} Supabase payload object with only provided fields
 */
const mapProductToSupabaseRow = (
    product: Omit<Product, "id"> | Partial<Product>
): SupabaseProductPayload => {
    const payload: SupabaseProductPayload = {};

    // Only include fields that are explicitly provided in the product object
    if ("name" in product && product.name !== undefined) {
        payload.name = product.name;
    }

    if ("type" in product && product.type !== undefined) {
        payload.type = product.type;
    }

    if ("coloris" in product && product.coloris !== undefined) {
        payload.coloris = product.coloris;
    }

    if ("unitCost" in product && product.unitCost !== undefined) {
        payload.unit_cost = product.unitCost;
    }

    if ("salePrice" in product && product.salePrice !== undefined) {
        payload.sale_price = product.salePrice;
    }

    if ("stock" in product && product.stock !== undefined) {
        payload.stock = product.stock;
    }

    // Handle optional weight (null in database if undefined)
    if ("weight" in product) {
        payload.weight = product.weight ?? null;
    }

    return payload;
};

/**
 * Transform Supabase error to generic Error.
 *
 * Preserves error message for debugging while converting to standard Error type.
 *
 * @param {unknown} error - Supabase error object
 * @returns {Error} Generic Error object with message
 */
const transformSupabaseError = (error: unknown): Error => {
    if (error instanceof Error) {
        return error;
    }

    if (
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof error.message === "string"
    ) {
        return new Error(error.message);
    }

    return new Error("An unknown error occurred");
};

/** Concrete `ProductRepository` using Supabase. */
export const productRepositorySupabase: ProductRepository = {
    /**
     * List all products.
     *
     * Retrieves all products from Supabase and maps them to domain types.
     * Returns an empty array if no products exist.
     *
     * @returns {Promise<Product[]>} Promise resolving to an array of all products
     * @throws {Error} If the data retrieval fails
     */
    list: async (): Promise<Product[]> => {
        const { data, error } = await supabaseClient.from("products").select();

        if (error) {
            throw transformSupabaseError(error);
        }

        if (!data) {
            return [];
        }

        // Map all rows to domain types
        return data.map((row) => mapSupabaseRowToProduct(row as SupabaseProductRow));
    },

    /**
     * Get a single product by its ID.
     *
     * Retrieves a product with the specified ID from Supabase.
     * Returns null if the product does not exist.
     *
     * @param {ProductId} id - The unique identifier of the product to retrieve
     * @returns {Promise<Product | null>} Promise resolving to the product if found, or null if not found
     * @throws {Error} If the data retrieval fails
     */
    getById: async (id: ProductId): Promise<Product | null> => {
        const { data, error } = await supabaseClient
            .from("products")
            .select()
            .eq("id", id)
            .single();

        if (error) {
            // Supabase returns an error when no row is found (PGRST116)
            // Check if it's a "not found" error and return null
            if (
                typeof error === "object" &&
                error !== null &&
                "code" in error &&
                error.code === "PGRST116"
            ) {
                return null;
            }

            throw transformSupabaseError(error);
        }

        if (!data) {
            return null;
        }

        return mapSupabaseRowToProduct(data as SupabaseProductRow);
    },

    /**
     * Create a new product.
     *
     * Creates a new product in Supabase and returns the created product
     * with its generated ID.
     *
     * @param {Omit<Product, 'id'>} product - The product data to create (without the id field)
     * @returns {Promise<Product>} Promise resolving to the created product with its generated ID
     * @throws {Error} If validation fails or creation fails
     */
    create: async (product: Omit<Product, "id">): Promise<Product> => {
        const payload = mapProductToSupabaseRow(product);

        const { data, error } = await supabaseClient
            .from("products")
            .insert(payload)
            .select()
            .single();

        if (error) {
            throw transformSupabaseError(error);
        }

        if (!data) {
            throw new Error("Product creation failed: No data returned");
        }

        return mapSupabaseRowToProduct(data as SupabaseProductRow);
    },

    /**
     * Update an existing product.
     *
     * Updates a product with the specified ID in Supabase.
     * Only the provided fields will be updated.
     *
     * @param {ProductId} id - The unique identifier of the product to update
     * @param {Partial<Product>} updates - The fields to update (partial product object)
     * @returns {Promise<Product>} Promise resolving to the updated product
     * @throws {Error} If the product with the given ID does not exist or update fails
     */
    update: async (id: ProductId, updates: Partial<Product>): Promise<Product> => {
        const payload = mapProductToSupabaseRow(updates);

        const { data, error } = await supabaseClient
            .from("products")
            .update(payload)
            .eq("id", id)
            .select()
            .single();

        if (error) {
            // Supabase returns an error when no row is found (PGRST116)
            if (
                typeof error === "object" &&
                error !== null &&
                "code" in error &&
                error.code === "PGRST116"
            ) {
                throw new Error(`Product with id ${id} not found`);
            }

            throw transformSupabaseError(error);
        }

        if (!data) {
            throw new Error(`Product with id ${id} not found`);
        }

        return mapSupabaseRowToProduct(data as SupabaseProductRow);
    },
};

