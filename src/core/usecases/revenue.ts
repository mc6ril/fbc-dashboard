/**
 * Revenue Usecases (Usecase layer).
 * Orchestrate revenue calculation from activities and products. Return domain types only.
 */

import type { ActivityRepository } from "@/core/ports/activityRepository";
import type { ProductRepository } from "@/core/ports/productRepository";
import type { RevenueData, RevenuePeriod, RevenueError } from "@/core/domain/revenue";
import { ActivityType } from "@/core/domain/activity";
import { isValidISO8601, filterByDateRange } from "@/shared/utils/date";
import { createProductMap } from "@/shared/utils/product";

/** Creates a typed validation error. */
const createValidationError = (message: string): RevenueError => {
    return {
        code: "VALIDATION_ERROR",
        message,
    } satisfies RevenueError;
};

/**
 * Computes revenue data for a selected time period.
 *
 * This usecase calculates comprehensive financial metrics for a given period:
 * 1. Retrieves all activities (or filtered by date range if provided)
 * 2. Filters activities to SALE type only
 * 3. Calculates total revenue (sum of SALE activity amounts)
 * 4. Calculates material costs (sum of unitCost * abs(quantity) for all sales)
 * 5. Calculates gross margin (revenue - material costs)
 * 6. Calculates gross margin rate (gross margin / revenue * 100)
 *
 * Revenue calculation:
 * - totalRevenue = sum of all SALE activity amounts in the period
 * - Each SALE activity's `amount` field represents the total sale value for that transaction
 *
 * Material costs calculation:
 * - materialCosts = sum of (product.unitCost * abs(activity.quantity)) for all sales in the period
 * - unitCost is the cost per unit of the product at the time of sale
 * - quantitySold is the absolute value of activity.quantity (SALE activities typically have negative quantities)
 * - Sales with missing products are filtered out (not included in cost calculation)
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
 * Date range filtering:
 * - If startDate is provided, only activities on or after this date are included
 * - If endDate is provided, only activities on or before this date are included
 * - Both dates must be valid ISO 8601 strings if provided
 * - Date comparison is done using ISO 8601 string comparison (lexicographic order)
 *
 * Edge cases:
 * - Empty sales: Returns zero values for all metrics
 * - Zero revenue: Returns zero gross margin and gross margin rate (0%)
 * - Missing products: Sales with missing products are skipped (filtered out from cost calculation)
 *
 * Performance considerations:
 * - Uses batch product retrieval (ProductRepository.list()) for efficiency
 * - For large datasets, consider implementing pagination or date-range filtering at repository level
 * - The function is optimized for small to medium datasets (< 10,000 activities)
 *
 * @param {ActivityRepository} activityRepo - Activity repository for data retrieval
 * @param {ProductRepository} productRepo - Product repository for product data retrieval
 * @param {RevenuePeriod} period - Selected period type (MONTH, QUARTER, YEAR, or CUSTOM)
 * @param {string} startDate - Start date of the analysis period (ISO 8601 format, inclusive)
 * @param {string} endDate - End date of the analysis period (ISO 8601 format, inclusive)
 * @returns {Promise<RevenueData>} Promise resolving to revenue data with all financial metrics
 * @throws {RevenueError} If date range parameters are invalid (not valid ISO 8601 format)
 * @throws {Error} If repository retrieval fails (database connection error, query error, etc.)
 *
 * @example
 * ```typescript
 * // Compute revenue for January 2025
 * const revenueData = await computeRevenue(
 *   activityRepository,
 *   productRepository,
 *   RevenuePeriod.MONTH,
 *   "2025-01-01T00:00:00.000Z",
 *   "2025-01-31T23:59:59.999Z"
 * );
 * // Returns: {
 * //   period: RevenuePeriod.MONTH,
 * //   startDate: "2025-01-01T00:00:00.000Z",
 * //   endDate: "2025-01-31T23:59:59.999Z",
 * //   totalRevenue: 12500.75,
 * //   materialCosts: 6500.50,
 * //   grossMargin: 6000.25,
 * //   grossMarginRate: 48.0
 * // }
 * ```
 */
export const computeRevenue = async (
    activityRepo: ActivityRepository,
    productRepo: ProductRepository,
    period: RevenuePeriod,
    startDate: string,
    endDate: string
): Promise<RevenueData> => {
    // Validate date range parameters
    if (!isValidISO8601(startDate)) {
        throw createValidationError("startDate must be a valid ISO 8601 string");
    }

    if (!isValidISO8601(endDate)) {
        throw createValidationError("endDate must be a valid ISO 8601 string");
    }

    // Retrieve all activities
    const allActivities = await activityRepo.list();

    // Filter activities by date range
    const filteredActivities = filterByDateRange(allActivities, startDate, endDate);

    // Filter activities to SALE type only
    const saleActivities = filteredActivities.filter(
        (activity) => activity.type === ActivityType.SALE
    );

    // Handle empty SALE activity list
    if (saleActivities.length === 0) {
        return {
            period,
            startDate,
            endDate,
            totalRevenue: 0,
            materialCosts: 0,
            grossMargin: 0,
            grossMarginRate: 0,
        };
    }

    // Retrieve all products (batch retrieval for efficiency)
    const allProducts = await productRepo.list();

    // Create a map of productId -> Product for quick lookup
    const productMap = createProductMap(allProducts);

    // Calculate total revenue (sum of all SALE activity amounts)
    let totalRevenue = 0;

    // Calculate material costs (sum of unitCost * abs(quantity) for all sales)
    let materialCosts = 0;

    for (const saleActivity of saleActivities) {
        // Add to total revenue (all sales contribute to revenue)
        totalRevenue += saleActivity.amount;

        // Skip activities without productId for material cost calculation
        if (!saleActivity.productId) {
            continue;
        }

        // Get product for this sale
        const product = productMap.get(saleActivity.productId);

        // Filter out sales with missing products (data inconsistency)
        if (!product) {
            continue;
        }

        // Calculate material cost for this sale: unitCost * abs(quantity)
        const quantitySold = Math.abs(saleActivity.quantity);
        const materialCostPerSale = product.unitCost * quantitySold;

        materialCosts += materialCostPerSale;
    }

    // Calculate gross margin (revenue - material costs)
    const grossMargin = totalRevenue - materialCosts;

    // Calculate gross margin rate (percentage)
    // Handle division by zero: if totalRevenue is 0, grossMarginRate is 0
    const grossMarginRate =
        totalRevenue > 0 ? (grossMargin / totalRevenue) * 100 : 0;

    return {
        period,
        startDate,
        endDate,
        totalRevenue,
        materialCosts,
        grossMargin,
        grossMarginRate,
    };
};

