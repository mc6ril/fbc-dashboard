/**
 * Date utility functions for common date operations.
 *
 * These utilities provide helper functions for date calculations and formatting
 * used throughout the application. All functions return ISO 8601 format strings
 * for consistency with usecases and domain types.
 */

/**
 * Validates ISO 8601 date format.
 *
 * Validates that a string matches the ISO 8601 date-time format:
 * - YYYY-MM-DDTHH:mm:ss.sssZ (with milliseconds and timezone)
 * - YYYY-MM-DDTHH:mm:ssZ (without milliseconds, with timezone)
 * - YYYY-MM-DDTHH:mm:ss (without timezone)
 *
 * Also verifies that the date is actually valid (not just format matching).
 * Used in usecases for date validation.
 *
 * @param {string} dateString - Date string to validate
 * @returns {boolean} True if the string is a valid ISO 8601 date, false otherwise
 *
 * @example
 * ```typescript
 * isValidISO8601("2025-01-27T14:00:00.000Z"); // true
 * isValidISO8601("2025-01-27T14:00:00Z"); // true
 * isValidISO8601("invalid-date"); // false
 * isValidISO8601("2025-13-45T99:99:99.999Z"); // false (invalid date)
 * ```
 */
export const isValidISO8601 = (dateString: string): boolean => {
    if (!dateString || typeof dateString !== "string") {
        return false;
    }

    const trimmed = dateString.trim();
    if (trimmed === "") {
        return false;
    }

    // Validate ISO 8601 format with regex
    const iso8601Regex =
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
    if (!iso8601Regex.test(trimmed)) {
        return false;
    }

    // Verify that the date is actually valid (not just format matching)
    const date = new Date(trimmed);
    return (
        !isNaN(date.getTime()) &&
        date.toISOString().startsWith(trimmed.substring(0, 19))
    );
};

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
 * Gets the start of the current quarter as an ISO 8601 string.
 *
 * Returns the first day of the current quarter at 00:00:00.000 in the browser's
 * local timezone, formatted as an ISO 8601 string.
 *
 * Quarters:
 * - Q1: January-March (months 0-2)
 * - Q2: April-June (months 3-5)
 * - Q3: July-September (months 6-8)
 * - Q4: October-December (months 9-11)
 *
 * The function uses the browser's system timezone to determine the current quarter,
 * ensuring that "current quarter" is relative to the user's local time.
 *
 * @returns {string} ISO 8601 string representing the first day of the current quarter at 00:00:00.000
 *
 * @example
 * ```typescript
 * // If current date is 2025-02-15 14:30:00 (February, Q1)
 * const quarterStart = getCurrentQuarterStart();
 * // Returns: "2025-01-01T00:00:00.000Z" (or equivalent in local timezone)
 *
 * // If current date is 2025-05-15 14:30:00 (May, Q2)
 * const quarterStart = getCurrentQuarterStart();
 * // Returns: "2025-04-01T00:00:00.000Z" (or equivalent in local timezone)
 * ```
 */
export const getCurrentQuarterStart = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-indexed (0 = January, 11 = December)

    // Calculate the first month of the current quarter
    // Q1: months 0-2, Q2: months 3-5, Q3: months 6-8, Q4: months 9-11
    const quarterStartMonth = Math.floor(month / 3) * 3; // 0, 3, 6, or 9

    // Create date for first day of current quarter at 00:00:00.000
    const quarterStart = new Date(year, quarterStartMonth, 1, 0, 0, 0, 0);

    // Convert to ISO 8601 string
    return quarterStart.toISOString();
};

/**
 * Gets the end of the current quarter as an ISO 8601 string.
 *
 * Returns the last day of the current quarter at 23:59:59.999 in the browser's
 * local timezone, formatted as an ISO 8601 string.
 *
 * Quarters:
 * - Q1: January-March (ends March 31)
 * - Q2: April-June (ends June 30)
 * - Q3: July-September (ends September 30)
 * - Q4: October-December (ends December 31)
 *
 * The function uses the browser's system timezone to determine the current quarter,
 * ensuring that "current quarter" is relative to the user's local time.
 *
 * @returns {string} ISO 8601 string representing the last day of the current quarter at 23:59:59.999
 *
 * @example
 * ```typescript
 * // If current date is 2025-02-15 14:30:00 (February, Q1)
 * const quarterEnd = getCurrentQuarterEnd();
 * // Returns: "2025-03-31T23:59:59.999Z" (or equivalent in local timezone)
 *
 * // If current date is 2025-05-15 14:30:00 (May, Q2)
 * const quarterEnd = getCurrentQuarterEnd();
 * // Returns: "2025-06-30T23:59:59.999Z" (or equivalent in local timezone)
 * ```
 */
export const getCurrentQuarterEnd = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-indexed (0 = January, 11 = December)

    // Calculate the first month of the next quarter
    // Q1: months 0-2, Q2: months 3-5, Q3: months 6-8, Q4: months 9-11
    const quarterStartMonth = Math.floor(month / 3) * 3; // 0, 3, 6, or 9
    const nextQuarterStartMonth = quarterStartMonth + 3; // 3, 6, 9, or 12

    // Create date for first day of next quarter at 00:00:00.000
    // Then subtract 1ms to get the last moment of current quarter
    const nextQuarter = new Date(year, nextQuarterStartMonth, 1, 0, 0, 0, 0);
    const quarterEnd = new Date(nextQuarter.getTime() - 1);

    // Set to 23:59:59.999 to ensure we capture the last moment of the quarter
    quarterEnd.setHours(23, 59, 59, 999);

    // Convert to ISO 8601 string
    return quarterEnd.toISOString();
};

/**
 * Gets the start of the current year as an ISO 8601 string.
 *
 * Returns the first day of the current year (January 1st) at 00:00:00.000 in the browser's
 * local timezone, formatted as an ISO 8601 string.
 *
 * The function uses the browser's system timezone to determine the current year,
 * ensuring that "current year" is relative to the user's local time.
 *
 * @returns {string} ISO 8601 string representing January 1st at 00:00:00.000
 *
 * @example
 * ```typescript
 * // If current date is 2025-06-15 14:30:00
 * const yearStart = getCurrentYearStart();
 * // Returns: "2025-01-01T00:00:00.000Z" (or equivalent in local timezone)
 * ```
 */
export const getCurrentYearStart = (): string => {
    const now = new Date();
    const year = now.getFullYear();

    // Create date for January 1st at 00:00:00.000
    const yearStart = new Date(year, 0, 1, 0, 0, 0, 0);

    // Convert to ISO 8601 string
    return yearStart.toISOString();
};

/**
 * Gets the end of the current year as an ISO 8601 string.
 *
 * Returns the last day of the current year (December 31st) at 23:59:59.999 in the browser's
 * local timezone, formatted as an ISO 8601 string.
 *
 * The function uses the browser's system timezone to determine the current year,
 * ensuring that "current year" is relative to the user's local time.
 *
 * @returns {string} ISO 8601 string representing December 31st at 23:59:59.999
 *
 * @example
 * ```typescript
 * // If current date is 2025-06-15 14:30:00
 * const yearEnd = getCurrentYearEnd();
 * // Returns: "2025-12-31T23:59:59.999Z" (or equivalent in local timezone)
 * ```
 */
export const getCurrentYearEnd = (): string => {
    const now = new Date();
    const year = now.getFullYear();

    // Create date for January 1st of next year at 00:00:00.000
    // Then subtract 1ms to get the last moment of current year
    const nextYear = new Date(year + 1, 0, 1, 0, 0, 0, 0);
    const yearEnd = new Date(nextYear.getTime() - 1);

    // Set to 23:59:59.999 to ensure we capture the last moment of the year
    yearEnd.setHours(23, 59, 59, 999);

    // Convert to ISO 8601 string
    return yearEnd.toISOString();
};

/**
 * Converts an ISO 8601 date string to HTML date input format (YYYY-MM-DD).
 *
 * Extracts the date portion from an ISO 8601 string for use in HTML date inputs.
 * The function handles both full ISO 8601 format (with time) and date-only format.
 *
 * @param {string} isoString - ISO 8601 date string (e.g., "2025-01-27T14:30:00.000Z" or "2025-01-27")
 * @returns {string} Date string in YYYY-MM-DD format (e.g., "2025-01-27")
 *
 * @example
 * ```typescript
 * isoToDateInput("2025-01-27T14:30:00.000Z");
 * // Returns: "2025-01-27"
 *
 * isoToDateInput("2025-01-27");
 * // Returns: "2025-01-27"
 * ```
 */
export const isoToDateInput = (isoString: string): string => {
    // If already in YYYY-MM-DD format, return as-is
    const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;
    if (dateOnlyPattern.test(isoString)) {
        return isoString;
    }

    // Extract date portion from ISO 8601 string (YYYY-MM-DDTHH:mm:ss...)
    return isoString.substring(0, 10);
};

/**
 * Converts HTML date input format (YYYY-MM-DD) to ISO 8601 string.
 *
 * Converts a date-only string from HTML date inputs to a full ISO 8601 timestamp.
 * The time is set to the start of the day (00:00:00.000) in the browser's local timezone.
 *
 * @param {string} dateInput - Date string in YYYY-MM-DD format (e.g., "2025-01-27")
 * @returns {string} ISO 8601 string representing the start of the day (e.g., "2025-01-27T00:00:00.000Z")
 *
 * @example
 * ```typescript
 * dateInputToIso("2025-01-27");
 * // Returns: "2025-01-27T00:00:00.000Z" (or equivalent in local timezone)
 * ```
 */
export const dateInputToIso = (dateInput: string): string => {
    // Parse date-only string in local timezone
    const [year, month, day] = dateInput.split("-").map(Number);
    const date = new Date(year, month - 1, day, 0, 0, 0, 0);

    // Convert to ISO 8601 string
    return date.toISOString();
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

/**
 * Filters items by date range using ISO 8601 string comparison.
 *
 * Filters an array of items that have a `date` property (ISO 8601 string format)
 * to include only items within the specified date range.
 *
 * Date range logic:
 * - If `startDate` is provided, only items on or after this date are included
 * - If `endDate` is provided, only items on or before this date are included
 * - Date comparison uses ISO 8601 string comparison (lexicographic order)
 * - Both dates are optional (if neither is provided, all items are returned)
 *
 * @template T - Type of items in the array (must have a `date: string` property)
 * @param {T[]} items - Array of items to filter (each item must have a `date` property)
 * @param {string} [startDate] - Optional start date (ISO 8601 format) to filter items from this date onwards
 * @param {string} [endDate] - Optional end date (ISO 8601 format) to filter items up to this date
 * @returns {T[]} Filtered array of items within the date range
 *
 * @example
 * ```typescript
 * const activities = [
 *   { id: "1", date: "2025-01-15T10:00:00.000Z", ... },
 *   { id: "2", date: "2025-01-20T10:00:00.000Z", ... },
 *   { id: "3", date: "2025-01-25T10:00:00.000Z", ... },
 * ];
 * const filtered = filterByDateRange(
 *   activities,
 *   "2025-01-18T00:00:00.000Z",
 *   "2025-01-22T23:59:59.999Z"
 * );
 * // Returns: [{ id: "2", date: "2025-01-20T10:00:00.000Z", ... }]
 * ```
 */
export const filterByDateRange = <T extends { date: string }>(
    items: T[],
    startDate?: string,
    endDate?: string
): T[] => {
    // If no date filters provided, return all items
    if (startDate === undefined && endDate === undefined) {
        return items;
    }

    // Filter items by date range
    return items.filter((item) => {
        const itemDate = item.date;

        // Filter by startDate (items on or after startDate)
        if (startDate !== undefined && itemDate < startDate) {
            return false;
        }

        // Filter by endDate (items on or before endDate)
        if (endDate !== undefined && itemDate > endDate) {
            return false;
        }

        return true;
    });
};

