/** Global loading state store (Zustand). Manages application-wide loading indicators. */

import { create } from "zustand";

/** Store state. */
type GlobalLoadingStoreState = {
    /** Global loading state for application-wide operations */
    isLoading: boolean;
};

/** Store actions. */
type GlobalLoadingStoreActions = {
    /** Set global loading state. */
    setLoading: (isLoading: boolean) => void;

    /** Start loading (convenience method). */
    startLoading: () => void;

    /** Stop loading (convenience method). */
    stopLoading: () => void;
};

/** Combined store type. */
type GlobalLoadingStore = GlobalLoadingStoreState & GlobalLoadingStoreActions;

/** Initial state. */
const initialState: GlobalLoadingStoreState = {
    isLoading: false,
};

/** Global loading Zustand store. Used for centralized loading state management. */
export const useGlobalLoadingStore = create<GlobalLoadingStore>((set) => ({
    ...initialState,

    setLoading: (isLoading: boolean) => {
        set({ isLoading });
    },

    startLoading: () => {
        set({ isLoading: true });
    },

    stopLoading: () => {
        set({ isLoading: false });
    },
}));

