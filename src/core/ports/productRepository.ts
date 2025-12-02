/**
 * Product Repository Port Interface (Domain → Ports).
 * Contract only: returns domain types, throws errors on failure.
 */

import type {
    Product,
    ProductId,
    ProductModel,
    ProductModelId,
    ProductColoris,
    ProductColorisId,
} from "../domain/product";
import { ProductType } from "../domain/product";

// Note: Errors are referenced in JSDoc @throws tags but not imported
// as TypeScript doesn't type thrown exceptions. The error contract is
// documented in method JSDoc comments.

/**
 * Product operations contract.
 *
 * This interface defines the contract for product data access operations.
 * Implementations must provide methods for listing, retrieving, creating,
 * and updating products. All methods return domain types and throw errors
 * on failure.
 */
export interface ProductRepository {
    /**
     * List all products.
     *
     * Retrieves all products from the data store. Returns an empty array
     * if no products exist.
     *
     * @returns Promise resolving to an array of all products
     * @throws {Error} If the data retrieval fails (e.g., database connection error, query error)
     */
    list(): Promise<Product[]>;

    /**
     * Get a single product by its ID.
     *
     * Retrieves a product with the specified ID. Returns null if the product
     * does not exist.
     *
     * @param {ProductId} id - The unique identifier of the product to retrieve
     * @returns Promise resolving to the product if found, or null if not found
     * @throws {Error} If the data retrieval fails (e.g., database connection error, query error)
     */
    getById(id: ProductId): Promise<Product | null>;

    /**
     * Create a new product.
     *
     * Creates a new product in the data store. The product ID will be generated
     * by the implementation (typically by the database). The created product with
     * its generated ID is returned.
     *
     * Business rules enforced by implementations:
     * - unitCost must be positive (greater than 0)
     * - salePrice must be positive (greater than 0)
     * - stock must be non-negative (greater than or equal to 0)
     * - modelId must reference a valid ProductModel
     * - colorisId must reference a valid ProductColoris that belongs to the model
     * - The coloris must belong to the model (enforced by foreign key chain)
     * - weight must be positive (greater than 0) if provided (optional field, in grams)
     *
     * During the migration period (FBC-30), implementations may accept either:
     * - New structure: `modelId` and `colorisId` (mandatory)
     * - Old structure: `name`, `type`, and `coloris` (deprecated, for backward compatibility)
     *
     * @param {Omit<Product, 'id'>} product - The product data to create (without the id field). Must include either (modelId, colorisId) or (name, type, coloris) during migration period.
     * @returns Promise resolving to the created product with its generated ID
     * @throws {Error} If validation fails (e.g., missing required fields, invalid data, negative prices, negative stock, invalid model/coloris combination)
     * @throws {Error} If the creation fails (e.g., database connection error, constraint violation, foreign key violation)
     */
    create(product: Omit<Product, "id">): Promise<Product>;

    /**
     * Update an existing product.
     *
     * Updates a product with the specified ID. Only the provided fields will be
     * updated; omitted fields remain unchanged. Returns the updated product.
     *
     * Business rules enforced by implementations:
     * - If unitCost is updated, it must be positive (greater than 0)
     * - If salePrice is updated, it must be positive (greater than 0)
     * - If stock is updated, it must be non-negative (greater than or equal to 0)
     * - If modelId is updated, it must reference a valid ProductModel
     * - If colorisId is updated, it must reference a valid ProductColoris that belongs to the model
     * - If both modelId and colorisId are updated, the coloris must belong to the new model
     * - If only colorisId is updated, the coloris must belong to the product's current model
     * - If weight is updated, it must be positive (greater than 0) if provided (in grams)
     *
     * During the migration period (FBC-30), implementations may accept updates to either:
     * - New structure: `modelId` and `colorisId`
     * - Old structure: `name`, `type`, and `coloris` (deprecated, for backward compatibility)
     *
     * @param {ProductId} id - The unique identifier of the product to update
     * @param {Partial<Product>} updates - The fields to update (partial product object). May include modelId/colorisId or name/type/coloris during migration period.
     * @returns Promise resolving to the updated product
     * @throws {Error} If the product with the given ID does not exist
     * @throws {Error} If validation fails (e.g., invalid data in updates, negative prices, negative stock, invalid model/coloris combination)
     * @throws {Error} If the update fails (e.g., database connection error, constraint violation, foreign key violation)
     */
    update(id: ProductId, updates: Partial<Product>): Promise<Product>;

    /**
     * List all product models for a specific product type.
     *
     * Retrieves all product models that belong to the specified product type.
     * Returns an empty array if no models exist for the given type.
     *
     * This method is used to populate cascading dropdowns in forms where users
     * first select a product type, then select a model for that type.
     *
     * @param {ProductType} type - The product type to filter models by
     * @returns Promise resolving to an array of product models for the specified type
     * @throws {Error} If the data retrieval fails (e.g., database connection error, query error)
     *
     * @example
     * ```typescript
     * const models = await repo.listModelsByType(ProductType.POCHETTE_VOLANTS);
     * // Returns: [{ id: "...", type: POCHETTE_VOLANTS, name: "Charlie" }, ...]
     * ```
     */
    listModelsByType(type: ProductType): Promise<ProductModel[]>;

    /**
     * List all coloris (color variations) for a specific product model.
     *
     * Retrieves all product coloris that belong to the specified product model.
     * Returns an empty array if no coloris exist for the given model.
     *
     * This method is used to populate cascading dropdowns in forms where users
     * first select a product type, then a model, then a coloris for that model.
     *
     * @param {ProductModelId} modelId - The unique identifier of the product model to filter coloris by
     * @returns Promise resolving to an array of product coloris for the specified model
     * @throws {Error} If the data retrieval fails (e.g., database connection error, query error)
     *
     * @example
     * ```typescript
     * const coloris = await repo.listColorisByModel(charlieModelId);
     * // Returns: [{ id: "...", modelId: charlieModelId, coloris: "Rose Marsala" }, ...]
     * ```
     */
    listColorisByModel(modelId: ProductModelId): Promise<ProductColoris[]>;

    /**
     * Get a single product model by its ID.
     *
     * Retrieves a product model with the specified ID. Returns null if the model
     * does not exist.
     *
     * This method is used to validate model references and retrieve model details
     * for business logic validation (e.g., verifying a coloris belongs to a model).
     *
     * @param {ProductModelId} id - The unique identifier of the product model to retrieve
     * @returns Promise resolving to the product model if found, or null if not found
     * @throws {Error} If the data retrieval fails (e.g., database connection error, query error)
     *
     * @example
     * ```typescript
     * const model = await repo.getModelById(charlieModelId);
     * if (model) {
     *   console.log(`Model: ${model.name} (${model.type})`);
     * }
     * ```
     */
    getModelById(id: ProductModelId): Promise<ProductModel | null>;

    /**
     * Get a single product coloris by its ID.
     *
     * Retrieves a product coloris with the specified ID. Returns null if the coloris
     * does not exist.
     *
     * This method is used to validate coloris references and retrieve coloris details
     * for business logic validation (e.g., verifying a coloris belongs to a specific model).
     *
     * @param {ProductColorisId} id - The unique identifier of the product coloris to retrieve
     * @returns Promise resolving to the product coloris if found, or null if not found
     * @throws {Error} If the data retrieval fails (e.g., database connection error, query error)
     *
     * @example
     * ```typescript
     * const coloris = await repo.getColorisById(roseMarsalaColorisId);
     * if (coloris) {
     *   console.log(`Coloris: ${coloris.coloris} (Model: ${coloris.modelId})`);
     * }
     * ```
     */
    getColorisById(id: ProductColorisId): Promise<ProductColoris | null>;

    /**
     * Atomically update product stock by adding a quantity delta.
     *
     * This method performs an atomic database-level update to prevent race conditions
     * when multiple activities are created concurrently for the same product. The stock
     * is updated by adding the quantity delta to the current stock, and the result is
     * clamped to ensure stock never goes below 0.
     *
     * This is the recommended method for updating stock from activities, as it ensures
     * data consistency in concurrent scenarios.
     *
     * @param {ProductId} id - The unique identifier of the product to update
     * @param {number} quantityDelta - The quantity to add to the current stock (can be positive or negative)
     * @returns Promise resolving to the new stock value after the update
     * @throws {Error} If the product with the given ID does not exist
     * @throws {Error} If the update fails (e.g., database connection error, query error)
     *
     * @example
     * ```typescript
     * // Increase stock by 10
     * const newStock = await repo.updateStockAtomically(productId, 10);
     * // Returns: 25 (if previous stock was 15)
     *
     * // Decrease stock by 5
     * const newStock = await repo.updateStockAtomically(productId, -5);
     * // Returns: 20 (if previous stock was 25)
     *
     * // Stock is clamped to 0 minimum
     * const newStock = await repo.updateStockAtomically(productId, -100);
     * // Returns: 0 (even if previous stock was 15)
     * ```
     */
    updateStockAtomically(id: ProductId, quantityDelta: number): Promise<number>;
}

