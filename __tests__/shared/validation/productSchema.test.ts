/**
 * Product Schema Validation Tests
 *
 * Tests for Zod schema validation of Product form inputs.
 * Covers all product fields including modelId, colorisId, unitCost, salePrice, stock, and optional weight.
 *
 * These tests verify:
 * - Required fields validation (modelId, colorisId, unitCost, salePrice, stock)
 * - Optional weight field validation (integer, > 0)
 * - Numeric field validation (positive, non-negative, valid numbers)
 * - Edge cases and boundary conditions
 * - Type inference
 *
 * Note: These tests follow TDD approach - test assertions are commented out until schema is implemented.
 * Variables are defined but unused until tests are activated, which triggers unused variable warnings.
 * These warnings are expected and will be resolved when tests are uncommented.
 */

import type { ProductModelId, ProductColorisId } from "@/core/domain/product";
import { ProductType } from "@/core/domain/product";
import { productInputSchema } from "@/shared/validation/productSchema";
import { z } from "zod";

// Helper functions to create branded IDs from strings (for tests)
const createModelId = (id: string): ProductModelId => id as ProductModelId;
const createColorisId = (id: string): ProductColorisId => id as ProductColorisId;

describe("Product Schema Validation", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("Required Fields Validation", () => {
        const validProductInput = {
            type: ProductType.SAC_BANANE,
            modelId: createModelId("550e8400-e29b-41d4-a716-446655440000"),
            colorisId: createColorisId("660e8400-e29b-41d4-a716-446655440001"),
            unitCost: "10.50",
            salePrice: "19.99",
            stock: "100",
        };

        it("should validate product with all required fields", () => {
            const result = productInputSchema.safeParse(validProductInput);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.modelId).toBe(validProductInput.modelId);
                expect(result.data.colorisId).toBe(validProductInput.colorisId);
            }
        });

        it("should require type field", () => {
            const inputWithoutType = {
                ...validProductInput,
                type: undefined,
            };

            const result = productInputSchema.safeParse(inputWithoutType);
            expect(result.success).toBe(false);
        });

        it("should require modelId field", () => {
            const inputWithoutModelId = {
                ...validProductInput,
                modelId: undefined,
            };

            const result = productInputSchema.safeParse(inputWithoutModelId);
            expect(result.success).toBe(false);
        });

        it("should require colorisId field", () => {
            const inputWithoutColorisId = {
                ...validProductInput,
                colorisId: undefined,
            };

            const result = productInputSchema.safeParse(inputWithoutColorisId);
            expect(result.success).toBe(false);
        });

        it("should require unitCost field", () => {
            const inputWithoutUnitCost = {
                ...validProductInput,
                unitCost: undefined,
            };

            const result = productInputSchema.safeParse(inputWithoutUnitCost);
            expect(result.success).toBe(false);
        });

        it("should require salePrice field", () => {
            const inputWithoutSalePrice = {
                ...validProductInput,
                salePrice: undefined,
            };

            const result = productInputSchema.safeParse(inputWithoutSalePrice);
            expect(result.success).toBe(false);
        });

        it("should require stock field", () => {
            const inputWithoutStock = {
                ...validProductInput,
                stock: undefined,
            };

            const result = productInputSchema.safeParse(inputWithoutStock);
            expect(result.success).toBe(false);
        });
    });

    describe("Numeric Field Validation - unitCost", () => {
        const baseInput = {
            type: ProductType.SAC_BANANE,
            modelId: createModelId("550e8400-e29b-41d4-a716-446655440000"),
            colorisId: createColorisId("660e8400-e29b-41d4-a716-446655440001"),
            salePrice: "19.99",
            stock: "100",
        };

        it("should require unitCost > 0", () => {
            const inputWithZeroUnitCost = {
                ...baseInput,
                unitCost: "0",
            };

            const result = productInputSchema.safeParse(inputWithZeroUnitCost);
            expect(result.success).toBe(false);
        });

        it("should reject negative unitCost", () => {
            const inputWithNegativeUnitCost = {
                ...baseInput,
                unitCost: "-10.50",
            };

            const result = productInputSchema.safeParse(inputWithNegativeUnitCost);
            expect(result.success).toBe(false);
        });

        it("should validate unitCost is a valid number", () => {
            const inputWithInvalidUnitCost = {
                ...baseInput,
                unitCost: "not-a-number",
            };

            const result = productInputSchema.safeParse(inputWithInvalidUnitCost);
            expect(result.success).toBe(false);
        });

        it("should reject Infinity for unitCost", () => {
            const inputWithInfinity = {
                ...baseInput,
                unitCost: "Infinity",
            };

            const result = productInputSchema.safeParse(inputWithInfinity);
            expect(result.success).toBe(false);
        });

        it("should reject NaN for unitCost", () => {
            const inputWithNaN = {
                ...baseInput,
                unitCost: "NaN",
            };

            const result = productInputSchema.safeParse(inputWithNaN);
            expect(result.success).toBe(false);
        });

        it("should accept valid positive unitCost", () => {
            const validInput = {
                ...baseInput,
                unitCost: "10.50",
            };

            const result = productInputSchema.safeParse(validInput);
            expect(result.success).toBe(true);
        });

        it("should accept unitCost with decimal places", () => {
            const inputWithDecimals = {
                ...baseInput,
                unitCost: "10.999",
            };

            const result = productInputSchema.safeParse(inputWithDecimals);
            expect(result.success).toBe(true);
        });
    });

    describe("Numeric Field Validation - salePrice", () => {
        const baseInput = {
            type: ProductType.SAC_BANANE,
            modelId: createModelId("550e8400-e29b-41d4-a716-446655440000"),
            colorisId: createColorisId("660e8400-e29b-41d4-a716-446655440001"),
            unitCost: "10.50",
            stock: "100",
        };

        it("should require salePrice > 0", () => {
            const inputWithZeroSalePrice = {
                ...baseInput,
                salePrice: "0",
            };

            const result = productInputSchema.safeParse(inputWithZeroSalePrice);
            expect(result.success).toBe(false);
        });

        it("should reject negative salePrice", () => {
            const inputWithNegativeSalePrice = {
                ...baseInput,
                salePrice: "-19.99",
            };

            const result = productInputSchema.safeParse(inputWithNegativeSalePrice);
            expect(result.success).toBe(false);
        });

        it("should validate salePrice is a valid number", () => {
            const inputWithInvalidSalePrice = {
                ...baseInput,
                salePrice: "not-a-number",
            };

            const result = productInputSchema.safeParse(inputWithInvalidSalePrice);
            expect(result.success).toBe(false);
        });

        it("should accept valid positive salePrice", () => {
            const validInput = {
                ...baseInput,
                salePrice: "19.99",
            };

            const result = productInputSchema.safeParse(validInput);
            expect(result.success).toBe(true);
        });
    });

    describe("Numeric Field Validation - stock", () => {
        const baseInput = {
            type: ProductType.SAC_BANANE,
            modelId: createModelId("550e8400-e29b-41d4-a716-446655440000"),
            colorisId: createColorisId("660e8400-e29b-41d4-a716-446655440001"),
            unitCost: "10.50",
            salePrice: "19.99",
        };

        it("should require stock >= 0", () => {
            const inputWithZeroStock = {
                ...baseInput,
                stock: "0",
            };

            const result = productInputSchema.safeParse(inputWithZeroStock);
            expect(result.success).toBe(true);
        });

        it("should reject negative stock", () => {
            const inputWithNegativeStock = {
                ...baseInput,
                stock: "-10",
            };

            const result = productInputSchema.safeParse(inputWithNegativeStock);
            expect(result.success).toBe(false);
        });

        it("should validate stock is a valid number", () => {
            const inputWithInvalidStock = {
                ...baseInput,
                stock: "not-a-number",
            };

            const result = productInputSchema.safeParse(inputWithInvalidStock);
            expect(result.success).toBe(false);
        });

        it("should accept valid non-negative stock", () => {
            const validInput = {
                ...baseInput,
                stock: "100",
            };

            const result = productInputSchema.safeParse(validInput);
            expect(result.success).toBe(true);
        });

        it("should accept stock with decimal places", () => {
            const inputWithDecimals = {
                ...baseInput,
                stock: "100.5",
            };

            const result = productInputSchema.safeParse(inputWithDecimals);
            expect(result.success).toBe(true);
        });
    });

    describe("Optional Weight Field Validation", () => {
        const baseInput = {
            type: ProductType.SAC_BANANE,
            modelId: createModelId("550e8400-e29b-41d4-a716-446655440000"),
            colorisId: createColorisId("660e8400-e29b-41d4-a716-446655440001"),
            unitCost: "10.50",
            salePrice: "19.99",
            stock: "100",
        };

        it("should allow product without weight", () => {

            const result = productInputSchema.safeParse(baseInput);
            expect(result.success).toBe(true);
        });

        it("should allow empty string for weight", () => {
            const inputWithEmptyWeight = {
                ...baseInput,
                weight: "",
            };

            const result = productInputSchema.safeParse(inputWithEmptyWeight);
            expect(result.success).toBe(true);
        });

        it("should require weight > 0 if provided", () => {
            const inputWithZeroWeight = {
                ...baseInput,
                weight: "0",
            };

            const result = productInputSchema.safeParse(inputWithZeroWeight);
            expect(result.success).toBe(false);
        });

        it("should reject negative weight", () => {
            const inputWithNegativeWeight = {
                ...baseInput,
                weight: "-10",
            };

            const result = productInputSchema.safeParse(inputWithNegativeWeight);
            expect(result.success).toBe(false);
        });

        it("should require weight to be an integer", () => {
            const inputWithDecimalWeight = {
                ...baseInput,
                weight: "150.5",
            };

            const result = productInputSchema.safeParse(inputWithDecimalWeight);
            expect(result.success).toBe(false);
        });

        it("should validate weight is a valid number", () => {
            const inputWithInvalidWeight = {
                ...baseInput,
                weight: "not-a-number",
            };

            const result = productInputSchema.safeParse(inputWithInvalidWeight);
            expect(result.success).toBe(false);
        });

        it("should reject weight with trailing non-numeric characters (e.g., '150abc')", () => {
            const inputWithInvalidWeight = {
                ...baseInput,
                weight: "150abc",
            };

            const result = productInputSchema.safeParse(inputWithInvalidWeight);
            expect(result.success).toBe(false);
            if (!result.success) {
                const weightError = result.error.issues.find((issue) => issue.path.includes("weight"));
                expect(weightError).toBeDefined();
                expect(weightError?.message).toBe("invalid");
            }
        });

        it("should reject weight with leading non-numeric characters (e.g., 'abc150')", () => {
            const inputWithInvalidWeight = {
                ...baseInput,
                weight: "abc150",
            };

            const result = productInputSchema.safeParse(inputWithInvalidWeight);
            expect(result.success).toBe(false);
            if (!result.success) {
                const weightError = result.error.issues.find((issue) => issue.path.includes("weight"));
                expect(weightError).toBeDefined();
                expect(weightError?.message).toBe("invalid");
            }
        });

        it("should accept valid positive integer weight", () => {
            const inputWithValidWeight = {
                ...baseInput,
                weight: "150",
            };

            const result = productInputSchema.safeParse(inputWithValidWeight);
            expect(result.success).toBe(true);
        });

        it("should accept weight with realistic values (e.g., 150-400 grams)", () => {
            const inputWithRealisticWeight = {
                ...baseInput,
                weight: "200",
            };

            const result = productInputSchema.safeParse(inputWithRealisticWeight);
            expect(result.success).toBe(true);
        });
    });

    describe("ProductType Validation", () => {
        const baseInput = {
            modelId: createModelId("550e8400-e29b-41d4-a716-446655440000"),
            colorisId: createColorisId("660e8400-e29b-41d4-a716-446655440001"),
            unitCost: "10.50",
            salePrice: "19.99",
            stock: "100",
        };

        it("should accept valid ProductType enum values", () => {
            const validTypes = [
                ProductType.SAC_BANANE,
                ProductType.POCHETTE_ORDINATEUR,
                ProductType.TROUSSE_TOILETTE,
                ProductType.POCHETTE_VOLANTS,
                ProductType.TROUSSE_ZIPPEE,
                ProductType.ACCESSOIRES_DIVERS,
            ];

            validTypes.forEach((type) => {
                const input = {
                    ...baseInput,
                    type,
                };
                const result = productInputSchema.safeParse(input);
                expect(result.success).toBe(true);
            });
        });

        it("should reject invalid ProductType", () => {
            const inputWithInvalidType = {
                ...baseInput,
                type: "INVALID_TYPE",
            };

            const result = productInputSchema.safeParse(inputWithInvalidType);
            expect(result.success).toBe(false);
        });
    });

    describe("Edge Cases and Boundary Conditions", () => {
        const baseInput = {
            type: ProductType.SAC_BANANE,
            modelId: createModelId("550e8400-e29b-41d4-a716-446655440000"),
            colorisId: createColorisId("660e8400-e29b-41d4-a716-446655440001"),
            unitCost: "10.50",
            salePrice: "19.99",
            stock: "100",
        };

        it("should handle very small positive values", () => {
            const inputWithSmallValues = {
                ...baseInput,
                unitCost: "0.01",
                salePrice: "0.01",
                stock: "0",
            };

            const result = productInputSchema.safeParse(inputWithSmallValues);
            expect(result.success).toBe(true);
        });

        it("should handle very large values", () => {
            const inputWithLargeValues = {
                ...baseInput,
                unitCost: "999999.99",
                salePrice: "999999.99",
                stock: "999999",
            };

            const result = productInputSchema.safeParse(inputWithLargeValues);
            expect(result.success).toBe(true);
        });

        it("should handle whitespace in numeric strings", () => {
            const inputWithWhitespace = {
                ...baseInput,
                unitCost: "  10.50  ",
                salePrice: "  19.99  ",
                stock: "  100  ",
            };

            // Schema accepts whitespace (parseFloat handles it)
            const result = productInputSchema.safeParse(inputWithWhitespace);
            expect(result.success).toBe(true);
        });
    });

    describe("Type Inference", () => {
        it("should infer correct TypeScript type from schema", () => {
            type ProductInput = z.infer<typeof productInputSchema>;
            const testInput: ProductInput = {
                type: ProductType.SAC_BANANE,
                modelId: createModelId("550e8400-e29b-41d4-a716-446655440000"),
                colorisId: createColorisId("660e8400-e29b-41d4-a716-446655440001"),
                unitCost: 10.5,
                salePrice: 19.99,
                stock: 100,
                weight: undefined,
            };
            expect(testInput).toBeDefined();
        });

        it("should infer optional weight field in type", () => {
            type ProductInput = z.infer<typeof productInputSchema>;
            const testInputWithoutWeight: ProductInput = {
                type: ProductType.SAC_BANANE,
                modelId: createModelId("550e8400-e29b-41d4-a716-446655440000"),
                colorisId: createColorisId("660e8400-e29b-41d4-a716-446655440001"),
                unitCost: 10.5,
                salePrice: 19.99,
                stock: 100,
                weight: undefined,
            };
            expect(testInputWithoutWeight.weight).toBeUndefined();
        });
    });
});

