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
export const LOADING_MESSAGE = "Chargement en cours...";

/**
 * Error messages for dashboard widgets.
 */
export const ERROR_MESSAGES = {
    /** Error message when sales data fails to load */
    SALES_DATA: "Erreur lors du chargement des données de ventes. Veuillez réessayer plus tard.",
    /** Error message when profit data fails to load */
    PROFIT_DATA: "Erreur lors du chargement des données de profit. Veuillez réessayer plus tard.",
    /** Error message when products data fails to load */
    PRODUCTS: "Erreur lors du chargement des produits. Veuillez réessayer plus tard.",
    /** Error message when activities data fails to load */
    ACTIVITIES: "Erreur lors du chargement des activités. Veuillez réessayer plus tard.",
} as const;

/**
 * Empty state messages for dashboard widgets.
 */
export const EMPTY_STATE_MESSAGES = {
    /** Message when no products with low stock are found */
    LOW_STOCK_PRODUCTS: "Aucun produit en stock faible trouvé.",
    /** Message when no recent activities are found */
    RECENT_ACTIVITIES: "Aucune activité récente trouvée.",
} as const;

