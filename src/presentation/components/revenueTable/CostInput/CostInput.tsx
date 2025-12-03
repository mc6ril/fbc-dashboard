/**
 * CostInput Component
 *
 * Reusable input component for monthly cost entry (shipping, marketing, overhead).
 * Provides controlled input with validation, save on blur or explicit save button,
 * loading state, and success/error feedback.
 * Provides proper accessibility (WCAG 2.1 AA) with ARIA attributes.
 *
 * The component:
 * - Controlled input with validation (numeric, >= 0)
 * - Save on blur or explicit save button
 * - Loading state during save
 * - Success/error feedback
 * - Accessible (label, aria-describedby for errors)
 * - Reusable for shipping and indirect costs (via props)
 *
 * @component
 */

"use client";

import React from "react";
import type { MonthlyCost } from "@/core/domain/cost";
import { useUpdateMonthlyCost } from "@/presentation/hooks/useCost";
import { useTranslation } from "@/presentation/hooks/useTranslation";
import { getFormFieldIds } from "@/shared/a11y/utils";
import Button from "@/presentation/components/ui/Button";
import Text from "@/presentation/components/ui/Text";
import styles from "./CostInput.module.scss";

type CostType = "shipping" | "marketing" | "overhead";

type Props = {
    /** Unique identifier for the input field */
    id: string;
    /** Label for the input field */
    label: string;
    /** Current month in YYYY-MM format */
    month: string;
    /** Type of cost (shipping, marketing, or overhead) */
    costType: CostType;
    /** Current monthly cost data (if exists) */
    currentCost: MonthlyCost | null;
    /** Optional additional CSS class names */
    className?: string;
};

const CostInputComponent = ({ id, label, month, costType, currentCost, className }: Props) => {
    const [inputValue, setInputValue] = React.useState<string>("");
    const [hasChanged, setHasChanged] = React.useState(false);
    const [validationError, setValidationError] = React.useState<string | undefined>(undefined);
    const [saveSuccess, setSaveSuccess] = React.useState(false);

    // Manage timeout for success message cleanup
    React.useEffect(() => {
        if (saveSuccess) {
            const timeoutId = setTimeout(() => {
                setSaveSuccess(false);
            }, 2000);

            // Cleanup timeout on unmount or when saveSuccess changes
            return () => {
                clearTimeout(timeoutId);
            };
        }
    }, [saveSuccess]);

    const updateCostMutation = useUpdateMonthlyCost();
    const tCommon = useTranslation("common");
    const tCost = useTranslation("pages.revenue.costInput");

    // Initialize input value from current cost
    React.useEffect(() => {
        if (currentCost) {
            const value = currentCost[`${costType}Cost` as keyof MonthlyCost] as number;
            setInputValue(value.toString());
        } else {
            setInputValue("0");
        }
        setHasChanged(false);
        setValidationError(undefined);
        setSaveSuccess(false);
    }, [currentCost, costType, month]);

    // Validate input value
    const validateValue = React.useCallback((value: string): string | undefined => {
        if (value.trim() === "") {
            return tCost("error.required");
        }

        const numValue = parseFloat(value);
        if (isNaN(numValue)) {
            return tCost("error.invalidNumber");
        }

        if (numValue < 0) {
            return tCost("error.negative");
        }

        return undefined;
    }, [tCost]);

    // Handle input change
    const handleChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInputValue(newValue);
        setHasChanged(true);
        setSaveSuccess(false);

        // Clear validation error when user starts typing
        if (validationError) {
            setValidationError(undefined);
        }
    }, [validationError]);

    // Save the cost value using atomic field update
    const handleSave = React.useCallback(() => {
        const numValue = parseFloat(inputValue);
        if (isNaN(numValue) || numValue < 0) {
            return;
        }

        // Use atomic field update to prevent lost updates
        // This updates only the specific field, leaving other fields unchanged
        // This prevents race conditions when multiple users edit different fields concurrently
        updateCostMutation.mutate(
            {
                month,
                fieldName: costType,
                value: numValue,
            },
            {
                onSuccess: () => {
                    setHasChanged(false);
                    setSaveSuccess(true);
                    setValidationError(undefined);
                },
                onError: () => {
                    setValidationError(tCost("error.saveFailed"));
                },
            }
        );
    }, [inputValue, month, costType, updateCostMutation, tCost]);

    // Handle input blur - save if value has changed and is valid
    const handleBlur = React.useCallback(() => {
        if (!hasChanged) {
            return;
        }

        const error = validateValue(inputValue);
        if (error) {
            setValidationError(error);
            return;
        }

        // Save the value
        handleSave();
    }, [hasChanged, inputValue, validateValue, handleSave]);

    // Handle save button click
    const handleSaveClick = React.useCallback(() => {
        const error = validateValue(inputValue);
        if (error) {
            setValidationError(error);
            return;
        }

        handleSave();
    }, [inputValue, validateValue, handleSave]);

    const isLoading = updateCostMutation.isPending;
    const error = validationError || (updateCostMutation.error ? tCost("error.saveFailed") : undefined);

    const { labelId, errorId } = React.useMemo(() => getFormFieldIds(id), [id]);
    const inputClassName = React.useMemo(() => {
        const base = [styles.costInput];
        if (className) {
            base.push(className);
        }
        return base.join(" ");
    }, [className]);

    const inputControlClassName = React.useMemo(() => {
        const base = [styles.costInput__input];
        if (error) {
            base.push(styles.costInput__inputError);
        }
        if (isLoading) {
            base.push(styles.costInput__inputDisabled);
        }
        return base.join(" ");
    }, [error, isLoading]);

    return (
        <div className={inputClassName}>
            <label id={labelId} className={styles.costInput__label} htmlFor={id}>
                {label}
            </label>
            <input
                id={id}
                type="number"
                step="0.01"
                min="0"
                value={inputValue}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isLoading}
                placeholder="0.00"
                className={inputControlClassName}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? errorId : undefined}
                aria-labelledby={labelId}
            />
            {!error && (
                <div className={styles.costInput__helper}>
                    {tCost("helper")}
                </div>
            )}
            {error && (
                <div id={errorId} className={styles.costInput__error} role="alert">
                    {error}
                </div>
            )}
            <div className={styles.costInput__actions}>
                {hasChanged && !isLoading && (
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleSaveClick}
                        disabled={!!error}
                        ariaLabel={tCost("saveButtonAria")}
                    >
                        {tCommon("save")}
                    </Button>
                )}
                {isLoading && (
                    <Text size="sm" muted className={styles.costInput__status}>
                        {tCommon("loading")}
                    </Text>
                )}
                {saveSuccess && !isLoading && (
                    <Text size="sm" className={styles.costInput__status}>
                        {tCost("saveSuccess")}
                    </Text>
                )}
            </div>
        </div>
    );
};

const CostInput = React.memo(CostInputComponent);
export default CostInput;

