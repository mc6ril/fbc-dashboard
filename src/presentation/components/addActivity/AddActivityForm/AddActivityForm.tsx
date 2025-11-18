/**
 * AddActivityForm Component
 *
 * Form component for creating new activities with dynamic fields based on activity type.
 * Supports CREATION, SALE, STOCK_CORRECTION, and OTHER activity types with type-specific
 * field requirements and validation.
 */

"use client";

import React from "react";
import { useAddActivity } from "@/presentation/hooks/useActivities";
import { useProducts } from "@/presentation/hooks/useProducts";
import { ActivityType } from "@/core/domain/activity";
import type { ProductId } from "@/core/domain/product";
import { getAccessibilityId } from "@/shared/a11y/utils";
import { A11yIds } from "@/shared/a11y/ids";
import Input from "@/presentation/components/ui/Input";
import Select from "@/presentation/components/ui/Select";
import type { SelectOption } from "@/presentation/components/ui/Select";
import Textarea from "@/presentation/components/ui/Textarea";
import Button from "@/presentation/components/ui/Button";
import styles from "./AddActivityForm.module.scss";

type Props = {
    onSuccess?: () => void;
};

/**
 * Converts ISO 8601 date string to datetime-local input format (YYYY-MM-DDTHH:mm).
 */
const isoToDatetimeLocal = (isoString: string): string => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

/**
 * Converts datetime-local input format (YYYY-MM-DDTHH:mm) to ISO 8601 string.
 */
const datetimeLocalToIso = (datetimeLocal: string): string => {
    const date = new Date(datetimeLocal);
    return date.toISOString();
};

/**
 * Gets current date/time in ISO 8601 format.
 */
const getCurrentDateTimeIso = (): string => {
    return new Date().toISOString();
};

const AddActivityFormComponent = ({ onSuccess }: Props) => {
    const { data: products, isLoading: productsLoading } = useProducts();
    const addActivityMutation = useAddActivity();

    // Form state
    const [activityType, setActivityType] = React.useState<ActivityType>(ActivityType.CREATION);
    const [date, setDate] = React.useState<string>(getCurrentDateTimeIso());
    const [productId, setProductId] = React.useState<string>("");
    const [quantity, setQuantity] = React.useState<string>("");
    const [amount, setAmount] = React.useState<string>("");
    const [note, setNote] = React.useState<string>("");

    // Field-level errors
    const [errors, setErrors] = React.useState<Record<string, string>>({});
    const [generalError, setGeneralError] = React.useState<string>("");

    // Accessibility IDs
    const formErrorId = React.useMemo(() => getAccessibilityId(A11yIds.formError, "form"), []);

    // Product options for select
    const productOptions: SelectOption[] = React.useMemo(() => {
        if (!products) {
            return [];
        }
        return products.map((product) => ({
            value: product.id,
            label: `${product.name} (${product.type})`,
        }));
    }, [products]);

    // Activity type options
    const activityTypeOptions: SelectOption[] = React.useMemo(
        () => [
            { value: ActivityType.CREATION, label: "Création" },
            { value: ActivityType.SALE, label: "Vente" },
            { value: ActivityType.STOCK_CORRECTION, label: "Correction de stock" },
            { value: ActivityType.OTHER, label: "Autre" },
        ],
        []
    );

    // Clear errors when fields change
    const clearFieldError = React.useCallback((fieldName: string) => {
        setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[fieldName];
            return newErrors;
        });
    }, []);

    // Handle activity type change
    const handleActivityTypeChange = React.useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            const newType = e.target.value as ActivityType;
            setActivityType(newType);
            // Clear productId when switching to types that don't require it
            // Only OTHER doesn't require a product (CREATION, SALE, STOCK_CORRECTION all require it)
            if (newType === ActivityType.OTHER) {
                setProductId("");
            }
            // Clear errors
            setErrors({});
            setGeneralError("");
        },
        []
    );

    // Handle date change
    const handleDateChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const datetimeLocal = e.target.value;
        if (datetimeLocal) {
            const isoString = datetimeLocalToIso(datetimeLocal);
            setDate(isoString);
        }
        clearFieldError("date");
    }, [clearFieldError]);

    // Handle product change
    const handleProductChange = React.useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            setProductId(e.target.value);
            clearFieldError("productId");
        },
        [clearFieldError]
    );

    // Handle quantity change
    const handleQuantityChange = React.useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setQuantity(e.target.value);
            clearFieldError("quantity");
        },
        [clearFieldError]
    );

    // Handle amount change
    const handleAmountChange = React.useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setAmount(e.target.value);
            clearFieldError("amount");
        },
        [clearFieldError]
    );

    // Handle note change
    const handleNoteChange = React.useCallback(
        (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            setNote(e.target.value);
        },
        []
    );

    // Validate form
    const validateForm = React.useCallback((): boolean => {
        const newErrors: Record<string, string> = {};

        // Validate date
        if (!date) {
            newErrors.date = "La date est requise";
        }

        // Validate quantity
        if (!quantity || quantity.trim() === "") {
            newErrors.quantity = "La quantité est requise";
        } else {
            const quantityNum = Number.parseFloat(quantity);
            if (Number.isNaN(quantityNum) || !Number.isFinite(quantityNum)) {
                newErrors.quantity = "La quantité doit être un nombre valide";
            }
        }

        // Validate amount
        if (!amount || amount.trim() === "") {
            newErrors.amount = "Le montant est requis";
        } else {
            const amountNum = Number.parseFloat(amount);
            if (Number.isNaN(amountNum) || !Number.isFinite(amountNum)) {
                newErrors.amount = "Le montant doit être un nombre valide";
            } else if (amountNum <= 0) {
                newErrors.amount = "Le montant doit être supérieur à 0";
            }
        }

        // Validate productId based on activity type
        const requiresProductId =
            activityType === ActivityType.SALE || activityType === ActivityType.STOCK_CORRECTION;
        if (requiresProductId && !productId) {
            newErrors.productId = "Le produit est requis pour ce type d'activité";
        }

        // For CREATION, product is also required
        if (activityType === ActivityType.CREATION && !productId) {
            newErrors.productId = "Le produit est requis";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [date, quantity, amount, productId, activityType]);

    // Handle form submission
    const handleSubmit = React.useCallback(
        (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            setGeneralError("");

            const isValid = validateForm();
            if (!isValid) {
                return;
            }

            const activityData = {
                date,
                type: activityType,
                productId: (productId || undefined) as ProductId | undefined,
                quantity: Number.parseFloat(quantity),
                amount: Number.parseFloat(amount),
                note: note.trim() || undefined,
            };

            addActivityMutation.mutate(activityData, {
                onSuccess: () => {
                    // Reset form
                    setActivityType(ActivityType.CREATION);
                    setDate(getCurrentDateTimeIso());
                    setProductId("");
                    setQuantity("");
                    setAmount("");
                    setNote("");
                    setErrors({});
                    setGeneralError("");

                    // Call success callback
                    onSuccess?.();
                },
                onError: (error) => {
                    // Handle error from usecase
                    if (error && typeof error === "object" && "message" in error) {
                        setGeneralError(error.message as string);
                    } else {
                        setGeneralError("Une erreur est survenue lors de la création de l'activité");
                    }
                },
            });
        },
        [date, activityType, productId, quantity, amount, note, validateForm, addActivityMutation, onSuccess]
    );

    const isSubmitting = addActivityMutation.isPending;
    const isDisabled = isSubmitting || productsLoading;

    // Determine which fields to show based on activity type
    const showProductField =
        activityType === ActivityType.CREATION ||
        activityType === ActivityType.SALE ||
        activityType === ActivityType.STOCK_CORRECTION ||
        activityType === ActivityType.OTHER;
    const isProductRequired =
        activityType === ActivityType.CREATION ||
        activityType === ActivityType.SALE ||
        activityType === ActivityType.STOCK_CORRECTION;

    return (
        <form onSubmit={handleSubmit} className={styles.form} noValidate>
            {/* General error message */}
            {generalError && (
                <div id={formErrorId} className={styles.form__error} role="alert" aria-live="assertive">
                    {generalError}
                </div>
            )}

            {/* Activity Type */}
            <Select
                id="activity-type"
                label="Type d'activité"
                options={activityTypeOptions}
                value={activityType}
                onChange={handleActivityTypeChange}
                required
                disabled={isDisabled}
                error={errors.activityType}
            />

            {/* Date */}
            <Input
                id="activity-date"
                label="Date"
                type="datetime-local"
                value={isoToDatetimeLocal(date)}
                onChange={handleDateChange}
                required
                disabled={isDisabled}
                error={errors.date}
            />

            {/* Product (conditional) */}
            {showProductField && (
                <Select
                    id="activity-product"
                    label="Produit"
                    options={productOptions}
                    value={productId}
                    onChange={handleProductChange}
                    placeholder="Sélectionner un produit"
                    required={isProductRequired}
                    disabled={isDisabled || productsLoading}
                    error={errors.productId}
                />
            )}

            {/* Quantity */}
            <Input
                id="activity-quantity"
                label="Quantité"
                type="number"
                value={quantity}
                onChange={handleQuantityChange}
                placeholder="Ex: 5 ou -5"
                required
                disabled={isDisabled}
                error={errors.quantity}
                helperText={
                    activityType === ActivityType.SALE
                        ? "Généralement négative pour une vente"
                        : activityType === ActivityType.STOCK_CORRECTION
                          ? "Peut être positive ou négative"
                          : undefined
                }
            />

            {/* Amount */}
            <Input
                id="activity-amount"
                label="Montant"
                type="number"
                value={amount}
                onChange={handleAmountChange}
                placeholder="Ex: 99.95"
                required
                disabled={isDisabled}
                error={errors.amount}
            />

            {/* Note (optional) */}
            <Textarea
                id="activity-note"
                label="Note"
                value={note}
                onChange={handleNoteChange}
                placeholder="Informations supplémentaires (optionnel)"
                disabled={isDisabled}
                rows={3}
            />

            {/* Submit button */}
            <div className={styles.form__actions}>
                <Button type="submit" variant="primary" disabled={isDisabled} loading={isSubmitting} ariaLabel="Créer l'activité">
                    {isSubmitting ? "Création en cours..." : "Créer l'activité"}
                </Button>
            </div>
        </form>
    );
};

const AddActivityForm = React.memo(AddActivityFormComponent);
export default AddActivityForm;

