/**
 * Dynamic translation utilities.
 *
 * This file provides generic utilities for conditional translations, interpolation,
 * and pluralization with type safety.
 *
 * Note: Activity-specific translation logic is implemented directly in the AddActivityForm component
 * because it is component-specific and depends on ActivityType from the domain layer.
 */

import type { TranslationKey } from "./types";

/**
 * Gets a translation key with conditional logic.
 * Useful for simple conditional translations based on a boolean or value.
 *
 * @param condition - The condition to evaluate
 * @param trueKey - Translation key to use if condition is true
 * @param falseKey - Translation key to use if condition is false
 * @returns The appropriate translation key
 *
 * @example
 * ```tsx
 * const t = useTranslation("forms.activity.fields.quantity");
 * const labelKey = getConditionalTranslation(
 *   activityType === ActivityType.SALE,
 *   "label_sale",
 *   "label"
 * );
 * const label = t(labelKey); // "Quantité vendue" or "Quantité"
 * ```
 */
export function getConditionalTranslation(
    condition: boolean,
    trueKey: string,
    falseKey: string
): string {
    return condition ? trueKey : falseKey;
}

/**
 * Type-safe interpolation values for translations.
 * Ensures that interpolation keys match the expected format.
 */
export type InterpolationValues = Record<string, string | number | boolean | null | undefined>;

/**
 * Creates a type-safe translation function with interpolation support.
 * This is a wrapper around next-intl's translation function that provides
 * better type safety for interpolation values.
 *
 * @param translate - The translation function from useTranslation hook
 * @returns A wrapper function with type-safe interpolation
 *
 * @example
 * ```tsx
 * const t = useTranslation("common");
 * const translate = createInterpolatedTranslation(t);
 * const message = translate("welcome", { name: "John", count: 5 });
 * ```
 */
export function createInterpolatedTranslation(
    translate: (key: string, values?: InterpolationValues) => string
) {
    return (key: TranslationKey, values?: InterpolationValues): string => {
        return translate(key, values);
    };
}

/**
 * Pluralization rules for French.
 * French uses different plural forms based on the count.
 */
export type PluralRule = "zero" | "one" | "two" | "few" | "many" | "other";

/**
 * Gets the plural rule for a given count in French.
 *
 * @param count - The count to determine plural rule for
 * @returns The plural rule ("one" for 0-1, "other" for 2+)
 *
 * @example
 * ```tsx
 * const rule = getPluralRule(0); // "one"
 * const rule = getPluralRule(1); // "one"
 * const rule = getPluralRule(2); // "other"
 * ```
 */
export function getPluralRule(count: number): PluralRule {
    if (count === 0 || count === 1) {
        return "one";
    }
    return "other";
}

/**
 * Creates a pluralized translation key.
 * Useful for constructing pluralized translation keys programmatically.
 *
 * @param baseKey - The base translation key
 * @param count - The count to determine plural form
 * @param pluralKey - Optional plural key suffix (default: "other")
 * @returns The pluralized translation key
 *
 * @example
 * ```tsx
 * const t = useTranslation("common");
 * const key = createPluralKey("items", 5, "other");
 * const message = t(key, { count: 5 }); // "5 items"
 * ```
 */
export function createPluralKey(
    baseKey: string,
    count: number,
    pluralKey: string = "other"
): string {
    const rule = getPluralRule(count);
    if (rule === "one") {
        return baseKey;
    }
    return `${baseKey}_${pluralKey}`;
}


