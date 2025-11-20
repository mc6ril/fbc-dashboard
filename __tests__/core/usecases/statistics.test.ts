/**
 * Usecases Tests - Statistics
 *
 * Tests for statistics usecases to ensure business logic aggregation,
 * date filtering, period grouping, and error handling work correctly.
 *
 * These tests verify:
 * - Period grouping (daily, monthly, yearly)
 * - Date range filtering
 * - Profit and margin calculations
 * - Edge cases (empty data, missing products, invalid dates)
 * - Sorting and aggregation logic
 */

import type { ActivityRepository } from "@/core/ports/activityRepository";
import type { ProductRepository } from "@/core/ports/productRepository";
import {
    computeProfitsByPeriod,
    computeTotalCreations,
    computeProductMargins,
    computeBusinessStatistics,
} from "@/core/usecases/statistics";
import { StatisticsPeriod } from "@/core/domain/statistics";
import { ActivityType } from "@/core/domain/activity";
import { createMockActivity } from "../../../__mocks__/core/domain/activity";
import { createMockProduct } from "../../../__mocks__/core/domain/product";
import { createMockActivityRepository } from "../../../__mocks__/core/ports/activityRepository";
import { createMockProductRepository } from "../../../__mocks__/core/ports/productRepository";
import type { ProductId } from "@/core/domain/product";

describe("Statistics Usecases", () => {
    let mockActivityRepo: jest.Mocked<ActivityRepository>;
    let mockProductRepo: jest.Mocked<ProductRepository>;

    beforeEach(() => {
        jest.clearAllMocks();
        mockActivityRepo = createMockActivityRepository();
        mockProductRepo = createMockProductRepository();
    });

    describe("computeProfitsByPeriod", () => {
        const productId1 = "550e8400-e29b-41d4-a716-446655440000" as ProductId;
        const productId2 = "660e8400-e29b-41d4-a716-446655440001" as ProductId;

        it("should group profits by daily period correctly", async () => {
            // Arrange
            const product1 = createMockProduct({
                id: productId1,
                salePrice: 20.0,
                unitCost: 10.0,
            });
            const sale1 = createMockActivity({
                type: ActivityType.SALE,
                productId: productId1,
                date: "2025-01-01T10:00:00.000Z",
                quantity: -2,
                amount: 40.0,
            });
            const sale2 = createMockActivity({
                type: ActivityType.SALE,
                productId: productId1,
                date: "2025-01-02T10:00:00.000Z",
                quantity: -3,
                amount: 60.0,
            });
            const creation = createMockActivity({
                type: ActivityType.CREATION,
                date: "2025-01-01T08:00:00.000Z",
                quantity: 5,
                amount: 0,
            });

            mockActivityRepo.list.mockResolvedValue([sale1, sale2, creation]);
            mockProductRepo.list.mockResolvedValue([product1]);

            // Act
            const result = await computeProfitsByPeriod(
                mockActivityRepo,
                mockProductRepo,
                StatisticsPeriod.DAILY
            );

            // Assert
            expect(result).toHaveLength(2);
            expect(result[0]).toEqual({
                period: "2025-01-01",
                profit: 20.0, // (20 - 10) * 2
                totalSales: 40.0,
                totalCreations: 1,
            });
            expect(result[1]).toEqual({
                period: "2025-01-02",
                profit: 30.0, // (20 - 10) * 3
                totalSales: 60.0,
                totalCreations: 0,
            });
            expect(mockActivityRepo.list).toHaveBeenCalledTimes(1);
            expect(mockProductRepo.list).toHaveBeenCalledTimes(1);
        });

        it("should group profits by monthly period correctly", async () => {
            // Arrange
            const product1 = createMockProduct({
                id: productId1,
                salePrice: 20.0,
                unitCost: 10.0,
            });
            const sale1 = createMockActivity({
                type: ActivityType.SALE,
                productId: productId1,
                date: "2025-01-15T10:00:00.000Z",
                quantity: -2,
                amount: 40.0,
            });
            const sale2 = createMockActivity({
                type: ActivityType.SALE,
                productId: productId1,
                date: "2025-02-10T10:00:00.000Z",
                quantity: -3,
                amount: 60.0,
            });

            mockActivityRepo.list.mockResolvedValue([sale1, sale2]);
            mockProductRepo.list.mockResolvedValue([product1]);

            // Act
            const result = await computeProfitsByPeriod(
                mockActivityRepo,
                mockProductRepo,
                StatisticsPeriod.MONTHLY
            );

            // Assert
            expect(result).toHaveLength(2);
            expect(result[0]).toEqual({
                period: "2025-01",
                profit: 20.0,
                totalSales: 40.0,
                totalCreations: 0,
            });
            expect(result[1]).toEqual({
                period: "2025-02",
                profit: 30.0,
                totalSales: 60.0,
                totalCreations: 0,
            });
        });

        it("should group profits by yearly period correctly", async () => {
            // Arrange
            const product1 = createMockProduct({
                id: productId1,
                salePrice: 20.0,
                unitCost: 10.0,
            });
            const sale1 = createMockActivity({
                type: ActivityType.SALE,
                productId: productId1,
                date: "2025-01-15T10:00:00.000Z",
                quantity: -2,
                amount: 40.0,
            });
            const sale2 = createMockActivity({
                type: ActivityType.SALE,
                productId: productId1,
                date: "2025-06-10T10:00:00.000Z",
                quantity: -3,
                amount: 60.0,
            });

            mockActivityRepo.list.mockResolvedValue([sale1, sale2]);
            mockProductRepo.list.mockResolvedValue([product1]);

            // Act
            const result = await computeProfitsByPeriod(
                mockActivityRepo,
                mockProductRepo,
                StatisticsPeriod.YEARLY
            );

            // Assert
            expect(result).toHaveLength(1);
            expect(result[0]).toEqual({
                period: "2025",
                profit: 50.0, // 20 + 30
                totalSales: 100.0, // 40 + 60
                totalCreations: 0,
            });
        });

        it("should filter by date range correctly", async () => {
            // Arrange
            const product1 = createMockProduct({
                id: productId1,
                salePrice: 20.0,
                unitCost: 10.0,
            });
            const sale1 = createMockActivity({
                type: ActivityType.SALE,
                productId: productId1,
                date: "2025-01-15T10:00:00.000Z",
                quantity: -2,
                amount: 40.0,
            });
            const sale2 = createMockActivity({
                type: ActivityType.SALE,
                productId: productId1,
                date: "2025-02-10T10:00:00.000Z",
                quantity: -3,
                amount: 60.0,
            });

            mockActivityRepo.list.mockResolvedValue([sale1, sale2]);
            mockProductRepo.list.mockResolvedValue([product1]);

            // Act
            const result = await computeProfitsByPeriod(
                mockActivityRepo,
                mockProductRepo,
                StatisticsPeriod.DAILY,
                "2025-01-01T00:00:00.000Z",
                "2025-01-31T23:59:59.999Z"
            );

            // Assert
            expect(result).toHaveLength(1);
            expect(result[0].period).toBe("2025-01-15");
        });

        it("should return empty array when no SALE activities exist", async () => {
            // Arrange
            mockActivityRepo.list.mockResolvedValue([]);
            mockProductRepo.list.mockResolvedValue([]);

            // Act
            const result = await computeProfitsByPeriod(
                mockActivityRepo,
                mockProductRepo,
                StatisticsPeriod.DAILY
            );

            // Assert
            expect(result).toEqual([]);
        });

        it("should filter out sales with missing products gracefully", async () => {
            // Arrange
            const product1 = createMockProduct({
                id: productId1,
                salePrice: 20.0,
                unitCost: 10.0,
            });
            const sale1 = createMockActivity({
                type: ActivityType.SALE,
                productId: productId1,
                date: "2025-01-01T10:00:00.000Z",
                quantity: -2,
                amount: 40.0,
            });
            const sale2 = createMockActivity({
                type: ActivityType.SALE,
                productId: productId2, // Product doesn't exist
                date: "2025-01-02T10:00:00.000Z",
                quantity: -3,
                amount: 60.0,
            });

            mockActivityRepo.list.mockResolvedValue([sale1, sale2]);
            mockProductRepo.list.mockResolvedValue([product1]); // Only product1 exists

            // Act
            const result = await computeProfitsByPeriod(
                mockActivityRepo,
                mockProductRepo,
                StatisticsPeriod.DAILY
            );

            // Assert
            expect(result).toHaveLength(1);
            expect(result[0].period).toBe("2025-01-01");
            expect(result[0].profit).toBe(20.0); // Only sale1 counted
        });

        it("should throw validation error for invalid startDate", async () => {
            // Arrange
            mockActivityRepo.list.mockResolvedValue([]);

            // Act & Assert
            await expect(
                computeProfitsByPeriod(
                    mockActivityRepo,
                    mockProductRepo,
                    StatisticsPeriod.DAILY,
                    "invalid-date"
                )
            ).rejects.toThrow("Validation Error: startDate must be a valid ISO 8601 string");
        });

        it("should throw validation error for invalid endDate", async () => {
            // Arrange
            mockActivityRepo.list.mockResolvedValue([]);

            // Act & Assert
            await expect(
                computeProfitsByPeriod(
                    mockActivityRepo,
                    mockProductRepo,
                    StatisticsPeriod.DAILY,
                    undefined,
                    "invalid-date"
                )
            ).rejects.toThrow("Validation Error: endDate must be a valid ISO 8601 string");
        });

        it("should handle multiple products correctly", async () => {
            // Arrange
            const product1 = createMockProduct({
                id: productId1,
                salePrice: 20.0,
                unitCost: 10.0,
            });
            const product2 = createMockProduct({
                id: productId2,
                salePrice: 30.0,
                unitCost: 15.0,
            });
            const sale1 = createMockActivity({
                type: ActivityType.SALE,
                productId: productId1,
                date: "2025-01-01T10:00:00.000Z",
                quantity: -2,
                amount: 40.0,
            });
            const sale2 = createMockActivity({
                type: ActivityType.SALE,
                productId: productId2,
                date: "2025-01-01T11:00:00.000Z",
                quantity: -1,
                amount: 30.0,
            });

            mockActivityRepo.list.mockResolvedValue([sale1, sale2]);
            mockProductRepo.list.mockResolvedValue([product1, product2]);

            // Act
            const result = await computeProfitsByPeriod(
                mockActivityRepo,
                mockProductRepo,
                StatisticsPeriod.DAILY
            );

            // Assert
            expect(result).toHaveLength(1);
            expect(result[0].profit).toBe(35.0); // 20 (product1) + 15 (product2)
            expect(result[0].totalSales).toBe(70.0); // 40 + 30
        });

        it("should sort results by period ascending", async () => {
            // Arrange
            const product1 = createMockProduct({
                id: productId1,
                salePrice: 20.0,
                unitCost: 10.0,
            });
            const sale1 = createMockActivity({
                type: ActivityType.SALE,
                productId: productId1,
                date: "2025-01-03T10:00:00.000Z",
                quantity: -2,
                amount: 40.0,
            });
            const sale2 = createMockActivity({
                type: ActivityType.SALE,
                productId: productId1,
                date: "2025-01-01T10:00:00.000Z",
                quantity: -3,
                amount: 60.0,
            });

            mockActivityRepo.list.mockResolvedValue([sale1, sale2]);
            mockProductRepo.list.mockResolvedValue([product1]);

            // Act
            const result = await computeProfitsByPeriod(
                mockActivityRepo,
                mockProductRepo,
                StatisticsPeriod.DAILY
            );

            // Assert
            expect(result).toHaveLength(2);
            expect(result[0].period).toBe("2025-01-01");
            expect(result[1].period).toBe("2025-01-03");
        });
    });

    describe("computeTotalCreations", () => {
        it("should count CREATION activities correctly", async () => {
            // Arrange
            const creation1 = createMockActivity({
                type: ActivityType.CREATION,
                date: "2025-01-01T10:00:00.000Z",
                quantity: 10,
            });
            const creation2 = createMockActivity({
                type: ActivityType.CREATION,
                date: "2025-01-02T10:00:00.000Z",
                quantity: 5,
            });
            const sale = createMockActivity({
                type: ActivityType.SALE,
                date: "2025-01-03T10:00:00.000Z",
                quantity: -2,
            });

            mockActivityRepo.list.mockResolvedValue([creation1, creation2, sale]);

            // Act
            const result = await computeTotalCreations(mockActivityRepo);

            // Assert
            expect(result).toBe(2);
            expect(mockActivityRepo.list).toHaveBeenCalledTimes(1);
        });

        it("should filter by date range correctly", async () => {
            // Arrange
            const creation1 = createMockActivity({
                type: ActivityType.CREATION,
                date: "2025-01-15T10:00:00.000Z",
                quantity: 10,
            });
            const creation2 = createMockActivity({
                type: ActivityType.CREATION,
                date: "2025-02-10T10:00:00.000Z",
                quantity: 5,
            });

            mockActivityRepo.list.mockResolvedValue([creation1, creation2]);

            // Act
            const result = await computeTotalCreations(
                mockActivityRepo,
                "2025-01-01T00:00:00.000Z",
                "2025-01-31T23:59:59.999Z"
            );

            // Assert
            expect(result).toBe(1);
        });

        it("should return 0 when no CREATION activities exist", async () => {
            // Arrange
            mockActivityRepo.list.mockResolvedValue([]);

            // Act
            const result = await computeTotalCreations(mockActivityRepo);

            // Assert
            expect(result).toBe(0);
        });

        it("should throw validation error for invalid startDate", async () => {
            // Arrange
            mockActivityRepo.list.mockResolvedValue([]);

            // Act & Assert
            await expect(
                computeTotalCreations(mockActivityRepo, "invalid-date")
            ).rejects.toThrow("Validation Error: startDate must be a valid ISO 8601 string");
        });

        it("should throw validation error for invalid endDate", async () => {
            // Arrange
            mockActivityRepo.list.mockResolvedValue([]);

            // Act & Assert
            await expect(
                computeTotalCreations(mockActivityRepo, undefined, "invalid-date")
            ).rejects.toThrow("Validation Error: endDate must be a valid ISO 8601 string");
        });
    });

    describe("computeProductMargins", () => {
        const productId1 = "550e8400-e29b-41d4-a716-446655440000" as ProductId;
        const productId2 = "660e8400-e29b-41d4-a716-446655440001" as ProductId;

        it("should calculate profit margins correctly", async () => {
            // Arrange
            const product1 = createMockProduct({
                id: productId1,
                salePrice: 20.0,
                unitCost: 10.0,
            });
            const sale1 = createMockActivity({
                type: ActivityType.SALE,
                productId: productId1,
                date: "2025-01-01T10:00:00.000Z",
                quantity: -2,
                amount: 40.0,
            });
            const sale2 = createMockActivity({
                type: ActivityType.SALE,
                productId: productId1,
                date: "2025-01-02T10:00:00.000Z",
                quantity: -3,
                amount: 60.0,
            });

            mockActivityRepo.list.mockResolvedValue([sale1, sale2]);
            mockProductRepo.list.mockResolvedValue([product1]);

            // Act
            const result = await computeProductMargins(mockActivityRepo, mockProductRepo);

            // Assert
            expect(result).toHaveLength(1);
            expect(result[0]).toEqual({
                productId: productId1,
                salesCount: 2,
                totalRevenue: 100.0, // 40 + 60
                totalCost: 50.0, // 10 * 2 + 10 * 3
                profit: 50.0, // 100 - 50
                marginPercentage: 50.0, // (50 / 100) * 100
            });
        });

        it("should protect against zero-division when revenue is 0", async () => {
            // Arrange
            const product1 = createMockProduct({
                id: productId1,
                salePrice: 20.0,
                unitCost: 10.0,
            });
            const sale1 = createMockActivity({
                type: ActivityType.SALE,
                productId: productId1,
                date: "2025-01-01T10:00:00.000Z",
                quantity: -1,
                amount: 0.0, // Zero revenue
            });

            mockActivityRepo.list.mockResolvedValue([sale1]);
            mockProductRepo.list.mockResolvedValue([product1]);

            // Act
            const result = await computeProductMargins(mockActivityRepo, mockProductRepo);

            // Assert
            expect(result).toHaveLength(1);
            expect(result[0].marginPercentage).toBe(0); // Protected from division by zero
        });

        it("should sort results by profit descending", async () => {
            // Arrange
            const product1 = createMockProduct({
                id: productId1,
                salePrice: 20.0,
                unitCost: 10.0,
            });
            const product2 = createMockProduct({
                id: productId2,
                salePrice: 30.0,
                unitCost: 15.0,
            });
            const sale1 = createMockActivity({
                type: ActivityType.SALE,
                productId: productId1,
                date: "2025-01-01T10:00:00.000Z",
                quantity: -2,
                amount: 40.0,
            });
            const sale2 = createMockActivity({
                type: ActivityType.SALE,
                productId: productId2,
                date: "2025-01-02T10:00:00.000Z",
                quantity: -1,
                amount: 30.0,
            });

            mockActivityRepo.list.mockResolvedValue([sale1, sale2]);
            mockProductRepo.list.mockResolvedValue([product1, product2]);

            // Act
            const result = await computeProductMargins(mockActivityRepo, mockProductRepo);

            // Assert
            expect(result).toHaveLength(2);
            // product2 should come first (profit: 15) > product1 (profit: 20)
            expect(result[0].productId).toBe(productId1); // 20 > 15
            expect(result[1].productId).toBe(productId2);
        });

        it("should handle multiple products correctly", async () => {
            // Arrange
            const product1 = createMockProduct({
                id: productId1,
                salePrice: 20.0,
                unitCost: 10.0,
            });
            const product2 = createMockProduct({
                id: productId2,
                salePrice: 30.0,
                unitCost: 15.0,
            });
            const sale1 = createMockActivity({
                type: ActivityType.SALE,
                productId: productId1,
                date: "2025-01-01T10:00:00.000Z",
                quantity: -1,
                amount: 20.0,
            });
            const sale2 = createMockActivity({
                type: ActivityType.SALE,
                productId: productId2,
                date: "2025-01-02T10:00:00.000Z",
                quantity: -1,
                amount: 30.0,
            });

            mockActivityRepo.list.mockResolvedValue([sale1, sale2]);
            mockProductRepo.list.mockResolvedValue([product1, product2]);

            // Act
            const result = await computeProductMargins(mockActivityRepo, mockProductRepo);

            // Assert
            expect(result).toHaveLength(2);
            expect(result[0].salesCount).toBe(1);
            expect(result[1].salesCount).toBe(1);
        });

        it("should filter out sales with missing products gracefully", async () => {
            // Arrange
            const product1 = createMockProduct({
                id: productId1,
                salePrice: 20.0,
                unitCost: 10.0,
            });
            const sale1 = createMockActivity({
                type: ActivityType.SALE,
                productId: productId1,
                date: "2025-01-01T10:00:00.000Z",
                quantity: -1,
                amount: 20.0,
            });
            const sale2 = createMockActivity({
                type: ActivityType.SALE,
                productId: productId2, // Product doesn't exist
                date: "2025-01-02T10:00:00.000Z",
                quantity: -1,
                amount: 30.0,
            });

            mockActivityRepo.list.mockResolvedValue([sale1, sale2]);
            mockProductRepo.list.mockResolvedValue([product1]); // Only product1 exists

            // Act
            const result = await computeProductMargins(mockActivityRepo, mockProductRepo);

            // Assert
            expect(result).toHaveLength(1);
            expect(result[0].productId).toBe(productId1);
        });

        it("should return empty array when no SALE activities exist", async () => {
            // Arrange
            mockActivityRepo.list.mockResolvedValue([]);
            mockProductRepo.list.mockResolvedValue([]);

            // Act
            const result = await computeProductMargins(mockActivityRepo, mockProductRepo);

            // Assert
            expect(result).toEqual([]);
        });

        it("should filter by date range correctly", async () => {
            // Arrange
            const product1 = createMockProduct({
                id: productId1,
                salePrice: 20.0,
                unitCost: 10.0,
            });
            const sale1 = createMockActivity({
                type: ActivityType.SALE,
                productId: productId1,
                date: "2025-01-15T10:00:00.000Z",
                quantity: -1,
                amount: 20.0,
            });
            const sale2 = createMockActivity({
                type: ActivityType.SALE,
                productId: productId1,
                date: "2025-02-10T10:00:00.000Z",
                quantity: -1,
                amount: 20.0,
            });

            mockActivityRepo.list.mockResolvedValue([sale1, sale2]);
            mockProductRepo.list.mockResolvedValue([product1]);

            // Act
            const result = await computeProductMargins(
                mockActivityRepo,
                mockProductRepo,
                "2025-01-01T00:00:00.000Z",
                "2025-01-31T23:59:59.999Z"
            );

            // Assert
            expect(result).toHaveLength(1);
            expect(result[0].salesCount).toBe(1); // Only sale1 in range
        });
    });

    describe("computeBusinessStatistics", () => {
        const productId1 = "550e8400-e29b-41d4-a716-446655440000" as ProductId;
        const productId2 = "660e8400-e29b-41d4-a716-446655440001" as ProductId;

        it("should compute comprehensive business statistics correctly", async () => {
            // Arrange
            const product1 = createMockProduct({
                id: productId1,
                salePrice: 20.0,
                unitCost: 10.0,
            });
            const sale1 = createMockActivity({
                type: ActivityType.SALE,
                productId: productId1,
                date: "2025-01-01T10:00:00.000Z",
                quantity: -2,
                amount: 40.0,
            });
            const creation1 = createMockActivity({
                type: ActivityType.CREATION,
                date: "2025-01-01T08:00:00.000Z",
                quantity: 10,
                amount: 0,
            });

            mockActivityRepo.list.mockResolvedValue([sale1, creation1]);
            mockProductRepo.list.mockResolvedValue([product1]);

            // Act
            const result = await computeBusinessStatistics(
                mockActivityRepo,
                mockProductRepo
            );

            // Assert
            expect(result).toEqual({
                startDate: undefined,
                endDate: undefined,
                totalProfit: 20.0, // (20 - 10) * 2
                totalSales: 40.0,
                totalCreations: 1,
                productMargins: [
                    {
                        productId: productId1,
                        salesCount: 1,
                        totalRevenue: 40.0,
                        totalCost: 20.0,
                        profit: 20.0,
                        marginPercentage: 50.0,
                    },
                ],
            });
        });

        it("should include date range in result", async () => {
            // Arrange
            mockActivityRepo.list.mockResolvedValue([]);
            mockProductRepo.list.mockResolvedValue([]);

            // Act
            const result = await computeBusinessStatistics(
                mockActivityRepo,
                mockProductRepo,
                "2025-01-01T00:00:00.000Z",
                "2025-01-31T23:59:59.999Z"
            );

            // Assert
            expect(result.startDate).toBe("2025-01-01T00:00:00.000Z");
            expect(result.endDate).toBe("2025-01-31T23:59:59.999Z");
        });

        it("should sort product margins by profit descending", async () => {
            // Arrange
            const product1 = createMockProduct({
                id: productId1,
                salePrice: 20.0,
                unitCost: 10.0,
            });
            const product2 = createMockProduct({
                id: productId2,
                salePrice: 30.0,
                unitCost: 15.0,
            });
            const sale1 = createMockActivity({
                type: ActivityType.SALE,
                productId: productId1,
                date: "2025-01-01T10:00:00.000Z",
                quantity: -2,
                amount: 40.0,
            });
            const sale2 = createMockActivity({
                type: ActivityType.SALE,
                productId: productId2,
                date: "2025-01-02T10:00:00.000Z",
                quantity: -1,
                amount: 30.0,
            });

            mockActivityRepo.list.mockResolvedValue([sale1, sale2]);
            mockProductRepo.list.mockResolvedValue([product1, product2]);

            // Act
            const result = await computeBusinessStatistics(
                mockActivityRepo,
                mockProductRepo
            );

            // Assert
            expect(result.productMargins).toHaveLength(2);
            // product1 should come first (profit: 20) > product2 (profit: 15)
            expect(result.productMargins[0].productId).toBe(productId1);
            expect(result.productMargins[1].productId).toBe(productId2);
        });

        it("should handle empty activity list", async () => {
            // Arrange
            mockActivityRepo.list.mockResolvedValue([]);
            mockProductRepo.list.mockResolvedValue([]);

            // Act
            const result = await computeBusinessStatistics(
                mockActivityRepo,
                mockProductRepo
            );

            // Assert
            expect(result).toEqual({
                startDate: undefined,
                endDate: undefined,
                totalProfit: 0,
                totalSales: 0,
                totalCreations: 0,
                productMargins: [],
            });
        });

        it("should filter out sales with missing products gracefully", async () => {
            // Arrange
            const product1 = createMockProduct({
                id: productId1,
                salePrice: 20.0,
                unitCost: 10.0,
            });
            const sale1 = createMockActivity({
                type: ActivityType.SALE,
                productId: productId1,
                date: "2025-01-01T10:00:00.000Z",
                quantity: -1,
                amount: 20.0,
            });
            const sale2 = createMockActivity({
                type: ActivityType.SALE,
                productId: productId2, // Product doesn't exist
                date: "2025-01-02T10:00:00.000Z",
                quantity: -1,
                amount: 30.0,
            });

            mockActivityRepo.list.mockResolvedValue([sale1, sale2]);
            mockProductRepo.list.mockResolvedValue([product1]); // Only product1 exists

            // Act
            const result = await computeBusinessStatistics(
                mockActivityRepo,
                mockProductRepo
            );

            // Assert
            expect(result.totalProfit).toBe(10.0); // Only sale1 counted
            expect(result.totalSales).toBe(20.0); // Only sale1 counted
            expect(result.productMargins).toHaveLength(1);
        });

        it("should throw validation error for invalid startDate", async () => {
            // Arrange
            mockActivityRepo.list.mockResolvedValue([]);

            // Act & Assert
            await expect(
                computeBusinessStatistics(mockActivityRepo, mockProductRepo, "invalid-date")
            ).rejects.toThrow("Validation Error: startDate must be a valid ISO 8601 string");
        });

        it("should throw validation error for invalid endDate", async () => {
            // Arrange
            mockActivityRepo.list.mockResolvedValue([]);

            // Act & Assert
            await expect(
                computeBusinessStatistics(
                    mockActivityRepo,
                    mockProductRepo,
                    undefined,
                    "invalid-date"
                )
            ).rejects.toThrow("Validation Error: endDate must be a valid ISO 8601 string");
        });
    });
});

