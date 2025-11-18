/**
 * Shared UI messages and error messages constants.
 *
 * These constants provide consistent messaging across the application
 * for loading states, error messages, and empty states.
 *
 * All messages are in English and should be used consistently throughout
 * the application to maintain a uniform user experience.
 */

/**
 * Loading state message displayed while data is being fetched.
 */
export const LOADING_MESSAGE = "Loading...";

/**
 * Error messages for dashboard widgets.
 */
export const ERROR_MESSAGES = {
    /** Error message when sales data fails to load */
    SALES_DATA: "Error loading sales data. Please try again later.",
    /** Error message when profit data fails to load */
    PROFIT_DATA: "Error loading profit data. Please try again later.",
    /** Error message when products data fails to load */
    PRODUCTS: "Error loading products. Please try again later.",
    /** Error message when activities data fails to load */
    ACTIVITIES: "Error loading activities. Please try again later.",
} as const;

/**
 * Empty state messages for dashboard widgets.
 */
export const EMPTY_STATE_MESSAGES = {
    /** Message when no products with low stock are found */
    LOW_STOCK_PRODUCTS: "No products with low stock.",
    /** Message when no recent activities are found */
    RECENT_ACTIVITIES: "No recent activities.",
} as const;

