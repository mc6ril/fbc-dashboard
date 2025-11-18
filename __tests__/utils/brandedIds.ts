/**
 * Test utilities for creating branded ID types.
 *
 * These utilities help create branded types (ProductId, ActivityId) from strings
 * in test files, avoiding type errors when working with test data.
 */

import type { ProductId } from "@/core/domain/product";
import type { ActivityId } from "@/core/domain/activity";

/**
 * Creates a ProductId from a string.
 *
 * This is a test utility to create ProductId values from plain strings
 * without TypeScript type errors. In production code, ProductId should
 * come from the domain layer or database.
 *
 * @param {string} id - String ID to convert to ProductId
 * @returns {ProductId} Branded ProductId type
 *
 * @example
 * ```typescript
 * const productId = createProductId("123e4567-e89b-4d3a-a456-426614174000");
 * ```
 */
export const createProductId = (id: string): ProductId => id as ProductId;

/**
 * Creates an ActivityId from a string.
 *
 * This is a test utility to create ActivityId values from plain strings
 * without TypeScript type errors. In production code, ActivityId should
 * come from the domain layer or database.
 *
 * @param {string} id - String ID to convert to ActivityId
 * @returns {ActivityId} Branded ActivityId type
 *
 * @example
 * ```typescript
 * const activityId = createActivityId("123e4567-e89b-4d3a-a456-426614174000");
 * ```
 */
export const createActivityId = (id: string): ActivityId => id as ActivityId;

