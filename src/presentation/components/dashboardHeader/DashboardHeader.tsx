import React from "react";
import Heading from "@/presentation/components/ui/Heading";
import { getAccessibilityId } from "@/shared/a11y/utils";
import styles from "./DashboardHeader.module.scss";

type Props = {
  className?: string;
};

const DashboardHeader = ({ className }: Props) => {
  const headerId = getAccessibilityId("header", "dashboard");
  
  return (
    <header id={headerId} className={styles.header} role="banner">
      <Heading level={2} className={styles.title}>
        Dashboard
      </Heading>
    </header>
  );
};

export default React.memo(DashboardHeader);

