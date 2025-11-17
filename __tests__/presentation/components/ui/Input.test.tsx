import React from "react";
import { render, screen } from "@testing-library/react";
import Input from "@/presentation/components/ui/Input";

describe("Input", () => {
  it("links label with input via htmlFor/id", () => {
    render(<Input id="email" label="Email" />);
    const input = screen.getByLabelText(/email/i);
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("id", "email");
  });

  it("renders helper text and wires aria-describedby", () => {
    render(<Input id="name" label="Name" helperText="This is your full name" />);
    const input = screen.getByLabelText(/name/i);
    const helper = screen.getByText(/this is your full name/i);
    expect(helper.id).toMatch(/a11y-form-field-helper-name/);
    expect(input).toHaveAttribute("aria-describedby", helper.id);
  });

  it("renders error as alert and sets aria-invalid; takes precedence over helper", () => {
    render(<Input id="pwd" label="Password" helperText="min 8 chars" error="Too short" />);
    const input = screen.getByLabelText(/password/i);
    const error = screen.getByRole("alert");
    expect(error).toHaveTextContent(/too short/i);
    expect(error.id).toMatch(/a11y-form-field-error-pwd/);
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby", error.id);
  });

  it("supports required and disabled props", () => {
    render(<Input id="id1" label="Field" required disabled />);
    const input = screen.getByLabelText(/field/i);
    expect(input).toBeDisabled();
    expect(input).toHaveAttribute("aria-required", "true");
  });
});


