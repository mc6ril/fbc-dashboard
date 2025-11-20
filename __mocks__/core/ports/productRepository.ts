/**
 * Mock Implementation for Product Repository
 *
 * Provides a mock implementation of the ProductRepository interface for testing.
 * This mock uses Jest's mocking capabilities to allow test files to control
 * repository behavior and verify method calls.
 *
 * Following DRY principles, the repository mock is centralized here for reuse
 * across all test files that need to test usecases or components that depend
 * on the product repository.
 */

import type { ProductRepository } from "@/core/ports/productRepository";

/**
 * Creates a mock ProductRepository for testing.
 *
 * Returns a fully mocked repository with all methods as Jest mock functions.
 * Each method can be configured in tests using Jest's mock methods (mockResolvedValue,
 * mockRejectedValue, mockReturnValue, etc.).
 *
 * @returns {jest.Mocked<ProductRepository>} Mocked repository with all methods as jest.fn()
 *
 * @example
 * ```typescript
 * const mockRepo = createMockProductRepository();
 * mockRepo.list.mockResolvedValue([mockProduct1, mockProduct2]);
 * const result = await listProducts(mockRepo);
 * expect(mockRepo.list).toHaveBeenCalledTimes(1);
 * ```
 */
export const createMockProductRepository = (): jest.Mocked<ProductRepository> => {
    return {
        list: jest.fn(),
        getById: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        listModelsByType: jest.fn(),
        listColorisByModel: jest.fn(),
        getModelById: jest.fn(),
        getColorisById: jest.fn(),
    };
};

