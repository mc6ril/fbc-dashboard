/**
 * ProductRepository Port Interface Tests
 *
 * Tests for ProductRepository interface to ensure:
 * - Interface is properly defined and can be imported
 * - Mock implementations can be created that satisfy the interface contract
 * - Method signatures match expected contracts (type-checking)
 *
 * Since ports are TypeScript interfaces (contracts only), these tests focus on
 * type-checking and verifying that mock implementations can be created for usecase tests.
 */

import type { ProductRepository } from "@/core/ports/productRepository";
import type { Product, ProductId } from "@/core/domain/product";
import { ProductType } from "@/core/domain/product";
import { createMockProductRepository } from "../../../__mocks__/core/ports/productRepository";

describe("ProductRepository Interface", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("Interface contract", () => {
        it("should be importable as a type", () => {
            // Type-check: ensure interface can be imported
            const repo: ProductRepository = createMockProductRepository();
            expect(repo).toBeDefined();
        });

        it("should define list() method returning Promise<Product[]>", () => {
            // Type-check: ensure method signature exists
            const mockRepo = createMockProductRepository();
            mockRepo.list.mockResolvedValue([]);
            const result: Promise<Product[]> = mockRepo.list();
            expect(mockRepo.list).toBeDefined();
            expect(result).toBeInstanceOf(Promise);
        });

        it("should define getById() method with ProductId parameter", () => {
            // Type-check: ensure method signature exists
            const mockRepo = createMockProductRepository();
            mockRepo.getById.mockResolvedValue(null);
            const id = "test-id" as ProductId;
            const result: Promise<Product | null> = mockRepo.getById(id);
            expect(mockRepo.getById).toBeDefined();
            expect(result).toBeInstanceOf(Promise);
        });

        it("should define create() method accepting Omit<Product, 'id'>", () => {
            // Type-check: ensure method signature exists
            const mockRepo = createMockProductRepository();
            const productData: Omit<Product, "id"> = {
                name: "Test Product",
                type: ProductType.SAC_BANANE,
                coloris: "Rose",
                unitCost: 50,
                salePrice: 100,
                stock: 10,
            };
            mockRepo.create.mockResolvedValue({
                ...productData,
                id: "test-id" as ProductId,
            });
            const result: Promise<Product> = mockRepo.create(productData);
            expect(mockRepo.create).toBeDefined();
            expect(result).toBeInstanceOf(Promise);
        });

        it("should define update() method with id and Partial<Product>", () => {
            // Type-check: ensure method signature exists
            const mockRepo = createMockProductRepository();
            const id = "test-id" as ProductId;
            const updates: Partial<Product> = {
                stock: 20,
            };
            mockRepo.update.mockResolvedValue({
                id,
                name: "Test Product",
                type: ProductType.SAC_BANANE,
                coloris: "Rose",
                unitCost: 50,
                salePrice: 100,
                stock: 20,
            });
            const result: Promise<Product> = mockRepo.update(id, updates);
            expect(mockRepo.update).toBeDefined();
            expect(result).toBeInstanceOf(Promise);
        });

        it("should allow mock implementation for usecase tests", () => {
            // Verify a mock can be created that satisfies the interface
            const mockRepo = createMockProductRepository();

            // Verify all methods exist
            expect(mockRepo.list).toBeDefined();
            expect(mockRepo.getById).toBeDefined();
            expect(mockRepo.create).toBeDefined();
            expect(mockRepo.update).toBeDefined();

            // Verify methods are Jest mock functions
            expect(jest.isMockFunction(mockRepo.list)).toBe(true);
            expect(jest.isMockFunction(mockRepo.getById)).toBe(true);
            expect(jest.isMockFunction(mockRepo.create)).toBe(true);
            expect(jest.isMockFunction(mockRepo.update)).toBe(true);
        });

        it("should allow configuring mock return values", async () => {
            // Verify mocks can be configured for testing
            const mockRepo = createMockProductRepository();
            const mockProduct: Product = {
                id: "product-1" as ProductId,
                name: "Test Product",
                type: ProductType.SAC_BANANE,
                coloris: "Rose",
                unitCost: 50,
                salePrice: 100,
                stock: 10,
            };

            mockRepo.list.mockResolvedValue([mockProduct]);
            mockRepo.getById.mockResolvedValue(mockProduct);
            mockRepo.create.mockResolvedValue(mockProduct);
            mockRepo.update.mockResolvedValue(mockProduct);

            const listResult = await mockRepo.list();
            const getByIdResult = await mockRepo.getById("test-id" as ProductId);
            const createResult = await mockRepo.create({
                name: "Test Product",
                type: ProductType.SAC_BANANE,
                coloris: "Rose",
                unitCost: 50,
                salePrice: 100,
                stock: 10,
            });
            const updateResult = await mockRepo.update("test-id" as ProductId, {
                stock: 20,
            });

            expect(listResult).toEqual([mockProduct]);
            expect(getByIdResult).toEqual(mockProduct);
            expect(createResult).toEqual(mockProduct);
            expect(updateResult).toEqual(mockProduct);
        });

        it("should allow configuring mock to return null for getById", async () => {
            // Verify getById can return null for non-existent products
            const mockRepo = createMockProductRepository();
            mockRepo.getById.mockResolvedValue(null);

            const result = await mockRepo.getById("non-existent" as ProductId);
            expect(result).toBeNull();
        });

        it("should allow configuring mock to throw errors", async () => {
            // Verify mocks can throw errors for error path testing
            const mockRepo = createMockProductRepository();
            const error = new Error("Database connection error");

            mockRepo.list.mockRejectedValue(error);
            mockRepo.getById.mockRejectedValue(error);
            mockRepo.create.mockRejectedValue(error);
            mockRepo.update.mockRejectedValue(error);

            await expect(mockRepo.list()).rejects.toThrow("Database connection error");
            await expect(mockRepo.getById("test-id" as ProductId)).rejects.toThrow(
                "Database connection error"
            );
            await expect(
                mockRepo.create({
                    name: "Test Product",
                    type: ProductType.SAC_BANANE,
                    coloris: "Rose",
                    unitCost: 50,
                    salePrice: 100,
                    stock: 10,
                })
            ).rejects.toThrow("Database connection error");
            await expect(
                mockRepo.update("test-id" as ProductId, { stock: 20 })
            ).rejects.toThrow("Database connection error");
        });
    });
});

