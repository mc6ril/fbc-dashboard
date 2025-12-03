/**
 * Currency utility functions for common currency formatting operations.
 *
 * These utilities provide helper functions for currency formatting
 * used throughout the application. All functions use consistent formatting
 * standards (EUR currency, French locale, 2 decimal places).
 */

/**
 * Formats a number as EUR currency with 2 decimal places.
 *
 * Uses French locale formatting (fr-FR) with EUR currency symbol.
 * Always displays 2 decimal places for consistency.
 *
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string (e.g., "1 234,56 €")
 *
 * @example
 * ```typescript
 * formatCurrency(1234.56);
 * // Returns: "1 234,56 €"
 *
 * formatCurrency(0);
 * // Returns: "0,00 €"
 * ```
 */
export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};

/**
 * Formats a number as a percentage with 1 decimal place.
 *
 * Uses French locale formatting (fr-FR) with % symbol.
 * Always displays 1 decimal place for consistency.
 *
 * @param {number} value - Percentage value to format (e.g., 48.5 for 48.5%)
 * @returns {string} Formatted percentage string (e.g., "48,5 %")
 *
 * @example
 * ```typescript
 * formatPercentage(48.5);
 * // Returns: "48,5 %"
 *
 * formatPercentage(0);
 * // Returns: "0,0 %"
 *
 * formatPercentage(100);
 * // Returns: "100,0 %"
 * ```
 */
export const formatPercentage = (value: number): string => {
    return new Intl.NumberFormat("fr-FR", {
        style: "percent",
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
    }).format(value / 100);
};

