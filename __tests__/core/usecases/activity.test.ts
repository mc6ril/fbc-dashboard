/**
 * Usecases Tests - Activity
 *
 * Tests for activity usecases to ensure business logic orchestration,
 * validation, error handling, and repository delegation work correctly.
 *
 * These tests verify:
 * - Business logic validation (productId requirements, date format, number validation)
 * - Repository delegation with proper parameters
 * - Error handling and transformation
 * - Success paths with valid inputs
 * - Edge cases and invalid inputs
 *
 * ## Test Specification (Sub-Ticket 9.6)
 *
 * ### Test Structure
 * - Test file: `__tests__/core/usecases/activity.test.ts`
 * - Mock repositories: `__mocks__/core/ports/activityRepository.ts`, `__mocks__/core/ports/productRepository.ts`
 * - Mock domain data: `__mocks__/core/domain/activity.ts`, `__mocks__/core/domain/product.ts`
 *
 * ### Test Coverage by Usecase
 *
 * #### addActivity (Sub-Ticket 9.1)
 * - 15 test cases covering:
 *   - Success paths (CREATION, SALE with productId)
 *   - Validation errors (missing productId for SALE/STOCK_CORRECTION, invalid date, invalid numbers)
 *   - Repository error propagation
 *   - Edge cases (zero quantity, negative amount for corrections, optional productId for CREATION/OTHER)
 *
 * #### listActivities (Sub-Ticket 9.2)
 * - 3 test cases covering:
 *   - Success path with activities returned
 *   - Success path with empty array
 *   - Repository error propagation
 *
 * #### updateActivity (Sub-Ticket 9.3)
 * - 13 test cases covering:
 *   - Success path with valid partial updates
 *   - Validation errors (updating type to SALE without productId, removing productId from SALE/STOCK_CORRECTION, invalid date/numbers)
 *   - Repository error propagation (activity not found, update failures)
 *   - Edge cases (empty updates, updating only optional fields, updating type with productId)
 *
 * #### computeStockFromActivities (Sub-Ticket 9.4)
 * - 11 test cases covering:
 *   - Success paths (multiple products, single product filter, empty list)
 *   - Correct stock calculation with positive and negative quantities
 *   - Activities without productId filtered out
 *   - Zero quantity handling
 *   - Multiple activities for same product summed correctly
 *   - Repository error propagation
 *   - Edge cases (all positive, all negative, mixed quantities)
 *
 * #### computeProfit (Sub-Ticket 9.5)
 * - 12 test cases covering:
 *   - Success paths (multiple sales, date range filtering, empty SALE list)
 *   - Correct profit calculation formula: (salePrice - unitCost) * abs(quantity)
 *   - Negative quantity handling (uses absolute value)
 *   - Missing products filtered out
 *   - Date range validation errors
 *   - Repository error propagation (activity and product repositories)
 *   - Edge cases (zero profit sales, multiple sales for same product)
 *
 * ### Coverage Targets
 * - Line Coverage: >90%
 * - Branch Coverage: >85%
 * - Function Coverage: 100% (all usecases tested)
 *
 * ### Test Mapping: AC → Tests
 * See planning document `report/planning/plan-fbc-9-implement-core-usecases.md` for detailed mapping.
 *
 * ### Mock Data Patterns
 * - Activities: `createMockActivity({ type, productId, quantity, amount, date })`
 * - Products: `createMockProduct({ id, salePrice, unitCost })`
 * - Repositories: `createMockActivityRepository()`, `createMockProductRepository()`
 *
 * ### Status
 * ✅ **tests: approved** - All test cases implemented and passing
 */

import type { ActivityRepository } from "@/core/ports/activityRepository";
import type { ActivityId } from "@/core/domain/activity";
import { ActivityType } from "@/core/domain/activity";
import {
    addActivity,
    listActivities,
    updateActivity,
    computeStockFromActivities,
    computeProfit,
} from "@/core/usecases/activity";
import { createMockActivity } from "../../../__mocks__/core/domain/activity";
import { createMockActivityRepository } from "../../../__mocks__/core/ports/activityRepository";
import { createMockProductRepository } from "../../../__mocks__/core/ports/productRepository";
import { createMockProduct } from "../../../__mocks__/core/domain/product";
import type { ProductId } from "@/core/domain/product";
import type { ProductRepository } from "@/core/ports/productRepository";

describe("Activity Usecases", () => {
    let mockRepo: jest.Mocked<ActivityRepository>;
    let mockProductRepo: jest.Mocked<ProductRepository>;

    beforeEach(() => {
        jest.clearAllMocks();
        mockRepo = createMockActivityRepository();
        mockProductRepo = createMockProductRepository();
    });

    describe("addActivity", () => {
        const validProductId = "550e8400-e29b-41d4-a716-446655440000" as ProductId;

        it("should successfully create activity with valid CREATION activity data", async () => {
            // Arrange
            const activityData = {
                date: "2025-01-27T14:00:00.000Z",
                type: ActivityType.CREATION,
                productId: validProductId,
                quantity: 10,
                amount: 50.0,
                note: "Product creation",
            };
            const createdActivity = createMockActivity({
                ...activityData,
                id: "created-id" as ActivityId,
            });
            mockRepo.create.mockResolvedValue(createdActivity);

            // Act
            const result = await addActivity(mockRepo, activityData);

            // Assert
            expect(mockRepo.create).toHaveBeenCalledTimes(1);
            expect(mockRepo.create).toHaveBeenCalledWith(activityData);
            expect(result).toEqual(createdActivity);
        });

        it("should successfully create activity with valid SALE activity (with productId)", async () => {
            // Arrange
            const activityData = {
                date: "2025-01-27T14:00:00.000Z",
                type: ActivityType.SALE,
                productId: validProductId,
                quantity: -5,
                amount: 99.95,
                note: "Sale to customer",
            };
            const createdActivity = createMockActivity({
                ...activityData,
                id: "created-id" as ActivityId,
            });
            mockRepo.create.mockResolvedValue(createdActivity);

            // Act
            const result = await addActivity(mockRepo, activityData);

            // Assert
            expect(mockRepo.create).toHaveBeenCalledTimes(1);
            expect(mockRepo.create).toHaveBeenCalledWith(activityData);
            expect(result).toEqual(createdActivity);
        });

        it("should throw validation error for missing productId on SALE type", async () => {
            // Arrange
            const activityData = {
                date: "2025-01-27T14:00:00.000Z",
                type: ActivityType.SALE,
                // productId is missing
                quantity: -5,
                amount: 99.95,
            };

            // Act & Assert
            await expect(addActivity(mockRepo, activityData)).rejects.toMatchObject({
                code: "VALIDATION_ERROR",
                message: "productId is required for SALE activity type",
            });
            expect(mockRepo.create).not.toHaveBeenCalled();
        });

        it("should throw validation error for missing productId on STOCK_CORRECTION type", async () => {
            // Arrange
            const activityData = {
                date: "2025-01-27T14:00:00.000Z",
                type: ActivityType.STOCK_CORRECTION,
                // productId is missing
                quantity: -2,
                amount: 0,
            };

            // Act & Assert
            await expect(addActivity(mockRepo, activityData)).rejects.toMatchObject({
                code: "VALIDATION_ERROR",
                message: "productId is required for STOCK_CORRECTION activity type",
            });
            expect(mockRepo.create).not.toHaveBeenCalled();
        });

        it("should throw validation error for invalid date format", async () => {
            // Arrange
            const activityData = {
                date: "invalid-date",
                type: ActivityType.CREATION,
                productId: validProductId,
                quantity: 10,
                amount: 50.0,
            };

            // Act & Assert
            await expect(addActivity(mockRepo, activityData)).rejects.toMatchObject({
                code: "VALIDATION_ERROR",
                message: "date must be a valid ISO 8601 string",
            });
            expect(mockRepo.create).not.toHaveBeenCalled();
        });

        it("should throw validation error for empty date string", async () => {
            // Arrange
            const activityData = {
                date: "",
                type: ActivityType.CREATION,
                productId: validProductId,
                quantity: 10,
                amount: 50.0,
            };

            // Act & Assert
            await expect(addActivity(mockRepo, activityData)).rejects.toMatchObject({
                code: "VALIDATION_ERROR",
                message: "date must be a valid ISO 8601 string",
            });
            expect(mockRepo.create).not.toHaveBeenCalled();
        });

        it("should throw validation error for invalid quantity (NaN)", async () => {
            // Arrange
            const activityData = {
                date: "2025-01-27T14:00:00.000Z",
                type: ActivityType.CREATION,
                productId: validProductId,
                quantity: NaN,
                amount: 50.0,
            };

            // Act & Assert
            await expect(addActivity(mockRepo, activityData)).rejects.toMatchObject({
                code: "VALIDATION_ERROR",
                message: "quantity must be a valid number",
            });
            expect(mockRepo.create).not.toHaveBeenCalled();
        });

        it("should throw validation error for invalid quantity (Infinity)", async () => {
            // Arrange
            const activityData = {
                date: "2025-01-27T14:00:00.000Z",
                type: ActivityType.CREATION,
                productId: validProductId,
                quantity: Infinity,
                amount: 50.0,
            };

            // Act & Assert
            await expect(addActivity(mockRepo, activityData)).rejects.toMatchObject({
                code: "VALIDATION_ERROR",
                message: "quantity must be a finite number",
            });
            expect(mockRepo.create).not.toHaveBeenCalled();
        });

        it("should throw validation error for invalid amount (NaN)", async () => {
            // Arrange
            const activityData = {
                date: "2025-01-27T14:00:00.000Z",
                type: ActivityType.CREATION,
                productId: validProductId,
                quantity: 10,
                amount: NaN,
            };

            // Act & Assert
            await expect(addActivity(mockRepo, activityData)).rejects.toMatchObject({
                code: "VALIDATION_ERROR",
                message: "amount must be a valid number",
            });
            expect(mockRepo.create).not.toHaveBeenCalled();
        });

        it("should throw validation error for invalid amount (Infinity)", async () => {
            // Arrange
            const activityData = {
                date: "2025-01-27T14:00:00.000Z",
                type: ActivityType.CREATION,
                productId: validProductId,
                quantity: 10,
                amount: Infinity,
            };

            // Act & Assert
            await expect(addActivity(mockRepo, activityData)).rejects.toMatchObject({
                code: "VALIDATION_ERROR",
                message: "amount must be a finite number",
            });
            expect(mockRepo.create).not.toHaveBeenCalled();
        });

        it("should propagate repository error when creation fails", async () => {
            // Arrange
            const activityData = {
                date: "2025-01-27T14:00:00.000Z",
                type: ActivityType.CREATION,
                productId: validProductId,
                quantity: 10,
                amount: 50.0,
            };
            const repositoryError = new Error("Database connection failed");
            mockRepo.create.mockRejectedValue(repositoryError);

            // Act & Assert
            await expect(addActivity(mockRepo, activityData)).rejects.toEqual(
                repositoryError
            );
            expect(mockRepo.create).toHaveBeenCalledTimes(1);
            expect(mockRepo.create).toHaveBeenCalledWith(activityData);
        });

        it("should accept zero quantity (allowed)", async () => {
            // Arrange
            const activityData = {
                date: "2025-01-27T14:00:00.000Z",
                type: ActivityType.CREATION,
                productId: validProductId,
                quantity: 0,
                amount: 50.0,
            };
            const createdActivity = createMockActivity({
                ...activityData,
                id: "created-id" as ActivityId,
            });
            mockRepo.create.mockResolvedValue(createdActivity);

            // Act
            const result = await addActivity(mockRepo, activityData);

            // Assert
            expect(mockRepo.create).toHaveBeenCalledWith(activityData);
            expect(result).toEqual(createdActivity);
        });

        it("should accept negative amount for STOCK_CORRECTION (allowed)", async () => {
            // Arrange
            const activityData = {
                date: "2025-01-27T14:00:00.000Z",
                type: ActivityType.STOCK_CORRECTION,
                productId: validProductId,
                quantity: -2,
                amount: -10.0, // Negative amount allowed for corrections
            };
            const createdActivity = createMockActivity({
                ...activityData,
                id: "created-id" as ActivityId,
            });
            mockRepo.create.mockResolvedValue(createdActivity);

            // Act
            const result = await addActivity(mockRepo, activityData);

            // Assert
            expect(mockRepo.create).toHaveBeenCalledWith(activityData);
            expect(result).toEqual(createdActivity);
        });

        it("should accept CREATION activity without productId (optional)", async () => {
            // Arrange
            const activityData = {
                date: "2025-01-27T14:00:00.000Z",
                type: ActivityType.CREATION,
                // productId is optional for CREATION
                quantity: 10,
                amount: 50.0,
            };
            const createdActivity = createMockActivity({
                ...activityData,
                id: "created-id" as ActivityId,
            });
            mockRepo.create.mockResolvedValue(createdActivity);

            // Act
            const result = await addActivity(mockRepo, activityData);

            // Assert
            expect(mockRepo.create).toHaveBeenCalledWith(activityData);
            expect(result).toEqual(createdActivity);
        });

        it("should accept OTHER activity without productId (optional)", async () => {
            // Arrange
            const activityData = {
                date: "2025-01-27T14:00:00.000Z",
                type: ActivityType.OTHER,
                // productId is optional for OTHER
                quantity: 0,
                amount: 0,
                note: "Other activity",
            };
            const createdActivity = createMockActivity({
                ...activityData,
                id: "created-id" as ActivityId,
            });
            mockRepo.create.mockResolvedValue(createdActivity);

            // Act
            const result = await addActivity(mockRepo, activityData);

            // Assert
            expect(mockRepo.create).toHaveBeenCalledWith(activityData);
            expect(result).toEqual(createdActivity);
        });
    });

    describe("listActivities", () => {
        it("should successfully return activities array", async () => {
            // Arrange
            const activity1 = createMockActivity({
                id: "activity-1" as ActivityId,
                type: ActivityType.CREATION,
            });
            const activity2 = createMockActivity({
                id: "activity-2" as ActivityId,
                type: ActivityType.SALE,
            });
            mockRepo.list.mockResolvedValue([activity1, activity2]);

            // Act
            const result = await listActivities(mockRepo);

            // Assert
            expect(mockRepo.list).toHaveBeenCalledTimes(1);
            expect(mockRepo.list).toHaveBeenCalledWith();
            expect(result).toEqual([activity1, activity2]);
            expect(result).toHaveLength(2);
        });

        it("should successfully return empty array when no activities exist", async () => {
            // Arrange
            mockRepo.list.mockResolvedValue([]);

            // Act
            const result = await listActivities(mockRepo);

            // Assert
            expect(mockRepo.list).toHaveBeenCalledTimes(1);
            expect(mockRepo.list).toHaveBeenCalledWith();
            expect(result).toEqual([]);
            expect(result).toHaveLength(0);
        });

        it("should propagate repository error when retrieval fails", async () => {
            // Arrange
            const repositoryError = new Error("Database connection failed");
            mockRepo.list.mockRejectedValue(repositoryError);

            // Act & Assert
            await expect(listActivities(mockRepo)).rejects.toEqual(
                repositoryError
            );
            expect(mockRepo.list).toHaveBeenCalledTimes(1);
            expect(mockRepo.list).toHaveBeenCalledWith();
        });
    });

    describe("updateActivity", () => {
        const validProductId = "550e8400-e29b-41d4-a716-446655440000" as ProductId;
        const activityId = "123e4567-e89b-4d3a-a456-426614174000" as ActivityId;

        it("should successfully update activity with valid partial updates", async () => {
            // Arrange
            const existingActivity = createMockActivity({
                id: activityId,
                type: ActivityType.CREATION,
                quantity: 10,
                amount: 50.0,
            });
            const updates = {
                quantity: 15,
                amount: 75.0,
                note: "Updated note",
            };
            const updatedActivity = createMockActivity({
                ...existingActivity,
                ...updates,
            });
            mockRepo.getById.mockResolvedValue(existingActivity);
            mockRepo.update.mockResolvedValue(updatedActivity);

            // Act
            const result = await updateActivity(mockRepo, activityId, updates);

            // Assert
            expect(mockRepo.getById).toHaveBeenCalledTimes(1);
            expect(mockRepo.getById).toHaveBeenCalledWith(activityId);
            expect(mockRepo.update).toHaveBeenCalledTimes(1);
            expect(mockRepo.update).toHaveBeenCalledWith(activityId, updates);
            expect(result).toEqual(updatedActivity);
        });

        it("should throw validation error when updating type to SALE without productId", async () => {
            // Arrange
            const existingActivity = createMockActivity({
                id: activityId,
                type: ActivityType.CREATION,
                productId: undefined, // No productId (optional for CREATION)
            });
            const updates = {
                type: ActivityType.SALE,
                // productId is missing
            };
            mockRepo.getById.mockResolvedValue(existingActivity);

            // Act & Assert
            await expect(
                updateActivity(mockRepo, activityId, updates)
            ).rejects.toMatchObject({
                code: "VALIDATION_ERROR",
                message: "productId is required for SALE activity type",
            });
            expect(mockRepo.getById).toHaveBeenCalledTimes(1);
            expect(mockRepo.update).not.toHaveBeenCalled();
        });

        it("should throw validation error when removing productId from SALE activity", async () => {
            // Arrange
            const existingActivity = createMockActivity({
                id: activityId,
                type: ActivityType.SALE,
                productId: validProductId,
            });
            const updates = {
                productId: undefined, // Explicitly removing productId
            };
            mockRepo.getById.mockResolvedValue(existingActivity);

            // Act & Assert
            await expect(
                updateActivity(mockRepo, activityId, updates)
            ).rejects.toMatchObject({
                code: "VALIDATION_ERROR",
                message: "Cannot remove productId from SALE activity type",
            });
            expect(mockRepo.getById).toHaveBeenCalledTimes(1);
            expect(mockRepo.update).not.toHaveBeenCalled();
        });

        it("should throw validation error when removing productId from STOCK_CORRECTION activity", async () => {
            // Arrange
            const existingActivity = createMockActivity({
                id: activityId,
                type: ActivityType.STOCK_CORRECTION,
                productId: validProductId,
            });
            const updates = {
                productId: undefined, // Explicitly removing productId
            };
            mockRepo.getById.mockResolvedValue(existingActivity);

            // Act & Assert
            await expect(
                updateActivity(mockRepo, activityId, updates)
            ).rejects.toMatchObject({
                code: "VALIDATION_ERROR",
                message: "Cannot remove productId from STOCK_CORRECTION activity type",
            });
            expect(mockRepo.getById).toHaveBeenCalledTimes(1);
            expect(mockRepo.update).not.toHaveBeenCalled();
        });

        it("should throw validation error for invalid date format in updates", async () => {
            // Arrange
            const existingActivity = createMockActivity({
                id: activityId,
            });
            const updates = {
                date: "invalid-date",
            };
            mockRepo.getById.mockResolvedValue(existingActivity);

            // Act & Assert
            await expect(
                updateActivity(mockRepo, activityId, updates)
            ).rejects.toMatchObject({
                code: "VALIDATION_ERROR",
                message: "date must be a valid ISO 8601 string",
            });
            expect(mockRepo.getById).toHaveBeenCalledTimes(1);
            expect(mockRepo.update).not.toHaveBeenCalled();
        });

        it("should throw validation error for invalid quantity (NaN) in updates", async () => {
            // Arrange
            const existingActivity = createMockActivity({
                id: activityId,
            });
            const updates = {
                quantity: NaN,
            };
            mockRepo.getById.mockResolvedValue(existingActivity);

            // Act & Assert
            await expect(
                updateActivity(mockRepo, activityId, updates)
            ).rejects.toMatchObject({
                code: "VALIDATION_ERROR",
                message: "quantity must be a valid number",
            });
            expect(mockRepo.getById).toHaveBeenCalledTimes(1);
            expect(mockRepo.update).not.toHaveBeenCalled();
        });

        it("should throw validation error for invalid quantity (Infinity) in updates", async () => {
            // Arrange
            const existingActivity = createMockActivity({
                id: activityId,
            });
            const updates = {
                quantity: Infinity,
            };
            mockRepo.getById.mockResolvedValue(existingActivity);

            // Act & Assert
            await expect(
                updateActivity(mockRepo, activityId, updates)
            ).rejects.toMatchObject({
                code: "VALIDATION_ERROR",
                message: "quantity must be a finite number",
            });
            expect(mockRepo.getById).toHaveBeenCalledTimes(1);
            expect(mockRepo.update).not.toHaveBeenCalled();
        });

        it("should throw validation error for invalid amount (NaN) in updates", async () => {
            // Arrange
            const existingActivity = createMockActivity({
                id: activityId,
            });
            const updates = {
                amount: NaN,
            };
            mockRepo.getById.mockResolvedValue(existingActivity);

            // Act & Assert
            await expect(
                updateActivity(mockRepo, activityId, updates)
            ).rejects.toMatchObject({
                code: "VALIDATION_ERROR",
                message: "amount must be a valid number",
            });
            expect(mockRepo.getById).toHaveBeenCalledTimes(1);
            expect(mockRepo.update).not.toHaveBeenCalled();
        });

        it("should throw validation error for invalid amount (Infinity) in updates", async () => {
            // Arrange
            const existingActivity = createMockActivity({
                id: activityId,
            });
            const updates = {
                amount: Infinity,
            };
            mockRepo.getById.mockResolvedValue(existingActivity);

            // Act & Assert
            await expect(
                updateActivity(mockRepo, activityId, updates)
            ).rejects.toMatchObject({
                code: "VALIDATION_ERROR",
                message: "amount must be a finite number",
            });
            expect(mockRepo.getById).toHaveBeenCalledTimes(1);
            expect(mockRepo.update).not.toHaveBeenCalled();
        });

        it("should throw error when activity not found", async () => {
            // Arrange
            mockRepo.getById.mockResolvedValue(null);

            // Act & Assert
            await expect(
                updateActivity(mockRepo, activityId, { quantity: 10 })
            ).rejects.toThrow(`Activity with id ${activityId} not found`);
            expect(mockRepo.getById).toHaveBeenCalledTimes(1);
            expect(mockRepo.getById).toHaveBeenCalledWith(activityId);
            expect(mockRepo.update).not.toHaveBeenCalled();
        });

        it("should propagate repository error when update fails", async () => {
            // Arrange
            const existingActivity = createMockActivity({
                id: activityId,
            });
            const updates = {
                quantity: 10,
            };
            const repositoryError = new Error("Database connection failed");
            mockRepo.getById.mockResolvedValue(existingActivity);
            mockRepo.update.mockRejectedValue(repositoryError);

            // Act & Assert
            await expect(
                updateActivity(mockRepo, activityId, updates)
            ).rejects.toEqual(repositoryError);
            expect(mockRepo.getById).toHaveBeenCalledTimes(1);
            expect(mockRepo.update).toHaveBeenCalledTimes(1);
            expect(mockRepo.update).toHaveBeenCalledWith(activityId, updates);
        });

        it("should accept empty updates object (no-op update)", async () => {
            // Arrange
            const existingActivity = createMockActivity({
                id: activityId,
            });
            const updates = {};
            mockRepo.getById.mockResolvedValue(existingActivity);
            mockRepo.update.mockResolvedValue(existingActivity);

            // Act
            const result = await updateActivity(mockRepo, activityId, updates);

            // Assert
            expect(mockRepo.getById).toHaveBeenCalledTimes(1);
            expect(mockRepo.update).toHaveBeenCalledTimes(1);
            expect(mockRepo.update).toHaveBeenCalledWith(activityId, updates);
            expect(result).toEqual(existingActivity);
        });

        it("should accept updating only optional fields", async () => {
            // Arrange
            const existingActivity = createMockActivity({
                id: activityId,
                type: ActivityType.CREATION,
            });
            const updates = {
                note: "Updated note only",
            };
            const updatedActivity = createMockActivity({
                ...existingActivity,
                ...updates,
            });
            mockRepo.getById.mockResolvedValue(existingActivity);
            mockRepo.update.mockResolvedValue(updatedActivity);

            // Act
            const result = await updateActivity(mockRepo, activityId, updates);

            // Assert
            expect(mockRepo.update).toHaveBeenCalledWith(activityId, updates);
            expect(result).toEqual(updatedActivity);
        });

        it("should accept updating type to SALE with productId", async () => {
            // Arrange
            const existingActivity = createMockActivity({
                id: activityId,
                type: ActivityType.CREATION,
                productId: validProductId,
            });
            const updates = {
                type: ActivityType.SALE,
                productId: validProductId, // productId provided
            };
            const updatedActivity = createMockActivity({
                ...existingActivity,
                ...updates,
            });
            mockRepo.getById.mockResolvedValue(existingActivity);
            mockRepo.update.mockResolvedValue(updatedActivity);

            // Act
            const result = await updateActivity(mockRepo, activityId, updates);

            // Assert
            expect(mockRepo.update).toHaveBeenCalledWith(activityId, updates);
            expect(result).toEqual(updatedActivity);
        });

        it("should accept updating type to STOCK_CORRECTION with productId", async () => {
            // Arrange
            const existingActivity = createMockActivity({
                id: activityId,
                type: ActivityType.CREATION,
                productId: validProductId,
            });
            const updates = {
                type: ActivityType.STOCK_CORRECTION,
                productId: validProductId, // productId provided
            };
            const updatedActivity = createMockActivity({
                ...existingActivity,
                ...updates,
            });
            mockRepo.getById.mockResolvedValue(existingActivity);
            mockRepo.update.mockResolvedValue(updatedActivity);

            // Act
            const result = await updateActivity(mockRepo, activityId, updates);

            // Assert
            expect(mockRepo.update).toHaveBeenCalledWith(activityId, updates);
            expect(result).toEqual(updatedActivity);
        });
    });

    describe("computeStockFromActivities", () => {
        const productId1 = "550e8400-e29b-41d4-a716-446655440000" as ProductId;
        const productId2 = "660e8400-e29b-41d4-a716-446655440001" as ProductId;

        it("should successfully compute stock for multiple products with activities", async () => {
            // Arrange
            const activities = [
                createMockActivity({
                    productId: productId1,
                    quantity: 10, // +10
                }),
                createMockActivity({
                    productId: productId1,
                    quantity: -5, // -5
                }),
                createMockActivity({
                    productId: productId2,
                    quantity: 20, // +20
                }),
                createMockActivity({
                    productId: productId2,
                    quantity: -3, // -3
                }),
            ];
            mockRepo.list.mockResolvedValue(activities);

            // Act
            const result = await computeStockFromActivities(mockRepo);

            // Assert
            expect(mockRepo.list).toHaveBeenCalledTimes(1);
            expect(result).toEqual({
                [productId1]: 5, // 10 - 5
                [productId2]: 17, // 20 - 3
            });
        });

        it("should successfully compute stock for single product filter", async () => {
            // Arrange
            const activities = [
                createMockActivity({
                    productId: productId1,
                    quantity: 10,
                }),
                createMockActivity({
                    productId: productId1,
                    quantity: -5,
                }),
                createMockActivity({
                    productId: productId2,
                    quantity: 20, // Should be filtered out
                }),
            ];
            mockRepo.list.mockResolvedValue(activities);

            // Act
            const result = await computeStockFromActivities(mockRepo, productId1);

            // Assert
            expect(mockRepo.list).toHaveBeenCalledTimes(1);
            expect(result).toEqual({
                [productId1]: 5, // 10 - 5
            });
            expect(result[productId2]).toBeUndefined();
        });

        it("should successfully return empty map when no activities exist", async () => {
            // Arrange
            mockRepo.list.mockResolvedValue([]);

            // Act
            const result = await computeStockFromActivities(mockRepo);

            // Assert
            expect(mockRepo.list).toHaveBeenCalledTimes(1);
            expect(result).toEqual({});
            expect(Object.keys(result)).toHaveLength(0);
        });

        it("should correctly calculate stock with positive and negative quantities", async () => {
            // Arrange
            const activities = [
                createMockActivity({
                    productId: productId1,
                    quantity: 100, // +100
                }),
                createMockActivity({
                    productId: productId1,
                    quantity: -25, // -25
                }),
                createMockActivity({
                    productId: productId1,
                    quantity: 50, // +50
                }),
                createMockActivity({
                    productId: productId1,
                    quantity: -10, // -10
                }),
            ];
            mockRepo.list.mockResolvedValue(activities);

            // Act
            const result = await computeStockFromActivities(mockRepo);

            // Assert
            expect(result[productId1]).toBe(115); // 100 - 25 + 50 - 10
        });

        it("should filter out activities without productId", async () => {
            // Arrange
            const activities = [
                createMockActivity({
                    productId: productId1,
                    quantity: 10,
                }),
                createMockActivity({
                    productId: undefined, // No productId - should be filtered out
                    quantity: 5,
                    type: ActivityType.CREATION,
                }),
                createMockActivity({
                    productId: undefined, // No productId - should be filtered out
                    quantity: -3,
                    type: ActivityType.OTHER,
                }),
            ];
            mockRepo.list.mockResolvedValue(activities);

            // Act
            const result = await computeStockFromActivities(mockRepo);

            // Assert
            expect(result).toEqual({
                [productId1]: 10,
            });
            expect(Object.keys(result)).toHaveLength(1);
        });

        it("should include activities with zero quantity in sum", async () => {
            // Arrange
            const activities = [
                createMockActivity({
                    productId: productId1,
                    quantity: 10,
                }),
                createMockActivity({
                    productId: productId1,
                    quantity: 0, // Zero quantity - should be included
                }),
                createMockActivity({
                    productId: productId1,
                    quantity: -5,
                }),
            ];
            mockRepo.list.mockResolvedValue(activities);

            // Act
            const result = await computeStockFromActivities(mockRepo);

            // Assert
            expect(result[productId1]).toBe(5); // 10 + 0 - 5
        });

        it("should correctly sum multiple activities for same product", async () => {
            // Arrange
            const activities = [
                createMockActivity({
                    productId: productId1,
                    quantity: 5,
                }),
                createMockActivity({
                    productId: productId1,
                    quantity: -2,
                }),
                createMockActivity({
                    productId: productId1,
                    quantity: 10,
                }),
            ];
            mockRepo.list.mockResolvedValue(activities);

            // Act
            const result = await computeStockFromActivities(mockRepo);

            // Assert
            expect(result[productId1]).toBe(13); // 5 - 2 + 10
        });

        it("should propagate repository error when retrieval fails", async () => {
            // Arrange
            const repositoryError = new Error("Database connection failed");
            mockRepo.list.mockRejectedValue(repositoryError);

            // Act & Assert
            await expect(computeStockFromActivities(mockRepo)).rejects.toEqual(
                repositoryError
            );
            expect(mockRepo.list).toHaveBeenCalledTimes(1);
        });

        it("should handle edge case: all positive quantities", async () => {
            // Arrange
            const activities = [
                createMockActivity({
                    productId: productId1,
                    quantity: 10,
                }),
                createMockActivity({
                    productId: productId1,
                    quantity: 5,
                }),
                createMockActivity({
                    productId: productId1,
                    quantity: 3,
                }),
            ];
            mockRepo.list.mockResolvedValue(activities);

            // Act
            const result = await computeStockFromActivities(mockRepo);

            // Assert
            expect(result[productId1]).toBe(18); // 10 + 5 + 3
        });

        it("should handle edge case: all negative quantities", async () => {
            // Arrange
            const activities = [
                createMockActivity({
                    productId: productId1,
                    quantity: -10,
                }),
                createMockActivity({
                    productId: productId1,
                    quantity: -5,
                }),
                createMockActivity({
                    productId: productId1,
                    quantity: -3,
                }),
            ];
            mockRepo.list.mockResolvedValue(activities);

            // Act
            const result = await computeStockFromActivities(mockRepo);

            // Assert
            expect(result[productId1]).toBe(-18); // -10 - 5 - 3
        });

        it("should handle edge case: mixed positive and negative quantities", async () => {
            // Arrange
            const activities = [
                createMockActivity({
                    productId: productId1,
                    quantity: 100,
                }),
                createMockActivity({
                    productId: productId1,
                    quantity: -50,
                }),
                createMockActivity({
                    productId: productId1,
                    quantity: 25,
                }),
                createMockActivity({
                    productId: productId1,
                    quantity: -10,
                }),
                createMockActivity({
                    productId: productId1,
                    quantity: -5,
                }),
            ];
            mockRepo.list.mockResolvedValue(activities);

            // Act
            const result = await computeStockFromActivities(mockRepo);

            // Assert
            expect(result[productId1]).toBe(60); // 100 - 50 + 25 - 10 - 5
        });
    });

    describe("computeProfit", () => {
        const productId1 = "550e8400-e29b-41d4-a716-446655440000" as ProductId;
        const productId2 = "660e8400-e29b-41d4-a716-446655440001" as ProductId;

        it("should successfully compute profit for multiple sales with products", async () => {
            // Arrange
            const product1 = createMockProduct({
                id: productId1,
                salePrice: 20.0,
                unitCost: 10.0,
            });
            const product2 = createMockProduct({
                id: productId2,
                salePrice: 25.0,
                unitCost: 15.0,
            });
            const activities = [
                createMockActivity({
                    type: ActivityType.SALE,
                    productId: productId1,
                    quantity: -2, // 2 units sold
                    date: "2025-01-27T14:00:00.000Z",
                }),
                createMockActivity({
                    type: ActivityType.SALE,
                    productId: productId2,
                    quantity: -3, // 3 units sold
                    date: "2025-01-27T15:00:00.000Z",
                }),
            ];
            mockRepo.list.mockResolvedValue(activities);
            mockProductRepo.list.mockResolvedValue([product1, product2]);

            // Act
            const result = await computeProfit(mockRepo, mockProductRepo);

            // Assert
            expect(mockRepo.list).toHaveBeenCalledTimes(1);
            expect(mockProductRepo.list).toHaveBeenCalledTimes(1);
            // Profit = (20-10)*2 + (25-15)*3 = 20 + 30 = 50
            expect(result).toBe(50);
        });

        it("should successfully compute profit with date range filtering", async () => {
            // Arrange
            const product1 = createMockProduct({
                id: productId1,
                salePrice: 20.0,
                unitCost: 10.0,
            });
            const activities = [
                createMockActivity({
                    type: ActivityType.SALE,
                    productId: productId1,
                    quantity: -2,
                    date: "2025-01-15T14:00:00.000Z", // Before range
                }),
                createMockActivity({
                    type: ActivityType.SALE,
                    productId: productId1,
                    quantity: -3,
                    date: "2025-01-20T14:00:00.000Z", // In range
                }),
                createMockActivity({
                    type: ActivityType.SALE,
                    productId: productId1,
                    quantity: -1,
                    date: "2025-01-25T14:00:00.000Z", // In range
                }),
                createMockActivity({
                    type: ActivityType.SALE,
                    productId: productId1,
                    quantity: -5,
                    date: "2025-02-01T14:00:00.000Z", // After range
                }),
            ];
            mockRepo.list.mockResolvedValue(activities);
            mockProductRepo.list.mockResolvedValue([product1]);

            // Act
            const result = await computeProfit(
                mockRepo,
                mockProductRepo,
                "2025-01-20T00:00:00.000Z",
                "2025-01-31T23:59:59.999Z"
            );

            // Assert
            // Only activities in range: 3 + 1 = 4 units
            // Profit = (20-10)*4 = 40
            expect(result).toBe(40);
        });

        it("should successfully return 0 when no SALE activities exist", async () => {
            // Arrange
            const activities = [
                createMockActivity({
                    type: ActivityType.CREATION,
                    productId: productId1,
                    quantity: 10,
                }),
                createMockActivity({
                    type: ActivityType.STOCK_CORRECTION,
                    productId: productId1,
                    quantity: -2,
                }),
            ];
            mockRepo.list.mockResolvedValue(activities);
            mockProductRepo.list.mockResolvedValue([]);

            // Act
            const result = await computeProfit(mockRepo, mockProductRepo);

            // Assert
            expect(result).toBe(0);
        });

        it("should correctly calculate profit using formula: (salePrice - unitCost) * abs(quantity)", async () => {
            // Arrange
            const product1 = createMockProduct({
                id: productId1,
                salePrice: 25.0,
                unitCost: 15.0,
            });
            const activities = [
                createMockActivity({
                    type: ActivityType.SALE,
                    productId: productId1,
                    quantity: -3, // 3 units sold
                    date: "2025-01-27T14:00:00.000Z",
                }),
            ];
            mockRepo.list.mockResolvedValue(activities);
            mockProductRepo.list.mockResolvedValue([product1]);

            // Act
            const result = await computeProfit(mockRepo, mockProductRepo);

            // Assert
            // Profit = (25-15)*3 = 30
            expect(result).toBe(30);
        });

        it("should handle negative quantity correctly (uses absolute value)", async () => {
            // Arrange
            const product1 = createMockProduct({
                id: productId1,
                salePrice: 20.0,
                unitCost: 10.0,
            });
            const activities = [
                createMockActivity({
                    type: ActivityType.SALE,
                    productId: productId1,
                    quantity: -5, // Negative quantity (typical for sales)
                    date: "2025-01-27T14:00:00.000Z",
                }),
            ];
            mockRepo.list.mockResolvedValue(activities);
            mockProductRepo.list.mockResolvedValue([product1]);

            // Act
            const result = await computeProfit(mockRepo, mockProductRepo);

            // Assert
            // Profit = (20-10)*5 = 50 (uses absolute value of -5)
            expect(result).toBe(50);
        });

        it("should filter out sales with missing products", async () => {
            // Arrange
            const product1 = createMockProduct({
                id: productId1,
                salePrice: 20.0,
                unitCost: 10.0,
            });
            const activities = [
                createMockActivity({
                    type: ActivityType.SALE,
                    productId: productId1,
                    quantity: -2,
                    date: "2025-01-27T14:00:00.000Z",
                }),
                createMockActivity({
                    type: ActivityType.SALE,
                    productId: productId2, // Product not in repository
                    quantity: -3,
                    date: "2025-01-27T15:00:00.000Z",
                }),
            ];
            mockRepo.list.mockResolvedValue(activities);
            mockProductRepo.list.mockResolvedValue([product1]); // Only product1, product2 is missing

            // Act
            const result = await computeProfit(mockRepo, mockProductRepo);

            // Assert
            // Only product1 sale is included: (20-10)*2 = 20
            // product2 sale is filtered out (missing product)
            expect(result).toBe(20);
        });

        it("should throw validation error for invalid startDate format", async () => {
            // Arrange
            mockRepo.list.mockResolvedValue([]);

            // Act & Assert
            await expect(
                computeProfit(mockRepo, mockProductRepo, "invalid-date")
            ).rejects.toMatchObject({
                code: "VALIDATION_ERROR",
                message: "startDate must be a valid ISO 8601 string",
            });
            expect(mockRepo.list).not.toHaveBeenCalled();
        });

        it("should throw validation error for invalid endDate format", async () => {
            // Arrange
            mockRepo.list.mockResolvedValue([]);

            // Act & Assert
            await expect(
                computeProfit(
                    mockRepo,
                    mockProductRepo,
                    undefined,
                    "invalid-date"
                )
            ).rejects.toMatchObject({
                code: "VALIDATION_ERROR",
                message: "endDate must be a valid ISO 8601 string",
            });
            expect(mockRepo.list).not.toHaveBeenCalled();
        });

        it("should propagate repository error when activity retrieval fails", async () => {
            // Arrange
            const repositoryError = new Error("Database connection failed");
            mockRepo.list.mockRejectedValue(repositoryError);

            // Act & Assert
            await expect(
                computeProfit(mockRepo, mockProductRepo)
            ).rejects.toEqual(repositoryError);
            expect(mockRepo.list).toHaveBeenCalledTimes(1);
        });

        it("should propagate repository error when product retrieval fails", async () => {
            // Arrange
            const activities = [
                createMockActivity({
                    type: ActivityType.SALE,
                    productId: productId1,
                    quantity: -2,
                }),
            ];
            const repositoryError = new Error("Database connection failed");
            mockRepo.list.mockResolvedValue(activities);
            mockProductRepo.list.mockRejectedValue(repositoryError);

            // Act & Assert
            await expect(
                computeProfit(mockRepo, mockProductRepo)
            ).rejects.toEqual(repositoryError);
            expect(mockRepo.list).toHaveBeenCalledTimes(1);
            expect(mockProductRepo.list).toHaveBeenCalledTimes(1);
        });

        it("should handle edge case: zero profit sale (salePrice = unitCost)", async () => {
            // Arrange
            const product1 = createMockProduct({
                id: productId1,
                salePrice: 10.0,
                unitCost: 10.0, // Same as salePrice (zero profit)
            });
            const activities = [
                createMockActivity({
                    type: ActivityType.SALE,
                    productId: productId1,
                    quantity: -5,
                    date: "2025-01-27T14:00:00.000Z",
                }),
            ];
            mockRepo.list.mockResolvedValue(activities);
            mockProductRepo.list.mockResolvedValue([product1]);

            // Act
            const result = await computeProfit(mockRepo, mockProductRepo);

            // Assert
            // Profit = (10-10)*5 = 0 (included in sum)
            expect(result).toBe(0);
        });

        it("should handle edge case: multiple sales for same product", async () => {
            // Arrange
            const product1 = createMockProduct({
                id: productId1,
                salePrice: 20.0,
                unitCost: 10.0,
            });
            const activities = [
                createMockActivity({
                    type: ActivityType.SALE,
                    productId: productId1,
                    quantity: -2,
                    date: "2025-01-27T14:00:00.000Z",
                }),
                createMockActivity({
                    type: ActivityType.SALE,
                    productId: productId1,
                    quantity: -3,
                    date: "2025-01-28T14:00:00.000Z",
                }),
            ];
            mockRepo.list.mockResolvedValue(activities);
            mockProductRepo.list.mockResolvedValue([product1]);

            // Act
            const result = await computeProfit(mockRepo, mockProductRepo);

            // Assert
            // Profit = (20-10)*2 + (20-10)*3 = 20 + 30 = 50
            expect(result).toBe(50);
        });
    });
});

