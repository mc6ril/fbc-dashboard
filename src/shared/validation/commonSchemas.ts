/**
 * Common Zod Schemas
 *
 * Reusable Zod schemas for validating common data types across the application.
 * These schemas are used in form validation schemas (activitySchema, productSchema, etc.).
 *
 * All schemas validate string inputs from forms and transform them to appropriate types.
 */

import { z } from "zod";
import {
    isValidNumberString,
    isValidPositiveNumberString,
} from "@/shared/utils/number";

/**
 * Validates that a string represents a valid number (not NaN, not Infinity).
 *
 * Used for fields that can be any valid number (positive, negative, or zero).
 *
 * @example
 * ```typescript
 * quantity: validNumberString
 * ```
 */
export const validNumberString = z
    .string()
    .min(1, { message: "required" })
    .refine(
        (val) => isValidNumberString(val.trim()),
        { message: "invalid" }
    )
    .transform((val) => Number.parseFloat(val.trim()));

/**
 * Validates that a string represents a positive number (> 0).
 *
 * Used for fields that must be strictly positive (e.g., quantity, amount, unitCost, salePrice).
 *
 * @example
 * ```typescript
 * quantity: positiveNumberString
 * amount: positiveNumberString
 * ```
 */
export const positiveNumberString = z
    .string()
    .min(1, { message: "required" })
    .refine(
        (val) => isValidPositiveNumberString(val.trim()),
        { message: "must_be_positive" }
    )
    .transform((val) => Number.parseFloat(val.trim()));

/**
 * Validates that a string represents a non-negative number (>= 0).
 *
 * Used for fields that can be zero or positive (e.g., stock).
 *
 * @example
 * ```typescript
 * stock: nonNegativeNumberString
 * ```
 */
export const nonNegativeNumberString = z
    .string()
    .min(1, { message: "required" })
    .refine(
        (val) => {
            const trimmed = val.trim();
            if (trimmed === "") {
                return false;
            }
            const num = Number.parseFloat(trimmed);
            return !Number.isNaN(num) && Number.isFinite(num) && num >= 0;
        },
        { message: "must_be_non_negative" }
    )
    .transform((val) => Number.parseFloat(val.trim()));

/**
 * Validates that a string represents a valid ISO 8601 date.
 *
 * Used for date fields in forms. Validates ISO 8601 format and ensures the date is valid.
 *
 * @example
 * ```typescript
 * date: isoDateString
 * ```
 */
export const isoDateString = z
    .string()
    .min(1, { message: "required" })
    .refine(
        (val) => {
            const trimmed = val.trim();
            if (trimmed === "") {
                return false;
            }
            // Try to parse as ISO 8601 date
            const date = new Date(trimmed);
            // Check if date is valid and matches ISO 8601 format
            return !Number.isNaN(date.getTime()) && trimmed.includes("T");
        },
        { message: "invalid" }
    )
    .transform((val) => val.trim());

