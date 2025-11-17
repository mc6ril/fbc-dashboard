/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import RestrictedPage from "@/presentation/components/restrictedPage/RestrictedPage";
import { useAuthStore } from "@/presentation/stores/useAuthStore";
import { useSession } from "@/presentation/hooks/useAuth";

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock auth hooks
jest.mock("@/presentation/hooks/useAuth", () => ({
  useSession: jest.fn(),
}));

// Mock Zustand store
jest.mock("@/presentation/stores/useAuthStore", () => ({
  useAuthStore: jest.fn(),
}));

const mockPush = jest.fn();
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;
const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;

describe("RestrictedPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      pathname: "/",
      query: {},
      asPath: "/",
    } as any);
  });

  it("renders children when authenticated", () => {
    // Mock authenticated state
    mockUseAuthStore.mockImplementation((selector) => {
      const state = {
        session: { accessToken: "token", expiresAt: new Date().toISOString() },
        user: null,
        isLoading: false,
      };
      return selector(state as any);
    });
    
    mockUseSession.mockReturnValue({
      data: { accessToken: "token", expiresAt: new Date().toISOString() },
      isLoading: false,
      error: null,
    } as any);

    render(
      <RestrictedPage>
        <div>Protected Content</div>
      </RestrictedPage>
    );

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("shows loading state when auth is loading", () => {
    // Mock loading state
    mockUseAuthStore.mockImplementation((selector) => {
      const state = {
        session: null,
        user: null,
        isLoading: true,
      };
      return selector(state as any);
    });
    
    mockUseSession.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    } as any);

    render(
      <RestrictedPage>
        <div>Protected Content</div>
      </RestrictedPage>
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("shows access denied message when not authenticated", async () => {
    // Mock unauthenticated state
    mockUseAuthStore.mockImplementation((selector) => {
      const state = {
        session: null,
        user: null,
        isLoading: false,
      };
      return selector(state as any);
    });
    
    mockUseSession.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    } as any);

    render(
      <RestrictedPage>
        <div>Protected Content</div>
      </RestrictedPage>
    );

    await waitFor(() => {
      expect(screen.getByText("Access Restricted")).toBeInTheDocument();
    });

    expect(screen.getByText("You must be signed in to access this page.")).toBeInTheDocument();
    expect(screen.getByText("Go to Sign In")).toBeInTheDocument();
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  it("redirects to /signin when not authenticated", async () => {
    // Mock unauthenticated state
    mockUseAuthStore.mockImplementation((selector) => {
      const state = {
        session: null,
        user: null,
        isLoading: false,
      };
      return selector(state as any);
    });
    
    mockUseSession.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    } as any);

    render(
      <RestrictedPage>
        <div>Protected Content</div>
      </RestrictedPage>
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/signin");
    });
  });

  it("has proper accessibility attributes for access denied message", async () => {
    // Mock unauthenticated state
    mockUseAuthStore.mockImplementation((selector) => {
      const state = {
        session: null,
        user: null,
        isLoading: false,
      };
      return selector(state as any);
    });
    
    mockUseSession.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    } as any);

    render(
      <RestrictedPage>
        <div>Protected Content</div>
      </RestrictedPage>
    );

    await waitFor(() => {
      const message = screen.getByRole("alert");
      expect(message).toHaveAttribute("aria-live", "polite");
    });
  });

  it("has proper accessibility attributes for loading state", () => {
    // Mock loading state
    mockUseAuthStore.mockImplementation((selector) => {
      const state = {
        session: null,
        user: null,
        isLoading: true,
      };
      return selector(state as any);
    });
    
    mockUseSession.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    } as any);

    render(
      <RestrictedPage>
        <div>Protected Content</div>
      </RestrictedPage>
    );

    const loadingContainer = screen.getByRole("status");
    expect(loadingContainer).toHaveAttribute("aria-live", "polite");
    expect(loadingContainer).toHaveAttribute("aria-busy", "true");
  });
});

