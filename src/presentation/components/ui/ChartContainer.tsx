/**
 * ChartContainer Component
 *
 * A reusable container component for chart visualizations with consistent
 * accessibility attributes, loading states, and error handling.
 *
 * The component provides:
 * - Semantic HTML structure with proper ARIA attributes
 * - Loading state with placeholder
 * - Error state with error message
 * - Accessible structure for screen readers
 * - Consistent styling using design system tokens
 *
 * @component
 */

import React from "react";
import { getAccessibilityId } from "@/shared/a11y/utils";
import Text from "@/presentation/components/ui/Text";
import "@/styles/components/_chart-container.scss";

type Props = {
  /** Title of the chart for accessibility and display */
  title: string;
  /** Description of the chart content for accessibility */
  description: string;
  /** Chart content to display when data is available */
  children: React.ReactNode;
  /** Whether the chart is in a loading state */
  isLoading?: boolean;
  /** Error message to display if chart data failed to load */
  error?: Error | string | null;
  /** Optional additional CSS class names */
  className?: string;
};

const ChartContainerComponent = ({
  title,
  description,
  children,
  isLoading = false,
  error = null,
  className,
}: Props) => {
  const chartId = React.useMemo(() => getAccessibilityId("chart", title.toLowerCase().replace(/\s+/g, "-")), [title]);
  const descriptionId = React.useMemo(() => getAccessibilityId("chart-description", title.toLowerCase().replace(/\s+/g, "-")), [title]);

  const classNames = React.useMemo(() => {
    const base = ["chart-container"];
    if (className && className.trim().length > 0) {
      base.push(className);
    }
    return base.join(" ");
  }, [className]);

  if (error) {
    const errorMessage = error instanceof Error ? error.message : error;
    return (
      <section
        className={classNames}
        aria-label={title}
        aria-describedby={descriptionId}
        role="region"
      >
        <div className="chart-container__header">
          <h2 className="chart-container__title">{title}</h2>
          <p id={descriptionId} className="chart-container__description">
            {description}
          </p>
        </div>
        <div className="chart-container__error" role="alert">
          <Text size="sm" muted>
            Error loading chart: {errorMessage}
          </Text>
        </div>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section
        className={classNames}
        aria-label={title}
        aria-describedby={descriptionId}
        aria-busy="true"
        role="region"
      >
        <div className="chart-container__header">
          <h2 className="chart-container__title">{title}</h2>
          <p id={descriptionId} className="chart-container__description">
            {description}
          </p>
        </div>
        <div className="chart-container__loading">
          <Text size="sm" muted>
            Loading chart data...
          </Text>
        </div>
      </section>
    );
  }

  return (
    <section
      id={chartId}
      className={classNames}
      aria-label={title}
      aria-describedby={descriptionId}
      role="region"
    >
      <div className="chart-container__header">
        <h2 className="chart-container__title">{title}</h2>
        <p id={descriptionId} className="chart-container__description">
          {description}
        </p>
      </div>
      <div className="chart-container__content">{children}</div>
    </section>
  );
};

const ChartContainer = React.memo(ChartContainerComponent);
export default ChartContainer;

