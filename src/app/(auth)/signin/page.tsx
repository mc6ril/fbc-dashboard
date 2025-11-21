"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSignIn } from "@/presentation/hooks/useAuth";
import { useTranslation } from "@/presentation/hooks/useTranslation";
import Heading from "@/presentation/components/ui/Heading";
import Text from "@/presentation/components/ui/Text";
import Link from "@/presentation/components/ui/Link";
import Input from "@/presentation/components/ui/Input";
import Button from "@/presentation/components/ui/Button";
import { getAccessibilityId } from "@/shared/a11y/utils";
import styles from "./page.module.scss";
import { useAuthStore } from "@/presentation/stores/useAuthStore";

const SignInPage = () => {
  const router = useRouter();
  const signIn = useSignIn();
  const [email, setEmail] = useState("cyril.lesot@yahoo.fr");
  const [password, setPassword] = useState("Azerty123");
  const userId = useAuthStore((state) => state.user?.id);

  // Translation hooks
  const tAuth = useTranslation("pages.auth.signin");
  
  const mainId = getAccessibilityId("main", "signin");
  
  // Reset mutation state when component mounts to ensure clean state after signout
  useEffect(() => {
    signIn.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const onEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  }, []);
  
  const onPasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  }, []);
  
  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!email || !password) {
      return;
    }
    
    try {
      await signIn.mutateAsync({ email, password });
    } catch {
      // Error is handled by React Query
    }
  }, [email, password, signIn]);

  // Navigate to dashboard when user is authenticated
  // Use replace instead of push to avoid adding to browser history
  useEffect(() => {
    if (userId) {
      router.replace("/dashboard");
    }
  }, [userId, router]);
  
  const isLoading = useMemo(() => {
    return signIn.isPending;
  }, [signIn.isPending]);
  
  return (
    <main id={mainId} className={styles.main} role="main">
      <Heading level={1}>{tAuth("title")}</Heading>
      <Text className={styles.description}>
        {tAuth("description")}
      </Text>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <Input
            id="email"
            type="email"
            label={tAuth("fields.email.label")}
            value={email}
            onChange={onEmailChange}
            placeholder="cyril.lesot@yahoo.fr"
            required
            disabled={isLoading}
            error={signIn.error ? signIn.error.message : undefined}
          />
        </div>
        
        <div className={styles.formGroup}>
          <Input
            id="password"
            type="password"
            label={tAuth("fields.password.label")}
            value={password}
            onChange={onPasswordChange}
            placeholder="Azerty123"
            required
            disabled={isLoading}
            error={signIn.error ? signIn.error.message : undefined}
          />
        </div>
        
        <div className={styles.buttonContainer}>
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading || !email || !password}
            loading={isLoading}
            fullWidth
          >
            {isLoading ? tAuth("loading") : tAuth("title")}
          </Button>
        </div>
      </form>
      
      <div className={styles.links}>
        <Text>
          {tAuth("noAccount")} <Link href="/signup">{tAuth("signupLink")}</Link>
        </Text>
      </div>
    </main>
  );
};

export default SignInPage;
