/** Authentication UI store (Zustand). Holds session, user, loading only. */

import { create } from "zustand";
import type { User, Session } from "../../core/domain/auth";

/** Store state. */
type AuthStoreState = {
    /** Current active authentication session or null if no session exists */
    session: Session | null;
    /** Current authenticated user or null if no user is authenticated */
    user: User | null;
    /** Loading state for authentication operations */
    isLoading: boolean;
};

/** Store actions. */
type AuthStoreActions = {
    /** Update session. */
    setSession: (session: Session | null) => void;

    /** Update user. */
    setUser: (user: User | null) => void;

    /** Update loading state. */
    setLoading: (isLoading: boolean) => void;

    /** Reset session, user, and loading. */
    clearAuth: () => void;
};

/** Combined store type. */
type AuthStore = AuthStoreState & AuthStoreActions;

/** Initial state. */
const initialState: AuthStoreState = {
    session: null,
    user: null,
    isLoading: false,
};

/** Authentication Zustand store. Updated by React Query hooks after usecases. */
export const useAuthStore = create<AuthStore>((set) => ({
    ...initialState,

    setSession: (session: Session | null) => {
        set({ session });
    },

    setUser: (user: User | null) => {
        set({ user });
    },

    setLoading: (isLoading: boolean) => {
        set({ isLoading });
    },

    clearAuth: () => {
        set(initialState);
    },
}));

