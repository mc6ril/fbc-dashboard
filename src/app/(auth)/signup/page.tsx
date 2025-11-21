"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSignUp } from "@/presentation/hooks/useAuth";
import { useAuthStore } from "@/presentation/stores/useAuthStore";
import { useTranslation } from "@/presentation/hooks/useTranslation";
import Heading from "@/presentation/components/ui/Heading";
import Text from "@/presentation/components/ui/Text";
import Link from "@/presentation/components/ui/Link";
import Input from "@/presentation/components/ui/Input";
import Button from "@/presentation/components/ui/Button";
import { getAccessibilityId } from "@/shared/a11y/utils";
import styles from "./page.module.scss";

const SignUpPage = () => {
  const router = useRouter();
  const signUp = useSignUp();
  const [email, setEmail] = useState("cyril.lesot@yahoo.fr");
  const [password, setPassword] = useState("Azerty123");
  const userId = useAuthStore((state) => state.user?.id);

  // Translation hooks
  const tAuth = useTranslation("pages.auth.signup");

  const mainId = getAccessibilityId("main", "signup");
  
  // Reset mutation state when component mounts to ensure clean state
  useEffect(() => {
    signUp.reset();
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
      await signUp.mutateAsync({ email, password });
    } catch {
      // Error is handled by React Query
    }
  }, [email, password, signUp]);

  // Navigate to dashboard when user is authenticated
  // Use replace instead of push to avoid adding to browser history
  useEffect(() => {
    if (userId) {
      router.replace("/dashboard");
    }
  }, [userId, router]);
  
  const isLoading = useMemo(() => {
    return signUp.isPending;
  }, [signUp.isPending]);
  
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
            error={signUp.error ? signUp.error.message : undefined}
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
            error={signUp.error ? signUp.error.message : undefined}
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
          {tAuth("hasAccount")} <Link href="/signin">{tAuth("signinLink")}</Link>
        </Text>
      </div>
    </main>
  );
};

export default SignUpPage;
