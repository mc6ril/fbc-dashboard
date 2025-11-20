/**
 * SalesPerMonthChart Component
 *
 * A chart component that visualizes monthly sales trends using Recharts.
 * Displays sales data grouped by month to help identify seasonal patterns
 * and growth trends.
 *
 * The component:
 * - Fetches data from `useProfitsByPeriod` hook with MONTHLY period
 * - Transforms PeriodStatistics[] to Recharts format (presentation logic only)
 * - Displays a line chart showing totalSales per month
 * - Uses ChartContainer wrapper for accessibility and loading/error states
 * - Supports optional date range filtering
 *
 * @component
 */

"use client";

import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useProfitsByPeriod } from "@/presentation/hooks/useStatistics";
import { StatisticsPeriod } from "@/core/domain/statistics";
import ChartContainer from "@/presentation/components/ui/ChartContainer";
import { CHART_COLOR_PRIMARY } from "@/shared/constants/chartTheme";
import { formatCurrency } from "@/shared/utils/currency";
import { formatMonth } from "@/shared/utils/date";
import styles from "./SalesPerMonthChart.module.scss";

type Props = {
  /** Optional start date (ISO 8601 format) to filter data from this date onwards */
  startDate?: string;
  /** Optional end date (ISO 8601 format) to filter data up to this date */
  endDate?: string;
};

type ChartDataPoint = {
  month: string;
  sales: number;
};


/**
 * Transforms PeriodStatistics[] to Recharts data format.
 * Presentation logic only - extracts totalSales for chart display.
 */
const transformDataForChart = (data: Array<{ period: string; totalSales: number }>): ChartDataPoint[] => {
  return data.map((item) => ({
    month: item.period,
    sales: item.totalSales,
  }));
};

const SalesPerMonthChartComponent = ({ startDate, endDate }: Props) => {
  const { data, isLoading, error } = useProfitsByPeriod(StatisticsPeriod.MONTHLY, startDate, endDate);

  const chartData = React.useMemo(() => {
    if (!data || data.length === 0) {
      return [];
    }
    return transformDataForChart(data);
  }, [data]);

  return (
    <ChartContainer
      title="Sales Per Month"
      description="Sales per month chart showing monthly sales trends"
      isLoading={isLoading}
      error={error}
      className={styles.salesPerMonthChart}
    >
      {chartData.length === 0 ? (
        <div className={styles.salesPerMonthChart__empty}>
          <p>No sales data available for the selected period.</p>
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
            <Line
              type="monotone"
              dataKey="sales"
              stroke={CHART_COLOR_PRIMARY}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </ChartContainer>
  );
};

const SalesPerMonthChart = React.memo(SalesPerMonthChartComponent);
export default SalesPerMonthChart;

