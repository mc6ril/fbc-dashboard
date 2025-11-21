"use client";

import React from "react";
import Card from "@/presentation/components/ui/Card";
import Text from "@/presentation/components/ui/Text";
import { useRecentActivities } from "@/presentation/hooks/useDashboard";
import type { Activity } from "@/core/domain/activity";
import { formatCurrency } from "@/shared/utils/currency";
import { formatDate } from "@/shared/utils/date";
import { LOADING_MESSAGE, ERROR_MESSAGES, EMPTY_STATE_MESSAGES } from "@/shared/constants/messages";
import styles from "./RecentActivitiesWidget.module.scss";
import { formatActivityType } from "@/shared/utils/product";


const RecentActivitiesWidgetComponent = () => {
    const { data, isLoading, error } = useRecentActivities();

    return (
        <Card title="Activités récentes" className={styles.recentActivitiesWidget}>
            {isLoading && (
                <Text size="md" muted>
                    {LOADING_MESSAGE}
                </Text>
            )}
            {error && (
                <Text size="md" role="alert">
                    {ERROR_MESSAGES.ACTIVITIES}
                </Text>
            )}
            {!isLoading && !error && data !== undefined && (
                <>
                    {data.length === 0 ? (
                        <Text size="md" muted>
                            {EMPTY_STATE_MESSAGES.RECENT_ACTIVITIES}
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

