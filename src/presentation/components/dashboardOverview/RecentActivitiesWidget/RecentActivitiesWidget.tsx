"use client";

import React from "react";
import Card from "@/presentation/components/ui/Card";
import Text from "@/presentation/components/ui/Text";
import { useRecentActivities } from "@/presentation/hooks/useDashboard";
import type { Activity } from "@/core/domain/activity";
import { formatCurrency } from "@/shared/utils/currency";
import { formatDate } from "@/shared/utils/date";
import { useTranslation } from "@/presentation/hooks/useTranslation";
import styles from "./RecentActivitiesWidget.module.scss";
import { formatActivityType } from "@/shared/utils/product";


const RecentActivitiesWidgetComponent = () => {
    const { data, isLoading, error } = useRecentActivities();
    const tCommon = useTranslation("common");
    const tWidgets = useTranslation("ui.widgets");
    const tErrors = useTranslation("errors");
    const tEmpty = useTranslation("empty");

    return (
        <Card title={tWidgets("recentActivities.title")} className={styles.recentActivitiesWidget}>
            {isLoading && (
                <Text size="md" muted>
                    {tCommon("loading")}
                </Text>
            )}
            {error && (
                <Text size="md" role="alert">
                    {tErrors("dashboard.activities")}
                </Text>
            )}
            {!isLoading && !error && data !== undefined && (
                <>
                    {data.length === 0 ? (
                        <Text size="md" muted>
                            {tEmpty("dashboard.recentActivities")}
                        </Text>
                    ) : (
                        <ul className={styles.recentActivitiesWidget__list} role="list">
                            {data.map((activity: Activity) => (
                                <li key={activity.id} className={styles.recentActivitiesWidget__item}>
                                    <div className={styles.recentActivitiesWidget__header}>
                                        <Text size="md" weight="medium" className={styles.recentActivitiesWidget__type}>
                                            {formatActivityType(activity.type)}
                                        </Text>
                                        <Text size="sm" muted className={styles.recentActivitiesWidget__date}>
                                            {formatDate(activity.date)}
                                        </Text>
                                    </div>
                                    <Text size="sm" className={styles.recentActivitiesWidget__amount}>
                                        {formatCurrency(activity.amount)}
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

const RecentActivitiesWidget = React.memo(RecentActivitiesWidgetComponent);
export default RecentActivitiesWidget;

