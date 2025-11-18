/**
 * DateInput Component
 *
 * A reusable date input component for form inputs.
 * Provides proper accessibility (WCAG 2.1 AA) with semantic HTML and ARIA attributes.
 *
 * The component provides:
 * - Semantic HTML structure using `<label>` and `<input type="date">`
 * - Accessible form field with proper labeling
 * - Error state handling with ARIA attributes
 * - Date range constraints (min/max)
 * - Consistent styling using design system tokens
 *
 * @component
 */

import React from "react";
import { getFormFieldIds } from "@/shared/a11y/utils";
import "@/styles/components/_input.scss";

type Props = {
    /** Unique identifier for the date input element */
    id: string;
    /** Label text for the date input field */
    label?: string;
    /** Current date value (ISO 8601 date string format: YYYY-MM-DD) */
    value?: string;
    /** Change event handler */
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    /** Optional blur event handler */
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
    /** Optional focus event handler */
    onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
    /** Optional error message to display */
    error?: string;
    /** Whether the field is required */
    required?: boolean;
    /** Whether the field is disabled */
    disabled?: boolean;
    /** Optional minimum date (ISO 8601 date string format: YYYY-MM-DD) */
    min?: string;
    /** Optional maximum date (ISO 8601 date string format: YYYY-MM-DD) */
    max?: string;
    /** Optional name attribute for form submission */
    name?: string;
    /** Optional additional CSS class names */
    className?: string;
};

const computeControlClassName = (
    base: string,
    hasError: boolean,
    isDisabled: boolean,
    extra?: string
): string => {
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

const DateInputComponent = ({
    id,
    label,
    value,
    onChange,
    onBlur,
    onFocus,
    error,
    required = false,
    disabled = false,
    min,
    max,
    name,
    className,
}: Props) => {
    const base = "input-field";
    const { labelId, errorId } = React.useMemo(() => getFormFieldIds(id), [id]);
    const controlClass = React.useMemo(
        () => computeControlClassName(base, !!error, disabled, className),
        [base, error, disabled, className]
    );
    const describedBy = React.useMemo(
        () => (error ? errorId : undefined),
        [error, errorId]
    );

    return (
        <div className={base}>
            {label && (
                <label id={labelId} className={`${base}__label`} htmlFor={id}>
                    {label}
                    {required ? " *" : ""}
                </label>
            )}
            <input
                id={id}
                name={name}
                type="date"
                className={controlClass}
                value={value ?? ""}
                onChange={onChange}
                onBlur={onBlur}
                onFocus={onFocus}
                disabled={disabled}
                min={min}
                max={max}
                aria-invalid={error ? true : undefined}
                aria-describedby={describedBy}
                aria-required={required || undefined}
            />
            {error && (
                <div id={errorId} className={`${base}__error`} role="alert">
                    {error}
                </div>
            )}
        </div>
    );
};

const DateInput = React.memo(DateInputComponent);
export default DateInput;

