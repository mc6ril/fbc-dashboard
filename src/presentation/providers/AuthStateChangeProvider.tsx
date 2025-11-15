/**
 * Auth State Change Provider
 *
 * Provides global authentication state change listener for the application.
 * This provider subscribes to authentication state changes (sign-in, sign-out,
 * token refresh, user updates) and automatically synchronizes state across all
 * pages and browser tabs/windows.
 *
 * The provider uses the `useAuthStateChange` hook to:
 * - Listen to real-time authentication state changes from Supabase
 * - Update Zustand store (useAuthStore) when state changes occur
 * - Invalidate React Query cache on sign-in/sign-out events
 * - Enable cross-tab synchronization of authentication state
 *
 * This provider must be placed inside the ReactQueryProvider in the app layout
 * to ensure React Query is available for cache invalidation.
 *
 * The provider wraps children without affecting layout, as it only manages
 * side effects and doesn't render any UI elements.
 */

"use client";

import type { ReactNode } from "react";
import { useAuthStateChange } from "../hooks/useAuthStateChange";

type Props = {
    children: ReactNode;
};

/**
 * Auth State Change Provider component.
 *
 * Subscribes to authentication state changes and automatically updates the
 * Zustand store and React Query cache when authentication state changes occur.
 * This enables real-time session synchronization across all browser tabs and windows.
 *
 * The subscription is active for the lifetime of the component (app root level)
 * and is automatically cleaned up when the app unmounts.
 *
 * @param {Props} props - Component props
 * @param {ReactNode} props.children - Child components to wrap with auth state change listener
 * @returns {JSX.Element} Fragment wrapping children (no layout impact)
 *
 * @example
 * ```tsx
 * // In app/layout.tsx:
 * <ReactQueryProvider>
 *   <AuthStateChangeProvider>
 *     {children}
 *   </AuthStateChangeProvider>
 * </ReactQueryProvider>
 * ```
 */
const AuthStateChangeProvider = ({ children }: Props) => {
    // Subscribe to authentication state changes
    // This hook manages subscription, state updates, and cache invalidation
    useAuthStateChange();

    // Return children directly without wrapping in additional elements
    // This ensures no layout impact while still enabling auth state change listener
    return <>{children}</>;
};

export default AuthStateChangeProvider;

