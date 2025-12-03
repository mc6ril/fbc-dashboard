/**
 * Cost Repository Port Interface (Domain → Ports).
 * Contract only: returns domain types, throws errors on failure.
 */

import type { MonthlyCost } from "../domain/cost";

// Note: Errors are referenced in JSDoc @throws tags but not imported
// as TypeScript doesn't type thrown exceptions. The error contract is
// documented in method JSDoc comments.

/**
 * Cost operations contract.
 *
 * This interface defines the contract for monthly cost data access operations.
 * Implementations must provide methods for retrieving and creating/updating
 * monthly costs. All methods return domain types and throw errors on failure.
 */
export interface CostRepository {
    /**
     * Get monthly cost for a specific month.
     *
     * Retrieves the monthly cost record for the specified month (YYYY-MM format).
     * Returns null if no cost record exists for that month.
     *
     * Business rules:
     * - month must be in YYYY-MM format (e.g., "2025-01", "2025-02")
     * - Each month can have only one cost record (enforced by UNIQUE constraint in database)
     *
     * @param {string} month - Month in YYYY-MM format (e.g., "2025-01" for January 2025)
     * @returns Promise resolving to the monthly cost if found, or null if not found
     * @throws {Error} If the data retrieval fails (e.g., database connection error, query error)
     * @throws {Error} If the month format is invalid (should be validated by usecase, but implementation may also validate)
     *
     * @example
     * ```typescript
     * const cost = await repo.getMonthlyCost("2025-01");
     * if (cost) {
     *   console.log(`Shipping: ${cost.shippingCost}, Marketing: ${cost.marketingCost}`);
     * }
     * ```
     */
    getMonthlyCost(month: string): Promise<MonthlyCost | null>;

    /**
     * Create or update monthly cost for a specific month.
     *
     * Performs an upsert operation: creates a new cost record if one doesn't exist
     * for the month, or updates the existing record if one already exists.
     *
     * Business rules enforced by implementations:
     * - month must be in YYYY-MM format (e.g., "2025-01", "2025-02")
     * - Each month can have only one cost record (enforced by UNIQUE constraint)
     * - All cost fields (shippingCost, marketingCost, overheadCost) must be non-negative (>= 0)
     * - If cost record exists, all provided fields are updated
     * - If cost record doesn't exist, a new one is created with the provided values
     * - Costs default to 0 if not specified (handled by database DEFAULT values)
     *
     * The implementation should use database-level upsert (e.g., PostgreSQL INSERT ... ON CONFLICT)
     * to ensure atomicity and prevent race conditions.
     *
     * @param {MonthlyCost} cost - The monthly cost data to create or update. Must include id, month, and all cost fields.
     * @returns Promise resolving to the created or updated monthly cost with its ID
     * @throws {Error} If validation fails (e.g., invalid month format, negative costs)
     * @throws {Error} If the upsert fails (e.g., database connection error, constraint violation)
     *
     * @example
     * ```typescript
     * const cost: MonthlyCost = {
     *   id: "123e4567-e89b-12d3-a456-426614174000" as MonthlyCostId,
     *   month: "2025-01",
     *   shippingCost: 100.50,
     *   marketingCost: 50.25,
     *   overheadCost: 75.00
     * };
     * const savedCost = await repo.createOrUpdateMonthlyCost(cost);
     * ```
     */
    createOrUpdateMonthlyCost(cost: MonthlyCost): Promise<MonthlyCost>;

    /**
     * Atomically update a specific cost field for a monthly cost record.
     *
     * Updates only the specified field (shipping, marketing, or overhead),
     * leaving other fields unchanged. This prevents lost updates when multiple
     * users modify different cost fields concurrently for the same month.
     *
     * If no record exists for the month, a new one is created with the specified
     * field value and other fields set to 0.
     *
     * Business rules:
     * - month must be in YYYY-MM format (e.g., "2025-01", "2025-02")
     * - fieldName must be one of: "shipping", "marketing", "overhead"
     * - value must be non-negative (>= 0)
     * - The update is atomic at the database level (single UPDATE/INSERT statement)
     *
     * The implementation should use a PostgreSQL function to ensure atomicity
     * and prevent race conditions.
     *
     * @param {string} month - Month in YYYY-MM format (e.g., "2025-01" for January 2025)
     * @param {"shipping" | "marketing" | "overhead"} fieldName - The cost field to update
     * @param {number} value - The new value for the field (must be >= 0)
     * @returns Promise resolving to the updated or created monthly cost
     * @throws {Error} If validation fails (e.g., invalid month format, invalid field name, negative value)
     * @throws {Error} If the update fails (e.g., database connection error, constraint violation)
     *
     * @example
     * ```typescript
     * const updatedCost = await repo.updateMonthlyCostField("2025-01", "shipping", 100.50);
     * // Only shipping_cost is updated, marketing_cost and overhead_cost remain unchanged
     * ```
     */
    updateMonthlyCostField(
        month: string,
        fieldName: "shipping" | "marketing" | "overhead",
        value: number
    ): Promise<MonthlyCost>;
}

