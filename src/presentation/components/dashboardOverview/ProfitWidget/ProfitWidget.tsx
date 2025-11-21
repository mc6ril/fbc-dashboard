"use client";

import React from "react";
import Card from "@/presentation/components/ui/Card";
import Text from "@/presentation/components/ui/Text";
import { useMonthlyProfit } from "@/presentation/hooks/useDashboard";
import { formatCurrency } from "@/shared/utils/currency";
import { LOADING_MESSAGE, ERROR_MESSAGES } from "@/shared/constants/messages";
import styles from "./ProfitWidget.module.scss";

const ProfitWidgetComponent = () => {
    const { data, isLoading, error } = useMonthlyProfit();

    return (
        <Card title="Marge Brute (Du mois)" className={styles.profitWidget}>
            {isLoading && (
                <Text size="md" muted>
                    {LOADING_MESSAGE}
                </Text>
            )}
            {error && (
                <Text size="md" role="alert">
                    {ERROR_MESSAGES.PROFIT_DATA}
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

