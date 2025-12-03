/**
 * Mock Implementation for Cost Repository
 *
 * Provides a mock implementation of the CostRepository interface for testing.
 * This mock uses Jest's mocking capabilities to allow test files to control
 * repository behavior and verify method calls.
 *
 * Following DRY principles, the repository mock is centralized here for reuse
 * across all test files that need to test usecases or components that depend
 * on the cost repository.
 */

import type { CostRepository } from "@/core/ports/costRepository";

/**
 * Creates a mock CostRepository for testing.
 *
 * Returns a fully mocked repository with all methods as Jest mock functions.
 * Each method can be configured in tests using Jest's mock methods (mockResolvedValue,
 * mockRejectedValue, mockReturnValue, etc.).
 *
 * @returns {jest.Mocked<CostRepository>} Mocked repository with all methods as jest.fn()
 *
 * @example
 * ```typescript
 * const mockRepo = createMockCostRepository();
 * mockRepo.getMonthlyCost.mockResolvedValue(null);
 * const result = await getMonthlyCost(mockRepo, "2025-01");
 * expect(mockRepo.getMonthlyCost).toHaveBeenCalledTimes(1);
 * ```
 */
export const createMockCostRepository = (): jest.Mocked<CostRepository> => {
    return {
        getMonthlyCost: jest.fn(),
        createOrUpdateMonthlyCost: jest.fn(),
        updateMonthlyCostField: jest.fn(),
    };
};

