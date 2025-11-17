import React from "react";
import { render, screen } from "@testing-library/react";
import Heading from "@/presentation/components/ui/Heading";

describe("Heading", () => {
  it("renders semantic heading tags according to level", () => {
    const { rerender } = render(<Heading level={1}>H</Heading>);
    expect(screen.getByText("H").tagName.toLowerCase()).toBe("h1");
    rerender(<Heading level={3}>H3</Heading>);
    expect(screen.getByText("H3").tagName.toLowerCase()).toBe("h3");
  });

  it("applies level-based class for styling", () => {
    const { rerender } = render(<Heading level={2}>T</Heading>);
    expect(screen.getByText("T")).toHaveClass("heading--h2");
    rerender(<Heading level={5}>T</Heading>);
    expect(screen.getByText("T")).toHaveClass("heading--h5");
  });
});


