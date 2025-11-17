import NextLink from "next/link";
import React from "react";
import "@/styles/components/_link.scss";

type Props = {
  href: string;
  children: React.ReactNode;
  external?: boolean;
  ariaLabel?: string;
  className?: string;
  prefetch?: boolean;
  "aria-current"?: "page" | "step" | "location" | "date" | "time" | boolean;
};

const computeClassName = (extra?: string): string => {
  const base = ["link"];
  if (extra && extra.trim().length > 0) {
    base.push(extra);
  }
  return base.join(" ");
};

const LinkComponent = ({ href, children, external, ariaLabel, className, prefetch = false, "aria-current": ariaCurrent }: Props) => {
  const classNames = React.useMemo(() => computeClassName(className), [className]);
  const isExternal = external ?? href.startsWith("http");
  if (isExternal) {
    return (
      <a 
        href={href} 
        className={classNames} 
        aria-label={ariaLabel}
        aria-current={ariaCurrent}
        target="_blank" 
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  }
  return (
    <NextLink 
      href={href} 
      prefetch={prefetch} 
      className={classNames} 
      aria-label={ariaLabel}
      aria-current={ariaCurrent}
    >
      {children}
    </NextLink>
  );
};

const Link = React.memo(LinkComponent);
export default Link;


