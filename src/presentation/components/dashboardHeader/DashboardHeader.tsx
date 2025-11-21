import React from "react";
import { useTranslation } from "@/presentation/hooks/useTranslation";
import Heading from "@/presentation/components/ui/Heading";
import { getAccessibilityId } from "@/shared/a11y/utils";
import styles from "./DashboardHeader.module.scss";

const DashboardHeader = () => {
  const tDashboard = useTranslation("dashboard.header");
  const headerId = getAccessibilityId("header", "dashboard");
  
  return (
    <header id={headerId} className={styles.header} role="banner">
      <Heading level={2} className={styles.title}>
        {tDashboard("title")}
      </Heading>
    </header>
  );
};

export default React.memo(DashboardHeader);

