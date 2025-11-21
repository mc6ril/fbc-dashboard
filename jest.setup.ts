/**
 * Jest Setup File
 *
 * Global test setup and configuration.
 * This file runs before each test file.
 */

// Import jest-dom matchers for React Testing Library
import "@testing-library/jest-dom";

// Mock Next.js router
jest.mock("next/navigation", () => ({
    useRouter() {
        return {
            push: jest.fn(),
            replace: jest.fn(),
            prefetch: jest.fn(),
            back: jest.fn(),
            pathname: "/",
            query: {},
            asPath: "/",
        };
    },
    usePathname() {
        return "/";
    },
    useSearchParams() {
        return new URLSearchParams();
    },
}));

// Mock next-intl useTranslation hook
jest.mock("next-intl", () => ({
    useTranslations: jest.fn((namespace?: string) => {
        // Import messages dynamically in the mock
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const frMessages = require("./src/shared/i18n/messages/fr.json");
        
        // Helper function to get nested value from object using dot notation
        const getNestedValue = (obj: Record<string, unknown>, path: string[]): unknown => {
            return path.reduce((current: unknown, part: string) => {
                if (typeof current === "object" && current !== null && part in current) {
                    return (current as Record<string, unknown>)[part];
                }
                return undefined;
            }, obj);
        };
        
        // Return translation function
        return (key: string, values?: Record<string, string | number>) => {
            // Build full key path
            const fullKey = namespace ? `${namespace}.${key}` : key;
            const keyParts = fullKey.split(".");
            
            // Get translation value
            const translation = getNestedValue(frMessages, keyParts);
            
            // If translation is a string, return it (with interpolation if needed)
            if (typeof translation === "string") {
                // Simple interpolation: replace {key} with values
                if (values) {
                    return Object.entries(values).reduce(
                        (str, [key, value]) => str.replace(new RegExp(`{${key}}`, "g"), String(value)),
                        translation
                    );
                }
                return translation;
            }
            
            // Fallback: return the key if translation not found
            return fullKey;
        };
    }),
}));

// Suppress console errors in tests (optional - remove if you want to see console errors)
// global.console = {
//     ...console,
//     error: jest.fn(),
//     warn: jest.fn(),
// };

