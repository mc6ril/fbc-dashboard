/**
 * Next.js middleware for i18n locale detection and routing.
 *
 * This middleware handles locale detection and routing for next-intl.
 * It detects the user's preferred locale and routes requests accordingly.
 *
 * Note: In Next.js 16+, the middleware file must be at the project root
 * (not in src/) for proper detection and execution.
 */

import createMiddleware from "next-intl/middleware";
import { defaultLocale, locales } from "@/shared/i18n/config";

export default createMiddleware({
    // A list of all locales that are supported
    locales,

    // Used when no locale matches
    defaultLocale,

    // No locale prefix in URLs (all routes use default locale without /fr/ prefix)
    localePrefix: "never",
});

export const config = {
    // Match all routes except Next.js internals and static files
    // This ensures i18n middleware runs on all application routes
    matcher: [
        // Exclude Next.js internals, API routes, static files, and other system paths
        "/((?!api|_next|_vercel|.*\\..*).*)",
        // Explicitly include root path
        "/",
    ],
};

