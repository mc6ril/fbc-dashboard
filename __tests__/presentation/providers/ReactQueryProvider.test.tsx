/**
 * React Query Provider Tests
 *
 * Tests for ReactQueryProvider component to ensure:
 * - DevTools render in development environment
 * - DevTools don't render in production environment
 * - QueryClient is configured correctly
 * - Provider wraps children correctly
 *
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import ReactQueryProvider from "@/presentation/providers/ReactQueryProvider";

// Mock QueryClient to capture configuration
const mockQueryClientConstructor = jest.fn();
jest.mock("@tanstack/react-query", () => ({
    QueryClient: jest.fn().mockImplementation((config) => {
        mockQueryClientConstructor(config);
        return {
            getQueryCache: jest.fn(),
            getMutationCache: jest.fn(),
            setQueryData: jest.fn(),
            getQueryData: jest.fn(),
            invalidateQueries: jest.fn(),
            removeQueries: jest.fn(),
        };
    }),
    QueryClientProvider: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="query-client-provider">{children}</div>
    ),
}));

// Mock ReactQueryDevtools
jest.mock("@tanstack/react-query-devtools", () => ({
    ReactQueryDevtools: ({ initialIsOpen }: { initialIsOpen: boolean }) => (
        <div data-testid="react-query-devtools" data-initial-is-open={initialIsOpen}>
            React Query DevTools
        </div>
    ),
}));

describe("ReactQueryProvider", () => {
    const originalEnv = process.env.NODE_ENV;

    const setNodeEnv = (value: string | undefined): void => {
        Object.defineProperty(process.env, "NODE_ENV", {
            value,
            writable: true,
            configurable: true,
        });
    };

    afterEach(() => {
        // Restore original NODE_ENV
        setNodeEnv(originalEnv);
        jest.clearAllMocks();
        mockQueryClientConstructor.mockClear();
    });

    describe("DevTools rendering", () => {
        it("should render DevTools in development environment", () => {
            setNodeEnv("development");

            render(
                <ReactQueryProvider>
                    <div>Test Content</div>
                </ReactQueryProvider>
            );

            const devTools = screen.queryByTestId("react-query-devtools");
            expect(devTools).toBeInTheDocument();
            expect(devTools).toHaveAttribute("data-initial-is-open", "false");
        });

        it("should not render DevTools in production environment", () => {
            setNodeEnv("production");

            render(
                <ReactQueryProvider>
                    <div>Test Content</div>
                </ReactQueryProvider>
            );

            const devTools = screen.queryByTestId("react-query-devtools");
            expect(devTools).not.toBeInTheDocument();
        });

        it("should not render DevTools when NODE_ENV is not set", () => {
            setNodeEnv(undefined);

            render(
                <ReactQueryProvider>
                    <div>Test Content</div>
                </ReactQueryProvider>
            );

            const devTools = screen.queryByTestId("react-query-devtools");
            expect(devTools).not.toBeInTheDocument();
        });

        it("should configure DevTools with initialIsOpen={false}", () => {
            setNodeEnv("development");

            render(
                <ReactQueryProvider>
                    <div>Test Content</div>
                </ReactQueryProvider>
            );

            const devTools = screen.getByTestId("react-query-devtools");
            expect(devTools).toHaveAttribute("data-initial-is-open", "false");
        });
    });

    describe("QueryClient configuration", () => {
        it("should create QueryClient with correct default options", () => {
            setNodeEnv("development");
            mockQueryClientConstructor.mockClear();

            render(
                <ReactQueryProvider>
                    <div>Test Content</div>
                </ReactQueryProvider>
            );

            expect(mockQueryClientConstructor).toHaveBeenCalled();
            const queryClientConfig = mockQueryClientConstructor.mock.calls[0][0] as {
                defaultOptions: {
                    queries: {
                        staleTime: number;
                        gcTime: number;
                        retry: number;
                        refetchOnWindowFocus: boolean;
                    };
                    mutations: {
                        retry: number;
                    };
                };
            };

            // Verify query defaults
            expect(queryClientConfig.defaultOptions.queries.staleTime).toBe(5 * 60 * 1000); // 5 minutes
            expect(queryClientConfig.defaultOptions.queries.gcTime).toBe(10 * 60 * 1000); // 10 minutes
            expect(queryClientConfig.defaultOptions.queries.retry).toBe(1);
            expect(queryClientConfig.defaultOptions.queries.refetchOnWindowFocus).toBe(true);

            // Verify mutation defaults
            expect(queryClientConfig.defaultOptions.mutations.retry).toBe(1);
        });
    });

    describe("Provider functionality", () => {
        it("should render children correctly", () => {
            setNodeEnv("production");

            render(
                <ReactQueryProvider>
                    <div data-testid="child-content">Child Content</div>
                </ReactQueryProvider>
            );

            const childContent = screen.getByTestId("child-content");
            expect(childContent).toBeInTheDocument();
            expect(childContent).toHaveTextContent("Child Content");
        });

        it("should maintain QueryClient instance across re-renders", () => {
            setNodeEnv("development");
            mockQueryClientConstructor.mockClear();

            const { rerender } = render(
                <ReactQueryProvider>
                    <div>Test Content</div>
                </ReactQueryProvider>
            );

            const firstCallCount = mockQueryClientConstructor.mock.calls.length;
            expect(firstCallCount).toBe(1); // Should be called once on initial render

            // Re-render the component
            rerender(
                <ReactQueryProvider>
                    <div>Test Content Updated</div>
                </ReactQueryProvider>
            );

            // QueryClient should only be created once (useState with function initializer)
            expect(mockQueryClientConstructor.mock.calls.length).toBe(firstCallCount);
        });
    });
});

