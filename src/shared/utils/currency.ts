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

