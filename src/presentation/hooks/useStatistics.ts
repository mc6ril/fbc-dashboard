/**
 * Statistics React Query hooks (Presentation).
 * Fetch business statistics via usecases with optimized caching.
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
    computeProfitsByPeriod,
    computeTotalCreations,
    computeProductMargins,
    computeBusinessStatistics,
} from "@/core/usecases/statistics";
import type {
    PeriodStatistics,
    ProductMargin,
    BusinessStatistics,
} from "@/core/domain/statistics";
import { StatisticsPeriod } from "@/core/domain/statistics";
import { activityRepositorySupabase } from "@/infrastructure/supabase/activityRepositorySupabase";
import { productRepositorySupabase } from "@/infrastructure/supabase/productRepositorySupabase";
import { queryKeys } from "./queryKeys";

/** Stale time for statistics queries (5 minutes) - statistics don't need real-time updates */
const STATISTICS_STALE_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Hook to fetch profits grouped by period (daily, monthly, or yearly).
 *
 * Uses `computeProfitsByPeriod` usecase with period type and optional date range.
 * Query key includes period type and date range for proper cache invalidation.
 * Data is cached for 5 minutes to reduce unnecessary recomputation.
 *
 * @param {StatisticsPeriod} period - Period type for grouping (DAILY, MONTHLY, or YEARLY)
 * @param {string} [startDate] - Optional start date (ISO 8601 format) to filter activities from this date onwards
 * @param {string} [endDate] - Optional end date (ISO 8601 format) to filter activities up to this date
 * @returns React Query result with `data` (PeriodStatistics[]), `isLoading`, and `error`
 *
 * @example
 * ```tsx
 * const { data: dailyProfits, isLoading, error } = useProfitsByPeriod(
 *   StatisticsPeriod.DAILY,
 *   "2025-01-01T00:00:00.000Z",
 *   "2025-01-31T23:59:59.999Z"
 * );
 * ```
 */
export const useProfitsByPeriod = (
    period: StatisticsPeriod,
    startDate?: string,
    endDate?: string
) => {
    // Memoize query key to ensure stability
    const queryKey = useMemo(
        () => queryKeys.statistics.profitsByPeriod(period, startDate, endDate),
        [period, startDate, endDate]
    );

    // Memoize query function to prevent unnecessary re-creations
    const queryFn = useMemo(
        () => () =>
            computeProfitsByPeriod(
                activityRepositorySupabase,
                productRepositorySupabase,
                period,
                startDate,
                endDate
            ),
        [period, startDate, endDate]
    );

    return useQuery<PeriodStatistics[], Error>({
        queryKey,
        queryFn,
        staleTime: STATISTICS_STALE_TIME,
        // Use select to transform data only when needed (for future optimizations)
        select: (data) => data,
    });
};

/**
 * Hook to fetch total number of CREATION activities for a date range.
 *
 * Uses `computeTotalCreations` usecase with optional date range.
 * Query key includes date range for proper cache invalidation.
 * Data is cached for 5 minutes to reduce unnecessary recomputation.
 *
 * @param {string} [startDate] - Optional start date (ISO 8601 format) to filter activities from this date onwards
 * @param {string} [endDate] - Optional end date (ISO 8601 format) to filter activities up to this date
 * @returns React Query result with `data` (number), `isLoading`, and `error`
 *
 * @example
 * ```tsx
 * const { data: totalCreations, isLoading, error } = useTotalCreations(
 *   "2025-01-01T00:00:00.000Z",
 *   "2025-01-31T23:59:59.999Z"
 * );
 * ```
 */
export const useTotalCreations = (startDate?: string, endDate?: string) => {
    // Memoize query key to ensure stability
    const queryKey = useMemo(
        () => queryKeys.statistics.totalCreations(startDate, endDate),
        [startDate, endDate]
    );

    // Memoize query function to prevent unnecessary re-creations
    const queryFn = useMemo(
        () => () =>
            computeTotalCreations(activityRepositorySupabase, startDate, endDate),
        [startDate, endDate]
    );

    return useQuery<number, Error>({
        queryKey,
        queryFn,
        staleTime: STATISTICS_STALE_TIME,
        // Use select to transform data only when needed (for future optimizations)
        select: (data) => data,
    });
};

/**
 * Hook to fetch profit margins by product for a date range.
 *
 * Uses `computeProductMargins` usecase with optional date range.
 * Query key includes date range for proper cache invalidation.
 * Data is cached for 5 minutes to reduce unnecessary recomputation.
 *
 * Results are sorted by profit descending (most profitable products first).
 *
 * @param {string} [startDate] - Optional start date (ISO 8601 format) to filter activities from this date onwards
 * @param {string} [endDate] - Optional end date (ISO 8601 format) to filter activities up to this date
 * @returns React Query result with `data` (ProductMargin[]), `isLoading`, and `error`
 *
 * @example
 * ```tsx
 * const { data: productMargins, isLoading, error } = useProductMargins(
 *   "2025-01-01T00:00:00.000Z",
 *   "2025-01-31T23:59:59.999Z"
 * );
 * ```
 */
export const useProductMargins = (startDate?: string, endDate?: string) => {
    // Memoize query key to ensure stability
    const queryKey = useMemo(
        () => queryKeys.statistics.productMargins(startDate, endDate),
        [startDate, endDate]
    );

    // Memoize query function to prevent unnecessary re-creations
    const queryFn = useMemo(
        () => () =>
            computeProductMargins(
                activityRepositorySupabase,
                productRepositorySupabase,
                startDate,
                endDate
            ),
        [startDate, endDate]
    );

    return useQuery<ProductMargin[], Error>({
        queryKey,
        queryFn,
        staleTime: STATISTICS_STALE_TIME,
        // Use select to transform data only when needed (for future optimizations)
        select: (data) => data,
    });
};

/**
 * Hook to fetch comprehensive business statistics for a date range.
 *
 * Uses `computeBusinessStatistics` usecase with optional date range.
 * Query key includes date range for proper cache invalidation.
 * Data is cached for 5 minutes to reduce unnecessary recomputation.
 *
 * Returns aggregated statistics including total profits, sales, creations,
 * and product-level margins.
 *
 * @param {string} [startDate] - Optional start date (ISO 8601 format) to filter activities from this date onwards
 * @param {string} [endDate] - Optional end date (ISO 8601 format) to filter activities up to this date
 * @returns React Query result with `data` (BusinessStatistics), `isLoading`, and `error`
 *
 * @example
 * ```tsx
 * const { data: businessStats, isLoading, error } = useBusinessStatistics(
 *   "2025-01-01T00:00:00.000Z",
 *   "2025-01-31T23:59:59.999Z"
 * );
 * ```
 */
export const useBusinessStatistics = (startDate?: string, endDate?: string) => {
    // Memoize query key to ensure stability
    const queryKey = useMemo(
        () => queryKeys.statistics.businessStatistics(startDate, endDate),
        [startDate, endDate]
    );

    // Memoize query function to prevent unnecessary re-creations
    const queryFn = useMemo(
        () => () =>
            computeBusinessStatistics(
                activityRepositorySupabase,
                productRepositorySupabase,
                startDate,
                endDate
            ),
        [startDate, endDate]
    );

    return useQuery<BusinessStatistics, Error>({
        queryKey,
        queryFn,
        staleTime: STATISTICS_STALE_TIME,
        // Use select to transform data only when needed (for future optimizations)
        select: (data) => data,
    });
};

