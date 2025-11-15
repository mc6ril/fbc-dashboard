/**
 * Supabase Client Singleton
 *
 * Creates and exports a singleton Supabase client instance for use throughout
 * the application. This client is used by all repository implementations in
 * the infrastructure layer to interact with Supabase services.
 *
 * The client validates required environment variables at runtime and throws
 * clear error messages if they are missing. This ensures fast failure with
 * helpful debugging information.
 *
 * Following Clean Architecture principles, this is the only place in the
 * codebase that directly imports and uses `@supabase/supabase-js`. All other
 * layers interact with Supabase through repository interfaces.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Required environment variables for Supabase client configuration.
 *
 * These variables must be set in `.env.local` file:
 * - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL (e.g., https://xxxxx.supabase.co)
 * - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous/public API key
 *
 * The `NEXT_PUBLIC_` prefix is required in Next.js for client-side environment variables.
 */
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Validates that required Supabase environment variables are present.
 *
 * Throws a clear error message indicating which variable(s) are missing.
 * This validation happens at runtime (not build time) to ensure the application
 * fails fast with helpful debugging information.
 *
 * @throws {Error} Throws an error if `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` is missing
 *
 * @example
 * ```typescript
 * // If NEXT_PUBLIC_SUPABASE_URL is missing:
 * // Error: Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL
 * // Please add it to your .env.local file.
 * ```
 */
const validateEnvironmentVariables = (): void => {
    const missingVariables: string[] = [];

    if (!SUPABASE_URL) {
        missingVariables.push("NEXT_PUBLIC_SUPABASE_URL");
    }

    if (!SUPABASE_ANON_KEY) {
        missingVariables.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
    }

    if (missingVariables.length > 0) {
        const variablesList = missingVariables.join(", ");
        throw new Error(
            `Missing required environment variable(s): ${variablesList}\n` +
                `Please add them to your .env.local file.\n` +
                `See .env.local.example for reference.`
        );
    }
};

/**
 * Creates and configures the Supabase client instance.
 *
 * The client is configured with:
 * - Auth persistence: Uses browser localStorage for session persistence
 * - Auto-refresh: Automatically refreshes expired tokens
 * - Session URL detection: DISABLED to prevent expired URL sessions from clearing valid localStorage sessions
 *
 * **Why `detectSessionInUrl` is disabled:**
 * When enabled, Supabase checks the URL for session parameters (used for OAuth callbacks).
 * If an expired/invalid session is found in the URL, Supabase may emit SIGNED_OUT events
 * and clear localStorage before checking for a valid session stored in localStorage.
 * This causes session persistence issues where valid sessions are cleared on page refresh.
 *
 * If OAuth is needed in the future, this should be re-enabled with proper handling
 * of expired URL sessions to avoid clearing valid localStorage sessions.
 *
 * @returns {SupabaseClient} Configured Supabase client instance
 * @throws {Error} Throws an error if required environment variables are missing
 */
const createSupabaseClient = (): SupabaseClient => {
    // Validate environment variables before creating client
    validateEnvironmentVariables();

    // TypeScript assertion: We know these are defined after validation
    // but TypeScript doesn't understand the throw in validateEnvironmentVariables
    const url = SUPABASE_URL as string;
    const anonKey = SUPABASE_ANON_KEY as string;

    return createClient(url, anonKey, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            // Disabled to prevent expired URL sessions from clearing valid localStorage sessions
            // When enabled, if Supabase finds an expired session in the URL (e.g., from a previous
            // OAuth callback), it may emit SIGNED_OUT and clear localStorage before INITIAL_SESSION
            // can restore the valid session from localStorage
            detectSessionInUrl: false,
        },
    });
};

/**
 * Singleton Supabase client instance.
 *
 * This is the single source of truth for Supabase client access throughout
 * the application. The client is created once when this module is first imported
 * and reused for all subsequent operations.
 *
 * The singleton pattern ensures:
 * - Single connection pool
 * - Consistent configuration
 * - Efficient resource usage
 * - Proper session management
 *
 * @example
 * ```typescript
 * import { supabaseClient } from "@/infrastructure/supabase/client";
 *
 * // Use the client in repository implementations
 * const { data, error } = await supabaseClient.auth.signInWithPassword({
 *   email: "user@example.com",
 *   password: "password123",
 * });
 * ```
 */
export const supabaseClient: SupabaseClient = createSupabaseClient();

