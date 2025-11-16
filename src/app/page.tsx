"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useSignIn, useSignUp, useSignOut, useSession, useUser } from "@/presentation/hooks/useAuth";
import { useAuthStore } from "@/presentation/stores/useAuthStore";
import type { SignInCredentials, SignUpCredentials, AuthEventType } from "@/core/domain/auth";
import styles from "./page.module.scss";
import Heading from "@/presentation/components/ui/Heading";
import Text from "@/presentation/components/ui/Text";
import Input from "@/presentation/components/ui/Input";
import Button from "@/presentation/components/ui/Button";

/** Demo page for auth flow and persistent session. */
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
        
        let rafId: number | null = null;
        if (storeSession !== previousSession) {
            // Use requestAnimationFrame to defer state update and avoid cascading renders
            rafId = requestAnimationFrame(() => {
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
        return () => {
            if (rafId !== null) {
                cancelAnimationFrame(rafId);
            }
        };
    }, [storeSession]);

    const onEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
    }, []);
    const onPasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
    }, []);

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
                <Heading level={1}>Authentication Test - Persistent Session</Heading>
                <Text>
                    Test React Query authentication hooks with Supabase. Session persists across
                    page refreshes and syncs in real-time across all browser tabs.
                </Text>

                {/* Session Persistence Indicator */}
                {activeSession && (
                    <div className={styles.persistentIndicator} role="status" aria-live="polite">
                        <div className={styles.indicatorIcon}>🔄</div>
                        <div className={styles.indicatorContent}>
                            <strong className={styles.indicatorTitle}>Persistent Session Active</strong>
                            <Text>
                                Your session is active and will persist across page refreshes.
                                Changes in other browser tabs will sync automatically.
                            </Text>
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
                            <Text>
                                {lastAuthEvent.type === "SIGNED_IN"
                                    ? "Authentication state updated. Session is now active and synchronized."
                                    : "You have been signed out. Session cleared."}
                            </Text>
                            <Text>
                                {lastAuthEvent.timestamp.toLocaleTimeString()}
                            </Text>
                        </div>
                    </div>
                )}

                {/* Form */}
                <div className={styles.formContainer}>
                    <div className={styles.formGroup}>
                        <Input
                            id="email"
                            type="email"
                            label="Email"
                            value={email}
                            onChange={onEmailChange}
                            placeholder="cyril.lesot@yahoo.fr"
                            required
                            disabled={isLoading}
                            error={signIn.error || signUp.error ? "Invalid email or sign-in error" : undefined}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <Input
                            id="password"
                            type="password"
                            label="Password"
                            value={password}
                            onChange={onPasswordChange}
                            placeholder="Azerty123"
                            required
                            disabled={isLoading}
                            error={signIn.error || signUp.error ? "Invalid password or sign-up error" : undefined}
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className={styles.buttonsContainer}>
                    <Button
                        onClick={handleSignUp}
                        variant="primary"
                        disabled={isLoading || !email || !password}
                        loading={signUp.isPending}
                    >
                        {signUp.isPending ? "Signing Up..." : "Sign Up"}
                    </Button>
                    <Button
                        onClick={handleSignIn}
                        variant="primary"
                        disabled={isLoading || !email || !password}
                        loading={signIn.isPending}
                    >
                        {signIn.isPending ? "Signing In..." : "Sign In"}
                    </Button>
                    <Button
                        onClick={handleSignOut}
                        variant="secondary"
                        disabled={isLoading || !activeSession}
                        loading={signOut.isPending}
                    >
                        {signOut.isPending ? "Signing Out..." : "Sign Out"}
                    </Button>
                </div>

                {/* Cross-Tab Sync Instructions */}
                {activeSession && (
                    <div className={styles.syncInstructions}>
                        <Heading level={3}>Test Cross-Tab Synchronization</Heading>
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
                                    <Text>
                                        {signIn.error?.message || "Unknown error"}
                                    </Text>
                                </div>
                            </div>
                        )}
                        {signUp.error && (
                            <div className={styles.error} role="alert" aria-live="assertive">
                                <div className={styles.errorIcon} aria-hidden="true">⚠️</div>
                                <div className={styles.errorContent}>
                                    <strong className={styles.errorTitle}>Sign Up Error</strong>
                                    <Text>
                                        {signUp.error?.message || "Unknown error"}
                                    </Text>
                                    <Text>
                                        {signUp.error?.code || "Unknown error"}
                                    </Text>
                                    <Text>
                                        {signUp.error?.status || "Unknown error"}
                                    </Text>
                                </div>
                            </div>
                        )}
                        {signOut.error && (
                            <div className={styles.error} role="alert" aria-live="assertive">
                                <div className={styles.errorIcon} aria-hidden="true">⚠️</div>
                                <div className={styles.errorContent}>
                                    <strong className={styles.errorTitle}>Sign Out Error</strong>
                                    <Text>
                                        {signOut.error?.message || "Unknown error"}
                                    </Text>
                                </div>
                            </div>
                        )}
                        {sessionError && (
                            <div className={styles.error} role="alert" aria-live="assertive">
                                <div className={styles.errorIcon} aria-hidden="true">⚠️</div>
                                <div className={styles.errorContent}>
                                    <strong className={styles.errorTitle}>Session Error</strong>
                                    <Text>
                                        {sessionError?.message || "Unknown error"}
                                    </Text>
                                </div>
                            </div>
                        )}
                        {userError && (
                            <div className={styles.error} role="alert" aria-live="assertive">
                                <div className={styles.errorIcon} aria-hidden="true">⚠️</div>
                                <div className={styles.errorContent}>
                                    <strong className={styles.errorTitle}>User Error</strong>
                                    <Text>
                                        {userError?.message || "Unknown error"}
                                    </Text>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Information Box */}
                {(activeSession || activeUser || isLoading) && (
                    <div className={styles.infoBox}>
                        <Heading level={2}>Session Information</Heading>
                        {isLoading && (
                            <Text role="status" aria-live="polite">
                                Loading...
                            </Text>
                        )}
                        {activeSession && (
                            <div className={styles.infoSection}>
                                <Heading level={3}>
                                    Session{" "}
                                    <span className={styles.statusBadge} title="Real-time sync active">
                                        🔄 Live
                                    </span>
                                </Heading>
                                <div className={styles.infoContent}>
                                    <Text>
                                        <strong>Access Token:</strong>{" "}
                                        <span className={styles.token}>
                                            {activeSession.accessToken.substring(0, 30)}...
                                        </span>
                                    </Text>
                                    <Text>
                                        <strong>Expires At:</strong>{" "}
                                        {new Date(activeSession.expiresAt).toLocaleString()}
                                    </Text>
                                    <Text>
                                        <strong>Status:</strong>{" "}
                                        <span className={styles.status}>
                                            {isPersistent ? "Persistent" : "Active"}
                                        </span>
                                    </Text>
                                    <Text>
                                        💡 Session is synchronized across all browser tabs in real-time.
                                    </Text>
                                </div>
                            </div>
                        )}
                        {activeUser && (
                            <div className={styles.infoSection}>
                                <Heading level={3}>
                                    User{" "}
                                    <span className={styles.statusBadge} title="Real-time sync active">
                                        🔄 Live
                                    </span>
                                </Heading>
                                <div className={styles.infoContent}>
                                    <Text>
                                        <strong>ID:</strong>{" "}
                                        <span className={styles.id}>{activeUser.id}</span>
                                    </Text>
                                    <Text>
                                        <strong>Email:</strong> {activeUser.email}
                                    </Text>
                                    <Text>
                                        <strong>Created At:</strong>{" "}
                                        {new Date(activeUser.createdAt).toLocaleString()}
                                    </Text>
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
