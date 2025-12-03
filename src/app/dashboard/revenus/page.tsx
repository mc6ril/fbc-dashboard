/**
 * Revenue Page
 *
 * Main page component for viewing revenue data.
 * Displays a period selector and revenue table with financial metrics.
 */

"use client";

import React from "react";
import Heading from "@/presentation/components/ui/Heading";
import { useRevenue } from "@/presentation/hooks/useRevenue";
import { useTranslation } from "@/presentation/hooks/useTranslation";
import { RevenuePeriod } from "@/core/domain/revenue";
import {
    getCurrentMonthStart,
    getCurrentMonthEnd,
} from "@/shared/utils/date";
import PeriodSelector from "@/presentation/components/revenueTable/PeriodSelector/PeriodSelector";
import RevenueTable from "@/presentation/components/revenueTable/RevenueTable/RevenueTable";
import styles from "./page.module.scss";

const RevenuePage = () => {
    const tRevenue = useTranslation("pages.revenue");

    // Period state management (default: current month)
    const [period, setPeriod] = React.useState<RevenuePeriod>(RevenuePeriod.MONTH);
    const [startDate, setStartDate] = React.useState<string>(getCurrentMonthStart());
    const [endDate, setEndDate] = React.useState<string>(getCurrentMonthEnd());

    // Handle period change from PeriodSelector
    const handlePeriodChange = React.useCallback(
        (newPeriod: RevenuePeriod, newStartDate: string, newEndDate: string) => {
            setPeriod(newPeriod);
            setStartDate(newStartDate);
            setEndDate(newEndDate);
        },
        []
    );

    // Fetch revenue data using React Query hook
    const { data: revenueData, isLoading, error } = useRevenue(
        period,
        startDate,
        endDate
    );

    return (
        <main className={styles.revenue} role="main">
            <div className={styles.revenue__header}>
                <Heading level={1} className={styles.revenue__title}>
                    {tRevenue("title")}
                </Heading>
            </div>

            <PeriodSelector
                period={period}
                startDate={startDate}
                endDate={endDate}
                onChange={handlePeriodChange}
            />

            <RevenueTable
                revenueData={revenueData ?? null}
                period={period}
                startDate={startDate}
                endDate={endDate}
                isLoading={isLoading}
                error={error}
            />
        </main>
    );
};

export default RevenuePage;

