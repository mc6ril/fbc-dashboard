/**
 * Product Usecases (Usecase layer).
 * Orchestrate validation and repository calls. Return domain types only.
 */

import type { ProductRepository } from "@/core/ports/productRepository";
import type { Product, ProductId } from "@/core/domain/product";
import { isValidProduct } from "@/core/domain/validation";

/**
 * Lists all products.
 *
 * This usecase retrieves all products from the repository without any filtering.
 * Returns all products in the order returned by the repository.
 *
 * @param {ProductRepository} repo - Product repository for data retrieval
 * @returns {Promise<Product[]>} Promise resolving to an array of all products, or empty array if none exist
 * @throws {Error} If repository retrieval fails (database connection error, query error, etc.)
 *
 * @example
 * ```typescript
 * // List all products
 * const products = await listProducts(productRepository);
 * // Returns: [Product, Product, ...] or []
 * ```
 */
export const listProducts = async (repo: ProductRepository): Promise<Product[]> => {
    return repo.list();
};

/**
 * Lists products with low stock levels.
 *
 * This usecase filters products based on a stock threshold to identify
 * products that need restocking. The threshold represents the minimum
 * acceptable stock level below which a product is considered "low stock".
 *
 * Business rules:
 * - A product is considered low stock if its stock level is strictly less than the threshold
 * - Stock threshold defaults to 5 if not provided
 * - Products with stock equal to or greater than the threshold are excluded
 * - Returns all matching products in the order returned by the repository
 *
 * Performance considerations:
 * - Retrieves all products from the repository and filters in memory
 * - For large product catalogs, consider implementing threshold filtering at repository level
 * - The function is optimized for small to medium datasets (< 10,000 products)
 *
 * @param {ProductRepository} repo - Product repository for data retrieval
 * @param {number} [threshold=5] - Optional stock threshold (default: 5). Products with stock < threshold are returned.
 * @returns {Promise<Product[]>} Promise resolving to an array of products with stock below the threshold, or empty array if none exist
 * @throws {Error} If repository retrieval fails (database connection error, query error, etc.)
 *
 * @example
 * ```typescript
 * // List products with stock below default threshold (5)
 * const lowStockProducts = await listLowStockProducts(productRepository);
 * // Returns: [Product, Product, ...] or []
 *
 * // List products with stock below custom threshold (10)
 * const lowStockProducts = await listLowStockProducts(productRepository, 10);
 * // Returns: [Product, Product, ...] or []
 * ```
 */
export const listLowStockProducts = async (
    repo: ProductRepository,
    threshold: number = 5
): Promise<Product[]> => {
    // Retrieve all products
    const allProducts = await repo.list();

    // Filter products where stock < threshold
    const lowStockProducts = allProducts.filter((product) => product.stock < threshold);

    return lowStockProducts;
};

/**
 * Validates and creates a new product.
 *
 * This usecase validates business rules before delegating to the repository:
 * - Validates product data using domain validation (`isValidProduct`)
 * - Ensures all required fields are present
 * - Delegates to repository for persistence
 *
 * @param {ProductRepository} repo - Product repository for data persistence
 * @param {Omit<Product, 'id'>} product - Product data to create (without the id field)
 * @returns {Promise<Product>} Promise resolving to the created product with generated ID
 * @throws {Error} If validation fails (invalid data, missing required fields, negative prices, negative stock, invalid weight)
 * @throws {Error} If repository creation fails (database error, constraint violation, etc.)
 *
 * @example
 * ```typescript
 * const newProduct = {
 *   name: "Sac banane L'Assumée",
 *   type: ProductType.SAC_BANANE,
 *   coloris: "Rose pâle à motifs",
 *   unitCost: 10.5,
 *   salePrice: 19.99,
 *   stock: 100,
 *   weight: 150
 * };
 * const created = await createProduct(productRepository, newProduct);
 * ```
 */
export const createProduct = async (
    repo: ProductRepository,
    product: Omit<Product, "id">
): Promise<Product> => {
    // Create a temporary product with empty ID for validation
    const productWithId: Product = {
        ...product,
        id: "" as ProductId, // Temporary ID for validation
    };

    // Validate product using domain validation
    if (!isValidProduct(productWithId)) {
        throw new Error("Product validation failed");
    }

    // Delegate to repository
    return repo.create(product);
};

/**
 * Validates and updates an existing product.
 *
 * This usecase validates business rules before delegating to the repository:
 * - Retrieves existing product to verify it exists
 * - Merges updates with existing product data
 * - Validates merged product data using domain validation (`isValidProduct`)
 * - Delegates to repository for persistence
 *
 * The function first retrieves the existing product to merge updates with
 * the current state before validation.
 *
 * @param {ProductRepository} repo - Product repository for data persistence
 * @param {ProductId} id - Unique identifier of the product to update
 * @param {Partial<Product>} updates - Partial product object with fields to update
 * @returns {Promise<Product>} Promise resolving to the updated product
 * @throws {Error} If the product with the given ID does not exist
 * @throws {Error} If validation fails (invalid merged data, negative prices, negative stock, invalid weight)
 * @throws {Error} If repository update fails (database error, constraint violation, etc.)
 *
 * @example
 * ```typescript
 * const updates = {
 *   salePrice: 24.99,
 *   stock: 150
 * };
 * const updated = await updateProduct(productRepository, productId, updates);
 * ```
 */
/**
 * Retrieves a single product by its ID.
 *
 * This usecase retrieves a product from the repository and ensures it exists.
 * Throws an error if the product is not found, converting null to a descriptive error.
 *
 * @param {ProductRepository} repo - Product repository for data retrieval
 * @param {ProductId} id - Unique identifier of the product to retrieve
 * @returns {Promise<Product>} Promise resolving to the product if found
 * @throws {Error} If the product with the given ID does not exist
 * @throws {Error} If repository retrieval fails (database connection error, query error, etc.)
 *
 * @example
 * ```typescript
 * const product = await getProductById(productRepository, productId);
 * // Returns: Product
 * // Throws: Error if product not found
 * ```
 */
export const getProductById = async (repo: ProductRepository, id: ProductId): Promise<Product> => {
    const product = await repo.getById(id);
    if (!product) {
        throw new Error(`Product with id ${id} not found`);
    }
    return product;
};

/**
 * Validates and updates an existing product.
 *
 * This usecase validates business rules before delegating to the repository:
 * - Retrieves existing product to verify it exists
 * - Merges updates with existing product data
 * - Validates merged product data using domain validation (`isValidProduct`)
 * - Delegates to repository for persistence
 *
 * The function first retrieves the existing product to merge updates with
 * the current state before validation.
 *
 * @param {ProductRepository} repo - Product repository for data persistence
 * @param {ProductId} id - Unique identifier of the product to update
 * @param {Partial<Product>} updates - Partial product object with fields to update
 * @returns {Promise<Product>} Promise resolving to the updated product
 * @throws {Error} If the product with the given ID does not exist
 * @throws {Error} If validation fails (invalid merged data, negative prices, negative stock, invalid weight)
 * @throws {Error} If repository update fails (database error, constraint violation, etc.)
 *
 * @example
 * ```typescript
 * const updates = {
 *   salePrice: 24.99,
 *   stock: 150
 * };
 * const updated = await updateProduct(productRepository, productId, updates);
 * ```
 */
export const updateProduct = async (
    repo: ProductRepository,
    id: ProductId,
    updates: Partial<Product>
): Promise<Product> => {
    // Retrieve existing product to validate updates against current state
    const existingProduct = await repo.getById(id);
    if (!existingProduct) {
        throw new Error(`Product with id ${id} not found`);
    }

    // Merge updates with existing product to get the final state
    const mergedProduct: Product = {
        ...existingProduct,
        ...updates,
    };

    // Validate merged product using domain validation
    if (!isValidProduct(mergedProduct)) {
        throw new Error("Product validation failed");
    }

    // Delegate to repository
    return repo.update(id, updates);
};

