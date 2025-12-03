"use client";

import React, { useMemo, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/presentation/hooks/useTranslation";
import Link from "@/presentation/components/ui/Link";
import Button from "@/presentation/components/ui/Button";
import { useSignOut } from "@/presentation/hooks/useAuth";
import { getAccessibilityId } from "@/shared/a11y/utils";
import styles from "./DashboardNavbar.module.scss";

type NavItem = {
  href: string;
  labelKey: string;
};

const DashboardNavbar = () => {
  const tNavbar = useTranslation("dashboard.navbar");
  const navId = getAccessibilityId("nav", "dashboard");
  const pathname = usePathname();
  const signOut = useSignOut();

  const navItems: NavItem[] = useMemo(
    () => [
      { href: "/dashboard", labelKey: "dashboard" },
      { href: "/dashboard/analyses", labelKey: "analyses" },
      { href: "/dashboard/revenus", labelKey: "revenues" },
      { href: "/dashboard/activities", labelKey: "activities" },
      { href: "/dashboard/catalog", labelKey: "catalog" },
    ],
    []
  );
  
  // Determine if a link is active
  const isActive = useMemo(() => {
    return (href: string): boolean => {
      if (href === "/dashboard") {
        return pathname === "/dashboard";
      }
      return pathname.startsWith(href);
    };
  }, [pathname]);
  
  const handleSignOut = useCallback(async () => {
    try {
      await signOut.mutateAsync();
    } catch {
      // Error is handled by React Query
    }
  }, [signOut]);
  
  return (
    <nav id={navId} className={styles.navbar} aria-label="Main navigation">
      <ul className={styles.navList} role="list">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const label = tNavbar(item.labelKey);
          
          return (
            <li key={item.href} className={styles.navItem}>
              <Link
                href={item.href}
                className={`${styles.navLink} ${active ? styles.navLinkActive : ""}`}
                ariaLabel={label}
                aria-current={active ? "page" : undefined}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className={styles.signOutContainer}>
        <Button
          onClick={handleSignOut}
          variant="secondary"
          size="sm"
          fullWidth
          loading={signOut.isPending}
          ariaLabel={tNavbar("signOutAria")}
        >
          {signOut.isPending ? tNavbar("signingOut") : tNavbar("signOut")}
        </Button>
      </div>
    </nav>
  );
};

export default React.memo(DashboardNavbar);
