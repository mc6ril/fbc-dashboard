/**
 * ActivitiesOverTimeChart Component
 *
 * A chart component that visualizes daily creation activity trends using Recharts.
 * Displays activity counts grouped by day to help users understand production volume
 * trends over time.
 *
 * The component:
 * - Fetches data from `useProfitsByPeriod` hook with DAILY period
 * - Transforms PeriodStatistics[] to Recharts format (presentation logic only)
 * - Displays a line chart showing totalCreations per day
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
import { formatDate, formatDateShort } from "@/shared/utils/date";
import styles from "./ActivitiesOverTimeChart.module.scss";

type Props = {
  /** Optional start date (ISO 8601 format) to filter data from this date onwards */
  startDate?: string;
  /** Optional end date (ISO 8601 format) to filter data up to this date */
  endDate?: string;
};

type ChartDataPoint = {
  date: string;
  activities: number;
};



/**
 * Transforms PeriodStatistics[] to Recharts data format.
 * Presentation logic only - extracts totalCreations for chart display.
 */
const transformDataForChart = (data: Array<{ period: string; totalCreations: number }>): ChartDataPoint[] => {
  return data.map((item) => ({
    date: item.period,
    activities: item.totalCreations,
  }));
};

const ActivitiesOverTimeChartComponent = ({ startDate, endDate }: Props) => {
  const { data, isLoading, error } = useProfitsByPeriod(StatisticsPeriod.DAILY, startDate, endDate);

  const chartData = React.useMemo(() => {
    if (!data || data.length === 0) {
      return [];
    }
    return transformDataForChart(data);
  }, [data]);

  return (
    <ChartContainer
      title="Activities Over Time"
      description="Activities over time chart showing daily creation activity trends"
      isLoading={isLoading}
      error={error}
      className={styles.activitiesOverTimeChart}
    >
      {chartData.length === 0 ? (
        <div className={styles.activitiesOverTimeChart__empty}>
          <p>No activity data available for the selected period.</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData} margin={{ top: 10, right: 30, bottom: 60, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDateShort}
              angle={-45}
              textAnchor="end"
              height={80}
              interval="preserveStartEnd"
            />
            <YAxis
              allowDecimals={false}
              width={50}
            />
            <Tooltip
              formatter={(value: number) => [`${value} activities`, "Count"]}
              labelFormatter={(label: string) => formatDate(label)}
            />
            <Line
              type="monotone"
              dataKey="activities"
              stroke={CHART_COLOR_PRIMARY}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </ChartContainer>
  );
};

const ActivitiesOverTimeChart = React.memo(ActivitiesOverTimeChartComponent);
export default ActivitiesOverTimeChart;

