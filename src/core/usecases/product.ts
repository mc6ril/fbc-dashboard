/**
 * Product Usecases (Usecase layer).
 * Orchestrate validation and repository calls. Return domain types only.
 */

import type { ProductRepository } from "@/core/ports/productRepository";
import type {
    Product,
    ProductId,
    ProductModel,
    ProductModelId,
    ProductColoris,
    ProductColorisId,
} from "@/core/domain/product";
import { ProductType } from "@/core/domain/product";
import { isValidProduct } from "@/core/domain/validation";

/**
 * Lists all products.
 *
 * This usecase retrieves all products from the repository without any filtering.
 * Returns all products in the order returned by the repository.
 *
 * @param {ProductRepository} repo - Product repository for data retrieval
 * @returns {Promise<Product[]>} Promise resolving to an array of all products, or empty array if none exist
 * @throws {Error} If repository retrieval fails (database connection error, query error, etc.)
 *
 * @example
 * ```typescript
 * // List all products
 * const products = await listProducts(productRepository);
 * // Returns: [Product, Product, ...] or []
 * ```
 */
export const listProducts = async (repo: ProductRepository): Promise<Product[]> => {
    return repo.list();
};

/**
 * Lists products with low stock levels.
 *
 * This usecase filters products based on a stock threshold to identify
 * products that need restocking. The threshold represents the minimum
 * acceptable stock level below which a product is considered "low stock".
 *
 * Business rules:
 * - A product is considered low stock if its stock level is strictly less than the threshold
 * - Stock threshold defaults to 5 if not provided
 * - Products with stock equal to or greater than the threshold are excluded
 * - Returns all matching products in the order returned by the repository
 *
 * Performance considerations:
 * - Retrieves all products from the repository and filters in memory
 * - For large product catalogs, consider implementing threshold filtering at repository level
 * - The function is optimized for small to medium datasets (< 10,000 products)
 *
 * @param {ProductRepository} repo - Product repository for data retrieval
 * @param {number} [threshold=5] - Optional stock threshold (default: 5). Products with stock < threshold are returned.
 * @returns {Promise<Product[]>} Promise resolving to an array of products with stock below the threshold, or empty array if none exist
 * @throws {Error} If repository retrieval fails (database connection error, query error, etc.)
 *
 * @example
 * ```typescript
 * // List products with stock below default threshold (5)
 * const lowStockProducts = await listLowStockProducts(productRepository);
 * // Returns: [Product, Product, ...] or []
 *
 * // List products with stock below custom threshold (10)
 * const lowStockProducts = await listLowStockProducts(productRepository, 10);
 * // Returns: [Product, Product, ...] or []
 * ```
 */
export const listLowStockProducts = async (
    repo: ProductRepository,
    threshold: number = 5
): Promise<Product[]> => {
    // Retrieve all products
    const allProducts = await repo.list();

    // Filter products where stock < threshold
    const lowStockProducts = allProducts.filter((product) => product.stock < threshold);

    return lowStockProducts;
};

/**
 * Validates and creates a new product.
 *
 * This usecase validates business rules before delegating to the repository:
 * - Validates product data using domain validation (`isValidProduct`)
 * - Validates that modelId and colorisId are provided (new structure)
 * - Validates that coloris belongs to the model (ensures data integrity)
 * - Ensures all required fields are present
 * - Delegates to repository for persistence
 *
 * During the migration period (FBC-30), supports both new structure (modelId, colorisId)
 * and old structure (name, type, coloris) for backward compatibility.
 *
 * Business rules:
 * - If using new structure (modelId, colorisId), both must be provided
 * - If using new structure, coloris must belong to the specified model
 * - Product must pass domain validation rules
 *
 * @param {ProductRepository} repo - Product repository for data persistence
 * @param {Omit<Product, 'id'>} product - Product data to create (without the id field). Must include either (modelId, colorisId) or (name, type, coloris) during migration period.
 * @returns {Promise<Product>} Promise resolving to the created product with generated ID
 * @throws {Error} If modelId or colorisId is missing when using new structure
 * @throws {Error} If coloris does not belong to the specified model
 * @throws {Error} If validation fails (invalid data, missing required fields, negative prices, negative stock, invalid weight)
 * @throws {Error} If repository creation fails (database error, constraint violation, foreign key violation, etc.)
 *
 * @example
 * ```typescript
 * // New structure (preferred after migration)
 * const newProduct = {
 *   modelId: charlieModelId,
 *   colorisId: roseMarsalaColorisId,
 *   unitCost: 10.5,
 *   salePrice: 19.99,
 *   stock: 100,
 *   weight: 150
 * };
 * const created = await createProduct(productRepository, newProduct);
 *
 * // Old structure (deprecated, for backward compatibility during migration)
 * const oldProduct = {
 *   name: "Sac banane L'Assumée",
 *   type: ProductType.SAC_BANANE,
 *   coloris: "Rose pâle à motifs",
 *   unitCost: 10.5,
 *   salePrice: 19.99,
 *   stock: 100,
 *   weight: 150
 * };
 * const created = await createProduct(productRepository, oldProduct);
 * ```
 */
export const createProduct = async (
    repo: ProductRepository,
    product: Omit<Product, "id">
): Promise<Product> => {
    // Validate new structure (modelId, colorisId) if present
    if (product.modelId || product.colorisId) {
        // Both modelId and colorisId must be provided when using new structure
        if (!product.modelId) {
            throw new Error("modelId is required when using new structure");
        }
        if (!product.colorisId) {
            throw new Error("colorisId is required when using new structure");
        }

        // Validate that coloris belongs to the model
        const coloris = await repo.getColorisById(product.colorisId);
        if (!coloris) {
            throw new Error(
                `Coloris with id ${product.colorisId} not found`
            );
        }

        if (coloris.modelId !== product.modelId) {
            throw new Error(
                `Coloris ${product.colorisId} does not belong to model ${product.modelId}. ` +
                    `Coloris belongs to model ${coloris.modelId}`
            );
        }
    }

    // Create a temporary product with empty ID for validation
    const productWithId: Product = {
        ...product,
        id: "" as ProductId, // Temporary ID for validation
    };

    // Validate product using domain validation
    if (!isValidProduct(productWithId)) {
        throw new Error("Product validation failed");
    }

    // Delegate to repository
    return repo.create(product);
};

/**
 * Validates and updates an existing product.
 *
 * This usecase validates business rules before delegating to the repository:
 * - Retrieves existing product to verify it exists
 * - Merges updates with existing product data
 * - Validates merged product data using domain validation (`isValidProduct`)
 * - Delegates to repository for persistence
 *
 * The function first retrieves the existing product to merge updates with
 * the current state before validation.
 *
 * @param {ProductRepository} repo - Product repository for data persistence
 * @param {ProductId} id - Unique identifier of the product to update
 * @param {Partial<Product>} updates - Partial product object with fields to update
 * @returns {Promise<Product>} Promise resolving to the updated product
 * @throws {Error} If the product with the given ID does not exist
 * @throws {Error} If validation fails (invalid merged data, negative prices, negative stock, invalid weight)
 * @throws {Error} If repository update fails (database error, constraint violation, etc.)
 *
 * @example
 * ```typescript
 * const updates = {
 *   salePrice: 24.99,
 *   stock: 150
 * };
 * const updated = await updateProduct(productRepository, productId, updates);
 * ```
 */
/**
 * Retrieves a single product by its ID.
 *
 * This usecase retrieves a product from the repository and ensures it exists.
 * Throws an error if the product is not found, converting null to a descriptive error.
 *
 * @param {ProductRepository} repo - Product repository for data retrieval
 * @param {ProductId} id - Unique identifier of the product to retrieve
 * @returns {Promise<Product>} Promise resolving to the product if found
 * @throws {Error} If the product with the given ID does not exist
 * @throws {Error} If repository retrieval fails (database connection error, query error, etc.)
 *
 * @example
 * ```typescript
 * const product = await getProductById(productRepository, productId);
 * // Returns: Product
 * // Throws: Error if product not found
 * ```
 */
export const getProductById = async (repo: ProductRepository, id: ProductId): Promise<Product> => {
    const product = await repo.getById(id);
    if (!product) {
        throw new Error(`Product with id ${id} not found`);
    }
    return product;
};

/**
 * Validates and updates an existing product.
 *
 * This usecase validates business rules before delegating to the repository:
 * - Retrieves existing product to verify it exists
 * - Validates model/coloris combinations if either modelId or colorisId is in updates
 * - Merges updates with existing product data
 * - Validates merged product data using domain validation (`isValidProduct`)
 * - Delegates to repository for persistence
 *
 * The function first retrieves the existing product to merge updates with
 * the current state before validation.
 *
 * During the migration period (FBC-30), supports both new structure (modelId, colorisId)
 * and old structure (name, type, coloris) for backward compatibility.
 *
 * Business rules for model/coloris validation:
 * - If only modelId is updated, verify the model exists
 * - If only colorisId is updated, verify it belongs to the product's current model
 * - If both modelId and colorisId are updated, verify coloris belongs to the new model
 * - Product must pass domain validation rules
 *
 * @param {ProductRepository} repo - Product repository for data persistence
 * @param {ProductId} id - Unique identifier of the product to update
 * @param {Partial<Product>} updates - Partial product object with fields to update. May include modelId/colorisId or name/type/coloris during migration period.
 * @returns {Promise<Product>} Promise resolving to the updated product
 * @throws {Error} If the product with the given ID does not exist
 * @throws {Error} If modelId is updated but model does not exist
 * @throws {Error} If colorisId is updated but coloris does not belong to the model (current or new)
 * @throws {Error} If validation fails (invalid merged data, negative prices, negative stock, invalid weight)
 * @throws {Error} If repository update fails (database error, constraint violation, foreign key violation, etc.)
 *
 * @example
 * ```typescript
 * // Update price and stock
 * const updates = {
 *   salePrice: 24.99,
 *   stock: 150
 * };
 * const updated = await updateProduct(productRepository, productId, updates);
 *
 * // Update model and coloris (new structure)
 * const updates = {
 *   modelId: newModelId,
 *   colorisId: newColorisId
 * };
 * const updated = await updateProduct(productRepository, productId, updates);
 *
 * // Update only coloris (must belong to current model)
 * const updates = {
 *   colorisId: newColorisId
 * };
 * const updated = await updateProduct(productRepository, productId, updates);
 * ```
 */
export const updateProduct = async (
    repo: ProductRepository,
    id: ProductId,
    updates: Partial<Product>
): Promise<Product> => {
    // Retrieve existing product to validate updates against current state
    const existingProduct = await repo.getById(id);
    if (!existingProduct) {
        throw new Error(`Product with id ${id} not found`);
    }

    // Validate model/coloris combinations if either is in updates
    if (updates.modelId !== undefined || updates.colorisId !== undefined) {
        // Determine which model to validate against
        const targetModelId = updates.modelId ?? existingProduct.modelId;

        // If modelId is updated, verify the model exists
        if (updates.modelId !== undefined) {
            const model = await repo.getModelById(updates.modelId);
            if (!model) {
                throw new Error(`Model with id ${updates.modelId} not found`);
            }
        }

        // If colorisId is updated, verify it belongs to the target model
        if (updates.colorisId !== undefined) {
            if (!targetModelId) {
                throw new Error(
                    "Cannot update colorisId: product has no modelId. Please set modelId first."
                );
            }

            const coloris = await repo.getColorisById(updates.colorisId);
            if (!coloris) {
                throw new Error(
                    `Coloris with id ${updates.colorisId} not found`
                );
            }

            if (coloris.modelId !== targetModelId) {
                throw new Error(
                    `Coloris ${updates.colorisId} does not belong to model ${targetModelId}. ` +
                        `Coloris belongs to model ${coloris.modelId}`
                );
            }
        }
    }

    // Merge updates with existing product to get the final state
    const mergedProduct: Product = {
        ...existingProduct,
        ...updates,
    };

    // Validate merged product using domain validation
    if (!isValidProduct(mergedProduct)) {
        throw new Error("Product validation failed");
    }

    // Delegate to repository
    return repo.update(id, updates);
};

/**
 * Lists all product models for a specific product type.
 *
 * This usecase retrieves all product models that belong to the specified
 * product type. This is used to populate cascading dropdowns in forms
 * where users first select a product type, then select a model for that type.
 *
 * Business rules:
 * - Returns all models that match the specified product type
 * - Returns an empty array if no models exist for the given type
 * - Models are returned in the order provided by the repository
 *
 * @param {ProductRepository} repo - Product repository for data retrieval
 * @param {ProductType} type - The product type to filter models by
 * @returns {Promise<ProductModel[]>} Promise resolving to an array of product models for the specified type, or empty array if none exist
 * @throws {Error} If repository retrieval fails (database connection error, query error, etc.)
 *
 * @example
 * ```typescript
 * // List models for POCHETTE_VOLANTS type
 * const models = await listProductModelsByType(productRepository, ProductType.POCHETTE_VOLANTS);
 * // Returns: [{ id: "...", type: POCHETTE_VOLANTS, name: "Charlie" }, ...]
 * ```
 */
export const listProductModelsByType = async (
    repo: ProductRepository,
    type: ProductType
): Promise<ProductModel[]> => {
    return repo.listModelsByType(type);
};

/**
 * Lists all coloris (color variations) for a specific product model.
 *
 * This usecase retrieves all product coloris that belong to the specified
 * product model. This is used to populate cascading dropdowns in forms
 * where users first select a product type, then a model, then a coloris
 * for that model.
 *
 * Business rules:
 * - Returns all coloris that belong to the specified model
 * - Returns an empty array if no coloris exist for the given model
 * - Coloris are returned in the order provided by the repository
 *
 * @param {ProductRepository} repo - Product repository for data retrieval
 * @param {ProductModelId} modelId - The unique identifier of the product model to filter coloris by
 * @returns {Promise<ProductColoris[]>} Promise resolving to an array of product coloris for the specified model, or empty array if none exist
 * @throws {Error} If repository retrieval fails (database connection error, query error, etc.)
 *
 * @example
 * ```typescript
 * // List coloris for a specific model
 * const coloris = await listProductColorisByModel(productRepository, charlieModelId);
 * // Returns: [{ id: "...", modelId: charlieModelId, coloris: "Rose Marsala" }, ...]
 * ```
 */
export const listProductColorisByModel = async (
    repo: ProductRepository,
    modelId: ProductModelId
): Promise<ProductColoris[]> => {
    return repo.listColorisByModel(modelId);
};

/**
 * Retrieves a single product model by its ID.
 *
 * This usecase retrieves a product model from the repository and returns it.
 * Returns null if the model does not exist.
 *
 * Business rules:
 * - Returns the model if found, or null if not found
 * - Used for validation and retrieving model details
 *
 * @param {ProductRepository} repo - Product repository for data retrieval
 * @param {ProductModelId} id - The unique identifier of the product model to retrieve
 * @returns {Promise<ProductModel | null>} Promise resolving to the product model if found, or null if not found
 * @throws {Error} If repository retrieval fails (database connection error, query error, etc.)
 *
 * @example
 * ```typescript
 * const model = await getProductModel(productRepository, charlieModelId);
 * if (model) {
 *   console.log(`Model: ${model.name} (${model.type})`);
 * }
 * ```
 */
export const getProductModel = async (
    repo: ProductRepository,
    id: ProductModelId
): Promise<ProductModel | null> => {
    return repo.getModelById(id);
};

/**
 * Retrieves a single product coloris by its ID.
 *
 * This usecase retrieves a product coloris from the repository and returns it.
 * Returns null if the coloris does not exist.
 *
 * Business rules:
 * - Returns the coloris if found, or null if not found
 * - Used for validation and retrieving coloris details (e.g., verifying a coloris belongs to a model)
 *
 * @param {ProductRepository} repo - Product repository for data retrieval
 * @param {ProductColorisId} id - The unique identifier of the product coloris to retrieve
 * @returns {Promise<ProductColoris | null>} Promise resolving to the product coloris if found, or null if not found
 * @throws {Error} If repository retrieval fails (database connection error, query error, etc.)
 *
 * @example
 * ```typescript
 * const coloris = await getProductColoris(productRepository, roseMarsalaColorisId);
 * if (coloris) {
 *   console.log(`Coloris: ${coloris.coloris} (Model: ${coloris.modelId})`);
 * }
 * ```
 */
export const getProductColoris = async (
    repo: ProductRepository,
    id: ProductColorisId
): Promise<ProductColoris | null> => {
    return repo.getColorisById(id);
};

