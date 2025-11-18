/**
 * Mock Implementation for StockMovement Repository
 *
 * Provides a mock implementation of the StockMovementRepository interface for testing.
 * This mock uses Jest's mocking capabilities to allow test files to control
 * repository behavior and verify method calls.
 *
 * Following DRY principles, the repository mock is centralized here for reuse
 * across all test files that need to test usecases or components that depend
 * on the stock movement repository.
 */

import type { StockMovementRepository } from "@/core/ports/stockMovementRepository";

/**
 * Creates a mock StockMovementRepository for testing.
 *
 * Returns a fully mocked repository with all methods as Jest mock functions.
 * Each method can be configured in tests using Jest's mock methods (mockResolvedValue,
 * mockRejectedValue, mockReturnValue, etc.).
 *
 * @returns {jest.Mocked<StockMovementRepository>} Mocked repository with all methods as jest.fn()
 *
 * @example
 * ```typescript
 * const mockRepo = createMockStockMovementRepository();
 * mockRepo.listByProduct.mockResolvedValue([mockMovement1, mockMovement2]);
 * const result = await computeStockFromActivities(mockRepo, productId);
 * expect(mockRepo.listByProduct).toHaveBeenCalledWith(productId);
 * ```
 */
export const createMockStockMovementRepository = (): jest.Mocked<StockMovementRepository> => {
    return {
        list: jest.fn(),
        getById: jest.fn(),
        listByProduct: jest.fn(),
        create: jest.fn(),
    };
};

