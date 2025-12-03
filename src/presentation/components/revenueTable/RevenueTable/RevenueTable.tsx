/**
 * RevenueTable Component
 *
 * Table component for displaying revenue data with proper formatting.
 * Shows 3 sections: Revenue (Total CA), Costs (Material costs), and Gross Margin (amount + rate).
 * Handles loading, error, and empty states.
 * Provides proper accessibility (WCAG 2.1 AA) with semantic HTML and ARIA attributes.
 *
 * @component
 */

"use client";

import React from "react";
import type { RevenueData } from "@/core/domain/revenue";
import Table, { type TableColumn } from "@/presentation/components/ui/Table";
import Card from "@/presentation/components/ui/Card";
import Text from "@/presentation/components/ui/Text";
import { formatCurrency } from "@/shared/utils/currency";
import { formatPercentage } from "@/shared/utils/currency";
import { useTranslation } from "@/presentation/hooks/useTranslation";
import styles from "./RevenueTable.module.scss";

type Props = {
    /** Revenue data to display */
    revenueData: RevenueData | null;
    /** Whether data is currently loading */
    isLoading: boolean;
    /** Error object if data loading failed */
    error: Error | null;
};

type RevenueTableRow = {
    section: string;
    value: string;
    rate?: string;
};

const RevenueTableComponent = ({
    revenueData,
    isLoading,
    error,
}: Props) => {
    const tCommon = useTranslation("common");
    const tRevenue = useTranslation("pages.revenue.table");
    const tErrors = useTranslation("errors");

    // Transform revenue data into table rows
    const tableData: RevenueTableRow[] = React.useMemo(() => {
        if (!revenueData) {
            return [];
        }

        return [
            {
                section: tRevenue("sections.revenue"),
                value: formatCurrency(revenueData.totalRevenue),
            },
            {
                section: tRevenue("sections.costs"),
                value: formatCurrency(revenueData.materialCosts),
            },
            {
                section: tRevenue("sections.grossMargin"),
                value: formatCurrency(revenueData.grossMargin),
                rate: formatPercentage(revenueData.grossMarginRate),
            },
        ];
    }, [revenueData, tRevenue]);

    // Define table columns
    const columns: TableColumn<RevenueTableRow>[] = React.useMemo(
        () => [
            {
                key: "section",
                header: "",
                isRowHeader: true,
            },
            {
                key: "value",
                header: "",
            },
            {
                key: "rate",
                header: "",
                render: (value: unknown) => {
                    if (value === undefined || value === null) {
                        return null;
                    }
                    return (
                        <span className={styles.revenueTable__rate}>
                            ({value as string})
                        </span>
                    );
                },
            },
        ],
        []
    );

    return (
        <Card className={styles.revenueTable}>
            {isLoading && (
                <Text size="md" muted className={styles.revenueTable__state}>
                    {tCommon("loading")}
                </Text>
            )}

            {error && (
                <Text size="md" role="alert" className={styles.revenueTable__state}>
                    {tErrors("dashboard.sales")}
                </Text>
            )}

            {!isLoading && !error && revenueData === null && (
                <Text size="md" muted className={styles.revenueTable__state}>
                    {tCommon("none")}
                </Text>
            )}

            {!isLoading && !error && revenueData !== null && (
                <Table
                    columns={columns}
                    data={tableData}
                    caption={tRevenue("caption")}
                    ariaLabel={tRevenue("ariaLabel")}
                    className={styles.revenueTable__table}
                />
            )}
        </Card>
    );
};

const RevenueTable = React.memo(RevenueTableComponent);
export default RevenueTable;

