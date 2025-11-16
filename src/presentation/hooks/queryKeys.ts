/** Centralized query key factory for React Query. */

/** Query key namespaces by resource; keys are readonly tuples. */
export const queryKeys = {
    /**
     * Authentication-related query keys.
     *
     * Used for caching authentication state (session, user).
     */
    auth: {
        /** Query key for current session. */
        session: () => ["auth", "session"] as const,

        /** Query key for current user. */
        user: () => ["auth", "user"] as const,
    },

    // Add more resource namespaces as needed:
    // products: {
    //   all: () => ["products"] as const,
    //   detail: (id: string) => ["products", id] as const,
    //   list: (filters?: ProductFilters) => ["products", "list", filters] as const,
    // },
} as const;

