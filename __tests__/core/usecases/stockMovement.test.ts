/**
 * Usecases Tests - Stock Movement
 *
 * Tests for stock movement usecases to ensure business logic orchestration,
 * validation, error handling, and repository delegation work correctly.
 *
 * These tests verify:
 * - Business logic validation (productId requirements, quantity validation, source validation)
 * - Repository delegation with proper parameters
 * - Error handling and transformation
 * - Success paths with valid inputs
 * - Edge cases and invalid inputs
 */

import type { StockMovementRepository } from "@/core/ports/stockMovementRepository";
import type { StockMovement, StockMovementId } from "@/core/domain/stockMovement";
import { StockMovementSource } from "@/core/domain/stockMovement";
import {
    createStockMovement,
    listStockMovements,
    listStockMovementsByProduct,
} from "@/core/usecases/stockMovement";
import { createMockStockMovement } from "../../../__mocks__/core/domain/stockMovement";
import { createMockStockMovementRepository } from "../../../__mocks__/core/ports/stockMovementRepository";
import type { ProductId } from "@/core/domain/product";

describe("Stock Movement Usecases", () => {
    let mockRepo: jest.Mocked<StockMovementRepository>;

    beforeEach(() => {
        jest.clearAllMocks();
        mockRepo = createMockStockMovementRepository();
    });

    describe("createStockMovement", () => {
        it("should create stock movement with valid data", async () => {
            // Arrange
            const newMovement = createMockStockMovement({
                id: undefined as unknown as StockMovementId,
            });
            const generatedId = "123e4567-e89b-4d3a-a456-426614174000" as StockMovementId;

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id: _id, ...movementWithoutId } = newMovement;

            mockRepo.create.mockResolvedValue({
                ...movementWithoutId,
                id: generatedId,
            });

            // Act
            const result = await createStockMovement(mockRepo, movementWithoutId);

            // Assert
            expect(result.id).toBe(generatedId);
            expect(mockRepo.create).toHaveBeenCalledWith(movementWithoutId);
            expect(mockRepo.create).toHaveBeenCalledTimes(1);
        });

        it("should validate productId is provided", async () => {
            // Arrange
            // Create movement without productId (can't use mock helper as it always provides productId)
            const movementWithoutId = {
                quantity: 10,
                source: StockMovementSource.CREATION,
                // productId is intentionally missing
            } as Omit<StockMovement, "id">;

            // Act & Assert
            await expect(createStockMovement(mockRepo, movementWithoutId)).rejects.toThrow(
                "productId is required for stock movement"
            );
            expect(mockRepo.create).not.toHaveBeenCalled();
        });

        it("should validate quantity is non-zero", async () => {
            // Arrange
            const movementWithoutId: Omit<StockMovement, "id"> = {
                productId: "550e8400-e29b-41d4-a716-446655440000" as ProductId,
                quantity: 0, // Invalid: must be non-zero
                source: StockMovementSource.CREATION,
            };

            // Act & Assert
            await expect(createStockMovement(mockRepo, movementWithoutId)).rejects.toThrow(
                "quantity must be non-zero"
            );
            expect(mockRepo.create).not.toHaveBeenCalled();
        });

        it("should validate quantity is a valid number (not NaN)", async () => {
            // Arrange
            const movementWithoutId: Omit<StockMovement, "id"> = {
                productId: "550e8400-e29b-41d4-a716-446655440000" as ProductId,
                quantity: NaN, // Invalid: must be a valid number
                source: StockMovementSource.CREATION,
            };

            // Act & Assert
            await expect(createStockMovement(mockRepo, movementWithoutId)).rejects.toThrow(
                "quantity must be a valid number"
            );
            expect(mockRepo.create).not.toHaveBeenCalled();
        });

        it("should validate quantity is a finite number (not Infinity)", async () => {
            // Arrange
            const movementWithoutId: Omit<StockMovement, "id"> = {
                productId: "550e8400-e29b-41d4-a716-446655440000" as ProductId,
                quantity: Number.POSITIVE_INFINITY, // Invalid: must be finite
                source: StockMovementSource.CREATION,
            };

            // Act & Assert
            await expect(createStockMovement(mockRepo, movementWithoutId)).rejects.toThrow(
                "quantity must be a finite number"
            );
            expect(mockRepo.create).not.toHaveBeenCalled();
        });

        // Note: Source validation is tested indirectly through domain validation
        // TypeScript prevents invalid sources at compile time, and domain validation
        // ensures quantity/source combinations are valid

        it("should handle all valid source types", async () => {
            // Arrange
            const sources = [
                StockMovementSource.CREATION,
                StockMovementSource.SALE,
                StockMovementSource.INVENTORY_ADJUSTMENT,
            ];

            for (const source of sources) {
                jest.clearAllMocks();

                const newMovement = createMockStockMovement({
                    source,
                    quantity: source === StockMovementSource.SALE ? -5 : 10,
                });

                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { id: _id, ...movementWithoutId } = newMovement;
                const generatedId = "123e4567-e89b-4d3a-a456-426614174000" as StockMovementId;

                mockRepo.create.mockResolvedValue({
                    ...movementWithoutId,
                    id: generatedId,
                });

                // Act
                const result = await createStockMovement(mockRepo, movementWithoutId);

                // Assert
                expect(result.source).toBe(source);
                expect(mockRepo.create).toHaveBeenCalledWith(movementWithoutId);
            }
        });

        // Note: Domain validation (quantity sign matching source) is tested in domain layer tests
        // The usecase calls isValidStockMovement which validates quantity/source combinations
        // This validation ensures CREATION has positive quantity, SALE has negative quantity, etc.

        it("should propagate repository errors", async () => {
            // Arrange
            const newMovement = createMockStockMovement();
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id: _id, ...movementWithoutId } = newMovement;

            const repositoryError = new Error("Database connection error");
            mockRepo.create.mockRejectedValue(repositoryError);

            // Act & Assert
            await expect(createStockMovement(mockRepo, movementWithoutId)).rejects.toThrow(
                "Database connection error"
            );
            expect(mockRepo.create).toHaveBeenCalledWith(movementWithoutId);
        });

        it("should throw StockMovementError with VALIDATION_ERROR code", async () => {
            // Arrange
            const newMovement = createMockStockMovement({
                productId: undefined as unknown as ProductId,
            });

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id: _id, ...movementWithoutId } = newMovement;

            // Act & Assert
            try {
                await createStockMovement(mockRepo, movementWithoutId);
                fail("Expected error to be thrown");
            } catch (error) {
                expect(error).toHaveProperty("code", "VALIDATION_ERROR");
                expect(error).toHaveProperty("message");
            }
        });
    });

    describe("listStockMovements", () => {
        it("should return all stock movements from repository", async () => {
            // Arrange
            const mockMovements = [
                createMockStockMovement({
                    id: "123e4567-e89b-4d3a-a456-426614174000" as StockMovementId,
                }),
                createMockStockMovement({
                    id: "223e4567-e89b-4d3a-a456-426614174001" as StockMovementId,
                }),
            ];

            mockRepo.list.mockResolvedValue(mockMovements);

            // Act
            const result = await listStockMovements(mockRepo);

            // Assert
            expect(result).toEqual(mockMovements);
            expect(mockRepo.list).toHaveBeenCalledTimes(1);
        });

        it("should return empty array when no movements exist", async () => {
            // Arrange
            mockRepo.list.mockResolvedValue([]);

            // Act
            const result = await listStockMovements(mockRepo);

            // Assert
            expect(result).toEqual([]);
            expect(mockRepo.list).toHaveBeenCalledTimes(1);
        });

        it("should propagate repository errors", async () => {
            // Arrange
            const repositoryError = new Error("Database connection error");
            mockRepo.list.mockRejectedValue(repositoryError);

            // Act & Assert
            await expect(listStockMovements(mockRepo)).rejects.toThrow(
                "Database connection error"
            );
        });
    });

    describe("listStockMovementsByProduct", () => {
        it("should return stock movements for specific product", async () => {
            // Arrange
            const productId = "550e8400-e29b-41d4-a716-446655440000" as ProductId;
            const mockMovements = [
                createMockStockMovement({
                    id: "123e4567-e89b-4d3a-a456-426614174000" as StockMovementId,
                    productId,
                }),
                createMockStockMovement({
                    id: "223e4567-e89b-4d3a-a456-426614174001" as StockMovementId,
                    productId,
                }),
            ];

            mockRepo.listByProduct.mockResolvedValue(mockMovements);

            // Act
            const result = await listStockMovementsByProduct(mockRepo, productId);

            // Assert
            expect(result).toEqual(mockMovements);
            expect(mockRepo.listByProduct).toHaveBeenCalledWith(productId);
            expect(mockRepo.listByProduct).toHaveBeenCalledTimes(1);
        });

        it("should return empty array when no movements exist for product", async () => {
            // Arrange
            const productId = "550e8400-e29b-41d4-a716-446655440000" as ProductId;
            mockRepo.listByProduct.mockResolvedValue([]);

            // Act
            const result = await listStockMovementsByProduct(mockRepo, productId);

            // Assert
            expect(result).toEqual([]);
            expect(mockRepo.listByProduct).toHaveBeenCalledWith(productId);
        });

        it("should propagate repository errors", async () => {
            // Arrange
            const productId = "550e8400-e29b-41d4-a716-446655440000" as ProductId;
            const repositoryError = new Error("Database connection error");
            mockRepo.listByProduct.mockRejectedValue(repositoryError);

            // Act & Assert
            await expect(
                listStockMovementsByProduct(mockRepo, productId)
            ).rejects.toThrow("Database connection error");
        });
    });
});

