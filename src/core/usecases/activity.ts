/**
 * Activity Usecases (Usecase layer).
 * Orchestrate validation and repository calls. Return domain types only.
 */

import type { ActivityRepository } from "@/core/ports/activityRepository";
import type { ProductRepository } from "@/core/ports/productRepository";
import type { Activity, ActivityId, ActivityError } from "@/core/domain/activity";
import { ActivityType } from "@/core/domain/activity";
import { isValidActivity, isValidISO8601 } from "@/core/domain/validation";
import type { ProductId, Product } from "@/core/domain/product";

/** Creates a typed validation error. */
const createValidationError = (message: string): ActivityError => {
    return {
        code: "VALIDATION_ERROR",
        message,
    } satisfies ActivityError;
};

/**
 * Validates that a number is valid (not NaN, not Infinity).
 *
 * @param {number} value - Number to validate
 * @param {string} fieldName - Name of the field for error messages
 * @returns {boolean} True if number is valid, false otherwise
 */
const isValidNumber = (value: number, fieldName: string): boolean => {
    if (isNaN(value)) {
        throw createValidationError(`${fieldName} must be a valid number`);
    }
    if (!isFinite(value)) {
        throw createValidationError(`${fieldName} must be a finite number`);
    }
    return true;
};

/**
 * Validates and creates a new activity.
 *
 * This usecase validates business rules before delegating to the repository:
 * - productId is REQUIRED for SALE and STOCK_CORRECTION activity types
 * - date must be a valid ISO 8601 string
 * - quantity must be a valid number (not NaN, not Infinity)
 * - amount must be a valid number (not NaN, not Infinity)
 *
 * @param {ActivityRepository} repo - Activity repository for data persistence
 * @param {Omit<Activity, 'id'>} activity - Activity data to create (without the id field)
 * @returns {Promise<Activity>} Promise resolving to the created activity with generated ID
 * @throws {ActivityError} If validation fails (missing productId for SALE/STOCK_CORRECTION, invalid date, invalid numbers)
 * @throws {Error} If repository creation fails (database error, constraint violation, etc.)
 *
 * @example
 * ```typescript
 * const newActivity = {
 *   date: "2025-01-27T14:00:00.000Z",
 *   type: ActivityType.SALE,
 *   productId: "550e8400-e29b-41d4-a716-446655440000" as ProductId,
 *   quantity: -5,
 *   amount: 99.95,
 *   note: "Sale to customer"
 * };
 * const created = await addActivity(activityRepository, newActivity);
 * ```
 */
export const addActivity = async (
    repo: ActivityRepository,
    activity: Omit<Activity, "id">
): Promise<Activity> => {
    // Validate productId is provided for SALE and STOCK_CORRECTION types
    const requiresProductId =
        activity.type === ActivityType.SALE ||
        activity.type === ActivityType.STOCK_CORRECTION;

    if (requiresProductId) {
        if (!activity.productId) {
            throw createValidationError(
                `productId is required for ${activity.type} activity type`
            );
        }
    }

    // Validate date is a valid ISO 8601 string
    if (!activity.date || !isValidISO8601(activity.date)) {
        throw createValidationError("date must be a valid ISO 8601 string");
    }

    // Validate quantity is a valid number
    isValidNumber(activity.quantity, "quantity");

    // Validate amount is a valid number
    isValidNumber(activity.amount, "amount");

    // Validate activity using domain validation (checks productId requirement)
    const activityWithId = {
        ...activity,
        id: "" as ActivityId, // Temporary ID for validation
    };
    if (!isValidActivity(activityWithId)) {
        throw createValidationError("Activity validation failed");
    }

    // Delegate to repository
    return repo.create(activity);
};

/**
 * Lists all activities.
 *
 * This usecase delegates directly to the repository to retrieve all activities.
 * No business logic is applied, but this usecase maintains consistency with
 * the usecase pattern and allows future filtering/ordering logic to be added
 * without changing the interface.
 *
 * @param {ActivityRepository} repo - Activity repository for data retrieval
 * @returns {Promise<Activity[]>} Promise resolving to an array of all activities, or empty array if none exist
 * @throws {Error} If repository retrieval fails (database connection error, query error, etc.)
 *
 * @example
 * ```typescript
 * const activities = await listActivities(activityRepository);
 * // Returns: [Activity, Activity, ...] or []
 * ```
 */
export const listActivities = async (
    repo: ActivityRepository
): Promise<Activity[]> => {
    // Delegate to repository
    return repo.list();
};

/**
 * Validates and updates an existing activity.
 *
 * This usecase validates business rules before delegating to the repository:
 * - If `type` is updated to SALE or STOCK_CORRECTION, `productId` must be present
 * - If `productId` is removed (set to undefined), the activity type must not be SALE or STOCK_CORRECTION
 * - If `date` is updated, it must be a valid ISO 8601 string
 * - If `quantity` is updated, it must be a valid number (not NaN, not Infinity)
 * - If `amount` is updated, it must be a valid number (not NaN, not Infinity)
 *
 * The function first retrieves the existing activity to validate updates against
 * the current state (e.g., preventing removal of productId from SALE activities).
 *
 * @param {ActivityRepository} repo - Activity repository for data persistence
 * @param {ActivityId} id - Unique identifier of the activity to update
 * @param {Partial<Activity>} updates - Partial activity object with fields to update
 * @returns {Promise<Activity>} Promise resolving to the updated activity
 * @throws {ActivityError} If validation fails (missing productId for SALE/STOCK_CORRECTION, invalid date, invalid numbers, removing productId from SALE/STOCK_CORRECTION)
 * @throws {Error} If the activity with the given ID does not exist
 * @throws {Error} If repository update fails (database error, constraint violation, etc.)
 *
 * @example
 * ```typescript
 * const updates = {
 *   quantity: -10,
 *   amount: 199.90,
 *   note: "Updated sale quantity"
 * };
 * const updated = await updateActivity(activityRepository, activityId, updates);
 * ```
 */
export const updateActivity = async (
    repo: ActivityRepository,
    id: ActivityId,
    updates: Partial<Activity>
): Promise<Activity> => {
    // Retrieve existing activity to validate updates against current state
    const existingActivity = await repo.getById(id);
    if (!existingActivity) {
        throw new Error(`Activity with id ${id} not found`);
    }

    // Validate that if productId is removed, activity type must not be SALE or STOCK_CORRECTION
    // Check if productId was explicitly set to undefined in updates (before merge)
    if (updates.productId === undefined && "productId" in updates) {
        // productId was explicitly removed - check against existing type
        if (
            existingActivity.type === ActivityType.SALE ||
            existingActivity.type === ActivityType.STOCK_CORRECTION
        ) {
            throw createValidationError(
                `Cannot remove productId from ${existingActivity.type} activity type`
            );
        }
    }

    // Merge updates with existing activity to get the final state
    const mergedActivity: Activity = {
        ...existingActivity,
        ...updates,
    };

    // Validate that if type is updated to SALE or STOCK_CORRECTION, productId must be present
    const requiresProductId =
        mergedActivity.type === ActivityType.SALE ||
        mergedActivity.type === ActivityType.STOCK_CORRECTION;

    if (requiresProductId) {
        if (!mergedActivity.productId) {
            throw createValidationError(
                `productId is required for ${mergedActivity.type} activity type`
            );
        }
    }

    // Validate date if it's being updated
    if (updates.date !== undefined) {
        if (!updates.date || !isValidISO8601(updates.date)) {
            throw createValidationError("date must be a valid ISO 8601 string");
        }
    }

    // Validate quantity if it's being updated
    if (updates.quantity !== undefined) {
        isValidNumber(updates.quantity, "quantity");
    }

    // Validate amount if it's being updated
    if (updates.amount !== undefined) {
        isValidNumber(updates.amount, "amount");
    }

    // Validate merged activity using domain validation
    if (!isValidActivity(mergedActivity)) {
        throw createValidationError("Activity validation failed");
    }

    // Delegate to repository
    return repo.update(id, updates);
};

/**
 * Computes current stock levels per product by summing activity quantities.
 *
 * This usecase derives stock levels from activities by:
 * 1. Retrieving all activities (or filtered by productId if provided)
 * 2. Filtering out activities without productId (CREATION/OTHER types without product)
 * 3. Grouping activities by productId
 * 4. Summing quantity values per product (handles positive and negative quantities)
 *
 * The function enables stock tracking without maintaining a separate stock table.
 * Stock is calculated as the sum of all activity quantities for each product.
 *
 * Performance considerations:
 * - For large activity lists, this function may be slow as it processes all activities in memory
 * - Consider implementing pagination or date-range filtering in future iterations if performance becomes an issue
 * - The function is optimized for small to medium datasets (< 10,000 activities)
 *
 * @param {ActivityRepository} repo - Activity repository for data retrieval
 * @param {ProductId} [productId] - Optional product ID to filter activities for a single product
 * @returns {Promise<Record<ProductId, number>>} Promise resolving to a map of productId to stock level (quantity sum)
 * @throws {Error} If repository retrieval fails (database connection error, query error, etc.)
 *
 * @example
 * ```typescript
 * // Compute stock for all products
 * const stockMap = await computeStockFromActivities(activityRepository);
 * // Returns: { "product-id-1": 15, "product-id-2": -5, ... }
 *
 * // Compute stock for a specific product
 * const productStock = await computeStockFromActivities(activityRepository, productId);
 * // Returns: { "product-id": 15 }
 * ```
 */
export const computeStockFromActivities = async (
    repo: ActivityRepository,
    productId?: ProductId
): Promise<Record<ProductId, number>> => {
    // Retrieve all activities
    const allActivities = await repo.list();

    // Filter activities by productId if provided, and filter out activities without productId
    const relevantActivities = allActivities.filter((activity) => {
        // Filter out activities without productId
        if (!activity.productId) {
            return false;
        }

        // If productId filter is provided, only include activities for that product
        if (productId !== undefined) {
            return activity.productId === productId;
        }

        return true;
    });

    // Group activities by productId and sum quantities
    const stockMap: Record<ProductId, number> = {} as Record<ProductId, number>;

    for (const activity of relevantActivities) {
        // TypeScript guard: activity.productId is guaranteed to be defined after filter
        if (!activity.productId) {
            continue;
        }

        const pid = activity.productId;

        // Initialize stock for product if not already present
        if (!(pid in stockMap)) {
            stockMap[pid] = 0;
        }

        // Sum quantity (handles positive, negative, and zero quantities)
        stockMap[pid] += activity.quantity;
    }

    return stockMap;
};

/**
 * Computes total profit from SALE activities.
 *
 * This usecase calculates profit by:
 * 1. Retrieving all activities (or filtered by date range if provided)
 * 2. Filtering activities to SALE type only
 * 3. Retrieving products for all SALE activities (batch retrieval for efficiency)
 * 4. Calculating profit per sale: `(product.salePrice - product.unitCost) * Math.abs(activity.quantity)`
 * 5. Summing total profit across all sales
 *
 * Profit formula:
 * - Profit per sale = (salePrice - unitCost) * quantity_sold
 * - quantity_sold is the absolute value of activity.quantity (SALE activities typically have negative quantities)
 * - Total profit = sum of all individual sale profits
 *
 * Date range filtering:
 * - If startDate is provided, only activities on or after this date are included
 * - If endDate is provided, only activities on or before this date are included
 * - Both dates must be valid ISO 8601 strings if provided
 * - Date comparison is done using ISO 8601 string comparison (lexicographic order)
 *
 * Missing products:
 * - Activities with missing products are filtered out (not included in profit calculation)
 * - This ensures the function doesn't fail on data inconsistencies but may result in incomplete profit calculations
 *
 * Performance considerations:
 * - Uses batch product retrieval (ProductRepository.list()) for efficiency
 * - For large datasets, consider implementing pagination or date-range filtering at repository level
 * - The function is optimized for small to medium datasets (< 10,000 activities)
 *
 * @param {ActivityRepository} activityRepo - Activity repository for data retrieval
 * @param {ProductRepository} productRepo - Product repository for product data retrieval
 * @param {string} [startDate] - Optional start date (ISO 8601 format) to filter activities from this date onwards
 * @param {string} [endDate] - Optional end date (ISO 8601 format) to filter activities up to this date
 * @returns {Promise<number>} Promise resolving to total profit (sum of all sale profits)
 * @throws {ActivityError} If date range parameters are invalid (not valid ISO 8601 format)
 * @throws {Error} If repository retrieval fails (database connection error, query error, etc.)
 *
 * @example
 * ```typescript
 * // Compute profit for all sales
 * const totalProfit = await computeProfit(activityRepository, productRepository);
 * // Returns: 150.50
 *
 * // Compute profit for sales in a date range
 * const profitInRange = await computeProfit(
 *   activityRepository,
 *   productRepository,
 *   "2025-01-01T00:00:00.000Z",
 *   "2025-01-31T23:59:59.999Z"
 * );
 * // Returns: 75.25
 * ```
 */
export const computeProfit = async (
    activityRepo: ActivityRepository,
    productRepo: ProductRepository,
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
    const allActivities = await activityRepo.list();

    // Filter activities by date range if provided
    let filteredActivities = allActivities;
    if (startDate !== undefined || endDate !== undefined) {
        filteredActivities = allActivities.filter((activity) => {
            const activityDate = activity.date;

            // Filter by startDate (activities on or after startDate)
            if (startDate !== undefined && activityDate < startDate) {
                return false;
            }

            // Filter by endDate (activities on or before endDate)
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
        return 0;
    }

    // Retrieve all products (batch retrieval for efficiency)
    const allProducts = await productRepo.list();

    // Create a map of productId -> Product for quick lookup
    const productMap = new Map<ProductId, Product>();
    for (const product of allProducts) {
        productMap.set(product.id, product);
    }

    // Calculate profit for each sale and sum
    let totalProfit = 0;

    for (const saleActivity of saleActivities) {
        // Skip activities without productId (should not happen for SALE, but defensive check)
        if (!saleActivity.productId) {
            continue;
        }

        // Get product for this sale
        const product = productMap.get(saleActivity.productId);

        // Filter out sales with missing products (data inconsistency)
        if (!product) {
            continue;
        }

        // Calculate profit per sale: (salePrice - unitCost) * abs(quantity)
        const quantitySold = Math.abs(saleActivity.quantity);
        const profitPerSale = (product.salePrice - product.unitCost) * quantitySold;

        totalProfit += profitPerSale;
    }

    return totalProfit;
};

/**
 * Computes total sales amount from SALE activities.
 *
 * This usecase calculates total sales by:
 * 1. Retrieving all activities (or filtered by date range if provided)
 * 2. Filtering activities to SALE type only
 * 3. Summing the `amount` field from all matching SALE activities
 *
 * Sales formula:
 * - Total sales = sum of all SALE activity amounts
 * - Each SALE activity's `amount` field represents the total sale value for that transaction
 *
 * Date range filtering:
 * - If startDate is provided, only activities on or after this date are included
 * - If endDate is provided, only activities on or before this date are included
 * - Both dates must be valid ISO 8601 strings if provided
 * - Date comparison is done using ISO 8601 string comparison (lexicographic order)
 *
 * Performance considerations:
 * - For large datasets, consider implementing pagination or date-range filtering at repository level
 * - The function is optimized for small to medium datasets (< 10,000 activities)
 *
 * @param {ActivityRepository} repo - Activity repository for data retrieval
 * @param {string} [startDate] - Optional start date (ISO 8601 format) to filter activities from this date onwards
 * @param {string} [endDate] - Optional end date (ISO 8601 format) to filter activities up to this date
 * @returns {Promise<number>} Promise resolving to total sales amount (sum of all sale amounts)
 * @throws {ActivityError} If date range parameters are invalid (not valid ISO 8601 format)
 * @throws {Error} If repository retrieval fails (database connection error, query error, etc.)
 *
 * @example
 * ```typescript
 * // Compute total sales for all SALE activities
 * const totalSales = await computeTotalSales(activityRepository);
 * // Returns: 1250.75
 *
 * // Compute total sales for a date range
 * const salesInRange = await computeTotalSales(
 *   activityRepository,
 *   "2025-01-01T00:00:00.000Z",
 *   "2025-01-31T23:59:59.999Z"
 * );
 * // Returns: 850.50
 * ```
 */
export const computeTotalSales = async (
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

            // Filter by startDate (activities on or after startDate)
            if (startDate !== undefined && activityDate < startDate) {
                return false;
            }

            // Filter by endDate (activities on or before endDate)
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
        return 0;
    }

    // Sum amounts from all SALE activities
    let totalSales = 0;

    for (const saleActivity of saleActivities) {
        totalSales += saleActivity.amount;
    }

    return totalSales;
};

/**
 * Lists recent activities sorted by date.
 *
 * This usecase retrieves the most recent activities from the repository,
 * sorted by date in descending order (most recent first). The results are
 * limited to a specified count to provide a manageable list for display.
 *
 * Business rules:
 * - Activities are sorted by `date` field in descending order (newest first)
 * - Results are limited to the specified `limit` count (default: 10)
 * - All activity types are included (no filtering by type)
 * - Returns empty array if no activities exist
 *
 * Date sorting:
 * - Uses ISO 8601 string comparison (lexicographic order)
 * - ISO 8601 format ensures correct chronological ordering when compared as strings
 * - Most recent activities (latest dates) appear first in the result
 *
 * Performance considerations:
 * - Retrieves all activities from the repository and sorts in memory
 * - For large activity lists, consider implementing sorting and limiting at repository level
 * - The function is optimized for small to medium datasets (< 10,000 activities)
 *
 * @param {ActivityRepository} repo - Activity repository for data retrieval
 * @param {number} [limit=10] - Optional limit for the number of activities to return (default: 10)
 * @returns {Promise<Activity[]>} Promise resolving to an array of recent activities sorted by date descending, or empty array if none exist
 * @throws {Error} If repository retrieval fails (database connection error, query error, etc.)
 *
 * @example
 * ```typescript
 * // List 10 most recent activities (default)
 * const recentActivities = await listRecentActivities(activityRepository);
 * // Returns: [Activity, Activity, ...] (up to 10, sorted by date descending)
 *
 * // List 5 most recent activities
 * const recentActivities = await listRecentActivities(activityRepository, 5);
 * // Returns: [Activity, Activity, ...] (up to 5, sorted by date descending)
 * ```
 */
export const listRecentActivities = async (
    repo: ActivityRepository,
    limit: number = 10
): Promise<Activity[]> => {
    // Retrieve all activities
    const allActivities = await repo.list();

    // Handle empty activity list
    if (allActivities.length === 0) {
        return [];
    }

    // Sort activities by date descending (most recent first)
    const sortedActivities = [...allActivities].sort((a, b) => {
        // ISO 8601 strings can be compared lexicographically for chronological order
        // Most recent dates (larger values) should come first, so we reverse the comparison
        if (a.date > b.date) {
            return -1;
        }
        if (a.date < b.date) {
            return 1;
        }
        return 0;
    });

    // Limit results to specified count
    return sortedActivities.slice(0, limit);
};

