/**
 * Select Component
 *
 * A reusable select dropdown component for form inputs.
 * Provides proper accessibility (WCAG 2.1 AA) with semantic HTML and ARIA attributes.
 *
 * The component provides:
 * - Semantic HTML structure using `<label>` and `<select>`
 * - Accessible form field with proper labeling
 * - Error state handling with ARIA attributes
 * - Consistent styling using design system tokens
 *
 * @component
 */

import React from "react";
import { getFormFieldIds } from "@/shared/a11y/utils";
import "@/styles/components/_select.scss";

/**
 * Option definition for select dropdown.
 */
export type SelectOption = {
    /** Value of the option (what gets submitted) */
    value: string;
    /** Label text to display in the dropdown */
    label: string;
};

type Props = {
    /** Unique identifier for the select element */
    id: string;
    /** Label text for the select field */
    label?: string;
    /** Array of options to display in the dropdown */
    options: SelectOption[];
    /** Current selected value */
    value?: string;
    /** Change event handler */
    onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    /** Optional placeholder text (displayed when no value is selected) */
    placeholder?: string;
    /** Optional error message to display */
    error?: string;
    /** Whether the field is required */
    required?: boolean;
    /** Whether the field is disabled */
    disabled?: boolean;
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

const SelectComponent = ({
    id,
    label,
    options,
    value,
    onChange,
    placeholder,
    error,
    required = false,
    disabled = false,
    name,
    className,
}: Props) => {
    const base = "select-field";
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
            <select
                id={id}
                name={name}
                className={controlClass}
                value={value ?? ""}
                onChange={onChange}
                disabled={disabled}
                aria-invalid={error ? true : undefined}
                aria-describedby={describedBy}
                aria-required={required || undefined}
                aria-label={!label ? placeholder : undefined}
            >
                {placeholder && (
                    <option value="" disabled>
                        {placeholder}
                    </option>
                )}
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {error && (
                <div id={errorId} className={`${base}__error`} role="alert">
                    {error}
                </div>
            )}
        </div>
    );
};

const Select = React.memo(SelectComponent);
export default Select;

