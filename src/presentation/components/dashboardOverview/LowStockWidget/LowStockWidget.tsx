"use client";

import React from "react";
import Card from "@/presentation/components/ui/Card";
import Text from "@/presentation/components/ui/Text";
import { useLowStockProducts } from "@/presentation/hooks/useDashboard";
import type { Product } from "@/core/domain/product";
import { useTranslation } from "@/presentation/hooks/useTranslation";
import styles from "./LowStockWidget.module.scss";

const LowStockWidgetComponent = () => {
    const { data, isLoading, error } = useLowStockProducts();
    const tCommon = useTranslation("common");
    const tWidgets = useTranslation("ui.widgets");
    const tErrors = useTranslation("errors");
    const tEmpty = useTranslation("empty");

    return (
        <Card title={tWidgets("lowStock.title")} className={styles.lowStockWidget}>
            {isLoading && (
                <Text size="md" muted>
                    {tCommon("loading")}
                </Text>
            )}
            {error && (
                <Text size="md" role="alert">
                    {tErrors("dashboard.products")}
                </Text>
            )}
            {!isLoading && !error && data !== undefined && (
                <>
                    {data.length === 0 ? (
                        <Text size="md" muted>
                            {tEmpty("dashboard.lowStock")}
                        </Text>
                    ) : (
                        <ul className={styles.lowStockWidget__list} role="list">
                            {data.map((product: Product) => (
                                <li key={product.id} className={styles.lowStockWidget__item}>
                                    <Text size="md" weight="medium" className={styles.lowStockWidget__name}>
                                        {product.name}
                                    </Text>
                                    <Text size="sm" muted className={styles.lowStockWidget__stock}>
                                        {tWidgets("lowStock.stock")}: {product.stock}
                                    </Text>
                                </li>
                            ))}
                        </ul>
                    )}
                </>
            )}
        </Card>
    );
};

const LowStockWidget = React.memo(LowStockWidgetComponent);
export default LowStockWidget;

