/**
 * Supabase implementation of `ActivityRepository` (Infrastructure).
 * Maps Supabase types to domain types and propagates errors.
 */

import { supabaseClient } from "./client";
import type { ActivityRepository } from "@/core/ports/activityRepository";
import type { Activity, ActivityId } from "@/core/domain/activity";
import type { ProductId } from "@/core/domain/product";
import { SupabaseActivityPayload, SupabaseActivityRow } from "./types";
import { parseValidNumber } from "@/shared/utils/number";

/**
 * Map Supabase row to domain Activity.
 *
 * Converts:
 * - snake_case → camelCase (e.g., `product_id` → `productId`)
 * - NUMERIC strings → numbers (e.g., `"10.50"` → `10.50`)
 * - TIMESTAMPTZ → ISO 8601 string (already in ISO format from Supabase)
 * - UUID → ActivityId (branded type)
 * - null product_id → undefined productId
 * - null note → undefined note
 *
 * @param {SupabaseActivityRow} row - Supabase row from database
 * @returns {Activity} Domain activity object
 * @throws {Error} If required fields are missing or invalid
 */
const mapSupabaseRowToActivity = (row: SupabaseActivityRow): Activity => {
    if (!row.id) {
        throw new Error("Activity ID is required");
    }

    if (!row.type) {
        throw new Error("Activity type is required");
    }

    if (!row.date) {
        throw new Error("Activity date is required");
    }

    if (row.quantity === undefined || row.quantity === null) {
        throw new Error("Activity quantity is required");
    }

    if (row.amount === undefined || row.amount === null) {
        throw new Error("Activity amount is required");
    }

    // Convert NUMERIC strings to numbers
    const quantity = parseValidNumber(row.quantity, "quantity");
    const amount = parseValidNumber(row.amount, "amount");

    return {
        id: row.id as ActivityId,
        date: row.date, // Already ISO 8601 string from Supabase
        type: row.type as Activity["type"],
        productId: row.product_id ? (row.product_id as ProductId) : undefined,
        quantity,
        amount,
        note: row.note ?? undefined,
    };
};

/**
 * Map domain Activity to Supabase insert/update payload.
 *
 * Converts:
 * - camelCase → snake_case (e.g., `productId` → `product_id`)
 * - numbers → NUMERIC (Supabase handles conversion)
 * - ISO 8601 string → TIMESTAMPTZ (Supabase handles conversion)
 * - undefined productId → null product_id
 * - undefined note → null note
 *
 * For partial updates (Partial<Activity>), only includes fields that are explicitly provided.
 * For create operations (Omit<Activity, 'id'>), all required fields must be present.
 *
 * @param {Omit<Activity, 'id'> | Partial<Activity>} activity - Domain activity object (without id for create, partial for update)
 * @returns {SupabaseActivityPayload} Supabase payload object with only provided fields
 */
const mapActivityToSupabaseRow = (
    activity: Omit<Activity, "id"> | Partial<Activity>
): SupabaseActivityPayload => {
    const payload: SupabaseActivityPayload = {};

    // Only include fields that are explicitly provided in the activity object
    if ("type" in activity && activity.type !== undefined) {
        payload.type = activity.type;
    }

    if ("date" in activity && activity.date !== undefined) {
        payload.date = activity.date;
    }

    if ("quantity" in activity && activity.quantity !== undefined) {
        payload.quantity = activity.quantity;
    }

    if ("amount" in activity && activity.amount !== undefined) {
        payload.amount = activity.amount;
    }

    // Handle optional productId (null in database if undefined)
    if ("productId" in activity) {
        payload.product_id = activity.productId ?? null;
    }

    // Handle optional note (null in database if undefined)
    if ("note" in activity) {
        payload.note = activity.note ?? null;
    }

    return payload;
};

/**
 * Transform Supabase error to generic Error.
 *
 * Preserves error message for debugging while converting to standard Error type.
 *
 * @param {unknown} error - Supabase error object
 * @returns {Error} Generic Error object with message
 */
const transformSupabaseError = (error: unknown): Error => {
    if (error instanceof Error) {
        return error;
    }

    if (
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof error.message === "string"
    ) {
        return new Error(error.message);
    }

    return new Error("An unknown error occurred");
};

/** Concrete `ActivityRepository` using Supabase. */
export const activityRepositorySupabase: ActivityRepository = {
    /**
     * List all activities.
     *
     * Retrieves all activities from Supabase and maps them to domain types.
     * Returns an empty array if no activities exist.
     *
     * @returns {Promise<Activity[]>} Promise resolving to an array of all activities
     * @throws {Error} If the data retrieval fails
     */
    list: async (): Promise<Activity[]> => {
        const { data, error } = await supabaseClient
            .from("activities")
            .select();

        if (error) {
            throw transformSupabaseError(error);
        }

        if (!data) {
            return [];
        }

        // Map all rows to domain types
        return data.map((row) => mapSupabaseRowToActivity(row as SupabaseActivityRow));
    },

    /**
     * Get a single activity by its ID.
     *
     * Retrieves an activity with the specified ID from Supabase.
     * Returns null if the activity does not exist.
     *
     * @param {ActivityId} id - The unique identifier of the activity to retrieve
     * @returns {Promise<Activity | null>} Promise resolving to the activity if found, or null if not found
     * @throws {Error} If the data retrieval fails
     */
    getById: async (id: ActivityId): Promise<Activity | null> => {
        const { data, error } = await supabaseClient
            .from("activities")
            .select()
            .eq("id", id)
            .single();

        if (error) {
            // Supabase returns an error when no row is found (PGRST116)
            // Check if it's a "not found" error and return null
            if (
                typeof error === "object" &&
                error !== null &&
                "code" in error &&
                error.code === "PGRST116"
            ) {
                return null;
            }

            throw transformSupabaseError(error);
        }

        if (!data) {
            return null;
        }

        return mapSupabaseRowToActivity(data as SupabaseActivityRow);
    },

    /**
     * Create a new activity.
     *
     * Creates a new activity in Supabase and returns the created activity
     * with its generated ID.
     *
     * @param {Omit<Activity, 'id'>} activity - The activity data to create (without the id field)
     * @returns {Promise<Activity>} Promise resolving to the created activity with its generated ID
     * @throws {Error} If validation fails or creation fails
     */
    create: async (activity: Omit<Activity, "id">): Promise<Activity> => {
        const payload = mapActivityToSupabaseRow(activity);

        const { data, error } = await supabaseClient
            .from("activities")
            .insert(payload)
            .select()
            .single();

        if (error) {
            throw transformSupabaseError(error);
        }

        if (!data) {
            throw new Error("Activity creation failed: No data returned");
        }

        return mapSupabaseRowToActivity(data as SupabaseActivityRow);
    },

    /**
     * Update an existing activity.
     *
     * Updates an activity with the specified ID in Supabase.
     * Only the provided fields will be updated.
     *
     * @param {ActivityId} id - The unique identifier of the activity to update
     * @param {Partial<Activity>} updates - The fields to update (partial activity object)
     * @returns {Promise<Activity>} Promise resolving to the updated activity
     * @throws {Error} If the activity with the given ID does not exist or update fails
     */
    update: async (id: ActivityId, updates: Partial<Activity>): Promise<Activity> => {
        const payload = mapActivityToSupabaseRow(updates);

        const { data, error } = await supabaseClient
            .from("activities")
            .update(payload)
            .eq("id", id)
            .select()
            .single();

        if (error) {
            // Supabase returns an error when no row is found (PGRST116)
            if (
                typeof error === "object" &&
                error !== null &&
                "code" in error &&
                error.code === "PGRST116"
            ) {
                throw new Error(`Activity with id ${id} not found`);
            }

            throw transformSupabaseError(error);
        }

        if (!data) {
            throw new Error(`Activity with id ${id} not found`);
        }

        return mapSupabaseRowToActivity(data as SupabaseActivityRow);
    },

    /**
     * Delete an activity by its ID.
     *
     * Removes an activity from Supabase. Used for rollback scenarios when
     * activity creation succeeds but subsequent operations fail.
     *
     * @param {ActivityId} id - The unique identifier of the activity to delete
     * @returns Promise that resolves when the activity is deleted
     * @throws {Error} If the activity does not exist or deletion fails
     */
    delete: async (id: ActivityId): Promise<void> => {
        const { error } = await supabaseClient
            .from("activities")
            .delete()
            .eq("id", id);

        if (error) {
            // Supabase returns an error when no row is found (PGRST116)
            if (
                typeof error === "object" &&
                error !== null &&
                "code" in error &&
                error.code === "PGRST116"
            ) {
                throw new Error(`Activity with id ${id} not found`);
            }

            throw transformSupabaseError(error);
        }
    },
};

