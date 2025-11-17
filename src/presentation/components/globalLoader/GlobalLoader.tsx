"use client";

import React from "react";
import { useGlobalLoadingStore } from "@/presentation/stores/useGlobalLoadingStore";
import { getAccessibilityId } from "@/shared/a11y/utils";
import styles from "./GlobalLoader.module.scss";

/**
 * GlobalLoader component displays a full-screen loading overlay.
 * 
 * Automatically shows/hides based on global loading state from useGlobalLoadingStore.
 * Used for application-wide loading indicators during async operations (auth mutations, etc.).
 * 
 * Features:
 * - Full-screen overlay with backdrop blur
 * - Animated spinner
 * - Accessible with ARIA attributes
 * - Memoized for performance
 */
const GlobalLoader = () => {
    const isLoading = useGlobalLoadingStore((state) => state.isLoading);

    if (!isLoading) {
        return null;
    }

    const loaderId = getAccessibilityId("status", "global-loader");

    return (
        <div
            id={loaderId}
            className={styles.overlay}
            role="status"
            aria-live="polite"
            aria-busy="true"
            aria-label="Loading"
        >
            <div className={styles.spinner} aria-hidden="true" />
            <span className={styles.text}>Loading...</span>
        </div>
    );
};

export default React.memo(GlobalLoader);

