/**
 * Mock Fixtures for Activity Domain Types
 *
 * Reusable factory functions for creating test data for activity domain types.
 * These fixtures are used across all test files to ensure consistency and reduce duplication.
 *
 * Following DRY principles, all mock data creation is centralized here.
 */

import type { Activity, ActivityId } from "@/core/domain/activity";
import { ActivityType } from "@/core/domain/activity";
import type { ProductId } from "@/core/domain/product";

/**
 * Creates a mock Activity for testing.
 *
 * @param {Partial<Activity>} [overrides] - Optional overrides for default activity properties
 * @returns {Activity} Mock activity object with default values and optional overrides
 *
 * @example
 * ```typescript
 * const activity = createMockActivity({ type: ActivityType.SALE, quantity: -5 });
 * ```
 */
export const createMockActivity = (
    overrides?: Partial<Activity>
): Activity => {
    const defaultProductId = "550e8400-e29b-41d4-a716-446655440000" as ProductId;

    return {
        id: "123e4567-e89b-4d3a-a456-426614174000" as ActivityId,
        date: "2025-01-27T14:00:00.000Z",
        type: ActivityType.CREATION,
        productId: defaultProductId,
        quantity: 10,
        amount: 50.0,
        note: "Test activity",
        ...overrides,
    };
};

