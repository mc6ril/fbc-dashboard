"use client";

import React, { useEffect } from "react";
import DashboardNavbar from "@/presentation/components/dashboardNavbar/DashboardNavbar";
import DashboardHeader from "@/presentation/components/dashboardHeader/DashboardHeader";
import SkipLink from "@/presentation/components/skipLink/SkipLink";
import RestrictedPage from "@/presentation/components/restrictedPage/RestrictedPage";
import { useGlobalLoadingStore } from "@/presentation/stores/useGlobalLoadingStore";
import { getAccessibilityId } from "@/shared/a11y/utils";
import styles from "./layout.module.scss";

type Props = {
  children: React.ReactNode;
};

const DashboardLayout = ({ children }: Props) => {
  const mainId = getAccessibilityId("main", "dashboard");
  const stopGlobalLoading = useGlobalLoadingStore((state) => state.stopLoading);
  
  // Stop global loader when dashboard layout mounts (after navigation from signin/signup)
  useEffect(() => {
    stopGlobalLoading();
  }, [stopGlobalLoading]);
  
  return (
    <RestrictedPage>
      <div className={styles.container}>
        <SkipLink targetId={mainId}>Skip to main content</SkipLink>
        <DashboardNavbar />
        <div className={styles.content}>
          <DashboardHeader />
          <main id={mainId} className={styles.main} role="main">
            {children}
          </main>
        </div>
      </div>
    </RestrictedPage>
  );
};

export default DashboardLayout;

