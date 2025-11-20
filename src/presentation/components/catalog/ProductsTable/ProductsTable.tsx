/**
 * ProductsTable Component
 *
 * Table component for displaying products with proper formatting.
 * Shows name (from model), type, coloris, unitCost, salePrice, stock, and weight (optional) columns.
 * Handles both old structure (name, type, coloris as direct fields) and new structure
 * (modelId, colorisId with joined name, type, coloris) gracefully.
 * Handles loading, error, and empty states.
 */

"use client";

import React from "react";
import type { Product } from "@/core/domain/product";
import { ProductType } from "@/core/domain/product";
import Table, { type TableColumn } from "@/presentation/components/ui/Table";
import Text from "@/presentation/components/ui/Text";
import Link from "@/presentation/components/ui/Link";
import { formatCurrency } from "@/shared/utils/currency";
import { LOADING_MESSAGE, ERROR_MESSAGES } from "@/shared/constants/messages";
import styles from "./ProductsTable.module.scss";

/**
 * Formats a product type to a human-readable label.
 *
 * @param {ProductType} type - Product type
 * @returns {string} Human-readable label
 */
const formatProductType = (type: ProductType): string => {
    switch (type) {
        case ProductType.SAC_BANANE:
            return "Sac banane";
        case ProductType.POCHETTE_ORDINATEUR:
            return "Pochette ordinateur";
        case ProductType.TROUSSE_TOILETTE:
            return "Trousse de toilette";
        case ProductType.POCHETTE_VOLANTS:
            return "Pochette à volants";
        case ProductType.TROUSSE_ZIPPEE:
            return "Trousse zippée";
        case ProductType.ACCESSOIRES_DIVERS:
            return "Accessoires divers";
        default:
            return type;
    }
};

type Props = {
    /** Array of products to display */
    products: Product[];
    /** Whether data is currently loading */
    isLoading: boolean;
    /** Error object if data loading failed */
    error: Error | null;
};

/**
 * Gets the display name for a product.
 * Handles both old structure (name field) and new structure (joined from product_models).
 *
 * @param {Product} product - Product object
 * @returns {string} Display name or fallback text
 */
const getProductName = (product: Product): string => {
    // Prioritize joined name from product_models (new structure)
    // Fall back to deprecated name field (old structure or backward compatibility)
    return product.name || "N/A";
};

/**
 * Gets the display coloris for a product.
 * Handles both old structure (coloris field) and new structure (joined from product_coloris).
 *
 * @param {Product} product - Product object
 * @returns {string} Display coloris or fallback text
 */
const getProductColoris = (product: Product): string => {
    // Prioritize joined coloris from product_coloris (new structure)
    // Fall back to deprecated coloris field (old structure or backward compatibility)
    return product.coloris || "N/A";
};

/**
 * Gets the display type for a product.
 * Handles both old structure (type field) and new structure (joined from product_models).
 *
 * @param {Product} product - Product object
 * @returns {string} Display type or fallback text
 */
const getProductType = (product: Product): string => {
    // Prioritize joined type from product_models (new structure)
    // Fall back to deprecated type field (old structure or backward compatibility)
    if (product.type) {
        return formatProductType(product.type);
    }
    return "N/A";
};

const ProductsTableComponent = ({ products, isLoading, error }: Props) => {
    // Define table columns
    const columns: TableColumn<Product>[] = React.useMemo(
        () => [
            {
                key: "name",
                header: "Name",
                render: (_value: unknown, row: Product) => {
                    return getProductName(row);
                },
            },
            {
                key: "type",
                header: "Type",
                render: (_value: unknown, row: Product) => {
                    return getProductType(row);
                },
            },
            {
                key: "coloris",
                header: "Coloris",
                render: (_value: unknown, row: Product) => {
                    return getProductColoris(row);
                },
            },
            {
                key: "unitCost",
                header: "Unit Cost",
                render: (value: unknown) => {
                    const unitCost = value as number;
                    return formatCurrency(unitCost);
                },
            },
            {
                key: "salePrice",
                header: "Sale Price",
                render: (value: unknown) => {
                    const salePrice = value as number;
                    return formatCurrency(salePrice);
                },
            },
            {
                key: "stock",
                header: "Stock",
                render: (value: unknown) => {
                    const stock = value as number;
                    return stock.toString();
                },
            },
            {
                key: "weight",
                header: "Weight",
                render: (value: unknown) => {
                    const weight = value as number | undefined;
                    if (weight === undefined) {
                        return "-";
                    }
                    return `${weight} g`;
                },
            },
            {
                key: "actions",
                header: "Actions",
                render: (_value: unknown, row: Product) => {
                    const productName = getProductName(row);
                    return (
                        <Link
                            href={`/dashboard/catalog/${row.id}/edit`}
                            ariaLabel={`Edit product ${productName}`}
                            className="button button--secondary button--sm"
                        >
                            Edit
                        </Link>
                    );
                },
            },
        ],
        []
    );

    // Loading state
    if (isLoading) {
        return (
            <div className={styles.productsTable}>
                <Text size="md" muted>
                    {LOADING_MESSAGE}
                </Text>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className={styles.productsTable}>
                <Text size="md" role="alert">
                    {ERROR_MESSAGES.PRODUCTS}
                </Text>
            </div>
        );
    }

    // Empty state
    if (products.length === 0) {
        return (
            <div className={styles.productsTable}>
                <Text size="md" muted>
                    No products available.
                </Text>
            </div>
        );
    }

    // Render table
    return (
        <div className={styles.productsTable}>
            <Table
                columns={columns}
                data={products}
                caption="Products"
                ariaLabel="Products table"
            />
        </div>
    );
};

const ProductsTable = React.memo(ProductsTableComponent);

export default ProductsTable;

