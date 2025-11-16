/**
 * Layer: Shared (Accessibility)
 *
 * Pure utilities for generating and composing accessibility-related attributes.
 * Keep these helpers framework-agnostic and side-effect free.
 */
import { A11Y_ID_PREFIX, A11yIds, A11yIdKey } from "./ids";

/**
 * Build a stable accessibility id using the global prefix, a base key, and an optional suffix.
 * The suffix is useful to maintain uniqueness per element (e.g., input id).
 *
 * Example: getAccessibilityId("input") => "a11y-input"
 * Example: getAccessibilityId("input", "email") => "a11y-input-email"
 */
export function getAccessibilityId(key: A11yIdKey | string, suffix?: string): string {
  const normalizedKey = typeof key === "string" ? key.trim() : (key as string);
  const safeKey = normalizedKey.length > 0 ? normalizedKey : "unknown";
  if (suffix && suffix.trim().length > 0) {
    return `${A11Y_ID_PREFIX}-${safeKey}-${suffix.trim()}`;
  }
  return `${A11Y_ID_PREFIX}-${safeKey}`;
}

/**
 * Compose a space-separated `aria-describedby` value from a list of optional ids.
 * Returns undefined if no valid ids are provided to avoid rendering empty attributes.
 */
export function ariaDescribedByIds(...ids: Array<string | null | undefined>): string | undefined {
  const parts = ids.filter((v): v is string => typeof v === "string" && v.trim().length > 0);
  return parts.length > 0 ? parts.join(" ") : undefined;
}

/**
 * Helper to get common, well-named ids for form fields:
 * - label id
 * - helper text id
 * - error text id
 */
export function getFormFieldIds(fieldName: string): {
  labelId: string;
  helperId: string;
  errorId: string;
} {
  const safe = fieldName.trim().length > 0 ? fieldName.trim() : "field";
  return {
    labelId: getAccessibilityId(A11yIds.inputLabel, safe),
    helperId: getAccessibilityId(A11yIds.formFieldHelper, safe),
    errorId: getAccessibilityId(A11yIds.formFieldError, safe),
  };
}


