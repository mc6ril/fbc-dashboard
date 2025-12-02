/**
 * Mock Fixtures for StockMovement Domain Types
 *
 * Reusable factory functions for creating test data for stock movement domain types.
 * These fixtures are used across all test files to ensure consistency and reduce duplication.
 *
 * Following DRY principles, all mock data creation is centralized here.
 */

import type { StockMovement, StockMovementId } from "@/core/domain/stockMovement";
import { StockMovementSource } from "@/core/domain/stockMovement";
import type { ProductId } from "@/core/domain/product";

/**
 * Creates a mock StockMovement for testing.
 *
 * @param {Partial<StockMovement>} [overrides] - Optional overrides for default stock movement properties
 * @returns {StockMovement} Mock stock movement object with default values and optional overrides
 *
 * @example
 * ```typescript
 * const movement = createMockStockMovement({ source: StockMovementSource.SALE, quantity: -5 });
 * ```
 */
export const createMockStockMovement = (
    overrides?: Partial<StockMovement>
): StockMovement => {
    const defaultProductId = "550e8400-e29b-41d4-a716-446655440000" as ProductId;

    return {
        id: "223e4567-e89b-4d3a-a456-426614174000" as StockMovementId,
        productId: defaultProductId,
        quantity: 10,
        source: StockMovementSource.CREATION,
        ...overrides,
    };
};

