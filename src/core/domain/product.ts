/**
 * Product Domain Types
 *
 * Pure TypeScript types for product operations in the FBC Dashboard.
 * These types represent the core business entities for product catalog
 * management, inventory tracking, and pricing.
 *
 * This domain layer contains no external dependencies and follows Clean
 * Architecture principles. All types are used throughout the application
 * layers (usecases, infrastructure, presentation) to maintain type safety
 * and business logic consistency.
 */

/**
 * ProductId is a branded type for product identifiers.
 *
 * This branded type provides additional type safety by preventing accidental
 * mixing of different ID types (e.g., ProductId with ActivityId).
 * At runtime, ProductId is still a string (UUID format), but TypeScript
 * enforces type safety at compile time.
 */
export type ProductId = string & { readonly brand: unique symbol };

/**
 * ProductType represents the type or category of a product in the Atelier F.B.C catalog.
 *
 * This enum classifies all product types available in the system:
 * - SAC_BANANE: Sac banane (taille unique, avec réglage)
 * - POCHETTE_ORDINATEUR: Pochette ordinateur 13' / 14''
 * - TROUSSE_TOILETTE: Trousse de toilette carrée
 * - POCHETTE_VOLANTS: Pochette à volants
 * - TROUSSE_ZIPPEE: Trousse zippée classique
 * - ACCESSOIRES_DIVERS: Accessoires divers (scrunchies, petite maroquinerie textile…)
 */
export enum ProductType {
    SAC_BANANE = "SAC_BANANE",
    POCHETTE_ORDINATEUR = "POCHETTE_ORDINATEUR",
    TROUSSE_TOILETTE = "TROUSSE_TOILETTE",
    POCHETTE_VOLANTS = "POCHETTE_VOLANTS",
    TROUSSE_ZIPPEE = "TROUSSE_ZIPPEE",
    ACCESSOIRES_DIVERS = "ACCESSOIRES_DIVERS",
}

/**
 * Product represents an item in the product catalog.
 *
 * A product is a core business entity that represents an item available
 * for sale or tracking in the inventory system. Each product has pricing
 * information (unit cost and sale price) and stock level tracking.
 *
 * Products can have multiple color variations (coloris) for the same model
 * and type. For example, a "Pochette à volants" (type) with model "Charlie"
 * can exist in multiple coloris such as "Rose pâle à motifs" and "Rose marsala".
 *
 * Business rules:
 * - unitCost must be positive (greater than 0)
 * - salePrice must be positive (greater than 0)
 * - stock must be non-negative (greater than or equal to 0)
 * - The type field must be a valid ProductType enum value
 * - coloris must be a non-empty string (represents color variation of the product)
 * - weight must be positive (greater than 0) if provided (optional field)
 *
 * @property {ProductId} id - Unique identifier for the product (UUID format)
 * @property {string} name - Product name or description (e.g., "Sac banane L'Assumée", "Pochette ordinateur L'Espiegle")
 * @property {ProductType} type - Product type classification from the ProductType enum
 * @property {string} coloris - Color variation of the product (e.g., "Rose pâle à motifs", "Rose marsala", "Prune", "Rouge", "Pêche", "Rose")
 * @property {number} unitCost - Cost per unit for the product (must be positive, represents purchase/manufacturing cost)
 * @property {number} salePrice - Selling price per unit (must be positive, represents the price at which the product is sold)
 * @property {number} stock - Current stock level (must be non-negative, represents available quantity in inventory)
 * @property {number} [weight] - Optional weight of the product in grams. Used for shipping cost calculations, logistics management, and providing weight information to customers. Examples from real business data: Sac banane typically weighs ~150-200 grams, Pochette ordinateur ~300-400 grams. This field is optional to allow products without weight initially.
 */
export type Product = {
    id: ProductId;
    name: string;
    type: ProductType;
    coloris: string;
    unitCost: number;
    salePrice: number;
    stock: number;
    weight?: number;
};

