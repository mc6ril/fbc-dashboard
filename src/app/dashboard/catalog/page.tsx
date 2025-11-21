/**
 * Catalog Page
 *
 * Main page component for viewing products catalog.
 * Displays a table of products with navigation to create new products.
 */

"use client";

import React from "react";
import Heading from "@/presentation/components/ui/Heading";
import Link from "@/presentation/components/ui/Link";
import Button from "@/presentation/components/ui/Button";
import { useProducts } from "@/presentation/hooks/useProducts";
import { useTranslation } from "@/presentation/hooks/useTranslation";
import ProductsTable from "@/presentation/components/catalog/ProductsTable/ProductsTable";
import styles from "./page.module.scss";

const CatalogPage = () => {
    // Translation hooks
    const tCatalog = useTranslation("pages.catalog");

    // Fetch products using React Query hook
    const { data: products, isLoading, error } = useProducts();

    return (
        <main className={styles.catalog}>
            <div className={styles.catalog__header}>
                <Heading level={1} className={styles.catalog__title}>
                    {tCatalog("title")}
                </Heading>
                <Link
                    href="/dashboard/catalog/new"
                    className={styles.catalog__addButton}
                >
                    <Button variant="primary" ariaLabel={tCatalog("addProduct")}>
                        {tCatalog("addProduct")}
                    </Button>
                </Link>
            </div>

            <ProductsTable
                products={products ?? []}
                isLoading={isLoading}
                error={error}
            />
        </main>
    );
};

export default CatalogPage;

