/**
 * Product Repository Port Interface (Domain → Ports).
 * Contract only: returns domain types, throws errors on failure.
 */

import type { Product, ProductId } from "../domain/product";

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
     * - type must be a valid ProductType enum value
     * - coloris must be a non-empty string
     * - name must be a non-empty string
     * - weight must be positive (greater than 0) if provided (optional field)
     *
     * @param {Omit<Product, 'id'>} product - The product data to create (without the id field)
     * @returns Promise resolving to the created product with its generated ID
     * @throws {Error} If validation fails (e.g., missing required fields, invalid data, negative prices, negative stock)
     * @throws {Error} If the creation fails (e.g., database connection error, constraint violation)
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
     * - If type is updated, it must be a valid ProductType enum value
     * - If coloris is updated, it must be a non-empty string
     * - If name is updated, it must be a non-empty string
     * - If weight is updated, it must be positive (greater than 0) if provided
     *
     * @param {ProductId} id - The unique identifier of the product to update
     * @param {Partial<Product>} updates - The fields to update (partial product object)
     * @returns Promise resolving to the updated product
     * @throws {Error} If the product with the given ID does not exist
     * @throws {Error} If validation fails (e.g., invalid data in updates, negative prices, negative stock)
     * @throws {Error} If the update fails (e.g., database connection error, constraint violation)
     */
    update(id: ProductId, updates: Partial<Product>): Promise<Product>;
}

