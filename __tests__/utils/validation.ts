/**
 * Validation Utilities for Tests
 *
 * Re-exports domain validation functions for use in tests.
 * This ensures tests use the same validation logic as the application code,
 * maintaining consistency and following DRY principles.
 *
 * Most validation functions are defined in `src/core/domain/validation.ts`
 * and re-exported here for convenience in test files.
 * Date validation functions are imported from `src/shared/utils/date.ts`.
 */

export {
    isValidEmail,
    isValidPassword,
    isValidUUID,
    isValidProduct,
    isValidActivity,
    isNegativeForSale,
    isValidQuantityForActivityType,
    isValidActivityType,
    isValidProductModel,
    isValidProductColoris,
    isValidProductModelForType,
    isValidProductColorisForModel,
} from "@/core/domain/validation";

// Re-export date validation from shared utils
export { isValidISO8601 } from "@/shared/utils/date";

