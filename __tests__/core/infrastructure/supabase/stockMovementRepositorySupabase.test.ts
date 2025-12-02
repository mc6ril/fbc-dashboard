/**
 * Stock Movement Repository Supabase Tests
 *
 * Tests for the Supabase implementation of StockMovementRepository to ensure:
 * - Correct mapping between Supabase rows (snake_case) and domain types (camelCase)
 * - Proper error handling and propagation
 * - Type conversions (NUMERIC → number, UUID → StockMovementId)
 * - All CRUD operations work correctly
 */

import { stockMovementRepositorySupabase } from "@/infrastructure/supabase/stockMovementRepositorySupabase";
import { supabaseClient } from "@/infrastructure/supabase/client";
import type { StockMovement, StockMovementId } from "@/core/domain/stockMovement";
import { StockMovementSource } from "@/core/domain/stockMovement";
import { createMockStockMovement } from "../../../../__mocks__/core/domain/stockMovement";
import type { ProductId } from "@/core/domain/product";

// Mock the Supabase client
jest.mock("@/infrastructure/supabase/client", () => ({
    supabaseClient: {
        from: jest.fn(),
    },
}));

/**
 * Creates a Supabase row fixture (snake_case) from a domain StockMovement.
 *
 * This helper function creates test data in the format that Supabase returns,
 * with snake_case column names and proper type conversions.
 */
const createSupabaseStockMovementRow = (movement: StockMovement) => ({
    id: movement.id,
    product_id: movement.productId,
    quantity: movement.quantity.toString(), // NUMERIC as string from Supabase
    source: movement.source,
});

describe("stockMovementRepositorySupabase", () => {
    let mockQueryBuilder: {
        select: jest.Mock;
        insert: jest.Mock;
        eq: jest.Mock;
        single: jest.Mock;
    };

    beforeEach(() => {
        jest.clearAllMocks();

        // Create a fresh query builder mock for each test
        // Note: select() must return the same object to allow chaining with eq()
        const builder = {
            select: jest.fn(),
            insert: jest.fn(),
            eq: jest.fn(),
            single: jest.fn(),
        };

        // Make select() and eq() return the same object so chaining works
        builder.select.mockReturnValue(builder);
        builder.insert.mockReturnValue(builder);
        builder.eq.mockReturnValue(builder);

        mockQueryBuilder = builder;

        (supabaseClient.from as jest.Mock).mockReturnValue(mockQueryBuilder);
    });

    describe("list()", () => {
        it("should return empty array when no stock movements exist", async () => {
            // Arrange
            mockQueryBuilder.select.mockResolvedValue({
                data: [],
                error: null,
            });

            // Act
            const result = await stockMovementRepositorySupabase.list();

            // Assert
            expect(result).toEqual([]);
            expect(supabaseClient.from).toHaveBeenCalledWith("stock_movements");
            expect(mockQueryBuilder.select).toHaveBeenCalled();
        });

        it("should return all stock movements mapped to domain types", async () => {
            // Arrange
            const mockMovement1 = createMockStockMovement({
                id: "123e4567-e89b-4d3a-a456-426614174000" as StockMovementId,
                source: StockMovementSource.CREATION,
                quantity: 10,
            });
            const mockMovement2 = createMockStockMovement({
                id: "223e4567-e89b-4d3a-a456-426614174001" as StockMovementId,
                source: StockMovementSource.SALE,
                quantity: -5,
            });

            const supabaseRows = [
                createSupabaseStockMovementRow(mockMovement1),
                createSupabaseStockMovementRow(mockMovement2),
            ];

            mockQueryBuilder.select.mockResolvedValue({
                data: supabaseRows,
                error: null,
            });

            // Act
            const result = await stockMovementRepositorySupabase.list();

            // Assert
            expect(result).toHaveLength(2);
            expect(result[0]).toEqual(mockMovement1);
            expect(result[1]).toEqual(mockMovement2);
            expect(supabaseClient.from).toHaveBeenCalledWith("stock_movements");
            expect(mockQueryBuilder.select).toHaveBeenCalled();
        });

        it("should map all fields correctly (id, productId, quantity, source)", async () => {
            // Arrange
            const mockMovement = createMockStockMovement({
                id: "123e4567-e89b-4d3a-a456-426614174000" as StockMovementId,
                productId: "550e8400-e29b-41d4-a716-446655440000" as ProductId,
                quantity: -10,
                source: StockMovementSource.INVENTORY_ADJUSTMENT,
            });

            const supabaseRow = createSupabaseStockMovementRow(mockMovement);

            mockQueryBuilder.select.mockResolvedValue({
                data: [supabaseRow],
                error: null,
            });

            // Act
            const result = await stockMovementRepositorySupabase.list();

            // Assert
            expect(result[0]).toEqual(mockMovement);
            expect(result[0].id).toBe(mockMovement.id);
            expect(result[0].productId).toBe(mockMovement.productId);
            expect(result[0].quantity).toBe(mockMovement.quantity);
            expect(result[0].source).toBe(mockMovement.source);
        });

        it("should convert NUMERIC quantity string to number", async () => {
            // Arrange
            const mockMovement = createMockStockMovement({
                quantity: 15.5,
            });

            const supabaseRow = createSupabaseStockMovementRow(mockMovement);
            supabaseRow.quantity = "15.5"; // NUMERIC as string from Supabase

            mockQueryBuilder.select.mockResolvedValue({
                data: [supabaseRow],
                error: null,
            });

            // Act
            const result = await stockMovementRepositorySupabase.list();

            // Assert
            expect(result[0].quantity).toBe(15.5);
            expect(typeof result[0].quantity).toBe("number");
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
            await expect(stockMovementRepositorySupabase.list()).rejects.toThrow();
        });
    });

    describe("getById(id)", () => {
        it("should return stock movement when found", async () => {
            // Arrange
            const movementId = "123e4567-e89b-4d3a-a456-426614174000" as StockMovementId;
            const mockMovement = createMockStockMovement({ id: movementId });

            const supabaseRow = createSupabaseStockMovementRow(mockMovement);

            mockQueryBuilder.single.mockResolvedValue({
                data: supabaseRow,
                error: null,
            });

            // Act
            const result = await stockMovementRepositorySupabase.getById(movementId);

            // Assert
            expect(result).toEqual(mockMovement);
            expect(supabaseClient.from).toHaveBeenCalledWith("stock_movements");
            expect(mockQueryBuilder.select).toHaveBeenCalled();
            expect(mockQueryBuilder.eq).toHaveBeenCalledWith("id", movementId);
            expect(mockQueryBuilder.single).toHaveBeenCalled();
        });

        it("should return null when not found", async () => {
            // Arrange
            const movementId = "123e4567-e89b-4d3a-a456-426614174000" as StockMovementId;

            mockQueryBuilder.single.mockResolvedValue({
                data: null,
                error: null,
            });

            // Act
            const result = await stockMovementRepositorySupabase.getById(movementId);

            // Assert
            expect(result).toBeNull();
        });

        it("should handle PGRST116 error code and return null", async () => {
            // Arrange
            const movementId = "123e4567-e89b-4d3a-a456-426614174000" as StockMovementId;

            const supabaseError = {
                message: "Row not found",
                details: null,
                hint: null,
                code: "PGRST116",
            };

            mockQueryBuilder.single.mockResolvedValue({
                data: null,
                error: supabaseError,
            });

            // Act
            const result = await stockMovementRepositorySupabase.getById(movementId);

            // Assert
            expect(result).toBeNull();
        });

        it("should map stock movement to domain type correctly", async () => {
            // Arrange
            const movementId = "123e4567-e89b-4d3a-a456-426614174000" as StockMovementId;
            const mockMovement = createMockStockMovement({
                id: movementId,
                source: StockMovementSource.SALE,
                quantity: -5,
            });

            const supabaseRow = createSupabaseStockMovementRow(mockMovement);

            mockQueryBuilder.single.mockResolvedValue({
                data: supabaseRow,
                error: null,
            });

            // Act
            const result = await stockMovementRepositorySupabase.getById(movementId);

            // Assert
            expect(result).toEqual(mockMovement);
        });

        it("should propagate Supabase errors (non-PGRST116)", async () => {
            // Arrange
            const movementId = "123e4567-e89b-4d3a-a456-426614174000" as StockMovementId;
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
                stockMovementRepositorySupabase.getById(movementId)
            ).rejects.toThrow();
        });
    });

    describe("listByProduct(productId)", () => {
        it("should return empty array when no movements exist for product", async () => {
            // Arrange
            const productId = "550e8400-e29b-41d4-a716-446655440000" as ProductId;

            // Mock eq() to return the resolved value
            mockQueryBuilder.eq.mockResolvedValue({
                data: [],
                error: null,
            });

            // Act
            const result = await stockMovementRepositorySupabase.listByProduct(productId);

            // Assert
            expect(result).toEqual([]);
            expect(supabaseClient.from).toHaveBeenCalledWith("stock_movements");
            expect(mockQueryBuilder.select).toHaveBeenCalled();
            expect(mockQueryBuilder.eq).toHaveBeenCalledWith("product_id", productId);
        });

        it("should return all stock movements for product", async () => {
            // Arrange
            const productId = "550e8400-e29b-41d4-a716-446655440000" as ProductId;
            const mockMovement1 = createMockStockMovement({
                id: "123e4567-e89b-4d3a-a456-426614174000" as StockMovementId,
                productId,
                source: StockMovementSource.CREATION,
                quantity: 10,
            });
            const mockMovement2 = createMockStockMovement({
                id: "223e4567-e89b-4d3a-a456-426614174001" as StockMovementId,
                productId,
                source: StockMovementSource.SALE,
                quantity: -5,
            });

            const supabaseRows = [
                createSupabaseStockMovementRow(mockMovement1),
                createSupabaseStockMovementRow(mockMovement2),
            ];

            // Mock eq() to return the resolved value
            mockQueryBuilder.eq.mockResolvedValue({
                data: supabaseRows,
                error: null,
            });

            // Act
            const result = await stockMovementRepositorySupabase.listByProduct(productId);

            // Assert
            expect(result).toHaveLength(2);
            expect(result[0]).toEqual(mockMovement1);
            expect(result[1]).toEqual(mockMovement2);
            expect(mockQueryBuilder.eq).toHaveBeenCalledWith("product_id", productId);
        });

        it("should handle movements with different sources", async () => {
            // Arrange
            const productId = "550e8400-e29b-41d4-a716-446655440000" as ProductId;
            const movements = [
                createMockStockMovement({
                    productId,
                    source: StockMovementSource.CREATION,
                    quantity: 10,
                }),
                createMockStockMovement({
                    productId,
                    source: StockMovementSource.SALE,
                    quantity: -5,
                }),
                createMockStockMovement({
                    productId,
                    source: StockMovementSource.INVENTORY_ADJUSTMENT,
                    quantity: -2,
                }),
            ];

            const supabaseRows = movements.map(createSupabaseStockMovementRow);

            // Mock eq() to return the resolved value
            mockQueryBuilder.eq.mockResolvedValue({
                data: supabaseRows,
                error: null,
            });

            // Act
            const result = await stockMovementRepositorySupabase.listByProduct(productId);

            // Assert
            expect(result).toHaveLength(3);
            expect(result[0].source).toBe(StockMovementSource.CREATION);
            expect(result[1].source).toBe(StockMovementSource.SALE);
            expect(result[2].source).toBe(StockMovementSource.INVENTORY_ADJUSTMENT);
        });

        it("should propagate Supabase errors", async () => {
            // Arrange
            const productId = "550e8400-e29b-41d4-a716-446655440000" as ProductId;
            const supabaseError = {
                message: "Database connection error",
                details: "Connection timeout",
                hint: null,
                code: "PGRST116",
            };

            // Mock eq() to return the error
            mockQueryBuilder.eq.mockResolvedValue({
                data: null,
                error: supabaseError,
            });

            // Act & Assert
            await expect(
                stockMovementRepositorySupabase.listByProduct(productId)
            ).rejects.toThrow();
        });
    });

    describe("create(movement)", () => {
        it("should create stock movement and return with generated ID", async () => {
            // Arrange
            const newMovement = createMockStockMovement({
                id: undefined as unknown as StockMovementId, // No ID before creation
            });
            const generatedId = "123e4567-e89b-4d3a-a456-426614174000" as StockMovementId;

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id: _id, ...movementWithoutId } = newMovement;

            const createdRow = createSupabaseStockMovementRow({
                ...newMovement,
                id: generatedId,
            });

            mockQueryBuilder.single.mockResolvedValue({
                data: createdRow,
                error: null,
            });

            // Act
            const result = await stockMovementRepositorySupabase.create(movementWithoutId);

            // Assert
            expect(result.id).toBe(generatedId);
            expect(result.productId).toBe(newMovement.productId);
            expect(result.quantity).toBe(newMovement.quantity);
            expect(result.source).toBe(newMovement.source);
            expect(supabaseClient.from).toHaveBeenCalledWith("stock_movements");
            expect(mockQueryBuilder.insert).toHaveBeenCalled();
            expect(mockQueryBuilder.single).toHaveBeenCalled();
        });

        it("should map domain type to Supabase row correctly", async () => {
            // Arrange
            const newMovement = createMockStockMovement({
                source: StockMovementSource.SALE,
                productId: "550e8400-e29b-41d4-a716-446655440000" as ProductId,
                quantity: -5,
            });

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id: _id, ...movementWithoutId } = newMovement;
            const generatedId = "123e4567-e89b-4d3a-a456-426614174000" as StockMovementId;

            const createdRow = createSupabaseStockMovementRow({
                ...newMovement,
                id: generatedId,
            });

            mockQueryBuilder.single.mockResolvedValue({
                data: createdRow,
                error: null,
            });

            // Act
            const result = await stockMovementRepositorySupabase.create(movementWithoutId);

            // Assert
            expect(mockQueryBuilder.insert).toHaveBeenCalledWith(
                expect.objectContaining({
                    product_id: newMovement.productId,
                    quantity: newMovement.quantity,
                    source: newMovement.source,
                })
            );
            expect(result).toEqual({ ...newMovement, id: generatedId });
        });

        it("should handle all source types correctly", async () => {
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

                const createdRow = createSupabaseStockMovementRow({
                    ...newMovement,
                    id: generatedId,
                });

                mockQueryBuilder.single.mockResolvedValue({
                    data: createdRow,
                    error: null,
                });

                // Act
                const result = await stockMovementRepositorySupabase.create(movementWithoutId);

                // Assert
                expect(result.source).toBe(source);
                expect(mockQueryBuilder.insert).toHaveBeenCalledWith(
                    expect.objectContaining({
                        source,
                    })
                );
            }
        });

        it("should handle positive and negative quantities", async () => {
            // Arrange
            const testCases = [
                { quantity: 10, source: StockMovementSource.CREATION },
                { quantity: -5, source: StockMovementSource.SALE },
                { quantity: 3, source: StockMovementSource.INVENTORY_ADJUSTMENT },
                { quantity: -2, source: StockMovementSource.INVENTORY_ADJUSTMENT },
            ];

            for (const testCase of testCases) {
                jest.clearAllMocks();

                const newMovement = createMockStockMovement({
                    quantity: testCase.quantity,
                    source: testCase.source,
                });

                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { id: _id, ...movementWithoutId } = newMovement;
                const generatedId = "123e4567-e89b-4d3a-a456-426614174000" as StockMovementId;

                const createdRow = createSupabaseStockMovementRow({
                    ...newMovement,
                    id: generatedId,
                });

                mockQueryBuilder.single.mockResolvedValue({
                    data: createdRow,
                    error: null,
                });

                // Act
                const result = await stockMovementRepositorySupabase.create(movementWithoutId);

                // Assert
                expect(result.quantity).toBe(testCase.quantity);
            }
        });

        it("should propagate Supabase errors", async () => {
            // Arrange
            const newMovement = createMockStockMovement();
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id: _id, ...movementWithoutId } = newMovement;

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
                stockMovementRepositorySupabase.create(movementWithoutId)
            ).rejects.toThrow();
        });

        it("should handle validation errors from database constraints", async () => {
            // Arrange
            const newMovement = createMockStockMovement({
                source: StockMovementSource.SALE,
                // Missing productId (should fail constraint if enforced at DB level)
            });

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id: _id, ...movementWithoutId } = newMovement;

            const supabaseError = {
                message: "Check constraint violation",
                details: "Invalid source value",
                hint: null,
                code: "23514",
            };

            mockQueryBuilder.single.mockResolvedValue({
                data: null,
                error: supabaseError,
            });

            // Act & Assert
            await expect(
                stockMovementRepositorySupabase.create(movementWithoutId)
            ).rejects.toThrow();
        });

        it("should throw error when no data returned", async () => {
            // Arrange
            const newMovement = createMockStockMovement();
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id: _id, ...movementWithoutId } = newMovement;

            mockQueryBuilder.single.mockResolvedValue({
                data: null,
                error: null,
            });

            // Act & Assert
            await expect(
                stockMovementRepositorySupabase.create(movementWithoutId)
            ).rejects.toThrow("Stock movement creation failed: No data returned");
        });
    });
});

