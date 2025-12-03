/**
 * Cost React Query hooks (Presentation).
 * Fetch and update monthly cost data via usecases with optimized caching.
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { getMonthlyCost, updateMonthlyCostField } from "@/core/usecases/cost";
import type { MonthlyCost } from "@/core/domain/cost";
import { costRepositorySupabase } from "@/infrastructure/supabase/costRepositorySupabase";
import { useGlobalLoadingStore } from "@/presentation/stores/useGlobalLoadingStore";
import { isValidMonthFormat } from "@/shared/utils/date";
import { queryKeys } from "./queryKeys";

/** Stale time for monthly cost queries (5 minutes) - costs don't need real-time updates */
const COST_STALE_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Hook to fetch monthly cost for a specific month.
 *
 * Uses `getMonthlyCost` usecase to retrieve monthly cost data from the repository.
 * Query key includes month for proper cache invalidation.
 * Data is cached for 5 minutes to reduce unnecessary refetches.
 *
 * The hook conditionally fetches data only when the month is in valid YYYY-MM format.
 * This prevents unnecessary API calls when the month is invalid or not yet provided.
 *
 * @param {string} month - Month in YYYY-MM format (e.g., "2025-01" for January 2025)
 * @returns React Query result with `data` (MonthlyCost | null), `isLoading`, and `error`
 *
 * @example
 * ```tsx
 * const { data: monthlyCost, isLoading, error } = useMonthlyCost("2025-01");
 *
 * if (isLoading) return <div>Loading cost data...</div>;
 * if (error) return <div>Error: {error.message}</div>;
 * if (monthlyCost) {
 *   return <div>Shipping: {monthlyCost.shippingCost}</div>;
 * }
 * ```
 */
export const useMonthlyCost = (month: string) => {
    // Validate month to conditionally enable the query
    const isValidMonth = useMemo(() => isValidMonthFormat(month), [month]);
    const enabled = isValidMonth;

    // Memoize query key to ensure stability
    const queryKey = useMemo(
        () => queryKeys.costs.monthly(month),
        [month]
    );

    // Memoize query function to prevent unnecessary re-creations
    const queryFn = useMemo(
        () => () => getMonthlyCost(costRepositorySupabase, month),
        [month]
    );

    return useQuery<MonthlyCost | null, Error>({
        queryKey,
        queryFn,
        enabled,
        staleTime: COST_STALE_TIME,
        // Use select to transform data only when needed (for future optimizations)
        select: (data) => data,
    });
};

/**
 * Hook to atomically update a specific monthly cost field.
 *
 * Uses `updateMonthlyCostField` usecase to atomically update a single cost field
 * (shipping, marketing, or overhead) for a monthly cost record. This prevents
 * lost updates when multiple users modify different cost fields concurrently.
 *
 * Automatically invalidates:
 * - The specific monthly cost query for the updated month
 * - All revenue queries (costs affect revenue calculations)
 *
 * This ensures revenue calculations reflect cost changes immediately without manual refresh.
 * Shows global loader during mutation to provide user feedback.
 *
 * @returns React Query mutation object with `mutate`, `mutateAsync`, `isPending`, `error`, `isSuccess`, and `data`
 *
 * @example
 * ```tsx
 * const updateCostMutation = useUpdateMonthlyCost();
 *
 * const handleSubmit = () => {
 *   updateCostMutation.mutate({
 *     month: "2025-01",
 *     fieldName: "shipping",
 *     value: 100.50
 *   }, {
 *     onSuccess: () => {
 *       // Handle success (e.g., show notification)
 *     },
 *     onError: (error) => {
 *       // Handle error (e.g., show error message)
 *     }
 *   });
 *   // Only shipping cost is updated atomically, other fields remain unchanged
 *   // Revenue queries are invalidated automatically
 * };
 * ```
 */
type UpdateMonthlyCostInput = {
    month: string;
    fieldName: "shipping" | "marketing" | "overhead";
    value: number;
};

export const useUpdateMonthlyCost = () => {
    const queryClient = useQueryClient();
    const startGlobalLoading = useGlobalLoadingStore((state) => state.startLoading);
    const stopGlobalLoading = useGlobalLoadingStore((state) => state.stopLoading);

    return useMutation<MonthlyCost, Error, UpdateMonthlyCostInput>({
        mutationFn: ({ month, fieldName, value }: UpdateMonthlyCostInput) =>
            updateMonthlyCostField(costRepositorySupabase, month, fieldName, value),
        onMutate: () => {
            startGlobalLoading();
        },
        onSuccess: (updatedCost) => {
            // Invalidate the specific monthly cost query for the updated month
            queryClient.invalidateQueries({
                queryKey: queryKeys.costs.monthly(updatedCost.month),
            });
            // Invalidate all revenue queries (costs affect revenue calculations)
            queryClient.invalidateQueries({ queryKey: ["revenue"] });
        },
        onSettled: () => {
            stopGlobalLoading();
        },
    });
};

