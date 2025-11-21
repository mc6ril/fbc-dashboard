/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import { useMonthlyProfit } from "@/presentation/hooks/useDashboard";
import frMessages from "@/shared/i18n/messages/fr.json";

// Mock Supabase client before importing components
jest.mock("@/infrastructure/supabase/client", () => ({
    supabaseClient: {
        from: jest.fn(),
    },
}));

jest.mock("@/presentation/hooks/useDashboard");

import ProfitWidget from "@/presentation/components/dashboardOverview/ProfitWidget/ProfitWidget";

const mockUseMonthlyProfit = useMonthlyProfit as jest.MockedFunction<typeof useMonthlyProfit>;

describe("ProfitWidget", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should render loading state", () => {
        mockUseMonthlyProfit.mockReturnValue({
            data: undefined,
            isLoading: true,
            error: null,
        } as ReturnType<typeof useMonthlyProfit>);

        render(<ProfitWidget />);
        expect(screen.getByText(frMessages.common.loading)).toBeInTheDocument();
    });

    it("should render error state", () => {
        mockUseMonthlyProfit.mockReturnValue({
            data: undefined,
            isLoading: false,
            error: new Error("Failed to load"),
        } as ReturnType<typeof useMonthlyProfit>);

        render(<ProfitWidget />);
        expect(screen.getByText(frMessages.errors.dashboard.profit)).toBeInTheDocument();
        expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    it("should render profit amount when data is available", () => {
        mockUseMonthlyProfit.mockReturnValue({
            data: 567.89,
            isLoading: false,
            error: null,
        } as ReturnType<typeof useMonthlyProfit>);

        render(<ProfitWidget />);
        // French locale formats as "567,89 €"
        expect(screen.getByText(/567[,.]89[\s]€/)).toBeInTheDocument();
    });

    it("should render card with correct title", () => {
        mockUseMonthlyProfit.mockReturnValue({
            data: 1000,
            isLoading: false,
            error: null,
        } as ReturnType<typeof useMonthlyProfit>);

        render(<ProfitWidget />);
        expect(screen.getByRole("heading", { name: "Marge Brute (Du mois)", level: 2 })).toBeInTheDocument();
    });

    it("should use semantic HTML structure", () => {
        mockUseMonthlyProfit.mockReturnValue({
            data: 1000,
            isLoading: false,
            error: null,
        } as ReturnType<typeof useMonthlyProfit>);

        render(<ProfitWidget />);
        const article = screen.getByRole("heading", { name: "Marge Brute (Du mois)" }).closest("article");
        expect(article).toBeInTheDocument();
    });
});

