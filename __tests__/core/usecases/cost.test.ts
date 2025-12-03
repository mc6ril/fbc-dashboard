/**
 * Unit tests for cost usecases.
 *
 * Tests business logic for monthly cost management:
 * - getMonthlyCost: Retrieves monthly cost with validation
 * - createOrUpdateMonthlyCost: Creates or updates monthly cost with validation
 * - updateMonthlyCostField: Atomically updates a specific cost field with validation
 *
 * All tests use mocked repositories to isolate business logic from infrastructure.
 */

import {
    getMonthlyCost,
    createOrUpdateMonthlyCost,
    updateMonthlyCostField,
} from "@/core/usecases/cost";
import type { MonthlyCost, MonthlyCostId } from "@/core/domain/cost";
import { createMockCostRepository } from "../../../__mocks__/core/ports/costRepository";

describe("Cost Usecases", () => {
    let mockRepo: ReturnType<typeof createMockCostRepository>;

    beforeEach(() => {
        jest.clearAllMocks();
        mockRepo = createMockCostRepository();
    });

    describe("getMonthlyCost", () => {
        it("should return monthly cost for valid month", async () => {
            const month = "2025-01";
            const expectedCost: MonthlyCost = {
                id: "123e4567-e89b-12d3-a456-426614174000" as MonthlyCostId,
                month,
                shippingCost: 100.50,
                marketingCost: 50.25,
                overheadCost: 75.00,
            };

            mockRepo.getMonthlyCost.mockResolvedValue(expectedCost);

            const result = await getMonthlyCost(mockRepo, month);

            expect(result).toEqual(expectedCost);
            expect(mockRepo.getMonthlyCost).toHaveBeenCalledTimes(1);
            expect(mockRepo.getMonthlyCost).toHaveBeenCalledWith(month);
        });

        it("should return null when no cost exists for month", async () => {
            const month = "2025-01";

            mockRepo.getMonthlyCost.mockResolvedValue(null);

            const result = await getMonthlyCost(mockRepo, month);

            expect(result).toBeNull();
            expect(mockRepo.getMonthlyCost).toHaveBeenCalledTimes(1);
            expect(mockRepo.getMonthlyCost).toHaveBeenCalledWith(month);
        });

        it("should throw error for invalid month format", async () => {
            const invalidMonths = [
                "invalid-month",
                "2025-13",
                "25-01",
                "2025-00",
                "",
                "2025",
                "2025-1",
                "2025-123",
            ];

            for (const invalidMonth of invalidMonths) {
                await expect(getMonthlyCost(mockRepo, invalidMonth)).rejects.toThrow(
                    /Invalid month format/
                );
                expect(mockRepo.getMonthlyCost).not.toHaveBeenCalled();
            }
        });

        it("should propagate repository errors", async () => {
            const month = "2025-01";
            const repositoryError = new Error("Database connection failed");

            mockRepo.getMonthlyCost.mockRejectedValue(repositoryError);

            await expect(getMonthlyCost(mockRepo, month)).rejects.toThrow(
                "Database connection failed"
            );
            expect(mockRepo.getMonthlyCost).toHaveBeenCalledTimes(1);
        });
    });

    describe("createOrUpdateMonthlyCost", () => {
        const validCost: MonthlyCost = {
            id: "123e4567-e89b-12d3-a456-426614174000" as MonthlyCostId,
            month: "2025-01",
            shippingCost: 100.50,
            marketingCost: 50.25,
            overheadCost: 75.00,
        };

        it("should create or update monthly cost with valid data", async () => {
            mockRepo.createOrUpdateMonthlyCost.mockResolvedValue(validCost);

            const result = await createOrUpdateMonthlyCost(mockRepo, validCost);

            expect(result).toEqual(validCost);
            expect(mockRepo.createOrUpdateMonthlyCost).toHaveBeenCalledTimes(1);
            expect(mockRepo.createOrUpdateMonthlyCost).toHaveBeenCalledWith(validCost);
        });

        it("should throw error for invalid month format", async () => {
            const invalidCost = {
                ...validCost,
                month: "invalid-month",
            };

            await expect(createOrUpdateMonthlyCost(mockRepo, invalidCost)).rejects.toThrow(
                /Invalid month format/
            );
            expect(mockRepo.createOrUpdateMonthlyCost).not.toHaveBeenCalled();
        });

        it("should throw error for negative shipping cost", async () => {
            const invalidCost = {
                ...validCost,
                shippingCost: -10.00,
            };

            await expect(createOrUpdateMonthlyCost(mockRepo, invalidCost)).rejects.toThrow(
                /Invalid cost values/
            );
            expect(mockRepo.createOrUpdateMonthlyCost).not.toHaveBeenCalled();
        });

        it("should throw error for negative marketing cost", async () => {
            const invalidCost = {
                ...validCost,
                marketingCost: -10.00,
            };

            await expect(createOrUpdateMonthlyCost(mockRepo, invalidCost)).rejects.toThrow(
                /Invalid cost values/
            );
            expect(mockRepo.createOrUpdateMonthlyCost).not.toHaveBeenCalled();
        });

        it("should throw error for negative overhead cost", async () => {
            const invalidCost = {
                ...validCost,
                overheadCost: -10.00,
            };

            await expect(createOrUpdateMonthlyCost(mockRepo, invalidCost)).rejects.toThrow(
                /Invalid cost values/
            );
            expect(mockRepo.createOrUpdateMonthlyCost).not.toHaveBeenCalled();
        });

        it("should accept zero costs", async () => {
            const zeroCost: MonthlyCost = {
                ...validCost,
                shippingCost: 0,
                marketingCost: 0,
                overheadCost: 0,
            };

            mockRepo.createOrUpdateMonthlyCost.mockResolvedValue(zeroCost);

            const result = await createOrUpdateMonthlyCost(mockRepo, zeroCost);

            expect(result).toEqual(zeroCost);
            expect(mockRepo.createOrUpdateMonthlyCost).toHaveBeenCalledTimes(1);
        });

        it("should propagate repository errors", async () => {
            const repositoryError = new Error("Database constraint violation");

            mockRepo.createOrUpdateMonthlyCost.mockRejectedValue(repositoryError);

            await expect(createOrUpdateMonthlyCost(mockRepo, validCost)).rejects.toThrow(
                "Database constraint violation"
            );
            expect(mockRepo.createOrUpdateMonthlyCost).toHaveBeenCalledTimes(1);
        });
    });

    describe("updateMonthlyCostField", () => {
        const month = "2025-01";
        const expectedCost: MonthlyCost = {
            id: "123e4567-e89b-12d3-a456-426614174000" as MonthlyCostId,
            month,
            shippingCost: 100.50,
            marketingCost: 50.25,
            overheadCost: 75.00,
        };

        it("should update shipping cost field", async () => {
            const updatedCost = {
                ...expectedCost,
                shippingCost: 150.75,
            };

            mockRepo.updateMonthlyCostField.mockResolvedValue(updatedCost);

            const result = await updateMonthlyCostField(mockRepo, month, "shipping", 150.75);

            expect(result).toEqual(updatedCost);
            expect(mockRepo.updateMonthlyCostField).toHaveBeenCalledTimes(1);
            expect(mockRepo.updateMonthlyCostField).toHaveBeenCalledWith(month, "shipping", 150.75);
        });

        it("should update marketing cost field", async () => {
            const updatedCost = {
                ...expectedCost,
                marketingCost: 60.00,
            };

            mockRepo.updateMonthlyCostField.mockResolvedValue(updatedCost);

            const result = await updateMonthlyCostField(mockRepo, month, "marketing", 60.00);

            expect(result).toEqual(updatedCost);
            expect(mockRepo.updateMonthlyCostField).toHaveBeenCalledTimes(1);
            expect(mockRepo.updateMonthlyCostField).toHaveBeenCalledWith(month, "marketing", 60.00);
        });

        it("should update overhead cost field", async () => {
            const updatedCost = {
                ...expectedCost,
                overheadCost: 80.50,
            };

            mockRepo.updateMonthlyCostField.mockResolvedValue(updatedCost);

            const result = await updateMonthlyCostField(mockRepo, month, "overhead", 80.50);

            expect(result).toEqual(updatedCost);
            expect(mockRepo.updateMonthlyCostField).toHaveBeenCalledTimes(1);
            expect(mockRepo.updateMonthlyCostField).toHaveBeenCalledWith(month, "overhead", 80.50);
        });

        it("should accept zero value", async () => {
            const updatedCost = {
                ...expectedCost,
                shippingCost: 0,
            };

            mockRepo.updateMonthlyCostField.mockResolvedValue(updatedCost);

            const result = await updateMonthlyCostField(mockRepo, month, "shipping", 0);

            expect(result).toEqual(updatedCost);
            expect(mockRepo.updateMonthlyCostField).toHaveBeenCalledTimes(1);
            expect(mockRepo.updateMonthlyCostField).toHaveBeenCalledWith(month, "shipping", 0);
        });

        it("should throw error for invalid month format", async () => {
            const invalidMonths = ["invalid-month", "2025-13", "25-01", ""];

            for (const invalidMonth of invalidMonths) {
                await expect(
                    updateMonthlyCostField(mockRepo, invalidMonth, "shipping", 100.50)
                ).rejects.toThrow(/Invalid month format/);
                expect(mockRepo.updateMonthlyCostField).not.toHaveBeenCalled();
            }
        });

        it("should throw error for invalid field name", async () => {
            const invalidFieldNames = ["invalid", "shipping_cost", "SHIPPING", ""] as Array<
                "shipping" | "marketing" | "overhead"
            >;

            for (const invalidFieldName of invalidFieldNames) {
                await expect(
                    updateMonthlyCostField(mockRepo, month, invalidFieldName, 100.50)
                ).rejects.toThrow(/Invalid field name/);
                expect(mockRepo.updateMonthlyCostField).not.toHaveBeenCalled();
            }
        });

        it("should throw error for negative value", async () => {
            await expect(
                updateMonthlyCostField(mockRepo, month, "shipping", -10.00)
            ).rejects.toThrow(/Invalid value/);
            expect(mockRepo.updateMonthlyCostField).not.toHaveBeenCalled();
        });

        it("should throw error for NaN value", async () => {
            await expect(
                updateMonthlyCostField(mockRepo, month, "shipping", NaN)
            ).rejects.toThrow(/Invalid value/);
            expect(mockRepo.updateMonthlyCostField).not.toHaveBeenCalled();
        });

        it("should throw error for Infinity value", async () => {
            await expect(
                updateMonthlyCostField(mockRepo, month, "shipping", Infinity)
            ).rejects.toThrow(/Invalid value/);
            expect(mockRepo.updateMonthlyCostField).not.toHaveBeenCalled();
        });

        it("should propagate repository errors", async () => {
            const repositoryError = new Error("Database connection failed");

            mockRepo.updateMonthlyCostField.mockRejectedValue(repositoryError);

            await expect(
                updateMonthlyCostField(mockRepo, month, "shipping", 100.50)
            ).rejects.toThrow("Database connection failed");
            expect(mockRepo.updateMonthlyCostField).toHaveBeenCalledTimes(1);
            expect(mockRepo.updateMonthlyCostField).toHaveBeenCalledWith(month, "shipping", 100.50);
        });
    });
});

