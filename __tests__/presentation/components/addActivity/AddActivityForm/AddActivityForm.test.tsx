/**
 * AddActivityForm Component Tests
 *
 * Tests for the AddActivityForm component to ensure:
 * - Dynamic field rendering based on activity type
 * - Form submission with valid data
 * - Form validation and error display
 * - Accessibility compliance
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AddActivityForm from "@/presentation/components/addActivity/AddActivityForm/AddActivityForm";
import { useAddActivity } from "@/presentation/hooks/useActivities";
import { useProducts } from "@/presentation/hooks/useProducts";
import { ActivityType } from "@/core/domain/activity";
import type { Activity } from "@/core/domain/activity";
import type { Product } from "@/core/domain/product";
import type { ProductId } from "@/core/domain/product";
import { ProductType } from "@/core/domain/product";

// Mock hooks
jest.mock("@/presentation/hooks/useActivities", () => ({
    useAddActivity: jest.fn(),
}));

jest.mock("@/presentation/hooks/useProducts", () => ({
    useProducts: jest.fn(),
}));

const mockUseAddActivity = useAddActivity as jest.MockedFunction<typeof useAddActivity>;
const mockUseProducts = useProducts as jest.MockedFunction<typeof useProducts>;

// Mock products data
const mockProducts: Product[] = [
    {
        id: "product-1" as ProductId,
        name: "Product 1",
        type: ProductType.SAC_BANANE,
        coloris: "Red",
        unitCost: 10,
        salePrice: 20,
        stock: 5,
    },
    {
        id: "product-2" as ProductId,
        name: "Product 2",
        type: ProductType.POCHETTE_ORDINATEUR,
        coloris: "Blue",
        unitCost: 15,
        salePrice: 30,
        stock: 10,
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
            expect(screen.getByLabelText(/produit/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/quantité/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/montant/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/note/i)).toBeInTheDocument();
        });

        it("should render SALE fields when SALE type selected", () => {
            render(<AddActivityForm />, { wrapper: createWrapper() });

            const typeSelect = screen.getByLabelText(/type d'activité/i);
            fireEvent.change(typeSelect, { target: { value: ActivityType.SALE } });

            expect(screen.getByLabelText(/produit/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/quantité/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/montant/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/note/i)).toBeInTheDocument();
        });

        it("should render STOCK_CORRECTION fields when STOCK_CORRECTION type selected", () => {
            render(<AddActivityForm />, { wrapper: createWrapper() });

            const typeSelect = screen.getByLabelText(/type d'activité/i);
            fireEvent.change(typeSelect, { target: { value: ActivityType.STOCK_CORRECTION } });

            expect(screen.getByLabelText(/produit/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/quantité/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/montant/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/note/i)).toBeInTheDocument();
        });

        it("should render OTHER fields when OTHER type selected", () => {
            render(<AddActivityForm />, { wrapper: createWrapper() });

            const typeSelect = screen.getByLabelText(/type d'activité/i);
            fireEvent.change(typeSelect, { target: { value: ActivityType.OTHER } });

            expect(screen.getByLabelText(/produit/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/quantité/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/montant/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/note/i)).toBeInTheDocument();
        });
    });

    describe("Form Submission", () => {
        it("should submit form with valid CREATION data", async () => {
            render(<AddActivityForm onSuccess={mockOnSuccess} />, { wrapper: createWrapper() });

            // Fill form
            const productSelect = screen.getByLabelText(/produit/i);
            fireEvent.change(productSelect, { target: { value: "product-1" } });

            const quantityInput = screen.getByLabelText(/quantité/i);
            fireEvent.change(quantityInput, { target: { value: "10" } });

            const amountInput = screen.getByLabelText(/montant/i);
            fireEvent.change(amountInput, { target: { value: "100" } });

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
            expect(callArgs.amount).toBe(100);
        });

        it("should submit form with valid SALE data", async () => {
            render(<AddActivityForm />, { wrapper: createWrapper() });

            // Change to SALE type
            const typeSelect = screen.getByLabelText(/type d'activité/i);
            fireEvent.change(typeSelect, { target: { value: ActivityType.SALE } });

            // Fill form
            const productSelect = screen.getByLabelText(/produit/i);
            fireEvent.change(productSelect, { target: { value: "product-1" } });

            const quantityInput = screen.getByLabelText(/quantité/i);
            fireEvent.change(quantityInput, { target: { value: "-5" } });

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
            expect(callArgs.quantity).toBe(-5);
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
                expect(screen.getByText(/le montant est requis/i)).toBeInTheDocument();
                expect(screen.getByText(/le produit est requis/i)).toBeInTheDocument();
            });

            expect(mockMutate).not.toHaveBeenCalled();
        });

        it("should display error when productId missing for SALE type", async () => {
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
                expect(screen.getByText(/le produit est requis pour ce type d'activité/i)).toBeInTheDocument();
            });

            expect(mockMutate).not.toHaveBeenCalled();
        });

        it("should display error when quantity is invalid", async () => {
            render(<AddActivityForm />, { wrapper: createWrapper() });

            // Fill required fields first
            const productSelect = screen.getByLabelText(/produit/i);
            fireEvent.change(productSelect, { target: { value: "product-1" } });

            const amountInput = screen.getByLabelText(/montant/i);
            fireEvent.change(amountInput, { target: { value: "100" } });

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

            // Fill required fields first
            const productSelect = screen.getByLabelText(/produit/i);
            fireEvent.change(productSelect, { target: { value: "product-1" } });

            const quantityInput = screen.getByLabelText(/quantité/i);
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

            const quantityInput = screen.getByLabelText(/quantité/i);
            fireEvent.change(quantityInput, { target: { value: "10" } });

            const amountInput = screen.getByLabelText(/montant/i);
            fireEvent.change(amountInput, { target: { value: "0" } });

            const productSelect = screen.getByLabelText(/produit/i);
            fireEvent.change(productSelect, { target: { value: "product-1" } });

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
            const quantityInput = screen.getByLabelText(/quantité/i);
            fireEvent.change(quantityInput, { target: { value: "10" } });

            const amountInput = screen.getByLabelText(/montant/i);
            fireEvent.change(amountInput, { target: { value: "100" } });

            const productSelect = screen.getByLabelText(/produit/i);
            fireEvent.change(productSelect, { target: { value: "product-1" } });

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
            expect(screen.getByLabelText(/produit/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/quantité/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/montant/i)).toBeInTheDocument();
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
            const productSelect = screen.getByLabelText(/produit/i);
            fireEvent.change(productSelect, { target: { value: "product-1" } });

            const quantityInput = screen.getByLabelText(/quantité/i);
            fireEvent.change(quantityInput, { target: { value: "10" } });

            const amountInput = screen.getByLabelText(/montant/i);
            fireEvent.change(amountInput, { target: { value: "100" } });

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
            const productSelect = screen.getByLabelText(/produit/i);
            fireEvent.change(productSelect, { target: { value: "product-1" } });

            const quantityInput = screen.getByLabelText(/quantité/i);
            fireEvent.change(quantityInput, { target: { value: "10" } });

            const amountInput = screen.getByLabelText(/montant/i);
            fireEvent.change(amountInput, { target: { value: "100" } });

            // Submit form
            const submitButton = screen.getByRole("button", { name: /créer l'activité/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                // Form should be reset (product select should be empty)
                const productSelectAfter = screen.getByLabelText(/produit/i) as HTMLSelectElement;
                expect(productSelectAfter.value).toBe("");
            });
        });
    });
});

