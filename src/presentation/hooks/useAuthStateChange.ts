/** Subscribe to auth state changes; sync Zustand and invalidate queries as needed. */

"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { subscribeToAuthChanges } from "@/core/usecases/auth";
import { authRepositorySupabase } from "@/infrastructure/supabase/authRepositorySupabase";
import { useAuthStore } from "@/presentation/stores/useAuthStore";
import { queryKeys } from "./queryKeys";

/** Hook manages subscription lifecycle; returns void. */
export const useAuthStateChange = (): void => {
    const queryClient = useQueryClient();
    const setSession = useAuthStore((state) => state.setSession);
    const setUser = useAuthStore((state) => state.setUser);
    const clearAuth = useAuthStore((state) => state.clearAuth);

    useEffect(() => {
        // Track if INITIAL_SESSION has been processed
        // This prevents SIGNED_OUT events from clearing the store before we know the actual initial state
        // Supabase may emit SIGNED_OUT before INITIAL_SESSION to clean up invalid sessions,
        // but INITIAL_SESSION represents the true state from storage
        let initialSessionProcessed = false;
        
        // Subscribe to authentication state changes
        const unsubscribe = subscribeToAuthChanges(
            authRepositorySupabase,
            (event) => {

                try {
                    // Handle different event types
                    switch (event.event) {
                        case "INITIAL_SESSION": {
                            // Initial session retrieved from storage on app startup
                            // This event is emitted once when Supabase restores an existing session
                            // We should restore the session in the store to maintain authentication state
                            // This is the authoritative event for the initial auth state
                            // Mark that we've processed the initial session
                            initialSessionProcessed = true;
                            
                            if (event.session) {
                                setSession(event.session);
                                setUser(event.session.user);
                                
                                // Invalidate React Query cache to ensure fresh data after session restoration
                                queryClient.invalidateQueries({
                                    queryKey: queryKeys.auth.session(),
                                });
                                queryClient.invalidateQueries({
                                    queryKey: queryKeys.auth.user(),
                                });
                            } else {
                                // Check if store already has no session (to avoid redundant operations)
                                const storeState = useAuthStore.getState();
                                if (storeState.session || storeState.user) {
                                    // If INITIAL_SESSION has no session, we know for sure there's no valid session
                                    clearAuth();
                                }
                            }
                            break;
                        }

                        case "SIGNED_IN": {
                            // User signed in: update store and invalidate cache
                            // Mark initial session as processed if it wasn't already
                            // (SIGNED_IN can happen during startup if user was redirected from auth flow)
                            if (!initialSessionProcessed) {
                                initialSessionProcessed = true;
                            }
                            
                            if (event.session) {
                                setSession(event.session);
                                setUser(event.session.user);
                                
                                // Invalidate React Query cache to refetch fresh data
                                queryClient.invalidateQueries({
                                    queryKey: queryKeys.auth.session(),
                                });
                                queryClient.invalidateQueries({
                                    queryKey: queryKeys.auth.user(),
                                });
                            }
                            break;
                        }

                        case "SIGNED_OUT": {
                            // User signed out: clear store and invalidate cache
                            // IMPORTANT: Ignore SIGNED_OUT events that occur BEFORE INITIAL_SESSION is processed
                            // Supabase may emit SIGNED_OUT first to clean up invalid sessions,
                            // but we should wait for INITIAL_SESSION to know the true initial state
                            if (!initialSessionProcessed) {
                                break;
                            }
                            
                            // Check if store already has no session (to avoid redundant operations)
                            const storeState = useAuthStore.getState();
                            if (!storeState.session && !storeState.user) {
                                // Still invalidate cache to ensure consistency
                                queryClient.invalidateQueries({
                                    queryKey: queryKeys.auth.session(),
                                });
                                queryClient.invalidateQueries({
                                    queryKey: queryKeys.auth.user(),
                                });
                                break;
                            }
                            
                            clearAuth();
                            
                            // Invalidate React Query cache to clear cached data
                            queryClient.invalidateQueries({
                                queryKey: queryKeys.auth.session(),
                            });
                            queryClient.invalidateQueries({
                                queryKey: queryKeys.auth.user(),
                            });
                            break;
                        }

                        case "TOKEN_REFRESHED": {
                            // Token refreshed: update session in store (preserve user)
                            if (event.session) {
                                setSession(event.session);
                                // Optionally update user if it changed during refresh
                                setUser(event.session.user);
                            }
                            break;
                        }

                        case "USER_UPDATED": {
                            // User data updated: update user in store
                            if (event.session?.user) {
                                setUser(event.session.user);
                                // If session exists, update it too (user data might affect session)
                                if (event.session) {
                                    setSession(event.session);
                                }
                                // Invalidate user query to refetch fresh data
                                queryClient.invalidateQueries({
                                    queryKey: queryKeys.auth.user(),
                                });
                            }
                            break;
                        }

                        case "PASSWORD_RECOVERY": {
                            // Password recovery initiated: no automatic state update needed
                            // This event is handled by specific password recovery flows
                            break;
                        }

                        default: {
                            // TypeScript exhaustiveness check: this should never happen
                            // but helps catch new event types that aren't handled
                            console.warn(
                                `Unhandled auth event type: ${(event as { event: string }).event}`,
                                { event }
                            );
                        }
                    }
                } catch (error) {
                    // Log error but don't crash the app
                    // The subscription remains active even if event handling fails
                    console.error(
                        "Error handling auth state change:",
                        error instanceof Error ? error.message : "Unknown error",
                        {
                            event: event.event,
                            hasSession: event.session !== null,
                            error: error instanceof Error ? error.stack : error,
                        }
                    );
                }
            }
        );

        // Cleanup: unsubscribe when component unmounts
        return () => {
            try {
                unsubscribe();
            } catch (error) {
                // Log cleanup errors but don't crash
                console.error(
                    "Error unsubscribing from auth state changes:",
                    error
                );
            }
        };
    }, [queryClient, setSession, setUser, clearAuth]);
};

