/** Provides global auth state change listener; no UI impact. */

"use client";

import type { ReactNode } from "react";
import { useAuthStateChange } from "../hooks/useAuthStateChange";

type Props = {
    children: ReactNode;
};

/** Subscribes via `useAuthStateChange` and returns children. */
const AuthStateChangeProvider = ({ children }: Props) => {
    // Subscribe to authentication state changes
    // This hook manages subscription, state updates, and cache invalidation
    useAuthStateChange();

    // Return children directly without wrapping in additional elements
    // This ensures no layout impact while still enabling auth state change listener
    return <>{children}</>;
};

export default AuthStateChangeProvider;

