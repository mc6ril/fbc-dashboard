/**
 * Number Validation and Parsing Utilities
 *
 * Centralized utilities for validating and parsing numbers across the application.
 * Used in usecases (validation), infrastructure (parsing from Supabase), and schemas (Zod validation).
 */

/**
 * Validates that a number is valid (not NaN, not Infinity).
 *
 * Throws an error if the number is invalid. Used in usecases for validation.
 *
 * @param value - Number to validate
 * @param fieldName - Name of the field for error messages
 * @throws {Error} If number is NaN or Infinity
 *
 * @example
 * ```typescript
 * validateNumber(activity.quantity, "quantity");
 * validateNumber(activity.amount, "amount");
 * ```
 */
export const validateNumber = (value: number, fieldName: string): void => {
    if (isNaN(value)) {
        throw new Error(`${fieldName} must be a valid number`);
    }
    if (!isFinite(value)) {
        throw new Error(`${fieldName} must be a finite number`);
    }
};

/**
 * Checks if a number is valid (not NaN, not Infinity).
 *
 * Returns a boolean without throwing. Useful for conditional validation.
 *
 * @param value - Number to check
 * @returns True if number is valid (not NaN and finite), false otherwise
 *
 * @example
 * ```typescript
 * if (isValidNumber(quantity)) {
 *   // Process quantity
 * }
 * ```
 */
export const isValidNumber = (value: number): boolean => {
    return !isNaN(value) && isFinite(value);
};

/**
 * Safely parses a string or number to a number with validation.
 *
 * Used in infrastructure layer when converting Supabase NUMERIC strings to numbers.
 * Throws an error if the value cannot be parsed or is invalid.
 *
 * @param value - String or number to parse
 * @param fieldName - Name of the field for error messages
 * @returns Parsed number (valid and finite)
 * @throws {Error} If value cannot be parsed or is invalid
 *
 * @example
 * ```typescript
 * const quantity = parseValidNumber(row.quantity, "quantity");
 * const amount = parseValidNumber(row.amount, "amount");
 * ```
 */
export const parseValidNumber = (value: string | number, fieldName: string): number => {
    // If already a number, validate it
    if (typeof value === "number") {
        validateNumber(value, fieldName);
        return value;
    }

    // Parse string to number
    const parsed = parseFloat(value);
    if (isNaN(parsed)) {
        throw new Error(`Invalid ${fieldName} value: ${value}`);
    }
    if (!isFinite(parsed)) {
        throw new Error(`${fieldName} must be a finite number: ${value}`);
    }

    return parsed;
};

/**
 * Checks if a string represents a valid number (not NaN, not Infinity).
 *
 * Used in Zod schemas for validation. Returns boolean without throwing.
 *
 * @param value - String to validate
 * @returns True if string represents a valid finite number, false otherwise
 *
 * @example
 * ```typescript
 * .refine((val) => isValidNumberString(val), { message: "invalid" })
 * ```
 */
export const isValidNumberString = (value: string): boolean => {
    const num = Number.parseFloat(value);
    return !Number.isNaN(num) && Number.isFinite(num);
};

/**
 * Checks if a string represents a positive number (> 0).
 *
 * Used in Zod schemas for positive number validation.
 *
 * @param value - String to validate
 * @returns True if string represents a valid positive number, false otherwise
 *
 * @example
 * ```typescript
 * .refine((val) => isValidPositiveNumberString(val), { message: "must_be_positive" })
 * ```
 */
export const isValidPositiveNumberString = (value: string): boolean => {
    const num = Number.parseFloat(value);
    return !Number.isNaN(num) && Number.isFinite(num) && num > 0;
};

/**
 * Checks if a string represents a valid optional positive number.
 *
 * Returns true if the value is empty/undefined (optional) or a valid positive number.
 * Used in Zod schemas for optional positive number fields.
 *
 * @param value - String to validate (can be undefined, null, or empty string)
 * @returns True if optional or valid positive number, false otherwise
 *
 * @example
 * ```typescript
 * .refine((val) => isValidOptionalPositiveNumberString(val), { message: "must_be_positive" })
 * ```
 */
export const isValidOptionalPositiveNumberString = (value: string | undefined | null): boolean => {
    // Allow empty/undefined values (optional field)
    if (value === undefined || value === null || value.trim() === "") {
        return true;
    }

    const num = Number.parseFloat(value);
    return !Number.isNaN(num) && Number.isFinite(num) && num > 0;
};

