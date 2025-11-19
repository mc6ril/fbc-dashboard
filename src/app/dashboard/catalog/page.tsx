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
import ProductsTable from "@/presentation/components/catalog/ProductsTable/ProductsTable";
import styles from "./page.module.scss";

const CatalogPage = () => {
    // Fetch products using React Query hook
    const { data: products, isLoading, error } = useProducts();

    return (
        <main className={styles.catalog}>
            <div className={styles.catalog__header}>
                <Heading level={1} className={styles.catalog__title}>
                    Catalog
                </Heading>
                <Link
                    href="/dashboard/catalog/new"
                    className={styles.catalog__addButton}
                >
                    <Button variant="primary" ariaLabel="Add new product">
                        Add Product
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

