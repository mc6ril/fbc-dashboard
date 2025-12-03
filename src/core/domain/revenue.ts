/**
 * Revenue Domain Types
 *
 * Pure TypeScript types for revenue tracking and financial analysis in the FBC Dashboard.
 * These types represent financial metrics computed from sales activities, including
 * revenue, material costs, gross margin, and margin rates.
 *
 * This domain layer contains no external dependencies and follows Clean
 * Architecture principles. All types are used throughout the application
 * layers (usecases, infrastructure, presentation) to maintain type safety
 * and business logic consistency.
 */

/**
 * RevenuePeriod represents the time period selection for revenue analysis.
 *
 * This enum classifies different period types that users can select to view
 * revenue data. Each period type represents a different time range:
 * - MONTH: A calendar month (e.g., January 2025, February 2025)
 * - QUARTER: A calendar quarter (Q1: Jan-Mar, Q2: Apr-Jun, Q3: Jul-Sep, Q4: Oct-Dec)
 * - YEAR: A calendar year (e.g., 2025, 2026)
 * - CUSTOM: A user-defined date range (start date to end date)
 *
 * Period selection enables users to analyze revenue performance across
 * different time frames, from monthly reviews to annual summaries.
 *
 * Business meaning:
 * - MONTH: Used for monthly financial reviews and month-over-month comparisons
 * - QUARTER: Used for quarterly business reviews and seasonal analysis
 * - YEAR: Used for annual financial summaries and year-over-year comparisons
 * - CUSTOM: Used for analyzing specific time periods (e.g., marketing campaigns, seasonal events)
 *
 * Date boundaries:
 * - MONTH: First day of the month 00:00:00 to last day 23:59:59
 * - QUARTER: First day of the quarter 00:00:00 to last day 23:59:59
 * - YEAR: January 1st 00:00:00 to December 31st 23:59:59
 * - CUSTOM: User-selected start date to user-selected end date
 *
 * @example
 * ```typescript
 * const revenueData = await computeRevenue(
 *   activityRepository,
 *   productRepository,
 *   RevenuePeriod.MONTH,
 *   "2025-01-01T00:00:00.000Z",
 *   "2025-01-31T23:59:59.999Z"
 * );
 * ```
 */
export enum RevenuePeriod {
    MONTH = "MONTH",
    QUARTER = "QUARTER",
    YEAR = "YEAR",
    CUSTOM = "CUSTOM",
}

/**
 * RevenueData represents financial metrics for a selected time period.
 *
 * This type aggregates revenue, costs, and margin information for a specific
 * period, providing a comprehensive financial breakdown for business analysis.
 *
 * Business meaning:
 * - period: The selected period type (MONTH, QUARTER, YEAR, or CUSTOM)
 * - startDate: The start of the analysis period (ISO 8601 format, inclusive)
 * - endDate: The end of the analysis period (ISO 8601 format, inclusive)
 * - totalRevenue: Total revenue from all sales in the period (sum of SALE activity amounts)
 * - materialCosts: Total material costs for all sales in the period (sum of unitCost * quantitySold)
 * - grossMargin: Gross margin for the period (totalRevenue - materialCosts)
 * - grossMarginRate: Gross margin as a percentage (0-100), calculated as (grossMargin / totalRevenue) * 100
 *
 * Revenue calculation:
 * - totalRevenue = sum of all SALE activity amounts in the period
 * - Each SALE activity's `amount` field represents the total sale value for that transaction
 *
 * Material costs calculation:
 * - materialCosts = sum of (product.unitCost * abs(activity.quantity)) for all sales in the period
 * - unitCost is the cost per unit of the product at the time of sale
 * - quantitySold is the absolute value of activity.quantity (SALE activities typically have negative quantities)
 *
 * Gross margin calculation:
 * - grossMargin = totalRevenue - materialCosts
 * - Represents the profit before other costs (shipping, indirect costs, etc.)
 *
 * Gross margin rate calculation:
 * - If totalRevenue > 0: grossMarginRate = (grossMargin / totalRevenue) * 100
 * - If totalRevenue = 0: grossMarginRate = 0 (prevents division by zero)
 * - Expressed as a percentage (0-100)
 *
 * Date fields are stored as ISO 8601 strings (e.g., "2025-01-27T14:00:00.000Z")
 * to ensure compatibility with Supabase responses, React Query serialization,
 * Zustand state persistence, and Next.js server-side hydration.
 *
 * @property {RevenuePeriod} period - Selected period type (MONTH, QUARTER, YEAR, or CUSTOM)
 * @property {string} startDate - Start date of the analysis period (ISO 8601 format, inclusive, e.g., "2025-01-01T00:00:00.000Z")
 * @property {string} endDate - End date of the analysis period (ISO 8601 format, inclusive, e.g., "2025-01-31T23:59:59.999Z")
 * @property {number} totalRevenue - Total revenue from all sales in the period (sum of SALE activity amounts)
 * @property {number} materialCosts - Total material costs for all sales in the period (sum of unitCost * quantitySold)
 * @property {number} grossMargin - Gross margin for the period (totalRevenue - materialCosts)
 * @property {number} grossMarginRate - Gross margin as a percentage (0-100), calculated as (grossMargin / totalRevenue) * 100
 *
 * @example
 * ```typescript
 * const revenueData: RevenueData = {
 *   period: RevenuePeriod.MONTH,
 *   startDate: "2025-01-01T00:00:00.000Z",
 *   endDate: "2025-01-31T23:59:59.999Z",
 *   totalRevenue: 12500.75,
 *   materialCosts: 6500.50,
 *   grossMargin: 6000.25,
 *   grossMarginRate: 48.0
 * };
 * ```
 */
export type RevenueData = {
    period: RevenuePeriod;
    startDate: string;
    endDate: string;
    totalRevenue: number;
    materialCosts: number;
    grossMargin: number;
    grossMarginRate: number;
};

/**
 * RevenueError represents a revenue-related error in the system.
 *
 * This type standardizes error handling across all revenue operations.
 * Errors can occur during revenue calculation, validation, or any other
 * revenue operation. The error includes a code for programmatic handling
 * and a user-friendly message.
 *
 * @property {string} code - Error code for programmatic error handling (e.g., "VALIDATION_ERROR", "NOT_FOUND")
 * @property {string} message - Human-readable error message for display to users
 */
export type RevenueError = {
    code: string;
    message: string;
};

