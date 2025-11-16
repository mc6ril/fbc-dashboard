import React from "react";
import "@styles/components/_heading.scss";

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

type Props = {
  children: React.ReactNode;
  level?: HeadingLevel;
  className?: string;
  role?: "heading";
};

const computeClassName = (level: HeadingLevel, extra?: string): string => {
  const base = ["heading", `heading--h${level}`];
  if (extra && extra.trim().length > 0) base.push(extra);
  return base.join(" ");
};

const HeadingComponent = ({ children, level = 1, className, role }: Props) => {
  const classNames = React.useMemo(() => computeClassName(level, className), [level, className]);

  const Tag = (`h${level}` as HeadingTag);

  return (
    <Tag className={classNames} role={role}>
      {children}
    </Tag>
  );
};

const Heading = React.memo(HeadingComponent);
export default Heading;
