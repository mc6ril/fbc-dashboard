/**
 * Mock Implementation for Authentication Repository
 *
 * Provides a mock implementation of the AuthRepository interface for testing.
 * This mock uses Jest's mocking capabilities to allow test files to control
 * repository behavior and verify method calls.
 *
 * Following DRY principles, the repository mock is centralized here for reuse
 * across all test files that need to test usecases or components that depend
 * on the authentication repository.
 */

import type { AuthRepository } from "@/core/ports/authRepository";

/**
 * Creates a mock AuthRepository for testing.
 *
 * Returns a fully mocked repository with all methods as Jest mock functions.
 * Each method can be configured in tests using Jest's mock methods (mockResolvedValue,
 * mockRejectedValue, etc.).
 *
 * @returns {jest.Mocked<AuthRepository>} Mocked repository with all methods as jest.fn()
 *
 * @example
 * ```typescript
 * const mockRepo = createMockAuthRepository();
 * mockRepo.signIn.mockResolvedValue({ session: mockSession, user: mockUser });
 * const result = await signInUser(mockRepo, credentials);
 * expect(mockRepo.signIn).toHaveBeenCalledWith(credentials);
 * ```
 */
export const createMockAuthRepository = (): jest.Mocked<AuthRepository> => {
    return {
        signIn: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
        getSession: jest.fn(),
        getUser: jest.fn(),
    };
};

