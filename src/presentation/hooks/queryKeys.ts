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

    /**
     * Statistics-related query keys.
     *
     * Used for caching business statistics and analytics data.
     */
    statistics: {
        /**
         * Query key for profits grouped by period.
         *
         * Includes period type and date range for proper cache invalidation.
         *
         * @param {string} period - Period type (DAILY, MONTHLY, YEARLY)
         * @param {string} [startDate] - Optional start date filter
         * @param {string} [endDate] - Optional end date filter
         * @returns Query key tuple for profits by period
         */
        profitsByPeriod: (period: string, startDate?: string, endDate?: string) =>
            [
                "statistics",
                "profitsByPeriod",
                {
                    period,
                    startDate: startDate ?? null,
                    endDate: endDate ?? null,
                },
            ] as const,

        /**
         * Query key for total creations count.
         *
         * Includes date range for proper cache invalidation.
         *
         * @param {string} [startDate] - Optional start date filter
         * @param {string} [endDate] - Optional end date filter
         * @returns Query key tuple for total creations
         */
        totalCreations: (startDate?: string, endDate?: string) =>
            [
                "statistics",
                "totalCreations",
                {
                    startDate: startDate ?? null,
                    endDate: endDate ?? null,
                },
            ] as const,

        /**
         * Query key for product margins.
         *
         * Includes date range for proper cache invalidation.
         *
         * @param {string} [startDate] - Optional start date filter
         * @param {string} [endDate] - Optional end date filter
         * @returns Query key tuple for product margins
         */
        productMargins: (startDate?: string, endDate?: string) =>
            [
                "statistics",
                "productMargins",
                {
                    startDate: startDate ?? null,
                    endDate: endDate ?? null,
                },
            ] as const,

        /**
         * Query key for comprehensive business statistics.
         *
         * Includes date range for proper cache invalidation.
         *
         * @param {string} [startDate] - Optional start date filter
         * @param {string} [endDate] - Optional end date filter
         * @returns Query key tuple for business statistics
         */
        businessStatistics: (startDate?: string, endDate?: string) =>
            [
                "statistics",
                "businessStatistics",
                {
                    startDate: startDate ?? null,
                    endDate: endDate ?? null,
                },
            ] as const,
    },

    /**
     * Revenue-related query keys.
     *
     * Used for caching revenue calculations and financial metrics.
     */
    revenue: {
        /**
         * Query key for revenue data by period.
         *
         * Includes period type and date range for proper cache invalidation.
         *
         * @param {string} period - Period type (MONTH, QUARTER, YEAR, CUSTOM)
         * @param {string} startDate - Start date (ISO 8601 format)
         * @param {string} endDate - End date (ISO 8601 format)
         * @returns Query key tuple for revenue data
         */
        byPeriod: (period: string, startDate: string, endDate: string) =>
            [
                "revenue",
                "byPeriod",
                {
                    period,
                    startDate,
                    endDate,
                },
            ] as const,

        /**
         * Query key for revenue breakdown by product type.
         *
         * Includes date range for proper cache invalidation.
         *
         * @param {string} startDate - Start date (ISO 8601 format)
         * @param {string} endDate - End date (ISO 8601 format)
         * @returns Query key tuple for revenue by product type
         */
        byProductType: (startDate: string, endDate: string) =>
            [
                "revenue",
                "byProductType",
                {
                    startDate,
                    endDate,
                },
            ] as const,

        /**
         * Query key for revenue breakdown by individual product.
         *
         * Includes date range for proper cache invalidation.
         *
         * @param {string} startDate - Start date (ISO 8601 format)
         * @param {string} endDate - End date (ISO 8601 format)
         * @returns Query key tuple for revenue by product
         */
        byProduct: (startDate: string, endDate: string) =>
            [
                "revenue",
                "byProduct",
                {
                    startDate,
                    endDate,
                },
            ] as const,
    },

    /**
     * Cost-related query keys.
     *
     * Used for caching monthly cost data.
     */
    costs: {
        /**
         * Query key for monthly cost by month.
         *
         * Includes month (YYYY-MM format) for proper cache invalidation.
         *
         * @param {string} month - Month in YYYY-MM format (e.g., "2025-01")
         * @returns Query key tuple for monthly cost
         */
        monthly: (month: string) => ["costs", "monthly", month] as const,
    },
} as const;

