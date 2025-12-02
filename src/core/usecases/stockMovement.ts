/**
 * Stock Movement Usecases (Usecase layer).
 * Orchestrate validation and repository calls. Return domain types only.
 */

import type { StockMovementRepository } from "@/core/ports/stockMovementRepository";
import type { StockMovement, StockMovementId } from "@/core/domain/stockMovement";
import { StockMovementSource } from "@/core/domain/stockMovement";
import { isValidStockMovement } from "@/core/domain/validation";
import type { ProductId } from "@/core/domain/product";
import { validateNumber } from "@/shared/utils/number";

/**
 * StockMovementError represents a stock movement-related error in the system.
 *
 * This type standardizes error handling across all stock movement operations.
 * Errors can occur during stock movement creation, validation, or any other
 * stock movement operation. The error includes a code for programmatic handling
 * and a user-friendly message.
 *
 * The status field is optional because not all errors have an associated HTTP
 * status code (e.g., local validation errors, client-side errors).
 *
 * @property {string} code - Error code for programmatic error handling (e.g., "VALIDATION_ERROR", "NOT_FOUND")
 * @property {string} message - Human-readable error message for display to users
 * @property {number} [status] - Optional HTTP status code associated with the error (e.g., 400, 404, 500). Not present for local validation errors.
 */
export type StockMovementError = {
    code: string;
    message: string;
    status?: number;
};

/** Creates a typed validation error. */
const createValidationError = (message: string): StockMovementError => {
    const error = new Error(message) as Error & StockMovementError;
    error.code = "VALIDATION_ERROR";
    return error;
};

/**
 * Validates and creates a new stock movement.
 *
 * This usecase validates business rules before delegating to the repository:
 * - productId is REQUIRED (all stock movements must be associated with a product)
 * - quantity must be a valid number (not NaN, not Infinity) and non-zero
 * - source must be a valid StockMovementSource enum value
 *
 * @param {StockMovementRepository} repo - Stock movement repository for data persistence
 * @param {Omit<StockMovement, 'id'>} movement - Stock movement data to create (without the id field)
 * @returns {Promise<StockMovement>} Promise resolving to the created stock movement with generated ID
 * @throws {StockMovementError} If validation fails (missing productId, invalid quantity, invalid source)
 * @throws {Error} If repository creation fails (database error, constraint violation, etc.)
 *
 * @example
 * ```typescript
 * const newMovement = {
 *   productId: "550e8400-e29b-41d4-a716-446655440000" as ProductId,
 *   quantity: -5,
 *   source: StockMovementSource.SALE,
 * };
 * const created = await createStockMovement(stockMovementRepository, newMovement);
 * ```
 */
export const createStockMovement = async (
    repo: StockMovementRepository,
    movement: Omit<StockMovement, "id">
): Promise<StockMovement> => {
    // Validate productId is provided
    if (!movement.productId) {
        throw createValidationError("productId is required for stock movement");
    }

    // Validate quantity is a valid number
    try {
        validateNumber(movement.quantity, "quantity");
    } catch (error) {
        throw createValidationError(error instanceof Error ? error.message : "Invalid quantity");
    }
    // Validate quantity is non-zero
    if (movement.quantity === 0) {
        throw createValidationError("quantity must be non-zero");
    }

    // Validate source is a valid StockMovementSource
    const validSources = Object.values(StockMovementSource);
    if (!validSources.includes(movement.source)) {
        throw createValidationError(`Invalid source value: ${movement.source}`);
    }

    // Validate stock movement using domain validation
    // Note: isValidStockMovement requires an id, so we create a temporary one
    // The id is not validated, only productId and quantity/source combination
    const movementWithId: StockMovement = {
        ...movement,
        id: "00000000-0000-0000-0000-000000000000" as StockMovementId, // Temporary ID for validation
    };
    if (!isValidStockMovement(movementWithId)) {
        throw createValidationError("Stock movement validation failed");
    }

    // Delegate to repository
    return repo.create(movement);
};

/**
 * Lists all stock movements.
 *
 * This usecase delegates directly to the repository to retrieve all stock movements.
 * No business logic is applied, but this usecase maintains consistency with
 * the usecase pattern and allows future filtering/ordering logic to be added
 * without changing the interface.
 *
 * @param {StockMovementRepository} repo - Stock movement repository for data retrieval
 * @returns {Promise<StockMovement[]>} Promise resolving to an array of all stock movements, or empty array if none exist
 * @throws {Error} If repository retrieval fails (database connection error, query error, etc.)
 *
 * @example
 * ```typescript
 * const movements = await listStockMovements(stockMovementRepository);
 * // Returns: [StockMovement, StockMovement, ...] or []
 * ```
 */
export const listStockMovements = async (
    repo: StockMovementRepository
): Promise<StockMovement[]> => {
    return repo.list();
};

/**
 * Lists all stock movements for a specific product.
 *
 * This usecase delegates directly to the repository to retrieve stock movements
 * for a specific product. No business logic is applied, but this usecase maintains
 * consistency with the usecase pattern and allows future filtering/ordering logic
 * to be added without changing the interface.
 *
 * @param {StockMovementRepository} repo - Stock movement repository for data retrieval
 * @param {ProductId} productId - The unique identifier of the product to retrieve movements for
 * @returns {Promise<StockMovement[]>} Promise resolving to an array of stock movements for the specified product, or empty array if none exist
 * @throws {Error} If repository retrieval fails (database connection error, query error, etc.)
 *
 * @example
 * ```typescript
 * const productId = "550e8400-e29b-41d4-a716-446655440000" as ProductId;
 * const movements = await listStockMovementsByProduct(stockMovementRepository, productId);
 * // Returns: [StockMovement, StockMovement, ...] or []
 * ```
 */
export const listStockMovementsByProduct = async (
    repo: StockMovementRepository,
    productId: ProductId
): Promise<StockMovement[]> => {
    return repo.listByProduct(productId);
};
