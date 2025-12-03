/**
 * ExpandableRevenueRow Component
 *
 * Expandable row component for revenue breakdown display.
 * Supports expansion to show detailed breakdown by product type or individual products.
 * Provides proper accessibility (WCAG 2.1 AA) with ARIA attributes and keyboard navigation.
 *
 * The component:
 * - Manages expansion state (open/closed)
 * - Lazy loads data when expanded (uses `enabled` in hooks)
 * - Displays chevron icon (down/up) to indicate expansion state
 * - Smooth expand/collapse animation
 * - ARIA attributes (`aria-expanded`, `aria-controls`)
 * - Loading state during data fetch
 *
 * @component
 */

"use client";

import React from "react";
import type { RevenuePeriod, RevenueByProductType, RevenueByProduct } from "@/core/domain/revenue";
import { useRevenueByProductType, useRevenueByProduct } from "@/presentation/hooks/useRevenue";
import { formatProductType } from "@/shared/utils/product";
import { formatCurrency } from "@/shared/utils/currency";
import { useTranslation } from "@/presentation/hooks/useTranslation";
import Text from "@/presentation/components/ui/Text";
import styles from "./ExpandableRevenueRow.module.scss";

type Props = {
    /** Period type (MONTH, QUARTER, YEAR, or CUSTOM) */
    period: RevenuePeriod;
    /** Start date (ISO 8601 format) */
    startDate: string;
    /** End date (ISO 8601 format) */
    endDate: string;
    /** Breakdown type: 'productType' or 'product' */
    breakdownType: "productType" | "product";
    /** Row label to display (e.g., "Breakdown by Product Type") */
    label: string;
    /** Optional additional CSS class names */
    className?: string;
};

const ExpandableRevenueRowComponent = ({
    period,
    startDate,
    endDate,
    breakdownType,
    label,
    className,
}: Props) => {
    const [isExpanded, setIsExpanded] = React.useState(false);
    const tCommon = useTranslation("common");
    const tRevenue = useTranslation("pages.revenue.table");

    // Generate stable unique IDs for ARIA attributes using React.useId()
    // This ensures IDs are stable across re-renders and work correctly in React Strict Mode
    const baseId = React.useId();
    const rowId = React.useMemo(() => `expandable-row-${breakdownType}-${baseId}`, [breakdownType, baseId]);
    const contentId = React.useMemo(() => `${rowId}-content`, [rowId]);

    // Lazy load data only when expanded
    const { data: revenueByType, isLoading: isLoadingByType, error: errorByType } =
        useRevenueByProductType(period, startDate, endDate, isExpanded && breakdownType === "productType");

    const { data: revenueByProduct, isLoading: isLoadingByProduct, error: errorByProduct } =
        useRevenueByProduct(period, startDate, endDate, isExpanded && breakdownType === "product");

    const isLoading = breakdownType === "productType" ? isLoadingByType : isLoadingByProduct;
    const error = breakdownType === "productType" ? errorByType : errorByProduct;
    const data = breakdownType === "productType" ? revenueByType : revenueByProduct;

    const handleToggle = React.useCallback(() => {
        setIsExpanded((prev) => !prev);
    }, []);

    const handleKeyDown = React.useCallback(
        (event: React.KeyboardEvent<HTMLButtonElement>) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                handleToggle();
            }
        },
        [handleToggle]
    );

    const rowClassName = React.useMemo(() => {
        const base = [styles.expandableRow];
        if (isExpanded) {
            base.push(styles.expandableRow__expanded);
        }
        if (className) {
            base.push(className);
        }
        return base.join(" ");
    }, [isExpanded, className]);

    return (
        <>
            <tr className={rowClassName}>
                <td colSpan={3} className={styles.expandableRow__cell}>
                    <button
                        type="button"
                        className={styles.expandableRow__button}
                        onClick={handleToggle}
                        onKeyDown={handleKeyDown}
                        aria-expanded={isExpanded}
                        aria-controls={contentId}
                        aria-label={isExpanded ? tRevenue("collapseRow") : tRevenue("expandRow")}
                    >
                        <span className={styles.expandableRow__chevron} aria-hidden="true">
                            {isExpanded ? "▼" : "▶"}
                        </span>
                        <span className={styles.expandableRow__label}>{label}</span>
                    </button>
                </td>
            </tr>
            {isExpanded && (
                <tr className={styles.expandableRow__contentRow}>
                    <td colSpan={3} className={styles.expandableRow__contentCell}>
                        <div
                            id={contentId}
                            className={styles.expandableRow__content}
                            role="region"
                            aria-live="polite"
                        >
                            {isLoading && (
                                <Text size="sm" muted className={styles.expandableRow__state}>
                                    {tCommon("loading")}
                                </Text>
                            )}

                            {error && (
                                <Text size="sm" role="alert" className={styles.expandableRow__state}>
                                    {tRevenue("errorLoadingBreakdown")}
                                </Text>
                            )}

                            {!isLoading && !error && data && data.length === 0 && (
                                <Text size="sm" muted className={styles.expandableRow__state}>
                                    {tRevenue("noBreakdownData")}
                                </Text>
                            )}

                            {!isLoading && !error && data && data.length > 0 && (
                                <ul className={styles.expandableRow__list} role="list">
                                    {breakdownType === "productType" &&
                                        (data as RevenueByProductType[]).map((item, index) => (
                                            <li key={`${item.type}-${index}`} className={styles.expandableRow__item}>
                                                <span className={styles.expandableRow__itemLabel}>
                                                    {formatProductType(item.type)}
                                                </span>
                                                <span className={styles.expandableRow__itemValue}>
                                                    {formatCurrency(item.revenue)}
                                                </span>
                                                <span className={styles.expandableRow__itemCount}>
                                                    ({item.count} {tRevenue("sales")})
                                                </span>
                                            </li>
                                        ))}

                                    {breakdownType === "product" &&
                                        (data as RevenueByProduct[]).map((item, index) => (
                                            <li key={`${item.productId}-${index}`} className={styles.expandableRow__item}>
                                                <span className={styles.expandableRow__itemLabel}>
                                                    {item.productName} ({item.coloris})
                                                </span>
                                                <span className={styles.expandableRow__itemValue}>
                                                    {formatCurrency(item.revenue)}
                                                </span>
                                                <span className={styles.expandableRow__itemCount}>
                                                    ({item.count} {tRevenue("sales")})
                                                </span>
                                            </li>
                                        ))}
                                </ul>
                            )}
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
};

const ExpandableRevenueRow = React.memo(ExpandableRevenueRowComponent);
export default ExpandableRevenueRow;

