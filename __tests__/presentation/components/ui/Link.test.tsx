import React from "react";
import { render, screen } from "@testing-library/react";
import Link from "@/presentation/components/ui/Link";

describe("Link", () => {
  it("renders Next.js Link for internal links", () => {
    render(<Link href="/home">Home</Link>);
    const el = screen.getByRole("link", { name: /home/i });
    expect(el).toHaveClass("link");
  });

  it("renders anchor with target and rel for external links", () => {
    render(<Link href="https://example.com" external>Site</Link>);
    const el = screen.getByRole("link", { name: /site/i });
    expect(el).toHaveAttribute("target", "_blank");
    expect(el).toHaveAttribute("rel", expect.stringContaining("noopener"));
  });

  it("applies only custom className when provided (no default 'link' class)", () => {
    render(<Link href="/home" className="custom-nav-link">Home</Link>);
    const el = screen.getByRole("link", { name: /home/i });
    expect(el).toHaveClass("custom-nav-link");
    expect(el).not.toHaveClass("link");
  });

  it("applies default 'link' class when no className is provided", () => {
    render(<Link href="/home">Home</Link>);
    const el = screen.getByRole("link", { name: /home/i });
    expect(el).toHaveClass("link");
  });
});


