/**
 * AddActivityForm Component
 *
 * Form component for creating new activities with dynamic fields based on activity type.
 * Supports CREATION, SALE, STOCK_CORRECTION, and OTHER activity types with type-specific
 * field requirements and validation.
 *
 * Uses cascading product selection (Type → Model → Coloris) for improved UX and
 * consistency with ProductForm. Product identification is done by finding the product
 * that matches the selected modelId and colorisId combination.
 *
 * Type-specific behaviors (FBC-28):
 * - CREATION: Amount field hidden, quantity > 0 required, amount sent as 0
 * - SALE: Amount field shown, quantity > 0 (converted to negative on submission), amount > 0 required
 * - STOCK_CORRECTION: Amount field hidden, two separate fields "Add to stock" and "Reduce from stock" with exclusive input logic, amount sent as 0
 * - OTHER: Both fields shown, standard validation (no conversion)
 */

"use client";

import React from "react";
import { useAddActivity } from "@/presentation/hooks/useActivities";
import {
    useProducts,
    useProductModelsByType,
    useProductColorisByModel,
} from "@/presentation/hooks/useProducts";
import { ActivityType } from "@/core/domain/activity";
import type {
    ProductId,
    ProductType,
    ProductModelId,
    ProductColorisId,
} from "@/core/domain/product";
import { ProductType as ProductTypeEnum } from "@/core/domain/product";
import { formatProductType } from "@/shared/utils/product";
import { getAccessibilityId } from "@/shared/a11y/utils";
import { A11yIds } from "@/shared/a11y/ids";
import { useTranslation } from "@/presentation/hooks/useTranslation";
import Input from "@/presentation/components/ui/Input";
import Select from "@/presentation/components/ui/Select";
import type { SelectOption } from "@/presentation/components/ui/Select";
import Textarea from "@/presentation/components/ui/Textarea";
import Button from "@/presentation/components/ui/Button";
import { activityInputSchema } from "@/shared/validation/activitySchema";
import { mapZodErrorsToFormErrors } from "@/shared/validation/errorMapper";
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

    // Translation hooks
    const tActivity = useTranslation("forms.activity");
    const tActivityFields = useTranslation("forms.activity.fields");
    const tActivityProduct = useTranslation("forms.activity.fields.product");
    const tActivityModels = useTranslation("forms.activity.models");
    const tActivityColoris = useTranslation("forms.activity.coloris");
    const tActivityButton = useTranslation("forms.activity.button");

    // Form state
    const [activityType, setActivityType] = React.useState<ActivityType>(ActivityType.CREATION);
    const [date, setDate] = React.useState<string>(getCurrentDateTimeIso());
    const [selectedProductType, setSelectedProductType] = React.useState<ProductType | null>(null);
    const [selectedModelId, setSelectedModelId] = React.useState<ProductModelId | null>(null);
    const [selectedColorisId, setSelectedColorisId] = React.useState<ProductColorisId | null>(null);
    const [quantity, setQuantity] = React.useState<string>("");
    const [amount, setAmount] = React.useState<string>("");
    const [note, setNote] = React.useState<string>("");
    
    // STOCK_CORRECTION specific fields (FBC-28 Sub-Ticket 28.4)
    const [addToStock, setAddToStock] = React.useState<string>("");
    const [reduceFromStock, setReduceFromStock] = React.useState<string>("");

    // Field-level errors
    const [errors, setErrors] = React.useState<Record<string, string>>({});
    const [generalError, setGeneralError] = React.useState<string>("");

    // Fetch models and coloris using React Query hooks
    const {
        data: models,
        isLoading: isLoadingModels,
        error: modelsError,
    } = useProductModelsByType(selectedProductType);
    const {
        data: coloris,
        isLoading: isLoadingColoris,
        error: colorisError,
    } = useProductColorisByModel(selectedModelId);

    // Accessibility IDs
    const formErrorId = React.useMemo(() => getAccessibilityId(A11yIds.formError, "form"), []);

    // Track previous type and modelId to detect user changes (not initial mount)
    const prevTypeRef = React.useRef<ProductType | null>(selectedProductType);
    const prevModelIdRef = React.useRef<ProductModelId | null>(selectedModelId);

    // Product type options
    const productTypeOptions: SelectOption[] = React.useMemo(
        () =>
            Object.values(ProductTypeEnum).map((type) => ({
                value: type,
                label: formatProductType(type),
            })),
        []
    );

    // Convert models to Select options
    const modelOptions: SelectOption[] = React.useMemo(() => {
        if (!models || models.length === 0) {
            return [];
        }
        return models.map((model) => ({
            value: model.id,
            label: model.name,
        }));
    }, [models]);

    // Convert coloris to Select options
    const colorisOptions: SelectOption[] = React.useMemo(() => {
        if (!coloris || coloris.length === 0) {
            return [];
        }
        return coloris.map((c) => ({
            value: c.id,
            label: c.coloris,
        }));
    }, [coloris]);

    // Find productId from modelId + colorisId combination
    const productId: ProductId | undefined = React.useMemo(() => {
        if (!products || !selectedModelId || !selectedColorisId) {
            return undefined;
        }
        const matchingProduct = products.find(
            (p) => p.modelId === selectedModelId && p.colorisId === selectedColorisId
        );
        return matchingProduct?.id;
    }, [products, selectedModelId, selectedColorisId]);

    // Activity type options
    const activityTypeOptions: SelectOption[] = React.useMemo(
        () => [
            { value: ActivityType.CREATION, label: tActivityFields("type.options.CREATION") },
            { value: ActivityType.SALE, label: tActivityFields("type.options.SALE") },
            { value: ActivityType.STOCK_CORRECTION, label: tActivityFields("type.options.STOCK_CORRECTION") },
            { value: ActivityType.OTHER, label: tActivityFields("type.options.OTHER") },
        ],
        [tActivityFields]
    );

    // Clear errors when fields change
    const clearFieldError = React.useCallback((fieldName: string) => {
        setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[fieldName];
            return newErrors;
        });
    }, []);

    // Clear dependent fields when type changes (cascading filter)
    // Only clear when type actually changes (not on initial mount)
    React.useEffect(() => {
        if (prevTypeRef.current !== selectedProductType) {
            setSelectedModelId(null);
            setSelectedColorisId(null);
            clearFieldError("selectedModelId");
            clearFieldError("selectedColorisId");
            prevTypeRef.current = selectedProductType;
        }
    }, [selectedProductType, clearFieldError]);

    // Clear coloris when model changes (cascading filter)
    // Use a ref to track previous modelId to avoid clearing on initial mount
    React.useEffect(() => {
        if (prevModelIdRef.current !== selectedModelId && selectedModelId !== null) {
            setSelectedColorisId(null);
            clearFieldError("selectedColorisId");
            prevModelIdRef.current = selectedModelId;
        } else if (selectedModelId === null) {
            prevModelIdRef.current = null;
        }
    }, [selectedModelId, clearFieldError]);

    // Auto-select coloris if only one is available
    React.useEffect(() => {
        if (
            coloris &&
            coloris.length === 1 &&
            selectedColorisId === null &&
            selectedModelId !== null
        ) {
            setSelectedColorisId(coloris[0].id);
        }
    }, [coloris, selectedModelId, selectedColorisId]);

    // Handle activity type change
    const handleActivityTypeChange = React.useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            const newType = e.target.value as ActivityType;
            
            // Reset amount when switching to/from types that don't need it (FBC-28)
            const previousShowAmount = 
                activityType === ActivityType.SALE || 
                activityType === ActivityType.OTHER;
            const newShowAmount = 
                newType === ActivityType.SALE || 
                newType === ActivityType.OTHER;
            
            if (previousShowAmount && !newShowAmount) {
                // Switching from type that shows amount to type that hides it
                setAmount("");
            }
            
            // Reset STOCK_CORRECTION fields when switching away from STOCK_CORRECTION (FBC-28 Sub-Ticket 28.4)
            if (activityType === ActivityType.STOCK_CORRECTION && newType !== ActivityType.STOCK_CORRECTION) {
                setAddToStock("");
                setReduceFromStock("");
            }
            
            setActivityType(newType);
            // Clear product selections when switching to types that don't require it
            // Only OTHER doesn't require a product (CREATION, SALE, STOCK_CORRECTION all require it)
            if (newType === ActivityType.OTHER) {
                setSelectedProductType(null);
                setSelectedModelId(null);
                setSelectedColorisId(null);
            }
            // Clear errors
            setErrors({});
            setGeneralError("");
        },
        [activityType]
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

    // Handle product type change
    const handleProductTypeChange = React.useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            const newType = e.target.value as ProductType;
            setSelectedProductType(newType || null);
            clearFieldError("selectedProductType");
            // Model and coloris will be cleared by useEffect when type changes
        },
        [clearFieldError]
    );

    // Handle model change
    const handleModelChange = React.useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            const selectedModelIdValue = e.target.value;
            setSelectedModelId(selectedModelIdValue ? (selectedModelIdValue as ProductModelId) : null);
            clearFieldError("selectedModelId");
            // Coloris will be cleared by useEffect when model changes
        },
        [clearFieldError]
    );

    // Handle coloris change
    const handleColorisChange = React.useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            const selectedColorisIdValue = e.target.value;
            setSelectedColorisId(
                selectedColorisIdValue ? (selectedColorisIdValue as ProductColorisId) : null
            );
            clearFieldError("selectedColorisId");
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
    
    // Handle STOCK_CORRECTION "Add to stock" change (FBC-28 Sub-Ticket 28.4)
    // Exclusive logic: if user fills this field, clear "Reduce from stock"
    const handleAddToStockChange = React.useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = e.target.value;
            setAddToStock(newValue);
            // Clear the other field if this one is being filled
            if (newValue && newValue.trim() !== "") {
                setReduceFromStock("");
            }
            clearFieldError("addToStock");
            clearFieldError("reduceFromStock");
        },
        [clearFieldError]
    );
    
    // Handle STOCK_CORRECTION "Reduce from stock" change (FBC-28 Sub-Ticket 28.4)
    // Exclusive logic: if user fills this field, clear "Add to stock"
    const handleReduceFromStockChange = React.useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = e.target.value;
            setReduceFromStock(newValue);
            // Clear the other field if this one is being filled
            if (newValue && newValue.trim() !== "") {
                setAddToStock("");
            }
            clearFieldError("addToStock");
            clearFieldError("reduceFromStock");
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

    // Validate form using Zod schema (FBC-17)
    const validateForm = React.useCallback((): boolean => {
        // Prepare form data for validation
        const formData: Record<string, unknown> = {
            date,
            type: activityType,
            note: note.trim() || undefined,
        };

        // Add product selection fields based on activity type
        const requiresProduct =
            activityType === ActivityType.CREATION ||
            activityType === ActivityType.SALE ||
            activityType === ActivityType.STOCK_CORRECTION;

        if (requiresProduct) {
            // Product is required - include all fields
            formData.productId = productId || "";
            formData.selectedProductType = selectedProductType || undefined;
            formData.selectedModelId = selectedModelId || "";
            formData.selectedColorisId = selectedColorisId || "";
        } else {
            // Product is optional (OTHER type) - include only if any field is set
            if (productId || selectedProductType || selectedModelId || selectedColorisId) {
                formData.productId = productId || "";
                formData.selectedProductType = selectedProductType || undefined;
                formData.selectedModelId = selectedModelId || "";
                formData.selectedColorisId = selectedColorisId || "";
            }
        }

        // Add type-specific fields
        if (activityType === ActivityType.STOCK_CORRECTION) {
            formData.addToStock = addToStock || undefined;
            formData.reduceFromStock = reduceFromStock || undefined;
            formData.amount = "0";
        } else {
            formData.quantity = quantity;
            if (activityType === ActivityType.CREATION) {
                formData.amount = "0";
            } else {
                formData.amount = amount;
            }
        }

        // Validate with Zod schema
        const result = activityInputSchema.safeParse(formData);

        if (!result.success) {
            // Map Zod errors to form errors with i18n messages
            const zodErrors = mapZodErrorsToFormErrors(result.error);
            const newErrors: Record<string, string> = {};

            // Check if product selections are complete (all selection fields are filled)
            // This helps distinguish between "selection incomplete" vs "product not found"
            const isProductSelectionComplete =
                requiresProduct &&
                selectedProductType !== undefined &&
                selectedModelId !== undefined &&
                selectedColorisId !== undefined;

            // Track if productId has a Zod error (needed to handle Bug 2)
            const hasProductIdZodError = zodErrors.productId !== undefined;

            // Map error keys to i18n messages
            Object.entries(zodErrors).forEach(([field, errorKey]) => {
                if (field === "date") {
                    newErrors.date = tActivityFields(`date.${errorKey}`);
                } else if (field === "type") {
                    newErrors.type = tActivityFields(`type.${errorKey}`);
                } else if (field === "quantity") {
                    newErrors.quantity = tActivityFields(`quantity.${errorKey}`);
                } else if (field === "amount") {
                    newErrors.amount = tActivityFields(`amount.${errorKey}`);
                } else if (field === "addToStock") {
                    newErrors.addToStock = tActivityFields(`addToStock.${errorKey}`);
                } else if (field === "reduceFromStock") {
                    newErrors.reduceFromStock = tActivityFields(`reduceFromStock.${errorKey}`);
                } else if (field === "productId") {
                    // Only map productId error if selection is incomplete
                    // If selection is complete, we'll show "not_found" error instead (handled below)
                    if (!isProductSelectionComplete) {
                        newErrors.selectedProductType = tActivityProduct(`type.${errorKey}`);
                    }
                    // Note: If selection is complete, the productId error will be handled below as "not_found"
                } else if (field === "selectedProductType") {
                    newErrors.selectedProductType = tActivityProduct(`type.${errorKey}`);
                } else if (field === "selectedModelId") {
                    newErrors.selectedModelId = tActivityProduct(`model.${errorKey}`);
                } else if (field === "selectedColorisId") {
                    newErrors.selectedColorisId = tActivityProduct(`coloris.${errorKey}`);
                }
            });

            // Check if productId is missing but required (product not found)
            // Add this error if:
            // 1. Product is required for this activity type
            // 2. Product selection is complete (all fields filled)
            // 3. Either productId is missing OR Zod reported an error on productId (Bug 2 fix)
            //    - If Zod reported an error on productId when selection is complete, it means product not found
            //    - We show "not_found" even if other selection fields have errors (prioritize productId error)
            // Note: If selection is incomplete, productId errors are already mapped to selectedProductType above
            if (
                requiresProduct &&
                isProductSelectionComplete &&
                (!productId || hasProductIdZodError)
            ) {
                newErrors.productId = tActivityProduct("not_found");
            }

            setErrors(newErrors);
            return false;
        }

        // Validation successful
        setErrors({});
        return true;
    }, [
        date,
        activityType,
        quantity,
        amount,
        addToStock,
        reduceFromStock,
        note,
        productId,
        selectedProductType,
        selectedModelId,
        selectedColorisId,
        tActivityFields,
        tActivityProduct,
    ]);

    // Handle form submission (with type-specific quantity conversion and amount handling - FBC-28)
    const handleSubmit = React.useCallback(
        (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            setGeneralError("");

            const isValid = validateForm();
            if (!isValid) {
                return;
            }

            // Parse quantity and apply type-specific conversions (FBC-28)
            let finalQuantity: number;
            
            if (activityType === ActivityType.STOCK_CORRECTION) {
                // STOCK_CORRECTION: Calculate quantity from two separate fields (FBC-28 Sub-Ticket 28.4)
                const addNum = addToStock && addToStock.trim() !== "" ? Number.parseFloat(addToStock) : 0;
                const reduceNum = reduceFromStock && reduceFromStock.trim() !== "" ? Number.parseFloat(reduceFromStock) : 0;
                finalQuantity = addNum - reduceNum;
            } else {
                // Other types: use standard quantity field
                finalQuantity = Number.parseFloat(quantity);
                
                // SALE: Convert positive quantity to negative (user enters positive, system stores negative)
                if (activityType === ActivityType.SALE) {
                    finalQuantity = -Math.abs(finalQuantity);
                }
            }
            
            // Calculate amount based on type (FBC-28)
            let finalAmount: number;
            if (activityType === ActivityType.CREATION || activityType === ActivityType.STOCK_CORRECTION) {
                // CREATION and STOCK_CORRECTION: amount is 0
                finalAmount = 0;
            } else {
                // SALE and OTHER: use entered amount
                finalAmount = Number.parseFloat(amount);
            }

            const activityData = {
                date,
                type: activityType,
                productId: productId as ProductId | undefined,
                quantity: finalQuantity,
                amount: finalAmount,
                note: note.trim() || undefined,
            };

            addActivityMutation.mutate(activityData, {
                onSuccess: () => {
                    // Reset form
                    setActivityType(ActivityType.CREATION);
                    setDate(getCurrentDateTimeIso());
                    setSelectedProductType(null);
                    setSelectedModelId(null);
                    setSelectedColorisId(null);
                    setQuantity("");
                    setAmount("");
                    setNote("");
                    setAddToStock("");
                    setReduceFromStock("");
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
                        setGeneralError(tActivity("errors.create"));
                    }
                },
            });
        },
        [
            date,
            activityType,
            productId,
            quantity,
            amount,
            note,
            addToStock,
            reduceFromStock,
            validateForm,
            addActivityMutation,
            onSuccess,
            tActivity,
        ]
    );

    const isSubmitting = addActivityMutation.isPending;
    const isDisabled =
        isSubmitting || productsLoading || isLoadingModels || isLoadingColoris;

    // Determine which fields to show based on activity type (FBC-28)
    const showProductField =
        activityType === ActivityType.CREATION ||
        activityType === ActivityType.SALE ||
        activityType === ActivityType.STOCK_CORRECTION ||
        activityType === ActivityType.OTHER;
    const isProductRequired =
        activityType === ActivityType.CREATION ||
        activityType === ActivityType.SALE ||
        activityType === ActivityType.STOCK_CORRECTION;
    
    // Amount field only shown for SALE and OTHER (FBC-28)
    const showAmountField = 
        activityType === ActivityType.SALE || 
        activityType === ActivityType.OTHER;
    
    // Dynamic labels and helper texts based on activity type (FBC-28)
    const quantityLabelKey = React.useMemo(() => {
        if (activityType === ActivityType.SALE) {
            return "label_sale";
        }
        return "label";
    }, [activityType]);
    
    const quantityLabel = React.useMemo(
        () => tActivityFields(`quantity.${quantityLabelKey}`),
        [quantityLabelKey, tActivityFields]
    );
    
    const quantityHelperTextKey = React.useMemo(() => {
        switch (activityType) {
            case ActivityType.CREATION:
                return "helper_creation";
            case ActivityType.SALE:
                return "helper_sale";
            case ActivityType.STOCK_CORRECTION:
                return "helper_correction";
            default:
                return undefined;
        }
    }, [activityType]);
    
    const quantityHelperText = React.useMemo(() => {
        if (quantityHelperTextKey) {
            return tActivityFields(`quantity.${quantityHelperTextKey}`);
        }
        return undefined;
    }, [quantityHelperTextKey, tActivityFields]);

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
                label={tActivityFields("type.label")}
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
                label={tActivityFields("date.label")}
                type="datetime-local"
                value={isoToDatetimeLocal(date)}
                onChange={handleDateChange}
                required
                disabled={isDisabled}
                error={errors.date}
            />

            {/* Product Selection (conditional) - Cascading dropdowns */}
            {showProductField && (
                <>
                    {/* Product Type */}
                    <Select
                        id="activity-product-type"
                        label={tActivityProduct("type.label")}
                        options={productTypeOptions}
                        value={selectedProductType || ""}
                        onChange={handleProductTypeChange}
                        placeholder={tActivityProduct("type.placeholder")}
                        required={isProductRequired}
                        disabled={isDisabled}
                        error={errors.selectedProductType}
                    />

                    {/* Product Model */}
                    <Select
                        id="activity-product-model"
                        label={tActivityProduct("model.label")}
                        options={modelOptions}
                        value={selectedModelId || ""}
                        onChange={handleModelChange}
                        required={isProductRequired}
                        disabled={isDisabled || !selectedProductType || isLoadingModels}
                        error={
                            errors.selectedModelId ||
                            (modelsError ? tActivityModels("error") : undefined)
                        }
                        placeholder={
                            isLoadingModels
                                ? tActivityModels("loading")
                                : !selectedProductType
                                  ? tActivityProduct("model.placeholder_no_type")
                                  : tActivityProduct("model.placeholder")
                        }
                    />

                    {/* Coloris */}
                    <Select
                        id="activity-product-coloris"
                        label={tActivityProduct("coloris.label")}
                        options={colorisOptions}
                        value={selectedColorisId || ""}
                        onChange={handleColorisChange}
                        required={isProductRequired}
                        disabled={isDisabled || !selectedModelId || isLoadingColoris}
                        error={
                            errors.selectedColorisId ||
                            (colorisError ? tActivityColoris("error") : undefined)
                        }
                        placeholder={
                            isLoadingColoris
                                ? tActivityColoris("loading")
                                : !selectedModelId
                                  ? tActivityProduct("coloris.placeholder_no_model")
                                  : tActivityProduct("coloris.placeholder")
                        }
                    />

                    {/* Product ID validation error */}
                    {errors.productId && (
                        <div className={styles.form__error} role="alert" aria-live="assertive">
                            {errors.productId}
                        </div>
                    )}
                </>
            )}

            {/* Quantity fields - conditional rendering based on type (FBC-28 Sub-Ticket 28.4) */}
            {activityType === ActivityType.STOCK_CORRECTION ? (
                <>
                    {/* STOCK_CORRECTION: Two separate fields with exclusive logic */}
                    <Input
                        id="activity-add-to-stock"
                        label={tActivityFields("addToStock.label")}
                        type="number"
                        value={addToStock}
                        onChange={handleAddToStockChange}
                        placeholder={tActivityFields("addToStock.placeholder")}
                        disabled={isDisabled}
                        error={errors.addToStock}
                        helperText={tActivityFields("addToStock.helper")}
                    />
                    <Input
                        id="activity-reduce-from-stock"
                        label={tActivityFields("reduceFromStock.label")}
                        type="number"
                        value={reduceFromStock}
                        onChange={handleReduceFromStockChange}
                        placeholder={tActivityFields("reduceFromStock.placeholder")}
                        disabled={isDisabled}
                        error={errors.reduceFromStock}
                        helperText={tActivityFields("reduceFromStock.helper")}
                    />
                </>
            ) : (
                /* Other types: Standard quantity field */
                <Input
                    id="activity-quantity"
                    label={quantityLabel}
                    type="number"
                    value={quantity}
                    onChange={handleQuantityChange}
                    placeholder={
                        activityType === ActivityType.SALE || activityType === ActivityType.CREATION
                            ? tActivityFields("quantity.placeholder_sale")
                            : tActivityFields("quantity.placeholder_other")
                    }
                    required
                    disabled={isDisabled}
                    error={errors.quantity}
                    helperText={quantityHelperText}
                />
            )}

            {/* Amount (conditional rendering - FBC-28) */}
            {showAmountField && (
                <Input
                    id="activity-amount"
                    label={tActivityFields("amount.label")}
                    type="number"
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder={tActivityFields("amount.placeholder")}
                    required
                    disabled={isDisabled}
                    error={errors.amount}
                />
            )}

            {/* Note (optional) */}
            <Textarea
                id="activity-note"
                label={tActivityFields("note.label")}
                value={note}
                onChange={handleNoteChange}
                placeholder={tActivityFields("note.placeholder")}
                disabled={isDisabled}
                rows={3}
            />

            {/* Submit button */}
            <div className={styles.form__actions}>
                <Button
                    type="submit"
                    variant="primary"
                    disabled={isDisabled}
                    loading={isSubmitting}
                    ariaLabel={tActivityButton("aria_create")}
                >
                    {isSubmitting ? tActivityButton("create_loading") : tActivityButton("create")}
                </Button>
            </div>
        </form>
    );
};

const AddActivityForm = React.memo(AddActivityFormComponent);
export default AddActivityForm;

