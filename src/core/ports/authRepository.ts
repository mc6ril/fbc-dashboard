/**
 * Authentication Repository Port Interface
 *
 * Defines the contract for authentication operations in the FBC Dashboard.
 * This interface is implemented by infrastructure layer repositories (e.g., Supabase)
 * and used by usecases to perform authentication operations.
 *
 * Following Clean Architecture principles, this port interface:
 * - Uses only domain types (no external dependencies)
 * - Defines the contract without implementation details
 * - Ensures testability through dependency injection
 * - Standardizes error handling with AuthError
 *
 * All methods throw AuthError on failure, allowing usecases to handle errors
 * consistently across different repository implementations.
 */

import type {
    User,
    Session,
    SignInCredentials,
    SignUpCredentials,
    SessionChangeEvent,
} from "../domain/auth";

// Note: AuthError is referenced in JSDoc @throws tags but not imported
// as TypeScript doesn't type thrown exceptions. The error contract is
// documented in method JSDoc comments.

/**
 * Callback function type for authentication state change events.
 *
 * This type represents the callback function that is called whenever the
 * authentication state changes (e.g., user signs in, signs out, token is refreshed).
 * The callback receives a `SessionChangeEvent` containing the event type and the
 * current session (or null if the user signed out or the token expired/invalidated).
 *
 * This type is exported separately to allow for reuse in other parts of the application
 * where authentication state change callbacks need to be referenced or typed
 * (e.g., in usecases, hooks, or utility functions).
 *
 * @param {SessionChangeEvent} event - Authentication state change event containing
 *   the event type and current session (or null).
 *
 * @example
 * ```typescript
 * const handleAuthChange: AuthStateChangeCallback = (event) => {
 *   if (event.event === "SIGNED_OUT" || !event.session) {
 *     // Handle sign out
 *   } else if (event.event === "SIGNED_IN") {
 *     // Handle sign in
 *   }
 * };
 * ```
 */
export type AuthStateChangeCallback = (event: SessionChangeEvent) => void;

/**
 * Authentication Repository interface defining the contract for authentication operations.
 *
 * This interface must be implemented by infrastructure layer repositories (e.g., Supabase).
 * All methods return domain types and throw AuthError on failure.
 *
 * @interface AuthRepository
 */
export interface AuthRepository {
    /**
     * Signs in a user with email and password credentials.
     *
     * Authenticates the user and creates a new session. Returns both the session
     * and user information upon successful authentication.
     *
     * @param {SignInCredentials} credentials - User's email and password for authentication
     * @returns {Promise<{ session: Session; user: User }>} Promise resolving to session and user data
     * @throws {AuthError} Throws AuthError if credentials are invalid, user doesn't exist, or authentication fails
     *
     * @example
     * ```typescript
     * const result = await authRepository.signIn({ email: "user@example.com", password: "password123" });
     * console.log(result.session.accessToken); // JWT access token
     * console.log(result.user.email); // User email
     * ```
     */
    signIn(
        credentials: SignInCredentials
    ): Promise<{ session: Session; user: User }>;

    /**
     * Signs up a new user with email and password credentials.
     *
     * Creates a new user account and automatically signs them in, returning
     * both the session and user information.
     *
     * @param {SignUpCredentials} credentials - User's email and password for account creation
     * @returns {Promise<{ session: Session; user: User }>} Promise resolving to session and user data
     * @throws {AuthError} Throws AuthError if email already exists, password doesn't meet requirements, or sign-up fails
     *
     * @example
     * ```typescript
     * const result = await authRepository.signUp({ email: "newuser@example.com", password: "securePassword123" });
     * console.log(result.user.id); // New user ID
     * console.log(result.session.accessToken); // JWT access token
     * ```
     */
    signUp(
        credentials: SignUpCredentials
    ): Promise<{ session: Session; user: User }>;

    /**
     * Signs out the currently authenticated user.
     *
     * Invalidates the current session and clears authentication tokens.
     * This operation should be idempotent (safe to call multiple times).
     *
     * @returns {Promise<void>} Promise resolving when sign-out is complete
     * @throws {AuthError} Throws AuthError if sign-out fails (e.g., network error, session already invalid)
     *
     * @example
     * ```typescript
     * await authRepository.signOut();
     * // User is now signed out, session is invalidated
     * ```
     */
    signOut(): Promise<void>;

    /**
     * Retrieves the current active session for the authenticated user.
     *
     * Returns the current session if one exists and is valid, or null if
     * no active session is found. This method is used to check authentication
     * status and retrieve session tokens.
     *
     * @returns {Promise<Session | null>} Promise resolving to current session or null if no session exists
     * @throws {AuthError} Throws AuthError if session retrieval fails (e.g., network error, invalid token format)
     *
     * @example
     * ```typescript
     * const session = await authRepository.getSession();
     * if (session) {
     *   console.log("User is authenticated");
     *   console.log(session.accessToken); // Current access token
     * } else {
     *   console.log("No active session");
     * }
     * ```
     */
    getSession(): Promise<Session | null>;

    /**
     * Retrieves the current authenticated user information.
     *
     * Returns the user information for the currently authenticated user,
     * or null if no user is authenticated. This method is used to get
     * user details without retrieving the full session.
     *
     * @returns {Promise<User | null>} Promise resolving to current user or null if no user is authenticated
     * @throws {AuthError} Throws AuthError if user retrieval fails (e.g., network error, invalid session)
     *
     * @example
     * ```typescript
     * const user = await authRepository.getUser();
     * if (user) {
     *   console.log(`Authenticated as: ${user.email}`);
     *   console.log(`User ID: ${user.id}`);
     * } else {
     *   console.log("No authenticated user");
     * }
     * ```
     */
    getUser(): Promise<User | null>;

    /**
     * Subscribes to authentication state changes.
     *
     * Registers a callback function that will be called whenever the authentication
     * state changes (e.g., user signs in, signs out, token is refreshed, token expires).
     * This method is used to synchronize session state across browser tabs and windows,
     * and to automatically handle token expiration and invalidation.
     *
     * The callback receives a `SessionChangeEvent` containing the event type and the
     * current session (or null if the user signed out or the token expired/invalidated).
     *
     * The method returns a cleanup function that must be called to unsubscribe from
     * authentication state changes. This cleanup function should be called when the
     * subscription is no longer needed (e.g., when a component unmounts) to prevent
     * memory leaks.
     *
     * The subscription persists across all browser tabs and windows through the
     * underlying authentication provider's cross-tab synchronization mechanism.
     * When one tab triggers a state change (e.g., sign out), all other tabs receive
     * the event automatically.
     *
     * @param {AuthStateChangeCallback} callback - Function to call when authentication state changes.
     *   Receives a `SessionChangeEvent` with the event type and current session (or null).
     *   See {@link AuthStateChangeCallback} for the callback function type.
     * @returns {function} Cleanup function to unsubscribe from authentication state changes.
     *   Call this function to stop receiving events and prevent memory leaks.
     * @throws {AuthError} Throws AuthError if subscription fails (e.g., authentication provider error)
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
     * const unsubscribe = authRepository.onAuthStateChange(handleAuthChange);
     *
     * // Later, when no longer needed:
     * unsubscribe();
     * ```
     */
    onAuthStateChange(callback: AuthStateChangeCallback): () => void;
}

