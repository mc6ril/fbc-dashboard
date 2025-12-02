/**
 * Activity Usecases (Usecase layer).
 * Orchestrate validation and repository calls. Return domain types only.
 */

import type { ActivityRepository } from "@/core/ports/activityRepository";
import type { ProductRepository } from "@/core/ports/productRepository";
import type { Activity, ActivityId, ActivityError } from "@/core/domain/activity";
import { ActivityType } from "@/core/domain/activity";
import { isValidActivity } from "@/core/domain/validation";
import type { ProductId } from "@/core/domain/product";
import { validateNumber } from "@/shared/utils/number";
import { isValidISO8601, filterByDateRange } from "@/shared/utils/date";
import { createProductMap } from "@/shared/utils/product";

/** Creates a typed validation error. */
const createValidationError = (message: string): ActivityError => {
    return {
        code: "VALIDATION_ERROR",
        message,
    } satisfies ActivityError;
};

/**
 * Updates product stock based on activity quantity using atomic database operations.
 *
 * This function updates the product's stock level by adding the activity quantity
 * to the current stock using an atomic database operation. The stock is updated
 * only for activities that affect inventory:
 * - CREATION activities with productId (typically increases stock)
 * - SALE activities with productId (typically decreases stock)
 * - STOCK_CORRECTION activities with productId (can increase or decrease stock)
 *
 * Stock is NOT updated for:
 * - OTHER activities (regardless of productId)
 * - Activities without productId
 * - Activities with zero quantity
 *
 * The stock update is performed atomically at the database level using a PostgreSQL
 * RPC function, which prevents race conditions when multiple activities are created
 * concurrently for the same product. The result is clamped to ensure stock never
 * goes below 0.
 *
 * Data Quality Monitoring:
 * - If the stock would go negative (e.g., selling more than available), a warning
 *   is logged to help detect potential business logic errors
 * - The stock is still clamped to 0 to prevent data corruption, but the warning
 *   alerts developers to investigate the root cause
 *
 * @param {ProductRepository} productRepo - Product repository for stock updates
 * @param {Activity} activity - Activity that affects stock
 * @returns {Promise<void>} Promise that resolves when stock is updated
 * @throws {Error} If product is not found or stock update fails
 */
const updateProductStockFromActivity = async (
    productRepo: ProductRepository,
    activity: Activity
): Promise<void> => {
    // Only update stock for activities with productId
    if (!activity.productId) {
        return;
    }

    // Only update stock for CREATION, SALE, STOCK_CORRECTION
    if (activity.type === ActivityType.OTHER) {
        return;
    }

    // Skip if quantity is zero (no stock change)
    if (activity.quantity === 0) {
        return;
    }

    // Get current stock to detect if update would result in negative stock
    const currentProduct = await productRepo.getById(activity.productId);
    if (!currentProduct) {
        throw new Error(`Product with id ${activity.productId} not found`);
    }

    // Calculate expected new stock (before clamping)
    const expectedNewStock = currentProduct.stock + activity.quantity;

    // Log warning if stock would go negative (indicates potential business logic error)
    // This helps detect issues like selling more than available stock
    if (expectedNewStock < 0) {
        console.warn(
            `Stock would go negative for product ${activity.productId}: current stock ${currentProduct.stock}, activity quantity ${activity.quantity}, expected stock ${expectedNewStock}. Stock will be clamped to 0.`
        );
    }

    // Atomically update product stock by adding activity quantity
    // Uses database-level atomic operation to prevent race conditions
    // when multiple activities are created concurrently for the same product
    // Note: Stock is clamped to 0 minimum at database level
    await productRepo.updateStockAtomically(activity.productId, activity.quantity);
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
 * After creating the activity, this usecase automatically updates the product's stock
 * if applicable (CREATION, SALE, or STOCK_CORRECTION activities with productId
 * and non-zero quantity).
 *
 * Stock update logic:
 * - Activity is created first
 * - Product stock is updated by adding activity.quantity to current stock
 * - Stock is clamped to ensure it never goes below 0
 * - If stock update fails, the activity is automatically rolled back (deleted)
 *   to maintain data consistency
 *
 * Data Consistency Guarantees:
 * - The activity and stock update are NOT atomic at the database level (no transaction)
 * - However, a manual rollback mechanism ensures that if stock update fails, the activity
 *   is automatically deleted to prevent orphaned activities
 * - If the rollback itself fails (rare edge case), the activity may remain without
 *   affecting stock. This should be monitored and can be detected by comparing
 *   activities with product stock levels
 * - Consider implementing a background job to detect and fix inconsistencies, or use
 *   database triggers to ensure stock updates are always applied
 *
 * @param {ActivityRepository} activityRepo - Activity repository for data persistence
 * @param {ProductRepository} productRepo - Product repository for stock updates
 * @param {Omit<Activity, 'id'>} activity - Activity data to create (without the id field)
 * @returns {Promise<Activity>} Promise resolving to the created activity with generated ID
 * @throws {ActivityError} If validation fails (missing productId for SALE/STOCK_CORRECTION, invalid date, invalid numbers)
 * @throws {Error} If activity repository creation fails (database error, constraint violation, etc.)
 * @throws {Error} If product stock update fails (product not found, database error, etc.)
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
 * const created = await addActivity(activityRepository, productRepository, newActivity);
 * // Activity is created and product stock is updated (decreased by 5)
 * ```
 */
export const addActivity = async (
    activityRepo: ActivityRepository,
    productRepo: ProductRepository,
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
    try {
        validateNumber(activity.quantity, "quantity");
    } catch (error) {
        throw createValidationError(error instanceof Error ? error.message : "Invalid quantity");
    }

    // Validate amount is a valid number
    try {
        validateNumber(activity.amount, "amount");
    } catch (error) {
        throw createValidationError(error instanceof Error ? error.message : "Invalid amount");
    }

    // Validate activity using domain validation (checks productId requirement)
    const activityWithId = {
        ...activity,
        id: "" as ActivityId, // Temporary ID for validation
    };
    if (!isValidActivity(activityWithId)) {
        throw createValidationError("Activity validation failed");
    }

    // Create activity first
    const createdActivity = await activityRepo.create(activity);

    // Update product stock if applicable
    // Note: This operation is NOT atomic at the database level, but we implement
    // a manual rollback mechanism to maintain data consistency. If stock update fails,
    // the activity is automatically deleted to prevent orphaned activities that don't
    // affect stock levels. This ensures that activities and stock levels remain consistent.
    //
    // Edge case: If the rollback itself fails (e.g., database connection lost),
    // the activity may remain in the database without affecting stock. This is a
    // rare scenario that should be monitored and can be detected by comparing
    // activities with product stock levels. Consider implementing:
    // - A background job to detect and fix inconsistencies
    // - Database triggers to ensure stock updates are always applied
    // - Monitoring alerts for rollback failures
    try {
        await updateProductStockFromActivity(productRepo, createdActivity);
    } catch (error) {
        // If stock update fails, rollback activity creation to maintain data consistency
        try {
            await activityRepo.delete(createdActivity.id);
        } catch (rollbackError) {
            // If rollback fails, log but don't throw (original error is more important)
            // In production, this should be logged to monitoring system
            // This is a critical error that indicates potential data inconsistency
            console.error(
                `Failed to rollback activity creation after stock update failure: ${rollbackError instanceof Error ? rollbackError.message : "Unknown error"}. Activity ${createdActivity.id} may remain in database without affecting stock.`
            );
        }
        throw new Error(
            `Failed to update product stock for activity: ${error instanceof Error ? error.message : "Unknown error"}`
        );
    }

    return createdActivity;
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
 * After updating the activity, this usecase automatically recalculates and updates
 * the product's stock if the quantity or productId changed. The stock update logic:
 * - Recalculates stock from all activities using `computeStockFromActivities`
 *   (this avoids race conditions by using the source of truth instead of incremental updates)
 * - Updates the product stock to match the recalculated value
 * - If productId changed, both old and new products are recalculated and updated
 * - If stock recalculation fails, the activity update is rolled back to maintain data consistency
 *
 * Data Consistency Guarantees:
 * - The activity update and stock recalculation are NOT atomic at the database level (no transaction)
 * - However, a manual rollback mechanism ensures that if stock recalculation fails, the activity
 *   is automatically reverted to its previous state to prevent activities with incorrect stock impact
 * - If the rollback itself fails (rare edge case), the activity may remain in an updated state
 *   without the corresponding stock update. This should be monitored and can be detected by
 *   comparing activities with product stock levels
 * - Consider implementing a background job to detect and fix inconsistencies, or use database
 *   triggers to ensure stock updates are always applied
 *
 * @param {ActivityRepository} activityRepo - Activity repository for data persistence
 * @param {ProductRepository} productRepo - Product repository for stock updates
 * @param {ActivityId} id - Unique identifier of the activity to update
 * @param {Partial<Activity>} updates - Partial activity object with fields to update
 * @returns {Promise<Activity>} Promise resolving to the updated activity
 * @throws {ActivityError} If validation fails (missing productId for SALE/STOCK_CORRECTION, invalid date, invalid numbers, removing productId from SALE/STOCK_CORRECTION)
 * @throws {Error} If the activity with the given ID does not exist
 * @throws {Error} If repository update fails (database error, constraint violation, etc.)
 * @throws {Error} If product stock update fails (product not found, database error, etc.)
 *
 * @example
 * ```typescript
 * const updates = {
 *   quantity: -10,
 *   amount: 199.90,
 *   note: "Updated sale quantity"
 * };
 * const updated = await updateActivity(activityRepository, productRepository, activityId, updates);
 * // Activity is updated and product stock is adjusted (old quantity reverted, new quantity applied)
 * ```
 */
export const updateActivity = async (
    activityRepo: ActivityRepository,
    productRepo: ProductRepository,
    id: ActivityId,
    updates: Partial<Activity>
): Promise<Activity> => {
    // Retrieve existing activity to validate updates against current state
    const existingActivity = await activityRepo.getById(id);
    if (!existingActivity) {
        throw new Error(`Activity with id ${id} not found`);
    }

    // Validate that if productId is removed, activity type must not be SALE or STOCK_CORRECTION
    //
    // Important: We need to distinguish between two cases:
    // 1. productId is NOT in updates object: updates = { quantity: 10 }
    //    → productId is not being changed (keep existing value)
    // 2. productId is explicitly set to undefined: updates = { productId: undefined }
    //    → productId is being removed (explicit deletion)
    //
    // In JavaScript/TypeScript, both cases result in updates.productId === undefined,
    // so we use "productId" in updates to detect case 2 (key presence indicates explicit removal).
    // Without this check, we couldn't distinguish between "don't change productId" and "remove productId".
    if (updates.productId === undefined && "productId" in updates) {
        // productId was explicitly removed (case 2) - check against existing type
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
        try {
            validateNumber(updates.quantity, "quantity");
        } catch (error) {
            throw createValidationError(error instanceof Error ? error.message : "Invalid quantity");
        }
    }

    // Validate amount if it's being updated
    if (updates.amount !== undefined) {
        try {
            validateNumber(updates.amount, "amount");
        } catch (error) {
            throw createValidationError(error instanceof Error ? error.message : "Invalid amount");
        }
    }

    // Validate merged activity using domain validation
    if (!isValidActivity(mergedActivity)) {
        throw createValidationError("Activity validation failed");
    }

    // Check if quantity or productId changed (affects stock)
    const quantityChanged = updates.quantity !== undefined && updates.quantity !== existingActivity.quantity;
    
    // Detect productId changes: either changed to a new value OR explicitly removed (set to undefined)
    // Note: We use "productId" in updates (not just updates.productId !== undefined) to detect
    // both cases: (1) productId changed to a new value, and (2) productId explicitly removed (undefined).
    // Without checking key presence, we couldn't distinguish between "not updating productId"
    // (key absent) and "removing productId" (key present with undefined value).
    const productIdChanged = "productId" in updates && updates.productId !== existingActivity.productId;
    const typeChanged = updates.type !== undefined && updates.type !== existingActivity.type;
    const affectsStock = quantityChanged || productIdChanged || typeChanged;

    // Update activity in repository
    const updatedActivity = await activityRepo.update(id, updates);

    // Update product stock if quantity or productId changed
    if (affectsStock) {
        try {
            // Collect all affected product IDs (old and new)
            const productsToUpdate: Set<ProductId> = new Set();
            if (existingActivity.productId) {
                productsToUpdate.add(existingActivity.productId);
            }
            if (updatedActivity.productId) {
                productsToUpdate.add(updatedActivity.productId);
            }

            // Recalculate stock from all activities for each affected product
            // This approach avoids race conditions by recalculating from the source of truth
            // instead of using incremental updates
            for (const productId of productsToUpdate) {
                const stockMap = await computeStockFromActivities(activityRepo, productId);
                const newStock = stockMap[productId] || 0;
                
                // Update product stock to the recalculated value
                // Use atomic update to set the exact value (not increment)
                // Since we're recalculating from all activities, we need to set the absolute value
                // Get current stock first to calculate the delta
                const currentProduct = await productRepo.getById(productId);
                if (!currentProduct) {
                    throw new Error(`Product with id ${productId} not found`);
                }
                
                // Calculate delta needed to reach the correct stock
                const stockDelta = newStock - currentProduct.stock;
                
                // Log warning if stock would go negative (indicates potential business logic error)
                // This helps detect issues like selling more than available stock
                if (newStock < 0) {
                    console.warn(
                        `Stock would go negative for product ${productId}: current stock ${currentProduct.stock}, recalculated stock ${newStock}. Stock will be clamped to 0.`
                    );
                }
                
                // Apply delta using atomic update (handles clamping to 0)
                if (stockDelta !== 0) {
                    await productRepo.updateStockAtomically(productId, stockDelta);
                }
            }
        } catch (error) {
            // If stock update fails, rollback activity update to maintain data consistency
            // Note: This operation is NOT atomic at the database level, but we implement
            // a manual rollback mechanism to maintain data consistency. If stock recalculation
            // fails, the activity is automatically reverted to its previous state to prevent
            // activities with incorrect stock impact.
            //
            // Edge case: If the rollback itself fails (e.g., database connection lost),
            // the activity may remain in an updated state without the corresponding stock
            // update. This is a rare scenario that should be monitored and can be detected
            // by comparing activities with product stock levels. Consider implementing:
            // - A background job to detect and fix inconsistencies
            // - Database triggers to ensure stock updates are always applied
            // - Monitoring alerts for rollback failures
            try {
                // Revert activity to its previous state
                const revertUpdates: Partial<Activity> = {};
                if (updates.quantity !== undefined) {
                    revertUpdates.quantity = existingActivity.quantity;
                }
                if (updates.productId !== undefined) {
                    revertUpdates.productId = existingActivity.productId;
                }
                if (updates.type !== undefined) {
                    revertUpdates.type = existingActivity.type;
                }
                if (updates.date !== undefined) {
                    revertUpdates.date = existingActivity.date;
                }
                if (updates.amount !== undefined) {
                    revertUpdates.amount = existingActivity.amount;
                }
                if (updates.note !== undefined) {
                    revertUpdates.note = existingActivity.note;
                }
                
                // Only revert if there are actual changes to revert
                if (Object.keys(revertUpdates).length > 0) {
                    await activityRepo.update(id, revertUpdates);
                }
            } catch (rollbackError) {
                // If rollback fails, log but don't throw (original error is more important)
                // In production, this should be logged to monitoring system
                // This is a critical error that indicates potential data inconsistency
                console.error(
                    `Failed to rollback activity update after stock recalculation failure: ${rollbackError instanceof Error ? rollbackError.message : "Unknown error"}. Activity ${id} may remain in updated state without corresponding stock update.`
                );
            }
            throw new Error(
                `Failed to update product stock for activity: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        }
    }

    return updatedActivity;
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
    const filteredActivities = filterByDateRange(
        allActivities,
        startDate,
        endDate
    );

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
    const productMap = createProductMap(allProducts);

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
    const filteredActivities = filterByDateRange(
        allActivities,
        startDate,
        endDate
    );

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
 * Lists activities with optional filtering by date range, type, and product.
 *
 * This usecase retrieves activities from the repository and applies client-side
 * filtering based on the provided filter parameters. Filtering is done in-memory
 * for simplicity and can be optimized later by moving filtering to the repository
 * level if performance becomes an issue.
 *
 * Filtering logic:
 * - Date range: If `startDate` is provided, only activities on or after this date are included.
 *   If `endDate` is provided, only activities on or before this date are included.
 *   Date comparison uses ISO 8601 string comparison (lexicographic order).
 * - Type: If `type` is provided, only activities matching this type are included.
 * - Product: If `productId` is provided, only activities associated with this product are included.
 * - Multiple filters: All provided filters are applied together (AND logic).
 * - Empty filters: If no filters are provided, all activities are returned.
 *
 * Validation:
 * - Date parameters must be valid ISO 8601 strings if provided.
 * - Invalid date parameters will throw an ActivityError.
 *
 * Performance considerations:
 * - Retrieves all activities from the repository and filters in memory.
 * - For large activity lists, consider implementing filtering at repository level.
 * - The function is optimized for small to medium datasets (< 10,000 activities).
 *
 * @param {ActivityRepository} repo - Activity repository for data retrieval
 * @param {string} [startDate] - Optional start date (ISO 8601 format) to filter activities from this date onwards
 * @param {string} [endDate] - Optional end date (ISO 8601 format) to filter activities up to this date
 * @param {ActivityType} [type] - Optional activity type to filter by
 * @param {ProductId} [productId] - Optional product ID to filter by
 * @returns {Promise<Activity[]>} Promise resolving to an array of filtered activities, or empty array if none match
 * @throws {ActivityError} If date parameters are invalid (not valid ISO 8601 format)
 * @throws {Error} If repository retrieval fails (database connection error, query error, etc.)
 *
 * @example
 * ```typescript
 * // List all activities (no filters)
 * const allActivities = await listActivitiesWithFilters(activityRepository);
 * // Returns: [Activity, Activity, ...] (all activities)
 *
 * // Filter by date range
 * const activitiesInRange = await listActivitiesWithFilters(
 *   activityRepository,
 *   "2025-01-01T00:00:00.000Z",
 *   "2025-01-31T23:59:59.999Z"
 * );
 * // Returns: [Activity, Activity, ...] (activities in January 2025)
 *
 * // Filter by type
 * const sales = await listActivitiesWithFilters(
 *   activityRepository,
 *   undefined,
 *   undefined,
 *   ActivityType.SALE
 * );
 * // Returns: [Activity, Activity, ...] (only SALE activities)
 *
 * // Filter by product
 * const productActivities = await listActivitiesWithFilters(
 *   activityRepository,
 *   undefined,
 *   undefined,
 *   undefined,
 *   productId
 * );
 * // Returns: [Activity, Activity, ...] (activities for specific product)
 *
 * // Combined filters
 * const filtered = await listActivitiesWithFilters(
 *   activityRepository,
 *   "2025-01-01T00:00:00.000Z",
 *   "2025-01-31T23:59:59.999Z",
 *   ActivityType.SALE,
 *   productId
 * );
 * // Returns: [Activity, Activity, ...] (SALE activities for product in January 2025)
 * ```
 */
export const listActivitiesWithFilters = async (
    repo: ActivityRepository,
    startDate?: string,
    endDate?: string,
    type?: ActivityType,
    productId?: ProductId
): Promise<Activity[]> => {
    // Validate date range parameters if provided
    if (startDate !== undefined && !isValidISO8601(startDate)) {
        throw createValidationError("startDate must be a valid ISO 8601 string");
    }

    if (endDate !== undefined && !isValidISO8601(endDate)) {
        throw createValidationError("endDate must be a valid ISO 8601 string");
    }

    // Retrieve all activities
    const allActivities = await repo.list();

    // Handle empty activity list
    if (allActivities.length === 0) {
        return [];
    }

    // Apply filters
    let filteredActivities = allActivities;

    // Filter by date range if provided
    if (startDate !== undefined || endDate !== undefined) {
        filteredActivities = filteredActivities.filter((activity) => {
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

    // Filter by type if provided
    if (type !== undefined) {
        filteredActivities = filteredActivities.filter(
            (activity) => activity.type === type
        );
    }

    // Filter by productId if provided
    if (productId !== undefined) {
        filteredActivities = filteredActivities.filter(
            (activity) => activity.productId === productId
        );
    }

    return filteredActivities;
};

/**
 * Paginated result type for activities list.
 *
 * Contains the paginated activities array along with pagination metadata
 * for building pagination UI components.
 */
export type PaginatedActivitiesResult = {
    /** Array of activities for the current page */
    activities: Activity[];
    /** Total number of activities matching the filters (before pagination) */
    total: number;
    /** Current page number (1-based) */
    page: number;
    /** Number of activities per page */
    pageSize: number;
    /** Total number of pages */
    totalPages: number;
};

/**
 * Lists activities with filtering and pagination.
 *
 * This usecase combines filtering and pagination to provide a paginated list
 * of activities. It first applies filters (date range, type, product), then
 * sorts the results by date descending, and finally paginates the results.
 *
 * Filtering logic:
 * - Date range: If `startDate` is provided, only activities on or after this date are included.
 *   If `endDate` is provided, only activities on or before this date are included.
 *   Date comparison uses ISO 8601 string comparison (lexicographic order).
 * - Type: If `type` is provided, only activities matching this type are included.
 * - Product: If `productId` is provided, only activities associated with this product are included.
 * - Multiple filters: All provided filters are applied together (AND logic).
 * - Empty filters: If no filters are provided, all activities are included.
 *
 * Pagination logic:
 * - Page numbers are 1-based (first page is page 1, not page 0).
 * - Default page size is 20 activities per page.
 * - Activities are sorted by date descending (most recent first) before pagination.
 * - Total count is calculated from filtered activities (before pagination).
 * - Total pages is calculated as `Math.ceil(total / pageSize)`.
 *
 * Edge cases:
 * - Empty results: Returns empty activities array with total: 0, totalPages: 0.
 * - Page out of range: If page exceeds totalPages, returns empty activities array
 *   but preserves correct pagination metadata (page, totalPages).
 * - Invalid page: If page is less than 1, treats it as page 1.
 *
 * Validation:
 * - Date parameters must be valid ISO 8601 strings if provided.
 * - Invalid date parameters will throw an ActivityError.
 * - Page must be a positive integer (defaults to 1 if invalid).
 * - Page size must be a positive integer (defaults to 20 if invalid).
 *
 * Performance considerations:
 * - Retrieves all activities from the repository and filters/sorts/paginates in memory.
 * - For large activity lists, consider implementing filtering, sorting, and pagination at repository level.
 * - The function is optimized for small to medium datasets (< 10,000 activities).
 *
 * @param {ActivityRepository} repo - Activity repository for data retrieval
 * @param {string} [startDate] - Optional start date (ISO 8601 format) to filter activities from this date onwards
 * @param {string} [endDate] - Optional end date (ISO 8601 format) to filter activities up to this date
 * @param {ActivityType} [type] - Optional activity type to filter by
 * @param {ProductId} [productId] - Optional product ID to filter by
 * @param {number} [page=1] - Page number (1-based, default: 1)
 * @param {number} [pageSize=20] - Number of activities per page (default: 20)
 * @returns {Promise<PaginatedActivitiesResult>} Promise resolving to paginated activities result with metadata
 * @throws {ActivityError} If date parameters are invalid (not valid ISO 8601 format)
 * @throws {Error} If repository retrieval fails (database connection error, query error, etc.)
 *
 * @example
 * ```typescript
 * // List first page of all activities (default: page 1, pageSize 20)
 * const result = await listActivitiesPaginated(activityRepository);
 * // Returns: { activities: [Activity, ...], total: 100, page: 1, pageSize: 20, totalPages: 5 }
 *
 * // List second page with filters
 * const result = await listActivitiesPaginated(
 *   activityRepository,
 *   "2025-01-01T00:00:00.000Z",
 *   "2025-01-31T23:59:59.999Z",
 *   ActivityType.SALE,
 *   undefined,
 *   2,
 *   20
 * );
 * // Returns: { activities: [Activity, ...], total: 45, page: 2, pageSize: 20, totalPages: 3 }
 *
 * // List with custom page size
 * const result = await listActivitiesPaginated(
 *   activityRepository,
 *   undefined,
 *   undefined,
 *   undefined,
 *   undefined,
 *   1,
 *   10
 * );
 * // Returns: { activities: [Activity, ...], total: 100, page: 1, pageSize: 10, totalPages: 10 }
 * ```
 */
export const listActivitiesPaginated = async (
    repo: ActivityRepository,
    startDate?: string,
    endDate?: string,
    type?: ActivityType,
    productId?: ProductId,
    page: number = 1,
    pageSize: number = 20
): Promise<PaginatedActivitiesResult> => {
    // Validate and normalize pagination parameters
    const normalizedPage = Math.max(1, Math.floor(page));
    const normalizedPageSize = Math.max(1, Math.floor(pageSize));

    // Get filtered activities using existing filtering usecase
    const filteredActivities = await listActivitiesWithFilters(
        repo,
        startDate,
        endDate,
        type,
        productId
    );

    // Calculate total count (before pagination)
    const total = filteredActivities.length;

    // Handle empty results
    if (total === 0) {
        return {
            activities: [],
            total: 0,
            page: normalizedPage,
            pageSize: normalizedPageSize,
            totalPages: 0,
        };
    }

    // Sort activities by date descending (most recent first)
    const sortedActivities = [...filteredActivities].sort((a, b) => {
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

    // Calculate total pages
    const totalPages = Math.ceil(total / normalizedPageSize);

    // Handle page out of range
    if (normalizedPage > totalPages) {
        return {
            activities: [],
            total,
            page: normalizedPage,
            pageSize: normalizedPageSize,
            totalPages,
        };
    }

    // Calculate pagination slice indices
    const startIndex = (normalizedPage - 1) * normalizedPageSize;
    const endIndex = startIndex + normalizedPageSize;

    // Get paginated activities
    const paginatedActivities = sortedActivities.slice(startIndex, endIndex);

    return {
        activities: paginatedActivities,
        total,
        page: normalizedPage,
        pageSize: normalizedPageSize,
        totalPages,
    };
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
