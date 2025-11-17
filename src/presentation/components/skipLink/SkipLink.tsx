import React from "react";
import { getAccessibilityId } from "@/shared/a11y/utils";
import styles from "./SkipLink.module.scss";

type Props = {
  targetId: string;
  children: React.ReactNode;
};

const SkipLink = ({ targetId, children }: Props) => {
  const skipLinkId = getAccessibilityId("skip-link");
  const ariaLabel = typeof children === "string" ? children : "Skip to main content";
  
  return (
    <a
      href={`#${targetId}`}
      id={skipLinkId}
      className={styles.skipLink}
      aria-label={ariaLabel}
    >
      {children}
    </a>
  );
};

export default React.memo(SkipLink);

