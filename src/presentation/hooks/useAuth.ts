/**
 * Authentication React Query Hooks
 *
 * React Query hooks for authentication operations in the FBC Dashboard.
 * These hooks connect the UI to usecases and manage async state, caching,
 * and error handling. They also synchronize state with the Zustand store.
 *
 * Following Clean Architecture and React Query best practices:
 * - Hooks call usecases (not direct repository calls)
 * - Hooks sync state with Zustand store after operations
 * - Mutations invalidate related queries on success
 * - Proper error handling and loading states
 * - Stable query keys for caching
 *
 * These hooks are used by React components to perform authentication
 * operations and access authentication state.
 */

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import type {
    SignInCredentials,
    SignUpCredentials,
    Session,
    User,
    AuthError,
} from "../../core/domain/auth";
import {
    signInUser,
    signUpUser,
    signOutUser,
    getCurrentSession,
    getCurrentUser,
} from "../../core/usecases/auth";
import { authRepositorySupabase } from "../../infrastructure/supabase/authRepositorySupabase";
import { useAuthStore } from "../stores/useAuthStore";
import { queryKeys } from "./queryKeys";

/**
 * Hook for signing in a user.
 *
 * Mutation hook that signs in a user with email and password credentials.
 * On success, updates the Zustand store with session and user data, and
 * invalidates session and user queries to refetch fresh data.
 *
 * @returns {object} Mutation object with mutate, mutateAsync, data, isLoading, error, etc.
 *
 * @example
 * ```tsx
 * const signIn = useSignIn();
 *
 * const handleSignIn = async () => {
 *   try {
 *     await signIn.mutateAsync({
 *       email: "user@example.com",
 *       password: "password123"
 *     });
 *     // User is now signed in, store is updated
 *   } catch (error) {
 *     // Handle error
 *   }
 * };
 * ```
 */
export const useSignIn = () => {
    const queryClient = useQueryClient();
    const setSession = useAuthStore((state) => state.setSession);
    const setUser = useAuthStore((state) => state.setUser);
    const setLoading = useAuthStore((state) => state.setLoading);

    return useMutation<
        { session: Session; user: User },
        AuthError,
        SignInCredentials
    >({
        mutationFn: (credentials: SignInCredentials) =>
            signInUser(authRepositorySupabase, credentials),
        onMutate: () => {
            setLoading(true);
        },
        onSuccess: (data) => {
            // Update Zustand store
            setSession(data.session);
            setUser(data.user);

            // Invalidate and refetch session and user queries
            queryClient.invalidateQueries({ queryKey: queryKeys.auth.session() });
            queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });
        },
        onSettled: () => {
            // Reset loading state after success or error
            setLoading(false);
        },
    });
};

/**
 * Hook for signing up a new user.
 *
 * Mutation hook that creates a new user account and signs them in.
 * On success, updates the Zustand store with session and user data, and
 * invalidates session and user queries to refetch fresh data.
 *
 * @returns {object} Mutation object with mutate, mutateAsync, data, isLoading, error, etc.
 *
 * @example
 * ```tsx
 * const signUp = useSignUp();
 *
 * const handleSignUp = async () => {
 *   try {
 *     await signUp.mutateAsync({
 *       email: "newuser@example.com",
 *       password: "securePassword123"
 *     });
 *     // User is now signed up and signed in, store is updated
 *   } catch (error) {
 *     // Handle error
 *   }
 * };
 * ```
 */
export const useSignUp = () => {
    const queryClient = useQueryClient();
    const setSession = useAuthStore((state) => state.setSession);
    const setUser = useAuthStore((state) => state.setUser);
    const setLoading = useAuthStore((state) => state.setLoading);

    return useMutation<
        { session: Session; user: User },
        AuthError,
        SignUpCredentials
    >({
        mutationFn: (credentials: SignUpCredentials) =>
            signUpUser(authRepositorySupabase, credentials),
        onMutate: () => {
            setLoading(true);
        },
        onSuccess: (data) => {
            // Update Zustand store
            setSession(data.session);
            setUser(data.user);

            // Invalidate and refetch session and user queries
            queryClient.invalidateQueries({ queryKey: queryKeys.auth.session() });
            queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });
        },
        onSettled: () => {
            // Reset loading state after success or error
            setLoading(false);
        },
    });
};

/**
 * Hook for signing out the current user.
 *
 * Mutation hook that signs out the authenticated user. On success, clears
 * the Zustand store and invalidates session and user queries.
 *
 * @returns {object} Mutation object with mutate, mutateAsync, data, isLoading, error, etc.
 *
 * @example
 * ```tsx
 * const signOut = useSignOut();
 *
 * const handleSignOut = async () => {
 *   try {
 *     await signOut.mutateAsync();
 *     // User is now signed out, store is cleared
 *   } catch (error) {
 *     // Handle error
 *   }
 * };
 * ```
 */
export const useSignOut = () => {
    const queryClient = useQueryClient();
    const clearAuth = useAuthStore((state) => state.clearAuth);
    const setLoading = useAuthStore((state) => state.setLoading);

    return useMutation<void, AuthError, void>({
        mutationFn: () => signOutUser(authRepositorySupabase),
        onMutate: () => {
            setLoading(true);
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
            // Reset loading state after success or error
            setLoading(false);
        },
    });
};

/**
 * Hook for retrieving the current authentication session.
 *
 * Query hook that fetches the current active session. The query is enabled
 * by default and will refetch based on React Query's default options.
 * On success, updates the Zustand store with the session data.
 *
 * @returns {object} Query object with data, isLoading, error, refetch, etc.
 *
 * @example
 * ```tsx
 * const { data: session, isLoading, error } = useSession();
 *
 * if (isLoading) return <div>Loading...</div>;
 * if (error) return <div>Error: {error.message}</div>;
 * if (session) {
 *   return <div>Authenticated: {session.user.email}</div>;
 * }
 * return <div>Not authenticated</div>;
 * ```
 */
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

/**
 * Hook for retrieving the current authenticated user.
 *
 * Query hook that fetches the current authenticated user. The query is enabled
 * by default and will refetch based on React Query's default options.
 * On success, updates the Zustand store with the user data.
 *
 * @returns {object} Query object with data, isLoading, error, refetch, etc.
 *
 * @example
 * ```tsx
 * const { data: user, isLoading, error } = useUser();
 *
 * if (isLoading) return <div>Loading...</div>;
 * if (error) return <div>Error: {error.message}</div>;
 * if (user) {
 *   return <div>Welcome, {user.email}!</div>;
 * }
 * return <div>Not authenticated</div>;
 * ```
 */
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

