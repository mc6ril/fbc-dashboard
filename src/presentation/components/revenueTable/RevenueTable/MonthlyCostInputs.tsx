/**
 * MonthlyCostInputs Component
 *
 * Displays cost inputs for all months in a date range.
 * Each month gets its own CostInput component, allowing users to edit
 * costs for all months that contribute to the revenue calculation.
 *
 * @component
 */

"use client";

import React from "react";
import { useMonthlyCost } from "@/presentation/hooks/useCost";
import { formatMonth } from "@/shared/utils/date";
import CostInput from "@/presentation/components/revenueTable/CostInput/CostInput";
import styles from "./RevenueTable.module.scss";

type Props = {
    /** Array of months in YYYY-MM format */
    months: string[];
    /** Type of cost (shipping, marketing, or overhead) */
    costType: "shipping" | "marketing" | "overhead";
    /** Base label for the cost input */
    baseLabel: string;
    /** Base ID prefix for inputs (will be suffixed with month) */
    baseId: string;
};

/**
 * SingleMonthCostInput Component
 *
 * Internal component that handles a single month's cost input.
 * Uses a hook to fetch the monthly cost data.
 */
const SingleMonthCostInput = ({
    month,
    costType,
    label,
    id,
}: {
    month: string;
    costType: "shipping" | "marketing" | "overhead";
    label: string;
    id: string;
}) => {
    const { data: monthlyCostData } = useMonthlyCost(month);
    const monthlyCost = monthlyCostData ?? null;

    return (
        <CostInput
            id={id}
            label={label}
            month={month}
            costType={costType}
            currentCost={monthlyCost}
            className={styles.revenueTable__costInput}
        />
    );
};

const MonthlyCostInputsComponent = ({ months, costType, baseLabel, baseId }: Props) => {
    // For single month, display without month label (simpler UI)
    if (months.length === 1) {
        return (
            <SingleMonthCostInput
                month={months[0]}
                costType={costType}
                label={baseLabel}
                id={baseId}
            />
        );
    }

    // For multiple months, display each with month label
    return (
        <div className={styles.revenueTable__multiMonthCosts}>
            {months.map((month) => {
                const monthLabel = formatMonth(month);
                const label = `${baseLabel} - ${monthLabel}`;
                const id = `${baseId}-${month}`;

                return (
                    <SingleMonthCostInput
                        key={month}
                        month={month}
                        costType={costType}
                        label={label}
                        id={id}
                    />
                );
            })}
        </div>
    );
};

const MonthlyCostInputs = React.memo(MonthlyCostInputsComponent);
export default MonthlyCostInputs;

