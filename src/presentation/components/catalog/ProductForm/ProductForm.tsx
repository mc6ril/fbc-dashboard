/**
 * ProductForm Component
 *
 * Reusable form component for creating and editing products.
 * Supports both create and edit modes with proper validation and accessibility.
 */

"use client";

import React from "react";
import type {
    Product,
    ProductModelId,
    ProductColorisId,
} from "@/core/domain/product";
import { ProductType } from "@/core/domain/product";
import { getAccessibilityId } from "@/shared/a11y/utils";
import { A11yIds } from "@/shared/a11y/ids";
import Input from "@/presentation/components/ui/Input";
import Select, { type SelectOption } from "@/presentation/components/ui/Select";
import Button from "@/presentation/components/ui/Button";
import {
    useProductModelsByType,
    useProductColorisByModel,
} from "@/presentation/hooks/useProducts";
import styles from "./ProductForm.module.scss";

type ProductFormData = Omit<Product, "id">;

type Props = {
    /** Form mode: 'create' or 'edit' */
    mode: "create" | "edit";
    /** Initial values for edit mode */
    initialValues?: ProductFormData;
    /** Callback when form is submitted with valid data */
    onSubmit: (data: ProductFormData) => void;
    /** Whether form is in loading/submitting state */
    isLoading?: boolean;
};

/**
 * Formats a product type to a human-readable label.
 *
 * @param {ProductType} type - Product type
 * @returns {string} Human-readable label
 */
const formatProductType = (type: ProductType): string => {
    switch (type) {
        case ProductType.SAC_BANANE:
            return "Sac banane";
        case ProductType.POCHETTE_ORDINATEUR:
            return "Pochette ordinateur";
        case ProductType.TROUSSE_TOILETTE:
            return "Trousse de toilette";
        case ProductType.POCHETTE_VOLANTS:
            return "Pochette à volants";
        case ProductType.TROUSSE_ZIPPEE:
            return "Trousse zippée";
        case ProductType.ACCESSOIRES_DIVERS:
            return "Accessoires divers";
        default:
            return type;
    }
};

const ProductFormComponent = ({ mode, initialValues, onSubmit, isLoading = false }: Props) => {
    // Form state - using new structure (modelId, colorisId)
    const [type, setType] = React.useState<ProductType>(
        initialValues?.type || ProductType.SAC_BANANE
    );
    const [modelId, setModelId] = React.useState<ProductModelId | null>(
        initialValues?.modelId || null
    );
    const [colorisId, setColorisId] = React.useState<ProductColorisId | null>(
        initialValues?.colorisId || null
    );
    const [unitCost, setUnitCost] = React.useState<string>(
        initialValues?.unitCost?.toString() || ""
    );
    const [salePrice, setSalePrice] = React.useState<string>(
        initialValues?.salePrice?.toString() || ""
    );
    const [stock, setStock] = React.useState<string>(initialValues?.stock?.toString() || "");
    const [weight, setWeight] = React.useState<string>(
        initialValues?.weight?.toString() || ""
    );

    // Field-level errors
    const [errors, setErrors] = React.useState<Record<string, string>>({});
    const [generalError, setGeneralError] = React.useState<string>("");

    // Fetch models and coloris using React Query hooks
    const { data: models, isLoading: isLoadingModels, error: modelsError } =
        useProductModelsByType(type);
    const { data: coloris, isLoading: isLoadingColoris, error: colorisError } =
        useProductColorisByModel(modelId);

    // Accessibility IDs
    const formErrorId = React.useMemo(() => getAccessibilityId(A11yIds.formError, "form"), []);

    // Product type options
    const productTypeOptions: SelectOption[] = React.useMemo(
        () => [
            { value: ProductType.SAC_BANANE, label: formatProductType(ProductType.SAC_BANANE) },
            {
                value: ProductType.POCHETTE_ORDINATEUR,
                label: formatProductType(ProductType.POCHETTE_ORDINATEUR),
            },
            {
                value: ProductType.TROUSSE_TOILETTE,
                label: formatProductType(ProductType.TROUSSE_TOILETTE),
            },
            {
                value: ProductType.POCHETTE_VOLANTS,
                label: formatProductType(ProductType.POCHETTE_VOLANTS),
            },
            {
                value: ProductType.TROUSSE_ZIPPEE,
                label: formatProductType(ProductType.TROUSSE_ZIPPEE),
            },
            {
                value: ProductType.ACCESSOIRES_DIVERS,
                label: formatProductType(ProductType.ACCESSOIRES_DIVERS),
            },
        ],
        []
    );

    // Track previous type to detect user changes (not initial mount)
    const prevTypeRef = React.useRef<ProductType>(type);

    // Clear errors when fields change
    const clearFieldError = React.useCallback((fieldName: string) => {
        setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[fieldName];
            return newErrors;
        });
    }, []);

    // Update form state when initialValues change (for edit mode)
    // Supports both new structure (modelId, colorisId) and old structure (name, type, coloris) for backward compatibility
    React.useEffect(() => {
        if (initialValues) {
            const newType = initialValues.type || ProductType.SAC_BANANE;
            setType(newType);
            prevTypeRef.current = newType;
            // Prioritize new structure (modelId, colorisId) over old structure (name, coloris)
            if (initialValues.modelId) {
                setModelId(initialValues.modelId);
            } else {
                setModelId(null);
            }
            if (initialValues.colorisId) {
                setColorisId(initialValues.colorisId);
            } else {
                setColorisId(null);
            }
            // Note: During migration period, if initialValues only has name/coloris but not modelId/colorisId,
            // we would need to look them up. For now, we prioritize new structure.
            // Old structure will be handled by the repository joins.
            setUnitCost(initialValues.unitCost?.toString() || "");
            setSalePrice(initialValues.salePrice?.toString() || "");
            setStock(initialValues.stock?.toString() || "");
            setWeight(initialValues.weight?.toString() || "");
        }
    }, [initialValues]);

    // Clear dependent fields when type changes (cascading filter)
    // Only clear when type actually changes (not on initial mount)
    React.useEffect(() => {
        if (prevTypeRef.current !== type) {
            setModelId(null);
            setColorisId(null);
            clearFieldError("modelId");
            clearFieldError("colorisId");
            prevTypeRef.current = type;
        }
    }, [type, clearFieldError]);

    // Clear coloris when model changes (cascading filter)
    // Use a ref to track previous modelId to avoid clearing on initial mount
    const prevModelIdRef = React.useRef<ProductModelId | null>(modelId);
    React.useEffect(() => {
        if (prevModelIdRef.current !== modelId && modelId !== null) {
            setColorisId(null);
            clearFieldError("colorisId");
            prevModelIdRef.current = modelId;
        } else if (modelId === null) {
            prevModelIdRef.current = null;
        }
    }, [modelId, clearFieldError]);

    // Event handlers
    const handleTypeChange = React.useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            setType(e.target.value as ProductType);
            clearFieldError("type");
            // Model and coloris will be cleared by useEffect when type changes
        },
        [clearFieldError]
    );

    const handleModelChange = React.useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            const selectedModelId = e.target.value;
            setModelId(selectedModelId ? (selectedModelId as ProductModelId) : null);
            clearFieldError("modelId");
            // Coloris will be cleared by useEffect when model changes
        },
        [clearFieldError]
    );

    const handleColorisChange = React.useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            const selectedColorisId = e.target.value;
            setColorisId(selectedColorisId ? (selectedColorisId as ProductColorisId) : null);
            clearFieldError("colorisId");
        },
        [clearFieldError]
    );

    const handleUnitCostChange = React.useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setUnitCost(e.target.value);
            clearFieldError("unitCost");
        },
        [clearFieldError]
    );

    const handleSalePriceChange = React.useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setSalePrice(e.target.value);
            clearFieldError("salePrice");
        },
        [clearFieldError]
    );

    const handleStockChange = React.useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setStock(e.target.value);
            clearFieldError("stock");
        },
        [clearFieldError]
    );

    const handleWeightChange = React.useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setWeight(e.target.value);
            clearFieldError("weight");
        },
        [clearFieldError]
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

    // Validate form
    const validateForm = React.useCallback((): boolean => {
        const newErrors: Record<string, string> = {};

        // Validate type
        if (!type) {
            newErrors.type = "Le type est requis";
        }

        // Validate modelId
        if (!modelId) {
            newErrors.modelId = "Le modèle est requis";
        }

        // Validate colorisId
        if (!colorisId) {
            newErrors.colorisId = "Le coloris est requis";
        }

        // Validate unitCost
        if (!unitCost || unitCost.trim() === "") {
            newErrors.unitCost = "Le coût unitaire est requis";
        } else {
            const unitCostNum = Number.parseFloat(unitCost);
            if (Number.isNaN(unitCostNum) || !Number.isFinite(unitCostNum)) {
                newErrors.unitCost = "Le coût unitaire doit être un nombre valide";
            } else if (unitCostNum <= 0) {
                newErrors.unitCost = "Le coût unitaire doit être supérieur à 0";
            }
        }

        // Validate salePrice
        if (!salePrice || salePrice.trim() === "") {
            newErrors.salePrice = "Le prix de vente est requis";
        } else {
            const salePriceNum = Number.parseFloat(salePrice);
            if (Number.isNaN(salePriceNum) || !Number.isFinite(salePriceNum)) {
                newErrors.salePrice = "Le prix de vente doit être un nombre valide";
            } else if (salePriceNum <= 0) {
                newErrors.salePrice = "Le prix de vente doit être supérieur à 0";
            }
        }

        // Validate stock
        if (!stock || stock.trim() === "") {
            newErrors.stock = "Le stock est requis";
        } else {
            const stockNum = Number.parseFloat(stock);
            if (Number.isNaN(stockNum) || !Number.isFinite(stockNum)) {
                newErrors.stock = "Le stock doit être un nombre valide";
            } else if (stockNum < 0) {
                newErrors.stock = "Le stock doit être supérieur ou égal à 0";
            }
        }

        // Validate weight (optional, but if provided must be > 0 and integer)
        if (weight && weight.trim() !== "") {
            const weightNum = Number.parseInt(weight, 10);
            if (Number.isNaN(weightNum) || !Number.isFinite(weightNum)) {
                newErrors.weight = "Le poids doit être un nombre entier valide (en grammes)";
            } else if (weightNum <= 0) {
                newErrors.weight = "Le poids doit être supérieur à 0";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [type, modelId, colorisId, unitCost, salePrice, stock, weight]);

    // Handle form submission
    const handleSubmit = React.useCallback(
        (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            setGeneralError("");

            const isValid = validateForm();
            if (!isValid) {
                return;
            }

            if (!modelId || !colorisId) {
                setGeneralError("Veuillez sélectionner un modèle et un coloris");
                return;
            }

            const formData: ProductFormData = {
                modelId,
                colorisId,
                unitCost: Number.parseFloat(unitCost),
                salePrice: Number.parseFloat(salePrice),
                stock: Number.parseFloat(stock),
                weight: weight && weight.trim() !== "" ? Number.parseInt(weight, 10) : undefined,
            };

            onSubmit(formData);
        },
        [modelId, colorisId, unitCost, salePrice, stock, weight, validateForm, onSubmit]
    );

    const isDisabled = isLoading || isLoadingModels || isLoadingColoris;

    return (
        <form onSubmit={handleSubmit} className={styles.form} noValidate>
            {/* General error message */}
            {generalError && (
                <div id={formErrorId} className={styles.form__error} role="alert" aria-live="assertive">
                    {generalError}
                </div>
            )}

            {/* Type */}
            <Select
                id="product-type"
                label="Type"
                options={productTypeOptions}
                value={type}
                onChange={handleTypeChange}
                required
                disabled={isDisabled}
                error={errors.type}
                placeholder="Sélectionnez un type"
            />

            {/* Model */}
            <Select
                id="product-model"
                label="Modèle"
                options={modelOptions}
                value={modelId || ""}
                onChange={handleModelChange}
                required
                disabled={isDisabled || !type || isLoadingModels}
                error={errors.modelId || (modelsError ? "Erreur lors du chargement des modèles" : undefined)}
                placeholder={
                    isLoadingModels
                        ? "Chargement des modèles..."
                        : !type
                          ? "Sélectionnez d'abord un type"
                          : "Sélectionnez un modèle"
                }
            />

            {/* Coloris */}
            <Select
                id="product-coloris"
                label="Coloris"
                options={colorisOptions}
                value={colorisId || ""}
                onChange={handleColorisChange}
                required
                disabled={isDisabled || !modelId || isLoadingColoris}
                error={errors.colorisId || (colorisError ? "Erreur lors du chargement des coloris" : undefined)}
                placeholder={
                    isLoadingColoris
                        ? "Chargement des coloris..."
                        : !modelId
                          ? "Sélectionnez d'abord un modèle"
                          : "Sélectionnez un coloris"
                }
            />

            {/* Unit Cost */}
            <Input
                id="product-unit-cost"
                label="Coût unitaire"
                type="number"
                value={unitCost}
                onChange={handleUnitCostChange}
                placeholder="Ex: 10.50"
                required
                disabled={isDisabled}
                error={errors.unitCost}
            />

            {/* Sale Price */}
            <Input
                id="product-sale-price"
                label="Prix de vente"
                type="number"
                value={salePrice}
                onChange={handleSalePriceChange}
                placeholder="Ex: 19.99"
                required
                disabled={isDisabled}
                error={errors.salePrice}
            />

            {/* Stock */}
            <Input
                id="product-stock"
                label="Stock"
                type="number"
                value={stock}
                onChange={handleStockChange}
                placeholder="Ex: 100"
                required
                disabled={isDisabled}
                error={errors.stock}
            />

            {/* Weight (optional) */}
            <Input
                id="product-weight"
                label="Poids (optionnel)"
                type="number"
                value={weight}
                onChange={handleWeightChange}
                placeholder="Ex: 150 (en grammes)"
                disabled={isDisabled}
                error={errors.weight}
                helperText="Poids en grammes (optionnel)"
            />

            {/* Submit button */}
            <div className={styles.form__actions}>
                <Button
                    type="submit"
                    variant="primary"
                    disabled={isDisabled}
                    loading={isLoading}
                    ariaLabel={mode === "create" ? "Créer le produit" : "Mettre à jour le produit"}
                >
                    {isLoading
                        ? mode === "create"
                          ? "Création en cours..."
                          : "Mise à jour en cours..."
                        : mode === "create"
                          ? "Créer le produit"
                          : "Mettre à jour le produit"}
                </Button>
            </div>
        </form>
    );
};

const ProductForm = React.memo(ProductFormComponent);

export default ProductForm;

