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
import { ACCESSIBILITY_ANNOUNCEMENT_DELAY_MS } from "@/shared/constants/timing";
import { useTranslation } from "@/presentation/hooks/useTranslation";
import styles from "./page.module.scss";

const AddActivityPage = () => {
    const router = useRouter();
    const [showSuccess, setShowSuccess] = React.useState(false);

    // Translation hooks
    const tActivities = useTranslation("pages.activities");

    // Accessibility IDs
    const mainId = useMemo(() => getAccessibilityId(A11yIds.main, "add-activity"), []);
    const successMessageId = useMemo(() => getAccessibilityId(A11yIds.formSuccess, "form"), []);

    // Handle successful form submission
    // onSuccess is called by AddActivityForm when the mutation completes,
    // so at this point isPending is false and isSuccess is true
    const handleSuccess = React.useCallback(() => {
        setShowSuccess(true);
    }, []);

    // Redirect after success message is shown
    // The mutation is complete when onSuccess callback is called (AddActivityForm uses useAddActivity internally)
    // GlobalLoader is already managed by the hook, so we just need to wait for the success message to be announced
    React.useEffect(() => {
        if (showSuccess) {
            // Redirect after a short delay to allow screen readers to announce the success message
            // The delay is only applied once the mutation is complete (onSuccess was called)
            const redirectTimer = setTimeout(() => {
                router.push("/dashboard/activities");
            }, ACCESSIBILITY_ANNOUNCEMENT_DELAY_MS);

            // Cleanup timer on unmount
            return () => {
                clearTimeout(redirectTimer);
            };
        }
    }, [showSuccess, router]);

    // Set page title
    React.useEffect(() => {
        document.title = tActivities("addActivityPageTitle");
    }, [tActivities]);

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
                    {tActivities("addActivity")}
                </Heading>
                <Link href="/dashboard/activities" className={styles.page__cancelLink}>
                    <Button variant="secondary" ariaLabel={tActivities("cancelAria")}>
                        {tActivities("cancel")}
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
                        {tActivities("success.create")}
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

