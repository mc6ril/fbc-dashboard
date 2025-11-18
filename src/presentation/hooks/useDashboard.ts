/**
 * Dashboard React Query hooks (Presentation).
 * Fetch dashboard metrics via usecases with optimized caching and memoization.
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { computeTotalSales, computeProfit, listRecentActivities } from "@/core/usecases/activity";
import { listLowStockProducts } from "@/core/usecases/product";
import { activityRepositorySupabase } from "@/infrastructure/supabase/activityRepositorySupabase";
import { productRepositorySupabase } from "@/infrastructure/supabase/productRepositorySupabase";
import { getCurrentMonthStart, getCurrentMonthEnd } from "@/shared/utils/date";
import { queryKeys } from "./queryKeys";

/** Stale time for dashboard metrics (5 minutes) - metrics don't need real-time updates */
const DASHBOARD_METRICS_STALE_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Hook to fetch total sales for the current month.
 *
 * Uses `computeTotalSales` usecase with current month date range.
 * Date range is calculated on each query execution to ensure accuracy.
 * Data is cached for 5 minutes to reduce unnecessary refetches.
 *
 * @returns React Query result with `data` (total sales amount), `isLoading`, and `error`
 */
export const useMonthlySales = () => {
    return useQuery<number, Error>({
        queryKey: queryKeys.dashboard.monthlySales(),
        queryFn: () => {
            const monthStart = getCurrentMonthStart();
            const monthEnd = getCurrentMonthEnd();
            return computeTotalSales(activityRepositorySupabase, monthStart, monthEnd);
        },
        staleTime: DASHBOARD_METRICS_STALE_TIME,
    });
};

/**
 * Hook to fetch total profit for the current month.
 *
 * Uses `computeProfit` usecase with current month date range.
 * Date range is calculated on each query execution to ensure accuracy.
 * Data is cached for 5 minutes to reduce unnecessary refetches.
 *
 * @returns React Query result with `data` (total profit amount), `isLoading`, and `error`
 */
export const useMonthlyProfit = () => {
    return useQuery<number, Error>({
        queryKey: queryKeys.dashboard.monthlyProfit(),
        queryFn: () => {
            const monthStart = getCurrentMonthStart();
            const monthEnd = getCurrentMonthEnd();
            return computeProfit(
                activityRepositorySupabase,
                productRepositorySupabase,
                monthStart,
                monthEnd
            );
        },
        staleTime: DASHBOARD_METRICS_STALE_TIME,
    });
};

/**
 * Hook to fetch products with low stock levels.
 *
 * Uses `listLowStockProducts` usecase with default threshold of 5.
 * Data is cached for 5 minutes to reduce unnecessary refetches.
 *
 * @returns React Query result with `data` (array of low stock products), `isLoading`, and `error`
 */
export const useLowStockProducts = () => {
    return useQuery({
        queryKey: queryKeys.dashboard.lowStockProducts(),
        queryFn: () => listLowStockProducts(productRepositorySupabase),
        staleTime: DASHBOARD_METRICS_STALE_TIME,
    });
};

/**
 * Hook to fetch recent activities.
 *
 * Uses `listRecentActivities` usecase with default limit of 10.
 * Data is cached for 5 minutes to reduce unnecessary refetches.
 *
 * @returns React Query result with `data` (array of recent activities), `isLoading`, and `error`
 */
export const useRecentActivities = () => {
    return useQuery({
        queryKey: queryKeys.dashboard.recentActivities(),
        queryFn: () => listRecentActivities(activityRepositorySupabase),
        staleTime: DASHBOARD_METRICS_STALE_TIME,
    });
};

