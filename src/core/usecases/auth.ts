/**
 * Authentication Usecases
 *
 * Business logic orchestration layer for authentication operations in the FBC Dashboard.
 * These usecases coordinate authentication operations by calling repository methods
 * and applying business rules (validation, error handling, etc.).
 *
 * Following Clean Architecture principles, these usecases:
 * - Are pure functions with no side effects (except through repository)
 * - Take repository as parameter (dependency injection for testability)
 * - Return domain types only
 * - Contain business logic (validation, error transformation)
 * - Have no external dependencies (React, Supabase, etc.)
 *
 * These usecases are called by React Query hooks in the presentation layer.
 */

import type { AuthRepository, AuthStateChangeCallback } from "../ports/authRepository";
import type {
    User,
    Session,
    AuthError,
    SignInCredentials,
    SignUpCredentials,
} from "../domain/auth";
import { isValidEmail, isValidPassword } from "../domain/validation";

/**
 * Creates an AuthError for validation failures.
 *
 * @param {string} message - Error message
 * @returns {AuthError} Validation error
 */
const createValidationError = (message: string): AuthError => {
    return {
        code: "VALIDATION_ERROR",
        message,
    } satisfies AuthError;
};

/**
 * Signs in a user with email and password credentials.
 *
 * Validates credentials before calling the repository, then delegates
 * authentication to the repository. Returns session and user data on success.
 *
 * @param {AuthRepository} repo - Authentication repository implementation
 * @param {SignInCredentials} credentials - User's email and password
 * @returns {Promise<{ session: Session; user: User }>} Session and user data
 * @throws {AuthError} Throws AuthError if validation fails or authentication fails
 *
 * @example
 * ```typescript
 * const result = await signInUser(authRepositorySupabase, {
 *   email: "user@example.com",
 *   password: "password123"
 * });
 * console.log(result.user.email); // User email
 * ```
 */
export const signInUser = async (
    repo: AuthRepository,
    credentials: SignInCredentials
): Promise<{ session: Session; user: User }> => {
    // Validate email format
    if (!credentials.email || !isValidEmail(credentials.email)) {
        throw createValidationError("Invalid email format");
    }

    // Validate password is not empty
    if (!credentials.password || credentials.password.trim().length === 0) {
        throw createValidationError("Password is required");
    }

    // Delegate to repository
    return repo.signIn(credentials);
};

/**
 * Signs up a new user with email and password credentials.
 *
 * Validates credentials before calling the repository, then delegates
 * account creation to the repository. Returns session and user data on success.
 *
 * @param {AuthRepository} repo - Authentication repository implementation
 * @param {SignUpCredentials} credentials - User's email and password
 * @returns {Promise<{ session: Session; user: User }>} Session and user data
 * @throws {AuthError} Throws AuthError if validation fails or sign-up fails
 *
 * @example
 * ```typescript
 * const result = await signUpUser(authRepositorySupabase, {
 *   email: "newuser@example.com",
 *   password: "securePassword123"
 * });
 * console.log(result.user.id); // New user ID
 * ```
 */
export const signUpUser = async (
    repo: AuthRepository,
    credentials: SignUpCredentials
): Promise<{ session: Session; user: User }> => {
    // Validate email format
    if (!credentials.email || !isValidEmail(credentials.email)) {
        throw createValidationError("Invalid email format");
    }

    // Validate password requirements
    if (!credentials.password || credentials.password.trim().length === 0) {
        throw createValidationError("Password is required");
    }

    if (!isValidPassword(credentials.password)) {
        throw createValidationError(
            "Password must be at least 8 characters long"
        );
    }

    // Delegate to repository
    return repo.signUp(credentials);
};

/**
 * Signs out the currently authenticated user.
 *
 * Delegates sign-out operation to the repository. This operation is idempotent
 * and safe to call multiple times.
 *
 * @param {AuthRepository} repo - Authentication repository implementation
 * @returns {Promise<void>} Resolves when sign-out is complete
 * @throws {AuthError} Throws AuthError if sign-out fails
 *
 * @example
 * ```typescript
 * await signOutUser(authRepositorySupabase);
 * // User is now signed out
 * ```
 */
export const signOutUser = async (repo: AuthRepository): Promise<void> => {
    // No validation needed for sign-out
    // Delegate to repository
    return repo.signOut();
};

/**
 * Retrieves the current active session for the authenticated user.
 *
 * Delegates session retrieval to the repository. Returns the session if one
 * exists, or null if no active session is found.
 *
 * @param {AuthRepository} repo - Authentication repository implementation
 * @returns {Promise<Session | null>} Current session or null
 * @throws {AuthError} Throws AuthError if session retrieval fails
 *
 * @example
 * ```typescript
 * const session = await getCurrentSession(authRepositorySupabase);
 * if (session) {
 *   console.log("User is authenticated");
 *   console.log(session.accessToken);
 * } else {
 *   console.log("No active session");
 * }
 * ```
 */
export const getCurrentSession = async (
    repo: AuthRepository
): Promise<Session | null> => {
    // No validation needed for session retrieval
    // Delegate to repository
    return repo.getSession();
};

/**
 * Retrieves the current authenticated user information.
 *
 * Delegates user retrieval to the repository. Returns the user if authenticated,
 * or null if no user is authenticated.
 *
 * @param {AuthRepository} repo - Authentication repository implementation
 * @returns {Promise<User | null>} Current user or null
 * @throws {AuthError} Throws AuthError if user retrieval fails
 *
 * @example
 * ```typescript
 * const user = await getCurrentUser(authRepositorySupabase);
 * if (user) {
 *   console.log(`Authenticated as: ${user.email}`);
 * } else {
 *   console.log("No authenticated user");
 * }
 * ```
 */
export const getCurrentUser = async (
    repo: AuthRepository
): Promise<User | null> => {
    // No validation needed for user retrieval
    // Delegate to repository
    return repo.getUser();
};

/**
 * Subscribes to authentication state changes.
 *
 * This usecase provides a way to listen for authentication state changes
 * (sign-in, sign-out, token refresh, user updates, password recovery) across
 * the application. The subscription is active until the returned cleanup
 * function is called.
 *
 * The callback receives a `SessionChangeEvent` containing:
 * - The event type (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, USER_UPDATED, PASSWORD_RECOVERY)
 * - The current session (or null if signed out)
 *
 * This subscription enables real-time cross-tab synchronization of authentication
 * state, as Supabase's `onAuthStateChange` automatically triggers when auth state
 * changes in any browser tab/window.
 *
 * @param {AuthRepository} repo - Authentication repository implementation
 * @param {AuthStateChangeCallback} callback - Callback function to handle auth state changes
 * @returns {() => void} Cleanup function to unsubscribe from auth state changes
 *
 * @example
 * ```typescript
 * const handleAuthChange: AuthStateChangeCallback = (event) => {
 *   if (event.event === "SIGNED_OUT" || !event.session) {
 *     console.log("User signed out");
 *     // Handle sign out (clear stores, redirect, etc.)
 *   } else if (event.event === "SIGNED_IN") {
 *     console.log("User signed in");
 *     console.log(`Session: ${event.session.accessToken}`);
 *     // Handle sign in (update stores, etc.)
 *   } else if (event.event === "TOKEN_REFRESHED") {
 *     console.log("Token refreshed");
 *     // Handle token refresh (update stores with new session, etc.)
 *   }
 * };
 *
 * const unsubscribe = subscribeToAuthChanges(authRepositorySupabase, handleAuthChange);
 *
 * // Later, when no longer needed:
 * unsubscribe();
 * ```
 */
export const subscribeToAuthChanges = (
    repo: AuthRepository,
    callback: AuthStateChangeCallback
): (() => void) => {
    // Delegate to repository's onAuthStateChange method
    // The repository handles the actual subscription and returns a cleanup function
    return repo.onAuthStateChange(callback);
};

