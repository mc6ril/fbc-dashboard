/**
 * Revenue Usecases (Usecase layer).
 * Orchestrate revenue calculation from activities and products. Return domain types only.
 */

import type { ActivityRepository } from "@/core/ports/activityRepository";
import type { ProductRepository } from "@/core/ports/productRepository";
import type { CostRepository } from "@/core/ports/costRepository";
import type {
    RevenueData,
    RevenuePeriod,
    RevenueError,
    RevenueByProductType,
    RevenueByProduct,
} from "@/core/domain/revenue";
import { ActivityType } from "@/core/domain/activity";
import { ProductType } from "@/core/domain/product";
import type { ProductId } from "@/core/domain/product";
import { isValidISO8601, filterByDateRange, getMonthsInRange } from "@/shared/utils/date";
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
 * - totalIndirectCosts = indirectCosts.marketing + indirectCosts.overhead
 *
 * Net margin rate calculation:
 * - If totalRevenue > 0: netMarginRate = (netResult / totalRevenue) * 100
 * - If totalRevenue = 0: netMarginRate = 0 (prevents division by zero)
 * - Expressed as a percentage (0-100)
 *
 * @param {ActivityRepository} activityRepo - Activity repository for data retrieval
 * @param {ProductRepository} productRepo - Product repository for product data retrieval
 * @param {CostRepository} costRepo - Cost repository for monthly cost data retrieval
 * @param {RevenuePeriod} period - Selected period type (MONTH, QUARTER, YEAR, or CUSTOM)
 * @param {string} startDate - Start date of the analysis period (ISO 8601 format, inclusive)
 * @param {string} endDate - End date of the analysis period (ISO 8601 format, inclusive)
 * @returns {Promise<RevenueData>} Promise resolving to revenue data with all financial metrics including costs and net result
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
    costRepo: CostRepository,
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

    // Extract months from date range for cost aggregation
    const monthsInRange = getMonthsInRange(startDate, endDate);

    // Fetch monthly costs for all months in the period
    const monthlyCostsPromises = monthsInRange.map((month) =>
        costRepo.getMonthlyCost(month)
    );
    const monthlyCosts = await Promise.all(monthlyCostsPromises);

    // Sum shipping costs and indirect costs across all months
    let totalShippingCost = 0;
    let totalMarketingCost = 0;
    let totalOverheadCost = 0;

    for (const monthlyCost of monthlyCosts) {
        if (monthlyCost) {
            totalShippingCost += monthlyCost.shippingCost;
            totalMarketingCost += monthlyCost.marketingCost;
            totalOverheadCost += monthlyCost.overheadCost;
        }
        // If monthlyCost is null, it defaults to 0 (costs are 0 for that month)
    }

    // Calculate total indirect costs
    const totalIndirectCosts = totalMarketingCost + totalOverheadCost;

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
            costs: {
                shipping: totalShippingCost,
            },
            indirectCosts: {
                marketing: totalMarketingCost,
                overhead: totalOverheadCost,
            },
            netResult: 0 - totalShippingCost - totalIndirectCosts, // grossMargin (0) - totalShippingCost - totalIndirectCosts
            netMarginRate: 0,
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

    // Calculate net result (gross margin - shipping costs - total indirect costs)
    const netResult = grossMargin - totalShippingCost - totalIndirectCosts;

    // Calculate net margin rate (percentage)
    // Handle division by zero: if totalRevenue is 0, netMarginRate is 0
    const netMarginRate =
        totalRevenue > 0 ? (netResult / totalRevenue) * 100 : 0;

    return {
        period,
        startDate,
        endDate,
        totalRevenue,
        materialCosts,
        grossMargin,
        grossMarginRate,
        costs: {
            shipping: totalShippingCost,
        },
        indirectCosts: {
            marketing: totalMarketingCost,
            overhead: totalOverheadCost,
        },
        netResult,
        netMarginRate,
    };
};

/**
 * Computes revenue breakdown by product type for a selected time period.
 *
 * This usecase groups sales by ProductType and calculates aggregated revenue metrics
 * for each product type. Used for expandable revenue rows to show detailed breakdowns
 * by product category.
 *
 * Calculation process:
 * 1. Retrieves all activities and filters by date range
 * 2. Filters activities to SALE type only
 * 3. Groups sales by product type (from product.type or product.modelId -> model.type)
 * 4. Calculates total revenue and count for each product type
 * 5. Returns array of RevenueByProductType sorted by revenue (descending)
 *
 * Revenue calculation per type:
 * - revenue = sum of all SALE activity amounts for products of this type in the period
 * - count = number of distinct SALE activities for products of this type
 *
 * Product type resolution:
 * - If product has `type` field (deprecated but available during migration), use it
 * - Otherwise, if product has `modelId`, fetch model and use model.type
 * - If product type cannot be determined, skip the sale (data inconsistency)
 *
 * Edge cases:
 * - Empty sales: Returns empty array
 * - Missing products: Sales with missing products are skipped
 * - Products without type: Sales for products without type are skipped
 *
 * Performance considerations:
 * - Uses batch product retrieval (ProductRepository.list()) for efficiency
 * - Fetches models only when needed (if product.type is not available)
 * - For large datasets, consider implementing pagination or date-range filtering at repository level
 *
 * @param {ActivityRepository} activityRepo - Activity repository for data retrieval
 * @param {ProductRepository} productRepo - Product repository for product data retrieval
 * @param {string} startDate - Start date of the analysis period (ISO 8601 format, inclusive)
 * @param {string} endDate - End date of the analysis period (ISO 8601 format, inclusive)
 * @returns {Promise<RevenueByProductType[]>} Promise resolving to array of revenue breakdown by product type, sorted by revenue (descending)
 * @throws {RevenueError} If date range parameters are invalid (not valid ISO 8601 format)
 * @throws {Error} If repository retrieval fails (database connection error, query error, etc.)
 *
 * @example
 * ```typescript
 * const breakdown = await computeRevenueByProductType(
 *   activityRepository,
 *   productRepository,
 *   "2025-01-01T00:00:00.000Z",
 *   "2025-01-31T23:59:59.999Z"
 * );
 * // Returns: [
 * //   { type: ProductType.POCHETTE_VOLANTS, revenue: 5000.00, count: 25 },
 * //   { type: ProductType.SAC_BANANE, revenue: 3000.00, count: 15 },
 * //   ...
 * // ]
 * ```
 */
export const computeRevenueByProductType = async (
    activityRepo: ActivityRepository,
    productRepo: ProductRepository,
    startDate: string,
    endDate: string
): Promise<RevenueByProductType[]> => {
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
        return [];
    }

    // Retrieve all products (batch retrieval for efficiency)
    const allProducts = await productRepo.list();

    // Create a map of productId -> Product for quick lookup
    const productMap = createProductMap(allProducts);

    // Collect all unique modelIds that need to be fetched
    const modelIdsToFetch = new Set<string>();
    for (const product of allProducts) {
        if (!product.type && product.modelId) {
            modelIdsToFetch.add(product.modelId);
        }
    }

    // Fetch all needed models in batch (if any)
    const modelMap = new Map<string, { type: ProductType }>();
    if (modelIdsToFetch.size > 0) {
        // Fetch all models (we'll filter by modelIdsToFetch after)
        // Note: ProductRepository doesn't have a batch getByIds method, so we fetch all models
        // and filter. For better performance, consider adding batch methods to repository.
        // Convert Set to array once to ensure consistent order
        const modelIdsArray = Array.from(modelIdsToFetch);
        const allModels = await Promise.all(
            modelIdsArray.map((modelId) =>
                productRepo.getModelById(modelId as import("@/core/domain/product").ProductModelId)
            )
        );

        // Create map of modelId -> model type
        for (let i = 0; i < allModels.length; i++) {
            const model = allModels[i];
            if (model) {
                const modelId = modelIdsArray[i];
                modelMap.set(modelId, { type: model.type });
            }
        }
    }

    // Map to store revenue and count by product type
    const revenueByType = new Map<ProductType, { revenue: number; count: number }>();

    // Process each sale activity
    for (const saleActivity of saleActivities) {
        // Skip activities without productId
        if (!saleActivity.productId) {
            continue;
        }

        // Get product for this sale
        const product = productMap.get(saleActivity.productId);

        // Filter out sales with missing products (data inconsistency)
        if (!product) {
            continue;
        }

        // Determine product type
        let productType: ProductType | undefined;

        // Try to get type from product.type (deprecated but available during migration)
        if (product.type) {
            productType = product.type;
        } else if (product.modelId) {
            // Get type from model map
            const modelData = modelMap.get(product.modelId);
            if (modelData) {
                productType = modelData.type;
            }
        }

        // Skip if product type cannot be determined
        if (!productType) {
            continue;
        }

        // Get or create entry for this product type
        const existing = revenueByType.get(productType);
        if (existing) {
            existing.revenue += saleActivity.amount;
            existing.count += 1;
        } else {
            revenueByType.set(productType, {
                revenue: saleActivity.amount,
                count: 1,
            });
        }
    }

    // Convert map to array and sort by revenue (descending)
    const result: RevenueByProductType[] = Array.from(revenueByType.entries())
        .map(([type, data]) => ({
            type,
            revenue: data.revenue,
            count: data.count,
        }))
        .sort((a, b) => b.revenue - a.revenue);

    return result;
};

/**
 * Computes revenue breakdown by individual product for a selected time period.
 *
 * This usecase groups sales by individual products (product model + coloris) and calculates
 * aggregated revenue metrics for each product. Used for expandable revenue rows to show
 * detailed breakdowns by individual products.
 *
 * Calculation process:
 * 1. Retrieves all activities and filters by date range
 * 2. Filters activities to SALE type only
 * 3. Groups sales by product (productId)
 * 4. Gets product name and coloris (from product.name/coloris or product.modelId/colorisId -> model.name/coloris.coloris)
 * 5. Calculates total revenue and count for each product
 * 6. Returns array of RevenueByProduct sorted by revenue (descending)
 *
 * Revenue calculation per product:
 * - revenue = sum of all SALE activity amounts for this product in the period
 * - count = number of distinct SALE activities for this product
 *
 * Product name and coloris resolution:
 * - If product has `name` and `coloris` fields (deprecated but available during migration), use them
 * - Otherwise, if product has `modelId` and `colorisId`, fetch model and coloris to get name and coloris
 * - If product name or coloris cannot be determined, use fallback values ("Unknown" for name, "N/A" for coloris)
 *
 * Edge cases:
 * - Empty sales: Returns empty array
 * - Missing products: Sales with missing products are skipped
 * - Products without name/coloris: Uses fallback values
 *
 * Performance considerations:
 * - Uses batch product retrieval (ProductRepository.list()) for efficiency
 * - Fetches models and coloris only when needed (if product.name/coloris are not available)
 * - For large datasets, consider implementing pagination or date-range filtering at repository level
 *
 * @param {ActivityRepository} activityRepo - Activity repository for data retrieval
 * @param {ProductRepository} productRepo - Product repository for product data retrieval
 * @param {string} startDate - Start date of the analysis period (ISO 8601 format, inclusive)
 * @param {string} endDate - End date of the analysis period (ISO 8601 format, inclusive)
 * @returns {Promise<RevenueByProduct[]>} Promise resolving to array of revenue breakdown by product, sorted by revenue (descending)
 * @throws {RevenueError} If date range parameters are invalid (not valid ISO 8601 format)
 * @throws {Error} If repository retrieval fails (database connection error, query error, etc.)
 *
 * @example
 * ```typescript
 * const breakdown = await computeRevenueByProduct(
 *   activityRepository,
 *   productRepository,
 *   "2025-01-01T00:00:00.000Z",
 *   "2025-01-31T23:59:59.999Z"
 * );
 * // Returns: [
 * //   { productId: "...", productName: "Charlie", coloris: "Rose Marsala", revenue: 2500.00, count: 10 },
 * //   { productId: "...", productName: "Assumée", coloris: "Rose pâle à motifs", revenue: 2000.00, count: 8 },
 * //   ...
 * // ]
 * ```
 */
export const computeRevenueByProduct = async (
    activityRepo: ActivityRepository,
    productRepo: ProductRepository,
    startDate: string,
    endDate: string
): Promise<RevenueByProduct[]> => {
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
        return [];
    }

    // Retrieve all products (batch retrieval for efficiency)
    const allProducts = await productRepo.list();

    // Create a map of productId -> Product for quick lookup
    const productMap = createProductMap(allProducts);

    // Collect all unique modelIds and colorisIds that need to be fetched
    const modelIdsToFetch = new Set<string>();
    const colorisIdsToFetch = new Set<string>();
    for (const product of allProducts) {
        if (!product.name && product.modelId) {
            modelIdsToFetch.add(product.modelId);
        }
        if (!product.coloris && product.colorisId) {
            colorisIdsToFetch.add(product.colorisId);
        }
    }

    // Fetch all needed models and coloris in batch (if any)
    const modelMap = new Map<string, { name: string }>();
    const colorisMap = new Map<string, { coloris: string }>();

    if (modelIdsToFetch.size > 0) {
        // Convert Set to array once to ensure consistent order
        const modelIdsArray = Array.from(modelIdsToFetch);
        const allModels = await Promise.all(
            modelIdsArray.map((modelId) =>
                productRepo.getModelById(modelId as import("@/core/domain/product").ProductModelId)
            )
        );

        for (let i = 0; i < allModels.length; i++) {
            const model = allModels[i];
            if (model) {
                const modelId = modelIdsArray[i];
                modelMap.set(modelId, { name: model.name });
            }
        }
    }

    if (colorisIdsToFetch.size > 0) {
        // Convert Set to array once to ensure consistent order
        const colorisIdsArray = Array.from(colorisIdsToFetch);
        const allColoris = await Promise.all(
            colorisIdsArray.map((colorisId) =>
                productRepo.getColorisById(colorisId as import("@/core/domain/product").ProductColorisId)
            )
        );

        for (let i = 0; i < allColoris.length; i++) {
            const colorisData = allColoris[i];
            if (colorisData) {
                const colorisId = colorisIdsArray[i];
                colorisMap.set(colorisId, { coloris: colorisData.coloris });
            }
        }
    }

    // Map to store revenue and count by product, and product info
    const revenueByProduct = new Map<
        ProductId,
        {
            revenue: number;
            count: number;
            productName: string | null;
            coloris: string | null;
        }
    >();

    // Process each sale activity
    for (const saleActivity of saleActivities) {
        // Skip activities without productId
        if (!saleActivity.productId) {
            continue;
        }

        // Get product for this sale
        const product = productMap.get(saleActivity.productId);

        // Filter out sales with missing products (data inconsistency)
        if (!product) {
            continue;
        }

        // Get or create entry for this product
        const existing = revenueByProduct.get(saleActivity.productId);
        if (existing) {
            existing.revenue += saleActivity.amount;
            existing.count += 1;
        } else {
            // Determine product name and coloris
            let productName: string | null = null;
            let coloris: string | null = null;

            // Try to get name and coloris from product (deprecated but available during migration)
            if (product.name && product.coloris) {
                productName = product.name;
                coloris = product.coloris;
            } else {
                // Get name from model map or product
                if (product.modelId) {
                    const modelData = modelMap.get(product.modelId);
                    if (modelData) {
                        productName = modelData.name;
                    }
                }
                if (!productName && product.name) {
                    productName = product.name;
                }

                // Get coloris from coloris map or product
                if (product.colorisId) {
                    const colorisData = colorisMap.get(product.colorisId);
                    if (colorisData) {
                        coloris = colorisData.coloris;
                    }
                }
                if (!coloris && product.coloris) {
                    coloris = product.coloris;
                }
            }

            // Use fallback values if name or coloris cannot be determined
            productName = productName || "Unknown";
            coloris = coloris || "N/A";

            revenueByProduct.set(saleActivity.productId, {
                revenue: saleActivity.amount,
                count: 1,
                productName,
                coloris,
            });
        }
    }

    // Convert map to array and sort by revenue (descending)
    const result: RevenueByProduct[] = Array.from(revenueByProduct.entries())
        .map(([productId, data]) => ({
            productId,
            productName: data.productName || "Unknown",
            coloris: data.coloris || "N/A",
            revenue: data.revenue,
            count: data.count,
        }))
        .sort((a, b) => b.revenue - a.revenue);

    return result;
};

