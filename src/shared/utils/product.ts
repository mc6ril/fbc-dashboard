/**
 * Product Utility Functions
 *
 * Shared utilities for product-related operations used across usecases and presentation.
 */

import type { Product, ProductId } from "@/core/domain/product";
import { ProductType } from "@/core/domain/product";
import { ActivityType } from "@/core/domain/activity";

/**
 * Creates a map of products by their ID for quick lookup.
 *
 * This utility function converts an array of products into a Map for O(1) lookup
 * by product ID. Used in usecases that need to quickly find products by ID
 * when processing activities or computing statistics.
 *
 * @param {Product[]} products - Array of products to convert to a map
 * @returns {Map<ProductId, Product>} Map of productId to Product for quick lookup
 *
 * @example
 * ```typescript
 * const products = [
 *   { id: "product-1" as ProductId, ... },
 *   { id: "product-2" as ProductId, ... },
 * ];
 * const productMap = createProductMap(products);
 * const product = productMap.get("product-1" as ProductId);
 * // Returns: { id: "product-1", ... }
 * ```
 */
export const createProductMap = (
    products: Product[]
): Map<ProductId, Product> => {
    const productMap = new Map<ProductId, Product>();
    for (const product of products) {
        productMap.set(product.id, product);
    }
    return productMap;
};

/**
 * Formats a product type to a human-readable label.
 *
 * This utility function converts a ProductType enum value to a human-readable
 * French label. Used in forms and tables to display product types to users.
 *
 * @param {ProductType} type - Product type enum value
 * @returns {string} Human-readable label in French
 *
 * @example
 * ```typescript
 * formatProductType(ProductType.SAC_BANANE); // Returns: "Sac banane"
 * formatProductType(ProductType.POCHETTE_VOLANTS); // Returns: "Pochette à volants"
 * ```
 */
export const formatProductType = (type: ProductType): string => {
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

/**
 * Formats an activity type to a human-readable label.
 *
 * This utility function converts an ActivityType enum value to a human-readable
 * French label. Used in tables and widgets to display activity types to users.
 *
 * @param {ActivityType} type - Activity type enum value
 * @returns {string} Human-readable label in French
 *
 * @example
 * ```typescript
 * formatActivityType(ActivityType.CREATION); // Returns: "Création"
 * formatActivityType(ActivityType.SALE); // Returns: "Vente"
 * ```
 */
export const formatActivityType = (type: ActivityType): string => {
    switch (type) {
        case ActivityType.CREATION:
            return "Création";
        case ActivityType.SALE:
            return "Vente";
        case ActivityType.STOCK_CORRECTION:
            return "Correction de stock";
        case ActivityType.OTHER:
            return "Autre";
        default:
            return type;
    }
};

/**
 * Gets a display name for a product combining model name and coloris.
 *
 * This utility function generates a human-readable display name for a product
 * by combining the model name and coloris. Handles both old structure (name, coloris fields)
 * and new structure (modelId, colorisId with joined data).
 *
 * Display format:
 * - If both name and coloris are available: "Model Name - Coloris"
 * - If only name is available: "Model Name"
 * - If product is undefined: "Produit inconnu"
 * - Otherwise: "N/A"
 *
 * @param {Product | undefined} product - Product object (may be undefined)
 * @returns {string} Display name combining model and coloris, or fallback text
 *
 * @example
 * ```typescript
 * const product: Product = {
 *   id: "..." as ProductId,
 *   name: "Charlie",
 *   coloris: "Rose Marsala",
 *   ...
 * };
 * getProductDisplayName(product); // Returns: "Charlie - Rose Marsala"
 *
 * getProductDisplayName(undefined); // Returns: "Produit inconnu"
 * ```
 */
export const getProductDisplayName = (product: Product | undefined): string => {
    if (!product) {
        return "Produit inconnu";
    }

    // Handle old structure (name, coloris fields) or new structure (joined data)
    const name = product.name;
    const coloris = product.coloris;

    if (name && coloris) {
        return `${name} - ${coloris}`;
    }

    if (name) {
        return name;
    }

    return "N/A";
};
