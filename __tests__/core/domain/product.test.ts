/**
 * Domain Types Tests - Product
 *
 * Tests for Product domain type to ensure type structure,
 * required fields, and business rules are correctly defined.
 *
 * These tests verify:
 * - Type structure and required fields
 * - Field types and constraints
 * - Business rules (positive prices, non-negative stock)
 * - Edge cases and boundary conditions
 */

import type { Product, ProductId } from "@/core/domain/product";
import { ProductType } from "@/core/domain/product";
import { isValidUUID, isValidProduct } from "../../utils/validation";

// Helper function to create ProductId from string (for tests)
const createProductId = (id: string): ProductId => id as ProductId;

describe("Domain Types - Product", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("ProductType Enum", () => {
        it("should have all required product types", () => {
            expect(ProductType.SAC_BANANE).toBe("SAC_BANANE");
            expect(ProductType.POCHETTE_ORDINATEUR).toBe("POCHETTE_ORDINATEUR");
            expect(ProductType.TROUSSE_TOILETTE).toBe("TROUSSE_TOILETTE");
            expect(ProductType.POCHETTE_VOLANTS).toBe("POCHETTE_VOLANTS");
            expect(ProductType.TROUSSE_ZIPPEE).toBe("TROUSSE_ZIPPEE");
            expect(ProductType.ACCESSOIRES_DIVERS).toBe("ACCESSOIRES_DIVERS");
        });
    });

    describe("Product Type", () => {
        const validProduct: Product = {
            id: createProductId("123e4567-e89b-4d3a-a456-426614174000"),
            name: "Sac banane L'Assumée",
            type: ProductType.SAC_BANANE,
            unitCost: 10.5,
            salePrice: 19.99,
            stock: 100,
        };

        // Type structure tests
        it("should have all required fields", () => {
            expect(validProduct).toHaveProperty("id");
            expect(validProduct).toHaveProperty("name");
            expect(validProduct).toHaveProperty("type");
            expect(validProduct).toHaveProperty("unitCost");
            expect(validProduct).toHaveProperty("salePrice");
            expect(validProduct).toHaveProperty("stock");
        });

        it("should have id as string (UUID format)", () => {
            expect(typeof validProduct.id).toBe("string");
            expect(isValidUUID(validProduct.id)).toBe(true);
        });

        it("should have name as string", () => {
            expect(typeof validProduct.name).toBe("string");
            expect(validProduct.name).toBeTruthy();
        });

        it("should have type as ProductType enum", () => {
            expect(validProduct.type).toBe(ProductType.SAC_BANANE);
            expect(Object.values(ProductType)).toContain(validProduct.type);
        });

        it("should have unitCost as number", () => {
            expect(typeof validProduct.unitCost).toBe("number");
        });

        it("should have salePrice as number", () => {
            expect(typeof validProduct.salePrice).toBe("number");
        });

        it("should have stock as number", () => {
            expect(typeof validProduct.stock).toBe("number");
        });

        // Field constraints tests
        it("should allow positive unitCost", () => {
            const product: Product = { ...validProduct, unitCost: 5.99 };
            expect(product.unitCost).toBeGreaterThan(0);
        });

        it("should allow positive salePrice", () => {
            const product: Product = { ...validProduct, salePrice: 15.99 };
            expect(product.salePrice).toBeGreaterThan(0);
        });

        it("should allow non-negative stock", () => {
            const product: Product = { ...validProduct, stock: 0 };
            expect(product.stock).toBeGreaterThanOrEqual(0);
        });

        it("should allow zero stock", () => {
            const product: Product = { ...validProduct, stock: 0 };
            expect(product.stock).toBe(0);
        });

        // Edge cases
        it("should handle very large numbers", () => {
            const product: Product = {
                ...validProduct,
                unitCost: Number.MAX_SAFE_INTEGER,
                salePrice: Number.MAX_SAFE_INTEGER,
                stock: Number.MAX_SAFE_INTEGER,
            };
            expect(product.unitCost).toBe(Number.MAX_SAFE_INTEGER);
        });

        it("should handle decimal prices", () => {
            const product: Product = {
                ...validProduct,
                unitCost: 10.999,
                salePrice: 19.999,
            };
            expect(product.unitCost).toBe(10.999);
            expect(product.salePrice).toBe(19.999);
        });
    });

    describe("Product Validation", () => {
        const validProduct: Product = {
            id: createProductId("123e4567-e89b-4d3a-a456-426614174000"),
            name: "Pochette ordinateur L'Espiegle",
            type: ProductType.POCHETTE_ORDINATEUR,
            unitCost: 10.5,
            salePrice: 19.99,
            stock: 100,
        };

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
    });
});

