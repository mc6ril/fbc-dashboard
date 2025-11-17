import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Button from "@/presentation/components/ui/Button";

describe("Button", () => {
  it("renders children", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: /click me/i })).toBeInTheDocument();
  });

  it("applies variant and size classes", () => {
    const { rerender } = render(<Button variant="secondary" size="sm">A</Button>);
    let btn = screen.getByRole("button", { name: "A" });
    expect(btn).toHaveClass("button--secondary");
    expect(btn).toHaveClass("button--sm");
    rerender(<Button variant="ghost" size="lg">A</Button>);
    btn = screen.getByRole("button", { name: "A" });
    expect(btn).toHaveClass("button--ghost");
    expect(btn).toHaveClass("button--lg");
  });

  it("disables when loading and sets aria-busy", () => {
    render(<Button loading>Load</Button>);
    const btn = screen.getByRole("button", { name: /load/i });
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute("aria-busy", "true");
    // spinner exists and is aria-hidden
    const spinner = btn.querySelector(".button__spinner");
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute("aria-hidden", "true");
  });

  it("prevents click when disabled or loading", () => {
    const onClick = jest.fn();
    const { rerender } = render(<Button disabled onClick={onClick}>X</Button>);
    const btn = screen.getByRole("button", { name: "X" });
    fireEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
    rerender(<Button loading onClick={onClick}>X</Button>);
    fireEvent.click(screen.getByRole("button", { name: "X" }));
    expect(onClick).not.toHaveBeenCalled();
  });
});


