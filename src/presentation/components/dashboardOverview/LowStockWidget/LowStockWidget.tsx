"use client";

import React from "react";
import Card from "@/presentation/components/ui/Card";
import Text from "@/presentation/components/ui/Text";
import { useLowStockProducts } from "@/presentation/hooks/useDashboard";
import type { Product } from "@/core/domain/product";
import { LOADING_MESSAGE, ERROR_MESSAGES, EMPTY_STATE_MESSAGES } from "@/shared/constants/messages";
import styles from "./LowStockWidget.module.scss";

const LowStockWidgetComponent = () => {
    const { data, isLoading, error } = useLowStockProducts();

    return (
        <Card title="Produits en stock faible" className={styles.lowStockWidget}>
            {isLoading && (
                <Text size="md" muted>
                    {LOADING_MESSAGE}
                </Text>
            )}
            {error && (
                <Text size="md" role="alert">
                    {ERROR_MESSAGES.PRODUCTS}
                </Text>
            )}
            {!isLoading && !error && data !== undefined && (
                <>
                    {data.length === 0 ? (
                        <Text size="md" muted>
                            {EMPTY_STATE_MESSAGES.LOW_STOCK_PRODUCTS}
                        </Text>
                    ) : (
                        <ul className={styles.lowStockWidget__list} role="list">
                            {data.map((product: Product) => (
                                <li key={product.id} className={styles.lowStockWidget__item}>
                                    <Text size="md" weight="medium" className={styles.lowStockWidget__name}>
                                        {product.name}
                                    </Text>
                                    <Text size="sm" muted className={styles.lowStockWidget__stock}>
                                        Stock: {product.stock}
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

