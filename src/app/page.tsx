"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useSignIn, useSignUp, useSignOut, useSession, useUser } from "@/presentation/hooks/useAuth";
import { useAuthStore } from "@/presentation/stores/useAuthStore";
import type { SignInCredentials, SignUpCredentials, AuthEventType } from "@/core/domain/auth";
import styles from "./page.module.scss";

/**
 * Home Page - Authentication Test with Persistent Session
 *
 * Test page for React Query authentication hooks with Supabase.
 * Demonstrates persistent session management with real-time cross-tab synchronization.
 * Allows users to sign up, sign in, and sign out to test the authentication flow.
 *
 * Features:
 * - Persistent session: Session remains active after page refresh
 * - Real-time sync: Authentication state syncs across all browser tabs
 * - Auto-refresh: Tokens are automatically refreshed when they expire
 */
const Home = () => {
    const [email, setEmail] = useState("cyril.lesot@yahoo.fr");
    const [password, setPassword] = useState("Azerty123");
    const [lastAuthEvent, setLastAuthEvent] = useState<{
        type: AuthEventType;
        timestamp: Date;
    } | null>(null);

    // React Query hooks for authentication
    const signIn = useSignIn();
    const signUp = useSignUp();
    const signOut = useSignOut();
    const { data: session, isLoading: sessionLoading, error: sessionError } = useSession();
    const { data: user, isLoading: userLoading, error: userError } = useUser();

    // Zustand store for real-time auth state (synchronized via AuthStateChangeProvider)
    const storeSession = useAuthStore((state) => state.session);
    const storeUser = useAuthStore((state) => state.user);

    // Track previous session state to detect changes (using ref to avoid cascading renders)
    const previousStoreSessionRef = useRef<typeof storeSession>(null);

    // Check if session persists after page load (computed from state, not stored)
    const isPersistent = useMemo(() => {
        return storeSession !== null;
    }, [storeSession]);

    // Listen to auth state changes from Zustand store (real-time sync)
    useEffect(() => {
        // Detect state changes by comparing with previous value
        const previousSession = previousStoreSessionRef.current;
        
        if (storeSession !== previousSession) {
            // Use requestAnimationFrame to defer state update and avoid cascading renders
            requestAnimationFrame(() => {
                if (storeSession && !previousSession) {
                    // Session appeared (sign in or restored from persistence)
                    setLastAuthEvent({
                        type: "SIGNED_IN",
                        timestamp: new Date(),
                    });
                } else if (!storeSession && previousSession) {
                    // Session disappeared (sign out or token expired)
                    setLastAuthEvent({
                        type: "SIGNED_OUT",
                        timestamp: new Date(),
                    });
                }
            });
            
            // Update ref synchronously (no re-render)
            previousStoreSessionRef.current = storeSession;
        }
    }, [storeSession]);

    const handleSignIn = useCallback(async () => {
        if (!email || !password) {
            return;
        }

        const credentials: SignInCredentials = {
            email,
            password,
        };

        try {
            await signIn.mutateAsync(credentials);
        } catch {
            // Error is handled by React Query and displayed below
        }
    }, [email, password, signIn]);

    const handleSignUp = useCallback(async () => {
        if (!email || !password) {
            return;
        }

        const credentials: SignUpCredentials = {
            email,
            password,
        };

        try {
            await signUp.mutateAsync(credentials);
        } catch {
            // Error is handled by React Query and displayed below
        }
    }, [email, password, signUp]);

    const handleSignOut = useCallback(async () => {
        try {
            await signOut.mutateAsync();
        } catch {
            // Error is handled by React Query and displayed below
        }
    }, [signOut]);

    const isLoading = useMemo(
        () => sessionLoading || userLoading || signIn.isPending || signUp.isPending || signOut.isPending,
        [sessionLoading, userLoading, signIn.isPending, signUp.isPending, signOut.isPending]
    );

    // Use store session/user for real-time display (synced across tabs)
    const activeSession = storeSession || session;
    const activeUser = storeUser || user;

    return (
        <div className={styles.container}>
            <main className={styles.main}>
                <h1 className={styles.title}>Authentication Test - Persistent Session</h1>
                <p className={styles.description}>
                    Test React Query authentication hooks with Supabase. Session persists across
                    page refreshes and syncs in real-time across all browser tabs.
                </p>

                {/* Session Persistence Indicator */}
                {activeSession && (
                    <div className={styles.persistentIndicator} role="status" aria-live="polite">
                        <div className={styles.indicatorIcon}>🔄</div>
                        <div className={styles.indicatorContent}>
                            <strong className={styles.indicatorTitle}>Persistent Session Active</strong>
                            <p className={styles.indicatorMessage}>
                                Your session is active and will persist across page refreshes.
                                Changes in other browser tabs will sync automatically.
                            </p>
                        </div>
                    </div>
                )}

                {/* Real-time Sync Indicator */}
                {lastAuthEvent && (
                    <div className={styles.syncIndicator} role="status" aria-live="polite">
                        <div className={styles.syncIcon}>
                            {lastAuthEvent.type === "SIGNED_IN" ? "✅" : "👋"}
                        </div>
                        <div className={styles.syncContent}>
                            <strong className={styles.syncTitle}>
                                {lastAuthEvent.type === "SIGNED_IN"
                                    ? "Signed In"
                                    : lastAuthEvent.type === "SIGNED_OUT"
                                    ? "Signed Out"
                                    : "Auth State Changed"}
                            </strong>
                            <p className={styles.syncMessage}>
                                {lastAuthEvent.type === "SIGNED_IN"
                                    ? "Authentication state updated. Session is now active and synchronized."
                                    : "You have been signed out. Session cleared."}
                            </p>
                            <p className={styles.syncTime}>
                                {lastAuthEvent.timestamp.toLocaleTimeString()}
                            </p>
                        </div>
                    </div>
                )}

                {/* Form */}
                <div className={styles.formContainer}>
                    <div className={styles.formGroup}>
                        <label htmlFor="email" className={styles.label}>
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={styles.input}
                            placeholder="cyril.lesot@yahoo.fr"
                            required
                            aria-required="true"
                            aria-invalid={signIn.error || signUp.error ? "true" : "false"}
                            disabled={isLoading}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="password" className={styles.label}>
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={styles.input}
                            placeholder="Azerty123"
                            required
                            aria-required="true"
                            aria-invalid={signIn.error || signUp.error ? "true" : "false"}
                            disabled={isLoading}
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className={styles.buttonsContainer}>
                    <button
                        onClick={handleSignUp}
                        className={`${styles.button} ${styles.buttonPrimary}`}
                        disabled={isLoading || !email || !password}
                    >
                        {signUp.isPending ? "Signing Up..." : "Sign Up"}
                    </button>
                    <button
                        onClick={handleSignIn}
                        className={`${styles.button} ${styles.buttonPrimary}`}
                        disabled={isLoading || !email || !password}
                    >
                        {signIn.isPending ? "Signing In..." : "Sign In"}
                    </button>
                    <button
                        onClick={handleSignOut}
                        className={`${styles.button} ${styles.buttonSecondary}`}
                        disabled={isLoading || !activeSession}
                    >
                        {signOut.isPending ? "Signing Out..." : "Sign Out"}
                    </button>
                </div>

                {/* Cross-Tab Sync Instructions */}
                {activeSession && (
                    <div className={styles.syncInstructions}>
                        <h3 className={styles.instructionsTitle}>Test Cross-Tab Synchronization</h3>
                        <ol className={styles.instructionsList}>
                            <li>Open this page in a new browser tab</li>
                            <li>
                                Sign in or sign out in one tab - the other tab will automatically
                                update
                            </li>
                            <li>Refresh the page - your session will persist</li>
                            <li>Wait for token expiration - it will auto-refresh</li>
                        </ol>
                    </div>
                )}

                {/* Error Messages */}
                {(sessionError || userError || signIn.error || signUp.error || signOut.error) && (
                    <div className={styles.errorContainer}>
                        {signIn.error && (
                            <div className={styles.error} role="alert" aria-live="assertive">
                                <div className={styles.errorIcon} aria-hidden="true">⚠️</div>
                                <div className={styles.errorContent}>
                                    <strong className={styles.errorTitle}>Sign In Error</strong>
                                    <p className={styles.errorMessage}>
                                        {signIn.error?.message || "Unknown error"}
                                    </p>
                                </div>
                            </div>
                        )}
                        {signUp.error && (
                            <div className={styles.error} role="alert" aria-live="assertive">
                                <div className={styles.errorIcon} aria-hidden="true">⚠️</div>
                                <div className={styles.errorContent}>
                                    <strong className={styles.errorTitle}>Sign Up Error</strong>
                                    <p className={styles.errorMessage}>
                                        {signUp.error?.message || "Unknown error"}
                                    </p>
                                </div>
                            </div>
                        )}
                        {signOut.error && (
                            <div className={styles.error} role="alert" aria-live="assertive">
                                <div className={styles.errorIcon} aria-hidden="true">⚠️</div>
                                <div className={styles.errorContent}>
                                    <strong className={styles.errorTitle}>Sign Out Error</strong>
                                    <p className={styles.errorMessage}>
                                        {signOut.error?.message || "Unknown error"}
                                    </p>
                                </div>
                            </div>
                        )}
                        {sessionError && (
                            <div className={styles.error} role="alert" aria-live="assertive">
                                <div className={styles.errorIcon} aria-hidden="true">⚠️</div>
                                <div className={styles.errorContent}>
                                    <strong className={styles.errorTitle}>Session Error</strong>
                                    <p className={styles.errorMessage}>
                                        {sessionError?.message || "Unknown error"}
                                    </p>
                                </div>
                            </div>
                        )}
                        {userError && (
                            <div className={styles.error} role="alert" aria-live="assertive">
                                <div className={styles.errorIcon} aria-hidden="true">⚠️</div>
                                <div className={styles.errorContent}>
                                    <strong className={styles.errorTitle}>User Error</strong>
                                    <p className={styles.errorMessage}>
                                        {userError?.message || "Unknown error"}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Information Box */}
                {(activeSession || activeUser || isLoading) && (
                    <div className={styles.infoBox}>
                        <h2 className={styles.infoTitle}>Session Information</h2>
                        {isLoading && (
                            <p className={styles.loading} role="status" aria-live="polite">
                                Loading...
                            </p>
                        )}
                        {activeSession && (
                            <div className={styles.infoSection}>
                                <h3 className={styles.infoSubtitle}>
                                    Session{" "}
                                    <span className={styles.statusBadge} title="Real-time sync active">
                                        🔄 Live
                                    </span>
                                </h3>
                                <div className={styles.infoContent}>
                                    <p>
                                        <strong>Access Token:</strong>{" "}
                                        <span className={styles.token}>
                                            {activeSession.accessToken.substring(0, 30)}...
                                        </span>
                                    </p>
                                    <p>
                                        <strong>Expires At:</strong>{" "}
                                        {new Date(activeSession.expiresAt).toLocaleString()}
                                    </p>
                                    <p>
                                        <strong>Status:</strong>{" "}
                                        <span className={styles.status}>
                                            {isPersistent ? "Persistent" : "Active"}
                                        </span>
                                    </p>
                                    <p className={styles.syncNote}>
                                        💡 Session is synchronized across all browser tabs in real-time.
                                    </p>
                                </div>
                            </div>
                        )}
                        {activeUser && (
                            <div className={styles.infoSection}>
                                <h3 className={styles.infoSubtitle}>
                                    User{" "}
                                    <span className={styles.statusBadge} title="Real-time sync active">
                                        🔄 Live
                                    </span>
                                </h3>
                                <div className={styles.infoContent}>
                                    <p>
                                        <strong>ID:</strong>{" "}
                                        <span className={styles.id}>{activeUser.id}</span>
                                    </p>
                                    <p>
                                        <strong>Email:</strong> {activeUser.email}
                                    </p>
                                    <p>
                                        <strong>Created At:</strong>{" "}
                                        {new Date(activeUser.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Home;
