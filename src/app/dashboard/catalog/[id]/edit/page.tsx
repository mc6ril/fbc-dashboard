/**
 * Edit Product Page
 *
 * Page component for editing existing products. Fetches the product by ID,
 * renders the ProductForm component in edit mode with pre-filled data,
 * handles success feedback with accessible announcements, and provides navigation
 * back to the catalog list. Redirects to catalog list after successful submission.
 */

"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import Heading from "@/presentation/components/ui/Heading";
import Link from "@/presentation/components/ui/Link";
import Button from "@/presentation/components/ui/Button";
import ProductForm from "@/presentation/components/catalog/ProductForm/ProductForm";
import { useProductById, useUpdateProduct } from "@/presentation/hooks/useProducts";
import type { Product, ProductId } from "@/core/domain/product";
import { getAccessibilityId } from "@/shared/a11y/utils";
import { A11yIds } from "@/shared/a11y/ids";
import { ACCESSIBILITY_ANNOUNCEMENT_DELAY_MS } from "@/shared/constants/timing";
import { useTranslation } from "@/presentation/hooks/useTranslation";
import Text from "@/presentation/components/ui/Text";
import styles from "./page.module.scss";

const EditProductPage = () => {
    const router = useRouter();
    const params = useParams();
    const productId = React.useMemo(() => {
        if (!params?.id || typeof params.id !== "string") {
            return null;
        }
        return params.id as ProductId;
    }, [params?.id]);
    const updateProductMutation = useUpdateProduct();
    const { data: product, isLoading: isLoadingProduct, error: productError } = useProductById(
        productId || ("" as ProductId)
    );
    const [showSuccess, setShowSuccess] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState<string>("");

    // Translation hooks
    const tCatalog = useTranslation("pages.catalog");
    const tCommon = useTranslation("common");

    // Accessibility IDs
    const mainId = React.useMemo(() => getAccessibilityId(A11yIds.main, "edit-product"), []);
    const successMessageId = React.useMemo(
        () => getAccessibilityId(A11yIds.formSuccess, "form"),
        []
    );
    const productErrorMessageId = React.useMemo(
        () => getAccessibilityId(A11yIds.formError, "product-fetch"),
        []
    );
    const formErrorMessageId = React.useMemo(
        () => getAccessibilityId(A11yIds.formError, "form-submit"),
        []
    );

    // Handle form submission
    const handleSubmit = React.useCallback(
        (productData: Omit<Product, "id">) => {
            if (!productId) {
                setErrorMessage(tCatalog("errors.invalidId"));
                return;
            }

            setErrorMessage("");

            updateProductMutation.mutate(
                { id: productId, updates: productData },
                {
                    onSuccess: () => {
                        setShowSuccess(true);
                    },
                    onError: (error) => {
                        // Handle error from usecase
                        if (error && typeof error === "object" && "message" in error) {
                            setErrorMessage(error.message as string);
                        } else {
                            setErrorMessage(tCatalog("errors.update"));
                        }
                    },
                }
            );
        },
        [updateProductMutation, productId, tCatalog]
    );

    // Redirect after success message is shown and mutation is settled
    React.useEffect(() => {
        if (showSuccess && !updateProductMutation.isPending && updateProductMutation.isSuccess) {
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
    }, [showSuccess, updateProductMutation.isPending, updateProductMutation.isSuccess, router]);

    // Set page title
    React.useEffect(() => {
        let isMounted = true;

        if (product && product.name && isMounted) {
            document.title = tCatalog("editProductPageTitleWithName", { name: product.name });
        } else if (isMounted) {
            document.title = tCatalog("editProductPageTitle");
        }

        return () => {
            isMounted = false;
        };
    }, [product, tCatalog]);

    // Clear success message when component unmounts or when navigating away
    React.useEffect(() => {
        return () => {
            setShowSuccess(false);
        };
    }, []);

    // Prepare initial values for ProductForm
    const initialValues: Omit<Product, "id"> | undefined = React.useMemo(() => {
        if (!product) {
            return undefined;
        }
        return {
            name: product.name,
            type: product.type,
            coloris: product.coloris,
            unitCost: product.unitCost,
            salePrice: product.salePrice,
            stock: product.stock,
            weight: product.weight,
        };
    }, [product]);

    // Handle invalid product ID
    if (!productId) {
        return (
            <main id={mainId} className={styles.page} role="main">
                <div className={styles.page__header}>
                    <Heading level={1} className={styles.page__title}>
                        {tCatalog("editProductPageTitle")}
                    </Heading>
                    <Link href="/dashboard/catalog" className={styles.page__cancelLink}>
                        <Button variant="secondary" ariaLabel={tCatalog("backAria")}>
                            {tCatalog("back")}
                        </Button>
                    </Link>
                </div>
                <div
                    id={productErrorMessageId}
                    className={styles.page__error}
                    role="alert"
                    aria-live="assertive"
                >
                    <Text size="md">{tCatalog("errors.invalidId")}</Text>
                </div>
            </main>
        );
    }

    // Handle loading state
    if (isLoadingProduct) {
        return (
            <main id={mainId} className={styles.page} role="main">
                <div className={styles.page__header}>
                    <Heading level={1} className={styles.page__title}>
                        {tCatalog("editProductPageTitle")}
                    </Heading>
                </div>
                <div className={styles.page__loading}>
                    <Text size="md">{tCommon("loading")}</Text>
                </div>
            </main>
        );
    }

    // Handle error state (product not found or fetch error)
    if (productError || !product) {
        const errorMsg = productError?.message || tCatalog("errors.notFound");
        return (
            <main id={mainId} className={styles.page} role="main">
                <div className={styles.page__header}>
                    <Heading level={1} className={styles.page__title}>
                        {tCatalog("editProductPageTitle")}
                    </Heading>
                    <Link href="/dashboard/catalog" className={styles.page__cancelLink}>
                        <Button variant="secondary" ariaLabel={tCatalog("backAria")}>
                            {tCatalog("back")}
                        </Button>
                    </Link>
                </div>
                <div
                    id={productErrorMessageId}
                    className={styles.page__error}
                    role="alert"
                    aria-live="assertive"
                >
                    <Text size="md">{errorMsg}</Text>
                </div>
            </main>
        );
    }

    return (
        <main id={mainId} className={styles.page} role="main">
            <div className={styles.page__header}>
                <Heading level={1} className={styles.page__title}>
                    {tCatalog("editProductPageTitle")}
                </Heading>
                <Link href="/dashboard/catalog" className={styles.page__cancelLink}>
                    <Button variant="secondary" ariaLabel={tCatalog("cancelAria")}>
                        {tCatalog("cancel")}
                    </Button>
                </Link>
            </div>

            {/* Error message with aria-live region */}
            {errorMessage && (
                <div
                    id={formErrorMessageId}
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
                        {tCatalog("success.update")}
                    </p>
                </div>
            )}

            <div className={styles.page__content}>
                <ProductForm
                    mode="edit"
                    initialValues={initialValues}
                    onSubmit={handleSubmit}
                    isLoading={updateProductMutation.isPending}
                />
            </div>
        </main>
    );
};

export default EditProductPage;

