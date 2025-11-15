/**
 * Domain Validation Functions
 *
 * Pure business rule validation functions for authentication domain.
 * These functions contain business logic for validating domain entities
 * and are used across usecases and tests.
 *
 * Following Clean Architecture principles, these functions:
 * - Are pure functions with no side effects
 * - Have no external dependencies
 * - Contain only business rules
 * - Can be used in domain, usecases, and tests
 */

/**
 * Validates email format using a basic regex pattern.
 *
 * This is a basic validation that checks for the standard email format:
 * local@domain where local and domain contain no spaces or @ symbols,
 * and domain contains at least one dot.
 *
 * Note: This is a simplified validation. The authentication service (Supabase)
 * will perform more strict validation. This validation catches obvious errors
 * before making network requests.
 *
 * @param {string} email - Email address to validate
 * @param {boolean} [trim=true] - Whether to trim whitespace before validation (default: true)
 * @returns {boolean} True if email format is valid, false otherwise
 *
 * @example
 * ```typescript
 * isValidEmail("user@example.com"); // true
 * isValidEmail("  user@example.com  "); // true (trimmed)
 * isValidEmail("invalid-email"); // false
 * isValidEmail("user@domain", false); // false (no TLD, not trimmed)
 * ```
 */
export const isValidEmail = (email: string, trim: boolean = true): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailToValidate = trim ? email.trim() : email;
    return emailRegex.test(emailToValidate);
};

/**
 * Validates password meets minimum requirements.
 *
 * Current requirements:
 * - Not empty
 * - Minimum 8 characters
 *
 * This is a basic validation. The authentication service (Supabase) may
 * have additional requirements. This validation catches obvious errors
 * before making network requests.
 *
 * @param {string} password - Password to validate
 * @returns {boolean} True if password meets requirements, false otherwise
 *
 * @example
 * ```typescript
 * isValidPassword("password123"); // true
 * isValidPassword("short"); // false (less than 8 characters)
 * isValidPassword(""); // false (empty)
 * ```
 */
export const isValidPassword = (password: string): boolean => {
    return password.length >= 8;
};

/**
 * Validates UUID v4 format.
 *
 * UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 * Where:
 * - x is any hexadecimal digit
 * - The third group starts with 4 (version 4)
 * - The fourth group starts with 8, 9, a, or b (variant)
 *
 * @param {string} value - String to validate as UUID v4
 * @returns {boolean} True if value is a valid UUID v4 format, false otherwise
 *
 * @example
 * ```typescript
 * isValidUUID("123e4567-e89b-4d3a-a456-426614174000"); // true
 * isValidUUID("invalid-uuid"); // false
 * ```
 */
export const isValidUUID = (value: string): boolean => {
    const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
};

/**
 * Validates ISO 8601 date format.
 *
 * Validates that a string matches the ISO 8601 date-time format:
 * - YYYY-MM-DDTHH:mm:ss.sssZ (with milliseconds and timezone)
 * - YYYY-MM-DDTHH:mm:ssZ (without milliseconds, with timezone)
 * - YYYY-MM-DDTHH:mm:ss (without timezone)
 *
 * Also verifies that the date is actually valid (not just format matching).
 *
 * @param {string} value - String to validate as ISO 8601 date
 * @returns {boolean} True if value is a valid ISO 8601 date format, false otherwise
 *
 * @example
 * ```typescript
 * isValidISO8601("2025-01-27T14:00:00.000Z"); // true
 * isValidISO8601("2025-01-27T14:00:00Z"); // true
 * isValidISO8601("invalid-date"); // false
 * isValidISO8601("2025-13-45T99:99:99.999Z"); // false (invalid date)
 * ```
 */
export const isValidISO8601 = (value: string): boolean => {
    const iso8601Regex =
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
    if (!iso8601Regex.test(value)) {
        return false;
    }
    const date = new Date(value);
    return (
        !isNaN(date.getTime()) &&
        date.toISOString().startsWith(value.substring(0, 19))
    );
};

