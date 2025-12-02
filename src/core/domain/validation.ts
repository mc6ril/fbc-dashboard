/**
 * Domain Validation Functions
 *
 * Pure business rule validation functions for domain entities.
 * These functions contain business logic for validating domain entities
 * and are used across usecases and tests.
 *
 * Following Clean Architecture principles, these functions:
 * - Are pure functions with no side effects
 * - Have no external dependencies
 * - Contain only business rules
 * - Can be used in domain, usecases, and tests
 */

import type {
    Product,
    ProductModel,
    ProductModelId,
    ProductColoris,
} from "./product";
import { ProductType } from "./product";
import type { Activity } from "./activity";
import { ActivityType } from "./activity";
import type { StockMovement } from "./stockMovement";
import { StockMovementSource } from "./stockMovement";

/**
 * Validates email format using a basic regex pattern.
 *
 * This is a basic validation that checks for the standard email format:
 * local@domain where local and domain contain no spaces or @ symbols,
 * and domain contains at least one dot.
 *
 * Note: This is a simplified validation. The authentication service (Supabase)
 * will perform more strict validation. This validation catches obvious errors
 * before making network requests.
 *
 * @param {string} email - Email address to validate
 * @param {boolean} [trim=true] - Whether to trim whitespace before validation (default: true)
 * @returns {boolean} True if email format is valid, false otherwise
 *
 * @example
 * ```typescript
 * isValidEmail("user@example.com"); // true
 * isValidEmail("  user@example.com  "); // true (trimmed)
 * isValidEmail("invalid-email"); // false
 * isValidEmail("user@domain", false); // false (no TLD, not trimmed)
 * ```
 */
export const isValidEmail = (email: string, trim: boolean = true): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailToValidate = trim ? email.trim() : email;
    return emailRegex.test(emailToValidate);
};

/**
 * Validates password meets minimum requirements.
 *
 * Current requirements:
 * - Not empty
 * - Minimum 8 characters
 *
 * This is a basic validation. The authentication service (Supabase) may
 * have additional requirements. This validation catches obvious errors
 * before making network requests.
 *
 * @param {string} password - Password to validate
 * @returns {boolean} True if password meets requirements, false otherwise
 *
 * @example
 * ```typescript
 * isValidPassword("password123"); // true
 * isValidPassword("short"); // false (less than 8 characters)
 * isValidPassword(""); // false (empty)
 * ```
 */
export const isValidPassword = (password: string): boolean => {
    return password.length >= 8;
};

/**
 * Validates UUID v4 format.
 *
 * UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 * Where:
 * - x is any hexadecimal digit
 * - The third group starts with 4 (version 4)
 * - The fourth group starts with 8, 9, a, or b (variant)
 *
 * @param {string} value - String to validate as UUID v4
 * @returns {boolean} True if value is a valid UUID v4 format, false otherwise
 *
 * @example
 * ```typescript
 * isValidUUID("123e4567-e89b-4d3a-a456-426614174000"); // true
 * isValidUUID("invalid-uuid"); // false
 * ```
 */
export const isValidUUID = (value: string): boolean => {
    const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
};

/**
 * Validates ISO 8601 date format.
 *
 * Validates that a string matches the ISO 8601 date-time format:
 * - YYYY-MM-DDTHH:mm:ss.sssZ (with milliseconds and timezone)
 * - YYYY-MM-DDTHH:mm:ssZ (without milliseconds, with timezone)
 * - YYYY-MM-DDTHH:mm:ss (without timezone)
 *
 * Also verifies that the date is actually valid (not just format matching).
 *
 * @param {string} value - String to validate as ISO 8601 date
 * @returns {boolean} True if value is a valid ISO 8601 date format, false otherwise
 *
 * @example
 * ```typescript
 * isValidISO8601("2025-01-27T14:00:00.000Z"); // true
 * isValidISO8601("2025-01-27T14:00:00Z"); // true
 * isValidISO8601("invalid-date"); // false
 * isValidISO8601("2025-13-45T99:99:99.999Z"); // false (invalid date)
 * ```
 */
export const isValidISO8601 = (value: string): boolean => {
    const iso8601Regex =
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
    if (!iso8601Regex.test(value)) {
        return false;
    }
    const date = new Date(value);
    return (
        !isNaN(date.getTime()) &&
        date.toISOString().startsWith(value.substring(0, 19))
    );
};

/**
 * Validates a Product entity against business rules.
 *
 * Business rules:
 * - unitCost must be positive (greater than 0)
 * - salePrice must be positive (greater than 0)
 * - stock must be non-negative (greater than or equal to 0)
 * - coloris must be a non-empty string (after trimming whitespace)
 * - weight is optional, but if provided must be positive (greater than 0)
 *
 * @param {Product} product - Product entity to validate
 * @returns {boolean} True if product meets all business rules, false otherwise
 *
 * @example
 * ```typescript
 * const validProduct: Product = {
 *   id: "123e4567-e89b-4d3a-a456-426614174000" as ProductId,
 *   name: "Sac banane L'Assumée",
 *   type: ProductType.SAC_BANANE,
 *   coloris: "Rose pâle à motifs",
 *   unitCost: 10.5,
 *   salePrice: 19.99,
 *   stock: 100,
 * };
 * isValidProduct(validProduct); // true
 *
 * const validProductWithWeight: Product = {
 *   ...validProduct,
 *   weight: 150.5, // Valid: positive weight
 * };
 * isValidProduct(validProductWithWeight); // true
 *
 * const validProductWithoutWeight: Product = {
 *   ...validProduct,
 *   // weight is optional, can be omitted
 * };
 * isValidProduct(validProductWithoutWeight); // true
 *
 * const invalidProduct: Product = {
 *   ...validProduct,
 *   unitCost: -10, // Invalid: negative unitCost
 * };
 * isValidProduct(invalidProduct); // false
 *
 * const invalidColoris: Product = {
 *   ...validProduct,
 *   coloris: "   ", // Invalid: whitespace-only coloris
 * };
 * isValidProduct(invalidColoris); // false
 *
 * const invalidWeightZero: Product = {
 *   ...validProduct,
 *   weight: 0, // Invalid: weight must be > 0 if provided
 * };
 * isValidProduct(invalidWeightZero); // false
 *
 * const invalidWeightNegative: Product = {
 *   ...validProduct,
 *   weight: -10, // Invalid: weight must be > 0 if provided
 * };
 * isValidProduct(invalidWeightNegative); // false
 * ```
 */
export const isValidProduct = (product: Product): boolean => {
    const hasValidWeight =
        product.weight === undefined || product.weight === null || product.weight > 0;

    // During migration period, either (modelId, colorisId) or (name, type, coloris) must be present
    // Convert to boolean to ensure we return true/false, not the value itself
    const hasValidModelColoris = !!(
        (product.modelId && product.colorisId) ||
        (product.name && product.type && product.coloris)
    );

    // Validate coloris if present (backward compatibility during migration)
    // Empty string "" should fail validation (falsy), so !product.coloris is true
    // But we need to check trim().length > 0 for whitespace-only strings
    const hasValidColoris =
        product.coloris === undefined ||
        product.coloris === null ||
        product.coloris.trim().length > 0;

    return (
        product.unitCost > 0 &&
        product.salePrice > 0 &&
        product.stock >= 0 &&
        hasValidModelColoris &&
        hasValidColoris &&
        hasValidWeight
    );
};

/**
 * Validates that a quantity sign is appropriate for a given ActivityType.
 *
 * Business rules for quantity signs (when productId is present and quantity is non-zero):
 * - CREATION: quantity should be POSITIVE (stock increases)
 * - SALE: quantity should be NEGATIVE (stock decreases)
 * - STOCK_CORRECTION: quantity can be POSITIVE or NEGATIVE (either direction allowed, but not zero)
 * - OTHER: no sign requirement (quantity can be any value)
 *
 * Zero quantity is allowed for all activity types (represents no stock change).
 * This validation ensures that activities with productId have correct quantity signs
 * before they are converted to stock movements, preventing validation failures
 * in the stock movement domain layer.
 *
 * @param {number} quantity - Quantity value to validate
 * @param {ActivityType} type - Type of the activity
 * @returns {boolean} True if quantity sign is valid for the activity type, false otherwise
 *
 * @example
 * ```typescript
 * isValidQuantityForActivityType(10, ActivityType.CREATION); // true (positive for creation)
 * isValidQuantityForActivityType(-10, ActivityType.CREATION); // false (should be positive)
 * isValidQuantityForActivityType(0, ActivityType.CREATION); // true (zero allowed - no stock change)
 * isValidQuantityForActivityType(-5, ActivityType.SALE); // true (negative for sale)
 * isValidQuantityForActivityType(5, ActivityType.SALE); // false (should be negative)
 * isValidQuantityForActivityType(0, ActivityType.SALE); // true (zero allowed - no stock change)
 * isValidQuantityForActivityType(10, ActivityType.STOCK_CORRECTION); // true (either sign allowed)
 * isValidQuantityForActivityType(-10, ActivityType.STOCK_CORRECTION); // true (either sign allowed)
 * isValidQuantityForActivityType(0, ActivityType.STOCK_CORRECTION); // true (zero allowed - no stock change)
 * isValidQuantityForActivityType(10, ActivityType.OTHER); // true (no sign requirement)
 * ```
 */
export const isValidQuantityForActivityType = (
    quantity: number,
    type: ActivityType
): boolean => {
    // Zero quantity is allowed for all types (represents no stock change)
    if (quantity === 0) {
        return true;
    }

    switch (type) {
        case ActivityType.CREATION:
            // CREATION should have positive quantity (stock increases)
            return quantity > 0;
        case ActivityType.SALE:
            // SALE should have negative quantity (stock decreases)
            return quantity < 0;
        case ActivityType.STOCK_CORRECTION:
            // STOCK_CORRECTION can have either positive or negative quantity
            // (zero is already handled above)
            return true;
        case ActivityType.OTHER:
            // OTHER has no sign requirement (quantity can be any value)
            return true;
        default:
            // Unknown type - reject for safety
            return false;
    }
};

/**
 * Validates an Activity entity against business rules.
 *
 * Business rules:
 * - productId is REQUIRED for SALE and STOCK_CORRECTION types
 * - productId is OPTIONAL for CREATION and OTHER types
 * - When productId is present, quantity sign must match activity type conventions:
 *   - CREATION: quantity must be POSITIVE (stock increases)
 *   - SALE: quantity must be NEGATIVE (stock decreases)
 *   - STOCK_CORRECTION: quantity must be NON-ZERO (can be positive or negative)
 *   - OTHER: no sign requirement
 *
 * This validation ensures that activities with productId have correct quantity signs
 * before they are converted to stock movements, preventing validation failures
 * in the stock movement domain layer.
 *
 * @param {Activity} activity - Activity entity to validate
 * @returns {boolean} True if activity meets all business rules, false otherwise
 *
 * @example
 * ```typescript
 * const validSale: Activity = {
 *   id: "123e4567-e89b-4d3a-a456-426614174000" as ActivityId,
 *   date: "2025-01-27T14:00:00.000Z",
 *   type: ActivityType.SALE,
 *   productId: "550e8400-e29b-41d4-a716-446655440000" as ProductId, // Required for SALE
 *   quantity: -5, // Negative for sale
 *   amount: 99.95,
 * };
 * isValidActivity(validSale); // true
 *
 * const invalidSale: Activity = {
 *   ...validSale,
 *   productId: undefined, // Invalid: productId required for SALE
 * };
 * isValidActivity(invalidSale); // false
 *
 * const invalidSaleQuantity: Activity = {
 *   ...validSale,
 *   quantity: 5, // Invalid: should be negative for SALE
 * };
 * isValidActivity(invalidSaleQuantity); // false
 * ```
 */
export const isValidActivity = (activity: Activity): boolean => {
    const requiresProductId =
        activity.type === ActivityType.SALE ||
        activity.type === ActivityType.STOCK_CORRECTION;

    if (requiresProductId) {
        if (activity.productId === undefined || activity.productId === null) {
            return false;
        }
    }

    // Validate quantity sign when productId is present (activities with productId generate stock movements)
    if (activity.productId !== undefined && activity.productId !== null) {
        // Activities with productId represent actual stock events and must have non-zero quantity
        if (activity.quantity === 0) {
            return false;
        }
        return isValidQuantityForActivityType(activity.quantity, activity.type);
    }

    return true;
};

/**
 * Checks if an Activity has a negative quantity, which is expected for SALE activities.
 *
 * This helper function implements the business rule that SALE activities typically
 * have negative quantities (stock decreases). This is useful for validation and
 * business logic that needs to verify quantity sign conventions.
 *
 * @param {Activity} activity - Activity to check
 * @returns {boolean} True if activity is a SALE type with negative quantity, false otherwise
 *
 * @example
 * ```typescript
 * const saleActivity: Activity = {
 *   id: "123e4567-e89b-4d3a-a456-426614174000" as ActivityId,
 *   date: "2025-01-27T14:00:00.000Z",
 *   type: ActivityType.SALE,
 *   productId: "550e8400-e29b-41d4-a716-446655440000" as ProductId,
 *   quantity: -5, // Negative for sale
 *   amount: 99.95,
 * };
 * isNegativeForSale(saleActivity); // true
 *
 * const creationActivity: Activity = {
 *   ...saleActivity,
 *   type: ActivityType.CREATION,
 *   quantity: 10, // Positive for creation
 * };
 * isNegativeForSale(creationActivity); // false (not a SALE type)
 * ```
 */
export const isNegativeForSale = (activity: Activity): boolean => {
    return activity.type === ActivityType.SALE && activity.quantity < 0;
};

/**
 * Validates a StockMovement entity against business rules.
 *
 * Business rules:
 * - productId is REQUIRED (all stock movements must be associated with a product)
 * - quantity sign should match source conventions (positive for CREATION, negative for SALE)
 *   Note: INVENTORY_ADJUSTMENT can have either sign
 *
 * @param {StockMovement} movement - StockMovement entity to validate
 * @returns {boolean} True if movement meets all business rules, false otherwise
 *
 * @example
 * ```typescript
 * const validCreation: StockMovement = {
 *   id: "123e4567-e89b-4d3a-a456-426614174000" as StockMovementId,
 *   productId: "550e8400-e29b-41d4-a716-446655440000" as ProductId,
 *   quantity: 10, // Positive for CREATION
 *   source: StockMovementSource.CREATION,
 * };
 * isValidStockMovement(validCreation); // true
 *
 * const invalidSale: StockMovement = {
 *   ...validCreation,
 *   quantity: 10, // Invalid: should be negative for SALE
 *   source: StockMovementSource.SALE,
 * };
 * isValidStockMovement(invalidSale); // false
 * ```
 */
export const isValidStockMovement = (movement: StockMovement): boolean => {
    // productId is required (enforced by type, but validate it's not empty)
    if (!movement.productId || movement.productId.trim() === "") {
        return false;
    }

    // Validate quantity sign matches source conventions
    return isValidQuantityForSource(movement.quantity, movement.source);
};

/**
 * Validates that a quantity sign is appropriate for a given StockMovementSource.
 *
 * Business rules for quantity signs:
 * - CREATION: quantity should be POSITIVE (stock increases)
 * - SALE: quantity should be NEGATIVE (stock decreases)
 * - INVENTORY_ADJUSTMENT: quantity can be POSITIVE or NEGATIVE (either direction allowed)
 *
 * @param {number} quantity - Quantity value to validate
 * @param {StockMovementSource} source - Source of the stock movement
 * @returns {boolean} True if quantity sign is valid for the source, false otherwise
 *
 * @example
 * ```typescript
 * isValidQuantityForSource(10, StockMovementSource.CREATION); // true (positive for creation)
 * isValidQuantityForSource(-10, StockMovementSource.CREATION); // false (should be positive)
 * isValidQuantityForSource(-5, StockMovementSource.SALE); // true (negative for sale)
 * isValidQuantityForSource(5, StockMovementSource.SALE); // false (should be negative)
 * isValidQuantityForSource(10, StockMovementSource.INVENTORY_ADJUSTMENT); // true (either sign allowed)
 * isValidQuantityForSource(-10, StockMovementSource.INVENTORY_ADJUSTMENT); // true (either sign allowed)
 * ```
 */
export const isValidQuantityForSource = (
    quantity: number,
    source: StockMovementSource
): boolean => {
    switch (source) {
        case StockMovementSource.CREATION:
            // CREATION should have positive quantity (stock increases)
            return quantity > 0;
        case StockMovementSource.SALE:
            // SALE should have negative quantity (stock decreases)
            return quantity < 0;
        case StockMovementSource.INVENTORY_ADJUSTMENT:
            // INVENTORY_ADJUSTMENT can have either positive or negative quantity
            // (zero is not allowed as it represents no change)
            return quantity !== 0;
        default:
            // Unknown source type - reject for safety
            return false;
    }
};

/**
 * Validates that an ActivityType value is valid.
 *
 * This helper function checks if a value is a valid ActivityType enum value.
 * Useful for validating data from external sources (e.g., API responses, user input).
 *
 * @param {string} value - Value to validate as ActivityType
 * @returns {boolean} True if value is a valid ActivityType, false otherwise
 *
 * @example
 * ```typescript
 * isValidActivityType("SALE"); // true
 * isValidActivityType("CREATION"); // true
 * isValidActivityType("INVALID"); // false
 * isValidActivityType(""); // false
 * ```
 */
export const isValidActivityType = (value: string): boolean => {
    return Object.values(ActivityType).includes(value as ActivityType);
};

/**
 * Validates that a StockMovementSource value is valid.
 *
 * This helper function checks if a value is a valid StockMovementSource enum value.
 * Useful for validating data from external sources (e.g., API responses, user input).
 *
 * @param {string} value - Value to validate as StockMovementSource
 * @returns {boolean} True if value is a valid StockMovementSource, false otherwise
 *
 * @example
 * ```typescript
 * isValidStockMovementSource("CREATION"); // true
 * isValidStockMovementSource("SALE"); // true
 * isValidStockMovementSource("INVALID"); // false
 * isValidStockMovementSource(""); // false
 * ```
 */
export const isValidStockMovementSource = (value: string): boolean => {
    return Object.values(StockMovementSource).includes(
        value as StockMovementSource
    );
};

/**
 * Validates a ProductModel entity against business rules.
 *
 * Business rules:
 * - id must be a non-empty string (UUID format)
 * - type must be a valid ProductType enum value
 * - name must be a non-empty string (after trimming whitespace)
 *
 * @param {ProductModel} productModel - ProductModel entity to validate
 * @returns {boolean} True if productModel meets all business rules, false otherwise
 *
 * @example
 * ```typescript
 * const validModel: ProductModel = {
 *   id: "123e4567-e89b-4d3a-a456-426614174000" as ProductModelId,
 *   type: ProductType.POCHETTE_VOLANTS,
 *   name: "Charlie",
 * };
 * isValidProductModel(validModel); // true
 *
 * const invalidModel: ProductModel = {
 *   ...validModel,
 *   name: "   ", // Invalid: whitespace-only name
 * };
 * isValidProductModel(invalidModel); // false
 *
 * const invalidModelEmptyId: ProductModel = {
 *   ...validModel,
 *   id: "" as ProductModelId, // Invalid: empty id
 * };
 * isValidProductModel(invalidModelEmptyId); // false
 * ```
 */
export const isValidProductModel = (
    productModel: ProductModel
): boolean => {
    return (
        productModel.id.trim().length > 0 &&
        Object.values(ProductType).includes(productModel.type) &&
        productModel.name.trim().length > 0
    );
};

/**
 * Validates a ProductColoris entity against business rules.
 *
 * Business rules:
 * - id must be a non-empty string (UUID format)
 * - modelId must be a non-empty string (UUID format)
 * - coloris must be a non-empty string (after trimming whitespace)
 *
 * @param {ProductColoris} productColoris - ProductColoris entity to validate
 * @returns {boolean} True if productColoris meets all business rules, false otherwise
 *
 * @example
 * ```typescript
 * const validColoris: ProductColoris = {
 *   id: "123e4567-e89b-4d3a-a456-426614174000" as ProductColorisId,
 *   modelId: "550e8400-e29b-41d4-a716-446655440000" as ProductModelId,
 *   coloris: "Rose Marsala",
 * };
 * isValidProductColoris(validColoris); // true
 *
 * const invalidColoris: ProductColoris = {
 *   ...validColoris,
 *   coloris: "   ", // Invalid: whitespace-only coloris
 * };
 * isValidProductColoris(invalidColoris); // false
 *
 * const invalidColorisEmptyId: ProductColoris = {
 *   ...validColoris,
 *   id: "" as ProductColorisId, // Invalid: empty id
 * };
 * isValidProductColoris(invalidColorisEmptyId); // false
 * ```
 */
export const isValidProductColoris = (
    productColoris: ProductColoris
): boolean => {
    return (
        productColoris.id.trim().length > 0 &&
        productColoris.modelId.trim().length > 0 &&
        productColoris.coloris.trim().length > 0
    );
};

/**
 * Validates that a ProductModel belongs to a specific ProductType.
 *
 * This function implements the business rule that each product model
 * must belong to a specific product type. The model's type field must
 * match the expected type.
 *
 * @param {ProductModel} model - ProductModel to validate
 * @param {ProductType} type - ProductType to check against
 * @returns {boolean} True if model belongs to the specified type, false otherwise
 *
 * @example
 * ```typescript
 * const charlieModel: ProductModel = {
 *   id: "123e4567-e89b-4d3a-a456-426614174000" as ProductModelId,
 *   type: ProductType.POCHETTE_VOLANTS,
 *   name: "Charlie",
 * };
 * isValidProductModelForType(charlieModel, ProductType.POCHETTE_VOLANTS); // true
 * isValidProductModelForType(charlieModel, ProductType.SAC_BANANE); // false
 *
 * // Invalid model returns false
 * const invalidModel: ProductModel = {
 *   ...charlieModel,
 *   name: "   ", // Invalid: whitespace-only name
 * };
 * isValidProductModelForType(invalidModel, ProductType.POCHETTE_VOLANTS); // false
 * ```
 */
export const isValidProductModelForType = (
    model: ProductModel,
    type: ProductType
): boolean => {
    if (!isValidProductModel(model)) {
        return false;
    }
    return model.type === type;
};

/**
 * Validates that a ProductColoris belongs to a specific ProductModel.
 *
 * This function implements the business rule that each product coloris
 * must belong to a specific product model. The coloris's modelId field
 * must match the expected modelId.
 *
 * @param {ProductColoris} coloris - ProductColoris to validate
 * @param {ProductModelId} modelId - ProductModelId to check against
 * @returns {boolean} True if coloris belongs to the specified model, false otherwise
 *
 * @example
 * ```typescript
 * const charlieModelId = "550e8400-e29b-41d4-a716-446655440000" as ProductModelId;
 * const roseMarsalaColoris: ProductColoris = {
 *   id: "123e4567-e89b-4d3a-a456-426614174000" as ProductColorisId,
 *   modelId: charlieModelId,
 *   coloris: "Rose Marsala",
 * };
 * isValidProductColorisForModel(roseMarsalaColoris, charlieModelId); // true
 *
 * const otherModelId = "660e8400-e29b-41d4-a716-446655440001" as ProductModelId;
 * isValidProductColorisForModel(roseMarsalaColoris, otherModelId); // false
 *
 * // Invalid coloris returns false
 * const invalidColoris: ProductColoris = {
 *   ...roseMarsalaColoris,
 *   coloris: "   ", // Invalid: whitespace-only coloris
 * };
 * isValidProductColorisForModel(invalidColoris, charlieModelId); // false
 * ```
 */
export const isValidProductColorisForModel = (
    coloris: ProductColoris,
    modelId: ProductModelId
): boolean => {
    if (!isValidProductColoris(coloris)) {
        return false;
    }
    return coloris.modelId === modelId;
};

