"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useTranslation } from "@/presentation/hooks/useTranslation";
import Heading from "@/presentation/components/ui/Heading";
import Text from "@/presentation/components/ui/Text";
import styles from "./page.module.scss";

// Loading component for dynamic imports
const ChartLoadingPlaceholder = () => {
  const t = useTranslation("ui.chart");
  
  return (
    <div className={styles.analyses__chartLoading} role="status" aria-live="polite" aria-busy="true">
      <Text size="sm" muted>
        {t("loading")}
      </Text>
    </div>
  );
};

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

const AnalysesPage = () => {
  const t = useTranslation("pages.analyses");

  return (
    <main className={styles.analyses} role="main">
      <div className={styles.analyses__header}>
        <Heading level={1} className={styles.analyses__title}>
          {t("title")}
        </Heading>
        <Text className={styles.analyses__description}>
          {t("description")}
        </Text>
      </div>

      <div className={styles.analyses__grid}>
        <section className={styles.analyses__chartSection} aria-labelledby="sales-chart-heading">
          <h2 id="sales-chart-heading" className={styles.analyses__chartHeading}>
            {t("charts.salesPerMonth")}
          </h2>
          <SalesPerMonthChart />
        </section>

        <section className={styles.analyses__chartSection} aria-labelledby="activities-chart-heading">
          <h2 id="activities-chart-heading" className={styles.analyses__chartHeading}>
            {t("charts.activitiesOverTime")}
          </h2>
          <ActivitiesOverTimeChart />
        </section>

        <section className={styles.analyses__chartSection} aria-labelledby="margin-chart-heading">
          <h2 id="margin-chart-heading" className={styles.analyses__chartHeading}>
            {t("charts.marginPerMonth")}
          </h2>
          <MarginPerMonthChart />
        </section>

        <section className={styles.analyses__chartSection} aria-labelledby="top-products-chart-heading">
          <h2 id="top-products-chart-heading" className={styles.analyses__chartHeading}>
            {t("charts.topProducts")}
          </h2>
          <TopProfitableProductsChart />
        </section>
      </div>
    </main>
  );
};

export default AnalysesPage;

