/**
 * Product utility functions
 *
 * Shared utility functions for product-related operations.
 * These functions are pure and have no dependencies on external libraries.
 */

import type { Product } from "@/core/domain/product";
import { ProductType } from "@/core/domain/product";

/**
 * Formats a product type to a human-readable label.
 *
 * @param {ProductType} type - Product type
 * @returns {string} Human-readable label
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
 * Formats a product display name from product name and coloris.
 *
 * Creates a consistent display label for products in charts, tables, and other UI components.
 * Handles both old structure (name, coloris as direct fields) and new structure
 * (modelId, colorisId with joined name, coloris) during migration period.
 *
 * Format: "Model Name - Coloris" if coloris exists, otherwise just "Model Name".
 * Returns "Unknown Product" if product is undefined.
 *
 * @param {Product | undefined} product - Product object (may be undefined)
 * @returns {string} Formatted product display name (e.g., "Charlie - Rose Marsala" or "Charlie")
 *
 * @example
 * ```typescript
 * const product: Product = { id: "...", name: "Charlie", coloris: "Rose Marsala", ... };
 * getProductDisplayName(product);
 * // Returns: "Charlie - Rose Marsala"
 *
 * const productWithoutColoris: Product = { id: "...", name: "Charlie", ... };
 * getProductDisplayName(productWithoutColoris);
 * // Returns: "Charlie"
 *
 * getProductDisplayName(undefined);
 * // Returns: "Unknown Product"
 * ```
 */
export const getProductDisplayName = (product: Product | undefined): string => {
    if (!product) {
        return "Unknown Product";
    }

    // During migration period, name and coloris are populated from joins
    // After migration, we'll use modelId/colorisId with explicit lookups
    const modelName = product.name || "Unknown Model";
    const coloris = product.coloris || "";

    if (coloris) {
        return `${modelName} - ${coloris}`;
    }

    return modelName;
};

