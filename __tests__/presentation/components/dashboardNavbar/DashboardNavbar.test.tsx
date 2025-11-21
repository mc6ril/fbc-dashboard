/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import { usePathname } from "next/navigation";
import DashboardNavbar from "@/presentation/components/dashboardNavbar/DashboardNavbar";

// Mock Next.js navigation
jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

// Mock useAuth hook to avoid Supabase client initialization
jest.mock("@/presentation/hooks/useAuth", () => ({
  useSignOut: jest.fn(() => ({
    mutateAsync: jest.fn(),
    isPending: false,
  })),
}));

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

describe("DashboardNavbar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders all navigation links", () => {
    mockUsePathname.mockReturnValue("/dashboard");

    render(<DashboardNavbar />);

    expect(screen.getByRole("navigation", { name: "Main navigation" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Dashboard" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Statistiques" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Activités" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Catalogue" })).toBeInTheDocument();
  });

  it("sets aria-current='page' for active dashboard link", () => {
    mockUsePathname.mockReturnValue("/dashboard");

    render(<DashboardNavbar />);

    const dashboardLink = screen.getByRole("link", { name: "Dashboard" });
    expect(dashboardLink).toHaveAttribute("aria-current", "page");
  });

  it("sets aria-current='page' for active stats link", () => {
    mockUsePathname.mockReturnValue("/dashboard/stats");

    render(<DashboardNavbar />);

    const statsLink = screen.getByRole("link", { name: "Statistiques" });
    expect(statsLink).toHaveAttribute("aria-current", "page");
  });

  it("sets aria-current='page' for active activities link", () => {
    mockUsePathname.mockReturnValue("/dashboard/activities");

    render(<DashboardNavbar />);

    const activitiesLink = screen.getByRole("link", { name: "Activités" });
    expect(activitiesLink).toHaveAttribute("aria-current", "page");
  });

  it("sets aria-current='page' for active catalog link", () => {
    mockUsePathname.mockReturnValue("/dashboard/catalog");

    render(<DashboardNavbar />);

    const catalogLink = screen.getByRole("link", { name: "Catalogue" });
    expect(catalogLink).toHaveAttribute("aria-current", "page");
  });

  it("does not set aria-current for inactive links", () => {
    mockUsePathname.mockReturnValue("/dashboard/stats");

    render(<DashboardNavbar />);

    const dashboardLink = screen.getByRole("link", { name: "Dashboard" });
    const activitiesLink = screen.getByRole("link", { name: "Activités" });
    const catalogLink = screen.getByRole("link", { name: "Catalogue" });

    expect(dashboardLink).not.toHaveAttribute("aria-current");
    expect(activitiesLink).not.toHaveAttribute("aria-current");
    expect(catalogLink).not.toHaveAttribute("aria-current");
  });

  it("correctly identifies dashboard as active only on exact match", () => {
    mockUsePathname.mockReturnValue("/dashboard/stats");

    render(<DashboardNavbar />);

    const dashboardLink = screen.getByRole("link", { name: "Dashboard" });
    expect(dashboardLink).not.toHaveAttribute("aria-current");
  });

  it("correctly identifies child routes as active using startsWith", () => {
    mockUsePathname.mockReturnValue("/dashboard/stats/details");

    render(<DashboardNavbar />);

    const statsLink = screen.getByRole("link", { name: "Statistiques" });
    expect(statsLink).toHaveAttribute("aria-current", "page");
  });

  it("has proper navigation landmark with aria-label", () => {
    mockUsePathname.mockReturnValue("/dashboard");

    render(<DashboardNavbar />);

    const nav = screen.getByRole("navigation", { name: "Main navigation" });
    expect(nav).toBeInTheDocument();
    expect(nav).toHaveAttribute("aria-label", "Main navigation");
  });

  it("has proper list structure with role='list'", () => {
    mockUsePathname.mockReturnValue("/dashboard");

    render(<DashboardNavbar />);

    const list = screen.getByRole("list");
    expect(list).toBeInTheDocument();
  });

  it("renders links with correct hrefs", () => {
    mockUsePathname.mockReturnValue("/dashboard");

    render(<DashboardNavbar />);

    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute("href", "/dashboard");
    expect(screen.getByRole("link", { name: "Statistiques" })).toHaveAttribute("href", "/dashboard/stats");
    expect(screen.getByRole("link", { name: "Activités" })).toHaveAttribute("href", "/dashboard/activities");
    expect(screen.getByRole("link", { name: "Catalogue" })).toHaveAttribute("href", "/dashboard/catalog");
  });

  it("applies active styling to active link (via aria-current)", () => {
    mockUsePathname.mockReturnValue("/dashboard/stats");

    render(<DashboardNavbar />);

    const statsLink = screen.getByRole("link", { name: "Statistiques" });
    // Active link should have aria-current="page" which indicates active state
    expect(statsLink).toHaveAttribute("aria-current", "page");
    // The className will be hashed by CSS modules, so we verify via aria-current instead
  });

  it("does not apply active styling to inactive links", () => {
    mockUsePathname.mockReturnValue("/dashboard/stats");

    render(<DashboardNavbar />);

    const dashboardLink = screen.getByRole("link", { name: "Dashboard" });
    // Inactive link should not have aria-current
    expect(dashboardLink).not.toHaveAttribute("aria-current");
  });
});

