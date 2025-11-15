/**
 * Authentication Zustand Store
 *
 * UI state management for authentication in the FBC Dashboard.
 * This store manages client-side authentication state (session, user, loading)
 * for React components.
 *
 * Following Clean Architecture and Zustand best practices:
 * - Stores only UI state (session, user, loading states)
 * - Contains no business logic (no Supabase calls, no usecase calls)
 * - Uses domain types from core/domain/auth.ts
 * - Actions are pure state updates only
 * - State is updated by React Query hooks after usecase calls
 *
 * This store should NOT be used to:
 * - Call authentication usecases directly
 * - Perform authentication operations
 * - Store business logic or validation
 *
 * Use React Query hooks (useAuth.ts) to perform authentication operations,
 * which will then update this store via setSession, setUser, etc.
 */

import { create } from "zustand";
import type { User, Session } from "../../core/domain/auth";

/**
 * Authentication store state interface.
 *
 * Contains all UI state related to authentication:
 * - session: Current active session or null if not authenticated
 * - user: Current authenticated user or null if not authenticated
 * - isLoading: Loading state for authentication operations
 *
 * @interface AuthStoreState
 */
type AuthStoreState = {
    /** Current active authentication session or null if no session exists */
    session: Session | null;
    /** Current authenticated user or null if no user is authenticated */
    user: User | null;
    /** Loading state for authentication operations */
    isLoading: boolean;
};

/**
 * Authentication store actions interface.
 *
 * Actions for updating the authentication store state:
 * - setSession: Update the current session
 * - setUser: Update the current user
 * - setLoading: Update the loading state
 * - clearAuth: Clear all authentication state (sign out)
 *
 * @interface AuthStoreActions
 */
type AuthStoreActions = {
    /**
     * Updates the current authentication session.
     *
     * @param {Session | null} session - New session or null to clear session
     */
    setSession: (session: Session | null) => void;

    /**
     * Updates the current authenticated user.
     *
     * @param {User | null} user - New user or null to clear user
     */
    setUser: (user: User | null) => void;

    /**
     * Updates the loading state for authentication operations.
     *
     * @param {boolean} isLoading - New loading state
     */
    setLoading: (isLoading: boolean) => void;

    /**
     * Clears all authentication state.
     *
     * Sets session, user, and loading to their initial values.
     * Used when signing out or when authentication state needs to be reset.
     */
    clearAuth: () => void;
};

/**
 * Combined authentication store type.
 *
 * Combines state and actions into a single store interface.
 */
type AuthStore = AuthStoreState & AuthStoreActions;

/**
 * Initial state for the authentication store.
 *
 * All values start as null/false, indicating no authenticated user.
 */
const initialState: AuthStoreState = {
    session: null,
    user: null,
    isLoading: false,
};

/**
 * Authentication Zustand store.
 *
 * Global UI state store for authentication. Provides session, user, and loading
 * state to React components throughout the application.
 *
 * This store should be updated by React Query hooks after usecase operations:
 *
 * @example
 * ```typescript
 * // In a React Query hook (useAuth.ts):
 * const { data } = useMutation({
 *   mutationFn: () => signInUser(authRepositorySupabase, credentials),
 *   onSuccess: (data) => {
 *     useAuthStore.getState().setSession(data.session);
 *     useAuthStore.getState().setUser(data.user);
 *   }
 * });
 *
 * // In a component:
 * const { session, user, isLoading } = useAuthStore();
 * ```
 *
 * @example
 * ```typescript
 * // Clear auth state on sign out:
 * useAuthStore.getState().clearAuth();
 * ```
 */
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

