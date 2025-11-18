import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Textarea from "@/presentation/components/ui/Textarea";

describe("Textarea Component", () => {
  describe("Rendering", () => {
    it("should render with label", () => {
      render(<Textarea id="note" label="Note" />);
      const textarea = screen.getByLabelText(/note/i);
      expect(textarea).toBeInTheDocument();
      expect(textarea).toHaveAttribute("id", "note");
    });

    it("should render without label", () => {
      render(<Textarea id="note" />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toBeInTheDocument();
      expect(textarea).toHaveAttribute("id", "note");
    });

    it("should render with helper text", () => {
      render(<Textarea id="note" label="Note" helperText="Enter additional information" />);
      const textarea = screen.getByLabelText(/note/i);
      const helper = screen.getByText(/enter additional information/i);
      expect(helper.id).toMatch(/a11y-form-field-helper-note/);
      expect(textarea).toHaveAttribute("aria-describedby", helper.id);
    });

    it("should render with error message", () => {
      render(<Textarea id="note" label="Note" error="This field is required" />);
      const textarea = screen.getByLabelText(/note/i);
      const error = screen.getByRole("alert");
      expect(error).toHaveTextContent(/this field is required/i);
      expect(error.id).toMatch(/a11y-form-field-error-note/);
      expect(textarea).toHaveAttribute("aria-invalid", "true");
      expect(textarea).toHaveAttribute("aria-describedby", error.id);
    });

    it("should render required indicator", () => {
      render(<Textarea id="note" label="Note" required />);
      const label = screen.getByText(/note \*/i);
      expect(label).toBeInTheDocument();
      const textarea = screen.getByLabelText(/note/i);
      expect(textarea).toHaveAttribute("aria-required", "true");
    });

    it("should render disabled state", () => {
      render(<Textarea id="note" label="Note" disabled />);
      const textarea = screen.getByLabelText(/note/i);
      expect(textarea).toBeDisabled();
    });
  });

  describe("Interactions", () => {
    it("should call onChange when value changes", () => {
      const handleChange = jest.fn();
      render(<Textarea id="note" label="Note" onChange={handleChange} />);
      const textarea = screen.getByLabelText(/note/i);
      fireEvent.change(textarea, { target: { value: "New value" } });
      expect(handleChange).toHaveBeenCalled();
    });

    it("should call onBlur when field loses focus", () => {
      const handleBlur = jest.fn();
      render(<Textarea id="note" label="Note" onBlur={handleBlur} />);
      const textarea = screen.getByLabelText(/note/i);
      textarea.focus();
      textarea.blur();
      expect(handleBlur).toHaveBeenCalled();
    });
  });

  describe("Accessibility", () => {
    it("should have proper aria-invalid when error exists", () => {
      render(<Textarea id="note" label="Note" error="Error message" />);
      const textarea = screen.getByLabelText(/note/i);
      expect(textarea).toHaveAttribute("aria-invalid", "true");
    });

    it("should have proper aria-describedby for errors", () => {
      render(<Textarea id="note" label="Note" error="Error message" />);
      const textarea = screen.getByLabelText(/note/i);
      const error = screen.getByRole("alert");
      expect(textarea).toHaveAttribute("aria-describedby", error.id);
    });

    it("should have proper aria-describedby for helper text when no error", () => {
      render(<Textarea id="note" label="Note" helperText="Helper text" />);
      const textarea = screen.getByLabelText(/note/i);
      const helper = screen.getByText(/helper text/i);
      expect(textarea).toHaveAttribute("aria-describedby", helper.id);
    });

    it("should have proper aria-required for required fields", () => {
      render(<Textarea id="note" label="Note" required />);
      const textarea = screen.getByLabelText(/note/i);
      expect(textarea).toHaveAttribute("aria-required", "true");
    });

    it("should have error message with role='alert'", () => {
      render(<Textarea id="note" label="Note" error="Error message" />);
      const error = screen.getByRole("alert");
      expect(error).toBeInTheDocument();
      expect(error).toHaveTextContent(/error message/i);
    });

    it("should link label with textarea via htmlFor/id", () => {
      render(<Textarea id="note" label="Note" />);
      const textarea = screen.getByLabelText(/note/i);
      expect(textarea).toBeInTheDocument();
      expect(textarea).toHaveAttribute("id", "note");
    });
  });
});

