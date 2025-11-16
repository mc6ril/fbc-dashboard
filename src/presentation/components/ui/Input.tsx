import React from "react";
import { getFormFieldIds } from "@/shared/a11y/utils";
import "@/styles/components/_input.scss";

type Props = {
  id: string;
  label?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  type?: React.HTMLInputTypeAttribute;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  name?: string;
  autoComplete?: string;
  className?: string;
};

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

const InputComponent = ({
  id,
  label,
  helperText,
  error,
  required = false,
  disabled = false,
  type = "text",
  placeholder,
  value,
  defaultValue,
  onChange,
  onBlur,
  onFocus,
  name,
  autoComplete,
  className,
}: Props) => {
  const base = "input-field";
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
      <input
        id={id}
        name={name}
        className={controlClass}
        type={type}
        placeholder={placeholder}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        aria-required={required || undefined}
        autoComplete={autoComplete}
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

const Input = React.memo(InputComponent);
export default Input;


