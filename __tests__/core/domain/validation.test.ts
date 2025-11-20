/**
 * Domain Validation Tests - Product, Activity, StockMovement
 *
 * Tests for domain validation functions to ensure business rules
 * and invariants are correctly enforced.
 *
 * These tests verify:
 * - Product validation (positive prices, non-negative stock)
 * - Activity validation (productId requirements, quantity rules)
 * - StockMovement validation (quantity sign based on source)
 * - Edge cases and invalid data handling
 */

import type {
    Product,
    ProductId,
    ProductModel,
    ProductModelId,
    ProductColoris,
    ProductColorisId,
} from "@/core/domain/product";
import { ProductType } from "@/core/domain/product";
import type { Activity, ActivityId } from "@/core/domain/activity";
import { ActivityType } from "@/core/domain/activity";
import type { StockMovement, StockMovementId } from "@/core/domain/stockMovement";
import { StockMovementSource } from "@/core/domain/stockMovement";

// Helper functions to create branded IDs from strings (for tests)
const createProductId = (id: string): ProductId => id as ProductId;
const createProductModelId = (id: string): ProductModelId => id as ProductModelId;
const createProductColorisId = (id: string): ProductColorisId => id as ProductColorisId;
const createActivityId = (id: string): ActivityId => id as ActivityId;
const createStockMovementId = (id: string): StockMovementId => id as StockMovementId;

import {
    isValidProduct,
    isValidActivity,
    isNegativeForSale,
    isValidStockMovement,
    isValidQuantityForSource,
    isValidActivityType,
    isValidStockMovementSource,
    isValidProductModel,
    isValidProductColoris,
    isValidProductModelForType,
    isValidProductColorisForModel,
} from "../../utils/validation";

describe("Domain Validation - Product", () => {
    const validProduct: Product = {
        id: createProductId("123e4567-e89b-4d3a-a456-426614174000"),
        name: "Trousse de toilette carrée",
        type: ProductType.TROUSSE_TOILETTE,
        coloris: "Rose pâle à motifs",
        unitCost: 10.5,
        salePrice: 19.99,
        stock: 100,
    };

    describe("isValidProduct", () => {
        it("should validate product with all valid fields", () => {
            expect(isValidProduct(validProduct)).toBe(true);
        });

        it("should reject product with negative unitCost", () => {
            const product: Product = { ...validProduct, unitCost: -10 };
            expect(isValidProduct(product)).toBe(false);
        });

        it("should reject product with zero unitCost", () => {
            const product: Product = { ...validProduct, unitCost: 0 };
            expect(isValidProduct(product)).toBe(false);
        });

        it("should reject product with negative salePrice", () => {
            const product: Product = { ...validProduct, salePrice: -19.99 };
            expect(isValidProduct(product)).toBe(false);
        });

        it("should reject product with zero salePrice", () => {
            const product: Product = { ...validProduct, salePrice: 0 };
            expect(isValidProduct(product)).toBe(false);
        });

        it("should reject product with negative stock", () => {
            const product: Product = { ...validProduct, stock: -10 };
            expect(isValidProduct(product)).toBe(false);
        });

        it("should accept product with zero stock", () => {
            const product: Product = { ...validProduct, stock: 0 };
            expect(isValidProduct(product)).toBe(true);
        });

        it("should accept product with very small positive prices", () => {
            const product: Product = {
                ...validProduct,
                unitCost: 0.01,
                salePrice: 0.01,
            };
            expect(isValidProduct(product)).toBe(true);
        });
    });

    describe("isValidProduct - coloris validation", () => {
        it("should validate product with valid coloris", () => {
            const product: Product = {
                ...validProduct,
                coloris: "Rose pâle à motifs",
            };
            expect(isValidProduct(product)).toBe(true);
        });

        it("should reject product with empty coloris when using old structure", () => {
            // During migration period, empty coloris should fail validation
            // because hasValidModelColoris requires (name, type, coloris) to be present
            // Empty string "" is falsy, so product.coloris in the condition is falsy
            // This means hasValidModelColoris will be false (old structure requires all three)
            // Also, hasValidColoris now checks product.coloris === undefined || product.coloris === null || product.coloris.trim().length > 0
            // For empty string "", none of these are true, so hasValidColoris is false
            const product: Product = {
                id: createProductId("123e4567-e89b-4d3a-a456-426614174000"),
                name: "Trousse de toilette carrée",
                type: ProductType.TROUSSE_TOILETTE,
                coloris: "", // Empty string - should fail validation
                unitCost: 10.5,
                salePrice: 19.99,
                stock: 100,
                // Explicitly no modelId/colorisId (old structure)
            };
            // Empty coloris "" causes:
            // - hasValidModelColoris: (product.modelId && product.colorisId) || (product.name && product.type && product.coloris)
            //   = false || (true && true && false) = false
            // - hasValidColoris: product.coloris === undefined || product.coloris === null || product.coloris.trim().length > 0
            //   = false || false || false = false
            // - Overall: hasValidModelColoris && hasValidColoris = false && false = false
            expect(isValidProduct(product)).toBe(false);
        });

        it("should reject product with whitespace-only coloris when using old structure", () => {
            // During migration period, if using old structure (name, type, coloris),
            // whitespace-only coloris should be rejected
            // Note: The validation function checks !product.coloris || product.coloris.trim().length > 0
            // For whitespace-only "   ", !product.coloris is false (empty string is falsy but "" is not undefined),
            // and trim().length > 0 is false, so hasValidColoris is false
            const product: Product = { 
                ...validProduct, 
                coloris: "   ",
                // Ensure we're using old structure (no modelId/colorisId)
                modelId: undefined,
                colorisId: undefined,
            };
            // hasValidColoris will be false because "   ".trim().length === 0
            expect(isValidProduct(product)).toBe(false);
        });

        it("should accept product with trimmed coloris (whitespace at edges)", () => {
            const product: Product = {
                ...validProduct,
                coloris: "  Rose pâle à motifs  ",
            };
            // Validation trims whitespace, so this should be valid
            expect(isValidProduct(product)).toBe(true);
        });
    });
});

describe("Domain Validation - Activity", () => {
    const validActivity: Activity = {
        id: createActivityId("123e4567-e89b-4d3a-a456-426614174000"),
        date: "2025-01-27T14:00:00.000Z",
        type: ActivityType.SALE,
        productId: createProductId("550e8400-e29b-41d4-a716-446655440000"),
        quantity: -5,
        amount: 99.95,
    };

    describe("isValidActivity", () => {
        it("should validate activity with all valid fields", () => {
            expect(isValidActivity(validActivity)).toBe(true);
        });

        it("should require productId for SALE type", () => {
            const activity: Activity = {
                ...validActivity,
                type: ActivityType.SALE,
                productId: undefined,
            };
            expect(isValidActivity(activity)).toBe(false);
        });

        it("should require productId for STOCK_CORRECTION type", () => {
            const activity: Activity = {
                ...validActivity,
                type: ActivityType.STOCK_CORRECTION,
                productId: undefined,
            };
            expect(isValidActivity(activity)).toBe(false);
        });

        it("should allow activity without productId for OTHER type", () => {
            const activity: Activity = {
                id: createActivityId("123e4567-e89b-4d3a-a456-426614174000"),
                date: "2025-01-27T14:00:00.000Z",
                type: ActivityType.OTHER,
                quantity: 0,
                amount: 0,
            };
            expect(isValidActivity(activity)).toBe(true);
        });

        it("should allow activity without productId for CREATION type", () => {
            const activity: Activity = {
                id: createActivityId("123e4567-e89b-4d3a-a456-426614174000"),
                date: "2025-01-27T14:00:00.000Z",
                type: ActivityType.CREATION,
                quantity: 0,
                amount: 0,
            };
            expect(isValidActivity(activity)).toBe(true);
        });

        it("should reject activity with null productId for SALE type", () => {
            const activity: Activity = {
                ...validActivity,
                type: ActivityType.SALE,
                productId: null as unknown as undefined,
            };
            expect(isValidActivity(activity)).toBe(false);
        });
    });

    describe("isNegativeForSale", () => {
        it("should return true for negative quantity in SALE activity", () => {
            const activity: Activity = {
                ...validActivity,
                type: ActivityType.SALE,
                quantity: -5,
            };
            expect(isNegativeForSale(activity)).toBe(true);
        });

        it("should return false for positive quantity in SALE activity", () => {
            const activity: Activity = {
                ...validActivity,
                type: ActivityType.SALE,
                quantity: 5,
            };
            expect(isNegativeForSale(activity)).toBe(false);
        });

        it("should return false for zero quantity in SALE activity", () => {
            const activity: Activity = {
                ...validActivity,
                type: ActivityType.SALE,
                quantity: 0,
            };
            expect(isNegativeForSale(activity)).toBe(false);
        });

        it("should return false for non-SALE activity types", () => {
            const activity: Activity = {
                ...validActivity,
                type: ActivityType.CREATION,
                quantity: -5,
            };
            expect(isNegativeForSale(activity)).toBe(false);
        });
    });

    describe("isValidActivityType", () => {
        it("should validate valid ActivityType values", () => {
            expect(isValidActivityType("SALE")).toBe(true);
            expect(isValidActivityType("CREATION")).toBe(true);
            expect(isValidActivityType("STOCK_CORRECTION")).toBe(true);
            expect(isValidActivityType("OTHER")).toBe(true);
        });

        it("should reject invalid ActivityType values", () => {
            expect(isValidActivityType("INVALID")).toBe(false);
            expect(isValidActivityType("")).toBe(false);
            expect(isValidActivityType("sale")).toBe(false); // case sensitive
        });
    });
});

describe("Domain Validation - StockMovement", () => {
    const validStockMovement: StockMovement = {
        id: createStockMovementId("123e4567-e89b-4d3a-a456-426614174000"),
        productId: createProductId("550e8400-e29b-41d4-a716-446655440000"),
        quantity: -5,
        source: StockMovementSource.SALE,
    };

    describe("isValidStockMovement", () => {
        it("should validate stock movement with all valid fields", () => {
            expect(isValidStockMovement(validStockMovement)).toBe(true);
        });

        it("should validate positive quantity for CREATION source", () => {
            const movement: StockMovement = {
                ...validStockMovement,
                quantity: 10,
                source: StockMovementSource.CREATION,
            };
            expect(isValidStockMovement(movement)).toBe(true);
        });

        it("should validate negative quantity for SALE source", () => {
            const movement: StockMovement = {
                ...validStockMovement,
                quantity: -5,
                source: StockMovementSource.SALE,
            };
            expect(isValidStockMovement(movement)).toBe(true);
        });

        it("should validate positive or negative quantity for INVENTORY_ADJUSTMENT", () => {
            const positiveMovement: StockMovement = {
                ...validStockMovement,
                quantity: 10,
                source: StockMovementSource.INVENTORY_ADJUSTMENT,
            };
            expect(isValidStockMovement(positiveMovement)).toBe(true);

            const negativeMovement: StockMovement = {
                ...validStockMovement,
                quantity: -10,
                source: StockMovementSource.INVENTORY_ADJUSTMENT,
            };
            expect(isValidStockMovement(negativeMovement)).toBe(true);
        });

        it("should reject stock movement with empty productId", () => {
            const movement: StockMovement = {
                ...validStockMovement,
                productId: "" as ProductId,
            };
            expect(isValidStockMovement(movement)).toBe(false);
        });

        it("should reject stock movement with whitespace-only productId", () => {
            const movement: StockMovement = {
                ...validStockMovement,
                productId: "   " as ProductId,
            };
            expect(isValidStockMovement(movement)).toBe(false);
        });
    });

    describe("isValidQuantityForSource", () => {
        it("should validate positive quantity for CREATION", () => {
            expect(
                isValidQuantityForSource(10, StockMovementSource.CREATION)
            ).toBe(true);
        });

        it("should reject negative quantity for CREATION", () => {
            expect(
                isValidQuantityForSource(-10, StockMovementSource.CREATION)
            ).toBe(false);
        });

        it("should reject zero quantity for CREATION", () => {
            expect(
                isValidQuantityForSource(0, StockMovementSource.CREATION)
            ).toBe(false);
        });

        it("should validate negative quantity for SALE", () => {
            expect(
                isValidQuantityForSource(-5, StockMovementSource.SALE)
            ).toBe(true);
        });

        it("should reject positive quantity for SALE", () => {
            expect(
                isValidQuantityForSource(5, StockMovementSource.SALE)
            ).toBe(false);
        });

        it("should reject zero quantity for SALE", () => {
            expect(
                isValidQuantityForSource(0, StockMovementSource.SALE)
            ).toBe(false);
        });

        it("should validate positive quantity for INVENTORY_ADJUSTMENT", () => {
            expect(
                isValidQuantityForSource(
                    10,
                    StockMovementSource.INVENTORY_ADJUSTMENT
                )
            ).toBe(true);
        });

        it("should validate negative quantity for INVENTORY_ADJUSTMENT", () => {
            expect(
                isValidQuantityForSource(
                    -10,
                    StockMovementSource.INVENTORY_ADJUSTMENT
                )
            ).toBe(true);
        });

        it("should reject zero quantity for INVENTORY_ADJUSTMENT", () => {
            expect(
                isValidQuantityForSource(
                    0,
                    StockMovementSource.INVENTORY_ADJUSTMENT
                )
            ).toBe(false);
        });
    });

    describe("isValidStockMovementSource", () => {
        it("should validate valid StockMovementSource values", () => {
            expect(isValidStockMovementSource("CREATION")).toBe(true);
            expect(isValidStockMovementSource("SALE")).toBe(true);
            expect(isValidStockMovementSource("INVENTORY_ADJUSTMENT")).toBe(
                true
            );
        });

        it("should reject invalid StockMovementSource values", () => {
            expect(isValidStockMovementSource("INVALID")).toBe(false);
            expect(isValidStockMovementSource("")).toBe(false);
            expect(isValidStockMovementSource("creation")).toBe(false); // case sensitive
        });
    });
});

describe("Domain Validation - ProductModel", () => {
    const validProductModel: ProductModel = {
        id: createProductModelId("123e4567-e89b-4d3a-a456-426614174000"),
        type: ProductType.POCHETTE_VOLANTS,
        name: "Charlie",
    };

    describe("isValidProductModel", () => {
        it("should validate product model with all valid fields", () => {
            expect(isValidProductModel(validProductModel)).toBe(true);
        });

        it("should validate product model with different product types", () => {
            const sacBananeModel: ProductModel = {
                ...validProductModel,
                type: ProductType.SAC_BANANE,
                name: "Assumée",
            };
            expect(isValidProductModel(sacBananeModel)).toBe(true);

            const trousseModel: ProductModel = {
                ...validProductModel,
                type: ProductType.TROUSSE_TOILETTE,
                name: "Espiègle",
            };
            expect(isValidProductModel(trousseModel)).toBe(true);
        });

        it("should reject product model with empty id", () => {
            const model: ProductModel = {
                ...validProductModel,
                id: "" as ProductModelId,
            };
            expect(isValidProductModel(model)).toBe(false);
        });

        it("should reject product model with whitespace-only id", () => {
            const model: ProductModel = {
                ...validProductModel,
                id: "   " as ProductModelId,
            };
            expect(isValidProductModel(model)).toBe(false);
        });

        it("should reject product model with empty name", () => {
            const model: ProductModel = {
                ...validProductModel,
                name: "",
            };
            expect(isValidProductModel(model)).toBe(false);
        });

        it("should reject product model with whitespace-only name", () => {
            const model: ProductModel = {
                ...validProductModel,
                name: "   ",
            };
            expect(isValidProductModel(model)).toBe(false);
        });

        it("should accept product model with trimmed name (whitespace at edges)", () => {
            const model: ProductModel = {
                ...validProductModel,
                name: "  Charlie  ",
            };
            // Validation trims whitespace, so this should be valid
            expect(isValidProductModel(model)).toBe(true);
        });

        it("should accept product model with trimmed id (whitespace at edges)", () => {
            const model: ProductModel = {
                ...validProductModel,
                id: "  123e4567-e89b-4d3a-a456-426614174000  " as ProductModelId,
            };
            // Validation trims whitespace, so this should be valid
            expect(isValidProductModel(model)).toBe(true);
        });

        it("should reject product model with invalid ProductType", () => {
            const model: ProductModel = {
                ...validProductModel,
                type: "INVALID_TYPE" as ProductType,
            };
            expect(isValidProductModel(model)).toBe(false);
        });
    });

    describe("isValidProductModelForType", () => {
        it("should validate product model that belongs to the specified type", () => {
            const model: ProductModel = {
                ...validProductModel,
                type: ProductType.POCHETTE_VOLANTS,
            };
            expect(isValidProductModelForType(model, ProductType.POCHETTE_VOLANTS)).toBe(true);
        });

        it("should reject product model that does not belong to the specified type", () => {
            const model: ProductModel = {
                ...validProductModel,
                type: ProductType.POCHETTE_VOLANTS,
            };
            expect(isValidProductModelForType(model, ProductType.SAC_BANANE)).toBe(false);
        });

        it("should reject invalid product model even if type matches", () => {
            const invalidModel: ProductModel = {
                ...validProductModel,
                name: "   ", // Invalid: whitespace-only name
                type: ProductType.POCHETTE_VOLANTS,
            };
            expect(isValidProductModelForType(invalidModel, ProductType.POCHETTE_VOLANTS)).toBe(false);
        });

        it("should validate different product types correctly", () => {
            const sacBananeModel: ProductModel = {
                id: createProductModelId("550e8400-e29b-41d4-a716-446655440000"),
                type: ProductType.SAC_BANANE,
                name: "Assumée",
            };
            expect(isValidProductModelForType(sacBananeModel, ProductType.SAC_BANANE)).toBe(true);
            expect(isValidProductModelForType(sacBananeModel, ProductType.POCHETTE_VOLANTS)).toBe(false);

            const trousseModel: ProductModel = {
                id: createProductModelId("660e8400-e29b-41d4-a716-446655440001"),
                type: ProductType.TROUSSE_TOILETTE,
                name: "Espiègle",
            };
            expect(isValidProductModelForType(trousseModel, ProductType.TROUSSE_TOILETTE)).toBe(true);
            expect(isValidProductModelForType(trousseModel, ProductType.POCHETTE_VOLANTS)).toBe(false);
        });
    });
});

describe("Domain Validation - ProductColoris", () => {
    const validModelId = createProductModelId("550e8400-e29b-41d4-a716-446655440000");
    const validProductColoris: ProductColoris = {
        id: createProductColorisId("123e4567-e89b-4d3a-a456-426614174000"),
        modelId: validModelId,
        coloris: "Rose Marsala",
    };

    describe("isValidProductColoris", () => {
        it("should validate product coloris with all valid fields", () => {
            expect(isValidProductColoris(validProductColoris)).toBe(true);
        });

        it("should validate product coloris with different coloris values", () => {
            const roseColoris: ProductColoris = {
                ...validProductColoris,
                coloris: "Rose pâle à motifs",
            };
            expect(isValidProductColoris(roseColoris)).toBe(true);

            const pruneColoris: ProductColoris = {
                ...validProductColoris,
                coloris: "Prune",
            };
            expect(isValidProductColoris(pruneColoris)).toBe(true);
        });

        it("should reject product coloris with empty id", () => {
            const coloris: ProductColoris = {
                ...validProductColoris,
                id: "" as ProductColorisId,
            };
            expect(isValidProductColoris(coloris)).toBe(false);
        });

        it("should reject product coloris with whitespace-only id", () => {
            const coloris: ProductColoris = {
                ...validProductColoris,
                id: "   " as ProductColorisId,
            };
            expect(isValidProductColoris(coloris)).toBe(false);
        });

        it("should reject product coloris with empty modelId", () => {
            const coloris: ProductColoris = {
                ...validProductColoris,
                modelId: "" as ProductModelId,
            };
            expect(isValidProductColoris(coloris)).toBe(false);
        });

        it("should reject product coloris with whitespace-only modelId", () => {
            const coloris: ProductColoris = {
                ...validProductColoris,
                modelId: "   " as ProductModelId,
            };
            expect(isValidProductColoris(coloris)).toBe(false);
        });

        it("should reject product coloris with empty coloris", () => {
            const coloris: ProductColoris = {
                ...validProductColoris,
                coloris: "",
            };
            expect(isValidProductColoris(coloris)).toBe(false);
        });

        it("should reject product coloris with whitespace-only coloris", () => {
            const coloris: ProductColoris = {
                ...validProductColoris,
                coloris: "   ",
            };
            expect(isValidProductColoris(coloris)).toBe(false);
        });

        it("should accept product coloris with trimmed coloris (whitespace at edges)", () => {
            const coloris: ProductColoris = {
                ...validProductColoris,
                coloris: "  Rose Marsala  ",
            };
            // Validation trims whitespace, so this should be valid
            expect(isValidProductColoris(coloris)).toBe(true);
        });

        it("should accept product coloris with trimmed id (whitespace at edges)", () => {
            const coloris: ProductColoris = {
                ...validProductColoris,
                id: "  123e4567-e89b-4d3a-a456-426614174000  " as ProductColorisId,
            };
            // Validation trims whitespace, so this should be valid
            expect(isValidProductColoris(coloris)).toBe(true);
        });

        it("should accept product coloris with trimmed modelId (whitespace at edges)", () => {
            const coloris: ProductColoris = {
                ...validProductColoris,
                modelId: "  550e8400-e29b-41d4-a716-446655440000  " as ProductModelId,
            };
            // Validation trims whitespace, so this should be valid
            expect(isValidProductColoris(coloris)).toBe(true);
        });
    });

    describe("isValidProductColorisForModel", () => {
        it("should validate product coloris that belongs to the specified model", () => {
            const coloris: ProductColoris = {
                ...validProductColoris,
                modelId: validModelId,
            };
            expect(isValidProductColorisForModel(coloris, validModelId)).toBe(true);
        });

        it("should reject product coloris that does not belong to the specified model", () => {
            const otherModelId = createProductModelId("660e8400-e29b-41d4-a716-446655440001");
            const coloris: ProductColoris = {
                ...validProductColoris,
                modelId: validModelId,
            };
            expect(isValidProductColorisForModel(coloris, otherModelId)).toBe(false);
        });

        it("should reject invalid product coloris even if modelId matches", () => {
            const invalidColoris: ProductColoris = {
                ...validProductColoris,
                coloris: "   ", // Invalid: whitespace-only coloris
                modelId: validModelId,
            };
            expect(isValidProductColorisForModel(invalidColoris, validModelId)).toBe(false);
        });

        it("should validate different model associations correctly", () => {
            const charlieModelId = createProductModelId("550e8400-e29b-41d4-a716-446655440000");
            const assumeeModelId = createProductModelId("660e8400-e29b-41d4-a716-446655440001");

            const charlieColoris: ProductColoris = {
                id: createProductColorisId("123e4567-e89b-4d3a-a456-426614174000"),
                modelId: charlieModelId,
                coloris: "Rose Marsala",
            };
            expect(isValidProductColorisForModel(charlieColoris, charlieModelId)).toBe(true);
            expect(isValidProductColorisForModel(charlieColoris, assumeeModelId)).toBe(false);

            const assumeeColorisVar: ProductColoris = {
                id: createProductColorisId("223e4567-e89b-4d3a-a456-426614174001"),
                modelId: assumeeModelId,
                coloris: "Prune",
            };
            expect(isValidProductColorisForModel(assumeeColorisVar, assumeeModelId)).toBe(true);
            expect(isValidProductColorisForModel(assumeeColorisVar, charlieModelId)).toBe(false);
        });

        it("should handle edge case with whitespace-only modelId in comparison", () => {
            const coloris: ProductColoris = {
                ...validProductColoris,
                modelId: "   " as ProductModelId, // Invalid modelId
            };
            const validModelId = createProductModelId("550e8400-e29b-41d4-a716-446655440000");
            // Invalid coloris should fail validation
            expect(isValidProductColorisForModel(coloris, validModelId)).toBe(false);
        });
    });
});

