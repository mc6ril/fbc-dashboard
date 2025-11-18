/**
 * Activity Repository Port Interface (Domain → Ports).
 * Contract only: returns domain types, throws errors on failure.
 */

import type { Activity, ActivityId } from "../domain/activity";

// Note: Errors are referenced in JSDoc @throws tags but not imported
// as TypeScript doesn't type thrown exceptions. The error contract is
// documented in method JSDoc comments.

/**
 * Activity operations contract.
 *
 * This interface defines the contract for activity data access operations.
 * Implementations must provide methods for listing, retrieving, creating,
 * and updating activities. All methods return domain types and throw errors
 * on failure.
 */
export interface ActivityRepository {
    /**
     * List all activities.
     *
     * Retrieves all activities from the data store. Returns an empty array
     * if no activities exist.
     *
     * Note: Ordering is implementation-specific and not guaranteed by this contract.
     *
     * @returns Promise resolving to an array of all activities
     * @throws {Error} If the data retrieval fails (e.g., database connection error, query error)
     */
    list(): Promise<Activity[]>;

    /**
     * Get a single activity by its ID.
     *
     * Retrieves an activity with the specified ID. Returns null if the activity
     * does not exist.
     *
     * @param {ActivityId} id - The unique identifier of the activity to retrieve
     * @returns Promise resolving to the activity if found, or null if not found
     * @throws {Error} If the data retrieval fails (e.g., database connection error, query error)
     */
    getById(id: ActivityId): Promise<Activity | null>;

    /**
     * Create a new activity.
     *
     * Creates a new activity in the data store. The activity ID will be generated
     * by the implementation (typically by the database). The created activity with
     * its generated ID is returned.
     *
     * Business rules enforced by implementations:
     * - productId is REQUIRED for SALE and STOCK_CORRECTION types
     * - productId is OPTIONAL for CREATION and OTHER types
     * - date must be a valid ISO 8601 string
     * - quantity and amount must be valid numbers
     *
     * @param {Omit<Activity, 'id'>} activity - The activity data to create (without the id field)
     * @returns Promise resolving to the created activity with its generated ID
     * @throws {Error} If validation fails (e.g., missing required fields, invalid data)
     * @throws {Error} If the creation fails (e.g., database connection error, constraint violation)
     */
    create(activity: Omit<Activity, "id">): Promise<Activity>;

    /**
     * Update an existing activity.
     *
     * Updates an activity with the specified ID. Only the provided fields will be
     * updated; omitted fields remain unchanged. Returns the updated activity.
     *
     * Business rules enforced by implementations:
     * - If productId is updated, it must be valid for the activity type
     * - If date is updated, it must be a valid ISO 8601 string
     * - If quantity or amount are updated, they must be valid numbers
     *
     * @param {ActivityId} id - The unique identifier of the activity to update
     * @param {Partial<Activity>} updates - The fields to update (partial activity object)
     * @returns Promise resolving to the updated activity
     * @throws {Error} If the activity with the given ID does not exist
     * @throws {Error} If validation fails (e.g., invalid data in updates)
     * @throws {Error} If the update fails (e.g., database connection error, constraint violation)
     */
    update(id: ActivityId, updates: Partial<Activity>): Promise<Activity>;
}

