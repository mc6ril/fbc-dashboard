/**
 * PeriodSelector Component
 *
 * Period selection component for revenue analysis.
 * Supports Month, Quarter, Year, and Custom date range selection.
 * Provides proper accessibility (WCAG 2.1 AA) with semantic HTML and ARIA attributes.
 *
 * The component:
 * - Supports 4 period types: Month, Quarter, Year, Custom
 * - Default selection: Current month (first day 00:00:00 to last day 23:59:59)
 * - Custom option shows start date and end date inputs
 * - Validates date range (startDate <= endDate)
 * - Emits period change events (startDate, endDate ISO 8601 strings)
 *
 * @component
 */

"use client";

import React from "react";
import { RevenuePeriod } from "@/core/domain/revenue";
import {
    getCurrentMonthStart,
    getCurrentMonthEnd,
    getCurrentQuarterStart,
    getCurrentQuarterEnd,
    getCurrentYearStart,
    getCurrentYearEnd,
    isoToDateInput,
    dateInputToIso,
} from "@/shared/utils/date";
import { useTranslation } from "@/presentation/hooks/useTranslation";
import Select, { type SelectOption } from "@/presentation/components/ui/Select";
import DateInput from "@/presentation/components/ui/DateInput";
import styles from "./PeriodSelector.module.scss";

type Props = {
    /** Current selected period type */
    period: RevenuePeriod;
    /** Current start date (ISO 8601 format) */
    startDate: string;
    /** Current end date (ISO 8601 format) */
    endDate: string;
    /** Callback when period changes (receives period, startDate, endDate) */
    onChange: (period: RevenuePeriod, startDate: string, endDate: string) => void;
    /** Optional additional CSS class names */
    className?: string;
};

const PeriodSelectorComponent = ({
    period,
    startDate,
    endDate,
    onChange,
    className,
}: Props) => {
    const tPeriodSelector = useTranslation("pages.revenue.periodSelector");

    // Period type options
    const periodOptions: SelectOption[] = React.useMemo(
        () => [
            { value: RevenuePeriod.MONTH, label: tPeriodSelector("options.MONTH") },
            { value: RevenuePeriod.QUARTER, label: tPeriodSelector("options.QUARTER") },
            { value: RevenuePeriod.YEAR, label: tPeriodSelector("options.YEAR") },
            { value: RevenuePeriod.CUSTOM, label: tPeriodSelector("options.CUSTOM") },
        ],
        [tPeriodSelector]
    );

    // Date range validation error
    const [dateRangeError, setDateRangeError] = React.useState<string | undefined>(
        undefined
    );

    // Handle period type change
    const handlePeriodChange = React.useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            const newPeriod = e.target.value as RevenuePeriod;
            let newStartDate: string;
            let newEndDate: string;

            // Calculate dates based on period type
            switch (newPeriod) {
                case RevenuePeriod.MONTH:
                    newStartDate = getCurrentMonthStart();
                    newEndDate = getCurrentMonthEnd();
                    break;
                case RevenuePeriod.QUARTER:
                    newStartDate = getCurrentQuarterStart();
                    newEndDate = getCurrentQuarterEnd();
                    break;
                case RevenuePeriod.YEAR:
                    newStartDate = getCurrentYearStart();
                    newEndDate = getCurrentYearEnd();
                    break;
                case RevenuePeriod.CUSTOM:
                    // Keep current dates when switching to custom
                    newStartDate = startDate;
                    newEndDate = endDate;
                    break;
                default:
                    // Default to current month
                    newStartDate = getCurrentMonthStart();
                    newEndDate = getCurrentMonthEnd();
                    break;
            }

            // Clear date range error when switching period
            setDateRangeError(undefined);

            onChange(newPeriod, newStartDate, newEndDate);
        },
        [startDate, endDate, onChange]
    );

    // Handle custom start date change
    const handleStartDateChange = React.useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const newStartDateInput = e.target.value;
            if (!newStartDateInput) {
                return;
            }

            const newStartDate = dateInputToIso(newStartDateInput);
            const endDateInput = isoToDateInput(endDate);

            // Validate date range (startDate <= endDate)
            if (newStartDateInput > endDateInput) {
                setDateRangeError(tPeriodSelector("dateRangeError"));
            } else {
                setDateRangeError(undefined);
            }

            onChange(period, newStartDate, endDate);
        },
        [endDate, period, onChange, tPeriodSelector]
    );

    // Handle custom end date change
    const handleEndDateChange = React.useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const newEndDateInput = e.target.value;
            if (!newEndDateInput) {
                return;
            }

            const newEndDate = dateInputToIso(newEndDateInput);
            const startDateInput = isoToDateInput(startDate);

            // Validate date range (startDate <= endDate)
            if (startDateInput > newEndDateInput) {
                setDateRangeError(tPeriodSelector("dateRangeError"));
            } else {
                setDateRangeError(undefined);
            }

            onChange(period, startDate, newEndDate);
        },
        [startDate, period, onChange, tPeriodSelector]
    );

    // Convert ISO dates to date input format
    const startDateInput = React.useMemo(() => isoToDateInput(startDate), [startDate]);
    const endDateInput = React.useMemo(() => isoToDateInput(endDate), [endDate]);

    return (
        <div className={`${styles.periodSelector} ${className || ""}`}>
            <Select
                id="period-selector-type"
                label={tPeriodSelector("label")}
                options={periodOptions}
                value={period}
                onChange={handlePeriodChange}
            />

            {period === RevenuePeriod.CUSTOM && (
                <div className={styles.periodSelector__customDates}>
                    <DateInput
                        id="period-selector-start-date"
                        label={tPeriodSelector("customStartDate")}
                        value={startDateInput}
                        onChange={handleStartDateChange}
                        max={endDateInput}
                        error={dateRangeError}
                    />
                    <DateInput
                        id="period-selector-end-date"
                        label={tPeriodSelector("customEndDate")}
                        value={endDateInput}
                        onChange={handleEndDateChange}
                        min={startDateInput}
                        error={dateRangeError}
                    />
                </div>
            )}
        </div>
    );
};

const PeriodSelector = React.memo(PeriodSelectorComponent);
export default PeriodSelector;

