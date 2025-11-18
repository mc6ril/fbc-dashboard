import React from "react";
import { render, screen } from "@testing-library/react";
import Card from "@/presentation/components/ui/Card";

describe("Card", () => {
  it("should render children", () => {
    render(
      <Card>
        <div>Card content</div>
      </Card>
    );
    expect(screen.getByText("Card content")).toBeInTheDocument();
  });

  it("should render title when provided", () => {
    render(
      <Card title="Card Title">
        <div>Card content</div>
      </Card>
    );
    expect(screen.getByRole("heading", { name: "Card Title", level: 2 })).toBeInTheDocument();
  });

  it("should not render title when not provided", () => {
    render(
      <Card>
        <div>Card content</div>
      </Card>
    );
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  it("should apply custom className", () => {
    render(
      <Card className="custom-class">
        <div>Card content</div>
      </Card>
    );
    const card = screen.getByText("Card content").closest(".card");
    expect(card).toHaveClass("custom-class");
  });

  it("should use semantic HTML structure", () => {
    render(
      <Card title="Test Title">
        <div>Card content</div>
      </Card>
    );
    const article = screen.getByText("Card content").closest("article");
    expect(article).toBeInTheDocument();
    expect(article).toHaveClass("card");
  });

  it("should be accessible with proper heading when title provided", () => {
    render(
      <Card title="Accessible Title">
        <div>Card content</div>
      </Card>
    );
    const heading = screen.getByRole("heading", { name: "Accessible Title", level: 2 });
    expect(heading).toBeInTheDocument();
    const header = heading.closest("header");
    expect(header).toBeInTheDocument();
    expect(header).toHaveClass("card__header");
  });

  it("should render content in card__content div", () => {
    render(
      <Card>
        <div>Card content</div>
      </Card>
    );
    const content = screen.getByText("Card content");
    expect(content.closest(".card__content")).toBeInTheDocument();
  });
});

