/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import type { Product } from "@/core/domain/product";
import { ProductType } from "@/core/domain/product";
import { useLowStockProducts } from "@/presentation/hooks/useDashboard";
import { LOADING_MESSAGE, ERROR_MESSAGES, EMPTY_STATE_MESSAGES } from "@/shared/constants/messages";
import { createProductId } from "../../../utils/brandedIds";

// Mock Supabase client before importing components
jest.mock("@/infrastructure/supabase/client", () => ({
    supabaseClient: {
        from: jest.fn(),
    },
}));

jest.mock("@/presentation/hooks/useDashboard");

import LowStockWidget from "@/presentation/components/dashboardOverview/LowStockWidget/LowStockWidget";

const mockUseLowStockProducts = useLowStockProducts as jest.MockedFunction<typeof useLowStockProducts>;

describe("LowStockWidget", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should render loading state", () => {
        mockUseLowStockProducts.mockReturnValue({
            data: undefined,
            isLoading: true,
            error: null,
        } as ReturnType<typeof useLowStockProducts>);

        render(<LowStockWidget />);
        expect(screen.getByText(LOADING_MESSAGE)).toBeInTheDocument();
    });

    it("should render error state", () => {
        mockUseLowStockProducts.mockReturnValue({
            data: undefined,
            isLoading: false,
            error: new Error("Failed to load"),
        } as ReturnType<typeof useLowStockProducts>);

        render(<LowStockWidget />);
        expect(screen.getByText(ERROR_MESSAGES.PRODUCTS)).toBeInTheDocument();
        expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    it("should render empty state when no low stock products", () => {
        mockUseLowStockProducts.mockReturnValue({
            data: [],
            isLoading: false,
            error: null,
            isError: false,
            isPending: false,
            isSuccess: true,
        } as unknown as ReturnType<typeof useLowStockProducts>);

        render(<LowStockWidget />);
        expect(screen.getByText(EMPTY_STATE_MESSAGES.LOW_STOCK_PRODUCTS)).toBeInTheDocument();
    });

    it("should render list of low stock products", () => {
        const mockProducts: Product[] = [
            {
                id: createProductId("1"),
                name: "Product A",
                stock: 3,
                unitCost: 5,
                salePrice: 10,
                type: ProductType.SAC_BANANE,
                coloris: "red",
                weight: 100,
            },
            {
                id: createProductId("2"),
                name: "Product B",
                stock: 2,
                unitCost: 10,
                salePrice: 20,
                type: ProductType.POCHETTE_ORDINATEUR,
                coloris: "blue",
                weight: 200,
            },
        ];

        mockUseLowStockProducts.mockReturnValue({
            data: mockProducts,
            isLoading: false,
            error: null,
        } as ReturnType<typeof useLowStockProducts>);

        render(<LowStockWidget />);
        expect(screen.getByText("Product A")).toBeInTheDocument();
        expect(screen.getByText("Stock: 3")).toBeInTheDocument();
        expect(screen.getByText("Product B")).toBeInTheDocument();
        expect(screen.getByText("Stock: 2")).toBeInTheDocument();
    });

    it("should render card with correct title", () => {
        mockUseLowStockProducts.mockReturnValue({
            data: [],
            isLoading: false,
            error: null,
            isError: false,
            isPending: false,
            isSuccess: true,
        } as unknown as ReturnType<typeof useLowStockProducts>);

        render(<LowStockWidget />);
        expect(screen.getByRole("heading", { name: "Low Stock Products", level: 2 })).toBeInTheDocument();
    });

    it("should use semantic HTML structure with list", () => {
        const mockProducts: Product[] = [
            {
                id: createProductId("1"),
                name: "Product A",
                stock: 3,
                unitCost: 5,
                salePrice: 10,
                type: ProductType.SAC_BANANE,
                coloris: "red",
                weight: 100,
            },
        ];

        mockUseLowStockProducts.mockReturnValue({
            data: mockProducts,
            isLoading: false,
            error: null,
        } as ReturnType<typeof useLowStockProducts>);

        render(<LowStockWidget />);
        const list = screen.getByRole("list");
        expect(list).toBeInTheDocument();
        expect(list.querySelectorAll("li")).toHaveLength(1);
    });
});

