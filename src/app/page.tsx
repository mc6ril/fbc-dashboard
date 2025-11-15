"use client";

import { useState, useCallback, useMemo } from "react";
import { useSignIn, useSignUp, useSignOut, useSession, useUser } from "@/presentation/hooks/useAuth";
import type { SignInCredentials, SignUpCredentials } from "@/core/domain/auth";
import styles from "./page.module.scss";

/**
 * Home Page - Authentication Test
 *
 * Test page for React Query authentication hooks with Supabase.
 * Allows users to sign up, sign in, and sign out to test the authentication flow.
 */
const Home = () => {
    const [email, setEmail] = useState("cyril.lesot@yahoo.fr");
    const [password, setPassword] = useState("Azerty123");

    // React Query hooks for authentication
    const signIn = useSignIn();
    const signUp = useSignUp();
    const signOut = useSignOut();
    const { data: session, isLoading: sessionLoading, error: sessionError } = useSession();
    const { data: user, isLoading: userLoading, error: userError } = useUser();

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

    return (
        <div className={styles.container}>
            <main className={styles.main}>
                <h1 className={styles.title}>Authentication Test</h1>
                <p className={styles.description}>
                    Test React Query authentication hooks with Supabase
                </p>

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
                        disabled={isLoading || !session}
                    >
                        {signOut.isPending ? "Signing Out..." : "Sign Out"}
                    </button>
                </div>

                {/* Error Messages */}
                {(sessionError || userError || signIn.error || signUp.error || signOut.error) && (
                    <div className={styles.errorContainer}>
                        {signIn.error && (
                            <div className={styles.error} role="alert" aria-live="assertive">
                                <div className={styles.errorIcon} aria-hidden="true">⚠️</div>
                                <div className={styles.errorContent}>
                                    <strong className={styles.errorTitle}>Sign In Error</strong>
                                    <p className={styles.errorMessage}>{signIn.error.message}</p>
                                </div>
                            </div>
                        )}
                        {signUp.error && (
                            <div className={styles.error} role="alert" aria-live="assertive">
                                <div className={styles.errorIcon} aria-hidden="true">⚠️</div>
                                <div className={styles.errorContent}>
                                    <strong className={styles.errorTitle}>Sign Up Error</strong>
                                    <p className={styles.errorMessage}>{signUp.error.message}</p>
                                </div>
                            </div>
                        )}
                        {signOut.error && (
                            <div className={styles.error} role="alert" aria-live="assertive">
                                <div className={styles.errorIcon} aria-hidden="true">⚠️</div>
                                <div className={styles.errorContent}>
                                    <strong className={styles.errorTitle}>Sign Out Error</strong>
                                    <p className={styles.errorMessage}>{signOut.error.message}</p>
                                </div>
                            </div>
                        )}
                        {sessionError && (
                            <div className={styles.error} role="alert" aria-live="assertive">
                                <div className={styles.errorIcon} aria-hidden="true">⚠️</div>
                                <div className={styles.errorContent}>
                                    <strong className={styles.errorTitle}>Session Error</strong>
                                    <p className={styles.errorMessage}>{sessionError.message}</p>
                                </div>
                            </div>
                        )}
                        {userError && (
                            <div className={styles.error} role="alert" aria-live="assertive">
                                <div className={styles.errorIcon} aria-hidden="true">⚠️</div>
                                <div className={styles.errorContent}>
                                    <strong className={styles.errorTitle}>User Error</strong>
                                    <p className={styles.errorMessage}>{userError.message}</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Information Box */}
                {(session || user || isLoading) && (
                    <div className={styles.infoBox}>
                        <h2 className={styles.infoTitle}>Information</h2>
                        {isLoading && (
                            <p className={styles.loading} role="status" aria-live="polite">
                                Loading...
                            </p>
                        )}
                        {session && (
                            <div className={styles.infoSection}>
                                <h3 className={styles.infoSubtitle}>Session</h3>
                                <div className={styles.infoContent}>
                                    <p>
                                        <strong>Access Token:</strong>{" "}
                                        <span className={styles.token}>
                                            {session.accessToken.substring(0, 30)}...
                                        </span>
                                    </p>
                                    <p>
                                        <strong>Expires At:</strong>{" "}
                                        {new Date(session.expiresAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        )}
                        {user && (
                            <div className={styles.infoSection}>
                                <h3 className={styles.infoSubtitle}>User</h3>
                                <div className={styles.infoContent}>
                                    <p>
                                        <strong>ID:</strong> <span className={styles.id}>{user.id}</span>
                                    </p>
                                    <p>
                                        <strong>Email:</strong> {user.email}
                                    </p>
                                    <p>
                                        <strong>Created At:</strong>{" "}
                                        {new Date(user.createdAt).toLocaleString()}
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
