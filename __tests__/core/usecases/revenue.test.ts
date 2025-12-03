/**
 * Usecases Tests - Revenue
 *
 * Tests for revenue usecases to ensure business logic orchestration,
 * calculation accuracy, error handling, and repository delegation work correctly.
 *
 * These tests verify:
 * - Revenue calculation (sum of SALE activity amounts)
 * - Material costs calculation (sum of unitCost * abs(quantity))
 * - Gross margin calculation (revenue - material costs)
 * - Gross margin rate calculation (percentage, division by zero handling)
 * - Date range filtering
 * - Edge cases (empty sales, zero revenue, missing products)
 * - Error handling and validation
 *
 * ## Test Specification (Sub-Ticket 32.2)
 *
 * ### Test Coverage
 * - 8+ test cases covering all calculation paths and edge cases
 * - All Acceptance Criteria from planning document
 * - All edge cases mentioned in usecase documentation
 */

import type { ActivityRepository } from "@/core/ports/activityRepository";
import type { ProductRepository } from "@/core/ports/productRepository";
import { ActivityType } from "@/core/domain/activity";
import { RevenuePeriod } from "@/core/domain/revenue";
import { computeRevenue } from "@/core/usecases/revenue";
import { createMockActivity } from "../../../__mocks__/core/domain/activity";
import { createMockActivityRepository } from "../../../__mocks__/core/ports/activityRepository";
import { createMockProductRepository } from "../../../__mocks__/core/ports/productRepository";
import { createMockProduct } from "../../../__mocks__/core/domain/product";
import type { ProductId } from "@/core/domain/product";

describe("Revenue Usecases", () => {
    let mockActivityRepo: jest.Mocked<ActivityRepository>;
    let mockProductRepo: jest.Mocked<ProductRepository>;

    const productId1 = "550e8400-e29b-41d4-a716-446655440000" as ProductId;
    const productId2 = "660e8400-e29b-41d4-a716-446655440001" as ProductId;

    beforeEach(() => {
        jest.clearAllMocks();
        mockActivityRepo = createMockActivityRepository();
        mockProductRepo = createMockProductRepository();
    });

    describe("computeRevenue", () => {
        it("should calculate revenue from SALE activities for date range", async () => {
            // Arrange
            const product1 = createMockProduct({
                id: productId1,
                unitCost: 10.0,
            });
            const product2 = createMockProduct({
                id: productId2,
                unitCost: 15.0,
            });
            const activities = [
                createMockActivity({
                    type: ActivityType.SALE,
                    productId: productId1,
                    quantity: -2,
                    amount: 40.0, // Revenue from this sale
                    date: "2025-01-15T14:00:00.000Z", // Before range
                }),
                createMockActivity({
                    type: ActivityType.SALE,
                    productId: productId2,
                    quantity: -3,
                    amount: 60.0, // Revenue from this sale
                    date: "2025-01-20T14:00:00.000Z", // In range
                }),
                createMockActivity({
                    type: ActivityType.SALE,
                    productId: productId1,
                    quantity: -1,
                    amount: 25.0, // Revenue from this sale
                    date: "2025-01-25T14:00:00.000Z", // In range
                }),
            ];
            mockActivityRepo.list.mockResolvedValue(activities);
            mockProductRepo.list.mockResolvedValue([product1, product2]);

            // Act
            const result = await computeRevenue(
                mockActivityRepo,
                mockProductRepo,
                RevenuePeriod.MONTH,
                "2025-01-20T00:00:00.000Z",
                "2025-01-31T23:59:59.999Z"
            );

            // Assert
            expect(mockActivityRepo.list).toHaveBeenCalledTimes(1);
            expect(mockProductRepo.list).toHaveBeenCalledTimes(1);
            expect(result.period).toBe(RevenuePeriod.MONTH);
            expect(result.startDate).toBe("2025-01-20T00:00:00.000Z");
            expect(result.endDate).toBe("2025-01-31T23:59:59.999Z");
            // Only activities in range: 60.0 + 25.0 = 85.0
            expect(result.totalRevenue).toBe(85.0);
        });

        it("should calculate material costs as sum of unitCost * abs(quantity)", async () => {
            // Arrange
            const product1 = createMockProduct({
                id: productId1,
                unitCost: 10.0,
            });
            const product2 = createMockProduct({
                id: productId2,
                unitCost: 15.0,
            });
            const activities = [
                createMockActivity({
                    type: ActivityType.SALE,
                    productId: productId1,
                    quantity: -2, // 2 units sold
                    amount: 40.0,
                    date: "2025-01-20T14:00:00.000Z",
                }),
                createMockActivity({
                    type: ActivityType.SALE,
                    productId: productId2,
                    quantity: -3, // 3 units sold
                    amount: 60.0,
                    date: "2025-01-25T14:00:00.000Z",
                }),
            ];
            mockActivityRepo.list.mockResolvedValue(activities);
            mockProductRepo.list.mockResolvedValue([product1, product2]);

            // Act
            const result = await computeRevenue(
                mockActivityRepo,
                mockProductRepo,
                RevenuePeriod.MONTH,
                "2025-01-01T00:00:00.000Z",
                "2025-01-31T23:59:59.999Z"
            );

            // Assert
            // Material costs = (10.0 * 2) + (15.0 * 3) = 20.0 + 45.0 = 65.0
            expect(result.materialCosts).toBe(65.0);
        });

        it("should calculate gross margin correctly (revenue - costs)", async () => {
            // Arrange
            const product1 = createMockProduct({
                id: productId1,
                unitCost: 10.0,
            });
            const activities = [
                createMockActivity({
                    type: ActivityType.SALE,
                    productId: productId1,
                    quantity: -5,
                    amount: 100.0, // Revenue
                    date: "2025-01-20T14:00:00.000Z",
                }),
            ];
            mockActivityRepo.list.mockResolvedValue(activities);
            mockProductRepo.list.mockResolvedValue([product1]);

            // Act
            const result = await computeRevenue(
                mockActivityRepo,
                mockProductRepo,
                RevenuePeriod.MONTH,
                "2025-01-01T00:00:00.000Z",
                "2025-01-31T23:59:59.999Z"
            );

            // Assert
            // Revenue = 100.0, Material costs = 10.0 * 5 = 50.0
            // Gross margin = 100.0 - 50.0 = 50.0
            expect(result.totalRevenue).toBe(100.0);
            expect(result.materialCosts).toBe(50.0);
            expect(result.grossMargin).toBe(50.0);
        });

        it("should calculate gross margin rate correctly (percentage)", async () => {
            // Arrange
            const product1 = createMockProduct({
                id: productId1,
                unitCost: 10.0,
            });
            const activities = [
                createMockActivity({
                    type: ActivityType.SALE,
                    productId: productId1,
                    quantity: -10,
                    amount: 200.0, // Revenue
                    date: "2025-01-20T14:00:00.000Z",
                }),
            ];
            mockActivityRepo.list.mockResolvedValue(activities);
            mockProductRepo.list.mockResolvedValue([product1]);

            // Act
            const result = await computeRevenue(
                mockActivityRepo,
                mockProductRepo,
                RevenuePeriod.MONTH,
                "2025-01-01T00:00:00.000Z",
                "2025-01-31T23:59:59.999Z"
            );

            // Assert
            // Revenue = 200.0, Material costs = 10.0 * 10 = 100.0
            // Gross margin = 200.0 - 100.0 = 100.0
            // Gross margin rate = (100.0 / 200.0) * 100 = 50.0%
            expect(result.totalRevenue).toBe(200.0);
            expect(result.materialCosts).toBe(100.0);
            expect(result.grossMargin).toBe(100.0);
            expect(result.grossMarginRate).toBe(50.0);
        });

        it("should handle zero revenue (avoid division by zero)", async () => {
            // Arrange
            const activities: ReturnType<typeof createMockActivity>[] = [];
            mockActivityRepo.list.mockResolvedValue(activities);
            mockProductRepo.list.mockResolvedValue([]);

            // Act
            const result = await computeRevenue(
                mockActivityRepo,
                mockProductRepo,
                RevenuePeriod.MONTH,
                "2025-01-01T00:00:00.000Z",
                "2025-01-31T23:59:59.999Z"
            );

            // Assert
            expect(result.totalRevenue).toBe(0);
            expect(result.materialCosts).toBe(0);
            expect(result.grossMargin).toBe(0);
            expect(result.grossMarginRate).toBe(0); // Should not throw division by zero
        });

        it("should handle empty sales (return zero values)", async () => {
            // Arrange
            const activities = [
                createMockActivity({
                    type: ActivityType.CREATION,
                    productId: productId1,
                    quantity: 10,
                    amount: 50.0,
                    date: "2025-01-20T14:00:00.000Z",
                }),
            ];
            mockActivityRepo.list.mockResolvedValue(activities);
            mockProductRepo.list.mockResolvedValue([]);

            // Act
            const result = await computeRevenue(
                mockActivityRepo,
                mockProductRepo,
                RevenuePeriod.MONTH,
                "2025-01-01T00:00:00.000Z",
                "2025-01-31T23:59:59.999Z"
            );

            // Assert
            expect(result.totalRevenue).toBe(0);
            expect(result.materialCosts).toBe(0);
            expect(result.grossMargin).toBe(0);
            expect(result.grossMarginRate).toBe(0);
        });

        it("should filter activities by date range correctly", async () => {
            // Arrange
            const product1 = createMockProduct({
                id: productId1,
                unitCost: 10.0,
            });
            const activities = [
                createMockActivity({
                    type: ActivityType.SALE,
                    productId: productId1,
                    quantity: -1,
                    amount: 20.0,
                    date: "2025-01-15T14:00:00.000Z", // Before range
                }),
                createMockActivity({
                    type: ActivityType.SALE,
                    productId: productId1,
                    quantity: -2,
                    amount: 40.0,
                    date: "2025-01-20T14:00:00.000Z", // In range
                }),
                createMockActivity({
                    type: ActivityType.SALE,
                    productId: productId1,
                    quantity: -3,
                    amount: 60.0,
                    date: "2025-01-25T14:00:00.000Z", // In range
                }),
                createMockActivity({
                    type: ActivityType.SALE,
                    productId: productId1,
                    quantity: -1,
                    amount: 25.0,
                    date: "2025-02-01T14:00:00.000Z", // After range
                }),
            ];
            mockActivityRepo.list.mockResolvedValue(activities);
            mockProductRepo.list.mockResolvedValue([product1]);

            // Act
            const result = await computeRevenue(
                mockActivityRepo,
                mockProductRepo,
                RevenuePeriod.MONTH,
                "2025-01-20T00:00:00.000Z",
                "2025-01-31T23:59:59.999Z"
            );

            // Assert
            // Only activities in range: 40.0 + 60.0 = 100.0
            expect(result.totalRevenue).toBe(100.0);
            // Material costs for activities in range: (10.0 * 2) + (10.0 * 3) = 50.0
            expect(result.materialCosts).toBe(50.0);
        });

        it("should handle missing products gracefully (skip sales)", async () => {
            // Arrange
            const product1 = createMockProduct({
                id: productId1,
                unitCost: 10.0,
            });
            const activities = [
                createMockActivity({
                    type: ActivityType.SALE,
                    productId: productId1,
                    quantity: -2,
                    amount: 40.0,
                    date: "2025-01-20T14:00:00.000Z",
                }),
                createMockActivity({
                    type: ActivityType.SALE,
                    productId: productId2, // Product not in repository
                    quantity: -3,
                    amount: 60.0,
                    date: "2025-01-25T14:00:00.000Z",
                }),
            ];
            mockActivityRepo.list.mockResolvedValue(activities);
            mockProductRepo.list.mockResolvedValue([product1]); // Only product1, not product2

            // Act
            const result = await computeRevenue(
                mockActivityRepo,
                mockProductRepo,
                RevenuePeriod.MONTH,
                "2025-01-01T00:00:00.000Z",
                "2025-01-31T23:59:59.999Z"
            );

            // Assert
            // Total revenue includes all sales: 40.0 + 60.0 = 100.0
            expect(result.totalRevenue).toBe(100.0);
            // Material costs only for product1: 10.0 * 2 = 20.0 (product2 skipped)
            expect(result.materialCosts).toBe(20.0);
            expect(result.grossMargin).toBe(80.0); // 100.0 - 20.0
        });

        it("should throw validation error for invalid startDate", async () => {
            // Arrange
            mockActivityRepo.list.mockResolvedValue([]);

            // Act & Assert
            await expect(
                computeRevenue(
                    mockActivityRepo,
                    mockProductRepo,
                    RevenuePeriod.MONTH,
                    "invalid-date",
                    "2025-01-31T23:59:59.999Z"
                )
            ).rejects.toMatchObject({
                code: "VALIDATION_ERROR",
                message: "startDate must be a valid ISO 8601 string",
            });
        });

        it("should throw validation error for invalid endDate", async () => {
            // Arrange
            mockActivityRepo.list.mockResolvedValue([]);

            // Act & Assert
            await expect(
                computeRevenue(
                    mockActivityRepo,
                    mockProductRepo,
                    RevenuePeriod.MONTH,
                    "2025-01-01T00:00:00.000Z",
                    "invalid-date"
                )
            ).rejects.toMatchObject({
                code: "VALIDATION_ERROR",
                message: "endDate must be a valid ISO 8601 string",
            });
        });

        it("should propagate repository errors", async () => {
            // Arrange
            const repositoryError = new Error("Database connection failed");
            mockActivityRepo.list.mockRejectedValue(repositoryError);

            // Act & Assert
            await expect(
                computeRevenue(
                    mockActivityRepo,
                    mockProductRepo,
                    RevenuePeriod.MONTH,
                    "2025-01-01T00:00:00.000Z",
                    "2025-01-31T23:59:59.999Z"
                )
            ).rejects.toThrow("Database connection failed");
        });

        it("should handle sales with negative quantities correctly", async () => {
            // Arrange
            const product1 = createMockProduct({
                id: productId1,
                unitCost: 10.0,
            });
            const activities = [
                createMockActivity({
                    type: ActivityType.SALE,
                    productId: productId1,
                    quantity: -5, // Negative quantity (typical for sales)
                    amount: 100.0,
                    date: "2025-01-20T14:00:00.000Z",
                }),
            ];
            mockActivityRepo.list.mockResolvedValue(activities);
            mockProductRepo.list.mockResolvedValue([product1]);

            // Act
            const result = await computeRevenue(
                mockActivityRepo,
                mockProductRepo,
                RevenuePeriod.MONTH,
                "2025-01-01T00:00:00.000Z",
                "2025-01-31T23:59:59.999Z"
            );

            // Assert
            // Material costs should use absolute value: 10.0 * 5 = 50.0 (not -50.0)
            expect(result.totalRevenue).toBe(100.0);
            expect(result.materialCosts).toBe(50.0);
            expect(result.grossMargin).toBe(50.0);
        });

        it("should handle sales without productId (skip material cost calculation)", async () => {
            // Arrange
            const activities = [
                createMockActivity({
                    type: ActivityType.SALE,
                    productId: undefined, // No productId
                    quantity: -2,
                    amount: 40.0,
                    date: "2025-01-20T14:00:00.000Z",
                }),
            ];
            mockActivityRepo.list.mockResolvedValue(activities);
            mockProductRepo.list.mockResolvedValue([]);

            // Act
            const result = await computeRevenue(
                mockActivityRepo,
                mockProductRepo,
                RevenuePeriod.MONTH,
                "2025-01-01T00:00:00.000Z",
                "2025-01-31T23:59:59.999Z"
            );

            // Assert
            // Revenue includes all sales: 40.0
            expect(result.totalRevenue).toBe(40.0);
            // Material costs skipped (no productId): 0.0
            expect(result.materialCosts).toBe(0.0);
            expect(result.grossMargin).toBe(40.0);
        });
    });
});

