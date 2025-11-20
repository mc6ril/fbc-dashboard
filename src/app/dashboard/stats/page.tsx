"use client";

import React from "react";
import dynamic from "next/dynamic";
import Heading from "@/presentation/components/ui/Heading";
import Text from "@/presentation/components/ui/Text";
import styles from "./page.module.scss";

// Loading component for dynamic imports
const ChartLoadingPlaceholder = () => (
  <div className={styles.stats__chartLoading} role="status" aria-live="polite" aria-busy="true">
    <Text size="sm" muted>
      Loading chart...
    </Text>
  </div>
);

// Lazy-load chart components with dynamic imports
const SalesPerMonthChart = dynamic(
  () => import("@/presentation/components/statsCharts/SalesPerMonthChart/SalesPerMonthChart"),
  {
    ssr: false,
    loading: () => <ChartLoadingPlaceholder />,
  }
);

const ActivitiesOverTimeChart = dynamic(
  () => import("@/presentation/components/statsCharts/ActivitiesOverTimeChart/ActivitiesOverTimeChart"),
  {
    ssr: false,
    loading: () => <ChartLoadingPlaceholder />,
  }
);

const MarginPerMonthChart = dynamic(
  () => import("@/presentation/components/statsCharts/MarginPerMonthChart/MarginPerMonthChart"),
  {
    ssr: false,
    loading: () => <ChartLoadingPlaceholder />,
  }
);

const TopProfitableProductsChart = dynamic(
  () => import("@/presentation/components/statsCharts/TopProfitableProductsChart/TopProfitableProductsChart"),
  {
    ssr: false,
    loading: () => <ChartLoadingPlaceholder />,
  }
);

const StatsPage = () => {
  return (
    <main className={styles.stats} role="main">
      <div className={styles.stats__header}>
        <Heading level={1} className={styles.stats__title}>
          Statistics
        </Heading>
        <Text className={styles.stats__description}>
          Visual analytics and trends for sales, activities, and profitability.
        </Text>
      </div>

      <div className={styles.stats__grid}>
        <section className={styles.stats__chartSection} aria-labelledby="sales-chart-heading">
          <h2 id="sales-chart-heading" className={styles.stats__chartHeading}>
            Sales Per Month
          </h2>
          <SalesPerMonthChart />
        </section>

        <section className={styles.stats__chartSection} aria-labelledby="activities-chart-heading">
          <h2 id="activities-chart-heading" className={styles.stats__chartHeading}>
            Activities Over Time
          </h2>
          <ActivitiesOverTimeChart />
        </section>

        <section className={styles.stats__chartSection} aria-labelledby="margin-chart-heading">
          <h2 id="margin-chart-heading" className={styles.stats__chartHeading}>
            Revenue & Margin per Month
          </h2>
          <MarginPerMonthChart />
        </section>

        <section className={styles.stats__chartSection} aria-labelledby="top-products-chart-heading">
          <h2 id="top-products-chart-heading" className={styles.stats__chartHeading}>
            Top Products by Profit
          </h2>
          <TopProfitableProductsChart />
        </section>
      </div>
    </main>
  );
};

export default StatsPage;
