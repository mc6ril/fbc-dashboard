/**
 * Validation Schemas
 *
 * Centralized exports for all Zod validation schemas and utilities.
 * These schemas are used for form input validation while keeping the domain layer pure.
 */

export { activityInputSchema, type ActivityInput } from "./activitySchema";
export { productInputSchema, type ProductInput } from "./productSchema";
export {
    mapZodErrorsToFormErrors,
    mapZodIssueToErrorKey,
    getFieldError,
} from "./errorMapper";

