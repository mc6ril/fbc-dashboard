/**
 * Zod Error Mapper
 *
 * Maps Zod validation errors to i18n error messages for form fields.
 * Provides accessible error messages that can be displayed to users.
 */

import type { ZodError } from "zod";
import type { ZodIssue } from "zod";

/**
 * Maps Zod error to a field-specific error message key.
 * Returns the error message key that should be used for i18n translation.
 *
 * @param issue - Zod issue from validation error
 * @returns Error message key (e.g., "required", "invalid", "must_be_positive")
 */
export const mapZodIssueToErrorKey = (issue: ZodIssue): string => {
    // Check for custom message in issue
    if (issue.message && issue.message !== "Required" && issue.message !== "Invalid input") {
        return issue.message;
    }

    // Map common Zod error codes to our error keys (Zod v4)
    switch (issue.code) {
        case "invalid_type": {
            const invalidTypeIssue = issue as ZodIssue & { received?: string };
            if (invalidTypeIssue.received === "undefined" || invalidTypeIssue.received === "null") {
                return "required";
            }
            return "invalid";
        }
        case "too_small": {
            const tooSmallIssue = issue as ZodIssue & { type?: string; minimum?: number };
            if (tooSmallIssue.type === "string" && tooSmallIssue.minimum === 1) {
                return "required";
            }
            if (tooSmallIssue.type === "number") {
                if (tooSmallIssue.minimum === 0) {
                    return "must_be_non_negative";
                }
                return "must_be_positive";
            }
            return "invalid";
        }
        case "too_big":
            return "invalid";
        case "invalid_format":
            return "invalid";
        case "invalid_value":
            return "invalid";
        case "custom":
            // Use custom message if available
            return issue.message || "invalid";
        default:
            return "invalid";
    }
};

/**
 * Maps Zod validation errors to form field errors.
 * Returns a record of field paths to error message keys.
 * Prioritizes "required" errors over "invalid" errors for the same field.
 *
 * @param error - Zod validation error
 * @returns Record mapping field paths to error message keys
 *
 * @example
 * ```typescript
 * const result = activityInputSchema.safeParse(input);
 * if (!result.success) {
 *   const errors = mapZodErrorsToFormErrors(result.error);
 *   // { date: "required", quantity: "must_be_positive", ... }
 * }
 * ```
 */
export const mapZodErrorsToFormErrors = (error: ZodError): Record<string, string> => {
    const errors: Record<string, string> = {};

    error.issues.forEach((issue) => {
        // Get the field path (e.g., ["quantity"] or ["product", "modelId"])
        const path = issue.path.join(".");

        // Map the issue to an error key
        const errorKey = mapZodIssueToErrorKey(issue);

        // Store the error for the field
        // Prioritize "required" errors over other errors for the same field
        if (path) {
            if (!errors[path] || errorKey === "required") {
                errors[path] = errorKey;
            }
        } else {
            // If no path, it's a general error
            if (!errors._general || errorKey === "required") {
                errors._general = errorKey;
            }
        }
    });

    return errors;
};

/**
 * Gets the first error message for a specific field from Zod errors.
 *
 * @param error - Zod validation error
 * @param fieldPath - Field path to get error for (e.g., "quantity", "product.modelId")
 * @returns Error message key or undefined if no error for that field
 */
export const getFieldError = (error: ZodError, fieldPath: string): string | undefined => {
    const issue = error.issues.find((issue) => issue.path.join(".") === fieldPath);
    if (!issue) {
        return undefined;
    }
    return mapZodIssueToErrorKey(issue);
};

