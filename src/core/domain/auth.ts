/**
 * Authentication Domain Types
 *
 * Pure TypeScript types for authentication operations in the FBC Dashboard.
 * These types represent the core business entities and contracts for user
 * authentication, session management, and error handling.
 *
 * This domain layer contains no external dependencies and follows Clean
 * Architecture principles. All types are used throughout the application
 * layers (usecases, infrastructure, presentation) to maintain type safety
 * and business logic consistency.
 */

/**
 * User represents an authenticated user in the FBC Dashboard system.
 *
 * This type contains the core user information needed for authentication
 * and authorization throughout the application. The user is created during
 * sign-up and retrieved during authentication operations.
 *
 * Date fields are stored as ISO 8601 strings (e.g., "2025-01-27T14:00:00.000Z")
 * to ensure compatibility with Supabase responses, React Query serialization,
 * Zustand state persistence, and Next.js server-side hydration.
 *
 * @property {string} id - Unique identifier for the user (UUID format)
 * @property {string} email - User's email address (used for authentication)
 * @property {string} createdAt - ISO 8601 timestamp when the user account was created
 * @property {string} updatedAt - ISO 8601 timestamp when the user account was last updated
 */
export type User = {
    id: string;
    email: string;
    createdAt: string;
    updatedAt: string;
};

/**
 * Session represents an active authentication session for a user.
 *
 * A session is created when a user signs in and contains the authentication
 * tokens required for authenticated API requests. The session persists until
 * the user signs out or the tokens expire.
 *
 * Date fields are stored as ISO 8601 strings to ensure compatibility with
 * Supabase responses, React Query serialization, Zustand state persistence,
 * and Next.js server-side hydration.
 *
 * @property {string} accessToken - JWT access token for authenticated requests
 * @property {string | null} refreshToken - Token used to refresh the access token when it expires (may be null depending on authentication flow)
 * @property {string} expiresAt - ISO 8601 timestamp when the access token expires
 * @property {User} user - The authenticated user associated with this session
 */
export type Session = {
    accessToken: string;
    refreshToken: string | null;
    expiresAt: string;
    user: User;
};

/**
 * AuthError represents an authentication-related error in the system.
 *
 * This type standardizes error handling across all authentication operations.
 * Errors can occur during sign-in, sign-up, session retrieval, or any other
 * authentication operation. The error includes a code for programmatic handling,
 * a user-friendly message, and optionally an HTTP status code.
 *
 * The status field is optional because not all errors have an associated HTTP
 * status code (e.g., local validation errors, client-side errors).
 *
 * @property {string} code - Error code for programmatic error handling (e.g., "INVALID_CREDENTIALS", "EMAIL_ALREADY_EXISTS")
 * @property {string} message - Human-readable error message for display to users
 * @property {number} [status] - Optional HTTP status code associated with the error (e.g., 400, 401, 500). Not present for local validation errors.
 */
export type AuthError = {
    code: string;
    message: string;
    status?: number;
};

/**
 * AuthEventType represents the type of authentication state change event from Supabase.
 *
 * This type enumerates all possible authentication state change events that can occur
 * when listening to Supabase's `onAuthStateChange` listener. These events are emitted
 * when the authentication state changes in the application.
 *
 * The event types correspond to Supabase's authentication event types:
 * - "INITIAL_SESSION": Initial session is retrieved from storage on app startup (emitted once on mount)
 * - "SIGNED_IN": User has successfully signed in
 * - "SIGNED_OUT": User has signed out or token has expired/invalidated
 * - "TOKEN_REFRESHED": Access token has been automatically refreshed by Supabase
 * - "USER_UPDATED": User information has been updated
 * - "PASSWORD_RECOVERY": Password recovery process has been initiated
 *
 * This type is exported separately to allow for reuse in other parts of the application
 * where authentication event types need to be referenced or checked.
 */
export type AuthEventType =
    | "INITIAL_SESSION"
    | "SIGNED_IN"
    | "SIGNED_OUT"
    | "TOKEN_REFRESHED"
    | "USER_UPDATED"
    | "PASSWORD_RECOVERY";

/**
 * SessionChangeEvent represents an authentication state change event from Supabase.
 *
 * This type represents events that occur when the authentication state changes,
 * such as when a user signs in, signs out, token is refreshed, user is updated,
 * or password recovery is initiated. The event is emitted by Supabase's
 * `onAuthStateChange` listener and is used to synchronize session state across
 * all browser tabs and windows.
 *
 * The session field is null when the user signs out or the token expires/invalidates.
 * For all other events (SIGNED_IN, TOKEN_REFRESHED, USER_UPDATED), the session
 * contains the current active session data.
 *
 * This type is used throughout the application layers to handle real-time
 * session synchronization and automatic sign-out when tokens expire or are invalidated.
 *
 * @property {AuthEventType} event - Type of authentication state change event. See {@link AuthEventType} for all possible event types.
 * @property {Session | null} session - Current active session or null if no session exists.
 *   When event is "SIGNED_OUT", session is always null. For all other events,
 *   session contains the current session data with updated tokens if applicable.
 */
export type SessionChangeEvent = {
    event: AuthEventType;
    session: Session | null;
};

/**
 * SignInCredentials contains the information required to sign in a user.
 *
 * This type is used when a user attempts to authenticate with their existing
 * account. The credentials are validated before being sent to the authentication
 * service.
 *
 * @property {string} email - User's email address (must be a valid email format)
 * @property {string} password - User's password (plain text, will be hashed by the authentication service)
 */
export type SignInCredentials = {
    email: string;
    password: string;
};

/**
 * SignUpCredentials contains the information required to create a new user account.
 *
 * This type is used when a new user registers for the FBC Dashboard. The credentials
 * are validated before account creation. Additional optional fields may be added
 * in the future (e.g., name, phone number).
 *
 * @property {string} email - User's email address (must be a valid email format and unique)
 * @property {string} password - User's password (must meet password requirements, will be hashed by the authentication service)
 */
export type SignUpCredentials = {
    email: string;
    password: string;
};

