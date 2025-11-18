import { A11yIds } from "@/shared/a11y/ids";
import { getAccessibilityId, getFormFieldIds } from "@/shared/a11y/utils";

describe("shared/a11y/utils", () => {
  describe("getAccessibilityId", () => {
    it("builds id with prefix and key", () => {
      expect(getAccessibilityId(A11yIds.input)).toBe("a11y-input");
    });

    it("supports custom string keys", () => {
      expect(getAccessibilityId("custom")).toBe("a11y-custom");
    });

    it("appends suffix when provided", () => {
      expect(getAccessibilityId(A11yIds.input, "email")).toBe("a11y-input-email");
    });

    it("falls back to 'unknown' when key is blank", () => {
      expect(getAccessibilityId("")).toBe("a11y-unknown");
    });
  });

  describe("getFormFieldIds", () => {
    it("returns well-formed ids for a given field name", () => {
      const ids = getFormFieldIds("email");
      expect(ids.labelId).toBe("a11y-input-label-email");
      expect(ids.helperId).toBe("a11y-form-field-helper-email");
      expect(ids.errorId).toBe("a11y-form-field-error-email");
    });

    it("falls back to a safe default when field name blank", () => {
      const ids = getFormFieldIds("  ");
      expect(ids.labelId).toBe("a11y-input-label-field");
      expect(ids.helperId).toBe("a11y-form-field-helper-field");
      expect(ids.errorId).toBe("a11y-form-field-error-field");
    });
  });
});


