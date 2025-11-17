"use client";

import React, { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/presentation/stores/useAuthStore";
import { useSession } from "@/presentation/hooks/useAuth";
import Heading from "@/presentation/components/ui/Heading";
import Text from "@/presentation/components/ui/Text";
import Link from "@/presentation/components/ui/Link";
import { getAccessibilityId } from "@/shared/a11y/utils";
import styles from "./RestrictedPage.module.scss";

type Props = {
  children: React.ReactNode;
};

/**
 * RestrictedPage wrapper component that guards private routes.
 * 
 * Reads auth status from Zustand store and React Query hook.
 * Redirects or shows link to /signin when not authenticated.
 * No Supabase calls; no business logic.
 */
const RestrictedPage = ({ children }: Props) => {
  const router = useRouter();
  const session = useAuthStore((state) => state.session);
  const { data: sessionData, isLoading: isLoadingQuery } = useSession();
  
  // Determine if user is authenticated
  const isAuthenticated = useMemo(() => {
    return session !== null || sessionData !== null;
  }, [session, sessionData]);
  
  // Use React Query loading state
  const isLoading = isLoadingQuery;
  
  // Redirect to signin if not authenticated (after loading completes)
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/signin");
    }
  }, [isLoading, isAuthenticated, router]);
  
  // Show loading state to prevent flicker
  if (isLoading) {
    return (
      <div className={styles.container} role="status" aria-live="polite" aria-busy="true">
        <Text>Loading...</Text>
      </div>
    );
  }
  
  // Show access denied message if not authenticated
  if (!isAuthenticated) {
    const statusId = getAccessibilityId("status", "access-denied");
    
    return (
      <div className={styles.container}>
        <div 
          id={statusId}
          className={styles.message}
          role="alert"
          aria-live="polite"
        >
          <Heading level={2}>Access Restricted</Heading>
          <Text className={styles.description}>
            You must be signed in to access this page.
          </Text>
          <div className={styles.linkContainer}>
            <Link href="/signin" className={styles.link}>
              Go to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  // Render children if authenticated
  return <>{children}</>;
};

export default React.memo(RestrictedPage);

