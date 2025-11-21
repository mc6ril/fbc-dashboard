"use client";

import React, { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/presentation/stores/useAuthStore";
import { useSession } from "@/presentation/hooks/useAuth";
import { useTranslation } from "@/presentation/hooks/useTranslation";
import Heading from "@/presentation/components/ui/Heading";
import Text from "@/presentation/components/ui/Text";
import Link from "@/presentation/components/ui/Link";
import { getAccessibilityId } from "@/shared/a11y/utils";
import styles from "./page.module.scss";

const Home = () => {
  const router = useRouter();
  const session = useAuthStore((state) => state.session);
  const { data: sessionData, isLoading: isLoadingQuery } = useSession();

  // Translation hooks
  const tHome = useTranslation("pages.home");
  
  // Determine if user is authenticated
  const isAuthenticated = useMemo(() => {
    return session !== null || sessionData !== null;
  }, [session, sessionData]);
  
  // Use React Query loading state
  const isLoading = isLoadingQuery;
  
  // Redirect based on authentication state
  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push("/dashboard");
      } else {
        router.push("/signin");
      }
    }
  }, [isLoading, isAuthenticated, router]);
  
  // Show loading state while checking auth
  if (isLoading) {
    const mainId = getAccessibilityId("main", "home");
    
    return (
      <main id={mainId} className={styles.main} role="main">
        <Text>{tHome("loading")}</Text>
      </main>
    );
  }
  
  // This should not be reached due to redirect, but provide fallback
  const mainId = getAccessibilityId("main", "home");
  
  return (
    <main id={mainId} className={styles.main} role="main">
      <Heading level={1}>{tHome("welcome")}</Heading>
      <Text>
        {tHome("redirecting")}
      </Text>
      <div className={styles.links}>
        <Link href="/signin">{tHome("signin")}</Link>
        <Link href="/signup">{tHome("signup")}</Link>
      </div>
    </main>
  );
};

export default Home;
