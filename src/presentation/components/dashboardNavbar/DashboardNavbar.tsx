"use client";

import React, { useMemo, useCallback } from "react";
import { usePathname } from "next/navigation";
import Link from "@/presentation/components/ui/Link";
import Button from "@/presentation/components/ui/Button";
import { useSignOut } from "@/presentation/hooks/useAuth";
import { getAccessibilityId } from "@/shared/a11y/utils";
import styles from "./DashboardNavbar.module.scss";

type NavItem = {
  href: string;
  label: string;
};

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/stats", label: "Statistiques" },
  { href: "/dashboard/activities", label: "Activités" },
  { href: "/dashboard/catalog", label: "Catalogue" },
];

const DashboardNavbar = () => {
  const navId = getAccessibilityId("nav", "dashboard");
  const pathname = usePathname();
  const signOut = useSignOut();
  
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
          
          return (
            <li key={item.href} className={styles.navItem}>
              <Link
                href={item.href}
                className={`${styles.navLink} ${active ? styles.navLinkActive : ""}`}
                ariaLabel={item.label}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
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
          ariaLabel="Sign out"
        >
          {signOut.isPending ? "Déconnexion en cours..." : "Se déconnecter"}
        </Button>
      </div>
    </nav>
  );
};

export default React.memo(DashboardNavbar);
