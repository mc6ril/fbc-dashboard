/**
 * Activity Domain Types
 *
 * Pure TypeScript types for activity tracking operations in the FBC Dashboard.
 * These types represent business events and activities that occur in the system,
 * such as product creation, sales, stock corrections, and other business operations.
 *
 * This domain layer contains no external dependencies and follows Clean
 * Architecture principles. All types are used throughout the application
 * layers (usecases, infrastructure, presentation) to maintain type safety
 * and business logic consistency.
 */

import type { ProductId } from "./product";

/**
 * ActivityId is a branded type for activity identifiers.
 *
 * This branded type provides additional type safety by preventing accidental
 * mixing of different ID types (e.g., ActivityId with ProductId).
 * At runtime, ActivityId is still a string (UUID format), but TypeScript
 * enforces type safety at compile time.
 */
export type ActivityId = string & { readonly brand: unique symbol };

/**
 * ActivityType represents the type of business activity or event.
 *
 * This enum classifies different types of activities that can occur in the system:
 * - CREATION: A new product or item was created/added to the system
 * - SALE: A product was sold to a customer
 * - STOCK_CORRECTION: A manual adjustment was made to stock levels (inventory correction)
 * - OTHER: Any other type of business activity that doesn't fit the above categories
 */
export enum ActivityType {
    CREATION = "CREATION",
    SALE = "SALE",
    STOCK_CORRECTION = "STOCK_CORRECTION",
    OTHER = "OTHER",
}

/**
 * Activity represents a business event or activity in the FBC Dashboard system.
 *
 * An activity is a record of a business event that occurred, such as creating a product,
 * making a sale, or correcting inventory. Activities provide an audit trail and enable
 * tracking of business operations over time.
 *
 * Business rules:
 * - productId is REQUIRED for SALE and STOCK_CORRECTION types (these activities must be associated with a product)
 * - productId is OPTIONAL for CREATION and OTHER types (creation may be for new products, other activities may not involve products)
 * - quantity can be positive (stock increase) or negative (stock decrease)
 *   - For SALE activities: quantity is typically negative (stock decreases)
 *   - For CREATION activities: quantity is typically positive (stock increases)
 *   - For STOCK_CORRECTION: quantity can be positive or negative depending on the correction direction
 * - amount represents the monetary value associated with the activity (e.g., sale price, cost)
 * - date is stored as ISO 8601 string for compatibility with Supabase, React Query, and Next.js
 *
 * Date fields are stored as ISO 8601 strings (e.g., "2025-01-27T14:00:00.000Z")
 * to ensure compatibility with Supabase responses, React Query serialization,
 * Zustand state persistence, and Next.js server-side hydration.
 *
 * @property {ActivityId} id - Unique identifier for the activity (UUID format)
 * @property {string} date - ISO 8601 timestamp when the activity occurred
 * @property {ActivityType} type - Type of activity (CREATION, SALE, STOCK_CORRECTION, or OTHER)
 * @property {ProductId} [productId] - Optional unique identifier of the product associated with this activity (UUID format).
 *   Required for SALE and STOCK_CORRECTION types, optional for CREATION and OTHER types.
 * @property {number} quantity - Quantity change associated with the activity.
 *   Positive values indicate stock increases, negative values indicate stock decreases.
 *   For SALE activities, this is typically negative. For CREATION activities, this is typically positive.
 * @property {number} amount - Monetary amount associated with the activity (e.g., sale price, total cost).
 *   Represents the financial value of the activity.
 * @property {string} [note] - Optional note or description providing additional context about the activity.
 *   Can be used for comments, explanations, or additional details about the business event.
 */
export type Activity = {
    id: ActivityId;
    date: string;
    type: ActivityType;
    productId?: ProductId;
    quantity: number;
    amount: number;
    note?: string;
};

