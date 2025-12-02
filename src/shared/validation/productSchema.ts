/**
 * Product Input Schema
 *
 * Zod schema for validating Product form inputs.
 * Validates all product fields including modelId, colorisId, unitCost, salePrice, stock, and optional weight.
 *
 * Business rules:
 * - modelId and colorisId are required (after migration period)
 * - unitCost must be positive (> 0)
 * - salePrice must be positive (> 0)
 * - stock must be non-negative (>= 0)
 * - weight is optional, but if provided must be a positive integer (> 0)
 *
 * This schema is in the shared layer to keep the domain layer pure (no Zod imports).
 */

import { z } from "zod";
import { ProductType } from "@/core/domain/product";
import type { ProductModelId, ProductColorisId } from "@/core/domain/product";

/**
 * Validates that a string represents a valid number (not NaN, not Infinity).
 * First checks if the field is required (non-empty), then validates format.
 */
const validNumberString = z
    .string()
    .min(1, { message: "required" })
    .refine(
        (val) => {
            const num = Number.parseFloat(val);
            return !Number.isNaN(num) && Number.isFinite(num);
        },
        { message: "invalid" }
    )
    .transform((val) => Number.parseFloat(val));

/**
 * Validates that a string represents a positive number (> 0).
 */
const positiveNumberString = validNumberString.refine(
    (val) => val > 0,
    { message: "must_be_positive" }
);

/**
 * Validates that a string represents a non-negative number (>= 0).
 */
const nonNegativeNumberString = validNumberString.refine(
    (val) => val >= 0,
    { message: "must_be_non_negative" }
);

/**
 * Product input schema.
 */
export const productInputSchema = z.object({
    type: z.nativeEnum(ProductType, { message: "required" }),
    modelId: z.string().min(1, { message: "required" }).transform((val) => val as ProductModelId),
    colorisId: z.string().min(1, { message: "required" }).transform((val) => val as ProductColorisId),
    unitCost: positiveNumberString,
    salePrice: positiveNumberString,
    stock: nonNegativeNumberString,
    weight: z
        .string()
        .optional()
        .refine(
            (val) => {
                // Allow empty string or undefined
                if (val === undefined || val === null || val.trim() === "") {
                    return true;
                }
                // Check that the entire string is a valid positive integer
                // Using regex to ensure strict validation (rejects "150abc", "150.5", etc.)
                const trimmed = val.trim();
                // Match: one or more digits, no decimal point, no letters, no special chars
                return /^\d+$/.test(trimmed);
            },
            { message: "invalid" }
        )
        .refine(
            (val) => {
                // Allow empty string or undefined
                if (val === undefined || val === null || val.trim() === "") {
                    return true;
                }
                // Must be positive (already validated as integer by previous refine)
                const intNum = Number.parseInt(val.trim(), 10);
                return intNum > 0;
            },
            { message: "must_be_positive" }
        )
        .transform((val) => {
            // Return undefined if empty, otherwise parse as integer
            if (val === undefined || val === null || val.trim() === "") {
                return undefined;
            }
            return Number.parseInt(val.trim(), 10);
        }),
});

/**
 * Type inference for Product input.
 */
export type ProductInput = z.infer<typeof productInputSchema>;

