/**
 * Authentication Repository Supabase Implementation
 *
 * Concrete implementation of the AuthRepository interface using Supabase as the
 * authentication provider. This is the only layer that directly interacts with
 * Supabase authentication APIs.
 *
 * This repository:
 * - Implements the AuthRepository interface contract
 * - Maps Supabase types to domain types (User, Session)
 * - Transforms Supabase errors to AuthError domain type
 * - Handles all Supabase-specific authentication logic
 *
 * Following Clean Architecture principles, this repository isolates Supabase
 * implementation details from the rest of the application, allowing easy
 * replacement with another authentication provider if needed.
 */

import { supabaseClient } from "./client";
import type { AuthRepository, AuthStateChangeCallback } from "../../core/ports/authRepository";
import type {
    User,
    Session,
    AuthError,
    SignInCredentials,
    SignUpCredentials,
    SessionChangeEvent,
    AuthEventType,
} from "../../core/domain/auth";
import type { AuthError as SupabaseAuthError } from "@supabase/supabase-js";

/**
 * Maps Supabase user object to domain User type.
 *
 * Converts Supabase's snake_case field names (created_at, updated_at) to
 * camelCase (createdAt, updatedAt) and ensures ISO 8601 string format
 * for date fields.
 *
 * @param {object} supabaseUser - Supabase user object from auth API
 * @returns {User} Domain User type
 * @throws {Error} Throws if required user fields are missing
 */
const mapSupabaseUserToDomain = (supabaseUser: {
    id: string;
    email?: string;
    created_at?: string;
    updated_at?: string;
}): User => {
    if (!supabaseUser.id) {
        throw new Error("User ID is required");
    }

    if (!supabaseUser.email) {
        throw new Error("User email is required");
    }

    return {
        id: supabaseUser.id,
        email: supabaseUser.email,
        createdAt: supabaseUser.created_at || new Date().toISOString(),
        updatedAt: supabaseUser.updated_at || new Date().toISOString(),
    };
};

/**
 * Maps Supabase session object to domain Session type.
 *
 * Converts Supabase's snake_case field names (access_token, refresh_token,
 * expires_at) to camelCase and maps the nested user object.
 *
 * @param {object} supabaseSession - Supabase session object from auth API
 * @returns {Session} Domain Session type
 * @throws {Error} Throws if required session fields are missing
 */
const mapSupabaseSessionToDomain = (supabaseSession: {
    access_token: string;
    refresh_token?: string | null;
    expires_at?: number;
    user: {
        id: string;
        email?: string;
        created_at?: string;
        updated_at?: string;
    };
}): Session => {
    if (!supabaseSession.access_token) {
        throw new Error("Access token is required");
    }

    if (!supabaseSession.user) {
        throw new Error("User is required in session");
    }

    // Convert expires_at (number of seconds since epoch) to ISO 8601 string
    const expiresAt =
        supabaseSession.expires_at != null
            ? new Date(supabaseSession.expires_at * 1000).toISOString()
            : new Date(Date.now() + 3600 * 1000).toISOString(); // Default: 1 hour from now

    return {
        accessToken: supabaseSession.access_token,
        refreshToken: supabaseSession.refresh_token || null,
        expiresAt,
        user: mapSupabaseUserToDomain(supabaseSession.user),
    };
};

/**
 * Maps Supabase auth state change event to domain SessionChangeEvent type.
 *
 * Converts Supabase's event string to domain AuthEventType and maps the session
 * to domain Session type if present. The session is null when the user signs out
 * or the token expires/invalidates.
 *
 * Supabase events match our domain events exactly: SIGNED_IN, SIGNED_OUT,
 * TOKEN_REFRESHED, USER_UPDATED, PASSWORD_RECOVERY. We cast the event string
 * to AuthEventType as Supabase guarantees these event types.
 *
 * @param {string} supabaseEvent - Supabase auth state change event string
 * @param {object | null} supabaseSession - Supabase session object or null
 * @returns {SessionChangeEvent} Domain SessionChangeEvent type
 * @throws {Error} Throws if session mapping fails when session is provided
 */
const mapSupabaseEventToDomain = (
    supabaseEvent: string,
    supabaseSession: {
        access_token: string;
        refresh_token?: string | null;
        expires_at?: number;
        user: {
            id: string;
            email?: string;
            created_at?: string;
            updated_at?: string;
        };
    } | null
): SessionChangeEvent => {
    // Map Supabase event strings to domain AuthEventType
    // Supabase events match our domain events: SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, USER_UPDATED, PASSWORD_RECOVERY
    const event = supabaseEvent as AuthEventType;

    // Map session to domain type if present, otherwise null
    const session =
        supabaseSession != null
            ? mapSupabaseSessionToDomain(supabaseSession)
            : null;

    return {
        event,
        session,
    };
};

/**
 * Transforms Supabase authentication error to domain AuthError type.
 *
 * Maps Supabase HTTP status codes and error messages to domain error codes
 * for better user experience. This function parses error messages to provide
 * specific, actionable error codes while falling back to status code mapping
 * when message parsing is inconclusive.
 *
 * The function detects common Supabase error patterns:
 * - Email already registered/exists
 * - Email not confirmed
 * - Weak password requirements
 * - Invalid email format
 * - Invalid credentials
 * - Rate limiting
 *
 * @param {SupabaseAuthError} supabaseError - Supabase authentication error
 * @returns {AuthError} Domain AuthError type with specific error code and user-friendly message
 */
const transformSupabaseErrorToAuthError = (
    supabaseError: SupabaseAuthError
): AuthError => {
    const errorMessage = (supabaseError.message || "").toLowerCase();
    const status = supabaseError.status;
    let code: string = "AUTH_ERROR";

    // First, try to detect specific error patterns from message
    // This provides better user experience than generic status codes
    if (errorMessage.includes("already registered") || 
        errorMessage.includes("already exists") ||
        errorMessage.includes("user already registered") ||
        errorMessage.includes("email address is already registered")) {
        code = "EMAIL_ALREADY_EXISTS";
    } else if (
        errorMessage.includes("email not confirmed") ||
        errorMessage.includes("email_not_confirmed") ||
        errorMessage.includes("confirm your email") ||
        errorMessage.includes("email confirmation required")
    ) {
        code = "EMAIL_NOT_CONFIRMED";
    } else if (
        errorMessage.includes("password") &&
        (errorMessage.includes("weak") ||
            errorMessage.includes("too short") ||
            errorMessage.includes("too long") ||
            errorMessage.includes("requirements"))
    ) {
        code = "WEAK_PASSWORD";
    } else if (
        errorMessage.includes("invalid email") ||
        errorMessage.includes("invalid email format") ||
        errorMessage.includes("email format is invalid")
    ) {
        code = "INVALID_EMAIL_FORMAT";
    } else if (
        errorMessage.includes("invalid login") ||
        errorMessage.includes("invalid credentials") ||
        errorMessage.includes("wrong password") ||
        errorMessage.includes("incorrect password") ||
        status === 401
    ) {
        code = "INVALID_CREDENTIALS";
    } else if (
        errorMessage.includes("rate limit") ||
        errorMessage.includes("too many requests") ||
        status === 429
    ) {
        code = "RATE_LIMIT_EXCEEDED";
    } else if (status === 400 || status === 422) {
        // Fallback for 400/422 when message doesn't match known patterns
        // These can be various validation errors
        code = "VALIDATION_ERROR";
    } else if (status) {
        // For other status codes, use the status as code
        code = `HTTP_${status}`;
    }

    return {
        code,
        message: supabaseError.message || "Authentication error occurred",
        status: supabaseError.status,
    };
};

/**
 * Supabase implementation of the Authentication Repository interface.
 *
 * This repository provides concrete implementations of all authentication
 * operations using Supabase as the authentication provider. All methods
 * return domain types and throw AuthError on failure.
 */
export const authRepositorySupabase: AuthRepository = {
    /**
     * Signs in a user with email and password credentials.
     *
     * Uses Supabase's `signInWithPassword` method and maps the response
     * to domain types.
     *
     * @param {SignInCredentials} credentials - User's email and password
     * @returns {Promise<{ session: Session; user: User }>} Session and user data
     * @throws {AuthError} Throws AuthError if authentication fails
     */
    signIn: async (
        credentials: SignInCredentials
    ): Promise<{ session: Session; user: User }> => {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
        });

        if (error) {
            throw transformSupabaseErrorToAuthError(error);
        }

        if (!data.session || !data.user) {
            throw {
                code: "AUTH_ERROR",
                message: "Sign in failed: No session or user data returned",
            } satisfies AuthError;
        }

        const session = mapSupabaseSessionToDomain(data.session);
        const user = mapSupabaseUserToDomain(data.user);

        return { session, user };
    },

    /**
     * Signs up a new user with email and password credentials.
     *
     * Uses Supabase's `signUp` method and maps the response to domain types.
     * Note: Supabase may return null session if email confirmation is required.
     *
     * @param {SignUpCredentials} credentials - User's email and password
     * @returns {Promise<{ session: Session; user: User }>} Session and user data
     * @throws {AuthError} Throws AuthError if sign-up fails
     */
    signUp: async (
        credentials: SignUpCredentials
    ): Promise<{ session: Session; user: User }> => {
        const { data, error } = await supabaseClient.auth.signUp({
            email: credentials.email,
            password: credentials.password,
        });

        if (error) {
            throw transformSupabaseErrorToAuthError(error);
        }

        if (!data.user) {
            throw {
                code: "AUTH_ERROR",
                message: "Sign up failed: No user data returned",
            } satisfies AuthError;
        }

        const user = mapSupabaseUserToDomain(data.user);

        // Supabase may return null session if email confirmation is required
        if (!data.session) {
            throw {
                code: "EMAIL_CONFIRMATION_REQUIRED",
                message:
                    "Sign up successful but email confirmation is required. Please check your email.",
            } satisfies AuthError;
        }

        const session = mapSupabaseSessionToDomain(data.session);

        return { session, user };
    },

    /**
     * Signs out the currently authenticated user.
     *
     * Uses Supabase's `signOut` method to invalidate the current session.
     * This operation is idempotent and safe to call multiple times.
     *
     * @returns {Promise<void>} Resolves when sign-out is complete
     * @throws {AuthError} Throws AuthError if sign-out fails
     */
    signOut: async (): Promise<void> => {
        const { error } = await supabaseClient.auth.signOut();

        if (error) {
            throw transformSupabaseErrorToAuthError(error);
        }
    },

    /**
     * Retrieves the current active session for the authenticated user.
     *
     * Uses Supabase's `getSession` method to retrieve the current session.
     * Returns null if no active session exists.
     *
     * If a 401 or 403 error occurs (indicating an invalid/expired session),
     * the method automatically clears the invalid session by calling `signOut()`
     * and returns null instead of throwing an error. This prevents stale sessions
     * from causing crashes on page load.
     *
     * @returns {Promise<Session | null>} Current session or null
     * @throws {AuthError} Throws AuthError if session retrieval fails (except for 401/403 which return null)
     */
    getSession: async (): Promise<Session | null> => {
        const { data, error } = await supabaseClient.auth.getSession();

        if (error) {
            // Handle 401/403 errors gracefully: clear invalid session and return null
            // This prevents stale sessions from causing crashes on page load
            if (error.status === 401 || error.status === 403) {
                // Clear invalid session from localStorage to prevent future errors
                try {
                    await supabaseClient.auth.signOut();
                } catch (signOutError) {
                    // Log sign-out error but don't throw (signOut failure shouldn't prevent null return)
                    console.error(
                        "Failed to clear invalid session on 401/403 error:",
                        signOutError
                    );
                }
                return null;
            }
            throw transformSupabaseErrorToAuthError(error);
        }

        if (!data.session) {
            return null;
        }

        return mapSupabaseSessionToDomain(data.session);
    },

    /**
     * Retrieves the current authenticated user information.
     *
     * Uses Supabase's `getUser` method to retrieve the current user.
     * Returns null if no user is authenticated.
     *
     * If a 401 or 403 error occurs (indicating an invalid/expired session),
     * the method automatically clears the invalid session by calling `signOut()`
     * and returns null instead of throwing an error. This prevents stale sessions
     * from causing crashes on page load.
     *
     * @returns {Promise<User | null>} Current user or null
     * @throws {AuthError} Throws AuthError if user retrieval fails (except for 401/403 which return null)
     */
    getUser: async (): Promise<User | null> => {
        const { data, error } = await supabaseClient.auth.getUser();

        if (error) {
            // Handle 401/403 errors gracefully: clear invalid session and return null
            // Also handle session-related error messages for consistency
            if (
                error.status === 401 ||
                error.status === 403 ||
                error.message.includes("session")
            ) {
                // Clear invalid session from localStorage to prevent future errors
                try {
                    await supabaseClient.auth.signOut();
                } catch (signOutError) {
                    // Log sign-out error but don't throw (signOut failure shouldn't prevent null return)
                    console.error(
                        "Failed to clear invalid session on 401/403 error:",
                        signOutError
                    );
                }
                return null;
            }
            throw transformSupabaseErrorToAuthError(error);
        }

        if (!data.user) {
            return null;
        }

        return mapSupabaseUserToDomain(data.user);
    },

    /**
     * Subscribes to authentication state changes.
     *
     * Uses Supabase's `onAuthStateChange` method to listen to authentication
     * state changes (sign in, sign out, token refresh, etc.). The callback
     * receives domain-mapped events with session data.
     *
     * The subscription automatically synchronizes across all browser tabs and
     * windows through Supabase's built-in localStorage mechanism. When one tab
     * triggers a state change, all other tabs receive the event automatically.
     *
     * This method returns a cleanup function that must be called to unsubscribe
     * from events and prevent memory leaks.
     *
     * @param {function} callback - Function to call when authentication state changes.
     *   Receives a `SessionChangeEvent` with the event type and current session (or null).
     * @returns {function} Cleanup function to unsubscribe from authentication state changes.
     *   Call this function to stop receiving events and prevent memory leaks.
     * @throws {never} This method does not throw. Supabase's `onAuthStateChange` always returns
     *   a subscription object. If event mapping fails, errors are logged but not thrown
     *   (to prevent unhandled errors in async callbacks from external libraries).
     *
     * @example
     * ```typescript
     * const unsubscribe = authRepositorySupabase.onAuthStateChange((event) => {
     *   if (event.event === "SIGNED_OUT" || !event.session) {
     *     // Handle sign out (clear stores, redirect, etc.)
     *   } else if (event.event === "SIGNED_IN") {
     *     // Handle sign in (update stores with new session, etc.)
     *   } else if (event.event === "TOKEN_REFRESHED") {
     *     // Handle token refresh (update stores with refreshed session, etc.)
     *   }
     * });
     *
     * // Later, when no longer needed:
     * unsubscribe();
     * ```
     */
    onAuthStateChange: (callback: AuthStateChangeCallback): (() => void) => {
        // Subscribe to Supabase auth state changes
        // Supabase's onAuthStateChange returns an object with a subscription
        // Note: onAuthStateChange does not throw - it always returns a subscription object
        const {
            data: { subscription },
        } = supabaseClient.auth.onAuthStateChange((supabaseEvent, supabaseSession) => {
            try {
                // Map Supabase event and session to domain types
                const domainEvent = mapSupabaseEventToDomain(
                    supabaseEvent,
                    supabaseSession
                );

                // Call the callback with the domain-mapped event
                callback(domainEvent);
            } catch (error) {
                // If mapping fails, log error and don't call callback
                // Never throw in a callback from an external library (Supabase)
                // as the error would be swallowed and the app cannot handle it properly
                // This prevents invalid events from being processed by the application
                console.error(
                    "Failed to map auth state change event:",
                    error instanceof Error ? error.message : "Unknown error",
                    {
                        supabaseEvent,
                        hasSession: supabaseSession !== null,
                    }
                );
                // Option: could force a safe logout by calling callback with SIGNED_OUT event
                // callback({ event: "SIGNED_OUT", session: null });
            }
        });

        // Return cleanup function that unsubscribes from events
        return () => {
            try {
                subscription.unsubscribe();
            } catch (error) {
                // If unsubscribe fails, log error but don't throw
                // This prevents cleanup errors from breaking the application
                console.error(
                    "Failed to unsubscribe from auth state changes:",
                    error
                );
            }
        };
    },
};

