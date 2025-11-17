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

import type { Product, ProductId } from "@/core/domain/product";
import { ProductType } from "@/core/domain/product";
import type { Activity, ActivityId } from "@/core/domain/activity";
import { ActivityType } from "@/core/domain/activity";
import type { StockMovement, StockMovementId } from "@/core/domain/stockMovement";
import { StockMovementSource } from "@/core/domain/stockMovement";

// Helper functions to create branded IDs from strings (for tests)
const createProductId = (id: string): ProductId => id as ProductId;
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
} from "../../utils/validation";

describe("Domain Validation - Product", () => {
    const validProduct: Product = {
        id: createProductId("123e4567-e89b-4d3a-a456-426614174000"),
        name: "Trousse de toilette carrée",
        type: ProductType.TROUSSE_TOILETTE,
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

