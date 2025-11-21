/**
 * Translation hook for i18n.
 *
 * This hook provides access to translations for a specific namespace.
 * It wraps next-intl's useTranslations hook with consistent usage patterns.
 *
 * @param namespace - The translation namespace (e.g., "common", "forms.activity")
 * @returns Translation function that accepts a key and optional values
 *
 * @example
 * ```tsx
 * const t = useTranslation("common");
 * <button>{t("loading")}</button> // "Chargement en cours..."
 * ```
 */

import { useTranslations as useNextIntlTranslations } from "next-intl";

export function useTranslation(namespace?: string) {
    return useNextIntlTranslations(namespace);
}

