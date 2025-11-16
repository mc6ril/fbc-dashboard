import React from "react";
import { render } from "@testing-library/react";
import Image from "../../../../src/presentation/components/ui/Image";

// Note: Next/Image renders to an img in tests or needs mock; here we assert it mounts without crashing with required props.

describe("Image", () => {
  it("requires alt, width, and height", () => {
    const { container } = render(<Image alt="logo" src="/logo.png" width={100} height={40} />);
    expect(container.querySelector(".image")).toBeTruthy();
  });

  it("supports priority prop", () => {
    const { container } = render(<Image alt="hero" src="/hero.jpg" width={800} height={400} priority />);
    expect(container.querySelector(".image")).toBeTruthy();
  });
});


