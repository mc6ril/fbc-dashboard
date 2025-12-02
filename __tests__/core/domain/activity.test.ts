/**
 * Domain Types Tests - Activity
 *
 * Tests for Activity domain type and ActivityType enum to ensure
 * type structure, required/optional fields, and business rules are correctly defined.
 *
 * These tests verify:
 * - ActivityType enum values
 * - Type structure and required fields
 * - Optional fields behavior
 * - Business rules (productId requirements, quantity signs)
 * - Edge cases and boundary conditions
 */

import type { Activity, ActivityId } from "@/core/domain/activity";
import { ActivityType } from "@/core/domain/activity";
import type { ProductId } from "@/core/domain/product";
import {
    isValidUUID,
    isValidActivity,
    isNegativeForSale,
    isValidActivityType,
} from "../../utils/validation";
import { isValidISO8601 } from "@/shared/utils/date";

// Helper functions to create branded IDs from strings (for tests)
const createActivityId = (id: string): ActivityId => id as ActivityId;
const createProductId = (id: string): ProductId => id as ProductId;

describe("Domain Types - Activity", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("ActivityType Enum", () => {
        it("should have CREATION value", () => {
            expect(ActivityType.CREATION).toBe("CREATION");
        });

        it("should have SALE value", () => {
            expect(ActivityType.SALE).toBe("SALE");
        });

        it("should have STOCK_CORRECTION value", () => {
            expect(ActivityType.STOCK_CORRECTION).toBe("STOCK_CORRECTION");
        });

        it("should have OTHER value", () => {
            expect(ActivityType.OTHER).toBe("OTHER");
        });
    });

    describe("Activity Type", () => {
        const validActivity: Activity = {
            id: createActivityId("123e4567-e89b-4d3a-a456-426614174000"),
            date: "2025-01-27T14:00:00.000Z",
            type: ActivityType.SALE,
            productId: createProductId("550e8400-e29b-41d4-a716-446655440000"),
            quantity: -5,
            amount: 99.95,
            note: "Test sale",
        };

        // Type structure tests
        it("should have all required fields", () => {
            expect(validActivity).toHaveProperty("id");
            expect(validActivity).toHaveProperty("date");
            expect(validActivity).toHaveProperty("type");
            expect(validActivity).toHaveProperty("quantity");
            expect(validActivity).toHaveProperty("amount");
        });

        it("should have id as string (UUID format)", () => {
            expect(typeof validActivity.id).toBe("string");
            expect(isValidUUID(validActivity.id)).toBe(true);
        });

        it("should have date as ISO 8601 string", () => {
            expect(typeof validActivity.date).toBe("string");
            expect(isValidISO8601(validActivity.date)).toBe(true);
        });

        it("should have type as ActivityType", () => {
            expect(Object.values(ActivityType)).toContain(validActivity.type);
        });

        it("should have productId as optional string (UUID)", () => {
            if (validActivity.productId) {
                expect(typeof validActivity.productId).toBe("string");
                expect(isValidUUID(validActivity.productId)).toBe(true);
            }
        });

        it("should have quantity as number (can be positive or negative)", () => {
            expect(typeof validActivity.quantity).toBe("number");
        });

        it("should have amount as number", () => {
            expect(typeof validActivity.amount).toBe("number");
        });

        it("should have note as optional string", () => {
            if (validActivity.note) {
                expect(typeof validActivity.note).toBe("string");
            }
        });

        // Business rules tests
        it("should require productId for SALE type", () => {
            const activity: Activity = {
                ...validActivity,
                type: ActivityType.SALE,
                productId: createProductId("550e8400-e29b-41d4-a716-446655440000"),
            };
            expect(activity.productId).toBeDefined();
        });

        it("should require productId for STOCK_CORRECTION type", () => {
            const activity: Activity = {
                ...validActivity,
                type: ActivityType.STOCK_CORRECTION,
                productId: createProductId("550e8400-e29b-41d4-a716-446655440000"),
            };
            expect(activity.productId).toBeDefined();
        });

        it("should allow productId to be undefined for OTHER type", () => {
            const activity: Activity = {
                id: createActivityId("123e4567-e89b-4d3a-a456-426614174000"),
                date: "2025-01-27T14:00:00.000Z",
                type: ActivityType.OTHER,
                quantity: 0,
                amount: 0,
            };
            expect(activity.productId).toBeUndefined();
        });

        it("should allow productId to be undefined for CREATION type", () => {
            const activity: Activity = {
                id: createActivityId("123e4567-e89b-4d3a-a456-426614174000"),
                date: "2025-01-27T14:00:00.000Z",
                type: ActivityType.CREATION,
                quantity: 0,
                amount: 0,
            };
            expect(activity.productId).toBeUndefined();
        });

        it("should allow positive quantity for stock increases", () => {
            const activity: Activity = {
                ...validActivity,
                quantity: 10,
            };
            expect(activity.quantity).toBeGreaterThan(0);
        });

        it("should allow negative quantity for stock decreases", () => {
            const activity: Activity = {
                ...validActivity,
                quantity: -5,
            };
            expect(activity.quantity).toBeLessThan(0);
        });

        // Edge cases
        it("should handle zero quantity", () => {
            const activity: Activity = {
                ...validActivity,
                quantity: 0,
            };
            expect(activity.quantity).toBe(0);
        });

        it("should handle zero amount", () => {
            const activity: Activity = {
                ...validActivity,
                amount: 0,
            };
            expect(activity.amount).toBe(0);
        });

        it("should handle empty note", () => {
            const activity: Activity = {
                ...validActivity,
                note: "",
            };
            expect(activity.note).toBe("");
        });

        it("should handle very large quantities", () => {
            const activity: Activity = {
                ...validActivity,
                quantity: Number.MAX_SAFE_INTEGER,
            };
            expect(activity.quantity).toBe(Number.MAX_SAFE_INTEGER);
        });

        it("should handle all ActivityType values", () => {
            Object.values(ActivityType).forEach((type) => {
                const activity: Activity = {
                    id: createActivityId("123e4567-e89b-4d3a-a456-426614174000"),
                    date: "2025-01-27T14:00:00.000Z",
                    type,
                    quantity: 0,
                    amount: 0,
                };
                expect(activity.type).toBe(type);
            });
        });
    });

    describe("Activity Validation", () => {
        const validActivity: Activity = {
            id: createActivityId("123e4567-e89b-4d3a-a456-426614174000"),
            date: "2025-01-27T14:00:00.000Z",
            type: ActivityType.SALE,
            productId: createProductId("550e8400-e29b-41d4-a716-446655440000"),
            quantity: -5,
            amount: 99.95,
        };

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
});

