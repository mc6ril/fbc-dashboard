/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import { useMonthlySales } from "@/presentation/hooks/useDashboard";
import frMessages from "@/shared/i18n/messages/fr.json";

// Mock Supabase client before importing components
jest.mock("@/infrastructure/supabase/client", () => ({
    supabaseClient: {
        from: jest.fn(),
    },
}));

jest.mock("@/presentation/hooks/useDashboard");

import SalesWidget from "@/presentation/components/dashboardOverview/SalesWidget/SalesWidget";

const mockUseMonthlySales = useMonthlySales as jest.MockedFunction<typeof useMonthlySales>;

describe("SalesWidget", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should render loading state", () => {
        mockUseMonthlySales.mockReturnValue({
            data: undefined,
            isLoading: true,
            error: null,
        } as ReturnType<typeof useMonthlySales>);

        render(<SalesWidget />);
        expect(screen.getByText(frMessages.common.loading)).toBeInTheDocument();
    });

    it("should render error state", () => {
        mockUseMonthlySales.mockReturnValue({
            data: undefined,
            isLoading: false,
            error: new Error("Failed to load"),
        } as ReturnType<typeof useMonthlySales>);

        render(<SalesWidget />);
        expect(screen.getByText(frMessages.errors.dashboard.sales)).toBeInTheDocument();
        expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    it("should render sales amount when data is available", () => {
        mockUseMonthlySales.mockReturnValue({
            data: 1234.56,
            isLoading: false,
            error: null,
        } as ReturnType<typeof useMonthlySales>);

        render(<SalesWidget />);
        // French locale formats as "1 234,56 €"
        expect(screen.getByText(/1[\s]234[,.]56[\s]€/)).toBeInTheDocument();
    });

    it("should render card with correct title", () => {
        mockUseMonthlySales.mockReturnValue({
            data: 1000,
            isLoading: false,
            error: null,
        } as ReturnType<typeof useMonthlySales>);

        render(<SalesWidget />);
        expect(screen.getByRole("heading", { name: "Total Ventes (Du mois)", level: 2 })).toBeInTheDocument();
    });

    it("should use semantic HTML structure", () => {
        mockUseMonthlySales.mockReturnValue({
            data: 1000,
            isLoading: false,
            error: null,
        } as ReturnType<typeof useMonthlySales>);

        render(<SalesWidget />);
        const article = screen.getByRole("heading", { name: "Total Ventes (Du mois)" }).closest("article");
        expect(article).toBeInTheDocument();
    });
});

