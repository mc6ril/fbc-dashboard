/**
 * ActivityRepository Port Interface Tests
 *
 * Tests for ActivityRepository interface to ensure:
 * - Interface is properly defined and can be imported
 * - Mock implementations can be created that satisfy the interface contract
 * - Method signatures match expected contracts (type-checking)
 *
 * Since ports are TypeScript interfaces (contracts only), these tests focus on
 * type-checking and verifying that mock implementations can be created for usecase tests.
 */

import type { ActivityRepository } from "@/core/ports/activityRepository";
import type { Activity, ActivityId } from "@/core/domain/activity";
import { ActivityType } from "@/core/domain/activity";
import { createMockActivityRepository } from "../../../__mocks__/core/ports/activityRepository";

describe("ActivityRepository Interface", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("Interface contract", () => {
        it("should be importable as a type", () => {
            // Type-check: ensure interface can be imported
            const repo: ActivityRepository = createMockActivityRepository();
            expect(repo).toBeDefined();
        });

        it("should define list() method returning Promise<Activity[]>", () => {
            // Type-check: ensure method signature exists
            const mockRepo = createMockActivityRepository();
            mockRepo.list.mockResolvedValue([]);
            const result: Promise<Activity[]> = mockRepo.list();
            expect(mockRepo.list).toBeDefined();
            expect(result).toBeInstanceOf(Promise);
        });

        it("should define getById() method with ActivityId parameter", () => {
            // Type-check: ensure method signature exists
            const mockRepo = createMockActivityRepository();
            mockRepo.getById.mockResolvedValue(null);
            const id = "test-id" as ActivityId;
            const result: Promise<Activity | null> = mockRepo.getById(id);
            expect(mockRepo.getById).toBeDefined();
            expect(result).toBeInstanceOf(Promise);
        });

        it("should define create() method accepting Omit<Activity, 'id'>", () => {
            // Type-check: ensure method signature exists
            const mockRepo = createMockActivityRepository();
            const activityData: Omit<Activity, "id"> = {
                date: "2025-01-27T14:00:00.000Z",
                type: ActivityType.CREATION,
                quantity: 10,
                amount: 100,
            };
            mockRepo.create.mockResolvedValue({
                ...activityData,
                id: "test-id" as ActivityId,
            });
            const result: Promise<Activity> = mockRepo.create(activityData);
            expect(mockRepo.create).toBeDefined();
            expect(result).toBeInstanceOf(Promise);
        });

        it("should define update() method with id and Partial<Activity>", () => {
            // Type-check: ensure method signature exists
            const mockRepo = createMockActivityRepository();
            const id = "test-id" as ActivityId;
            const updates: Partial<Activity> = {
                quantity: 20,
            };
            mockRepo.update.mockResolvedValue({
                id,
                date: "2025-01-27T14:00:00.000Z",
                type: ActivityType.CREATION,
                quantity: 20,
                amount: 100,
            });
            const result: Promise<Activity> = mockRepo.update(id, updates);
            expect(mockRepo.update).toBeDefined();
            expect(result).toBeInstanceOf(Promise);
        });

        it("should allow mock implementation for usecase tests", () => {
            // Verify a mock can be created that satisfies the interface
            const mockRepo = createMockActivityRepository();

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
            const mockRepo = createMockActivityRepository();
            const mockActivity: Activity = {
                id: "activity-1" as ActivityId,
                date: "2025-01-27T14:00:00.000Z",
                type: ActivityType.CREATION,
                quantity: 10,
                amount: 100,
            };

            mockRepo.list.mockResolvedValue([mockActivity]);
            mockRepo.getById.mockResolvedValue(mockActivity);
            mockRepo.create.mockResolvedValue(mockActivity);
            mockRepo.update.mockResolvedValue(mockActivity);

            const listResult = await mockRepo.list();
            const getByIdResult = await mockRepo.getById("test-id" as ActivityId);
            const createResult = await mockRepo.create({
                date: "2025-01-27T14:00:00.000Z",
                type: ActivityType.CREATION,
                quantity: 10,
                amount: 100,
            });
            const updateResult = await mockRepo.update("test-id" as ActivityId, {
                quantity: 20,
            });

            expect(listResult).toEqual([mockActivity]);
            expect(getByIdResult).toEqual(mockActivity);
            expect(createResult).toEqual(mockActivity);
            expect(updateResult).toEqual(mockActivity);
        });

        it("should allow configuring mock to return null for getById", async () => {
            // Verify getById can return null for non-existent activities
            const mockRepo = createMockActivityRepository();
            mockRepo.getById.mockResolvedValue(null);

            const result = await mockRepo.getById("non-existent" as ActivityId);
            expect(result).toBeNull();
        });

        it("should allow configuring mock to throw errors", async () => {
            // Verify mocks can throw errors for error path testing
            const mockRepo = createMockActivityRepository();
            const error = new Error("Database connection error");

            mockRepo.list.mockRejectedValue(error);
            mockRepo.getById.mockRejectedValue(error);
            mockRepo.create.mockRejectedValue(error);
            mockRepo.update.mockRejectedValue(error);

            await expect(mockRepo.list()).rejects.toThrow("Database connection error");
            await expect(mockRepo.getById("test-id" as ActivityId)).rejects.toThrow(
                "Database connection error"
            );
            await expect(
                mockRepo.create({
                    date: "2025-01-27T14:00:00.000Z",
                    type: ActivityType.CREATION,
                    quantity: 10,
                    amount: 100,
                })
            ).rejects.toThrow("Database connection error");
            await expect(
                mockRepo.update("test-id" as ActivityId, { quantity: 20 })
            ).rejects.toThrow("Database connection error");
        });
    });
});

