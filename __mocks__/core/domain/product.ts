/**
 * Mock Fixtures for Product Domain Types
 *
 * Reusable factory functions for creating test data for product domain types.
 * These fixtures are used across all test files to ensure consistency and reduce duplication.
 *
 * Following DRY principles, all mock data creation is centralized here.
 */

import type { Product, ProductId } from "@/core/domain/product";
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

