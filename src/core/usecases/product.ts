/**
 * Product Usecases (Usecase layer).
 * Orchestrate validation and repository calls. Return domain types only.
 */

import type { ProductRepository } from "@/core/ports/productRepository";
import type { Product } from "@/core/domain/product";

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

