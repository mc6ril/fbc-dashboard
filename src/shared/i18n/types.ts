/**
 * i18n type definitions.
 *
 * This file defines TypeScript types for translation keys
 * to ensure type safety throughout the application.
 */

import type frMessages from "./messages/fr.json";

/**
 * Supported locale codes.
 * Currently only French is supported, but this can be extended.
 */
export type Locale = "fr";


/**
 * Translation key path type inferred from the French messages structure.
 * This provides type safety for translation keys throughout the application.
 *
 * Examples:
 * - "common.loading"
 * - "errors.dashboard.sales"
 * - "forms.activity.fields.quantity.label"
 */
export type TranslationKey = Paths<typeof frMessages>;

/**
 * Helper type to extract all possible dot-notation paths from a nested object type.
 */
type Paths<T> = T extends object
    ? {
          [K in keyof T]: K extends string
              ? T[K] extends object
                  ? T[K] extends readonly unknown[]
                      ? K
                      : `${K}.${Paths<T[K]>}`
                  : K
              : never;
      }[keyof T]
    : never;

/**
 * Translation namespace type.
 * Represents the top-level namespaces in the translation structure.
 */
export type TranslationNamespace = keyof typeof frMessages;

/**
 * Type helper to get the type of a nested translation value.
 * Useful for type-checking translation values.
 */
export type TranslationValue<T extends TranslationKey> = T extends `${infer N}.${infer Rest}`
    ? N extends TranslationNamespace
        ? Rest extends TranslationKey
            ? GetNestedValue<typeof frMessages[N], Rest>
            : never
        : never
    : T extends TranslationNamespace
      ? typeof frMessages[T]
      : never;

/**
 * Helper type to get nested value from an object using dot notation.
 */
type GetNestedValue<T, K extends string> = K extends `${infer Key}.${infer Rest}`
    ? Key extends keyof T
        ? T[Key] extends object
            ? GetNestedValue<T[Key], Rest>
            : never
        : never
    : K extends keyof T
      ? T[K]
      : never;
