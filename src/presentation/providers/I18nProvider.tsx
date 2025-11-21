/**
 * i18n Provider component for next-intl.
 *
 * This provider wraps the application with next-intl's NextIntlClientProvider
 * to enable translation functionality throughout the app.
 *
 * Messages are loaded based on the locale using a mapping that can be easily
 * extended when new locales are added. For MVP, only French is supported.
 */

"use client";

import React from "react";
import { NextIntlClientProvider } from "next-intl";
import { defaultLocale, locales } from "@/shared/i18n/config";
import type { Locale } from "@/shared/i18n/types";
import frMessages from "@/shared/i18n/messages/fr.json";

type Props = {
    children: React.ReactNode;
    locale?: string;
};

/**
 * Message mapping for supported locales.
 * To add a new locale:
 * 1. Create the translation file in `src/shared/i18n/messages/{locale}.json`
 * 2. Import it here
 * 3. Add it to the mapping below
 * 4. Update `locales` array in `src/shared/i18n/config.ts`
 */
const localeMessages: Record<Locale, Record<string, unknown>> = {
    fr: frMessages,
    // Add more locales here as they are implemented
    // en: enMessages,
};

/**
 * Gets messages for a given locale, falling back to default locale if not found.
 */
const getMessages = (locale: string): Record<string, unknown> => {
    const validLocale = locales.includes(locale as Locale) ? (locale as Locale) : defaultLocale;
    return localeMessages[validLocale] || localeMessages[defaultLocale];
};

const I18nProvider = ({ children, locale = defaultLocale }: Props) => {
    // Validate locale and get messages
    const validLocale: Locale = locales.includes(locale as Locale)
        ? (locale as Locale)
        : defaultLocale;

    const messages = React.useMemo(() => getMessages(validLocale), [validLocale]);

    return (
        <NextIntlClientProvider
            locale={validLocale}
            messages={messages}
            timeZone="Europe/Paris"
        >
            {children}
        </NextIntlClientProvider>
    );
};

export default I18nProvider;

