/**
 * Statistics Domain Types
 *
 * Pure TypeScript types for business analytics and statistics in the FBC Dashboard.
 * These types represent aggregated business metrics computed from activities and products,
 * such as profits, sales, creations, and margins.
 *
 * This domain layer contains no external dependencies and follows Clean
 * Architecture principles. All types are used throughout the application
 * layers (usecases, infrastructure, presentation) to maintain type safety
 * and business logic consistency.
 */

import type { ProductId } from "./product";

/**
 * StatisticsPeriod represents the time period for aggregating statistics.
 *
 * This enum classifies different time periods for statistics computation:
 * - DAILY: Statistics aggregated by day (format: YYYY-MM-DD)
 * - MONTHLY: Statistics aggregated by month (format: YYYY-MM)
 * - YEARLY: Statistics aggregated by year (format: YYYY)
 *
 * Period grouping enables time-based analysis of business performance,
 * allowing users to compare statistics across different time ranges.
 *
 * @example
 * ```typescript
 * const dailyProfits = await computeProfitsByPeriod(
 *   repo,
 *   StatisticsPeriod.DAILY,
 *   "2025-01-01T00:00:00.000Z",
 *   "2025-01-31T23:59:59.999Z"
 * );
 * // Returns: [{ period: "2025-01-01", profit: 150.50, ... }, ...]
 * ```
 */
export enum StatisticsPeriod {
    DAILY = "DAILY",
    MONTHLY = "MONTHLY",
    YEARLY = "YEARLY",
}

/**
 * PeriodStatistics represents statistics for a specific time period.
 *
 * This type groups statistics data with a period key and the computed metrics
 * for that period. The period key format depends on the StatisticsPeriod:
 * - DAILY: "YYYY-MM-DD" (e.g., "2025-01-27")
 * - MONTHLY: "YYYY-MM" (e.g., "2025-01")
 * - YEARLY: "YYYY" (e.g., "2025")
 *
 * Business meaning:
 * - profit: Total profit for this period, calculated as (salePrice - unitCost) * quantitySold
 * - totalSales: Total sales amount for this period (sum of all sale activity amounts)
 * - totalCreations: Total number of CREATION activities for this period
 *
 * These statistics enable time-based performance analysis, allowing business
 * owners to identify trends and patterns in sales, profits, and production.
 *
 * @property {string} period - Period key in ISO 8601 format (YYYY-MM-DD for daily, YYYY-MM for monthly, YYYY for yearly)
 * @property {number} profit - Total profit for this period (sum of all sale profits in this period)
 * @property {number} totalSales - Total sales amount for this period (sum of all sale amounts in this period)
 * @property {number} totalCreations - Total number of CREATION activities for this period
 *
 * @example
 * ```typescript
 * const januaryStats: PeriodStatistics = {
 *   period: "2025-01",
 *   profit: 4500.75,
 *   totalSales: 12500.50,
 *   totalCreations: 25
 * };
 * ```
 */
export type PeriodStatistics = {
    period: string;
    profit: number;
    totalSales: number;
    totalCreations: number;
};

/**
 * ProductMargin represents profit margin statistics for a specific product.
 *
 * This type aggregates margin information for a product, including sales count,
 * total revenue, total cost, computed profit, and margin percentage.
 *
 * Business meaning:
 * - salesCount: Number of sales transactions for this product (indicates product popularity)
 * - totalRevenue: Total revenue from sales (sum of all sale amounts for this product)
 * - totalCost: Total cost of sales (unitCost * quantitySold for all sales)
 * - profit: Total profit from sales (totalRevenue - totalCost)
 * - marginPercentage: Profit margin as a percentage (0-100), calculated as (profit / totalRevenue) * 100
 *
 * These statistics enable product-level profitability analysis, helping business
 * owners identify which products are most profitable and which may need pricing
 * adjustments or cost optimization.
 *
 * Margin percentage calculation:
 * - If totalRevenue > 0: marginPercentage = (profit / totalRevenue) * 100
 * - If totalRevenue = 0: marginPercentage = 0 (prevents division by zero)
 *
 * @property {ProductId} productId - Unique identifier of the product
 * @property {number} salesCount - Number of sales for this product (number of SALE activities)
 * @property {number} totalRevenue - Total revenue from sales of this product (sum of all sale amounts)
 * @property {number} totalCost - Total cost of sales for this product (unitCost * quantitySold for all sales)
 * @property {number} profit - Total profit from sales of this product (totalRevenue - totalCost)
 * @property {number} marginPercentage - Profit margin as a percentage (0-100), calculated as (profit / totalRevenue) * 100
 *
 * @example
 * ```typescript
 * const productMargin: ProductMargin = {
 *   productId: "550e8400-e29b-41d4-a716-446655440000" as ProductId,
 *   salesCount: 10,
 *   totalRevenue: 199.90,
 *   totalCost: 105.00,
 *   profit: 94.90,
 *   marginPercentage: 47.48
 * };
 * ```
 */
export type ProductMargin = {
    productId: ProductId;
    salesCount: number;
    totalRevenue: number;
    totalCost: number;
    profit: number;
    marginPercentage: number;
};

/**
 * BusinessStatistics represents aggregated business metrics for a time period.
 *
 * This type provides a comprehensive view of business performance, including
 * total profits, sales, creations, and product-level margins for a given date range.
 *
 * Business meaning:
 * - totalProfit: Total profit across all products (sum of all sale profits in the period)
 * - totalSales: Total sales amount across all products (sum of all sale amounts in the period)
 * - totalCreations: Total number of CREATION activities in the period (indicates production volume)
 * - productMargins: Array of profit margins by product, sorted by profit descending (most profitable first)
 *
 * This comprehensive statistics object enables business owners to get a complete
 * picture of business performance at a glance, combining overall metrics with
 * detailed product-level analysis.
 *
 * Date range:
 * - If startDate and endDate are provided, statistics are computed only for activities within this range
 * - If not provided, statistics are computed for all activities
 * - Dates are in ISO 8601 format (e.g., "2025-01-27T14:00:00.000Z")
 *
 * @property {string} [startDate] - Optional start date (ISO 8601 format) of the statistics period
 * @property {string} [endDate] - Optional end date (ISO 8601 format) of the statistics period
 * @property {number} totalProfit - Total profit for the period (sum of all sale profits)
 * @property {number} totalSales - Total sales amount for the period (sum of all sale amounts)
 * @property {number} totalCreations - Total number of CREATION activities for the period
 * @property {ProductMargin[]} productMargins - Array of profit margins by product, sorted by profit descending (most profitable products first)
 *
 * @example
 * ```typescript
 * const businessStats: BusinessStatistics = {
 *   startDate: "2025-01-01T00:00:00.000Z",
 *   endDate: "2025-01-31T23:59:59.999Z",
 *   totalProfit: 1500.50,
 *   totalSales: 5000.75,
 *   totalCreations: 25,
 *   productMargins: [
 *     {
 *       productId: "550e8400-e29b-41d4-a716-446655440000" as ProductId,
 *       salesCount: 10,
 *       totalRevenue: 199.90,
 *       totalCost: 105.00,
 *       profit: 94.90,
 *       marginPercentage: 47.48
 *     },
 *     // ... more products
 *   ]
 * };
 * ```
 */
export type BusinessStatistics = {
    startDate?: string;
    endDate?: string;
    totalProfit: number;
    totalSales: number;
    totalCreations: number;
    productMargins: ProductMargin[];
};

