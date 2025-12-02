/**
 * Validation Utilities for Tests
 *
 * Re-exports domain validation functions for use in tests.
 * This ensures tests use the same validation logic as the application code,
 * maintaining consistency and following DRY principles.
 *
 * All validation functions are defined in `src/core/domain/validation.ts`
 * and re-exported here for convenience in test files.
 * Date utilities are imported from `src/shared/utils/date.ts`.
 */

export {
    isValidEmail,
    isValidPassword,
    isValidUUID,
    isValidProduct,
    isValidActivity,
    isNegativeForSale,
    isValidStockMovement,
    isValidQuantityForSource,
    isValidQuantityForActivityType,
    isValidActivityType,
    isValidStockMovementSource,
    isValidProductModel,
    isValidProductColoris,
    isValidProductModelForType,
    isValidProductColorisForModel,
} from "@/core/domain/validation";

export { isValidISO8601 } from "@/shared/utils/date";

