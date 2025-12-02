/**
 * Common Zod Schemas
 *
 * Shared Zod schema definitions used across multiple validation schemas.
 * Centralizes common patterns to avoid duplication.
 */

import { z } from "zod";
import {
    isValidNumberString,
    isValidOptionalPositiveNumberString,
} from "@/shared/utils/number";

/**
 * Validates that a string represents a valid number (not NaN, not Infinity).
 * First checks if the field is required (non-empty), then validates format.
 */
export const validNumberString = z
    .string()
    .min(1, { message: "required" })
    .refine(
        (val) => isValidNumberString(val),
        { message: "invalid" }
    )
    .transform((val) => Number.parseFloat(val));

/**
 * Validates that a string represents a positive number (> 0).
 */
export const positiveNumberString = validNumberString.refine(
    (val) => val > 0,
    { message: "must_be_positive" }
);

/**
 * Validates that a string represents a non-negative number (>= 0).
 */
export const nonNegativeNumberString = validNumberString.refine(
    (val) => val >= 0,
    { message: "must_be_non_negative" }
);

/**
 * Validates that an optional string represents a valid positive number (> 0) when provided.
 * Returns true if the value is empty/undefined (optional field) or a valid positive number.
 */
export const optionalPositiveNumberString = z
    .string()
    .optional()
    .refine(
        (val) => isValidOptionalPositiveNumberString(val),
        { message: "must_be_positive" }
    );

/**
 * Validates ISO 8601 date string format.
 */
export const isoDateString = z
    .string()
    .min(1, { message: "required" })
    .refine(
        (val) => {
            const date = new Date(val);
            return !Number.isNaN(date.getTime()) && val.includes("T");
        },
        { message: "invalid" }
    );

