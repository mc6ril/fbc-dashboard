/**
 * MarginPerMonthChart Component
 *
 * A chart component that visualizes revenue and margin trends per month using Recharts.
 * Displays two lines comparing total sales (CA) and profit (margin) to help users
 * understand profitability patterns: high sales with low margin vs low sales with high margin.
 *
 * The component:
 * - Fetches data from `useProfitsByPeriod` hook with MONTHLY period
 * - Transforms PeriodStatistics[] to Recharts format (presentation logic only)
 * - Displays a dual-line chart showing totalSales (CA) and profit (margin) per month
 * - Uses ChartContainer wrapper for accessibility and loading/error states
 * - Supports optional date range filtering
 *
 * @component
 */

"use client";

import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useProfitsByPeriod } from "@/presentation/hooks/useStatistics";
import { StatisticsPeriod } from "@/core/domain/statistics";
import ChartContainer from "@/presentation/components/ui/ChartContainer";
import { CHART_COLOR_PRIMARY, CHART_COLOR_SUCCESS } from "@/shared/constants/chartTheme";
import { formatCurrency } from "@/shared/utils/currency";
import { formatMonth } from "@/shared/utils/date";
import styles from "./MarginPerMonthChart.module.scss";

type Props = {
  /** Optional start date (ISO 8601 format) to filter data from this date onwards */
  startDate?: string;
  /** Optional end date (ISO 8601 format) to filter data up to this date */
  endDate?: string;
};

type ChartDataPoint = {
  month: string;
  revenue: number;
  margin: number;
};


/**
 * Transforms PeriodStatistics[] to Recharts data format.
 * Presentation logic only - extracts totalSales (revenue) and profit (margin) for chart display.
 */
const transformDataForChart = (data: Array<{ period: string; totalSales: number; profit: number }>): ChartDataPoint[] => {
  return data.map((item) => ({
    month: item.period,
    revenue: item.totalSales,
    margin: item.profit,
  }));
};

const MarginPerMonthChartComponent = ({ startDate, endDate }: Props) => {
  const { data, isLoading, error } = useProfitsByPeriod(StatisticsPeriod.MONTHLY, startDate, endDate);

  const chartData = React.useMemo(() => {
    if (!data || data.length === 0) {
      return [];
    }
    return transformDataForChart(data);
  }, [data]);

  return (
    <ChartContainer
      title="Revenue & Margin per Month"
      description="Revenue and margin per month chart comparing total sales (CA) and profit (margin) trends"
      isLoading={isLoading}
      error={error}
      className={styles.marginPerMonthChart}
    >
      {chartData.length === 0 ? (
        <div className={styles.marginPerMonthChart__empty}>
          <p>No revenue and margin data available for the selected period.</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData} margin={{ top: 10, right: 30, bottom: 60, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tickFormatter={formatMonth}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              tickFormatter={(value) => formatCurrency(value)}
              width={80}
              allowDecimals={false}
            />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              labelFormatter={(label: string) => formatMonth(label)}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke={CHART_COLOR_PRIMARY}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              name="Revenue (CA)"
            />
            <Line
              type="monotone"
              dataKey="margin"
              stroke={CHART_COLOR_SUCCESS}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              name="Margin"
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </ChartContainer>
  );
};

const MarginPerMonthChart = React.memo(MarginPerMonthChartComponent);
export default MarginPerMonthChart;

