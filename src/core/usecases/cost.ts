/**
 * Cost Usecases (Usecase layer).
 * Orchestrate cost management operations. Return domain types only.
 */

import type { CostRepository } from "@/core/ports/costRepository";
import type { MonthlyCost } from "@/core/domain/cost";
import { isValidMonthFormat } from "@/shared/utils/date";

/**
 * Validates cost values are non-negative.
 *
 * Validates that all cost fields (shippingCost, marketingCost, overheadCost)
 * are non-negative numbers (>= 0).
 *
 * @param {number} shippingCost - Shipping cost to validate
 * @param {number} marketingCost - Marketing cost to validate
 * @param {number} overheadCost - Overhead cost to validate
 * @returns {boolean} True if all costs are non-negative, false otherwise
 */
const isValidCostValues = (
    shippingCost: number,
    marketingCost: number,
    overheadCost: number
): boolean => {
    return (
        shippingCost >= 0 &&
        marketingCost >= 0 &&
        overheadCost >= 0 &&
        !isNaN(shippingCost) &&
        !isNaN(marketingCost) &&
        !isNaN(overheadCost) &&
        isFinite(shippingCost) &&
        isFinite(marketingCost) &&
        isFinite(overheadCost)
    );
};

/**
 * Retrieves monthly cost for a specific month.
 *
 * This usecase retrieves the monthly cost record for the specified month (YYYY-MM format).
 * Returns null if no cost record exists for that month.
 *
 * Business rules:
 * - month must be in YYYY-MM format (e.g., "2025-01", "2025-12")
 * - Month must be valid (year >= 1, month between 01-12)
 *
 * @param {CostRepository} repo - Cost repository for data retrieval
 * @param {string} month - Month in YYYY-MM format (e.g., "2025-01" for January 2025)
 * @returns {Promise<MonthlyCost | null>} Promise resolving to the monthly cost if found, or null if not found
 * @throws {Error} If the month format is invalid (not YYYY-MM format or invalid month number)
 * @throws {Error} If repository retrieval fails (database connection error, query error, etc.)
 *
 * @example
 * ```typescript
 * const cost = await getMonthlyCost(costRepository, "2025-01");
 * if (cost) {
 *   console.log(`Shipping: ${cost.shippingCost}, Marketing: ${cost.marketingCost}`);
 * }
 * ```
 */
export const getMonthlyCost = async (
    repo: CostRepository,
    month: string
): Promise<MonthlyCost | null> => {
    // Validate month format
    if (!isValidMonthFormat(month)) {
        throw new Error(
            `Invalid month format: ${month}. Expected YYYY-MM format (e.g., "2025-01")`
        );
    }

    // Delegate to repository
    return repo.getMonthlyCost(month);
};

/**
 * Creates or updates monthly cost for a specific month.
 *
 * This usecase validates business rules before delegating to the repository:
 * - Validates month format (YYYY-MM)
 * - Validates all cost values are non-negative (>= 0)
 * - Validates cost values are valid numbers (not NaN, not Infinity)
 * - Delegates to repository for upsert operation
 *
 * Business rules:
 * - month must be in YYYY-MM format (e.g., "2025-01", "2025-12")
 * - Month must be valid (year >= 1, month between 01-12)
 * - All cost fields (shippingCost, marketingCost, overheadCost) must be non-negative (>= 0)
 * - All cost fields must be valid numbers (not NaN, not Infinity)
 * - If cost record exists for the month, it's updated
 * - If no cost record exists, a new one is created
 *
 * The repository performs an atomic upsert operation at the database level,
 * preventing race conditions when multiple updates occur concurrently.
 *
 * @param {CostRepository} repo - Cost repository for data persistence
 * @param {MonthlyCost} cost - Monthly cost data to create or update. Must include id, month, and all cost fields.
 * @returns {Promise<MonthlyCost>} Promise resolving to the created or updated monthly cost
 * @throws {Error} If month format is invalid (not YYYY-MM format or invalid month number)
 * @throws {Error} If cost values are invalid (negative, NaN, or Infinity)
 * @throws {Error} If repository upsert fails (database connection error, constraint violation, etc.)
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
 * const savedCost = await createOrUpdateMonthlyCost(costRepository, cost);
 * ```
 */
export const createOrUpdateMonthlyCost = async (
    repo: CostRepository,
    cost: MonthlyCost
): Promise<MonthlyCost> => {
    // Validate month format
    if (!isValidMonthFormat(cost.month)) {
        throw new Error(
            `Invalid month format: ${cost.month}. Expected YYYY-MM format (e.g., "2025-01")`
        );
    }

    // Validate cost values are non-negative and valid numbers
    if (
        !isValidCostValues(
            cost.shippingCost,
            cost.marketingCost,
            cost.overheadCost
        )
    ) {
        throw new Error(
            `Invalid cost values: all costs must be non-negative numbers. ` +
                `shippingCost: ${cost.shippingCost}, ` +
                `marketingCost: ${cost.marketingCost}, ` +
                `overheadCost: ${cost.overheadCost}`
        );
    }

    // Delegate to repository for upsert
    return repo.createOrUpdateMonthlyCost(cost);
};

/**
 * Atomically updates a specific cost field for a monthly cost record.
 *
 * This usecase validates business rules before delegating to the repository:
 * - Validates month format (YYYY-MM)
 * - Validates field name is one of: "shipping", "marketing", "overhead"
 * - Validates value is non-negative (>= 0)
 * - Validates value is a valid number (not NaN, not Infinity)
 * - Delegates to repository for atomic field update
 *
 * Business rules:
 * - month must be in YYYY-MM format (e.g., "2025-01", "2025-12")
 * - Month must be valid (year >= 1, month between 01-12)
 * - fieldName must be one of: "shipping", "marketing", "overhead"
 * - value must be non-negative (>= 0)
 * - value must be a valid number (not NaN, not Infinity)
 * - Only the specified field is updated, other fields remain unchanged
 * - If no record exists for the month, a new one is created
 *
 * The repository uses a PostgreSQL function to ensure atomicity at the database
 * level, preventing lost updates when multiple users modify different cost fields
 * concurrently for the same month.
 *
 * @param {CostRepository} repo - Cost repository for data persistence
 * @param {string} month - Month in YYYY-MM format (e.g., "2025-01" for January 2025)
 * @param {"shipping" | "marketing" | "overhead"} fieldName - The cost field to update
 * @param {number} value - The new value for the field (must be >= 0)
 * @returns {Promise<MonthlyCost>} Promise resolving to the updated or created monthly cost
 * @throws {Error} If month format is invalid (not YYYY-MM format or invalid month number)
 * @throws {Error} If fieldName is invalid (not one of: "shipping", "marketing", "overhead")
 * @throws {Error} If value is invalid (negative, NaN, or Infinity)
 * @throws {Error} If repository update fails (database connection error, constraint violation, etc.)
 *
 * @example
 * ```typescript
 * const updatedCost = await updateMonthlyCostField(
 *   costRepository,
 *   "2025-01",
 *   "shipping",
 *   100.50
 * );
 * // Only shippingCost is updated, marketingCost and overheadCost remain unchanged
 * ```
 */
export const updateMonthlyCostField = async (
    repo: CostRepository,
    month: string,
    fieldName: "shipping" | "marketing" | "overhead",
    value: number
): Promise<MonthlyCost> => {
    // Validate month format
    if (!isValidMonthFormat(month)) {
        throw new Error(
            `Invalid month format: ${month}. Expected YYYY-MM format (e.g., "2025-01")`
        );
    }

    // Validate field name
    if (fieldName !== "shipping" && fieldName !== "marketing" && fieldName !== "overhead") {
        throw new Error(
            `Invalid field name: ${fieldName}. Must be one of: "shipping", "marketing", "overhead"`
        );
    }

    // Validate value is non-negative and valid number
    if (isNaN(value) || !isFinite(value) || value < 0) {
        throw new Error(
            `Invalid value: ${value}. Must be a non-negative finite number (>= 0)`
        );
    }

    // Delegate to repository for atomic field update
    return repo.updateMonthlyCostField(month, fieldName, value);
};

