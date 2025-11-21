/**
 * ActivitiesTable Component
 *
 * Table component for displaying activities with proper formatting.
 * Shows date, type, product, quantity, amount, and note columns.
 * Handles loading, error, and empty states.
 */

"use client";

import React from "react";
import type { Activity } from "@/core/domain/activity";
import { ActivityType } from "@/core/domain/activity";
import Table, { type TableColumn } from "@/presentation/components/ui/Table";
import Text from "@/presentation/components/ui/Text";
import { formatDate } from "@/shared/utils/date";
import { formatCurrency } from "@/shared/utils/currency";
import { useProducts } from "@/presentation/hooks/useProducts";
import { useTranslation } from "@/presentation/hooks/useTranslation";
import styles from "./ActivitiesTable.module.scss";
import { formatActivityType } from "@/shared/utils/product";

type Props = {
    /** Array of activities to display */
    activities: Activity[];
    /** Whether data is currently loading */
    isLoading: boolean;
    /** Error object if data loading failed */
    error: Error | null;
};

const ActivitiesTableComponent = ({ activities, isLoading, error }: Props) => {
    const tCommon = useTranslation("common");
    const tErrors = useTranslation("errors");
    const tDashboard = useTranslation("dashboard.tables.activities");

    // Fetch products for product name lookup
    const { data: products } = useProducts();

    // Create product lookup map for efficient name retrieval
    const productMap = React.useMemo(() => {
        if (!products) {
            return new Map<string, string>();
        }
        const map = new Map<string, string>();
        products.forEach((product) => {
            if (product.name) {
                map.set(product.id, product.name);
            }
        });
        return map;
    }, [products]);

    // Get product name by ID
    const getProductName = React.useCallback(
        (productId: string | undefined): string => {
            if (!productId) {
                return tDashboard("noProduct");
            }
            return productMap.get(productId) || tDashboard("unknownProduct");
        },
        [productMap, tDashboard]
    );

    // Define table columns
    const columns: TableColumn<Activity>[] = React.useMemo(
        () => [
            {
                key: "date",
                header: tDashboard("columns.date"),
                render: (value: unknown) => {
                    const date = value as string;
                    return formatDate(date);
                },
            },
            {
                key: "type",
                header: tDashboard("columns.type"),
                render: (value: unknown) => {
                    const type = value as ActivityType;
                    return formatActivityType(type);
                },
            },
            {
                key: "productId",
                header: tDashboard("columns.product"),
                render: (value: unknown, row: Activity) => {
                    return getProductName(row.productId);
                },
            },
            {
                key: "quantity",
                header: tDashboard("columns.quantity"),
                render: (value: unknown) => {
                    const quantity = value as number;
                    return `${Math.abs(quantity)}`;
                },
            },
            {
                key: "amount",
                header: tDashboard("columns.amount"),
                render: (value: unknown) => {
                    const amount = value as number;
                    return formatCurrency(amount);
                },
            },
            {
                key: "note",
                header: tDashboard("columns.note"),
                render: (value: unknown) => {
                    const note = value as string | undefined;
                    return note || tDashboard("noProduct");
                },
            },
        ],
        [getProductName, tDashboard]
    );

    // Loading state
    if (isLoading) {
        return (
            <div className={styles.activitiesTable}>
                <Text size="md" muted>
                    {tCommon("loading")}
                </Text>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className={styles.activitiesTable}>
                <Text size="md" role="alert">
                    {tErrors("dashboard.activities")}
                </Text>
            </div>
        );
    }

    // Render table
    return (
        <div className={styles.activitiesTable}>
            <Table
                columns={columns}
                data={activities}
                caption={tDashboard("caption")}
                ariaLabel={tDashboard("ariaLabel")}
            />
        </div>
    );
};

const ActivitiesTable = React.memo(ActivitiesTableComponent);
export default ActivitiesTable;

