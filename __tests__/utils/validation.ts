/**
 * Validation Utilities for Tests
 *
 * Re-exports domain validation functions for use in tests.
 * This ensures tests use the same validation logic as the application code,
 * maintaining consistency and following DRY principles.
 *
 * All validation functions are defined in `src/core/domain/validation.ts`
 * and re-exported here for convenience in test files.
 */

export {
    isValidEmail,
    isValidPassword,
    isValidUUID,
    isValidISO8601,
} from "@/core/domain/validation";

