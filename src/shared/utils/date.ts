/**
 * Date utility functions for common date operations.
 *
 * These utilities provide helper functions for date calculations and formatting
 * used throughout the application. All functions return ISO 8601 format strings
 * for consistency with usecases and domain types.
 */

/**
 * Gets the start of the current month as an ISO 8601 string.
 *
 * Returns the first day of the current month at 00:00:00.000 in the browser's
 * local timezone, formatted as an ISO 8601 string.
 *
 * The function uses the browser's system timezone to determine the current month,
 * ensuring that "current month" is relative to the user's local time.
 *
 * @returns {string} ISO 8601 string representing the first day of the current month at 00:00:00.000
 *
 * @example
 * ```typescript
 * // If current date is 2025-01-15 14:30:00
 * const monthStart = getCurrentMonthStart();
 * // Returns: "2025-01-01T00:00:00.000Z" (or equivalent in local timezone)
 * ```
 */
export const getCurrentMonthStart = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-indexed (0 = January, 11 = December)

    // Create date for first day of current month at 00:00:00.000
    const monthStart = new Date(year, month, 1, 0, 0, 0, 0);

    // Convert to ISO 8601 string
    return monthStart.toISOString();
};

/**
 * Gets the end of the current month as an ISO 8601 string.
 *
 * Returns the last day of the current month at 23:59:59.999 in the browser's
 * local timezone, formatted as an ISO 8601 string.
 *
 * The function uses the browser's system timezone to determine the current month,
 * ensuring that "current month" is relative to the user's local time.
 *
 * The function correctly handles months with different numbers of days (28, 29, 30, 31).
 *
 * @returns {string} ISO 8601 string representing the last day of the current month at 23:59:59.999
 *
 * @example
 * ```typescript
 * // If current date is 2025-01-15 14:30:00
 * const monthEnd = getCurrentMonthEnd();
 * // Returns: "2025-01-31T23:59:59.999Z" (or equivalent in local timezone)
 *
 * // If current date is 2025-02-15 14:30:00 (February)
 * const monthEnd = getCurrentMonthEnd();
 * // Returns: "2025-02-28T23:59:59.999Z" (or "2025-02-29T23:59:59.999Z" in leap year)
 * ```
 */
export const getCurrentMonthEnd = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-indexed (0 = January, 11 = December)

    // Create date for first day of next month at 00:00:00.000
    // Then subtract 1ms to get the last moment of current month
    const nextMonth = new Date(year, month + 1, 1, 0, 0, 0, 0);
    const monthEnd = new Date(nextMonth.getTime() - 1);

    // Set to 23:59:59.999 to ensure we capture the last moment of the month
    monthEnd.setHours(23, 59, 59, 999);

    // Convert to ISO 8601 string
    return monthEnd.toISOString();
};

/**
 * Formats an ISO 8601 date string to a readable format.
 *
 * Uses French locale formatting with abbreviated month names.
 * Format: "day month year" (e.g., "27 janv. 2025").
 *
 * @param {string} dateString - ISO 8601 date string
 * @returns {string} Formatted date string (e.g., "27 janv. 2025")
 *
 * @example
 * ```typescript
 * formatDate("2025-01-27T14:30:00.000Z");
 * // Returns: "27 janv. 2025"
 * ```
 */
export const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(date);
};

