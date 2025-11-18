/**
 * Layer: Shared (Accessibility)
 *
 * Centralized A11y ID base keys to ensure consistent, descriptive, and reusable IDs.
 * These keys are combined with a standard prefix by `getAccessibilityId` in utils.ts.
 */
export const A11Y_ID_PREFIX = "a11y";

export const A11yIds = {
  input: "input",
  inputLabel: "input-label",
  formFieldHelper: "form-field-helper",
  formFieldError: "form-field-error",
  formSuccess: "form-success",
  formError: "form-error",
  button: "button",
  link: "link",
  image: "image",
  spinner: "spinner",
  status: "status",
  main: "main",
  nav: "nav",
  header: "header",
  skipLink: "skip-link",
} as const;

export type A11yIdKey = keyof typeof A11yIds;


