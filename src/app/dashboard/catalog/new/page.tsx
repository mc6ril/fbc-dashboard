/**
 * New Product Page
 *
 * Page component for creating new products. Renders the ProductForm component,
 * handles success feedback with accessible announcements, and provides navigation
 * back to the catalog list. Redirects to catalog list after successful submission.
 */

"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Heading from "@/presentation/components/ui/Heading";
import Link from "@/presentation/components/ui/Link";
import Button from "@/presentation/components/ui/Button";
import ProductForm from "@/presentation/components/catalog/ProductForm/ProductForm";
import { useCreateProduct } from "@/presentation/hooks/useProducts";
import type { Product } from "@/core/domain/product";
import { getAccessibilityId } from "@/shared/a11y/utils";
import { A11yIds } from "@/shared/a11y/ids";
import { ACCESSIBILITY_ANNOUNCEMENT_DELAY_MS } from "@/shared/constants/timing";
import Text from "@/presentation/components/ui/Text";
import styles from "./page.module.scss";

const NewProductPage = () => {
    const router = useRouter();
    const createProductMutation = useCreateProduct();
    const [showSuccess, setShowSuccess] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState<string>("");

    // Accessibility IDs
    const mainId = React.useMemo(() => getAccessibilityId(A11yIds.main, "new-product"), []);
    const successMessageId = React.useMemo(
        () => getAccessibilityId(A11yIds.formSuccess, "form"),
        []
    );
    const errorMessageId = React.useMemo(
        () => getAccessibilityId(A11yIds.formError, "form"),
        []
    );

    // Handle form submission
    const handleSubmit = React.useCallback(
        (productData: Omit<Product, "id">) => {
            setErrorMessage("");

            createProductMutation.mutate(productData, {
                onSuccess: () => {
                    setShowSuccess(true);
                },
                onError: (error) => {
                    // Handle error from usecase
                    if (error && typeof error === "object" && "message" in error) {
                        setErrorMessage(error.message as string);
                    } else {
                        setErrorMessage("Une erreur est survenue lors de la création du produit");
                    }
                },
            });
        },
        [createProductMutation]
    );

    // Redirect after success message is shown and mutation is settled
    React.useEffect(() => {
        if (showSuccess && !createProductMutation.isPending && createProductMutation.isSuccess) {
            // Redirect after a short delay to allow screen readers to announce the success message
            // The delay is only applied once the mutation is complete (not pending)
            const redirectTimer = setTimeout(() => {
                router.push("/dashboard/catalog");
            }, ACCESSIBILITY_ANNOUNCEMENT_DELAY_MS);

            // Cleanup timer on unmount
            return () => {
                clearTimeout(redirectTimer);
            };
        }
    }, [showSuccess, createProductMutation.isPending, createProductMutation.isSuccess, router]);

    // Set page title
    React.useEffect(() => {
        document.title = "Ajouter un produit - Atelier FBC";
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
                    Ajouter un produit
                </Heading>
                <Link href="/dashboard/catalog" className={styles.page__cancelLink}>
                    <Button variant="secondary" ariaLabel="Annuler et retourner au catalogue">
                        Annuler
                    </Button>
                </Link>
            </div>

            {/* Error message with aria-live region */}
            {errorMessage && (
                <div
                    id={errorMessageId}
                    className={styles.page__error}
                    role="alert"
                    aria-live="assertive"
                >
                    <Text size="md">{errorMessage}</Text>
                </div>
            )}

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
                        Produit créé avec succès. Redirection en cours...
                    </p>
                </div>
            )}

            <div className={styles.page__content}>
                <ProductForm
                    mode="create"
                    onSubmit={handleSubmit}
                    isLoading={createProductMutation.isPending}
                />
            </div>
        </main>
    );
};

export default NewProductPage;

