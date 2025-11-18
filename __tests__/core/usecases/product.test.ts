/**
 * Usecases Tests - Product
 *
 * Tests for product usecases to ensure business logic orchestration,
 * validation, error handling, and repository delegation work correctly.
 *
 * These tests verify:
 * - Business logic validation
 * - Repository delegation with proper parameters
 * - Error handling and transformation
 * - Success paths with valid inputs
 * - Edge cases and invalid inputs
 */

import type { ProductRepository } from "@/core/ports/productRepository";
import { listLowStockProducts } from "@/core/usecases/product";
import { createMockProduct } from "../../../__mocks__/core/domain/product";
import { createMockProductRepository } from "../../../__mocks__/core/ports/productRepository";
import type { ProductId } from "@/core/domain/product";
import { ProductType } from "@/core/domain/product";

describe("Product Usecases", () => {
    let mockRepo: jest.Mocked<ProductRepository>;

    beforeEach(() => {
        jest.clearAllMocks();
        mockRepo = createMockProductRepository();
    });

    describe("listLowStockProducts", () => {
        const productId1 = "550e8400-e29b-41d4-a716-446655440000" as ProductId;
        const productId2 = "660e8400-e29b-41d4-a716-446655440001" as ProductId;
        const productId3 = "770e8400-e29b-41d4-a716-446655440002" as ProductId;

        it("should return empty array when no products below threshold", async () => {
            // Arrange
            const products = [
                createMockProduct({
                    id: productId1,
                    stock: 10,
                }),
                createMockProduct({
                    id: productId2,
                    stock: 15,
                }),
                createMockProduct({
                    id: productId3,
                    stock: 20,
                }),
            ];
            mockRepo.list.mockResolvedValue(products);

            // Act
            const result = await listLowStockProducts(mockRepo, 5);

            // Assert
            expect(result).toEqual([]);
            expect(mockRepo.list).toHaveBeenCalledTimes(1);
        });

        it("should filter products with stock < threshold", async () => {
            // Arrange
            const products = [
                createMockProduct({
                    id: productId1,
                    stock: 3, // Below threshold
                }),
                createMockProduct({
                    id: productId2,
                    stock: 10, // Above threshold
                }),
                createMockProduct({
                    id: productId3,
                    stock: 2, // Below threshold
                }),
            ];
            mockRepo.list.mockResolvedValue(products);

            // Act
            const result = await listLowStockProducts(mockRepo, 5);

            // Assert
            expect(result).toHaveLength(2);
            expect(result[0].id).toBe(productId1);
            expect(result[1].id).toBe(productId3);
            expect(mockRepo.list).toHaveBeenCalledTimes(1);
        });

        it("should use default threshold of 5 if not provided", async () => {
            // Arrange
            const products = [
                createMockProduct({
                    id: productId1,
                    stock: 3, // Below default threshold (5)
                }),
                createMockProduct({
                    id: productId2,
                    stock: 5, // Equal to threshold (should be excluded)
                }),
                createMockProduct({
                    id: productId3,
                    stock: 4, // Below default threshold (5)
                }),
            ];
            mockRepo.list.mockResolvedValue(products);

            // Act
            const result = await listLowStockProducts(mockRepo);

            // Assert
            expect(result).toHaveLength(2);
            expect(result[0].id).toBe(productId1);
            expect(result[1].id).toBe(productId3);
            expect(mockRepo.list).toHaveBeenCalledTimes(1);
        });

        it("should use custom threshold when provided", async () => {
            // Arrange
            const products = [
                createMockProduct({
                    id: productId1,
                    stock: 8, // Below custom threshold (10)
                }),
                createMockProduct({
                    id: productId2,
                    stock: 12, // Above custom threshold (10)
                }),
                createMockProduct({
                    id: productId3,
                    stock: 9, // Below custom threshold (10)
                }),
            ];
            mockRepo.list.mockResolvedValue(products);

            // Act
            const result = await listLowStockProducts(mockRepo, 10);

            // Assert
            expect(result).toHaveLength(2);
            expect(result[0].id).toBe(productId1);
            expect(result[1].id).toBe(productId3);
            expect(mockRepo.list).toHaveBeenCalledTimes(1);
        });

        it("should return all matching products", async () => {
            // Arrange
            const products = [
                createMockProduct({
                    id: productId1,
                    name: "Product 1",
                    stock: 1,
                }),
                createMockProduct({
                    id: productId2,
                    name: "Product 2",
                    stock: 2,
                }),
                createMockProduct({
                    id: productId3,
                    name: "Product 3",
                    stock: 3,
                }),
            ];
            mockRepo.list.mockResolvedValue(products);

            // Act
            const result = await listLowStockProducts(mockRepo, 5);

            // Assert
            expect(result).toHaveLength(3);
            expect(result[0].name).toBe("Product 1");
            expect(result[1].name).toBe("Product 2");
            expect(result[2].name).toBe("Product 3");
            expect(mockRepo.list).toHaveBeenCalledTimes(1);
        });

        it("should handle empty product list", async () => {
            // Arrange
            mockRepo.list.mockResolvedValue([]);

            // Act
            const result = await listLowStockProducts(mockRepo);

            // Assert
            expect(result).toEqual([]);
            expect(mockRepo.list).toHaveBeenCalledTimes(1);
        });

        it("should exclude products with stock equal to threshold", async () => {
            // Arrange
            const products = [
                createMockProduct({
                    id: productId1,
                    stock: 4, // Below threshold (5)
                }),
                createMockProduct({
                    id: productId2,
                    stock: 5, // Equal to threshold (should be excluded)
                }),
                createMockProduct({
                    id: productId3,
                    stock: 6, // Above threshold (should be excluded)
                }),
            ];
            mockRepo.list.mockResolvedValue(products);

            // Act
            const result = await listLowStockProducts(mockRepo, 5);

            // Assert
            expect(result).toHaveLength(1);
            expect(result[0].id).toBe(productId1);
            expect(mockRepo.list).toHaveBeenCalledTimes(1);
        });

        it("should handle products with zero stock", async () => {
            // Arrange
            const products = [
                createMockProduct({
                    id: productId1,
                    stock: 0, // Zero stock (below threshold)
                }),
                createMockProduct({
                    id: productId2,
                    stock: 3, // Below threshold
                }),
            ];
            mockRepo.list.mockResolvedValue(products);

            // Act
            const result = await listLowStockProducts(mockRepo, 5);

            // Assert
            expect(result).toHaveLength(2);
            expect(result[0].id).toBe(productId1);
            expect(result[1].id).toBe(productId2);
            expect(mockRepo.list).toHaveBeenCalledTimes(1);
        });

        it("should propagate repository error when retrieval fails", async () => {
            // Arrange
            const error = new Error("Database connection failed");
            mockRepo.list.mockRejectedValue(error);

            // Act & Assert
            await expect(listLowStockProducts(mockRepo)).rejects.toThrow(
                "Database connection failed"
            );
            expect(mockRepo.list).toHaveBeenCalledTimes(1);
        });
    });
});

