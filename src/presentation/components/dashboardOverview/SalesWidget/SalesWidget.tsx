"use client";

import React from "react";
import Card from "@/presentation/components/ui/Card";
import Text from "@/presentation/components/ui/Text";
import { useMonthlySales } from "@/presentation/hooks/useDashboard";
import { formatCurrency } from "@/shared/utils/currency";
import { useTranslation } from "@/presentation/hooks/useTranslation";
import styles from "./SalesWidget.module.scss";

const SalesWidgetComponent = () => {
    const { data, isLoading, error } = useMonthlySales();
    const tCommon = useTranslation("common");
    const tWidgets = useTranslation("ui.widgets");
    const tErrors = useTranslation("errors");

    return (
        <Card title={tWidgets("sales.title")} className={styles.salesWidget}>
            {isLoading && (
                <Text size="md" muted>
                    {tCommon("loading")}
                </Text>
            )}
            {error && (
                <Text size="md" role="alert">
                    {tErrors("dashboard.sales")}
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

