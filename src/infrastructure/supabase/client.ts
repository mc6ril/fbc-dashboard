/**
 * Supabase Client (Infrastructure). Single shared client for repositories.
 * Validates required env vars and configures auth behavior.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** Required env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`. */
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Validate required env vars; throw with helpful message on missing. */
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
 * Create configured Supabase client.
 * - persistSession: true
 * - autoRefreshToken: true
 * - detectSessionInUrl: false (prevents clearing valid localStorage sessions)
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

/** Singleton Supabase client instance. */
export const supabaseClient: SupabaseClient = createSupabaseClient();

