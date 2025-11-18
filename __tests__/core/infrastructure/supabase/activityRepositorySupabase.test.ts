/**
 * Activity Repository Supabase Tests
 *
 * Tests for the Supabase implementation of ActivityRepository to ensure:
 * - Correct mapping between Supabase rows (snake_case) and domain types (camelCase)
 * - Proper error handling and propagation
 * - Type conversions (NUMERIC → number, TIMESTAMPTZ → ISO string, UUID → ActivityId)
 * - Null handling for optional fields (product_id, note)
 * - All CRUD operations work correctly
 *
 * ## Test Specification (Sub-Ticket 11.1)
 *
 * ### Test Structure
 * - Test file: `__tests__/core/infrastructure/supabase/activityRepositorySupabase.test.ts`
 * - Mock Supabase client: `__mocks__/infrastructure/supabase/client.ts`
 * - Domain fixtures: `__mocks__/core/domain/activity.ts`
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

import { activityRepositorySupabase } from "@/infrastructure/supabase/activityRepositorySupabase";
import { supabaseClient } from "@/infrastructure/supabase/client";
import type { Activity, ActivityId } from "@/core/domain/activity";
import { ActivityType } from "@/core/domain/activity";
import { createMockActivity } from "../../../../__mocks__/core/domain/activity";
import type { ProductId } from "@/core/domain/product";

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
 * Creates a Supabase row fixture (snake_case) from a domain Activity.
 *
 * This helper function creates test data in the format that Supabase returns,
 * with snake_case column names and proper type conversions.
 */
const createSupabaseActivityRow = (activity: Activity) => ({
    id: activity.id,
    product_id: activity.productId ?? null,
    type: activity.type,
    date: activity.date, // Already ISO string in domain
    quantity: activity.quantity.toString(), // NUMERIC as string from Supabase
    amount: activity.amount.toString(), // NUMERIC as string from Supabase
    note: activity.note ?? null,
});


describe("activityRepositorySupabase", () => {
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
        it("should return empty array when no activities exist", async () => {
            // Arrange
            mockQueryBuilder.select.mockResolvedValue({
                data: [],
                error: null,
            });

            // Act
            const result = await activityRepositorySupabase.list();

            // Assert
            expect(result).toEqual([]);
            expect(supabaseClient.from).toHaveBeenCalledWith("activities");
            expect(mockQueryBuilder.select).toHaveBeenCalled();
        });

        it("should return all activities mapped to domain types", async () => {
            // Arrange
            const mockActivity1 = createMockActivity({
                id: "123e4567-e89b-4d3a-a456-426614174000" as ActivityId,
                type: ActivityType.CREATION,
                productId: "550e8400-e29b-41d4-a716-446655440000" as ProductId,
            });
            const mockActivity2 = createMockActivity({
                id: "223e4567-e89b-4d3a-a456-426614174001" as ActivityId,
                type: ActivityType.SALE,
                quantity: -5,
            });

            const supabaseRows = [
                createSupabaseActivityRow(mockActivity1),
                createSupabaseActivityRow(mockActivity2),
            ];

            mockQueryBuilder.select.mockResolvedValue({
                data: supabaseRows,
                error: null,
            });

            // Act
            const result = await activityRepositorySupabase.list();

            // Assert
            expect(result).toHaveLength(2);
            expect(result[0]).toEqual(mockActivity1);
            expect(result[1]).toEqual(mockActivity2);
            expect(supabaseClient.from).toHaveBeenCalledWith("activities");
            expect(mockQueryBuilder.select).toHaveBeenCalled();
        });

        it("should handle activities with null product_id", async () => {
            // Arrange
            const mockActivity = createMockActivity({
                productId: undefined, // No productId
            });

            const supabaseRow = createSupabaseActivityRow(mockActivity);
            supabaseRow.product_id = null; // Explicitly null in database

            mockQueryBuilder.select.mockResolvedValue({
                data: [supabaseRow],
                error: null,
            });

            // Act
            const result = await activityRepositorySupabase.list();

            // Assert
            expect(result).toHaveLength(1);
            expect(result[0].productId).toBeUndefined();
            expect(result[0].id).toBe(mockActivity.id);
        });

        it("should handle activities with product_id", async () => {
            // Arrange
            const productId = "550e8400-e29b-41d4-a716-446655440000" as ProductId;
            const mockActivity = createMockActivity({
                productId,
            });

            const supabaseRow = createSupabaseActivityRow(mockActivity);

            mockQueryBuilder.select.mockResolvedValue({
                data: [supabaseRow],
                error: null,
            });

            // Act
            const result = await activityRepositorySupabase.list();

            // Assert
            expect(result).toHaveLength(1);
            expect(result[0].productId).toBe(productId);
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
            await expect(activityRepositorySupabase.list()).rejects.toThrow();
        });

        it("should map all fields correctly (id, date, type, productId, quantity, amount, note)", async () => {
            // Arrange
            const mockActivity = createMockActivity({
                id: "123e4567-e89b-4d3a-a456-426614174000" as ActivityId,
                date: "2025-01-27T14:00:00.000Z",
                type: ActivityType.STOCK_CORRECTION,
                productId: "550e8400-e29b-41d4-a716-446655440000" as ProductId,
                quantity: -10,
                amount: 99.99,
                note: "Stock correction note",
            });

            const supabaseRow = createSupabaseActivityRow(mockActivity);

            mockQueryBuilder.select.mockResolvedValue({
                data: [supabaseRow],
                error: null,
            });

            // Act
            const result = await activityRepositorySupabase.list();

            // Assert
            expect(result[0]).toEqual(mockActivity);
            expect(result[0].id).toBe(mockActivity.id);
            expect(result[0].date).toBe(mockActivity.date);
            expect(result[0].type).toBe(mockActivity.type);
            expect(result[0].productId).toBe(mockActivity.productId);
            expect(result[0].quantity).toBe(mockActivity.quantity);
            expect(result[0].amount).toBe(mockActivity.amount);
            expect(result[0].note).toBe(mockActivity.note);
        });
    });

    describe("getById(id)", () => {
        it("should return activity when found", async () => {
            // Arrange
            const activityId = "123e4567-e89b-4d3a-a456-426614174000" as ActivityId;
            const mockActivity = createMockActivity({ id: activityId });

            const supabaseRow = createSupabaseActivityRow(mockActivity);

            mockQueryBuilder.single.mockResolvedValue({
                data: supabaseRow,
                error: null,
            });

            // Act
            const result = await activityRepositorySupabase.getById(activityId);

            // Assert
            expect(result).toEqual(mockActivity);
            expect(supabaseClient.from).toHaveBeenCalledWith("activities");
            expect(mockQueryBuilder.select).toHaveBeenCalled();
            expect(mockQueryBuilder.eq).toHaveBeenCalledWith("id", activityId);
            expect(mockQueryBuilder.single).toHaveBeenCalled();
        });

        it("should return null when not found", async () => {
            // Arrange
            const activityId = "123e4567-e89b-4d3a-a456-426614174000" as ActivityId;

            mockQueryBuilder.single.mockResolvedValue({
                data: null,
                error: null,
            });

            // Act
            const result = await activityRepositorySupabase.getById(activityId);

            // Assert
            expect(result).toBeNull();
        });

        it("should map activity to domain type correctly", async () => {
            // Arrange
            const activityId = "123e4567-e89b-4d3a-a456-426614174000" as ActivityId;
            const mockActivity = createMockActivity({
                id: activityId,
                type: ActivityType.SALE,
                quantity: -5,
                amount: 49.99,
            });

            const supabaseRow = createSupabaseActivityRow(mockActivity);

            mockQueryBuilder.single.mockResolvedValue({
                data: supabaseRow,
                error: null,
            });

            // Act
            const result = await activityRepositorySupabase.getById(activityId);

            // Assert
            expect(result).toEqual(mockActivity);
        });

        it("should handle null product_id", async () => {
            // Arrange
            const activityId = "123e4567-e89b-4d3a-a456-426614174000" as ActivityId;
            const mockActivity = createMockActivity({
                id: activityId,
                productId: undefined,
            });

            const supabaseRow = createSupabaseActivityRow(mockActivity);
            supabaseRow.product_id = null;

            mockQueryBuilder.single.mockResolvedValue({
                data: supabaseRow,
                error: null,
            });

            // Act
            const result = await activityRepositorySupabase.getById(activityId);

            // Assert
            expect(result).not.toBeNull();
            expect(result?.productId).toBeUndefined();
        });

        it("should propagate Supabase errors", async () => {
            // Arrange
            const activityId = "123e4567-e89b-4d3a-a456-426614174000" as ActivityId;
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
                activityRepositorySupabase.getById(activityId)
            ).rejects.toThrow();
        });
    });

    describe("create(activity)", () => {
        it("should create activity and return with generated ID", async () => {
            // Arrange
            const newActivity = createMockActivity({
                id: undefined as unknown as ActivityId, // No ID before creation
            });
            const generatedId = "123e4567-e89b-4d3a-a456-426614174000" as ActivityId;

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id: _id, ...activityWithoutId } = newActivity;

            const createdRow = createSupabaseActivityRow({
                ...newActivity,
                id: generatedId,
            });

            mockQueryBuilder.single.mockResolvedValue({
                data: createdRow,
                error: null,
            });

            // Act
            const result = await activityRepositorySupabase.create(activityWithoutId);

            // Assert
            expect(result.id).toBe(generatedId);
            expect(result.date).toBe(newActivity.date);
            expect(result.type).toBe(newActivity.type);
            expect(supabaseClient.from).toHaveBeenCalledWith("activities");
            expect(mockQueryBuilder.insert).toHaveBeenCalled();
            expect(mockQueryBuilder.single).toHaveBeenCalled();
        });

        it("should map domain type to Supabase row correctly", async () => {
            // Arrange
            const newActivity = createMockActivity({
                type: ActivityType.SALE,
                productId: "550e8400-e29b-41d4-a716-446655440000" as ProductId,
                quantity: -5,
                amount: 99.99,
                note: "Test note",
            });

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id: _id, ...activityWithoutId } = newActivity;
            const generatedId = "123e4567-e89b-4d3a-a456-426614174000" as ActivityId;

            const createdRow = createSupabaseActivityRow({
                ...newActivity,
                id: generatedId,
            });

            mockQueryBuilder.single.mockResolvedValue({
                data: createdRow,
                error: null,
            });

            // Act
            const result = await activityRepositorySupabase.create(activityWithoutId);

            // Assert
            expect(mockQueryBuilder.insert).toHaveBeenCalledWith(
                expect.objectContaining({
                    date: newActivity.date,
                    type: newActivity.type,
                    product_id: newActivity.productId,
                    quantity: newActivity.quantity,
                    amount: newActivity.amount,
                    note: newActivity.note,
                })
            );
            expect(result).toEqual({ ...newActivity, id: generatedId });
        });

        it("should handle optional productId (null in database)", async () => {
            // Arrange
            const newActivity = createMockActivity({
                type: ActivityType.CREATION,
                productId: undefined, // Optional for CREATION
            });

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id: _id, ...activityWithoutId } = newActivity;
            const generatedId = "123e4567-e89b-4d3a-a456-426614174000" as ActivityId;

            const createdRow = createSupabaseActivityRow({
                ...newActivity,
                id: generatedId,
            });
            createdRow.product_id = null;

            mockQueryBuilder.single.mockResolvedValue({
                data: createdRow,
                error: null,
            });

            // Act
            const result = await activityRepositorySupabase.create(activityWithoutId);

            // Assert
            expect(result.productId).toBeUndefined();
            expect(mockQueryBuilder.insert).toHaveBeenCalledWith(
                expect.objectContaining({
                    product_id: null,
                })
            );
        });

        it("should handle optional note (null in database)", async () => {
            // Arrange
            const newActivity = createMockActivity({
                note: undefined, // Optional note
            });

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id: _id, ...activityWithoutId } = newActivity;
            const generatedId = "123e4567-e89b-4d3a-a456-426614174000" as ActivityId;

            const createdRow = createSupabaseActivityRow({
                ...newActivity,
                id: generatedId,
            });
            createdRow.note = null;

            mockQueryBuilder.single.mockResolvedValue({
                data: createdRow,
                error: null,
            });

            // Act
            const result = await activityRepositorySupabase.create(activityWithoutId);

            // Assert
            expect(result.note).toBeUndefined();
            expect(mockQueryBuilder.insert).toHaveBeenCalledWith(
                expect.objectContaining({
                    note: null,
                })
            );
        });

        it("should convert date ISO string to TIMESTAMPTZ", async () => {
            // Arrange
            const dateString = "2025-01-27T14:00:00.000Z";
            const newActivity = createMockActivity({
                date: dateString,
            });

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id: _id, ...activityWithoutId } = newActivity;
            const generatedId = "123e4567-e89b-4d3a-a456-426614174000" as ActivityId;

            const createdRow = createSupabaseActivityRow({
                ...newActivity,
                id: generatedId,
            });

            mockQueryBuilder.single.mockResolvedValue({
                data: createdRow,
                error: null,
            });

            // Act
            const result = await activityRepositorySupabase.create(activityWithoutId);

            // Assert
            expect(mockQueryBuilder.insert).toHaveBeenCalledWith(
                expect.objectContaining({
                    date: dateString,
                })
            );
            expect(result.date).toBe(dateString);
        });

        it("should propagate Supabase errors", async () => {
            // Arrange
            const newActivity = createMockActivity();
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id: _id, ...activityWithoutId } = newActivity;

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
                activityRepositorySupabase.create(activityWithoutId)
            ).rejects.toThrow();
        });

        it("should handle validation errors from database constraints", async () => {
            // Arrange
            const newActivity = createMockActivity({
                type: ActivityType.SALE,
                // Missing productId (should fail constraint if enforced at DB level)
            });

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id: _id, ...activityWithoutId } = newActivity;

            const supabaseError = {
                message: "Check constraint violation",
                details: "Type SALE requires product_id",
                hint: null,
                code: "23514",
            };

            mockQueryBuilder.single.mockResolvedValue({
                data: null,
                error: supabaseError,
            });

            // Act & Assert
            await expect(
                activityRepositorySupabase.create(activityWithoutId)
            ).rejects.toThrow();
        });
    });

    describe("update(id, updates)", () => {
        it("should update activity and return updated activity", async () => {
            // Arrange
            const activityId = "123e4567-e89b-4d3a-a456-426614174000" as ActivityId;
            const existingActivity = createMockActivity({ id: activityId });
            const updates = {
                quantity: -10,
                amount: 199.99,
            };

            const updatedActivity = {
                ...existingActivity,
                ...updates,
            };

            const updatedRow = createSupabaseActivityRow(updatedActivity);

            mockQueryBuilder.single.mockResolvedValue({
                data: updatedRow,
                error: null,
            });

            // Act
            const result = await activityRepositorySupabase.update(activityId, updates);

            // Assert
            expect(result).toEqual(updatedActivity);
            expect(supabaseClient.from).toHaveBeenCalledWith("activities");
            expect(mockQueryBuilder.update).toHaveBeenCalled();
            expect(mockQueryBuilder.eq).toHaveBeenCalledWith("id", activityId);
            expect(mockQueryBuilder.single).toHaveBeenCalled();
        });

        it("should handle partial updates", async () => {
            // Arrange
            const activityId = "123e4567-e89b-4d3a-a456-426614174000" as ActivityId;
            const existingActivity = createMockActivity({ id: activityId });
            const updates = {
                note: "Updated note",
            };

            const updatedActivity = {
                ...existingActivity,
                ...updates,
            };

            const updatedRow = createSupabaseActivityRow(updatedActivity);

            mockQueryBuilder.single.mockResolvedValue({
                data: updatedRow,
                error: null,
            });

            // Act
            const result = await activityRepositorySupabase.update(activityId, updates);

            // Assert
            expect(result.note).toBe("Updated note");
            expect(result.id).toBe(activityId);
            expect(mockQueryBuilder.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    note: "Updated note",
                })
            );
        });

        it("should map updates to Supabase row correctly", async () => {
            // Arrange
            const activityId = "123e4567-e89b-4d3a-a456-426614174000" as ActivityId;
            const existingActivity = createMockActivity({ id: activityId });
            const updates = {
                quantity: -15,
                amount: 299.99,
                type: ActivityType.SALE,
            };

            const updatedActivity = {
                ...existingActivity,
                ...updates,
            };

            const updatedRow = createSupabaseActivityRow(updatedActivity);

            mockQueryBuilder.single.mockResolvedValue({
                data: updatedRow,
                error: null,
            });

            // Act
            await activityRepositorySupabase.update(activityId, updates);

            // Assert
            expect(mockQueryBuilder.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    quantity: -15,
                    amount: 299.99,
                    type: ActivityType.SALE,
                })
            );
        });

        it("should handle setting productId to null", async () => {
            // Arrange
            const activityId = "123e4567-e89b-4d3a-a456-426614174000" as ActivityId;
            const existingActivity = createMockActivity({
                id: activityId,
                productId: "550e8400-e29b-41d4-a716-446655440000" as ProductId,
            });
            const updates = {
                productId: undefined, // Remove productId
            };

            const updatedActivity = {
                ...existingActivity,
                productId: undefined,
            };

            const updatedRow = createSupabaseActivityRow(updatedActivity);
            updatedRow.product_id = null;

            mockQueryBuilder.single.mockResolvedValue({
                data: updatedRow,
                error: null,
            });

            // Act
            const result = await activityRepositorySupabase.update(activityId, updates);

            // Assert
            expect(result.productId).toBeUndefined();
            expect(mockQueryBuilder.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    product_id: null,
                })
            );
        });

        it("should handle removing note (set to null)", async () => {
            // Arrange
            const activityId = "123e4567-e89b-4d3a-a456-426614174000" as ActivityId;
            const existingActivity = createMockActivity({
                id: activityId,
                note: "Original note",
            });
            const updates = {
                note: undefined, // Remove note
            };

            const updatedActivity = {
                ...existingActivity,
                note: undefined,
            };

            const updatedRow = createSupabaseActivityRow(updatedActivity);
            updatedRow.note = null;

            mockQueryBuilder.single.mockResolvedValue({
                data: updatedRow,
                error: null,
            });

            // Act
            const result = await activityRepositorySupabase.update(activityId, updates);

            // Assert
            expect(result.note).toBeUndefined();
            expect(mockQueryBuilder.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    note: null,
                })
            );
        });

        it("should throw error when activity not found", async () => {
            // Arrange
            const activityId = "123e4567-e89b-4d3a-a456-426614174000" as ActivityId;
            const updates = { quantity: -10 };

            // Supabase returns null data when not found
            mockQueryBuilder.single.mockResolvedValue({
                data: null,
                error: null,
            });

            // Act & Assert
            await expect(
                activityRepositorySupabase.update(activityId, updates)
            ).rejects.toThrow();
        });

        it("should propagate Supabase errors", async () => {
            // Arrange
            const activityId = "123e4567-e89b-4d3a-a456-426614174000" as ActivityId;
            const updates = { quantity: -10 };

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
                activityRepositorySupabase.update(activityId, updates)
            ).rejects.toThrow();
        });
    });
});

