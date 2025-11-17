/** Authentication React Query hooks (Presentation). Minimal orchestration only. */

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import type {
    SignInCredentials,
    SignUpCredentials,
    Session,
    User,
    AuthError,
} from "@/core/domain/auth";
import {
    signInUser,
    signUpUser,
    signOutUser,
    getCurrentSession,
    getCurrentUser,
} from "@/core/usecases/auth";
import { authRepositorySupabase } from "@/infrastructure/supabase/authRepositorySupabase";
import { useAuthStore } from "@/presentation/stores/useAuthStore";
import { useGlobalLoadingStore } from "@/presentation/stores/useGlobalLoadingStore";
import { queryKeys } from "./queryKeys";

/** Sign-in mutation hook; syncs Zustand and invalidates related queries. */
export const useSignIn = () => {
    const queryClient = useQueryClient();
    const setSession = useAuthStore((state) => state.setSession);
    const setUser = useAuthStore((state) => state.setUser);
    const startGlobalLoading = useGlobalLoadingStore((state) => state.startLoading);
    const stopGlobalLoading = useGlobalLoadingStore((state) => state.stopLoading);

    return useMutation<
        { session: Session; user: User },
        AuthError,
        SignInCredentials
    >({
        mutationFn: (credentials: SignInCredentials) =>
            signInUser(authRepositorySupabase, credentials),
        onMutate: () => {
            startGlobalLoading();
        },
        onSuccess: (data) => {
            // Update Zustand store
            setSession(data.session);
            setUser(data.user);

            // Invalidate and refetch session and user queries
            queryClient.invalidateQueries({ queryKey: queryKeys.auth.session() });
            queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });
            // Keep loader active during navigation - will be stopped by dashboard layout
        },
        onError: () => {
            // Stop loader on error
            stopGlobalLoading();
        },
        // Don't stop loader in onSettled for signin - let dashboard layout handle it
    });
};

/** Sign-up mutation hook; syncs Zustand and invalidates related queries. */
export const useSignUp = () => {
    const queryClient = useQueryClient();
    const setSession = useAuthStore((state) => state.setSession);
    const setUser = useAuthStore((state) => state.setUser);
    const startGlobalLoading = useGlobalLoadingStore((state) => state.startLoading);
    const stopGlobalLoading = useGlobalLoadingStore((state) => state.stopLoading);

    return useMutation<
        { session: Session; user: User },
        AuthError,
        SignUpCredentials
    >({
        mutationFn: (credentials: SignUpCredentials) =>
            signUpUser(authRepositorySupabase, credentials),
        onMutate: () => {
            startGlobalLoading();
        },
        onSuccess: (data) => {
            // Update Zustand store
            setSession(data.session);
            setUser(data.user);

            // Invalidate and refetch session and user queries
            queryClient.invalidateQueries({ queryKey: queryKeys.auth.session() });
            queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });
            // Keep loader active during navigation - will be stopped by dashboard layout
        },
        onError: () => {
            // Stop loader on error
            stopGlobalLoading();
        },
        // Don't stop loader in onSettled for signup - let dashboard layout handle it
    });
};

/** Sign-out mutation hook; clears Zustand and invalidates/removes queries. */
export const useSignOut = () => {
    const queryClient = useQueryClient();
    const clearAuth = useAuthStore((state) => state.clearAuth);
    const startGlobalLoading = useGlobalLoadingStore((state) => state.startLoading);
    const stopGlobalLoading = useGlobalLoadingStore((state) => state.stopLoading);

    return useMutation<void, AuthError, void>({
        mutationFn: () => signOutUser(authRepositorySupabase),
        onMutate: () => {
            startGlobalLoading();
        },
        onSuccess: () => {
            // Clear Zustand store
            clearAuth();

            // Invalidate and remove session and user queries from cache
            queryClient.invalidateQueries({ queryKey: queryKeys.auth.session() });
            queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });
            queryClient.removeQueries({ queryKey: queryKeys.auth.session() });
            queryClient.removeQueries({ queryKey: queryKeys.auth.user() });
        },
        onSettled: () => {
            stopGlobalLoading();
        },
    });
};

/** Session query hook; syncs Zustand on data changes. */
export const useSession = () => {
    const setSession = useAuthStore((state) => state.setSession);

    const query = useQuery<Session | null, AuthError>({
        queryKey: queryKeys.auth.session(),
        queryFn: () => getCurrentSession(authRepositorySupabase),
        // Session queries should refetch on mount and window focus
        refetchOnMount: true,
        refetchOnWindowFocus: true,
    });

    // Sync with Zustand store when data changes
    useEffect(() => {
        if (query.data !== undefined) {
            setSession(query.data);
        }
    }, [query.data, setSession]);

    return query;
};

/** User query hook; syncs Zustand on data changes. */
export const useUser = () => {
    const setUser = useAuthStore((state) => state.setUser);

    const query = useQuery<User | null, AuthError>({
        queryKey: queryKeys.auth.user(),
        queryFn: () => getCurrentUser(authRepositorySupabase),
        // User queries should refetch on mount and window focus
        refetchOnMount: true,
        refetchOnWindowFocus: true,
    });

    // Sync with Zustand store when data changes
    useEffect(() => {
        if (query.data !== undefined) {
            setUser(query.data);
        }
    }, [query.data, setUser]);

    return query;
};

