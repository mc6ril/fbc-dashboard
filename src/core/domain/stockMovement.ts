/**
 * StockMovement Domain Types
 *
 * Pure TypeScript types for stock movement tracking operations in the FBC Dashboard.
 * These types represent changes to product inventory levels, tracking the source
 * and direction of stock movements for inventory management and audit trails.
 *
 * This domain layer contains no external dependencies and follows Clean
 * Architecture principles. All types are used throughout the application
 * layers (usecases, infrastructure, presentation) to maintain type safety
 * and business logic consistency.
 */

import type { ProductId } from "./product";

/**
 * StockMovementId is a branded type for stock movement identifiers.
 *
 * This branded type provides additional type safety by preventing accidental
 * mixing of different ID types (e.g., StockMovementId with ProductId).
 * At runtime, StockMovementId is still a string (UUID format), but TypeScript
 * enforces type safety at compile time.
 */
export type StockMovementId = string & { readonly brand: unique symbol };

/**
 * StockMovementSource represents the source or reason for a stock movement.
 *
 * This enum classifies different sources that can cause stock level changes:
 * - CREATION: Stock was added through product creation or initial inventory entry
 * - SALE: Stock was reduced due to a product sale
 * - INVENTORY_ADJUSTMENT: Stock was manually adjusted (correction, damage, loss, etc.)
 *
 * The source helps track why stock levels changed and enables proper audit trails
 * and inventory management reporting.
 */
export enum StockMovementSource {
    CREATION = "CREATION",
    SALE = "SALE",
    INVENTORY_ADJUSTMENT = "INVENTORY_ADJUSTMENT",
}

/**
 * StockMovement represents a change to a product's stock level.
 *
 * A stock movement records a change in inventory quantity for a specific product,
 * along with the source that caused the change. This enables tracking of all
 * inventory changes and provides an audit trail for inventory management.
 *
 * Business rules:
 * - productId is REQUIRED (all stock movements must be associated with a product)
 * - quantity sign meaning depends on the source:
 *   - For CREATION source: quantity is typically POSITIVE (stock increases)
 *   - For SALE source: quantity is typically NEGATIVE (stock decreases)
 *   - For INVENTORY_ADJUSTMENT source: quantity can be POSITIVE or NEGATIVE
 *     depending on whether the adjustment increases or decreases stock
 * - The absolute value of quantity represents the number of units affected
 *
 * Relationship to Activity:
 * StockMovement and Activity are related but serve different purposes:
 * - Activity represents business events with broader context (date, amount, note)
 * - StockMovement focuses specifically on inventory changes with source tracking
 * - A single Activity (e.g., SALE) may generate a corresponding StockMovement
 * - StockMovements can be created independently for inventory adjustments
 *
 * @property {StockMovementId} id - Unique identifier for the stock movement (UUID format)
 * @property {ProductId} productId - Unique identifier of the product whose stock changed (UUID format).
 *   Required for all stock movements as they must be associated with a product.
 * @property {number} quantity - Quantity change for the stock movement.
 *   The sign indicates direction: positive for increases, negative for decreases.
 *   For CREATION source: typically positive (stock added).
 *   For SALE source: typically negative (stock removed).
 *   For INVENTORY_ADJUSTMENT source: can be positive (increase) or negative (decrease).
 * @property {StockMovementSource} source - Source or reason for the stock movement.
 *   Indicates what caused the stock level change (CREATION, SALE, or INVENTORY_ADJUSTMENT).
 */
export type StockMovement = {
    id: StockMovementId;
    productId: ProductId;
    quantity: number;
    source: StockMovementSource;
};

