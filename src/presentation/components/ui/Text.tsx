import React from "react";
import "@/styles/components/_text.scss";

type TextSize = "sm" | "md" | "lg";
type TextWeight = "regular" | "medium" | "semibold" | "bold";

type Props = {
  children: React.ReactNode;
  size?: TextSize;
  weight?: TextWeight;
  muted?: boolean;
  className?: string;
  as?: "p" | "span" | "div";
  role?: string;
};

const computeClassName = (size: TextSize, weight: TextWeight, muted: boolean, extra?: string): string => {
  const base = ["text"];
  base.push(`text--${size}`);
  if (muted) {
    base.push("text--muted");
  }
  if (weight === "medium") {
    base.push("text--medium");
  }
  if (weight === "semibold") {
    base.push("text--semibold");
  }
  if (weight === "bold") {
    base.push("text--bold");
  }
  if (extra && extra.trim().length > 0) {
    base.push(extra);
  }
  return base.join(" ");
};

const TextComponent = ({ children, size = "md", weight = "regular", muted = false, className, as = "p", role }: Props) => {
  const classNames = React.useMemo(() => computeClassName(size, weight, muted, className), [size, weight, muted, className]);
  const Element = as;
  return <Element className={classNames} role={role}>{children}</Element>;
};

const Text = React.memo(TextComponent);
export default Text;


