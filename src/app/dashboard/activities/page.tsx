/**
 * Activities Page
 *
 * Main page component for viewing and filtering activities.
 * Displays a filterable, paginated table of activities with navigation controls.
 */

"use client";

import React from "react";
import Heading from "@/presentation/components/ui/Heading";
import Link from "@/presentation/components/ui/Link";
import Button from "@/presentation/components/ui/Button";
import { useActivities } from "@/presentation/hooks/useActivities";
import { useActivityFiltersStore } from "@/presentation/stores/useActivityFiltersStore";
import { useTranslation } from "@/presentation/hooks/useTranslation";
import ActivityFilters from "@/presentation/components/activities/ActivityFilters/ActivityFilters";
import ActivitiesTable from "@/presentation/components/activities/ActivitiesTable/ActivitiesTable";
import ActivityPagination from "@/presentation/components/activities/ActivityPagination/ActivityPagination";
import styles from "./page.module.scss";

const ActivitiesPage = () => {
    // Translation hooks
    const tActivities = useTranslation("pages.activities");

    // Fetch activities using React Query hook (reads filters from Zustand store)
    const { data, isLoading, error } = useActivities();

    // Get pagination state from Zustand store
    const currentPage = useActivityFiltersStore((state) => state.page);
    const setPage = useActivityFiltersStore((state) => state.setPage);

    // Handle page change
    const handlePageChange = React.useCallback(
        (page: number) => {
            setPage(page);
        },
        [setPage]
    );

    // Extract activities and pagination metadata from data
    const activities = data?.activities ?? [];
    const totalPages = data?.totalPages ?? 0;

    return (
        <main className={styles.activities}>
            <div className={styles.activities__header}>
                <Heading level={1} className={styles.activities__title}>
                    {tActivities("title")}
                </Heading>
                <Link
                    href="/dashboard/activities/new"
                    className={styles.activities__addButton}
                >
                    <Button variant="primary" ariaLabel={tActivities("addActivity")}>
                        {tActivities("addActivity")}
                    </Button>
                </Link>
            </div>

            <ActivityFilters />

            <ActivitiesTable
                activities={activities}
                isLoading={isLoading}
                error={error}
            />

            {totalPages > 0 && (
                <ActivityPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            )}
        </main>
    );
};

export default ActivitiesPage;
