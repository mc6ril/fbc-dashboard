/**
 * Product utility functions
 *
 * Shared utility functions for product-related operations.
 * These functions are pure and have no dependencies on external libraries.
 */

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

