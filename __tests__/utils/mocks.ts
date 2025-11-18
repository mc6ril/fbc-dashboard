/**
 * Test utilities for creating mock objects and state.
 *
 * These utilities provide helper functions for creating mock data structures
 * commonly used in tests, such as Session objects and Zustand store states.
 */

import type { Session, User } from "@/core/domain/auth";

/**
 * Creates a mock Session object for testing.
 *
 * Generates a Session with default test values. Optionally accepts a User
 * object to customize the session's user data.
 *
 * @param {User} [user] - Optional user object to include in the session
 * @returns {Session} Mock Session object with test data
 *
 * @example
 * ```typescript
 * const session = createMockSession();
 * const sessionWithUser = createMockSession(mockUser);
 * ```
 */
export const createMockSession = (user?: User): Session => {
    const defaultUser: User = {
        id: "user-1",
        email: "test@example.com",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    return {
        accessToken: "token",
        refreshToken: "refresh-token",
        expiresAt: new Date().toISOString(),
        user: user ?? defaultUser,
    };
};

/**
 * Creates a mock GlobalLoadingStore state for testing.
 *
 * Generates a Zustand store state object with the specified loading state
 * and mock functions for store actions.
 *
 * @param {boolean} isLoading - The loading state value
 * @returns {object} Mock store state with isLoading and action functions
 *
 * @example
 * ```typescript
 * const storeState = createMockGlobalLoadingStoreState(true);
 * ```
 */
export const createMockGlobalLoadingStoreState = (isLoading: boolean) => ({
    isLoading,
    setLoading: jest.fn(),
    startLoading: jest.fn(),
    stopLoading: jest.fn(),
});

/**
 * Creates a mock AuthStore state for testing.
 *
 * Generates a Zustand store state object with the specified session and user,
 * along with mock functions for store actions.
 *
 * @param {Session | null} session - The session object (or null)
 * @param {User | null} user - The user object (or null)
 * @returns {object} Mock store state with session, user, and action functions
 *
 * @example
 * ```typescript
 * const storeState = createMockAuthStoreState(mockSession, mockUser);
 * ```
 */
export const createMockAuthStoreState = (session: Session | null, user: User | null) => ({
    session,
    user,
    setSession: jest.fn(),
    setUser: jest.fn(),
    clearAuth: jest.fn(),
});

