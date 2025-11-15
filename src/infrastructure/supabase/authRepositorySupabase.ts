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
import type { AuthRepository } from "../../core/ports/authRepository";
import type {
    User,
    Session,
    AuthError,
    SignInCredentials,
    SignUpCredentials,
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
 * Transforms Supabase authentication error to domain AuthError type.
 *
 * Maps Supabase HTTP status codes to domain error codes. This approach is more
 * reliable than parsing error messages, which can vary in format.
 *
 * Note: This is a simplified MVP implementation. For more granular error codes,
 * consider matching on message fragments (e.g., message.includes("email")) or
 * using Supabase's error code field if available in future versions.
 *
 * @param {SupabaseAuthError} supabaseError - Supabase authentication error
 * @returns {AuthError} Domain AuthError type
 */
const transformSupabaseErrorToAuthError = (
    supabaseError: SupabaseAuthError
): AuthError => {
    // Map HTTP status codes to domain error codes
    // This is more reliable than parsing error messages
    let code: string = "AUTH_ERROR";

    if (supabaseError.status === 401) {
        code = "INVALID_CREDENTIALS";
    } else if (supabaseError.status === 400) {
        // 400 can be various validation errors, use generic code
        code = "VALIDATION_ERROR";
    } else if (supabaseError.status === 422) {
        // 422 Unprocessable Entity often indicates email already exists or weak password
        code = "VALIDATION_ERROR";
    } else if (supabaseError.status === 429) {
        code = "RATE_LIMIT_EXCEEDED";
    } else if (supabaseError.status) {
        // For other status codes, use the status as code
        code = `HTTP_${supabaseError.status}`;
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
     * @returns {Promise<Session | null>} Current session or null
     * @throws {AuthError} Throws AuthError if session retrieval fails
     */
    getSession: async (): Promise<Session | null> => {
        const { data, error } = await supabaseClient.auth.getSession();

        if (error) {
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
     * @returns {Promise<User | null>} Current user or null
     * @throws {AuthError} Throws AuthError if user retrieval fails
     */
    getUser: async (): Promise<User | null> => {
        const { data, error } = await supabaseClient.auth.getUser();

        if (error) {
            // If error is due to no authenticated user, return null instead of throwing
            if (error.message.includes("session") || error.status === 401) {
                return null;
            }
            throw transformSupabaseErrorToAuthError(error);
        }

        if (!data.user) {
            return null;
        }

        return mapSupabaseUserToDomain(data.user);
    },
};

