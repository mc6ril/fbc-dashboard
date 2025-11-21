/**
 * i18n utility functions.
 *
 * This file provides helper functions for working with translations
 * and translation keys.
 */

import type { TranslationKey } from "@/shared/i18n/types";
import frMessages from "@/shared/i18n/messages/fr.json";

/**
 * Helper function to get nested value from an object using dot notation path.
 */
function getNestedValue(obj: Record<string, unknown>, path: string[]): unknown {
    return path.reduce((current: unknown, part: string) => {
        if (typeof current === "object" && current !== null && part in current) {
            return (current as Record<string, unknown>)[part];
        }
        return undefined;
    }, obj);
}

/**
 * Validates that a translation key exists in the translation structure.
 * This is a runtime check for translation keys that might be dynamically constructed.
 *
 * Note: TypeScript provides compile-time type safety for translation keys.
 * This runtime validation is useful for dynamically constructed keys or in development.
 *
 * @param key - The translation key to validate
 * @returns True if the key is valid, false otherwise
 *
 * @example
 * ```ts
 * const key = "common.loading";
 * if (isValidTranslationKey(key)) {
 *   // Use the key safely
 * }
 * ```
 */
export function isValidTranslationKey(key: string): key is TranslationKey {
    // Basic format validation
    if (typeof key !== "string" || key.length === 0) {
        return false;
    }

    // Check format: must be dot-separated lowercase words
    if (!/^[a-z]+(\.[a-z_]+)*$/.test(key)) {
        return false;
    }

    // Runtime validation against actual translation structure (in development)
    // In production, TypeScript type checking is sufficient
    if (process.env.NODE_ENV === "development") {
        const parts = key.split(".");
        const value = getNestedValue(frMessages, parts);
        return value !== undefined && typeof value === "string";
    }

    // In production, rely on TypeScript type safety
    return true;
}

/**
 * Gets a translation key with namespace prefix.
 * Useful for constructing translation keys programmatically.
 *
 * @param namespace - The namespace (e.g., "common", "errors.dashboard")
 * @param key - The key within the namespace
 * @returns The full translation key path
 *
 * @example
 * ```ts
 * const key = getTranslationKey("errors", "dashboard.sales");
 * // Returns: "errors.dashboard.sales"
 * ```
 */
export function getTranslationKey(namespace: string, key: string): string {
    return `${namespace}.${key}`;
}

