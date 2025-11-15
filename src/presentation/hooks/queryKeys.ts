/**
 * Centralized Query Key Factory
 *
 * Provides type-safe, hierarchical query keys for React Query cache management.
 * All query keys should be defined here to ensure consistency and easy invalidation.
 *
 * Query keys follow a hierarchical structure: ["resource", "id", "filters"]
 * This pattern allows for:
 * - Type-safe cache key generation
 * - Easy cache invalidation (e.g., invalidate all auth queries)
 * - Consistent key structure across the application
 * - Better developer experience with autocomplete
 *
 * Usage:
 * ```tsx
 * // In a hook:
 * import { queryKeys } from "./queryKeys";
 *
 * useQuery({
 *   queryKey: queryKeys.auth.session(),
 *   queryFn: () => getCurrentSession(repo),
 * });
 *
 * // Invalidate all auth queries:
 * queryClient.invalidateQueries({ queryKey: ["auth"] });
 * ```
 */

/**
 * Centralized query key factory for React Query.
 *
 * Provides type-safe, hierarchical query keys for consistent cache management.
 * All query keys should be defined here to ensure consistency and easy invalidation.
 *
 * Structure:
 * - Each resource has its own namespace (e.g., `auth`, `products`)
 * - Each query type is a function that returns a readonly tuple
 * - Functions allow for future extensibility (e.g., `auth.session(id)`)
 * - All keys use `as const` for type safety and immutability
 */
export const queryKeys = {
    /**
     * Authentication-related query keys.
     *
     * Used for caching authentication state (session, user).
     */
    auth: {
        /**
         * Query key for the current authentication session.
         *
         * @returns {readonly ["auth", "session"]} Query key tuple for session cache
         *
         * @example
         * ```tsx
         * useQuery({
         *   queryKey: queryKeys.auth.session(),
         *   queryFn: () => getCurrentSession(repo),
         * });
         * ```
         */
        session: () => ["auth", "session"] as const,

        /**
         * Query key for the current authenticated user.
         *
         * @returns {readonly ["auth", "user"]} Query key tuple for user cache
         *
         * @example
         * ```tsx
         * useQuery({
         *   queryKey: queryKeys.auth.user(),
         *   queryFn: () => getCurrentUser(repo),
         * });
         * ```
         */
        user: () => ["auth", "user"] as const,
    },

    // Add more resource namespaces as needed:
    // products: {
    //   all: () => ["products"] as const,
    //   detail: (id: string) => ["products", id] as const,
    //   list: (filters?: ProductFilters) => ["products", "list", filters] as const,
    // },
} as const;

