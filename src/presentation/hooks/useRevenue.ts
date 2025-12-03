/**
 * Revenue React Query hooks (Presentation).
 * Fetch revenue data via usecases with optimized caching.
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
    computeRevenue,
    computeRevenueByProductType,
    computeRevenueByProduct,
} from "@/core/usecases/revenue";
import type {
    RevenueData,
    RevenuePeriod,
    RevenueByProductType,
    RevenueByProduct,
} from "@/core/domain/revenue";
import { activityRepositorySupabase } from "@/infrastructure/supabase/activityRepositorySupabase";
import { productRepositorySupabase } from "@/infrastructure/supabase/productRepositorySupabase";
import { costRepositorySupabase } from "@/infrastructure/supabase/costRepositorySupabase";
import { isValidISO8601 } from "@/shared/utils/date";
import { queryKeys } from "./queryKeys";

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
    // Query key includes period to prevent cache collisions between different period types
    // with the same date range (e.g., MONTH vs QUARTER with same start/end dates)
    const queryKey = useMemo(
        () => queryKeys.revenue.byPeriod(period, startDate, endDate),
        [period, startDate, endDate]
    );

    // Memoize query function to prevent unnecessary re-creations
    const queryFn = useMemo(
        () => () =>
            computeRevenue(
                activityRepositorySupabase,
                productRepositorySupabase,
                costRepositorySupabase,
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

/**
 * Hook to fetch revenue breakdown by product type for a selected period.
 *
 * Uses `computeRevenueByProductType` usecase to group sales by product type and calculate
 * aggregated revenue metrics. Used for expandable revenue rows to show detailed breakdowns
 * by product category.
 *
 * Query key includes date range for proper cache invalidation.
 * Data is cached for 5 minutes to reduce unnecessary recomputation.
 *
 * The hook conditionally fetches data only when both startDate and endDate
 * are valid ISO 8601 strings. This prevents unnecessary API calls when dates
 * are invalid or not yet provided. The hook uses `enabled` option for lazy loading,
 * allowing components to control when the data should be fetched (e.g., only when
 * a row is expanded).
 *
 * @param {RevenuePeriod} period - Period type (MONTH, QUARTER, YEAR, or CUSTOM) - used for context, not filtering
 * @param {string} startDate - Start date (ISO 8601 format) to filter activities from this date onwards
 * @param {string} endDate - End date (ISO 8601 format) to filter activities up to this date
 * @param {boolean} [enabled=true] - Whether the query should be enabled (for lazy loading)
 * @returns React Query result with `data` (RevenueByProductType[]), `isLoading`, and `error`
 *
 * @example
 * ```tsx
 * const { data: revenueByType, isLoading, error } = useRevenueByProductType(
 *   RevenuePeriod.MONTH,
 *   "2025-01-01T00:00:00.000Z",
 *   "2025-01-31T23:59:59.999Z",
 *   isExpanded // Only fetch when row is expanded
 * );
 *
 * if (isLoading) return <div>Loading breakdown...</div>;
 * if (error) return <div>Error: {error.message}</div>;
 * if (revenueByType) {
 *   return revenueByType.map((item) => (
 *     <div key={item.type}>{item.type}: {item.revenue}</div>
 *   ));
 * }
 * ```
 */
export const useRevenueByProductType = (
    period: RevenuePeriod,
    startDate: string,
    endDate: string,
    enabled: boolean = true
) => {
    // Validate dates to conditionally enable the query
    const isValidStartDate = useMemo(
        () => isValidISO8601(startDate),
        [startDate]
    );
    const isValidEndDate = useMemo(() => isValidISO8601(endDate), [endDate]);
    const queryEnabled = enabled && isValidStartDate && isValidEndDate;

    // Memoize query key to ensure stability
    const queryKey = useMemo(
        () => queryKeys.revenue.byProductType(startDate, endDate),
        [startDate, endDate]
    );

    // Memoize query function to prevent unnecessary re-creations
    const queryFn = useMemo(
        () => () =>
            computeRevenueByProductType(
                activityRepositorySupabase,
                productRepositorySupabase,
                startDate,
                endDate
            ),
        [startDate, endDate]
    );

    return useQuery<RevenueByProductType[], Error>({
        queryKey,
        queryFn,
        enabled: queryEnabled,
        staleTime: REVENUE_STALE_TIME,
        // Use select to transform data only when needed (for future optimizations)
        select: (data) => data,
    });
};

/**
 * Hook to fetch revenue breakdown by individual product for a selected period.
 *
 * Uses `computeRevenueByProduct` usecase to group sales by individual products (model + coloris)
 * and calculate aggregated revenue metrics. Used for expandable revenue rows to show detailed
 * breakdowns by individual products.
 *
 * Query key includes date range for proper cache invalidation.
 * Data is cached for 5 minutes to reduce unnecessary recomputation.
 *
 * The hook conditionally fetches data only when both startDate and endDate
 * are valid ISO 8601 strings. This prevents unnecessary API calls when dates
 * are invalid or not yet provided. The hook uses `enabled` option for lazy loading,
 * allowing components to control when the data should be fetched (e.g., only when
 * a row is expanded).
 *
 * @param {RevenuePeriod} period - Period type (MONTH, QUARTER, YEAR, or CUSTOM) - used for context, not filtering
 * @param {string} startDate - Start date (ISO 8601 format) to filter activities from this date onwards
 * @param {string} endDate - End date (ISO 8601 format) to filter activities up to this date
 * @param {boolean} [enabled=true] - Whether the query should be enabled (for lazy loading)
 * @returns React Query result with `data` (RevenueByProduct[]), `isLoading`, and `error`
 *
 * @example
 * ```tsx
 * const { data: revenueByProduct, isLoading, error } = useRevenueByProduct(
 *   RevenuePeriod.MONTH,
 *   "2025-01-01T00:00:00.000Z",
 *   "2025-01-31T23:59:59.999Z",
 *   isExpanded // Only fetch when row is expanded
 * );
 *
 * if (isLoading) return <div>Loading breakdown...</div>;
 * if (error) return <div>Error: {error.message}</div>;
 * if (revenueByProduct) {
 *   return revenueByProduct.map((item) => (
 *     <div key={item.productId}>
 *       {item.productName} ({item.coloris}): {item.revenue}
 *     </div>
 *   ));
 * }
 * ```
 */
export const useRevenueByProduct = (
    period: RevenuePeriod,
    startDate: string,
    endDate: string,
    enabled: boolean = true
) => {
    // Validate dates to conditionally enable the query
    const isValidStartDate = useMemo(
        () => isValidISO8601(startDate),
        [startDate]
    );
    const isValidEndDate = useMemo(() => isValidISO8601(endDate), [endDate]);
    const queryEnabled = enabled && isValidStartDate && isValidEndDate;

    // Memoize query key to ensure stability
    const queryKey = useMemo(
        () => queryKeys.revenue.byProduct(startDate, endDate),
        [startDate, endDate]
    );

    // Memoize query function to prevent unnecessary re-creations
    const queryFn = useMemo(
        () => () =>
            computeRevenueByProduct(
                activityRepositorySupabase,
                productRepositorySupabase,
                startDate,
                endDate
            ),
        [startDate, endDate]
    );

    return useQuery<RevenueByProduct[], Error>({
        queryKey,
        queryFn,
        enabled: queryEnabled,
        staleTime: REVENUE_STALE_TIME,
        // Use select to transform data only when needed (for future optimizations)
        select: (data) => data,
    });
};

