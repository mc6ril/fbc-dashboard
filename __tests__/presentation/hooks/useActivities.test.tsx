/**
 * useActivities Hook Tests
 *
 * Tests for the useAddActivity mutation hook to ensure:
 * - Hook calls addActivity usecase correctly
 * - Hook invalidates activities list queries on success
 * - Hook invalidates dashboard recent activities query on success
 * - Hook returns proper loading, error, and success states
 */

import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { useAddActivity } from "@/presentation/hooks/useActivities";
import { addActivity } from "@/core/usecases/activity";
import { ActivityType } from "@/core/domain/activity";
import type { Activity, ActivityError, ActivityId } from "@/core/domain/activity";
import type { ProductId } from "@/core/domain/product";
import { queryKeys } from "@/presentation/hooks/queryKeys";

// Mock the usecase
jest.mock("@/core/usecases/activity", () => ({
    addActivity: jest.fn(),
}));

// Mock the repository
jest.mock("@/infrastructure/supabase/activityRepositorySupabase", () => ({
    activityRepositorySupabase: {},
}));

const mockAddActivity = addActivity as jest.MockedFunction<typeof addActivity>;

// Create a wrapper with QueryClient
const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });
    const Wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    Wrapper.displayName = "TestWrapper";
    return Wrapper;
};

describe("useAddActivity Hook", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should call addActivity usecase on mutate", async () => {
        const mockActivity: Activity = {
            id: "activity-id" as ActivityId,
            date: "2025-01-27T14:00:00.000Z",
            type: ActivityType.SALE,
            productId: "product-id" as ProductId,
            quantity: -5,
            amount: 99.95,
            note: "Sale to customer",
        };

        mockAddActivity.mockResolvedValue(mockActivity);

        const { result } = renderHook(() => useAddActivity(), {
            wrapper: createWrapper(),
        });

        const newActivity = {
            date: "2025-01-27T14:00:00.000Z",
            type: ActivityType.SALE,
            productId: "product-id" as ProductId,
            quantity: -5,
            amount: 99.95,
            note: "Sale to customer",
        };

        result.current.mutate(newActivity);

        await waitFor(() => {
            expect(mockAddActivity).toHaveBeenCalledTimes(1);
        });

        expect(mockAddActivity).toHaveBeenCalledWith(expect.any(Object), newActivity);
    });

    it("should invalidate activities list queries on success", async () => {
        const mockActivity: Activity = {
            id: "activity-id" as ActivityId,
            date: "2025-01-27T14:00:00.000Z",
            type: ActivityType.SALE,
            productId: "product-id" as ProductId,
            quantity: -5,
            amount: 99.95,
        };

        mockAddActivity.mockResolvedValue(mockActivity);

        const queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
                mutations: { retry: false },
            },
        });

        const invalidateQueriesSpy = jest.spyOn(queryClient, "invalidateQueries");

        const Wrapper = ({ children }: { children: React.ReactNode }) => (
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        );
        Wrapper.displayName = "TestWrapper";

        const { result } = renderHook(() => useAddActivity(), {
            wrapper: Wrapper,
        });

        const newActivity = {
            date: "2025-01-27T14:00:00.000Z",
            type: ActivityType.SALE,
            productId: "product-id" as ProductId,
            quantity: -5,
            amount: 99.95,
        };

        result.current.mutate(newActivity);

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        // Should invalidate all activities queries
        expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ["activities"] });
    });

    it("should invalidate dashboard recent activities query on success", async () => {
        const mockActivity: Activity = {
            id: "activity-id" as ActivityId,
            date: "2025-01-27T14:00:00.000Z",
            type: ActivityType.SALE,
            productId: "product-id" as ProductId,
            quantity: -5,
            amount: 99.95,
        };

        mockAddActivity.mockResolvedValue(mockActivity);

        const queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
                mutations: { retry: false },
            },
        });

        const invalidateQueriesSpy = jest.spyOn(queryClient, "invalidateQueries");

        const Wrapper = ({ children }: { children: React.ReactNode }) => (
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        );
        Wrapper.displayName = "TestWrapper";

        const { result } = renderHook(() => useAddActivity(), {
            wrapper: Wrapper,
        });

        const newActivity = {
            date: "2025-01-27T14:00:00.000Z",
            type: ActivityType.SALE,
            productId: "product-id" as ProductId,
            quantity: -5,
            amount: 99.95,
        };

        result.current.mutate(newActivity);

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        // Should invalidate dashboard recent activities query
        expect(invalidateQueriesSpy).toHaveBeenCalledWith({
            queryKey: queryKeys.dashboard.recentActivities(),
        });
    });

    it("should return loading state during mutation", async () => {
        const mockActivity: Activity = {
            id: "activity-id" as ActivityId,
            date: "2025-01-27T14:00:00.000Z",
            type: ActivityType.SALE,
            productId: "product-id" as ProductId,
            quantity: -5,
            amount: 99.95,
        };

        // Create a promise that we can control
        let resolvePromise: (value: Activity) => void;
        const controlledPromise = new Promise<Activity>((resolve) => {
            resolvePromise = resolve;
        });

        mockAddActivity.mockReturnValue(controlledPromise);

        const { result } = renderHook(() => useAddActivity(), {
            wrapper: createWrapper(),
        });

        const newActivity = {
            date: "2025-01-27T14:00:00.000Z",
            type: ActivityType.SALE,
            productId: "product-id" as ProductId,
            quantity: -5,
            amount: 99.95,
        };

        // Initially should not be pending
        expect(result.current.isPending).toBe(false);

        result.current.mutate(newActivity);

        // Should be pending after mutate (wait a tick for React Query to update)
        await waitFor(() => {
            expect(result.current.isPending).toBe(true);
        });

        // Resolve the promise
        resolvePromise!(mockActivity);

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(result.current.isPending).toBe(false);
    });

    it("should return error state on mutation failure", async () => {
        const mockError: ActivityError = {
            code: "VALIDATION_ERROR",
            message: "productId is required for SALE activity type",
        };

        mockAddActivity.mockRejectedValue(mockError);

        const { result } = renderHook(() => useAddActivity(), {
            wrapper: createWrapper(),
        });

        const newActivity = {
            date: "2025-01-27T14:00:00.000Z",
            type: ActivityType.SALE,
            quantity: -5,
            amount: 99.95,
        };

        result.current.mutate(newActivity);

        await waitFor(() => {
            expect(result.current.isError).toBe(true);
        });

        expect(result.current.error).toEqual(mockError);
        expect(result.current.isSuccess).toBe(false);
    });

    it("should return success state on mutation success", async () => {
        const mockActivity: Activity = {
            id: "activity-id" as ActivityId,
            date: "2025-01-27T14:00:00.000Z",
            type: ActivityType.CREATION,
            quantity: 10,
            amount: 50.0,
            note: "Created new product",
        };

        mockAddActivity.mockResolvedValue(mockActivity);

        const { result } = renderHook(() => useAddActivity(), {
            wrapper: createWrapper(),
        });

        const newActivity = {
            date: "2025-01-27T14:00:00.000Z",
            type: ActivityType.CREATION,
            quantity: 10,
            amount: 50.0,
            note: "Created new product",
        };

        result.current.mutate(newActivity);

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(result.current.data).toEqual(mockActivity);
        expect(result.current.error).toBe(null);
    });
});

