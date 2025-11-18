import React from "react";
import { getFormFieldIds } from "@/shared/a11y/utils";
import "@/styles/components/_textarea.scss";

/**
 * Props for the Textarea component.
 *
 * @property {string} id - Unique identifier for the textarea (required for accessibility)
 * @property {string} [label] - Label text displayed above the textarea
 * @property {string} [helperText] - Helper text displayed below the textarea (hidden when error is present)
 * @property {string} [error] - Error message displayed below the textarea with role="alert"
 * @property {boolean} [required] - Whether the textarea is required (adds * to label and aria-required)
 * @property {boolean} [disabled] - Whether the textarea is disabled
 * @property {string} [placeholder] - Placeholder text displayed when textarea is empty
 * @property {string} [value] - Controlled value of the textarea
 * @property {string} [defaultValue] - Uncontrolled default value of the textarea
 * @property {(e: React.ChangeEvent<HTMLTextAreaElement>) => void} [onChange] - Callback fired when value changes
 * @property {(e: React.FocusEvent<HTMLTextAreaElement>) => void} [onBlur] - Callback fired when textarea loses focus
 * @property {(e: React.FocusEvent<HTMLTextAreaElement>) => void} [onFocus] - Callback fired when textarea gains focus
 * @property {string} [name] - Name attribute for form submission
 * @property {number} [rows] - Number of visible text lines (default: 4)
 * @property {string} [className] - Additional CSS class names for the control element
 */
type Props = {
  id: string;
  label?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  name?: string;
  rows?: number;
  className?: string;
};

/**
 * Computes the CSS class name for the textarea control element.
 *
 * @param {string} base - Base class name (BEM block)
 * @param {boolean} hasError - Whether the textarea has an error
 * @param {boolean} isDisabled - Whether the textarea is disabled
 * @param {string} [extra] - Additional CSS class names
 * @returns {string} Combined CSS class names
 */
const computeControlClassName = (base: string, hasError: boolean, isDisabled: boolean, extra?: string): string => {
  const classes = [`${base}__control`];
  if (hasError) {
    classes.push(`${base}__control--error`);
  }
  if (isDisabled) {
    classes.push(`${base}__control--disabled`);
  }
  if (extra && extra.trim().length > 0) {
    classes.push(extra);
  }
  return classes.join(" ");
};

/**
 * Textarea component for multi-line text input.
 *
 * This component follows the same pattern as the Input component, providing:
 * - Accessible form field with proper ARIA attributes
 * - Label, helper text, and error message support
 * - Consistent styling using SCSS variables
 * - Memoized for performance optimization
 *
 * The component uses `getFormFieldIds` from `shared/a11y/utils` to generate
 * consistent accessibility IDs for label, helper text, and error message.
 *
 * @example
 * ```tsx
 * <Textarea
 *   id="note"
 *   label="Note"
 *   helperText="Enter additional information"
 *   required
 *   onChange={(e) => setNote(e.target.value)}
 * />
 * ```
 *
 * @example
 * ```tsx
 * <Textarea
 *   id="description"
 *   label="Description"
 *   error="This field is required"
 *   value={description}
 *   onChange={(e) => setDescription(e.target.value)}
 * />
 * ```
 */
const TextareaComponent = ({
  id,
  label,
  helperText,
  error,
  required = false,
  disabled = false,
  placeholder,
  value,
  defaultValue,
  onChange,
  onBlur,
  onFocus,
  name,
  rows = 4,
  className,
}: Props) => {
  const base = "textarea-field";
  const { labelId, helperId, errorId } = React.useMemo(() => getFormFieldIds(id), [id]);
  const controlClass = React.useMemo(() => computeControlClassName(base, !!error, disabled, className), [base, error, disabled, className]);
  const describedBy = React.useMemo(
    () => (error ? errorId : helperText ? helperId : undefined),
    [error, errorId, helperText, helperId]
  );

  return (
    <div className={base}>
      {label && (
        <label id={labelId} className={`${base}__label`} htmlFor={id}>
          {label}
          {required ? " *" : ""}
        </label>
      )}
      <textarea
        id={id}
        name={name}
        className={controlClass}
        placeholder={placeholder}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        disabled={disabled}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        aria-required={required || undefined}
      />
      {helperText && !error && (
        <div id={helperId} className={`${base}__helper`}>
          {helperText}
        </div>
      )}
      {error && (
        <div id={errorId} className={`${base}__error`} role="alert">
          {error}
        </div>
      )}
    </div>
  );
};

const Textarea = React.memo(TextareaComponent);
export default Textarea;

