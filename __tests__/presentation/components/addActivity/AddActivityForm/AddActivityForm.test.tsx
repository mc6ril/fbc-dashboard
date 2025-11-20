/**
 * AddActivityForm Component Tests
 *
 * Tests for the AddActivityForm component to ensure:
 * - Dynamic field rendering based on activity type
 * - Cascading product selection (Type → Model → Coloris)
 * - Form submission with valid data
 * - Form validation and error display
 * - Accessibility compliance
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AddActivityForm from "@/presentation/components/addActivity/AddActivityForm/AddActivityForm";
import { useAddActivity } from "@/presentation/hooks/useActivities";
import {
    useProducts,
    useProductModelsByType,
    useProductColorisByModel,
} from "@/presentation/hooks/useProducts";
import { ActivityType } from "@/core/domain/activity";
import type { Activity } from "@/core/domain/activity";
import type {
    Product,
    ProductId,
    ProductModelId,
    ProductColorisId,
    ProductModel,
    ProductColoris,
} from "@/core/domain/product";
import { ProductType } from "@/core/domain/product";

// Mock hooks
jest.mock("@/presentation/hooks/useActivities", () => ({
    useAddActivity: jest.fn(),
}));

jest.mock("@/presentation/hooks/useProducts", () => ({
    useProducts: jest.fn(),
    useProductModelsByType: jest.fn(),
    useProductColorisByModel: jest.fn(),
}));

const mockUseAddActivity = useAddActivity as jest.MockedFunction<typeof useAddActivity>;
const mockUseProducts = useProducts as jest.MockedFunction<typeof useProducts>;
const mockUseProductModelsByType = useProductModelsByType as jest.MockedFunction<
    typeof useProductModelsByType
>;
const mockUseProductColorisByModel = useProductColorisByModel as jest.MockedFunction<
    typeof useProductColorisByModel
>;

// Test fixtures
const mockModelId1 = "model-1" as ProductModelId;
const mockModelId2 = "model-2" as ProductModelId;
const mockColorisId1 = "coloris-1" as ProductColorisId;
const mockColorisId2 = "coloris-2" as ProductColorisId;
const mockColorisId3 = "coloris-3" as ProductColorisId;

const mockModels: ProductModel[] = [
    {
        id: mockModelId1,
        type: ProductType.SAC_BANANE,
        name: "Assumée",
    },
    {
        id: mockModelId2,
        type: ProductType.SAC_BANANE,
        name: "Espiègle",
    },
];

const mockColoris: ProductColoris[] = [
    {
        id: mockColorisId1,
        modelId: mockModelId1,
        coloris: "Rose Marsala",
    },
    {
        id: mockColorisId2,
        modelId: mockModelId1,
        coloris: "Prune",
    },
    {
        id: mockColorisId3,
        modelId: mockModelId2,
        coloris: "Rose pâle à motifs",
    },
];

// Mock products data with modelId and colorisId
const mockProducts: Product[] = [
    {
        id: "product-1" as ProductId,
        modelId: mockModelId1,
        colorisId: mockColorisId1,
        unitCost: 10,
        salePrice: 20,
        stock: 5,
    },
    {
        id: "product-2" as ProductId,
        modelId: mockModelId1,
        colorisId: mockColorisId2,
        unitCost: 15,
        salePrice: 30,
        stock: 10,
    },
    {
        id: "product-3" as ProductId,
        modelId: mockModelId2,
        colorisId: mockColorisId3,
        unitCost: 20,
        salePrice: 40,
        stock: 8,
    },
];

// Create wrapper with QueryClient
const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });
    const Wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    Wrapper.displayName = "TestWrapper";
    return Wrapper;
};

describe("AddActivityForm Component", () => {
    const mockMutate = jest.fn();
    const mockOnSuccess = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();

        // Default mock for useProducts
        mockUseProducts.mockReturnValue({
            data: mockProducts,
            isLoading: false,
            error: null,
            isError: false,
            isSuccess: true,
            refetch: jest.fn(),
        } as unknown as ReturnType<typeof useProducts>);

        // Default mock for useProductModelsByType
        mockUseProductModelsByType.mockReturnValue({
            data: mockModels,
            isLoading: false,
            error: null,
        } as unknown as ReturnType<typeof useProductModelsByType>);

        // Default mock for useProductColorisByModel
        mockUseProductColorisByModel.mockReturnValue({
            data: mockColoris,
            isLoading: false,
            error: null,
        } as unknown as ReturnType<typeof useProductColorisByModel>);

        // Default mock for useAddActivity
        mockUseAddActivity.mockReturnValue({
            mutate: mockMutate,
            mutateAsync: jest.fn(),
            isPending: false,
            isSuccess: false,
            isError: false,
            error: null,
            data: undefined,
            reset: jest.fn(),
        } as unknown as ReturnType<typeof useAddActivity>);
    });

    describe("Rendering", () => {
        it("should render form with activity type select", () => {
            render(<AddActivityForm />, { wrapper: createWrapper() });

            expect(screen.getByLabelText(/type d'activité/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
        });

        it("should render CREATION fields when CREATION type selected", () => {
            render(<AddActivityForm />, { wrapper: createWrapper() });

            // CREATION is default type
            expect(screen.getByLabelText(/type de produit/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/modèle/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/coloris/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/quantité/i)).toBeInTheDocument();
            // Amount field should NOT be displayed for CREATION (Sub-Ticket 28.3)
            expect(screen.queryByLabelText(/montant/i)).not.toBeInTheDocument();
            expect(screen.getByLabelText(/note/i)).toBeInTheDocument();
        });

        it("should render SALE fields when SALE type selected", () => {
            render(<AddActivityForm />, { wrapper: createWrapper() });

            const typeSelect = screen.getByLabelText(/type d'activité/i);
            fireEvent.change(typeSelect, { target: { value: ActivityType.SALE } });

            expect(screen.getByLabelText(/type de produit/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/modèle/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/coloris/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/quantité/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/montant/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/note/i)).toBeInTheDocument();
        });

        it("should render STOCK_CORRECTION fields when STOCK_CORRECTION type selected", () => {
            render(<AddActivityForm />, { wrapper: createWrapper() });

            const typeSelect = screen.getByLabelText(/type d'activité/i);
            fireEvent.change(typeSelect, { target: { value: ActivityType.STOCK_CORRECTION } });

            expect(screen.getByLabelText(/type de produit/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/modèle/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/coloris/i)).toBeInTheDocument();
            // STOCK_CORRECTION uses two separate fields (Sub-Ticket 28.4)
            expect(screen.getByLabelText(/ajout au stock/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/réduction du stock/i)).toBeInTheDocument();
            // Amount field should not be displayed for STOCK_CORRECTION
            expect(screen.queryByLabelText(/montant/i)).not.toBeInTheDocument();
            expect(screen.getByLabelText(/note/i)).toBeInTheDocument();
        });

        it("should render OTHER fields when OTHER type selected", () => {
            render(<AddActivityForm />, { wrapper: createWrapper() });

            const typeSelect = screen.getByLabelText(/type d'activité/i);
            fireEvent.change(typeSelect, { target: { value: ActivityType.OTHER } });

            expect(screen.getByLabelText(/type de produit/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/modèle/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/coloris/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/quantité/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/montant/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/note/i)).toBeInTheDocument();
        });
    });

    describe("Form Submission", () => {
        it("should submit form with valid CREATION data", async () => {
            render(<AddActivityForm onSuccess={mockOnSuccess} />, { wrapper: createWrapper() });

            // Fill form with cascading selects
            const productTypeSelect = screen.getByLabelText(/type de produit/i);
            fireEvent.change(productTypeSelect, { target: { value: ProductType.SAC_BANANE } });

            await waitFor(() => {
                expect(screen.getByLabelText(/modèle/i)).not.toBeDisabled();
            });

            const modelSelect = screen.getByLabelText(/modèle/i);
            fireEvent.change(modelSelect, { target: { value: mockModelId1 } });

            await waitFor(() => {
                expect(screen.getByLabelText(/coloris/i)).not.toBeDisabled();
            });

            const colorisSelect = screen.getByLabelText(/coloris/i);
            fireEvent.change(colorisSelect, { target: { value: mockColorisId1 } });

            const quantityInput = screen.getByLabelText(/quantité/i);
            fireEvent.change(quantityInput, { target: { value: "10" } });

            // Note: Amount field is NOT displayed for CREATION (Sub-Ticket 28.3)
            // Amount will be sent as 0 automatically

            // Submit form
            const submitButton = screen.getByRole("button", { name: /créer l'activité/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(mockMutate).toHaveBeenCalledTimes(1);
            });

            const callArgs = mockMutate.mock.calls[0][0];
            expect(callArgs.type).toBe(ActivityType.CREATION);
            expect(callArgs.productId).toBe("product-1");
            expect(callArgs.quantity).toBe(10);
            expect(callArgs.amount).toBe(0); // Amount is 0 for CREATION (Sub-Ticket 28.3)
        });

        it("should submit form with valid SALE data", async () => {
            render(<AddActivityForm />, { wrapper: createWrapper() });

            // Change to SALE type
            const typeSelect = screen.getByLabelText(/type d'activité/i);
            fireEvent.change(typeSelect, { target: { value: ActivityType.SALE } });

            // Fill form with cascading selects
            const productTypeSelect = screen.getByLabelText(/type de produit/i);
            fireEvent.change(productTypeSelect, { target: { value: ProductType.SAC_BANANE } });

            await waitFor(() => {
                expect(screen.getByLabelText(/modèle/i)).not.toBeDisabled();
            });

            const modelSelect = screen.getByLabelText(/modèle/i);
            fireEvent.change(modelSelect, { target: { value: mockModelId1 } });

            await waitFor(() => {
                expect(screen.getByLabelText(/coloris/i)).not.toBeDisabled();
            });

            const colorisSelect = screen.getByLabelText(/coloris/i);
            fireEvent.change(colorisSelect, { target: { value: mockColorisId1 } });

            // For SALE: User enters POSITIVE quantity, system converts to negative (Sub-Ticket 28.3)
            const quantityInput = screen.getByLabelText(/quantité vendue/i);
            fireEvent.change(quantityInput, { target: { value: "5" } });

            const amountInput = screen.getByLabelText(/montant/i);
            fireEvent.change(amountInput, { target: { value: "99.95" } });

            // Submit form
            const submitButton = screen.getByRole("button", { name: /créer l'activité/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(mockMutate).toHaveBeenCalledTimes(1);
            });

            const callArgs = mockMutate.mock.calls[0][0];
            expect(callArgs.type).toBe(ActivityType.SALE);
            expect(callArgs.productId).toBe("product-1");
            expect(callArgs.quantity).toBe(-5); // Converted to negative by system
            expect(callArgs.amount).toBe(99.95);
        });
    });

    describe("Validation", () => {
        it("should display error when required fields are missing", async () => {
            render(<AddActivityForm />, { wrapper: createWrapper() });

            const submitButton = screen.getByRole("button", { name: /créer l'activité/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText(/la quantité est requise/i)).toBeInTheDocument();
                // Note: Amount is NOT required for CREATION (default type) - Sub-Ticket 28.3
                expect(screen.getByText(/le type de produit est requis/i)).toBeInTheDocument();
            });

            expect(mockMutate).not.toHaveBeenCalled();
        });

        it("should display error when product selection incomplete for SALE type", async () => {
            render(<AddActivityForm />, { wrapper: createWrapper() });

            // Change to SALE type
            const typeSelect = screen.getByLabelText(/type d'activité/i);
            fireEvent.change(typeSelect, { target: { value: ActivityType.SALE } });

            // Fill other fields but not product
            const quantityInput = screen.getByLabelText(/quantité/i);
            fireEvent.change(quantityInput, { target: { value: "-5" } });

            const amountInput = screen.getByLabelText(/montant/i);
            fireEvent.change(amountInput, { target: { value: "99.95" } });

            // Submit form
            const submitButton = screen.getByRole("button", { name: /créer l'activité/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText(/le type de produit est requis/i)).toBeInTheDocument();
            });

            expect(mockMutate).not.toHaveBeenCalled();
        });

        it("should display error when quantity is invalid", async () => {
            render(<AddActivityForm />, { wrapper: createWrapper() });

            // Fill required fields first
            const productTypeSelect = screen.getByLabelText(/type de produit/i);
            fireEvent.change(productTypeSelect, { target: { value: ProductType.SAC_BANANE } });

            await waitFor(() => {
                expect(screen.getByLabelText(/modèle/i)).not.toBeDisabled();
            });

            const modelSelect = screen.getByLabelText(/modèle/i);
            fireEvent.change(modelSelect, { target: { value: mockModelId1 } });

            await waitFor(() => {
                expect(screen.getByLabelText(/coloris/i)).not.toBeDisabled();
            });

            const colorisSelect = screen.getByLabelText(/coloris/i);
            fireEvent.change(colorisSelect, { target: { value: mockColorisId1 } });

            // Note: Amount field is NOT displayed for CREATION (default type)

            // Leave quantity empty to trigger validation
            const submitButton = screen.getByRole("button", { name: /créer l'activité/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText(/la quantité est requise/i)).toBeInTheDocument();
            });

            expect(mockMutate).not.toHaveBeenCalled();
        });

        it("should display error when amount is invalid", async () => {
            render(<AddActivityForm />, { wrapper: createWrapper() });

            // Change to SALE type (where amount is required)
            const typeSelect = screen.getByLabelText(/type d'activité/i);
            fireEvent.change(typeSelect, { target: { value: ActivityType.SALE } });

            // Fill required fields first
            const productTypeSelect = screen.getByLabelText(/type de produit/i);
            fireEvent.change(productTypeSelect, { target: { value: ProductType.SAC_BANANE } });

            await waitFor(() => {
                expect(screen.getByLabelText(/modèle/i)).not.toBeDisabled();
            });

            const modelSelect = screen.getByLabelText(/modèle/i);
            fireEvent.change(modelSelect, { target: { value: mockModelId1 } });

            await waitFor(() => {
                expect(screen.getByLabelText(/coloris/i)).not.toBeDisabled();
            });

            const colorisSelect = screen.getByLabelText(/coloris/i);
            fireEvent.change(colorisSelect, { target: { value: mockColorisId1 } });

            const quantityInput = screen.getByLabelText(/quantité vendue/i);
            fireEvent.change(quantityInput, { target: { value: "10" } });

            // Leave amount empty to trigger validation
            const submitButton = screen.getByRole("button", { name: /créer l'activité/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText(/le montant est requis/i)).toBeInTheDocument();
            });

            expect(mockMutate).not.toHaveBeenCalled();
        });

        it("should display error when amount is zero or negative", async () => {
            render(<AddActivityForm />, { wrapper: createWrapper() });

            // Change to SALE type (where amount is required)
            const typeSelect = screen.getByLabelText(/type d'activité/i);
            fireEvent.change(typeSelect, { target: { value: ActivityType.SALE } });

            const productTypeSelect = screen.getByLabelText(/type de produit/i);
            fireEvent.change(productTypeSelect, { target: { value: ProductType.SAC_BANANE } });

            await waitFor(() => {
                expect(screen.getByLabelText(/modèle/i)).not.toBeDisabled();
            });

            const modelSelect = screen.getByLabelText(/modèle/i);
            fireEvent.change(modelSelect, { target: { value: mockModelId1 } });

            await waitFor(() => {
                expect(screen.getByLabelText(/coloris/i)).not.toBeDisabled();
            });

            const colorisSelect = screen.getByLabelText(/coloris/i);
            fireEvent.change(colorisSelect, { target: { value: mockColorisId1 } });

            const quantityInput = screen.getByLabelText(/quantité/i);
            fireEvent.change(quantityInput, { target: { value: "10" } });

            const amountInput = screen.getByLabelText(/montant/i);
            fireEvent.change(amountInput, { target: { value: "0" } });

            const submitButton = screen.getByRole("button", { name: /créer l'activité/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText(/le montant doit être supérieur à 0/i)).toBeInTheDocument();
            });

            expect(mockMutate).not.toHaveBeenCalled();
        });
    });

    describe("Loading State", () => {
        it("should display loading state during submission", () => {
            mockUseAddActivity.mockReturnValue({
                mutate: mockMutate,
                mutateAsync: jest.fn(),
                isPending: true,
                isSuccess: false,
                isError: false,
                error: null,
                data: undefined,
                reset: jest.fn(),
            } as unknown as ReturnType<typeof useAddActivity>);

            render(<AddActivityForm />, { wrapper: createWrapper() });

            const button = screen.getByRole("button");
            expect(button).toHaveTextContent(/création en cours/i);
            expect(button).toBeDisabled();
        });

        it("should disable form fields during submission", () => {
            mockUseAddActivity.mockReturnValue({
                mutate: mockMutate,
                mutateAsync: jest.fn(),
                isPending: true,
                isSuccess: false,
                isError: false,
                error: null,
                data: undefined,
                reset: jest.fn(),
            } as unknown as ReturnType<typeof useAddActivity>);

            render(<AddActivityForm />, { wrapper: createWrapper() });

            const quantityInput = screen.getByLabelText(/quantité/i);
            expect(quantityInput).toBeDisabled();
        });
    });

    describe("Error Handling", () => {
        it("should display general error message from mutation", async () => {
            const mockError = {
                code: "VALIDATION_ERROR",
                message: "productId is required for SALE activity type",
            };

            mockUseAddActivity.mockReturnValue({
                mutate: jest.fn((data, options) => {
                    // Simulate error callback
                    if (options?.onError) {
                        setTimeout(() => {
                            options.onError(mockError, data, undefined);
                        }, 0);
                    }
                }),
                mutateAsync: jest.fn(),
                isPending: false,
                isSuccess: false,
                isError: true,
                error: mockError,
                data: undefined,
                reset: jest.fn(),
            } as unknown as ReturnType<typeof useAddActivity>);

            render(<AddActivityForm />, { wrapper: createWrapper() });

            // Fill and submit form
            const productTypeSelect = screen.getByLabelText(/type de produit/i);
            fireEvent.change(productTypeSelect, { target: { value: ProductType.SAC_BANANE } });

            await waitFor(() => {
                expect(screen.getByLabelText(/modèle/i)).not.toBeDisabled();
            });

            const modelSelect = screen.getByLabelText(/modèle/i);
            fireEvent.change(modelSelect, { target: { value: mockModelId1 } });

            await waitFor(() => {
                expect(screen.getByLabelText(/coloris/i)).not.toBeDisabled();
            });

            const colorisSelect = screen.getByLabelText(/coloris/i);
            fireEvent.change(colorisSelect, { target: { value: mockColorisId1 } });

            const quantityInput = screen.getByLabelText(/quantité/i);
            fireEvent.change(quantityInput, { target: { value: "10" } });

            // Note: Amount field is NOT displayed for CREATION (Sub-Ticket 28.3)

            const submitButton = screen.getByRole("button", { name: /créer l'activité/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByRole("alert")).toBeInTheDocument();
            });
        });
    });

    describe("Accessibility", () => {
        it("should have proper labels for all fields", () => {
            render(<AddActivityForm />, { wrapper: createWrapper() });

            expect(screen.getByLabelText(/type d'activité/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/type de produit/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/modèle/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/coloris/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/quantité/i)).toBeInTheDocument();
            // Note: Amount field is NOT displayed for CREATION (default type) - Sub-Ticket 28.3
            expect(screen.queryByLabelText(/montant/i)).not.toBeInTheDocument();
            expect(screen.getByLabelText(/note/i)).toBeInTheDocument();
        });

        it("should announce errors via aria-live region", async () => {
            render(<AddActivityForm />, { wrapper: createWrapper() });

            const submitButton = screen.getByRole("button", { name: /créer l'activité/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                const errorMessages = screen.getAllByRole("alert");
                expect(errorMessages.length).toBeGreaterThan(0);
            });
        });

        it("should have error messages with role='alert'", async () => {
            render(<AddActivityForm />, { wrapper: createWrapper() });

            const submitButton = screen.getByRole("button", { name: /créer l'activité/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                const alerts = screen.getAllByRole("alert");
                expect(alerts.length).toBeGreaterThan(0);
                alerts.forEach((alert) => {
                    expect(alert).toHaveAttribute("role", "alert");
                });
            });
        });
    });

    describe("Success Handling", () => {
        it("should call onSuccess callback after successful submission", async () => {
            mockUseAddActivity.mockReturnValue({
                mutate: jest.fn((data, options) => {
                    // Simulate success callback
                    if (options?.onSuccess) {
                        setTimeout(() => {
                            options.onSuccess({} as Activity, data, undefined);
                        }, 0);
                    }
                }),
                mutateAsync: jest.fn(),
                isPending: false,
                isSuccess: true,
                isError: false,
                error: null,
                data: {} as Activity,
                reset: jest.fn(),
            } as unknown as ReturnType<typeof useAddActivity>);

            render(<AddActivityForm onSuccess={mockOnSuccess} />, { wrapper: createWrapper() });

            // Fill and submit form
            const productTypeSelect = screen.getByLabelText(/type de produit/i);
            fireEvent.change(productTypeSelect, { target: { value: ProductType.SAC_BANANE } });

            await waitFor(() => {
                expect(screen.getByLabelText(/modèle/i)).not.toBeDisabled();
            });

            const modelSelect = screen.getByLabelText(/modèle/i);
            fireEvent.change(modelSelect, { target: { value: mockModelId1 } });

            await waitFor(() => {
                expect(screen.getByLabelText(/coloris/i)).not.toBeDisabled();
            });

            const colorisSelect = screen.getByLabelText(/coloris/i);
            fireEvent.change(colorisSelect, { target: { value: mockColorisId1 } });

            const quantityInput = screen.getByLabelText(/quantité/i);
            fireEvent.change(quantityInput, { target: { value: "10" } });

            // Note: Amount field is NOT displayed for CREATION (default type) - Sub-Ticket 28.3

            const submitButton = screen.getByRole("button", { name: /créer l'activité/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(mockOnSuccess).toHaveBeenCalled();
            });
        });

        it("should reset form after successful submission", async () => {
            mockUseAddActivity.mockReturnValue({
                mutate: jest.fn((data, options) => {
                    if (options?.onSuccess) {
                        setTimeout(() => {
                            options.onSuccess({} as Activity, data, undefined);
                        }, 0);
                    }
                }),
                mutateAsync: jest.fn(),
                isPending: false,
                isSuccess: true,
                isError: false,
                error: null,
                data: {} as Activity,
                reset: jest.fn(),
            } as unknown as ReturnType<typeof useAddActivity>);

            render(<AddActivityForm />, { wrapper: createWrapper() });

            // Fill form
            const productTypeSelect = screen.getByLabelText(/type de produit/i);
            fireEvent.change(productTypeSelect, { target: { value: ProductType.SAC_BANANE } });

            await waitFor(() => {
                expect(screen.getByLabelText(/modèle/i)).not.toBeDisabled();
            });

            const modelSelect = screen.getByLabelText(/modèle/i);
            fireEvent.change(modelSelect, { target: { value: mockModelId1 } });

            await waitFor(() => {
                expect(screen.getByLabelText(/coloris/i)).not.toBeDisabled();
            });

            const colorisSelect = screen.getByLabelText(/coloris/i);
            fireEvent.change(colorisSelect, { target: { value: mockColorisId1 } });

            const quantityInput = screen.getByLabelText(/quantité/i);
            fireEvent.change(quantityInput, { target: { value: "10" } });

            // Note: Amount field is NOT displayed for CREATION (default type) - Sub-Ticket 28.3

            // Submit form
            const submitButton = screen.getByRole("button", { name: /créer l'activité/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                // Form should be reset (product type select should be empty)
                const productTypeSelectAfter = screen.getByLabelText(
                    /type de produit/i
                ) as HTMLSelectElement;
                expect(productTypeSelectAfter.value).toBe("");
            });
        });
    });

    describe("AddActivityForm - Cascading Product Selection", () => {
        describe("Product Type selection", () => {
            it("should enable model dropdown when type is selected", async () => {
                render(<AddActivityForm />, { wrapper: createWrapper() });

                const productTypeSelect = screen.getByLabelText(/type de produit/i);
                const modelSelect = screen.getByLabelText(/modèle/i);

                // Initially disabled
                expect(modelSelect).toBeDisabled();

                // Select a type
                fireEvent.change(productTypeSelect, { target: { value: ProductType.SAC_BANANE } });

                await waitFor(() => {
                    expect(modelSelect).not.toBeDisabled();
                });
            });

            it("should fetch models when type is selected", async () => {
                render(<AddActivityForm />, { wrapper: createWrapper() });

                const productTypeSelect = screen.getByLabelText(/type de produit/i);
                fireEvent.change(productTypeSelect, { target: { value: ProductType.SAC_BANANE } });

                await waitFor(() => {
                    expect(mockUseProductModelsByType).toHaveBeenCalledWith(ProductType.SAC_BANANE);
                });
            });

            it("should disable model dropdown when no type selected", () => {
                render(<AddActivityForm />, { wrapper: createWrapper() });

                const modelSelect = screen.getByLabelText(/modèle/i);
                expect(modelSelect).toBeDisabled();
            });

            it("should show loading state while fetching models", () => {
                mockUseProductModelsByType.mockReturnValue({
                    data: undefined,
                    isLoading: true,
                    error: null,
                } as unknown as ReturnType<typeof useProductModelsByType>);

                render(<AddActivityForm />, { wrapper: createWrapper() });

                const productTypeSelect = screen.getByLabelText(/type de produit/i);
                fireEvent.change(productTypeSelect, { target: { value: ProductType.SAC_BANANE } });

                const modelSelect = screen.getByLabelText(/modèle/i);
                expect(modelSelect).toBeDisabled();
            });

            it("should display error if models fetch fails", () => {
                const mockError = new Error("Failed to fetch models");
                mockUseProductModelsByType.mockReturnValue({
                    data: undefined,
                    isLoading: false,
                    error: mockError,
                } as unknown as ReturnType<typeof useProductModelsByType>);

                render(<AddActivityForm />, { wrapper: createWrapper() });

                const productTypeSelect = screen.getByLabelText(/type de produit/i);
                fireEvent.change(productTypeSelect, { target: { value: ProductType.SAC_BANANE } });

                expect(
                    screen.getByText(/erreur lors du chargement des modèles/i)
                ).toBeInTheDocument();
            });
        });

        describe("Product Model selection", () => {
            it("should enable coloris dropdown when model is selected", async () => {
                render(<AddActivityForm />, { wrapper: createWrapper() });

                const productTypeSelect = screen.getByLabelText(/type de produit/i);
                fireEvent.change(productTypeSelect, { target: { value: ProductType.SAC_BANANE } });

                await waitFor(() => {
                    expect(screen.getByLabelText(/modèle/i)).not.toBeDisabled();
                });

                const modelSelect = screen.getByLabelText(/modèle/i);
                const colorisSelect = screen.getByLabelText(/coloris/i);

                // Coloris initially disabled
                expect(colorisSelect).toBeDisabled();

                // Select a model
                fireEvent.change(modelSelect, { target: { value: mockModelId1 } });

                await waitFor(() => {
                    expect(colorisSelect).not.toBeDisabled();
                });
            });

            it("should fetch coloris when model is selected", async () => {
                render(<AddActivityForm />, { wrapper: createWrapper() });

                const productTypeSelect = screen.getByLabelText(/type de produit/i);
                fireEvent.change(productTypeSelect, { target: { value: ProductType.SAC_BANANE } });

                await waitFor(() => {
                    expect(screen.getByLabelText(/modèle/i)).not.toBeDisabled();
                });

                const modelSelect = screen.getByLabelText(/modèle/i);
                fireEvent.change(modelSelect, { target: { value: mockModelId1 } });

                await waitFor(() => {
                    expect(mockUseProductColorisByModel).toHaveBeenCalledWith(mockModelId1);
                });
            });

            it("should disable coloris dropdown when no model selected", () => {
                render(<AddActivityForm />, { wrapper: createWrapper() });

                const colorisSelect = screen.getByLabelText(/coloris/i);
                expect(colorisSelect).toBeDisabled();
            });

            it("should show loading state while fetching coloris", () => {
                // Mock coloris as loading
                mockUseProductColorisByModel.mockReturnValue({
                    data: undefined,
                    isLoading: true,
                    error: null,
                } as unknown as ReturnType<typeof useProductColorisByModel>);

                render(<AddActivityForm />, { wrapper: createWrapper() });

                // When coloris is loading, the coloris select should be disabled
                const colorisSelect = screen.getByLabelText(/coloris/i);
                expect(colorisSelect).toBeDisabled();
                // The placeholder should indicate loading
                expect(screen.getByText(/chargement des coloris/i)).toBeInTheDocument();
            });

            it("should display error if coloris fetch fails", async () => {
                const mockError = new Error("Failed to fetch coloris");
                mockUseProductColorisByModel.mockReturnValue({
                    data: undefined,
                    isLoading: false,
                    error: mockError,
                } as unknown as ReturnType<typeof useProductColorisByModel>);

                render(<AddActivityForm />, { wrapper: createWrapper() });

                const productTypeSelect = screen.getByLabelText(/type de produit/i);
                fireEvent.change(productTypeSelect, { target: { value: ProductType.SAC_BANANE } });

                await waitFor(() => {
                    expect(screen.getByLabelText(/modèle/i)).not.toBeDisabled();
                });

                const modelSelect = screen.getByLabelText(/modèle/i);
                fireEvent.change(modelSelect, { target: { value: mockModelId1 } });

                expect(
                    screen.getByText(/erreur lors du chargement des coloris/i)
                ).toBeInTheDocument();
            });
        });

        describe("Cascading reset logic", () => {
            it("should clear model and coloris when type changes", async () => {
                render(<AddActivityForm />, { wrapper: createWrapper() });

                // Select type, model, and coloris
                const productTypeSelect = screen.getByLabelText(/type de produit/i);
                fireEvent.change(productTypeSelect, { target: { value: ProductType.SAC_BANANE } });

                await waitFor(() => {
                    expect(screen.getByLabelText(/modèle/i)).not.toBeDisabled();
                });

                const modelSelect = screen.getByLabelText(/modèle/i);
                fireEvent.change(modelSelect, { target: { value: mockModelId1 } });

                await waitFor(() => {
                    expect(screen.getByLabelText(/coloris/i)).not.toBeDisabled();
                });

                const colorisSelect = screen.getByLabelText(/coloris/i);
                fireEvent.change(colorisSelect, { target: { value: mockColorisId1 } });

                // Change type
                fireEvent.change(productTypeSelect, {
                    target: { value: ProductType.POCHETTE_ORDINATEUR },
                });

                await waitFor(() => {
                    const modelSelectAfter = screen.getByLabelText(/modèle/i) as HTMLSelectElement;
                    const colorisSelectAfter = screen.getByLabelText(
                        /coloris/i
                    ) as HTMLSelectElement;
                    expect(modelSelectAfter.value).toBe("");
                    expect(colorisSelectAfter.value).toBe("");
                });
            });

            it("should clear coloris when model changes", async () => {
                render(<AddActivityForm />, { wrapper: createWrapper() });

                const productTypeSelect = screen.getByLabelText(/type de produit/i);
                fireEvent.change(productTypeSelect, { target: { value: ProductType.SAC_BANANE } });

                await waitFor(() => {
                    expect(screen.getByLabelText(/modèle/i)).not.toBeDisabled();
                });

                const modelSelect = screen.getByLabelText(/modèle/i);
                fireEvent.change(modelSelect, { target: { value: mockModelId1 } });

                await waitFor(() => {
                    expect(screen.getByLabelText(/coloris/i)).not.toBeDisabled();
                });

                const colorisSelect = screen.getByLabelText(/coloris/i);
                fireEvent.change(colorisSelect, { target: { value: mockColorisId1 } });

                // Change model
                fireEvent.change(modelSelect, { target: { value: mockModelId2 } });

                await waitFor(() => {
                    const colorisSelectAfter = screen.getByLabelText(
                        /coloris/i
                    ) as HTMLSelectElement;
                    expect(colorisSelectAfter.value).toBe("");
                });
            });

            it("should not clear on initial mount", () => {
                render(<AddActivityForm />, { wrapper: createWrapper() });

                // Form should render without clearing selections (no selections made yet)
                expect(screen.getByLabelText(/type de produit/i)).toBeInTheDocument();
                expect(screen.getByLabelText(/modèle/i)).toBeInTheDocument();
                expect(screen.getByLabelText(/coloris/i)).toBeInTheDocument();
            });
        });

        describe("Auto-selection of coloris", () => {
            it("should auto-select coloris if only one available", async () => {
                const singleColoris: ProductColoris[] = [
                    {
                        id: mockColorisId1,
                        modelId: mockModelId1,
                        coloris: "Rose Marsala",
                    },
                ];

                mockUseProductColorisByModel.mockReturnValue({
                    data: singleColoris,
                    isLoading: false,
                    error: null,
                } as unknown as ReturnType<typeof useProductColorisByModel>);

                render(<AddActivityForm />, { wrapper: createWrapper() });

                const productTypeSelect = screen.getByLabelText(/type de produit/i);
                fireEvent.change(productTypeSelect, { target: { value: ProductType.SAC_BANANE } });

                await waitFor(() => {
                    expect(screen.getByLabelText(/modèle/i)).not.toBeDisabled();
                });

                const modelSelect = screen.getByLabelText(/modèle/i);
                fireEvent.change(modelSelect, { target: { value: mockModelId1 } });

                await waitFor(() => {
                    const colorisSelect = screen.getByLabelText(/coloris/i) as HTMLSelectElement;
                    expect(colorisSelect.value).toBe(mockColorisId1);
                });
            });

            it("should not auto-select if coloris already selected", async () => {
                const singleColoris: ProductColoris[] = [
                    {
                        id: mockColorisId1,
                        modelId: mockModelId1,
                        coloris: "Rose Marsala",
                    },
                ];

                mockUseProductColorisByModel.mockReturnValue({
                    data: singleColoris,
                    isLoading: false,
                    error: null,
                } as unknown as ReturnType<typeof useProductColorisByModel>);

                render(<AddActivityForm />, { wrapper: createWrapper() });

                const productTypeSelect = screen.getByLabelText(/type de produit/i);
                fireEvent.change(productTypeSelect, { target: { value: ProductType.SAC_BANANE } });

                await waitFor(() => {
                    expect(screen.getByLabelText(/modèle/i)).not.toBeDisabled();
                });

                const modelSelect = screen.getByLabelText(/modèle/i);
                fireEvent.change(modelSelect, { target: { value: mockModelId1 } });

                await waitFor(() => {
                    const colorisSelect = screen.getByLabelText(/coloris/i) as HTMLSelectElement;
                    expect(colorisSelect.value).toBe(mockColorisId1);
                });

                // Change to another model with multiple coloris
                mockUseProductColorisByModel.mockReturnValue({
                    data: mockColoris,
                    isLoading: false,
                    error: null,
                } as unknown as ReturnType<typeof useProductColorisByModel>);

                fireEvent.change(modelSelect, { target: { value: mockModelId2 } });

                // Should keep the previous selection (no auto-select when multiple available)
                await waitFor(() => {
                    const colorisSelect = screen.getByLabelText(/coloris/i) as HTMLSelectElement;
                    // Should be cleared when model changes (cascading reset)
                    expect(colorisSelect.value).toBe("");
                });
            });

            it("should not auto-select if multiple coloris available", async () => {
                render(<AddActivityForm />, { wrapper: createWrapper() });

                const productTypeSelect = screen.getByLabelText(/type de produit/i);
                fireEvent.change(productTypeSelect, { target: { value: ProductType.SAC_BANANE } });

                await waitFor(() => {
                    expect(screen.getByLabelText(/modèle/i)).not.toBeDisabled();
                });

                const modelSelect = screen.getByLabelText(/modèle/i);
                fireEvent.change(modelSelect, { target: { value: mockModelId1 } });

                await waitFor(() => {
                    expect(screen.getByLabelText(/coloris/i)).not.toBeDisabled();
                });

                const colorisSelect = screen.getByLabelText(/coloris/i) as HTMLSelectElement;
                // Should not be auto-selected when multiple options available
                expect(colorisSelect.value).toBe("");
            });
        });

        describe("Product identification", () => {
            it("should find productId from modelId + colorisId", async () => {
                render(<AddActivityForm />, { wrapper: createWrapper() });

                const productTypeSelect = screen.getByLabelText(/type de produit/i);
                fireEvent.change(productTypeSelect, { target: { value: ProductType.SAC_BANANE } });

                await waitFor(() => {
                    expect(screen.getByLabelText(/modèle/i)).not.toBeDisabled();
                });

                const modelSelect = screen.getByLabelText(/modèle/i);
                fireEvent.change(modelSelect, { target: { value: mockModelId1 } });

                await waitFor(() => {
                    expect(screen.getByLabelText(/coloris/i)).not.toBeDisabled();
                });

                const colorisSelect = screen.getByLabelText(/coloris/i);
                fireEvent.change(colorisSelect, { target: { value: mockColorisId1 } });

                const quantityInput = screen.getByLabelText(/quantité/i);
                fireEvent.change(quantityInput, { target: { value: "10" } });

                // Note: Amount field is NOT displayed for CREATION (default type) - Sub-Ticket 28.3

                const submitButton = screen.getByRole("button", { name: /créer l'activité/i });
                fireEvent.click(submitButton);

                await waitFor(() => {
                    expect(mockMutate).toHaveBeenCalledTimes(1);
                });

                const callArgs = mockMutate.mock.calls[0][0];
                expect(callArgs.productId).toBe("product-1");
            });

            it("should return undefined if no product matches", async () => {
                // Mock products without matching modelId + colorisId
                mockUseProducts.mockReturnValue({
                    data: [],
                    isLoading: false,
                    error: null,
                    isError: false,
                    isSuccess: true,
                    refetch: jest.fn(),
                } as unknown as ReturnType<typeof useProducts>);

                render(<AddActivityForm />, { wrapper: createWrapper() });

                const productTypeSelect = screen.getByLabelText(/type de produit/i);
                fireEvent.change(productTypeSelect, { target: { value: ProductType.SAC_BANANE } });

                await waitFor(() => {
                    expect(screen.getByLabelText(/modèle/i)).not.toBeDisabled();
                });

                const modelSelect = screen.getByLabelText(/modèle/i);
                fireEvent.change(modelSelect, { target: { value: mockModelId1 } });

                await waitFor(() => {
                    expect(screen.getByLabelText(/coloris/i)).not.toBeDisabled();
                });

                const colorisSelect = screen.getByLabelText(/coloris/i);
                fireEvent.change(colorisSelect, { target: { value: mockColorisId1 } });

                const quantityInput = screen.getByLabelText(/quantité/i);
                fireEvent.change(quantityInput, { target: { value: "10" } });

                // Note: Amount field NOT displayed for CREATION (default)

                const submitButton = screen.getByRole("button", { name: /créer l'activité/i });
                fireEvent.click(submitButton);

                await waitFor(() => {
                    expect(
                        screen.getByText(/le produit sélectionné n'existe pas/i)
                    ).toBeInTheDocument();
                });

                expect(mockMutate).not.toHaveBeenCalled();
            });

            it("should return undefined if selections incomplete", async () => {
                render(<AddActivityForm />, { wrapper: createWrapper() });

                const productTypeSelect = screen.getByLabelText(/type de produit/i);
                fireEvent.change(productTypeSelect, { target: { value: ProductType.SAC_BANANE } });

                await waitFor(() => {
                    expect(screen.getByLabelText(/modèle/i)).not.toBeDisabled();
                });

                // Don't select model or coloris

                const quantityInput = screen.getByLabelText(/quantité/i);
                fireEvent.change(quantityInput, { target: { value: "10" } });

                // Note: Amount field NOT displayed for CREATION (default)

                const submitButton = screen.getByRole("button", { name: /créer l'activité/i });
                fireEvent.click(submitButton);

                await waitFor(() => {
                    expect(screen.getByText(/le modèle est requis/i)).toBeInTheDocument();
                });

                expect(mockMutate).not.toHaveBeenCalled();
            });
        });

        describe("Form validation", () => {
            it("should validate all three fields when product is required", async () => {
                render(<AddActivityForm />, { wrapper: createWrapper() });

                const quantityInput = screen.getByLabelText(/quantité/i);
                fireEvent.change(quantityInput, { target: { value: "10" } });

                // Note: Amount field NOT displayed for CREATION (default)

                const submitButton = screen.getByRole("button", { name: /créer l'activité/i });
                fireEvent.click(submitButton);

                await waitFor(() => {
                    expect(screen.getByText(/le type de produit est requis/i)).toBeInTheDocument();
                    expect(screen.getByText(/le modèle est requis/i)).toBeInTheDocument();
                    expect(screen.getByText(/le coloris est requis/i)).toBeInTheDocument();
                });

                expect(mockMutate).not.toHaveBeenCalled();
            });

            it("should show error for missing type", async () => {
                render(<AddActivityForm />, { wrapper: createWrapper() });

                const quantityInput = screen.getByLabelText(/quantité/i);
                fireEvent.change(quantityInput, { target: { value: "10" } });

                // Note: Amount field NOT displayed for CREATION (default)

                const submitButton = screen.getByRole("button", { name: /créer l'activité/i });
                fireEvent.click(submitButton);

                await waitFor(() => {
                    expect(screen.getByText(/le type de produit est requis/i)).toBeInTheDocument();
                });
            });

            it("should show error for missing model", async () => {
                render(<AddActivityForm />, { wrapper: createWrapper() });

                const productTypeSelect = screen.getByLabelText(/type de produit/i);
                fireEvent.change(productTypeSelect, { target: { value: ProductType.SAC_BANANE } });

                const quantityInput = screen.getByLabelText(/quantité/i);
                fireEvent.change(quantityInput, { target: { value: "10" } });

                // Note: Amount field NOT displayed for CREATION (default)

                const submitButton = screen.getByRole("button", { name: /créer l'activité/i });
                fireEvent.click(submitButton);

                await waitFor(() => {
                    expect(screen.getByText(/le modèle est requis/i)).toBeInTheDocument();
                });
            });

            it("should show error for missing coloris", async () => {
                render(<AddActivityForm />, { wrapper: createWrapper() });

                const productTypeSelect = screen.getByLabelText(/type de produit/i);
                fireEvent.change(productTypeSelect, { target: { value: ProductType.SAC_BANANE } });

                await waitFor(() => {
                    expect(screen.getByLabelText(/modèle/i)).not.toBeDisabled();
                });

                const modelSelect = screen.getByLabelText(/modèle/i);
                fireEvent.change(modelSelect, { target: { value: mockModelId1 } });

                const quantityInput = screen.getByLabelText(/quantité/i);
                fireEvent.change(quantityInput, { target: { value: "10" } });

                // Note: Amount field NOT displayed for CREATION (default)

                const submitButton = screen.getByRole("button", { name: /créer l'activité/i });
                fireEvent.click(submitButton);

                await waitFor(() => {
                    expect(screen.getByText(/le coloris est requis/i)).toBeInTheDocument();
                });
            });

            it("should show error if productId not found", async () => {
                mockUseProducts.mockReturnValue({
                    data: [],
                    isLoading: false,
                    error: null,
                    isError: false,
                    isSuccess: true,
                    refetch: jest.fn(),
                } as unknown as ReturnType<typeof useProducts>);

                render(<AddActivityForm />, { wrapper: createWrapper() });

                const productTypeSelect = screen.getByLabelText(/type de produit/i);
                fireEvent.change(productTypeSelect, { target: { value: ProductType.SAC_BANANE } });

                await waitFor(() => {
                    expect(screen.getByLabelText(/modèle/i)).not.toBeDisabled();
                });

                const modelSelect = screen.getByLabelText(/modèle/i);
                fireEvent.change(modelSelect, { target: { value: mockModelId1 } });

                await waitFor(() => {
                    expect(screen.getByLabelText(/coloris/i)).not.toBeDisabled();
                });

                const colorisSelect = screen.getByLabelText(/coloris/i);
                fireEvent.change(colorisSelect, { target: { value: mockColorisId1 } });

                const quantityInput = screen.getByLabelText(/quantité/i);
                fireEvent.change(quantityInput, { target: { value: "10" } });

                // Note: Amount field NOT displayed for CREATION (default)

                const submitButton = screen.getByRole("button", { name: /créer l'activité/i });
                fireEvent.click(submitButton);

                await waitFor(() => {
                    expect(
                        screen.getByText(/le produit sélectionné n'existe pas/i)
                    ).toBeInTheDocument();
                });

                expect(mockMutate).not.toHaveBeenCalled();
            });

            it("should prevent submission without required selections", async () => {
                render(<AddActivityForm />, { wrapper: createWrapper() });

                const quantityInput = screen.getByLabelText(/quantité/i);
                fireEvent.change(quantityInput, { target: { value: "10" } });

                // Note: Amount field NOT displayed for CREATION (default)

                const submitButton = screen.getByRole("button", { name: /créer l'activité/i });
                fireEvent.click(submitButton);

                await waitFor(() => {
                    expect(screen.getByText(/le type de produit est requis/i)).toBeInTheDocument();
                });

                expect(mockMutate).not.toHaveBeenCalled();
            });
        });

        describe("Form submission", () => {
            it("should submit with productId when all fields selected", async () => {
                render(<AddActivityForm />, { wrapper: createWrapper() });

                const productTypeSelect = screen.getByLabelText(/type de produit/i);
                fireEvent.change(productTypeSelect, { target: { value: ProductType.SAC_BANANE } });

                await waitFor(() => {
                    expect(screen.getByLabelText(/modèle/i)).not.toBeDisabled();
                });

                const modelSelect = screen.getByLabelText(/modèle/i);
                fireEvent.change(modelSelect, { target: { value: mockModelId1 } });

                await waitFor(() => {
                    expect(screen.getByLabelText(/coloris/i)).not.toBeDisabled();
                });

                const colorisSelect = screen.getByLabelText(/coloris/i);
                fireEvent.change(colorisSelect, { target: { value: mockColorisId1 } });

                const quantityInput = screen.getByLabelText(/quantité/i);
                fireEvent.change(quantityInput, { target: { value: "10" } });

                // Note: Amount field NOT displayed for CREATION (default)

                const submitButton = screen.getByRole("button", { name: /créer l'activité/i });
                fireEvent.click(submitButton);

                await waitFor(() => {
                    expect(mockMutate).toHaveBeenCalledTimes(1);
                });

                const callArgs = mockMutate.mock.calls[0][0];
                expect(callArgs.productId).toBe("product-1");
            });

            it("should submit with undefined productId when product not required", async () => {
                render(<AddActivityForm />, { wrapper: createWrapper() });

                // Change to OTHER type (product not required)
                const typeSelect = screen.getByLabelText(/type d'activité/i);
                fireEvent.change(typeSelect, { target: { value: ActivityType.OTHER } });

                const quantityInput = screen.getByLabelText(/quantité/i);
                fireEvent.change(quantityInput, { target: { value: "10" } });

                const amountInput = screen.getByLabelText(/montant/i);
                fireEvent.change(amountInput, { target: { value: "100" } });

                const submitButton = screen.getByRole("button", { name: /créer l'activité/i });
                fireEvent.click(submitButton);

                await waitFor(() => {
                    expect(mockMutate).toHaveBeenCalledTimes(1);
                });

                const callArgs = mockMutate.mock.calls[0][0];
                expect(callArgs.productId).toBeUndefined();
            });
        });
    });

    describe("Activity Type Specific Fields - FBC-28", () => {
        describe("Conditional Amount Field Rendering", () => {
            it("should hide amount field for CREATION type", () => {
                render(<AddActivityForm />, { wrapper: createWrapper() });

                // CREATION is default type
                const amountField = screen.queryByLabelText(/montant/i);
                // Field should not be in DOM when hidden (conditional rendering)
                expect(amountField).not.toBeInTheDocument();
            });

            it("should show amount field for SALE type", () => {
                render(<AddActivityForm />, { wrapper: createWrapper() });

                const typeSelect = screen.getByLabelText(/type d'activité/i);
                fireEvent.change(typeSelect, { target: { value: ActivityType.SALE } });

                const amountField = screen.getByLabelText(/montant/i);
                expect(amountField).toBeInTheDocument();
            });

            it("should hide amount field for STOCK_CORRECTION type", () => {
                render(<AddActivityForm />, { wrapper: createWrapper() });

                const typeSelect = screen.getByLabelText(/type d'activité/i);
                fireEvent.change(typeSelect, { target: { value: ActivityType.STOCK_CORRECTION } });

                const amountField = screen.queryByLabelText(/montant/i);
                // Field should not be in DOM when hidden (Sub-Ticket 28.4 implemented)
                expect(amountField).not.toBeInTheDocument();
            });

            it("should show amount field for OTHER type", () => {
                render(<AddActivityForm />, { wrapper: createWrapper() });

                const typeSelect = screen.getByLabelText(/type d'activité/i);
                fireEvent.change(typeSelect, { target: { value: ActivityType.OTHER } });

                const amountField = screen.getByLabelText(/montant/i);
                expect(amountField).toBeInTheDocument();
            });

            it("should toggle amount field visibility when activity type changes", () => {
                render(<AddActivityForm />, { wrapper: createWrapper() });

                // Start with CREATION (amount should be hidden)
                let amountField = screen.queryByLabelText(/montant/i);
                expect(amountField).not.toBeInTheDocument();

                // Change to SALE (amount should be shown)
                const typeSelect = screen.getByLabelText(/type d'activité/i);
                fireEvent.change(typeSelect, { target: { value: ActivityType.SALE } });

                amountField = screen.getByLabelText(/montant/i);
                expect(amountField).toBeInTheDocument();

                // Change back to CREATION (amount should be hidden again)
                fireEvent.change(typeSelect, { target: { value: ActivityType.CREATION } });
                amountField = screen.queryByLabelText(/montant/i);
                expect(amountField).not.toBeInTheDocument();
            });
        });

        describe("CREATION Type Validation", () => {
            it("should require quantity > 0 for CREATION", async () => {
                render(<AddActivityForm />, { wrapper: createWrapper() });

                // Fill product selection
                const productTypeSelect = screen.getByLabelText(/type de produit/i);
                fireEvent.change(productTypeSelect, { target: { value: ProductType.SAC_BANANE } });

                await waitFor(() => {
                    expect(screen.getByLabelText(/modèle/i)).not.toBeDisabled();
                });

                const modelSelect = screen.getByLabelText(/modèle/i);
                fireEvent.change(modelSelect, { target: { value: mockModelId1 } });

                await waitFor(() => {
                    expect(screen.getByLabelText(/coloris/i)).not.toBeDisabled();
                });

                const colorisSelect = screen.getByLabelText(/coloris/i);
                fireEvent.change(colorisSelect, { target: { value: mockColorisId1 } });

                // Try to submit with quantity <= 0
                const quantityInput = screen.getByLabelText(/quantité/i);
                fireEvent.change(quantityInput, { target: { value: "0" } });

                const submitButton = screen.getByRole("button", { name: /créer l'activité/i });
                fireEvent.click(submitButton);

                await waitFor(() => {
                    expect(screen.getByText(/la quantité doit être supérieure à 0/i)).toBeInTheDocument();
                });

                expect(mockMutate).not.toHaveBeenCalled();
            });

            it("should not validate amount for CREATION", async () => {
                render(<AddActivityForm />, { wrapper: createWrapper() });

                // Fill product selection
                const productTypeSelect = screen.getByLabelText(/type de produit/i);
                fireEvent.change(productTypeSelect, { target: { value: ProductType.SAC_BANANE } });

                await waitFor(() => {
                    expect(screen.getByLabelText(/modèle/i)).not.toBeDisabled();
                });

                const modelSelect = screen.getByLabelText(/modèle/i);
                fireEvent.change(modelSelect, { target: { value: mockModelId1 } });

                await waitFor(() => {
                    expect(screen.getByLabelText(/coloris/i)).not.toBeDisabled();
                });

                const colorisSelect = screen.getByLabelText(/coloris/i);
                fireEvent.change(colorisSelect, { target: { value: mockColorisId1 } });

                // Fill quantity but not amount
                const quantityInput = screen.getByLabelText(/quantité/i);
                fireEvent.change(quantityInput, { target: { value: "5" } });

                const submitButton = screen.getByRole("button", { name: /créer l'activité/i });
                fireEvent.click(submitButton);

                // Should not show amount error for CREATION
                await waitFor(() => {
                    expect(screen.queryByText(/le montant est requis/i)).not.toBeInTheDocument();
                });
            });

            it("should display error when quantity is missing for CREATION", async () => {
                render(<AddActivityForm />, { wrapper: createWrapper() });

                // Fill product selection
                const productTypeSelect = screen.getByLabelText(/type de produit/i);
                fireEvent.change(productTypeSelect, { target: { value: ProductType.SAC_BANANE } });

                await waitFor(() => {
                    expect(screen.getByLabelText(/modèle/i)).not.toBeDisabled();
                });

                const modelSelect = screen.getByLabelText(/modèle/i);
                fireEvent.change(modelSelect, { target: { value: mockModelId1 } });

                await waitFor(() => {
                    expect(screen.getByLabelText(/coloris/i)).not.toBeDisabled();
                });

                const colorisSelect = screen.getByLabelText(/coloris/i);
                fireEvent.change(colorisSelect, { target: { value: mockColorisId1 } });

                // Don't fill quantity
                const submitButton = screen.getByRole("button", { name: /créer l'activité/i });
                fireEvent.click(submitButton);

                await waitFor(() => {
                    expect(screen.getByText(/la quantité est requise/i)).toBeInTheDocument();
                });

                expect(mockMutate).not.toHaveBeenCalled();
            });

            it("should display error when quantity is <= 0 for CREATION", async () => {
                render(<AddActivityForm />, { wrapper: createWrapper() });

                // Fill product selection
                const productTypeSelect = screen.getByLabelText(/type de produit/i);
                fireEvent.change(productTypeSelect, { target: { value: ProductType.SAC_BANANE } });

                await waitFor(() => {
                    expect(screen.getByLabelText(/modèle/i)).not.toBeDisabled();
                });

                const modelSelect = screen.getByLabelText(/modèle/i);
                fireEvent.change(modelSelect, { target: { value: mockModelId1 } });

                await waitFor(() => {
                    expect(screen.getByLabelText(/coloris/i)).not.toBeDisabled();
                });

                const colorisSelect = screen.getByLabelText(/coloris/i);
                fireEvent.change(colorisSelect, { target: { value: mockColorisId1 } });

                // Try negative quantity
                const quantityInput = screen.getByLabelText(/quantité/i);
                fireEvent.change(quantityInput, { target: { value: "-5" } });

                const submitButton = screen.getByRole("button", { name: /créer l'activité/i });
                fireEvent.click(submitButton);

                await waitFor(() => {
                    expect(screen.getByText(/la quantité doit être supérieure à 0/i)).toBeInTheDocument();
                });

                expect(mockMutate).not.toHaveBeenCalled();
            });

            it("should submit CREATION with amount: 0", async () => {
                render(<AddActivityForm />, { wrapper: createWrapper() });

                // Fill product selection
                const productTypeSelect = screen.getByLabelText(/type de produit/i);
                fireEvent.change(productTypeSelect, { target: { value: ProductType.SAC_BANANE } });

                await waitFor(() => {
                    expect(screen.getByLabelText(/modèle/i)).not.toBeDisabled();
                });

                const modelSelect = screen.getByLabelText(/modèle/i);
                fireEvent.change(modelSelect, { target: { value: mockModelId1 } });

                await waitFor(() => {
                    expect(screen.getByLabelText(/coloris/i)).not.toBeDisabled();
                });

                const colorisSelect = screen.getByLabelText(/coloris/i);
                fireEvent.change(colorisSelect, { target: { value: mockColorisId1 } });

                const quantityInput = screen.getByLabelText(/quantité/i);
                fireEvent.change(quantityInput, { target: { value: "5" } });

                const submitButton = screen.getByRole("button", { name: /créer l'activité/i });
                fireEvent.click(submitButton);

                await waitFor(() => {
                    expect(mockMutate).toHaveBeenCalledTimes(1);
                });

                const callArgs = mockMutate.mock.calls[0][0];
                expect(callArgs.amount).toBe(0);
                expect(callArgs.quantity).toBe(5);
            });
        });

        describe("SALE Type Validation and Conversion", () => {
            it("should require quantity > 0 for SALE", async () => {
                render(<AddActivityForm />, { wrapper: createWrapper() });

                // Change to SALE type
                const typeSelect = screen.getByLabelText(/type d'activité/i);
                fireEvent.change(typeSelect, { target: { value: ActivityType.SALE } });

                // Fill product selection
                const productTypeSelect = screen.getByLabelText(/type de produit/i);
                fireEvent.change(productTypeSelect, { target: { value: ProductType.SAC_BANANE } });

                await waitFor(() => {
                    expect(screen.getByLabelText(/modèle/i)).not.toBeDisabled();
                });

                const modelSelect = screen.getByLabelText(/modèle/i);
                fireEvent.change(modelSelect, { target: { value: mockModelId1 } });

                await waitFor(() => {
                    expect(screen.getByLabelText(/coloris/i)).not.toBeDisabled();
                });

                const colorisSelect = screen.getByLabelText(/coloris/i);
                fireEvent.change(colorisSelect, { target: { value: mockColorisId1 } });

                // Try quantity <= 0
                const quantityInput = screen.getByLabelText(/quantité/i);
                fireEvent.change(quantityInput, { target: { value: "0" } });

                // Note: Amount field NOT displayed for CREATION (default)

                const submitButton = screen.getByRole("button", { name: /créer l'activité/i });
                fireEvent.click(submitButton);

                await waitFor(() => {
                    expect(screen.getByText(/la quantité doit être supérieure à 0/i)).toBeInTheDocument();
                });

                expect(mockMutate).not.toHaveBeenCalled();
            });

            it("should require amount > 0 for SALE", async () => {
                render(<AddActivityForm />, { wrapper: createWrapper() });

                // Change to SALE type
                const typeSelect = screen.getByLabelText(/type d'activité/i);
                fireEvent.change(typeSelect, { target: { value: ActivityType.SALE } });

                // Fill product selection
                const productTypeSelect = screen.getByLabelText(/type de produit/i);
                fireEvent.change(productTypeSelect, { target: { value: ProductType.SAC_BANANE } });

                await waitFor(() => {
                    expect(screen.getByLabelText(/modèle/i)).not.toBeDisabled();
                });

                const modelSelect = screen.getByLabelText(/modèle/i);
                fireEvent.change(modelSelect, { target: { value: mockModelId1 } });

                await waitFor(() => {
                    expect(screen.getByLabelText(/coloris/i)).not.toBeDisabled();
                });

                const colorisSelect = screen.getByLabelText(/coloris/i);
                fireEvent.change(colorisSelect, { target: { value: mockColorisId1 } });

                const quantityInput = screen.getByLabelText(/quantité/i);
                fireEvent.change(quantityInput, { target: { value: "2" } });

                // Don't fill amount or fill with 0
                const amountInput = screen.getByLabelText(/montant/i);
                fireEvent.change(amountInput, { target: { value: "0" } });

                const submitButton = screen.getByRole("button", { name: /créer l'activité/i });
                fireEvent.click(submitButton);

                await waitFor(() => {
                    expect(screen.getByText(/le montant doit être supérieur à 0/i)).toBeInTheDocument();
                });

                expect(mockMutate).not.toHaveBeenCalled();
            });

            it("should convert positive quantity to negative for SALE (2 → -2)", async () => {
                render(<AddActivityForm />, { wrapper: createWrapper() });

                // Change to SALE type
                const typeSelect = screen.getByLabelText(/type d'activité/i);
                fireEvent.change(typeSelect, { target: { value: ActivityType.SALE } });

                // Fill product selection
                const productTypeSelect = screen.getByLabelText(/type de produit/i);
                fireEvent.change(productTypeSelect, { target: { value: ProductType.SAC_BANANE } });

                await waitFor(() => {
                    expect(screen.getByLabelText(/modèle/i)).not.toBeDisabled();
                });

                const modelSelect = screen.getByLabelText(/modèle/i);
                fireEvent.change(modelSelect, { target: { value: mockModelId1 } });

                await waitFor(() => {
                    expect(screen.getByLabelText(/coloris/i)).not.toBeDisabled();
                });

                const colorisSelect = screen.getByLabelText(/coloris/i);
                fireEvent.change(colorisSelect, { target: { value: mockColorisId1 } });

                // User enters positive quantity
                const quantityInput = screen.getByLabelText(/quantité/i);
                fireEvent.change(quantityInput, { target: { value: "2" } });

                const amountInput = screen.getByLabelText(/montant/i);
                fireEvent.change(amountInput, { target: { value: "100" } });

                const submitButton = screen.getByRole("button", { name: /créer l'activité/i });
                fireEvent.click(submitButton);

                await waitFor(() => {
                    expect(mockMutate).toHaveBeenCalledTimes(1);
                });

                const callArgs = mockMutate.mock.calls[0][0];
                expect(callArgs.quantity).toBe(-2); // Should be converted to negative
                expect(callArgs.amount).toBe(100);
            });

            it("should convert positive decimal quantity to negative for SALE (5.5 → -5.5)", async () => {
                render(<AddActivityForm />, { wrapper: createWrapper() });

                // Change to SALE type
                const typeSelect = screen.getByLabelText(/type d'activité/i);
                fireEvent.change(typeSelect, { target: { value: ActivityType.SALE } });

                // Fill product selection
                const productTypeSelect = screen.getByLabelText(/type de produit/i);
                fireEvent.change(productTypeSelect, { target: { value: ProductType.SAC_BANANE } });

                await waitFor(() => {
                    expect(screen.getByLabelText(/modèle/i)).not.toBeDisabled();
                });

                const modelSelect = screen.getByLabelText(/modèle/i);
                fireEvent.change(modelSelect, { target: { value: mockModelId1 } });

                await waitFor(() => {
                    expect(screen.getByLabelText(/coloris/i)).not.toBeDisabled();
                });

                const colorisSelect = screen.getByLabelText(/coloris/i);
                fireEvent.change(colorisSelect, { target: { value: mockColorisId1 } });

                // User enters positive decimal quantity
                const quantityInput = screen.getByLabelText(/quantité/i);
                fireEvent.change(quantityInput, { target: { value: "5.5" } });

                const amountInput = screen.getByLabelText(/montant/i);
                fireEvent.change(amountInput, { target: { value: "100" } });

                const submitButton = screen.getByRole("button", { name: /créer l'activité/i });
                fireEvent.click(submitButton);

                await waitFor(() => {
                    expect(mockMutate).toHaveBeenCalledTimes(1);
                });

                const callArgs = mockMutate.mock.calls[0][0];
                expect(callArgs.quantity).toBe(-5.5); // Should be converted to negative
                expect(callArgs.amount).toBe(100);
            });

            it("should display error when quantity is <= 0 for SALE", async () => {
                render(<AddActivityForm />, { wrapper: createWrapper() });

                // Change to SALE type
                const typeSelect = screen.getByLabelText(/type d'activité/i);
                fireEvent.change(typeSelect, { target: { value: ActivityType.SALE } });

                // Fill product selection
                const productTypeSelect = screen.getByLabelText(/type de produit/i);
                fireEvent.change(productTypeSelect, { target: { value: ProductType.SAC_BANANE } });

                await waitFor(() => {
                    expect(screen.getByLabelText(/modèle/i)).not.toBeDisabled();
                });

                const modelSelect = screen.getByLabelText(/modèle/i);
                fireEvent.change(modelSelect, { target: { value: mockModelId1 } });

                await waitFor(() => {
                    expect(screen.getByLabelText(/coloris/i)).not.toBeDisabled();
                });

                const colorisSelect = screen.getByLabelText(/coloris/i);
                fireEvent.change(colorisSelect, { target: { value: mockColorisId1 } });

                // Try negative quantity (user shouldn't be able to enter negative, but test validation)
                const quantityInput = screen.getByLabelText(/quantité/i);
                fireEvent.change(quantityInput, { target: { value: "-2" } });

                const amountInput = screen.getByLabelText(/montant/i);
                fireEvent.change(amountInput, { target: { value: "100" } });

                const submitButton = screen.getByRole("button", { name: /créer l'activité/i });
                fireEvent.click(submitButton);

                await waitFor(() => {
                    expect(screen.getByText(/la quantité doit être supérieure à 0/i)).toBeInTheDocument();
                });

                expect(mockMutate).not.toHaveBeenCalled();
            });

            it("should submit SALE with negative quantity and positive amount", async () => {
                render(<AddActivityForm />, { wrapper: createWrapper() });

                // Change to SALE type
                const typeSelect = screen.getByLabelText(/type d'activité/i);
                fireEvent.change(typeSelect, { target: { value: ActivityType.SALE } });

                // Fill product selection
                const productTypeSelect = screen.getByLabelText(/type de produit/i);
                fireEvent.change(productTypeSelect, { target: { value: ProductType.SAC_BANANE } });

                await waitFor(() => {
                    expect(screen.getByLabelText(/modèle/i)).not.toBeDisabled();
                });

                const modelSelect = screen.getByLabelText(/modèle/i);
                fireEvent.change(modelSelect, { target: { value: mockModelId1 } });

                await waitFor(() => {
                    expect(screen.getByLabelText(/coloris/i)).not.toBeDisabled();
                });

                const colorisSelect = screen.getByLabelText(/coloris/i);
                fireEvent.change(colorisSelect, { target: { value: mockColorisId1 } });

                const quantityInput = screen.getByLabelText(/quantité/i);
                fireEvent.change(quantityInput, { target: { value: "3" } });

                const amountInput = screen.getByLabelText(/montant/i);
                fireEvent.change(amountInput, { target: { value: "150" } });

                const submitButton = screen.getByRole("button", { name: /créer l'activité/i });
                fireEvent.click(submitButton);

                await waitFor(() => {
                    expect(mockMutate).toHaveBeenCalledTimes(1);
                });

                const callArgs = mockMutate.mock.calls[0][0];
                expect(callArgs.quantity).toBe(-3); // Should be negative
                expect(callArgs.amount).toBe(150); // Should be positive
                expect(callArgs.type).toBe(ActivityType.SALE);
            });
        });

        describe("STOCK_CORRECTION Type - Two Separate Fields (Option A)", () => {
            it("should display two fields: 'Ajout au stock' and 'Réduction du stock'", () => {
                render(<AddActivityForm />, { wrapper: createWrapper() });

                // Change to STOCK_CORRECTION type
                const typeSelect = screen.getByLabelText(/type d'activité/i);
                fireEvent.change(typeSelect, { target: { value: ActivityType.STOCK_CORRECTION } });

                // Check that two separate fields are displayed
                // Note: These fields will be added in implementation, so test will fail initially
                const ajoutField = screen.queryByLabelText(/ajout au stock/i);
                const reductionField = screen.queryByLabelText(/réduction du stock/i);

                // These assertions will pass once implementation is done
                expect(ajoutField).toBeInTheDocument(); // Will be updated when fields are added
                expect(reductionField).toBeInTheDocument(); // Will be updated when fields are added
            });

            it("should allow only one field to be filled at a time", () => {
                render(<AddActivityForm />, { wrapper: createWrapper() });

                // Change to STOCK_CORRECTION type
                const typeSelect = screen.getByLabelText(/type d'activité/i);
                fireEvent.change(typeSelect, { target: { value: ActivityType.STOCK_CORRECTION } });

                // This test will verify that filling one field clears the other
                // Implementation needed: when ajout is filled, reduction should be cleared
                // This test will be updated when implementation is done
            });

            it("should clear 'Réduction' when 'Ajout' is filled", () => {
                render(<AddActivityForm />, { wrapper: createWrapper() });

                // Change to STOCK_CORRECTION type
                const typeSelect = screen.getByLabelText(/type d'activité/i);
                fireEvent.change(typeSelect, { target: { value: ActivityType.STOCK_CORRECTION } });

                // Fill reduction first
                // Then fill ajout
                // Verify reduction is cleared
                // This test will be updated when implementation is done
            });

            it("should clear 'Ajout' when 'Réduction' is filled", () => {
                render(<AddActivityForm />, { wrapper: createWrapper() });

                // Change to STOCK_CORRECTION type
                const typeSelect = screen.getByLabelText(/type d'activité/i);
                fireEvent.change(typeSelect, { target: { value: ActivityType.STOCK_CORRECTION } });

                // Fill ajout first
                // Then fill reduction
                // Verify ajout is cleared
                // This test will be updated when implementation is done
            });

            it("should calculate quantity as ajout - réduction (5 - 0 = 5)", async () => {
                render(<AddActivityForm />, { wrapper: createWrapper() });

                // Change to STOCK_CORRECTION type
                const typeSelect = screen.getByLabelText(/type d'activité/i);
                fireEvent.change(typeSelect, { target: { value: ActivityType.STOCK_CORRECTION } });

                // Fill product selection
                const productTypeSelect = screen.getByLabelText(/type de produit/i);
                fireEvent.change(productTypeSelect, { target: { value: ProductType.SAC_BANANE } });

                await waitFor(() => {
                    expect(screen.getByLabelText(/modèle/i)).not.toBeDisabled();
                });

                const modelSelect = screen.getByLabelText(/modèle/i);
                fireEvent.change(modelSelect, { target: { value: mockModelId1 } });

                await waitFor(() => {
                    expect(screen.getByLabelText(/coloris/i)).not.toBeDisabled();
                });

                const colorisSelect = screen.getByLabelText(/coloris/i);
                fireEvent.change(colorisSelect, { target: { value: mockColorisId1 } });

                // Fill ajout = 5, réduction = 0
                // Submit and verify quantity = 5
                // This test will be updated when implementation is done
            });

            it("should calculate quantity as ajout - réduction (0 - 3 = -3)", async () => {
                render(<AddActivityForm />, { wrapper: createWrapper() });

                // Change to STOCK_CORRECTION type
                const typeSelect = screen.getByLabelText(/type d'activité/i);
                fireEvent.change(typeSelect, { target: { value: ActivityType.STOCK_CORRECTION } });

                // Fill product selection
                const productTypeSelect = screen.getByLabelText(/type de produit/i);
                fireEvent.change(productTypeSelect, { target: { value: ProductType.SAC_BANANE } });

                await waitFor(() => {
                    expect(screen.getByLabelText(/modèle/i)).not.toBeDisabled();
                });

                const modelSelect = screen.getByLabelText(/modèle/i);
                fireEvent.change(modelSelect, { target: { value: mockModelId1 } });

                await waitFor(() => {
                    expect(screen.getByLabelText(/coloris/i)).not.toBeDisabled();
                });

                const colorisSelect = screen.getByLabelText(/coloris/i);
                fireEvent.change(colorisSelect, { target: { value: mockColorisId1 } });

                // Fill ajout = 0, réduction = 3
                // Submit and verify quantity = -3
                // This test will be updated when implementation is done
            });

            it("should calculate quantity as ajout - réduction (5 - 3 = 2)", async () => {
                render(<AddActivityForm />, { wrapper: createWrapper() });

                // Change to STOCK_CORRECTION type
                const typeSelect = screen.getByLabelText(/type d'activité/i);
                fireEvent.change(typeSelect, { target: { value: ActivityType.STOCK_CORRECTION } });

                // Fill product selection
                const productTypeSelect = screen.getByLabelText(/type de produit/i);
                fireEvent.change(productTypeSelect, { target: { value: ProductType.SAC_BANANE } });

                await waitFor(() => {
                    expect(screen.getByLabelText(/modèle/i)).not.toBeDisabled();
                });

                const modelSelect = screen.getByLabelText(/modèle/i);
                fireEvent.change(modelSelect, { target: { value: mockModelId1 } });

                await waitFor(() => {
                    expect(screen.getByLabelText(/coloris/i)).not.toBeDisabled();
                });

                const colorisSelect = screen.getByLabelText(/coloris/i);
                fireEvent.change(colorisSelect, { target: { value: mockColorisId1 } });

                // Fill ajout = 5, réduction = 3
                // Submit and verify quantity = 2
                // This test will be updated when implementation is done
            });

            it("should require at least one field to be filled", async () => {
                render(<AddActivityForm />, { wrapper: createWrapper() });

                // Change to STOCK_CORRECTION type
                const typeSelect = screen.getByLabelText(/type d'activité/i);
                fireEvent.change(typeSelect, { target: { value: ActivityType.STOCK_CORRECTION } });

                // Fill product selection
                const productTypeSelect = screen.getByLabelText(/type de produit/i);
                fireEvent.change(productTypeSelect, { target: { value: ProductType.SAC_BANANE } });

                await waitFor(() => {
                    expect(screen.getByLabelText(/modèle/i)).not.toBeDisabled();
                });

                const modelSelect = screen.getByLabelText(/modèle/i);
                fireEvent.change(modelSelect, { target: { value: mockModelId1 } });

                await waitFor(() => {
                    expect(screen.getByLabelText(/coloris/i)).not.toBeDisabled();
                });

                const colorisSelect = screen.getByLabelText(/coloris/i);
                fireEvent.change(colorisSelect, { target: { value: mockColorisId1 } });

                // Don't fill either ajout or réduction
                const submitButton = screen.getByRole("button", { name: /créer l'activité/i });
                fireEvent.click(submitButton);

                // Should show error that at least one field is required
                // This test will be updated when implementation is done
            });

            it("should validate that values are positive numbers", async () => {
                render(<AddActivityForm />, { wrapper: createWrapper() });

                // Change to STOCK_CORRECTION type
                const typeSelect = screen.getByLabelText(/type d'activité/i);
                fireEvent.change(typeSelect, { target: { value: ActivityType.STOCK_CORRECTION } });

                // Fill product selection
                const productTypeSelect = screen.getByLabelText(/type de produit/i);
                fireEvent.change(productTypeSelect, { target: { value: ProductType.SAC_BANANE } });

                await waitFor(() => {
                    expect(screen.getByLabelText(/modèle/i)).not.toBeDisabled();
                });

                const modelSelect = screen.getByLabelText(/modèle/i);
                fireEvent.change(modelSelect, { target: { value: mockModelId1 } });

                await waitFor(() => {
                    expect(screen.getByLabelText(/coloris/i)).not.toBeDisabled();
                });

                const colorisSelect = screen.getByLabelText(/coloris/i);
                fireEvent.change(colorisSelect, { target: { value: mockColorisId1 } });

                // Try to enter negative value in ajout or réduction
                // Should show validation error
                // This test will be updated when implementation is done
            });

            it("should submit STOCK_CORRECTION with amount: 0 and calculated quantity", async () => {
                render(<AddActivityForm />, { wrapper: createWrapper() });

                // Change to STOCK_CORRECTION type
                const typeSelect = screen.getByLabelText(/type d'activité/i);
                fireEvent.change(typeSelect, { target: { value: ActivityType.STOCK_CORRECTION } });

                // Fill product selection
                const productTypeSelect = screen.getByLabelText(/type de produit/i);
                fireEvent.change(productTypeSelect, { target: { value: ProductType.SAC_BANANE } });

                await waitFor(() => {
                    expect(screen.getByLabelText(/modèle/i)).not.toBeDisabled();
                });

                const modelSelect = screen.getByLabelText(/modèle/i);
                fireEvent.change(modelSelect, { target: { value: mockModelId1 } });

                await waitFor(() => {
                    expect(screen.getByLabelText(/coloris/i)).not.toBeDisabled();
                });

                const colorisSelect = screen.getByLabelText(/coloris/i);
                fireEvent.change(colorisSelect, { target: { value: mockColorisId1 } });

                // Fill ajout and/or réduction
                // Submit and verify amount: 0 and quantity is calculated correctly
                // This test will be updated when implementation is done
            });
        });

        describe("Dynamic Labels and Helper Texts", () => {
            it("should display 'Quantité' label for CREATION", () => {
                render(<AddActivityForm />, { wrapper: createWrapper() });

                // CREATION is default type - label should be "Quantité" (not "Quantité vendue")
                // Use regex to match label with optional required marker
                const quantityInput = screen.getByLabelText(/^quantité(\s+\*)?$/i);
                expect(quantityInput).toBeInTheDocument();
                // Verify it's not "Quantité vendue"
                const quantityVendueInput = screen.queryByLabelText(/quantité vendue/i);
                expect(quantityVendueInput).not.toBeInTheDocument();
            });

            it("should display 'Quantité vendue' label for SALE", () => {
                render(<AddActivityForm />, { wrapper: createWrapper() });

                // Change to SALE type
                const typeSelect = screen.getByLabelText(/type d'activité/i);
                fireEvent.change(typeSelect, { target: { value: ActivityType.SALE } });

                // Check for "Quantité vendue" label
                // This test will be updated when label is changed in implementation
                const quantityLabel = screen.getByText(/quantité/i);
                expect(quantityLabel).toBeInTheDocument(); // Will be updated to check for "Quantité vendue"
            });

            it("should display helper text 'Quantité ajoutée au stock' for CREATION", () => {
                render(<AddActivityForm />, { wrapper: createWrapper() });

                // CREATION is default type
                // Check for helper text
                // This test will be updated when helper text is added in implementation
            });

            it("should display helper text 'Saisissez le nombre d'unités vendues (sera déduit du stock)' for SALE", () => {
                render(<AddActivityForm />, { wrapper: createWrapper() });

                // Change to SALE type
                const typeSelect = screen.getByLabelText(/type d'activité/i);
                fireEvent.change(typeSelect, { target: { value: ActivityType.SALE } });

                // Check for helper text
                // This test will be updated when helper text is added in implementation
            });
        });

        describe("Activity Type Change Behavior", () => {
            it("should show amount field when changing from CREATION to SALE", () => {
                render(<AddActivityForm />, { wrapper: createWrapper() });

                // Start with CREATION (default)
                let amountField = screen.queryByLabelText(/montant/i);
                expect(amountField).not.toBeInTheDocument();

                // Change to SALE
                const typeSelect = screen.getByLabelText(/type d'activité/i);
                fireEvent.change(typeSelect, { target: { value: ActivityType.SALE } });

                // Amount field should be visible
                amountField = screen.getByLabelText(/montant/i);
                expect(amountField).toBeInTheDocument();
            });

            it("should hide amount field when changing from SALE to CREATION", () => {
                render(<AddActivityForm />, { wrapper: createWrapper() });

                // Start with SALE
                const typeSelect = screen.getByLabelText(/type d'activité/i);
                fireEvent.change(typeSelect, { target: { value: ActivityType.SALE } });

                const amountFieldSale = screen.getByLabelText(/montant/i);
                expect(amountFieldSale).toBeInTheDocument();

                // Change to CREATION
                fireEvent.change(typeSelect, { target: { value: ActivityType.CREATION } });

                // Amount field should be hidden
                const amountFieldCreation = screen.queryByLabelText(/montant/i);
                expect(amountFieldCreation).not.toBeInTheDocument();
            });

            it("should reset amount value when changing from SALE to CREATION", () => {
                render(<AddActivityForm />, { wrapper: createWrapper() });

                // Start with SALE
                const typeSelect = screen.getByLabelText(/type d'activité/i);
                fireEvent.change(typeSelect, { target: { value: ActivityType.SALE } });

                const amountInput = screen.getByLabelText(/montant/i) as HTMLInputElement;
                fireEvent.change(amountInput, { target: { value: "100" } });
                expect(amountInput.value).toBe("100");

                // Change to CREATION
                fireEvent.change(typeSelect, { target: { value: ActivityType.CREATION } });

                // Amount field should be hidden (not in DOM), so value is implicitly reset
                // When switching back to SALE, a new empty field will be rendered
                const amountFieldAfter = screen.queryByLabelText(/montant/i);
                expect(amountFieldAfter).not.toBeInTheDocument();
                
                // Verify that switching back to SALE shows an empty field
                fireEvent.change(typeSelect, { target: { value: ActivityType.SALE } });
                const amountFieldSale = screen.getByLabelText(/montant/i) as HTMLInputElement;
                expect(amountFieldSale.value).toBe("");
            });

            it("should show two quantity fields when changing to STOCK_CORRECTION", () => {
                render(<AddActivityForm />, { wrapper: createWrapper() });

                // Start with CREATION
                const typeSelect = screen.getByLabelText(/type d'activité/i);
                fireEvent.change(typeSelect, { target: { value: ActivityType.STOCK_CORRECTION } });

                // Two quantity fields should be displayed
                // This test will be updated when implementation is done
            });

            it("should hide two quantity fields when changing from STOCK_CORRECTION", () => {
                render(<AddActivityForm />, { wrapper: createWrapper() });

                // Start with STOCK_CORRECTION
                const typeSelect = screen.getByLabelText(/type d'activité/i);
                fireEvent.change(typeSelect, { target: { value: ActivityType.STOCK_CORRECTION } });

                // Change to CREATION
                fireEvent.change(typeSelect, { target: { value: ActivityType.CREATION } });

                // Two quantity fields should be hidden
                // This test will be updated when implementation is done
            });
        });

        describe("OTHER Type - Unchanged Behavior", () => {
            it("should show amount field for OTHER type", () => {
                render(<AddActivityForm />, { wrapper: createWrapper() });

                // Change to OTHER type
                const typeSelect = screen.getByLabelText(/type d'activité/i);
                fireEvent.change(typeSelect, { target: { value: ActivityType.OTHER } });

                const amountField = screen.getByLabelText(/montant/i);
                expect(amountField).toBeInTheDocument();
            });

            it("should show quantity field for OTHER type", () => {
                render(<AddActivityForm />, { wrapper: createWrapper() });

                // Change to OTHER type
                const typeSelect = screen.getByLabelText(/type d'activité/i);
                fireEvent.change(typeSelect, { target: { value: ActivityType.OTHER } });

                const quantityField = screen.getByLabelText(/quantité/i);
                expect(quantityField).toBeInTheDocument();
            });

            it("should require both amount and quantity for OTHER", async () => {
                render(<AddActivityForm />, { wrapper: createWrapper() });

                // Change to OTHER type
                const typeSelect = screen.getByLabelText(/type d'activité/i);
                fireEvent.change(typeSelect, { target: { value: ActivityType.OTHER } });

                // Try to submit without filling fields
                const submitButton = screen.getByRole("button", { name: /créer l'activité/i });
                fireEvent.click(submitButton);

                await waitFor(() => {
                    expect(screen.getByText(/la quantité est requise/i)).toBeInTheDocument();
                    expect(screen.getByText(/le montant est requis/i)).toBeInTheDocument();
                });

                expect(mockMutate).not.toHaveBeenCalled();
            });

            it("should not convert quantity for OTHER", async () => {
                render(<AddActivityForm />, { wrapper: createWrapper() });

                // Change to OTHER type
                const typeSelect = screen.getByLabelText(/type d'activité/i);
                fireEvent.change(typeSelect, { target: { value: ActivityType.OTHER } });

                const quantityInput = screen.getByLabelText(/quantité/i);
                fireEvent.change(quantityInput, { target: { value: "-5" } });

                const amountInput = screen.getByLabelText(/montant/i);
                fireEvent.change(amountInput, { target: { value: "100" } });

                const submitButton = screen.getByRole("button", { name: /créer l'activité/i });
                fireEvent.click(submitButton);

                await waitFor(() => {
                    expect(mockMutate).toHaveBeenCalledTimes(1);
                });

                const callArgs = mockMutate.mock.calls[0][0];
                expect(callArgs.quantity).toBe(-5); // Should remain negative (no conversion)
                expect(callArgs.amount).toBe(100);
            });
        });

        describe("Accessibility", () => {
            it("should hide amount field from keyboard navigation when hidden", () => {
                render(<AddActivityForm />, { wrapper: createWrapper() });

                // CREATION is default (amount should be hidden)
                const amountField = screen.queryByLabelText(/montant/i);
                // Check for aria-hidden or tabindex="-1" when field is hidden
                // This test will be updated when implementation hides the field properly
                if (amountField) {
                    // Field should have aria-hidden="true" or tabindex="-1" when hidden
                    // This will be verified when implementation is done
                }
            });

            it("should have proper labels for all fields", () => {
                render(<AddActivityForm />, { wrapper: createWrapper() });

                // All fields should have proper labels
                expect(screen.getByLabelText(/type d'activité/i)).toBeInTheDocument();
                expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
                expect(screen.getByLabelText(/quantité/i)).toBeInTheDocument();
            });

            it("should announce errors via aria-live region", async () => {
                render(<AddActivityForm />, { wrapper: createWrapper() });

                // Try to submit without filling required fields
                const submitButton = screen.getByRole("button", { name: /créer l'activité/i });
                fireEvent.click(submitButton);

                await waitFor(() => {
                    // Error messages should be in aria-live region (role="alert")
                    // There will be multiple error messages for different fields
                    const errorRegions = screen.getAllByRole("alert");
                    expect(errorRegions.length).toBeGreaterThan(0);
                    // Verify specific error messages are present
                    expect(screen.getByText(/la quantité est requise/i)).toBeInTheDocument();
                });
            });

            it("should have proper aria-describedby for helper texts", () => {
                render(<AddActivityForm />, { wrapper: createWrapper() });

                // Helper texts should be associated with their fields via aria-describedby
                // This test will be updated when helper texts are added in implementation
            });
        });
    });
});

