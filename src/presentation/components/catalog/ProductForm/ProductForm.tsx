/**
 * ProductForm Component
 *
 * Reusable form component for creating and editing products.
 * Supports both create and edit modes with proper validation and accessibility.
 */

"use client";

import React from "react";
import type { Product } from "@/core/domain/product";
import { ProductType } from "@/core/domain/product";
import { getAccessibilityId } from "@/shared/a11y/utils";
import { A11yIds } from "@/shared/a11y/ids";
import Input from "@/presentation/components/ui/Input";
import Select, { type SelectOption } from "@/presentation/components/ui/Select";
import Button from "@/presentation/components/ui/Button";
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
    // Form state
    const [name, setName] = React.useState<string>(initialValues?.name || "");
    const [type, setType] = React.useState<ProductType>(
        initialValues?.type || ProductType.SAC_BANANE
    );
    const [coloris, setColoris] = React.useState<string>(initialValues?.coloris || "");
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

    // Update form state when initialValues change (for edit mode)
    React.useEffect(() => {
        if (initialValues) {
            setName(initialValues.name || "");
            setType(initialValues.type || ProductType.SAC_BANANE);
            setColoris(initialValues.coloris || "");
            setUnitCost(initialValues.unitCost?.toString() || "");
            setSalePrice(initialValues.salePrice?.toString() || "");
            setStock(initialValues.stock?.toString() || "");
            setWeight(initialValues.weight?.toString() || "");
        }
    }, [initialValues]);

    // Clear errors when fields change
    const clearFieldError = React.useCallback((fieldName: string) => {
        setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[fieldName];
            return newErrors;
        });
    }, []);

    // Event handlers
    const handleNameChange = React.useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setName(e.target.value);
            clearFieldError("name");
        },
        [clearFieldError]
    );

    const handleTypeChange = React.useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            setType(e.target.value as ProductType);
            clearFieldError("type");
        },
        [clearFieldError]
    );

    const handleColorisChange = React.useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setColoris(e.target.value);
            clearFieldError("coloris");
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

    // Validate form
    const validateForm = React.useCallback((): boolean => {
        const newErrors: Record<string, string> = {};

        // Validate name
        if (!name || name.trim() === "") {
            newErrors.name = "Le nom est requis";
        }

        // Validate type
        if (!type) {
            newErrors.type = "Le type est requis";
        }

        // Validate coloris
        if (!coloris || coloris.trim() === "") {
            newErrors.coloris = "Le coloris est requis";
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

        // Validate weight (optional, but if provided must be > 0)
        if (weight && weight.trim() !== "") {
            const weightNum = Number.parseFloat(weight);
            if (Number.isNaN(weightNum) || !Number.isFinite(weightNum)) {
                newErrors.weight = "Le poids doit être un nombre valide";
            } else if (weightNum <= 0) {
                newErrors.weight = "Le poids doit être supérieur à 0";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [name, type, coloris, unitCost, salePrice, stock, weight]);

    // Handle form submission
    const handleSubmit = React.useCallback(
        (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            setGeneralError("");

            const isValid = validateForm();
            if (!isValid) {
                return;
            }

            const formData: ProductFormData = {
                name: name.trim(),
                type,
                coloris: coloris.trim(),
                unitCost: Number.parseFloat(unitCost),
                salePrice: Number.parseFloat(salePrice),
                stock: Number.parseFloat(stock),
                weight: weight && weight.trim() !== "" ? Number.parseFloat(weight) : undefined,
            };

            onSubmit(formData);
        },
        [name, type, coloris, unitCost, salePrice, stock, weight, validateForm, onSubmit]
    );

    const isDisabled = isLoading;

    return (
        <form onSubmit={handleSubmit} className={styles.form} noValidate>
            {/* General error message */}
            {generalError && (
                <div id={formErrorId} className={styles.form__error} role="alert" aria-live="assertive">
                    {generalError}
                </div>
            )}

            {/* Name */}
            <Input
                id="product-name"
                label="Nom"
                type="text"
                value={name}
                onChange={handleNameChange}
                placeholder="Ex: Sac banane L'Assumée"
                required
                disabled={isDisabled}
                error={errors.name}
            />

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
            />

            {/* Coloris */}
            <Input
                id="product-coloris"
                label="Coloris"
                type="text"
                value={coloris}
                onChange={handleColorisChange}
                placeholder="Ex: Rose pâle à motifs"
                required
                disabled={isDisabled}
                error={errors.coloris}
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

