/**
 * Domain Types Tests - StockMovement
 *
 * Tests for StockMovement domain type and StockMovementSource enum to ensure
 * type structure, required fields, and business rules are correctly defined.
 *
 * These tests verify:
 * - StockMovementSource enum values
 * - Type structure and required fields
 * - Business rules (quantity sign meaning based on source)
 * - Edge cases and boundary conditions
 */

import type { StockMovement, StockMovementId } from "@/core/domain/stockMovement";
import { StockMovementSource } from "@/core/domain/stockMovement";
import type { ProductId } from "@/core/domain/product";
import {
    isValidUUID,
    isValidStockMovement,
    isValidQuantityForSource,
    isValidStockMovementSource,
} from "../../utils/validation";

// Helper functions to create branded IDs from strings (for tests)
const createStockMovementId = (id: string): StockMovementId => id as StockMovementId;
const createProductId = (id: string): ProductId => id as ProductId;

describe("Domain Types - StockMovement", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("StockMovementSource Enum", () => {
        it("should have CREATION value", () => {
            expect(StockMovementSource.CREATION).toBe("CREATION");
        });

        it("should have SALE value", () => {
            expect(StockMovementSource.SALE).toBe("SALE");
        });

        it("should have INVENTORY_ADJUSTMENT value", () => {
            expect(StockMovementSource.INVENTORY_ADJUSTMENT).toBe(
                "INVENTORY_ADJUSTMENT"
            );
        });
    });

    describe("StockMovement Type", () => {
        const validStockMovement: StockMovement = {
            id: createStockMovementId("123e4567-e89b-4d3a-a456-426614174000"),
            productId: createProductId("550e8400-e29b-41d4-a716-446655440000"),
            quantity: -5,
            source: StockMovementSource.SALE,
        };

        // Type structure tests
        it("should have all required fields", () => {
            expect(validStockMovement).toHaveProperty("id");
            expect(validStockMovement).toHaveProperty("productId");
            expect(validStockMovement).toHaveProperty("quantity");
            expect(validStockMovement).toHaveProperty("source");
        });

        it("should have id as string (UUID format)", () => {
            expect(typeof validStockMovement.id).toBe("string");
            expect(isValidUUID(validStockMovement.id)).toBe(true);
        });

        it("should have productId as string (UUID)", () => {
            expect(typeof validStockMovement.productId).toBe("string");
            expect(isValidUUID(validStockMovement.productId)).toBe(true);
        });

        it("should have quantity as number (can be positive or negative)", () => {
            expect(typeof validStockMovement.quantity).toBe("number");
        });

        it("should have source as StockMovementSource", () => {
            expect(Object.values(StockMovementSource)).toContain(
                validStockMovement.source
            );
        });

        // Business rules tests
        it("should allow positive quantity for CREATION source", () => {
            const movement: StockMovement = {
                ...validStockMovement,
                quantity: 10,
                source: StockMovementSource.CREATION,
            };
            expect(movement.quantity).toBeGreaterThan(0);
            expect(movement.source).toBe(StockMovementSource.CREATION);
        });

        it("should allow negative quantity for SALE source", () => {
            const movement: StockMovement = {
                ...validStockMovement,
                quantity: -5,
                source: StockMovementSource.SALE,
            };
            expect(movement.quantity).toBeLessThan(0);
            expect(movement.source).toBe(StockMovementSource.SALE);
        });

        it("should allow positive or negative quantity for INVENTORY_ADJUSTMENT", () => {
            const positiveMovement: StockMovement = {
                ...validStockMovement,
                quantity: 10,
                source: StockMovementSource.INVENTORY_ADJUSTMENT,
            };
            expect(positiveMovement.quantity).toBeGreaterThan(0);

            const negativeMovement: StockMovement = {
                ...validStockMovement,
                quantity: -10,
                source: StockMovementSource.INVENTORY_ADJUSTMENT,
            };
            expect(negativeMovement.quantity).toBeLessThan(0);
        });

        // Edge cases
        it("should handle zero quantity", () => {
            const movement: StockMovement = {
                ...validStockMovement,
                quantity: 0,
            };
            expect(movement.quantity).toBe(0);
        });

        it("should handle very large quantities", () => {
            const movement: StockMovement = {
                ...validStockMovement,
                quantity: Number.MAX_SAFE_INTEGER,
            };
            expect(movement.quantity).toBe(Number.MAX_SAFE_INTEGER);
        });

        it("should handle very negative quantities", () => {
            const movement: StockMovement = {
                ...validStockMovement,
                quantity: Number.MIN_SAFE_INTEGER,
            };
            expect(movement.quantity).toBe(Number.MIN_SAFE_INTEGER);
        });

        it("should handle all StockMovementSource values", () => {
            Object.values(StockMovementSource).forEach((source) => {
                const movement: StockMovement = {
                    id: createStockMovementId("123e4567-e89b-4d3a-a456-426614174000"),
                    productId: createProductId("550e8400-e29b-41d4-a716-446655440000"),
                    quantity: 0,
                    source,
                };
                expect(movement.source).toBe(source);
            });
        });
    });

    describe("StockMovement Validation", () => {
        const validStockMovement: StockMovement = {
            id: createStockMovementId("123e4567-e89b-4d3a-a456-426614174000"),
            productId: createProductId("550e8400-e29b-41d4-a716-446655440000"),
            quantity: -5,
            source: StockMovementSource.SALE,
        };

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
                expect(
                    isValidStockMovementSource("INVENTORY_ADJUSTMENT")
                ).toBe(true);
            });

            it("should reject invalid StockMovementSource values", () => {
                expect(isValidStockMovementSource("INVALID")).toBe(false);
                expect(isValidStockMovementSource("")).toBe(false);
                expect(isValidStockMovementSource("creation")).toBe(false); // case sensitive
            });
        });
    });
});

