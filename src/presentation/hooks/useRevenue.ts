/**
 * Revenue React Query hooks (Presentation).
 * Fetch revenue data via usecases with optimized caching.
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { computeRevenue } from "@/core/usecases/revenue";
import type { RevenueData, RevenuePeriod } from "@/core/domain/revenue";
import { activityRepositorySupabase } from "@/infrastructure/supabase/activityRepositorySupabase";
import { productRepositorySupabase } from "@/infrastructure/supabase/productRepositorySupabase";
import { isValidISO8601 } from "@/shared/utils/date";

/** Stale time for revenue queries (5 minutes) - revenue calculations don't need real-time updates */
const REVENUE_STALE_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Hook to fetch revenue data for a selected period.
 *
 * Uses `computeRevenue` usecase with period type and date range.
 * Query key includes period type and date range for proper cache invalidation.
 * Data is cached for 5 minutes to reduce unnecessary recomputation.
 *
 * The hook conditionally fetches data only when both startDate and endDate
 * are valid ISO 8601 strings. This prevents unnecessary API calls when dates
 * are invalid or not yet provided.
 *
 * @param {RevenuePeriod} period - Period type (MONTH, QUARTER, YEAR, or CUSTOM)
 * @param {string} startDate - Start date (ISO 8601 format) to filter activities from this date onwards
 * @param {string} endDate - End date (ISO 8601 format) to filter activities up to this date
 * @returns React Query result with `data` (RevenueData), `isLoading`, and `error`
 *
 * @example
 * ```tsx
 * const { data: revenueData, isLoading, error } = useRevenue(
 *   RevenuePeriod.MONTH,
 *   "2025-01-01T00:00:00.000Z",
 *   "2025-01-31T23:59:59.999Z"
 * );
 * ```
 */
export const useRevenue = (
    period: RevenuePeriod,
    startDate: string,
    endDate: string
) => {
    // Validate dates to conditionally enable the query
    const isValidStartDate = useMemo(
        () => isValidISO8601(startDate),
        [startDate]
    );
    const isValidEndDate = useMemo(() => isValidISO8601(endDate), [endDate]);
    const enabled = isValidStartDate && isValidEndDate;

    // Memoize query key to ensure stability
    // Query key follows AC: ["revenue", startDate, endDate]
    const queryKey = useMemo(
        () => ["revenue", startDate, endDate] as const,
        [startDate, endDate]
    );

    // Memoize query function to prevent unnecessary re-creations
    const queryFn = useMemo(
        () => () =>
            computeRevenue(
                activityRepositorySupabase,
                productRepositorySupabase,
                period,
                startDate,
                endDate
            ),
        [period, startDate, endDate]
    );

    return useQuery<RevenueData, Error>({
        queryKey,
        queryFn,
        enabled,
        staleTime: REVENUE_STALE_TIME,
        // Use select to transform data only when needed (for future optimizations)
        select: (data) => data,
    });
};

