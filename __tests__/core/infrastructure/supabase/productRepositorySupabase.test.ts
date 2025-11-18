/**
 * Product Repository Supabase Tests
 *
 * Tests for the Supabase implementation of ProductRepository to ensure:
 * - Correct mapping between Supabase rows (snake_case) and domain types (camelCase)
 * - Proper error handling and propagation
 * - Type conversions (NUMERIC → number, UUID → ProductId)
 * - Null handling for optional fields (weight)
 * - All CRUD operations work correctly
 *
 * ## Test Specification (Sub-Ticket 11.3)
 *
 * ### Test Structure
 * - Test file: `__tests__/core/infrastructure/supabase/productRepositorySupabase.test.ts`
 * - Mock Supabase client: `__mocks__/infrastructure/supabase/client.ts`
 * - Domain fixtures: `__mocks__/core/domain/product.ts`
 *
 * ### Test Coverage
 * - All repository methods: `list()`, `getById()`, `create()`, `update()`
 * - Success paths, error paths, and edge cases
 * - Mapping functions (if extracted) or inline mapping logic
 * - Type conversions and null handling
 *
 * ### Coverage Targets
 * - Line Coverage: ≥ 90%
 * - Branch Coverage: ≥ 85%
 * - Function Coverage: 100%
 *
 * ### Status
 * ✅ **tests: approved** - Test spec complete and ready for implementation
 */

import { productRepositorySupabase } from "@/infrastructure/supabase/productRepositorySupabase";
import { supabaseClient } from "@/infrastructure/supabase/client";
import type { Product, ProductId } from "@/core/domain/product";
import { ProductType } from "@/core/domain/product";
import { createMockProduct } from "../../../../__mocks__/core/domain/product";

// Mock the Supabase client
jest.mock("@/infrastructure/supabase/client", () => ({
    supabaseClient: {
        from: jest.fn(() => ({
            select: jest.fn().mockReturnThis(),
            insert: jest.fn().mockReturnThis(),
            update: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn(),
        })),
    },
}));

/**
 * Creates a Supabase row fixture (snake_case) from a domain Product.
 *
 * This helper function creates test data in the format that Supabase returns,
 * with snake_case column names and proper type conversions.
 */
const createSupabaseProductRow = (product: Product) => ({
    id: product.id,
    name: product.name,
    type: product.type,
    coloris: product.coloris,
    unit_cost: product.unitCost.toString(), // NUMERIC as string from Supabase
    sale_price: product.salePrice.toString(), // NUMERIC as string from Supabase
    stock: product.stock.toString(), // NUMERIC as string from Supabase
    weight: product.weight?.toString() ?? null, // NUMERIC as string from Supabase, null if undefined
    created_at: "2025-01-27T14:00:00.000Z", // Not in domain, but present in DB
});


describe("productRepositorySupabase", () => {
    let mockQueryBuilder: {
        select: jest.Mock;
        insert: jest.Mock;
        update: jest.Mock;
        eq: jest.Mock;
        single: jest.Mock;
    };

    beforeEach(() => {
        jest.clearAllMocks();

        // Create a fresh query builder mock for each test
        mockQueryBuilder = {
            select: jest.fn().mockReturnThis(),
            insert: jest.fn().mockReturnThis(),
            update: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn(),
        };

        (supabaseClient.from as jest.Mock).mockReturnValue(mockQueryBuilder);
    });

    describe("list()", () => {
        it("should return empty array when no products exist", async () => {
            // Arrange
            mockQueryBuilder.select.mockResolvedValue({
                data: [],
                error: null,
            });

            // Act
            const result = await productRepositorySupabase.list();

            // Assert
            expect(result).toEqual([]);
            expect(supabaseClient.from).toHaveBeenCalledWith("products");
            expect(mockQueryBuilder.select).toHaveBeenCalled();
        });

        it("should return all products mapped to domain types", async () => {
            // Arrange
            const mockProduct1 = createMockProduct({
                id: "550e8400-e29b-41d4-a716-446655440000" as ProductId,
                type: ProductType.SAC_BANANE,
            });
            const mockProduct2 = createMockProduct({
                id: "650e8400-e29b-41d4-a716-446655440001" as ProductId,
                type: ProductType.POCHETTE_ORDINATEUR,
            });

            const supabaseRows = [
                createSupabaseProductRow(mockProduct1),
                createSupabaseProductRow(mockProduct2),
            ];

            mockQueryBuilder.select.mockResolvedValue({
                data: supabaseRows,
                error: null,
            });

            // Act
            const result = await productRepositorySupabase.list();

            // Assert
            expect(result).toHaveLength(2);
            expect(result[0]).toEqual(mockProduct1);
            expect(result[1]).toEqual(mockProduct2);
            expect(supabaseClient.from).toHaveBeenCalledWith("products");
            expect(mockQueryBuilder.select).toHaveBeenCalled();
        });

        it("should handle products with null weight", async () => {
            // Arrange
            const mockProduct = createMockProduct({
                weight: undefined, // No weight
            });

            const supabaseRow = createSupabaseProductRow(mockProduct);
            supabaseRow.weight = null; // Explicitly null in database

            mockQueryBuilder.select.mockResolvedValue({
                data: [supabaseRow],
                error: null,
            });

            // Act
            const result = await productRepositorySupabase.list();

            // Assert
            expect(result).toHaveLength(1);
            expect(result[0].weight).toBeUndefined();
            expect(result[0].id).toBe(mockProduct.id);
        });

        it("should handle products with weight", async () => {
            // Arrange
            const mockProduct = createMockProduct({
                weight: 150.5,
            });

            const supabaseRow = createSupabaseProductRow(mockProduct);

            mockQueryBuilder.select.mockResolvedValue({
                data: [supabaseRow],
                error: null,
            });

            // Act
            const result = await productRepositorySupabase.list();

            // Assert
            expect(result).toHaveLength(1);
            expect(result[0].weight).toBe(150.5);
        });

        it("should propagate Supabase errors", async () => {
            // Arrange
            const supabaseError = {
                message: "Database connection error",
                details: "Connection timeout",
                hint: null,
                code: "PGRST116",
            };

            mockQueryBuilder.select.mockResolvedValue({
                data: null,
                error: supabaseError,
            });

            // Act & Assert
            await expect(productRepositorySupabase.list()).rejects.toThrow();
        });

        it("should map all fields correctly (id, name, type, coloris, unitCost, salePrice, stock, weight)", async () => {
            // Arrange
            const mockProduct = createMockProduct({
                id: "550e8400-e29b-41d4-a716-446655440000" as ProductId,
                name: "Pochette ordinateur L'Espiegle",
                type: ProductType.POCHETTE_ORDINATEUR,
                coloris: "Rose marsala",
                unitCost: 15.5,
                salePrice: 29.99,
                stock: 50,
                weight: 350.75,
            });

            const supabaseRow = createSupabaseProductRow(mockProduct);

            mockQueryBuilder.select.mockResolvedValue({
                data: [supabaseRow],
                error: null,
            });

            // Act
            const result = await productRepositorySupabase.list();

            // Assert
            expect(result[0]).toEqual(mockProduct);
            expect(result[0].id).toBe(mockProduct.id);
            expect(result[0].name).toBe(mockProduct.name);
            expect(result[0].type).toBe(mockProduct.type);
            expect(result[0].coloris).toBe(mockProduct.coloris);
            expect(result[0].unitCost).toBe(mockProduct.unitCost);
            expect(result[0].salePrice).toBe(mockProduct.salePrice);
            expect(result[0].stock).toBe(mockProduct.stock);
            expect(result[0].weight).toBe(mockProduct.weight);
        });
    });

    describe("getById(id)", () => {
        it("should return product when found", async () => {
            // Arrange
            const productId = "550e8400-e29b-41d4-a716-446655440000" as ProductId;
            const mockProduct = createMockProduct({ id: productId });

            const supabaseRow = createSupabaseProductRow(mockProduct);

            mockQueryBuilder.single.mockResolvedValue({
                data: supabaseRow,
                error: null,
            });

            // Act
            const result = await productRepositorySupabase.getById(productId);

            // Assert
            expect(result).toEqual(mockProduct);
            expect(supabaseClient.from).toHaveBeenCalledWith("products");
            expect(mockQueryBuilder.select).toHaveBeenCalled();
            expect(mockQueryBuilder.eq).toHaveBeenCalledWith("id", productId);
            expect(mockQueryBuilder.single).toHaveBeenCalled();
        });

        it("should return null when not found", async () => {
            // Arrange
            const productId = "550e8400-e29b-41d4-a716-446655440000" as ProductId;

            mockQueryBuilder.single.mockResolvedValue({
                data: null,
                error: null,
            });

            // Act
            const result = await productRepositorySupabase.getById(productId);

            // Assert
            expect(result).toBeNull();
        });

        it("should map product to domain type correctly", async () => {
            // Arrange
            const productId = "550e8400-e29b-41d4-a716-446655440000" as ProductId;
            const mockProduct = createMockProduct({
                id: productId,
                type: ProductType.TROUSSE_TOILETTE,
                unitCost: 8.5,
                salePrice: 15.99,
            });

            const supabaseRow = createSupabaseProductRow(mockProduct);

            mockQueryBuilder.single.mockResolvedValue({
                data: supabaseRow,
                error: null,
            });

            // Act
            const result = await productRepositorySupabase.getById(productId);

            // Assert
            expect(result).toEqual(mockProduct);
        });

        it("should handle null weight", async () => {
            // Arrange
            const productId = "550e8400-e29b-41d4-a716-446655440000" as ProductId;
            const mockProduct = createMockProduct({
                id: productId,
                weight: undefined,
            });

            const supabaseRow = createSupabaseProductRow(mockProduct);
            supabaseRow.weight = null;

            mockQueryBuilder.single.mockResolvedValue({
                data: supabaseRow,
                error: null,
            });

            // Act
            const result = await productRepositorySupabase.getById(productId);

            // Assert
            expect(result).not.toBeNull();
            expect(result?.weight).toBeUndefined();
        });

        it("should propagate Supabase errors", async () => {
            // Arrange
            const productId = "550e8400-e29b-41d4-a716-446655440000" as ProductId;
            const supabaseError = {
                message: "Query error",
                details: "Invalid query",
                hint: null,
                code: "PGRST100",
            };

            mockQueryBuilder.single.mockResolvedValue({
                data: null,
                error: supabaseError,
            });

            // Act & Assert
            await expect(
                productRepositorySupabase.getById(productId)
            ).rejects.toThrow();
        });
    });

    describe("create(product)", () => {
        it("should create product and return with generated ID", async () => {
            // Arrange
            const newProduct = createMockProduct({
                id: undefined as unknown as ProductId, // No ID before creation
            });
            const generatedId = "550e8400-e29b-41d4-a716-446655440000" as ProductId;

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id: _id, ...productWithoutId } = newProduct;

            const createdRow = createSupabaseProductRow({
                ...newProduct,
                id: generatedId,
            });

            mockQueryBuilder.single.mockResolvedValue({
                data: createdRow,
                error: null,
            });

            // Act
            const result = await productRepositorySupabase.create(productWithoutId);

            // Assert
            expect(result.id).toBe(generatedId);
            expect(result.name).toBe(newProduct.name);
            expect(result.type).toBe(newProduct.type);
            expect(supabaseClient.from).toHaveBeenCalledWith("products");
            expect(mockQueryBuilder.insert).toHaveBeenCalled();
            expect(mockQueryBuilder.single).toHaveBeenCalled();
        });

        it("should map domain type to Supabase row correctly", async () => {
            // Arrange
            const newProduct = createMockProduct({
                type: ProductType.POCHETTE_VOLANTS,
                unitCost: 12.5,
                salePrice: 24.99,
                stock: 25,
                weight: 200.5,
            });

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id: _id, ...productWithoutId } = newProduct;
            const generatedId = "550e8400-e29b-41d4-a716-446655440000" as ProductId;

            const createdRow = createSupabaseProductRow({
                ...newProduct,
                id: generatedId,
            });

            mockQueryBuilder.single.mockResolvedValue({
                data: createdRow,
                error: null,
            });

            // Act
            const result = await productRepositorySupabase.create(productWithoutId);

            // Assert
            expect(mockQueryBuilder.insert).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: newProduct.name,
                    type: newProduct.type,
                    coloris: newProduct.coloris,
                    unit_cost: newProduct.unitCost,
                    sale_price: newProduct.salePrice,
                    stock: newProduct.stock,
                    weight: newProduct.weight,
                })
            );
            expect(result).toEqual({ ...newProduct, id: generatedId });
        });

        it("should handle optional weight (null in database)", async () => {
            // Arrange
            const newProduct = createMockProduct({
                weight: undefined, // Optional weight
            });

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id: _id, ...productWithoutId } = newProduct;
            const generatedId = "550e8400-e29b-41d4-a716-446655440000" as ProductId;

            const createdRow = createSupabaseProductRow({
                ...newProduct,
                id: generatedId,
            });
            createdRow.weight = null;

            mockQueryBuilder.single.mockResolvedValue({
                data: createdRow,
                error: null,
            });

            // Act
            const result = await productRepositorySupabase.create(productWithoutId);

            // Assert
            expect(result.weight).toBeUndefined();
            expect(mockQueryBuilder.insert).toHaveBeenCalledWith(
                expect.objectContaining({
                    weight: null,
                })
            );
        });

        it("should convert numeric fields correctly (unitCost, salePrice, stock, weight)", async () => {
            // Arrange
            const newProduct = createMockProduct({
                unitCost: 10.99,
                salePrice: 19.99,
                stock: 100.5,
                weight: 150.75,
            });

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id: _id, ...productWithoutId } = newProduct;
            const generatedId = "550e8400-e29b-41d4-a716-446655440000" as ProductId;

            const createdRow = createSupabaseProductRow({
                ...newProduct,
                id: generatedId,
            });

            mockQueryBuilder.single.mockResolvedValue({
                data: createdRow,
                error: null,
            });

            // Act
            const result = await productRepositorySupabase.create(productWithoutId);

            // Assert
            expect(result.unitCost).toBe(10.99);
            expect(result.salePrice).toBe(19.99);
            expect(result.stock).toBe(100.5);
            expect(result.weight).toBe(150.75);
        });

        it("should convert ProductType enum to TEXT", async () => {
            // Arrange
            const newProduct = createMockProduct({
                type: ProductType.ACCESSOIRES_DIVERS,
            });

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id: _id, ...productWithoutId } = newProduct;
            const generatedId = "550e8400-e29b-41d4-a716-446655440000" as ProductId;

            const createdRow = createSupabaseProductRow({
                ...newProduct,
                id: generatedId,
            });

            mockQueryBuilder.single.mockResolvedValue({
                data: createdRow,
                error: null,
            });

            // Act
            const result = await productRepositorySupabase.create(productWithoutId);

            // Assert
            expect(mockQueryBuilder.insert).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: ProductType.ACCESSOIRES_DIVERS,
                })
            );
            expect(result.type).toBe(ProductType.ACCESSOIRES_DIVERS);
        });

        it("should propagate Supabase errors", async () => {
            // Arrange
            const newProduct = createMockProduct();
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id: _id, ...productWithoutId } = newProduct;

            const supabaseError = {
                message: "Constraint violation",
                details: "Foreign key constraint failed",
                hint: null,
                code: "23503",
            };

            mockQueryBuilder.single.mockResolvedValue({
                data: null,
                error: supabaseError,
            });

            // Act & Assert
            await expect(
                productRepositorySupabase.create(productWithoutId)
            ).rejects.toThrow();
        });

        it("should handle validation errors from database constraints", async () => {
            // Arrange
            const newProduct = createMockProduct({
                unitCost: -10, // Invalid: must be positive
            });

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id: _id, ...productWithoutId } = newProduct;

            const supabaseError = {
                message: "Check constraint violation",
                details: "unit_cost must be greater than 0",
                hint: null,
                code: "23514",
            };

            mockQueryBuilder.single.mockResolvedValue({
                data: null,
                error: supabaseError,
            });

            // Act & Assert
            await expect(
                productRepositorySupabase.create(productWithoutId)
            ).rejects.toThrow();
        });
    });

    describe("update(id, updates)", () => {
        it("should update product and return updated product", async () => {
            // Arrange
            const productId = "550e8400-e29b-41d4-a716-446655440000" as ProductId;
            const existingProduct = createMockProduct({ id: productId });
            const updates = {
                salePrice: 29.99,
                stock: 50,
            };

            const updatedProduct = {
                ...existingProduct,
                ...updates,
            };

            const updatedRow = createSupabaseProductRow(updatedProduct);

            mockQueryBuilder.single.mockResolvedValue({
                data: updatedRow,
                error: null,
            });

            // Act
            const result = await productRepositorySupabase.update(productId, updates);

            // Assert
            expect(result).toEqual(updatedProduct);
            expect(supabaseClient.from).toHaveBeenCalledWith("products");
            expect(mockQueryBuilder.update).toHaveBeenCalled();
            expect(mockQueryBuilder.eq).toHaveBeenCalledWith("id", productId);
            expect(mockQueryBuilder.single).toHaveBeenCalled();
        });

        it("should handle partial updates", async () => {
            // Arrange
            const productId = "550e8400-e29b-41d4-a716-446655440000" as ProductId;
            const existingProduct = createMockProduct({ id: productId });
            const updates = {
                name: "Updated product name",
            };

            const updatedProduct = {
                ...existingProduct,
                ...updates,
            };

            const updatedRow = createSupabaseProductRow(updatedProduct);

            mockQueryBuilder.single.mockResolvedValue({
                data: updatedRow,
                error: null,
            });

            // Act
            const result = await productRepositorySupabase.update(productId, updates);

            // Assert
            expect(result.name).toBe("Updated product name");
            expect(result.id).toBe(productId);
            expect(mockQueryBuilder.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: "Updated product name",
                })
            );
        });

        it("should map updates to Supabase row correctly", async () => {
            // Arrange
            const productId = "550e8400-e29b-41d4-a716-446655440000" as ProductId;
            const existingProduct = createMockProduct({ id: productId });
            const updates = {
                unitCost: 12.5,
                salePrice: 24.99,
                stock: 75,
                type: ProductType.TROUSSE_ZIPPEE,
            };

            const updatedProduct = {
                ...existingProduct,
                ...updates,
            };

            const updatedRow = createSupabaseProductRow(updatedProduct);

            mockQueryBuilder.single.mockResolvedValue({
                data: updatedRow,
                error: null,
            });

            // Act
            await productRepositorySupabase.update(productId, updates);

            // Assert
            expect(mockQueryBuilder.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    unit_cost: 12.5,
                    sale_price: 24.99,
                    stock: 75,
                    type: ProductType.TROUSSE_ZIPPEE,
                })
            );
        });

        it("should handle setting weight to null", async () => {
            // Arrange
            const productId = "550e8400-e29b-41d4-a716-446655440000" as ProductId;
            const existingProduct = createMockProduct({
                id: productId,
                weight: 200,
            });
            const updates = {
                weight: undefined, // Remove weight
            };

            const updatedProduct = {
                ...existingProduct,
                weight: undefined,
            };

            const updatedRow = createSupabaseProductRow(updatedProduct);
            updatedRow.weight = null;

            mockQueryBuilder.single.mockResolvedValue({
                data: updatedRow,
                error: null,
            });

            // Act
            const result = await productRepositorySupabase.update(productId, updates);

            // Assert
            expect(result.weight).toBeUndefined();
            expect(mockQueryBuilder.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    weight: null,
                })
            );
        });

        it("should handle removing weight (set to null)", async () => {
            // Arrange
            const productId = "550e8400-e29b-41d4-a716-446655440000" as ProductId;
            const existingProduct = createMockProduct({
                id: productId,
                weight: 150,
            });
            const updates = {
                weight: undefined, // Remove weight
            };

            const updatedProduct = {
                ...existingProduct,
                weight: undefined,
            };

            const updatedRow = createSupabaseProductRow(updatedProduct);
            updatedRow.weight = null;

            mockQueryBuilder.single.mockResolvedValue({
                data: updatedRow,
                error: null,
            });

            // Act
            const result = await productRepositorySupabase.update(productId, updates);

            // Assert
            expect(result.weight).toBeUndefined();
            expect(mockQueryBuilder.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    weight: null,
                })
            );
        });

        it("should throw error when product not found", async () => {
            // Arrange
            const productId = "550e8400-e29b-41d4-a716-446655440000" as ProductId;
            const updates = { salePrice: 29.99 };

            // Supabase returns null data when not found
            mockQueryBuilder.single.mockResolvedValue({
                data: null,
                error: null,
            });

            // Act & Assert
            await expect(
                productRepositorySupabase.update(productId, updates)
            ).rejects.toThrow();
        });

        it("should propagate Supabase errors", async () => {
            // Arrange
            const productId = "550e8400-e29b-41d4-a716-446655440000" as ProductId;
            const updates = { salePrice: 29.99 };

            const supabaseError = {
                message: "Update failed",
                details: "Row not found",
                hint: null,
                code: "PGRST116",
            };

            mockQueryBuilder.single.mockResolvedValue({
                data: null,
                error: supabaseError,
            });

            // Act & Assert
            await expect(
                productRepositorySupabase.update(productId, updates)
            ).rejects.toThrow();
        });
    });
});

