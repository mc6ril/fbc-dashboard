/** Activity filters UI store (Zustand). Manages filter state for activities page. */

import { create } from "zustand";
import type { ActivityType } from "@/core/domain/activity";
import type { ProductId } from "@/core/domain/product";

/** Store state. */
type ActivityFiltersStoreState = {
    /** Start date for date range filter (ISO 8601 format) */
    startDate?: string;
    /** End date for date range filter (ISO 8601 format) */
    endDate?: string;
    /** Activity type filter */
    type?: ActivityType;
    /** Product ID filter */
    productId?: ProductId;
    /** Current page number (1-based) */
    page: number;
    /** Number of activities per page */
    pageSize: number;
};

/** Store actions. */
type ActivityFiltersStoreActions = {
    /** Set start date filter. */
    setStartDate: (startDate: string | undefined) => void;

    /** Set end date filter. */
    setEndDate: (endDate: string | undefined) => void;

    /** Set activity type filter. */
    setType: (type: ActivityType | undefined) => void;

    /** Set product ID filter. */
    setProductId: (productId: ProductId | undefined) => void;

    /** Set current page number. */
    setPage: (page: number) => void;

    /** Set page size. */
    setPageSize: (pageSize: number) => void;

    /** Reset all filters to initial state. */
    resetFilters: () => void;
};

/** Combined store type. */
type ActivityFiltersStore = ActivityFiltersStoreState & ActivityFiltersStoreActions;

/** Initial state. */
const initialState: ActivityFiltersStoreState = {
    startDate: undefined,
    endDate: undefined,
    type: undefined,
    productId: undefined,
    page: 1,
    pageSize: 20,
};

/** Activity filters Zustand store. Manages UI state for activity filtering and pagination. */
export const useActivityFiltersStore = create<ActivityFiltersStore>((set) => ({
    ...initialState,

    setStartDate: (startDate: string | undefined) => {
        set({ startDate, page: 1 }); // Reset to page 1 when filter changes
    },

    setEndDate: (endDate: string | undefined) => {
        set({ endDate, page: 1 }); // Reset to page 1 when filter changes
    },

    setType: (type: ActivityType | undefined) => {
        set({ type, page: 1 }); // Reset to page 1 when filter changes
    },

    setProductId: (productId: ProductId | undefined) => {
        set({ productId, page: 1 }); // Reset to page 1 when filter changes
    },

    setPage: (page: number) => {
        set({ page });
    },

    setPageSize: (pageSize: number) => {
        set({ pageSize, page: 1 }); // Reset to page 1 when page size changes
    },

    resetFilters: () => {
        set(initialState);
    },
}));

