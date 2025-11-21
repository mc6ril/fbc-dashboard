"use client";

import React, { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/presentation/stores/useAuthStore";
import { useSession } from "@/presentation/hooks/useAuth";
import Heading from "@/presentation/components/ui/Heading";
import Text from "@/presentation/components/ui/Text";
import Link from "@/presentation/components/ui/Link";
import { getAccessibilityId } from "@/shared/a11y/utils";
import styles from "./page.module.scss";

const Home = () => {
  const router = useRouter();
  const session = useAuthStore((state) => state.session);
  const { data: sessionData, isLoading: isLoadingQuery } = useSession();
  
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
        <Text>Chargement...</Text>
      </main>
    );
  }
  
  // This should not be reached due to redirect, but provide fallback
  const mainId = getAccessibilityId("main", "home");
  
  return (
    <main id={mainId} className={styles.main} role="main">
      <Heading level={1}>Bienvenue</Heading>
      <Text>
        Redirection vers la page appropriée...
      </Text>
      <div className={styles.links}>
        <Link href="/signin">Se connecter</Link>
        <Link href="/signup">{`S'inscrire`}</Link>
      </div>
    </main>
  );
};

export default Home;
