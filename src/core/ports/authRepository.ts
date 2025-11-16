/**
 * Authentication Repository Port Interface (Domain → Ports).
 * Contract only: returns domain types, throws `AuthError` on failure.
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

/** Callback invoked on authentication state changes with current session (or null). */
export type AuthStateChangeCallback = (event: SessionChangeEvent) => void;

/** Authentication operations contract. */
export interface AuthRepository {
    /** Sign in with email/password. Throws `AuthError` on failure. */
    signIn(
        credentials: SignInCredentials
    ): Promise<{ session: Session; user: User }>;

    /** Sign up new user and start session. Throws `AuthError` on failure. */
    signUp(
        credentials: SignUpCredentials
    ): Promise<{ session: Session; user: User }>;

    /** Sign out current user (idempotent). Throws `AuthError` on failure. */
    signOut(): Promise<void>;

    /** Get current session or null. Throws `AuthError` on retrieval failure. */
    getSession(): Promise<Session | null>;

    /** Get current user or null. Throws `AuthError` on retrieval failure. */
    getUser(): Promise<User | null>;

    /** Subscribe to auth state changes. Returns cleanup to unsubscribe. */
    onAuthStateChange(callback: AuthStateChangeCallback): () => void;
}

