/**
 * Supabase implementation of `AuthRepository` (Infrastructure).
 * Maps Supabase types to domain types and transforms errors to `AuthError`.
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

/** Map Supabase user to domain `User`. Throws if required fields are missing. */
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

/** Map Supabase session to domain `Session`. Throws if required fields are missing. */
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

/** Map Supabase auth event/session to domain `SessionChangeEvent`. */
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
    // Supabase events match our domain events: INITIAL_SESSION, SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, USER_UPDATED, PASSWORD_RECOVERY
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

/** Transform Supabase auth error to domain `AuthError` with specific code. */
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

/** Concrete `AuthRepository` using Supabase. */
export const authRepositorySupabase: AuthRepository = {
    /** Sign in via Supabase; map to domain; throw `AuthError` on failure. */
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

    /** Sign up via Supabase; map to domain; may require email confirmation. */
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

    /** Sign out via Supabase (idempotent). */
    signOut: async (): Promise<void> => {
        const { error } = await supabaseClient.auth.signOut();

        if (error) {
            throw transformSupabaseErrorToAuthError(error);
        }
    },

    /** Get current session or null. Clears invalid sessions on 401/403 and returns null. */
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

    /** Get current user or null. Clears invalid sessions on 401/403 and returns null. */
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

    /** Subscribe to auth state changes; returns cleanup. Does not throw. */
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

