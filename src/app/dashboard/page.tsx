"use client";

import Heading from "@/presentation/components/ui/Heading";
import SalesWidget from "@/presentation/components/dashboardOverview/SalesWidget/SalesWidget";
import ProfitWidget from "@/presentation/components/dashboardOverview/ProfitWidget/ProfitWidget";
import LowStockWidget from "@/presentation/components/dashboardOverview/LowStockWidget/LowStockWidget";
import RecentActivitiesWidget from "@/presentation/components/dashboardOverview/RecentActivitiesWidget/RecentActivitiesWidget";
import styles from "./page.module.scss";

const DashboardPage = () => {
  return (
    <main className={styles.dashboard}>
      <Heading level={1} className={styles.dashboard__title}>
        Dashboard
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

