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
 * Formats a date string to a readable format.
 *
 * Handles both ISO 8601 format (with time) and date-only format (YYYY-MM-DD).
 * Uses French locale formatting with abbreviated month names.
 * Format: "day month year" (e.g., "27 janv. 2025").
 *
 * For date-only strings (YYYY-MM-DD), the date is parsed in local timezone
 * to avoid timezone-dependent bugs. For ISO 8601 strings, the date is parsed
 * as provided (may include timezone information).
 *
 * @param {string} dateString - Date string in ISO 8601 format (e.g., "2025-01-27T14:30:00.000Z") or date-only format (e.g., "2025-01-27")
 * @returns {string} Formatted date string (e.g., "27 janv. 2025")
 *
 * @example
 * ```typescript
 * formatDate("2025-01-27T14:30:00.000Z");
 * // Returns: "27 janv. 2025"
 *
 * formatDate("2025-01-27");
 * // Returns: "27 janv. 2025" (parsed in local timezone)
 * ```
 */
export const formatDate = (dateString: string): string => {
    // Check if the string is date-only format (YYYY-MM-DD)
    // This format is used by PeriodStatistics.period for DAILY period
    const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;
    
    let date: Date;
    if (dateOnlyPattern.test(dateString)) {
        // Parse date-only string in local timezone to avoid UTC interpretation
        // This prevents timezone-dependent bugs (e.g., "2025-01-27" interpreted as UTC midnight
        // which could be the previous day in some timezones)
        const [year, month, day] = dateString.split("-").map(Number);
        date = new Date(year, month - 1, day);
    } else {
        // Parse ISO 8601 format (with time) as provided
        date = new Date(dateString);
    }
    
    return new Intl.DateTimeFormat("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(date);
};

/**
 * Formats a month string (YYYY-MM) to a readable format.
 *
 * Uses French locale formatting with abbreviated month names.
 * Format: "month year" (e.g., "janv. 2025").
 *
 * @param {string} monthString - Month string in YYYY-MM format (e.g., "2025-01")
 * @returns {string} Formatted month string (e.g., "janv. 2025")
 *
 * @example
 * ```typescript
 * formatMonth("2025-01");
 * // Returns: "janv. 2025"
 *
 * formatMonth("2025-12");
 * // Returns: "déc. 2025"
 * ```
 */
export const formatMonth = (monthString: string): string => {
    const [year, monthNum] = monthString.split("-");
    const date = new Date(parseInt(year, 10), parseInt(monthNum, 10) - 1, 1);
    return new Intl.DateTimeFormat("fr-FR", {
        month: "short",
        year: "numeric",
    }).format(date);
};

/**
 * Formats a date string (YYYY-MM-DD) to a short format for chart labels.
 *
 * Returns a compact format suitable for X-axis labels in charts.
 * Format: "DD/MM" (e.g., "27/01").
 *
 * @param {string} dateString - Date string in YYYY-MM-DD format (e.g., "2025-01-27")
 * @returns {string} Formatted date string (e.g., "27/01")
 *
 * @example
 * ```typescript
 * formatDateShort("2025-01-27");
 * // Returns: "27/01"
 *
 * formatDateShort("2025-12-31");
 * // Returns: "31/12"
 * ```
 */
export const formatDateShort = (dateString: string): string => {
    const [, month, day] = dateString.split("-");
    return `${day}/${month}`;
};

