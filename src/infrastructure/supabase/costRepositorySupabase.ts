/**
 * Supabase implementation of `CostRepository` (Infrastructure).
 * Maps Supabase types to domain types and propagates errors.
 */

import { supabaseClient } from "./client";
import type { CostRepository } from "@/core/ports/costRepository";
import type { MonthlyCost, MonthlyCostId } from "@/core/domain/cost";
import type {
    SupabaseMonthlyCostRow,
    SupabaseMonthlyCostPayload,
} from "./types";
import { parseValidNumber } from "@/shared/utils/number";

/**
 * Map Supabase row to domain MonthlyCost.
 *
 * Converts:
 * - snake_case → camelCase (e.g., `shipping_cost` → `shippingCost`)
 * - NUMERIC strings → numbers (e.g., `"100.50"` → `100.50`)
 * - UUID → MonthlyCostId (branded type)
 *
 * Note: `created_at` and `updated_at` fields are ignored as they're not part of the domain model.
 *
 * @param {SupabaseMonthlyCostRow} row - Supabase row from database
 * @returns {MonthlyCost} Domain monthly cost object
 * @throws {Error} If required fields are missing or invalid
 */
const mapSupabaseRowToMonthlyCost = (
    row: SupabaseMonthlyCostRow
): MonthlyCost => {
    if (!row.id) {
        throw new Error("Monthly cost ID is required");
    }

    if (!row.month) {
        throw new Error("Monthly cost month is required");
    }

    if (row.shipping_cost === undefined || row.shipping_cost === null) {
        throw new Error("Monthly cost shipping_cost is required");
    }

    if (row.marketing_cost === undefined || row.marketing_cost === null) {
        throw new Error("Monthly cost marketing_cost is required");
    }

    if (row.overhead_cost === undefined || row.overhead_cost === null) {
        throw new Error("Monthly cost overhead_cost is required");
    }

    // Convert NUMERIC strings to numbers
    const shippingCost = parseValidNumber(row.shipping_cost, "shipping_cost");
    const marketingCost = parseValidNumber(row.marketing_cost, "marketing_cost");
    const overheadCost = parseValidNumber(row.overhead_cost, "overhead_cost");

    return {
        id: row.id as MonthlyCostId,
        month: row.month,
        shippingCost,
        marketingCost,
        overheadCost,
    };
};

/**
 * Map domain MonthlyCost to Supabase insert/update payload.
 *
 * Converts:
 * - camelCase → snake_case (e.g., `shippingCost` → `shipping_cost`)
 * - numbers → NUMERIC (Supabase handles conversion)
 *
 * @param {MonthlyCost} cost - Domain monthly cost object
 * @returns {SupabaseMonthlyCostPayload} Supabase payload object
 */
const mapMonthlyCostToSupabaseRow = (
    cost: MonthlyCost
): SupabaseMonthlyCostPayload => {
    return {
        month: cost.month,
        shipping_cost: cost.shippingCost,
        marketing_cost: cost.marketingCost,
        overhead_cost: cost.overheadCost,
    };
};

/**
 * Supabase implementation of CostRepository.
 *
 * Provides data access operations for monthly costs using Supabase.
 * All methods map between Supabase types (snake_case) and domain types (camelCase).
 */
export const costRepositorySupabase: CostRepository = {
    /**
     * Get monthly cost for a specific month.
     *
     * Queries the monthly_costs table by month (YYYY-MM format).
     * Returns null if no cost record exists for that month.
     */
    async getMonthlyCost(month: string): Promise<MonthlyCost | null> {
        const { data, error } = await supabaseClient
            .from("monthly_costs")
            .select("*")
            .eq("month", month)
            .single();

        if (error) {
            // If no rows found, return null (not an error)
            if (error.code === "PGRST116") {
                return null;
            }

            // For other errors, throw
            throw new Error(
                `Failed to get monthly cost for month ${month}: ${error.message}`
            );
        }

        if (!data) {
            return null;
        }

        return mapSupabaseRowToMonthlyCost(data as SupabaseMonthlyCostRow);
    },

    /**
     * Create or update monthly cost for a specific month.
     *
     * Performs an upsert operation using Supabase's upsert method with
     * conflict resolution on the `month` column (UNIQUE constraint).
     *
     * If a record exists for the month, it's updated with the new values.
     * If no record exists, a new one is created.
     *
     * The upsert is atomic at the database level, preventing race conditions.
     */
    async createOrUpdateMonthlyCost(
        cost: MonthlyCost
    ): Promise<MonthlyCost> {
        const payload = mapMonthlyCostToSupabaseRow(cost);

        // Use upsert with conflict resolution on 'month' column
        // This performs INSERT ... ON CONFLICT (month) DO UPDATE
        // Note: upsert expects an array, so we wrap the payload
        const { data, error } = await supabaseClient
            .from("monthly_costs")
            .upsert([payload], {
                onConflict: "month",
            })
            .select()
            .single();

        if (error) {
            throw new Error(
                `Failed to create or update monthly cost for month ${cost.month}: ${error.message}`
            );
        }

        if (!data) {
            throw new Error(
                `Unexpected error: upsert succeeded but no data returned for month ${cost.month}`
            );
        }

        // Map the returned row to domain type
        // Note: The returned row may have a different ID if it was an update
        // We use the returned ID to ensure consistency
        const mappedCost = mapSupabaseRowToMonthlyCost(
            data as SupabaseMonthlyCostRow
        );

        return mappedCost;
    },

    /**
     * Atomically update a specific cost field for a monthly cost record.
     *
     * Uses a PostgreSQL RPC function to perform an atomic database-level update
     * of a single field, preventing lost updates when multiple users modify
     * different cost fields concurrently for the same month.
     */
    async updateMonthlyCostField(
        month: string,
        fieldName: "shipping" | "marketing" | "overhead",
        value: number
    ): Promise<MonthlyCost> {
        // Call PostgreSQL function to atomically update the field
        const { data, error } = await supabaseClient.rpc("update_monthly_cost_field", {
            p_month: month,
            p_field_name: fieldName,
            p_value: value,
        });

        if (error) {
            throw new Error(
                `Failed to update monthly cost field ${fieldName} for month ${month}: ${error.message}`
            );
        }

        if (!data || !Array.isArray(data) || data.length === 0) {
            throw new Error(
                `Unexpected error: update succeeded but no data returned for month ${month}`
            );
        }

        // The RPC function returns a table (array of rows), but we expect a single row
        const row = data[0] as SupabaseMonthlyCostRow;

        // Map the returned row to domain type
        return mapSupabaseRowToMonthlyCost(row);
    },
};

