/**
 * React Query Provider
 *
 * Provides React Query (TanStack Query) context to the application.
 * This provider must wrap the application root to enable React Query hooks
 * throughout the component tree.
 *
 * The QueryClient is configured with default options for caching, refetching,
 * and error handling. These defaults can be customized based on application needs.
 */

"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        // Stale time: data is considered fresh for 5 minutes
                        staleTime: 5 * 60 * 1000,
                        // Cache time: unused data is kept in cache for 10 minutes
                        gcTime: 10 * 60 * 1000,
                        // Retry failed requests once
                        retry: 1,
                        // Refetch on window focus (useful for auth state)
                        refetchOnWindowFocus: true,
                    },
                    mutations: {
                        // Retry failed mutations once
                        retry: 1,
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
};

export default ReactQueryProvider;

