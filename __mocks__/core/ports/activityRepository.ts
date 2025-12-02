/**
 * Mock Implementation for Activity Repository
 *
 * Provides a mock implementation of the ActivityRepository interface for testing.
 * This mock uses Jest's mocking capabilities to allow test files to control
 * repository behavior and verify method calls.
 *
 * Following DRY principles, the repository mock is centralized here for reuse
 * across all test files that need to test usecases or components that depend
 * on the activity repository.
 */

import type { ActivityRepository } from "@/core/ports/activityRepository";

/**
 * Creates a mock ActivityRepository for testing.
 *
 * Returns a fully mocked repository with all methods as Jest mock functions.
 * Each method can be configured in tests using Jest's mock methods (mockResolvedValue,
 * mockRejectedValue, mockReturnValue, etc.).
 *
 * @returns {jest.Mocked<ActivityRepository>} Mocked repository with all methods as jest.fn()
 *
 * @example
 * ```typescript
 * const mockRepo = createMockActivityRepository();
 * mockRepo.list.mockResolvedValue([mockActivity1, mockActivity2]);
 * const result = await listActivities(mockRepo);
 * expect(mockRepo.list).toHaveBeenCalledTimes(1);
 * ```
 */
export const createMockActivityRepository = (): jest.Mocked<ActivityRepository> => {
    return {
        list: jest.fn(),
        getById: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    };
};

