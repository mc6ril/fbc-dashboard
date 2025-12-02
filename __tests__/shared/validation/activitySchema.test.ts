/**
 * Activity Schema Validation Tests
 *
 * Tests for Zod schema validation of Activity form inputs.
 * Covers type-specific validation for CREATION, SALE, STOCK_CORRECTION, and OTHER activity types.
 *
 * These tests verify:
 * - Type-specific validation rules for each ActivityType
 * - Required/optional fields based on activity type
 * - Product selection requirements
 * - Quantity validation (including STOCK_CORRECTION addToStock/reduceFromStock)
 * - Amount validation
 * - Date validation
 * - Edge cases and boundary conditions
 *
 * Note: These tests follow TDD approach - test assertions are commented out until schema is implemented.
 * Variables are defined but unused until tests are activated, which triggers unused variable warnings.
 * These warnings are expected and will be resolved when tests are uncommented.
 */

import { ActivityType } from "@/core/domain/activity";
import { type ProductId, type ProductModelId, type ProductColorisId, ProductType } from "@/core/domain/product";
import { activityInputSchema } from "@/shared/validation/activitySchema";
import { z } from "zod";

// Helper functions to create branded IDs from strings (for tests)
const createProductId = (id: string): ProductId => id as ProductId;
const createModelId = (id: string): ProductModelId => id as ProductModelId;
const createColorisId = (id: string): ProductColorisId => id as ProductColorisId;

describe("Activity Schema Validation", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("CREATION Activity Validation", () => {
        const validCreationInput = {
            date: "2025-01-27T14:00:00.000Z",
            type: ActivityType.CREATION,
            productId: createProductId("550e8400-e29b-41d4-a716-446655440000"),
            selectedProductType: "SAC_BANANE",
            selectedModelId: createModelId("model-123"),
            selectedColorisId: createColorisId("coloris-456"),
            quantity: "10",
            amount: "0", // CREATION sends 0 for amount
            note: "New product creation",
        };

        it("should validate CREATION activity with all required fields", () => {
            const result = activityInputSchema.safeParse(validCreationInput);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.type).toBe(ActivityType.CREATION);
                expect(result.data.productId).toBe(validCreationInput.productId);
            }
        });

        it("should require productId for CREATION", () => {
            const inputWithoutProduct = {
                ...validCreationInput,
                productId: undefined,
                selectedProductType: undefined,
                selectedModelId: undefined,
                selectedColorisId: undefined,
            };

            const result = activityInputSchema.safeParse(inputWithoutProduct);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues.some((issue) => issue.path.includes("productId"))).toBe(true);
            }
        });

        it("should require positive quantity for CREATION", () => {
            const inputWithNegativeQuantity = {
                ...validCreationInput,
                quantity: "-5",
            };

            const result = activityInputSchema.safeParse(inputWithNegativeQuantity);
            expect(result.success).toBe(false);
        });

        it("should require quantity > 0 for CREATION", () => {
            const inputWithZeroQuantity = {
                ...validCreationInput,
                quantity: "0",
            };

            const result = activityInputSchema.safeParse(inputWithZeroQuantity);
            expect(result.success).toBe(false);
        });

        it("should allow optional note for CREATION", () => {
            const inputWithoutNote = {
                ...validCreationInput,
                note: undefined,
            };

            const result = activityInputSchema.safeParse(inputWithoutNote);
            expect(result.success).toBe(true);
        });

        it("should validate date format (ISO 8601)", () => {
            const inputWithInvalidDate = {
                ...validCreationInput,
                date: "2025-01-27", // Missing time component
            };

            const result = activityInputSchema.safeParse(inputWithInvalidDate);
            expect(result.success).toBe(false);
        });
    });

    describe("SALE Activity Validation", () => {
        const validSaleInput = {
            date: "2025-01-27T14:00:00.000Z",
            type: ActivityType.SALE,
            productId: createProductId("550e8400-e29b-41d4-a716-446655440000"),
            selectedProductType: "SAC_BANANE",
            selectedModelId: createModelId("model-123"),
            selectedColorisId: createColorisId("coloris-456"),
            quantity: "5", // User enters positive, converted to negative on submit
            amount: "99.95",
            note: "Sale to customer",
        };

        it("should validate SALE activity with all required fields", () => {

            const result = activityInputSchema.safeParse(validSaleInput);
            expect(result.success).toBe(true);
        });

        it("should require productId for SALE", () => {
            const inputWithoutProduct = {
                ...validSaleInput,
                productId: undefined,
                selectedProductType: undefined,
                selectedModelId: undefined,
                selectedColorisId: undefined,
            };

            const result = activityInputSchema.safeParse(inputWithoutProduct);
            expect(result.success).toBe(false);
        });

        it("should require amount > 0 for SALE", () => {
            const inputWithoutAmount = {
                ...validSaleInput,
                amount: undefined,
            };

            const result = activityInputSchema.safeParse(inputWithoutAmount);
            expect(result.success).toBe(false);
        });

        it("should require positive quantity for SALE (user input)", () => {
            const inputWithNegativeQuantity = {
                ...validSaleInput,
                quantity: "-5",
            };

            const result = activityInputSchema.safeParse(inputWithNegativeQuantity);
            expect(result.success).toBe(false);
        });

        it("should reject amount <= 0 for SALE", () => {
            const inputWithZeroAmount = {
                ...validSaleInput,
                amount: "0",
            };

            const result = activityInputSchema.safeParse(inputWithZeroAmount);
            expect(result.success).toBe(false);
        });

        it("should validate amount is a valid number", () => {
            const inputWithInvalidAmount = {
                ...validSaleInput,
                amount: "not-a-number",
            };

            const result = activityInputSchema.safeParse(inputWithInvalidAmount);
            expect(result.success).toBe(false);
        });
    });

    describe("STOCK_CORRECTION Activity Validation", () => {
        const validStockCorrectionInput = {
            date: "2025-01-27T14:00:00.000Z",
            type: ActivityType.STOCK_CORRECTION,
            productId: createProductId("550e8400-e29b-41d4-a716-446655440000"),
            selectedProductType: "SAC_BANANE",
            selectedModelId: createModelId("model-123"),
            selectedColorisId: createColorisId("coloris-456"),
            addToStock: "10",
            reduceFromStock: "",
            amount: "0", // STOCK_CORRECTION sends 0 for amount
        };

        it("should validate STOCK_CORRECTION with addToStock", () => {

            const result = activityInputSchema.safeParse(validStockCorrectionInput);
            expect(result.success).toBe(true);
        });

        it("should validate STOCK_CORRECTION with reduceFromStock", () => {
            const inputWithReduce = {
                ...validStockCorrectionInput,
                addToStock: "",
                reduceFromStock: "5",
            };

            const result = activityInputSchema.safeParse(inputWithReduce);
            expect(result.success).toBe(true);
        });

        it("should validate STOCK_CORRECTION with both addToStock and reduceFromStock", () => {
            const inputWithBoth = {
                ...validStockCorrectionInput,
                addToStock: "10",
                reduceFromStock: "5",
            };

            const result = activityInputSchema.safeParse(inputWithBoth);
            expect(result.success).toBe(true);
        });

        it("should require at least one of addToStock or reduceFromStock", () => {
            const inputWithNeither = {
                ...validStockCorrectionInput,
                addToStock: "",
                reduceFromStock: "",
            };

            const result = activityInputSchema.safeParse(inputWithNeither);
            expect(result.success).toBe(false);
        });

        it("should require productId for STOCK_CORRECTION", () => {
            const inputWithoutProduct = {
                ...validStockCorrectionInput,
                productId: undefined,
                selectedProductType: undefined,
                selectedModelId: undefined,
                selectedColorisId: undefined,
            };

            const result = activityInputSchema.safeParse(inputWithoutProduct);
            expect(result.success).toBe(false);
        });

        it("should require addToStock > 0 if provided", () => {
            const inputWithInvalidAdd = {
                ...validStockCorrectionInput,
                addToStock: "-5",
            };

            const result = activityInputSchema.safeParse(inputWithInvalidAdd);
            expect(result.success).toBe(false);
        });

        it("should require reduceFromStock > 0 if provided", () => {
            const inputWithInvalidReduce = {
                ...validStockCorrectionInput,
                reduceFromStock: "-5",
            };

            const result = activityInputSchema.safeParse(inputWithInvalidReduce);
            expect(result.success).toBe(false);
        });

        it("should reject invalid numeric format for addToStock", () => {
            const inputWithInvalidFormat = {
                ...validStockCorrectionInput,
                addToStock: "not-a-number",
            };

            const result = activityInputSchema.safeParse(inputWithInvalidFormat);
            expect(result.success).toBe(false);
        });
    });

    describe("OTHER Activity Validation", () => {
        const validOtherInput = {
            date: "2025-01-27T14:00:00.000Z",
            type: ActivityType.OTHER,
            productId: undefined, // Optional for OTHER
            selectedProductType: undefined,
            selectedModelId: undefined,
            selectedColorisId: undefined,
            quantity: "-5", // OTHER allows negative
            amount: "50.00",
            note: "Other activity",
        };

        it("should validate OTHER activity without productId", () => {

            const result = activityInputSchema.safeParse(validOtherInput);
            expect(result.success).toBe(true);
        });

        it("should validate OTHER activity with productId", () => {
            const inputWithProduct = {
                ...validOtherInput,
                productId: createProductId("550e8400-e29b-41d4-a716-446655440000"),
                selectedProductType: "SAC_BANANE",
                selectedModelId: createModelId("model-123"),
                selectedColorisId: createColorisId("coloris-456"),
            };

            const result = activityInputSchema.safeParse(inputWithProduct);
            expect(result.success).toBe(true);
        });

        it("should require amount > 0 for OTHER", () => {
            const inputWithoutAmount = {
                ...validOtherInput,
                amount: undefined,
            };

            const result = activityInputSchema.safeParse(inputWithoutAmount);
            expect(result.success).toBe(false);
        });

        it("should allow negative quantity for OTHER", () => {

            const result = activityInputSchema.safeParse(validOtherInput);
            expect(result.success).toBe(true);
        });

        it("should allow positive quantity for OTHER", () => {
            const inputWithPositiveQuantity = {
                ...validOtherInput,
                quantity: "10",
            };

            const result = activityInputSchema.safeParse(inputWithPositiveQuantity);
            expect(result.success).toBe(true);
        });
    });

    describe("Common Validation Rules", () => {
        const baseInput = {
            date: "2025-01-27T14:00:00.000Z",
            type: ActivityType.CREATION,
            productId: createProductId("550e8400-e29b-41d4-a716-446655440000"),
            selectedProductType: "SAC_BANANE",
            selectedModelId: createModelId("model-123"),
            selectedColorisId: createColorisId("coloris-456"),
            quantity: "10",
            amount: "0",
        };

        it("should require date field", () => {
            const inputWithoutDate = {
                ...baseInput,
                date: undefined,
            };

            const result = activityInputSchema.safeParse(inputWithoutDate);
            expect(result.success).toBe(false);
        });

        it("should require type field", () => {
            const inputWithoutType = {
                ...baseInput,
                type: undefined,
            };

            const result = activityInputSchema.safeParse(inputWithoutType);
            expect(result.success).toBe(false);
        });

        it("should reject invalid ActivityType", () => {
            const inputWithInvalidType = {
                ...baseInput,
                type: "INVALID_TYPE",
            };

            const result = activityInputSchema.safeParse(inputWithInvalidType);
            expect(result.success).toBe(false);
        });

        it("should validate quantity is a valid number", () => {
            const inputWithInvalidQuantity = {
                ...baseInput,
                quantity: "not-a-number",
            };

            const result = activityInputSchema.safeParse(inputWithInvalidQuantity);
            expect(result.success).toBe(false);
        });

        it("should reject Infinity for quantity", () => {
            const inputWithInfinity = {
                ...baseInput,
                quantity: "Infinity",
            };

            const result = activityInputSchema.safeParse(inputWithInfinity);
            expect(result.success).toBe(false);
        });

        it("should reject NaN for quantity", () => {
            const inputWithNaN = {
                ...baseInput,
                quantity: "NaN",
            };

            const result = activityInputSchema.safeParse(inputWithNaN);
            expect(result.success).toBe(false);
        });
    });

    describe("Product Selection Validation", () => {
        const baseInput = {
            date: "2025-01-27T14:00:00.000Z",
            type: ActivityType.SALE,
            quantity: "5",
            amount: "99.95",
        };

        it("should require selectedProductType when productId is required", () => {
            const inputWithoutProductType = {
                ...baseInput,
                productId: createProductId("550e8400-e29b-41d4-a716-446655440000"),
                selectedProductType: undefined,
                selectedModelId: createModelId("model-123"),
                selectedColorisId: createColorisId("coloris-456"),
            };

            const result = activityInputSchema.safeParse(inputWithoutProductType);
            expect(result.success).toBe(false);
        });

        it("should require selectedModelId when productId is required", () => {
            const inputWithoutModelId = {
                ...baseInput,
                productId: createProductId("550e8400-e29b-41d4-a716-446655440000"),
                selectedProductType: "SAC_BANANE",
                selectedModelId: undefined,
                selectedColorisId: createColorisId("coloris-456"),
            };

            const result = activityInputSchema.safeParse(inputWithoutModelId);
            expect(result.success).toBe(false);
        });

        it("should require selectedColorisId when productId is required", () => {
            const inputWithoutColorisId = {
                ...baseInput,
                productId: createProductId("550e8400-e29b-41d4-a716-446655440000"),
                selectedProductType: "SAC_BANANE",
                selectedModelId: createModelId("model-123"),
                selectedColorisId: undefined,
            };

            const result = activityInputSchema.safeParse(inputWithoutColorisId);
            expect(result.success).toBe(false);
        });

        it("should require productId when product selection is required", () => {
            const inputWithoutProductId = {
                ...baseInput,
                productId: undefined,
                selectedProductType: "SAC_BANANE",
                selectedModelId: createModelId("model-123"),
                selectedColorisId: createColorisId("coloris-456"),
            };

            const result = activityInputSchema.safeParse(inputWithoutProductId);
            expect(result.success).toBe(false);
        });
    });

    describe("Type Inference", () => {
        it("should infer correct TypeScript type from schema", () => {
            type ActivityInput = z.infer<typeof activityInputSchema>;
            const testInput: ActivityInput = {
                date: "2025-01-27T14:00:00.000Z",
                type: ActivityType.CREATION,
                productId: createProductId("550e8400-e29b-41d4-a716-446655440000"),
                selectedProductType: ProductType.SAC_BANANE,
                selectedModelId: createModelId("model-123"),
                selectedColorisId: createColorisId("coloris-456"),
                quantity: 10,
                amount: "0",
            };
            expect(testInput).toBeDefined();
        });
    });
});

