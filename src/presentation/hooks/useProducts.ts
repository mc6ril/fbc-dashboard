/**
 * Products React Query hooks (Presentation).
 * Fetch products via usecases with optimized caching.
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    listProducts,
    createProduct,
    updateProduct,
    getProductById,
} from "@/core/usecases/product";
import type { Product, ProductId } from "@/core/domain/product";
import { productRepositorySupabase } from "@/infrastructure/supabase/productRepositorySupabase";
import { useGlobalLoadingStore } from "@/presentation/stores/useGlobalLoadingStore";
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

/**
 * Hook to fetch a single product by its ID.
 *
 * Uses `getProductById` usecase to retrieve a product from the repository.
 * Data is cached for 5 minutes to reduce unnecessary refetches.
 * Throws an error if the product is not found.
 *
 * @param {ProductId} id - Unique identifier of the product to retrieve
 * @returns React Query result with `data` (product), `isLoading`, and `error`
 *
 * @example
 * ```typescript
 * const { data: product, isLoading, error } = useProductById(productId);
 *
 * if (isLoading) return <div>Loading...</div>;
 * if (error) return <div>Error: {error.message}</div>;
 * if (product) return <div>{product.name}</div>;
 * ```
 */
export const useProductById = (id: ProductId) => {
    return useQuery<Product, Error>({
        queryKey: queryKeys.products.detail(id),
        queryFn: () => getProductById(productRepositorySupabase, id),
        staleTime: PRODUCTS_STALE_TIME,
        enabled: !!id, // Only fetch if id is provided
    });
};

/**
 * Hook to create a new product.
 *
 * Uses `createProduct` usecase to create a product in the repository.
 * Invalidates the products list query on success to ensure UI stays in sync.
 * Shows global loader during mutation to provide user feedback.
 *
 * @returns React Query mutation object with `mutate`, `mutateAsync`, `isPending`, `error`, and `data`
 *
 * @example
 * ```typescript
 * const { mutate, isPending, error } = useCreateProduct();
 *
 * const handleSubmit = (productData: Omit<Product, 'id'>) => {
 *   mutate(productData, {
 *     onSuccess: () => {
 *       // Handle success (e.g., redirect, show notification)
 *     },
 *     onError: (error) => {
 *       // Handle error (e.g., show error message)
 *     }
 *   });
 * };
 * ```
 */
export const useCreateProduct = () => {
    const queryClient = useQueryClient();
    const startGlobalLoading = useGlobalLoadingStore((state) => state.startLoading);
    const stopGlobalLoading = useGlobalLoadingStore((state) => state.stopLoading);

    return useMutation<Product, Error, Omit<Product, "id">>({
        mutationFn: (product: Omit<Product, "id">) =>
            createProduct(productRepositorySupabase, product),
        onMutate: () => {
            startGlobalLoading();
        },
        onSuccess: () => {
            // Invalidate products list query to refetch updated data
            queryClient.invalidateQueries({ queryKey: queryKeys.products.all() });
        },
        onSettled: () => {
            stopGlobalLoading();
        },
    });
};

/**
 * Hook to update an existing product.
 *
 * Uses `updateProduct` usecase to update a product in the repository.
 * Invalidates the products list query on success to ensure UI stays in sync.
 * Shows global loader during mutation to provide user feedback.
 *
 * @returns React Query mutation object with `mutate`, `mutateAsync`, `isPending`, `error`, and `data`
 *
 * @example
 * ```typescript
 * const { mutate, isPending, error } = useUpdateProduct();
 *
 * const handleSubmit = (id: ProductId, updates: Partial<Product>) => {
 *   mutate({ id, updates }, {
 *     onSuccess: () => {
 *       // Handle success (e.g., redirect, show notification)
 *     },
 *     onError: (error) => {
 *       // Handle error (e.g., show error message)
 *     }
 *   });
 * };
 * ```
 */
export const useUpdateProduct = () => {
    const queryClient = useQueryClient();
    const startGlobalLoading = useGlobalLoadingStore((state) => state.startLoading);
    const stopGlobalLoading = useGlobalLoadingStore((state) => state.stopLoading);

    return useMutation<
        Product,
        Error,
        { id: ProductId; updates: Partial<Product> }
    >({
        mutationFn: ({ id, updates }: { id: ProductId; updates: Partial<Product> }) =>
            updateProduct(productRepositorySupabase, id, updates),
        onMutate: () => {
            startGlobalLoading();
        },
        onSuccess: (updatedProduct) => {
            // Invalidate products list query to refetch updated data
            queryClient.invalidateQueries({ queryKey: queryKeys.products.all() });
            // Invalidate the specific product detail query to ensure fresh data
            queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(updatedProduct.id) });
        },
        onSettled: () => {
            stopGlobalLoading();
        },
    });
};

