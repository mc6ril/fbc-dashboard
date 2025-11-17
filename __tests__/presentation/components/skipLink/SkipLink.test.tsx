/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import SkipLink from "@/presentation/components/skipLink/SkipLink";

describe("SkipLink", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders skip link with correct href", () => {
    render(<SkipLink targetId="main-content">Skip to main content</SkipLink>);

    const link = screen.getByRole("link", { name: "Skip to main content" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "#main-content");
  });

  it("uses children as link text", () => {
    render(<SkipLink targetId="main-content">Skip to main</SkipLink>);

    const link = screen.getByRole("link", { name: "Skip to main" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveTextContent("Skip to main");
  });

  it("has proper aria-label when children is string", () => {
    render(<SkipLink targetId="main-content">Skip to main content</SkipLink>);

    const link = screen.getByRole("link", { name: "Skip to main content" });
    expect(link).toHaveAttribute("aria-label", "Skip to main content");
  });

  it("has default aria-label when children is not string", () => {
    render(
      <SkipLink targetId="main-content">
        <span>Skip</span>
      </SkipLink>
    );

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("aria-label", "Skip to main content");
  });

  it("has correct id attribute", () => {
    render(<SkipLink targetId="main-content">Skip to main content</SkipLink>);

    const link = screen.getByRole("link", { name: "Skip to main content" });
    expect(link).toHaveAttribute("id", "a11y-skip-link");
  });

  it("constructs href correctly with hash prefix", () => {
    render(<SkipLink targetId="test-target">Skip</SkipLink>);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "#test-target");
  });

  it("handles different target IDs", () => {
    const { rerender } = render(<SkipLink targetId="main-content">Skip</SkipLink>);

    let link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "#main-content");

    rerender(<SkipLink targetId="footer-content">Skip</SkipLink>);

    link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "#footer-content");
  });

  it("is keyboard accessible", () => {
    render(<SkipLink targetId="main-content">Skip to main content</SkipLink>);

    const link = screen.getByRole("link", { name: "Skip to main content" });
    expect(link.tagName).toBe("A");
    // Anchor tags are keyboard accessible by default
    expect(link).not.toHaveAttribute("tabindex", "-1");
  });
});

