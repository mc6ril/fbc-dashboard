/**
 * Supabase implementation of `ProductRepository` (Infrastructure).
 * Maps Supabase types to domain types and propagates errors.
 */

import type {
    Product,
    ProductId,
    ProductModel,
    ProductModelId,
    ProductColoris,
    ProductColorisId,
} from "@/core/domain/product";
import { ProductType } from "@/core/domain/product";
import type { ProductRepository } from "@/core/ports/productRepository";
import { supabaseClient } from "./client";
import { parseValidNumber } from "@/shared/utils/number";
import type {
    SupabaseProductRow,
    SupabaseProductModelRow,
    SupabaseProductColorisRow,
    SupabaseProductPayload,
    SupabaseProductWithJoins,
} from "./types";

/**
 * Map Supabase row to domain Product.
 *
 * Converts:
 * - snake_case → camelCase (e.g., `unit_cost` → `unitCost`, `sale_price` → `salePrice`)
 * - NUMERIC strings → numbers (e.g., `"10.50"` → `10.50`)
 * - UUID → ProductId (branded type)
 * - UUID → ProductModelId, ProductColorisId (branded types)
 * - product_type enum → ProductType enum
 * - null weight → undefined weight
 *
 * Supports both new structure (modelId, colorisId) and old structure (name, type, coloris)
 * for backward compatibility during migration period (FBC-30).
 *
 * Note: `created_at` field is ignored as it's not part of the domain model.
 *
 * @param {SupabaseProductRow} row - Supabase row from database (may include joined fields)
 * @returns {Product} Domain product object
 * @throws {Error} If required fields are missing or invalid
 */
const mapSupabaseRowToProduct = (row: SupabaseProductRow): Product => {
    if (!row.id) {
        throw new Error("Product ID is required");
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
    const unitCost = parseValidNumber(row.unit_cost, "unit_cost");
    const salePrice = parseValidNumber(row.sale_price, "sale_price");
    const stock = parseValidNumber(row.stock, "stock");

    // Convert optional weight (null in database → undefined in domain)
    // Weight is now INT4 (integer grams) after migration 003
    let weight: number | undefined;
    if (row.weight !== null && row.weight !== undefined) {
        // Weight is already a number (INT4), but ensure it's valid
        weight = parseValidNumber(row.weight, "weight");
    }

    // Build product object with new structure (modelId, colorisId)
    const product: Product = {
        id: row.id as ProductId,
        unitCost,
        salePrice,
        stock,
        weight,
    };

    // Add modelId and colorisId if present (new structure)
    if (row.model_id) {
        product.modelId = row.model_id as ProductModelId;
    }
    if (row.coloris_id) {
        product.colorisId = row.coloris_id as ProductColorisId;
    }

    // Add name, type, coloris if present (backward compatibility or from joins)
    if (row.name) {
        product.name = row.name;
    }
    if (row.type) {
        // Validate ProductType enum
        if (!Object.values(ProductType).includes(row.type as ProductType)) {
            throw new Error(`Invalid product type: ${row.type}`);
        }
        product.type = row.type as ProductType;
    }
    if (row.coloris) {
        product.coloris = row.coloris;
    }

    return product;
};

/**
 * Map domain Product to Supabase insert/update payload.
 *
 * Converts:
 * - camelCase → snake_case (e.g., `unitCost` → `unit_cost`, `salePrice` → `sale_price`)
 * - camelCase → snake_case (e.g., `modelId` → `model_id`, `colorisId` → `coloris_id`)
 * - numbers → NUMERIC/INT4 (Supabase handles conversion)
 * - ProductType enum → product_type enum (Supabase handles conversion)
 * - undefined weight → null weight
 *
 * For partial updates (Partial<Product>), only includes fields that are explicitly provided.
 * For create operations (Omit<Product, 'id'>), all required fields must be present.
 *
 * Prioritizes new structure (modelId, colorisId) over old structure (name, type, coloris)
 * for backward compatibility during migration period (FBC-30).
 *
 * @param {Omit<Product, 'id'> | Partial<Product>} product - Domain product object (without id for create, partial for update)
 * @returns {SupabaseProductPayload} Supabase payload object with only provided fields
 */
const mapProductToSupabaseRow = (
    product: Omit<Product, "id"> | Partial<Product>
): SupabaseProductPayload => {
    const payload: SupabaseProductPayload = {};

    // Prioritize new structure (modelId, colorisId) over old structure (name, type, coloris)
    if ("modelId" in product && product.modelId !== undefined) {
        payload.model_id = product.modelId;
    }

    if ("colorisId" in product && product.colorisId !== undefined) {
        payload.coloris_id = product.colorisId;
    }

    // Include old structure fields for backward compatibility during migration
    // (only if new structure fields are not present)
    if (
        ("name" in product && product.name !== undefined) &&
        !payload.model_id
    ) {
        payload.name = product.name;
    }

    if (
        ("type" in product && product.type !== undefined) &&
        !payload.model_id
    ) {
        payload.type = product.type;
    }

    if (
        ("coloris" in product && product.coloris !== undefined) &&
        !payload.coloris_id
    ) {
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

    // Handle optional weight (INT4 in database, null if undefined)
    if ("weight" in product) {
        payload.weight = product.weight ?? null;
    }

    return payload;
};

/**
 * Map Supabase row to domain ProductModel.
 *
 * Converts:
 * - snake_case → camelCase (e.g., `model_id` → `modelId`)
 * - UUID → ProductModelId (branded type)
 * - product_type enum → ProductType enum
 *
 * @param {SupabaseProductModelRow} row - Supabase row from database
 * @returns {ProductModel} Domain product model object
 * @throws {Error} If required fields are missing or invalid
 */
const mapSupabaseRowToProductModel = (
    row: SupabaseProductModelRow
): ProductModel => {
    if (!row.id) {
        throw new Error("ProductModel ID is required");
    }

    if (!row.name) {
        throw new Error("ProductModel name is required");
    }

    if (!row.type) {
        throw new Error("ProductModel type is required");
    }

    // Validate ProductType enum
    if (!Object.values(ProductType).includes(row.type as ProductType)) {
        throw new Error(`Invalid product type: ${row.type}`);
    }

    return {
        id: row.id as ProductModelId,
        type: row.type as ProductType,
        name: row.name,
    };
};

/**
 * Map Supabase row to domain ProductColoris.
 *
 * Converts:
 * - snake_case → camelCase (e.g., `model_id` → `modelId`)
 * - UUID → ProductColorisId, ProductModelId (branded types)
 *
 * @param {SupabaseProductColorisRow} row - Supabase row from database
 * @returns {ProductColoris} Domain product coloris object
 * @throws {Error} If required fields are missing or invalid
 */
const mapSupabaseRowToProductColoris = (
    row: SupabaseProductColorisRow
): ProductColoris => {
    if (!row.id) {
        throw new Error("ProductColoris ID is required");
    }

    if (!row.model_id) {
        throw new Error("ProductColoris model_id is required");
    }

    if (!row.coloris) {
        throw new Error("ProductColoris coloris is required");
    }

    return {
        id: row.id as ProductColorisId,
        modelId: row.model_id as ProductModelId,
        coloris: row.coloris,
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

/** Concrete `ProductRepository` using Supabase. */
export const productRepositorySupabase: ProductRepository = {
    /**
     * List all products.
     *
     * Retrieves all products from Supabase with joins to reference tables
     * (product_models and product_coloris) and maps them to domain types.
     * Returns an empty array if no products exist.
     *
     * Joins include model name, type, and coloris for backward compatibility
     * during migration period (FBC-30).
     *
     * @returns {Promise<Product[]>} Promise resolving to an array of all products
     * @throws {Error} If the data retrieval fails
     */
    list: async (): Promise<Product[]> => {
        const { data, error } = await supabaseClient
            .from("products")
            .select(`
                *,
                product_models(name, type),
                product_coloris(coloris)
            `);

        if (error) {
            throw transformSupabaseError(error);
        }

        if (!data) {
            return [];
        }

        // Map all rows to domain types, including joined fields
        return data.map((row: SupabaseProductWithJoins) => {
            const productRow: SupabaseProductRow = {
                ...row,
                model_id: row.model_id,
                coloris_id: row.coloris_id,
                name: row.product_models?.name,
                type: row.product_models?.type,
                coloris: row.product_coloris?.coloris,
            };
            return mapSupabaseRowToProduct(productRow);
        });
    },

    /**
     * Get a single product by its ID.
     *
     * Retrieves a product with the specified ID from Supabase with joins
     * to reference tables (product_models and product_coloris).
     * Returns null if the product does not exist.
     *
     * Joins include model name, type, and coloris for backward compatibility
     * during migration period (FBC-30).
     *
     * @param {ProductId} id - The unique identifier of the product to retrieve
     * @returns {Promise<Product | null>} Promise resolving to the product if found, or null if not found
     * @throws {Error} If the data retrieval fails
     */
    getById: async (id: ProductId): Promise<Product | null> => {
        const { data, error } = await supabaseClient
            .from("products")
            .select(`
                *,
                product_models!inner(name, type),
                product_coloris!inner(coloris)
            `)
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

        const productData = data as SupabaseProductWithJoins;
        const productRow: SupabaseProductRow = {
            ...productData,
            model_id: productData.model_id,
            coloris_id: productData.coloris_id,
            name: productData.product_models?.name,
            type: productData.product_models?.type,
            coloris: productData.product_coloris?.coloris,
        };

        return mapSupabaseRowToProduct(productRow);
    },

    /**
     * Create a new product.
     *
     * Creates a new product in Supabase and returns the created product
     * with its generated ID. Joins with reference tables to return model
     * name, type, and coloris for backward compatibility during migration period (FBC-30).
     *
     * Accepts both new structure (modelId, colorisId) and old structure
     * (name, type, coloris) for backward compatibility during migration period (FBC-30).
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
            .select(`
                *,
                product_models(name, type),
                product_coloris(coloris)
            `)
            .single();

        if (error) {
            throw transformSupabaseError(error);
        }

        if (!data) {
            throw new Error("Product creation failed: No data returned");
        }

        const productData = data as SupabaseProductWithJoins;
        const productRow: SupabaseProductRow = {
            ...productData,
            model_id: productData.model_id,
            coloris_id: productData.coloris_id,
            name: productData.product_models?.name,
            type: productData.product_models?.type,
            coloris: productData.product_coloris?.coloris,
        };

        return mapSupabaseRowToProduct(productRow);
    },

    /**
     * Update an existing product.
     *
     * Updates a product with the specified ID in Supabase.
     * Only the provided fields will be updated.
     *
     * Accepts both new structure (modelId, colorisId) and old structure
     * (name, type, coloris) for backward compatibility during migration period (FBC-30).
     * Joins with reference tables to return model name, type, and coloris.
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
            .select(`
                *,
                product_models!inner(name, type),
                product_coloris!inner(coloris)
            `)
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

        const productData = data as SupabaseProductWithJoins;
        const productRow: SupabaseProductRow = {
            ...productData,
            model_id: productData.model_id,
            coloris_id: productData.coloris_id,
            name: productData.product_models?.name,
            type: productData.product_models?.type,
            coloris: productData.product_coloris?.coloris,
        };

        return mapSupabaseRowToProduct(productRow);
    },

    /**
     * List all product models for a specific product type.
     *
     * Retrieves all product models that belong to the specified product type.
     * Returns an empty array if no models exist for the given type.
     *
     * @param {ProductType} type - The product type to filter models by
     * @returns {Promise<ProductModel[]>} Promise resolving to an array of product models for the specified type
     * @throws {Error} If the data retrieval fails
     */
    listModelsByType: async (type: ProductType): Promise<ProductModel[]> => {
        const { data, error } = await supabaseClient
            .from("product_models")
            .select()
            .eq("type", type);

        if (error) {
            throw transformSupabaseError(error);
        }

        if (!data) {
            return [];
        }

        return data.map((row) =>
            mapSupabaseRowToProductModel(row as SupabaseProductModelRow)
        );
    },

    /**
     * List all coloris (color variations) for a specific product model.
     *
     * Retrieves all product coloris that belong to the specified product model.
     * Returns an empty array if no coloris exist for the given model.
     *
     * @param {ProductModelId} modelId - The unique identifier of the product model to filter coloris by
     * @returns {Promise<ProductColoris[]>} Promise resolving to an array of product coloris for the specified model
     * @throws {Error} If the data retrieval fails
     */
    listColorisByModel: async (
        modelId: ProductModelId
    ): Promise<ProductColoris[]> => {
        const { data, error } = await supabaseClient
            .from("product_coloris")
            .select()
            .eq("model_id", modelId);

        if (error) {
            throw transformSupabaseError(error);
        }

        if (!data) {
            return [];
        }

        return data.map((row) =>
            mapSupabaseRowToProductColoris(row as SupabaseProductColorisRow)
        );
    },

    /**
     * Get a single product model by its ID.
     *
     * Retrieves a product model with the specified ID from Supabase.
     * Returns null if the model does not exist.
     *
     * @param {ProductModelId} id - The unique identifier of the product model to retrieve
     * @returns {Promise<ProductModel | null>} Promise resolving to the product model if found, or null if not found
     * @throws {Error} If the data retrieval fails
     */
    getModelById: async (id: ProductModelId): Promise<ProductModel | null> => {
        const { data, error } = await supabaseClient
            .from("product_models")
            .select()
            .eq("id", id)
            .single();

        if (error) {
            // Supabase returns an error when no row is found (PGRST116)
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

        return mapSupabaseRowToProductModel(data as SupabaseProductModelRow);
    },

    /**
     * Get a single product coloris by its ID.
     *
     * Retrieves a product coloris with the specified ID from Supabase.
     * Returns null if the coloris does not exist.
     *
     * @param {ProductColorisId} id - The unique identifier of the product coloris to retrieve
     * @returns {Promise<ProductColoris | null>} Promise resolving to the product coloris if found, or null if not found
     * @throws {Error} If the data retrieval fails
     */
    getColorisById: async (
        id: ProductColorisId
    ): Promise<ProductColoris | null> => {
        const { data, error } = await supabaseClient
            .from("product_coloris")
            .select()
            .eq("id", id)
            .single();

        if (error) {
            // Supabase returns an error when no row is found (PGRST116)
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

        return mapSupabaseRowToProductColoris(data as SupabaseProductColorisRow);
    },

    /**
     * Atomically update product stock by adding a quantity delta.
     *
     * Uses a PostgreSQL RPC function to perform an atomic database-level update,
     * preventing race conditions when multiple activities update the same product
     * stock concurrently.
     *
     * @param {ProductId} id - The unique identifier of the product to update
     * @param {number} quantityDelta - The quantity to add to the current stock
     * @returns Promise resolving to the new stock value after the update
     * @throws {Error} If the product does not exist or update fails
     */
    updateStockAtomically: async (id: ProductId, quantityDelta: number): Promise<number> => {
        const { data, error } = await supabaseClient.rpc("update_product_stock", {
            p_product_id: id,
            p_quantity_delta: quantityDelta,
        });

        if (error) {
            // Transform Supabase error to domain error
            if (
                typeof error === "object" &&
                error !== null &&
                "message" in error &&
                typeof error.message === "string" &&
                error.message.includes("not found")
            ) {
                throw new Error(`Product with id ${id} not found`);
            }
            throw transformSupabaseError(error);
        }

        if (data === null || data === undefined) {
            throw new Error(`Product with id ${id} not found`);
        }

        // Parse the returned NUMERIC string to number
        return parseValidNumber(String(data), "stock");
    },
};

