/**
 * RevenueTable Component
 *
 * Table component for displaying revenue data with proper formatting.
 * Shows revenue sections, expandable breakdown rows, cost inputs, and net result.
 * Handles loading, error, and empty states.
 * Provides proper accessibility (WCAG 2.1 AA) with semantic HTML and ARIA attributes.
 *
 * @component
 */

"use client";

import React from "react";
import type { RevenueData, RevenuePeriod } from "@/core/domain/revenue";
import Card from "@/presentation/components/ui/Card";
import Text from "@/presentation/components/ui/Text";
import { formatCurrency } from "@/shared/utils/currency";
import { formatPercentage } from "@/shared/utils/currency";
import { useTranslation } from "@/presentation/hooks/useTranslation";
import { getMonthsInRange } from "@/shared/utils/date";
import ExpandableRevenueRow from "@/presentation/components/revenueTable/ExpandableRevenueRow/ExpandableRevenueRow";
import MonthlyCostInputs from "./MonthlyCostInputs";
import styles from "./RevenueTable.module.scss";

type Props = {
    /** Revenue data to display */
    revenueData: RevenueData | null;
    /** Period type (MONTH, QUARTER, YEAR, or CUSTOM) */
    period: RevenuePeriod;
    /** Start date (ISO 8601 format) */
    startDate: string;
    /** End date (ISO 8601 format) */
    endDate: string;
    /** Whether data is currently loading */
    isLoading: boolean;
    /** Error object if data loading failed */
    error: Error | null;
};

const RevenueTableComponent = ({
    revenueData,
    period,
    startDate,
    endDate,
    isLoading,
    error,
}: Props) => {
    const tCommon = useTranslation("common");
    const tRevenue = useTranslation("pages.revenue.table");
    const tErrors = useTranslation("errors");

    // Extract all months in the date range for cost inputs
    // This ensures users can edit costs for all months that contribute to revenue calculations
    const monthsInRange = React.useMemo(
        () => getMonthsInRange(startDate, endDate),
        [startDate, endDate]
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
                <table className={styles.revenueTable__table} aria-label={tRevenue("ariaLabel")}>
                    <caption className={styles.revenueTable__caption}>{tRevenue("caption")}</caption>
                    <thead className={styles.revenueTable__thead}>
                        <tr>
                            <th scope="col" className={styles.revenueTable__header}>
                                {tRevenue("columns.section")}
                            </th>
                            <th scope="col" className={styles.revenueTable__header}>
                                {tRevenue("columns.value")}
                            </th>
                            <th scope="col" className={styles.revenueTable__header}>
                                {tRevenue("columns.rate")}
                            </th>
                        </tr>
                    </thead>
                    <tbody className={styles.revenueTable__tbody}>
                        {/* Revenue row */}
                        <tr className={styles.revenueTable__row}>
                            <th scope="row" className={styles.revenueTable__rowHeader}>
                                {tRevenue("sections.revenue")}
                            </th>
                            <td className={styles.revenueTable__cell}>
                                {formatCurrency(revenueData.totalRevenue)}
                            </td>
                            <td className={styles.revenueTable__cell}></td>
                        </tr>

                        {/* Expandable row: Revenue by product type */}
                        <ExpandableRevenueRow
                            period={period}
                            startDate={startDate}
                            endDate={endDate}
                            breakdownType="productType"
                            label={tRevenue("sections.revenueByProductType")}
                        />

                        {/* Expandable row: Revenue by product */}
                        <ExpandableRevenueRow
                            period={period}
                            startDate={startDate}
                            endDate={endDate}
                            breakdownType="product"
                            label={tRevenue("sections.revenueByProduct")}
                        />

                        {/* Material costs row */}
                        <tr className={styles.revenueTable__row}>
                            <th scope="row" className={styles.revenueTable__rowHeader}>
                                {tRevenue("sections.costs")}
                            </th>
                            <td className={styles.revenueTable__cell}>
                                {formatCurrency(revenueData.materialCosts)}
                            </td>
                            <td className={styles.revenueTable__cell}></td>
                        </tr>

                        {/* Gross margin row */}
                        <tr className={styles.revenueTable__row}>
                            <th scope="row" className={styles.revenueTable__rowHeader}>
                                {tRevenue("sections.grossMargin")}
                            </th>
                            <td className={styles.revenueTable__cell}>
                                {formatCurrency(revenueData.grossMargin)}
                            </td>
                            <td className={styles.revenueTable__cell}>
                                <span className={styles.revenueTable__rate}>
                                    ({formatPercentage(revenueData.grossMarginRate)})
                                </span>
                            </td>
                        </tr>

                        {/* Shipping cost row */}
                        <tr className={styles.revenueTable__row}>
                            <th scope="row" className={styles.revenueTable__rowHeader}>
                                {tRevenue("sections.shippingCost")}
                            </th>
                            <td className={styles.revenueTable__cell} colSpan={2}>
                                <MonthlyCostInputs
                                    months={monthsInRange}
                                    costType="shipping"
                                    baseLabel={tRevenue("sections.shippingCost")}
                                    baseId="shipping-cost-input"
                                />
                            </td>
                        </tr>

                        {/* Indirect costs section */}
                        <tr className={styles.revenueTable__row}>
                            <th scope="row" className={styles.revenueTable__rowHeader} rowSpan={2}>
                                {tRevenue("sections.indirectCosts")}
                            </th>
                            <td className={styles.revenueTable__cell} colSpan={2}>
                                <MonthlyCostInputs
                                    months={monthsInRange}
                                    costType="marketing"
                                    baseLabel={tRevenue("sections.marketingCost")}
                                    baseId="marketing-cost-input"
                                />
                            </td>
                        </tr>
                        <tr className={styles.revenueTable__row}>
                            <td className={styles.revenueTable__cell} colSpan={2}>
                                <MonthlyCostInputs
                                    months={monthsInRange}
                                    costType="overhead"
                                    baseLabel={tRevenue("sections.overheadCost")}
                                    baseId="overhead-cost-input"
                                />
                            </td>
                        </tr>

                        {/* Net result row */}
                        <tr className={styles.revenueTable__row}>
                            <th scope="row" className={styles.revenueTable__rowHeader}>
                                {tRevenue("sections.netResult")}
                            </th>
                            <td className={styles.revenueTable__cell}>
                                {formatCurrency(revenueData.netResult)}
                            </td>
                            <td className={styles.revenueTable__cell}>
                                <span className={styles.revenueTable__rate}>
                                    ({formatPercentage(revenueData.netMarginRate)})
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            )}
        </Card>
    );
};

const RevenueTable = React.memo(RevenueTableComponent);
export default RevenueTable;

