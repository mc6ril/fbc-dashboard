/**
 * Add Activity Page
 *
 * Page component for creating new activities. Renders the AddActivityForm component,
 * handles success feedback with accessible announcements, and provides navigation
 * back to the activities list. Redirects to activities list after successful submission.
 */

"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import Heading from "@/presentation/components/ui/Heading";
import Link from "@/presentation/components/ui/Link";
import Button from "@/presentation/components/ui/Button";
import AddActivityForm from "@/presentation/components/addActivity/AddActivityForm/AddActivityForm";
import { getAccessibilityId } from "@/shared/a11y/utils";
import { A11yIds } from "@/shared/a11y/ids";
import styles from "./page.module.scss";

const AddActivityPage = () => {
    const router = useRouter();
    const [showSuccess, setShowSuccess] = React.useState(false);

    // Accessibility IDs
    const mainId = useMemo(() => getAccessibilityId(A11yIds.main, "add-activity"), []);
    const successMessageId = useMemo(() => getAccessibilityId(A11yIds.formSuccess, "form"), []);

    // Handle successful form submission
    const handleSuccess = React.useCallback(() => {
        setShowSuccess(true);
    }, []);

    // Redirect after success message is shown
    React.useEffect(() => {
        if (showSuccess) {
            // Redirect after a delay to allow users to see the success message
            // The delay ensures screen readers can announce the success message
            const redirectTimer = setTimeout(() => {
                router.push("/dashboard/activities");
            }, 2500); // 2.5 seconds delay

            // Cleanup timer on unmount
            return () => {
                clearTimeout(redirectTimer);
            };
        }
    }, [showSuccess, router]);

    // Set page title
    React.useEffect(() => {
        document.title = "Ajouter une activité - Atelier FBC";
    }, []);

    // Clear success message when component unmounts or when navigating away
    React.useEffect(() => {
        return () => {
            setShowSuccess(false);
        };
    }, []);

    return (
        <main id={mainId} className={styles.page} role="main">
            <div className={styles.page__header}>
                <Heading level={1} className={styles.page__title}>
                    Ajouter une activité
                </Heading>
                <Link href="/dashboard/activities" className={styles.page__cancelLink}>
                    <Button variant="secondary" ariaLabel="Annuler et retourner à la liste des activités">
                        Annuler
                    </Button>
                </Link>
            </div>

            {/* Success message with aria-live region */}
            {showSuccess && (
                <div
                    id={successMessageId}
                    className={styles.page__success}
                    role="status"
                    aria-live="polite"
                    aria-atomic="true"
                >
                    <p className={styles.page__successText}>
                        Activité créée avec succès. Redirection en cours...
                    </p>
                </div>
            )}

            <div className={styles.page__content}>
                <AddActivityForm onSuccess={handleSuccess} />
            </div>
        </main>
    );
};

export default AddActivityPage;

