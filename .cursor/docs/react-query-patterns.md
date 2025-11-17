# React Query Patterns and Best Practices

This document provides comprehensive guidance on using React Query (TanStack Query) in the FBC Dashboard project. It covers patterns, best practices, performance optimizations, and common pitfalls.

## Table of Contents

1. [Overview](#overview)
2. [Architecture Integration](#architecture-integration)
3. [Query Key Factory](#query-key-factory)
4. [Creating Query Hooks](#creating-query-hooks)
5. [Creating Mutation Hooks](#creating-mutation-hooks)
6. [Best Practices](#best-practices)
7. [Performance Optimizations](#performance-optimizations)
8. [Error Handling](#error-handling)
9. [Loading States](#loading-states)
10. [Common Pitfalls and Solutions](#common-pitfalls-and-solutions)
11. [Testing React Query Hooks](#testing-react-query-hooks)

---

## Overview

React Query (TanStack Query) is used for all server state management in the FBC Dashboard. It provides:

-   **Automatic caching** - Reduces unnecessary network requests
-   **Background refetching** - Keeps data fresh automatically
-   **Request deduplication** - Prevents duplicate requests
-   **Optimistic updates** - Instant UI updates before server confirmation
-   **Error handling** - Built-in error states and retry logic
-   **Loading states** - Automatic loading state management

### Data Flow

Following Clean Architecture principles, data flows in one direction:

```
UI Component
    ↓ calls
React Query Hook (useQuery, useMutation)
    ↓ calls
Usecase (from core/usecases/)
    ↓ calls
Repository (from infrastructure/)
    ↓ calls
Supabase/External API
```

**Important**: React Query hooks should **never** call repositories directly. Always go through usecases to maintain Clean Architecture separation.

---

## Architecture Integration

### Layer Responsibilities

-   **Domain** (`core/domain/`): Business types and pure logic (no React Query)
-   **Usecases** (`core/usecases/`): Business logic orchestration (no React Query)
-   **Infrastructure** (`infrastructure/`): Repository implementations (no React Query)
-   **Presentation** (`presentation/hooks/`): React Query hooks that call usecases

### React Query Provider

The `ReactQueryProvider` is already configured in `app/layout.tsx`. It provides:

-   Default query configuration (staleTime, gcTime, retry)
-   Default mutation configuration
-   DevTools in development environment

See `presentation/providers/ReactQueryProvider.tsx` for configuration details.

---

## Query Key Factory

All query keys must be defined in `presentation/hooks/queryKeys.ts` using the centralized factory pattern.

### Why Use a Query Key Factory?

-   **Type safety** - TypeScript autocomplete and type checking
-   **Consistency** - Single source of truth for all query keys
-   **Easy invalidation** - Invalidate related queries with hierarchical keys
-   **Refactoring** - Change keys in one place, update everywhere

### Structure

Query keys follow a hierarchical pattern: `["resource", "id", "filters"]`

```typescript
export const queryKeys = {
    auth: {
        session: () => ["auth", "session"] as const,
        user: () => ["auth", "user"] as const,
    },
    products: {
        all: () => ["products"] as const,
        detail: (id: string) => ["products", id] as const,
        list: (filters?: ProductFilters) => ["products", "list", filters] as const,
    },
} as const;
```

### Usage

```typescript
import { queryKeys } from "./queryKeys";

// In a query hook
useQuery({
    queryKey: queryKeys.auth.session(),
    queryFn: () => getCurrentSession(repo),
});

// Invalidate all auth queries
queryClient.invalidateQueries({ queryKey: ["auth"] });

// Invalidate specific query
queryClient.invalidateQueries({ queryKey: queryKeys.auth.session() });
```

### Adding New Query Keys

1. Open `presentation/hooks/queryKeys.ts`
2. Add a new namespace or extend an existing one
3. Use functions that return `as const` for type safety
4. Document the key with JSDoc comments

**Example:**

```typescript
export const queryKeys = {
    // ... existing keys
    products: {
        all: () => ["products"] as const,
        detail: (id: string) => ["products", id] as const,
        list: (filters?: ProductFilters) => ["products", "list", filters] as const,
    },
} as const;
```

---

## Creating Query Hooks

Query hooks fetch data from the server. They should be placed in `presentation/hooks/`.

### Basic Query Hook

```typescript
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "./queryKeys";
import { listProducts } from "../../core/usecases/products";
import { productRepositorySupabase } from "../../infrastructure/supabase/productRepositorySupabase";

/**
 * Hook for fetching all products.
 *
 * @returns {object} Query object with data, isLoading, error, refetch, etc.
 */
export const useProducts = () => {
    return useQuery({
        queryKey: queryKeys.products.all(),
        queryFn: () => listProducts(productRepositorySupabase),
    });
};
```

### Query Hook with Parameters

```typescript
/**
 * Hook for fetching a single product by ID.
 *
 * @param {string} productId - The ID of the product to fetch
 * @returns {object} Query object with data, isLoading, error, refetch, etc.
 */
export const useProduct = (productId: string) => {
    return useQuery({
        queryKey: queryKeys.products.detail(productId),
        queryFn: () => getProduct(productRepositorySupabase, productId),
        enabled: !!productId, // Only fetch if productId is provided
    });
};
```

### Conditional Queries

Use the `enabled` option to conditionally fetch data:

```typescript
export const useUserProducts = (userId: string | null) => {
    return useQuery({
        queryKey: queryKeys.products.user(userId!),
        queryFn: () => getUserProducts(productRepositorySupabase, userId!),
        enabled: !!userId, // Only fetch if user is authenticated
    });
};
```

### Query Hook with Filters

```typescript
type ProductFilters = {
    type?: string; // Product type: SAC_BANANE, POCHETTE_ORDINATEUR, etc.
    inStock?: boolean;
};

export const useProductList = (filters?: ProductFilters) => {
    return useQuery({
        queryKey: queryKeys.products.list(filters),
        queryFn: () => listProducts(productRepositorySupabase, filters),
    });
};
```

### Synchronizing with Zustand Store

If you need to sync query data with a Zustand store:

```typescript
import { useEffect } from "react";
import { useAuthStore } from "../stores/useAuthStore";

export const useSession = () => {
    const setSession = useAuthStore((state) => state.setSession);

    const query = useQuery({
        queryKey: queryKeys.auth.session(),
        queryFn: () => getCurrentSession(authRepositorySupabase),
    });

    // Sync with Zustand store when data changes
    useEffect(() => {
        if (query.data !== undefined) {
            setSession(query.data);
        }
    }, [query.data, setSession]);

    return query;
};
```

---

## Creating Mutation Hooks

Mutation hooks modify data on the server. They should be placed in `presentation/hooks/`.

### Basic Mutation Hook

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./queryKeys";
import { createProduct } from "../../core/usecases/products";
import { productRepositorySupabase } from "../../infrastructure/supabase/productRepositorySupabase";

type CreateProductInput = {
    name: string;
    type: string;
    unitCost: number;
    salePrice: number;
    stock: number;
};

/**
 * Hook for creating a new product.
 *
 * @returns {object} Mutation object with mutate, mutateAsync, data, isLoading, error, etc.
 */
export const useCreateProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: CreateProductInput) => createProduct(productRepositorySupabase, input),
        onSuccess: () => {
            // Invalidate and refetch products list
            queryClient.invalidateQueries({ queryKey: queryKeys.products.all() });
        },
    });
};
```

### Mutation with Optimistic Updates

```typescript
export const useUpdateProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) => updateProduct(productRepositorySupabase, id, data),
        onMutate: async ({ id, data }) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: queryKeys.products.detail(id) });

            // Snapshot previous value
            const previousProduct = queryClient.getQueryData<Product>(queryKeys.products.detail(id));

            // Optimistically update
            queryClient.setQueryData(queryKeys.products.detail(id), (old: Product) => ({
                ...old,
                ...data,
            }));

            return { previousProduct };
        },
        onError: (_error, _variables, context) => {
            // Rollback on error
            if (context?.previousProduct) {
                queryClient.setQueryData(queryKeys.products.detail(_variables.id), context.previousProduct);
            }
        },
        onSettled: (_data, _error, variables) => {
            // Refetch to ensure consistency
            queryClient.invalidateQueries({
                queryKey: queryKeys.products.detail(variables.id),
            });
        },
    });
};
```

### Mutation with Loading State Management

```typescript
export const useDeleteProduct = () => {
    const queryClient = useQueryClient();
    const setLoading = useProductStore((state) => state.setLoading);

    return useMutation({
        mutationFn: (id: string) => deleteProduct(productRepositorySupabase, id),
        onMutate: () => {
            setLoading(true);
        },
        onSuccess: () => {
            // Invalidate products list
            queryClient.invalidateQueries({ queryKey: queryKeys.products.all() });
        },
        onSettled: () => {
            setLoading(false);
        },
    });
};
```

### Mutation with Multiple Query Invalidation

```typescript
export const useSignIn = () => {
    const queryClient = useQueryClient();
    const setSession = useAuthStore((state) => state.setSession);
    const setUser = useAuthStore((state) => state.setUser);

    return useMutation({
        mutationFn: (credentials: SignInCredentials) => signInUser(authRepositorySupabase, credentials),
        onSuccess: (data) => {
            // Update Zustand store
            setSession(data.session);
            setUser(data.user);

            // Invalidate related queries
            queryClient.invalidateQueries({ queryKey: queryKeys.auth.session() });
            queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });
        },
    });
};
```

---

## Best Practices

### 1. Always Use Query Key Factory

❌ **Don't:**

```typescript
useQuery({
    queryKey: ["products", productId], // Inline key
    queryFn: () => getProduct(repo, productId),
});
```

✅ **Do:**

```typescript
useQuery({
    queryKey: queryKeys.products.detail(productId), // Factory key
    queryFn: () => getProduct(repo, productId),
});
```

### 2. Call Usecases, Not Repositories

❌ **Don't:**

```typescript
useQuery({
    queryKey: queryKeys.products.all(),
    queryFn: () => productRepositorySupabase.list(), // Direct repository call
});
```

✅ **Do:**

```typescript
useQuery({
    queryKey: queryKeys.products.all(),
    queryFn: () => listProducts(productRepositorySupabase), // Through usecase
});
```

### 3. Invalidate Related Queries on Mutations

❌ **Don't:**

```typescript
useMutation({
    mutationFn: (data) => createProduct(repo, data),
    // Missing invalidation - UI won't update
});
```

✅ **Do:**

```typescript
useMutation({
    mutationFn: (data) => createProduct(repo, data),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.products.all() });
    },
});
```

### 4. Use Proper TypeScript Types

❌ **Don't:**

```typescript
useQuery({
    queryKey: queryKeys.products.all(),
    queryFn: () => listProducts(repo), // No type information
});
```

✅ **Do:**

```typescript
useQuery<Product[], ProductError>({
    queryKey: queryKeys.products.all(),
    queryFn: () => listProducts(repo),
});
```

### 5. Handle Loading and Error States

❌ **Don't:**

```typescript
const { data } = useProducts();
return <div>{data.map(...)}</div>; // Crashes if loading or error
```

✅ **Do:**

```typescript
const { data, isLoading, error } = useProducts();

if (isLoading) return <div>Loading...</div>;
if (error) return <div>Error: {error.message}</div>;
if (!data) return null;

return <div>{data.map(...)}</div>;
```

---

## Performance Optimizations

### 1. Use Selectors to Transform Data

Selectors prevent unnecessary re-renders by selecting only needed data:

```typescript
// Without selector - re-renders on any data change
const { data } = useProducts();

// With selector - only re-renders when product names change
const { data: productNames } = useProducts({
    select: (products) => products.map((p) => p.name),
});
```

### 2. Configure StaleTime Per Query

Override default staleTime for queries that don't change often:

```typescript
useQuery({
    queryKey: queryKeys.products.all(),
    queryFn: () => listProducts(repo),
    staleTime: 10 * 60 * 1000, // 10 minutes (longer than default 5 minutes)
});
```

### 3. Use KeepPreviousData for Pagination

Prevent loading states when paginating:

```typescript
useQuery({
    queryKey: queryKeys.products.list({ page, limit }),
    queryFn: () => listProducts(repo, { page, limit }),
    keepPreviousData: true, // Show previous data while fetching new page
});
```

### 4. Disable Refetching When Not Needed

```typescript
useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: () => getProduct(repo, id),
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: false, // Don't refetch on component mount
});
```

### 5. Use Zustand Selectors

Prevent unnecessary re-renders when using Zustand stores:

```typescript
// ❌ Re-renders on any store change
const session = useAuthStore((state) => state);

// ✅ Only re-renders when session changes
const session = useAuthStore((state) => state.session);
```

---

## Error Handling

### Typed Error Handling

Always type your errors properly:

```typescript
type ProductError = {
    message: string;
    code: string;
};

export const useProducts = () => {
    return useQuery<Product[], ProductError>({
        queryKey: queryKeys.products.all(),
        queryFn: () => listProducts(productRepositorySupabase),
    });
};
```

### Error Handling in Components

```typescript
const { data, isLoading, error } = useProducts();

if (error) {
    // Handle error appropriately
    return <ErrorDisplay error={error} />;
}
```

### Error Handling in Mutations

```typescript
const createProduct = useCreateProduct();

const handleCreate = async (data: CreateProductInput) => {
    try {
        await createProduct.mutateAsync(data);
        // Success handling
    } catch (error) {
        // Error handling
        console.error("Failed to create product:", error);
    }
};
```

---

## Loading States

React Query provides multiple loading states:

-   `isLoading` - True when fetching for the first time (no cached data)
-   `isFetching` - True whenever a fetch is in progress (including background refetches)
-   `isPending` - True when mutation is pending (for mutations)

### Query Loading States

```typescript
const { data, isLoading, isFetching, error } = useProducts();

// Show loading spinner on initial load
if (isLoading) return <Spinner />;

// Show subtle indicator on background refetch
return (
    <div>
        {isFetching && <RefreshIndicator />}
        <ProductList products={data} />
    </div>
);
```

### Mutation Loading States

```typescript
const { mutate, isPending } = useCreateProduct();

<button onClick={() => mutate(data)} disabled={isPending}>
    {isPending ? "Creating..." : "Create Product"}
</button>;
```

---

## Common Pitfalls and Solutions

### Pitfall 1: Not Invalidating Queries After Mutations

**Problem:** UI doesn't update after creating/updating data.

**Solution:** Always invalidate related queries in `onSuccess`:

```typescript
onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.products.all() });
};
```

### Pitfall 2: Creating New Objects in Query Keys

**Problem:** Query key changes on every render, causing unnecessary refetches.

**Solution:** Use stable query keys from the factory:

```typescript
// ❌ New object on every render
queryKey: ["products", { type: "SAC_BANANE" }];

// ✅ Stable key from factory
queryKey: queryKeys.products.list({ type: "SAC_BANANE" });
```

### Pitfall 3: Not Handling Loading States

**Problem:** Component crashes when data is undefined.

**Solution:** Always check loading and error states:

```typescript
const { data, isLoading, error } = useProducts();
if (isLoading) return <Loading />;
if (error) return <Error />;
if (!data) return null;
```

### Pitfall 4: Calling Repositories Directly

**Problem:** Violates Clean Architecture.

**Solution:** Always call usecases:

```typescript
// ❌ Direct repository call
queryFn: () => productRepositorySupabase.list();

// ✅ Through usecase
queryFn: () => listProducts(productRepositorySupabase);
```

### Pitfall 5: Not Using Query Key Factory

**Problem:** Inconsistent keys, hard to invalidate related queries.

**Solution:** Always use the centralized factory:

```typescript
// ❌ Inline keys
queryKey: ["auth", "session"];

// ✅ Factory keys
queryKey: queryKeys.auth.session();
```

---

## Testing React Query Hooks

### Mocking React Query

In tests, mock React Query hooks:

```typescript
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useProducts } from "./useProducts";

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
        },
    });
    return ({ children }: { children: React.ReactNode }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

test("fetches products", async () => {
    const { result } = renderHook(() => useProducts(), {
        wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
});
```

### Testing Query Key Factory

Test that query keys are correctly structured:

```typescript
import { queryKeys } from "./queryKeys";

test("queryKeys.auth.session returns correct key", () => {
    expect(queryKeys.auth.session()).toEqual(["auth", "session"]);
});
```

---

## Additional Resources

-   [React Query Documentation](https://tanstack.com/query/latest)
-   [React Query DevTools](https://tanstack.com/query/latest/docs/react/devtools)
-   [Query Key Factory Pattern](https://tkdodo.eu/blog/effective-react-query-keys)

---

## Summary

-   ✅ Always use the query key factory (`queryKeys`)
-   ✅ Call usecases, never repositories directly
-   ✅ Invalidate related queries after mutations
-   ✅ Handle loading and error states properly
-   ✅ Use TypeScript types for queries and mutations
-   ✅ Optimize with selectors and staleTime when needed
-   ✅ Follow Clean Architecture principles

For questions or clarifications, refer to existing hooks in `presentation/hooks/` or consult the React Query documentation.
