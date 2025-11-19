/**
 * Mock Fixtures for Product Domain Types
 *
 * Reusable factory functions for creating test data for product domain types.
 * These fixtures are used across all test files to ensure consistency and reduce duplication.
 *
 * Following DRY principles, all mock data creation is centralized here.
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

/**
 * Creates a mock Product for testing.
 *
 * @param {Partial<Product>} [overrides] - Optional overrides for default product properties
 * @returns {Product} Mock product object with default values and optional overrides
 *
 * @example
 * ```typescript
 * const product = createMockProduct({ salePrice: 25.0, unitCost: 10.0 });
 * ```
 */
export const createMockProduct = (overrides?: Partial<Product>): Product => {
    return {
        id: "550e8400-e29b-41d4-a716-446655440000" as ProductId,
        name: "Sac banane L'Assumée",
        type: ProductType.SAC_BANANE,
        coloris: "Rose pâle à motifs",
        unitCost: 10.0,
        salePrice: 19.99,
        stock: 100,
        ...overrides,
    };
};

/**
 * Creates a mock ProductModel for testing.
 *
 * @param {Partial<ProductModel>} [overrides] - Optional overrides for default model properties
 * @returns {ProductModel} Mock product model object with default values and optional overrides
 *
 * @example
 * ```typescript
 * const model = createMockProductModel({ name: "Charlie", type: ProductType.POCHETTE_VOLANTS });
 * ```
 */
export const createMockProductModel = (
    overrides?: Partial<ProductModel>
): ProductModel => {
    return {
        id: "660e8400-e29b-41d4-a716-446655440001" as ProductModelId,
        type: ProductType.POCHETTE_VOLANTS,
        name: "Charlie",
        ...overrides,
    };
};

/**
 * Creates a mock ProductColoris for testing.
 *
 * @param {Partial<ProductColoris>} [overrides] - Optional overrides for default coloris properties
 * @returns {ProductColoris} Mock product coloris object with default values and optional overrides
 *
 * @example
 * ```typescript
 * const coloris = createMockProductColoris({ coloris: "Rose Marsala", modelId: charlieModelId });
 * ```
 */
export const createMockProductColoris = (
    overrides?: Partial<ProductColoris>
): ProductColoris => {
    const defaultModelId = "660e8400-e29b-41d4-a716-446655440001" as ProductModelId;
    return {
        id: "770e8400-e29b-41d4-a716-446655440002" as ProductColorisId,
        modelId: defaultModelId,
        coloris: "Rose Marsala",
        ...overrides,
    };
};

