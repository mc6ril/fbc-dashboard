/**
 * React Query Provider
 *
 * Provides React Query (TanStack Query) context to the application.
 * This provider must wrap the application root to enable React Query hooks
 * throughout the component tree.
 *
 * The QueryClient is configured with default options for caching, refetching,
 * and error handling. These defaults can be customized based on application needs.
 *
 * React Query DevTools are automatically included in development environment
 * for debugging queries, mutations, and cache state. DevTools are excluded
 * from production builds to reduce bundle size.
 */

"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, type ReactNode } from "react";

type Props = {
    children: ReactNode;
};

/**
 * React Query Provider component.
 *
 * Wraps the application with React Query context, enabling all React Query
 * hooks (useQuery, useMutation, etc.) to work throughout the component tree.
 *
 * The QueryClient is created once and reused across renders using useState
 * to ensure a stable instance.
 *
 * @param {Props} props - Component props
 * @param {ReactNode} props.children - Child components to wrap with React Query context
 * @returns {JSX.Element} QueryClientProvider wrapping children
 *
 * @example
 * ```tsx
 * // In app/layout.tsx:
 * <ReactQueryProvider>
 *   {children}
 * </ReactQueryProvider>
 * ```
 */
const ReactQueryProvider = ({ children }: Props) => {
    // Create QueryClient once and reuse it
    // This ensures the client instance is stable across renders
    // Using useState with a function initializer prevents recreation on re-renders
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        // Stale time: 5 minutes (300,000ms)
                        // Data is considered fresh for 5 minutes, preventing unnecessary refetches
                        // This balances freshness with performance, reducing network requests
                        // Individual queries can override this if they need different stale times
                        staleTime: 5 * 60 * 1000,

                        // Garbage collection time: 10 minutes (600,000ms)
                        // Previously called "cacheTime" in React Query v4
                        // Unused/inactive query data is kept in cache for 10 minutes
                        // After this time, data is garbage collected to free memory
                        // This allows instant display of recently viewed data when navigating back
                        gcTime: 10 * 60 * 1000,

                        // Retry: 1 attempt
                        // Failed queries will retry once before showing an error
                        // This handles transient network issues without excessive retries
                        // Set to false to disable retries, or a number for multiple attempts
                        retry: 1,

                        // Refetch on window focus: true
                        // Queries refetch when the browser window regains focus
                        // Useful for keeping data fresh when users return to the app
                        // Particularly important for authentication state
                        // Individual queries can disable this with refetchOnWindowFocus: false
                        refetchOnWindowFocus: true,

                        // Refetch on mount: true (default)
                        // Queries refetch when components mount
                        // Ensures data is fresh when navigating between pages
                        // Can be disabled per-query if stale data is acceptable

                        // Refetch on reconnect: true (default)
                        // Queries refetch when network connection is restored
                        // Helps recover from network interruptions automatically
                    },
                    mutations: {
                        // Retry: 1 attempt
                        // Failed mutations will retry once before showing an error
                        // Mutations typically shouldn't retry (to avoid duplicate operations)
                        // However, one retry helps with transient network failures
                        // Set to false for mutations that must not retry (e.g., payments)
                        retry: 1,
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            {process.env.NODE_ENV === "development" && (
                <ReactQueryDevtools initialIsOpen={false} />
            )}
        </QueryClientProvider>
    );
};

export default ReactQueryProvider;

