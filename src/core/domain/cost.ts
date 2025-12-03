/**
 * Cost Domain Types
 *
 * Pure TypeScript types for cost tracking operations in the FBC Dashboard.
 * These types represent monthly costs including shipping costs and indirect costs
 * (marketing, overhead) that are used in revenue calculations.
 *
 * This domain layer contains no external dependencies and follows Clean
 * Architecture principles. All types are used throughout the application
 * layers (usecases, infrastructure, presentation) to maintain type safety
 * and business logic consistency.
 */

/**
 * MonthlyCostId is a branded type for monthly cost identifiers.
 *
 * This branded type provides additional type safety by preventing accidental
 * mixing of different ID types (e.g., MonthlyCostId with ProductId).
 * At runtime, MonthlyCostId is still a string (UUID format), but TypeScript
 * enforces type safety at compile time.
 */
export type MonthlyCostId = string & { readonly brand: unique symbol };

/**
 * MonthlyCost represents monthly shipping and indirect costs for a specific month.
 *
 * This type stores cost data per month (YYYY-MM format) for revenue calculations.
 * Costs are entered manually per month, not per sale, and are used to calculate
 * net result (gross margin - total indirect costs).
 *
 * Business meaning:
 * - id: Unique identifier for the cost record (UUID format)
 * - month: Month in YYYY-MM format (e.g., "2025-01" for January 2025). Must be unique per month.
 * - shippingCost: Shipping cost for the month in euros (NUMERIC 10,2). Defaults to 0. Must be >= 0.
 * - marketingCost: Marketing cost for the month in euros (NUMERIC 10,2). Defaults to 0. Must be >= 0.
 * - overheadCost: Overhead cost (frais généraux) for the month in euros (NUMERIC 10,2). Defaults to 0. Must be >= 0.
 *
 * Business rules:
 * - Each month (YYYY-MM) can have only one cost record (UNIQUE constraint in database)
 * - Month format must be YYYY-MM (e.g., "2025-01", "2025-02")
 * - All cost fields must be non-negative (>= 0)
 * - Costs default to 0 if not specified
 * - Shipping costs are entered monthly, not per sale
 * - Indirect costs (marketing, overhead) are predefined lines that can be edited per month
 *
 * Total indirect costs calculation:
 * - totalIndirectCosts = marketingCost + overheadCost
 * - Used in net result calculation: netResult = grossMargin - totalIndirectCosts
 *
 * @property {MonthlyCostId} id - Unique identifier for the cost record (UUID format)
 * @property {string} month - Month in YYYY-MM format (e.g., "2025-01" for January 2025). Must be unique per month.
 * @property {number} shippingCost - Shipping cost for the month in euros (NUMERIC 10,2). Defaults to 0. Must be >= 0.
 * @property {number} marketingCost - Marketing cost for the month in euros (NUMERIC 10,2). Defaults to 0. Must be >= 0.
 * @property {number} overheadCost - Overhead cost (frais généraux) for the month in euros (NUMERIC 10,2). Defaults to 0. Must be >= 0.
 *
 * @example
 * ```typescript
 * const monthlyCost: MonthlyCost = {
 *   id: "123e4567-e89b-12d3-a456-426614174000" as MonthlyCostId,
 *   month: "2025-01",
 *   shippingCost: 100.50,
 *   marketingCost: 50.25,
 *   overheadCost: 75.00
 * };
 * ```
 */
export type MonthlyCost = {
    id: MonthlyCostId;
    month: string; // Format: YYYY-MM (e.g., "2025-01")
    shippingCost: number;
    marketingCost: number;
    overheadCost: number;
};

