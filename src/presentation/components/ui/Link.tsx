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
  // If a custom className is provided, use only that (parent component controls styling)
  // Otherwise, apply the default "link" class for global styles
  if (extra && extra.trim().length > 0) {
    return extra.trim();
  }
  return "link";
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


