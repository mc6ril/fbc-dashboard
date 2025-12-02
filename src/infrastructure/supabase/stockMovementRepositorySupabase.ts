/**
 * Supabase implementation of `StockMovementRepository` (Infrastructure).
 * Maps Supabase types to domain types and propagates errors.
 */

import { supabaseClient } from "./client";
import type { StockMovementRepository } from "@/core/ports/stockMovementRepository";
import type { StockMovement, StockMovementId } from "@/core/domain/stockMovement";
import type { ProductId } from "@/core/domain/product";
import { SupabaseStockMovementPayload, SupabaseStockMovementRow } from "./types";
import { parseValidNumber } from "@/shared/utils/number";



/**
 * Map Supabase row to domain StockMovement.
 *
 * Converts:
 * - snake_case → camelCase (e.g., `product_id` → `productId`)
 * - NUMERIC strings → numbers (e.g., `"10.50"` → `10.50`)
 * - UUID → StockMovementId (branded type)
 * - source string → StockMovementSource enum
 *
 * @param {SupabaseStockMovementRow} row - Supabase row from database
 * @returns {StockMovement} Domain stock movement object
 * @throws {Error} If required fields are missing or invalid
 */
const mapSupabaseRowToStockMovement = (row: SupabaseStockMovementRow): StockMovement => {
    if (!row.id) {
        throw new Error("Stock movement ID is required");
    }

    if (!row.product_id) {
        throw new Error("Stock movement product_id is required");
    }

    if (row.quantity === undefined || row.quantity === null) {
        throw new Error("Stock movement quantity is required");
    }

    if (!row.source) {
        throw new Error("Stock movement source is required");
    }

    // Convert NUMERIC string to number
    const quantity = parseValidNumber(row.quantity, "quantity");

    // Validate source is a valid StockMovementSource
    const validSources = ["CREATION", "SALE", "INVENTORY_ADJUSTMENT"];
    if (!validSources.includes(row.source)) {
        throw new Error(`Invalid source value: ${row.source}`);
    }

    return {
        id: row.id as StockMovementId,
        productId: row.product_id as ProductId,
        quantity,
        source: row.source as StockMovement["source"],
    };
};

/**
 * Map domain StockMovement to Supabase insert payload.
 *
 * Converts:
 * - camelCase → snake_case (e.g., `productId` → `product_id`)
 * - numbers → NUMERIC (Supabase handles conversion)
 * - StockMovementSource enum → string
 *
 * @param {Omit<StockMovement, 'id'>} movement - Domain stock movement object (without id field)
 * @returns {SupabaseStockMovementPayload} Supabase payload object
 */
const mapStockMovementToSupabaseRow = (
    movement: Omit<StockMovement, "id">
): SupabaseStockMovementPayload => {
    return {
        product_id: movement.productId,
        quantity: movement.quantity,
        source: movement.source,
    };
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

/** Concrete `StockMovementRepository` using Supabase. */
export const stockMovementRepositorySupabase: StockMovementRepository = {
    /**
     * List all stock movements.
     *
     * Retrieves all stock movements from Supabase and maps them to domain types.
     * Returns an empty array if no movements exist.
     *
     * @returns {Promise<StockMovement[]>} Promise resolving to an array of all stock movements
     * @throws {Error} If the data retrieval fails
     */
    list: async (): Promise<StockMovement[]> => {
        const { data, error } = await supabaseClient.from("stock_movements").select();

        if (error) {
            throw transformSupabaseError(error);
        }

        if (!data) {
            return [];
        }

        // Map all rows to domain types
        return data.map((row) => mapSupabaseRowToStockMovement(row as SupabaseStockMovementRow));
    },

    /**
     * Get a single stock movement by its ID.
     *
     * Retrieves a stock movement with the specified ID from Supabase.
     * Returns null if the movement does not exist.
     *
     * @param {StockMovementId} id - The unique identifier of the stock movement to retrieve
     * @returns {Promise<StockMovement | null>} Promise resolving to the stock movement if found, or null if not found
     * @throws {Error} If the data retrieval fails
     */
    getById: async (id: StockMovementId): Promise<StockMovement | null> => {
        const { data, error } = await supabaseClient
            .from("stock_movements")
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

        return mapSupabaseRowToStockMovement(data as SupabaseStockMovementRow);
    },

    /**
     * List all stock movements for a specific product.
     *
     * Retrieves all stock movements associated with the specified product ID from Supabase.
     * Returns an empty array if no movements exist for the product.
     *
     * @param {ProductId} productId - The unique identifier of the product to retrieve movements for
     * @returns {Promise<StockMovement[]>} Promise resolving to an array of stock movements for the specified product
     * @throws {Error} If the data retrieval fails
     */
    listByProduct: async (productId: ProductId): Promise<StockMovement[]> => {
        const { data, error } = await supabaseClient
            .from("stock_movements")
            .select()
            .eq("product_id", productId);

        if (error) {
            throw transformSupabaseError(error);
        }

        if (!data) {
            return [];
        }

        // Map all rows to domain types
        return data.map((row) => mapSupabaseRowToStockMovement(row as SupabaseStockMovementRow));
    },

    /**
     * Create a new stock movement.
     *
     * Creates a new stock movement in Supabase and returns the created movement
     * with its generated ID.
     *
     * @param {Omit<StockMovement, 'id'>} movement - The stock movement data to create (without the id field)
     * @returns {Promise<StockMovement>} Promise resolving to the created stock movement with its generated ID
     * @throws {Error} If validation fails or creation fails
     */
    create: async (movement: Omit<StockMovement, "id">): Promise<StockMovement> => {
        const payload = mapStockMovementToSupabaseRow(movement);

        const { data, error } = await supabaseClient
            .from("stock_movements")
            .insert(payload)
            .select()
            .single();

        if (error) {
            throw transformSupabaseError(error);
        }

        if (!data) {
            throw new Error("Stock movement creation failed: No data returned");
        }

        return mapSupabaseRowToStockMovement(data as SupabaseStockMovementRow);
    },
};

