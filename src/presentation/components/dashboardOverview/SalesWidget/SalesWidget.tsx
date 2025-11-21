"use client";

import React from "react";
import Card from "@/presentation/components/ui/Card";
import Text from "@/presentation/components/ui/Text";
import { useMonthlySales } from "@/presentation/hooks/useDashboard";
import { formatCurrency } from "@/shared/utils/currency";
import { LOADING_MESSAGE, ERROR_MESSAGES } from "@/shared/constants/messages";
import styles from "./SalesWidget.module.scss";

const SalesWidgetComponent = () => {
    const { data, isLoading, error } = useMonthlySales();

    return (
        <Card title="Total Ventes (Du mois)" className={styles.salesWidget}>
            {isLoading && (
                <Text size="md" muted>
                    {LOADING_MESSAGE}
                </Text>
            )}
            {error && (
                <Text size="md" role="alert">
                    {ERROR_MESSAGES.SALES_DATA}
                </Text>
            )}
            {!isLoading && !error && data !== undefined && (
                <Text size="lg" weight="bold" className={styles.salesWidget__amount}>
                    {formatCurrency(data)}
                </Text>
            )}
        </Card>
    );
};

const SalesWidget = React.memo(SalesWidgetComponent);
export default SalesWidget;

