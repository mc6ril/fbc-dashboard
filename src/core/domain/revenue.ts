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

import type { ProductType } from "./product";
import type { ProductId } from "./product";

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
 * RevenueByProductType represents revenue breakdown by product type.
 *
 * This type groups sales by ProductType and provides aggregated revenue metrics
 * for each product type in a given period. Used for expandable revenue rows
 * to show detailed breakdowns by product category.
 *
 * Business meaning:
 * - type: Product type classification (SAC_BANANE, POCHETTE_ORDINATEUR, etc.)
 * - revenue: Total revenue from all sales of this product type in the period
 * - count: Number of sales transactions for this product type in the period
 *
 * Revenue calculation:
 * - revenue = sum of all SALE activity amounts for products of this type in the period
 * - count = number of distinct SALE activities for products of this type
 *
 * @property {ProductType} type - Product type classification
 * @property {number} revenue - Total revenue from sales of this product type in the period
 * @property {number} count - Number of sales transactions for this product type in the period
 *
 * @example
 * ```typescript
 * const revenueByType: RevenueByProductType = {
 *   type: ProductType.POCHETTE_VOLANTS,
 *   revenue: 5000.00,
 *   count: 25
 * };
 * ```
 */
export type RevenueByProductType = {
    type: ProductType;
    revenue: number;
    count: number;
};

/**
 * RevenueByProduct represents revenue breakdown by individual product.
 *
 * This type groups sales by individual products (product model + coloris) and provides
 * aggregated revenue metrics for each product in a given period. Used for expandable
 * revenue rows to show detailed breakdowns by individual products.
 *
 * Business meaning:
 * - productId: Unique identifier for the product
 * - productName: Name of the product model (e.g., "Charlie", "Assumée")
 * - coloris: Color variation of the product (e.g., "Rose Marsala", "Prune")
 * - revenue: Total revenue from all sales of this product in the period
 * - count: Number of sales transactions for this product in the period
 *
 * Revenue calculation:
 * - revenue = sum of all SALE activity amounts for this product in the period
 * - count = number of distinct SALE activities for this product
 *
 * @property {ProductId} productId - Unique identifier for the product
 * @property {string} productName - Name of the product model (e.g., "Charlie", "Assumée")
 * @property {string} coloris - Color variation of the product (e.g., "Rose Marsala", "Prune")
 * @property {number} revenue - Total revenue from sales of this product in the period
 * @property {number} count - Number of sales transactions for this product in the period
 *
 * @example
 * ```typescript
 * const revenueByProduct: RevenueByProduct = {
 *   productId: "123e4567-e89b-12d3-a456-426614174000" as ProductId,
 *   productName: "Charlie",
 *   coloris: "Rose Marsala",
 *   revenue: 2500.00,
 *   count: 10
 * };
 * ```
 */
export type RevenueByProduct = {
    productId: ProductId;
    productName: string;
    coloris: string;
    revenue: number;
    count: number;
};

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
 * - costs.shipping: Shipping cost for the period (sum of monthly shipping costs)
 * - indirectCosts: Indirect costs object with predefined lines (marketing, overhead)
 * - netResult: Net result for the period (grossMargin - totalIndirectCosts)
 * - netMarginRate: Net margin as a percentage (0-100), calculated as (netResult / totalRevenue) * 100
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
 * Shipping costs calculation:
 * - costs.shipping = sum of monthly shipping costs for all months in the period
 * - Shipping costs are entered manually per month (not per sale)
 * - For MONTH period: single month's shipping cost
 * - For QUARTER/YEAR period: sum of shipping costs across all months in the period
 *
 * Indirect costs calculation:
 * - indirectCosts.marketing = sum of monthly marketing costs for all months in the period
 * - indirectCosts.overhead = sum of monthly overhead costs for all months in the period
 * - Total indirect costs = indirectCosts.marketing + indirectCosts.overhead
 * - Indirect costs are entered manually per month (not per sale)
 *
 * Net result calculation:
 * - netResult = grossMargin - totalShippingCost - totalIndirectCosts
 * - Represents the profit after all costs (material, shipping, indirect)
 * - totalShippingCost = sum of monthly shipping costs for all months in the period
 * - totalIndirectCosts = indirectCosts.marketing + indirectCosts.overhead
 *
 * Net margin rate calculation:
 * - If totalRevenue > 0: netMarginRate = (netResult / totalRevenue) * 100
 * - If totalRevenue = 0: netMarginRate = 0 (prevents division by zero)
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
 * @property {{ shipping: number }} costs - Cost breakdown object containing shipping cost for the period
 * @property {{ marketing: number; overhead: number }} indirectCosts - Indirect costs object with predefined lines (marketing, overhead)
 * @property {number} netResult - Net result for the period (grossMargin - totalIndirectCosts)
 * @property {number} netMarginRate - Net margin as a percentage (0-100), calculated as (netResult / totalRevenue) * 100
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
 *   grossMarginRate: 48.0,
 *   costs: {
 *     shipping: 100.50
 *   },
 *   indirectCosts: {
 *     marketing: 50.25,
 *     overhead: 75.00
 *   },
 *   netResult: 5874.50,
 *   netMarginRate: 47.0
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
    costs: {
        shipping: number;
    };
    indirectCosts: {
        marketing: number;
        overhead: number;
    };
    netResult: number;
    netMarginRate: number;
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

