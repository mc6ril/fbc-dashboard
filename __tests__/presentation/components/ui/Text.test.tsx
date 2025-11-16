import React from "react";
import { render, screen } from "@testing-library/react";
import Text from "../../../../src/presentation/components/ui/Text";

describe("Text", () => {
  it("renders children", () => {
    render(<Text>hello</Text>);
    expect(screen.getByText("hello")).toBeInTheDocument();
  });

  it("applies size classes", () => {
    const { rerender } = render(<Text size="sm">s</Text>);
    expect(screen.getByText("s")).toHaveClass("text--sm");
    rerender(<Text size="lg">s</Text>);
    expect(screen.getByText("s")).toHaveClass("text--lg");
  });

  it("applies weight and muted modifiers", () => {
    render(<Text weight="semibold" muted>m</Text>);
    const el = screen.getByText("m");
    expect(el).toHaveClass("text--semibold");
    expect(el).toHaveClass("text--muted");
  });

  it("respects semantic element via 'as' prop", () => {
    render(<Text as="span">inline</Text>);
    const el = screen.getByText("inline");
    expect(el.tagName.toLowerCase()).toBe("span");
  });
});


