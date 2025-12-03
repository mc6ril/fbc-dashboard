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
    listProductModelsByType,
    listProductColorisByModel,
    getProductModel,
    getProductColoris,
} from "@/core/usecases/product";
import {
    createMockProduct,
    createMockProductModel,
    createMockProductColoris,
} from "../../../__mocks__/core/domain/product";
import { createMockProductRepository } from "../../../__mocks__/core/ports/productRepository";
import type {
    ProductId,
    ProductModelId,
    ProductColorisId,
} from "@/core/domain/product";
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

        describe("model/coloris validation (new structure)", () => {
            const charlieModelId = "660e8400-e29b-41d4-a716-446655440001" as ProductModelId;
            const assumeeModelId = "770e8400-e29b-41d4-a716-446655440003" as ProductModelId;
            const roseColorisId = "770e8400-e29b-41d4-a716-446655440002" as ProductColorisId;
            const pruneColorisId = "880e8400-e29b-41d4-a716-446655440004" as ProductColorisId;

            it("should create product with valid model/coloris combination", async () => {
                // Arrange
                const productData = {
                    modelId: charlieModelId,
                    colorisId: roseColorisId,
                    unitCost: 10.5,
                    salePrice: 19.99,
                    stock: 100,
                };
                const coloris = createMockProductColoris({
                    id: roseColorisId,
                    modelId: charlieModelId,
                    coloris: "Rose Marsala",
                });
                const createdProduct = createMockProduct({
                    ...productData,
                    id: "created-id" as ProductId,
                });
                mockRepo.getColorisById.mockResolvedValue(coloris);
                mockRepo.create.mockResolvedValue(createdProduct);

                // Act
                const result = await createProduct(mockRepo, productData);

                // Assert
                expect(mockRepo.getColorisById).toHaveBeenCalledTimes(1);
                expect(mockRepo.getColorisById).toHaveBeenCalledWith(roseColorisId);
                expect(mockRepo.create).toHaveBeenCalledTimes(1);
                expect(mockRepo.create).toHaveBeenCalledWith(productData);
                expect(result).toEqual(createdProduct);
            });

            it("should throw error when coloris does not belong to model", async () => {
                // Arrange
                const productData = {
                    modelId: charlieModelId,
                    colorisId: pruneColorisId, // This coloris belongs to a different model
                    unitCost: 10.5,
                    salePrice: 19.99,
                    stock: 100,
                };
                const coloris = createMockProductColoris({
                    id: pruneColorisId,
                    modelId: assumeeModelId, // Different model!
                    coloris: "Prune",
                });
                mockRepo.getColorisById.mockResolvedValue(coloris);

                // Act & Assert
                await expect(createProduct(mockRepo, productData)).rejects.toThrow(
                    `Coloris ${pruneColorisId} does not belong to model ${charlieModelId}`
                );
                expect(mockRepo.getColorisById).toHaveBeenCalledTimes(1);
                expect(mockRepo.create).not.toHaveBeenCalled();
            });

            it("should throw error when coloris is not found", async () => {
                // Arrange
                const productData = {
                    modelId: charlieModelId,
                    colorisId: roseColorisId,
                    unitCost: 10.5,
                    salePrice: 19.99,
                    stock: 100,
                };
                mockRepo.getColorisById.mockResolvedValue(null);

                // Act & Assert
                await expect(createProduct(mockRepo, productData)).rejects.toThrow(
                    `Coloris with id ${roseColorisId} not found`
                );
                expect(mockRepo.getColorisById).toHaveBeenCalledTimes(1);
                expect(mockRepo.create).not.toHaveBeenCalled();
            });

            it("should throw error when modelId is missing", async () => {
                // Arrange
                const productData = {
                    colorisId: roseColorisId, // modelId is missing
                    unitCost: 10.5,
                    salePrice: 19.99,
                    stock: 100,
                };

                // Act & Assert
                await expect(createProduct(mockRepo, productData)).rejects.toThrow(
                    "modelId is required when using new structure"
                );
                expect(mockRepo.create).not.toHaveBeenCalled();
            });

            it("should throw error when colorisId is missing", async () => {
                // Arrange
                const productData = {
                    modelId: charlieModelId, // colorisId is missing
                    unitCost: 10.5,
                    salePrice: 19.99,
                    stock: 100,
                };

                // Act & Assert
                await expect(createProduct(mockRepo, productData)).rejects.toThrow(
                    "colorisId is required when using new structure"
                );
                expect(mockRepo.create).not.toHaveBeenCalled();
            });

            it("should allow old structure (name, type, coloris) for backward compatibility", async () => {
                // Arrange
                const productData = {
                    name: "Sac banane L'Assumée",
                    type: ProductType.SAC_BANANE,
                    coloris: "Rose pâle à motifs",
                    unitCost: 10.5,
                    salePrice: 19.99,
                    stock: 100,
                    // No modelId/colorisId (old structure)
                };
                const createdProduct = createMockProduct({
                    ...productData,
                    id: "created-id" as ProductId,
                });
                mockRepo.create.mockResolvedValue(createdProduct);

                // Act
                const result = await createProduct(mockRepo, productData);

                // Assert
                expect(mockRepo.getColorisById).not.toHaveBeenCalled();
                expect(mockRepo.create).toHaveBeenCalledTimes(1);
                expect(result).toEqual(createdProduct);
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
            it("should update a product with valid non-stock updates", async () => {
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

            it("should allow partial updates when stock is not present in updates", async () => {
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
                    name: "Sac banane L'Assumée - Updated",
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
                expect(result.name).toBe("Sac banane L'Assumée - Updated");
                expect(result.salePrice).toBe(existingProduct.salePrice); // Unchanged
                expect(result.stock).toBe(existingProduct.stock); // Unchanged
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
            it("should reject any updates containing stock field with clear error", async () => {
                // Arrange
                const existingProduct = createMockProduct({
                    id: productId,
                    stock: 100,
                });
                const updates = {
                    stock: 150,
                };
                mockRepo.getById.mockResolvedValue(existingProduct);

                // Act & Assert
                await expect(updateProduct(mockRepo, productId, updates)).rejects.toThrow(
                    "Stock cannot be updated directly. Stock is managed automatically through activities. Use activity creation/update to modify stock levels."
                );
                // Repository update must never be called when stock is present
                expect(mockRepo.update).not.toHaveBeenCalled();
            });
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

            // Stock-specific validation is now enforced by rejecting any presence of `stock`
            // in updates, so negative/zero stock update cases are covered by the generic
            // stock rejection test above.

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

        describe("model/coloris validation (new structure)", () => {
            const charlieModelId = "660e8400-e29b-41d4-a716-446655440001" as ProductModelId;
            const assumeeModelId = "770e8400-e29b-41d4-a716-446655440003" as ProductModelId;
            const roseColorisId = "770e8400-e29b-41d4-a716-446655440002" as ProductColorisId;
            const pruneColorisId = "880e8400-e29b-41d4-a716-446655440004" as ProductColorisId;

            it("should update product with valid model/coloris combination", async () => {
                // Arrange
                const existingProduct = createMockProduct({
                    id: productId,
                    modelId: charlieModelId,
                    colorisId: roseColorisId,
                });
                const updates = {
                    modelId: assumeeModelId,
                    colorisId: pruneColorisId,
                };
                const model = createMockProductModel({
                    id: assumeeModelId,
                    type: ProductType.SAC_BANANE,
                    name: "Assumée",
                });
                const coloris = createMockProductColoris({
                    id: pruneColorisId,
                    modelId: assumeeModelId,
                    coloris: "Prune",
                });
                const updatedProduct = createMockProduct({
                    ...existingProduct,
                    ...updates,
                });
                mockRepo.getById.mockResolvedValue(existingProduct);
                mockRepo.getModelById.mockResolvedValue(model);
                mockRepo.getColorisById.mockResolvedValue(coloris);
                mockRepo.update.mockResolvedValue(updatedProduct);

                // Act
                const result = await updateProduct(mockRepo, productId, updates);

                // Assert
                expect(mockRepo.getModelById).toHaveBeenCalledTimes(1);
                expect(mockRepo.getModelById).toHaveBeenCalledWith(assumeeModelId);
                expect(mockRepo.getColorisById).toHaveBeenCalledTimes(1);
                expect(mockRepo.getColorisById).toHaveBeenCalledWith(pruneColorisId);
                expect(mockRepo.update).toHaveBeenCalledTimes(1);
                expect(result).toEqual(updatedProduct);
            });

            it("should validate coloris belongs to existing model on colorisId only update", async () => {
                // Arrange
                const existingProduct = createMockProduct({
                    id: productId,
                    modelId: charlieModelId,
                    colorisId: roseColorisId,
                });
                const updates = {
                    colorisId: pruneColorisId,
                };
                // pruneColorisId belongs to charlieModelId
                const coloris = createMockProductColoris({
                    id: pruneColorisId,
                    modelId: charlieModelId, // Same model as existing
                    coloris: "Prune",
                });
                const updatedProduct = createMockProduct({
                    ...existingProduct,
                    ...updates,
                });
                mockRepo.getById.mockResolvedValue(existingProduct);
                mockRepo.getColorisById.mockResolvedValue(coloris);
                mockRepo.update.mockResolvedValue(updatedProduct);

                // Act
                const result = await updateProduct(mockRepo, productId, updates);

                // Assert
                expect(mockRepo.getModelById).not.toHaveBeenCalled();
                expect(mockRepo.getColorisById).toHaveBeenCalledTimes(1);
                expect(mockRepo.getColorisById).toHaveBeenCalledWith(pruneColorisId);
                expect(mockRepo.update).toHaveBeenCalledTimes(1);
                expect(result).toEqual(updatedProduct);
            });

            it("should validate coloris belongs to new model on modelId update", async () => {
                // Arrange
                const existingProduct = createMockProduct({
                    id: productId,
                    modelId: charlieModelId,
                    colorisId: roseColorisId,
                });
                const updates = {
                    modelId: assumeeModelId,
                };
                const model = createMockProductModel({
                    id: assumeeModelId,
                    type: ProductType.SAC_BANANE,
                    name: "Assumée",
                });
                const updatedProduct = createMockProduct({
                    ...existingProduct,
                    ...updates,
                });
                mockRepo.getById.mockResolvedValue(existingProduct);
                mockRepo.getModelById.mockResolvedValue(model);
                mockRepo.update.mockResolvedValue(updatedProduct);

                // Act
                const result = await updateProduct(mockRepo, productId, updates);

                // Assert
                expect(mockRepo.getModelById).toHaveBeenCalledTimes(1);
                expect(mockRepo.getModelById).toHaveBeenCalledWith(assumeeModelId);
                expect(mockRepo.getColorisById).not.toHaveBeenCalled();
                expect(mockRepo.update).toHaveBeenCalledTimes(1);
                expect(result).toEqual(updatedProduct);
            });

            it("should throw error when coloris does not belong to model", async () => {
                // Arrange
                const existingProduct = createMockProduct({
                    id: productId,
                    modelId: charlieModelId,
                    colorisId: roseColorisId,
                });
                const updates = {
                    modelId: assumeeModelId,
                    colorisId: roseColorisId, // This coloris belongs to charlieModelId, not assumeeModelId
                };
                const model = createMockProductModel({
                    id: assumeeModelId,
                    type: ProductType.SAC_BANANE,
                    name: "Assumée",
                });
                const coloris = createMockProductColoris({
                    id: roseColorisId,
                    modelId: charlieModelId, // Different model!
                    coloris: "Rose Marsala",
                });
                mockRepo.getById.mockResolvedValue(existingProduct);
                mockRepo.getModelById.mockResolvedValue(model);
                mockRepo.getColorisById.mockResolvedValue(coloris);

                // Act & Assert
                await expect(updateProduct(mockRepo, productId, updates)).rejects.toThrow(
                    `Coloris ${roseColorisId} does not belong to model ${assumeeModelId}`
                );
                expect(mockRepo.getColorisById).toHaveBeenCalledTimes(1);
                expect(mockRepo.update).not.toHaveBeenCalled();
            });

            it("should throw error when coloris does not belong to existing model", async () => {
                // Arrange
                const existingProduct = createMockProduct({
                    id: productId,
                    modelId: charlieModelId,
                    colorisId: roseColorisId,
                });
                const updates = {
                    colorisId: pruneColorisId, // This coloris belongs to assumeeModelId, not charlieModelId
                };
                const coloris = createMockProductColoris({
                    id: pruneColorisId,
                    modelId: assumeeModelId, // Different model!
                    coloris: "Prune",
                });
                mockRepo.getById.mockResolvedValue(existingProduct);
                mockRepo.getColorisById.mockResolvedValue(coloris);

                // Act & Assert
                await expect(updateProduct(mockRepo, productId, updates)).rejects.toThrow(
                    `Coloris ${pruneColorisId} does not belong to model ${charlieModelId}`
                );
                expect(mockRepo.getColorisById).toHaveBeenCalledTimes(1);
                expect(mockRepo.update).not.toHaveBeenCalled();
            });

            it("should throw error when model is not found", async () => {
                // Arrange
                const existingProduct = createMockProduct({
                    id: productId,
                    modelId: charlieModelId,
                });
                const updates = {
                    modelId: assumeeModelId,
                };
                mockRepo.getById.mockResolvedValue(existingProduct);
                mockRepo.getModelById.mockResolvedValue(null);

                // Act & Assert
                await expect(updateProduct(mockRepo, productId, updates)).rejects.toThrow(
                    `Model with id ${assumeeModelId} not found`
                );
                expect(mockRepo.getModelById).toHaveBeenCalledTimes(1);
                expect(mockRepo.update).not.toHaveBeenCalled();
            });

            it("should throw error when coloris is not found", async () => {
                // Arrange
                const existingProduct = createMockProduct({
                    id: productId,
                    modelId: charlieModelId,
                });
                const updates = {
                    colorisId: roseColorisId,
                };
                mockRepo.getById.mockResolvedValue(existingProduct);
                mockRepo.getColorisById.mockResolvedValue(null);

                // Act & Assert
                await expect(updateProduct(mockRepo, productId, updates)).rejects.toThrow(
                    `Coloris with id ${roseColorisId} not found`
                );
                expect(mockRepo.getColorisById).toHaveBeenCalledTimes(1);
                expect(mockRepo.update).not.toHaveBeenCalled();
            });

            it("should throw error when updating colorisId but product has no modelId", async () => {
                // Arrange
                const existingProduct = createMockProduct({
                    id: productId,
                    // No modelId (old structure)
                    name: "Sac banane L'Assumée",
                    type: ProductType.SAC_BANANE,
                    coloris: "Rose pâle à motifs",
                });
                const updates = {
                    colorisId: roseColorisId,
                };
                mockRepo.getById.mockResolvedValue(existingProduct);

                // Act & Assert
                await expect(updateProduct(mockRepo, productId, updates)).rejects.toThrow(
                    "Cannot update colorisId: product has no modelId. Please set modelId first."
                );
                expect(mockRepo.update).not.toHaveBeenCalled();
            });

            it("should allow partial update with only modelId (no colorisId update)", async () => {
                // Arrange
                const existingProduct = createMockProduct({
                    id: productId,
                    modelId: charlieModelId,
                    colorisId: roseColorisId,
                });
                const updates = {
                    modelId: assumeeModelId,
                };
                const model = createMockProductModel({
                    id: assumeeModelId,
                    type: ProductType.SAC_BANANE,
                    name: "Assumée",
                });
                const updatedProduct = createMockProduct({
                    ...existingProduct,
                    ...updates,
                });
                mockRepo.getById.mockResolvedValue(existingProduct);
                mockRepo.getModelById.mockResolvedValue(model);
                mockRepo.update.mockResolvedValue(updatedProduct);

                // Act
                const result = await updateProduct(mockRepo, productId, updates);

                // Assert
                expect(mockRepo.getModelById).toHaveBeenCalledTimes(1);
                expect(mockRepo.getColorisById).not.toHaveBeenCalled();
                expect(mockRepo.update).toHaveBeenCalledTimes(1);
                expect(result).toEqual(updatedProduct);
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

    describe("listProductModelsByType", () => {
        const charlieModelId = "660e8400-e29b-41d4-a716-446655440001" as ProductModelId;
        const assumeeModelId = "770e8400-e29b-41d4-a716-446655440002" as ProductModelId;

        describe("successful fetch", () => {
            it("should return models for the specified type", async () => {
                // Arrange
                const models = [
                    createMockProductModel({
                        id: charlieModelId,
                        type: ProductType.POCHETTE_VOLANTS,
                        name: "Charlie",
                    }),
                    createMockProductModel({
                        id: assumeeModelId,
                        type: ProductType.POCHETTE_VOLANTS,
                        name: "Espiègle",
                    }),
                ];
                mockRepo.listModelsByType.mockResolvedValue(models);

                // Act
                const result = await listProductModelsByType(
                    mockRepo,
                    ProductType.POCHETTE_VOLANTS
                );

                // Assert
                expect(mockRepo.listModelsByType).toHaveBeenCalledTimes(1);
                expect(mockRepo.listModelsByType).toHaveBeenCalledWith(
                    ProductType.POCHETTE_VOLANTS
                );
                expect(result).toEqual(models);
                expect(result).toHaveLength(2);
            });

            it("should return empty array when no models exist for type", async () => {
                // Arrange
                mockRepo.listModelsByType.mockResolvedValue([]);

                // Act
                const result = await listProductModelsByType(
                    mockRepo,
                    ProductType.TROUSSE_TOILETTE
                );

                // Assert
                expect(mockRepo.listModelsByType).toHaveBeenCalledTimes(1);
                expect(mockRepo.listModelsByType).toHaveBeenCalledWith(
                    ProductType.TROUSSE_TOILETTE
                );
                expect(result).toEqual([]);
                expect(result).toHaveLength(0);
            });

            it("should return models in repository order", async () => {
                // Arrange
                const models = [
                    createMockProductModel({
                        id: charlieModelId,
                        type: ProductType.SAC_BANANE,
                        name: "Assumée",
                    }),
                ];
                mockRepo.listModelsByType.mockResolvedValue(models);

                // Act
                const result = await listProductModelsByType(
                    mockRepo,
                    ProductType.SAC_BANANE
                );

                // Assert
                expect(result).toEqual(models);
                expect(result[0].name).toBe("Assumée");
            });
        });

        describe("repository errors", () => {
            it("should propagate repository errors", async () => {
                // Arrange
                const error = new Error("Database connection failed");
                mockRepo.listModelsByType.mockRejectedValue(error);

                // Act & Assert
                await expect(
                    listProductModelsByType(mockRepo, ProductType.POCHETTE_VOLANTS)
                ).rejects.toThrow("Database connection failed");
                expect(mockRepo.listModelsByType).toHaveBeenCalledTimes(1);
            });
        });
    });

    describe("listProductColorisByModel", () => {
        const charlieModelId = "660e8400-e29b-41d4-a716-446655440001" as ProductModelId;
        const roseColorisId = "770e8400-e29b-41d4-a716-446655440002" as ProductColorisId;
        const pruneColorisId = "880e8400-e29b-41d4-a716-446655440003" as ProductColorisId;

        describe("successful fetch", () => {
            it("should return coloris for the specified model", async () => {
                // Arrange
                const coloris = [
                    createMockProductColoris({
                        id: roseColorisId,
                        modelId: charlieModelId,
                        coloris: "Rose Marsala",
                    }),
                    createMockProductColoris({
                        id: pruneColorisId,
                        modelId: charlieModelId,
                        coloris: "Prune",
                    }),
                ];
                mockRepo.listColorisByModel.mockResolvedValue(coloris);

                // Act
                const result = await listProductColorisByModel(mockRepo, charlieModelId);

                // Assert
                expect(mockRepo.listColorisByModel).toHaveBeenCalledTimes(1);
                expect(mockRepo.listColorisByModel).toHaveBeenCalledWith(charlieModelId);
                expect(result).toEqual(coloris);
                expect(result).toHaveLength(2);
            });

            it("should return empty array when no coloris exist for model", async () => {
                // Arrange
                mockRepo.listColorisByModel.mockResolvedValue([]);

                // Act
                const result = await listProductColorisByModel(mockRepo, charlieModelId);

                // Assert
                expect(mockRepo.listColorisByModel).toHaveBeenCalledTimes(1);
                expect(mockRepo.listColorisByModel).toHaveBeenCalledWith(charlieModelId);
                expect(result).toEqual([]);
                expect(result).toHaveLength(0);
            });

            it("should return coloris in repository order", async () => {
                // Arrange
                const coloris = [
                    createMockProductColoris({
                        id: roseColorisId,
                        modelId: charlieModelId,
                        coloris: "Rose pâle à motifs",
                    }),
                ];
                mockRepo.listColorisByModel.mockResolvedValue(coloris);

                // Act
                const result = await listProductColorisByModel(mockRepo, charlieModelId);

                // Assert
                expect(result).toEqual(coloris);
                expect(result[0].coloris).toBe("Rose pâle à motifs");
            });
        });

        describe("repository errors", () => {
            it("should propagate repository errors", async () => {
                // Arrange
                const error = new Error("Database connection failed");
                mockRepo.listColorisByModel.mockRejectedValue(error);

                // Act & Assert
                await expect(
                    listProductColorisByModel(mockRepo, charlieModelId)
                ).rejects.toThrow("Database connection failed");
                expect(mockRepo.listColorisByModel).toHaveBeenCalledTimes(1);
            });
        });
    });

    describe("getProductModel", () => {
        const charlieModelId = "660e8400-e29b-41d4-a716-446655440001" as ProductModelId;

        describe("found", () => {
            it("should return model when found", async () => {
                // Arrange
                const model = createMockProductModel({
                    id: charlieModelId,
                    type: ProductType.POCHETTE_VOLANTS,
                    name: "Charlie",
                });
                mockRepo.getModelById.mockResolvedValue(model);

                // Act
                const result = await getProductModel(mockRepo, charlieModelId);

                // Assert
                expect(mockRepo.getModelById).toHaveBeenCalledTimes(1);
                expect(mockRepo.getModelById).toHaveBeenCalledWith(charlieModelId);
                expect(result).toEqual(model);
            });

            it("should return model with all fields", async () => {
                // Arrange
                const model = createMockProductModel({
                    id: charlieModelId,
                    type: ProductType.SAC_BANANE,
                    name: "Assumée",
                });
                mockRepo.getModelById.mockResolvedValue(model);

                // Act
                const result = await getProductModel(mockRepo, charlieModelId);

                // Assert
                expect(result?.id).toBe(charlieModelId);
                expect(result?.type).toBe(ProductType.SAC_BANANE);
                expect(result?.name).toBe("Assumée");
            });
        });

        describe("not found", () => {
            it("should return null when model does not exist", async () => {
                // Arrange
                mockRepo.getModelById.mockResolvedValue(null);

                // Act
                const result = await getProductModel(mockRepo, charlieModelId);

                // Assert
                expect(mockRepo.getModelById).toHaveBeenCalledTimes(1);
                expect(mockRepo.getModelById).toHaveBeenCalledWith(charlieModelId);
                expect(result).toBeNull();
            });
        });

        describe("repository errors", () => {
            it("should propagate repository errors", async () => {
                // Arrange
                const error = new Error("Database connection failed");
                mockRepo.getModelById.mockRejectedValue(error);

                // Act & Assert
                await expect(getProductModel(mockRepo, charlieModelId)).rejects.toThrow(
                    "Database connection failed"
                );
                expect(mockRepo.getModelById).toHaveBeenCalledTimes(1);
            });
        });
    });

    describe("getProductColoris", () => {
        const roseColorisId = "770e8400-e29b-41d4-a716-446655440002" as ProductColorisId;
        const charlieModelId = "660e8400-e29b-41d4-a716-446655440001" as ProductModelId;

        describe("found", () => {
            it("should return coloris when found", async () => {
                // Arrange
                const coloris = createMockProductColoris({
                    id: roseColorisId,
                    modelId: charlieModelId,
                    coloris: "Rose Marsala",
                });
                mockRepo.getColorisById.mockResolvedValue(coloris);

                // Act
                const result = await getProductColoris(mockRepo, roseColorisId);

                // Assert
                expect(mockRepo.getColorisById).toHaveBeenCalledTimes(1);
                expect(mockRepo.getColorisById).toHaveBeenCalledWith(roseColorisId);
                expect(result).toEqual(coloris);
            });

            it("should return coloris with all fields", async () => {
                // Arrange
                const coloris = createMockProductColoris({
                    id: roseColorisId,
                    modelId: charlieModelId,
                    coloris: "Prune",
                });
                mockRepo.getColorisById.mockResolvedValue(coloris);

                // Act
                const result = await getProductColoris(mockRepo, roseColorisId);

                // Assert
                expect(result?.id).toBe(roseColorisId);
                expect(result?.modelId).toBe(charlieModelId);
                expect(result?.coloris).toBe("Prune");
            });
        });

        describe("not found", () => {
            it("should return null when coloris does not exist", async () => {
                // Arrange
                mockRepo.getColorisById.mockResolvedValue(null);

                // Act
                const result = await getProductColoris(mockRepo, roseColorisId);

                // Assert
                expect(mockRepo.getColorisById).toHaveBeenCalledTimes(1);
                expect(mockRepo.getColorisById).toHaveBeenCalledWith(roseColorisId);
                expect(result).toBeNull();
            });
        });

        describe("repository errors", () => {
            it("should propagate repository errors", async () => {
                // Arrange
                const error = new Error("Database connection failed");
                mockRepo.getColorisById.mockRejectedValue(error);

                // Act & Assert
                await expect(getProductColoris(mockRepo, roseColorisId)).rejects.toThrow(
                    "Database connection failed"
                );
                expect(mockRepo.getColorisById).toHaveBeenCalledTimes(1);
            });
        });
    });
});

