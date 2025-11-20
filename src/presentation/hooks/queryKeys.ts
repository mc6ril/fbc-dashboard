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

    /**
     * Products-related query keys.
     *
     * Used for caching products list, individual products, models, and coloris.
     */
    products: {
        /** Query key for all products list. */
        all: () => ["products", "all"] as const,

        /**
         * Query key for a single product by ID.
         *
         * @param {string} id - Product ID
         * @returns Query key tuple for product detail
         */
        detail: (id: string) => ["products", "detail", id] as const,

        /**
         * Query key for product models by type.
         *
         * Used for caching models filtered by product type.
         * Enables conditional fetching based on type selection in cascading dropdowns.
         *
         * @param {string} type - Product type (e.g., "POCHETTE_VOLANTS", "SAC_BANANE")
         * @returns Query key tuple for models by type
         */
        modelsByType: (type: string) =>
            ["products", "models", "byType", type] as const,

        /**
         * Query key for product coloris by model.
         *
         * Used for caching coloris filtered by product model.
         * Enables conditional fetching based on model selection in cascading dropdowns.
         *
         * @param {string} modelId - Product model ID
         * @returns Query key tuple for coloris by model
         */
        colorisByModel: (modelId: string) =>
            ["products", "coloris", "byModel", modelId] as const,
    },

    /**
     * Activities-related query keys.
     *
     * Used for caching activities list with filters and pagination.
     */
    activities: {
        /**
         * Query key for filtered and paginated activities list.
         *
         * Includes all filter parameters and pagination info for proper cache invalidation.
         * Filter parameters are serialized consistently to ensure stable query keys.
         *
         * @param {string} [startDate] - Optional start date filter
         * @param {string} [endDate] - Optional end date filter
         * @param {string} [type] - Optional activity type filter
         * @param {string} [productId] - Optional product ID filter
         * @param {number} page - Current page number (1-based)
         * @param {number} pageSize - Number of activities per page
         * @returns Query key tuple for activities list
         */
        list: (
            startDate?: string,
            endDate?: string,
            type?: string,
            productId?: string,
            page: number = 1,
            pageSize: number = 20
        ) =>
            [
                "activities",
                "list",
                {
                    startDate: startDate ?? null,
                    endDate: endDate ?? null,
                    type: type ?? null,
                    productId: productId ?? null,
                    page,
                    pageSize,
                },
            ] as const,
    },
} as const;

