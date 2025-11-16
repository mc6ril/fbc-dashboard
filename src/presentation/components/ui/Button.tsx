import React from "react";
import { getAccessibilityId } from "@/shared/a11y/utils";
import "@styles/components/_button.scss";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

type Props = {
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit" | "reset";
  className?: string;
  ariaLabel?: string;
};

const computeClassName = (variant: ButtonVariant, size: ButtonSize, fullWidth: boolean, disabled: boolean, extra?: string): string => {
  const base = ["button", `button--${variant}`, `button--${size}`];
  if (fullWidth) base.push("button--full");
  if (disabled) base.push("button--disabled");
  if (extra && extra.trim().length > 0) base.push(extra);
  return base.join(" ");
};

const ButtonComponent = ({
  children,
  onClick,
  variant = "primary",
  size = "md",
  fullWidth = false,
  disabled = false,
  loading = false,
  type = "button",
  className,
  ariaLabel,
}: Props) => {
  const isDisabled = disabled || loading;
  const classNames = React.useMemo(
    () => computeClassName(variant, size, fullWidth, isDisabled, className),
    [variant, size, fullWidth, isDisabled, className]
  );

  const handleClick = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (isDisabled) {
        e.preventDefault();
        return;
      }
      onClick?.(e);
    },
    [isDisabled, onClick]
  );

  const spinnerId = React.useMemo(() => getAccessibilityId("spinner"), []);

  return (
    <button
      type={type}
      className={classNames}
      onClick={handleClick}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      aria-label={ariaLabel}
    >
      {loading && <span id={spinnerId} className="button__spinner" aria-hidden="true" />}
      {children}
    </button>
  );
};

const Button = React.memo(ButtonComponent);
export default Button;


