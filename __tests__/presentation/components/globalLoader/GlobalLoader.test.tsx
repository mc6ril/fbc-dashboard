import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import GlobalLoader from "@/presentation/components/globalLoader/GlobalLoader";
import { useGlobalLoadingStore } from "@/presentation/stores/useGlobalLoadingStore";

// Mock the store
jest.mock("@/presentation/stores/useGlobalLoadingStore");
jest.mock("@/shared/a11y/utils", () => ({
    getAccessibilityId: jest.fn((key: string, suffix?: string) => {
        return suffix ? `a11y-${key}-${suffix}` : `a11y-${key}`;
    }),
}));

// Mock SCSS module
jest.mock("@/presentation/components/globalLoader/GlobalLoader.module.scss", () => ({
    overlay: "overlay",
    spinner: "spinner",
    text: "text",
}));

const mockUseGlobalLoadingStore = useGlobalLoadingStore as jest.MockedFunction<
    typeof useGlobalLoadingStore
>;

describe("GlobalLoader", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    describe("when loading is false", () => {
        it("should not render anything", () => {
            // Mock the selector to return false
            mockUseGlobalLoadingStore.mockImplementation((selector) => {
                return selector({ isLoading: false } as ReturnType<typeof useGlobalLoadingStore>);
            });

            const { container } = render(<GlobalLoader />);

            expect(container.firstChild).toBeNull();
        });
    });

    describe("when loading is true", () => {
        beforeEach(() => {
            // Mock the selector to return true
            mockUseGlobalLoadingStore.mockImplementation((selector) => {
                return selector({ isLoading: true } as ReturnType<typeof useGlobalLoadingStore>);
            });
        });

        it("should render the overlay", () => {
            render(<GlobalLoader />);

            const overlay = screen.getByRole("status");
            expect(overlay).toBeInTheDocument();
            expect(overlay).toHaveClass("overlay");
        });

        it("should have correct accessibility attributes", () => {
            render(<GlobalLoader />);

            const overlay = screen.getByRole("status");
            expect(overlay).toHaveAttribute("aria-live", "polite");
            expect(overlay).toHaveAttribute("aria-busy", "true");
            expect(overlay).toHaveAttribute("aria-label", "Loading");
            expect(overlay).toHaveAttribute("id", "a11y-status-global-loader");
        });

        it("should render the spinner", () => {
            render(<GlobalLoader />);

            const spinner = document.querySelector(".spinner");
            expect(spinner).toBeInTheDocument();
            expect(spinner).toHaveAttribute("aria-hidden", "true");
        });

        it("should render the loading text", () => {
            render(<GlobalLoader />);

            const text = screen.getByText("Loading...");
            expect(text).toBeInTheDocument();
            expect(text).toHaveClass("text");
        });

        it("should update when loading state changes", () => {
            // Start with loading true
            mockUseGlobalLoadingStore.mockImplementation((selector) => {
                return selector({ isLoading: true } as ReturnType<typeof useGlobalLoadingStore>);
            });
            const { unmount } = render(<GlobalLoader />);

            expect(screen.getByRole("status")).toBeInTheDocument();
            unmount();
            cleanup();

            // Change loading state to false and render again
            mockUseGlobalLoadingStore.mockImplementation((selector) => {
                return selector({ isLoading: false } as ReturnType<typeof useGlobalLoadingStore>);
            });
            render(<GlobalLoader />);

            expect(screen.queryByRole("status")).not.toBeInTheDocument();
        });
    });
});

