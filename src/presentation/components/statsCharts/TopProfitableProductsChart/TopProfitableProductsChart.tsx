/**
 * TopProfitableProductsChart Component
 *
 * A chart component that visualizes the most profitable products using Recharts.
 * Displays a horizontal bar chart showing total profit by product/model to help
 * users identify which products drive the business.
 *
 * The component:
 * - Fetches data from `useProductMargins` hook (already sorted by profit descending)
 * - Fetches product details from `useProducts` hook to get product names
 * - Transforms ProductMargin[] to Recharts format (presentation logic only)
 * - Displays a horizontal bar chart showing top N products by profit
 * - Uses ChartContainer wrapper for accessibility and loading/error states
 * - Supports optional date range filtering
 *
 * @component
 */

"use client";

import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useProductMargins } from "@/presentation/hooks/useStatistics";
import { useProducts } from "@/presentation/hooks/useProducts";
import type { ProductMargin } from "@/core/domain/statistics";
import type { Product } from "@/core/domain/product";
import ChartContainer from "@/presentation/components/ui/ChartContainer";
import { CHART_COLOR_PRIMARY } from "@/shared/constants/chartTheme";
import { formatCurrency } from "@/shared/utils/currency";
import { getProductDisplayName } from "@/shared/utils/product";
import styles from "./TopProfitableProductsChart.module.scss";

// Number of top products to display
const TOP_PRODUCTS_LIMIT = 10;

type Props = {
  /** Optional start date (ISO 8601 format) to filter data from this date onwards */
  startDate?: string;
  /** Optional end date (ISO 8601 format) to filter data up to this date */
  endDate?: string;
};

type ChartDataPoint = {
  productLabel: string;
  profit: number;
};


/**
 * Transforms ProductMargin[] to Recharts data format.
 * Combines with product details to get product labels.
 * Presentation logic only - extracts profit for chart display.
 */
const transformDataForChart = (
  margins: ProductMargin[],
  products: Product[]
): ChartDataPoint[] => {
  // Create a map of products by ID for quick lookup
  const productsMap = new Map(products.map((p) => [p.id, p]));

  // Transform margins to chart data points with product labels
  // Limit to top N products (margins are already sorted by profit descending)
  return margins
    .slice(0, TOP_PRODUCTS_LIMIT)
    .map((margin) => {
      const product = productsMap.get(margin.productId);
      return {
        productLabel: getProductDisplayName(product),
        profit: margin.profit,
      };
    });
};

const TopProfitableProductsChartComponent = ({ startDate, endDate }: Props) => {
  const { data: margins, isLoading: isLoadingMargins, error: marginsError } = useProductMargins(startDate, endDate);
  const { data: products, isLoading: isLoadingProducts, error: productsError } = useProducts();

  const isLoading = isLoadingMargins || isLoadingProducts;
  const error = marginsError || productsError;

  const chartData = React.useMemo(() => {
    if (!margins || margins.length === 0 || !products || products.length === 0) {
      return [];
    }
    return transformDataForChart(margins, products);
  }, [margins, products]);

  return (
    <ChartContainer
      title="Top Products by Profit"
      description="Top products by profit chart showing the most profitable products/models"
      isLoading={isLoading}
      error={error}
      className={styles.topProfitableProductsChart}
    >
      {chartData.length === 0 ? (
        <div className={styles.topProfitableProductsChart__empty}>
          <p>No product profit data available for the selected period.</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 10, right: 30, bottom: 10, left: 150 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              tickFormatter={(value) => formatCurrency(value)}
              width={80}
              allowDecimals={false}
            />
            <YAxis
              type="category"
              dataKey="productLabel"
              width={140}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
            />
            <Bar
              dataKey="profit"
              fill={CHART_COLOR_PRIMARY}
              name="Profit"
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartContainer>
  );
};

const TopProfitableProductsChart = React.memo(TopProfitableProductsChartComponent);
export default TopProfitableProductsChart;

