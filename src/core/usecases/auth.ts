/**
 * Authentication Usecases (Usecase layer).
 * Orchestrate validation and repository calls. Return domain types only.
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

/** Creates a typed validation error. */
const createValidationError = (message: string): AuthError => {
    return {
        code: "VALIDATION_ERROR",
        message,
    } satisfies AuthError;
};

/** Validate and sign in user. Throws `AuthError` on validation/auth failure. */
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

/** Validate and sign up user. Throws `AuthError` on validation/sign-up failure. */
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

/** Sign out current user (idempotent). Throws `AuthError` on failure. */
export const signOutUser = async (repo: AuthRepository): Promise<void> => {
    // No validation needed for sign-out
    // Delegate to repository
    return repo.signOut();
};

/** Get current session or null. Throws `AuthError` on retrieval failure. */
export const getCurrentSession = async (
    repo: AuthRepository
): Promise<Session | null> => {
    // No validation needed for session retrieval
    // Delegate to repository
    return repo.getSession();
};

/** Get current user or null. Throws `AuthError` on retrieval failure. */
export const getCurrentUser = async (
    repo: AuthRepository
): Promise<User | null> => {
    // No validation needed for user retrieval
    // Delegate to repository
    return repo.getUser();
};

/** Subscribe to auth state changes. Returns cleanup to unsubscribe. */
export const subscribeToAuthChanges = (
    repo: AuthRepository,
    callback: AuthStateChangeCallback
): (() => void) => {
    // Delegate to repository's onAuthStateChange method
    // The repository handles the actual subscription and returns a cleanup function
    return repo.onAuthStateChange(callback);
};

