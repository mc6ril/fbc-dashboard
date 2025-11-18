/**
 * Products React Query hooks (Presentation).
 * Fetch products via usecases with optimized caching.
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { listProducts } from "@/core/usecases/product";
import type { Product } from "@/core/domain/product";
import { productRepositorySupabase } from "@/infrastructure/supabase/productRepositorySupabase";
import { queryKeys } from "./queryKeys";

/** Stale time for products list (5 minutes) - products don't change frequently */
const PRODUCTS_STALE_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Hook to fetch all products.
 *
 * Uses `listProducts` usecase to retrieve all products from the repository.
 * Data is cached for 5 minutes to reduce unnecessary refetches.
 *
 * @returns React Query result with `data` (array of products), `isLoading`, and `error`
 */
export const useProducts = () => {
    return useQuery<Product[], Error>({
        queryKey: queryKeys.products.all(),
        queryFn: () => listProducts(productRepositorySupabase),
        staleTime: PRODUCTS_STALE_TIME,
    });
};

