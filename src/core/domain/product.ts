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
 * ProductModelId is a branded type for product model identifiers.
 *
 * This branded type provides additional type safety by preventing accidental
 * mixing of different ID types (e.g., ProductModelId with ProductId).
 * At runtime, ProductModelId is still a string (UUID format), but TypeScript
 * enforces type safety at compile time.
 */
export type ProductModelId = string & { readonly brand: unique symbol };

/**
 * ProductColorisId is a branded type for product coloris identifiers.
 *
 * This branded type provides additional type safety by preventing accidental
 * mixing of different ID types (e.g., ProductColorisId with ProductId).
 * At runtime, ProductColorisId is still a string (UUID format), but TypeScript
 * enforces type safety at compile time.
 */
export type ProductColorisId = string & { readonly brand: unique symbol };

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
 * ProductModel represents a product model in the Atelier F.B.C catalog.
 *
 * A product model is a reference entity that defines a specific product design
 * within a product type. For example, "Charlie" is a model of type "POCHETTE_VOLANTS",
 * and "Assumée" is a model of type "SAC_BANANE".
 *
 * Each model can have multiple color variations (coloris) associated with it.
 * The combination of (type, name) must be unique within the system.
 *
 * Business rules:
 * - type must be a valid ProductType enum value
 * - name must be a non-empty string (represents the model name, e.g., "Charlie", "Assumée", "Espiègle")
 * - Each (type, name) combination must be unique
 *
 * @property {ProductModelId} id - Unique identifier for the product model (UUID format)
 * @property {ProductType} type - Product type classification from the ProductType enum
 * @property {string} name - Model name (e.g., "Charlie", "Assumée", "Espiègle")
 */
export type ProductModel = {
    id: ProductModelId;
    type: ProductType;
    name: string;
};

/**
 * ProductColoris represents a color variation for a specific product model.
 *
 * A product coloris is a reference entity that defines a specific color variation
 * available for a product model. For example, the "Charlie" model (POCHETTE_VOLANTS)
 * might have coloris such as "Rose Marsala", "Prune", or "Rose pâle à motifs".
 *
 * Each coloris is associated with exactly one product model, and the combination
 * of (model_id, coloris) must be unique within the system.
 *
 * Business rules:
 * - modelId must reference a valid ProductModel
 * - coloris must be a non-empty string (represents the color variation name)
 * - Each (model_id, coloris) combination must be unique
 *
 * @property {ProductColorisId} id - Unique identifier for the product coloris (UUID format)
 * @property {ProductModelId} modelId - Reference to the product model this coloris belongs to
 * @property {string} coloris - Color variation name (e.g., "Rose Marsala", "Prune", "Rose pâle à motifs")
 */
export type ProductColoris = {
    id: ProductColorisId;
    modelId: ProductModelId;
    coloris: string;
};

/**
 * Product represents an item in the product catalog.
 *
 * A product is a core business entity that represents an item available
 * for sale or tracking in the inventory system. Each product has pricing
 * information (unit cost and sale price) and stock level tracking.
 *
 * Products reference a product model and coloris through foreign keys
 * (modelId and colorisId), which enforce data integrity and enable cascading
 * filters in forms. The model and coloris information can be joined from
 * reference tables (product_models and product_coloris) to get the actual
 * name and coloris values.
 *
 * During the migration period (FBC-30), the old fields (name, type, coloris)
 * are kept as optional/deprecated for backward compatibility. After migration
 * is complete, these fields should be removed.
 *
 * Business rules:
 * - unitCost must be positive (greater than 0)
 * - salePrice must be positive (greater than 0)
 * - stock must be non-negative (greater than or equal to 0)
 * - modelId must reference a valid ProductModel (mandatory after migration, optional during migration)
 * - colorisId must reference a valid ProductColoris that belongs to the model (mandatory after migration, optional during migration)
 * - The coloris must belong to the model (enforced by foreign key chain)
 * - weight must be positive (greater than 0) if provided (optional field, in grams)
 *
 * During the migration period (FBC-30), products may have either structure:
 * - Old structure: `name`, `type`, `coloris` (mandatory), `modelId`, `colorisId` (optional)
 * - New structure: `modelId`, `colorisId` (mandatory), `name`, `type`, `coloris` (optional/deprecated)
 *
 * After migration is complete, `modelId` and `colorisId` will become mandatory,
 * and `name`, `type`, `coloris` will be removed.
 *
 * @property {ProductId} id - Unique identifier for the product (UUID format)
 * @property {ProductModelId} [modelId] - Reference to the product model (foreign key to product_models table). Mandatory after migration, optional during migration period.
 * @property {ProductColorisId} [colorisId] - Reference to the product coloris (foreign key to product_coloris table). Mandatory after migration, optional during migration period.
 * @property {number} unitCost - Cost per unit for the product (must be positive, represents purchase/manufacturing cost)
 * @property {number} salePrice - Selling price per unit (must be positive, represents the price at which the product is sold)
 * @property {number} stock - Current stock level (must be non-negative, represents available quantity in inventory)
 * @property {number} [weight] - Optional weight of the product in grams (integer). Used for shipping cost calculations, logistics management, and providing weight information to customers. Examples from real business data: Sac banane typically weighs ~150-200 grams, Pochette ordinateur ~300-400 grams. This field is optional to allow products without weight initially.
 * @property {string} [name] - DEPRECATED: Product name from joined product_models table. Kept for backward compatibility during migration period. Use modelId and join with product_models to get name. Mandatory during migration if modelId is not present.
 * @property {ProductType} [type] - DEPRECATED: Product type from joined product_models table. Kept for backward compatibility during migration period. Use modelId and join with product_models to get type. Mandatory during migration if modelId is not present.
 * @property {string} [coloris] - DEPRECATED: Color variation from joined product_coloris table. Kept for backward compatibility during migration period. Use colorisId and join with product_coloris to get coloris. Mandatory during migration if colorisId is not present.
 */
export type Product = {
    id: ProductId;
    modelId?: ProductModelId;
    colorisId?: ProductColorisId;
    unitCost: number;
    salePrice: number;
    stock: number;
    weight?: number;
    // Deprecated fields for backward compatibility (migration period)
    name?: string;
    type?: ProductType;
    coloris?: string;
};

