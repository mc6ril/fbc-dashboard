/**
 * Mock Fixtures for Authentication Domain Types
 *
 * Reusable factory functions for creating test data for authentication domain types.
 * These fixtures are used across all test files to ensure consistency and reduce duplication.
 *
 * Following DRY principles, all mock data creation is centralized here.
 */

import type { User, Session, AuthError } from "@/core/domain/auth";

/**
 * Creates a mock User for testing.
 *
 * @param {Partial<User>} [overrides] - Optional overrides for default user properties
 * @returns {User} Mock user object with default values and optional overrides
 *
 * @example
 * ```typescript
 * const user = createMockUser({ email: "custom@example.com" });
 * ```
 */
export const createMockUser = (overrides?: Partial<User>): User => {
    return {
        id: "123e4567-e89b-12d3-a456-426614174000",
        email: "user@example.com",
        createdAt: "2025-01-27T14:00:00.000Z",
        updatedAt: "2025-01-27T14:00:00.000Z",
        ...overrides,
    };
};

/**
 * Creates a mock Session for testing.
 *
 * @param {User} [user] - Optional user to associate with the session. If not provided, a default mock user is created.
 * @param {Partial<Session>} [overrides] - Optional overrides for default session properties
 * @returns {Session} Mock session object with default values and optional overrides
 *
 * @example
 * ```typescript
 * const session = createMockSession(createMockUser(), { accessToken: "custom_token" });
 * ```
 */
export const createMockSession = (
    user?: User,
    overrides?: Partial<Session>
): Session => {
    const mockUser = user || createMockUser();
    return {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
        refreshToken: "refresh_token_123",
        expiresAt: "2025-01-27T15:00:00.000Z",
        user: mockUser,
        ...overrides,
    };
};

/**
 * Creates a mock AuthError for testing.
 *
 * @param {Partial<AuthError>} [overrides] - Optional overrides for default error properties
 * @returns {AuthError} Mock error object with default values and optional overrides
 *
 * @example
 * ```typescript
 * const error = createMockAuthError({ code: "INVALID_CREDENTIALS", status: 401 });
 * ```
 */
export const createMockAuthError = (
    overrides?: Partial<AuthError>
): AuthError => {
    return {
        code: "ERROR",
        message: "An error occurred",
        status: 500,
        ...overrides,
    };
};

