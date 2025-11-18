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

    /**
     * Dashboard-related query keys.
     *
     * Used for caching dashboard metrics and widgets data.
     */
    dashboard: {
        /** Query key for monthly sales amount. */
        monthlySales: () => ["dashboard", "monthlySales"] as const,

        /** Query key for monthly profit amount. */
        monthlyProfit: () => ["dashboard", "monthlyProfit"] as const,

        /** Query key for low stock products list. */
        lowStockProducts: () => ["dashboard", "lowStockProducts"] as const,

        /** Query key for recent activities list. */
        recentActivities: () => ["dashboard", "recentActivities"] as const,
    },
} as const;

