/**
 * Jest Setup File
 *
 * Global test setup and configuration.
 * This file runs before each test file.
 */

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

// Suppress console errors in tests (optional - remove if you want to see console errors)
// global.console = {
//     ...console,
//     error: jest.fn(),
//     warn: jest.fn(),
// };

