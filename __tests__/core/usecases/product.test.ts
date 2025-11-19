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
import {
    listLowStockProducts,
    createProduct,
    updateProduct,
    getProductById,
} from "@/core/usecases/product";
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

    describe("createProduct", () => {
        describe("successful creation", () => {
            it("should create a product with valid data", async () => {
                // Arrange
                const productData = {
                    name: "Sac banane L'Assumée",
                    type: ProductType.SAC_BANANE,
                    coloris: "Rose pâle à motifs",
                    unitCost: 10.5,
                    salePrice: 19.99,
                    stock: 100,
                };
                const createdProduct = createMockProduct({
                    ...productData,
                    id: "created-id" as ProductId,
                });
                mockRepo.create.mockResolvedValue(createdProduct);

                // Act
                const result = await createProduct(mockRepo, productData);

                // Assert
                expect(mockRepo.create).toHaveBeenCalledTimes(1);
                expect(mockRepo.create).toHaveBeenCalledWith(productData);
                expect(result).toEqual(createdProduct);
            });

            it("should return created product with generated ID", async () => {
                // Arrange
                const productData = {
                    name: "Pochette ordinateur L'Espiegle",
                    type: ProductType.POCHETTE_ORDINATEUR,
                    coloris: "Prune",
                    unitCost: 15.0,
                    salePrice: 29.99,
                    stock: 50,
                };
                const generatedId = "550e8400-e29b-41d4-a716-446655440001" as ProductId;
                const createdProduct = createMockProduct({
                    ...productData,
                    id: generatedId,
                });
                mockRepo.create.mockResolvedValue(createdProduct);

                // Act
                const result = await createProduct(mockRepo, productData);

                // Assert
                expect(result.id).toBe(generatedId);
                expect(result).toEqual(createdProduct);
            });

            it("should create a product with optional weight field", async () => {
                // Arrange
                const productData = {
                    name: "Sac banane L'Assumée",
                    type: ProductType.SAC_BANANE,
                    coloris: "Rose pâle à motifs",
                    unitCost: 10.5,
                    salePrice: 19.99,
                    stock: 100,
                    weight: 150,
                };
                const createdProduct = createMockProduct({
                    ...productData,
                    id: "created-id" as ProductId,
                });
                mockRepo.create.mockResolvedValue(createdProduct);

                // Act
                const result = await createProduct(mockRepo, productData);

                // Assert
                expect(mockRepo.create).toHaveBeenCalledTimes(1);
                expect(mockRepo.create).toHaveBeenCalledWith(productData);
                expect(result).toEqual(createdProduct);
            });

            it("should create a product without optional weight field", async () => {
                // Arrange
                const productData = {
                    name: "Sac banane L'Assumée",
                    type: ProductType.SAC_BANANE,
                    coloris: "Rose pâle à motifs",
                    unitCost: 10.5,
                    salePrice: 19.99,
                    stock: 100,
                };
                const createdProduct = createMockProduct({
                    ...productData,
                    id: "created-id" as ProductId,
                });
                mockRepo.create.mockResolvedValue(createdProduct);

                // Act
                const result = await createProduct(mockRepo, productData);

                // Assert
                expect(mockRepo.create).toHaveBeenCalledTimes(1);
                expect(mockRepo.create).toHaveBeenCalledWith(productData);
                expect(result).toEqual(createdProduct);
            });
        });

        describe("validation errors", () => {
            it("should throw error if product data is invalid", async () => {
                // Arrange
                const invalidProductData = {
                    name: "Sac banane L'Assumée",
                    type: ProductType.SAC_BANANE,
                    coloris: "Rose pâle à motifs",
                    unitCost: -10.5, // Invalid: negative unitCost
                    salePrice: 19.99,
                    stock: 100,
                };

                // Act & Assert
                await expect(createProduct(mockRepo, invalidProductData)).rejects.toThrow(
                    "Product validation failed"
                );
                expect(mockRepo.create).not.toHaveBeenCalled();
            });

            it("should throw error if unitCost is negative or zero", async () => {
                // Arrange - negative unitCost
                const invalidProductData1 = {
                    name: "Sac banane L'Assumée",
                    type: ProductType.SAC_BANANE,
                    coloris: "Rose pâle à motifs",
                    unitCost: -10.5,
                    salePrice: 19.99,
                    stock: 100,
                };

                // Act & Assert
                await expect(createProduct(mockRepo, invalidProductData1)).rejects.toThrow(
                    "Product validation failed"
                );
                expect(mockRepo.create).not.toHaveBeenCalled();

                // Arrange - zero unitCost
                const invalidProductData2 = {
                    ...invalidProductData1,
                    unitCost: 0,
                };

                // Act & Assert
                await expect(createProduct(mockRepo, invalidProductData2)).rejects.toThrow(
                    "Product validation failed"
                );
                expect(mockRepo.create).not.toHaveBeenCalled();
            });

            it("should throw error if salePrice is negative or zero", async () => {
                // Arrange - negative salePrice
                const invalidProductData1 = {
                    name: "Sac banane L'Assumée",
                    type: ProductType.SAC_BANANE,
                    coloris: "Rose pâle à motifs",
                    unitCost: 10.5,
                    salePrice: -19.99,
                    stock: 100,
                };

                // Act & Assert
                await expect(createProduct(mockRepo, invalidProductData1)).rejects.toThrow(
                    "Product validation failed"
                );
                expect(mockRepo.create).not.toHaveBeenCalled();

                // Arrange - zero salePrice
                const invalidProductData2 = {
                    ...invalidProductData1,
                    salePrice: 0,
                };

                // Act & Assert
                await expect(createProduct(mockRepo, invalidProductData2)).rejects.toThrow(
                    "Product validation failed"
                );
                expect(mockRepo.create).not.toHaveBeenCalled();
            });

            it("should throw error if stock is negative", async () => {
                // Arrange
                const invalidProductData = {
                    name: "Sac banane L'Assumée",
                    type: ProductType.SAC_BANANE,
                    coloris: "Rose pâle à motifs",
                    unitCost: 10.5,
                    salePrice: 19.99,
                    stock: -10, // Invalid: negative stock
                };

                // Act & Assert
                await expect(createProduct(mockRepo, invalidProductData)).rejects.toThrow(
                    "Product validation failed"
                );
                expect(mockRepo.create).not.toHaveBeenCalled();
            });

            it("should allow zero stock", async () => {
                // Arrange
                const productData = {
                    name: "Sac banane L'Assumée",
                    type: ProductType.SAC_BANANE,
                    coloris: "Rose pâle à motifs",
                    unitCost: 10.5,
                    salePrice: 19.99,
                    stock: 0, // Valid: zero stock is allowed
                };
                const createdProduct = createMockProduct({
                    ...productData,
                    id: "created-id" as ProductId,
                });
                mockRepo.create.mockResolvedValue(createdProduct);

                // Act
                const result = await createProduct(mockRepo, productData);

                // Assert
                expect(mockRepo.create).toHaveBeenCalledTimes(1);
                expect(result).toEqual(createdProduct);
            });

            it("should throw error if weight is provided and negative or zero", async () => {
                // Arrange - negative weight
                const invalidProductData1 = {
                    name: "Sac banane L'Assumée",
                    type: ProductType.SAC_BANANE,
                    coloris: "Rose pâle à motifs",
                    unitCost: 10.5,
                    salePrice: 19.99,
                    stock: 100,
                    weight: -150, // Invalid: negative weight
                };

                // Act & Assert
                await expect(createProduct(mockRepo, invalidProductData1)).rejects.toThrow(
                    "Product validation failed"
                );
                expect(mockRepo.create).not.toHaveBeenCalled();

                // Arrange - zero weight
                const invalidProductData2 = {
                    ...invalidProductData1,
                    weight: 0, // Invalid: zero weight
                };

                // Act & Assert
                await expect(createProduct(mockRepo, invalidProductData2)).rejects.toThrow(
                    "Product validation failed"
                );
                expect(mockRepo.create).not.toHaveBeenCalled();
            });

            it("should throw error if coloris is empty or whitespace", async () => {
                // Arrange - empty coloris
                const invalidProductData1 = {
                    name: "Sac banane L'Assumée",
                    type: ProductType.SAC_BANANE,
                    coloris: "", // Invalid: empty coloris
                    unitCost: 10.5,
                    salePrice: 19.99,
                    stock: 100,
                };

                // Act & Assert
                await expect(createProduct(mockRepo, invalidProductData1)).rejects.toThrow(
                    "Product validation failed"
                );
                expect(mockRepo.create).not.toHaveBeenCalled();

                // Arrange - whitespace-only coloris
                const invalidProductData2 = {
                    ...invalidProductData1,
                    coloris: "   ", // Invalid: whitespace-only coloris
                };

                // Act & Assert
                await expect(createProduct(mockRepo, invalidProductData2)).rejects.toThrow(
                    "Product validation failed"
                );
                expect(mockRepo.create).not.toHaveBeenCalled();
            });
        });

        describe("repository errors", () => {
            it("should propagate repository errors", async () => {
                // Arrange
                const productData = {
                    name: "Sac banane L'Assumée",
                    type: ProductType.SAC_BANANE,
                    coloris: "Rose pâle à motifs",
                    unitCost: 10.5,
                    salePrice: 19.99,
                    stock: 100,
                };
                const error = new Error("Database connection failed");
                mockRepo.create.mockRejectedValue(error);

                // Act & Assert
                await expect(createProduct(mockRepo, productData)).rejects.toThrow(
                    "Database connection failed"
                );
                expect(mockRepo.create).toHaveBeenCalledTimes(1);
            });

            it("should propagate repository constraint violation errors", async () => {
                // Arrange
                const productData = {
                    name: "Sac banane L'Assumée",
                    type: ProductType.SAC_BANANE,
                    coloris: "Rose pâle à motifs",
                    unitCost: 10.5,
                    salePrice: 19.99,
                    stock: 100,
                };
                const error = new Error("Unique constraint violation: product already exists");
                mockRepo.create.mockRejectedValue(error);

                // Act & Assert
                await expect(createProduct(mockRepo, productData)).rejects.toThrow(
                    "Unique constraint violation: product already exists"
                );
                expect(mockRepo.create).toHaveBeenCalledTimes(1);
            });
        });
    });

    describe("getProductById", () => {
        const productId = "550e8400-e29b-41d4-a716-446655440000" as ProductId;

        describe("successful retrieval", () => {
            it("should retrieve a product with valid ID", async () => {
                // Arrange
                const product = createMockProduct({
                    id: productId,
                    name: "Sac banane L'Assumée",
                    type: ProductType.SAC_BANANE,
                    coloris: "Rose pâle à motifs",
                    unitCost: 10.5,
                    salePrice: 19.99,
                    stock: 100,
                });
                mockRepo.getById.mockResolvedValue(product);

                // Act
                const result = await getProductById(mockRepo, productId);

                // Assert
                expect(mockRepo.getById).toHaveBeenCalledTimes(1);
                expect(mockRepo.getById).toHaveBeenCalledWith(productId);
                expect(result).toEqual(product);
            });

            it("should return product with all fields", async () => {
                // Arrange
                const product = createMockProduct({
                    id: productId,
                    name: "Pochette ordinateur L'Espiegle",
                    type: ProductType.POCHETTE_ORDINATEUR,
                    coloris: "Prune",
                    unitCost: 15.0,
                    salePrice: 29.99,
                    stock: 50,
                    weight: 200,
                });
                mockRepo.getById.mockResolvedValue(product);

                // Act
                const result = await getProductById(mockRepo, productId);

                // Assert
                expect(result.id).toBe(productId);
                expect(result.name).toBe("Pochette ordinateur L'Espiegle");
                expect(result.type).toBe(ProductType.POCHETTE_ORDINATEUR);
                expect(result.coloris).toBe("Prune");
                expect(result.unitCost).toBe(15.0);
                expect(result.salePrice).toBe(29.99);
                expect(result.stock).toBe(50);
                expect(result.weight).toBe(200);
            });

            it("should return product without optional weight field", async () => {
                // Arrange
                const product = createMockProduct({
                    id: productId,
                    name: "Sac banane L'Assumée",
                    type: ProductType.SAC_BANANE,
                    coloris: "Rose pâle à motifs",
                    unitCost: 10.5,
                    salePrice: 19.99,
                    stock: 100,
                    weight: undefined,
                });
                mockRepo.getById.mockResolvedValue(product);

                // Act
                const result = await getProductById(mockRepo, productId);

                // Assert
                expect(result.weight).toBeUndefined();
                expect(result).toEqual(product);
            });
        });

        describe("product not found", () => {
            it("should throw error if product does not exist", async () => {
                // Arrange
                mockRepo.getById.mockResolvedValue(null);

                // Act & Assert
                await expect(getProductById(mockRepo, productId)).rejects.toThrow(
                    `Product with id ${productId} not found`
                );
                expect(mockRepo.getById).toHaveBeenCalledTimes(1);
                expect(mockRepo.getById).toHaveBeenCalledWith(productId);
            });

            it("should throw descriptive error message with product ID", async () => {
                // Arrange
                const nonExistentId = "999e9999-e99b-99d9-a999-999999999999" as ProductId;
                mockRepo.getById.mockResolvedValue(null);

                // Act & Assert
                await expect(getProductById(mockRepo, nonExistentId)).rejects.toThrow(
                    `Product with id ${nonExistentId} not found`
                );
            });
        });

        describe("repository errors", () => {
            it("should propagate repository errors", async () => {
                // Arrange
                const error = new Error("Database connection failed");
                mockRepo.getById.mockRejectedValue(error);

                // Act & Assert
                await expect(getProductById(mockRepo, productId)).rejects.toThrow(
                    "Database connection failed"
                );
                expect(mockRepo.getById).toHaveBeenCalledTimes(1);
                expect(mockRepo.getById).toHaveBeenCalledWith(productId);
            });

            it("should propagate repository query errors", async () => {
                // Arrange
                const error = new Error("Query execution failed: invalid SQL syntax");
                mockRepo.getById.mockRejectedValue(error);

                // Act & Assert
                await expect(getProductById(mockRepo, productId)).rejects.toThrow(
                    "Query execution failed: invalid SQL syntax"
                );
                expect(mockRepo.getById).toHaveBeenCalledTimes(1);
            });
        });
    });

    describe("updateProduct", () => {
        const productId = "550e8400-e29b-41d4-a716-446655440000" as ProductId;

        describe("successful update", () => {
            it("should update a product with valid updates", async () => {
                // Arrange
                const existingProduct = createMockProduct({
                    id: productId,
                    name: "Sac banane L'Assumée",
                    type: ProductType.SAC_BANANE,
                    coloris: "Rose pâle à motifs",
                    unitCost: 10.5,
                    salePrice: 19.99,
                    stock: 100,
                });
                const updates = {
                    salePrice: 24.99,
                    stock: 150,
                };
                const updatedProduct = createMockProduct({
                    ...existingProduct,
                    ...updates,
                });
                mockRepo.getById.mockResolvedValue(existingProduct);
                mockRepo.update.mockResolvedValue(updatedProduct);

                // Act
                const result = await updateProduct(mockRepo, productId, updates);

                // Assert
                expect(mockRepo.getById).toHaveBeenCalledTimes(1);
                expect(mockRepo.getById).toHaveBeenCalledWith(productId);
                expect(mockRepo.update).toHaveBeenCalledTimes(1);
                expect(mockRepo.update).toHaveBeenCalledWith(productId, updates);
                expect(result).toEqual(updatedProduct);
            });

            it("should return updated product", async () => {
                // Arrange
                const existingProduct = createMockProduct({
                    id: productId,
                    name: "Pochette ordinateur L'Espiegle",
                    type: ProductType.POCHETTE_ORDINATEUR,
                    coloris: "Prune",
                    unitCost: 15.0,
                    salePrice: 29.99,
                    stock: 50,
                });
                const updates = {
                    name: "Pochette ordinateur L'Espiegle - Updated",
                    salePrice: 34.99,
                };
                const updatedProduct = createMockProduct({
                    ...existingProduct,
                    ...updates,
                });
                mockRepo.getById.mockResolvedValue(existingProduct);
                mockRepo.update.mockResolvedValue(updatedProduct);

                // Act
                const result = await updateProduct(mockRepo, productId, updates);

                // Assert
                expect(result).toEqual(updatedProduct);
                expect(result.name).toBe(updates.name);
                expect(result.salePrice).toBe(updates.salePrice);
            });

            it("should allow partial updates (only some fields)", async () => {
                // Arrange
                const existingProduct = createMockProduct({
                    id: productId,
                    name: "Sac banane L'Assumée",
                    type: ProductType.SAC_BANANE,
                    coloris: "Rose pâle à motifs",
                    unitCost: 10.5,
                    salePrice: 19.99,
                    stock: 100,
                });
                const updates = {
                    stock: 200, // Only updating stock
                };
                const updatedProduct = createMockProduct({
                    ...existingProduct,
                    ...updates,
                });
                mockRepo.getById.mockResolvedValue(existingProduct);
                mockRepo.update.mockResolvedValue(updatedProduct);

                // Act
                const result = await updateProduct(mockRepo, productId, updates);

                // Assert
                expect(mockRepo.update).toHaveBeenCalledWith(productId, updates);
                expect(result.stock).toBe(200);
                expect(result.name).toBe(existingProduct.name); // Unchanged
                expect(result.salePrice).toBe(existingProduct.salePrice); // Unchanged
            });

            it("should update product with weight field", async () => {
                // Arrange
                const existingProduct = createMockProduct({
                    id: productId,
                    weight: 150,
                });
                const updates = {
                    weight: 200,
                };
                const updatedProduct = createMockProduct({
                    ...existingProduct,
                    ...updates,
                });
                mockRepo.getById.mockResolvedValue(existingProduct);
                mockRepo.update.mockResolvedValue(updatedProduct);

                // Act
                const result = await updateProduct(mockRepo, productId, updates);

                // Assert
                expect(result.weight).toBe(200);
            });

            it("should update product by removing weight field (setting to undefined)", async () => {
                // Arrange
                const existingProduct = createMockProduct({
                    id: productId,
                    weight: 150,
                });
                const updates = {
                    weight: undefined,
                };
                const updatedProduct = createMockProduct({
                    ...existingProduct,
                    weight: undefined,
                });
                mockRepo.getById.mockResolvedValue(existingProduct);
                mockRepo.update.mockResolvedValue(updatedProduct);

                // Act
                const result = await updateProduct(mockRepo, productId, updates);

                // Assert
                expect(result.weight).toBeUndefined();
            });
        });

        describe("product not found", () => {
            it("should throw error if product does not exist", async () => {
                // Arrange
                mockRepo.getById.mockResolvedValue(null);

                // Act & Assert
                await expect(
                    updateProduct(mockRepo, productId, { salePrice: 24.99 })
                ).rejects.toThrow(`Product with id ${productId} not found`);
                expect(mockRepo.getById).toHaveBeenCalledTimes(1);
                expect(mockRepo.getById).toHaveBeenCalledWith(productId);
                expect(mockRepo.update).not.toHaveBeenCalled();
            });
        });

        describe("validation errors", () => {
            it("should throw error if merged product data is invalid", async () => {
                // Arrange
                const existingProduct = createMockProduct({
                    id: productId,
                    unitCost: 10.5,
                    salePrice: 19.99,
                    stock: 100,
                });
                const updates = {
                    unitCost: -10.5, // Invalid: negative unitCost
                };
                mockRepo.getById.mockResolvedValue(existingProduct);

                // Act & Assert
                await expect(updateProduct(mockRepo, productId, updates)).rejects.toThrow(
                    "Product validation failed"
                );
                expect(mockRepo.getById).toHaveBeenCalledTimes(1);
                expect(mockRepo.update).not.toHaveBeenCalled();
            });

            it("should throw error if unitCost update is negative or zero", async () => {
                // Arrange
                const existingProduct = createMockProduct({
                    id: productId,
                    unitCost: 10.5,
                });
                mockRepo.getById.mockResolvedValue(existingProduct);

                // Test negative unitCost
                const updates1 = {
                    unitCost: -10.5,
                };

                // Act & Assert
                await expect(updateProduct(mockRepo, productId, updates1)).rejects.toThrow(
                    "Product validation failed"
                );
                expect(mockRepo.update).not.toHaveBeenCalled();

                // Test zero unitCost
                const updates2 = {
                    unitCost: 0,
                };

                // Act & Assert
                await expect(updateProduct(mockRepo, productId, updates2)).rejects.toThrow(
                    "Product validation failed"
                );
                expect(mockRepo.update).not.toHaveBeenCalled();
            });

            it("should throw error if salePrice update is negative or zero", async () => {
                // Arrange
                const existingProduct = createMockProduct({
                    id: productId,
                    salePrice: 19.99,
                });
                mockRepo.getById.mockResolvedValue(existingProduct);

                // Test negative salePrice
                const updates1 = {
                    salePrice: -19.99,
                };

                // Act & Assert
                await expect(updateProduct(mockRepo, productId, updates1)).rejects.toThrow(
                    "Product validation failed"
                );
                expect(mockRepo.update).not.toHaveBeenCalled();

                // Test zero salePrice
                const updates2 = {
                    salePrice: 0,
                };

                // Act & Assert
                await expect(updateProduct(mockRepo, productId, updates2)).rejects.toThrow(
                    "Product validation failed"
                );
                expect(mockRepo.update).not.toHaveBeenCalled();
            });

            it("should throw error if stock update is negative", async () => {
                // Arrange
                const existingProduct = createMockProduct({
                    id: productId,
                    stock: 100,
                });
                const updates = {
                    stock: -10, // Invalid: negative stock
                };
                mockRepo.getById.mockResolvedValue(existingProduct);

                // Act & Assert
                await expect(updateProduct(mockRepo, productId, updates)).rejects.toThrow(
                    "Product validation failed"
                );
                expect(mockRepo.getById).toHaveBeenCalledTimes(1);
                expect(mockRepo.update).not.toHaveBeenCalled();
            });

            it("should allow zero stock update", async () => {
                // Arrange
                const existingProduct = createMockProduct({
                    id: productId,
                    stock: 100,
                });
                const updates = {
                    stock: 0, // Valid: zero stock is allowed
                };
                const updatedProduct = createMockProduct({
                    ...existingProduct,
                    ...updates,
                });
                mockRepo.getById.mockResolvedValue(existingProduct);
                mockRepo.update.mockResolvedValue(updatedProduct);

                // Act
                const result = await updateProduct(mockRepo, productId, updates);

                // Assert
                expect(mockRepo.update).toHaveBeenCalledTimes(1);
                expect(result.stock).toBe(0);
            });

            it("should throw error if weight update is provided and negative or zero", async () => {
                // Arrange
                const existingProduct = createMockProduct({
                    id: productId,
                    weight: 150,
                });
                mockRepo.getById.mockResolvedValue(existingProduct);

                // Test negative weight
                const updates1 = {
                    weight: -150,
                };

                // Act & Assert
                await expect(updateProduct(mockRepo, productId, updates1)).rejects.toThrow(
                    "Product validation failed"
                );
                expect(mockRepo.update).not.toHaveBeenCalled();

                // Test zero weight
                const updates2 = {
                    weight: 0,
                };

                // Act & Assert
                await expect(updateProduct(mockRepo, productId, updates2)).rejects.toThrow(
                    "Product validation failed"
                );
                expect(mockRepo.update).not.toHaveBeenCalled();
            });

            it("should throw error if coloris update is empty or whitespace", async () => {
                // Arrange
                const existingProduct = createMockProduct({
                    id: productId,
                    coloris: "Rose pâle à motifs",
                });
                mockRepo.getById.mockResolvedValue(existingProduct);

                // Test empty coloris
                const updates1 = {
                    coloris: "",
                };

                // Act & Assert
                await expect(updateProduct(mockRepo, productId, updates1)).rejects.toThrow(
                    "Product validation failed"
                );
                expect(mockRepo.update).not.toHaveBeenCalled();

                // Test whitespace-only coloris
                const updates2 = {
                    coloris: "   ",
                };

                // Act & Assert
                await expect(updateProduct(mockRepo, productId, updates2)).rejects.toThrow(
                    "Product validation failed"
                );
                expect(mockRepo.update).not.toHaveBeenCalled();
            });
        });

        describe("repository errors", () => {
            it("should propagate repository errors", async () => {
                // Arrange
                const existingProduct = createMockProduct({
                    id: productId,
                });
                const updates = {
                    salePrice: 24.99,
                };
                mockRepo.getById.mockResolvedValue(existingProduct);
                const error = new Error("Database connection failed");
                mockRepo.update.mockRejectedValue(error);

                // Act & Assert
                await expect(updateProduct(mockRepo, productId, updates)).rejects.toThrow(
                    "Database connection failed"
                );
                expect(mockRepo.getById).toHaveBeenCalledTimes(1);
                expect(mockRepo.update).toHaveBeenCalledTimes(1);
            });

            it("should propagate repository constraint violation errors", async () => {
                // Arrange
                const existingProduct = createMockProduct({
                    id: productId,
                });
                const updates = {
                    name: "New name",
                };
                mockRepo.getById.mockResolvedValue(existingProduct);
                const error = new Error("Unique constraint violation: product name already exists");
                mockRepo.update.mockRejectedValue(error);

                // Act & Assert
                await expect(updateProduct(mockRepo, productId, updates)).rejects.toThrow(
                    "Unique constraint violation: product name already exists"
                );
                expect(mockRepo.getById).toHaveBeenCalledTimes(1);
                expect(mockRepo.update).toHaveBeenCalledTimes(1);
            });

            it("should propagate repository error when getById fails", async () => {
                // Arrange
                const error = new Error("Database connection failed");
                mockRepo.getById.mockRejectedValue(error);

                // Act & Assert
                await expect(
                    updateProduct(mockRepo, productId, { salePrice: 24.99 })
                ).rejects.toThrow("Database connection failed");
                expect(mockRepo.getById).toHaveBeenCalledTimes(1);
                expect(mockRepo.update).not.toHaveBeenCalled();
            });
        });
    });
});

