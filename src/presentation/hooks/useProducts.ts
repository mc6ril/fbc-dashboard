/**
 * Products React Query hooks (Presentation).
 * Fetch products via usecases with optimized caching.
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
    Product,
    ProductId,
    ProductModel,
    ProductModelId,
    ProductColoris,
} from "@/core/domain/product";
import { ProductType } from "@/core/domain/product";
import {
    listProducts,
    createProduct,
    updateProduct,
    getProductById,
    listProductModelsByType,
    listProductColorisByModel,
} from "@/core/usecases/product";
import { productRepositorySupabase } from "@/infrastructure/supabase/productRepositorySupabase";
import { useGlobalLoadingStore } from "@/presentation/stores/useGlobalLoadingStore";
import { queryKeys } from "./queryKeys";

/** Stale time for products list (5 minutes) - products don't change frequently */
const PRODUCTS_STALE_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds

/** Stale time for reference tables (10 minutes) - reference data changes very infrequently */
const REFERENCE_STALE_TIME = 10 * 60 * 1000; // 10 minutes in milliseconds

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

/**
 * Hook to fetch product models for a specific product type.
 *
 * Uses `listProductModelsByType` usecase to retrieve models from the repository.
 * Data is cached for 10 minutes to reduce unnecessary refetches.
 * Only fetches when a valid type is provided (conditional fetching).
 *
 * This hook is used in cascading dropdowns where users first select a product type,
 * then select a model for that type.
 *
 * @param {ProductType | null} type - Product type to filter models by. If null, hook is disabled and won't fetch.
 * @returns React Query result with `data` (array of product models), `isLoading`, and `error`
 *
 * @example
 * ```typescript
 * const [selectedType, setSelectedType] = useState<ProductType | null>(null);
 * const { data: models, isLoading, error } = useProductModelsByType(selectedType);
 *
 * if (isLoading) return <div>Loading models...</div>;
 * if (error) return <div>Error: {error.message}</div>;
 * if (models) {
 *   return (
 *     <Select
 *       options={models.map(m => ({ value: m.id, label: m.name }))}
 *       disabled={!selectedType || isLoading}
 *     />
 *   );
 * }
 * ```
 */
export const useProductModelsByType = (
    type: ProductType | null
): {
    data: ProductModel[] | undefined;
    isLoading: boolean;
    error: Error | null;
} => {
    return useQuery<ProductModel[], Error>({
        queryKey: type ? queryKeys.products.modelsByType(type) : ["products", "models", "disabled"],
        queryFn: () => listProductModelsByType(productRepositorySupabase, type!),
        staleTime: REFERENCE_STALE_TIME,
        enabled: type !== null, // Only fetch if type is provided
    });
};

/**
 * Hook to fetch product coloris (color variations) for a specific product model.
 *
 * Uses `listProductColorisByModel` usecase to retrieve coloris from the repository.
 * Data is cached for 10 minutes to reduce unnecessary refetches.
 * Only fetches when a valid modelId is provided (conditional fetching).
 *
 * This hook is used in cascading dropdowns where users first select a product type,
 * then a model, then a coloris for that model.
 *
 * @param {ProductModelId | null} modelId - Product model ID to filter coloris by. If null, hook is disabled and won't fetch.
 * @returns React Query result with `data` (array of product coloris), `isLoading`, and `error`
 *
 * @example
 * ```typescript
 * const [selectedModelId, setSelectedModelId] = useState<ProductModelId | null>(null);
 * const { data: coloris, isLoading, error } = useProductColorisByModel(selectedModelId);
 *
 * if (isLoading) return <div>Loading coloris...</div>;
 * if (error) return <div>Error: {error.message}</div>;
 * if (coloris) {
 *   return (
 *     <Select
 *       options={coloris.map(c => ({ value: c.id, label: c.coloris }))}
 *       disabled={!selectedModelId || isLoading}
 *     />
 *   );
 * }
 * ```
 */
export const useProductColorisByModel = (
    modelId: ProductModelId | null
): {
    data: ProductColoris[] | undefined;
    isLoading: boolean;
    error: Error | null;
} => {
    return useQuery<ProductColoris[], Error>({
        queryKey: modelId
            ? queryKeys.products.colorisByModel(modelId)
            : ["products", "coloris", "disabled"],
        queryFn: () => listProductColorisByModel(productRepositorySupabase, modelId!),
        staleTime: REFERENCE_STALE_TIME,
        enabled: modelId !== null, // Only fetch if modelId is provided
    });
};

