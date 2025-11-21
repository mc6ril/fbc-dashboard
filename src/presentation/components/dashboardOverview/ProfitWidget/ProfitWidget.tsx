"use client";

import React from "react";
import Card from "@/presentation/components/ui/Card";
import Text from "@/presentation/components/ui/Text";
import { useMonthlyProfit } from "@/presentation/hooks/useDashboard";
import { formatCurrency } from "@/shared/utils/currency";
import { useTranslation } from "@/presentation/hooks/useTranslation";
import styles from "./ProfitWidget.module.scss";

const ProfitWidgetComponent = () => {
    const { data, isLoading, error } = useMonthlyProfit();
    const tCommon = useTranslation("common");
    const tWidgets = useTranslation("ui.widgets");
    const tErrors = useTranslation("errors");

    return (
        <Card title={tWidgets("profit.title")} className={styles.profitWidget}>
            {isLoading && (
                <Text size="md" muted>
                    {tCommon("loading")}
                </Text>
            )}
            {error && (
                <Text size="md" role="alert">
                    {tErrors("dashboard.profit")}
                </Text>
            )}
            {!isLoading && !error && data !== undefined && (
                <Text size="lg" weight="bold" className={styles.profitWidget__amount}>
                    {formatCurrency(data)}
                </Text>
            )}
        </Card>
    );
};

const ProfitWidget = React.memo(ProfitWidgetComponent);
export default ProfitWidget;

