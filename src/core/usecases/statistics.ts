/**
 * Statistics Usecases (Usecase layer).
 * Orchestrate business logic for computing statistics from activities and products.
 * Return domain types only.
 */

import type { ActivityRepository } from "@/core/ports/activityRepository";
import type { ProductRepository } from "@/core/ports/productRepository";
import type {
    BusinessStatistics,
    PeriodStatistics,
    ProductMargin,
} from "@/core/domain/statistics";
import { StatisticsPeriod } from "@/core/domain/statistics";
import type { ProductId, Product } from "@/core/domain/product";
import { ActivityType } from "@/core/domain/activity";
import { isValidISO8601 } from "@/shared/utils/date";

/** Creates a typed validation error. */
const createValidationError = (message: string): Error => {
    return new Error(`Validation Error: ${message}`);
};

/**
 * Computes profit statistics grouped by period (daily, monthly, or yearly).
 *
 * This usecase calculates profits from SALE activities and groups them by the specified period.
 * Profits are calculated as (salePrice - unitCost) * quantitySold for each sale.
 *
 * Period grouping:
 * - DAILY: Groups by date (YYYY-MM-DD format)
 * - MONTHLY: Groups by month (YYYY-MM format)
 * - YEARLY: Groups by year (YYYY format)
 *
 * Date range filtering:
 * - If startDate is provided, only activities on or after this date are included
 * - If endDate is provided, only activities on or before this date are included
 * - Both dates must be valid ISO 8601 strings if provided
 *
 * @param {ActivityRepository} activityRepo - Activity repository for data retrieval
 * @param {ProductRepository} productRepo - Product repository for product data retrieval
 * @param {StatisticsPeriod} period - Period type for grouping (DAILY, MONTHLY, or YEARLY)
 * @param {string} [startDate] - Optional start date (ISO 8601 format) to filter activities from this date onwards
 * @param {string} [endDate] - Optional end date (ISO 8601 format) to filter activities up to this date
 * @returns {Promise<PeriodStatistics[]>} Promise resolving to an array of period statistics, sorted by period ascending
 * @throws {Error} If date range parameters are invalid (not valid ISO 8601 format)
 * @throws {Error} If repository retrieval fails (database connection error, query error, etc.)
 *
 * @example
 * ```typescript
 * // Compute daily profits for January 2025
 * const dailyProfits = await computeProfitsByPeriod(
 *   activityRepository,
 *   productRepository,
 *   StatisticsPeriod.DAILY,
 *   "2025-01-01T00:00:00.000Z",
 *   "2025-01-31T23:59:59.999Z"
 * );
 * // Returns: [{ period: "2025-01-01", profit: 150.50, ... }, ...]
 *
 * // Compute monthly profits for 2025
 * const monthlyProfits = await computeProfitsByPeriod(
 *   activityRepository,
 *   productRepository,
 *   StatisticsPeriod.MONTHLY,
 *   "2025-01-01T00:00:00.000Z",
 *   "2025-12-31T23:59:59.999Z"
 * );
 * // Returns: [{ period: "2025-01", profit: 4500.75, ... }, ...]
 * ```
 */
export const computeProfitsByPeriod = async (
    activityRepo: ActivityRepository,
    productRepo: ProductRepository,
    period: StatisticsPeriod,
    startDate?: string,
    endDate?: string
): Promise<PeriodStatistics[]> => {
    // Validate date range parameters if provided
    if (startDate !== undefined && !isValidISO8601(startDate)) {
        throw createValidationError("startDate must be a valid ISO 8601 string");
    }

    if (endDate !== undefined && !isValidISO8601(endDate)) {
        throw createValidationError("endDate must be a valid ISO 8601 string");
    }

    // Retrieve all activities
    const allActivities = await activityRepo.list();

    // Filter activities by date range if provided
    let filteredActivities = allActivities;
    if (startDate !== undefined || endDate !== undefined) {
        filteredActivities = allActivities.filter((activity) => {
            const activityDate = activity.date;

            if (startDate !== undefined && activityDate < startDate) {
                return false;
            }

            if (endDate !== undefined && activityDate > endDate) {
                return false;
            }

            return true;
        });
    }

    // Filter activities to SALE type only
    const saleActivities = filteredActivities.filter(
        (activity) => activity.type === ActivityType.SALE
    );

    // Handle empty SALE activity list
    if (saleActivities.length === 0) {
        return [];
    }

    // Retrieve all products (batch retrieval for efficiency)
    const allProducts = await productRepo.list();

    // Create a map of productId -> Product for quick lookup
    const productMap = new Map<ProductId, Product>();
    for (const product of allProducts) {
        productMap.set(product.id, product);
    }

    // Helper function to extract period key from ISO 8601 date string
    // Uses UTC methods to ensure consistent grouping regardless of local timezone
    // Activities are stored in UTC format (ISO 8601 ending with 'Z')
    const getPeriodKey = (isoDate: string): string => {
        const date = new Date(isoDate);
        switch (period) {
            case StatisticsPeriod.DAILY:
                return isoDate.substring(0, 10); // YYYY-MM-DD (extracted from UTC string)
            case StatisticsPeriod.MONTHLY:
                return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`; // YYYY-MM (UTC)
            case StatisticsPeriod.YEARLY:
                return String(date.getUTCFullYear()); // YYYY (UTC)
            default:
                throw new Error(`Unknown period type: ${period}`);
        }
    };

    // Group sales by period and calculate profits
    const periodMap = new Map<string, { profit: number; totalSales: number; totalCreations: number }>();

    for (const saleActivity of saleActivities) {
        // Skip activities without productId
        if (!saleActivity.productId) {
            continue;
        }

        // Get product for this sale
        const product = productMap.get(saleActivity.productId);

        // Filter out sales with missing products
        if (!product) {
            continue;
        }

        // Calculate profit per sale: (salePrice - unitCost) * abs(quantity)
        const quantitySold = Math.abs(saleActivity.quantity);
        const profitPerSale = (product.salePrice - product.unitCost) * quantitySold;

        // Get period key
        const periodKey = getPeriodKey(saleActivity.date);

        // Initialize period statistics if not exists
        if (!periodMap.has(periodKey)) {
            periodMap.set(periodKey, {
                profit: 0,
                totalSales: 0,
                totalCreations: 0,
            });
        }

        const periodStats = periodMap.get(periodKey)!;
        periodStats.profit += profitPerSale;
        periodStats.totalSales += saleActivity.amount;
    }

    // Add CREATION activities to period statistics
    const creationActivities = filteredActivities.filter(
        (activity) => activity.type === ActivityType.CREATION
    );

    for (const creationActivity of creationActivities) {
        const periodKey = getPeriodKey(creationActivity.date);

        // Initialize period statistics if not exists
        if (!periodMap.has(periodKey)) {
            periodMap.set(periodKey, {
                profit: 0,
                totalSales: 0,
                totalCreations: 0,
            });
        }

        const periodStats = periodMap.get(periodKey)!;
        periodStats.totalCreations += 1;
    }

    // Convert map to array and sort by period ascending
    const periodStatistics: PeriodStatistics[] = Array.from(periodMap.entries())
        .map(([period, stats]) => ({
            period,
            profit: stats.profit,
            totalSales: stats.totalSales,
            totalCreations: stats.totalCreations,
        }))
        .sort((a, b) => a.period.localeCompare(b.period));

    return periodStatistics;
};

/**
 * Computes total number of CREATION activities for a date range.
 *
 * This usecase counts all activities with type CREATION within the specified date range.
 * Returns 0 if no creation activities exist in the period.
 *
 * Date range filtering:
 * - If startDate is provided, only activities on or after this date are included
 * - If endDate is provided, only activities on or before this date are included
 * - Both dates must be valid ISO 8601 strings if provided
 *
 * @param {ActivityRepository} repo - Activity repository for data retrieval
 * @param {string} [startDate] - Optional start date (ISO 8601 format) to filter activities from this date onwards
 * @param {string} [endDate] - Optional end date (ISO 8601 format) to filter activities up to this date
 * @returns {Promise<number>} Promise resolving to total number of CREATION activities in the period
 * @throws {Error} If date range parameters are invalid (not valid ISO 8601 format)
 * @throws {Error} If repository retrieval fails (database connection error, query error, etc.)
 *
 * @example
 * ```typescript
 * // Compute total creations for all time
 * const totalCreations = await computeTotalCreations(activityRepository);
 * // Returns: 150
 *
 * // Compute total creations for January 2025
 * const creationsInMonth = await computeTotalCreations(
 *   activityRepository,
 *   "2025-01-01T00:00:00.000Z",
 *   "2025-01-31T23:59:59.999Z"
 * );
 * // Returns: 25
 * ```
 */
export const computeTotalCreations = async (
    repo: ActivityRepository,
    startDate?: string,
    endDate?: string
): Promise<number> => {
    // Validate date range parameters if provided
    if (startDate !== undefined && !isValidISO8601(startDate)) {
        throw createValidationError("startDate must be a valid ISO 8601 string");
    }

    if (endDate !== undefined && !isValidISO8601(endDate)) {
        throw createValidationError("endDate must be a valid ISO 8601 string");
    }

    // Retrieve all activities
    const allActivities = await repo.list();

    // Filter activities by date range if provided
    let filteredActivities = allActivities;
    if (startDate !== undefined || endDate !== undefined) {
        filteredActivities = allActivities.filter((activity) => {
            const activityDate = activity.date;

            if (startDate !== undefined && activityDate < startDate) {
                return false;
            }

            if (endDate !== undefined && activityDate > endDate) {
                return false;
            }

            return true;
        });
    }

    // Filter activities to CREATION type only and count
    const creationActivities = filteredActivities.filter(
        (activity) => activity.type === ActivityType.CREATION
    );

    return creationActivities.length;
};

/**
 * Computes profit margins by product for a date range.
 *
 * This usecase calculates profit margins for each product by aggregating SALE activities.
 * For each product, it computes:
 * - Number of sales
 * - Total revenue (sum of sale amounts)
 * - Total cost (unitCost * quantity sold)
 * - Total profit (totalRevenue - totalCost)
 * - Margin percentage ((profit / totalRevenue) * 100)
 *
 * Results are sorted by profit descending (most profitable products first).
 *
 * Date range filtering:
 * - If startDate is provided, only activities on or after this date are included
 * - If endDate is provided, only activities on or before this date are included
 * - Both dates must be valid ISO 8601 strings if provided
 *
 * @param {ActivityRepository} activityRepo - Activity repository for data retrieval
 * @param {ProductRepository} productRepo - Product repository for product data retrieval
 * @param {string} [startDate] - Optional start date (ISO 8601 format) to filter activities from this date onwards
 * @param {string} [endDate] - Optional end date (ISO 8601 format) to filter activities up to this date
 * @returns {Promise<ProductMargin[]>} Promise resolving to an array of product margins, sorted by profit descending
 * @throws {Error} If date range parameters are invalid (not valid ISO 8601 format)
 * @throws {Error} If repository retrieval fails (database connection error, query error, etc.)
 *
 * @example
 * ```typescript
 * // Compute margins for all products for all time
 * const margins = await computeProductMargins(activityRepository, productRepository);
 * // Returns: [{ productId: "...", salesCount: 10, totalRevenue: 199.90, totalCost: 105.00, profit: 94.90, marginPercentage: 47.48 }, ...]
 *
 * // Compute margins for products in January 2025
 * const marginsInMonth = await computeProductMargins(
 *   activityRepository,
 *   productRepository,
 *   "2025-01-01T00:00:00.000Z",
 *   "2025-01-31T23:59:59.999Z"
 * );
 * ```
 */
export const computeProductMargins = async (
    activityRepo: ActivityRepository,
    productRepo: ProductRepository,
    startDate?: string,
    endDate?: string
): Promise<ProductMargin[]> => {
    // Validate date range parameters if provided
    if (startDate !== undefined && !isValidISO8601(startDate)) {
        throw createValidationError("startDate must be a valid ISO 8601 string");
    }

    if (endDate !== undefined && !isValidISO8601(endDate)) {
        throw createValidationError("endDate must be a valid ISO 8601 string");
    }

    // Retrieve all activities
    const allActivities = await activityRepo.list();

    // Filter activities by date range if provided
    let filteredActivities = allActivities;
    if (startDate !== undefined || endDate !== undefined) {
        filteredActivities = allActivities.filter((activity) => {
            const activityDate = activity.date;

            if (startDate !== undefined && activityDate < startDate) {
                return false;
            }

            if (endDate !== undefined && activityDate > endDate) {
                return false;
            }

            return true;
        });
    }

    // Filter activities to SALE type only
    const saleActivities = filteredActivities.filter(
        (activity) => activity.type === ActivityType.SALE
    );

    // Handle empty SALE activity list
    if (saleActivities.length === 0) {
        return [];
    }

    // Retrieve all products (batch retrieval for efficiency)
    const allProducts = await productRepo.list();

    // Create a map of productId -> Product for quick lookup
    const productMap = new Map<ProductId, Product>();
    for (const product of allProducts) {
        productMap.set(product.id, product);
    }

    // Group sales by product and calculate margins
    const productMarginMap = new Map<
        ProductId,
        { salesCount: number; totalRevenue: number; totalCost: number }
    >();

    for (const saleActivity of saleActivities) {
        // Skip activities without productId
        if (!saleActivity.productId) {
            continue;
        }

        // Get product for this sale
        const product = productMap.get(saleActivity.productId);

        // Filter out sales with missing products
        if (!product) {
            continue;
        }

        // Initialize product margin if not exists
        if (!productMarginMap.has(saleActivity.productId)) {
            productMarginMap.set(saleActivity.productId, {
                salesCount: 0,
                totalRevenue: 0,
                totalCost: 0,
            });
        }

        const margin = productMarginMap.get(saleActivity.productId)!;
        margin.salesCount += 1;
        margin.totalRevenue += saleActivity.amount;

        // Calculate cost: unitCost * quantity sold
        const quantitySold = Math.abs(saleActivity.quantity);
        margin.totalCost += product.unitCost * quantitySold;
    }

    // Convert map to array, calculate profit and margin percentage, then sort by profit descending
    const productMargins: ProductMargin[] = Array.from(productMarginMap.entries())
        .map(([productId, margin]) => {
            const profit = margin.totalRevenue - margin.totalCost;
            const marginPercentage =
                margin.totalRevenue > 0 ? (profit / margin.totalRevenue) * 100 : 0;

            return {
                productId,
                salesCount: margin.salesCount,
                totalRevenue: margin.totalRevenue,
                totalCost: margin.totalCost,
                profit,
                marginPercentage,
            };
        })
        .sort((a, b) => b.profit - a.profit); // Sort by profit descending

    return productMargins;
};

/**
 * Computes comprehensive business statistics for a date range.
 *
 * This usecase aggregates all business metrics into a single BusinessStatistics object,
 * including total profits, sales, creations, and product margins.
 *
 * The function combines multiple statistics computations:
 * - Total profit from SALE activities
 * - Total sales amount from SALE activities
 * - Total creations count from CREATION activities
 * - Product margins sorted by profit descending
 *
 * Date range filtering:
 * - If startDate is provided, only activities on or after this date are included
 * - If endDate is provided, only activities on or before this date are included
 * - Both dates must be valid ISO 8601 strings if provided
 *
 * @param {ActivityRepository} activityRepo - Activity repository for data retrieval
 * @param {ProductRepository} productRepo - Product repository for product data retrieval
 * @param {string} [startDate] - Optional start date (ISO 8601 format) to filter activities from this date onwards
 * @param {string} [endDate] - Optional end date (ISO 8601 format) to filter activities up to this date
 * @returns {Promise<BusinessStatistics>} Promise resolving to comprehensive business statistics
 * @throws {Error} If date range parameters are invalid (not valid ISO 8601 format)
 * @throws {Error} If repository retrieval fails (database connection error, query error, etc.)
 *
 * @example
 * ```typescript
 * // Compute business statistics for all time
 * const stats = await computeBusinessStatistics(activityRepository, productRepository);
 * // Returns: { totalProfit: 1500.50, totalSales: 5000.75, totalCreations: 150, productMargins: [...], ... }
 *
 * // Compute business statistics for January 2025
 * const statsInMonth = await computeBusinessStatistics(
 *   activityRepository,
 *   productRepository,
 *   "2025-01-01T00:00:00.000Z",
 *   "2025-01-31T23:59:59.999Z"
 * );
 * ```
 */
export const computeBusinessStatistics = async (
    activityRepo: ActivityRepository,
    productRepo: ProductRepository,
    startDate?: string,
    endDate?: string
): Promise<BusinessStatistics> => {
    // Validate date range parameters if provided
    if (startDate !== undefined && !isValidISO8601(startDate)) {
        throw createValidationError("startDate must be a valid ISO 8601 string");
    }

    if (endDate !== undefined && !isValidISO8601(endDate)) {
        throw createValidationError("endDate must be a valid ISO 8601 string");
    }

    // Retrieve all activities
    const allActivities = await activityRepo.list();

    // Filter activities by date range if provided
    let filteredActivities = allActivities;
    if (startDate !== undefined || endDate !== undefined) {
        filteredActivities = allActivities.filter((activity) => {
            const activityDate = activity.date;

            if (startDate !== undefined && activityDate < startDate) {
                return false;
            }

            if (endDate !== undefined && activityDate > endDate) {
                return false;
            }

            return true;
        });
    }

    // Filter activities by type
    const saleActivities = filteredActivities.filter(
        (activity) => activity.type === ActivityType.SALE
    );
    const creationActivities = filteredActivities.filter(
        (activity) => activity.type === ActivityType.CREATION
    );

    // Compute total creations
    const totalCreations = creationActivities.length;

    // Retrieve all products for profit and margin calculations
    const allProducts = await productRepo.list();
    const productMap = new Map<ProductId, Product>();
    for (const product of allProducts) {
        productMap.set(product.id, product);
    }

    // Compute total profit, total sales, and product margins
    let totalProfit = 0;
    let totalSales = 0;
    const productMarginMap = new Map<
        ProductId,
        { salesCount: number; totalRevenue: number; totalCost: number }
    >();

    for (const saleActivity of saleActivities) {
        // Skip activities without productId
        if (!saleActivity.productId) {
            continue;
        }

        // Get product for this sale
        const product = productMap.get(saleActivity.productId);

        // Filter out sales with missing products (for consistency with profit calculation)
        if (!product) {
            continue;
        }

        // Calculate profit per sale: (salePrice - unitCost) * abs(quantity)
        const quantitySold = Math.abs(saleActivity.quantity);
        const profitPerSale = (product.salePrice - product.unitCost) * quantitySold;
        totalProfit += profitPerSale;

        // Add to total sales (only for sales with valid products)
        totalSales += saleActivity.amount;

        // Update product margin map
        if (!productMarginMap.has(saleActivity.productId)) {
            productMarginMap.set(saleActivity.productId, {
                salesCount: 0,
                totalRevenue: 0,
                totalCost: 0,
            });
        }

        const margin = productMarginMap.get(saleActivity.productId)!;
        margin.salesCount += 1;
        margin.totalRevenue += saleActivity.amount;
        margin.totalCost += product.unitCost * quantitySold;
    }

    // Convert product margin map to array, calculate profit and margin percentage, then sort by profit descending
    const productMargins: ProductMargin[] = Array.from(productMarginMap.entries())
        .map(([productId, margin]) => {
            const profit = margin.totalRevenue - margin.totalCost;
            const marginPercentage =
                margin.totalRevenue > 0 ? (profit / margin.totalRevenue) * 100 : 0;

            return {
                productId,
                salesCount: margin.salesCount,
                totalRevenue: margin.totalRevenue,
                totalCost: margin.totalCost,
                profit,
                marginPercentage,
            };
        })
        .sort((a, b) => b.profit - a.profit); // Sort by profit descending

    return {
        startDate,
        endDate,
        totalProfit,
        totalSales,
        totalCreations,
        productMargins,
    };
};

