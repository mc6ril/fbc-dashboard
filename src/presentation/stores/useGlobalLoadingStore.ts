/** Global loading state store (Zustand). Manages application-wide loading indicators. */

import { create } from "zustand";

/** Store state. */
type GlobalLoadingStoreState = {
    /** Global loading state for application-wide operations */
    isLoading: boolean;
    /** Internal counter for concurrent operations (ref-counting) */
    activeOperationsCount: number;
};

/** Store actions. */
type GlobalLoadingStoreActions = {
    /**
     * Set global loading state directly.
     * 
     * @deprecated Use startLoading/stopLoading for proper ref-counting support.
     * This method bypasses ref-counting and should only be used for special cases
     * (e.g., clearing state on unmount).
     */
    setLoading: (isLoading: boolean) => void;

    /**
     * Increment loading counter and start loading.
     * 
     * Uses ref-counting to handle concurrent operations correctly.
     * The loader will remain visible until all operations complete.
     */
    startLoading: () => void;

    /**
     * Decrement loading counter and stop loading when counter reaches zero.
     * 
     * Uses ref-counting to handle concurrent operations correctly.
     * The loader will only be hidden when all operations complete.
     */
    stopLoading: () => void;
};

/** Combined store type. */
type GlobalLoadingStore = GlobalLoadingStoreState & GlobalLoadingStoreActions;

/** Initial state. */
const initialState: GlobalLoadingStoreState = {
    isLoading: false,
    activeOperationsCount: 0,
};

/** Global loading Zustand store. Used for centralized loading state management. */
export const useGlobalLoadingStore = create<GlobalLoadingStore>((set) => ({
    ...initialState,

    setLoading: (isLoading: boolean) => {
        set({ isLoading, activeOperationsCount: isLoading ? 1 : 0 });
    },

    startLoading: () => {
        set((state) => {
            const newCount = state.activeOperationsCount + 1;
            return {
                activeOperationsCount: newCount,
                isLoading: newCount > 0,
            };
        });
    },

    stopLoading: () => {
        set((state) => {
            const newCount = Math.max(0, state.activeOperationsCount - 1);
            return {
                activeOperationsCount: newCount,
                isLoading: newCount > 0,
            };
        });
    },
}));

