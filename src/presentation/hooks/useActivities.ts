/**
 * Activities React Query hooks (Presentation).
 * Fetch filtered and paginated activities via usecases with optimized caching.
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { listActivitiesPaginated, addActivity } from "@/core/usecases/activity";
import type { PaginatedActivitiesResult } from "@/core/usecases/activity";
import type { Activity, ActivityError } from "@/core/domain/activity";
import { activityRepositorySupabase } from "@/infrastructure/supabase/activityRepositorySupabase";
import { stockMovementRepositorySupabase } from "@/infrastructure/supabase/stockMovementRepositorySupabase";
import { useActivityFiltersStore } from "@/presentation/stores/useActivityFiltersStore";
import { useGlobalLoadingStore } from "@/presentation/stores/useGlobalLoadingStore";
import { queryKeys } from "./queryKeys";

/** Stale time for activities list (5 minutes) - activities don't need real-time updates */
const ACTIVITIES_STALE_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Hook to fetch filtered and paginated activities.
 *
 * Uses `listActivitiesPaginated` usecase with filters and pagination from Zustand store.
 * Query key includes all filter parameters for proper cache invalidation.
 * Data is cached for 5 minutes to reduce unnecessary refetches.
 *
 * The hook uses Zustand selectors to read filter state, ensuring components only
 * re-render when the specific filter values they use change.
 *
 * @returns React Query result with `data` (PaginatedActivitiesResult), `isLoading`, and `error`
 */
export const useActivities = () => {
    // Read filter state from Zustand store using selectors to prevent unnecessary re-renders
    const startDate = useActivityFiltersStore((state) => state.startDate);
    const endDate = useActivityFiltersStore((state) => state.endDate);
    const type = useActivityFiltersStore((state) => state.type);
    const productId = useActivityFiltersStore((state) => state.productId);
    const page = useActivityFiltersStore((state) => state.page);
    const pageSize = useActivityFiltersStore((state) => state.pageSize);

    // Memoize query key to ensure stability
    const queryKey = useMemo(
        () =>
            queryKeys.activities.list(
                startDate,
                endDate,
                type,
                productId,
                page,
                pageSize
            ),
        [startDate, endDate, type, productId, page, pageSize]
    );

    // Memoize query function to prevent unnecessary re-creations
    const queryFn = useMemo(
        () => () =>
            listActivitiesPaginated(
                activityRepositorySupabase,
                startDate,
                endDate,
                type,
                productId,
                page,
                pageSize
            ),
        [startDate, endDate, type, productId, page, pageSize]
    );

    return useQuery<PaginatedActivitiesResult, Error>({
        queryKey,
        queryFn,
        staleTime: ACTIVITIES_STALE_TIME,
        // Use select to transform data only when needed (for future optimizations)
        select: (data) => data,
    });
};

/**
 * Hook to create a new activity.
 *
 * Uses `addActivity` usecase to create a new activity via the repository.
 * Automatically creates corresponding stock movements for applicable activities
 * (CREATION, SALE, STOCK_CORRECTION with productId and non-zero quantity).
 *
 * On success, invalidates:
 * - All activities list queries (with any filters/pagination)
 * - Dashboard recent activities query
 * - Stock movements queries (stock movements are created when activities are created)
 * - Dashboard low stock products query (stock levels may have changed)
 *
 * This ensures dashboards reflect stock changes immediately without manual refresh.
 * Shows global loader during mutation to provide user feedback.
 *
 * @returns React Query mutation object with `mutate`, `mutateAsync`, `isPending`, `error`, `isSuccess`, and `data`
 *
 * @example
 * ```tsx
 * const addActivityMutation = useAddActivity();
 *
 * const handleSubmit = () => {
 *   addActivityMutation.mutate({
 *     date: "2025-01-27T14:00:00.000Z",
 *     type: ActivityType.SALE,
 *     productId: "product-id" as ProductId,
 *     quantity: -5,
 *     amount: 99.95,
 *     note: "Sale to customer"
 *   });
 *   // Activity and corresponding stock movement are created automatically
 *   // Dashboards are updated immediately via cache invalidation
 * };
 * ```
 */
export const useAddActivity = () => {
    const queryClient = useQueryClient();
    const startGlobalLoading = useGlobalLoadingStore((state) => state.startLoading);
    const stopGlobalLoading = useGlobalLoadingStore((state) => state.stopLoading);

    return useMutation<Activity, ActivityError | Error, Omit<Activity, "id">>({
        mutationFn: (activity: Omit<Activity, "id">) =>
            addActivity(activityRepositorySupabase, stockMovementRepositorySupabase, activity),
        onMutate: () => {
            startGlobalLoading();
        },
        onSuccess: () => {
            // Invalidate all activities list queries (with any filters/pagination)
            queryClient.invalidateQueries({ queryKey: ["activities"] });
            // Invalidate dashboard recent activities query
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.recentActivities() });
            // Invalidate stock movements queries (stock movements are created when activities are created)
            queryClient.invalidateQueries({ queryKey: ["stock-movements"] });
            // Invalidate dashboard low stock products query (stock levels may have changed)
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.lowStockProducts() });
        },
        onSettled: () => {
            stopGlobalLoading();
        },
    });
};

