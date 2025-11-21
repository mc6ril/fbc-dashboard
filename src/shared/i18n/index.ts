/**
 * i18n module exports.
 *
 * This file exports all i18n-related utilities, types, and configuration
 * for use throughout the application.
 *
 * Note: useTranslation hook is in presentation/hooks/useTranslation.ts
 * because React hooks belong to the presentation layer.
 */

export { default as i18nConfig } from "./config";
export type { Locale, TranslationKey, TranslationNamespace, TranslationValue } from "./types";
export { locales, defaultLocale } from "./config";
export { isValidTranslationKey, getTranslationKey } from "@/shared/utils/i18n";
export {
    getConditionalTranslation,
    createInterpolatedTranslation,
    getPluralRule,
    createPluralKey,
} from "./dynamic";
export type { InterpolationValues, PluralRule } from "./dynamic";

