/**
 * ActivityFilters Component
 *
 * Filter controls component for the Activities page.
 * Provides date range, activity type, and product filters using Zustand store.
 * Optimized to prevent unnecessary re-renders using selectors and memoization.
 */

"use client";

import React from "react";
import { ActivityType } from "@/core/domain/activity";
import type { ProductId } from "@/core/domain/product";
import { useActivityFiltersStore } from "@/presentation/stores/useActivityFiltersStore";
import DateInput from "@/presentation/components/ui/DateInput";
import Select, { type SelectOption } from "@/presentation/components/ui/Select";
import Button from "@/presentation/components/ui/Button";
import { useProducts } from "@/presentation/hooks/useProducts";
import styles from "./ActivityFilters.module.scss";

const ActivityFiltersComponent = () => {
    // Use Zustand selectors to prevent unnecessary re-renders
    const startDate = useActivityFiltersStore((state) => state.startDate);
    const endDate = useActivityFiltersStore((state) => state.endDate);
    const type = useActivityFiltersStore((state) => state.type);
    const productId = useActivityFiltersStore((state) => state.productId);
    const setStartDate = useActivityFiltersStore((state) => state.setStartDate);
    const setEndDate = useActivityFiltersStore((state) => state.setEndDate);
    const setType = useActivityFiltersStore((state) => state.setType);
    const setProductId = useActivityFiltersStore((state) => state.setProductId);
    const resetFilters = useActivityFiltersStore((state) => state.resetFilters);

    // Fetch products for product filter dropdown
    const { data: products, isLoading: isLoadingProducts } = useProducts();

    // Activity type options
    const activityTypeOptions: SelectOption[] = React.useMemo(
        () => [
            { value: "", label: "Toutes les activités" },
            { value: ActivityType.CREATION, label: "Création" },
            { value: ActivityType.SALE, label: "Vente" },
            { value: ActivityType.STOCK_CORRECTION, label: "Correction de stock" },
            { value: ActivityType.OTHER, label: "Autre" },
        ],
        []
    );

    // Product options (with "All" option)
    const productOptions: SelectOption[] = React.useMemo(() => {
        const options: SelectOption[] = [{ value: "", label: "Tous les produits" }];
        if (products) {
            products.forEach((product) => {
                if (product.name) {
                    options.push({
                        value: product.id,
                        label: product.name,
                    });
                }
            });
        }
        return options;
    }, [products]);

    // Event handlers with useCallback to prevent unnecessary re-renders
    const handleStartDateChange = React.useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setStartDate(e.target.value || undefined);
        },
        [setStartDate]
    );

    const handleEndDateChange = React.useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setEndDate(e.target.value || undefined);
        },
        [setEndDate]
    );

    const handleTypeChange = React.useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            const value = e.target.value;
            setType(value ? (value as ActivityType) : undefined);
        },
        [setType]
    );

    const handleProductChange = React.useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            const value = e.target.value;
            setProductId((value || undefined) as ProductId | undefined);
        },
        [setProductId]
    );

    const handleReset = React.useCallback(() => {
        resetFilters();
    }, [resetFilters]);

    return (
        <div className={styles.activityFilters}>
            <div className={styles.activityFilters__row}>
                <DateInput
                    id="activity-filter-start-date"
                    label="Date de début"
                    value={startDate}
                    onChange={handleStartDateChange}
                    max={endDate}
                />
                <DateInput
                    id="activity-filter-end-date"
                    label="Date de fin"
                    value={endDate}
                    onChange={handleEndDateChange}
                    min={startDate}
                />
                <Select
                    id="activity-filter-type"
                    label="Type d'activité"
                    options={activityTypeOptions}
                    value={type || ""}
                    onChange={handleTypeChange}
                />
                <Select
                    id="activity-filter-product"
                    label="Produit"
                    options={productOptions}
                    value={productId || ""}
                    onChange={handleProductChange}
                    disabled={isLoadingProducts}
                />
                <div className={styles.activityFilters__actions}>
                    <Button
                        variant="secondary"
                        onClick={handleReset}
                        ariaLabel="Réinitialiser tous les filtres"
                    >
                        Réinitialiser les filtres
                    </Button>
                </div>
            </div>
        </div>
    );
};

const ActivityFilters = React.memo(ActivityFiltersComponent);
export default ActivityFilters;

