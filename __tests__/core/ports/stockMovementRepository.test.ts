/**
 * StockMovementRepository Port Interface Tests
 *
 * Tests for StockMovementRepository interface to ensure:
 * - Interface is properly defined and can be imported
 * - Mock implementations can be created that satisfy the interface contract
 * - Method signatures match expected contracts (type-checking)
 *
 * Since ports are TypeScript interfaces (contracts only), these tests focus on
 * type-checking and verifying that mock implementations can be created for usecase tests.
 */

import type { StockMovementRepository } from "@/core/ports/stockMovementRepository";
import type { StockMovement, StockMovementId } from "@/core/domain/stockMovement";
import type { ProductId } from "@/core/domain/product";
import { StockMovementSource } from "@/core/domain/stockMovement";
import { createMockStockMovementRepository } from "../../../__mocks__/core/ports/stockMovementRepository";

describe("StockMovementRepository Interface", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("Interface contract", () => {
        it("should be importable as a type", () => {
            // Type-check: ensure interface can be imported
            const repo: StockMovementRepository = createMockStockMovementRepository();
            expect(repo).toBeDefined();
        });

        it("should define list() method returning Promise<StockMovement[]>", () => {
            // Type-check: ensure method signature exists
            const mockRepo = createMockStockMovementRepository();
            mockRepo.list.mockResolvedValue([]);
            const result: Promise<StockMovement[]> = mockRepo.list();
            expect(mockRepo.list).toBeDefined();
            expect(result).toBeInstanceOf(Promise);
        });

        it("should define getById() method with StockMovementId parameter", () => {
            // Type-check: ensure method signature exists
            const mockRepo = createMockStockMovementRepository();
            mockRepo.getById.mockResolvedValue(null);
            const id = "test-id" as StockMovementId;
            const result: Promise<StockMovement | null> = mockRepo.getById(id);
            expect(mockRepo.getById).toBeDefined();
            expect(result).toBeInstanceOf(Promise);
        });

        it("should define listByProduct() method with ProductId parameter", () => {
            // Type-check: ensure method signature exists
            const mockRepo = createMockStockMovementRepository();
            mockRepo.listByProduct.mockResolvedValue([]);
            const productId = "product-1" as ProductId;
            const result: Promise<StockMovement[]> = mockRepo.listByProduct(productId);
            expect(mockRepo.listByProduct).toBeDefined();
            expect(result).toBeInstanceOf(Promise);
        });

        it("should define create() method accepting Omit<StockMovement, 'id'>", () => {
            // Type-check: ensure method signature exists
            const mockRepo = createMockStockMovementRepository();
            const movementData: Omit<StockMovement, "id"> = {
                productId: "product-1" as ProductId,
                quantity: 10,
                source: StockMovementSource.CREATION,
            };
            mockRepo.create.mockResolvedValue({
                ...movementData,
                id: "test-id" as StockMovementId,
            });
            const result: Promise<StockMovement> = mockRepo.create(movementData);
            expect(mockRepo.create).toBeDefined();
            expect(result).toBeInstanceOf(Promise);
        });

        it("should allow mock implementation for usecase tests", () => {
            // Verify a mock can be created that satisfies the interface
            const mockRepo = createMockStockMovementRepository();

            // Verify all methods exist
            expect(mockRepo.list).toBeDefined();
            expect(mockRepo.getById).toBeDefined();
            expect(mockRepo.listByProduct).toBeDefined();
            expect(mockRepo.create).toBeDefined();

            // Verify methods are Jest mock functions
            expect(jest.isMockFunction(mockRepo.list)).toBe(true);
            expect(jest.isMockFunction(mockRepo.getById)).toBe(true);
            expect(jest.isMockFunction(mockRepo.listByProduct)).toBe(true);
            expect(jest.isMockFunction(mockRepo.create)).toBe(true);
        });

        it("should allow configuring mock return values", async () => {
            // Verify mocks can be configured for testing
            const mockRepo = createMockStockMovementRepository();
            const productId = "product-1" as ProductId;
            const mockMovement: StockMovement = {
                id: "movement-1" as StockMovementId,
                productId,
                quantity: 10,
                source: StockMovementSource.CREATION,
            };

            mockRepo.list.mockResolvedValue([mockMovement]);
            mockRepo.getById.mockResolvedValue(mockMovement);
            mockRepo.listByProduct.mockResolvedValue([mockMovement]);
            mockRepo.create.mockResolvedValue(mockMovement);

            const listResult = await mockRepo.list();
            const getByIdResult = await mockRepo.getById("test-id" as StockMovementId);
            const listByProductResult = await mockRepo.listByProduct(productId);
            const createResult = await mockRepo.create({
                productId,
                quantity: 10,
                source: StockMovementSource.CREATION,
            });

            expect(listResult).toEqual([mockMovement]);
            expect(getByIdResult).toEqual(mockMovement);
            expect(listByProductResult).toEqual([mockMovement]);
            expect(createResult).toEqual(mockMovement);
        });

        it("should allow configuring mock to return null for getById", async () => {
            // Verify getById can return null for non-existent movements
            const mockRepo = createMockStockMovementRepository();
            mockRepo.getById.mockResolvedValue(null);

            const result = await mockRepo.getById("non-existent" as StockMovementId);
            expect(result).toBeNull();
        });

        it("should allow configuring mock to return empty array for listByProduct", async () => {
            // Verify listByProduct can return empty array for products with no movements
            const mockRepo = createMockStockMovementRepository();
            const productId = "product-1" as ProductId;
            mockRepo.listByProduct.mockResolvedValue([]);

            const result = await mockRepo.listByProduct(productId);
            expect(result).toEqual([]);
        });

        it("should allow configuring mock to throw errors", async () => {
            // Verify mocks can throw errors for error path testing
            const mockRepo = createMockStockMovementRepository();
            const error = new Error("Database connection error");
            const productId = "product-1" as ProductId;

            mockRepo.list.mockRejectedValue(error);
            mockRepo.getById.mockRejectedValue(error);
            mockRepo.listByProduct.mockRejectedValue(error);
            mockRepo.create.mockRejectedValue(error);

            await expect(mockRepo.list()).rejects.toThrow("Database connection error");
            await expect(
                mockRepo.getById("test-id" as StockMovementId)
            ).rejects.toThrow("Database connection error");
            await expect(mockRepo.listByProduct(productId)).rejects.toThrow(
                "Database connection error"
            );
            await expect(
                mockRepo.create({
                    productId,
                    quantity: 10,
                    source: StockMovementSource.CREATION,
                })
            ).rejects.toThrow("Database connection error");
        });

        it("should support listByProduct for stock calculations", async () => {
            // Verify listByProduct is critical for stock calculations
            const mockRepo = createMockStockMovementRepository();
            const productId = "product-1" as ProductId;
            const movements: StockMovement[] = [
                {
                    id: "movement-1" as StockMovementId,
                    productId,
                    quantity: 10,
                    source: StockMovementSource.CREATION,
                },
                {
                    id: "movement-2" as StockMovementId,
                    productId,
                    quantity: -5,
                    source: StockMovementSource.SALE,
                },
            ];

            mockRepo.listByProduct.mockResolvedValue(movements);

            const result = await mockRepo.listByProduct(productId);
            expect(result).toEqual(movements);
            expect(mockRepo.listByProduct).toHaveBeenCalledWith(productId);
        });
    });
});

