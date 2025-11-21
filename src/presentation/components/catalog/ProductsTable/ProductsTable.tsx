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
import { useTranslation } from "@/presentation/hooks/useTranslation";
import styles from "./ProductsTable.module.scss";

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
 * @param {string} notAvailable - Translation for "N/A"
 * @returns {string} Display name or fallback text
 */
const getProductName = (product: Product, notAvailable: string): string => {
    // Prioritize joined name from product_models (new structure)
    // Fall back to deprecated name field (old structure or backward compatibility)
    return product.name || notAvailable;
};

/**
 * Gets the display coloris for a product.
 * Handles both old structure (coloris field) and new structure (joined from product_coloris).
 *
 * @param {Product} product - Product object
 * @param {string} notAvailable - Translation for "N/A"
 * @returns {string} Display coloris or fallback text
 */
const getProductColoris = (product: Product, notAvailable: string): string => {
    // Prioritize joined coloris from product_coloris (new structure)
    // Fall back to deprecated coloris field (old structure or backward compatibility)
    return product.coloris || notAvailable;
};

/**
 * Gets the display type for a product.
 * Handles both old structure (type field) and new structure (joined from product_models).
 *
 * @param {Product} product - Product object
 * @param {string} notAvailable - Translation for "N/A"
 * @param {(type: ProductType) => string} formatProductType - Function to format product type
 * @returns {string} Display type or fallback text
 */
const getProductType = (
    product: Product,
    notAvailable: string,
    formatProductType: (type: ProductType) => string
): string => {
    // Prioritize joined type from product_models (new structure)
    // Fall back to deprecated type field (old structure or backward compatibility)
    if (product.type) {
        return formatProductType(product.type);
    }
    return notAvailable;
};

const ProductsTableComponent = ({ products, isLoading, error }: Props) => {
    const tCommon = useTranslation("common");
    const tErrors = useTranslation("errors");
    const tDashboard = useTranslation("dashboard.tables.products");
    const tForms = useTranslation("forms.product.fields.type.options");

    // Format product type using i18n
    const formatProductType = React.useCallback(
        (type: ProductType): string => {
            switch (type) {
                case ProductType.SAC_BANANE:
                    return tForms("SAC_BANANE");
                case ProductType.POCHETTE_ORDINATEUR:
                    return tForms("POCHETTE_ORDINATEUR");
                case ProductType.TROUSSE_TOILETTE:
                    return tForms("TROUSSE_TOILETTE");
                case ProductType.POCHETTE_VOLANTS:
                    return tForms("POCHETTE_VOLANTS");
                case ProductType.TROUSSE_ZIPPEE:
                    return tForms("TROUSSE_ZIPPEE");
                case ProductType.ACCESSOIRES_DIVERS:
                    return tForms("ACCESSOIRES_DIVERS");
                default:
                    return type;
            }
        },
        [tForms]
    );

    // Define table columns
    const columns: TableColumn<Product>[] = React.useMemo(
        () => [
            {
                key: "name",
                header: tDashboard("columns.name"),
                render: (_value: unknown, row: Product) => {
                    return getProductName(row, tDashboard("notAvailable"));
                },
            },
            {
                key: "type",
                header: tDashboard("columns.type"),
                render: (_value: unknown, row: Product) => {
                    return getProductType(row, tDashboard("notAvailable"), formatProductType);
                },
            },
            {
                key: "coloris",
                header: tDashboard("columns.coloris"),
                render: (_value: unknown, row: Product) => {
                    return getProductColoris(row, tDashboard("notAvailable"));
                },
            },
            {
                key: "unitCost",
                header: tDashboard("columns.unitCost"),
                render: (value: unknown) => {
                    const unitCost = value as number;
                    return formatCurrency(unitCost);
                },
            },
            {
                key: "salePrice",
                header: tDashboard("columns.salePrice"),
                render: (value: unknown) => {
                    const salePrice = value as number;
                    return formatCurrency(salePrice);
                },
            },
            {
                key: "stock",
                header: tDashboard("columns.stock"),
                render: (value: unknown) => {
                    const stock = value as number;
                    return stock.toString();
                },
            },
            {
                key: "weight",
                header: tDashboard("columns.weight"),
                render: (value: unknown) => {
                    const weight = value as number | undefined;
                    if (weight === undefined) {
                        return tDashboard("noWeight");
                    }
                    return `${weight} ${tDashboard("weightUnit")}`;
                },
            },
            {
                key: "actions",
                header: tDashboard("columns.actions"),
                render: (_value: unknown, row: Product) => {
                    const productName = getProductName(row, tDashboard("notAvailable"));
                    return (
                        <Link
                            href={`/dashboard/catalog/${row.id}/edit`}
                            ariaLabel={tDashboard("editAria", { name: productName })}
                            className="button button--secondary button--sm"
                        >
                            {tDashboard("edit")}
                        </Link>
                    );
                },
            },
        ],
        [tDashboard, formatProductType]
    );

    // Loading state
    if (isLoading) {
        return (
            <div className={styles.productsTable}>
                <Text size="md" muted>
                    {tCommon("loading")}
                </Text>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className={styles.productsTable}>
                <Text size="md" role="alert">
                    {tErrors("dashboard.products")}
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

