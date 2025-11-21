"use client";

import { useTranslation } from "@/presentation/hooks/useTranslation";
import Heading from "@/presentation/components/ui/Heading";
import SalesWidget from "@/presentation/components/dashboardOverview/SalesWidget/SalesWidget";
import ProfitWidget from "@/presentation/components/dashboardOverview/ProfitWidget/ProfitWidget";
import LowStockWidget from "@/presentation/components/dashboardOverview/LowStockWidget/LowStockWidget";
import RecentActivitiesWidget from "@/presentation/components/dashboardOverview/RecentActivitiesWidget/RecentActivitiesWidget";
import styles from "./page.module.scss";

const DashboardPage = () => {
  const tDashboard = useTranslation("pages.dashboard");

  return (
    <main className={styles.dashboard}>
      <Heading level={1} className={styles.dashboard__title}>
        {tDashboard("title")}
      </Heading>
      <div className={styles.dashboard__grid}>
        <SalesWidget />
        <ProfitWidget />
        <LowStockWidget />
        <RecentActivitiesWidget />
      </div>
    </main>
  );
};

export default DashboardPage;

