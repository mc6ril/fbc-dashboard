/**
 * Activity Input Schema
 *
 * Zod schema for validating Activity form inputs with type-specific validation.
 * Uses discriminated unions to enforce different validation rules based on ActivityType.
 *
 * Type-specific rules:
 * - CREATION: productId required, quantity > 0, amount = 0
 * - SALE: productId required, quantity > 0 (user input), amount > 0
 * - STOCK_CORRECTION: productId required, addToStock/reduceFromStock (at least one), amount = 0
 * - OTHER: productId optional, amount > 0, quantity can be any non-zero number
 *
 * This schema is in the shared layer to keep the domain layer pure (no Zod imports).
 */

import { z } from "zod";
import { ActivityType } from "@/core/domain/activity";
import type { ProductId, ProductModelId, ProductColorisId } from "@/core/domain/product";
import { ProductType } from "@/core/domain/product";

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
 * Validates ISO 8601 date string format.
 */
const isoDateString = z
    .string()
    .min(1, { message: "required" })
    .refine(
        (val) => {
            const date = new Date(val);
            return !Number.isNaN(date.getTime()) && val.includes("T");
        },
        { message: "invalid" }
    );

/**
 * Base schema for product selection fields.
 */
const productSelectionSchema = z.object({
    productId: z.string().min(1, { message: "required" }).transform((val) => val as ProductId),
    selectedProductType: z.nativeEnum(ProductType, { message: "required" }),
    selectedModelId: z.string().min(1, { message: "required" }).transform((val) => val as ProductModelId),
    selectedColorisId: z.string().min(1, { message: "required" }).transform((val) => val as ProductColorisId),
}).refine(
    (data) => {
        // All product fields must be present together
        return (
            data.productId !== undefined &&
            data.selectedProductType !== undefined &&
            data.selectedModelId !== undefined &&
            data.selectedColorisId !== undefined
        );
    },
    {
        message: "required",
        path: ["productId"],
    }
);

/**
 * Optional product selection schema (for OTHER activity type).
 */
const optionalProductSelectionSchema = z
    .object({
        productId: z.string().optional().transform((val) => (val ? (val as ProductId) : undefined)),
        selectedProductType: z.nativeEnum(ProductType).optional(),
        selectedModelId: z.string().optional().transform((val) => (val ? (val as ProductModelId) : undefined)),
        selectedColorisId: z.string().optional().transform((val) => (val ? (val as ProductColorisId) : undefined)),
    })
    .refine(
        (data) => {
            // If any product field is provided, all must be provided
            const hasAny = data.productId || data.selectedProductType || data.selectedModelId || data.selectedColorisId;
            if (hasAny) {
                return (
                    data.productId !== undefined &&
                    data.selectedProductType !== undefined &&
                    data.selectedModelId !== undefined &&
                    data.selectedColorisId !== undefined
                );
            }
            return true;
        },
        {
            message: "required",
            path: ["productId"],
        }
    );

/**
 * Base schema shared by all activity types.
 */
const baseActivitySchema = z.object({
    date: isoDateString,
    type: z.nativeEnum(ActivityType, { message: "required" }),
    note: z.string().optional(),
});

/**
 * CREATION activity schema.
 * Requires: productId, quantity > 0, amount = 0
 */
const creationActivitySchema = baseActivitySchema
    .extend({
        type: z.literal(ActivityType.CREATION),
    })
    .merge(productSelectionSchema)
    .extend({
        quantity: positiveNumberString,
        amount: z.union([z.literal("0"), z.literal(0), z.string()]).refine(
            (val) => val === "0" || val === 0,
            { message: "must_be_zero" }
        ).transform(() => "0"),
    });

/**
 * SALE activity schema.
 * Requires: productId, quantity > 0 (user input), amount > 0
 */
const saleActivitySchema = baseActivitySchema
    .extend({
        type: z.literal(ActivityType.SALE),
    })
    .merge(productSelectionSchema)
    .extend({
        quantity: positiveNumberString,
        amount: positiveNumberString,
    });

/**
 * STOCK_CORRECTION activity schema.
 * Requires: productId, at least one of addToStock/reduceFromStock > 0, amount = 0
 */
const stockCorrectionActivitySchema = baseActivitySchema
    .extend({
        type: z.literal(ActivityType.STOCK_CORRECTION),
    })
    .merge(productSelectionSchema)
    .extend({
        addToStock: z
            .string()
            .optional()
            .refine(
                (val) => {
                    if (val === undefined || val === null || val.trim() === "") {
                        return true; // Optional
                    }
                    const num = Number.parseFloat(val);
                    return !Number.isNaN(num) && Number.isFinite(num) && num > 0;
                },
                { message: "must_be_positive" }
            ),
        reduceFromStock: z
            .string()
            .optional()
            .refine(
                (val) => {
                    if (val === undefined || val === null || val.trim() === "") {
                        return true; // Optional
                    }
                    const num = Number.parseFloat(val);
                    return !Number.isNaN(num) && Number.isFinite(num) && num > 0;
                },
                { message: "must_be_positive" }
            ),
        amount: z.union([z.literal("0"), z.literal(0), z.string()]).refine(
            (val) => val === "0" || val === 0,
            { message: "must_be_zero" }
        ).transform(() => "0"),
    })
    .refine(
        (data) => {
            const hasAdd = data.addToStock && data.addToStock.trim() !== "";
            const hasReduce = data.reduceFromStock && data.reduceFromStock.trim() !== "";
            return hasAdd || hasReduce;
        },
        {
            message: "required",
            path: ["addToStock"],
        }
    )
    .refine(
        (data) => {
            const hasAdd = data.addToStock && data.addToStock.trim() !== "";
            const hasReduce = data.reduceFromStock && data.reduceFromStock.trim() !== "";
            return hasAdd || hasReduce;
        },
        {
            message: "required",
            path: ["reduceFromStock"],
        }
    );

/**
 * OTHER activity schema.
 * Requires: amount > 0, quantity can be any non-zero number, productId optional
 */
const otherActivitySchema = baseActivitySchema
    .extend({
        type: z.literal(ActivityType.OTHER),
    })
    .merge(optionalProductSelectionSchema)
    .extend({
        quantity: validNumberString.refine(
            (val) => val !== 0,
            { message: "invalid" } // Use "invalid" since we don't have a specific "must_be_non_zero" key
        ),
        amount: positiveNumberString,
    });

/**
 * Discriminated union schema for all activity types.
 */
export const activityInputSchema = z.discriminatedUnion("type", [
    creationActivitySchema,
    saleActivitySchema,
    stockCorrectionActivitySchema,
    otherActivitySchema,
]);

/**
 * Type inference for Activity input.
 */
export type ActivityInput = z.infer<typeof activityInputSchema>;

