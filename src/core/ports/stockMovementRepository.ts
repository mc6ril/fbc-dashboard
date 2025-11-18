/**
 * StockMovement Repository Port Interface (Domain → Ports).
 * Contract only: returns domain types, throws errors on failure.
 *
 * Note: The ticket mentions "Stock" but the domain uses "StockMovement" to match
 * the domain naming convention. This repository is named `StockMovementRepository`
 * to maintain consistency with the domain layer.
 */

import type { StockMovement, StockMovementId } from "../domain/stockMovement";
import type { ProductId } from "../domain/product";

// Note: Errors are referenced in JSDoc @throws tags but not imported
// as TypeScript doesn't type thrown exceptions. The error contract is
// documented in method JSDoc comments.

/**
 * StockMovement operations contract.
 *
 * This interface defines the contract for stock movement data access operations.
 * Implementations must provide methods for listing, retrieving, creating stock
 * movements, and querying movements by product. All methods return domain types
 * and throw errors on failure.
 *
 * Stock movements are critical for calculating current stock levels from movement
 * history, enabling inventory tracking and audit trails.
 */
export interface StockMovementRepository {
    /**
     * List all stock movements.
     *
     * Retrieves all stock movements from the data store. Returns an empty array
     * if no movements exist.
     *
     * @returns Promise resolving to an array of all stock movements
     * @throws {Error} If the data retrieval fails (e.g., database connection error, query error)
     */
    list(): Promise<StockMovement[]>;

    /**
     * Get a single stock movement by its ID.
     *
     * Retrieves a stock movement with the specified ID. Returns null if the movement
     * does not exist.
     *
     * @param {StockMovementId} id - The unique identifier of the stock movement to retrieve
     * @returns Promise resolving to the stock movement if found, or null if not found
     * @throws {Error} If the data retrieval fails (e.g., database connection error, query error)
     */
    getById(id: StockMovementId): Promise<StockMovement | null>;

    /**
     * List all stock movements for a specific product.
     *
     * Retrieves all stock movements associated with the specified product ID.
     * This method is critical for calculating current stock levels from movement
     * history. Returns an empty array if no movements exist for the product.
     *
     * Note: Ordering is implementation-specific and not guaranteed by this contract.
     * Implementations may return movements in chronological order to enable proper
     * stock calculation, but usecases should not rely on a specific order.
     *
     * @param {ProductId} productId - The unique identifier of the product to retrieve movements for
     * @returns Promise resolving to an array of stock movements for the specified product
     * @throws {Error} If the data retrieval fails (e.g., database connection error, query error)
     */
    listByProduct(productId: ProductId): Promise<StockMovement[]>;

    /**
     * Create a new stock movement.
     *
     * Creates a new stock movement in the data store. The movement ID will be generated
     * by the implementation (typically by the database). The created movement with
     * its generated ID is returned.
     *
     * Business rules enforced by implementations:
     * - productId is REQUIRED (all stock movements must be associated with a product)
     * - quantity sign meaning depends on the source:
     *   - For CREATION source: quantity is typically POSITIVE (stock increases)
     *   - For SALE source: quantity is typically NEGATIVE (stock decreases)
     *   - For INVENTORY_ADJUSTMENT source: quantity can be POSITIVE or NEGATIVE
     * - source must be a valid StockMovementSource enum value
     * - quantity must be a valid number (non-zero)
     *
     * @param {Omit<StockMovement, 'id'>} movement - The stock movement data to create (without the id field)
     * @returns Promise resolving to the created stock movement with its generated ID
     * @throws {Error} If validation fails (e.g., missing productId, invalid source, zero quantity)
     * @throws {Error} If the creation fails (e.g., database connection error, constraint violation)
     */
    create(movement: Omit<StockMovement, "id">): Promise<StockMovement>;
}

