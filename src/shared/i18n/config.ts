/**
 * i18n configuration for next-intl.
 *
 * This file configures the internationalization settings for the application,
 * including locale detection, default locale, and supported locales.
 */

import { getRequestConfig } from "next-intl/server";
import type { Locale } from "./types";

/**
 * Supported locales in the application.
 * Currently only French is supported, but this structure allows for easy addition of other languages.
 */
export const locales = ["fr"] as const satisfies readonly Locale[];

/**
 * Default locale used when no locale is specified.
 */
export const defaultLocale: Locale = "fr";

/**
 * Configuration for next-intl request handling.
 * This function is called for each request to configure the locale and messages.
 */
export default getRequestConfig(async ({ requestLocale }) => {
    // Use the locale from the request, or fall back to default locale
    let locale = (await requestLocale) as Locale;

    // Ensure locale is valid, fallback to default if not
    if (!locale || !locales.includes(locale)) {
        locale = defaultLocale;
    }

    return {
        locale,
        messages: (await import(`./messages/${locale}.json`)).default,
        // Set timezone for French locale (Europe/Paris)
        // This prevents environment mismatches and ensures consistent date/time formatting
        timeZone: "Europe/Paris",
    };
});

